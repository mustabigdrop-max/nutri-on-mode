
# Cockpit Jarvis — Dashboard nutriON

Transformação visual completa do `/dashboard`, mantendo TODOS os hooks Supabase, cálculos de TDEE/macros/XP, rotas e componentes existentes (NutriSync, Treino, Estado Muscular, etc).

## 1. Fontes & tokens

- `index.html`: adicionar link Rajdhani 600/700 + Space Mono 400/700 (já existe Rajdhani; só garantir Space Mono e weights).
- `src/index.css`: confirmar variáveis da paleta (`--gold #B8922A`, `--cyan #00D4FF`, `--bg #020205`, `--danger #ff4444`). Já há tokens HSL equivalentes — adicionar utilitários `.font-rajdhani`, `.font-mono-tech`, `.tech-label`, classes para borders gold/cyan sutis.

## 2. JarvisCanvas (novo)

`src/components/dashboard/JarvisCanvas.tsx` — substitui o atual `JarvisBackdrop`. Single `<canvas>` fixo z-0, pointer-events none, com:

- Grade hexagonal 28px, opacity base 0.015, pulso individual + acende perto do cursor (raio 100px → 0.06).
- 100 partículas desktop / 35 mobile (75% gold, 25% cyan), conexões <60px, repel cursor (raio 80px).
- Streams verticais (15 labels técnicos) — desktop only.
- Linha tracejada centro→cursor + dot ciano — desktop only.
- Glow radial central pulsante.
- 3 anéis orbitais + radar sweep + dots orbitais — desktop; mobile só 1 anel sutil.
- Núcleo branco central com 3 camadas de glow.
- Detecção `useIsMobile` para alternar densidade; touch tracking no mobile.

## 3. Topbar cockpit

`src/components/dashboard/CockpitTopbar.tsx` — sticky 48px, blur 16px, border-bottom gold 0.18. Logo NUTRI/ON Rajdhani 20px + badge COCKPIT, nav central (Home/NutriPlan/TrainingON/LAB/Perfil) só desktop, status "SISTEMA ATIVO" + badge fase à direita. Usa Lucide, sem emojis. Substitui o header inline atual do `DashboardPage`.

## 4. Layout 3 colunas (desktop ≥768px)

`src/components/dashboard/CockpitShell.tsx` — wrapper grid `200px 1fr 175px`, gap 1px com background gold 0.06, altura `calc(100vh - 48px)`, scrollbar oculta. Mobile (<768px): flex-col empilhado, mantém `BottomNav`.

### Coluna esquerda — `CockpitLeftRail.tsx`
Perfil do atleta (nome do profile, objetivo, badge fase) + lista de métricas com mini-barras animadas:
- TDEE (`profile.vet_kcal` / `get_kcal`)
- Proteína consumida/meta (`todayTotals.protein` / `profile.protein_g`)
- Carbo idem (cyan)
- Gordura idem (danger)
- Streak (`profile.streak_days`)
- Nível + XP (`profile.level`, `profile.xp`)

### Coluna central — `CockpitMain.tsx`
- Hero (saudação + cockpit · nome)
- Anel kcal SVG 130px (reaproveita lógica do `CalorieRing` atual, redesenhado para spec) + 3 rows macros ao lado
- Macronutrientes (3 barras animadas)
- Grid 2 colunas (gap 1px gold) com cards existentes embrulhados em wrapper "cockpit card" sem border-radius:
  NutriSyncComparisonCard, fase atual, treino de hoje, NutrientTimingCard, MuscleStateCard, ConsistencyScoreCard, etc.

### Coluna direita — `CockpitRightRail.tsx`
- APEX Score (countUp 0→valor real do `MuscleStateCard`/score derivado)
- 4 mini barras (Postura, Mobilidade, Simetria, FMS) — usar valores reais quando disponíveis, senão fallback do perfil
- Diagnóstico semanal (Adesão via `ConsistencyScoreCard` data, proteína dias, peso trend via `useWeightLogs` se já presente)
- Idade biológica (`BiologicalAgeCard` data)
- Módulos ativos (PCA, NutriPlan, TrainingON, VERTEX, KAA, Microbiota) com dot pulsante
- Bottom status MCE ATIVO

## 5. Mobile

Mesma `CockpitMain` empilhada sem rails: hero → anel 110px → macros → grid 2x2 métricas rápidas → cards → diagnóstico → módulos. `BottomNav` preservado, recolorido para tokens do cockpit.

## 6. Animações de entrada (framer-motion)

Stagger: topbar (y -10, 0.4s) → left (x -20, delay .2) → center (y 10, delay .3) → right (x 20, delay .4) → barras (width, delay .6, 1.5s) → APEX countUp (delay .8, 1.8s) → ring (delay .5, 1.8s).

## 7. Interações

- Hover cards: `bg #B8922A04`, transition 0.2s.
- Hover métrica left: border-left 2px gold.
- Clique módulo right: flash gold + toast "▸ MÓDULO — ativado" 2s (sonner já importado).
- `cursor-crosshair` no shell desktop.

## 8. Preservação rigorosa

- `DashboardPage.tsx` mantém **toda** a lógica de fetch (meal_logs, protocolos, mood, water, workout), apenas troca o **JSX** por `<CockpitShell>` que recebe props com os dados já calculados.
- Componentes legados (`CoachNotificationsCard`, `AthleteCompetitionCard`, `WeightCheckInCard`, `SmartAlerts`, `TrialBanner`, `ReengagementPopup`, `MoodCheckinModal`, `SosHungerInterceptor`, `DashboardGamificationCards`, `ProactiveRecipeSuggestion`, `WeeklySabotageCard`, `EmotionalWinRateCard`) continuam montados — distribuídos entre central (cards principais) e topo do main (alerts/banners).
- Nada removido. Apenas reorganizado dentro do shell cockpit.

## Arquivos criados
```
src/components/dashboard/JarvisCanvas.tsx
src/components/dashboard/CockpitTopbar.tsx
src/components/dashboard/CockpitShell.tsx
src/components/dashboard/CockpitLeftRail.tsx
src/components/dashboard/CockpitMain.tsx
src/components/dashboard/CockpitRightRail.tsx
src/components/dashboard/cockpit/CockpitCard.tsx        (wrapper visual)
src/components/dashboard/cockpit/MiniBar.tsx
src/components/dashboard/cockpit/CountUp.tsx
src/components/dashboard/cockpit/KcalRing.tsx           (nova spec 130px)
```

## Arquivos editados
```
index.html                 — fonts Space Mono / Rajdhani weights
src/index.css              — utilitários tech-label, cockpit-card, scrollbar hide
src/pages/DashboardPage.tsx — substitui árvore JSX pelo CockpitShell, mantém toda a lógica
```

## Riscos & mitigação

- Risco de quebrar telas dependentes do scroll/layout do dashboard antigo → manter `BottomNav` e rotas intactas.
- Risco de performance do canvas em mobile → densidade reduzida + `requestAnimationFrame` único + degradação em `prefers-reduced-motion`.
- Risco de regressão nos cards: cada card legado renderiza dentro de `CockpitCard` (somente wrapper visual), sem alterar props/internals.

Implementação será feita em um único loop, sequencial: tokens → canvas → topbar → shell+rails → integração no DashboardPage.
