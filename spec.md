# SatAuditor

## Current State
O backend (`main.mo`) possui as estruturas de dados `Transaction`, `Subscription`, `AuditLog` com seus respectivos maps estáveis, mas não expõe nenhuma função pública para consultar transações ou assinaturas. O frontend usa exclusivamente dados mock para esses módulos.

## Requested Changes (Diff)

### Add
- `getAllTransactions()` — query pública, retorna todas as transações (admin/contador). Apenas admins veem todas; usuários comuns só veem as do próprio clientId.
- `getTransactionsByClientId(clientId)` — query pública, filtra transações por cliente. Admin pode consultar qualquer clientId; usuário comum só o próprio.
- `addTransaction(tx)` — shared pública, permite admin registrar uma transação.
- `getAllSubscriptions()` — query pública, retorna todas as assinaturas (admin only).
- `getSubscriptionByClientId(clientId)` — query pública, retorna a assinatura mais recente de um cliente. Admin ou dono do client.
- `addSubscription(sub)` — shared pública, permite admin criar uma assinatura.

### Modify
- Nenhuma função existente é modificada.

### Remove
- Nada é removido.

## Implementation Plan
1. Adicionar `getAllTransactions()` com filtro por role (admin vê tudo, outros veem só o próprio clientId)
2. Adicionar `getTransactionsByClientId(clientId)` com verificação de autorização
3. Adicionar `addTransaction(tx)` para admin registrar transações
4. Adicionar `getAllSubscriptions()` para admin
5. Adicionar `getSubscriptionByClientId(clientId)` com verificação de autorização
6. Adicionar `addSubscription(sub)` para admin
7. Regenerar `backend.d.ts` via `generate_motoko_code`
