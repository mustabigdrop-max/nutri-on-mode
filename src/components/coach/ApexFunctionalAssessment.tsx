import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, Loader2, Save, ShieldAlert, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import AthleteSelector, { type AthleteOption } from "@/components/coach/AthleteSelector";
import { APEX_CHECKLISTS } from "@/data/apexFunctionalChecklists";
import {
  addWeeksISO,
  diagnosticarAtleta,
  type ChecklistEntrada,
  type DeficitTipo,
  type GrupoDiagnostico,
  type Severidade,
} from "@/lib/apexDeficitDiagnose";
import { prescreverApex, type PrescricaoApex } from "@/lib/apexPrescription";
import { gerarRelatorioAtleta } from "@/lib/apexAthleteReport";
import { compararAvaliacoes, type ComparacaoAvaliacoes, type Evolucao } from "@/lib/apexReassess";
import type { DiagnosticoCompleto } from "@/lib/apexDeficitDiagnose";

const C = {
  bg: "#020205",
  surface: "#080810",
  border: "#151726",
  cyan: "#00D4FF",
  gold: "#B8922A",
  red: "#E24B4A",
  green: "#1D9E75",
  text: "#E8ECF2",
  textSec: "#7A8599",
  textDim: "#4A5568",
};
const TITLE = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const LABEL = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
} as const;

const DEFICIT_COR: Record<DeficitTipo, string> = {
  BIOMECANICO: C.red,
  ATIVACAO: C.cyan,
  VOLUME: C.gold,
  ESTETICO: C.textSec,
};
const DEFICIT_LABEL: Record<DeficitTipo, string> = {
  BIOMECANICO: "Biomecânico",
  ATIVACAO: "Ativação",
  VOLUME: "Volume",
  ESTETICO: "Estético",
};
const SEV_COR: Record<Severidade, string> = { SEVERO: C.red, MODERADO: C.gold, LEVE: C.green };

type Respostas = Record<string, Record<string, string>>;
type Scores = Record<string, string>;

