# SatAuditor

## Current State
Acesso admin via PIN 2891. Nas Configuracoes, o PIN so salva se o usuario clicar em Salvar depois. Se nao clicar, o badge nunca atualiza para Administrador.

## Requested Changes (Diff)

### Add
- Auto-salvar perfil como admin imediatamente apos validar PIN nas Configuracoes.

### Modify
- ConfiguracoesPage.tsx: handleAdminPasswordSubmit deve chamar actor.saveCallerUserProfile com businessRole admin e invalidar query userProfile.

### Remove
- Nada.

## Implementation Plan
1. Em ConfiguracoesPage.tsx, apos PIN correto: salvar perfil via actor e invalidar query userProfile para atualizar badge na sidebar em tempo real.
