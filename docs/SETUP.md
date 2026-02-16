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

4. **Serverless Framework**
   ```bash
   npm install -g serverless@3
   serverless --version
   ```
   Use a major 3 para manter compatibilidade com o `frameworkVersion` do backend.

5. **Husky** (para validação de qualidade de código via Git hooks)
   - Será instalado automaticamente via npm ao instalar dependências do projeto
   - Documentação: https://typicode.github.io/husky/

6. **Conta AWS** com permissões para:
   - Lambda
   - API Gateway
   - DynamoDB
   - IAM
   - CloudFormation
   - CloudWatch Logs

### Conta GitHub

- Conta GitHub ativa
- Acesso ao repositório do projeto
- Permissões para configurar GitHub Actions e OIDC

## 🔧 Configuração Inicial

### 1. Clonar o Repositório

```bash
git clone https://github.com/rtsarakaki/pilulas-ia-pipeline.git
cd pilulas-ia-pipeline
git checkout main
```

**Importante:** neste fluxo, faça push sempre direto para `main` (`git push origin main`), sem criar branch adicional.

### 2. Instalar Dependências do Backend

**Nota:** Não é necessário configurar AWS CLI localmente. O deploy será feito via GitHub Actions usando OIDC (sem necessidade de credenciais locais).

```bash
cd backend
npm install
```

### 3. Instalar Dependências do Frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar Husky

O projeto utiliza Husky para validar qualidade de código antes de cada push. As validações incluem:
- **Lint** (ESLint) - validação de código
- **TypeScript** (tsc) - verificação de tipos
- **Cobertura de testes** - mínimo de 80%

```bash
# Na raiz do projeto
cd /home/usuario/Documentos/git/youtube-channel-projects/pilulas-ia-pipeline

# Instalar dependências (Husky será instalado automaticamente)
npm install

# Inicializar Husky (se ainda não estiver inicializado)
npx husky install

# Testar hooks manualmente
npm run lint
npm run type-check
npm test -- --coverage
```

**Importante:** O Husky valida lint, TypeScript e cobertura de testes (80% mínimo) antes de permitir push. Se alguma validação falhar, o push será bloqueado.

## 🔐 Configuração de Credenciais

### Variáveis de Ambiente - Backend

Crie um arquivo `.env` na pasta `backend/`:

```bash
cd backend
cat > .env << EOF
AWS_REGION=us-east-1
STAGE=dev
EOF
```

### Variáveis de Ambiente - Frontend

Crie um arquivo `.env.local` na pasta `frontend/`:

```bash
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_WS_URL=
EOF
```

**Nota:** O `NEXT_PUBLIC_WS_URL` será preenchido após o primeiro deployment do backend.

## 🏗️ Estrutura de Diretórios

Após a configuração inicial, a estrutura deve ser:

```
pilulas-ia-pipeline/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.local
│   └── next.config.js
├── backend/
│   ├── functions/
│   ├── lib/
│   ├── package.json
│   ├── serverless.yml
│   └── .env
├── infrastructure/
│   └── iam-role.yaml
├── .github/
│   └── workflows/
│       └── deploy.yml
└── docs/
```

## ✅ Verificação do Setup

Execute os seguintes comandos para verificar se tudo está configurado corretamente:

```bash
# Verificar Node.js
node --version

# Verificar Serverless Framework
serverless --version
# Deve exibir versão 3.x

# Verificar Husky
npx husky --version

# Verificar dependências do backend
cd backend && npm list --depth=0

# Verificar dependências do frontend
cd ../frontend && npm list --depth=0

# Testar validações (lint, tsc, testes)
cd .. && npm run lint
npm run type-check
npm test -- --coverage
```

## 🧪 Validações Automáticas (Husky)

O projeto utiliza Husky para validar automaticamente antes de cada push:

1. **Lint (ESLint)** - Validação de código
2. **TypeScript (tsc)** - Verificação de tipos
3. **Cobertura de Testes** - Mínimo de 80%

Todas as validações são executadas no hook `pre-push` do Git.

### Executar Testes e Verificar Cobertura

```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd ../frontend
npm test -- --coverage
```

### Se Alguma Validação Falhar

O Husky bloqueará o push. Para resolver:

1. **Erros de Lint:**
   ```bash
   npm run lint
   # Corrija os erros indicados
   npm run lint -- --fix  # Auto-corrigir quando possível
   ```

2. **Erros de TypeScript:**
   ```bash
   npm run type-check
   # Corrija os erros de tipo indicados
   ```

3. **Cobertura Abaixo de 80%:**
   ```bash
   npm test -- --coverage
   # Verifique quais arquivos não estão cobertos
   # Adicione testes para aumentar a cobertura
   ```

4. Tente fazer push novamente:
   ```bash
   git push origin main
   ```

### Pular Validação (Não Recomendado)

Se precisar fazer push sem passar pela validação (não recomendado):

```bash
git push origin main --no-verify
```

⚠️ **Atenção:** Use apenas em casos excepcionais. As validações são requisitos do projeto.

## 🚀 Próximos Passos

Após completar o setup:

1. Configure o OIDC no GitHub (veja [DEPLOYMENT.md](DEPLOYMENT.md))
2. Crie a IAM Role para GitHub Actions (veja [DEPLOYMENT.md](DEPLOYMENT.md))
3. Execute o primeiro deployment (veja [DEPLOYMENT.md](DEPLOYMENT.md))

## 📚 Referências

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Husky Documentation](https://typicode.github.io/husky/)

## 💡 Nota sobre AWS CLI

**Não é necessário configurar AWS CLI localmente.** O projeto utiliza GitHub Actions com OIDC para fazer deploy na AWS sem necessidade de credenciais locais. 

Se você precisar fazer deploy manual (opcional), pode instalar e configurar AWS CLI, mas isso não é obrigatório para o workflow padrão do projeto.
