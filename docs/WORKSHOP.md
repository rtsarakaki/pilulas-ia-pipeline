# Guia Completo do Workshop

Este documento é um guia passo a passo para recriar o projeto **Jogo da Velha Online** do zero. Use este guia durante o workshop para construir todo o projeto.

## 🎯 Objetivo do Workshop

Construir um jogo da velha multiplayer em tempo real usando:
- **Frontend:** Next.js
- **Backend:** AWS Lambda com WebSocket API Gateway
- **Infraestrutura:** Serverless Framework
- **CI/CD:** GitHub Actions com OIDC

## ⏱️ Tempo Estimado

- Setup inicial: 15 minutos
- Backend: 45 minutos
- Frontend: 30 minutos
- CI/CD: 30 minutos
- Testes: 15 minutos
- **Total:** ~2h15min

## 📋 Checklist de Pré-requisitos

Antes de começar, verifique:

- [ ] Node.js 18+ instalado
- [ ] Conta AWS ativa (acesso ao Console AWS)
- [ ] Conta GitHub ativa
- [ ] Serverless Framework instalado (`npm install -g serverless`)
- [ ] Git instalado
- [ ] Editor de código (VS Code recomendado)

## 🚀 Fase 1: Setup Inicial (15 min)

### 1.1 Criar Repositório Git

```bash
# Criar pasta do projeto
mkdir jogo-da-velha-online
cd jogo-da-velha-online

# Inicializar Git
git init
git branch -M main

# Criar README inicial
echo "# Jogo da Velha Online" > README.md
git add README.md
git commit -m "Initial commit"
```

### 1.2 Criar Estrutura de Diretórios

```bash
# Criar estrutura
mkdir -p frontend/src/{app,components,hooks,lib}
mkdir -p backend/{functions,lib}
mkdir -p infrastructure
mkdir -p .github/workflows
mkdir -p docs

# Criar arquivos base
touch frontend/package.json
touch frontend/next.config.js
touch backend/package.json
touch backend/serverless.yml
touch .gitignore
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

# AWS
.aws-sam/
.serverless/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 1.4 Configurar package.json da Raiz

Crie `package.json` na raiz do projeto:

```json
{
  "name": "jogo-da-velha-online",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx --ignore-path .gitignore",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix --ignore-path .gitignore",
    "type-check": "tsc --noEmit",
    "test": "npm run test --workspaces",
    "test:coverage": "npm run test:coverage --workspaces",
    "validate": "npm run lint && npm run type-check && npm run test:coverage"
  },
  "workspaces": [
    "frontend",
    "backend"
  ],
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0",
    "husky": "^8.0.3",
    "typescript": "^5.2.2"
  }
}
```

### 1.5 Configurar TypeScript

Crie `tsconfig.json` na raiz:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": [],
  "exclude": ["node_modules", "dist", "build", ".next"]
}
```

### 1.6 Configurar ESLint

Crie `.eslintrc.json` na raiz:

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "ignorePatterns": ["node_modules", "dist", "build", ".next", "coverage"]
}
```

## 🏗️ Fase 2: Backend - Serverless Framework (45 min)

### 2.1 Inicializar Backend

```bash
cd backend
npm init -y
npm install serverless serverless-offline
npm install aws-sdk
```

### 2.1.1 Configurar package.json do Backend

Atualize `backend/package.json`:

```json
{
  "name": "tic-tac-toe-backend",
  "version": "1.0.0",
  "description": "Backend serverless para Jogo da Velha Online",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "aws-sdk": "^2.1500.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "serverless": "^3.38.0",
    "serverless-offline": "^13.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "collectCoverageFrom": [
      "functions/**/*.js",
      "lib/**/*.js",
      "!**/node_modules/**"
    ]
  }
}
```

### 2.1.2 Configurar Jest para Backend

Crie `backend/jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'functions/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js']
};
```

### 2.2 Criar serverless.yml

Crie `backend/serverless.yml`:

```yaml
service: tic-tac-toe-backend

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  environment:
    STAGE: ${self:provider.stage}
    GAMES_TABLE: ${self:service}-games-${self:provider.stage}
    CONNECTIONS_TABLE: ${self:service}-connections-${self:provider.stage}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:PutItem
            - dynamodb:GetItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
            - dynamodb:Query
            - dynamodb:Scan
          Resource:
            - "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GAMES_TABLE}"
            - "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.CONNECTIONS_TABLE}"
        - Effect: Allow
          Action:
            - execute-api:ManageConnections
          Resource:
            - "arn:aws:execute-api:${self:provider.region}:*:*/*"

