import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  TrainingSchedule,
  WeeklySchedule,
  defaultWeeklySchedule,
  buildTrainingSchedulePrompt,
} from "@/components/coach/TrainingSchedule";

// ─── Design tokens (alinhados ao nutriON: dark bg, green accent) ──────────────
const T = {
  bg:      "#0a0f0a",
  bg2:     "#111811",
  bg3:     "#161e16",
  card:    "#0f1a0f",
  border:  "#1f2e1f",
  border2: "#2a3d2a",
  green:   "#4ade80",
  greenDim:"#22c55e",
  greenBg: "#0d1f0d",
  text:    "#e8f0e8",
  muted:   "#6b8f6b",
  muted2:  "#4a634a",
  red:     "#f87171",
  amber:   "#fbbf24",
  blue:    "#60a5fa",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
    {children}{required && <span style={{ color: T.green, marginLeft: 2 }}>*</span>}
  </label>
);

const InputField = ({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { style?: React.CSSProperties }) => (
  <input {...props} style={{
    width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
    borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13,
    outline: "none", transition: "border-color .2s",
    fontFamily: "inherit", ...style
  }}
    onFocus={e => (e.target as HTMLInputElement).style.borderColor = T.green}
    onBlur={e => (e.target as HTMLInputElement).style.borderColor = T.border2}
  />
);

const SelectField = ({ children, style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { style?: React.CSSProperties }) => (
  <select {...props} style={{
    width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
    borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13,
    outline: "none", transition: "border-color .2s", fontFamily: "inherit",
    cursor: "pointer", ...style
  }}
    onFocus={e => (e.target as HTMLSelectElement).style.borderColor = T.green}
    onBlur={e => (e.target as HTMLSelectElement).style.borderColor = T.border2}
  >
    {children}
  </select>
);

const TextareaField = ({ style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { style?: React.CSSProperties }) => (
  <textarea {...props} style={{
    width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
    borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13,
    outline: "none", resize: "vertical" as const, minHeight: 80, fontFamily: "inherit",
    transition: "border-color .2s", ...style
  }}
    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = T.green}
    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = T.border2}
  />
);

const Tag = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 999, fontSize: 12, cursor: "pointer",
    border: `1px solid ${active ? T.green : T.border2}`,
    background: active ? T.greenBg : "transparent",
    color: active ? T.green : T.muted,
    transition: "all .15s", fontFamily: "inherit"
  }}>{label}</button>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 16, height: 1, background: T.green }} />
      {title}
    </div>
    {children}
  </div>
);

// ─── Meal display ─────────────────────────────────────────────────────────────
type GrupoSub = "proteina" | "carbo" | "gordura" | "outro";
interface SubstituicaoItem {
  alimento: string;
  quantidade?: string;
  observacao?: string;
  grupo?: GrupoSub;
}
interface MealAlimento {
  alimento: string;
  quantidade?: string;
  observacao?: string;
  substituicoes?: SubstituicaoItem[];
}

interface Meal {
  refeicao: string;
  horario?: string;
  calorias?: number;
  alimentos?: MealAlimento[];
  macros?: { proteina?: number; carboidrato?: number; gordura?: number };
}

interface Suplemento {
  suplemento: string;
  dose: string;
  timing: string;
  justificativa: string;
}

interface PlanoData {
  resumo: {
    nome: string;
    objetivo: string;
    calorias_totais: number;
    proteina_total: number;
    carboidrato_total: number;
    gordura_total: number;
    tmb: number;
    get: number;
    imc: string;
    observacao_protocolo?: string | null;
  };
  refeicoes: Meal[];
  suplementacao?: Suplemento[];
  dica_mce?: { mindset: string; comportamento: string; execucao: string };
  alerta_coach?: string | null;
}

const GRUPO_META: Record<GrupoSub, { label: string; color: string; emoji: string }> = {
  proteina: { label: "Proteína", color: T.blue, emoji: "🥩" },
  carbo: { label: "Carbo", color: T.amber, emoji: "🍚" },
  gordura: { label: "Gordura", color: "#f472b6", emoji: "🥑" },
  outro: { label: "Outro", color: T.muted, emoji: "🍽️" },
};

const inferGrupo = (s: SubstituicaoItem): GrupoSub => {
  if (s.grupo && GRUPO_META[s.grupo]) return s.grupo;
  const t = (s.alimento || "").toLowerCase();
  if (/(frango|carne|peixe|atum|tilapia|salmão|salmao|ovo|clara|whey|isolado|caseína|caseina|iogurte|cottage|queijo|tofu|presunto|peru|patinho|alcatra)/.test(t)) return "proteina";
  if (/(arroz|batata|mandioca|inhame|aveia|pão|pao|tapioca|macarrão|macarrao|feijão|feijao|lentilha|grão|grao|fruta|banana|maçã|maca|melão|melao|mamão|mamao|uva|laranja|cuscuz|granola|cereal)/.test(t)) return "carbo";
  if (/(azeite|óleo|oleo|abacate|castanha|amêndoa|amendoa|nozes|amendoim|pasta de amendoim|coco|manteiga|gergelim|chia|linhaça|linhaca)/.test(t)) return "gordura";
  return "outro";
};

interface MealCardProps {
  meal: Meal;
  index: number;
  onSwap: (alimentoIdx: number, sub: SubstituicaoItem) => void;
}

