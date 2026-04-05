# SatAuditor

## Current State
- Cadastro de clientes funcional (ClientesPage.tsx) com campos: empresa, CNPJ, email, telefone, endereço, plano, status.
- Backend (main.mo) tem tipo `Client` sem nenhum campo de carteira Bitcoin.
- Nenhuma integração Bitcoin vinculada a clientes ainda.

## Requested Changes (Diff)

### Add
- **Backend:** Campos `bitcoinAddress: ?Text` e `walletType: ?{#manual; #ckbtc}` no tipo `Client`.
- **Backend:** Função `generateCkBtcAddress(clientId)` que deriva endereço P2PKH exclusivo via API de gerenciamento do ICP (ecdsa_public_key + derivation path por clientId).
- **Backend:** Função `setClientBitcoinAddress(clientId, address)` para vinculação manual.
- **Backend:** Função `getClientBitcoinAddress(clientId)` para consulta do endereço.
- **Frontend:** Seção "Carteira Bitcoin" no modal de cadastro/edição: RadioGroup entre endereço manual e gerar via ICP (ckBTC), campo de input manual, botão Gerar com resultado exibido, botão copiar.
- **Frontend:** Ícone Bitcoin colorido na tabela quando cliente tem carteira vinculada.

### Modify
- **Backend:** Tipo `Client` recebe `bitcoinAddress` e `walletType` como campos opcionais.
- **Frontend:** Interface `Cliente` e form state incluem `bitcoinAddress` e `walletType`.

### Remove
- Nada.

## Implementation Plan
1. Atualizar tipo `Client` no backend com campos opcionais de carteira.
2. Implementar `generateCkBtcAddress` via ecdsa_public_key do ICP (derivação por clientId).
3. Implementar `setClientBitcoinAddress` e `getClientBitcoinAddress`.
4. Atualizar `backend.d.ts` com novos tipos e funções.
5. Atualizar `ClientesPage.tsx`: seção de carteira no modal, ícone na tabela, botão copiar.
