# Todo List Online 📝

Aplicação Todo List construída com Next.js no frontend e AWS Lambda com REST API Gateway no backend.

## 🏗️ Arquitetura

- **Frontend:** Next.js 14+ com App Router
- **Backend:** AWS Lambda com REST API Gateway
- **Infraestrutura:** Serverless Framework
- **Banco de Dados:** DynamoDB para armazenar todos
- **CI/CD Backend:** GitHub Actions com OIDC authentication
- **CI/CD Frontend:** Vercel (integração via painel)
- **Comunicação:** REST API (HTTP/HTTPS)

## 📚 Documentação

Este projeto inclui documentação completa para facilitar a reprodução em workshops:

- **[SETUP.md](docs/SETUP.md)** - Guia de configuração inicial e pré-requisitos
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura detalhada e decisões de design
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guia passo a passo de deployment
- **[OIDC-SETUP.md](docs/OIDC-SETUP.md)** - Guia visual para criar OIDC Provider no Console AWS
- **[TESTING.md](docs/TESTING.md)** - Guia de testes e cobertura (80% mínimo)
- **[WORKSHOP.md](docs/WORKSHOP.md)** - Guia completo para recriar o projeto do zero
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solução de problemas comuns

## 🚀 Início Rápido

1. Siga o guia de [SETUP.md](docs/SETUP.md) para configurar o ambiente
2. Configure Husky para validação de lint, TypeScript e cobertura de testes (80% mínimo)
3. Configure as credenciais AWS e OIDC conforme [DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. Execute o deployment do backend via GitHub Actions
5. Integre o frontend com Vercel pelo painel da Vercel

## 🧪 Qualidade de Código

Este projeto utiliza **Husky** para validar automaticamente antes de cada push:
- **Lint (ESLint)** - Validação de código
- **TypeScript (tsc)** - Verificação de tipos
- **Cobertura de Testes** - Mínimo de 80%

Veja [TESTING.md](docs/TESTING.md) para mais detalhes.

## 🎯 Para Workshops

Se você está participando de um workshop ou quer recriar o projeto do zero, siga o guia completo em **[WORKSHOP.md](docs/WORKSHOP.md)**. Este documento contém todos os passos necessários para construir o projeto desde o início.

## 🤖 Para Recriar com IA

Se você quer que uma IA recrie o projeto do zero, use o prompt em **[PROMPT.md](PROMPT.md)**. Este arquivo contém instruções prontas para fornecer à IA.

## 📁 Estrutura do Projeto

```
pilulas-ia-pipeline/
├── frontend/          # Aplicação Next.js
├── backend/           # Serverless Framework + Lambda
├── infrastructure/    # Templates CloudFormation
├── .github/           # GitHub Actions workflows
└── docs/              # Documentação completa
```

## 🛠️ Tecnologias

- Next.js 14+
- React 18+
- TypeScript 5+
- Serverless Framework 3.x
- AWS Lambda (Node.js 18+)
- AWS API Gateway (REST API)
- Amazon DynamoDB
- GitHub Actions

## 📝 Licença

Este projeto é para fins educacionais e de workshop.
