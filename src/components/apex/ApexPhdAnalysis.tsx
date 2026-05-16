import { useState, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  calcFmsTotal, calcPostureScore, calcRomScore, calcSymmetryScore,
  type PostureData, type FMSScores, type ROMData, type MuscleScores, type PainEntry,
} from "@/hooks/useApex";

const EM = "#4ade80";
const BORDER = "rgba(74,222,128,.18)";
const PANEL = "rgba(6,16,8,.9)";
const MUTED = "#5a7a60";
const TEXT = "#9ec5a6";

// ─── DETECÇÃO DE SÍNDROMES (Janda) ────────────────────────────────────────
type Syndrome = { id: string; name: string; shortened: string[]; inhibited: string[] };
const detectSyndromes = (p: PostureData): Syndrome[] => {
  const out: Syndrome[] = [];
  const has = (v: string) => v === "mild" || v === "moderate" || v === "severe";
  if (has(p.upper_crossed) || (has(p.forward_head) && p.thoracic_kyphosis === "increased")) {
    out.push({ id: "scs", name: "Síndrome Cruzada Superior",
      shortened: ["Trapézio superior", "Peitoral maior/menor", "ECOM", "Elevador escápula"],
      inhibited: ["Flexores cervicais profundos", "Serrátil anterior", "Trapézio médio/inferior", "Romboides"] });
  }
  if (has(p.lower_crossed) || (p.pelvic_tilt === "anterior" && p.lumbar_lordosis === "increased")) {
    out.push({ id: "sci", name: "Síndrome Cruzada Inferior",
      shortened: ["Iliopsoas", "Reto femoral", "TFL", "Eretores lombares"],
      inhibited: ["Glúteo máximo", "Abdominais profundos", "Glúteo médio", "VMO"] });
  }
  if (has(p.pronation_dist)) {
    out.push({ id: "spd", name: "Distorção de Pronação",
      shortened: ["Gastrocnêmio/Sóleo", "Adutores", "TFL"],
      inhibited: ["Tibial anterior/posterior", "Glúteo médio", "Glúteo máximo"] });
  }
  return out;
};

// ─── PROMPT PhD ───────────────────────────────────────────────────────────
const PHD_SYSTEM = `Você é o APEX Visual Intelligence PhD — sistema de diagnóstico físico mais avançado do mercado brasileiro. Integra cinesiologia clínica (Kendall, Sahrmann), FMS/SFMA (Gray Cook), Janda, pain science, biomecânica, bodybuilding kinesiology e NASM CES.

Sua análise equivale a avaliação presencial de 3h com PhD em cinesiologia e fisioterapeuta esportivo. Cada palavra baseada em dados e evidência. Nunca genérico.

GERE OUTPUT COMPLETO COM SEÇÕES OBRIGATÓRIAS:

## DIAGNÓSTICO CINESIOLÓGICO PRIMÁRIO
Síndromes Janda · mecanismo de formação · cadeia cinética segmento a segmento · severidade Grau I/II/III · correlação com FMS

## MAPA MUSCULAR COMPLETO
Tabela mínimo 12 músculos | Estado (Dominante/Encurtado/Inibido/Alongado) | Impacto Funcional | Impacto Visual Palco | Prioridade

## ANÁLISE BIOMECÂNICA POR SEGMENTO
Para cada segmento: desvio, dominante, inibido, compensação, exercícios CONTRAINDICADOS com justificativa, estruturas em risco, ROM vs AAOS

## ANÁLISE DE PALCO — POSE A POSE
Para cada pose da categoria: impacto do desvio, compensação visual, cueing exato, score antes/depois

## MAPA DE DOR INTERPRETADO
Correlação Travell · classificação · músculo gatilho · exercícios que agravam · red flags · manejo integrado

## PROTOCOLO CORRETIVO EM 4 FASES (NASM CES)
FASE 1 INIBIÇÃO · FASE 2 ALONGAMENTO · FASE 3 ATIVAÇÃO · FASE 4 INTEGRAÇÃO
Cada técnica: nome, área, duração, cue, mecanismo, séries/reps

## PROTOCOLO FARMACOLÓGICO INTEGRADO À BIOMECÂNICA
Por composto: impacto tecido conjuntivo, risco biomecânico, ajuste de treino, suporte articular (colágeno II, glucosamina, EPA/DHA, vit C, MSM) com doses

## ANÁLISE DE SHAPE — BODYBUILDING KINESIOLOGY
Lagging vs desenvolvidos, simetria E/D (alerta >15%), conexão postura-shape, padrão da categoria, Peak Week se ≤16 sem

## PLANO DE PERIODIZAÇÃO CORRETIVA
Bloco 1 (sem 1-2 inibição) · Bloco 2 (sem 3-6 ativação) · Bloco 3 (sem 7+ integração)
%corretivos vs hipertrofia, reavaliação sem 4/8/12, KPIs (ROM, FMS, APEX, BF), sinais de alerta

## VEREDICTO APEX PHD
Diagnóstico formal · síndromes Janda + grau · fator limitante primário · conexões dor+postura+shape+farmacologia · potencial % · prognóstico · mensagem direta

REGRAS:
- Nomenclatura anatômica completa sempre
- Justificativa biomecânica/fisiológica para tudo
- Cite mecanismos: inibição recíproca, lei de Sherrington, padrão de Janda, princípio SAID, pontos-gatilho de Travell
- Mínimo 2000 palavras
- Tom: PhD de elite — técnico, direto, sem condescendência
- Markdown completo com ##, ###, tabelas, listas`;

