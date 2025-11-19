import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StrategyCard {
  title: string;
  category: 'Psicologia' | 'Estratégia';
  content: string;
  icon: string;
}

@Component({
  selector: 'app-strategies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full p-4 overflow-y-auto gap-6">
      
      <!-- Intro Banner -->
      <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white mb-1">Mente Blindada & Estratégia</h2>
          <p class="text-slate-400 text-sm max-w-2xl">
            O sucesso nas apostas desportivas é 20% matemática e 80% controlo emocional. 
            Aqui estão os pilares fundamentais para proteger a sua banca (em Meticais) e crescer a longo prazo.
          </p>
        </div>
        <div class="hidden md:block">
          <div class="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Grid of Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
        @for (card of strategies(); track card.title) {
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg hover:border-emerald-500/50 transition-all duration-300 group">
            <div class="flex items-center justify-between mb-4">
              <span 
                class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                [class.bg-purple-500_20]="card.category === 'Psicologia'"
                [class.text-purple-400]="card.category === 'Psicologia'"
                [class.bg-emerald-500_20]="card.category === 'Estratégia'"
                [class.text-emerald-400]="card.category === 'Estratégia'"
              >
                {{ card.category }}
              </span>
              <div class="text-slate-500 group-hover:text-white transition-colors" [innerHTML]="card.icon"></div>
            </div>
            
            <h3 class="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{{ card.title }}</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              {{ card.content }}
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class StrategiesComponent {
  strategies = signal<StrategyCard[]>([
    {
      title: 'Gestão de Banca Rígida',
      category: 'Estratégia',
      content: 'Nunca aposte mais do que 1% a 3% da sua banca total numa única entrada. Divida o seu capital em unidades. Se tem 10.000 MT, a sua unidade deve ser no máximo 300 MT. Isso permite-lhe suportar uma sequência de perdas (bad run) sem quebrar.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    },
    {
      title: 'Evite o "Chase" (Recuperação)',
      category: 'Psicologia',
      content: 'O erro número 1 dos apostadores é tentar recuperar uma perda imediatamente aumentando o valor da aposta seguinte. Se perdeu, aceite. Amanhã é outro dia. Tentar recuperar à força geralmente leva à perda total da banca.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>'
    },
    {
      title: 'O Valor Esperado (+EV)',
      category: 'Estratégia',
      content: 'Não aposte apenas porque "acha" que uma equipa vai ganhar. Aposte quando a Odd oferecida pela casa for superior à probabilidade real do evento acontecer. Isso é encontrar valor (+EV). A longo prazo, é a única forma matemática de lucrar.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
    },
    {
      title: 'Controlo Emocional',
      category: 'Psicologia',
      content: 'A euforia de ganhar é tão perigosa quanto a frustração de perder. Quando ganha muito, tende a ser descuidado. Mantenha-se frio e analítico. Trate as apostas como um investimento financeiro, não como um jogo de sorte ou emoção.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    },
    {
      title: 'Especialização',
      category: 'Estratégia',
      content: 'Não tente apostar em tudo (Futebol, Ténis, Basquete, eSports...). Escolha uma liga ou um mercado específico (ex: Golos no Campeonato Inglês) e torne-se um especialista. A informação é a sua maior vantagem contra a casa.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
    },
    {
      title: 'Registo de Apostas',
      category: 'Estratégia',
      content: 'Use uma folha de Excel ou uma app para registar TODAS as suas apostas. Saber onde ganha e onde perde é crucial. Se não medir os seus resultados, não conseguirá melhorar. A calculadora deste site é um bom começo para projetar, mas o registo diário é vital.',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>'
    }
  ]);
}