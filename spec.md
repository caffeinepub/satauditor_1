# SatAuditor

## Current State

SatAuditor é uma plataforma de contabilidade e auditoria descentralizada para PMEs brasileiras, rodando no Internet Computer (ICP) com integração nativa ao Bitcoin/ckBTC. O app já possui:

- Landing page (LoginPage.tsx) com hero, cards de features e seção de plano "Para Empresas" com botão que abre o WhatsApp
- Fluxo de aprovação de usuários: ao criar perfil (OnboardingPage), o usuário é marcado como `#pending`. O admin vê os pendentes em AprovacoesPage e pode aprovar ou rejeitar
- PendingApprovalPage: tela exibida ao usuário pendente com link para WhatsApp do admin
- O botão "Falar no WhatsApp" na landing page abre uma conversa com mensagem pré-preenchida genérica de interesse no plano

**O que falta:** Quando o cliente clica no plano/WhatsApp na landing page, não há nenhuma ativação automática de solicitação de acesso no backend. O cliente clica, envia mensagem no WhatsApp, mas no painel de aprovações do admin nada aparece — o usuário só aparece na fila de pendentes após fazer login com Internet Identity e completar o onboarding.

## Requested Changes (Diff)

### Add
- Na landing page (LoginPage.tsx), ao clicar em "Falar no WhatsApp", salvar uma flag no `localStorage` indicando que o usuário expressou interesse (`satauditor_interest_requested = true` com timestamp)
- No OnboardingPage, após criar o perfil, verificar se essa flag existe no localStorage. Se sim: chamar `actor.saveCallerUserProfile()` normalmente — o backend já marca como `#pending` — e em seguida abrir automaticamente o WhatsApp com uma mensagem completa contendo nome, e-mail e perfil escolhido
- Atualizar a mensagem do WhatsApp na landing page para ser mais informativa: "Olá! Tenho interesse no plano Para Empresas do SatAuditor. Gostaria de saber mais sobre como contratar."
- Na PendingApprovalPage, melhorar a mensagem do WhatsApp para incluir mais contexto: "Olá! Acabei de me cadastrar no SatAuditor e estou aguardando aprovação. Meu cadastro foi feito com o e-mail: [não disponível nesta etapa]."
- Adicionar um campo de texto visível na PendingApprovalPage explicando o prazo de análise (até 24h úteis)

### Modify
- LoginPage.tsx: ao clicar no botão "Falar no WhatsApp" do plano, salvar flag no localStorage antes de abrir o WhatsApp
- OnboardingPage.tsx: após salvar perfil com sucesso, se flag de interesse existir no localStorage: limpar a flag e abrir o WhatsApp com mensagem automática contendo os dados do novo usuário (nome, e-mail, perfil)
- PendingApprovalPage.tsx: adicionar texto informativo sobre prazo de análise (24 horas úteis)

### Remove
- Nada a remover

## Implementation Plan

1. **LoginPage.tsx** — No handler do botão "Falar no WhatsApp" (dentro do card do plano), adicionar `localStorage.setItem('satauditor_interest_requested', Date.now().toString())` antes de abrir o WhatsApp. A URL do WhatsApp permanece a mesma.

2. **OnboardingPage.tsx** — Após o `await actor.saveCallerUserProfile(...)` bem-sucedido, verificar `localStorage.getItem('satauditor_interest_requested')`. Se existir:
   - Limpar a flag com `localStorage.removeItem('satauditor_interest_requested')`
   - Construir mensagem WhatsApp com: nome do usuário, e-mail, perfil escolhido
   - Abrir `window.open(whatsappUrl, '_blank')` automaticamente

3. **PendingApprovalPage.tsx** — Adicionar parágrafo informando que a análise leva até 24 horas úteis e que o usuário pode entrar em contato pelo WhatsApp caso não receba retorno dentro desse prazo.

Nenhuma mudança de backend é necessária — o fluxo de `#pending` já funciona ao salvar o perfil.
