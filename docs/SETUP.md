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

4. **AWS CLI** (versão 2.x)
   ```bash
   aws --version
   ```
   - Instalação: https://aws.amazon.com/cli/

5. **Serverless Framework**
   ```bash
   npm install -g serverless
   serverless --version
   ```

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
git checkout develop
```

### 2. Configurar AWS CLI

```bash
aws configure
```

Você precisará fornecer:
- **AWS Access Key ID**
- **AWS Secret Access Key**
- **Default region name:** `us-east-1`
- **Default output format:** `json`

### 3. Verificar Credenciais AWS

```bash
aws sts get-caller-identity
```

Este comando deve retornar informações sobre sua conta AWS.

### 4. Instalar Dependências do Backend

```bash
cd backend
npm install
```

### 5. Instalar Dependências do Frontend

```bash
cd ../frontend
npm install
```

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

# Verificar AWS CLI
aws sts get-caller-identity

# Verificar Serverless Framework
serverless --version

# Verificar dependências do backend
cd backend && npm list --depth=0

# Verificar dependências do frontend
cd ../frontend && npm list --depth=0
```

## 🚀 Próximos Passos

Após completar o setup:

1. Configure o OIDC no GitHub (veja [DEPLOYMENT.md](DEPLOYMENT.md))
2. Crie a IAM Role para GitHub Actions (veja [DEPLOYMENT.md](DEPLOYMENT.md))
3. Execute o primeiro deployment (veja [DEPLOYMENT.md](DEPLOYMENT.md))

## 📚 Referências

- [AWS CLI Installation](https://aws.amazon.com/cli/)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
