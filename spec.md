# SatAuditor

## Current State
Novo projeto sem arquivos de aplicação existentes.

## Requested Changes (Diff)

### Add
- Sistema completo de autenticação com login via Internet Identity
- Gerenciamento de clientes (empresas) com CRUD completo
- Motor contábil: registro e classificação de transações Bitcoin/ckBTC
- Plano de contas automático com categorias contábeis
- Relatórios financeiros automáticos: Balanço Patrimonial, DRE, Fluxo de Caixa
- Auditoria automática com rastreabilidade de cada transação on-chain
- Dashboard com gráficos e métricas em tempo real
- Histórico completo de transações com filtros
- Gestão de assinaturas/planos de serviço (sem preços fixos por enquanto)
- Conciliação financeira automática
- Notificações de auditoria e alertas
- Interface 100% em português

### Modify
- N/A (novo projeto)

### Remove
- N/A (novo projeto)

## Implementation Plan

### Backend (Motoko)
- Actor principal com autenticação por Principal ICP
- Módulo de clientes: cadastro, edição, listagem de empresas
- Módulo de transações: registro, classificação, categorização Bitcoin/ckBTC
- Módulo contábil: plano de contas, lançamentos, regras contábeis
- Módulo de relatórios: geração de Balanço, DRE, Fluxo de Caixa
- Módulo de auditoria: log imutável de eventos, rastreabilidade
- Gestão de planos/assinaturas por usuário
- Funções de consulta para gráficos e métricas do dashboard

### Frontend (React + TypeScript)
- Tela de login com Internet Identity
- Dashboard principal com métricas, gráficos e resumo financeiro
- Módulo de Clientes: listagem, cadastro, detalhes de cada empresa
- Módulo de Transações: registro manual, listagem com filtros, categorização
- Módulo Contábil: visualização do plano de contas, lançamentos
- Módulo de Relatórios: Balanço Patrimonial, DRE, Fluxo de Caixa com gráficos
- Módulo de Auditoria: log de eventos, rastreabilidade, alertas
- Módulo de Assinaturas: gestão de planos do cliente
- Navegação lateral completa
- Todos os textos e labels em português
