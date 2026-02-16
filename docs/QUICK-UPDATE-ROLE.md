# Atualização Rápida: Permitir Todos os Repositórios

## 🎯 Para sua role existente

Sua trust policy atual:
```json
"token.actions.githubusercontent.com:sub": "repo:rtsarakaki/keep-the-sequence:*"
```

**Mude para:**
```json
"token.actions.githubusercontent.com:sub": "repo:rtsarakaki/*:*"
```

## 🔧 Como Fazer (Console AWS)

1. Console IAM → Roles → `github-actions-deploy-role`
2. Aba **"Trust relationships"** → **"Edit trust policy"**
3. Altere a linha:
   ```json
   "token.actions.githubusercontent.com:sub": "repo:rtsarakaki/keep-the-sequence:*"
   ```
   Para:
   ```json
   "token.actions.githubusercontent.com:sub": "repo:rtsarakaki/*:*"
   ```
4. **"Update policy"**

## ✅ Trust Policy Completa

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::736638055338:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:rtsarakaki/*:*"
                }
            }
        }
    ]
}
```

Pronto! Agora todos os seus repositórios podem usar essa role.
