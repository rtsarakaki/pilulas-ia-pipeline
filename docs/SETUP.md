# Guia de Setup Inicial

Este documento descreve todos os pré-requisitos e configurações necessárias para começar a trabalhar no projeto.

## 📋 Pré-requisitos

### Software Necessário

1. **Node.js** (versão 18 ou superior)
   ```bash
   node --version  # Deve ser >= 18.0.0
   ```

2. **npm** ou **yarn**
   ```bash
   npm --version
   # ou
   yarn --version
   ```

3. **Git**
   ```bash
   git --version
   ```

### Editor de Código (Recomendado)

- **VS Code** com extensões:
  - ESLint
  - Prettier
  - TypeScript

## 🔧 Configuração Inicial

### 1. Clonar o Repositório

```bash
git clone https://github.com/rtsarakaki/pilulas-ia-pipeline.git
cd pilulas-ia-pipeline
git checkout main
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar o Projeto Localmente

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 🏗️ Estrutura de Diretórios

Após a configuração inicial, a estrutura deve ser:

```
jogo-da-velha-local/
├── app/
│   ├── page.tsx      # Página principal
│   ├── layout.tsx    # Layout raiz
│   └── globals.css   # Estilos globais
├── components/
│   ├── Board.tsx     # Componente do tabuleiro
│   └── GameStatus.tsx # Componente de status
├── lib/
│   ├── types.ts       # Tipos TypeScript
│   ├── gameLogic.ts   # Lógica do jogo
│   └── useGame.ts     # Hook React
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── postcss.config.js
```

## ✅ Verificação do Setup

Execute os seguintes comandos para verificar se tudo está configurado corretamente:

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar dependências instaladas
npm list --depth=0

# Testar build
npm run build

# Executar testes
npm test
```

## 🧪 Testes e Cobertura

O projeto utiliza Jest para testes com cobertura mínima de 80%.

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

### Cobertura Mínima

O projeto exige cobertura mínima de 80% em:
- Branches (ramificações)
- Functions (funções)
- Lines (linhas)
- Statements (declarações)

Se a cobertura estiver abaixo de 80%, os testes falharão.

## 🚀 Próximos Passos

Após completar o setup:

1. Leia o [WORKSHOP.md](WORKSHOP.md) para entender como o projeto foi construído
2. Explore o código em `app/`, `components/`, e `lib/`
3. Execute `npm run dev` para ver o jogo em ação
4. Execute `npm test` para ver os testes

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 💡 Dicas

- Use `npm run dev` para desenvolvimento com hot-reload
- Use `npm run build` para verificar se o build funciona
- Use `npm run lint` para verificar problemas de código
- Use `npm test` antes de fazer commit
