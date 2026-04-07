# SatAuditor

## Current State
- Dashboard exibe gráficos de fluxo de caixa e distribuição por categoria com dados mockados (arrays estáticos hardcodados)
- Não existe aba/página dedicada para o cliente visualizar e gerir suas carteiras ckBTC ou cold/hard wallet
- O cliente só consegue ver o endereço de carteira se o admin cadastrou no módulo Clientes
- Backend já possui: `getClientBitcoinAddress`, `setClientBitcoinAddress`, `generateCkBtcAddress`, `getCkBtcBalance`
- Permissões atuais do cliente: dashboard, transacoes, relatorios, assinaturas, configuracoes

## Requested Changes (Diff)

### Add
- Nova página `CarteiraPage` acessível pelo cliente com:
  - Aba ckBTC: exibe endereço ckBTC atual, saldo em satoshis, botão para gerar novo endereço ckBTC via backend
  - Aba Cold/Hard Wallet: campo para inserir manualmente endereço Bitcoin externo (prefixos 1, 3, bc1), botão salvar
  - Exibição do saldo atual (quando disponível)
  - QR code textual do endereço para copiar fácil
  - Botão copiar endereço
- Nova rota `carteira` adicionada ao `PageName` e ao `ROLE_PERMISSIONS` para cliente, contador e admin
- Item de navegação "Carteira" na sidebar com ícone Wallet

### Modify
- `DashboardPage.tsx`: substituir `cashFlowData` e `categoryData` mockados por dados calculados a partir das transações reais já carregadas do backend
  - Fluxo de caixa: agrupar transações reais por mês (últimos 6 meses), somando receitas e despesas
  - Distribuição por categoria: agrupar transações por `category` (revenue, expense, asset, liability, equity)
- `permissions.ts`: adicionar `carteira` às permissões de client, accountant e admin
- `App.tsx`: registrar nova rota `carteira` e renderizar `CarteiraPage`
- `AppLayout.tsx`: adicionar item de navegação "Carteira" com ícone Wallet

### Remove
- Arrays `cashFlowData` e `categoryData` estáticos do `DashboardPage.tsx`

## Implementation Plan
1. Criar `src/frontend/src/pages/CarteiraPage.tsx` com as abas ckBTC e Cold Wallet
2. Atualizar `permissions.ts` — adicionar `carteira` para client, accountant, admin
3. Atualizar `App.tsx` — registrar `PageName` carteira e renderizar `CarteiraPage`
4. Atualizar `AppLayout.tsx` — adicionar nav item Carteira
5. Atualizar `DashboardPage.tsx` — calcular dados dos gráficos a partir das transações reais
