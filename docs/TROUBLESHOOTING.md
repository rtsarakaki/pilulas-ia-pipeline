# Troubleshooting

Este documento contém soluções para problemas comuns encontrados durante o desenvolvimento e deployment do projeto.

## 🔌 Problemas de Conexão REST API

### Erro: "Failed to fetch todos"

**Sintomas:**
- Frontend não consegue conectar à API REST
- Mensagem de erro no console do navegador (CORS, 404, etc.)

**Soluções:**

1. **Verificar URL da API:**
   ```bash
   # No backend, após deploy
   npx serverless info --stage dev
   ```
   Certifique-se de que `NEXT_PUBLIC_API_URL` no frontend está correto.

2. **Verificar se API Gateway está ativo:**
   ```bash
   aws apigateway get-rest-apis --query 'items[?contains(name, `todo-list`)].{Name:name,Id:id}'
   ```

3. **Verificar CORS:**
   - Certifique-se de que o API Gateway tem CORS configurado
   - Verifique se o frontend está usando a URL correta

4. **Verificar logs do CloudWatch:**
   ```bash
   aws logs tail /aws/lambda/todo-list-backend-dev-getTodos --follow
   ```

### Erro: "CORS policy" ou "Connection timeout"

**Soluções:**

1. Verificar se a região AWS está correta
2. Verificar se há problemas de rede/firewall
3. Verificar se o API Gateway tem permissões corretas
4. Verificar configuração de CORS no serverless.yml

## 🚀 Problemas de Deployment

### Erro: "Access Denied" no GitHub Actions

**Sintomas:**
- Workflow falha com erro de permissão
- Mensagem sobre não poder assumir role

**Soluções:**

1. **Verificar OIDC Provider:**
   ```bash
   aws iam list-open-id-connect-providers
   ```
   Deve retornar o provider do GitHub.

2. **Verificar Trust Policy da Role:**
   ```bash
   aws iam get-role --role-name GitHubActionsDeployRole --query 'Role.AssumeRolePolicyDocument'
   ```
   Verifique se o `sub` corresponde ao seu repositório:
   ```
   "repo:SEU_USUARIO/SEU_REPO:*"
   ```

3. **Verificar Secrets no GitHub:**
   - Vá em Settings → Secrets → Actions
   - Confirme que `AWS_ROLE_ARN` está configurado corretamente
   - O ARN deve ser completo: `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsDeployRole`

4. **Verificar Permissões da Policy:**
   ```bash
   aws iam get-policy --policy-arn arn:aws:iam::ACCOUNT_ID:policy/GitHubActionsDeployPolicy
   aws iam get-policy-version --policy-arn arn:aws:iam::ACCOUNT_ID:policy/GitHubActionsDeployPolicy --version-id v1
   ```

### Erro: "No version found for 3" no `serverless deploy`

**Sintomas:**
- Workflow falha no passo `Run serverless deploy --stage dev`
- Mensagem: `No version found for 3`

**Causa provável:**
- O projeto está com `frameworkVersion` 3.x, mas o pipeline instalou Serverless CLI mais novo (v4), que não resolve corretamente a versão `3` em alguns cenários.

**Soluções:**

1. **Fixar Serverless v3 no ambiente local (se usar instalação global):**
   ```bash
   npm install -g serverless@3
   serverless --version
   ```

2. **Preferir a CLI local do projeto no CI/CD:**
   ```bash
   cd backend
   npm ci
   npx serverless deploy --stage dev
   ```

3. **No workflow, evitar `npm install -g serverless` sem versão:**
   - Use `npx serverless ...` após instalar as dependências do backend
   - Ou, se precisar global, use explicitamente `npm install -g serverless@3`

### Erro: "Resource already exists" no Serverless

**Sintomas:**
- Deploy falha porque recurso já existe
- Conflito de nomes

**Soluções:**

1. **Remover stack anterior:**
   ```bash
   cd backend
   npx serverless remove --stage dev
   ```

2. **Verificar recursos órfãos:**
   ```bash
   # DynamoDB tables
   aws dynamodb list-tables
   
   # Lambda functions
   aws lambda list-functions --query 'Functions[?contains(FunctionName, `todo-list`)].FunctionName'
   
   # API Gateways
   aws apigateway get-rest-apis --query 'items[?contains(name, `todo-list`)].id'
   ```

3. **Remover manualmente se necessário:**
   ```bash
   # Remover tabela DynamoDB
   aws dynamodb delete-table --table-name todo-list-backend-todos-dev
   
   # Remover Lambda
   aws lambda delete-function --function-name todo-list-backend-dev-getTodos
   ```

### Erro: "Insufficient permissions" no Lambda

**Sintomas:**
- Lambda não consegue acessar DynamoDB
- Erro "AccessDeniedException"

**Soluções:**

1. **Verificar IAM Role da Lambda:**
   ```bash
   aws lambda get-function --function-name todo-list-backend-dev-getTodos --query 'Configuration.Role'
   ```

