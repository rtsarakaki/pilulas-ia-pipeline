# Arquitetura do Sistema

Este documento descreve a arquitetura detalhada do Jogo da Velha Local, incluindo decisões de design e fluxos de dados.

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cliente (Browser)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │    Board     │  │ GameStatus   │  │   useGame     │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                           │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │              gameLogic.ts                          │  │   │
│  │  │  - checkWinner()                                    │  │   │
│  │  │  - checkDraw()                                      │  │   │
│  │  │  - isValidMove()                                   │  │   │
│  │  │  - makeMove()                                       │  │   │
│  │  │  - getGameStatus()                                  │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Tudo roda no navegador (client-side)
- ✅ Sem necessidade de backend ou servidor
- ✅ Estado gerenciado localmente com React Hooks
- ✅ Lógica do jogo em TypeScript puro

## 📡 Componentes Principais

### 1. Frontend (Next.js)

**Tecnologias:**
- Next.js 14+ com App Router
- React 18+
- TypeScript 5+
- Tailwind CSS 3+

**Componentes:**

#### `Board.tsx`
**Responsabilidade:** Renderizar o tabuleiro 3x3

**Características:**
- Grid 3x3 de botões clicáveis
- Desabilita células ocupadas
- Desabilita todas as células quando o jogo termina
- Feedback visual (cores diferentes para X e O)
- Animações de hover e click

**Props:**
- `board: Board` - Estado atual do tabuleiro
- `onCellClick: (position: number) => void` - Callback ao clicar em uma célula
- `disabled: boolean` - Se o tabuleiro está desabilitado (jogo terminou)

#### `GameStatus.tsx`
**Responsabilidade:** Exibir status do jogo

**Características:**
- Mostra jogador atual quando o jogo está em andamento
- Mostra vencedor quando o jogo termina
- Mostra mensagem de empate
- Cores diferentes para diferentes estados

**Props:**
- `status: 'playing' | 'finished'` - Status do jogo
- `currentPlayer: 'X' | 'O' | null` - Jogador atual
- `winner: 'X' | 'O' | 'draw' | null` - Vencedor (se houver)

#### `useGame.ts`
**Responsabilidade:** Gerenciar estado do jogo

**Estado:**
- `board: Board` - Array de 9 posições (null, 'X', ou 'O')
- `currentPlayer: 'X' | 'O'` - Jogador da vez
- `status: 'playing' | 'finished'` - Status do jogo
- `winner: Winner` - Vencedor ou null

**Funções:**
- `handleCellClick(position: number)` - Processa jogada
- `resetGame()` - Reinicia o jogo

**Fluxo de uma Jogada:**
1. Usuário clica em uma célula
2. `handleCellClick` é chamado
3. Valida se a célula está vazia e o jogo não terminou
4. Cria novo board com a jogada
5. Verifica vitória/empate usando `getGameStatus`
6. Atualiza estado (board, currentPlayer, status, winner)

### 2. Lógica do Jogo (gameLogic.ts)

**Funções:**

#### `checkWinner(board: Board): Winner`
**Responsabilidade:** Verificar se há um vencedor

**Lógica:**
- Verifica todas as 8 combinações vencedoras:
  - 3 linhas horizontais
  - 3 colunas verticais
  - 2 diagonais
- Retorna 'X', 'O', ou null

**Combinações Vencedoras:**
```typescript
[0, 1, 2], // linha superior
[3, 4, 5], // linha do meio
[6, 7, 8], // linha inferior
[0, 3, 6], // coluna esquerda
[1, 4, 7], // coluna do meio
[2, 5, 8], // coluna direita
[0, 4, 8], // diagonal principal
[2, 4, 6], // diagonal secundária
```

#### `checkDraw(board: Board): boolean`
**Responsabilidade:** Verificar se o jogo terminou em empate

**Lógica:**
- Verifica se todas as células estão preenchidas
- Verifica se não há vencedor
- Retorna true se ambas condições são verdadeiras

#### `isValidMove(board: Board, position: number): boolean`
**Responsabilidade:** Validar se uma jogada é válida

**Validações:**
- Posição está entre 0 e 8
- Célula está vazia (null)

#### `makeMove(board: Board, position: number, player: 'X' | 'O'): Board`
**Responsabilidade:** Criar novo board com a jogada

**Lógica:**
- Valida a jogada
- Cria cópia do board
- Atribui o player na posição
- Retorna novo board (imutável)

#### `getGameStatus(board: Board): { status, winner }`
**Responsabilidade:** Determinar status atual do jogo

**Lógica:**
1. Verifica se há vencedor
2. Se não há vencedor, verifica empate
3. Se não há vencedor nem empate, jogo continua
4. Retorna status e winner

## 🔄 Fluxos de Dados

### Fluxo 1: Iniciar Jogo

```
1. Componente monta
2. useGame inicializa com estado padrão:
   - board: [null, null, null, null, null, null, null, null, null]
   - currentPlayer: 'X'
   - status: 'playing'
   - winner: null
3. Board renderiza células vazias
4. GameStatus mostra "Vez do jogador: X"
```

### Fluxo 2: Fazer Jogada

