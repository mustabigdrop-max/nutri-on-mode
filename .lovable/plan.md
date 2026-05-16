## Apex Visual Intelligence PhD — Plano de Construção

O `ApexPage.tsx` está hoje como placeholder ("módulo em construção"). O hook `useApex` e as tabelas (`apex_assessments`, `apex_posture_data`, `apex_fms_scores`, `apex_rom_measurements`, `apex_muscle_scores`, `apex_pain_entries`) já existem. Vou construir a página completa cobrindo os 8 pilares, na estética Lab (Emerald `#4ade80` / Pure Black `#03030a` / Space Grotesk), com navegação por abas e cálculos PhD-level rodando 100% no frontend (sem novas tabelas).

### Estrutura da página

Layout: header APEX + 7 abas horizontais scrolláveis + conteúdo animado (framer-motion AnimatePresence).

```text
[← voltar]   APEX · VISUAL INTELLIGENCE · CINESIOLOGIA PhD

[Overview] [Postura] [FMS] [Dor] [Mobilidade] [Shape] [Protocolo]

┌──────────────────────────────────────┐
│ conteúdo da aba ativa (motion)       │
└──────────────────────────────────────┘
```

### Abas e conteúdo

**1. Overview** — 4 ScoreRings (Postural, Mobilidade, Simetria, FMS) + score global 0-100 + CTA "iniciar nova avaliação" + lista de red flags ativos + síndrome de Janda detectada.

**2. Postura (Pilar 1 + 3)** — formulário nos 3 planos (sagital/frontal/transversal) com selects de severidade (none/mild/moderate/severe). Detecção automática de:
- Síndrome Cruzada Superior (SCS) — gatilho: forward_head + thoracic_kyphosis + protração de ombro
- Síndrome Cruzada Inferior (SCI) — gatilho: anterior pelvic_tilt + hiperlordose
- Síndrome de Distorção de Pronação — gatilho: pronation_dist
Saída: card com músculos encurtados vs. inibidos por síndrome detectada (base Janda/Kendall).

**3. FMS (Pilar 2)** — 7 testes com slider 0-3, bilateral pega o menor lado, score total /21. Alerta vermelho se < 14 ("risco de lesão 3x maior — Cook 2006"). Breakdown por padrão.

**4. Dor (Pilar 4)** — lista de entradas ativas + formulário novo:
- Região + lado + qualidade (multi: latejante/queimação/facada/peso/formigamento/irradiado)
- Comportamento (mecânica vs. inflamatória), padrão (local/referido/irradiado/radiculopático), timing
- Intensidade 0-10
- Detecção de **red flags automáticos**: dor noturna intensa, perda de força progressiva, controle vesical, piora em repouso, febre → modal "encaminhar profissional"
- Mapa de **dor referida**: ao selecionar região, sugere gatilhos miofasciais possíveis (trapézio→têmpora, piriforme→nádega+MMII, etc.)

**5. Mobilidade (Pilar 6)** — inputs de ROM por articulação com normas AAOS embutidas. Cada linha mostra: medido / normal / mínimo funcional + badge (OK/Limitado/Crítico). Score global de mobilidade.

**6. Shape (Pilar 7)** — 28 grupos musculares com slider 0-10 + objetivo (V-taper/X-frame/Physique/Power/Reabilitação). Cálculo de:
- Score de simetria por par bilateral (alerta se assimetria > 15%)
- Top 3 "lagging" (menores scores)
- Recomendação visual de prioridade por objetivo

**7. Protocolo (Pilar 8 — NASM CES)** — geração automática baseada em postura + FMS + dor. Cascata em 4 fases:
- **INIBIR** (5-10 min) — foam roller nos músculos hiperativos detectados
- **ALONGAR** (5-10 min) — static stretching 20-30s nos encurtados
- **ATIVAR** (5-10 min) — exercícios de ativação isolada dos inibidos
- **INTEGRAR** — padrões globais combinados

Botão "salvar avaliação" persiste tudo via `saveFullAssessment` do hook.

### Detalhes técnicos

- Sem migrations — uso o hook `useApex` existente; cálculos derivados (Janda, red flags, protocolo) ficam em helpers no próprio arquivo
- Pilar 5 (Análise Biomecânica de Exercícios) integrado como link/CTA para TrainingON; aqui só registro cues genéricos por padrão (squat/deadlift/press/unipodal/supino) como referência consultável
- Estética Lab: borders `rgba(74,222,128,.18)`, mono labels uppercase tracking, headings Space Grotesk emerald
- Componentes inline no arquivo (ScoreRing, TabBtn, SevSelect, RomRow, MuscleSlider, PainCard, SyndromeCard, ProtocolPhase)
- Tudo client-side, framer-motion para transições de aba
- Mobile-first (max-w-lg)
- Arquivo único `src/pages/ApexPage.tsx` (~900 linhas)

### Fora de escopo desta entrega

- Upload de foto/vídeo para análise por IA (Pilar 1 input "Foto/vídeo postural") — fica para fase 2 com Gemini Vision
- Integração runtime com histórico TrainingON para badges biomecânicos por exercício específico — fase 2
- Y-Balance Test e SFMA breakdown completo — fase 2
- Peak Week visual integrado a NutriSync — fase 2

Posso seguir e implementar?
