// Dr. VERTEX v4.0 — Renderiza as 5 sub-abas a partir do JSON estruturado
// devolvido pela edge function dr-vertex-analyze. Estilo APEX (dark, gold).
import { useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────
export interface VertexComposto {
  nome: string;
  classe: string;
  funcao_no_protocolo: string;
  dose_informada: string;
  dose_avaliacao: "ADEQUADA" | "SUBDOSADA" | "EXCESSIVA" | "CRITICA";
  dose_justificativa: string;
  timing_atual: string;
  timing_ideal: string;
  impacto_shape: string;
  impacto_postural: string;
  red_flags: string[];
  score_adequacao: number;
}
export interface VertexAuditoria {
  classificacao_protocolo: string;
  fase_detectada: string;
  coerencia_objetivo: string;
  potencial_anabolico: string;
  compostos: VertexComposto[];
}
export interface VertexSinergia {
  avaliacao_geral: string;
  ratio_androgenico: string;
  perfil_estrogenico: string;
  impacto_hpta: string;
  potencializam: { compostos: string[]; mecanismo: string; beneficio_pratico: string }[];
  competem: { compostos: string[]; mecanismo: string; consequencia: string; solucao: string }[];
  compensam: { composto: string; o_que_compensa: string; como: string }[];
  gaps_do_stack: string[];
  otimizacoes_sugeridas: { acao: string; justificativa: string; impacto_esperado: string }[];
}
export interface VertexContencao {
  score_risco_geral: number;
  sistemas: {
    sistema: string;
    risco: "BAIXO" | "MODERADO" | "ALTO" | "CRITICO";
    compostos_envolvidos: string[];
    mecanismo_dano: string;
    protocolo_suporte: string[];
    exames_recomendados: string[];
    frequencia_monitoramento: string;
    sinais_alerta: string[];
  }[];
  tpc_recomendada: {
    inicio: string;
    duracao: string;
    compostos_tpc: { nome: string; dose: string; duracao: string; funcao: string }[];
    exames_pre_tpc: string[];
  };
}
export interface VertexPeriodizacao {
  fase_atual: string;
  semanas_restantes: number;
  cronograma: {
    semana: string;
    fase: string;
    ajustes_compostos: { composto: string; dose_atual: string; dose_nova: string; justificativa: string }[];
    foco_principal: string;
    exames_semana: string[];
    alertas: string[];
  }[];
  peak_week: {
    protocolo_agua: string;
    protocolo_sodio: string;
    protocolo_carboidrato: string;
    manipulacao_hormonal: string;
    compostos_peak: { nome: string; dose: string; timing: string; objetivo: string }[];
    dia_a_dia: { dia: string; instrucoes: string }[];
  };
}
export interface VertexVeredicto {
  score_protocolo: number;
  classificacao: string;
  situacao_atual: string;
  diferencial_faltante: string;
  caminho: string;
  mensagem_vertex: string;
  top3_acoes_imediatas: { acao: string; prazo: string; impacto: string }[];
  projecao_shape: string;
}
export interface VertexAnalysis {
  auditoria: VertexAuditoria;
  sinergia: VertexSinergia;
  contencao_danos: VertexContencao;
  periodizacao: VertexPeriodizacao;
  veredicto: VertexVeredicto;
}

// ─── Tokens visuais ──────────────────────────────────────────────
const T = {
  card: "#0E1220",
  cardElev: "#141A2B",
  border: "#1E2A42",
  text: "#EDF2FF",
  textDim: "#7A8AAA",
  gold: "#FFB800",
  violet: "#A78BFA",
  blue: "#38BDF8",
  emerald: "#34D399",
  amber: "#FBBF24",
  orange: "#FB923C",
  red: "#EF4444",
  pink: "#F472B6",
};

const scoreColor = (s: number, max = 10) => {
  const ratio = s / max;
  if (ratio >= 0.8) return T.emerald;
  if (ratio >= 0.6) return T.amber;
  if (ratio >= 0.4) return T.orange;
  return T.red;
};
const avalColor = (a: string) =>
  ({ ADEQUADA: T.emerald, SUBDOSADA: T.amber, EXCESSIVA: T.orange, CRITICA: T.red } as Record<string, string>)[a] || T.textDim;
const riscoColor = (r: string) =>
  ({ BAIXO: T.emerald, MODERADO: T.amber, ALTO: T.orange, CRITICO: T.red } as Record<string, string>)[r] || T.textDim;

// ─── Componentes auxiliares ──────────────────────────────────────
function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-3 border" style={{ background: T.card, borderColor: T.border }}>
      <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.textDim }}>{label}</div>
      <div className="text-sm font-bold mt-1" style={{ color }}>{value}</div>
    </div>
  );
}
function SectionTitle({ children, color = T.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest mt-3 mb-1.5" style={{ color }}>
      {children}
    </div>
  );
}
function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {text}
    </span>
  );
}
function Gauge({ value, max = 100, size = 64, color, label }: { value: number; max?: number; size?: number; color: string; label?: string }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, value / max)) * circ;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-base font-bold" style={{ color }}>{value}</div>
        {label && <div className="text-[8px]" style={{ color: T.textDim }}>{label}</div>}
      </div>
    </div>
  );
}