export default function ApexFunctionalAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [grupoAtivo, setGrupoAtivo] = useState<string>(APEX_CHECKLISTS[0].key);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [scores, setScores] = useState<Scores>({});
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ultimaData, setUltimaData] = useState<string | null>(null);
  const [comparacao, setComparacao] = useState<ComparacaoAvaliacoes | null>(null);

  const grupo = useMemo(
    () => APEX_CHECKLISTS.find((g) => g.key === grupoAtivo) || APEX_CHECKLISTS[0],
    [grupoAtivo],
  );

  // Carrega o checklist mais recente já registrado para o atleta
  const carregar = useCallback(async () => {
    if (!athlete?.id) {
      setRespostas({});
      setScores({});
      setObservacoes({});
      setUltimaData(null);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("apex_functional_checklists")
      .select("grupo_key, respostas, visual_score, observacoes, avaliado_em")
      .eq("athlete_id", athlete.id)
      .order("avaliado_em", { ascending: false });
    const r: Respostas = {};
    const s: Scores = {};
    const obs: Record<string, string> = {};
    let ultima: string | null = null;
    for (const row of data || []) {
      if (r[row.grupo_key]) continue; // já tem o mais recente
      r[row.grupo_key] = (row.respostas as Record<string, string>) || {};
      if (row.visual_score !== null && row.visual_score !== undefined) s[row.grupo_key] = String(row.visual_score);
      if (row.observacoes) obs[row.grupo_key] = row.observacoes;
      if (!ultima) ultima = row.avaliado_em;
    }
    setRespostas(r);
    setScores(s);
    setObservacoes(obs);
    setUltimaData(ultima);

    // REASSESS: compara as duas últimas avaliações já registradas
    const { data: diags } = await supabase
      .from("apex_deficit_diagnoses")
      .select("avaliado_em, grupos, prioridades, encaminhamentos, proxima_reavaliacao")
      .eq("athlete_id", athlete.id)
      .order("avaliado_em", { ascending: false })
      .limit(2);
    if (diags && diags.length === 2) {
      const toDiag = (row: (typeof diags)[number]): DiagnosticoCompleto => ({
        grupos: Array.isArray(row.grupos) ? (row.grupos as unknown as DiagnosticoCompleto["grupos"]) : [],
        prioridades: Array.isArray(row.prioridades)
          ? (row.prioridades as unknown as DiagnosticoCompleto["prioridades"])
          : [],
        encaminhamentos: Array.isArray(row.encaminhamentos) ? (row.encaminhamentos as string[]) : [],
        proxima_reavaliacao: { checklist_semanas: null, visual_semanas: null },
      });
      setComparacao(
        compararAvaliacoes(
          { avaliado_em: diags[1].avaliado_em, diagnostico: toDiag(diags[1]) },
          { avaliado_em: diags[0].avaliado_em, diagnostico: toDiag(diags[0]) },
        ),
      );
    } else {
      setComparacao(null);
    }
    setLoading(false);
  }, [athlete?.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const entradas: ChecklistEntrada[] = useMemo(
    () =>
      Object.entries(respostas)
        .filter(([, resp]) => Object.keys(resp || {}).length > 0)
        .map(([grupo_key, resp]) => {
          const raw = scores[grupo_key];
          const parsed = raw !== undefined && raw !== "" ? Number(raw) : null;
          return {
            grupo_key,
            respostas: resp,
            visual_score: parsed !== null && Number.isFinite(parsed) ? parsed : null,
          };
        }),
    [respostas, scores],
  );

  const diagnostico = useMemo(() => diagnosticarAtleta(entradas), [entradas]);
  const prescricao = useMemo(() => prescreverApex(diagnostico), [diagnostico]);

  const responder = (perguntaId: string, opcao: string) => {
    setRespostas((prev) => ({
      ...prev,
      [grupo.key]: { ...(prev[grupo.key] || {}), [perguntaId]: opcao },
    }));
  };

  const salvar = async () => {
    if (!user || !athlete?.id) {
      toast({ title: "Selecione o atleta", variant: "destructive" });
      return;
    }
    if (!entradas.length) {
      toast({ title: "Responda ao menos uma pergunta do checklist", variant: "destructive" });
      return;
    }
    setSaving(true);
    const hoje = new Date().toISOString().slice(0, 10);
    try {
      for (const e of entradas) {
        const { error } = await supabase.from("apex_functional_checklists").insert({
          coach_id: user.id,
          athlete_id: athlete.id,
          grupo_key: e.grupo_key,
          respostas: e.respostas,
          visual_score: e.visual_score,
          observacoes: observacoes[e.grupo_key] || null,
          avaliado_em: hoje,
        });
        if (error) throw error;
      }

      const checklistSemanas = diagnostico.proxima_reavaliacao.checklist_semanas;
      const visualSemanas = diagnostico.proxima_reavaliacao.visual_semanas;
      const { error: errDiag } = await supabase.from("apex_deficit_diagnoses").insert({
        coach_id: user.id,
        athlete_id: athlete.id,
        avaliado_em: hoje,
        grupos: JSON.parse(JSON.stringify(diagnostico.grupos)),
        prioridades: JSON.parse(JSON.stringify(diagnostico.prioridades)),
        encaminhamentos: diagnostico.encaminhamentos,
        proxima_reavaliacao: {
          checklist_semanas: checklistSemanas,
          checklist_data: checklistSemanas ? addWeeksISO(checklistSemanas) : null,
          visual_semanas: visualSemanas,
          visual_data: visualSemanas ? addWeeksISO(visualSemanas) : null,
        },
      });
      if (errDiag) throw errDiag;

      toast({ title: "Avaliação registrada", description: "Checklist e diagnóstico salvos no prontuário do atleta." });
      setUltimaData(hoje);
    } catch (err) {
      toast({
        title: "Não foi possível salvar",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const respondidasGrupo = (key: string) => Object.keys(respostas[key] || {}).length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "20px 16px 96px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/coach/hub")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: C.textSec,
            background: "transparent",
            border: "none",
            ...LABEL,
            marginBottom: 14,
          }}
        >
          <ArrowLeft size={14} /> voltar
        </button>

        <div style={{ borderLeft: `2px solid ${C.cyan}`, paddingLeft: 12, marginBottom: 22 }}>
          <div style={{ ...LABEL, color: C.cyan }}>Apex Assessment · camada 1 e 2</div>
          <h1 style={{ ...TITLE, fontSize: 30, margin: "4px 0 2px", letterSpacing: "0.02em" }}>
            AVALIAÇÃO FUNCIONAL E DIAGNÓSTICO
          </h1>
          <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>
            Checklist neuromuscular por grupo muscular. A classificação do deficit usa apenas as respostas registradas
            e o score visual APEX quando informado.
          </p>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, marginBottom: 18 }}>
          <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} label="Atleta avaliado" />
          {ultimaData && (
            <div style={{ ...LABEL, color: C.gold, marginTop: 10 }}>
              última avaliação registrada: {new Date(`${ultimaData}T12:00:00`).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>

        {!athlete && (
          <div style={{ border: `1px solid ${C.border}`, padding: 18, color: C.textSec, fontSize: 13 }}>
            Selecione o atleta para iniciar o checklist funcional.
          </div>
        )}

        {athlete && (
          <>
            {/* Grupos */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {APEX_CHECKLISTS.map((g) => {
                const ativo = g.key === grupoAtivo;
                const n = respondidasGrupo(g.key);
                return (
                  <button
                    key={g.key}
                    onClick={() => setGrupoAtivo(g.key)}
                    style={{
                      ...LABEL,
                      padding: "8px 10px",
                      border: `1px solid ${ativo ? C.cyan : C.border}`,
                      background: ativo ? "rgba(0,212,255,0.08)" : "transparent",
                      color: ativo ? C.cyan : n > 0 ? C.text : C.textSec,
                    }}
                  >
                    {g.nome} {n > 0 ? `· ${n}/${g.perguntas.length}` : ""}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textSec, padding: 20 }}>
                <Loader2 size={16} className="animate-spin" /> carregando registros do atleta…
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, marginBottom: 18 }}>
                <div style={{ ...LABEL, color: C.gold }}>subgrupos avaliados</div>
                <div style={{ color: C.textSec, fontSize: 12, marginTop: 4, marginBottom: 16 }}>
                  {grupo.subgrupos.join(" · ")}
                </div>

                {grupo.perguntas.map((q) => {
                  const escolhida = respostas[grupo.key]?.[q.id];
                  return (
                    <div key={q.id} style={{ borderTop: `1px solid ${C.border}`, padding: "14px 0" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span style={{ ...LABEL, color: C.cyan }}>{q.id}</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{q.pergunta}</span>
                      </div>
                      <div style={{ ...LABEL, color: C.textDim, margin: "4px 0 10px" }}>detecta: {q.detecta}</div>
                      <div style={{ display: "grid", gap: 6 }}>
                        {q.opcoes.map((op) => {
                          const sel = escolhida === op.key;
                          return (
                            <button
                              key={op.key}
                              onClick={() => responder(q.id, op.key)}
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                textAlign: "left",
                                padding: "10px 12px",
                                border: `1px solid ${sel ? C.cyan : C.border}`,
                                background: sel ? "rgba(0,212,255,0.07)" : "transparent",
                                color: sel ? C.text : C.textSec,
                                fontSize: 13,
                              }}
                            >
                              <span style={{ ...LABEL, color: sel ? C.cyan : C.textDim }}>{op.key}</span>
                              {op.texto}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ ...LABEL, color: C.gold }}>score visual apex deste grupo (0-100, opcional)</div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scores[grupo.key] ?? ""}
                      onChange={(e) => setScores((p) => ({ ...p, [grupo.key]: e.target.value }))}
                      placeholder="deixe vazio se não houver score visual registrado"
                      style={{
                        width: "100%",
                        marginTop: 6,
                        padding: "10px 12px",
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ ...LABEL, color: C.gold }}>observações do coach</div>
                    <textarea
                      rows={2}
                      value={observacoes[grupo.key] ?? ""}
                      onChange={(e) => setObservacoes((p) => ({ ...p, [grupo.key]: e.target.value }))}
                      style={{
                        width: "100%",
                        marginTop: 6,
                        padding: "10px 12px",
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        fontSize: 13,
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DIAGNOSE */}
            <Diagnostico
              grupos={diagnostico.grupos}
              prioridades={diagnostico.prioridades}
              encaminhamentos={diagnostico.encaminhamentos}
              proxima={diagnostico.proxima_reavaliacao}
            />

            {/* ACTIVATE / CORRECT / PRESCRIBE */}
            {diagnostico.grupos.length > 0 && <Prescricao prescricao={prescricao} />}

            {/* RELATÓRIO DO ATLETA */}
            {diagnostico.grupos.length > 0 && (
              <RelatorioAtleta texto={gerarRelatorioAtleta(athlete?.nome || "atleta", diagnostico, prescricao)} />
            )}

            {/* REASSESS */}
            {comparacao && <Comparacao comparacao={comparacao} />}





            <button
              onClick={salvar}
              disabled={saving || !entradas.length}
              style={{
                ...LABEL,
                marginTop: 18,
                width: "100%",
                padding: "14px 16px",
                border: `1px solid ${C.cyan}`,
                background: saving ? "transparent" : "rgba(0,212,255,0.1)",
                color: C.cyan,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: entradas.length ? 1 : 0.4,
              }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "salvando…" : "salvar avaliação e diagnóstico"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Diagnostico({
  grupos,
  prioridades,
  encaminhamentos,
  proxima,
}: {
  grupos: GrupoDiagnostico[];
  prioridades: { grupo: string; tipo: DeficitTipo; severidade: Severidade }[];
  encaminhamentos: string[];
  proxima: { checklist_semanas: number | null; visual_semanas: number | null };
}) {
  if (!grupos.length) {
    return (
      <div style={{ border: `1px solid ${C.border}`, padding: 18, color: C.textSec, fontSize: 13 }}>
        O diagnóstico aparece aqui quando houver respostas registradas. Sem resposta não há classificação.
      </div>
    );
  }

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <ClipboardList size={16} color={C.cyan} />
        <div style={{ ...TITLE, fontSize: 20, letterSpacing: "0.02em" }}>MAPA DE DEFICITS</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {grupos.map((g) => (
          <div key={g.grupo_key} style={{ border: `1px solid ${C.border}`, padding: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <div style={{ ...TITLE, fontSize: 16, flex: 1, minWidth: 160 }}>{g.grupo}</div>
              <span style={{ ...LABEL, color: C.textDim }}>
                {g.respondidas}/{g.total_perguntas} respondidas
              </span>
              {g.apex_visual_score !== null && (
                <span style={{ ...LABEL, color: C.gold }}>visual {g.apex_visual_score}/100</span>
              )}
            </div>

            {g.deficits.length === 0 ? (
              <div style={{ ...LABEL, color: C.green, marginTop: 8 }}>sem deficit nas respostas registradas</div>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {g.deficits.map((d) => (
                  <div key={d.tipo} style={{ borderLeft: `2px solid ${DEFICIT_COR[d.tipo]}`, paddingLeft: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ ...LABEL, color: DEFICIT_COR[d.tipo] }}>{DEFICIT_LABEL[d.tipo]}</span>
                      <span style={{ ...LABEL, color: SEV_COR[d.severidade] }}>{d.severidade}</span>
                    </div>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 16, color: C.textSec, fontSize: 12 }}>
                      {d.evidencias.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {g.assimetria && (
              <div style={{ ...LABEL, color: C.gold, marginTop: 10 }}>
                assimetria relatada: {g.assimetria_evidencias.length} resposta(s) — unilaterais antes dos bilaterais
              </div>
            )}

            <div style={{ ...LABEL, color: C.cyan, marginTop: 10 }}>fase: {g.fase_recomendada}</div>
          </div>
        ))}
      </div>

      {prioridades.length > 0 && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <div style={{ ...LABEL, color: C.cyan, display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={13} /> prioridades de tratamento
          </div>
          <ol style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: C.text }}>
            {prioridades.map((p, i) => (
              <li key={`${p.grupo}-${p.tipo}-${i}`} style={{ marginBottom: 4 }}>
                <strong>{p.grupo}</strong> —{" "}
                <span style={{ color: DEFICIT_COR[p.tipo] }}>{DEFICIT_LABEL[p.tipo]}</span>{" "}
                <span style={{ color: SEV_COR[p.severidade], fontSize: 11 }}>{p.severidade}</span>
              </li>
            ))}
          </ol>
          <div style={{ ...LABEL, color: C.textDim, marginTop: 8 }}>
            ordem fixa: biomecânico → ativação → volume → estético
          </div>
        </div>
      )}

      {encaminhamentos.length > 0 && (
        <div
          style={{
            marginTop: 14,
            border: `1px solid rgba(226,75,74,0.4)`,
            background: "rgba(226,75,74,0.06)",
            padding: 12,
          }}
        >
          <div style={{ ...LABEL, color: C.red, display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldAlert size={13} /> encaminhamento profissional
          </div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12, color: C.text }}>
            {encaminhamentos.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <div style={{ fontSize: 11, color: C.textSec, marginTop: 6 }}>
            Esta avaliação não substitui fisioterapeuta ou ortopedista.
          </div>
        </div>
      )}

      <div style={{ ...LABEL, color: C.gold, marginTop: 14 }}>
        próxima reavaliação:{" "}
        {proxima.checklist_semanas ? `checklist em ${proxima.checklist_semanas} semanas` : "checklist sem pendência"}
        {" · "}
        {proxima.visual_semanas ? `visual em ${proxima.visual_semanas} semanas` : "visual sem pendência"}
      </div>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12 }}>
      <div style={{ ...LABEL, color: C.cyan, marginBottom: 8 }}>{titulo}</div>
      {children}
    </div>
  );
}

function Prescricao({ prescricao }: { prescricao: PrescricaoApex }) {
  const vazio =
    !prescricao.warmup.length &&
    !prescricao.correcao.length &&
    !prescricao.ativacao.length &&
    !prescricao.priorizacao.length;

  if (vazio) return null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, marginTop: 18 }}>
      <div style={{ ...TITLE, fontSize: 20, letterSpacing: "0.02em" }}>PROTOCOLO PRESCRITO</div>
      <div style={{ color: C.textSec, fontSize: 12, marginTop: 4 }}>
        Gerado a partir do diagnóstico registrado. Exercícios de ativação não contam como treino: volume baixo, carga
        leve, sem falha.
      </div>

      {prescricao.warmup.length > 0 && (
        <Secao titulo="aquecimento prescrito">
          <div style={{ display: "grid", gap: 6 }}>
            {prescricao.warmup.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                <span style={{ ...LABEL, color: w.tag === "[CORRECT]" ? C.red : C.cyan }}>{w.tag}</span>
                <span>{w.descricao}</span>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {prescricao.correcao.map((c) => (
        <Secao key={c.grupo_key} titulo={`correção · ${c.grupo} — ${c.regiao} (${c.regiao_subtitulo})`}>
          <div style={{ fontSize: 12, color: C.textSec, marginBottom: 8 }}>
            Dominante: {c.dominante}
            <br />
            Inibido: {c.inibido}
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {c.itens.map((it, i) => (
              <div key={`${it.exercicio}-${i}`} style={{ fontSize: 13 }}>
                <span style={{ ...LABEL, color: C.gold }}>{it.fase_nome}</span>{" "}
                <strong>{it.exercicio}</strong>{" "}
                <span style={{ color: C.textSec }}>
                  — {it.alvo}
                  {it.series ? ` · ${it.series}` : ""}
                  {it.repsOuDuracao ? ` · ${it.repsOuDuracao}` : ""}
                </span>
              </div>
            ))}
          </div>
          {c.contraindicados.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.textSec }}>
              <div style={{ ...LABEL, color: C.red }}>evitar nesta fase</div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                {c.contraindicados.map((x, i) => (
                  <li key={i}>
                    {x.item} — {x.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Secao>
      ))}

      {prescricao.ativacao.length > 0 && (
        <Secao titulo="ativação pré-treino">
          <div style={{ display: "grid", gap: 6 }}>
            {prescricao.ativacao.map((a) => (
              <div key={a.grupo_key} style={{ fontSize: 13 }}>
                <strong>{a.grupo}</strong>{" "}
                <span style={{ color: C.textSec }}>
                  — ativar {a.alvo}: {a.series}, {a.reps}, {a.carga}, {a.tecnica}. {a.momento}.
                </span>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {prescricao.priorizacao.length > 0 && (
        <Secao titulo="priorização na sessão">
          <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
            {prescricao.priorizacao.map((p, i) => (
              <div key={i}>{p}</div>
            ))}
          </div>
        </Secao>
      )}

      {prescricao.tecnicas.length > 0 && (
        <Secao titulo="técnicas indicadas">
          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
            {prescricao.tecnicas.map((t, i) => (
              <div key={i}>
                <strong>{t.grupo}</strong>{" "}
                <span style={{ color: DEFICIT_COR[t.deficit] }}>{DEFICIT_LABEL[t.deficit]}</span>{" "}
                <span style={{ color: SEV_COR[t.severidade], fontSize: 11 }}>{t.severidade}</span>
                <div style={{ color: C.textSec, fontSize: 12 }}>
                  {t.tecnica} — {t.justificativa}
                </div>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {prescricao.feeders.length > 0 && (
        <Secao titulo="sessões extras (feeder)">
          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
            {prescricao.feeders.map((f, i) => (
              <div key={i}>
                <span style={{ ...LABEL, color: C.gold }}>[FEEDER]</span> <strong>{f.grupo}</strong>{" "}
                <span style={{ color: C.textSec }}>
                  — {f.alvo} · {f.frequencia} · {f.detalhe}
                </span>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {prescricao.nutricao.length > 0 && (
        <Secao titulo="ajustes nutricionais sugeridos">
          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
            {prescricao.nutricao.map((n, i) => (
              <div key={i}>
                <strong>{n.titulo}</strong>
                <div style={{ color: C.textSec, fontSize: 12 }}>{n.detalhe}</div>
              </div>
            ))}
          </div>
        </Secao>
      )}
    </div>
  );
}

function RelatorioAtleta({ texto }: { texto: string }) {
  if (!texto) return null;
  return (
    <div style={{ marginTop: 18, background: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ ...LABEL, color: C.gold, marginBottom: 10 }}>Relatório para o atleta</div>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          lineHeight: 1.7,
          color: C.text,
          margin: 0,
        }}
      >
        {texto}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(texto);
          toast({ title: "Relatório copiado", description: "Pronto para enviar ao atleta." });
        }}
        style={{
          ...LABEL,
          marginTop: 12,
          padding: "10px 16px",
          background: "transparent",
          border: `1px solid ${C.cyan}`,
          color: C.cyan,
          cursor: "pointer",
        }}
      >
        Copiar relatório
      </button>
    </div>
  );
}
