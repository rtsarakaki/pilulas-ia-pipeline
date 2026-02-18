# Guia Completo do Workshop

Este documento é um guia passo a passo para recriar o projeto **Todo List Online** do zero. Use este guia durante o workshop para construir todo o projeto.

## 🎯 Objetivo do Workshop

Construir uma aplicação Todo List usando:
- **Frontend:** Next.js
- **Backend:** AWS Lambda com REST API Gateway
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
- [ ] Serverless Framework v3 instalado (`npm install -g serverless@3`)
- [ ] Git instalado
- [ ] Editor de código (VS Code recomendado)

## 🚀 Fase 1: Setup Inicial (15 min)

### 1.1 Criar Repositório Git

```bash
# Criar pasta do projeto
mkdir todo-list-online
cd todo-list-online

# Inicializar Git
git init
git branch -M main

# Criar README inicial
echo "# Todo List Online" > README.md
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
  "name": "todo-list-online",
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
npm install -D serverless@3 serverless-offline
npm install aws-sdk
```

### 2.1.1 Configurar package.json do Backend

Atualize `backend/package.json`:

```json
{
  "name": "todo-list-backend",
  "version": "1.0.0",
  "description": "Backend serverless para Todo List Online",
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
service: todo-list-backend

frameworkVersion: '>=3.38.0'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  httpApi:
    cors: true
  environment:
    STAGE: ${self:provider.stage}
    TODOS_TABLE: ${self:service}-todos-${self:provider.stage}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:PutItem
            - dynamodb:GetItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
            - dynamodb:Scan
          Resource:
            - "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}"

functions:
  createTodo:
    handler: functions/createTodo.handler
    events:
      - httpApi:
          path: /todos
          method: post
  getTodos:
    handler: functions/getTodos.handler
    events:
      - httpApi:
          path: /todos
          method: get
  updateTodo:
    handler: functions/updateTodo.handler
    events:
      - httpApi:
          path: /todos/{id}
          method: put
  deleteTodo:
    handler: functions/deleteTodo.handler
    events:
      - httpApi:
          path: /todos/{id}
          method: delete

resources:
  Resources:
    TodosTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.TODOS_TABLE}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
```

### 2.3 Instalar Dependências do Backend

```bash
cd backend
npm install uuid
```

### 2.4 Criar Função Lambda - createTodo.js