const MealCard = ({ meal, index, onSwap }: MealCardProps) => {
  const colors = [T.green, T.blue, T.amber, "#a78bfa", "#f472b6", "#34d399", "#fb923c"];
  const color = colors[index % colors.length];
  const [openSubs, setOpenSubs] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<Record<number, GrupoSub | "todos">>({});
  const [search, setSearch] = useState<Record<number, string>>({});

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12, background: T.card }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: color, borderRadius: 2 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{meal.refeicao}</span>
          {meal.horario && <span style={{ fontSize: 11, color: T.muted, background: T.bg3, padding: "2px 8px", borderRadius: 999 }}>{meal.horario}</span>}
        </div>
        {meal.calorias && (
          <span style={{ fontSize: 12, color, fontWeight: 600 }}>{meal.calorias} kcal</span>
        )}
      </div>
      <div style={{ padding: "12px 16px" }}>
        {meal.alimentos?.map((a, i) => {
          const subs: SubstituicaoItem[] = (a.substituicoes || []).map((s) => ({ ...s, grupo: inferGrupo(s) }));
          const open = !!openSubs[i];
          const f = filter[i] || "todos";
          const q = (search[i] || "").trim().toLowerCase();
          const filteredSubs = subs.filter((s) =>
            (f === "todos" || s.grupo === f) &&
            (!q || s.alimento.toLowerCase().includes(q))
          );

          return (
            <div key={i} style={{ padding: "6px 0", borderBottom: i < (meal.alimentos?.length || 0) - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: T.text }}>{a.alimento}</span>
                  {a.observacao && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{a.observacao}</div>}
                  {subs.length > 0 && (
                    <button
                      onClick={() => setOpenSubs((s) => ({ ...s, [i]: !s[i] }))}
                      style={{
                        marginTop: 6, padding: "3px 10px", borderRadius: 999,
                        background: open ? T.greenBg : "transparent",
                        border: `1px solid ${open ? T.green : T.border2}`,
                        color: open ? T.green : T.muted,
                        fontSize: 10, cursor: "pointer", fontFamily: "inherit",
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                    >
                      ⇄ {subs.length} substituto{subs.length > 1 ? "s" : ""} {open ? "▲" : "▼"}
                    </button>
                  )}
                </div>
                {a.quantidade && <span style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{a.quantidade}</span>}
              </div>

              {open && subs.length > 0 && (
                <div style={{ marginTop: 10, padding: 12, background: T.bg2, border: `1px dashed ${T.border2}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 9, color: T.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 700 }}>
                    Substitutos isocalóricos
                  </div>

                  <input
                    value={search[i] || ""}
                    onChange={(e) => setSearch((s) => ({ ...s, [i]: e.target.value }))}
                    placeholder="Buscar substituto..."
                    style={{
                      width: "100%", background: T.bg3, border: `1px solid ${T.border2}`,
                      borderRadius: 8, padding: "7px 10px", color: T.text, fontSize: 12,
                      outline: "none", fontFamily: "inherit", marginBottom: 8,
                    }}
                  />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {(["todos", "proteina", "carbo", "gordura"] as const).map((g) => {
                      const active = f === g;
                      const meta = g === "todos" ? { label: "Todos", color: T.green, emoji: "✦" } : GRUPO_META[g];
                      return (
                        <button
                          key={g}
                          onClick={() => setFilter((s) => ({ ...s, [i]: g }))}
                          style={{
                            padding: "3px 10px", borderRadius: 999, fontSize: 10,
                            border: `1px solid ${active ? meta.color : T.border2}`,
                            background: active ? `${meta.color}22` : "transparent",
                            color: active ? meta.color : T.muted,
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >
                          {meta.emoji} {meta.label}
                        </button>
                      );
                    })}
                  </div>

                  {filteredSubs.length === 0 ? (
                    <div style={{ fontSize: 11, color: T.muted2, textAlign: "center", padding: "10px 0" }}>
                      Nenhum substituto encontrado.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                      {filteredSubs.map((sub, si) => {
                        const meta = GRUPO_META[(sub.grupo as GrupoSub) || "outro"];
                        return (
                          <div
                            key={si}
                            style={{
                              background: T.bg3, border: `1px solid ${T.border2}`,
                              borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6,
                            }}
                          >
                            <span style={{
                              alignSelf: "flex-start",
                              fontSize: 9, padding: "2px 6px", borderRadius: 999,
                              background: `${meta.color}22`, color: meta.color, fontWeight: 700,
                              textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>{meta.emoji} {meta.label}</span>
                            <div style={{ fontSize: 12, color: T.text, fontWeight: 600, lineHeight: 1.3 }}>{sub.alimento}</div>
                            {sub.quantidade && <div style={{ fontSize: 11, color: T.muted }}>{sub.quantidade}</div>}
                            {sub.observacao && <div style={{ fontSize: 10, color: T.muted2, fontStyle: "italic" }}>{sub.observacao}</div>}
                            <button
                              onClick={() => onSwap(i, sub)}
                              style={{
                                marginTop: 2, padding: "5px 8px", borderRadius: 6,
                                background: T.greenBg, border: `1px solid ${T.green}`,
                                color: T.green, fontSize: 10, fontWeight: 700,
                                cursor: "pointer", fontFamily: "inherit",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                              }}
                            >
                              ⇄ Trocar agora
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {meal.macros && (
          <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
            {([["P", meal.macros.proteina, T.blue], ["C", meal.macros.carboidrato, T.amber], ["G", meal.macros.gordura, "#f472b6"]] as [string, number | undefined, string][]).map(([l, v, c]) => v != null && (
              <div key={l} style={{ fontSize: 11, color: T.muted }}>
                <span style={{ color: c, fontWeight: 700 }}>{l} </span>{v}g
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlanoAlimentarIA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [plano, setPlano] = useState<PlanoData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [patients, setPatients] = useState<{ user_id: string; name: string }[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [sendObs, setSendObs] = useState("");
  const [sending, setSending] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load coach profile + patients
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: cp } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cp?.id) return;
      setCoachProfileId(cp.id);

      const { data: pts } = await supabase
        .from("coach_patients")
        .select("patient_user_id")
        .eq("coach_id", cp.id)
        .eq("status", "active");

      if (pts?.length) {
        const ids = pts.map((p) => p.patient_user_id);
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", ids);
        setPatients(
          pts.map((p) => ({
            user_id: p.patient_user_id,
            name: profs?.find((x) => x.user_id === p.patient_user_id)?.full_name || "Aluno",
          }))
        );
      }
    })();
  }, [user?.id]);

  const [form, setForm] = useState({
    nome: "", idade: "", sexo: "masculino", peso: "", altura: "",
    objetivo: "emagrecimento", perfilPCA: "executor",
    nivelAtividade: "moderado", treino: "musculacao",
    restricoes: [] as string[], outraRestricao: "",
    preferencias: "", suplementos: "", observacoes: "",
    refeicoes: "5", calorias: "", protocolo: "nenhum",
    // Fase de periodização
    fasePeriodizacao: "manutencao_offseason",
    bfAtual: "", bfMeta: "", dataCompeticao: "",
    // Cardio
    fazCardio: false,
    cardioModalidades: [] as string[],
    cardioFrequencia: "3x",
    cardioDuracao: "30min",
    cardioQuando: "pos_treino",
    cardioNoCalculo: true,
    // Recursos ergogênicos
    protocoloFarmacologico: "",
    atletaCompetitivo: false,
    federacaoCategoria: "",
    // GLUT-4 Pós-Treino
    glut4Enabled: false,
    glut4UsesIntraMalto: true,
    glut4IntraMaltoG: "60",
    glut4TimingMin: "30",
    glut4CarbSource: "doce_de_leite",
    glut4CarbGrams: "",
    glut4AddLeucine: false,
  });

  // GLUT-4 output state
  const [glut4Text, setGlut4Text] = useState<string>("");
  const [glut4Loading, setGlut4Loading] = useState(false);

  // Rotina de treino semanal (TrainingSchedule)
  const [trainingSchedule, setTrainingSchedule] = useState<WeeklySchedule>(defaultWeeklySchedule);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k: string, v: string) => {
    const arr = (form as any)[k] as string[];
    set(k, arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v]);
  };

  const restricoesOpts = ["Lactose", "Glúten", "Frutos do mar", "Amendoim", "Ovo", "Soja", "Vegetariano", "Vegano", "Sem carne vermelha", "Sem porco"];
  const protocolos = [
    { v: "nenhum", l: "Sem protocolo específico" },
    { v: "glp1", l: "GLP-1 / Análogos (Sema, Retrat, Tirze)" },
    { v: "bpc157", l: "BPC-157 / TB-500 (Recuperação)" },
    { v: "gh", l: "GH Secretagogos (Ipamorelin / CJC)" },
    { v: "folistatina", l: "Folistatina-344 (Hipertrofia)" },
    { v: "longevidade", l: "Peptídeos Longevidade (Epithalon, MOTS-c)" },
    { v: "cognicao", l: "Nootrópicos (Semax / Selank)" },
  ];

  const gerarGlut4 = async () => {
    if (!form.peso) {
      toast({ title: "Peso obrigatório", description: "Informe o peso para calcular a janela GLUT-4.", variant: "destructive" });
      return;
    }
    setGlut4Loading(true);
    try {
      const { data, error } = await supabase.functions.invoke("glut4-strategy", {
        body: {
          patient_name: form.nome || "Paciente",
          weight_kg: Number(form.peso),
          objective: form.objetivo,
          periodization_phase: form.fasePeriodizacao,
          uses_intra_malto: form.glut4UsesIntraMalto,
          intra_malto_grams: Number(form.glut4IntraMaltoG) || 0,
          timing_minutes: Number(form.glut4TimingMin) || 30,
          carb_source: form.glut4CarbSource,
          carb_grams: form.glut4CarbGrams ? Number(form.glut4CarbGrams) : null,
          add_leucine: form.glut4AddLeucine,
          ergogenic_protocol: form.protocoloFarmacologico || null,
          plan_context: null,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setGlut4Text((data as any)?.text || "");
      toast({ title: "Janela GLUT-4 gerada ⚡", description: "Bloco fisiológico pronto para o plano." });
    } catch (e: any) {
      toast({ title: "Erro GLUT-4", description: e?.message || "Falha ao gerar bloco.", variant: "destructive" });
    } finally {
      setGlut4Loading(false);
    }
  };

  const gerar = async () => {
    if (!form.peso || !form.altura || !form.idade) {
      setError("Preencha pelo menos: peso, altura e idade do paciente.");
      return;
    }
    setError("");
    setStep("loading");

    const msgs = [
      "Calculando TMB e GET do paciente...",
      "Analisando perfil PCA e objetivo...",
      "Distribuindo macronutrientes...",
      "Selecionando alimentos e porções...",
      "Integrando estratégias do protocolo...",
      "Aplicando Método MCE ao plano...",
      "Finalizando plano alimentar...",
    ];
    let mi = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      mi = (mi + 1) % msgs.length;
      setLoadingMsg(msgs[mi]);
    }, 1800);

    try {
      const restricoesStr = [...form.restricoes, form.outraRestricao].filter(Boolean).join(", ") || "Nenhuma";
      const protocStr = protocolos.find(p => p.v === form.protocolo)?.l || "Nenhum";

      const trainingSchedulePrompt = buildTrainingSchedulePrompt(
        trainingSchedule,
        form.peso ? Number(form.peso) : undefined,
        form.calorias ? Number(form.calorias) : undefined,
      );

      const { data, error: fnError } = await supabase.functions.invoke("generate-coach-meal-plan", {
        body: {
          ...form,
          restricoesStr,
          protocStr,
          userId: user?.id,
          trainingSchedule,
          trainingSchedulePrompt,
        },
      });

      clearInterval(interval);

      if (fnError) throw fnError;

      if (data?.plan) {
        setPlano(data.plan);
        setStep("result");
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        throw new Error("Resposta inválida da IA");
      }
    } catch (e: any) {
      clearInterval(interval);
      console.error(e);
      setError("Erro ao gerar o plano. Verifique a conexão e tente novamente.");
      setStep("form");
    }
  };

  const copiarJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(plano, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const salvarPlano = async (): Promise<string | null> => {
    if (!plano || !coachProfileId) {
      toast({ title: "Coach não identificado", variant: "destructive" });
      return null;
    }
    if (savedId) return savedId;
    setSaving(true);
    try {
      const { data, error: insErr } = await supabase
        .from("coach_meal_plans")
        .insert({
          coach_id: coachProfileId,
          patient_name: plano.resumo.nome || form.nome || "Paciente",
          objetivo: plano.resumo.objetivo || form.objetivo,
          plano: plano as any,
          observacao: form.observacoes || null,
          status: "draft",
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      setSavedId(data.id);
      toast({ title: "Plano salvo ✅", description: "Disponível no histórico do coach." });
      return data.id;
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const enviarPlano = async () => {
    if (!plano || !coachProfileId || !user?.id) return;
    if (!selectedPatient) {
      toast({ title: "Selecione um aluno", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      let planId = savedId;
      if (!planId) {
        const { data, error: insErr } = await supabase
          .from("coach_meal_plans")
          .insert({
            coach_id: coachProfileId,
            patient_user_id: selectedPatient,
            patient_name: plano.resumo.nome || form.nome || "Paciente",
            objetivo: plano.resumo.objetivo || form.objetivo,
            plano: plano as any,
            observacao: sendObs || form.observacoes || null,
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        planId = data.id;
      } else {
        const { error: upErr } = await supabase
          .from("coach_meal_plans")
          .update({
            patient_user_id: selectedPatient,
            status: "sent",
            sent_at: new Date().toISOString(),
            observacao: sendObs || form.observacoes || null,
          })
          .eq("id", planId);
        if (upErr) throw upErr;
      }
      setSavedId(planId);

      await supabase.from("protocolo_envios").insert({
        coach_id: coachProfileId,
        destinatario_id: selectedPatient,
        tipo_destinatario: "aluno",
        tipo_conteudo: ["plano_alimentar"],
        conteudo_ids: { plano_alimentar: [planId] },
        observacao: sendObs || null,
        status: "enviado",
      });

      const titulo = "Novo plano alimentar recebido!";
      const corpo = `Seu coach enviou um novo plano alimentar.${sendObs ? ` ${sendObs}` : ""}`;
      await supabase.from("coach_notifications").insert({
        recipient_user_id: selectedPatient,
        sender_user_id: user.id,
        notification_type: "meal_plan_sent",
        title: titulo,
        message: corpo,
        reference_id: planId,
      });

      try {
        await supabase.functions.invoke("dispara_notificacao", {
          body: { destinatario_id: selectedPatient, titulo, corpo, referencia_id: planId, tipo: "plano_alimentar" },
        });
      } catch {}

      toast({ title: "Plano enviado 📨", description: `Para ${patients.find((p) => p.user_id === selectedPatient)?.name || "aluno"}` });
      setShowSendModal(false);
      setSendObs("");
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const exportPDF = () => {
    if (!plano) return;
    const r = plano.resumo;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Plano Alimentar - ${r.nome}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1a1a}
      h1{color:#10b981;border-bottom:2px solid #10b981;padding-bottom:8px}
      .meta{display:flex;gap:24px;margin:16px 0;flex-wrap:wrap}
      .meta-box{background:#f0fdf4;padding:12px 20px;border-radius:8px;text-align:center}
      .meta-box span{font-size:24px;font-weight:bold;color:#059669;display:block}
      .meal{background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0}
      .meal h3{margin:0 0 8px;color:#065f46}
      .alimento{padding:6px 0;border-bottom:1px dashed #e5e7eb}
      .alimento:last-child{border-bottom:none}
      .subs{margin:6px 0 4px 14px;padding:8px;background:#ecfdf5;border:1px dashed #10b98155;border-radius:6px}
      .subs-title{font-size:10px;color:#059669;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
      .subs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px}
      .sub-card{background:#fff;border:1px solid #d1fae5;border-radius:6px;padding:6px 8px;font-size:11px}
      .sub-badge{display:inline-block;font-size:9px;padding:1px 6px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
      .sub-name{font-weight:600;color:#1f2937}
      .sub-qty{color:#6b7280;font-size:10px}
      .sub-obs{color:#9ca3af;font-size:9px;font-style:italic;margin-top:2px}
      .macros{display:flex;gap:16px;margin-top:8px;font-size:13px;color:#6b7280}
      .tip{font-style:italic;color:#059669;font-size:12px;margin-top:6px}
      .footer{margin-top:32px;text-align:center;color:#9ca3af;font-size:11px}
    </style></head><body>
      <h1>🥗 Plano Alimentar — ${r.nome}</h1>
      <p>Objetivo: ${r.objetivo} | Calorias: ${r.calorias_totais} kcal | P: ${r.proteina_total}g | C: ${r.carboidrato_total}g | G: ${r.gordura_total}g</p>
      <div class="meta">
        <div class="meta-box"><span>${r.tmb}</span>TMB (kcal)</div>
        <div class="meta-box"><span>${r.get}</span>GET (kcal)</div>
        <div class="meta-box"><span>${r.calorias_totais}</span>VET (kcal)</div>
        <div class="meta-box"><span>${r.imc}</span>IMC</div>
      </div>
      ${glut4Text ? `
        <div style="background:#f0fdf4;border:2px solid #4ade80;border-radius:10px;padding:16px;margin:16px 0;">
          <h3 style="color:#166534;margin:0 0 8px 0;">⚡ Estratégia GLUT-4 Pós-Treino</h3>
          <pre style="white-space:pre-wrap;font-family:inherit;font-size:12px;color:#1f2937;margin:0;line-height:1.6;">${glut4Text.replace(/</g, "&lt;")}</pre>
        </div>
      ` : ""}
      ${plano.refeicoes.map(m => `
        <div class="meal">
          <h3>${m.refeicao} — ${m.horario || ""}</h3>
          ${m.alimentos?.map(a => {
            const subs = (a.substituicoes || []).map(s => ({ ...s, grupo: inferGrupo(s) }));
            return `
            <div class="alimento">
              <div><b>${a.alimento}</b> — ${a.quantidade || ""}${a.observacao ? ` <i style="color:#6b7280">(${a.observacao})</i>` : ""}</div>
              ${subs.length ? `
                <div class="subs">
                  <div class="subs-title">⇄ Substitutos isocalóricos</div>
                  <div class="subs-grid">
                    ${subs.map(s => {
                      const meta = GRUPO_META[(s.grupo as GrupoSub) || "outro"];
                      return `<div class="sub-card">
                        <span class="sub-badge" style="background:${meta.color}22;color:${meta.color}">${meta.emoji} ${meta.label}</span>
                        <div class="sub-name">${s.alimento}</div>
                        ${s.quantidade ? `<div class="sub-qty">${s.quantidade}</div>` : ""}
                        ${s.observacao ? `<div class="sub-obs">${s.observacao}</div>` : ""}
                      </div>`;
                    }).join("")}
                  </div>
                </div>
              ` : ""}
            </div>
          `;}).join("") || ""}
          <div class="macros">🔥 ${m.calorias || 0} kcal | P: ${m.macros?.proteina || 0}g | C: ${m.macros?.carboidrato || 0}g | G: ${m.macros?.gordura || 0}g</div>
        </div>
      `).join("")}
      ${plano.suplementacao?.length ? `<h2>Suplementação</h2>${plano.suplementacao.map(s => `<div class="meal"><h3>${s.suplemento}</h3><p>Dose: ${s.dose} | Timing: ${s.timing}</p><p class="tip">${s.justificativa}</p></div>`).join("")}` : ""}
      ${plano.dica_mce ? `<h2>Método MCE</h2><p><b>Mindset:</b> ${plano.dica_mce.mindset}</p><p><b>Comportamento:</b> ${plano.dica_mce.comportamento}</p><p><b>Execução:</b> ${plano.dica_mce.execucao}</p>` : ""}
      <div class="footer">Gerado por NUTRION — Plataforma de Nutrição Inteligente</div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  // ── LOADING ──
  if (step === "loading") return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 32px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${T.border2}` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid transparent`, borderTopColor: T.green, animation: "spin 1s linear infinite" }} />
          <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: `1px solid ${T.border}`, borderBottomColor: T.greenDim, animation: "spin 1.5s linear infinite reverse" }} />
        </div>
        <div style={{ fontSize: 13, color: T.green, fontWeight: 600, marginBottom: 8 }}>Gerando plano alimentar</div>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, minHeight: 36, transition: "all .3s" }}>{loadingMsg}</div>
      </div>
    </div>
  );

  // ── RESULT ──
  if (step === "result" && plano) {
    const r = plano.resumo;
    const macroP = r.proteina_total && r.calorias_totais ? Math.round((r.proteina_total * 4 / r.calorias_totais) * 100) : 0;
    const macroC = r.carboidrato_total && r.calorias_totais ? Math.round((r.carboidrato_total * 4 / r.calorias_totais) * 100) : 0;
    const macroG = r.gordura_total && r.calorias_totais ? Math.round((r.gordura_total * 9 / r.calorias_totais) * 100) : 0;

    return (
      <div ref={resultRef} style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .4s ease both}`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg2 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>nutriON · Dashboard do Coach</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 4 }}>Plano Alimentar — {r.nome}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <button onClick={copiarJSON} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {copied ? "✓ Copiado" : "Copiar JSON"}
            </button>
            <button onClick={exportPDF} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              📄 PDF
            </button>
            <button onClick={() => salvarPlano()} disabled={saving || !!savedId} style={{ padding: "8px 16px", borderRadius: 8, background: savedId ? T.greenBg : T.bg3, border: `1px solid ${savedId ? T.green : T.border2}`, color: savedId ? T.green : T.text, fontSize: 12, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Salvando..." : savedId ? "✓ Salvo" : "💾 Salvar"}
            </button>
            <button onClick={() => setShowSendModal(true)} style={{ padding: "8px 16px", borderRadius: 8, background: T.green, border: `1px solid ${T.green}`, color: "#0a0f0a", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
              📨 Enviar ao aluno
            </button>
            <button onClick={() => { setPlano(null); setSavedId(null); setStep("form"); }} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              + Novo
            </button>
          </div>
        </div>

        {showSendModal && (
          <div onClick={() => setShowSendModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: 24, maxWidth: 440, width: "100%" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>Enviar plano alimentar</div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>O aluno receberá o plano + notificação no app.</div>

              <div style={{ marginBottom: 14 }}>
                <Label required>Aluno destinatário</Label>
                {patients.length === 0 ? (
                  <div style={{ fontSize: 12, color: T.amber, padding: "10px 12px", background: "#1f1a0a", border: `1px solid ${T.amber}33`, borderRadius: 8 }}>
                    Nenhum aluno vinculado encontrado.
                  </div>
                ) : (
                  <SelectField value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                    <option value="">Selecione um aluno...</option>
                    {patients.map((p) => (
                      <option key={p.user_id} value={p.user_id}>{p.name}</option>
                    ))}
                  </SelectField>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <Label>Mensagem (opcional)</Label>
                <TextareaField placeholder="Observação para o aluno..." value={sendObs} onChange={(e) => setSendObs(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setShowSendModal(false)} style={{ padding: "9px 18px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>
                <button onClick={enviarPlano} disabled={sending || !selectedPatient} style={{ padding: "9px 18px", borderRadius: 8, background: T.green, border: `1px solid ${T.green}`, color: "#0a0f0a", fontSize: 12, cursor: sending ? "wait" : "pointer", fontFamily: "inherit", fontWeight: 700, opacity: sending || !selectedPatient ? 0.6 : 1 }}>
                  {sending ? "Enviando..." : "📨 Enviar agora"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }} className="fade-up">
          {/* Resumo cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 24 }}>
            {[
              { l: "Calorias", v: `${r.calorias_totais} kcal`, c: T.green },
              { l: "Proteína", v: `${r.proteina_total}g (${macroP}%)`, c: T.blue },
              { l: "Carboidrato", v: `${r.carboidrato_total}g (${macroC}%)`, c: T.amber },
              { l: "Gordura", v: `${r.gordura_total}g (${macroG}%)`, c: "#f472b6" },
              { l: "TMB", v: `${r.tmb} kcal`, c: T.muted },
              { l: "GET", v: `${r.get} kcal`, c: T.muted },
              { l: "IMC", v: r.imc, c: T.muted },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" as const, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Barra de macros visual */}
          <div style={{ marginBottom: 24, padding: "16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10, textTransform: "uppercase" as const }}>Distribuição de macros</div>
            <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: T.bg3 }}>
              <div style={{ width: `${macroP}%`, background: T.blue, transition: "width .5s" }} />
              <div style={{ width: `${macroC}%`, background: T.amber, transition: "width .5s" }} />
              <div style={{ width: `${macroG}%`, background: "#f472b6", transition: "width .5s" }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {([["Proteína", macroP, T.blue], ["Carboidrato", macroC, T.amber], ["Gordura", macroG, "#f472b6"]] as [string, number, string][]).map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.muted }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  {l}
                  <span style={{ color: T.text, fontWeight: 600 }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerta protocolo */}
          {r.observacao_protocolo && (
            <div style={{ background: T.greenBg, border: `1px solid ${T.green}33`, borderRadius: 10, padding: "12px 16px", color: T.green, fontSize: 12, marginBottom: 16 }}>
              ✦ Protocolo integrado: {r.observacao_protocolo}
            </div>
          )}

          {/* Alerta coach */}
          {plano.alerta_coach && (
            <div style={{ background: "#1f1a0a", border: `1px solid ${T.amber}33`, borderRadius: 10, padding: "12px 16px", color: T.amber, fontSize: 12, marginBottom: 16 }}>
              ⚠ Atenção, coach: {plano.alerta_coach}
            </div>
          )}

          {/* Bloco GLUT-4 (se gerado) */}
          {glut4Text && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 1, background: T.green }} />
                ⚡ Estratégia GLUT-4 Pós-Treino
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.green}55`, borderRadius: 10, padding: 16, boxShadow: `0 0 18px ${T.green}11` }}>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", fontSize: 12, color: T.text, margin: 0, lineHeight: 1.6 }}>{glut4Text}</pre>
              </div>
            </div>
          )}

          {/* Refeições */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 1, background: T.green }} />
              Refeições do dia
            </div>
            {plano.refeicoes?.map((m, i) => (
              <MealCard
                key={i}
                meal={m}
                index={i}
                onSwap={(alimentoIdx, sub) => {
                  setPlano((prev) => {
                    if (!prev) return prev;
                    const next = JSON.parse(JSON.stringify(prev)) as PlanoData;
                    const meal = next.refeicoes[i];
                    const original = meal.alimentos?.[alimentoIdx];
                    if (!meal.alimentos || !original) return prev;
                    const otherSubs = (original.substituicoes || []).filter(
                      (s) => s.alimento !== sub.alimento
                    );
                    meal.alimentos[alimentoIdx] = {
                      alimento: sub.alimento,
                      quantidade: sub.quantidade,
                      observacao: sub.observacao,
                      substituicoes: [
                        { alimento: original.alimento, quantidade: original.quantidade, observacao: original.observacao, grupo: (sub as any).grupo },
                        ...otherSubs,
                      ],
                    };
                    return next;
                  });
                  setSavedId(null);
                  toast({ title: "Alimento trocado ✅", description: `${sub.alimento} aplicado ao plano.` });
                }}
              />
            ))}
          </div>

          {/* Suplementação */}
          {plano.suplementacao && plano.suplementacao.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 1, background: T.green }} />
                Suplementação recomendada
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {plano.suplementacao.map((s, i) => (
                  <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>{s.suplemento}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>Dose: {s.dose}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>Timing: {s.timing}</div>
                    <div style={{ fontSize: 11, color: T.greenDim, marginTop: 6, fontStyle: "italic" }}>{s.justificativa}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Método MCE */}
          {plano.dica_mce && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Método MCE — Adesão comportamental</div>
              <div style={{ display: "grid", gap: 10 }}>
                {([["M", "Mindset", plano.dica_mce.mindset, T.blue], ["C", "Comportamento", plano.dica_mce.comportamento, T.green], ["E", "Execução", plano.dica_mce.execucao, T.amber]] as [string, string, string, string][]).map(([letra, nome, texto, cor]) => (
                  <div key={letra} style={{ display: "flex", gap: 14, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${cor}15`, border: `1px solid ${cor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: cor, flexShrink: 0 }}>{letra}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: cor, marginBottom: 4 }}>{nome}</div>
                      <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{texto}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => navigate("/coach-dashboard")} style={{ width: "100%", padding: 14, borderRadius: 10, background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }}>
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── FORM ──
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`*{box-sizing:border-box}`}</style>

      {/* Top bar */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 16, background: T.bg2 }}>
        <button onClick={() => navigate("/coach-dashboard")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>nutriON · Dashboard do Coach</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Gerador de Plano Alimentar por IA</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        {/* Dados do paciente */}
        <Section title="Dados do paciente">
          <div style={{ marginBottom: 14 }}>
            <Label required>Nome do paciente</Label>
            <InputField placeholder="Nome do paciente" value={form.nome} onChange={e => set("nome", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            <div>
              <Label required>Idade</Label>
              <InputField type="number" placeholder="30" value={form.idade} onChange={e => set("idade", e.target.value)} />
            </div>
            <div>
              <Label>Sexo</Label>
              <SelectField value={form.sexo} onChange={e => set("sexo", e.target.value)}>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </SelectField>
            </div>
            <div>
              <Label required>Peso (kg)</Label>
              <InputField type="number" placeholder="75" value={form.peso} onChange={e => set("peso", e.target.value)} />
            </div>
            <div>
              <Label required>Altura (cm)</Label>
              <InputField type="number" placeholder="175" value={form.altura} onChange={e => set("altura", e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Objetivo e perfil */}
        <Section title="Objetivo e perfil">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label>Objetivo principal</Label>
              <SelectField value={form.objetivo} onChange={e => set("objetivo", e.target.value)}>
                <option value="emagrecimento">Emagrecimento</option>
                <option value="ganho_massa">Ganho de massa muscular</option>
                <option value="recomposicao">Recomposição corporal</option>
                <option value="manutencao">Manutenção</option>
                <option value="performance">Performance esportiva</option>
                <option value="saude">Saúde e longevidade</option>
                <option value="gestacao">Gestação / pós-parto</option>
              </SelectField>
            </div>
            <div>
              <Label>Perfil PCA</Label>
              <SelectField value={form.perfilPCA} onChange={e => set("perfilPCA", e.target.value)}>
                <option value="executor">Executor (direto, foco em resultados)</option>
                <option value="analista">Analista (detalhista, quer dados)</option>
                <option value="conector">Conector (relacional, precisa de suporte)</option>
                <option value="visionario">Visionário (criativo, precisa de propósito)</option>
              </SelectField>
            </div>
            <div>
              <Label>Nível de atividade</Label>
              <SelectField value={form.nivelAtividade} onChange={e => set("nivelAtividade", e.target.value)}>
                <option value="sedentario">Sedentário (sem exercício)</option>
                <option value="leve">Leve (1–2x/semana)</option>
                <option value="moderado">Moderado (3–4x/semana)</option>
                <option value="ativo">Ativo (5–6x/semana)</option>
                <option value="muito_ativo">Muito ativo (2x/dia ou atleta)</option>
              </SelectField>
            </div>
            <div>
              <Label>Modalidade de treino</Label>
              <SelectField value={form.treino} onChange={e => set("treino", e.target.value)}>
                <option value="musculacao">Musculação / Hipertrofia</option>
                <option value="funcional">Funcional / CrossFit</option>
                <option value="corrida">Corrida / Endurance</option>
                <option value="natacao">Natação</option>
                <option value="futebol">Futebol</option>
                <option value="ciclismo">Ciclismo</option>
                <option value="luta">Artes marciais / Luta</option>
                <option value="misto">Misto (força + cardio)</option>
                <option value="nenhum">Sem treino</option>
              </SelectField>
            </div>
          </div>
        </Section>

        {/* Fase de periodização */}
        <Section title="Fase de periodização">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label required>Fase atual</Label>
              <SelectField value={form.fasePeriodizacao} onChange={e => set("fasePeriodizacao", e.target.value)}>
                <option value="bulk_limpo">Bulk Limpo</option>
                <option value="bulk_agressivo">Bulk Agressivo</option>
                <option value="cutting">Cutting</option>
                <option value="recomposicao">Recomposição</option>
                <option value="peak_week">Peak Week (competição)</option>
                <option value="manutencao_offseason">Manutenção Off-Season</option>
              </SelectField>
            </div>
            <div>
              <Label>% Gordura corporal atual</Label>
              <InputField type="number" placeholder="Ex: 14" value={form.bfAtual} onChange={e => set("bfAtual", e.target.value)} />
            </div>
            <div>
              <Label>% Gordura corporal meta</Label>
              <InputField type="number" placeholder="Ex: 8" value={form.bfMeta} onChange={e => set("bfMeta", e.target.value)} />
            </div>
            {form.fasePeriodizacao === "peak_week" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Label required>Data da competição</Label>
                <InputField type="date" value={form.dataCompeticao} onChange={e => set("dataCompeticao", e.target.value)} />
              </div>
            )}
          </div>
        </Section>

        {/* Rotina de treino semanal */}
        <Section title="Rotina de treino">
          <TrainingSchedule value={trainingSchedule} onChange={setTrainingSchedule} />
        </Section>

        {/* Protocolo de cardio */}
        <Section title="Protocolo de cardio">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: form.fazCardio ? 16 : 0 }}>
            <Label>Faz cardio?</Label>
            <button
              type="button"
              onClick={() => set("fazCardio", !form.fazCardio)}
              style={{
                width: 46, height: 24, borderRadius: 999, position: "relative",
                background: form.fazCardio ? T.green : T.bg3,
                border: `1px solid ${form.fazCardio ? T.green : T.border2}`,
                cursor: "pointer", transition: "all .2s", padding: 0
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: form.fazCardio ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: form.fazCardio ? 24 : 2,
                transition: "all .2s"
              }} />
            </button>
            <span style={{ fontSize: 12, color: T.muted }}>{form.fazCardio ? "Sim" : "Não"}</span>
          </div>

          {form.fazCardio && (
            <>
              <div style={{ marginBottom: 14 }}>
                <Label>Modalidade de cardio</Label>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                  {["LISS", "HIIT", "Zona 1 (50–60% FCmax)", "Zona 2 (60–70%)", "Zona 3 (70–80%)", "Zona 4 (80–90%)", "AEJ (Aeróbico em Jejum)", "Caminhada NEAT"].map(m => (
                    <Tag key={m} label={m} active={form.cardioModalidades.includes(m)} onClick={() => toggleArr("cardioModalidades", m)} />
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <Label>Frequência cardio</Label>
                  <SelectField value={form.cardioFrequencia} onChange={e => set("cardioFrequencia", e.target.value)}>
                    {["1x", "2x", "3x", "4x", "5x", "Diário", "2x ao dia"].map(o => <option key={o} value={o}>{o}</option>)}
                  </SelectField>
                </div>
                <div>
                  <Label>Duração média</Label>
                  <SelectField value={form.cardioDuracao} onChange={e => set("cardioDuracao", e.target.value)}>
                    {["20min", "30min", "45min", "60min", "90min"].map(o => <option key={o} value={o}>{o}</option>)}
                  </SelectField>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Label>Quando faz cardio</Label>
                  <SelectField value={form.cardioQuando} onChange={e => set("cardioQuando", e.target.value)}>
                    <option value="pos_treino">Pós-treino</option>
                    <option value="pre_treino">Pré-treino</option>
                    <option value="separado">Separado do treino</option>
                    <option value="jejum_manha">Em jejum manhã</option>
                    <option value="noite">Noite</option>
                  </SelectField>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Label>Cardio entra no cálculo calórico?</Label>
                <button
                  type="button"
                  onClick={() => set("cardioNoCalculo", !form.cardioNoCalculo)}
                  style={{
                    width: 46, height: 24, borderRadius: 999, position: "relative",
                    background: form.cardioNoCalculo ? T.green : T.bg3,
                    border: `1px solid ${form.cardioNoCalculo ? T.green : T.border2}`,
                    cursor: "pointer", transition: "all .2s", padding: 0
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: form.cardioNoCalculo ? "#0a0f0a" : T.muted,
                    position: "absolute", top: 2, left: form.cardioNoCalculo ? 24 : 2,
                    transition: "all .2s"
                  }} />
                </button>
                <span style={{ fontSize: 12, color: T.muted }}>{form.cardioNoCalculo ? "Sim" : "Não"}</span>
              </div>
            </>
          )}
        </Section>

        {/* Recursos ergogênicos */}
        <Section title="Recursos ergogênicos">
          <div style={{ marginBottom: 14 }}>
            <Label>Protocolo farmacológico ativo</Label>
            <TextareaField
              rows={4}
              style={{ minHeight: 110 }}
              placeholder="Descreva tudo que o aluno usa. Ex: Testosterona Enantato 300mg/sem, NPP 200mg/sem, CJC-1295 sem DAC 2mg 2x/sem, Ipamorelin 200mcg 3x/dia, SLU-PP-332 experimental, Retratutida 2mg/sem, Metformina 500mg..."
              value={form.protocoloFarmacologico}
              onChange={e => set("protocoloFarmacologico", e.target.value)}
            />
            <div style={{
              marginTop: 10, padding: "10px 12px", borderRadius: 8,
              background: T.greenBg, border: `1px solid ${T.border2}`,
              display: "flex", alignItems: "flex-start", gap: 8
            }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>🧠</span>
              <span style={{ fontSize: 11, color: T.green, lineHeight: 1.5 }}>
                A IA interpretará cada composto e ajustará TDEE, macros e timing automaticamente com base em evidências farmacológicas.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: form.atletaCompetitivo ? 14 : 0 }}>
            <Label>É atleta competitivo?</Label>
            <button
              type="button"
              onClick={() => set("atletaCompetitivo", !form.atletaCompetitivo)}
              style={{
                width: 46, height: 24, borderRadius: 999, position: "relative",
                background: form.atletaCompetitivo ? T.green : T.bg3,
                border: `1px solid ${form.atletaCompetitivo ? T.green : T.border2}`,
                cursor: "pointer", transition: "all .2s", padding: 0
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: form.atletaCompetitivo ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: form.atletaCompetitivo ? 24 : 2,
                transition: "all .2s"
              }} />
            </button>
            <span style={{ fontSize: 12, color: T.muted }}>{form.atletaCompetitivo ? "Sim" : "Não"}</span>
          </div>

          {form.atletaCompetitivo && (
            <div>
              <Label>Federação / Categoria</Label>
              <InputField placeholder="Ex: IFBB Pro Men's Physique, NPC Classic Physique..." value={form.federacaoCategoria} onChange={e => set("federacaoCategoria", e.target.value)} />
            </div>
          )}
        </Section>

        {/* Configuração do plano */}
        <Section title="Configuração do plano">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label>Número de refeições/dia</Label>
              <SelectField value={form.refeicoes} onChange={e => set("refeicoes", e.target.value)}>
                {["3", "4", "5", "6", "7"].map(n => <option key={n} value={n}>{n} refeições</option>)}
              </SelectField>
            </div>
            <div>
              <Label>Meta calórica (opcional)</Label>
              <InputField type="number" placeholder="Auto (calcular)" value={form.calorias} onChange={e => set("calorias", e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Restrições */}
        <Section title="Restrições alimentares">
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 14 }}>
            {restricoesOpts.map(r => (
              <Tag key={r} label={r} active={form.restricoes.includes(r)} onClick={() => toggleArr("restricoes", r)} />
            ))}
          </div>
          <Label>Outra restrição ou alergia</Label>
          <InputField placeholder="Ex: FODMAP, histamina..." value={form.outraRestricao} onChange={e => set("outraRestricao", e.target.value)} />
        </Section>

        {/* Preferências e obs */}
        <Section title="Informações adicionais">
          <div style={{ marginBottom: 14 }}>
            <Label>Preferências alimentares</Label>
            <InputField placeholder="Ex: Gosta de açaí, prefere frango a carne vermelha..." value={form.preferencias} onChange={e => set("preferencias", e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <Label>Suplementação atual</Label>
            <InputField placeholder="Ex: Whey 40g, creatina 5g, vitamina D 5000UI..." value={form.suplementos} onChange={e => set("suplementos", e.target.value)} />
          </div>
          <div>
            <Label>Observações clínicas</Label>
            <TextareaField placeholder="Ex: Hipotireoidismo, hipertensão controlada, histórico de compulsão alimentar..." value={form.observacoes} onChange={e => set("observacoes", e.target.value)} />
          </div>
        </Section>

        {/* ─── Módulo GLUT-4 Pós-Treino ─────────────────────────────────────── */}
        <div style={{
          background: T.card, border: `1px solid ${form.glut4Enabled ? T.green : T.border}`,
          borderRadius: 12, padding: 18, marginBottom: 18,
          boxShadow: form.glut4Enabled ? `0 0 24px ${T.green}22` : "none",
          transition: "all .2s",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: form.glut4Enabled ? 14 : 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
                ⚡ Priorizar GLUT-4 Pós-Treino
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                Janela fisiológica de translocação do GLUT-4 — CHO isolado, zero gordura, zero proteína completa.
              </div>
            </div>
            <div
              onClick={() => set("glut4Enabled", !form.glut4Enabled)}
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: form.glut4Enabled ? T.green : T.bg3,
                border: `1px solid ${form.glut4Enabled ? T.green : T.border2}`,
                position: "relative", cursor: "pointer", transition: "all .2s", flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: form.glut4Enabled ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: form.glut4Enabled ? 22 : 2,
                transition: "left .2s",
              }} />
            </div>
          </div>

          {form.glut4Enabled && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                <div>
                  <Label>Usou maltodextrina intra-treino?</Label>
                  <SelectField value={form.glut4UsesIntraMalto ? "1" : "0"} onChange={e => set("glut4UsesIntraMalto", e.target.value === "1")}>
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                  </SelectField>
                </div>
                <div>
                  <Label>Maltodextrina intra (g)</Label>
                  <InputField type="number" placeholder="60" value={form.glut4IntraMaltoG} onChange={e => set("glut4IntraMaltoG", e.target.value)} disabled={!form.glut4UsesIntraMalto} />
                </div>
                <div>
                  <Label>Timing janela (min)</Label>
                  <InputField type="number" placeholder="30" value={form.glut4TimingMin} onChange={e => set("glut4TimingMin", e.target.value)} />
                </div>
                <div>
                  <Label>CHO da janela (g) — vazio = auto</Label>
                  <InputField type="number" placeholder="auto pelo peso" value={form.glut4CarbGrams} onChange={e => set("glut4CarbGrams", e.target.value)} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <Label>Fonte de carboidrato</Label>
                  <SelectField value={form.glut4CarbSource} onChange={e => set("glut4CarbSource", e.target.value)}>
                    <option value="dextrose">Dextrose pura (IG 100)</option>
                    <option value="tamaras">Tâmaras Medjool (IG 103)</option>
                    <option value="pao_frances">Pão francês (IG 95)</option>
                    <option value="pao_branco">Pão de forma branco (IG 85)</option>
                    <option value="doce_de_leite">Doce de leite light (IG 65)</option>
                    <option value="mel">Mel puro (IG 61)</option>
                    <option value="geleia">Geleia açucarada (IG 65)</option>
                    <option value="leite_condensado">Leite condensado desnatado (IG 61)</option>
                    <option value="banana">Banana bem madura (IG 72)</option>
                    <option value="coca">Coca-Cola — competição (IG 65)</option>
                    {!form.glut4UsesIntraMalto && <option value="maltodextrina">Maltodextrina (IG 95)</option>}
                  </SelectField>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 14, fontSize: 12, color: T.text }}>
                <input type="checkbox" checked={form.glut4AddLeucine} onChange={e => set("glut4AddLeucine", e.target.checked)} style={{ accentColor: T.green }} />
                Adicionar L-Leucina isolada (2g) — mTORC1 sem competição de aminoácidos
              </label>

              <button
                onClick={gerarGlut4}
                disabled={glut4Loading}
                style={{
                  width: "100%", padding: 12, borderRadius: 8,
                  background: glut4Loading ? T.bg3 : T.greenBg,
                  border: `1px solid ${T.green}`, color: T.green,
                  fontSize: 13, fontWeight: 700, cursor: glut4Loading ? "wait" : "pointer",
                  fontFamily: "inherit", letterSpacing: "0.02em",
                }}
              >
                {glut4Loading ? "Calculando fisiologia..." : "⚡ Gerar Janela GLUT-4"}
              </button>

              {glut4Text && (
                <div style={{
                  marginTop: 14, background: T.bg2, border: `1px solid ${T.green}55`,
                  borderRadius: 10, padding: 14,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Bloco fisiológico gerado
                    </div>
                    <button
                      onClick={() => setGlut4Text("")}
                      style={{ background: "transparent", border: "none", color: T.muted, fontSize: 11, cursor: "pointer" }}
                    >
                      Limpar
                    </button>
                  </div>
                  <pre style={{
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    fontFamily: "inherit", fontSize: 12, color: T.text,
                    margin: 0, lineHeight: 1.6,
                  }}>{glut4Text}</pre>
                  <div style={{ fontSize: 10, color: T.muted2, marginTop: 8, fontStyle: "italic" }}>
                    Será incluído automaticamente no plano alimentar e no PDF.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <div style={{ background: "#1f0a0a", border: "1px solid #3d1010", borderRadius: 8, padding: "10px 14px", color: T.red, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button onClick={gerar} style={{
          width: "100%", padding: 15, borderRadius: 10,
          background: T.green, border: "none", color: "#0a0f0a",
          fontSize: 15, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", letterSpacing: "0.02em",
          transition: "opacity .2s", boxShadow: `0 0 24px ${T.green}33`
        }}
          onMouseEnter={e => (e.target as HTMLButtonElement).style.opacity = ".88"}
          onMouseLeave={e => (e.target as HTMLButtonElement).style.opacity = "1"}
        >
          Gerar Plano Alimentar com IA
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: T.muted2 }}>
          Powered by IA · Método MCE · nutriON
        </div>
      </div>
    </div>
  );
}
