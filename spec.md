# SatAuditor

## Current State
AssinaturasPage usa dois arrays de mock data estáticos:
- `assinaturas` (array hardcoded com 6 clientes fictícios) — exibido na tabela admin.
- `clientPlanId` hardcoded como `"profissional"` para a view do cliente.

O backend já expõe:
- `getAllSubscriptions()` → `Promise<Array<Subscription>>`
- `getSubscriptionByClientId(clientId)` → `Promise<Subscription | null>`
- `getClient(clientId)` → `Promise<Client | null>`

Os tipos relevantes:
- `Subscription.plan: PlanType` (enum: `basic`, `professional`, `enterprise`)
- `Subscription.status: SubscriptionStatus` (enum: `active`, `inactive`, `suspended`)
- `Subscription.startDate: Time` (bigint, nanoseconds)
- `Client.plan: PlanType`

## Requested Changes (Diff)

### Add
- Carregar lista de assinaturas reais via `getAllSubscriptions()` (view admin).
- Para admin: cruzar `subscription.clientId` com `getAllClients()` para exibir o nome do cliente na tabela.
- Para cliente: carregar `getSubscriptionByClientId(profile.clientId)` e exibir dados reais (plano, status, startDate, renovação estimada).
- Estados de loading (skeleton) e empty state ("Nenhuma assinatura encontrada") quando backend retornar vazio.

### Modify
- Remover array mock `assinaturas` e a variável `clientPlanId` hardcoded.
- Substituir renderização da tabela por dados do backend.
- Adaptar mapeamento de `PlanType` enum → nome display e `SubscriptionStatus` → badge.
- Calcular renovação estimada a partir de `startDate + 1 ano` (Time é bigint nanoseconds).

### Remove
- Interface `AssinaturaCliente` (será substituída pelos tipos do backend).
- Array `assinaturas` hardcoded.
- Constante `clientPlanId = "profissional"` hardcoded.

## Implementation Plan
1. Criar helpers para mapear `PlanType` → nome/cor e `SubscriptionStatus` → badge.
2. Hook/query para `getAllSubscriptions()` + `getAllClients()` (admin).
3. Hook/query para `getSubscriptionByClientId(clientId)` (cliente).
4. Adaptar view admin: tabela com dados reais, skeleton, empty state.
5. Adaptar view cliente: card com dados reais, skeleton, empty state.
6. Usar `useActor()` + `@tanstack/react-query` para as queries (padrão do projeto).
