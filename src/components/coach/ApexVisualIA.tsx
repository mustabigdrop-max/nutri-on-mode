import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#08090C", surface: "#0F1117", surfaceUp: "#161920", border: "#1A1F2B",
  borderHi: "#252D3D", gold: "#C49A2A", goldL: "#E0B840", goldD: "#7A5C10",
  green: "#0F8A63", greenL: "#1DB87A", amber: "#C47A15", red: "#D94040",
  blue: "#1A6AB5", purple: "#5A4EC0", pink: "#C0458A",
  text: "#EDF0F7", textSec: "#6B7A94", textDim: "#3A4255",
};

type Cat = {
  label: string; icon: string; genero: "M" | "F"; cor: string;
  criterios: string[]; pose_ref: string[]; ideal: string; pontos_criticos: string[];
};

const CATEGORIAS: Record<string, Cat> = {
  mens_physique: {
    label: "Men's Physique", icon: "🏄", genero: "M", cor: C.blue,
    criterios: ["Largura de ombros e deltoide lateral", "Proporção ombro-cintura (forma V)", "Abdômen definido", "Peitoral com separação", "Dorsal em V", "Braços vasculares", "Quadríceps visível", "Simetria geral", "Apresentação no palco", "Condicionamento sem secar demais"],
    pose_ref: ["Frente", "3/4 esq", "3/4 dir", "Back"],
    ideal: "Shape atlético e estético, não bodybuilder. Cintura estreita, ombros largos, condicionamento visível sem estriação excessiva.",
    pontos_criticos: ["deltoide lateral", "inserção do lat", "cintura", "separação abdominal"],
  },
  classic_physique: {
    label: "Classic Physique", icon: "🏛", genero: "M", cor: C.amber,
    criterios: ["Proporções clássicas", "Densidade por peso/altura", "Peitoral alto e cheio", "Dorsal em leque", "Pernas completas", "Braços proporcionais", "Definição elite", "Separação muscular", "Vascularidade moderada", "Porte no palco"],
    pose_ref: ["Front double biceps", "Front lat spread", "Side chest", "Back double biceps", "Back lat spread", "Side triceps", "Abs & thighs", "Most muscular"],
    ideal: "Referência Golden Era — Zane, Reeves. Tamanho respeita peso/altura. Cintura tiny, ombros e peitoral dominantes.",
    pontos_criticos: ["proporção tamanho vs altura", "cintura", "inserção do peitoral", "simetria lat/ombro"],
  },
  bodybuilding: {
    label: "Bodybuilding", icon: "💪", genero: "M", cor: C.red,
    criterios: ["Tamanho máximo", "Condicionamento extremo", "Simetria total", "Estriações", "Pernas completas", "Dorsal cheio", "Peitoral baixo/alto", "Deltoides 3D", "Vascularidade", "Posing técnico"],
    pose_ref: ["Front double biceps", "Front lat spread", "Side chest", "Back double biceps", "Back lat spread", "Side triceps", "Abs & thighs", "Most muscular"],
    ideal: "Máximo tamanho com máximo condicionamento. Cada grupo visível e separado. Sem pontos fracos.",
    pontos_criticos: ["quadríceps", "panturrilha", "dorsal inferior", "condicionamento"],
  },
  bikini: {
    label: "Bikini", icon: "👙", genero: "F", cor: C.pink,
    criterios: ["Glúteos cheios e levantados", "Cintura estreita curva", "Ombros moderados", "Pernas tonificadas", "Abdômen plano", "Proporção feminina", "Postura elegante", "Condicionamento moderado", "Simetria", "Apresentação"],
    pose_ref: ["Frente mãos no quadril", "Back glúteos", "3/4 com perna à frente"],
    ideal: "Corpo feminino atlético e curvilíneo. Glúteos centrais. Visual fitness saudável com feminilidade.",
    pontos_criticos: ["glúteos", "cintura", "proporção ombro-quadril", "condicionamento moderado"],
  },
  wellness: {
    label: "Wellness", icon: "🌸", genero: "F", cor: C.purple,
    criterios: ["Glúteos muito desenvolvidos", "Coxas cheias", "Cintura estreita", "Ombros femininos", "Peitoral natural", "Panturrilhas", "Abdômen tônico", "Condicionamento moderado-alto", "Feminilidade", "Apresentação"],
    pose_ref: ["Frente", "Back glúteos", "Side"],
    ideal: "Mais volume que Bikini, especialmente MMII. Glúteos e pernas dominam. Cintura fina cria contraste.",
    pontos_criticos: ["glúteos", "coxas posteriores", "contraste cintura-quadril"],
  },
  figure: {
    label: "Figure", icon: "⚡", genero: "F", cor: C.green,
    criterios: ["Músculo moderado-alto", "Simetria topo-base", "Ombros em V", "Cintura X", "Pernas separadas", "Dorsal visível", "Definição clara", "Sem look BB feminino", "Vascularidade discreta", "Porte"],
    pose_ref: ["Front quarter", "Side", "Back quarter"],
    ideal: "Entre Wellness e Women's Physique. Músculo visível com feminilidade. Forma X perfeita.",
    pontos_criticos: ["ombros", "simetria topo-base", "definição", "cintura"],
  },
  womens_physique: {
    label: "Women's Physique", icon: "🔥", genero: "F", cor: C.amber,
    criterios: ["Músculo alto mas feminino", "Separação clara", "Simetria 8 poses", "Vascularidade discreta", "Pernas definidas", "Dorsal em leque", "Peitoral visível", "Deltoides 3D", "Cintura X", "Posing mandatório"],
    pose_ref: ["Front double biceps", "Front lat spread", "Side chest", "Side triceps", "Back double biceps", "Back lat spread", "Abs & thighs"],
    ideal: "BB feminino sem masculinizar. Máximo desenvolvimento mantendo forma feminina.",
    pontos_criticos: ["separação", "condicionamento", "dorsais", "simetria"],
  },
};

