
## Objetivo
Eliminar o ajuste manual de landmarks no APEX Visual Intelligence (`/coach/apex-visual`) usando **MediaPipe Pose** para detecção automática nas três vistas (frente, lateral, costas) + interpolação para os pontos anatômicos (C7, L5, escápulas) que o MediaPipe não cobre. Coach permanece podendo ajustar manualmente, mas o ponto de partida vem totalmente automatizado.

## Observação importante
O projeto já tem **`@mediapipe/tasks-vision`** instalado (usado em `src/lib/poseAnalysis.ts` para VideoForm). Vamos usar essa API moderna em vez do legacy `@mediapipe/pose`. Isso evita adicionar dependência e mantém consistência. Os IDs internos do APEX (`shoulder_left`, `hip_right`, `scapula_left`, `spine_c7`, `spine_l5`, etc.) serão preservados — o mapeamento converte de MediaPipe → IDs APEX, sem trocar o schema esperado pelo overlay/validador.

## Arquivos novos

1. **`src/lib/apexMediaPipeDetector.ts`** — singleton que inicializa `PoseLandmarker` (modo IMAGE, `pose_landmarker_full`) e expõe `detectPoseFromFile(file)` → 33 landmarks normalizados (0-1).
2. **`src/lib/apexLandmarkMapper.ts`** — três funções (`mapFrente`, `mapCostas`, `mapLateral`) que recebem landmarks MediaPipe e emitem o objeto `{ shoulder_left, shoulder_right, hip_left, hip_right, scapula_left, scapula_right, spine_c7, spine_l5, ... }` em coords 0-100, com C7/L5/escápulas interpolados via heurísticas anatômicas (entre orelhas + 85% até ombros; midpoint dos quadris -2.5%; 35% abaixo do ombro a meio caminho do centro). Cada landmark recebe `{ x, y, source: "mediapipe"|"interpolated", confidence }`.
3. **`src/lib/apexAutoDetect.ts`** — pipeline: `detectPoseFromFile` → mapper por vista → snap C7/L5 ao eixo central calculado dos ombros/quadris → `validateAndCorrectPosturalLandmarks` (já existe) → retorna `{ landmarks, angles: {}, source, confidence, corrections }`.

## Modificações

4. **`src/components/coach/ApexVisualDashboard.tsx`**
   - Em `analyzeWithAI`, **antes** do `invoke("apex-visual-analyze")`, rodar `apexAutoDetect` em paralelo nas 3 fotos (front/back/side).
   - Após receber a resposta da IA e parsear com `parseLandmarks(text)`, **mesclar** os landmarks da IA com os do MediaPipe: para cada vista, usar `mediapipeBundle[view].landmarks` como base autoritativa para os pontos diretos (ombros/quadris/joelhos/tornozelos) e manter os campos da IA apenas onde MediaPipe falhar.
   - Persistir `detection_source` ("mediapipe+interpolated" | "ai_vision_fallback") no `plumb_line_quality` para auditoria.
   - Se MediaPipe falhar em todas as vistas, fluxo segue 100% como hoje (fallback Vision já existente).

## Detalhes técnicos

- **Coordenadas**: MediaPipe normaliza 0-1; multiplicamos por 100 (overlay espera percentuais).
- **Lateralidade**: na vista frente/costas a IA da APEX usa convenção do observador (E/D do atleta = lado oposto da imagem). MediaPipe `LEFT_*` = lado esquerdo do **atleta** → na frente fica à direita da imagem. O mapper traduz corretamente por vista (na vista de costas, `LEFT_SHOULDER` MediaPipe ↔ `shoulder_right` APEX).
- **Confidence threshold**: visibility > 0.4 (igual à spec). Abaixo disso, o ponto não é emitido e a IA mantém o valor.
- **C7/L5 snap**: centerX = média de `(shoulderMidX + hipMidX) / 2`, e força `spine_c7.x` e `spine_l5.x` para esse valor (lógica já existe parcialmente em `apexLandmarkValidator`).
- **Modelo**: `pose_landmarker_full.task` (mais preciso que `_lite`, ainda <10MB). Carregado via CDN jsdelivr, runningMode `IMAGE`.
- **Inicialização lazy**: só carrega o WASM/modelo na 1ª análise para não pesar o bundle inicial.

## O que NÃO muda

- Painel lateral de achados, PDF, Timeline, Score History, VERA, Dr. VERTEX, TrainingON, modal de virilização, drag manual, snap dourado de C7/L5, tema dark — tudo intocado.
- Edge function `apex-visual-analyze` continua sendo chamada (gera scores, diagnósticos, achados clínicos, recomendações). Apenas os **landmarks** dela são sobrescritos pelo MediaPipe quando disponível.
- Schema do banco e tipos não mudam.

## Validação final

- Console log `[APEX MediaPipe] source=mediapipe+interpolated confidence=0.87 corrections=[...]` em DEV.
- Badge sutil no painel: "⬡ MediaPipe" (quando auto) ou "✦ Vision" (quando fallback).

## Risco / fallback

Se o modelo MediaPipe não carregar (rede, WASM bloqueado), o pipeline cai silenciosamente no fluxo Vision atual — zero regressão.
