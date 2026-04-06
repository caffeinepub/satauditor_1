# SatAuditor

## Current State
SatAuditor é uma plataforma de contabilidade e auditoria descentralizada para PMEs brasileiras. O backend já possui: clientes, transações, assinaturas, perfis de usuário e controle de acesso por roles. Frontend tem páginas funcionais para Dashboard, Clientes, Transações, Assinaturas e Configurações. Contabilidade e Relatórios mostram estado vazio.

## Requested Changes (Diff)

### Add
- Backend: `addChartAccount`, `editChartAccount`, `deleteChartAccount`, `getChartAccount`, `getAllChartAccounts`
- Backend: `addJournalEntry`, `getAllJournalEntries`, `getJournalEntriesByClientId`
- Backend: `getBalanceSheet`, `getIncomeStatement`, `getCashFlow` (retornam agregações por período)
- Frontend ContabilidadePage: tab Plano de Contas com tabela real + CRUD; tab Lançamentos com tabela real + formulário
- Frontend RelatoriosPage: tabs Balanço Patrimonial, DRE e Fluxo de Caixa conectados ao backend, com skeleton e empty state

### Modify
- `ContabilidadePage.tsx`: substituir empty state por tabelas reais conectadas ao backend
- `RelatoriosPage.tsx`: substituir empty state por dados reais do backend
- `backend.d.ts`: já atualizado com os novos tipos e funções

### Remove
- Empty states genéricos de Contabilidade e Relatórios (substituir por UI funcional)

## Implementation Plan
1. ContabilidadePage: tab Plano de Contas carrega `getAllChartAccounts()`, lista em tabela com código/nome/tipo/status, botão Adicionar (admin), ações editar/deletar (admin). Tab Lançamentos carrega `getJournalEntriesByClientId` ou `getAllJournalEntries` conforme role, exibe tabela com data/descrição/conta débito/conta crédito/valor, botão Novo Lançamento (admin/contador).
2. RelatoriosPage: ao selecionar mês/ano e tab, chama `getBalanceSheet`/`getIncomeStatement`/`getCashFlow` com `clientId` do perfil (ou 0 para admin), exibe tabelas com grupos e totais, skeleton de loading, empty state se sem dados.
3. Skeleton loading e empty states adequados em todos os lugares.
