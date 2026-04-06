# SatAuditor

## Current State
O backend (main.mo, 814 linhas) tem módulos completos para: clientes, transações, assinaturas, contabilidade (plano de contas + lançamentos), relatórios financeiros e audit logs. O controle de acesso por roles (admin/accountant/client) está implementado. Qualquer usuário logado pode criar perfil livremente sem aprovação.

## Requested Changes (Diff)

### Add
- Tipo `UserApprovalStatus` (`#pending | #approved | #rejected`) no main.mo
- Mapa estável `userApprovalStatus : Map<Principal, UserApprovalStatus>` no main.mo
- Função `getUserApprovalStatus() : async UserApprovalStatus` — retorna o status do caller (padrão: #pending se não existir)
- Função `approveUser(principal: Principal) : async ()` — apenas admin, define #approved
- Função `rejectUser(principal: Principal) : async ()` — apenas admin, define #rejected
- Função `getPendingUsers() : async [(Principal, UserProfile)]` — apenas admin, retorna todos os usuários com status #pending que já criaram perfil
- Ao salvar perfil (`saveCallerUserProfile`): se o usuário ainda não tiver status, definir como #pending automaticamente

### Modify
- `saveCallerUserProfile`: ao criar perfil pela primeira vez, registrar status #pending

### Remove
- Nenhum

## Implementation Plan
1. Adicionar tipo `UserApprovalStatus` após os tipos existentes no main.mo
2. Adicionar variável `var userApprovalStatus = Map.empty<Principal, UserApprovalStatus>()`
3. Modificar `saveCallerUserProfile` para registrar #pending se não houver status
4. Adicionar as 4 novas funções públicas no bloco de audit logs / final do actor