const buildSystemPrompt = (cat: Cat, atleta: string) => `Você é o APEX Visual Intelligence — o sistema de análise visual mais avançado para atletas de fisiculturismo, com olhar de juiz IFBB combinado com coaches de elite (Hany Rambod, Neil Hill, Chad Nicholls).

CATEGORIA: ${cat.label} (${cat.genero === "M" ? "Masculino" : "Feminino"})
ATLETA: ${atleta}

IDEAL DA CATEGORIA:
${cat.ideal}

CRITÉRIOS OFICIAIS:
${cat.criterios.map((c, i) => `${i + 1}. ${c}`).join("\n")}

PONTOS CRÍTICOS:
${cat.pontos_criticos.map(p => `• ${p}`).join("\n")}

POSTURA: técnico, direto, sem elogios vazios. Cada ponto fraco tem causa e prescrição. Compare com o ideal da categoria.

FORMATO DE SAÍDA OBRIGATÓRIO (use exatamente estas seções):

## IMPACTO VISUAL
[2 parágrafos sobre o que a foto comunica]

## SCORES_SEGMENTOS
[Liste cada segmento com formato: NOME: X/10 — diagnóstico]

## CONDICIONAMENTO
BF_ESTIMADO: XX
BF_META: XX
SEMANAS_ESTIMADAS: X
[Análise detalhada]

## PROPORCOES
SCORE_PROPORCAO: XX
[Análise de simetria]

## GANHA_PONTOS
[Máximo 4 pontos]

## PERDE_PONTOS
[Máximo 4 pontos diretos]

## PLANO_ATAQUE
PRIORIDADE_1: [grupo + prescrição]
PRIORIDADE_2: [grupo + prescrição]
PRIORIDADE_3: [grupo + prescrição]
[Detalhamento]

## POSING
[Como esconder fraquezas e destacar pontos fortes]

## VEREDICTO
[3 frases — o que falta para top 5]`;

const toB64 = (file: File): Promise<string> => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res((r.result as string).split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(file);
});

const parseSection = (text: string, key: string, nextKey: string | null) => {
  const pat = nextKey
    ? new RegExp(`##\\s*${key}([\\s\\S]*?)##\\s*${nextKey}`, "i")
    : new RegExp(`##\\s*${key}([\\s\\S]*)`, "i");
  return text.match(pat)?.[1]?.trim() || "";
};