2. **Verificar políticas anexadas:**
   - A role deve ter permissões para DynamoDB e API Gateway
   - Verifique o `serverless.yml` seção `iam.role.statements`

3. **Atualizar permissões:**
   ```bash
   cd backend
   npx serverless deploy function -f getTodos --stage dev
   ```

## 📝 Problemas na Todo List

### Todos não são carregados

**Sintomas:**
- Lista de todos não aparece
- Erro ao buscar todos

**Soluções:**

1. **Verificar console do navegador:**
   - Abra DevTools (F12)
   - Verifique erros no console
   - Verifique requisições HTTP na aba Network

2. **Verificar se a API está respondendo:**
   - Teste a API diretamente com curl ou Postman
   - Verifique se o endpoint está correto

3. **Verificar logs do Lambda:**
   ```bash
   aws logs tail /aws/lambda/todo-list-backend-dev-getTodos --follow
   ```

4. **Verificar estado no DynamoDB:**
   ```bash
   aws dynamodb scan --table-name todo-list-backend-todos-dev
   ```

### Todos não são criados/atualizados/deletados

**Sintomas:**
- Ações de criar, atualizar ou deletar não funcionam
- Erro 400 ou 500 na API

**Soluções:**

1. **Verificar payload da requisição:**
   - Verifique se o body está no formato correto
   - Verifique se todos os campos obrigatórios estão presentes

2. **Verificar logs do Lambda:**
   ```bash
   aws logs tail /aws/lambda/todo-list-backend-dev-createTodo --follow
   aws logs tail /aws/lambda/todo-list-backend-dev-updateTodo --follow
   aws logs tail /aws/lambda/todo-list-backend-dev-deleteTodo --follow
   ```

3. **Verificar permissões do DynamoDB:**
   - Certifique-se de que a Lambda tem permissões para PutItem, UpdateItem, DeleteItem

## 🔍 Problemas de Debug

### Como ver logs em tempo real

```bash
# Logs de todas as funções
aws logs tail /aws/lambda/todo-list-backend-dev-getTodos --follow
aws logs tail /aws/lambda/todo-list-backend-dev-createTodo --follow
aws logs tail /aws/lambda/todo-list-backend-dev-updateTodo --follow
aws logs tail /aws/lambda/todo-list-backend-dev-deleteTodo --follow

# Ou usando serverless
cd backend
npx serverless logs -f getTodos --tail --stage dev
npx serverless logs -f createTodo --tail --stage dev
```

### Como inspecionar estado do DynamoDB

```bash
# Listar todos os todos
aws dynamodb scan --table-name todo-list-backend-todos-dev

# Buscar todo específico
aws dynamodb get-item \
  --table-name todo-list-backend-todos-dev \
  --key '{"id": {"S": "todo-1234567890-abc123"}}'
```

### Como testar API REST manualmente

```bash
# Obter URL da API
API_URL=$(aws apigateway get-rest-apis --query 'items[?contains(name, `todo-list`)].id' --output text)
API_URL="https://${API_URL}.execute-api.us-east-1.amazonaws.com/dev"

# Listar todos
curl -X GET "${API_URL}/todos"

# Criar todo
curl -X POST "${API_URL}/todos" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test todo", "completed": false}'
```

## 🐛 Problemas Comuns de Código

### Erro: "Cannot read property of undefined"

**Causa comum:** Acesso a propriedades antes de verificar se existem

**Solução:**
```javascript
// ❌ Ruim
const player = game.Item.player1;

// ✅ Bom
const player = game.Item?.player1;
if (!player) {
  return { statusCode: 404 };
}
```

### Erro: "fetch is not defined" no servidor

**Causa:** Tentando usar fetch sem configuração adequada no servidor Next.js

**Solução:** Use apenas no cliente (componentes com `'use client'`) ou configure fetch adequadamente no servidor

### Erro: "Module not found"

**Causa:** Dependências não instaladas ou caminhos incorretos

**Solução:**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoramento e Métricas

### Verificar métricas do API Gateway

```bash
API_ID=$(aws apigateway get-rest-apis --query 'items[?contains(name, `todo-list`)].id' --output text)
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=todo-list-backend-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Verificar custos

- Acesse AWS Cost Explorer
- Filtre por serviço: Lambda, API Gateway, DynamoDB
- Verifique uso de recursos

## 🆘 Ainda com Problemas?

1. **Verifique a documentação:**
   - [SETUP.md](SETUP.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)

2. **Consulte logs:**
   - CloudWatch Logs
   - Console do navegador
   - GitHub Actions logs

3. **Verifique recursos AWS:**
   - Certifique-se de que todos os recursos foram criados
   - Verifique permissões IAM
   - Verifique limites de conta AWS

4. **Recrie do zero:**
   - Siga o guia [WORKSHOP.md](WORKSHOP.md) novamente
   - Remova todos os recursos antes de recriar
