# SatAuditor

## Current State

O sistema de aprovação de usuários (Etapa A1) já foi implementado no backend com os métodos:
- `getPendingUsers()` — lista usuários pendentes
- `approveUser(principal)` — aprova um usuário
- `rejectUser(principal)` — rejeita um usuário

No frontend:
- `PendingApprovalPage.tsx` — tela para usuários aguardando aprovação (já existe e funciona)
- `RejectedPage.tsx` — tela para usuários rejeitados com link WhatsApp (já existe e funciona)
- `ApprovalPanel` — componente de aprovação está embutido em `ClientesPage.tsx` e exibido no topo dessa página quando o usuário é admin

## Requested Changes (Diff)

### Add
- Nova página `AprovacoesPage.tsx` com a sessão dedicada de gerenciamento de aprovações, contendo o `ApprovalPanel` movido do `ClientesPage`
- Nova rota/entrada no menu admin do `AppLayout.tsx` com item "Aprovações" (apenas visível para admin)
- `PageName` type atualizado para incluir `"aprovacoes"`

### Modify
- `ClientesPage.tsx` — remover o `ApprovalPanel` e o estado `isAdmin` relacionado a ele
- `AppLayout.tsx` — adicionar item de menu "Aprovações" na navegação do admin; renderizar `AprovacoesPage` quando `currentPage === "aprovacoes"`
- `App.tsx` — adicionar `aprovacoes` ao `pageComponents` e ao `PageName` type
- `src/lib/permissions.ts` — garantir que admin tem acesso à página `aprovacoes`

### Remove
- `ApprovalPanel` component de `ClientesPage.tsx`
- Estado `isAdmin` de `ClientesPage.tsx` (se usado apenas para o painel de aprovação)

## Implementation Plan

1. Criar `src/pages/AprovacoesPage.tsx` com o `ApprovalPanel` extraído do `ClientesPage`, mantendo a mesma lógica de chamadas backend (`getPendingUsers`, `approveUser`, `rejectUser`)
2. Atualizar `App.tsx`: adicionar `"aprovacoes"` ao `PageName` union e ao `pageComponents`
3. Atualizar `AppLayout.tsx`: adicionar "Aprovações" no menu lateral (visível apenas para admin), com ícone `UserCheck`, e passar a prop para renderizar a nova página
4. Atualizar `ClientesPage.tsx`: remover `ApprovalPanel` component e toda lógica relacionada a ele
5. Atualizar `lib/permissions.ts`: garantir que a role admin inclui `aprovacoes`
