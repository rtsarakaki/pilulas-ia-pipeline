# Troubleshooting

Este documento contém soluções para problemas comuns encontrados durante o desenvolvimento do projeto Jogo da Velha Local.

## 🚀 Problemas de Build e Execução

### Erro: "Module not found" ou "Cannot find module"

**Sintomas:**
- Erro ao executar `npm run dev` ou `npm run build`
- Mensagem sobre módulo não encontrado

**Soluções:**

1. **Verificar se dependências estão instaladas:**
   ```bash
   npm install
   ```

2. **Limpar cache e reinstalar:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verificar se o arquivo existe:**
   - Confirme que o arquivo mencionado no erro existe
   - Verifique se o caminho está correto (case-sensitive)

### Erro: "Port 3000 is already in use"

**Sintomas:**
- Erro ao executar `npm run dev`
- Mensagem: "Port 3000 is already in use"

**Soluções:**

1. **Encontrar processo usando a porta:**
   ```bash
   # Linux/Mac
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. **Matar o processo:**
   ```bash
   # Linux/Mac
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. **Ou usar outra porta:**
   ```bash
   PORT=3001 npm run dev
   ```

### Erro: "Type error" no TypeScript

**Sintomas:**
- Erro de tipo ao executar `npm run build`
- Mensagens de erro do TypeScript

**Soluções:**

1. **Verificar tipos:**
   ```bash
   npm run type-check
   ```

2. **Verificar se tipos estão corretos:**
   - Confirme que os tipos em `lib/types.ts` estão corretos
   - Verifique se as props dos componentes estão tipadas corretamente

3. **Verificar tsconfig.json:**
   - Confirme que `tsconfig.json` está configurado corretamente
   - Verifique se os paths estão corretos

## 🎮 Problemas no Jogo

### Jogadas não são processadas

**Sintomas:**
- Clicar em células não faz nada
- Estado não atualiza

**Soluções:**

1. **Verificar console do navegador:**
   - Abra DevTools (F12)
   - Veja se há erros no console
   - Verifique se há warnings

2. **Verificar se handleCellClick está sendo chamado:**
   - Adicione `console.log` em `useGame.ts`:
     ```typescript
     const handleCellClick = useCallback((position: number) => {
       console.log('Cell clicked:', position);
       // ... resto do código
     }, []);
     ```

3. **Verificar se Board está recebendo props corretas:**
   - Confirme que `onCellClick` está sendo passado para `Board`
   - Verifique se `disabled` está correto

### Vitória não é detectada

**Sintomas:**
- Jogador completa linha/coluna/diagonal mas não vence
- Status continua como "playing"

**Soluções:**

1. **Verificar lógica de vitória:**
   - Teste `checkWinner` isoladamente:
     ```typescript
     import { checkWinner } from '@/lib/gameLogic';
     
     const board = ['X', 'X', 'X', null, null, null, null, null, null];
     console.log(checkWinner(board)); // Deve retornar 'X'
     ```

2. **Verificar combinações vencedoras:**
   - Confirme que `WINNING_COMBINATIONS` em `gameLogic.ts` está correto
   - Teste cada combinação manualmente

3. **Verificar se getGameStatus está sendo chamado:**
   - Adicione logs em `getGameStatus`:
     ```typescript
     export function getGameStatus(board: Board) {
       const winner = checkWinner(board);
       console.log('Winner:', winner);
       // ... resto do código
     }
     ```

### Empate não é detectado

**Sintomas:**
- Todas células preenchidas mas jogo não termina
- Status não muda para "finished"

**Soluções:**

1. **Verificar lógica de empate:**
   - Teste `checkDraw` isoladamente:
     ```typescript
     import { checkDraw } from '@/lib/gameLogic';
     
     const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
     console.log(checkDraw(board)); // Deve retornar true
     ```

2. **Verificar se board está completo:**
   - Confirme que todas as 9 posições estão preenchidas
   - Verifique se não há vencedor antes de verificar empate

### Botão "Jogar Novamente" não funciona

**Sintomas:**
- Clicar no botão não reinicia o jogo
- Estado não volta ao inicial

**Soluções:**

