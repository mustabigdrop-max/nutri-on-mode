# Módulo Feminino Específico — nutriON

Adaptações automáticas quando `profile.sex === 'F'`. Zero intervenção manual. Não altera nada para masculinos.

## Arquitetura — fonte única de verdade

Criar `src/lib/feminine.ts` — utilitários compartilhados:
- `isFeminine(profile)` — detecta sexo F
- `getCyclePhase(lastPeriodDate, cycleLength)` → `'menstrual' | 'follicular' | 'ovulatory' | 'luteal_early' | 'luteal_late'`
- `getCyclePhaseLabel(phase)` — label PT-BR + emoji + cor
- `getCycleDayCount(lastPeriodDate)` — dia atual do ciclo
- `FEMININE_CATEGORIES` — Bikini, Wellness, Figure, Women's Physique, Bikini Fitness com padrão, BF range, foco, tags
- `getFemininePhaseAdjustments(phase)` — { volumeMultiplier, rpeMax, kcalAdjust, sodiumNote, supplementNote }
- `getFeminineBodyScoreAdjustment(phase)` — +5 pts em lútea tardia
- `getFemininePhaseBanner(phase)` — texto do banner APEX

Hook já existe: `src/hooks/useFeminineProfile.ts` (feminine_profiles table com fase_ciclo, duracao_ciclo, ultima_menstruacao). Usar este como fonte. Adicionar derivação automática da fase via `getCyclePhase(profile.ultima_menstruacao, profile.duracao_ciclo)` quando data presente; fallback para `fase_ciclo` manual.

## PARTE 1 — APEX Visual Feminino

`supabase/functions/apex-visual-analyze/index.ts`:
- Aceitar novos campos no body: `sex`, `category`, `cyclePhase`, `cycleDay`
- Quando `sex === 'F'`: prepend `FEMININE_SYSTEM_PROMPT` ao system com:
  - Categorias femininas detalhadas (Bikini/Wellness/Figure/Physique/Bikini Fitness — padrão, BF ideal, foco)
  - Proporções femininas (cintura/quadril, ombro/quadril, glúteo, MMII)
  - Análise de celulite/retenção localizada com classificação
  - Postural feminino (hiperlordose, valgo bilateral, hiperpronação)
  - Shape por categoria (score 0-10, acima/abaixo padrão)
- Quando `cyclePhase === 'luteal_late'`: adicionar nota no prompt sobre retenção fisiológica

Cliente APEX (`src/components/coach/ApexVisualDashboard.tsx` e/ou `ApexVisualV3.tsx`):
- Quando atleta feminina: passar `sex`, `category` (do perfil), `cyclePhase`, `cycleDay` à edge function
- Renderizar `<FeminineCyclePhaseBanner>` no topo (novo componente `src/components/coach/FeminineCyclePhaseBanner.tsx`)
- Aplicar `getFeminineBodyScoreAdjustment` ao score exibido + tooltip "Score ajustado para fase do ciclo"
- Substituir 🏆 por ⭐ no nível máximo; gradiente rosa-dourado (lifestyle) / dourado puro (competição) via classes condicionais

## PARTE 2 — Ciclo Menstrual Integrado

Campos já existem em `feminine_profiles`. Garantir UI de cadastro:
- Verificar/criar componente de edição no perfil da atleta (provavelmente `src/pages/ProfilePage.tsx` ou no detalhe do paciente do coach)
- Seletor fase ciclo, data última menstruação, duração ciclo, tipo (regular/irregular/anticoncepcional/amenorreia)

## PARTE 3 — TrainingON Feminino

`supabase/functions/generate-training-plan/index.ts`:
- Aceitar `cyclePhase`, `category` (feminina) no profile
- Quando `sex === 'F'`: substituir bloco PROTOCOLO FEMININO atual por versão completa:
  - Regras por fase (menstrual/folicular/ovulatória/lútea) com volume %, RPE máx, foco
  - Prioridades por categoria (Bikini 60/40, Wellness 70/30, Figure 50/50)
  - Exercícios com atenção especial (Hip Thrust obrigatório, anti-valgo, evitar abdominais que aumentem cintura)

Frontend: garantir que `coachNotes`/profile inclui `cyclePhase` calculada ao chamar a função.

## PARTE 4 — NutriPlan Feminino

Identificar edge function de geração de plano alimentar (provavelmente `generate-meal-plan` / `nutriplan-elite`). Adicionar bloco feminino:
- TDEE: déficit máx 500kcal, mínimo 1400kcal
- Micros prioritários (Fe 18mg, Ca 1000mg, Mg 320mg, Folato, Ômega-3, D+K2)
- Ajustes por fase (menstrual: +Fe/Mg, -Na; lútea: +carbs 10-15%, +Mg, -cafeína)
- Proteína 1.8-2.5 g/kg

## PARTE 5 — Linguagem e UX Feminina

- Helper `feminineLabel(text, isF)` para substituições leves
- Cores: tokens novos em `index.css` — `--feminine-gold`, `--feminine-rose`, gradiente `--gradient-feminine`
- Ícone ⭐ no Body Score quando F + nível máximo
- Veredictos APEX: instrução no system prompt para tom empoderador, "reserva a reduzir" vs "excesso de gordura"

## PARTE 6 — Dashboard Coach — Visão Feminina

Novo componente `src/components/coach/FeminineCycleBadge.tsx`:
- Mostra emoji + cor da fase ao lado do nome
- Tooltip com dia do ciclo

Editar dashboard de pacientes do coach (`src/pages/CoachDashboardPage.tsx` ou `CoachPatientDetailPage.tsx`):
- Para cada paciente F com `ultima_menstruacao`: renderizar `<FeminineCycleBadge>`
- Alerta automático quando paciente F em lútea tardia E houver check-in recente: "Check-in de [nome] pode estar afetado pela fase lútea tardia — considerar antes de ajustar protocolo"
- Notificação janela ideal (dias 6-10): card no dashboard

## Arquivos a criar

```text
src/lib/feminine.ts
src/components/coach/FeminineCyclePhaseBanner.tsx
src/components/coach/FeminineCycleBadge.tsx
```

## Arquivos a editar

```text
supabase/functions/apex-visual-analyze/index.ts        (prompt feminino + categorias)
supabase/functions/generate-training-plan/index.ts     (protocolo feminino completo)
supabase/functions/generate-meal-plan/index.ts         (ajustes nutricionais femininos)
src/components/coach/ApexVisualDashboard.tsx           (passar sex/category/cycle + banner + score adj)
src/components/coach/ApexVisualV3.tsx                  (idem)
src/pages/CoachPatientDetailPage.tsx                   (badge + alertas)
src/pages/CoachDashboardPage.tsx                       (badges lista)
src/index.css                                          (tokens feminine-gold/rose)
```

## Detalhes técnicos

- Detecção sexo: ler `profiles.sex` (campo já existente, valores 'M'/'F')
- Cálculo fase: `(diffDays % cycleLength)` mapeado para faixas
- Memorizar `feminine.ts` helpers (constantes) — sem chamadas DB
- Mínima invasão: cada módulo masculino continua intocado; toda lógica gated por `isFeminine(profile)`
- Edge functions: validar fallback se campos opcionais ausentes (não quebrar masculinos)

## Escopo deste turno

Implementação completa de todos os 6 módulos em uma passada. Sem migrations (schema feminine_profiles já existe). Não alterar `src/integrations/supabase/types.ts`.
