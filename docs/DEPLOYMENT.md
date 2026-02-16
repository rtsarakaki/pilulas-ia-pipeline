# Guia de Deployment

Este documento descreve o processo completo de deployment do projeto, incluindo configuração de OIDC, IAM Roles e GitHub Actions.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

1. ✅ Conta AWS configurada com credenciais
2. ✅ AWS CLI instalado e configurado
3. ✅ Serverless Framework instalado
4. ✅ Repositório GitHub criado
5. ✅ Acesso de administrador ao repositório

## 🔐 Passo 1: Configurar OIDC no GitHub

O GitHub Actions usará OIDC (OpenID Connect) para autenticar na AWS sem necessidade de armazenar credenciais.

> 💡 **Dica:** Para um guia visual passo a passo com screenshots, consulte [OIDC-SETUP.md](OIDC-SETUP.md)

### 1.1 Criar OIDC Provider na AWS (via Console)

Siga estes passos no Console da AWS:

1. **Acesse o Console IAM:**
   - Vá para https://console.aws.amazon.com/iam/
   - Faça login na sua conta AWS

2. **Navegue até Identity providers:**
   - No menu lateral esquerdo, clique em **Identity providers**
   - Clique no botão **Add provider**

3. **Configure o Provider:**
   - **Provider type:** Selecione **OpenID Connect**
   - **Provider URL:** `https://token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com`
   - Clique em **Add provider**

4. **Verificar criação:**
   - Você deve ver o provider listado com o ARN similar a:
     ```
     arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
     ```

**Nota:** O thumbprint é calculado automaticamente pelo console. Se precisar verificar o thumbprint atual, consulte: https://github.blog/changelog/2022-01-13-github-actions-update-on-oidc-based-deployments-to-aws/

### 1.2 Verificar OIDC Provider (Opcional via CLI)

Se você tiver AWS CLI configurado, pode verificar:

```bash
aws iam list-open-id-connect-providers
```

Você deve ver o provider criado com ARN similar a:
```
arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
```

## 🏗️ Passo 2: Criar IAM Role para GitHub Actions

Você tem duas opções: usar o template CloudFormation (recomendado) ou criar manualmente.

### Opção A: Usar Template CloudFormation (Recomendado) ⭐

O projeto inclui um template CloudFormation que automatiza a criação da IAM Role.

#### 2.1 Deploy do Template

```bash
cd infrastructure/cloudformation

# Deploy permitindo todas as branches
aws cloudformation create-stack \
  --stack-name github-actions-role \
  --template-body file://github-actions-role.yaml \
  --parameters ParameterKey=GitHubRepository,ParameterValue=rtsarakaki/pilulas-ia-pipeline

# Ou deploy permitindo apenas branch específica (mais seguro)
aws cloudformation create-stack \
  --stack-name github-actions-role \
  --template-body file://github-actions-role.yaml \
  --parameters \
    ParameterKey=GitHubRepository,ParameterValue=rtsarakaki/pilulas-ia-pipeline \
    ParameterKey=AllowedBranch,ParameterValue=main
```

**Substitua `rtsarakaki/pilulas-ia-pipeline` pelo seu repositório no formato `owner/repo-name`.**

#### 2.2 Obter ARN da Role

```bash
aws cloudformation describe-stacks \
  --stack-name github-actions-role \
  --query 'Stacks[0].Outputs[?OutputKey==`RoleArn`].OutputValue' \
  --output text
```

Anote este ARN - você precisará dele no GitHub Actions workflow.

Para mais detalhes, consulte [infrastructure/README.md](../infrastructure/README.md).

### Opção B: Criar Manualmente

#### 2.1 Criar Policy para a Role

Crie um arquivo `github-actions-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "logs:*",
        "iam:PassRole",
        "cloudformation:*",
        "s3:*"
      ],
      "Resource": "*"
    }
  ]
}
```

Crie a policy:

```bash
aws iam create-policy \
  --policy-name GitHubActionsDeployPolicy \
  --policy-document file://github-actions-policy.json
```

Anote o ARN da policy retornado.

#### 2.2 Criar Trust Policy