// ─── HELPERS ──────────────────────────────────────────────────────────────
const fileToBase64 = (file: File): Promise<{ data: string; mime: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [meta, data] = result.split(",");
      const mime = meta.match(/data:([^;]+)/)?.[1] || "image/jpeg";
      resolve({ data, mime });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const FMS_TEST_LABELS: Record<keyof FMSScores, string> = {
  deep_squat: "Deep Squat", hurdle_step_l: "Hurdle Step E", hurdle_step_r: "Hurdle Step D",
  inline_lunge_l: "Inline Lunge E", inline_lunge_r: "Inline Lunge D",
  shoulder_mob_l: "Shoulder Mob E", shoulder_mob_r: "Shoulder Mob D",
  active_slr_l: "Active SLR E", active_slr_r: "Active SLR D",
  trunk_stability: "Trunk Stab Push-up", rotary_stab_l: "Rotary Stab E", rotary_stab_r: "Rotary Stab D",
};

const FMS_CLINICAL_NOTE: Record<keyof FMSScores, string> = {
  deep_squat: "Mobilidade bilateral MMSS+MMII e estabilidade central — score baixo sugere encurtamento de cadeia posterior, dorsiflexão limitada ou peitoral curto.",
  hurdle_step_l: "Estabilidade unipodal — score baixo aponta glúteo médio inibido e/ou padrão de Trendelenburg (lado avaliado).",
  hurdle_step_r: "Estabilidade unipodal — score baixo aponta glúteo médio inibido e/ou padrão de Trendelenburg (lado avaliado).",
  inline_lunge_l: "Mobilidade torácica, hip e tornozelo — score baixo correlaciona com SCI e dorsiflexão limitada.",
  inline_lunge_r: "Mobilidade torácica, hip e tornozelo — score baixo correlaciona com SCI e dorsiflexão limitada.",
  shoulder_mob_l: "Flex/RI/RE glenoumeral combinada — score baixo é marcador clássico de SCS.",
  shoulder_mob_r: "Flex/RI/RE glenoumeral combinada — score baixo é marcador clássico de SCS.",
  active_slr_l: "Comprimento de isquiotibiais + dissociação hip — score baixo indica isquio curto e/ou ativação pélvica deficiente.",
  active_slr_r: "Comprimento de isquiotibiais + dissociação hip — score baixo indica isquio curto e/ou ativação pélvica deficiente.",
  trunk_stability: "Estabilidade reflexiva sagital — score baixo aponta core fraco e risco lombar em compostos.",
  rotary_stab_l: "Estabilidade multiplanar — score baixo é vermelho para deadlift/agachamento pesado.",
  rotary_stab_r: "Estabilidade multiplanar — score baixo é vermelho para deadlift/agachamento pesado.",
};

const ROM_LIST: { key: keyof ROMData; label: string; normal: number; min: number }[] = [
  { key: "ankle_df_l", label: "Tornozelo DF E", normal: 20, min: 15 },
  { key: "ankle_df_r", label: "Tornozelo DF D", normal: 20, min: 15 },
  { key: "hip_flex_l", label: "Quadril Flex E", normal: 120, min: 90 },
  { key: "hip_flex_r", label: "Quadril Flex D", normal: 120, min: 90 },
  { key: "hip_ext_l", label: "Quadril Ext E", normal: 20, min: 10 },
  { key: "hip_ext_r", label: "Quadril Ext D", normal: 20, min: 10 },
  { key: "hip_ir_l", label: "Quadril RI E", normal: 45, min: 30 },
  { key: "hip_ir_r", label: "Quadril RI D", normal: 45, min: 30 },
  { key: "shoulder_flex_l", label: "Ombro Flex E", normal: 180, min: 160 },
  { key: "shoulder_flex_r", label: "Ombro Flex D", normal: 180, min: 160 },
  { key: "shoulder_er_l", label: "Ombro RE E", normal: 90, min: 60 },
  { key: "shoulder_er_r", label: "Ombro RE D", normal: 90, min: 60 },
  { key: "thoracic_rot_l", label: "Torácica Rot E", normal: 45, min: 30 },
  { key: "thoracic_rot_r", label: "Torácica Rot D", normal: 45, min: 30 },
];

interface Props {
  posture: PostureData;
  fms: FMSScores;
  rom: ROMData;
  muscles: MuscleScores;
  pain: PainEntry[];
}

type ResultTab = "ia" | "fms" | "rom";

const Panel = ({ children, title }: { children: React.ReactNode; title?: string }) => (
  <div className="border rounded-[3px] p-4 mb-3" style={{ borderColor: BORDER, background: PANEL }}>
    {title && <div className="font-mono text-[.55rem] tracking-[.18em] uppercase mb-3" style={{ color: EM }}>{title}</div>}
    {children}
  </div>
);

// ─── SUB-TAB: FMS ─────────────────────────────────────────────────────────
const FmsResultView = ({ fms, posture }: { fms: FMSScores; posture: PostureData }) => {
  const total = calcFmsTotal(fms);
  const semaforo = total >= 17 ? { color: EM, label: "VERDE · pronto para carga" }
    : total >= 14 ? { color: "#fbbf24", label: "AMARELO · cautela com compostos pesados" }
    : { color: "#ef4444", label: "VERMELHO · risco 3× lesão (Cook 2006) — priorizar corretivos" };

  const tests = (Object.keys(FMS_TEST_LABELS) as (keyof FMSScores)[])
    .map((k) => ({ key: k, label: FMS_TEST_LABELS[k], score: fms[k] }));
  const lowest = [...tests].sort((a, b) => a.score - b.score).slice(0, 3);
  const syndromes = detectSyndromes(posture);

  return (
    <>
      <Panel title="Score Total FMS">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-heading text-[2rem]" style={{ color: semaforo.color }}>{total}</span>
          <span className="font-mono text-[.65rem]" style={{ color: MUTED }}>/ 21</span>
        </div>
        <div className="font-mono text-[.6rem] tracking-[.1em] uppercase" style={{ color: semaforo.color }}>
          {semaforo.label}
        </div>
      </Panel>

      <Panel title="Score por Teste (0-3)">
        {tests.map((t) => {
          const color = t.score >= 3 ? EM : t.score >= 2 ? "#fbbf24" : "#ef4444";
          return (
            <div key={t.key} className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[.6rem] flex-1" style={{ color: TEXT }}>{t.label}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-4 h-3 rounded-[1px]"
                    style={{ background: n <= t.score ? color : "rgba(74,222,128,.08)" }} />
                ))}
              </div>
              <span className="font-mono text-[.55rem] w-4 text-right" style={{ color }}>{t.score}</span>
            </div>
          );
        })}
      </Panel>

      <Panel title="Interpretação Clínica — Pontos Mais Baixos">
        {lowest.map((t) => (
          <div key={t.key} className="mb-2 pb-2 border-b last:border-b-0" style={{ borderColor: BORDER }}>
            <div className="font-mono text-[.6rem] mb-0.5" style={{ color: t.score < 2 ? "#ef4444" : "#fbbf24" }}>
              {t.label} · {t.score}/3
            </div>
            <div className="font-mono text-[.55rem]" style={{ color: TEXT }}>{FMS_CLINICAL_NOTE[t.key]}</div>
          </div>
        ))}
      </Panel>

      {syndromes.length > 0 && (
        <Panel title="Correlação com Disfunções (Janda)">
          {syndromes.map((s) => (
            <div key={s.id} className="font-mono text-[.6rem] mb-1" style={{ color: TEXT }}>
              · {s.name} → confirma achados de FMS (especialmente nos testes bilaterais e de mobilidade)
            </div>
          ))}
        </Panel>
      )}
    </>
  );
};