const parseSegmentos = (text: string) => {
  const block = parseSection(text, "SCORES_SEGMENTOS", "CONDICIONAMENTO");
  return block.split("\n")
    .map(l => l.trim())
    .filter(l => l.includes(":") && /\d+\/10/.test(l))
    .map(l => {
      const [part, ...restArr] = l.split(":");
      const rest = restArr.join(":");
      const score = parseInt(rest?.match(/(\d+)\/10/)?.[1] || "0");
      const diag = rest?.replace(/\d+\/10/, "").replace(/^[\s—–-]+/, "").trim();
      return { label: part.replace(/^[-•*]\s*/, "").trim(), score, diag };
    })
    .filter(s => s.label && s.score > 0);
};

const parseMeta = (text: string) => ({
  bfEst: text.match(/BF_ESTIMADO:\s*([\d.]+)/i)?.[1],
  bfMeta: text.match(/BF_META:\s*([\d.]+)/i)?.[1],
  semEst: text.match(/SEMANAS_ESTIMADAS:\s*(\d+)/i)?.[1],
  propScore: text.match(/SCORE_PROPORCAO:\s*(\d+)/i)?.[1],
  p1: text.match(/PRIORIDADE_1:\s*([^\n]+)/i)?.[1],
  p2: text.match(/PRIORIDADE_2:\s*([^\n]+)/i)?.[1],
  p3: text.match(/PRIORIDADE_3:\s*([^\n]+)/i)?.[1],
});

const scoreCol = (v: number) => v >= 8 ? C.greenL : v >= 6 ? C.amber : v >= 4 ? "#E07030" : C.red;

function DropZone({ label, angle, file, onFile, onClear }: { label: string; angle: string; file: File | null; onFile: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{angle}</div>
      <div
        onClick={() => !file && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }}
        style={{
          height: 170, borderRadius: 14, position: "relative", overflow: "hidden",
          border: `1.5px dashed ${drag ? C.gold : file ? C.greenL : C.border}`,
          background: file ? "transparent" : drag ? C.gold + "0A" : C.surface,
          cursor: file ? "default" : "pointer", transition: "all .25s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {file && preview ? (
          <>
            <img src={preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={e => { e.stopPropagation(); onClear(); }}
              style={{ position: "absolute", top: 7, right: 7, width: 26, height: 26, borderRadius: "50%", background: "#000000CC", border: "none", cursor: "pointer", color: "#fff", fontSize: 13 }}>✕</button>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: "linear-gradient(transparent, #000000DD)", fontSize: 10, color: C.greenL, fontWeight: 700 }}>✓ {label}</div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>📸</div>
            <div style={{ fontSize: 11, color: C.textSec, fontWeight: 600 }}>+ {label}</div>
            <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>JPG · PNG · WEBP</div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
    </div>
  );
}