functions:
  connect:
    handler: functions/connect.handler
    events:
      - websocket:
          route: $connect
  disconnect:
    handler: functions/disconnect.handler
    events:
      - websocket:
          route: $disconnect
  game:
    handler: functions/game.handler
    events:
      - websocket:
          route: game
  default:
    handler: functions/default.handler
    events:
      - websocket:
          route: $default

resources:
  Resources:
    GamesTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.GAMES_TABLE}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: gameId
            AttributeType: S
        KeySchema:
          - AttributeName: gameId
            KeyType: HASH

    ConnectionsTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.CONNECTIONS_TABLE}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: connectionId
            AttributeType: S
        KeySchema:
          - AttributeName: connectionId
            KeyType: HASH
```

### 2.3 Criar Função Lambda - connect.js

Crie `backend/functions/connect.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

const GAMES_TABLE = process.env.GAMES_TABLE;
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  
  try {
    // Buscar sala disponível (com apenas 1 jogador)
    const scanResult = await dynamodb.scan({
      TableName: GAMES_TABLE,
      FilterExpression: 'status = :status',
      ExpressionAttributeValues: {
        ':status': 'waiting'
      }
    }).promise();
    
    let gameId;
    let player;
    
    if (scanResult.Items.length > 0) {
      // Entrar em sala existente
      const game = scanResult.Items[0];
      gameId = game.gameId;
      player = 'O';
      
      // Atualizar jogo
      await dynamodb.update({
        TableName: GAMES_TABLE,
        Key: { gameId },
        UpdateExpression: 'SET player2 = :player2, status = :status, currentPlayer = :currentPlayer',
        ExpressionAttributeValues: {
          ':player2': connectionId,
          ':status': 'playing',
          ':currentPlayer': 'X'
        }
      }).promise();
      
      // Notificar jogador 1
      await sendMessage(game.player1, {
        type: 'game_started',
        gameId,
        player: 'X',
        board: game.board || Array(9).fill('')
      });
    } else {
      // Criar nova sala
      gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      player = 'X';
      
      await dynamodb.put({
        TableName: GAMES_TABLE,
        Item: {
          gameId,
          player1: connectionId,
          player2: null,
          board: Array(9).fill(''),
          currentPlayer: 'X',
          status: 'waiting',
          createdAt: new Date().toISOString()
        }
      }).promise();
    }
    
    // Salvar conexão
    await dynamodb.put({
      TableName: CONNECTIONS_TABLE,
      Item: {
        connectionId,
        gameId,
        player,
        connectedAt: new Date().toISOString()
      }
    }).promise();
    
    // Enviar confirmação
    await sendMessage(connectionId, {
      type: 'connected',
      gameId,
      player,
      status: player === 'X' ? 'waiting' : 'playing'
    });
    
    return { statusCode: 200 };
  } catch (error) {
    console.error('Error in connect:', error);
    return { statusCode: 500 };
  }
};

async function sendMessage(connectionId, message) {
  try {
    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    }).promise();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

### 2.4 Criar Função Lambda - disconnect.js

Crie `backend/functions/disconnect.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

const GAMES_TABLE = process.env.GAMES_TABLE;
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  
  try {
    // Buscar jogo associado
    const connection = await dynamodb.get({
      TableName: CONNECTIONS_TABLE,
      Key: { connectionId }
    }).promise();
    
    if (connection.Item) {
      const { gameId, player } = connection.Item;
      
      // Buscar jogo
      const game = await dynamodb.get({
        TableName: GAMES_TABLE,
        Key: { gameId }
      }).promise();
      
      if (game.Item) {
        const otherPlayer = player === 'X' ? game.Item.player2 : game.Item.player1;
        
        // Notificar outro jogador
        if (otherPlayer) {
          await sendMessage(otherPlayer, {
            type: 'opponent_disconnected'
          });
        }
        
        // Remover jogo se estava esperando
        if (game.Item.status === 'waiting') {
          await dynamodb.delete({
            TableName: GAMES_TABLE,
            Key: { gameId }
          }).promise();
        }
      }
    }
    
    // Remover conexão
    await dynamodb.delete({
      TableName: CONNECTIONS_TABLE,
      Key: { connectionId }
    }).promise();
    
    return { statusCode: 200 };
  } catch (error) {
    console.error('Error in disconnect:', error);
    return { statusCode: 500 };
  }
};

async function sendMessage(connectionId, message) {
  try {
    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    }).promise();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

### 2.5 Criar Lógica do Jogo

Crie `backend/lib/gameLogic.js`:

```javascript
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
  [0, 4, 8], [2, 4, 6]              // diagonais
];

