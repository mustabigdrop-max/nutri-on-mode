## Portar NutriPlan Elite → Painel do Coach (`/coach/plano-alimentar`)

### Contexto
- A página do coach usa `src/components/coach/PlanoAlimentarIA.tsx` (5299 linhas) chamando a edge function `generate-coach-meal-plan` (4142 linhas) — totalmente separada do `MealPlanPage.tsx` do paciente.
- Nada do NutriPlan Elite (Fases 1–5) foi portado para o lado do coach.

### Escopo (5 fases espelhando o paciente)

**Fase A — Backend `generate-coach-meal-plan`**
1. Aceitar `compostos_ativos[]` + `perfil_pca` + `workout_schedule` no payload (vindos do form do coach).
2. Calcular `tdee_bruto` (Katch-McArdle se `body_fat_pct`, senão Mifflin) e aplicar multiplicadores farmacológicos (GH-secretagogos, GLP-1, AAS, SLU-PP-332, Cardarine, BPC/TB-500) — mesma tabela da Fase 1 do paciente.
3. Reescrever system prompt para o PhD NutriPlan Elite (6 dimensões + crononutrição + alimentos brasileiros + medidas caseiras).
4. Enriquecer cada refeição com `funcao_metabolica`, `janela_metabolica`, `medida_caseira`, `protocolo_peri_workout`, `mensagem_mce`, `insights_ia`.
5. Manter retrocompatibilidade do shape antigo para não quebrar o que já renderiza.

**Fase B — Form do coach (`PlanoAlimentarIA.tsx`)**
- Novo bloco "Compostos Ativos" (multi-select Dr. VERTEX) já mapeado para o paciente quando o coach gera o plano.
- Header do plano: `TDEE Bruto X → Ajustado Y (+Z% por [composto])` + breakdown.

**Fase C — Visualização**
- Reusar componentes já criados: `<CircadianTimeline>`, `<ExpandableMealCard>`, `<Glut4SyncCard>` na renderização do plano gerado.
- Selector de dia + injeção de `trainingMap` a partir do `workout_schedule` do paciente.

**Fase D — Modos especiais + Aderência + PDF**
- Toolbar com seletor de modo (Competição peak week / GLP-1 / Feminino com fase do ciclo + RED-S alerts).
- Botão **📊 Aderência** abrindo `<AdherenceModal>` com dados do paciente selecionado (não do coach logado).
- Botão **📄 PDF** usando `mealPlanPdf.ts` com header "Prescrito por [Coach] para [Paciente]".

**Fase E — GLUT-4 + adaptação PCA**
- `Glut4SyncCard` montado quando o paciente tem treino no dia.
- Tom/densidade/CTAs adaptados ao `perfil_pca` selecionado no form do coach.

### Arquivos impactados
- `supabase/functions/generate-coach-meal-plan/index.ts` (Fase A)
- `src/components/coach/PlanoAlimentarIA.tsx` (Fases B–E)
- Reuso direto: `CircadianTimeline.tsx`, `ExpandableMealCard.tsx`, `Glut4SyncCard.tsx`, `AdherenceModal.tsx`, `mealPlanPdf.ts`, `trainingDayMap.ts`

### Detalhes técnicos
- Modelo IA: `google/gemini-2.5-pro` via Lovable AI Gateway (mantém atual).
- Sem migração de DB nesta fase.
- Coach passa `patient_user_id` para que `AdherenceModal` e `workout_schedule` consultem o usuário correto (RLS já permite via `coach_profile_id`).
- Fallbacks: se a IA não retornar campos novos, derivar `tdee_ajustado = tdee_bruto` e `breakdown = []` (igual ao paciente).

### Como executar
Vou implementar em **2 entregas grandes**:
1. **Entrega 1**: Fases A + B (backend completo + form com Compostos Ativos + header TDEE).
2. **Entrega 2**: Fases C + D + E (UI Elite, modos especiais, aderência, PDF, GLUT-4, PCA).

Confirma para começar pela Entrega 1?
