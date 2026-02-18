# Guia Completo do Workshop

Este documento é um guia passo a passo para recriar o projeto **Jogo da Velha Local** do zero. Use este guia durante o workshop para construir todo o projeto.

## 🎯 Objetivo do Workshop

Construir uma aplicação de Jogo da Velha local usando:
- **Frontend:** Next.js 14+ com App Router
- **Lógica do Jogo:** React Hooks e TypeScript
- **Estilização:** Tailwind CSS
- **Sem Backend:** Tudo roda localmente no navegador

## ⏱️ Tempo Estimado

- Setup inicial: 10 minutos
- Lógica do jogo: 20 minutos
- Componentes React: 30 minutos
- Estilização e testes: 20 minutos
- **Total:** ~1h20min

## 📋 Checklist de Pré-requisitos

Antes de começar, verifique:

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Editor de código (VS Code recomendado)

## 🚀 Fase 1: Setup Inicial (10 min)

### 1.1 Criar Repositório Git

```bash
# Criar pasta do projeto
mkdir jogo-da-velha-local
cd jogo-da-velha-local

# Inicializar Git
git init
git branch -M main

# Criar README inicial
echo "# Jogo da Velha Local" > README.md
git add README.md
git commit -m "Initial commit"
```

### 1.2 Criar Estrutura de Diretórios

```bash
# Criar estrutura
mkdir -p app components lib

# Criar arquivos base
touch .gitignore
touch package.json
touch tsconfig.json
touch next.config.js
touch tailwind.config.ts
touch postcss.config.js
```

### 1.3 Configurar .gitignore

Crie `.gitignore`:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*

# Environment variables
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 1.4 Configurar package.json

Crie `package.json`:

```json
{
  "name": "jogo-da-velha-local",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@types/jest": "^29.5.8",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    },
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "collectCoverageFrom": [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**"
    ]
  }
}
```

### 1.5 Configurar TypeScript

Crie `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 1.6 Configurar Next.js

Crie `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

### 1.7 Configurar Tailwind CSS

Crie `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

Crie `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 1.8 Instalar Dependências

```bash
npm install
```

## 🎮 Fase 2: Lógica do Jogo (20 min)

### 2.1 Criar Tipos TypeScript

Crie `lib/types.ts`:

```typescript
export type Player = 'X' | 'O' | null;
export type Board = Player[];
export type GameStatus = 'playing' | 'finished';
export type Winner = 'X' | 'O' | 'draw' | null;

export interface GameState {
  board: Board;
  currentPlayer: 'X' | 'O';
  status: GameStatus;
  winner: Winner;
}
```

### 2.2 Criar Lógica do Jogo

Crie `lib/gameLogic.ts`:

```typescript
import { Player, Board, Winner } from './types';

const WINNING_COMBINATIONS = [
  [0, 1, 2], // linha superior
  [3, 4, 5], // linha do meio
  [6, 7, 8], // linha inferior
  [0, 3, 6], // coluna esquerda
  [1, 4, 7], // coluna do meio
  [2, 5, 8], // coluna direita
  [0, 4, 8], // diagonal principal
  [2, 4, 6], // diagonal secundária
];

export function checkWinner(board: Board): Winner {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    const firstCell = board[a];
    
    if (firstCell && firstCell === board[b] && firstCell === board[c]) {
      return firstCell;
    }
  }
  
  return null;
}

export function checkDraw(board: Board): boolean {
  return board.every(cell => cell !== null) && checkWinner(board) === null;
}

export function isValidMove(board: Board, position: number): boolean {
  return position >= 0 && position < 9 && board[position] === null;
}

export function makeMove(
  board: Board,
  position: number,
  player: 'X' | 'O'
): Board {
  if (!isValidMove(board, position)) {
    return board;
  }
  
  const newBoard = [...board];
  newBoard[position] = player;
  return newBoard;
}

export function getGameStatus(board: Board): {
  status: 'playing' | 'finished';
  winner: Winner;
} {
  const winner = checkWinner(board);
  const isDraw = checkDraw(board);
  
  if (winner) {
    return { status: 'finished', winner };
  }
  
  if (isDraw) {
    return { status: 'finished', winner: 'draw' };
  }
  
  return { status: 'playing', winner: null };
}
```

### 2.3 Criar Hook useGame

Crie `lib/useGame.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { GameState, Player } from './types';
import { makeMove, getGameStatus } from './gameLogic';

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null) as Player[],
  currentPlayer: 'X',
  status: 'playing',
  winner: null,
};

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const handleCellClick = useCallback((position: number) => {
    setGameState((prev) => {
      if (prev.status === 'finished') {
        return prev;
      }

      if (prev.board[position] !== null) {
        return prev;
      }

      const newBoard = makeMove(prev.board, position, prev.currentPlayer);
      const { status, winner } = getGameStatus(newBoard);
      const nextPlayer = prev.currentPlayer === 'X' ? 'O' : 'X';

      return {
        board: newBoard,
        currentPlayer: status === 'playing' ? nextPlayer : prev.currentPlayer,
        status,
        winner,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE);
  }, []);

  return {
    gameState,
    handleCellClick,
    resetGame,
  };
}
```