function checkWinner(board) {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every(cell => cell !== '');
}

function isValidMove(board, position) {
  return position >= 0 && position < 9 && board[position] === '';
}

module.exports = {
  checkWinner,
  checkDraw,
  isValidMove
};
```

### 2.6 Criar Função Lambda - game.js

Crie `backend/functions/game.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});
const { checkWinner, checkDraw, isValidMove } = require('../lib/gameLogic');

const GAMES_TABLE = process.env.GAMES_TABLE;
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body || '{}');
  const { action, position } = body;
  
  try {
    // Buscar conexão
    const connection = await dynamodb.get({
      TableName: CONNECTIONS_TABLE,
      Key: { connectionId }
    }).promise();
    
    if (!connection.Item) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Connection not found' }) };
    }
    
    const { gameId, player } = connection.Item;
    
    // Buscar jogo
    const game = await dynamodb.get({
      TableName: GAMES_TABLE,
      Key: { gameId }
    }).promise();
    
    if (!game.Item) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Game not found' }) };
    }
    
    const gameData = game.Item;
    
    // Validar turno
    if (gameData.currentPlayer !== player) {
      await sendMessage(connectionId, {
        type: 'error',
        message: 'Not your turn'
      });
      return { statusCode: 400 };
    }
    
    // Validar movimento
    if (!isValidMove(gameData.board, position)) {
      await sendMessage(connectionId, {
        type: 'error',
        message: 'Invalid move'
      });
      return { statusCode: 400 };
    }
    
    // Atualizar tabuleiro
    const newBoard = [...gameData.board];
    newBoard[position] = player;
    
    // Verificar vitória/empate
    const winner = checkWinner(newBoard);
    const isDraw = !winner && checkDraw(newBoard);
    
    let status = gameData.status;
    let nextPlayer = player === 'X' ? 'O' : 'X';
    
    if (winner) {
      status = 'finished';
    } else if (isDraw) {
      status = 'finished';
    }
    
    // Atualizar jogo
    const updateExpression = winner || isDraw
      ? 'SET board = :board, status = :status, winner = :winner'
      : 'SET board = :board, currentPlayer = :currentPlayer';
    
    const expressionValues = winner || isDraw
      ? {
          ':board': newBoard,
          ':status': status,
          ':winner': winner || 'draw'
        }
      : {
          ':board': newBoard,
          ':currentPlayer': nextPlayer
        };
    
    await dynamodb.update({
      TableName: GAMES_TABLE,
      Key: { gameId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionValues
    }).promise();
    
    // Enviar atualização para ambos jogadores
    const updateMessage = {
      type: 'game_update',
      board: newBoard,
      currentPlayer: nextPlayer,
      status,
      winner: winner || (isDraw ? 'draw' : null)
    };
    
    await sendMessage(gameData.player1, updateMessage);
    if (gameData.player2) {
      await sendMessage(gameData.player2, updateMessage);
    }
    
    return { statusCode: 200 };
  } catch (error) {
    console.error('Error in game:', error);
    return { statusCode: 500 };
  }
};

async function sendMessage(connectionId, message) {
  try {
    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    }).promise();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
```

### 2.7 Criar Função Lambda - default.js

Crie `backend/functions/default.js`:

```javascript
exports.handler = async (event) => {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Unknown route' })
  };
};
```

### 2.8 Deploy do Backend

```bash
cd backend
serverless deploy --stage dev
```

**Anote a URL do WebSocket retornada!**

## 🎨 Fase 3: Frontend - Next.js (30 min)

### 3.1 Inicializar Next.js

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

### 3.1.1 Configurar package.json do Frontend

O `create-next-app` já cria um `package.json` básico. Adicione/atualize os scripts e dependências:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@types/jest": "^29.5.8",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
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
      "hooks/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**"
    ]
  }
}
```

### 3.1.2 Configurar Jest para Frontend

Crie `frontend/jest.config.js`:

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
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

