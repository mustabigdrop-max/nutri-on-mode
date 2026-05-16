import { useState } from "react";
import ReactMarkdown from "react-markdown";
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

const PHD_SYSTEM = `Você é o APEX Visual Intelligence PhD — o sistema de diagnóstico físico mais avançado do mercado brasileiro. Você integra cinesiologia clínica (Kendall, Sahrmann), avaliação funcional do movimento (FMS/SFMA de Gray Cook), mapeamento de desequilíbrios musculares (sistema de Janda), pain science, biomecânica de exercício, bodybuilding kinesiology e protocolo corretivo NASM CES.

Sua análise é equivalente a uma avaliação presencial de 3 horas com um doutor em cinesiologia e fisioterapeuta esportivo. Cada palavra do output é baseada nas fotos fornecidas, nos dados do formulário e em evidência científica aplicada ao esporte de alto rendimento. Você nunca dá respostas genéricas.

GERE O OUTPUT COMPLETO NAS SEGUINTES SEÇÕES OBRIGATÓRIAS:

## DIAGNÓSTICO CINESIOLÓGICO PRIMÁRIO
- Nome clínico da(s) síndrome(s) identificada(s) (Janda: SCS, SCI, Distorção de Pronação ou combinações)
- Descrição mecanicista de como a síndrome se formou e padrões de treino que perpetuaram
- Cadeia cinética completa afetada segmento por segmento
- Severidade global: Grau I/II/III com critérios objetivos
- Correlação com score FMS (interpretar testes de menor pontuação como evidência)

## MAPA MUSCULAR COMPLETO
Tabela com mínimo 12 músculos | Estado (Dominante/Encurtado/Inibido/Alongado) | Impacto Funcional | Impacto Visual no Palco | Prioridade

## ANÁLISE BIOMECÂNICA POR SEGMENTO
Para cada segmento disfuncional: desvio, dominante, inibido, padrão de compensação, exercícios CONTRAINDICADOS com justificativa, estruturas em risco, ROM comprometido vs norma AAOS

## ANÁLISE DE PALCO — POSE A POSE
Para cada pose padrão da categoria: impacto do desvio, compensação visual, cueing exato, score antes/depois

## MAPA DE DOR INTERPRETADO
Correlacionar com dor referida (Travell), classificar (local/referida/irradiada/radiculopática), músculo gatilho provável, exercícios que agravam, red flags, manejo integrado

## PROTOCOLO CORRETIVO EM 4 FASES (NASM CES)
FASE 1 INIBIÇÃO (5-10min) · FASE 2 ALONGAMENTO (5-10min) · FASE 3 ATIVAÇÃO (5-10min) · FASE 4 INTEGRAÇÃO (durante treino)
Cada técnica com: nome, área, duração, cue de execução, mecanismo, séries/reps quando aplicável

## PROTOCOLO FARMACOLÓGICO INTEGRADO À BIOMECÂNICA
Para cada composto: impacto no tecido conjuntivo, risco biomecânico, ajuste de treino, suplementação de suporte articular (colágeno II, glucosamina, EPA/DHA, vit C, MSM) com doses — apenas os relevantes

## ANÁLISE DE SHAPE — BODYBUILDING KINESIOLOGY
Lagging vs desenvolvidos, simetria E/D por grupo (alerta >15%), conexão postura-shape, padrão da categoria, Peak Week (Flat/Full/Spilled) se ≤16 semanas

## PLANO DE PERIODIZAÇÃO CORRETIVA
Bloco 1 (sem 1-2 inibição/neuroeducação) · Bloco 2 (sem 3-6 ativação/isolamento) · Bloco 3 (sem 7+ integração/força)
%corretivos vs hipertrofia por fase, reavaliação sem 4/8/12, KPIs (ROM, FMS, APEX, BF), sinais de alerta

## VEREDICTO APEX PHD
Diagnóstico formal · Síndromes Janda + grau · Fator limitante primário · Conexões dor+postura+shape+farmacologia · Potencial de melhora % · Prognóstico timeline · Mensagem direta ao atleta

REGRAS:
- Nunca genérico — sempre nomenclatura anatômica completa
- Toda recomendação com justificativa biomecânica/fisiológica
- Citar mecanismos: inibição recíproca, lei de Sherrington, padrão de Janda, princípio SAID, teoria de pontos-gatilho de Travell
- Mínimo 2000 palavras
- Tom: especialista PhD de elite — técnico, direto, orientado a resultado, sem condescendência
- Use markdown completo com headings ## e ###, tabelas e listas`;

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

interface Props {
  posture: PostureData;
  fms: FMSScores;
  rom: ROMData;
  muscles: MuscleScores;
  pain: PainEntry[];
}

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
      const ctx = `
=== DADOS DO ATLETA ===
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
    } catch (e: any) {
      setError(e?.message || "Falha na análise");
    } finally {
      setLoading(false);
    }
  };

  const Panel = ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div className="border rounded-[3px] p-4 mb-3" style={{ borderColor: BORDER, background: PANEL }}>
      {title && <div className="font-mono text-[.55rem] tracking-[.18em] uppercase mb-3" style={{ color: EM }}>{title}</div>}
      {children}
    </div>
  );

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
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => onPhoto(e, label)} />
                {p ? (
                  <img src={`data:${p.mime};base64,${p.data}`} alt={label}
                    className="w-full h-20 object-cover rounded-[2px] mb-1" />
                ) : (
                  <div className="h-20 flex items-center justify-center font-mono text-[.55rem]"
                    style={{ color: MUTED }}>+ upload</div>
                )}
                <div className="font-mono text-[.55rem]" style={{ color: p ? EM : TEXT }}>{label}</div>
              </label>
            );
          })}
        </div>
        <div className="font-mono text-[.5rem] mt-2" style={{ color: MUTED }}>
          Análise funciona sem fotos, mas a precisão aumenta substancialmente com elas.
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

      {result && (
        <Panel title="Análise PhD · Output Completo">
          <div className="apex-md font-mono text-[.7rem] leading-[1.6]" style={{ color: TEXT }}>
            <ReactMarkdown
              components={{
                h1: (p) => <h1 className="font-heading text-[1rem] mt-4 mb-2" style={{ color: EM }} {...p} />,
                h2: (p) => <h2 className="font-heading text-[.85rem] mt-4 mb-2 pb-1 border-b"
                  style={{ color: EM, borderColor: BORDER }} {...p} />,
                h3: (p) => <h3 className="font-mono text-[.7rem] tracking-[.1em] uppercase mt-3 mb-1"
                  style={{ color: EM }} {...p} />,
                p: (p) => <p className="mb-2" {...p} />,
                ul: (p) => <ul className="mb-2 ml-4 list-disc" {...p} />,
                ol: (p) => <ol className="mb-2 ml-4 list-decimal" {...p} />,
                li: (p) => <li className="mb-0.5" {...p} />,
                strong: (p) => <strong style={{ color: EM }} {...p} />,
                table: (p) => <table className="w-full my-2 border-collapse text-[.6rem]" {...p} />,
                th: (p) => <th className="border px-1.5 py-1 text-left font-mono"
                  style={{ borderColor: BORDER, color: EM }} {...p} />,
                td: (p) => <td className="border px-1.5 py-1 align-top"
                  style={{ borderColor: BORDER }} {...p} />,
                code: (p) => <code className="px-1 rounded"
                  style={{ background: "rgba(74,222,128,.08)", color: EM }} {...p} />,
              }}
            >{result}</ReactMarkdown>
          </div>
        </Panel>
      )}
    </>
  );
};

export default ApexPhdAnalysis;
