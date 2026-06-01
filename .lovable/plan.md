
# MERIDIAN — Bloco 1 (Fundação Standalone)

Entrega o motor de engenharia reversa de prep, restrito a **atletas masculinos Enhanced**, com fluxo end-to-end testável em Classic Physique. Standalone: não depende do Sport Engine do TrainingON nem do Dr. VERTEX nesta fase (hooks ficam preparados como TODO).

## Escopo desta entrega

**Incluído:**
- Schema Supabase completo do Bloco 1 (enums + 4 tabelas + RLS + GRANTs)
- Seed de `meridian_default_parameters` para masculino Enhanced: Open BB, 212, Classic Physique, Men's Physique, Wheelchair
- Weight cap table para Classic Physique
- Edge Function `meridian-calculate-plan` (lógica determinística, sem IA narrativa ainda)
- Tipos TypeScript + helpers de cálculo reverso
- 5 componentes UI: `MeridianTrackSelector`, `MeridianCategorySelector`, `MeridianPlanBuilder` (wizard), `MeridianDashboard`, `MeridianTimeline`
- Página `/meridian` + rota
- Estética tactical: dourado queimado `#B8922A` (Enhanced), verde militar `#4B5320` (Natural, já preparado), azul-aço `#1B4965` (Lifestyle, preparado)
- Linguagem SITREP em PT-BR

**Fora do escopo (próximos blocos):**
- Feminino, Natural, Lifestyle (seeds preparados mas só Enhanced masculino navegável)
- Cycle tracker, Female Athlete Triad
- Drug test calendar, multi-show optimizer, recovery protocol pós-prova
- Integração real com NutriPlan / TrainingON / Dr. VERTEX / MCE / APEX
- IA narrativa (Gemini) nos checkpoints
- Componente `MeridianCheckpoint` (vem no Bloco 2)

## Arquitetura técnica

### Database (1 migration)

Enums:
- `biological_sex`, `athlete_track`, `bodybuilding_category`, `age_group`, `meridian_phase`, `menstrual_status` (criado já para evitar ALTER futuro)

Tabelas (com RLS + GRANTs):
- `meridian_competitions` — prova alvo
- `meridian_athlete_parameters` — perfil do atleta (PK = user_id)
- `meridian_default_parameters` — matriz sex × track × category × ageGroup (leitura pública para `authenticated`)
- `meridian_plans` — plano gerado (datas calculadas reversamente)

Tabelas adiadas para blocos seguintes: weekly_checkpoints, menstrual_cycle, triad_log, drug_tests, fitness_routine, plan_adjustments, multi_show_plans.

Seed: 5 rows masculino Enhanced + weight_cap_table JSONB para Classic Physique.

### Edge Function: `meridian-calculate-plan`

Input: `{ competition_id, athlete_params_override? }`

Pipeline determinístico:
1. Carrega atleta + competição + default_parameters
2. Determina `stage_target_weight_kg`:
   - Se weight cap (Classic Physique, 212): aplica cap por altura
   - Caso contrário: `current_weight * (1 - bf_loss_projetado)`
3. Determina `stage_target_bf_percent` = mid-range
4. Calcula semanas de Diet Phase usando taxa média do perfil
5. Calcula datas reversas: peak_week → final_sharpening → hard_cut → diet_principal → pre_prep → off_season_end → today (+ buffer)
6. Valida viabilidade (warnings se janela insuficiente)
7. Persiste em `meridian_plans` com `calculation_inputs` JSONB e `warnings[]`

Sem IA nesta fase.

### Frontend

Rota: `/meridian` (gateada por usePlanGate ≥ ON, admin bypass).

Fluxo wizard (`MeridianPlanBuilder`):
1. `MeridianTrackSelector` — 3 cards (Enhanced ativo, Natural/Lifestyle marcados "em breve")
2. `MeridianCategorySelector` — sexo biológico → categoria → age group → height (se Classic/212)
3. Form de prova (nome, federação, data, location)
4. Form de parâmetros atuais (peso, BF%, método de medição)
5. Submit → chama edge function → mostra `MeridianDashboard`

`MeridianDashboard`:
- SITREP header (status, dias até prova, fase atual)
- `MeridianTimeline` horizontal das fases com datas
- Card de stage targets
- Lista de warnings

Estética: Space Grotesk, pure black `#03030a`, accent dourado queimado `#B8922A`, micro-grain. Linguagem SITREP ("SITREP: 18 SEMANAS ATÉ PALCO", "FASE ATIVA: PRE-PREP", etc.).

## Arquivos a criar/editar

```text
supabase/migrations/<ts>_meridian_bloco1.sql       (novo)
supabase/functions/meridian-calculate-plan/index.ts (novo)
supabase/config.toml                                (+ verify_jwt = false)
src/lib/meridian/types.ts                           (novo)
src/lib/meridian/calculator.ts                      (novo - helpers reverso, weight cap)
src/lib/meridian/constants.ts                       (novo - cores por track, copy SITREP)
src/hooks/useMeridian.ts                            (novo)
src/components/meridian/MeridianTrackSelector.tsx   (novo)
src/components/meridian/MeridianCategorySelector.tsx (novo)
src/components/meridian/MeridianPlanBuilder.tsx     (novo - wizard)
src/components/meridian/MeridianDashboard.tsx       (novo)
src/components/meridian/MeridianTimeline.tsx        (novo)
src/pages/MeridianPage.tsx                          (novo)
src/App.tsx                                         (+ rota /meridian)
```

## Regras de ouro aplicadas

- Determinístico primeiro, IA depois (IA fica para Bloco 9)
- Conservadorismo nos defaults (sempre piso saudável do range)
- Buffer obrigatório (3 semanas default Enhanced)
- Decisões pesadas mostram opções, humano confirma
- Toda decisão da função loga `calculation_inputs` para auditoria
- RLS: atleta lê/escreve apenas seus dados; `meridian_default_parameters` é leitura pública para `authenticated`
- Comentários e UI em PT-BR

## Critérios de aceite do Bloco 1

1. Migration roda sem erros, todas as tabelas com RLS + GRANTs
2. Atleta masculino Classic Physique Enhanced consegue: escolher track → categoria → preencher prova/parâmetros → ver plano gerado com 7 fases, datas reversas, weight cap aplicado, warnings se viabilidade frágil
3. Edge function aceita override de parâmetros para teste rápido
4. Dashboard mostra SITREP + timeline navegável
5. Tracks Natural/Lifestyle aparecem mas marcados "em breve" (não bloqueiam UI)

## Próximos passos após aprovação

Implemento na ordem: migration → seed → edge function → tipos/helpers → componentes (parallel) → página/rota → smoke test manual.
