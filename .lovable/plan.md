## NutriPlan Elite — Plano de execução em 4 fases

Sistema atual: `supabase/functions/generate-meal-plan/index.ts` (507 linhas) já recebe contexto do TrainingON (fase, sistema, volume, fibras, deload). Frontend: `src/pages/MealPlanPage.tsx` (1014 linhas) renderiza lista de refeições por dia. Falta as 6 dimensões NutriPlan Elite.

---

### FASE 1 — Núcleo de inteligência (executar AGORA)

**Backend (`generate-meal-plan/index.ts`):**
1. Adicionar bloco **TDEE Farmacológico**: ler `profile.active_protocol` + nova lista `compostos_ativos[]` no payload. Aplicar multiplicadores:
   - GH-secretagogos (Ipamorelin/CJC/MK-677): TDEE × 1.12–1.18
   - GLP-1 (Sema/Tirzepa/Reta): TDEE × 1.20 + flag de supressão de apetite (fracionar 6x)
   - AAS (Testo/Nandro/Oxa): proteína mínima 2.8g/kg MM
   - SLU-PP-332: TDEE × 1.35
   - Cardarine: gordura 25–30%, +10% oxidação
   - BPC-157/TB-500: +15g glutamina+glicina
2. Calcular `tdee_bruto` (Katch-McArdle se `body_fat_pct` existe, senão Mifflin) e `tdee_ajustado` com breakdown por composto.
3. Reescrever **system prompt** para o PhD NutriPlan Elite (6 dimensões, perfil PCA, crononutrição, GLUT-4 sync, alimentos brasileiros com medidas caseiras).
4. Mudar contrato JSON de retorno: `tdee_bruto`, `tdee_ajustado`, `ajuste_farmacologico_breakdown[]`, `macros_diarios`, `dias[].refeicoes[]` enriquecidas com `funcao_metabolica`, `janela_metabolica` (cortisol/insulina/gh), `medida_caseira`, `substituicoes[]`, `protocolo_peri_workout`, `mensagem_mce`, `insights_ia`.
5. Manter retrocompatibilidade: continuar emitindo o shape antigo em paralelo para não quebrar a UI atual.

**Frontend mínimo:**
- Adicionar campo "Compostos Ativos" no formulário de geração (multi-select com lista do Dr. VERTEX).
- Header do plano exibe: `TDEE Bruto X → Ajustado Y (+Z% por [composto])` quando vier no JSON novo.

### FASE 2 — Timeline circadiana + cards expandíveis (próxima msg)
- Componente `<CircadianTimeline>` horizontal 06:00–23:00 com badges metabólicos (cortisol/insulina/GH).
- Refatorar lista de refeições para cards expandíveis com função fisiológica + medida caseira.

### FASE 3 — GLUT-4 Sync + perfil PCA
- Card destacado dourado com pré/intra/pós calculado do `workout_schedule`.
- Adaptação de tom/estrutura por perfil PCA (AM/EI/SE/PP) lido do `profiles.perfil_comportamental`.
- Suplementação peri-workout integrada por composto ativo.

### FASE 4 — Dashboard de aderência + roadmap
- Aba "Evolução": gauge semanal, gráfico macros realizado vs prescrito, insights IA.
- Modos especiais: Competição (peak week), GLP-1, Feminino (ciclo).
- Export PDF premium para coach.

---

### Detalhes técnicos da Fase 1

- **Edge function**: editar in-place, sem nova função.
- **Modelo**: manter `google/gemini-2.5-pro` via Lovable AI Gateway (já configurado).
- **Banco**: nenhuma migração necessária na Fase 1 — `compostos_ativos` vai no payload da chamada (vindo do estado do form). DB schema só vira na Fase 4 (tabela de aderência se ainda não existir).
- **Token budget**: aumentar `max_tokens` do prompt; JSON retornado fica maior — usar `response_format: json_object` se possível ou fence parsing robusto já existente.
- **Fallbacks**: se IA não retornar campo novo, derivar `tdee_ajustado = tdee_bruto` e `breakdown = []` para não quebrar UI.

Pronto para executar a Fase 1?