# SatAuditor

## Current State
LoginPage.tsx tem uma seção de planos com 3 cards (Básico, Profissional, Enterprise) abaixo do painel de login. A landing page não apresenta uma descrição clara sobre o que o aplicativo faz — o visitante precisa inferir. A hero section está no painel esquerdo do split-layout do login, não em uma seção independente.

## Requested Changes (Diff)

### Add
- Seção hero/descritiva no topo da landing page (antes do split de login) explicando claramente o que é o SatAuditor: contabilidade e auditoria descentralizada para PMEs brasileiras, com Bitcoin nativo.
- Plano único "Para Empresas" — card grande, centralizado e destacado com todos os 9 benefícios listados pelo usuário.

### Modify
- Remover os 3 planos (Básico, Profissional, Enterprise) e substituir por um único plano "Para Empresas".
- Seção de planos: título e subtítulo ajustados para plano único.
- O botão do plano mantém o link WhatsApp com mensagem adequada.

### Remove
- Array `planosLanding` com 3 entradas — substituído por objeto único.
- Interface `PlanInfo` e mapeamento — substituído por componente estático do plano único.

## Implementation Plan
1. Adicionar seção hero descritiva no topo da page (antes do split login/hero panel)
2. Reescrever a seção de planos com card único centralizado e destacado
3. Ajustar imports removendo ícone `Crown` se não mais usado
