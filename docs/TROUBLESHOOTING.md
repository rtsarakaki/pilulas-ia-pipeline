# Troubleshooting

Este documento contém soluções para problemas comuns encontrados durante o desenvolvimento e deployment do projeto.

## 🔌 Problemas de Conexão WebSocket

### Erro: "WebSocket connection failed"

**Sintomas:**
- Frontend não consegue conectar ao WebSocket
- Mensagem de erro no console do navegador

**Soluções:**

1. **Verificar URL do WebSocket:**
   ```bash
   # No backend, após deploy
   serverless info --stage dev
   ```
   Certifique-se de que `NEXT_PUBLIC_WS_URL` no frontend está correto.

2. **Verificar se API Gateway está ativo:**
   ```bash
   aws apigatewayv2 get-apis --query 'Items[?contains(Name, `tic-tac-toe`)].{Name:Name,ApiEndpoint:ApiEndpoint}'
   ```

3. **Verificar CORS (se aplicável):**
   - WebSocket API não requer CORS, mas verifique se não há bloqueios no navegador

4. **Verificar logs do CloudWatch:**
   ```bash
   aws logs tail /aws/lambda/tic-tac-toe-backend-dev-connect --follow
   ```

### Erro: "Connection timeout"

**Soluções:**

1. Verificar se a região AWS está correta
2. Verificar se há problemas de rede/firewall
3. Verificar se o API Gateway tem permissões corretas

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

### Erro: "Resource already exists" no Serverless

**Sintomas:**
- Deploy falha porque recurso já existe
- Conflito de nomes

**Soluções:**

1. **Remover stack anterior:**
   ```bash
   cd backend
   serverless remove --stage dev
   ```

2. **Verificar recursos órfãos:**
   ```bash
   # DynamoDB tables
   aws dynamodb list-tables
   
   # Lambda functions
   aws lambda list-functions --query 'Functions[?contains(FunctionName, `tic-tac-toe`)].FunctionName'
   
   # API Gateways
   aws apigatewayv2 get-apis --query 'Items[?contains(Name, `tic-tac-toe`)].ApiId'
   ```

3. **Remover manualmente se necessário:**
   ```bash
   # Remover tabela DynamoDB
   aws dynamodb delete-table --table-name tic-tac-toe-backend-games-dev
   
   # Remover Lambda
   aws lambda delete-function --function-name tic-tac-toe-backend-dev-connect
   ```

### Erro: "Insufficient permissions" no Lambda

**Sintomas:**
- Lambda não consegue acessar DynamoDB
- Erro "AccessDeniedException"

**Soluções:**

1. **Verificar IAM Role da Lambda:**
   ```bash
   aws lambda get-function --function-name tic-tac-toe-backend-dev-connect --query 'Configuration.Role'
   ```

2. **Verificar políticas anexadas:**
   - A role deve ter permissões para DynamoDB e API Gateway
   - Verifique o `serverless.yml` seção `iam.role.statements`

3. **Atualizar permissões:**
   ```bash
   cd backend
   serverless deploy function -f connect --stage dev
   ```

## 🎮 Problemas no Jogo

### Movimentos não são processados

**Sintomas:**
- Clicar em células não faz nada
- Tabuleiro não atualiza

**Soluções:**

1. **Verificar console do navegador:**
   - Abra DevTools (F12)
   - Verifique erros no console
   - Verifique mensagens WebSocket na aba Network

2. **Verificar se é o turno do jogador:**
   - O frontend deve desabilitar células quando não é o turno
   - Verifique a lógica em `Board.tsx`

3. **Verificar logs do Lambda:**
   ```bash
   aws logs tail /aws/lambda/tic-tac-toe-backend-dev-game --follow
   ```

4. **Verificar estado no DynamoDB:**
   ```bash
   aws dynamodb scan --table-name tic-tac-toe-backend-games-dev
   ```

### Jogadores não se conectam à mesma sala

**Sintomas:**
- Dois jogadores não conseguem jogar juntos
- Cada um fica esperando

**Soluções:**

1. **Verificar lógica de matchmaking:**
   - A função `connect.js` deve buscar salas com status "waiting"
   - Verifique o scan no DynamoDB

2. **Verificar tabela de conexões:**
   ```bash
   aws dynamodb scan --table-name tic-tac-toe-backend-connections-dev
   ```

3. **Verificar se há múltiplas instâncias:**
   - Certifique-se de que há apenas uma instância do backend rodando

### Jogo não detecta vitória/empate

**Sintomas:**
- Jogo continua após vitória
- Empate não é detectado

**Soluções:**

1. **Verificar função `checkWinner`:**
   - Teste a lógica localmente
   - Verifique se todas as combinações estão corretas

2. **Verificar atualização do estado:**
   - Verifique se o Lambda `game.js` está atualizando o status corretamente
   - Verifique logs do CloudWatch

3. **Testar lógica localmente:**
   ```javascript
   const { checkWinner, checkDraw } = require('./lib/gameLogic');
   
   // Teste vitória
   const board1 = ['X', 'X', 'X', '', '', '', '', '', ''];
   console.log(checkWinner(board1)); // Deve retornar 'X'
   
   // Teste empate
   const board2 = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
   console.log(checkDraw(board2)); // Deve retornar true
   ```

## 🔍 Problemas de Debug

### Como ver logs em tempo real

```bash
# Logs de todas as funções
aws logs tail /aws/lambda/tic-tac-toe-backend-dev-connect --follow
aws logs tail /aws/lambda/tic-tac-toe-backend-dev-disconnect --follow
aws logs tail /aws/lambda/tic-tac-toe-backend-dev-game --follow

# Ou usando serverless
cd backend
serverless logs -f connect --tail --stage dev
serverless logs -f game --tail --stage dev
```

### Como inspecionar estado do DynamoDB

```bash
# Listar todos os jogos
aws dynamodb scan --table-name tic-tac-toe-backend-games-dev

# Listar todas as conexões
aws dynamodb scan --table-name tic-tac-toe-backend-connections-dev

# Buscar jogo específico
aws dynamodb get-item \
  --table-name tic-tac-toe-backend-games-dev \
  --key '{"gameId": {"S": "game-1234567890-abc123"}}'
```

### Como testar WebSocket manualmente

```bash
# Instalar wscat
npm install -g wscat

# Conectar
wscat -c wss://SEU_API_ID.execute-api.us-east-1.amazonaws.com/dev

# Enviar mensagem
{"action": "move", "position": 0}
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

### Erro: "WebSocket is not defined" no servidor

**Causa:** Tentando usar WebSocket no lado do servidor Next.js

**Solução:** Use apenas no cliente (componentes com `'use client'`)

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
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=tic-tac-toe-backend-dev \
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
