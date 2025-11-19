import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initialize with environment key
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getAdvice(userMessage: string, currentContext?: string): Promise<string> {
    try {
      const model = 'gemini-2.5-flash';
      
      const systemInstruction = `
        Você é um especialista em gestão de banca, matemática financeira e apostas desportivas profissionais. 
        O seu objetivo é ajudar o utilizador a entender o poder dos juros compostos e a manter a disciplina.
        
        Regras:
        1. Foco em gestão de risco e longo prazo.
        2. Desencoraje o comportamento de jogo impulsivo (vício).
        3. Explique conceitos matemáticos de forma simples (ROI, Yield, Odds justas).
        4. Responda sempre em Português.
        5. Seja conciso e use formatação markdown simples.
      `;

      const response = await this.ai.models.generateContent({
        model: model,
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text || "Não consegui gerar uma resposta no momento.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Ocorreu um erro ao consultar a IA. Verifique a sua ligação ou a chave API.";
    }
  }
}