1. **Verificar se resetGame está sendo chamado:**
   - Adicione log em `useGame.ts`:
     ```typescript
     const resetGame = useCallback(() => {
       console.log('Resetting game');
       setGameState(INITIAL_STATE);
     }, []);
     ```

2. **Verificar se botão está conectado:**
   - Confirme que `onClick={resetGame}` está no botão
   - Verifique se o botão só aparece quando `status === 'finished'`

## 🧪 Problemas com Testes

### Erro: "Cannot find module" nos testes

**Sintomas:**
- Erro ao executar `npm test`
- Mensagem sobre módulo não encontrado

**Soluções:**

1. **Verificar jest.config.js:**
   - Confirme que `moduleNameMapper` está configurado:
     ```javascript
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/$1',
     }
     ```

2. **Verificar se jest.setup.js existe:**
   - Confirme que o arquivo existe na raiz
   - Verifique se está sendo carregado em `setupFilesAfterEnv`

### Cobertura abaixo de 80%

**Sintomas:**
- Testes falham com mensagem de cobertura insuficiente
- Cobertura abaixo de 80%

**Soluções:**

1. **Verificar quais arquivos não estão cobertos:**
   ```bash
   npm run test:coverage
   ```
   - Veja o relatório de cobertura
   - Identifique arquivos com baixa cobertura

2. **Adicionar testes:**
   - Crie testes para funções não cobertas
   - Teste casos de borda (edge cases)
   - Teste diferentes cenários

3. **Verificar collectCoverageFrom:**
   - Confirme que os arquivos corretos estão sendo incluídos
   - Verifique se arquivos de teste não estão sendo incluídos

### Testes falham mas código funciona

**Sintomas:**
- Aplicação funciona no navegador
- Testes falham

**Soluções:**

1. **Verificar ambiente de teste:**
   - Confirme que `jest-environment-jsdom` está configurado
   - Verifique se `@testing-library/jest-dom` está importado

2. **Verificar mocks:**
   - Confirme que mocks estão configurados corretamente
   - Verifique se dependências estão mockadas

3. **Verificar async/await:**
   - Confirme que testes assíncronos estão usando `async/await`
   - Verifique se `waitFor` está sendo usado quando necessário

## 🎨 Problemas de Estilização

### Estilos do Tailwind não aparecem

**Sintomas:**
- Classes do Tailwind não aplicam estilos
- Componentes sem estilo

**Soluções:**

1. **Verificar tailwind.config.ts:**
   - Confirme que `content` inclui os arquivos corretos:
     ```typescript
     content: [
       './app/**/*.{js,ts,jsx,tsx,mdx}',
       './components/**/*.{js,ts,jsx,tsx,mdx}',
     ]
     ```

2. **Verificar postcss.config.js:**
   - Confirme que Tailwind está configurado:
     ```javascript
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     }
     ```

3. **Verificar globals.css:**
   - Confirme que as diretivas do Tailwind estão presentes:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```

4. **Reiniciar servidor de desenvolvimento:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

## 🔧 Problemas Gerais

### Erro: "Hooks can only be called inside of the body of a function component"

**Sintomas:**
- Erro ao usar hooks do React
- Mensagem sobre hooks

**Soluções:**

1. **Verificar se componente é 'use client':**
   - Componentes que usam hooks devem ter `'use client'` no topo
   - Confirme que `useGame` está em um componente client

2. **Verificar se hook está sendo chamado no nível superior:**
   - Hooks não podem estar dentro de loops, condições ou funções aninhadas
   - Mova o hook para o nível superior do componente

### Erro: "Maximum update depth exceeded"

**Sintomas:**
- Aplicação trava ou fica lenta
- Muitos re-renders

**Soluções:**

1. **Verificar dependências de useCallback/useMemo:**
   - Confirme que arrays de dependências estão corretos
   - Evite criar novas funções/objetos nas dependências

2. **Verificar se setState está causando loop:**
   - Não chame setState dentro de render
   - Use useEffect quando necessário

## 📚 Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs)

## 💡 Dicas

- Sempre verifique o console do navegador primeiro
- Use `console.log` para debugar
- Teste funções isoladamente
- Verifique tipos com `npm run type-check`
- Execute testes antes de fazer commit
