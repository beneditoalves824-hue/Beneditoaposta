# Benny824 Apostas

Assistente de Inteligência Artificial e Calculadora de Juros Compostos para Apostas Desportivas.

## Funcionalidades

- **Calculadora de Juros Compostos**: Projeção de crescimento de banca com visualização gráfica D3.js.
- **IA Advisor**: Chatbot integrado com Google Gemini para dicas estratégicas e matemáticas.
- **Gestão de Risco**: Alertas automáticos para metas irrealistas (>20%).
- **Estratégias**: Cartões de sabedoria sobre psicologia e gestão de banca.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- Uma chave de API do Google Gemini (Obter em [aistudio.google.com](https://aistudio.google.com))

## Instalação

1. Clone este repositório ou baixe os ficheiros para uma pasta local.
2. Abra o terminal na pasta do projeto.
3. Instale as dependências:

```bash
npm install
```

## Como Rodar

Para iniciar o servidor de desenvolvimento:

```bash
# Linux/Mac
export API_KEY="A_SUA_CHAVE_AQUI"
npm start

# Windows (PowerShell)
$env:API_KEY="A_SUA_CHAVE_AQUI"
npm start

# Windows (CMD)
set API_KEY=A_SUA_CHAVE_AQUI
npm start
```

Acesse a aplicação em: `http://localhost:4200`

## Estrutura do Projeto

- `src/app.component.ts`: Layout principal e navegação.
- `src/components/`: Componentes funcionais (Calculadora, Chat, Estratégias).
- `src/services/`: Serviços de integração (Gemini API).

## Tecnologias

- Angular (v17+)
- Tailwind CSS
- D3.js
- Google Gemini API SDK

---
Desenvolvido por Benny824