Crie `frontend/jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

### 3.2 Configurar Variável de Ambiente

Crie `frontend/.env.local`:

```bash
NEXT_PUBLIC_WS_URL=wss://SEU_API_ID.execute-api.us-east-1.amazonaws.com/dev
```

**Substitua `SEU_API_ID` pela URL retornada no deploy.**

### 3.3 Criar Hook useWebSocket

Crie `frontend/hooks/useWebSocket.ts`:

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameState {
  board: string[];
  currentPlayer: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished';
  winner: 'X' | 'O' | 'draw' | null;
  player: 'X' | 'O' | null;
}

export function useWebSocket() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(''),
    currentPlayer: 'X',
    status: 'waiting',
    winner: null,
    player: null
  });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.error('WebSocket URL not configured');
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message received:', message);

      switch (message.type) {
        case 'connected':
          setGameState(prev => ({
            ...prev,
            player: message.player,
            status: message.status
          }));
          break;
        case 'game_started':
          setGameState(prev => ({
            ...prev,
            board: message.board,
            status: 'playing',
            currentPlayer: message.currentPlayer
          }));
          break;
        case 'game_update':
          setGameState(prev => ({
            ...prev,
            board: message.board,
            currentPlayer: message.currentPlayer,
            status: message.status,
            winner: message.winner
          }));
          break;
        case 'opponent_disconnected':
          setGameState(prev => ({
            ...prev,
            status: 'waiting'
          }));
          break;
        case 'error':
          console.error('Error:', message.message);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      // Tentar reconectar após 3 segundos
      setTimeout(connect, 3000);
    };
  }, []);

  const sendMove = useCallback((position: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'move',
        position
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    gameState,
    connected,
    sendMove
  };
}
```

### 3.4 Criar Componente Board

Crie `frontend/components/Board.tsx`:

```typescript
'use client';

interface BoardProps {
  board: string[];
  currentPlayer: 'X' | 'O';
  player: 'X' | 'O' | null;
  status: 'waiting' | 'playing' | 'finished';
  onCellClick: (position: number) => void;
}

export function Board({ board, currentPlayer, player, status, onCellClick }: BoardProps) {
  const isMyTurn = currentPlayer === player && status === 'playing';
  
  return (
    <div className="grid grid-cols-3 gap-2 w-96 h-96 mx-auto">
      {board.map((cell, index) => {
        const isDisabled = !isMyTurn || cell !== '' || status !== 'playing';
        
        return (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={isDisabled}
            className={`
              text-4xl font-bold border-2 border-gray-300 rounded-lg
              ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
              ${cell === 'X' ? 'text-blue-600' : cell === 'O' ? 'text-red-600' : ''}
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

### 3.5 Criar Componente GameStatus

Crie `frontend/components/GameStatus.tsx`:

```typescript
'use client';

interface GameStatusProps {
  status: 'waiting' | 'playing' | 'finished';
  currentPlayer: 'X' | 'O';
  player: 'X' | 'O' | null;
  winner: 'X' | 'O' | 'draw' | null;
  connected: boolean;
}

export function GameStatus({ status, currentPlayer, player, winner, connected }: GameStatusProps) {
  const getStatusMessage = () => {
    if (!connected) return 'Conectando...';
    if (status === 'waiting') return 'Aguardando oponente...';
    if (status === 'finished') {
      if (winner === 'draw') return 'Empate!';
      if (winner === player) return 'Você venceu! 🎉';
      return 'Você perdeu! 😢';
    }
    if (currentPlayer === player) return 'Sua vez!';
    return 'Aguardando oponente...';
  };

  return (
    <div className="text-center mb-4">
      <div className={`text-lg font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
        {connected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>
      <div className="text-xl mt-2">{getStatusMessage()}</div>
      {status === 'playing' && (
        <div className="text-sm text-gray-600 mt-1">
          Você é: <span className="font-bold">{player}</span> | Turno: <span className="font-bold">{currentPlayer}</span>
        </div>
      )}
    </div>
  );
}
```

### 3.6 Criar Página Principal

Atualize `frontend/app/page.tsx`:

```typescript
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { Board } from '@/components/Board';
import { GameStatus } from '@/components/GameStatus';

