# Arquitetura do Sistema

Este documento descreve a arquitetura detalhada do Jogo da Velha Online, incluindo decisões de design e fluxos de dados.

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cliente (Browser)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Board.tsx  │  │ GameStatus   │  │ useWebSocket │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ WebSocket (WSS)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    AWS API Gateway                               │
│                  WebSocket API                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Route: $connect    → Lambda: connect                   │   │
│  │  Route: $disconnect → Lambda: disconnect                 │   │
│  │  Route: game        → Lambda: game                       │   │
│  │  Route: $default    → Lambda: default                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  connect.js    │  │   game.js       │  │ disconnect.js  │
│  Lambda        │  │   Lambda        │  │ Lambda         │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                ┌────────────▼────────────┐
                │     DynamoDB            │
                │  ┌──────────────────┐   │
                │  │ tic-tac-toe-games│   │
                │  └──────────────────┘   │
                │  ┌──────────────────┐   │
                │  │tic-tac-toe-      │   │
                │  │ connections      │   │
                │  └──────────────────┘   │
                └─────────────────────────┘
```

## 📡 Componentes Principais

### 1. Frontend (Next.js)

**Tecnologias:**
- Next.js 14+ com App Router
- React 18+
- TypeScript 5+
- WebSocket API nativo do browser

**Componentes:**

- **`Board.tsx`**: Componente principal do tabuleiro 3x3
  - Renderiza células clicáveis
  - Gerencia estado visual do jogo
  - Desabilita células após jogada

- **`GameStatus.tsx`**: Exibe status do jogo
  - Turno atual
  - Vencedor
  - Estado da conexão

- **`useWebSocket.ts`**: Hook customizado para WebSocket
  - Gerencia conexão WebSocket
  - Envia/recebe mensagens
  - Reconexão automática
  - Tratamento de erros

**Fluxo de Dados no Frontend:**

```
User Click → Board Component → useWebSocket Hook → WebSocket Send
                                                          ↓