## 🎨 Fase 3: Componentes React (30 min)

### 3.1 Criar Componente Board

Crie `components/Board.tsx`:

```typescript
'use client';

import { Board as BoardType, Player } from '@/lib/types';

interface BoardProps {
  board: BoardType;
  onCellClick: (position: number) => void;
  disabled: boolean;
}

export function Board({ board, onCellClick, disabled }: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-96 h-96 mx-auto">
      {board.map((cell, index) => {
        const isDisabled = disabled || cell !== null;
        
        return (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={isDisabled}
            className={`
              text-5xl font-bold border-2 border-gray-300 rounded-lg
              transition-all duration-200
              ${isDisabled 
                ? 'bg-gray-100 cursor-not-allowed' 
                : 'bg-white hover:bg-gray-50 cursor-pointer hover:scale-105 active:scale-95'
              }
              ${cell === 'X' ? 'text-blue-600' : ''}
              ${cell === 'O' ? 'text-red-600' : ''}
            `}
          >
            {cell || ''}
          </button>
        );
      })}
    </div>
  );
}
```

### 3.2 Criar Componente GameStatus

Crie `components/GameStatus.tsx`:

```typescript
'use client';

import { GameStatus as GameStatusType, Winner, Player } from '@/lib/types';

interface GameStatusProps {
  status: GameStatusType;
  currentPlayer: Player;
  winner: Winner;
}

export function GameStatus({ status, currentPlayer, winner }: GameStatusProps) {
  const getStatusMessage = (): string => {
    if (status === 'finished') {
      if (winner === 'draw') {
        return 'Empate!';
      }
      return `Jogador ${winner} venceu! 🎉`;
    }
    return `Vez do jogador: ${currentPlayer}`;
  };

  return (
    <div className="text-center mb-6">
      <div className={`text-2xl font-bold ${
        status === 'finished' 
          ? winner === 'draw' 
            ? 'text-yellow-600' 
            : 'text-green-600'
          : 'text-blue-600'
      }`}>
        {getStatusMessage()}
      </div>
      {status === 'playing' && (
        <div className="text-sm text-gray-600 mt-2">
          Clique em uma célula vazia para fazer sua jogada
        </div>
      )}
    </div>
  );
}
```

### 3.3 Criar Página Principal

Crie `app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jogo da Velha Local',
  description: 'Jogo da Velha para jogar localmente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

Crie `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Crie `app/page.tsx`:

```typescript
'use client';

import { useGame } from '@/lib/useGame';
import { Board } from '@/components/Board';
import { GameStatus } from '@/components/GameStatus';

export default function Home() {
  const { gameState, handleCellClick, resetGame } = useGame();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Jogo da Velha
        </h1>
        
        <GameStatus
          status={gameState.status}
          currentPlayer={gameState.currentPlayer}
          winner={gameState.winner}
        />
        
        <Board
          board={gameState.board}
          onCellClick={handleCellClick}
          disabled={gameState.status === 'finished'}
        />
        
        {gameState.status === 'finished' && (
          <div className="mt-6 text-center">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Jogar Novamente
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
```

## ✅ Fase 4: Testes e Validação (20 min)

### 4.1 Configurar Jest

Crie `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

Crie `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### 4.2 Testar Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste:
1. Fazer jogadas alternadas (X e O)
2. Verificar detecção de vitória
3. Verificar detecção de empate
4. Testar botão "Jogar Novamente"
5. Verificar que não é possível jogar em célula ocupada
6. Verificar que não é possível jogar após o jogo terminar

### 4.3 Executar Testes

```bash
npm test
```

Para ver cobertura:

```bash
npm run test:coverage
```

### 4.4 Fazer Commit

```bash
git add .
git commit -m "feat: complete tic-tac-toe game implementation"
git push origin main
```

## 🎉 Conclusão

Parabéns! Você construiu um Jogo da Velha local completo com:
- ✅ Lógica do jogo em TypeScript
- ✅ Componentes React reutilizáveis
- ✅ Interface bonita com Tailwind CSS
- ✅ Testes automatizados
- ✅ Sem necessidade de backend

## 📚 Próximos Passos

- Adicionar histórico de partidas
- Adicionar contador de vitórias
- Implementar modo contra IA
- Adicionar animações de vitória
- Melhorar responsividade mobile
- Adicionar som e feedback visual

## 🆘 Problemas Comuns

Consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para soluções de problemas comuns.
