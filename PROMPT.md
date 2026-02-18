# Prompt para IA - Recriar Projeto Jogo da Velha Local

Use este prompt para pedir a uma IA que recrie o projeto completo seguindo a documentação.

## Prompt Completo

```
Crie um novo repositório Git para o projeto "Jogo da Velha Local" seguindo EXATAMENTE o guia completo em docs/WORKSHOP.md.

Requisitos:
1. Siga TODOS os passos do WORKSHOP.md na ordem
2. Use TODOS os códigos fornecidos no documento
3. Crie TODOS os arquivos mencionados
4. Configure TODAS as dependências e ferramentas
5. Implemente a lógica do jogo completa (gameLogic.ts)
6. Implemente o hook useGame
7. Implemente o frontend completo (Next.js, componentes Board e GameStatus)
8. Configure Jest para testes com cobertura mínima de 80%
9. Crie a estrutura de diretórios conforme especificado
10. Adicione todos os arquivos de configuração (package.json, tsconfig.json, jest.config.js, tailwind.config.ts, etc.)
11. Trabalhe e faça push diretamente na branch main do novo repositório (não crie outras branches para esse fluxo)

O projeto deve estar 100% funcional e rodar localmente sem necessidade de backend.

Após criar tudo, faça commit inicial e push diretamente para origin/main.
```

## Versão Resumida

```
Siga o guia completo em docs/WORKSHOP.md para criar um novo repositório com o projeto 
Jogo da Velha Local. Use todos os códigos, configurações e instruções fornecidos no 
documento. O projeto deve incluir apenas frontend (Next.js) com lógica do jogo local, 
sem necessidade de backend. Faça push diretamente na main (sem criar outra branch).
```

## Checklist para IA

- [ ] Criar estrutura de diretórios
- [ ] Configurar .gitignore
- [ ] Criar package.json com todas as dependências
- [ ] Configurar TypeScript (tsconfig.json)
- [ ] Configurar Tailwind CSS (tailwind.config.ts, postcss.config.js)
- [ ] Configurar Next.js (next.config.js)
- [ ] Configurar Jest (jest.config.js, jest.setup.js)
- [ ] Criar tipos TypeScript (lib/types.ts)
- [ ] Implementar lógica do jogo (lib/gameLogic.ts)
- [ ] Criar hook useGame (lib/useGame.ts)
- [ ] Criar componente Board (components/Board.tsx)
- [ ] Criar componente GameStatus (components/GameStatus.tsx)
- [ ] Criar página principal (app/page.tsx, app/layout.tsx, app/globals.css)
- [ ] Adicionar documentação básica
- [ ] Fazer commit inicial e push direto na main

## Como Usar

1. Copie o prompt completo ou a versão resumida
2. Forneça à IA junto com acesso ao repositório de documentação
3. A IA seguirá o WORKSHOP.md passo a passo
4. Verifique se todos os itens do checklist foram completados