```
1. Usuário clica em célula (ex: posição 0)
2. Board chama onCellClick(0)
3. useGame.handleCellClick(0) executa:
   a. Valida: célula está vazia? Sim
   b. Cria novo board: makeMove(board, 0, 'X')
   c. Novo board: ['X', null, null, null, null, null, null, null, null]
   d. Verifica status: getGameStatus(newBoard)
   e. Se não terminou: currentPlayer = 'O'
4. Estado atualizado
5. Board re-renderiza com 'X' na posição 0
6. GameStatus atualiza para "Vez do jogador: O"
```

### Fluxo 3: Detectar Vitória

```
1. Jogador faz jogada que completa linha/coluna/diagonal
2. makeMove cria novo board
3. getGameStatus verifica:
   a. checkWinner(board) retorna 'X' ou 'O'
   b. status = 'finished'
   c. winner = 'X' ou 'O'
4. Estado atualizado
5. Board desabilita todas as células
6. GameStatus mostra "Jogador X venceu! 🎉"
7. Botão "Jogar Novamente" aparece
```

### Fluxo 4: Detectar Empate

```
1. Todas as células preenchidas sem vencedor
2. makeMove cria novo board completo
3. getGameStatus verifica:
   a. checkWinner(board) retorna null
   b. checkDraw(board) retorna true
   c. status = 'finished'
   d. winner = 'draw'
4. Estado atualizado
5. Board desabilita todas as células
6. GameStatus mostra "Empate!"
7. Botão "Jogar Novamente" aparece
```

### Fluxo 5: Reiniciar Jogo

```
1. Usuário clica em "Jogar Novamente"
2. useGame.resetGame() executa
3. Estado volta ao inicial:
   - board: Array(9).fill(null)
   - currentPlayer: 'X'
   - status: 'playing'
   - winner: null
4. Board re-renderiza células vazias
5. GameStatus mostra "Vez do jogador: X"
6. Botão "Jogar Novamente" desaparece
```

## 🎯 Decisões de Design

### Por que apenas Frontend?

1. **Simplicidade:** Jogo da Velha não requer persistência ou comunicação entre jogadores
2. **Performance:** Sem latência de rede, resposta instantânea
3. **Custo:** Sem necessidade de servidor ou banco de dados
4. **Portabilidade:** Funciona offline, pode ser deployado como site estático

### Por que React Hooks?

1. **Estado Local:** useGame gerencia todo o estado do jogo
2. **Reatividade:** Mudanças de estado atualizam UI automaticamente
3. **Simplicidade:** Menos código que Redux ou Context API
4. **Performance:** Re-renderização apenas quando necessário

### Por que TypeScript?

1. **Type Safety:** Previne erros em tempo de compilação
2. **Documentação:** Tipos servem como documentação
3. **IntelliSense:** Melhor experiência de desenvolvimento
4. **Refatoração:** Mais seguro refatorar código

### Por que Imutabilidade?

1. **React:** React detecta mudanças comparando referências
2. **Debugging:** Mais fácil rastrear mudanças de estado
3. **Performance:** Permite otimizações do React
4. **Prevenção de Bugs:** Evita mutações acidentais

### Estrutura de Dados

**Board:**
```typescript
type Board = Player[]; // Array de 9 elementos
// Exemplo: [null, 'X', null, 'O', 'X', null, null, null, null]
```

**GameState:**
```typescript
interface GameState {
  board: Board;              // Estado do tabuleiro
  currentPlayer: 'X' | 'O';  // Jogador da vez
  status: 'playing' | 'finished'; // Status do jogo
  winner: 'X' | 'O' | 'draw' | null; // Vencedor
}
```

**Decisões:**
- Board como array simples (mais fácil de iterar)
- Índices 0-8 mapeiam para posições do tabuleiro
- null = célula vazia, 'X'/'O' = célula ocupada

## 🔒 Validações e Regras

### Validações de Jogada

1. **Célula vazia:** Não pode jogar em célula ocupada
2. **Jogo ativo:** Não pode jogar se o jogo terminou
3. **Posição válida:** Posição deve estar entre 0-8
4. **Turno correto:** Jogadores alternam automaticamente

### Regras do Jogo

1. **Primeiro jogador:** Sempre começa com 'X'
2. **Alternância:** Jogadores alternam após cada jogada
3. **Vitória:** Primeiro a completar linha/coluna/diagonal vence
4. **Empate:** Se todas células preenchidas sem vencedor
5. **Fim do jogo:** Jogo termina em vitória ou empate

## 📊 Performance

### Otimizações Implementadas

1. **useCallback:** Funções memoizadas para evitar re-renders
2. **Imutabilidade:** Permite React.memo e otimizações
3. **Cálculos mínimos:** Lógica do jogo só executa quando necessário
4. **CSS Tailwind:** Estilos compilados, sem runtime overhead

### Limitações Conhecidas

1. **Sem persistência:** Estado perdido ao recarregar página
2. **Apenas local:** Não suporta multiplayer online
3. **Sem histórico:** Não salva partidas anteriores

## 🎨 UI/UX

### Design Decisions

1. **Cores:**
   - X = Azul (blue-600)
   - O = Vermelho (red-600)
   - Background = Gradiente azul claro

2. **Feedback Visual:**
   - Hover effect nas células clicáveis
   - Scale animation no click
   - Cores diferentes para estados diferentes

3. **Acessibilidade:**
   - Botões desabilitados têm cursor-not-allowed
   - Texto claro e legível
   - Contraste adequado

4. **Responsividade:**
   - Tabuleiro fixo 96x96 (w-96 h-96)
   - Layout centralizado
   - Padding adequado em mobile
