# SatAuditor

## Current State
O app tem três perfis de usuário (`admin`, `accountant`, `client`) definidos no backend via `BusinessRole`, mas o `AppLayout` exibe todos os 8 itens de navegação para qualquer perfil logado, sem nenhuma restrição. As páginas também não diferenciam conteúdo por perfil.

## Requested Changes (Diff)

### Add
- Hook/utilitário `usePermissions` que, dado o `BusinessRole` do perfil atual, retorna quais páginas são acessíveis
- Lógica de filtragem de `NAV_ITEMS` no `AppLayout` baseada no `businessRole` do `UserProfile`
- Badge de perfil no sidebar (ex: "Admin", "Contador", "Cliente") para deixar claro o nível de acesso
- Na `AssinaturasPage`: quando perfil é `client`, exibir apenas o card do plano atual do cliente (view simplificada, sem tabela de assinaturas de todos os clientes)
- Na `TransacoesPage`: quando perfil é `client`, filtrar transações pelo `clientId` do perfil (mostrar apenas as suas)

### Modify
- `AppLayout.tsx`: filtrar `NAV_ITEMS` de acordo com a matriz de permissões antes de renderizar o menu lateral
  - **admin**: vê tudo (Dashboard, Clientes, Transações, Contabilidade, Relatórios, Auditoria, Assinaturas, Configurações)
  - **accountant**: vê (Dashboard, Transações, Contabilidade, Relatórios, Auditoria, Configurações) — sem Clientes, sem Assinaturas
  - **client**: vê (Dashboard, Transações, Relatórios, Assinaturas, Configurações) — sem Clientes, Contabilidade, Auditoria
- `App.tsx`: garantir que `currentPage` inicial seja válida para o perfil do usuário (redirecionar para `dashboard` se a página atual não estiver permitida)
- `AssinaturasPage.tsx`: aceitar prop ou ler perfil via contexto para mostrar view de cliente (somente plano próprio) ou view de admin (todos + tabela)
- `TransacoesPage.tsx`: aceitar prop ou ler perfil via contexto para filtrar transações pelo cliente vinculado quando `businessRole === 'client'`

### Remove
- Nenhuma feature existente removida — apenas visibilidade condicional

## Implementation Plan
1. Criar utilitário de permissões `src/frontend/src/lib/permissions.ts` com a matriz de acesso por `BusinessRole`
2. Modificar `AppLayout.tsx` para: (a) filtrar nav items pela matriz, (b) exibir badge de perfil no rodapé do sidebar
3. Modificar `App.tsx` para: passar `profile` às páginas que precisam de contexto de perfil; garantir `currentPage` válida ao logar
4. Modificar `TransacoesPage.tsx` para aceitar `profile: UserProfile` e filtrar por `clientId` quando `businessRole === 'client'`
5. Modificar `AssinaturasPage.tsx` para aceitar `profile: UserProfile` e exibir view simplificada (plano próprio) quando `businessRole === 'client'`
6. Validar build