function SegBar({ label, score, diag, catColor }: { label: string; score: number; diag?: string; catColor: string }) {
  const col = scoreCol(score);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: col, fontWeight: 800 }}>{score}/10</span>
      </div>
      <div style={{ height: 5, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score * 10}%`, height: "100%", background: col, transition: "width .4s" }} />
      </div>
      {diag && <div style={{ fontSize: 11, color: C.textSec, marginTop: 4, lineHeight: 1.5 }}>{diag}</div>}
    </div>
  );
}

function InfoCard({ icon, title, value, sub, color }: { icon: string; title: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: 110, background: C.surface, border: `1px solid ${color}33`, borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ fontSize: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textSec, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>{title}</div>
      {sub && <div style={{ fontSize: 9, color: C.textDim, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function Accordion({ icon, title, children, accentColor = C.gold, defaultOpen = true }: { icon: string; title: string; children: React.ReactNode; accentColor?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, letterSpacing: ".04em", textTransform: "uppercase" }}>{title}</span>
        </div>
        <span style={{ color: C.textSec, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px" }}>
          <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
          {children}
        </div>
      )}
    </div>
  );
}

function Prioridade({ num, texto, color }: { num: number; texto: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 10, padding: "10px 12px", background: color + "11", border: `1px solid ${color}44`, borderRadius: 10 }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{num}</div>
      <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{texto}</div>
    </div>
  );
}

function LoadingSteps({ catColor }: { catColor: string }) {
  const steps = ["Carregando protocolo da categoria...", "Lendo estrutura corporal...", "Avaliando proporções e simetria...", "Comparando com padrão IFBB...", "Identificando gaps e pontos fortes...", "Prescrevendo ajustes específicos...", "Gerando veredicto do coach..."];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 22px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12, animation: "pulse 1.5s infinite" }}>🔬</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: catColor, marginBottom: 18, letterSpacing: ".06em", textTransform: "uppercase" }}>APEX analisando...</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", maxWidth: 360, margin: "0 auto" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: i <= step ? C.text : C.textDim, opacity: i <= step ? 1 : 0.5 }}>
            <span style={{ color: i < step ? C.greenL : i === step ? catColor : C.textDim, fontWeight: 700, width: 14 }}>
              {i < step ? "✓" : i === step ? "◉" : "○"}
            </span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApexVisualIA() {
  const [catKey, setCatKey] = useState<keyof typeof CATEGORIAS>("mens_physique");
  const [atletaNome, setAtletaNome] = useState("");
  const [semanas, setSemanas] = useState("8");
  const [fotoF, setFotoF] = useState<File | null>(null);
  const [fotoC, setFotoC] = useState<File | null>(null);
  const [fotoL, setFotoL] = useState<File | null>(null);
  const [obsCoach, setObsCoach] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const cat = CATEGORIAS[catKey];
  const temFoto = !!(fotoF || fotoC || fotoL);
  const segmentos = parseSegmentos(rawText);
  const meta = parseMeta(rawText);
  const sections = {
    impacto: parseSection(rawText, "IMPACTO VISUAL", "SCORES_SEGMENTOS"),
    cond: parseSection(rawText, "CONDICIONAMENTO", "PROPORCOES"),
    prop: parseSection(rawText, "PROPORCOES", "GANHA_PONTOS"),
    ganha: parseSection(rawText, "GANHA_PONTOS", "PERDE_PONTOS"),
    perde: parseSection(rawText, "PERDE_PONTOS", "PLANO_ATAQUE"),
    plano: parseSection(rawText, "PLANO_ATAQUE", "POSING"),
    posing: parseSection(rawText, "POSING", "VEREDICTO"),
    veredicto: parseSection(rawText, "VEREDICTO", null),
  };

  const analisar = async () => {
    if (!temFoto) return;
    setLoading(true); setRawText(""); setDone(false); setError(null);
    try {
      const fotos: any[] = [];
      for (const [label, file] of [["Frente", fotoF], ["Costas", fotoC], ["Lateral", fotoL]] as [string, File | null][]) {
        if (!file) continue;
        const data = await toB64(file);
        fotos.push({ label, mime: file.type || "image/jpeg", data });
      }
      const contexto = `Atleta: ${atletaNome || "não informado"} | Semanas para o show: ${semanas} | Observação do coach: ${obsCoach || "nenhuma"}\n\nAnalise as fotos conforme o protocolo APEX para a categoria ${cat.label}.`;
      const system = buildSystemPrompt(cat, atletaNome || "atleta");

      const { data, error: fnErr } = await supabase.functions.invoke("apex-visual-analyze", {
        body: { fotos, contexto, system },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      setRawText(data?.text || "");
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Erro na análise.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setRawText(""); setDone(false); setError(null); setFotoF(null); setFotoC(null); setFotoL(null); };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "20px 16px", color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ background: `linear-gradient(135deg, ${cat.cor}1A, ${C.surface})`, border: `1px solid ${cat.cor}33`, borderRadius: 16, padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 30 }}>{cat.icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: ".02em" }}>APEX Visual Intelligence</div>
              <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>Análise por IA · Padrão IFBB · {cat.label}</div>
            </div>
          </div>
          {done && (
            <button onClick={reset} style={{ padding: "8px 14px", background: "none", border: `1px solid ${cat.cor}66`, borderRadius: 10, color: cat.cor, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Nova análise</button>
          )}
        </div>

        {!done && !loading && (
          <>
            {/* CATEGORIA */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Categoria</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(CATEGORIAS).map(([key, c]) => (
                  <button key={key} onClick={() => setCatKey(key)}
                    style={{
                      padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                      background: catKey === key ? c.cor + "22" : C.surface,
                      border: `1.5px solid ${catKey === key ? c.cor : C.border}`,
                      color: catKey === key ? c.cor : C.textSec,
                      fontSize: 12, fontWeight: catKey === key ? 700 : 500,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                    <span>{c.icon}</span>{c.label}<span style={{ opacity: 0.6 }}>{c.genero === "M" ? "♂" : "♀"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* IDEAL */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: cat.cor, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Ideal da categoria</div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7, marginBottom: 10 }}>{cat.ideal}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cat.pontos_criticos.map(p => (
                  <span key={p} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: cat.cor + "15", color: cat.cor, fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </div>

            {/* DADOS ATLETA */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Nome do atleta</div>
                <input value={atletaNome} onChange={e => setAtletaNome(e.target.value)} placeholder="Ex: João Silva"
                  style={{ width: "100%", padding: "11px 13px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Semanas p/ show</div>
                <input type="number" value={semanas} onChange={e => setSemanas(e.target.value)} placeholder="8"
                  style={{ width: "100%", padding: "11px 13px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            </div>

            {/* FOTOS */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Fotos — envie ao menos 1</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <DropZone label="Frente" angle="01 · Frente" file={fotoF} onFile={setFotoF} onClear={() => setFotoF(null)} />
                <DropZone label="Costas" angle="02 · Costas" file={fotoC} onFile={setFotoC} onClear={() => setFotoC(null)} />
                <DropZone label="Lateral" angle="03 · Lateral" file={fotoL} onFile={setFotoL} onClear={() => setFotoL(null)} />
              </div>
            </div>

            {/* OBS COACH */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Observação do coach (opcional)</div>
              <textarea value={obsCoach} onChange={e => setObsCoach(e.target.value)} rows={2}
                placeholder={`Ex: retenção abdominal, ombro esq menor que dir, flat nos ${cat.genero === "M" ? "peitoral" : "glúteos"}...`}
                style={{ width: "100%", padding: "12px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }} />
            </div>

            {/* BOTÃO */}
            <button onClick={analisar} disabled={!temFoto}
              style={{
                width: "100%", padding: "17px 24px",
                background: temFoto ? `linear-gradient(135deg, ${cat.cor}, ${cat.cor}CC)` : C.surface,
                border: `1.5px solid ${temFoto ? cat.cor : C.border}`,
                borderRadius: 14, cursor: temFoto ? "pointer" : "not-allowed",
                fontSize: 15, fontWeight: 800, color: temFoto ? "#fff" : C.textDim,
                letterSpacing: ".04em", boxShadow: temFoto ? `0 6px 32px ${cat.cor}44` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit",
              }}>
              {temFoto ? <>{cat.icon} Analisar shape — {cat.label} · APEX IA</> : <>📸 Adicione ao menos 1 foto</>}
            </button>

            {error && (
              <div style={{ marginTop: 14, background: C.red + "18", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "12px 16px", color: C.red, fontSize: 13 }}>⚠ {error}</div>
            )}
          </>
        )}

        {loading && <LoadingSteps catColor={cat.cor} />}

        {done && (
          <div>
            {/* CABEÇALHO RESULTADO */}
            <div style={{ background: cat.cor + "14", border: `1px solid ${cat.cor}44`, borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ fontSize: 28 }}>{cat.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: cat.cor }}>{cat.label} · Relatório APEX</div>
                <div style={{ fontSize: 12, color: C.textSec }}>{atletaNome || "Atleta"} · {semanas} semanas para o show</div>
              </div>
              {meta.propScore && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: scoreCol(parseInt(meta.propScore) / 10) }}>{meta.propScore}</div>
                  <div style={{ fontSize: 10, color: C.textSec, textTransform: "uppercase" }}>Proporção/100</div>
                </div>
              )}
            </div>

            {/* MÉTRICAS */}
            {(meta.bfEst || meta.bfMeta || meta.semEst) && (
              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                {meta.bfEst && <InfoCard icon="📊" title="BF atual" value={meta.bfEst + "%"} sub="estimado" color={C.amber} />}
                {meta.bfMeta && <InfoCard icon="🎯" title="BF meta" value={meta.bfMeta + "%"} sub="palco ideal" color={C.greenL} />}
                {meta.semEst && <InfoCard icon="📅" title="Semanas est" value={meta.semEst} sub="conditioning" color={C.blue} />}
                {meta.propScore && <InfoCard icon="⚖" title="Proporção" value={meta.propScore + "/100"} sub="vs ideal" color={cat.cor} />}
              </div>
            )}

            {segmentos.length > 0 && (
              <Accordion icon="📐" title="Scores por segmento" accentColor={cat.cor}>
                {segmentos.map(s => <SegBar key={s.label} label={s.label} score={s.score} diag={s.diag} catColor={cat.cor} />)}
              </Accordion>
            )}

            {sections.impacto && (
              <Accordion icon="👁" title="Impacto visual" accentColor={C.blue}>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{sections.impacto}</div>
              </Accordion>
            )}

            {(sections.ganha || sections.perde) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {sections.ganha && (
                  <div style={{ background: C.surface, border: `1px solid ${C.greenL}33`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.greenL, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>✅ Ganha pontos</div>
                    <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{sections.ganha}</div>
                  </div>
                )}
                {sections.perde && (
                  <div style={{ background: C.surface, border: `1px solid ${C.red}33`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>❌ Perde pontos</div>
                    <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{sections.perde}</div>
                  </div>
                )}
              </div>
            )}

            {sections.cond && (
              <Accordion icon="🔥" title="Condicionamento" accentColor={C.amber} defaultOpen={false}>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{sections.cond.replace(/BF_ESTIMADO:[^\n]*/i, "").replace(/BF_META:[^\n]*/i, "").replace(/SEMANAS_ESTIMADAS:[^\n]*/i, "").trim()}</div>
              </Accordion>
            )}

            {sections.prop && (
              <Accordion icon="⚖" title="Proporções e simetria" accentColor={cat.cor} defaultOpen={false}>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{sections.prop.replace(/SCORE_PROPORCAO:[^\n]*/i, "").trim()}</div>
              </Accordion>
            )}

            {meta.p1 && (
              <Accordion icon="⚡" title="Plano de ataque — prioridades" accentColor={C.amber}>
                {meta.p1 && <Prioridade num={1} texto={meta.p1} color={C.red} />}
                {meta.p2 && <Prioridade num={2} texto={meta.p2} color={C.amber} />}
                {meta.p3 && <Prioridade num={3} texto={meta.p3} color={C.greenL} />}
                {sections.plano && (
                  <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, whiteSpace: "pre-wrap" }}>
                    {sections.plano.replace(/PRIORIDADE_\d:[^\n]*/gi, "").trim()}
                  </div>
                )}
              </Accordion>
            )}

            {sections.posing && (
              <Accordion icon="🎭" title="Posing — esconder fraquezas, vender pontos fortes" accentColor={C.purple} defaultOpen={false}>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{sections.posing}</div>
              </Accordion>
            )}

            {sections.veredicto && (
              <div style={{ background: `linear-gradient(135deg, ${cat.cor}18, ${cat.cor}08)`, border: `1.5px solid ${cat.cor}55`, borderRadius: 16, padding: "20px 22px", marginTop: 4, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: cat.cor, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>🏆 Veredicto do coach</div>
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8, whiteSpace: "pre-wrap", fontStyle: "italic" }}>{sections.veredicto}</div>
              </div>
            )}

            <button onClick={reset}
              style={{ width: "100%", padding: "14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 12, color: C.textSec, fontSize: 13, cursor: "pointer", marginTop: 4, fontFamily: "inherit" }}>
              + Nova análise
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        * { scrollbar-width: thin; scrollbar-color: ${C.border} transparent; }
        ::-webkit-scrollbar { width: 5px } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px }
        input, textarea { color-scheme: dark }
      `}</style>
    </div>
  );
}
