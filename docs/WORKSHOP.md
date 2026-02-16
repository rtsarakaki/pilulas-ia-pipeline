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
- [ ] AWS CLI configurado
- [ ] Conta AWS ativa
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

## 🏗️ Fase 2: Backend - Serverless Framework (45 min)

### 2.1 Inicializar Backend

```bash
cd backend
npm init -y
npm install serverless serverless-offline
npm install aws-sdk
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

## 🤖 Fase 4: CI/CD - GitHub Actions (30 min)

### 4.1 Criar Workflow

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
        run: echo "WebSocket URL: ${{ steps.websocket.outputs.url }}"

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm install
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          NEXT_PUBLIC_WS_URL: ${{ needs.deploy-backend.outputs.websocket-url }}
```

### 4.2 Configurar OIDC (Ver DEPLOYMENT.md)

Siga os passos 1 e 2 do [DEPLOYMENT.md](DEPLOYMENT.md) para configurar OIDC e IAM Role.

### 4.3 Adicionar Secrets no GitHub

No GitHub, vá em **Settings → Secrets → Actions** e adicione:
- `AWS_ROLE_ARN`: ARN da role criada

### 4.4 Fazer Commit e Push

```bash
git add .
git commit -m "feat: complete game implementation"
git push origin main
```

## ✅ Fase 5: Testes Finais (15 min)

### 5.1 Testar Localmente

1. Abra dois navegadores
2. Acesse `http://localhost:3000` em ambos
3. Verifique conexão
4. Faça jogadas alternadas
5. Teste vitória e empate

### 5.2 Testar Deployment

1. Verifique logs do GitHub Actions
2. Confirme que recursos foram criados na AWS
3. Teste a aplicação em produção

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
