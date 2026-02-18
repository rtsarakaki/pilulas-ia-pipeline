# Arquitetura do Sistema

Este documento descreve a arquitetura detalhada do Todo List Online, incluindo decisões de design e fluxos de dados.

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cliente (Browser)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  TodoList    │  │  TodoItem    │  │  useTodos    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API (HTTPS)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    AWS API Gateway                               │
│                    REST API                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  POST   /todos      → Lambda: createTodo                 │   │
│  │  GET    /todos      → Lambda: getTodos                   │   │
│  │  PUT    /todos/{id} → Lambda: updateTodo                 │   │
│  │  DELETE /todos/{id} → Lambda: deleteTodo                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ createTodo.js  │  │  getTodos.js     │  │ updateTodo.js   │
│ Lambda         │  │  Lambda          │  │ Lambda          │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                ┌────────────▼────────────┐
                │     DynamoDB            │
                │  ┌──────────────────┐   │
                │  │ todo-list-todos  │   │
                │  └──────────────────┘   │
                └─────────────────────────┘
```

## 📡 Componentes Principais

### 1. Frontend (Next.js)

**Tecnologias:**
- Next.js 14+ com App Router
- React 18+
- TypeScript 5+
- Fetch API para chamadas HTTP

**Componentes:**

- **`TodoList.tsx`**: Componente que renderiza lista de todos
  - Exibe lista de todos ou mensagem vazia
  - Renderiza `TodoItem` para cada todo
  - Gerencia estado visual da lista

- **`TodoItem.tsx`**: Componente individual de todo
  - Checkbox para marcar como completo
  - Texto do todo (com strikethrough se completo)
  - Botão para deletar
  - Callbacks para toggle e delete

- **`useTodos.ts`**: Hook customizado para gerenciar todos
  - Gerencia estado dos todos
  - Faz chamadas à API REST
  - Tratamento de erros
  - Loading states

**Fluxo de Dados no Frontend:**

```
User Action → Component → useTodos Hook → API Client → REST API
                                                          ↓
