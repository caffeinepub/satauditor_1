# SatAuditor

## Current State

- `AssinaturasPage.tsx` contém dois views: `AdminView` (com cards de planos + tabela de assinaturas dos clientes) e `ClientView` (mostra plano ativo do cliente logado).
- `LoginPage.tsx` é a página inicial exibida para usuários não autenticados, com painel esquerdo de marketing e painel direito de login via Internet Identity.
- Os planos Básico, Profissional e Enterprise estão definidos em `AssinaturasPage.tsx` com botão "Consultar Valores" sem ação.

## Requested Changes (Diff)

### Add
- Seção de portfólio de planos na `LoginPage.tsx`, exibida abaixo do painel de login (ou em seção separada scrollável na página inicial)
- Três cards de planos (Básico, Profissional, Enterprise) com recursos listados
- Cada card terá um botão CTA que abre o WhatsApp com link direto: `https://wa.me/5516994410284?text=Olá,%20tenho%20interesse%20no%20plano%20[Nome%20do%20Plano]%20do%20SatAuditor`
- Nenhum plano exibirá valor/preço — apenas recursos e CTA para WhatsApp

### Modify
- `AssinaturasPage.tsx` — `AdminView`: remover os cards de planos. Manter apenas a tabela de assinaturas dos clientes.
- `LoginPage.tsx`: adicionar seção de planos com portfólio completo, visível antes do login

### Remove
- Cards de planos (Básico, Profissional, Enterprise) da área administrativa (`AdminView` em `AssinaturasPage.tsx`)

## Implementation Plan

1. Modificar `AssinaturasPage.tsx`: remover os cards de planos do `AdminView`, mantendo apenas a tabela de assinaturas dos clientes com título e card.
2. Modificar `LoginPage.tsx`: adicionar uma seção completa de portfólio de planos abaixo do conteúdo atual, com os três planos, recursos, e botão CTA para WhatsApp por plano.
3. Validar build e publicar.
