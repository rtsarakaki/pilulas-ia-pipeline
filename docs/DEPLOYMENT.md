# Guia de Deployment

Este documento descreve o processo de deployment do projeto Jogo da Velha Local no Vercel.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

1. ✅ Conta GitHub ativa
2. ✅ Conta Vercel (pode criar durante o processo)
3. ✅ Repositório GitHub criado e código commitado
4. ✅ Testes passando localmente (`npm test`)
5. ✅ Build funcionando localmente (`npm run build`)

## 🚀 Deploy no Vercel

O Vercel é a plataforma recomendada para deploy de aplicações Next.js. Ele oferece:
- Deploy automático a cada push
- Preview deployments para pull requests
- HTTPS automático
- CDN global
- Domínio gratuito

### Passo 1: Criar Conta no Vercel

1. Acesse https://vercel.com
2. Clique em **Sign Up**
3. Escolha **Continue with GitHub** para conectar sua conta GitHub
4. Autorize o Vercel a acessar seus repositórios

### Passo 2: Adicionar Projeto

1. No dashboard do Vercel, clique em **Add New Project**
2. Selecione o repositório `pilulas-ia-pipeline` (ou o nome do seu repositório)
3. Configure o projeto:
   - **Framework Preset:** Next.js (deve ser detectado automaticamente)
   - **Root Directory:** `.` (raiz do projeto)
   - **Build Command:** `npm run build` (padrão do Next.js)
   - **Output Directory:** `.next` (padrão do Next.js)
   - **Install Command:** `npm install` (padrão)

### Passo 3: Configurar Variáveis de Ambiente

Como este projeto não usa variáveis de ambiente (é um app local), você pode pular esta etapa.

Se no futuro precisar adicionar variáveis:
1. Na página do projeto, vá em **Settings → Environment Variables**
2. Adicione as variáveis necessárias
3. Marque os ambientes (Production, Preview, Development)

### Passo 4: Deploy

1. Clique em **Deploy**
2. Aguarde o build completar (geralmente 1-2 minutos)
3. Após o deploy, você receberá uma URL como: `https://seu-projeto.vercel.app`

### Passo 5: Deploy Automático

Após o primeiro deploy, o Vercel configurará automaticamente:
- **Deploy automático** a cada push na branch `main`
- **Preview deployments** para pull requests
- **Domínio personalizado** (opcional, pode configurar depois)

## 🔄 Atualizar o Projeto

### Deploy Automático

Após configurar o Vercel, cada push na branch `main` fará deploy automático:

```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin main
```

O Vercel detectará o push e iniciará um novo deploy automaticamente.

### Deploy Manual

Se precisar fazer deploy manual:

1. Acesse o dashboard do Vercel
2. Vá para o projeto
3. Clique em **Deployments**
4. Clique nos três pontos ao lado do último deploy
5. Selecione **Redeploy**

## 🌐 Domínio Personalizado

### Adicionar Domínio

1. Na página do projeto, vá em **Settings → Domains**
2. Digite o domínio desejado (ex: `jogo-da-velha.com`)
3. Siga as instruções para configurar DNS

### Configurar DNS

O Vercel fornecerá instruções específicas para seu provedor de DNS. Geralmente você precisa adicionar:

- **Tipo:** CNAME
- **Nome:** @ ou www
- **Valor:** cname.vercel-dns.com

## 📊 Monitoramento

### Logs

1. Acesse o dashboard do Vercel
2. Vá para **Deployments**
3. Clique em um deploy específico
4. Veja os logs do build e runtime

### Analytics

O Vercel oferece analytics básicos:
- Visualizações de página
- Tempo de carregamento
- Erros

Para analytics avançados, considere integrar com Google Analytics ou outras ferramentas.

## 🔧 Troubleshooting

### Build Falha

Se o build falhar:

1. Verifique os logs no Vercel
2. Teste o build localmente: `npm run build`
3. Verifique se todas as dependências estão no `package.json`
4. Verifique se não há erros de TypeScript: `npm run type-check`
5. Verifique se não há erros de lint: `npm run lint`

### Erro 404

Se você receber erro 404:

1. Verifique se o arquivo `next.config.js` está correto
2. Verifique se a estrutura de diretórios está correta
3. Verifique os logs do Vercel

### Variáveis de Ambiente

Se precisar de variáveis de ambiente:

1. Vá em **Settings → Environment Variables**
2. Adicione as variáveis
3. Faça um novo deploy

**Nota:** Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente. Use com cuidado para não expor secrets.

## 📚 Referências

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git)

## 💡 Dicas

- Use **Preview Deployments** para testar mudanças antes de fazer merge
- Configure **domínio personalizado** para produção
- Monitore **logs** para identificar problemas
- Use **Analytics** para entender uso do app
