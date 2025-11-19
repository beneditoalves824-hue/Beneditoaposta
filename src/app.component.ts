import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorComponent } from './components/calculator.component';
import { AdvisorComponent } from './components/advisor.component';
import { StrategiesComponent } from './components/strategies.component';

type Tab = 'calculator' | 'strategies' | 'advisor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CalculatorComponent, AdvisorComponent, StrategiesComponent],
  template: `
    <div class="flex flex-col h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      <!-- Navbar -->
      <header class="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 class="font-bold text-xl tracking-tight hidden md:block">Benny824 <span class="text-emerald-400">Apostas</span></h1>
          <h1 class="font-bold text-xl tracking-tight md:hidden">Benny<span class="text-emerald-400">824</span></h1>
        </div>
        
        <nav class="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button 
            (click)="activeTab.set('calculator')"
            class="px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
            [class.bg-emerald-600]="activeTab() === 'calculator'"
            [class.text-white]="activeTab() === 'calculator'"
            [class.text-slate-400]="activeTab() !== 'calculator'"
            [class.hover:text-white]="activeTab() !== 'calculator'"
            title="Calculadora"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="hidden md:inline">Calculadora</span>
          </button>

          <button 
            (click)="activeTab.set('strategies')"
            class="px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
            [class.bg-emerald-600]="activeTab() === 'strategies'"
            [class.text-white]="activeTab() === 'strategies'"
            [class.text-slate-400]="activeTab() !== 'strategies'"
            [class.hover:text-white]="activeTab() !== 'strategies'"
            title="Dicas & Estratégias"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span class="hidden md:inline">Dicas</span>
          </button>
          
          <button 
            (click)="activeTab.set('advisor')"
            class="px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
            [class.bg-emerald-600]="activeTab() === 'advisor'"
            [class.text-white]="activeTab() === 'advisor'"
            [class.text-slate-400]="activeTab() !== 'advisor'"
            [class.hover:text-white]="activeTab() !== 'advisor'"
            title="Assistente IA"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span class="hidden md:inline">IA Advisor</span>
          </button>
        </nav>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-hidden relative">
        <div class="absolute inset-0 w-full h-full p-2 md:p-6 max-w-7xl mx-auto">
          @switch (activeTab()) {
            @case ('calculator') {
              <app-calculator class="h-full block" />
            }
            @case ('strategies') {
              <app-strategies class="h-full block" />
            }
            @case ('advisor') {
              <app-advisor class="h-full block" />
            }
          }
        </div>
      </main>

    </div>
  `
})
export class AppComponent {
  activeTab = signal<Tab>('calculator');
}