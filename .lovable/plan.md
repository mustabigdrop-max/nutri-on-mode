
# Sistema de Perfis Profissionais nutriON

Este é um escopo **muito grande** (9 blocos, ~15-20 arquivos novos, mudanças em ~10 existentes, 4 tabelas + RLS, novo roteamento, novo dashboard inteiro). Vou implementar **bloco por bloco**, parando após cada um para você validar antes de seguir.

⚠️ **Pontos críticos detectados antes de começar:**

1. **Já existe `coach_profiles` + role `coach` + `coach_patients` + `usePartner`** no projeto. O schema novo (`professional_*`, `user_role` em profiles) **duplica** o que já existe. Risco real de bagunçar a base.
2. **Já existe `/coach/dashboard`** funcionando. Criar `/pro/dashboard` paralelo gera dois sistemas concorrentes.
3. **Já existe `usePlanGate`** com hierarquia free/ON/ON+/ON PRO. O modelo "Coach Free 3 clientes / Coach Pro ilimitado" do Bloco 7 conflita com isso.
4. **Já existe role `aluno_coach`** — vinculação coach↔aluno já implementada via `coach_profile_id` em `profiles`.

**Recomendação forte:** em vez de criar estrutura paralela, **estender** o que existe:
- `user_role` em profiles → adicionar `professional_type` (subtipo de coach: nutritionist/personal/nutrition_coach/bodybuilding/medico)
- `professional_clients` → reusar `coach_patients`
- `/pro/dashboard` → estender `/coach/dashboard` (já existe `CoachDashboardPage.tsx`)
- Gating → reusar `usePlanGate`

## Plano de execução (faseado)

### FASE 1 — Fundação DB (Bloco 1 adaptado)
- Migration: adicionar `professional_type` em `profiles` (subtipo do coach atual: nutritionist | personal_trainer | nutrition_coach | bodybuilding_coach | medico). Default NULL.
- Migration: adicionar `unique_code` (8 chars) em `coach_profiles` para vinculação por código.
- Migration: criar tabela `professional_invites` (link único, expira em 7d).
- Migration: criar tabela `notifications` (Bloco 9 — usado por vários blocos).
- RLS: profissional vê seus convites/notificações; cliente vê suas notificações.
- **NÃO** criar `professional_clients` nem `professional_profiles` — reusar `coach_patients` + `coach_profiles`.

### FASE 2 — Cadastro com seleção de perfil (Bloco 2)
- Reescrever `AuthPage.tsx` em wizard 2 etapas: (1) escolha de perfil (6 cards), (2) form email/senha.
- Salvar `professional_type` em `raw_user_meta_data` no signup.
- Atualizar trigger `handle_new_user` para propagar `professional_type` + criar `coach_profiles` automaticamente quando profissional.
- Login: adicionar links "Cadastrar como Atleta · Profissional · Coach" que pré-selecionam o card.

### FASE 3 — Hook + roteamento (Bloco 3)
- `useUserRole()` lê `role` + `professional_type` do profile.
- `<RoleGuard>` componente que redireciona conforme role.
- Aplicar em `App.tsx`: `/dashboard` só athletes, `/coach/*` só professionals.

### FASE 4 — Dashboard Profissional (Bloco 4)
- Estender `CoachDashboardPage.tsx` (NÃO criar `/pro/dashboard` novo) com:
  - Topbar: badge colorido por `professional_type`
  - 4 cards de métricas (alunos ativos, score médio, em risco, check-ins)
  - Botões de ação rápida filtrados por `professional_type`
  - Lista de clientes com tabs/busca/score circular
  - Painel lateral slide-in do cliente (5 tabs)
  - Coluna direita de alertas
  - Gráfico de barras semana

### FASE 5 — Vínculos (Bloco 5)
- Botão "Convidar Cliente" → modal email → cria `professional_invites` → email
- Página `/convite/[code]` (pública) → aceitar → vincula em `coach_patients`
- Seção "Meu Profissional" no dashboard atleta com input de código
- Botão "Adicionar Manualmente" → busca por email/nome
- Edge function `accept-professional-invite` para fluxo transacional

### FASE 6 — Dashboard Atleta (Bloco 6)
- Adicionar seção "MEU PROFISSIONAL" em `DashboardPage` (após métricas)
- Card com profissional vinculado OU input de código
- Seção "PLANOS RECEBIDOS"

### FASE 7 — Gating profissional (Bloco 7)
- Estender `usePlanGate` com tier `coach_free` (3 clientes) vs `coach_pro` (ilimitado)
- Modal de upgrade quando coach FREE atinge 3 clientes
- Badge no topbar por plano

### FASE 8 — Perfil profissional (Bloco 8)
- Página `/pro/perfil` (ou estender `/coach/settings` existente)
- Form: dados, registro, bio, upload logo (bucket novo `professional-logos`), código + QR

### FASE 9 — Notificações (Bloco 9)
- Hook `useNotifications()`
- Dropdown no sino (topbar)
- Página `/notificacoes`
- Triggers DB para gerar notificações em eventos (convite aceito, check-in, etc)

## Detalhes técnicos

- **Visual:** reusar tokens existentes (`T.gold`, Rajdhani, Space Mono, bg #020205) já presentes em `CoachDashboardPage` e `PlanoAlimentarIA`.
- **Cor por professional_type:** mapa central em `src/lib/professionalTypes.ts` (já não existe — criar) com {color, badge, icon, label, defaultActions}.
- **Migrations:** uma por fase, com RLS completa e triggers de timestamp.
- **Edge functions novas:** `accept-professional-invite`, `link-by-code`, `send-invite-email`.
- **Compatibilidade:** todos os usuários existentes continuam funcionando — `professional_type` é NULL para quem já é coach genérico (default = coach genérico).

## Estimativa

- ~25 arquivos novos
- ~12 arquivos editados
- ~6 migrations
- ~3 edge functions
- Trabalho real de ~6-8 mensagens longas para implementar tudo

## Confirmação necessária antes de começar

1. **OK estender `coach_profiles`/`coach_patients` ao invés de criar `professional_*` paralelos?** (Recomendo fortemente — evita duplicação e mantém `usePartner`/RLS atual funcionando.)
2. **OK estender `/coach/dashboard` ao invés de criar `/pro/dashboard` paralelo?**
3. **Começo pela FASE 1 (migration) agora?** Após sua aprovação da migration, sigo direto para FASE 2 no mesmo turno.

Responda "vai" + confirme os 2 pontos acima e eu disparo a Fase 1.
