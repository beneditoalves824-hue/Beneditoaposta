import { Component, signal, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
      
      <!-- Header -->
      <div class="bg-slate-900 p-4 border-b border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-emerald-500/20 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 class="font-bold text-white">Benny824 AI Advisor</h2>
            <p class="text-xs text-slate-400">Especialista em matemática e estratégia</p>
          </div>
        </div>

        <!-- Clear History Button -->
        @if (messages().length > 0) {
          <button 
            (click)="clearHistory()" 
            class="text-slate-500 hover:text-red-400 hover:bg-slate-800 p-2 rounded-lg transition-all"
            title="Limpar Histórico"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        }
      </div>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" #scrollContainer>
        @if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>Pergunte sobre gestão de banca ou juros compostos.</p>
          </div>
        }

        @for (msg of messages(); track msg.timestamp) {
          <div class="flex" [class.justify-end]="msg.role === 'user'">
            <div 
              class="max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md"
              [class.bg-emerald-600]="msg.role === 'user'"
              [class.text-white]="msg.role === 'user'"
              [class.bg-slate-700]="msg.role === 'ai'"
              [class.text-slate-200]="msg.role === 'ai'"
              [class.rounded-br-none]="msg.role === 'user'"
              [class.rounded-bl-none]="msg.role === 'ai'"
            >
              <div class="whitespace-pre-wrap">{{ msg.content }}</div>
              <div class="text-[10px] mt-2 opacity-60 text-right">
                {{ msg.timestamp | date:'HH:mm' }}
              </div>
            </div>
          </div>
        }

        @if (isLoading()) {
          <div class="flex justify-start animate-pulse">
            <div class="bg-slate-700 p-4 rounded-2xl rounded-bl-none">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-slate-900 border-t border-slate-700">
        <div class="flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="sendMessage()"
            placeholder="Ex: Como funciona o critério de Kelly?" 
            class="flex-1 bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            [disabled]="isLoading()"
          />
          <button 
            (click)="sendMessage()" 
            [disabled]="isLoading() || !userInput().trim()"
            class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdvisorComponent {
  private geminiService = inject(GeminiService);
  
  // Load messages from localStorage on init
  messages = signal<Message[]>(this.loadHistory());
  userInput = signal('');
  isLoading = signal(false);
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  constructor() {
    // Effect handles persistence and scrolling
    effect(() => {
      const msgs = this.messages();
      const loading = this.isLoading();

      // Save to localStorage whenever messages change
      this.saveHistory(msgs);

      // Auto-scroll to bottom
      setTimeout(() => {
        const el = this.scrollContainer()?.nativeElement;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }, 50);
    });
  }

  private loadHistory(): Message[] {
    try {
      const stored = localStorage.getItem('betgrow_chat_history');
      if (!stored) return [];
      
      // Parse and hydrate Date objects
      return JSON.parse(stored).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    } catch (e) {
      console.error('Error loading chat history', e);
      return [];
    }
  }

  private saveHistory(msgs: Message[]) {
    try {
      localStorage.setItem('betgrow_chat_history', JSON.stringify(msgs));
    } catch (e) {
      console.error('Error saving chat history', e);
    }
  }

  clearHistory() {
    if (confirm('Tem a certeza que deseja limpar o histórico de conversas?')) {
      this.messages.set([]);
      localStorage.removeItem('betgrow_chat_history');
    }
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isLoading()) return;

    // Add User Message
    this.messages.update(msgs => [...msgs, {
      role: 'user',
      content: text,
      timestamp: new Date()
    }]);
    
    this.userInput.set('');
    this.isLoading.set(true);

    // Get AI Response
    const response = await this.geminiService.getAdvice(text);

    // Add AI Message
    this.messages.update(msgs => [...msgs, {
      role: 'ai',
      content: response,
      timestamp: new Date()
    }]);
    
    this.isLoading.set(false);
  }
}