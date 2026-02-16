# Guia de Testes e Cobertura

Este documento descreve como configurar e executar testes no projeto, incluindo a validação de cobertura mínima de 80% via Husky.

## 🎯 Objetivo

Garantir qualidade de código através de:
- Testes automatizados
- Cobertura mínima de **80%**
- Validação automática via Husky antes de cada push
- Validação de lint (ESLint)
- Validação de tipos TypeScript (tsc)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Husky instalado (via npm install)

## 🧪 Configuração de Testes

### Backend

No diretório `backend/`, configure o Jest:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Frontend

No diretório `frontend/`, configure o Jest com React Testing Library:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 🔧 Configuração do Husky

O projeto utiliza Husky para validar lint, TypeScript e cobertura de testes antes de cada push.

### 1. Instalar Husky

```bash
npm install --save-dev husky
npx husky install
```

### 2. Criar Hook pre-push

```bash
npx husky add .husky/pre-push "npm run validate"
```

### 3. Configurar Scripts no package.json

Adicione na raiz do projeto (package.json):

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    "test:coverage": "npm test -- --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'",
    "validate": "npm run lint && npm run type-check && npm run test:coverage"
  }
}
```

### 4. Testar Configuração

```bash
npm run validate
```

Isso executará todas as validações: lint, type-check e testes com cobertura.

## 🚀 Executando Testes

### Executar Todos os Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Executar com Cobertura

```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage
```

### Modo Watch (Desenvolvimento)

```bash
# Backend
cd backend
npm run test:watch

# Frontend
cd frontend
npm run test:watch
```

## 📊 Verificando Cobertura

Após executar testes com cobertura, você verá um relatório no terminal e um relatório HTML em `coverage/`.

### Relatório no Terminal

```
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.23 |    82.15 |   88.90 |   85.23 |
```

### Relatório HTML

Abra `coverage/lcov-report/index.html` no navegador para ver detalhes.

## ✅ Validação Automática

O Husky valida automaticamente lint, TypeScript e cobertura antes de cada push:

```bash
git push origin main
```

Se alguma validação falhar, o push será bloqueado:

### Exemplo: Erro de Lint
```
> npm run lint

✖ 3 problems (2 errors, 1 warning)
```

### Exemplo: Erro de TypeScript
```
> npm run type-check

error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

### Exemplo: Cobertura Abaixo de 80%
```
Jest: "global" coverage threshold for branches (80%) not met: 75.5%
```

## 🔧 Resolvendo Problemas de Cobertura

### 1. Identificar Arquivos Não Cobertos

```bash
npm test -- --coverage
```

Verifique o relatório para identificar arquivos com baixa cobertura.

### 2. Adicionar Testes

Escreva testes para os arquivos/funções não cobertos:

```javascript
// Exemplo: backend/lib/gameLogic.test.js
const { checkWinner, checkDraw, isValidMove } = require('./gameLogic');

describe('gameLogic', () => {
  test('checkWinner detects horizontal win', () => {
    const board = ['X', 'X', 'X', '', '', '', '', '', ''];
    expect(checkWinner(board)).toBe('X');
  });

  test('checkDraw detects draw', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(checkDraw(board)).toBe(true);
  });

  // ... mais testes
});
```

### 3. Verificar Novamente

```bash
npm test -- --coverage
```

### 4. Tentar Push Novamente

```bash
git add .
git commit -m "feat: adiciona testes para aumentar cobertura"
git push
```

## 🚫 Pular Validação (Não Recomendado)

Se precisar fazer push sem validação (apenas em casos excepcionais):

```bash
git push --no-verify
```

⚠️ **Atenção:** Use apenas em casos excepcionais. As validações (lint, TypeScript e cobertura de 80%) são requisitos do projeto.

## 📝 Exemplos de Testes

### Backend - Lambda Function

```javascript
// backend/functions/game.test.js
const { handler } = require('./game');
const AWS = require('aws-sdk-mock');

describe('game handler', () => {
  beforeEach(() => {
    AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
      callback(null, { Item: { gameId: 'test', board: ['', '', '', '', '', '', '', '', ''] } });
    });
  });

  afterEach(() => {
    AWS.restore('DynamoDB.DocumentClient');
  });

  test('processes valid move', async () => {
    const event = {
      requestContext: { connectionId: 'test-connection' },
      body: JSON.stringify({ action: 'move', position: 0 })
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
  });
});
```

### Frontend - React Component

```typescript
// frontend/components/Board.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from './Board';

describe('Board', () => {
  test('renders 9 cells', () => {
    render(
      <Board
        board={Array(9).fill('')}
        currentPlayer="X"
        player="X"
        status="playing"
        onCellClick={jest.fn()}
      />
    );

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);
  });

  test('calls onCellClick when cell is clicked', () => {
    const handleClick = jest.fn();
    render(
      <Board
        board={Array(9).fill('')}
        currentPlayer="X"
        player="X"
        status="playing"
        onCellClick={handleClick}
      />
    );

    const cell = screen.getAllByRole('button')[0];
    fireEvent.click(cell);
    expect(handleClick).toHaveBeenCalledWith(0);
  });
});
```

## 📚 Referências

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Husky Documentation](https://typicode.github.io/husky/)
- [ESLint Documentation](https://eslint.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [AWS SDK Mock](https://github.com/dwyl/aws-sdk-mock)
