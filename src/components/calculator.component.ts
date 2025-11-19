import { Component, signal, computed, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

interface ProjectionRow {
  day: number;
  startBalance: number;
  profit: number;
  endBalance: number;
  stakeRequired: number; // Amount needed to bet to hit the target profit at the given odd
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full gap-6 p-4 overflow-y-auto">
      
      <!-- Inputs Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Banca Inicial (MT)</label>
          <input 
            type="number" 
            [ngModel]="initialBankroll()" 
            (ngModelChange)="initialBankroll.set($event)"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>
        
        <!-- Daily Percent Input with High Risk Logic -->
        <div class="relative">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meta Diária (%)</label>
          <input 
            type="number" 
            step="0.1"
            [ngModel]="dailyPercent()" 
            (ngModelChange)="dailyPercent.set($event)"
            class="w-full bg-slate-900 border rounded-lg p-3 text-white focus:ring-2 focus:outline-none transition"
            [class.border-slate-600]="dailyPercent() <= 20"
            [class.focus:ring-emerald-500]="dailyPercent() <= 20"
            [class.border-red-500]="dailyPercent() > 20"
            [class.focus:ring-red-500]="dailyPercent() > 20"
            [class.text-red-400]="dailyPercent() > 20"
          />
          @if (dailyPercent() > 20) {
            <div class="absolute top-full left-0 mt-1 w-full z-10">
              <div class="bg-red-500/10 border border-red-500/50 rounded-lg p-2 flex items-start gap-2 backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-[10px] leading-tight text-red-200 font-medium">
                  Alerta: Metas acima de 20% são de <span class="font-bold text-red-400">ALTO RISCO</span>. Probabilidade de quebra elevada.
                </p>
              </div>
            </div>
          }
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Odd Média</label>
          <input 
            type="number" 
            step="0.01"
            [ngModel]="averageOdd()" 
            (ngModelChange)="averageOdd.set($event)"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Período (Dias)</label>
          <input 
            type="number" 
            [ngModel]="days()" 
            (ngModelChange)="days.set($event)"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 md:mt-0" [class.mt-12]="dailyPercent() > 20">
        <div class="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500 shadow">
          <div class="text-slate-400 text-xs">Lucro Total Estimado</div>
          <div class="text-2xl font-bold text-white">{{ totalProfit() | currency:'MZN' }}</div>
        </div>
        <div class="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500 shadow">
          <div class="text-slate-400 text-xs">Banca Final</div>
          <div class="text-2xl font-bold text-emerald-400">{{ finalBalance() | currency:'MZN' }}</div>
        </div>
        <div class="bg-slate-800 p-4 rounded-lg border-l-4 border-purple-500 shadow">
          <div class="text-slate-400 text-xs">Crescimento</div>
          <div class="text-2xl font-bold text-purple-400">{{ growthPercentage() }}%</div>
        </div>
      </div>

      <!-- Chart Container -->
      <div class="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700 h-80 relative group overflow-hidden">
        
        <!-- Loading Overlay -->
        @if (isRendering()) {
          <div class="absolute inset-0 z-20 flex items-center justify-center bg-slate-800/80 backdrop-blur-sm transition-opacity duration-200">
            <div class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <span class="text-xs text-emerald-500 font-medium animate-pulse">Calculando...</span>
            </div>
          </div>
        }

        <!-- Export Button -->
        <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            (click)="downloadChart()" 
            [disabled]="isRendering()"
            class="bg-slate-700/90 hover:bg-emerald-600 text-white p-2 rounded-lg backdrop-blur-sm shadow-lg border border-slate-600 transition-all flex items-center gap-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            title="Baixar Gráfico PNG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="hidden sm:inline">Exportar</span>
          </button>
        </div>

        <!-- Chart DOM -->
        <div #chartContainer class="w-full h-full relative transition-opacity duration-300" [class.opacity-50]="isRendering()"></div>
      </div>

      <!-- Data Table -->
      <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex-1 min-h-[300px]">
        <div class="overflow-x-auto h-full">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-900 text-slate-400 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3">Dia</th>
                <th class="px-6 py-3">Banca Inicial</th>
                <th class="px-6 py-3">Meta Lucro</th>
                <th class="px-6 py-3 text-emerald-400">Stake Sugerida</th>
                <th class="px-6 py-3">Banca Final</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
              @for (row of projectionData(); track row.day) {
                <tr class="hover:bg-slate-700/50 transition-colors">
                  <td class="px-6 py-3 font-medium text-slate-300">{{ row.day }}</td>
                  <td class="px-6 py-3 text-slate-400">{{ row.startBalance | currency:'MZN' }}</td>
                  <td class="px-6 py-3 text-emerald-400 font-medium">+{{ row.profit | currency:'MZN' }}</td>
                  <td class="px-6 py-3 text-blue-300 font-mono">
                    {{ row.stakeRequired | currency:'MZN' }}
                    <span class="text-[10px] text-slate-500 ml-1">(&#64;{{ averageOdd() }})</span>
                  </td>
                  <td class="px-6 py-3 font-bold text-white">{{ row.endBalance | currency:'MZN' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CalculatorComponent {
  initialBankroll = signal(1000);
  dailyPercent = signal(3);
  averageOdd = signal(1.50);
  days = signal(30);
  isRendering = signal(false);
  
  chartContainer = viewChild<ElementRef>('chartContainer');

  projectionData = computed<ProjectionRow[]>(() => {
    const data: ProjectionRow[] = [];
    let current = this.initialBankroll();
    const rate = this.dailyPercent() / 100;
    const duration = this.days();
    const odd = this.averageOdd();

    for (let i = 1; i <= duration; i++) {
      const profit = current * rate;
      // Stake needed to get 'profit' at 'odd': Stake * (Odd - 1) = Profit  => Stake = Profit / (Odd - 1)
      // Guard against odd <= 1 to avoid infinity
      const stake = odd > 1 ? profit / (odd - 1) : 0;
      
      const end = current + profit;
      data.push({
        day: i,
        startBalance: current,
        profit: profit,
        endBalance: end,
        stakeRequired: stake
      });
      current = end;
    }
    return data;
  });

  finalBalance = computed(() => {
    const data = this.projectionData();
    return data.length > 0 ? data[data.length - 1].endBalance : this.initialBankroll();
  });

  totalProfit = computed(() => this.finalBalance() - this.initialBankroll());
  
  growthPercentage = computed(() => {
    if (this.initialBankroll() === 0) return 0;
    return ((this.totalProfit() / this.initialBankroll()) * 100).toFixed(1);
  });

  constructor() {
    effect(() => {
      const data = this.projectionData();
      const container = this.chartContainer()?.nativeElement;
      
      if (container && data.length > 0) {
        // Trigger loading state
        this.isRendering.set(true);

        // Use setTimeout to push D3 rendering to next tick, allowing UI to show loader
        setTimeout(() => {
          this.renderChart(data, container);
          this.isRendering.set(false);
        }, 200); // Slight artificial delay (200ms) to make the transition feel smoother/deliberate
      }
    });
  }

  renderChart(data: ProjectionRow[], container: HTMLElement) {
    // 1. Cleanup
    d3.select(container).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Tooltip Div (Hidden by default)
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'absolute z-50 hidden bg-slate-900/95 backdrop-blur border border-emerald-500/30 p-3 rounded-lg shadow-xl pointer-events-none text-sm')
      .style('top', '0')
      .style('left', '0');

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 2. Scales
    const x = d3.scaleLinear()
      .domain([1, d3.max(data, d => d.day) || 1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.startBalance) || 0,
        d3.max(data, d => d.endBalance) || 0
      ])
      .range([height, 0]);

    // 3. Gradient (Vibrant)
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    // Top color: Cyan/Emerald Mix
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#34d399") // Emerald 400
      .attr("stop-opacity", 0.6);
      
    // Bottom color: Transparent
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06b6d4") // Cyan 500
      .attr("stop-opacity", 0.0);

    // 4. Area Path
    const area = d3.area<ProjectionRow>()
      .x(d => x(d.day))
      .y0(height)
      .y1(d => y(d.endBalance))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)
      // Animate Area on load
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .attr("opacity", 1);

    // 5. Line Path
    const line = d3.line<ProjectionRow>()
      .x(d => x(d.day))
      .y(d => y(d.endBalance))
      .curve(d3.curveMonotoneX);

    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#22d3ee") // Cyan 400
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("filter", "drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))"); // Glow effect

    // Animate Line Drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(500)
      .attr("stroke-dashoffset", 0);

    // 6. Axes (Custom Styling)
    const xAxis = d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10);
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => `MT ${d}`).tickSize(0).tickPadding(10);

    // Grid lines (Horizontal only)
    svg.append("g")
      .attr("class", "grid-lines")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ""))
      .attr("stroke", "#334155") // slate-700
      .attr("stroke-dasharray", "2,2")
      .attr("stroke-opacity", 0.5)
      .select(".domain").remove();

    const gX = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
    
    gX.select(".domain").attr("stroke", "#475569");
    gX.selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px")
      .attr("font-family", "sans-serif"); // Essential for export

    const gY = svg.append("g")
      .call(yAxis);
    
    gY.select(".domain").remove();
    gY.selectAll("text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "11px")
      .attr("font-family", "sans-serif"); // Essential for export

    // 7. Interaction Layer
    // Focus elements (Hidden initially)
    const focusGroup = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    // Vertical Reference Line
    focusGroup.append("line")
      .attr("class", "x-hover-line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#cbd5e1") // slate-300
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Focus Circle
    focusGroup.append("circle")
      .attr("r", 6)
      .attr("fill", "#10b981") // emerald-500
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Overlay Rect to capture events
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        focusGroup.style("display", null);
        tooltip.classed("hidden", false);
      })
      .on("mouseout", () => {
        focusGroup.style("display", "none");
        tooltip.classed("hidden", true);
      })
      .on("mousemove", (event) => {
        const bisect = d3.bisector((d: ProjectionRow) => d.day).center;
        const x0 = x.invert(d3.pointer(event)[0]);
        const i = bisect(data, x0, 1);
        const d = data[i];
        
        // Move focus group
        focusGroup.attr("transform", `translate(${x(d.day)},${y(d.endBalance)})`);
        focusGroup.select(".x-hover-line").attr("y2", height - y(d.endBalance));

        // Format currency
        const fmt = new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' });

        // Update Tooltip Content
        tooltip.html(`
          <div class="font-bold text-emerald-400 mb-1">Dia ${d.day}</div>
          <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-300">
            <span>Inicial:</span> <span class="text-right text-white">${fmt.format(d.startBalance)}</span>
            <span>Lucro Meta:</span> <span class="text-right text-emerald-400 font-semibold">+${fmt.format(d.profit)}</span>
            <span class="text-blue-300">Stake Sugerida:</span> <span class="text-right text-blue-300 font-semibold">${fmt.format(d.stakeRequired)}</span>
            <div class="col-span-2 h-px bg-slate-700 my-1"></div>
            <span class="font-bold text-slate-200">Banca Final:</span> <span class="text-right font-bold text-white">${fmt.format(d.endBalance)}</span>
          </div>
        `);

        // Position Tooltip (Calculated relative to container)
        let left = x(d.day) + margin.left;
        let top = y(d.endBalance) + margin.top - 10;

        const tooltipNode = tooltip.node() as HTMLElement;
        const tooltipWidth = tooltipNode.offsetWidth;
        
        if (left + tooltipWidth / 2 > container.clientWidth) {
          left = container.clientWidth - tooltipWidth - 10;
        } else if (left - tooltipWidth / 2 < 0) {
          left = 10;
        }

        tooltip
          .style("left", `${left}px`)
          .style("top", `${top}px`)
          .style("transform", "translate(-50%, -100%)");
      });
  }

  downloadChart() {
    const container = this.chartContainer()?.nativeElement;
    const svg = container?.querySelector('svg');
    
    if (!svg) return;

    // Get SVG XML
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    // Add namespaces if missing
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    // Double resolution for better quality
    const scale = 2;
    canvas.width = svg.clientWidth * scale;
    canvas.height = svg.clientHeight * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale context
    ctx.scale(scale, scale);

    const img = new Image();
    const svgBlob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Draw background (Slate 800) to match app theme
      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0, 0, svg.clientWidth, svg.clientHeight);

      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `BetGrow-Projecao-${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }
}