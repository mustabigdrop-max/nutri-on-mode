## Análise Visual com Overlay de Landmarks — APEX

Nova aba "📐 Análise Visual" no resultado APEX, entre "Scores" e "Postura", com overlay SVG interativo sobre as fotos do atleta + painel de achados + exportação PNG.

### 1. Prompt da IA (`apex-visual-analyze` edge function)

Adicionar ao final do `buildSystemPrompt` (ou ao contexto) a instrução de landmarks/ângulos para `front`, `lateral`, `back`, exigindo três blocos:

````text
```json_landmarks_front``` ... ```
```json_landmarks_lateral``` ... ```
```json_landmarks_back``` ... ```
````

Regras:
- Coordenadas em % (0–100) da largura/altura da foto correspondente.
- Nunca zeros — sempre estimar.
- Só retornar blocos das vistas cujas fotos foram enviadas.
- Cada ângulo: `value`, `unit`, `normal`, `finding` (texto clínico curto).

### 2. Persistência

Salvar os 3 JSONs já parseados em `apex_analyses.landmarks` (novo `jsonb` nullable). Quando o histórico for reaberto, recarregar pelo campo (fallback: parsear de novo do `analysis_text`).

Migração:
```sql
ALTER TABLE public.apex_analyses ADD COLUMN landmarks jsonb;
```

Persistir URL pública/signed das fotos: novas colunas `photo_front_url`, `photo_back_url`, `photo_side_url` (text). Upload no bucket existente `apex-visual-photos` (já presente) durante `analyzeWithAI`, antes de mandar para a IA — guardar paths, gerar signed URL na hora de exibir.

### 3. Parser no front

Em `ApexVisualDashboard.tsx`:
- `parseLandmarks(text)` → `{ front?, lateral?, back? }` extraindo os 3 blocos com regex `/```json_landmarks_(front|lateral|back)\s*([\s\S]*?)```/g`.
- Validar com try/catch; descartar landmarks com x=0 e y=0 ao renderizar.

### 4. Componente `ApexVisualOverlay`

Novo arquivo `src/components/coach/ApexVisualOverlay.tsx`:

- Props: `{ landmarks, photos: { front?, lateral?, back? } }`.
- Estado: `view` (front/lateral/back) + `selectedFinding` (chave do ângulo destacado).
- Layout responsivo grid `lg:grid-cols-[1fr_320px]`:
  - **Esquerda**: container `relative` com `<img>` da foto + `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` absoluto cobrindo a imagem.
  - **Direita**: painel de achados ordenado por severidade.

Renderização SVG (por vista):
- **Front**: linha ombros (ciano `#00D4FF`), linha quadril (ciano), prumo central vertical branco tracejado, eixos joelho-tornozelo vermelhos se `knee_valgus_*` > 5°.
- **Lateral**: polilinha verde orelha→ombro→trocânter→joelho→maléolo + prumo central branco tracejado.
- **Back**: linha ombros, linha quadril, espinha C7→L5 amarela `#FFB800`, marcadores de escápulas.
- **Landmarks**: `<circle r="0.8">` dourado `#B8922A` + `<text>` label branco pequeno offset.
- **Ângulos**: pequeno arco SVG no vértice + texto com valor; vermelho se fora do `normal`, verde se dentro. Helper `isWithinNormal(value, normalStr)` parseia `"<5°"`, `"0-10°"`, `"0°"`, `"20-40°"`.
- Pulso CSS `@keyframes apex-pulse-finding` no elemento selecionado.

Interação:
- Click em ponto/linha/ângulo → seta `selectedFinding` e abre popover (`@/components/ui/popover`) com o `finding` clínico.
- Click em item do painel direito → mesma seleção + scroll into view.

Painel direito (Achados):
- Lista `findings` calculada de `angles` ordenada por severidade: severe (>2× normal max) > altered (fora do normal) > normal.
- Item: nome amigável, valor + unidade, normal, badge status (✅/⚠️/🔴), `finding` truncado em 2 linhas.

Bloco educacional expansível abaixo:
- Para cada finding alterado, `<details>` "📚 Entenda este achado" mostrando o `finding` completo (já vem da IA contextualizado).

### 5. Exportação PNG

Botão "Exportar Análise Visual":
- Usa `html2canvas` (já no projeto) com `scale: 3` sobre um container ref que envolve foto+SVG+lista de achados em layout vertical para export (clone offscreen).
- Download via `a.download = 'apex-visual-{atleta}-{view}.png'`.

### 6. Integração na aba

Em `ApexVisualDashboard.tsx`:
- Adicionar `{ key: "visual", label: "📐 Análise Visual" }` no array `tabs` entre `scores` e `postura`.
- Bloco condicional `{activeResultTab === "visual" && <ApexVisualOverlay landmarks={parseLandmarks(analysisResult)} photos={photoUrls} />}`.
- `photoUrls` vem de signed URLs criados via `supabase.storage.from('apex-visual-photos').createSignedUrl(path, 3600)` em `useEffect` quando a análise é carregada/aberta do histórico.
- Para análise recém-gerada, fazer upload das 3 fotos antes da chamada da IA e guardar paths nos campos `photo_*_url`.

### 7. Estados vazios

- Sem nenhum landmark parseado → card "Análise de landmarks não disponível nesta análise. Gere uma nova análise para visualizar." (acontece em análises antigas pré-feature).
- Vista sem foto correspondente → desabilita o botão da vista.

### Arquivos

- **edit** `supabase/functions/apex-visual-analyze/index.ts` — append landmark instructions ao system prompt
- **edit** `src/components/coach/ApexVisualDashboard.tsx` — upload fotos, parser, nova aba, persistência landmarks/photo paths, signed URLs
- **new** `src/components/coach/ApexVisualOverlay.tsx` — componente principal de overlay
- **migration** `apex_analyses`: + `landmarks jsonb`, `photo_front_url text`, `photo_back_url text`, `photo_side_url text`

Sem alterações nas outras abas, scores, exportação existente, fluxo do `/coach/apex-visual` que já está em produção.