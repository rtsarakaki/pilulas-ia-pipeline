# Infrastructure as Code

Esta pasta contém os templates CloudFormation para criar a infraestrutura necessária para o projeto.

## 📁 Estrutura

```
infrastructure/
├── cloudformation/
│   └── github-actions-role.yaml  # IAM Role para GitHub Actions com OIDC
├── trust-policy-all-repos.json   # Trust policy pronta para atualizar role existente
├── ATUALIZAR-ROLE.md             # Guia para atualizar role no console
└── README.md
```

## 🚀 Atualizar Role Existente

Se você já tem uma role criada e quer atualizar para permitir todos os repositórios:

1. Abra o arquivo `trust-policy-all-repos.json`
2. Copie o conteúdo JSON
3. Siga o guia em [ATUALIZAR-ROLE.md](ATUALIZAR-ROLE.md)
4. Cole no Console AWS → IAM → Roles → sua role → Trust relationships → Edit trust policy

## 🚀 Como Usar

### Criar IAM Role para GitHub Actions

Este template cria uma IAM Role que permite ao GitHub Actions fazer deploy na AWS usando OIDC (OpenID Connect), sem necessidade de armazenar credenciais.

#### Pré-requisitos

1. **OIDC Provider do GitHub já deve estar criado na AWS.**

   Se não estiver criado, siga estes passos no Console da AWS:
   
   - Acesse https://console.aws.amazon.com/iam/
   - Vá em **Identity providers** → **Add provider**
   - Selecione **OpenID Connect**
   - **Provider URL:** `https://token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com`
   - Clique em **Add provider**
   
   Para mais detalhes, consulte [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md#passo-1-configurar-oidc-no-github).

#### Deploy do Template

```bash
cd infrastructure/cloudformation

# Opção 1: Permitir TODOS os repositórios da sua conta (mais flexível)
aws cloudformation create-stack \
  --stack-name github-actions-role \
  --template-body file://github-actions-role.yaml \
  --parameters ParameterKey=GitHubOwner,ParameterValue=rtsarakaki

# Opção 2: Permitir repositório específico
aws cloudformation create-stack \
  --stack-name github-actions-role \
  --template-body file://github-actions-role.yaml \
  --parameters \
    ParameterKey=GitHubRepository,ParameterValue=rtsarakaki/pilulas-ia-pipeline

# Opção 3: Permitir repositório específico + branch específica (mais seguro)
aws cloudformation create-stack \
  --stack-name github-actions-role \
  --template-body file://github-actions-role.yaml \
  --parameters \
    ParameterKey=GitHubRepository,ParameterValue=rtsarakaki/pilulas-ia-pipeline \
    ParameterKey=AllowedBranch,ParameterValue=main
```

#### Obter ARN da Role

Após o deploy, obtenha o ARN da role:

```bash
aws cloudformation describe-stacks \
  --stack-name github-actions-role \
  --query 'Stacks[0].Outputs[?OutputKey==`RoleArn`].OutputValue' \
  --output text
```

Este ARN deve ser adicionado como secret no GitHub:
- Nome do secret: `AWS_ROLE_ARN`
- Valor: O ARN retornado acima

#### Atualizar Stack

Se precisar atualizar a role:

```bash
aws cloudformation update-stack \
  --stack-name github-actions-role \
  --template-body file://github-actions-role.yaml \
  --parameters \
    ParameterKey=GitHubRepository,ParameterValue=rtsarakaki/pilulas-ia-pipeline \
    ParameterKey=AllowedBranch,ParameterValue=main
```

#### Remover Stack

Para remover a role e todos os recursos:

```bash
aws cloudformation delete-stack --stack-name github-actions-role
```

## 📝 Parâmetros

### GitHubOwner (Opcional)

Usuário ou organização GitHub. Se fornecido sem `GitHubRepository`, permite todos os repositórios dessa conta.

Exemplos:
- `rtsarakaki` - Todos os repositórios da conta rtsarakaki
- `minha-org` - Todos os repositórios da organização

### GitHubRepository (Opcional)

Repositório específico no formato `owner/repo-name`. Se fornecido, apenas esse repositório pode assumir a role.

Exemplos:
- `rtsarakaki/pilulas-ia-pipeline`
- `usuario/jogo-da-velha`

**Nota:** Se `GitHubOwner` e `GitHubRepository` estiverem vazios, a role permitirá todos os repositórios (não recomendado).

### AllowedBranch (Opcional)

Branch específica permitida para assumir a role. Se deixado vazio, todas as branches podem assumir a role.

Exemplos:
- `main` - Apenas branch main
- `develop` - Apenas branch develop
- (vazio) - Todas as branches

## 💡 Exemplos de Uso

### Permitir todos os repositórios da conta
```bash
ParameterKey=GitHubOwner,ParameterValue=rtsarakaki
```

### Permitir repositório específico
```bash
ParameterKey=GitHubRepository,ParameterValue=rtsarakaki/pilulas-ia-pipeline
```

### Permitir todos os repositórios, mas apenas branch main
```bash
ParameterKey=GitHubOwner,ParameterValue=rtsarakaki \
ParameterKey=AllowedBranch,ParameterValue=main
```

## 🔒 Segurança

⚠️ **Importante:** Este template usa `AdministratorAccess` para facilitar o workshop. Em produção, você deve criar uma policy customizada com apenas as permissões necessárias.

Para criar uma policy mais restrita, edite o template e substitua:

```yaml
ManagedPolicyArns:
  - arn:aws:iam::aws:policy/AdministratorAccess
```

Por uma policy customizada com apenas as permissões necessárias para:
- Lambda
- API Gateway
- DynamoDB
- CloudFormation
- CloudWatch Logs

## 📚 Referências

- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS CloudFormation](https://docs.aws.amazon.com/cloudformation/)
- [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