Crie um arquivo `trust-policy.json` (substitua `YOUR_GITHUB_USER` e `YOUR_REPO`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USER/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

**Substituições necessárias:**
- `ACCOUNT_ID`: Seu AWS Account ID (obtenha com `aws sts get-caller-identity`)
- `YOUR_GITHUB_USER`: Seu usuário/organização GitHub
- `YOUR_REPO`: Nome do repositório (ex: `pilulas-ia-pipeline`)

#### 2.3 Criar a Role

```bash
aws iam create-role \
  --role-name GitHubActionsDeployRole \
  --assume-role-policy-document file://trust-policy.json
```

#### 2.4 Anexar Policy à Role

```bash
aws iam attach-role-policy \
  --role-name GitHubActionsDeployRole \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/GitHubActionsDeployPolicy
```

**Substitua `ACCOUNT_ID` pelo seu Account ID.**

#### 2.5 Obter ARN da Role

```bash
aws iam get-role --role-name GitHubActionsDeployRole --query 'Role.Arn' --output text
```

Anote este ARN - você precisará dele no GitHub Actions workflow.

## 🚀 Passo 3: Configurar Secrets no GitHub

### 3.1 Adicionar Secrets

No repositório GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

1. **`AWS_REGION`**: `us-east-1`
2. **`AWS_ROLE_ARN`**: O ARN da role criada no passo 2.5

## 📝 Passo 4: Configurar GitHub Actions Workflow

O workflow já deve estar configurado em `.github/workflows/deploy.yml`. Verifique se contém:

- Configuração de OIDC
- Assumção da role AWS
- Deploy do backend com Serverless Framework
- Build e deploy do frontend

## 🔧 Passo 5: Deploy Manual (Primeira Vez)

Antes de usar GitHub Actions, faça um deploy manual para testar:

### 5.1 Deploy do Backend

```bash
cd backend
npm install
serverless deploy --stage dev
```

**Anote a URL do WebSocket retornada.** Ela será algo como:
```
wss://abc123.execute-api.us-east-1.amazonaws.com/dev
```

### 5.2 Configurar Frontend

Atualize `frontend/.env.local`:

```bash
cd ../frontend
echo "NEXT_PUBLIC_WS_URL=wss://abc123.execute-api.us-east-1.amazonaws.com/dev" > .env.local
```

### 5.3 Testar Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste a conexão WebSocket.

### 5.4 Deploy do Frontend

**Opção 1: Vercel (Recomendado)**

```bash
npm install -g vercel
vercel
```

Siga as instruções e adicione a variável de ambiente `NEXT_PUBLIC_WS_URL`.

**Opção 2: Build Estático**

```bash
npm run build
npm run start
```

## 🤖 Passo 6: Deploy via GitHub Actions

### 6.1 Fazer Commit e Push

```bash
git add .
git commit -m "feat: initial deployment setup"
git push origin develop
```

### 6.2 Executar Workflow

1. Vá para **Actions** no GitHub
2. Selecione o workflow **Deploy**
3. Clique em **Run workflow**
4. Selecione a branch `develop`
5. Clique em **Run workflow**

### 6.3 Monitorar Deployment

Acompanhe os logs do workflow. O deployment deve:
1. ✅ Configurar OIDC
2. ✅ Assumir role AWS
3. ✅ Deploy do backend
4. ✅ Obter URL do WebSocket
5. ✅ Build do frontend
6. ✅ Deploy do frontend

### 6.4 Obter URL do WebSocket

Após o deploy, o workflow deve outputar a URL do WebSocket. Use-a para atualizar o frontend.

## ✅ Passo 7: Verificação Pós-Deployment

### 7.1 Verificar Recursos AWS

```bash
# Listar Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `tic-tac-toe`)].FunctionName'

# Listar API Gateways
aws apigatewayv2 get-apis --query 'Items[?contains(Name, `tic-tac-toe`)].Name'

# Listar DynamoDB tables
aws dynamodb list-tables --query 'TableNames[?contains(@, `tic-tac-toe`)]'
```

### 7.2 Testar WebSocket

Use uma ferramenta como `wscat`:

```bash
npm install -g wscat
wscat -c wss://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev
```

Envie uma mensagem de teste:
```json
{"action": "connect"}
```

### 7.3 Testar Aplicação

1. Abra a aplicação em dois navegadores diferentes
2. Verifique se ambos conectam
3. Faça uma jogada em um navegador
4. Verifique se o outro navegador atualiza

## 🔄 Passo 8: Atualizações Futuras

Para atualizar o projeto:

1. Faça alterações no código
2. Commit e push para `develop`
3. O workflow executará automaticamente (se configurado)
4. Ou execute manualmente via GitHub Actions

## 🗑️ Passo 9: Remover Recursos (Se Necessário)

### 9.1 Remover Backend

```bash
cd backend
serverless remove --stage dev
```

### 9.2 Remover IAM Role

```bash
aws iam detach-role-policy \
  --role-name GitHubActionsDeployRole \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/GitHubActionsDeployPolicy

aws iam delete-role --role-name GitHubActionsDeployRole
```

### 9.3 Remover OIDC Provider

```bash
aws iam delete-open-id-connect-provider \
  --open-id-connect-provider-arn arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
```

## 📊 Troubleshooting

### Erro: "Role cannot be assumed"

- Verifique se o OIDC provider está criado
- Verifique se a trust policy está correta
- Verifique se o repositório no GitHub corresponde ao configurado

### Erro: "Access Denied"

- Verifique se a policy está anexada à role
- Verifique se as permissões na policy são suficientes

### Erro: "WebSocket connection failed"

- Verifique se o API Gateway foi criado
- Verifique se a URL está correta
- Verifique os logs do CloudWatch

### Erro no Deploy do Serverless

- Verifique as credenciais AWS
- Verifique se todas as dependências estão instaladas
- Verifique os logs do CloudFormation

## 📚 Referências

- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Serverless Framework AWS](https://www.serverless.com/framework/docs/providers/aws)
- [AWS API Gateway WebSocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