// ─── Sub-aba 1: Auditoria ────────────────────────────────────────
function AuditoriaTab({ data }: { data: VertexAuditoria }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <MetricChip label="Classificação" value={data.classificacao_protocolo} color={T.gold} />
        <MetricChip label="Fase detectada" value={data.fase_detectada} color={T.blue} />
        <MetricChip label="Coerência objetivo" value={data.coerencia_objetivo} color={T.emerald} />
      </div>
      <div className="rounded-lg p-3 border" style={{ background: T.cardElev, borderColor: T.border }}>
        <SectionTitle color={T.violet}>Potencial anabólico estimado</SectionTitle>
        <div className="text-xs leading-snug" style={{ color: T.text }}>{data.potencial_anabolico}</div>
      </div>

      <SectionTitle>Análise composto a composto — {data.compostos.length}</SectionTitle>
      {data.compostos.map((c, i) => (
        <div key={i} className="rounded-lg p-3 border space-y-2.5" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold" style={{ color: T.text }}>{c.nome}</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: T.textDim }}>{c.classe}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Pill text={c.dose_avaliacao} color={avalColor(c.dose_avaliacao)} />
              <span className="text-[11px] font-mono font-bold" style={{ color: scoreColor(c.score_adequacao) }}>
                {c.score_adequacao}/10
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {[
              ["Função no protocolo", c.funcao_no_protocolo],
              ["Dose informada", c.dose_informada],
              ["Timing atual", c.timing_atual],
              ["Timing ideal", c.timing_ideal],
            ].map(([label, value]) => (
              <div key={label} className="rounded p-2" style={{ background: T.cardElev }}>
                <div className="text-[9px] uppercase tracking-widest" style={{ color: T.textDim }}>{label}</div>
                <div style={{ color: T.text }}>{value}</div>
              </div>
            ))}
          </div>
          {c.dose_justificativa && (
            <div className="text-[11px] leading-snug rounded p-2" style={{ background: T.cardElev, color: T.text }}>
              <span className="font-bold" style={{ color: avalColor(c.dose_avaliacao) }}>Justificativa da dose: </span>
              {c.dose_justificativa}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="rounded p-2" style={{ background: T.cardElev }}>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.gold }}>Impacto no shape</div>
              <div className="text-[11px] mt-1" style={{ color: T.text }}>{c.impacto_shape}</div>
            </div>
            <div className="rounded p-2" style={{ background: T.cardElev }}>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.pink }}>Impacto postural</div>
              <div className="text-[11px] mt-1" style={{ color: T.text }}>{c.impacto_postural}</div>
            </div>
          </div>
          {c.red_flags?.length > 0 && (
            <div className="rounded p-2 border" style={{ background: `${T.red}11`, borderColor: `${T.red}55` }}>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.red }}>⚠ Red flags</div>
              <ul className="mt-1 space-y-0.5">
                {c.red_flags.map((rf, k) => (
                  <li key={k} className="text-[11px]" style={{ color: T.text }}>· {rf}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Sub-aba 2: Sinergia ─────────────────────────────────────────
function SinergiaTab({ data }: { data: VertexSinergia }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricChip label="Avaliação geral" value={data.avaliacao_geral} color={T.gold} />
        <MetricChip label="Ratio androgênico" value={data.ratio_androgenico} color={T.violet} />
        <MetricChip label="Perfil estrogênico" value={data.perfil_estrogenico} color={T.pink} />
        <MetricChip label="Impacto HPTA" value={data.impacto_hpta} color={T.orange} />
      </div>

      {data.potencializam?.length > 0 && (
        <div className="rounded-lg p-3 border" style={{ background: T.card, borderColor: `${T.emerald}55` }}>
          <SectionTitle color={T.emerald}>⚡ Potencializam</SectionTitle>
          {data.potencializam.map((s, i) => (
            <div key={i} className="mt-2 rounded p-2" style={{ background: T.cardElev }}>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {s.compostos.map((c, j) => <Pill key={j} text={c} color={T.emerald} />)}
              </div>
              <div className="text-[11px]" style={{ color: T.text }}>{s.mecanismo}</div>
              <div className="text-[11px] mt-1" style={{ color: T.emerald }}>→ {s.beneficio_pratico}</div>
            </div>
          ))}
        </div>
      )}

      {data.competem?.length > 0 && (
        <div className="rounded-lg p-3 border" style={{ background: T.card, borderColor: `${T.red}55` }}>
          <SectionTitle color={T.red}>⚠ Competem</SectionTitle>
          {data.competem.map((s, i) => (
            <div key={i} className="mt-2 rounded p-2 space-y-1" style={{ background: T.cardElev }}>
              <div className="flex flex-wrap gap-1.5">
                {s.compostos.map((c, j) => <Pill key={j} text={c} color={T.red} />)}
              </div>
              <div className="text-[11px]" style={{ color: T.text }}>{s.mecanismo}</div>
              <div className="text-[11px]" style={{ color: T.red }}>Consequência: {s.consequencia}</div>
              <div className="text-[11px]" style={{ color: T.emerald }}>Solução: {s.solucao}</div>
            </div>
          ))}
        </div>
      )}

      {data.compensam?.length > 0 && (
        <div className="rounded-lg p-3 border" style={{ background: T.card, borderColor: `${T.blue}55` }}>
          <SectionTitle color={T.blue}>↔ Compensam</SectionTitle>
          {data.compensam.map((s, i) => (
            <div key={i} className="mt-2 rounded p-2" style={{ background: T.cardElev }}>
              <div className="text-xs font-bold" style={{ color: T.blue }}>{s.composto}</div>
              <div className="text-[11px] mt-1" style={{ color: T.text }}>Compensa: {s.o_que_compensa}</div>
              <div className="text-[11px] mt-0.5" style={{ color: T.textDim }}>→ {s.como}</div>
            </div>
          ))}
        </div>
      )}

      {data.gaps_do_stack?.length > 0 && (
        <div className="rounded-lg p-3 border" style={{ background: T.card, borderColor: T.border }}>
          <SectionTitle color={T.amber}>Gaps do stack</SectionTitle>
          <ul className="space-y-1">
            {data.gaps_do_stack.map((g, i) => (
              <li key={i} className="text-[11px]" style={{ color: T.text }}>· {g}</li>
            ))}
          </ul>
        </div>
      )}

      {data.otimizacoes_sugeridas?.length > 0 && (
        <div className="rounded-lg p-3 border" style={{ background: T.card, borderColor: `${T.gold}55` }}>
          <SectionTitle color={T.gold}>Otimizações sugeridas</SectionTitle>
          {data.otimizacoes_sugeridas.map((o, i) => (
            <div key={i} className="mt-2 rounded p-2" style={{ background: T.cardElev }}>
              <div className="text-xs font-bold" style={{ color: T.gold }}>{o.acao}</div>
              <div className="text-[11px] mt-1" style={{ color: T.text }}>{o.justificativa}</div>
              <div className="text-[11px] mt-1" style={{ color: T.emerald }}>Impacto: {o.impacto_esperado}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-aba 3: Contenção de Danos ───────────────────────────────
function ContencaoTab({ data }: { data: VertexContencao }) {
  const score = data.score_risco_geral;
  const cor = score <= 30 ? T.emerald : score <= 60 ? T.amber : score <= 80 ? T.orange : T.red;
  const label = score <= 30 ? "BAIXO RISCO" : score <= 60 ? "RISCO MODERADO" : score <= 80 ? "RISCO ELEVADO" : "RISCO CRÍTICO";
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-lg p-4 border" style={{ background: T.cardElev, borderColor: T.border }}>
        <Gauge value={score} max={100} size={80} color={cor} />
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textDim }}>Score de risco geral</div>
          <div className="text-base font-bold" style={{ color: cor }}>{label}</div>
          <div className="text-[11px]" style={{ color: T.textDim }}>{data.sistemas.length} sistemas monitorados</div>
        </div>
      </div>

      <SectionTitle>Sistemas orgânicos</SectionTitle>
      {data.sistemas.map((s, i) => (
        <div key={i} className="rounded-lg p-3 border space-y-2" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold" style={{ color: T.text }}>{s.sistema}</div>
            <Pill text={s.risco} color={riscoColor(s.risco)} />
          </div>
          {s.compostos_envolvidos?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {s.compostos_envolvidos.map((c, j) => <Pill key={j} text={c} color={riscoColor(s.risco)} />)}
            </div>
          )}
          <div className="text-[11px]" style={{ color: T.text }}>{s.mecanismo_dano}</div>

          {s.protocolo_suporte?.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.emerald }}>Protocolo de suporte</div>
              <ul className="mt-1 space-y-0.5">
                {s.protocolo_suporte.map((p, j) => (
                  <li key={j} className="text-[11px]" style={{ color: T.text }}>· {p}</li>
                ))}
              </ul>
            </div>
          )}
          {s.exames_recomendados?.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.blue }}>
                Exames · {s.frequencia_monitoramento}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {s.exames_recomendados.map((e, j) => <Pill key={j} text={e} color={T.blue} />)}
              </div>
            </div>
          )}
          {s.sinais_alerta?.length > 0 && (
            <div className="rounded p-2 border" style={{ background: `${T.red}11`, borderColor: `${T.red}55` }}>
              {s.sinais_alerta.map((sa, j) => (
                <div key={j} className="text-[11px]" style={{ color: T.red }}>⚠ {sa}</div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="rounded-lg p-3 border" style={{ background: T.cardElev, borderColor: `${T.violet}55` }}>
        <SectionTitle color={T.violet}>Protocolo de TPC recomendado</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <MetricChip label="Início" value={data.tpc_recomendada.inicio} color={T.violet} />
          <MetricChip label="Duração" value={data.tpc_recomendada.duracao} color={T.violet} />
        </div>
        {data.tpc_recomendada.compostos_tpc.map((t, i) => (
          <div key={i} className="mt-2 rounded p-2" style={{ background: T.card }}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold" style={{ color: T.violet }}>{t.nome}</div>
              <div className="text-[11px]" style={{ color: T.textDim }}>{t.funcao}</div>
            </div>
            <div className="flex gap-3 mt-1 text-[11px]">
              <span style={{ color: T.text }}>{t.dose}</span>
              <span style={{ color: T.textDim }}>· {t.duracao}</span>
            </div>
          </div>
        ))}
        {data.tpc_recomendada.exames_pre_tpc?.length > 0 && (
          <div className="mt-2">
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.blue }}>Exames pré-TPC</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.tpc_recomendada.exames_pre_tpc.map((e, j) => <Pill key={j} text={e} color={T.blue} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-aba 4: Periodização ─────────────────────────────────────
function PeriodizacaoTab({ data }: { data: VertexPeriodizacao }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <MetricChip label="Fase atual" value={data.fase_atual} color={T.gold} />
        <MetricChip label="Semanas restantes" value={`${data.semanas_restantes} sem`} color={T.blue} />
      </div>

      <SectionTitle>Cronograma semana a semana</SectionTitle>
      {data.cronograma.map((sem, i) => (
        <div key={i} className="rounded-lg p-3 border space-y-2" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold" style={{ color: T.gold }}>{sem.semana}</div>
            <Pill text={sem.fase} color={T.violet} />
          </div>
          <div className="text-[11px]" style={{ color: T.text }}>{sem.foco_principal}</div>
          {sem.ajustes_compostos?.length > 0 && (
            <div className="space-y-1">
              {sem.ajustes_compostos.map((a, j) => (
                <div key={j} className="rounded p-2 text-[11px]" style={{ background: T.cardElev }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold" style={{ color: T.text }}>{a.composto}</span>
                    <span style={{ color: T.textDim }}>{a.dose_atual}</span>
                    <span style={{ color: T.textDim }}>→</span>
                    <span className="font-bold" style={{ color: T.emerald }}>{a.dose_nova}</span>
                  </div>
                  <div className="mt-0.5" style={{ color: T.textDim }}>{a.justificativa}</div>
                </div>
              ))}
            </div>
          )}
          {sem.exames_semana?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sem.exames_semana.map((e, j) => <Pill key={j} text={e} color={T.blue} />)}
            </div>
          )}
          {sem.alertas?.map((a, j) => (
            <div key={j} className="text-[11px]" style={{ color: T.amber }}>⚠ {a}</div>
          ))}
        </div>
      ))}

      <div className="rounded-lg p-3 border" style={{ background: T.cardElev, borderColor: `${T.gold}55` }}>
        <SectionTitle color={T.gold}>🏆 Peak Week — Protocolo completo</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
          <MetricChip label="Água" value={data.peak_week.protocolo_agua} color={T.blue} />
          <MetricChip label="Sódio" value={data.peak_week.protocolo_sodio} color={T.amber} />
          <MetricChip label="Carboidrato" value={data.peak_week.protocolo_carboidrato} color={T.orange} />
          <MetricChip label="Manipulação hormonal" value={data.peak_week.manipulacao_hormonal} color={T.violet} />
        </div>
        {data.peak_week.compostos_peak?.length > 0 && (
          <>
            <SectionTitle color={T.gold}>Compostos peak week</SectionTitle>
            {data.peak_week.compostos_peak.map((c, i) => (
              <div key={i} className="mt-1.5 rounded p-2" style={{ background: T.card }}>
                <div className="text-xs font-bold" style={{ color: T.gold }}>{c.nome}</div>
                <div className="flex gap-3 mt-1 text-[11px]">
                  <span style={{ color: T.text }}>{c.dose}</span>
                  <span style={{ color: T.textDim }}>· {c.timing}</span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: T.emerald }}>→ {c.objetivo}</div>
              </div>
            ))}
          </>
        )}
        {data.peak_week.dia_a_dia?.length > 0 && (
          <>
            <SectionTitle color={T.gold}>Dia a dia</SectionTitle>
            {data.peak_week.dia_a_dia.map((d, i) => (
              <div key={i} className="mt-1.5 rounded p-2" style={{ background: T.card }}>
                <div className="text-xs font-bold" style={{ color: T.violet }}>{d.dia}</div>
                <div className="text-[11px] mt-1" style={{ color: T.text }}>{d.instrucoes}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-aba 5: Veredicto ────────────────────────────────────────
function VeredictoTab({ data }: { data: VertexVeredicto }) {
  const cor = scoreColor(data.score_protocolo);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-lg p-4 border" style={{ background: T.cardElev, borderColor: `${cor}55` }}>
        <Gauge value={data.score_protocolo} max={10} size={88} color={cor} label="/10" />
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textDim }}>Score do protocolo</div>
          <div className="text-base font-bold" style={{ color: cor }}>{data.classificacao}</div>
          <div className="text-[10px]" style={{ color: T.textDim }}>Dr. VERTEX · Análise farmacológica elite</div>
        </div>
      </div>

      {[
        { label: "Situação atual", value: data.situacao_atual, color: T.blue },
        { label: "Diferencial faltante", value: data.diferencial_faltante, color: T.red },
        { label: "Caminho", value: data.caminho, color: T.emerald },
      ].map((s) => (
        <div key={s.label} className="rounded-lg p-3 border" style={{ background: T.card, borderColor: T.border }}>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</div>
          <div className="text-xs mt-1 leading-snug" style={{ color: T.text }}>{s.value}</div>
        </div>
      ))}

      <div className="rounded-lg p-4 border" style={{ background: T.cardElev, borderColor: `${T.gold}55` }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.gold }}>⚡ Mensagem Dr. VERTEX</div>
        <div className="text-sm mt-2 italic leading-relaxed" style={{ color: T.text }}>"{data.mensagem_vertex}"</div>
      </div>

      <SectionTitle>Top 3 ações imediatas</SectionTitle>
      {data.top3_acoes_imediatas.map((a, i) => (
        <div key={i} className="rounded-lg p-3 border flex gap-3" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold shrink-0"
               style={{ background: `${T.gold}22`, color: T.gold }}>{i + 1}</div>
          <div className="flex-1">
            <div className="text-xs font-bold" style={{ color: T.text }}>{a.acao}</div>
            <div className="text-[10px] mt-0.5" style={{ color: T.textDim }}>Prazo: {a.prazo}</div>
            <div className="text-[11px] mt-1" style={{ color: T.emerald }}>→ {a.impacto}</div>
          </div>
        </div>
      ))}

      <div className="rounded-lg p-3 border" style={{ background: T.card, borderColor: `${T.violet}55` }}>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.violet }}>Projeção de shape</div>
        <div className="text-xs mt-1 leading-snug" style={{ color: T.text }}>{data.projecao_shape}</div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────
export type VertexV4Tab = "auditoria" | "sinergia" | "contencao" | "periodizacao" | "veredicto";

export default function VertexAnalysisV4({
  analysis, activeTab,
}: {
  analysis: VertexAnalysis;
  activeTab: VertexV4Tab;
}) {
  return useMemo(() => {
    switch (activeTab) {
      case "auditoria":     return <AuditoriaTab data={analysis.auditoria} />;
      case "sinergia":      return <SinergiaTab data={analysis.sinergia} />;
      case "contencao":     return <ContencaoTab data={analysis.contencao_danos} />;
      case "periodizacao":  return <PeriodizacaoTab data={analysis.periodizacao} />;
      case "veredicto":     return <VeredictoTab data={analysis.veredicto} />;
    }
  }, [activeTab, analysis]);
}
