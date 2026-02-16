# Guia Rápido: Criar OIDC Provider no Console AWS

Este guia mostra como criar o OIDC Provider do GitHub no Console da AWS, sem necessidade de usar AWS CLI ou credenciais locais.

## 🎯 Objetivo

Criar um Identity Provider OIDC para permitir que o GitHub Actions se autentique na AWS usando OpenID Connect, sem necessidade de armazenar credenciais.

## 📋 Pré-requisitos

- Conta AWS ativa
- Acesso ao Console AWS com permissões IAM
- Navegador web

## 🚀 Passo a Passo

### 1. Acessar o Console IAM

1. Abra seu navegador e acesse: https://console.aws.amazon.com/iam/
2. Faça login na sua conta AWS
3. Certifique-se de estar na região correta (qualquer região funciona para IAM)

### 2. Navegar até Identity Providers

1. No menu lateral esquerdo, procure por **"Access management"**
2. Clique em **"Identity providers"**
3. Você verá a lista de providers existentes (se houver)

### 3. Adicionar Novo Provider

1. Clique no botão **"Add provider"** (canto superior direito)
2. Você verá uma tela com opções de provider

### 4. Configurar o Provider

1. **Provider type:** Selecione **"OpenID Connect"**
2. **Provider URL:** Digite exatamente:
   ```
   https://token.actions.githubusercontent.com
   ```
3. Clique em **"Get thumbprint"** (o console buscará automaticamente)
4. **Audience:** Digite:
   ```
   sts.amazonaws.com
   ```
5. Clique em **"Add provider"**

### 5. Verificar Criação

Após alguns segundos, você deve ver:

- ✅ Mensagem de sucesso
- ✅ O provider listado na tabela de Identity providers
- ✅ ARN do provider (formato: `arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com`)

## ✅ Próximos Passos

Após criar o OIDC Provider, você pode:

1. **Criar a IAM Role** usando o template CloudFormation:
   ```bash
   cd infrastructure/cloudformation
   aws cloudformation create-stack \
     --stack-name github-actions-role \
     --template-body file://github-actions-role.yaml \
     --parameters ParameterKey=GitHubRepository,ParameterValue=SEU_USUARIO/SEU_REPO
   ```

2. Ou seguir o guia completo em [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔍 Verificação

Se quiser verificar se o provider foi criado corretamente:

1. Volte para **Identity providers** no Console IAM
2. Procure por `token.actions.githubusercontent.com`
3. Clique no provider para ver os detalhes
4. Verifique que o **Audience** está como `sts.amazonaws.com`

## 🆘 Problemas Comuns

### Erro: "Provider already exists"

Se você já criou o provider anteriormente, não precisa criar novamente. Pule esta etapa e vá direto para criar a IAM Role.

### Erro: "Invalid thumbprint"

- O console deve calcular o thumbprint automaticamente
- Se houver erro, verifique se a URL está correta
- O thumbprint pode mudar - consulte: https://github.blog/changelog/2022-01-13-github-actions-update-on-oidc-based-deployments-to-aws/

### Não consigo ver "Identity providers"

- Verifique se você tem permissões IAM adequadas
- Certifique-se de estar na conta AWS correta
- Tente atualizar a página

## 📚 Referências

- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS IAM Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