// ─── SUB-TAB: ROM ─────────────────────────────────────────────────────────
const RomResultView = ({ rom }: { rom: ROMData }) => {
  const radarData = useMemo(() => ROM_LIST.map((r) => {
    const v = rom[r.key];
    return {
      joint: r.label,
      atleta: v !== null ? Math.round((v / r.normal) * 100) : 0,
      norma: 100,
      raw: v,
      normal: r.normal,
      min: r.min,
    };
  }), [rom]);

  const flagged = ROM_LIST.filter((r) => {
    const v = rom[r.key];
    return v !== null && v < r.min;
  });

  return (
    <>
      <Panel title="Radar ROM · % do Normal AAOS">
        <div className="w-full h-72">
          <ResponsiveContainer>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(74,222,128,.15)" />
              <PolarAngleAxis dataKey="joint" tick={{ fill: TEXT, fontSize: 8, fontFamily: "monospace" }} />
              <PolarRadiusAxis angle={90} domain={[0, 120]} tick={{ fill: MUTED, fontSize: 8 }} stroke={MUTED} />
              <Radar name="Norma AAOS" dataKey="norma" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.05} strokeDasharray="3 3" />
              <Radar name="Atleta" dataKey="atleta" stroke={EM} fill={EM} fillOpacity={0.25} />
              <Tooltip contentStyle={{ background: "#03030a", border: `1px solid ${BORDER}`, fontSize: 10, fontFamily: "monospace", color: TEXT }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="font-mono text-[.5rem] mt-2" style={{ color: MUTED }}>
          Linha tracejada = 100% norma · sombreado verde = ROM do atleta
        </div>
      </Panel>

      <Panel title="Tabela ROM vs Norma">
        {ROM_LIST.map((r) => {
          const v = rom[r.key];
          const status = v === null ? "—" : v < r.min ? "CRÍTICO" : v < r.normal * 0.9 ? "LIMITADO" : "OK";
          const color = v === null ? MUTED : v < r.min ? "#ef4444" : v < r.normal * 0.9 ? "#fbbf24" : EM;
          return (
            <div key={r.key} className="flex items-center gap-2 mb-1 font-mono text-[.6rem]">
              <span className="flex-1" style={{ color: TEXT }}>{r.label}</span>
              <span style={{ color: MUTED }}>{r.normal}° (min {r.min}°)</span>
              <span className="w-10 text-right" style={{ color }}>{v ?? "—"}°</span>
              <span className="w-16 text-right" style={{ color }}>{status}</span>
            </div>
          );
        })}
      </Panel>

      {flagged.length > 0 && (
        <Panel title="Recomendações de Ganho de Amplitude">
          {flagged.map((r) => {
            const v = rom[r.key]!;
            const deficit = r.min - v;
            return (
              <div key={r.key} className="mb-2 pb-2 border-b last:border-b-0" style={{ borderColor: BORDER }}>
                <div className="font-mono text-[.6rem]" style={{ color: "#ef4444" }}>
                  ⚠ {r.label} · {v}° (déficit {deficit}° abaixo do mínimo funcional)
                </div>
                <div className="font-mono text-[.55rem] mt-0.5" style={{ color: TEXT }}>
                  Protocolo: PNF contrai-relaxa 3×30s + alongamento estático 2×60s diário · reavaliar em 3 semanas.
                  Bloqueio temporário em compostos que exijam essa amplitude.
                </div>
              </div>
            );
          })}
        </Panel>
      )}
    </>
  );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────
const ApexPhdAnalysis = ({ posture, fms, rom, muscles, pain }: Props) => {
  const [category, setCategory] = useState("");
  const [weeksToShow, setWeeksToShow] = useState("");
  const [pharma, setPharma] = useState("");
  const [history, setHistory] = useState("");
  const [complaints, setComplaints] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [photos, setPhotos] = useState<{ label: string; data: string; mime: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [resultTab, setResultTab] = useState<ResultTab>("ia");
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const exportPdf = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      // Aguarda render do conteúdo offscreen
      await new Promise((r) => setTimeout(r, 250));
      const canvas = await html2canvas(printRef.current, {
        backgroundColor: "#03030a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
      const stamp = new Date().toISOString().slice(0, 10);
      pdf.save(`apex-fms-rom-${stamp}.pdf`);
    } catch (e) {
      console.error("[APEX export PDF]", e);
      setError("Falha ao gerar PDF");
    } finally {
      setExporting(false);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const { data, mime } = await fileToBase64(f);
    setPhotos((p) => [...p.filter((x) => x.label !== label), { label, data, mime }]);
  };

  const analyze = async () => {
    setLoading(true); setError(""); setResult("");
    try {
      const fmsTotal = calcFmsTotal(fms);
      const ctx = `=== DADOS DO ATLETA ===
Categoria IFBB: ${category || "não informada"}
Semanas para o show: ${weeksToShow || "não informado"}
Protocolo farmacológico: ${pharma || "não informado"}

=== HISTÓRICO E QUEIXAS ===
Histórico/limitações: ${history || "—"}
Queixas do atleta: ${complaints || "—"}
Observações do coach: ${coachNotes || "—"}

=== SCORES APEX ===
Score Postural: ${calcPostureScore(posture)}/100
Score Mobilidade (ROM): ${calcRomScore(rom)}/100
Score Simetria: ${calcSymmetryScore(muscles)}/100
Score FMS total: ${fmsTotal}/21

=== POSTURA (3 PLANOS) ===
${JSON.stringify(posture, null, 2)}

=== FMS por teste ===
${JSON.stringify(fms, null, 2)}

=== ROM (graus) ===
${JSON.stringify(rom, null, 2)}

=== DESENVOLVIMENTO MUSCULAR (0-10) ===
${JSON.stringify(muscles, null, 2)}

=== MAPA DE DOR ATIVA ===
${pain.length ? JSON.stringify(pain.map((p) => ({
  região: p.body_region, lado: p.side, qualidade: p.quality, intensidade: p.intensity,
  comportamento: p.behavior, tipo: p.pain_type, timing: p.onset_pattern,
  notas: p.notes, red_flag: p.red_flag,
})), null, 2) : "Sem dor ativa relatada."}

Execute a análise PhD completa agora.`;

      const { data, error: fnErr } = await supabase.functions.invoke("apex-visual-analyze", {
        body: { fotos: photos, contexto: ctx, system: PHD_SYSTEM },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      setResult(data?.text || "Sem resposta.");
      setResultTab("ia");
    } catch (e: any) {
      setError(e?.message || "Falha na análise");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-transparent border rounded-[3px] px-2 py-1.5 font-mono text-[.65rem] outline-none";

  return (
    <>
      <Panel title="Contexto do Atleta">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder="Categoria IFBB"
              className={inputStyle} style={{ borderColor: BORDER, color: TEXT }} />
            <input value={weeksToShow} onChange={(e) => setWeeksToShow(e.target.value)}
              placeholder="Semanas até o show"
              className={inputStyle} style={{ borderColor: BORDER, color: TEXT }} />
          </div>
          <textarea value={pharma} onChange={(e) => setPharma(e.target.value)}
            placeholder="Protocolo farmacológico (compostos, doses, fase)"
            rows={2} className={inputStyle + " resize-none"} style={{ borderColor: BORDER, color: TEXT }} />
          <textarea value={history} onChange={(e) => setHistory(e.target.value)}
            placeholder="Histórico clínico, lesões prévias, limitações"
            rows={2} className={inputStyle + " resize-none"} style={{ borderColor: BORDER, color: TEXT }} />
          <textarea value={complaints} onChange={(e) => setComplaints(e.target.value)}
            placeholder="Queixas do atleta"
            rows={2} className={inputStyle + " resize-none"} style={{ borderColor: BORDER, color: TEXT }} />
          <textarea value={coachNotes} onChange={(e) => setCoachNotes(e.target.value)}
            placeholder="Observações do coach"
            rows={2} className={inputStyle + " resize-none"} style={{ borderColor: BORDER, color: TEXT }} />
        </div>
      </Panel>

      <Panel title="Fotos Posturais (opcional)">
        <div className="grid grid-cols-3 gap-2">
          {["Frente", "Costas", "Lateral"].map((label) => {
            const p = photos.find((x) => x.label === label);
            return (
              <label key={label} className="border rounded-[3px] p-2 text-center cursor-pointer block"
                style={{ borderColor: p ? EM : BORDER }}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e, label)} />
                {p ? (
                  <img src={`data:${p.mime};base64,${p.data}`} alt={label}
                    className="w-full h-20 object-cover rounded-[2px] mb-1" />
                ) : (
                  <div className="h-20 flex items-center justify-center font-mono text-[.55rem]" style={{ color: MUTED }}>+ upload</div>
                )}
                <div className="font-mono text-[.55rem]" style={{ color: p ? EM : TEXT }}>{label}</div>
              </label>
            );
          })}
        </div>
      </Panel>

      <button onClick={analyze} disabled={loading}
        className="w-full border rounded-[3px] py-3 font-mono text-[.7rem] tracking-[.2em] uppercase mb-3 transition-colors"
        style={{
          borderColor: EM, color: EM,
          background: loading ? "rgba(74,222,128,.02)" : "rgba(74,222,128,.08)",
          opacity: loading ? 0.6 : 1,
        }}>
        {loading ? "analisando · Gemini 2.5 Pro · ~30s..." : "▸ Gerar Análise PhD"}
      </button>

      {error && (
        <Panel>
          <div className="font-mono text-[.6rem]" style={{ color: "#ef4444" }}>⚠ {error}</div>
        </Panel>
      )}

      {(result || true) && (
        <>
          {/* Sub-tabs do resultado: IA · FMS · ROM */}
          <div className="flex gap-1.5 mb-3 items-center">
            {([
              ["ia", "Análise IA", !!result],
              ["fms", "FMS", true],
              ["rom", "ROM", true],
            ] as [ResultTab, string, boolean][]).map(([id, label, enabled]) => (
              <button key={id} onClick={() => enabled && setResultTab(id)} disabled={!enabled}
                className="px-3 py-1.5 rounded-[3px] font-mono text-[.6rem] tracking-[.15em] uppercase border transition-colors"
                style={{
                  borderColor: resultTab === id ? EM : BORDER,
                  color: !enabled ? MUTED : resultTab === id ? EM : TEXT,
                  background: resultTab === id ? "rgba(74,222,128,.1)" : "transparent",
                  opacity: enabled ? 1 : 0.4,
                  cursor: enabled ? "pointer" : "not-allowed",
                }}>{label}</button>
            ))}
            <button onClick={exportPdf} disabled={exporting}
              className="ml-auto px-3 py-1.5 rounded-[3px] font-mono text-[.6rem] tracking-[.15em] uppercase border transition-colors"
              style={{
                borderColor: EM, color: EM,
                background: "rgba(74,222,128,.08)",
                opacity: exporting ? 0.5 : 1,
                cursor: exporting ? "wait" : "pointer",
              }}
              title="Exporta FMS + ROM (semáforos, radar, recomendações) em PDF">
              {exporting ? "gerando..." : "▼ Exportar PDF"}
            </button>
          </div>

          {resultTab === "ia" && result && (
            <Panel title="Análise PhD · Output Completo">
              <div className="apex-md font-mono text-[.7rem] leading-[1.6]" style={{ color: TEXT }}>
                <ReactMarkdown
                  components={{
                    h1: (p) => <h1 className="font-heading text-[1rem] mt-4 mb-2" style={{ color: EM }} {...p} />,
                    h2: (p) => <h2 className="font-heading text-[.85rem] mt-4 mb-2 pb-1 border-b" style={{ color: EM, borderColor: BORDER }} {...p} />,
                    h3: (p) => <h3 className="font-mono text-[.7rem] tracking-[.1em] uppercase mt-3 mb-1" style={{ color: EM }} {...p} />,
                    p: (p) => <p className="mb-2" {...p} />,
                    ul: (p) => <ul className="mb-2 ml-4 list-disc" {...p} />,
                    ol: (p) => <ol className="mb-2 ml-4 list-decimal" {...p} />,
                    li: (p) => <li className="mb-0.5" {...p} />,
                    strong: (p) => <strong style={{ color: EM }} {...p} />,
                    table: (p) => <table className="w-full my-2 border-collapse text-[.6rem]" {...p} />,
                    th: (p) => <th className="border px-1.5 py-1 text-left font-mono" style={{ borderColor: BORDER, color: EM }} {...p} />,
                    td: (p) => <td className="border px-1.5 py-1 align-top" style={{ borderColor: BORDER }} {...p} />,
                    code: (p) => <code className="px-1 rounded" style={{ background: "rgba(74,222,128,.08)", color: EM }} {...p} />,
                  }}>{result}</ReactMarkdown>
              </div>
            </Panel>
          )}
          {resultTab === "fms" && <FmsResultView fms={fms} posture={posture} />}
          {resultTab === "rom" && <RomResultView rom={rom} />}
        </>
      )}

      {/* Container offscreen para captura do PDF (FMS + ROM) */}
      <div
        ref={printRef}
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          width: 794, // ~A4 a 96dpi
          padding: 24,
          background: "#03030a",
          color: TEXT,
          fontFamily: "monospace",
        }}
        aria-hidden
      >
        <div style={{ marginBottom: 16, borderBottom: `1px solid ${BORDER}`, paddingBottom: 8 }}>
          <div style={{ color: EM, fontSize: 16, letterSpacing: 2, textTransform: "uppercase" }}>
            APEX Visual Intelligence · Relatório FMS + ROM
          </div>
          <div style={{ color: MUTED, fontSize: 10, marginTop: 4 }}>
            {category ? `Categoria: ${category} · ` : ""}{new Date().toLocaleString("pt-BR")}
          </div>
        </div>
        <div style={{ color: EM, fontSize: 12, margin: "12px 0", letterSpacing: 1, textTransform: "uppercase" }}>
          ▸ Functional Movement Screen (FMS)
        </div>
        <FmsResultView fms={fms} posture={posture} />
        <div style={{ color: EM, fontSize: 12, margin: "16px 0 12px", letterSpacing: 1, textTransform: "uppercase" }}>
          ▸ Range of Motion (ROM · AAOS)
        </div>
        <RomResultView rom={rom} />
        <div style={{ color: MUTED, fontSize: 9, marginTop: 16, borderTop: `1px solid ${BORDER}`, paddingTop: 6 }}>
          APEX PhD · análise cinesiológica · uso clínico/coaching · não substitui avaliação médica
        </div>
      </div>
    </>
  );
};

export default ApexPhdAnalysis;