Crie `backend/functions/createTodo.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const TODOS_TABLE = process.env.TODOS_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const { text, completed = false } = body;

    // Validação
    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Criar todo
    const todo = {
      id: uuidv4(),
      text: text.trim(),
      completed: Boolean(completed),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Salvar no DynamoDB
    await dynamodb.put({
      TableName: TODOS_TABLE,
      Item: todo
    }).promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(todo)
    };
  } catch (error) {
    console.error('Error creating todo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

### 2.5 Criar Função Lambda - getTodos.js

Crie `backend/functions/getTodos.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TODOS_TABLE = process.env.TODOS_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Buscar todos os todos
    const result = await dynamodb.scan({
      TableName: TODOS_TABLE
    }).promise();

    // Ordenar por data de criação (mais recente primeiro)
    const todos = (result.Items || []).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(todos)
    };
  } catch (error) {
    console.error('Error getting todos:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

### 2.6 Criar Função Lambda - updateTodo.js

Crie `backend/functions/updateTodo.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TODOS_TABLE = process.env.TODOS_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const id = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    const { text, completed } = body;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID is required' })
      };
    }

    // Verificar se o todo existe
    const existing = await dynamodb.get({
      TableName: TODOS_TABLE,
      Key: { id }
    }).promise();

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Todo not found' })
      };
    }

    // Construir expressão de atualização
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (text !== undefined) {
      updateExpressions.push('#text = :text');
      expressionAttributeNames['#text'] = 'text';
      expressionAttributeValues[':text'] = text.trim();
    }

    if (completed !== undefined) {
      updateExpressions.push('completed = :completed');
      expressionAttributeValues[':completed'] = Boolean(completed);
    }

    if (updateExpressions.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'At least one field must be updated' })
      };
    }

    // Sempre atualizar updatedAt
    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    // Atualizar no DynamoDB
    const result = await dynamodb.update({
      TableName: TODOS_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ReturnValues: 'ALL_NEW'
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

### 2.7 Criar Função Lambda - deleteTodo.js

Crie `backend/functions/deleteTodo.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TODOS_TABLE = process.env.TODOS_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID is required' })
      };
    }

    // Verificar se o todo existe
    const existing = await dynamodb.get({
      TableName: TODOS_TABLE,
      Key: { id }
    }).promise();

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Todo not found' })
      };
    }

    // Deletar do DynamoDB
    await dynamodb.delete({
      TableName: TODOS_TABLE,
      Key: { id }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Todo deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

### 2.8 Deploy do Backend

```bash
cd backend
npx serverless deploy --stage dev
```

**Anote a URL da API REST retornada!**

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
NEXT_PUBLIC_API_URL=https://SEU_API_ID.execute-api.us-east-1.amazonaws.com/dev
```

**Substitua `SEU_API_ID` pela URL retornada no deploy.**

### 3.3 Criar API Client

Crie `frontend/lib/apiClient.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  getTodos: (): Promise<Todo[]> => request<Todo[]>('/todos'),
  
  createTodo: (text: string, completed = false): Promise<Todo> =>
    request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify({ text, completed }),
    }),
  
  updateTodo: (id: string, updates: { text?: string; completed?: boolean }): Promise<Todo> =>
    request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  deleteTodo: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`/todos/${id}`, {
      method: 'DELETE',
    }),
};
```

### 3.4 Criar Hook useTodos

Crie `frontend/hooks/useTodos.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, Todo } from '@/lib/apiClient';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (text: string) => {
    try {
      const newTodo = await apiClient.createTodo(text);
      setTodos(prev => [newTodo, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const updated = await apiClient.updateTodo(id, { completed: !todo.completed });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await apiClient.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    refetch: fetchTodos,
  };
}
```

### 3.5 Criar Componente TodoItem

Crie `frontend/components/TodoItem.tsx`:

```typescript
'use client';

import { Todo } from '@/lib/apiClient';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-gray-200 hover:bg-gray-50">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      />
      <span
        className={`flex-1 ${
          todo.completed
            ? 'line-through text-gray-500'
            : 'text-gray-800'
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
```

### 3.6 Criar Componente TodoList

Crie `frontend/components/TodoList.tsx`:

```typescript
'use client';

import { TodoItem } from './TodoItem';
import { Todo } from '@/lib/apiClient';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No todos yet. Add one above!
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

### 3.7 Criar Página Principal

Atualize `frontend/app/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { TodoList } from '@/components/TodoList';

export default function Home() {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      await addTodo(inputValue);
      setInputValue('');
    } catch (err) {
      // Error já é tratado no hook
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Todo List
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
      </div>
    </main>
  );
}
```

### 3.8 Testar Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste:
1. Adicionar novos todos
2. Marcar todos como completos
3. Deletar todos
4. Verificar se as mudanças persistem após recarregar

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
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Deploy backend
        working-directory: ./backend
        run: npx serverless deploy --stage dev
        env:
          AWS_REGION: ${{ env.AWS_REGION }}
      
      - name: Get API URL
        id: api
        working-directory: ./backend
        run: |
          URL=$(npx serverless info --stage dev | grep -oP 'https://[^ ]+' | head -1)
          echo "url=$URL" >> $GITHUB_OUTPUT
      
      - name: Output API URL
        run: |
          echo "API URL: ${{ steps.api.outputs.url }}"
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
     - **Name:** `NEXT_PUBLIC_API_URL`
     - **Value:** A URL da API REST retornada no deploy do backend
     - **Environment:** Production, Preview, Development (marque todos)

4. **Deploy:**
   - Clique em **"Deploy"**
   - O Vercel fará o deploy automaticamente

**Nota:** Após cada push no repositório, o Vercel fará deploy automático do frontend.

### 4.5 Fazer Commit e Push

**Importante:** para este fluxo, faça push diretamente na branch `main` (sem criar branch adicional).

```bash
git add .
git commit -m "feat: complete todo list implementation"
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

1. Acesse `http://localhost:3000`
2. Adicione alguns todos
3. Marque alguns como completos
4. Delete alguns todos
5. Verifique se as mudanças persistem após recarregar

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

Parabéns! Você construiu uma Todo List online completa com:
- ✅ Backend serverless com REST API
- ✅ Frontend Next.js
- ✅ CI/CD automatizado
- ✅ Infraestrutura como código

## 📚 Próximos Passos

- Adicionar autenticação de usuários
- Implementar categorias/tags para todos
- Adicionar filtros (todos, completos, pendentes)
- Melhorar UI/UX com animações
- Adicionar testes automatizados
- Implementar paginação para muitos todos

## 🆘 Problemas Comuns

Consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para soluções de problemas comuns.
