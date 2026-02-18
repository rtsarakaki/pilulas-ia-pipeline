# Guia de Testes e Cobertura

Este documento descreve como configurar e executar testes no projeto, incluindo a validação de cobertura mínima de 80%.

## 🎯 Objetivo

Garantir qualidade de código através de:
- Testes automatizados
- Cobertura mínima de **80%**
- Validação de lint (ESLint)
- Validação de tipos TypeScript (tsc)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🧪 Configuração de Testes

Configure o Jest no `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 🚀 Executando Testes

### Executar Todos os Testes

```bash
npm test
```

### Executar com Cobertura

```bash
npm test -- --coverage
```

### Modo Watch (Desenvolvimento)

```bash
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

## 🔧 Resolvendo Problemas de Cobertura

### 1. Identificar Arquivos Não Cobertos

```bash
npm test -- --coverage
```

Verifique o relatório para identificar arquivos com baixa cobertura.

### 2. Adicionar Testes

Escreva testes para os arquivos/funções não cobertos:

```typescript
// lib/__tests__/gameLogic.test.ts
import { checkWinner, checkDraw, isValidMove } from '../gameLogic';

describe('gameLogic', () => {
  test('checkWinner detects horizontal win', () => {
    const board = ['X', 'X', 'X', null, null, null, null, null, null];
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

## 📝 Exemplos de Testes

### React Component

```typescript
// components/__tests__/Board.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from '../Board';

describe('Board', () => {
  test('renders 9 cells', () => {
    render(
      <Board
        board={Array(9).fill(null)}
        onCellClick={jest.fn()}
        disabled={false}
      />
    );

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);
  });

  test('calls onCellClick when cell is clicked', () => {
    const handleClick = jest.fn();
    render(
      <Board
        board={Array(9).fill(null)}
        onCellClick={handleClick}
        disabled={false}
      />
    );

    const cell = screen.getAllByRole('button')[0];
    fireEvent.click(cell);
    expect(handleClick).toHaveBeenCalledWith(0);
  });
});
```

### React Hook

```typescript
// lib/__tests__/useGame.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../useGame';

describe('useGame', () => {
  test('should initialize with empty board', () => {
    const { result } = renderHook(() => useGame());
    
    expect(result.current.gameState.board).toEqual(Array(9).fill(null));
    expect(result.current.gameState.currentPlayer).toBe('X');
  });

  test('should update board when cell is clicked', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.handleCellClick(0);
    });
    
    expect(result.current.gameState.board[0]).toBe('X');
  });
});
```

## 📚 Referências

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [ESLint Documentation](https://eslint.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