export default function Home() {
  const { gameState, connected, sendMove } = useWebSocket();

  const handleCellClick = (position: number) => {
    if (gameState.status === 'playing' && gameState.currentPlayer === gameState.player) {
      sendMove(position);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Jogo da Velha Online
        </h1>
        
        <GameStatus
          status={gameState.status}
          currentPlayer={gameState.currentPlayer}
          player={gameState.player}
          winner={gameState.winner}
          connected={connected}
        />
        
        <Board
          board={gameState.board}
          currentPlayer={gameState.currentPlayer}
          player={gameState.player}
          status={gameState.status}
          onCellClick={handleCellClick}
        />
      </div>
    </main>
  );
}
```

### 3.7 Testar Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste em dois navegadores.

## 🤖 Fase 4: CI/CD - GitHub Actions e Vercel (30 min)

### 4.1 Criar Workflow do GitHub Actions

O workflow do GitHub Actions fará deploy apenas do backend. O frontend será deployado via Vercel.

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AWS_REGION: us-east-1

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Serverless Framework
        run: npm install -g serverless
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Deploy backend
        working-directory: ./backend
        run: serverless deploy --stage dev
        env:
          AWS_REGION: ${{ env.AWS_REGION }}
      
      - name: Get WebSocket URL
        id: websocket
        working-directory: ./backend
        run: |
          URL=$(serverless info --stage dev | grep -oP 'wss://[^ ]+' | head -1)
          echo "url=$URL" >> $GITHUB_OUTPUT
      
      - name: Output WebSocket URL
        run: |
          echo "WebSocket URL: ${{ steps.websocket.outputs.url }}"
```

**Nota:** O frontend será deployado automaticamente via integração do repositório GitHub com Vercel (veja seção 4.4 abaixo).

### 4.2 Configurar OIDC (Ver DEPLOYMENT.md)

Siga os passos 1 e 2 do [DEPLOYMENT.md](DEPLOYMENT.md) para configurar OIDC e IAM Role.

### 4.3 Adicionar Secrets no GitHub

No GitHub, vá em **Settings → Secrets → Actions** e adicione:
- `AWS_ROLE_ARN`: ARN da role criada

### 4.4 Integrar Frontend com Vercel

O frontend será deployado via integração do repositório GitHub com Vercel:

1. **Acesse o painel da Vercel:**
   - Vá para https://vercel.com
   - Faça login com sua conta GitHub

2. **Adicionar Projeto:**
   - Clique em **"Add New Project"**
   - Selecione o repositório `pilulas-ia-pipeline`
   - Configure:
     - **Framework Preset:** Next.js
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `.next`

3. **Configurar Variáveis de Ambiente:**
   - Na página do projeto, vá em **Settings → Environment Variables**
   - Adicione:
     - **Name:** `NEXT_PUBLIC_WS_URL`
     - **Value:** A URL do WebSocket retornada no deploy do backend
     - **Environment:** Production, Preview, Development (marque todos)

4. **Deploy:**
   - Clique em **"Deploy"**
   - O Vercel fará o deploy automaticamente

**Nota:** Após cada push no repositório, o Vercel fará deploy automático do frontend.

### 4.5 Fazer Commit e Push

**Importante:** para este fluxo, faça push diretamente na branch `main` (sem criar branch adicional).

```bash
git add .
git commit -m "feat: complete game implementation"
git push origin main
```

O GitHub Actions fará deploy do backend e o Vercel fará deploy do frontend automaticamente.

## ✅ Fase 5: Testes Finais (15 min)

### 5.1 Escrever Testes

Certifique-se de ter cobertura mínima de 80%:

```bash
# Backend - Executar testes com cobertura
cd backend
npm test -- --coverage

# Frontend - Executar testes com cobertura
cd ../frontend
npm test -- --coverage
```

**Importante:** O Husky validará automaticamente lint, TypeScript e cobertura de 80% antes de permitir push.

### 5.2 Testar Localmente

1. Abra dois navegadores
2. Acesse `http://localhost:3000` em ambos
3. Verifique conexão
4. Faça jogadas alternadas
5. Teste vitória e empate

### 5.3 Testar Deployment

1. Verifique logs do GitHub Actions (deploy do backend)
2. Confirme que recursos foram criados na AWS
3. Verifique o deploy do frontend no painel da Vercel
4. Teste a aplicação em produção (URL fornecida pelo Vercel)

### 5.4 Validar com Husky

Antes de fazer push, teste as validações:

```bash
# Na raiz do projeto
npm run validate
```

Isso executará:
- `npm run lint` - Validação de código
- `npm run type-check` - Verificação de tipos TypeScript
- `npm run test:coverage` - Testes com cobertura mínima de 80%

Se houver erros, corrija antes de fazer push. O Husky bloqueará push se alguma validação falhar.

## 🎉 Conclusão

Parabéns! Você construiu um jogo da velha online completo com:
- ✅ Backend serverless com WebSocket
- ✅ Frontend Next.js
- ✅ CI/CD automatizado
- ✅ Infraestrutura como código

## 📚 Próximos Passos

- Adicionar autenticação
- Implementar sistema de salas
- Adicionar histórico de partidas
- Melhorar UI/UX
- Adicionar testes automatizados

## 🆘 Problemas Comuns

Consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para soluções de problemas comuns.
