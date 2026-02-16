# Atualizar IAM Role - Permitir Todos os Repositórios

## 🎯 Objetivo

Atualizar a trust policy da role `github-actions-deploy-role` para permitir que **todos os repositórios** da conta `rtsarakaki` possam assumir a role.

## 📋 Trust Policy Atualizada

A trust policy atualizada está no arquivo `trust-policy-all-repos.json`. 

**Conteúdo:**

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

## 🔧 Passo a Passo no Console AWS

1. **Acesse o Console IAM:**
   - Vá para https://console.aws.amazon.com/iam/
   - Faça login na sua conta AWS

2. **Navegue até Roles:**
   - No menu lateral esquerdo, clique em **"Roles"**
   - Procure pela role `github-actions-deploy-role`
   - Clique na role

3. **Editar Trust Policy:**
   - Na aba **"Trust relationships"**, clique no botão **"Edit trust policy"**
   - Você verá o editor JSON

4. **Substituir o Conteúdo:**
   - Selecione todo o conteúdo do JSON atual
   - Delete ou substitua pelo conteúdo do arquivo `trust-policy-all-repos.json`
   - Ou copie e cole o JSON acima

5. **Salvar:**
   - Clique em **"Update policy"**
   - Confirme a alteração

## ✅ Verificação

Após atualizar, verifique:

1. Volte para a aba **"Trust relationships"**
2. Deve mostrar: `repo:rtsarakaki/*:*` na condição
3. Todos os seus repositórios GitHub agora podem usar essa role

## 🔍 O que mudou?

**Antes:**
```json
"token.actions.githubusercontent.com:sub": "repo:rtsarakaki/keep-the-sequence:*"
```

**Depois:**
```json
"token.actions.githubusercontent.com:sub": "repo:rtsarakaki/*:*"
```

A mudança permite que qualquer repositório sob a conta `rtsarakaki` possa assumir a role, não apenas o `keep-the-sequence`.

## 📝 Notas

- O Account ID (`736638055338`) está hardcoded na policy
- O usuário GitHub (`rtsarakaki`) está hardcoded na policy
- Se precisar mudar, edite o arquivo `trust-policy-all-repos.json` antes de copiar