UI Update ← useTodos Hook ← API Response ← REST API Response
```

### 2. Backend (AWS Lambda + API Gateway)

**Tecnologias:**
- AWS Lambda (Node.js 18+)
- API Gateway REST API
- DynamoDB (On-demand)
- Serverless Framework

**Lambda Functions:**

#### `createTodo.js`
**Responsabilidade:** Criar novo todo

**Fluxo:**
1. Recebe requisição POST com `{ text, completed }`
2. Valida que `text` não está vazio
3. Gera UUID para o todo
4. Cria objeto todo com timestamps
5. Salva no DynamoDB
6. Retorna todo criado

**Validações:**
- `text` é obrigatório e não vazio
- `completed` é opcional (default: false)

#### `getTodos.js`
**Responsabilidade:** Listar todos os todos

**Fluxo:**
1. Recebe requisição GET
2. Faz scan na tabela DynamoDB
3. Ordena por data de criação (mais recente primeiro)
4. Retorna lista de todos

**Otimizações:**
- Ordenação por `createdAt` (descendente)
- Scan simples (adequado para pequeno volume)

#### `updateTodo.js`
**Responsabilidade:** Atualizar todo existente

**Fluxo:**
1. Recebe requisição PUT com `id` no path e `{ text?, completed? }` no body
2. Valida que o todo existe
3. Constrói expressão de atualização dinamicamente
4. Atualiza `updatedAt` automaticamente
5. Atualiza no DynamoDB
6. Retorna todo atualizado

**Validações:**
- `id` é obrigatório
- Todo deve existir (404 se não encontrado)
- `text` e `completed` são opcionais
- Pelo menos um campo deve ser atualizado

#### `deleteTodo.js`
**Responsabilidade:** Deletar todo

**Fluxo:**
1. Recebe requisição DELETE com `id` no path
2. Valida que o todo existe
3. Remove do DynamoDB
4. Retorna confirmação

**Validações:**
- `id` é obrigatório
- Todo deve existir (404 se não encontrado)

### 3. Banco de Dados (DynamoDB)

#### Tabela: `todo-list-backend-todos-dev`

**Schema:**
```json
{
  "id": "string (PK)",
  "text": "string",
  "completed": "boolean",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

**Índices:**
- Primary Key: `id` (String)

**Características:**
- Billing Mode: PAY_PER_REQUEST (on-demand)
- Sem índices secundários (não necessário para este caso de uso)
- Timestamps em formato ISO 8601

## 🔄 Fluxos de Dados

### Fluxo 1: Criar Todo

```
1. Usuário digita texto e clica "Add"
2. TodoList.tsx chama useTodos.addTodo()
3. useTodos faz POST para /todos via API client
4. API Gateway roteia para Lambda createTodo.js
5. Lambda valida e cria todo no DynamoDB
6. Lambda retorna todo criado
7. useTodos atualiza estado local
8. UI atualiza mostrando novo todo
```

### Fluxo 2: Listar Todos

```
1. Componente monta e useTodos.useEffect executa
2. useTodos faz GET para /todos via API client
3. API Gateway roteia para Lambda getTodos.js
4. Lambda faz scan no DynamoDB
5. Lambda retorna lista ordenada
6. useTodos atualiza estado com todos
7. UI renderiza lista
```

### Fluxo 3: Atualizar Todo (Toggle Complete)

```
1. Usuário clica no checkbox
2. TodoItem.tsx chama useTodos.toggleTodo()
3. useTodos faz PUT para /todos/{id} com { completed: true/false }
4. API Gateway roteia para Lambda updateTodo.js
5. Lambda valida e atualiza no DynamoDB
6. Lambda retorna todo atualizado
7. useTodos atualiza estado local
8. UI atualiza visualmente (strikethrough)
```

### Fluxo 4: Deletar Todo

```
1. Usuário clica em "Delete"
2. TodoItem.tsx chama useTodos.deleteTodo()
3. useTodos faz DELETE para /todos/{id}
4. API Gateway roteia para Lambda deleteTodo.js
5. Lambda valida e remove do DynamoDB
6. Lambda retorna confirmação
7. useTodos remove do estado local
8. UI remove todo da lista
```

## 🎯 Decisões de Design

### Por que REST API ao invés de WebSocket?

1. **Simplicidade:** Todo List não requer comunicação em tempo real
2. **Custo:** REST API é mais barato que WebSocket (menos conexões persistentes)
3. **Escalabilidade:** REST API escala melhor para muitos usuários independentes
4. **Manutenção:** REST API é mais simples de debugar e manter

### Por que DynamoDB?

1. **Serverless:** Integra perfeitamente com Lambda
2. **Escalabilidade:** Escala automaticamente sem configuração
3. **Custo:** PAY_PER_REQUEST é econômico para baixo volume
4. **Performance:** Baixa latência para operações simples

### Por que UUID ao invés de auto-increment?

1. **Distribuição:** UUIDs são únicos globalmente
2. **Segurança:** Não expõem informações sobre quantidade de registros
3. **Escalabilidade:** Não requer coordenação entre instâncias

### Estrutura de Dados

**Todo Object:**
```typescript
{
  id: string;           // UUID v4
  text: string;         // Texto do todo (obrigatório)
  completed: boolean;   // Status de conclusão (default: false)
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

**Decisões:**
- `id` é gerado no backend (segurança)
- `createdAt` e `updatedAt` são gerenciados automaticamente
- `text` é trimado antes de salvar (limpeza de dados)
- `completed` tem valor padrão `false`

## 🔒 Segurança

### CORS

Todas as funções Lambda retornam headers CORS:
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
}
```

**Nota:** Em produção, substitua `*` pelo domínio específico do frontend.

### Validação de Entrada

- Todos os inputs são validados no backend
- Erros retornam status codes apropriados (400, 404, 500)
- Mensagens de erro não expõem detalhes internos

### Tratamento de Erros

- Erros são logados no CloudWatch
- Clientes recebem mensagens genéricas
- Status codes HTTP apropriados (400, 404, 500)

## 📊 Performance

### Otimizações Implementadas

1. **DynamoDB Scan:** Adequado para pequeno volume (< 1000 items)
   - Para volumes maiores, considerar Query com GSI

2. **Ordenação no Backend:** Ordenação feita após scan
   - Para grandes volumes, usar GSI com sort key

3. **Estado Local:** Frontend mantém estado local
   - Reduz chamadas à API
   - Melhora responsividade da UI

### Limitações Conhecidas

1. **Scan sem paginação:** Pode ser lento com muitos todos
2. **Sem cache:** Cada requisição vai ao DynamoDB
3. **Sem otimistic updates:** UI espera resposta da API

## 🚀 Escalabilidade

### Atual (Adequado para Workshop)

- Até ~1000 todos por usuário
- Até ~100 usuários simultâneos
- Sem autenticação/autorização

### Melhorias Futuras

1. **Autenticação:** Adicionar autenticação (Cognito)
2. **Multi-tenancy:** Separar todos por usuário
3. **Paginação:** Implementar paginação na listagem
4. **Cache:** Adicionar cache (ElastiCache)
5. **Rate Limiting:** Implementar rate limiting no API Gateway

## 📝 Próximos Passos

- [ ] Adicionar autenticação de usuários
- [ ] Implementar filtros (all, active, completed)
- [ ] Adicionar edição inline de todos
- [ ] Implementar paginação
- [ ] Adicionar cache
- [ ] Melhorar tratamento de erros
- [ ] Adicionar testes de integração
