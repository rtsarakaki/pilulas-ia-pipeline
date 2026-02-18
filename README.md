# Jogo da Velha Local 🎮

Aplicação de Jogo da Velha construída com Next.js, rodando completamente no frontend sem necessidade de backend.

## 🏗️ Arquitetura

- **Frontend:** Next.js 14+ com App Router
- **Lógica do Jogo:** TypeScript com React Hooks
- **Estilização:** Tailwind CSS
- **Testes:** Jest com cobertura mínima de 80%
- **Sem Backend:** Tudo roda localmente no navegador

## 📚 Documentação

Este projeto inclui documentação completa para facilitar a reprodução em workshops:

- **[SETUP.md](docs/SETUP.md)** - Guia de configuração inicial e pré-requisitos
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura detalhada e decisões de design
- **[WORKSHOP.md](docs/WORKSHOP.md)** - Guia completo para recriar o projeto do zero
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solução de problemas comuns

## 🚀 Início Rápido

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Execute o servidor de desenvolvimento: `npm run dev`
4. Acesse `http://localhost:3000` no navegador

## 🧪 Qualidade de Código

Este projeto utiliza testes automatizados com cobertura mínima de 80%:

- **Jest** - Framework de testes
- **Testing Library** - Testes de componentes React
- **Cobertura mínima:** 80% (branches, functions, lines, statements)

Execute os testes com:
```bash
npm test
npm run test:coverage
```

## 🎯 Para Workshops

Se você está participando de um workshop ou quer recriar o projeto do zero, siga o guia completo em **[WORKSHOP.md](docs/WORKSHOP.md)**. Este documento contém todos os passos necessários para construir o projeto desde o início.

## 🤖 Para Recriar com IA

Se você quer que uma IA recrie o projeto do zero, use o prompt em **[PROMPT.md](PROMPT.md)**. Este arquivo contém instruções prontas para fornecer à IA.

## 📁 Estrutura do Projeto

```
jogo-da-velha-local/
├── app/              # Páginas Next.js (App Router)
│   ├── page.tsx      # Página principal
│   ├── layout.tsx    # Layout raiz
│   └── globals.css   # Estilos globais
├── components/       # Componentes React
│   ├── Board.tsx     # Componente do tabuleiro
│   └── GameStatus.tsx # Componente de status do jogo
├── lib/              # Lógica do jogo
│   ├── types.ts      # Tipos TypeScript
│   ├── gameLogic.ts  # Lógica do jogo (vitória, empate, etc.)
│   └── useGame.ts    # Hook React para gerenciar estado do jogo
└── docs/             # Documentação completa
```

## 🛠️ Tecnologias

- Next.js 14+
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Jest 29+
- Testing Library

## 🎮 Funcionalidades

- ✅ Jogo da Velha completo para dois jogadores
- ✅ Detecção automática de vitória
- ✅ Detecção de empate
- ✅ Botão para reiniciar o jogo
- ✅ Interface responsiva e bonita
- ✅ Validação de jogadas inválidas
- ✅ Feedback visual das jogadas

## 📝 Licença

Este projeto é para fins educacionais e de workshop.
