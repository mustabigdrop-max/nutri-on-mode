import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FlaskConical, Search, FileDown, Save, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  EXAMES_CATALOGO, EXAME_BY_ID, PAINEIS, CATEGORIA_LABEL, JEJUM_LABEL,
  autoSuggestPanels, estimateCost, nextRequestDate, PERIODICIDADES,
  type ExameCategoria,
} from "@/data/examesCatalogo";
import { downloadExamRequestPdf } from "@/lib/examRequestPdf";

const T = {
  bg: "#020205",
  bg2: "#0a0a12",
  bg3: "#101018",
  border: "#1c1c28",
  cyan: "#00D4FF",
  text: "#e8e8f0",
  muted: "#8a8a9a",
  amber: "#f0b429",
};

interface PatientOpt { user_id: string; name: string }
interface HistoryRow {
  id: string; patient_name: string | null; exames: any; created_at: string;
  periodicidade: string | null; observacoes: string | null; justificativa: string | null;
  patient_age: number | null; patient_sex: string | null;
}

export default function ExamRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [patientId, setPatientId] = useState("");
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<string>("");
  const [sexo, setSexo] = useState<string>("");
  const [objetivo, setObjetivo] = useState<string>("");
  const [pharmEnabled, setPharmEnabled] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const [activePanels, setActivePanels] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [catAberta, setCatAberta] = useState<ExameCategoria | null>("hematologico");
  const [observacoes, setObservacoes] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [periodicidade, setPeriodicidade] = useState<string>("trimestral");
  const [coachNome, setCoachNome] = useState("");
  const [coachRegistro, setCoachRegistro] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  // Carregar coach + alunos
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
      setCoachNome(prof?.full_name || "");

      const { data: cp } = await supabase
        .from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (cp?.id) {
        const { data: pts } = await supabase
          .from("coach_patients").select("patient_user_id").eq("coach_id", cp.id).eq("status", "active");
        const ids = (pts || []).map((p: any) => p.patient_user_id);
        if (ids.length) {
          const { data: profs } = await supabase
            .from("profiles").select("user_id, full_name").in("user_id", ids);
          setPatients(ids.map((id: string) => ({
            user_id: id,
            name: profs?.find((x: any) => x.user_id === id)?.full_name || "Aluno",
          })));
        }
      }
      loadHistory();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadHistory = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("exam_requests" as any)
      .select("id, patient_name, exames, created_at, periodicidade, observacoes, justificativa, patient_age, patient_sex")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setHistory(((data as any) || []) as HistoryRow[]);
  };

  // Ao selecionar aluno, puxar dados do perfil
  useEffect(() => {
    if (!patientId) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, gender, age, goal")
        .eq("user_id", patientId)
        .maybeSingle();
      if (data) {
        setNome((data as any).full_name || "");
        const g = ((data as any).gender || "").toString().toLowerCase();
        setSexo(g.startsWith("f") ? "F" : g ? "M" : "");
        setIdade((data as any).age ? String((data as any).age) : "");
        setObjetivo((data as any).goal || "");
      }
    })();
  }, [patientId]);

  const sugestoes = useMemo(
    () => autoSuggestPanels({ sexo, idade: idade ? Number(idade) : null, objetivo, pharmEnabled, pharmProfile: pharmEnabled ? "suporte" : "natural" }),
    [sexo, idade, objetivo, pharmEnabled]
  );

  const togglePanel = (id: string) => {
    const exames = PAINEIS[id]?.exames || [];
    if (activePanels.includes(id)) {
      setActivePanels((p) => p.filter((x) => x !== id));
      const outros = activePanels.filter((x) => x !== id).flatMap((x) => PAINEIS[x]?.exames || []);
      setSelected((s) => s.filter((e) => !exames.includes(e) || outros.includes(e)));
    } else {
      setActivePanels((p) => [...p, id]);
      setSelected((s) => [...new Set([...s, ...exames])]);
    }
  };

  const toggleExame = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const aplicarSugestoes = () => {
    const exames = sugestoes.flatMap((p) => PAINEIS[p]?.exames || []);
    setActivePanels(sugestoes);
    setSelected([...new Set(exames)]);
    toast.success(`${sugestoes.length} painéis sugeridos aplicados`);
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return EXAMES_CATALOGO.filter((e) =>
      !q || e.nome.toLowerCase().includes(q) || e.nomeCompleto.toLowerCase().includes(q) ||
      (e.sigla || "").toLowerCase().includes(q) || e.tags.some((t) => t.includes(q))
    );
  }, [busca]);

  const porCategoria = useMemo(() => {
    return filtrados.reduce<Record<string, typeof EXAMES_CATALOGO>>((acc, e) => {
      (acc[e.categoria] ||= []).push(e);
      return acc;
    }, {});
  }, [filtrados]);

  const custo = estimateCost(selected);
  const jejumMax = selected.some((id) => EXAME_BY_ID[id]?.jejum === "sim_12h")
    ? "Jejum de 12h" : selected.some((id) => EXAME_BY_ID[id]?.jejum === "sim_8h")
    ? "Jejum de 8h" : "Sem jejum obrigatório";
  const proxima = nextRequestDate(periodicidade);

  const pdfData = () => ({
    coachNome: coachNome || "Profissional responsável",
    coachRegistro,
    pacienteNome: nome,
    pacienteIdade: idade ? Number(idade) : null,
    pacienteSexo: sexo,
    exameIds: selected,
    observacoes,
    justificativa,
    periodicidadeLabel: PERIODICIDADES.find((p) => p.id === periodicidade)?.label,
    proximaSolicitacao: proxima ? proxima.toLocaleDateString("pt-BR") : null,
  });

  const gerarPdf = () => {
    if (!selected.length) return toast.error("Selecione ao menos 1 exame");
    if (!nome.trim()) return toast.error("Informe o nome do paciente");
    downloadExamRequestPdf(pdfData());
  };

  const salvar = async () => {
    if (!user?.id) return;
    if (!selected.length) return toast.error("Selecione ao menos 1 exame");
    setSaving(true);
    const { error } = await supabase.from("exam_requests" as any).insert({
      coach_id: user.id,
      patient_user_id: patientId || null,
      patient_name: nome || null,
      patient_age: idade ? Number(idade) : null,
      patient_sex: sexo || null,
      exames: selected,
      paineis: activePanels,
      observacoes: observacoes || null,
      justificativa: justificativa || null,
      periodicidade,
      proxima_solicitacao: proxima ? proxima.toISOString().slice(0, 10) : null,
    });
    setSaving(false);
    if (error) return toast.error("Erro ao salvar solicitação");
    toast.success("Solicitação salva");
    loadHistory();
  };

  const reabrir = (h: HistoryRow) => {
    setNome(h.patient_name || "");
    setIdade(h.patient_age ? String(h.patient_age) : "");
    setSexo(h.patient_sex || "");
    setSelected(Array.isArray(h.exames) ? h.exames : []);
    setObservacoes(h.observacoes || "");
    setJustificativa(h.justificativa || "");
    setPeriodicidade(h.periodicidade || "trimestral");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, padding: "16px 14px 90px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/coach")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: T.muted, fontSize: 12, cursor: "pointer", marginBottom: 12 }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <FlaskConical size={22} color={T.cyan} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: ".02em" }}>Pedido de Exames Laboratoriais</h1>
            <p style={{ fontSize: 11.5, color: T.muted }}>
              Monte painéis, gere o documento em PDF e acompanhe a periodicidade de reavaliação.
            </p>
          </div>
        </div>

        {/* Paciente */}
        <Section title="Paciente">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
            <Field label="Aluno vinculado">
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} style={inputStyle}>
                <option value="">Avulso / manual</option>
                {patients.map((p) => <option key={p.user_id} value={p.user_id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Nome">
              <input value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} placeholder="Nome completo" />
            </Field>
            <Field label="Idade">
              <input value={idade} onChange={(e) => setIdade(e.target.value.replace(/\D/g, ""))} style={inputStyle} placeholder="anos" />
            </Field>
            <Field label="Sexo">
              <select value={sexo} onChange={(e) => setSexo(e.target.value)} style={inputStyle}>
                <option value="">—</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </Field>
            <Field label="Objetivo">
              <input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} style={inputStyle} placeholder="ex: emagrecimento, performance" />
            </Field>
            <Field label="Suporte farmacológico">
              <button onClick={() => setPharmEnabled((v) => !v)} style={{ ...inputStyle, textAlign: "left", cursor: "pointer", color: pharmEnabled ? T.amber : T.muted }}>
                {pharmEnabled ? "Sim — inclui hepático/renal" : "Não"}
              </button>
            </Field>
          </div>
        </Section>

        {/* Sugestão inteligente */}
        <Section title="Sugestão inteligente">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
            {sugestoes.map((s) => (
              <span key={s} style={{ fontSize: 11, padding: "4px 9px", borderRadius: 999, border: `1px solid ${PAINEIS[s].cor}55`, color: PAINEIS[s].cor, background: `${PAINEIS[s].cor}11` }}>
                {PAINEIS[s].nome}
              </span>
            ))}
            <button onClick={aplicarSugestoes} style={{ ...btnPrimary, marginLeft: "auto" }}>
              <Sparkles size={13} /> Aplicar sugestões
            </button>
          </div>
          <div style={{ fontSize: 11, color: T.muted }}>
            Baseado em sexo, idade, objetivo e uso de suporte farmacológico do paciente.
          </div>
        </Section>

        {/* Painéis */}
        <Section title="Painéis">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
            {Object.entries(PAINEIS).map(([id, p]) => {
              const on = activePanels.includes(id);
              return (
                <button key={id} onClick={() => togglePanel(id)}
                  style={{
                    textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer",
                    background: on ? `${p.cor}14` : T.bg3,
                    border: `1px solid ${on ? p.cor : T.border}`, color: T.text, fontFamily: "inherit",
                  }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: on ? p.cor : T.text }}>{p.nome}</div>
                  <div style={{ fontSize: 10.5, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{p.descricao}</div>
                  <div style={{ fontSize: 10, color: p.cor, marginTop: 6 }}>{p.exames.length} exames</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Catálogo */}
        <Section title={`Exames individuais (${selected.length} selecionados)`}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={14} color={T.muted} style={{ position: "absolute", left: 10, top: 11 }} />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar exame, sigla ou tag..."
              style={{ ...inputStyle, paddingLeft: 30 }} />
          </div>

          {Object.entries(porCategoria).map(([cat, list]) => {
            const aberta = busca ? true : catAberta === cat;
            const marcados = list.filter((e) => selected.includes(e.id)).length;
            return (
              <div key={cat} style={{ marginBottom: 8, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setCatAberta(aberta && !busca ? null : (cat as ExameCategoria))}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: T.bg3, border: "none", color: T.text, cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{CATEGORIA_LABEL[cat as ExameCategoria] ?? cat}</span>
                  <span style={{ fontSize: 11, color: marcados ? T.cyan : T.muted }}>{marcados}/{list.length}</span>
                </button>
                {aberta && (
                  <div style={{ padding: 8, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 6 }}>
                    {list.map((e) => {
                      const on = selected.includes(e.id);
                      return (
                        <button key={e.id} onClick={() => toggleExame(e.id)}
                          style={{
                            textAlign: "left", padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                            background: on ? "#00d4ff11" : "transparent",
                            border: `1px solid ${on ? T.cyan : T.border}`, color: T.text,
                          }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{e.nome}</div>
                          <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                            {JEJUM_LABEL[e.jejum]} · {e.material}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </Section>

        {/* Resumo */}
        <Section title="Resumo e emissão">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
            <Stat label="Exames" value={String(selected.length)} />
            <Stat label="Preparo" value={jejumMax} />
            <Stat label="Custo estimado" value={`R$ ${custo.min}–${custo.max}`} />
            <Stat label="Próxima coleta" value={proxima ? proxima.toLocaleDateString("pt-BR") : "—"} />
          </div>

          {selected.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {selected.map((id) => (
                <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, padding: "4px 8px", borderRadius: 999, background: T.bg3, border: `1px solid ${T.border}` }}>
                  {EXAME_BY_ID[id]?.nome ?? id}
                  <X size={11} style={{ cursor: "pointer", color: T.muted }} onClick={() => toggleExame(id)} />
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 12 }}>
            <Field label="Periodicidade">
              <select value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value)} style={inputStyle}>
                {PERIODICIDADES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Registro profissional (opcional)">
              <input value={coachRegistro} onChange={(e) => setCoachRegistro(e.target.value)} style={inputStyle} placeholder="ex: CRN 12345" />
            </Field>
          </div>

          <Field label="Justificativa clínica">
            <textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Motivo da solicitação" />
          </Field>
          <div style={{ height: 10 }} />
          <Field label="Observações / preparo adicional">
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Instruções ao paciente" />
          </Field>

          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={gerarPdf} style={btnPrimary}><FileDown size={14} /> Gerar PDF</button>
            <button onClick={salvar} disabled={saving} style={btnGhost}><Save size={14} /> {saving ? "Salvando..." : "Salvar solicitação"}</button>
          </div>

          <p style={{ fontSize: 10, color: T.muted, marginTop: 12, lineHeight: 1.5 }}>
            Este módulo organiza a solicitação de exames dentro das atribuições legais do profissional emitente.
            Nenhum diagnóstico ou prescrição medicamentosa é gerado pelo sistema.
          </p>
        </Section>

        {history.length > 0 && (
          <Section title="Histórico de solicitações">
            {history.map((h) => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{h.patient_name || "Paciente"}</div>
                  <div style={{ fontSize: 10.5, color: T.muted }}>
                    {new Date(h.created_at).toLocaleDateString("pt-BR")} · {(Array.isArray(h.exames) ? h.exames.length : 0)} exames · {h.periodicidade || "—"}
                  </div>
                </div>
                <button onClick={() => reabrir(h)} style={{ ...btnGhost, padding: "6px 10px", fontSize: 11 }}>Reabrir</button>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 11px", borderRadius: 8, background: T.bg3,
  border: `1px solid ${T.border}`, color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 8,
  background: T.cyan, border: "none", color: "#001018", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};

const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 8,
  background: T.bg3, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: T.cyan, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.cyan, marginTop: 4 }}>{value}</div>
    </div>
  );
}
