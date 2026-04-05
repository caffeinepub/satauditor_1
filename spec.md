# SatAuditor

## Current State

O backend (`src/backend/main.mo`) já possui os tipos e funções de gerenciamento de clientes:
- `Client` com campos: id, name, cnpj, email, phone, address, plan, active, bitcoinAddress, walletType, createdAt, updatedAt
- `registerClient`, `editClient`, `getClient`, `getAllClients`
- `generateCkBtcAddress` — implementado como `Runtime.trap("Not yet implemented")`
- `setClientBitcoinAddress`, `getClientBitcoinAddress`
- Armazenamento in-memory com `Map` (não persistente entre upgrades)

O frontend (`ClientesPage.tsx`) usa uma lista estática `initialClientes` hardcoded no componente. As chamadas ao backend existem apenas para `setClientBitcoinAddress` e `generateCkBtcAddress`, mas `registerClient`, `editClient`, `getAllClients` e remoção não estão integrados ao backend real.

## Requested Changes (Diff)

### Add
- Persistência estável no backend: usar `stable var` com `Map.fromIter` / `Map.toIter` via `preupgrade`/`postupgrade` para clientes não perderem dados entre upgrades
- Função `deleteClient(clientId: ClientId): async ()` no backend
- Integração ICRC-1 para consultar saldo ckBTC: nova função `getCkBtcBalance(clientId: ClientId): async Nat` que chama o ledger ckBTC via inter-canister call (ICRC-1 `icrc1_balance_of`)
- Frontend: carregar clientes do backend ao montar a página (`getAllClients`)
- Frontend: criar cliente via `registerClient` no submit do form (novo)
- Frontend: editar cliente via `editClient` no submit do form (edição)
- Frontend: excluir cliente via `deleteClient` no botão de exclusão
- Frontend: exibir saldo ckBTC ao lado do endereço de carteira (via `getCkBtcBalance`)
- Estados de loading e error handling no frontend

### Modify
- `generateCkBtcAddress`: implementar geração real usando o sub-account derivado do clientId (via ICP Management Canister e Bitcoin API)
- Backend: garantir que `Map` é stable (usar upgrade hooks)
- Frontend `ClientesPage.tsx`: substituir `initialClientes` por dados do backend; conectar todos os CRUD ao actor

### Remove
- Lista estática `initialClientes` do frontend
- IDs numéricos locais (`Date.now()`) — substituídos pelos IDs reais do backend

## Implementation Plan

1. **Backend — persistência stable**: converter `clients`, `nextClientId`, `transactions`, `nextTransactionId`, `subscriptions`, `nextSubscriptionId` para `stable var` com hooks de upgrade
2. **Backend — deleteClient**: adicionar função `deleteClient(clientId: ClientId): async ()` com verificação de permissão admin
3. **Backend — getCkBtcBalance**: adicionar função que faz inter-canister call ao ledger ckBTC mainnet (canister `mxzaz-hqaaa-aaaar-qaada-cai`) usando ICRC-1 `icrc1_balance_of` com o endereço Bitcoin do cliente como subaccount
4. **Frontend — useClientes hook**: criar `src/frontend/src/hooks/useClientes.ts` com `useQuery` para `getAllClients` e mutations para `registerClient`, `editClient`, `deleteClient`
5. **Frontend — ClientesPage**: substituir estado local pelo hook, adicionar loading states, error handling e exibição de saldo ckBTC