WebSocket Message ← useWebSocket Hook ← Board Update ← WebSocket Receive
```

### 2. Backend (AWS Lambda + API Gateway)

**Tecnologias:**
- AWS Lambda (Node.js 18+)
- API Gateway WebSocket API
- DynamoDB (On-demand)
- Serverless Framework

**Lambda Functions:**

#### `connect.js`
**Responsabilidade:** Gerenciar novas conexões WebSocket

**Fluxo:**
1. Recebe evento de conexão
2. Extrai `connectionId` do evento
3. Verifica se existe sala disponível (1 jogador)
4. Se não existe, cria nova sala
5. Se existe, adiciona segundo jogador e inicia jogo
6. Salva mapeamento `connectionId → gameId` no DynamoDB
7. Envia mensagem de boas-vindas ao cliente

**Dados armazenados:**
- `tic-tac-toe-connections`: `{ connectionId, gameId, player }`
- `tic-tac-toe-games`: `{ gameId, player1, player2, board, currentPlayer, status }`

#### `disconnect.js`
**Responsabilidade:** Limpar recursos ao desconectar

**Fluxo:**
1. Recebe evento de desconexão
2. Busca `gameId` associado ao `connectionId`
3. Remove entrada da tabela de conexões
4. Se jogo estava em andamento, notifica outro jogador
5. Se necessário, remove jogo da tabela de jogos

#### `game.js`
**Responsabilidade:** Processar movimentos do jogo

**Fluxo:**
1. Recebe mensagem com movimento (posição)
2. Valida `connectionId` e `gameId`
3. Verifica se é o turno do jogador
4. Valida posição (célula vazia, dentro do tabuleiro)
5. Atualiza tabuleiro no DynamoDB
6. Verifica vitória ou empate
7. Alterna turno ou finaliza jogo
8. Envia atualização para ambos os jogadores via `postToConnection`

**Validações:**
- Jogador pertence ao jogo
- É o turno correto
- Posição válida (0-8)
- Célula está vazia
- Jogo não está finalizado

#### `default.js`
**Responsabilidade:** Handler para rotas não mapeadas

**Fluxo:**
1. Recebe qualquer mensagem não mapeada
2. Retorna erro informando rota inválida

### 3. Banco de Dados (DynamoDB)

#### Tabela: `tic-tac-toe-games`

**Schema:**
```json
{
  "gameId": "string (PK)",
  "player1": "string (connectionId)",
  "player2": "string (connectionId)",
  "board": ["X", "O", "", "", "", "", "", "", ""],
  "currentPlayer": "X" | "O",
  "status": "waiting" | "playing" | "finished",
  "winner": "X" | "O" | "draw" | null,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Índices:**
- Primary Key: `gameId`

#### Tabela: `tic-tac-toe-connections`

**Schema:**
```json
{
  "connectionId": "string (PK)",
  "gameId": "string",
  "player": "X" | "O",
  "connectedAt": "timestamp"
}
```

**Índices:**
- Primary Key: `connectionId`
- GSI: `gameId` (para buscar conexões por jogo)

## 🔄 Fluxos de Dados

### Fluxo 1: Conexão Inicial

```
1. Cliente abre aplicação Next.js
2. useWebSocket hook estabelece conexão WebSocket
3. API Gateway dispara evento $connect
4. Lambda connect.js executa:
   - Cria/entra em sala
   - Salva no DynamoDB
   - Envia mensagem de confirmação
5. Cliente recebe confirmação e atualiza UI
```

### Fluxo 2: Jogada

```
1. Usuário clica em célula do tabuleiro
2. Board.tsx chama useWebSocket.send()
3. Mensagem enviada via WebSocket para rota "game"
4. API Gateway dispara Lambda game.js
5. Lambda valida e processa:
   - Atualiza DynamoDB
   - Verifica vitória/empate
6. Lambda envia atualização para ambos connectionIds
7. Ambos os clientes recebem atualização
8. UI atualiza automaticamente
```

### Fluxo 3: Desconexão

```
1. Cliente fecha aba/navegador
2. API Gateway detecta desconexão
3. Dispara Lambda disconnect.js
4. Lambda:
   - Remove connectionId do DynamoDB
   - Notifica outro jogador (se conectado)
   - Limpa recursos se necessário
5. Outro jogador recebe notificação de desconexão
```

## 🎮 Lógica do Jogo

### Regras Implementadas

1. **Tabuleiro:** 3x3 (9 células, índices 0-8)
2. **Jogadores:** X (primeiro) e O (segundo)
3. **Turnos:** Alternados, começando com X
4. **Vitória:** 3 em linha (horizontal, vertical ou diagonal)
5. **Empate:** Tabuleiro cheio sem vencedor
6. **Validação:** Apenas células vazias podem ser jogadas

### Representação do Tabuleiro

```javascript
// Array de 9 elementos, índices 0-8
// 0 | 1 | 2
// ---------
// 3 | 4 | 5
// ---------
// 6 | 7 | 8

board = ["X", "O", "", "X", "", "O", "", "", ""]
```

### Verificação de Vitória

```javascript
const winningCombinations = [
  [0, 1, 2], // linha superior
  [3, 4, 5], // linha média
  [6, 7, 8], // linha inferior
  [0, 3, 6], // coluna esquerda
  [1, 4, 7], // coluna média
  [2, 5, 8], // coluna direita
  [0, 4, 8], // diagonal principal
  [2, 4, 6]  // diagonal secundária
];
```

## 🔒 Segurança

### Medidas Implementadas

1. **Validação de Entrada:**
   - Validação de posição (0-8)
   - Verificação de célula vazia
   - Validação de turno

2. **Autorização:**
   - Verificação de `connectionId` válido
   - Verificação de pertencimento ao jogo
   - Validação de turno do jogador

3. **Rate Limiting:**
   - Configurado no API Gateway
   - Previne abuso de requisições

4. **CORS:**
   - Configurado no frontend Next.js
   - Apenas domínio permitido

## 📊 Escalabilidade

### Considerações

1. **DynamoDB:**
   - Modo On-demand para escalabilidade automática
   - Sem necessidade de provisionamento

2. **Lambda:**
   - Escala automaticamente
   - Sem limite de concorrência (com limites de conta)

3. **API Gateway:**
   - Suporta até 100.000 conexões simultâneas
   - Escala automaticamente

4. **Limitações:**
   - Cada jogo suporta exatamente 2 jogadores
   - Múltiplos jogos podem rodar simultaneamente

## 🔍 Monitoramento

### CloudWatch Logs

Todas as Lambda functions enviam logs para CloudWatch:
- `connect.js`: Logs de conexões
- `disconnect.js`: Logs de desconexões
- `game.js`: Logs de movimentos e validações
- `default.js`: Logs de rotas inválidas

### Métricas Importantes

- Número de conexões ativas
- Número de jogos em andamento
- Taxa de erros
- Latência de processamento

## 🚀 Melhorias Futuras

1. **Autenticação:**
   - Integração com Cognito
   - Histórico de partidas por usuário

2. **Features:**
   - Sistema de salas com nomes
   - Chat entre jogadores
   - Estatísticas de vitórias/derrotas

3. **Performance:**
   - Cache com ElastiCache (Redis)
   - Otimização de queries DynamoDB

4. **Observabilidade:**
   - X-Ray para tracing
   - Dashboards no CloudWatch
