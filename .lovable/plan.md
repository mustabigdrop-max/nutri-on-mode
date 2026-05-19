## Objetivo

Adicionar uma nova aba **"Plano Mestre"** ao APEX Visual Intelligence (em `ApexVisualDashboard.tsx`, após "Correções") que gera automaticamente, via IA, um Plano Mestre de Evolução estruturado em fases e semanas, com persistência, checklist semanal e ações de exportação/integração.

Nenhuma aba ou comportamento existente será alterado — apenas adições.

---

## Entregas

### 1. Banco de dados (migração)
- `apex_guided_sessions`: adicionar colunas
  - `plano_mestre jsonb`
  - `plano_semana_atual int default 1`
  - `plano_fase_atual int default 1`
  - `metricas_atingidas jsonb default '[]'`
- Nova tabela `apex_plano_progresso` (session_id, athlete_id, semana, fase, exercicio, concluido, observacao, registrado_em).
- RLS: coach acessa apenas progresso dos seus atletas (via `apex_guided_sessions.coach_id = auth.uid()`).

### 2. Edge Function `apex-plano-mestre`
- Recebe: `dysfunctions`, `muscleMap`, `fcsScore`, `athleteProfile`, `goal`, `analysisRaw` (opcional).
- Chama Lovable AI (`google/gemini-2.5-pro`) com o prompt completo do briefing (duração por severidade FCS, 4 fases padrão Inibição → Elongação → Ativação → Integração, semanas detalhadas, métricas, sinais de alarme, recheck).
- `response_format: json_object` e retorna `{ plano_mestre: {...} }` exatamente no schema pedido.
- Trata erros 429 / 402 / parse.

### 3. Novo componente `ApexPlanoMestre.tsx` (`src/components/coach/`)
- Header dourado monospace **"— PLANO MESTRE DE EVOLUÇÃO"** + scan-line ciano.
- Card de resumo (título, duração, fase atual, FCS inicial/meta, próximo recheck, barra de progresso global).
- Timeline horizontal das fases (●━━●━━●━━●), com estados concluída / atual (dourado pulsando) / futura.
- Accordion de fases → accordion de semanas dentro de cada fase.
- Por semana: foco, sessões, exercícios prioritários (com cue, séries, reps, progressão), contraindicados, sinal verde para avançar.
- Tabela de métricas de sucesso por fase com checkbox "Meta atingida".
- Card de sinais de alarme (alta/média/baixa codificadas por cor) e card ciano de Recheck APEX.
- **Checklist semanal interativo** na semana atual: marcar exercícios → grava em `apex_plano_progresso` → atualiza barra; semana completa libera botão "Avançar para semana X+1"; critério de fase aciona modal de confirmação.
- Barra de ações: **Copiar plano**, **Exportar PDF** (window.print/jsPDF), **Enviar para TrainingON** (stub que salva flags na sessão), **Agendar Recheck**.
- Paleta: `#0a0a1a`, `#B8922A`, `#00D4FF`, `#1D9E75`, branco, `#888`.
- Mobile: accordions fechados por padrão.

### 4. Integração em `ApexVisualDashboard.tsx`
- Inserir `{ key: "plano-mestre", label: "Plano Mestre", icon: CalendarDays }` na lista `tabs` logo após `"correcoes"`.
- Cor de aba ativa: `#B8922A`.
- Conteúdo da aba: renderiza `<ApexPlanoMestre sessionId={...} dysfunctions={...} muscleMap={...} fcsScore={...} athleteProfile={...} goal={...} analysisRaw={analysisResult} />`.
- Geração automática: ao primeiro render da aba (ou quando uma análise APEX completa o `isDone`), se `plano_mestre` ainda não existe na sessão, dispara a Edge Function automaticamente e persiste. Botão **"Gerar Plano Mestre"** disponível para análises antigas.

### 5. Hook utilitário `useApexPlanoMestre.ts`
- `loadPlano(sessionId)`, `generatePlano(payload)`, `saveProgresso(...)`, `marcarMetricaAtingida(...)`, `avancarSemana()`, `avancarFase()`.

---

## Arquivos

**Criados**
- `supabase/functions/apex-plano-mestre/index.ts`
- `src/components/coach/ApexPlanoMestre.tsx`
- `src/hooks/useApexPlanoMestre.ts`
- `supabase/migrations/<timestamp>_apex_plano_mestre.sql`

**Editados (mínimo)**
- `src/components/coach/ApexVisualDashboard.tsx` — apenas adicionar entrada na `tabs` e bloco de render da nova aba.

Nada mais será tocado.

---

## Notas técnicas

- O JSON do plano segue exatamente o schema do briefing (`plano_mestre.fases[].semanas_detalhadas[]`, etc.).
- Validação leve no front: se algum campo crítico vier ausente, mostra fallback "—" (sem quebrar).
- PDF: impressão estilizada via `@media print` no próprio componente (sem nova dependência).
- TrainingON: integração inicial = grava `plano_semana_atual` + lista de contraindicados em `apex_guided_sessions`; consumo no TrainingON fica para passo futuro caso queira (não altera TrainingON agora).

Posso seguir e implementar tudo acima?
