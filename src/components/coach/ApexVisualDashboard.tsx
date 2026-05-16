import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";
import { Upload, X, FlaskConical, RotateCcw, History, Eye, Dumbbell, CheckCircle2, Clock, FileText, Copy, Crosshair, ScanLine, Target, Activity, Zap, AlertTriangle, TrendingUp, ChevronRight, Trash2 } from "lucide-react";
import { ApexSymbol } from "@/components/coach/ApexSymbol";
import ApexEvolucao from "@/components/apex/ApexEvolucao";
import ApexVisualOverlay, { LandmarkBundle, PhotoBundle, LandmarkView } from "@/components/coach/ApexVisualOverlay";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip as RTooltip } from "recharts";
import React from "react";

// ─── APEX Elite design tokens ───────────────────────────────────
const APEX = {
  void: "#03040A",
  deep: "#060810",
  surface: "#0A0D16",
  elevated: "#0E1220",
  border: "#161D2E",
  borderHi: "#1E2A42",
  electric: "#00D4FF",
  electricDim: "#00D4FF15",
  electricGlow: "#00D4FF30",
  gold: "#FFB800",
  goldDim: "#FFB80015",
  emerald: "#00E676",
  amber: "#FFB300",
  crimson: "#FF3366",
  violet: "#9C27B0",
  violet2: "#7B1FA2",
  textPrimary: "#EDF2FF",
  textSecondary: "#7A8AAA",
  textMuted: "#3F4A66",
  fontDisplay: "'Syne', 'Space Grotesk', sans-serif",
  fontBody: "'DM Sans', 'Inter', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const ApexFontsAndAnimations = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    @keyframes apex-scanLine { 0%{top:0%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
    @keyframes apex-shimmer { 0%{left:-100%} 100%{left:200%} }
    @keyframes apex-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
    @keyframes apex-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    @keyframes apex-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  `}</style>
);
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Categorias ──────────────────────────────────────────────────
type CategoryKey =
  | "mens_physique" | "classic_physique" | "bodybuilding"
  | "bikini" | "wellness" | "figure" | "womens_physique" | "shape_lifestyle";

interface CategoryDef {
  label: string; icon: string; gender: "M" | "F"; color: string;
  ideal: string; criteria: string[]; keyPoints: string[]; poses: string[];
}

const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  mens_physique: {
    label: "Men's Physique", icon: "🏄", gender: "M", color: "#1A6AB5",
    ideal: "Shape atlético e estético. Cintura estreita, ombros largos, condicionamento visível sem estriação excessiva.",
    criteria: ["Largura de ombros e deltoide lateral","Proporção ombro-cintura (forma V)","Abdômen definido","Peitoral com separação","Dorsal largo em V","Braços vasculares","Quadríceps visível","Simetria geral","Apresentação","Condicionamento"],
    keyPoints: ["deltoide lateral","inserção do lat","cintura","separação abdominal"],
    poses: ["Frente relaxada","3/4 turn esquerda","3/4 turn direita","Back pose"],
  },
  classic_physique: {
    label: "Classic Physique", icon: "🏛", gender: "M", color: "#C47A15",
    ideal: "Referência Golden Era. Cintura tiny, ombros e peitoral dominantes. Tamanho respeita peso/altura.",
    criteria: ["Proporções clássicas","Densidade por peso/altura","Peitoral alto e cheio","Dorsal em leque","Pernas completas","Braços proporcionais","Estriação","Separação muscular","Vascularidade moderada","Porte"],
    keyPoints: ["proporção tamanho/altura","cintura","inserção peitoral","simetria lat/ombro"],
    poses: ["Front double biceps","Front lat spread","Side chest","Back double biceps","Back lat spread","Side triceps","Abdominals","Most muscular"],
  },
  bodybuilding: {
    label: "Bodybuilding", icon: "💪", gender: "M", color: "#D94040",
    ideal: "Máximo tamanho com máximo condicionamento. Cada grupo visível e separado. Sem pontos fracos.",
    criteria: ["Tamanho máximo","Condicionamento extremo","Simetria","Estriações","Pernas completas","Dorsal cheio","Peitoral completo","Deltoides 3D","Vascularidade","Posing técnico"],
    keyPoints: ["quadríceps","panturrilha","dorsal inferior","condicionamento"],
    poses: ["Front double biceps","Front lat spread","Side chest","Back double biceps","Back lat spread","Side triceps","Abdominals","Most muscular"],
  },
  bikini: {
    label: "Bikini", icon: "👙", gender: "F", color: "#C0458A",
    ideal: "Corpo feminino atlético e curvilíneo. Glúteos são o ponto central. Fitness saudável com feminilidade.",
    criteria: ["Glúteos cheios","Cintura estreita","Ombros moderados","Pernas tonificadas","Abdômen plano","Proporção feminina","Postura elegante","Condicionamento moderado","Simetria","Apresentação"],
    keyPoints: ["glúteos","cintura","proporção ombro-quadril","condicionamento moderado"],
    poses: ["Frente mãos no quadril","Back pose glúteos","3/4 turn"],
  },
  wellness: {
    label: "Wellness", icon: "🌸", gender: "F", color: "#5A4EC0",
    ideal: "Mais volume que Bikini especialmente MMII. Glúteos e pernas dominam. Cintura fina cria contraste.",
    criteria: ["Glúteos muito desenvolvidos","Coxas cheias","Cintura estreita","Ombros moderados","Panturrilhas","Abdômen tônico","Condicionamento moderado-alto","Feminilidade","Proporção","Postura"],
    keyPoints: ["desenvolvimento glúteos","coxas posteriores","contraste cintura-quadril"],
    poses: ["Frente relaxada","Back pose glúteos","Side pose"],
  },
  figure: {
    label: "Figure", icon: "⚡", gender: "F", color: "#0F8A63",
    ideal: "Forma X perfeita. Músculo visível com feminilidade. Entre Wellness e Women's Physique.",
    criteria: ["Desenvolvimento moderado-alto","Simetria completa","Ombros em V","Cintura apertada","Pernas completas","Dorsal visível","Condicionamento alto","Sem look masculino","Vascularidade discreta","Elegância"],
    keyPoints: ["ombros","simetria topo-base","definição muscular","cintura"],
    poses: ["Front quarter turn","Side pose","Back quarter turn"],
  },
  womens_physique: {
    label: "Women's Physique", icon: "🔥", gender: "F", color: "#C47A15",
    ideal: "Máximo desenvolvimento mantendo forma feminina. Mais músculo que Figure sem masculinizar.",
    criteria: ["Desenvolvimento alto","Definição clara","Simetria","Condicionamento alto","Pernas desenvolvidas","Dorsal completo","Peitoral visível","Deltoides 3D","Cintura fina","Posing técnico"],
    keyPoints: ["separação muscular","condicionamento","dorsais","simetria"],
    poses: ["Front double biceps","Front lat spread","Side chest","Side triceps","Back double biceps","Back lat spread","Abdominals"],
  },
  shape_lifestyle: {
    label: "Shape Lifestyle", icon: "🏋", gender: "M", color: "#0F8A63",
    ideal: "Praticante de musculação não-competidor buscando shape estético top — simetria, proporção, postura corrigida e correção de pontos fracos. Mesma profundidade de avaliação da competição, sem exigência de palco.",
    criteria: ["Simetria geral","Proporção ombro-cintura","Postura e alinhamento","Pontos fracos visuais","Condicionamento estético","Densidade muscular","Definição abdominal","Vascularidade saudável","Equilíbrio MMSS/MMII","Apresentação geral"],
    keyPoints: ["simetria","proporção","postura","pontos fracos","estética geral"],
    poses: ["Frente relaxada","Costas relaxada","Lateral","Pose livre"],
  },
};

const STEPS = [
  "Carregando protocolo APEX v2...",
  "Lendo estrutura corporal...",
  "Detectando desvios posturais...",
  "Avaliando desequilíbrios musculares...",
  "Identificando pontos fracos...",
  "Prescrevendo exercícios corretivos...",
  "Gerando posing corretivo...",
  "Finalizando veredicto...",
];

const buildSystemPrompt = (cat: CategoryDef, athleteName: string, protocolo: string) => `
Você é o APEX Visual Intelligence v2 + Dr. VERTEX — o sistema de análise mais completo do mundo para atletas de fisiculturismo.

Você combina simultaneamente:
- Olhar de juiz IFBB + coach de elite visual (Hany Rambod, Neil Hill, Chad Nicholls)
- Especialista em biomecânica e correção postural (Joe Bennett, Eric Cressey)
- Coach master em farmacologia esportiva (William Llewellyn, Trevor Kouritzin, Miloš Sarcev)

Quando há protocolo farmacológico informado, TODA a análise é contextualizada por ele:
os pontos fracos, o condicionamento, as estratégias de melhoria e as prescrições de treino
levam em conta o ambiente hormonal criado pelos compostos ativos.

━━━ DADOS DO ATLETA ━━━
Nome: ${athleteName}
Categoria: ${cat.label} | Gênero: ${cat.gender === "M" ? "Masculino" : "Feminino"}
Ideal da categoria: ${cat.ideal}
Pontos críticos: ${cat.keyPoints.join(" | ")}
Poses: ${cat.poses.join(" | ")}

${protocolo ? `━━━ PROTOCOLO FARMACOLÓGICO ATIVO ━━━
${protocolo}

INSTRUÇÃO CRÍTICA: Com o protocolo farmacológico acima, a análise muda completamente.
Cada seção deve considerar:
- Como os compostos ativos afetam o shape atual (retenção, dureza, vascularidade, fullness)
- O que é esperado visualmente nesta semana do ciclo com estes compostos
- Quais pontos fracos são limitados pela farmacologia vs por treino/volume insuficiente
- Como o protocolo potencializa ou limita a resposta às correções prescritas
- Quais ajustes de dieta, treino e suporte maximizam os compostos em uso
` : `Nenhum protocolo farmacológico informado — análise como atleta natural.`}

━━━ PROTOCOLO DE ANÁLISE INTEGRADO ━━━
Tom: técnico, direto, sem julgamento. Cada prescrição tem mecanismo fisiológico.
O atleta é um adulto consciente. O coach é um profissional sério.

Use EXATAMENTE estes headers na resposta:

## IMPACTO_VISUAL
[Análise imediata do shape — 2 parágrafos.
${protocolo ? "Contextualizar com o protocolo: o que é efeito dos compostos vs o que é shape real." : ""}]

## SCORES_SEGMENTOS
[Uma linha por segmento: NOME: X/10 — diagnóstico.
${protocolo ? "Indicar se score é limitado pela farmacologia ou por gap de treino/volume." : ""}]

## POSTURA_DESVIOS
[Desvios posturais visíveis: músculo dominante vs inibido + impacto no palco.
${protocolo ? "Indicar se desvio é agravado por algum composto (ex: retenção de Tren, pump de Test)." : ""}]

## CORRECOES_POSTURAIS
[Para cada desvio:
a) Alongamento do músculo dominante — exercício + duração + frequência
b) Ativação do músculo inibido — exercício + séries + reps + cue
c) Cue de postura corrigida para o palco]

## PONTOS_FRACOS_PROTOCOLO
[Para cada grupo fraco:
- Diagnóstico + causa (treino vs farmacologia vs genética)
- Exercício 1 (ativação/isolamento): nome + ângulo + grip + cue + séries×reps
- Exercício 2 (sobrecarga): nome + variação + cue + séries×reps
- Exercício 3 (pump/finalizador): nome + técnica + séries×reps
- Frequência semanal + tempo de resposta visual
${protocolo ? "- Como os compostos ativos afetam a velocidade de resposta deste grupo" : ""}]

## CONDICIONAMENTO
BF_ESTIMADO: XX%
BF_META: XX%
SEMANAS_ESTIMADAS: X
[Análise de condicionamento.
${protocolo ? `Com o protocolo ativo:
- O que é gordura real vs retenção dos compostos
- BF real estimado vs BF aparente na foto
- Como os compostos afetam o caminho até o BF meta
- Ajustes de cardio e dieta específicos para este stack` : ""}]

## FARMACOLOGIA_SHAPE
${protocolo ? `[SEÇÃO EXCLUSIVA — só aparece quando há protocolo informado]

ANÁLISE DR. VERTEX INTEGRADA:

COMPOSTOS E IMPACTO VISUAL:
[Para cada composto identificado: como ele afeta especificamente o shape desta semana]

SINERGIA DO STACK PARA O OBJETIVO:
[Como os compostos trabalham juntos para o objetivo declarado — cutting/bulk/peak]

O QUE O PROTOCOLO ESTÁ FAZENDO PELO SHAPE AGORA:
[Efeitos positivos visíveis nas fotos atribuíveis aos compostos]

O QUE O PROTOCOLO NÃO CONSEGUE RESOLVER:
[Pontos fracos que são limitação de treino/volume, não de farmacologia]

ESTRATÉGIAS PARA MAXIMIZAR ESTE STACK:
- Timing de aplicação em relação ao treino
- Nutrição específica para este stack (TDEE, proteína, CHO timing)
- Ajustes de treino para potencializar os compostos
- O que os coaches de elite fazem diferente com este tipo de protocolo

TDEE_FATOR: X.XX
PROTEINA_IDEAL: Xg/kg
CHO_ESTRATEGIA: [cycling recomendado para este stack]

SUPORTE E SAÚDE:
- Avaliação do suporte atual
- O que está faltando
- Alertas específicos para este stack nesta fase
- Exames prioritários agora

GESTAO_E2: [risco de aromatização + manejo]
ALERTA_CARDIO: [risco cardiovascular + protocolo]
` : "[Nenhum protocolo informado]"}

## GANHA_PONTOS
[Máx 4 — o que o juiz vai valorizar no palco]

## PERDE_PONTOS
[Máx 4 — o que o juiz vai penalizar]

## PLANO_ATAQUE
PRIORIDADE_1: [grupo/ajuste + prescrição]
PRIORIDADE_2: [grupo/ajuste + prescrição]
PRIORIDADE_3: [grupo/ajuste + prescrição]
[Detalhamento considerando o protocolo farmacológico ativo]

## POSING_CORRETIVO
[Cues por pose mandatória — como compensar desvios e vender pontos fortes
${protocolo ? "Considerar efeitos dos compostos na aparência durante a pose (pump, vascularidade, fullness)" : ""}]

## VEREDICTO
[3 frases diretas — o que falta para top 5.
${protocolo ? "Separar o que é resolvível com ajuste de treino/dieta vs o que depende de ajuste farmacológico." : ""}]
`;

const parseFarmMeta = (text: string) => ({
  tdeeFator: text.match(/TDEE_FATOR:\s*([\d.]+)/i)?.[1],
  proteinaIdeal: text.match(/PROTEINA_IDEAL:\s*([^\n]+)/i)?.[1]?.trim(),
  choEstrategia: text.match(/CHO_ESTRATEGIA:\s*([^\n]+)/i)?.[1]?.trim(),
  gestaoE2: text.match(/GESTAO_E2:\s*([^\n]+)/i)?.[1]?.trim(),
  alertaCardio: text.match(/ALERTA_CARDIO:\s*([^\n]+)/i)?.[1]?.trim(),
});

// ─── Parsers ─────────────────────────────────────────────────────
const parseSection = (text: string, key: string, nextKey?: string): string => {
  const pattern = nextKey
    ? new RegExp(`##\\s*${key}([\\s\\S]*?)##\\s*${nextKey}`, "i")
    : new RegExp(`##\\s*${key}([\\s\\S]*)`, "i");
  return text.match(pattern)?.[1]?.trim() || "";
};

const parseSegments = (text: string) => {
  const block = parseSection(text, "SCORES_SEGMENTOS", "POSTURA_DESVIOS");
  return block.split("\n")
    .map(l => l.trim())
    .filter(l => l.includes(":") && l.includes("/10"))
    .map(l => {
      const [labelPart, ...restParts] = l.split(":");
      const rest = restParts.join(":");
      const score = parseInt(rest.match(/(\d+)\/10/)?.[1] || "0", 10);
      const diag = rest.replace(/\d+\/10/, "").replace(/^[\s\-—]+/, "").trim();
      return { label: labelPart.trim(), score, diag };
    })
    .filter(s => s.label && s.score > 0);
};

const parseMeta = (text: string) => ({
  bfEst: text.match(/BF_ESTIMADO:\s*([\d.]+)/i)?.[1],
  bfMeta: text.match(/BF_META:\s*([\d.]+)/i)?.[1],
  semEst: text.match(/SEMANAS_ESTIMADAS:\s*(\d+)/i)?.[1],
  p1: text.match(/PRIORIDADE_1:\s*([^\n]+)/i)?.[1],
  p2: text.match(/PRIORIDADE_2:\s*([^\n]+)/i)?.[1],
  p3: text.match(/PRIORIDADE_3:\s*([^\n]+)/i)?.[1],
});

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// ─── Landmarks parser ───────────────────────────────────────────
const parseLandmarks = (text: string): LandmarkBundle => {
  const out: LandmarkBundle = {};
  const re = /```json_landmarks_(front|lateral|back)\s*([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const view = m[1].toLowerCase() as "front" | "lateral" | "back";
    try {
      const parsed = JSON.parse(m[2].trim());
      if (parsed && parsed.landmarks && parsed.angles) {
        out[view] = { view, landmarks: parsed.landmarks, angles: parsed.angles } as LandmarkView;
      }
    } catch (e) {
      console.warn(`landmarks ${view} parse failed`, e);
    }
  }
  return out;
};

const uploadApexPhoto = async (
  file: File,
  coachId: string | null,
  athleteId: string | null,
  slot: "front" | "back" | "side"
): Promise<string | null> => {
  if (!file || !coachId) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const ts = Date.now();
  const path = `${coachId}/${athleteId || "noath"}/${ts}-${slot}.${ext}`;
  const { error } = await supabase.storage.from("apex-visual-photos").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) {
    console.warn("apex photo upload failed", error);
    return null;
  }
  return path;
};
const segColor = (s: number) =>
  s >= 8 ? "#1DB87A" : s >= 6 ? "#C47A15" : s >= 4 ? "#E07030" : "#D94040";
const segBadge = (s: number) =>
  s >= 8 ? "Elite" : s >= 6 ? "Bom" : s >= 4 ? "Regular" : "Crítico";

// ─── Photo dropzone ─────────────────────────────────────────────
function PhotoZone({ label, file, onPick, onClear, accent }: {
  label: string; file: File | null;
  onPick: (f: File) => void; onClear: () => void; accent: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith("image/")) onPick(f);
      }}
      onClick={() => !file && inputRef.current?.click()}
      className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        border: `2px dashed ${file ? "#1DB87A" : drag ? accent : "hsl(var(--border))"}`,
        background: file ? "rgba(29,184,122,0.05)" : "hsl(var(--muted) / 0.3)",
        minHeight: 140,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      {preview ? (
        <>
          <img src={preview} alt={label} className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold px-2 py-1">
            {label}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground">
          <Upload className="w-6 h-6" />
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-[10px]">Clique ou arraste</div>
        </div>
      )}
    </div>
  );
}

// ─── Markdown helpers ───────────────────────────────────────────
const stripMd = (s: string): string =>
  (s || "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

function renderMd(text: string): React.ReactNode {
  if (!text) return null;
  // strip ATX headers but preserve newlines
  const cleaned = text.replace(/^\s{0,3}#{1,6}\s*/gm, "");
  const lines = cleaned.split("\n");
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`)/g);
    return (
      <React.Fragment key={li}>
        {parts.map((p, i) => {
          if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
          if (/^__[^_]+__$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
          if (/^\*[^*\n]+\*$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
          if (/^_[^_\n]+_$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
          if (/^`[^`]+`$/.test(p)) return <code key={i} className="px-1 rounded bg-muted/60">{p.slice(1, -1)}</code>;
          return <span key={i}>{p}</span>;
        })}
        {li < lines.length - 1 && "\n"}
      </React.Fragment>
    );
  });
}

// ─── Segment bar ────────────────────────────────────────────────
function SegmentBar({ label, score, diag }: { label: string; score: number; diag: string }) {
  const color = segColor(score);
  const cleanLabel = stripMd(label);
  return (
    <div className="rounded-lg p-3 border bg-card">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold text-foreground">{cleanLabel}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${color}22`, color }}>
            {segBadge(score)}
          </span>
          <span className="text-sm font-bold" style={{ color }}>{score}/10</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      {diag && <div className="text-xs text-muted-foreground leading-snug whitespace-pre-wrap">{renderMd(diag)}</div>}
    </div>
  );
}

// ─── APEX general score / classification ────────────────────────
type SegItem = { label: string; score: number; diag: string };

const normTxt = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function computeApexGeneral(segments: SegItem[], _cat: CategoryDef): number {
  let totalW = 0, totalS = 0;
  segments.forEach((s) => {
    const w = s.score <= 5 ? 2 : 1;
    totalW += w;
    totalS += w * s.score;
  });
  return totalW ? Math.round((totalS / totalW) * 10) : 0;
}

function apexBand(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "World Class", color: "#FFB800" };
  if (score >= 80) return { label: "Elite", color: "#1A6AB5" };
  if (score >= 65) return { label: "Bom", color: "#1DB87A" };
  if (score >= 50) return { label: "Intermediário", color: "#C47A15" };
  return { label: "Iniciante", color: "#D94040" };
}

function ApexGeneralScoreCard({ segments, cat }: { segments: SegItem[]; cat: CategoryDef }) {
  if (!segments.length) return null;
  const score = computeApexGeneral(segments, cat);
  const band = apexBand(score);
  // Semicircular arc using SVG
  const r = 70, cx = 90, cy = 90;
  const start = Math.PI, end = 0;
  const t = end + (start - end) * (1 - score / 100);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(t);
  const y2 = cy + r * Math.sin(t);
  const largeArc = score > 50 ? 1 : 0;
  return (
    <div
      className="rounded-xl p-4 border flex items-center gap-5"
      style={{ background: `linear-gradient(135deg, ${band.color}22, transparent)`, borderColor: `${band.color}55` }}
    >
      <svg width="180" height="100" viewBox="0 0 180 100" className="shrink-0">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        {score > 0 && (
          <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke={band.color} strokeWidth="10" strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="28" fontWeight="900" fill="hsl(var(--foreground))">{score}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">/100</text>
      </svg>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">APEX Score Geral</div>
        <div className="text-2xl font-black mt-1" style={{ color: band.color }}>{band.label}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Média ponderada — grupos de alta prioridade pesam 2×.
        </div>
      </div>
    </div>
  );
}

function InsightHighlights({ segments }: { segments: SegItem[] }) {
  if (segments.length < 2) return null;
  // Stable sort preserving IA order on ties: lowest first / highest last
  let lowIdx = 0, highIdx = 0;
  segments.forEach((s, i) => {
    if (s.score < segments[lowIdx].score) lowIdx = i;
    if (s.score > segments[highIdx].score) highIdx = i;
  });
  const low = segments[lowIdx];
  const high = segments[highIdx];
  const firstSentence = (txt: string) => {
    const t = stripMd(txt || "");
    const m = t.match(/^([^.!?\n]+[.!?])/);
    return (m ? m[1] : t).trim();
  };
  const RED = "#FF4444";
  const GREEN = "#00FF88";
  const Card = ({ icon, label, color, name, score, desc }: any) => (
    <div
      className="rounded-lg p-3 flex flex-col"
      style={{
        background: `${color}0D`, // ~5% opacity
        borderLeft: `4px solid ${color}`,
        border: `1px solid ${color}33`,
        borderLeftWidth: 4,
        maxHeight: 120,
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>
        {icon} {label}
      </div>
      <div className="flex items-baseline gap-2 leading-tight">
        <div className="text-lg font-black truncate" style={{ color }}>{name}</div>
        <div className="text-sm font-bold font-mono shrink-0" style={{ color }}>{score}/10</div>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-snug">
        {desc || "—"}
      </div>
    </div>
  );
  return (
    <div className="grid md:grid-cols-2 gap-2">
      <Card icon="🔴" label="Ponto Crítico" color={RED} name={stripMd(low.label)} score={low.score} desc={firstSentence(low.diag)} />
      <Card icon="🟢" label="Ponto Forte" color={GREEN} name={stripMd(high.label)} score={high.score} desc={firstSentence(high.diag)} />
    </div>
  );
}

function ScoresRadar({ segments, prevSegments }: { segments: SegItem[]; prevSegments: SegItem[] | null }) {
  if (segments.length < 3) return null;
  const data = segments.map((s) => {
    const label = stripMd(s.label);
    const item: any = { subject: label.length > 16 ? label.slice(0, 14) + "…" : label, current: s.score, fullMark: 10 };
    if (prevSegments) {
      const norm = normTxt(label);
      const match = prevSegments.find((p) => normTxt(stripMd(p.label)) === norm);
      if (match) item.previous = match.score;
    }
    return item;
  });
  return (
    <div className="rounded-xl p-3 border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mapa de Scores</div>
        {prevSegments && <div className="text-[10px] text-muted-foreground">vs análise anterior</div>}
      </div>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" />
            {prevSegments && (
              <Radar name="Anterior" dataKey="previous" stroke="#4A9EFF" fill="#4A9EFF" fillOpacity={0.18} />
            )}
            <Radar name="Atual" dataKey="current" stroke="#B8922A" fill="#B8922A" fillOpacity={0.45} />
            <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────
interface Props { coachId?: string }

export default function ApexVisualDashboard({ coachId: coachIdProp }: Props) {
  const { user } = useAuth();
  const coachId = coachIdProp || user?.id || null;

  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("mens_physique");
  const [photos, setPhotos] = useState<{ front: File | null; back: File | null; side: File | null }>({
    front: null, back: null, side: null,
  });
  const [formData, setFormData] = useState({ semanas: "", compostos: "", obs: "" });
  const [objetivoCiclo, setObjetivoCiclo] = useState("cutting");
  const [semanaCiclo, setSemanaCiclo] = useState("");
  const [duracaoCiclo, setDuracaoCiclo] = useState("");
  const [suporte, setSuporte] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [activeResultTab, setActiveResultTab] = useState("scores");
  const [isDone, setIsDone] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"pending" | "applied" | null>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [generatingTraining, setGeneratingTraining] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [apexMode, setApexMode] = useState<"analise" | "evolucao">("analise");
  const [promptCopied, setPromptCopied] = useState(false);
  const navigate = useNavigate();

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  // Loading step animation
  useEffect(() => {
    if (!loading) { setStepIdx(0); return; }
    const id = setInterval(() => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)), 900);
    return () => clearInterval(id);
  }, [loading]);

  const cat = CATEGORIES[selectedCategory];
  const hasAnyPhoto = !!(photos.front || photos.back || photos.side);

  // Fetch history for selected athlete
  const fetchHistory = useCallback(async () => {
    if (!coachId || !athlete?.id) { setHistory([]); return; }
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("apex_analyses" as any)
      .select("*")
      .eq("coach_id", coachId)
      .eq("athlete_id", athlete.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (!error) setHistory((data as any[]) || []);
    setHistoryLoading(false);
  }, [coachId, athlete?.id]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const reset = () => {
    setIsDone(false);
    setAnalysisResult("");
    setPhotos({ front: null, back: null, side: null });
    setFormData({ semanas: "", compostos: "", obs: "" });
    setObjetivoCiclo("cutting");
    setSemanaCiclo("");
    setDuracaoCiclo("");
    setSuporte("");
    setActiveResultTab("scores");
    setSavedAnalysisId(null);
    setSyncStatus(null);
  };

  const fetchSyncStatus = useCallback(async (athleteId: string | null) => {
    if (!athleteId) { setSyncStatus(null); return; }
    const { data } = await supabase
      .from("apex_training_sync" as any)
      .select("sync_status")
      .eq("athlete_id", athleteId)
      .maybeSingle();
    setSyncStatus(((data as any)?.sync_status as any) || null);
  }, []);

  const openHistoryItem = (item: any) => {
    const cat = (Object.keys(CATEGORIES) as CategoryKey[]).find(
      (k) => k === item.category
    ) || "mens_physique";
    setSelectedCategory(cat);
    setAnalysisResult(item.analysis_text || "");
    setIsDone(true);
    setActiveResultTab("scores");
    setSavedAnalysisId(item.id || null);
    fetchSyncStatus(item.athlete_id || athlete?.id || null);
  };

  const handleDelete = async (item: any) => {
    const { error } = await supabase
      .from("apex_analyses" as any)
      .delete()
      .eq("id", item.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setHistory((prev) => prev.filter((h) => h.id !== item.id));
    setItemToDelete(null);
    toast({ title: "Análise excluída" });
  };

  const analyzeWithAI = useCallback(async () => {
    setLoading(true);
    try {
      const photoMap: { label: string; file: File | null }[] = [
        { label: "Frente", file: photos.front },
        { label: "Costas", file: photos.back },
        { label: "Lateral", file: photos.side },
      ];
      const fotos: { label: string; mime: string; data: string }[] = [];
      for (const { label, file } of photoMap) {
        if (!file) continue;
        const data = await toBase64(file);
        fotos.push({ label, mime: file.type || "image/jpeg", data });
      }

      const athleteName = athlete?.nome || "atleta";
      const protocoloCompleto = formData.compostos ? `Compostos: ${formData.compostos}
Objetivo do ciclo: ${objetivoCiclo}
Semana ${semanaCiclo || "não informada"} de ${duracaoCiclo || "não informada"} semanas
Suporte em uso: ${suporte || "não informado"}` : "";
      const contexto = `Atleta: ${athleteName} | Semanas para o show: ${formData.semanas || "n/d"} | Protocolo: ${formData.compostos || "não informado"} | Obs: ${formData.obs || "nenhuma"}\n\nGere a análise APEX v2 completa.`;
      const system = buildSystemPrompt(cat, athleteName, protocoloCompleto);

      const { data, error } = await supabase.functions.invoke("apex-visual-analyze", {
        body: { fotos, contexto, system },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      const text = (data as any)?.text || "";
      if (!text) throw new Error("Resposta vazia da IA");

      setAnalysisResult(text);
      setIsDone(true);
      setActiveResultTab("scores");

      // Persist to Supabase
      try {
        const meta = parseMeta(text);
        const farmMeta = parseFarmMeta(text);
        const segments = parseSegments(text);
        const scoresJson = segments.reduce((acc, s) => {
          acc[s.label] = s.score;
          return acc;
        }, {} as Record<string, number>);

        const { data: inserted, error: insErr } = await supabase.from("apex_analyses" as any).insert({
          coach_id: coachId,
          athlete_id: athlete?.id || null,
          category: selectedCategory,
          category_label: cat.label,
          analysis_text: text,
          bf_estimated: meta.bfEst ? parseFloat(meta.bfEst) : null,
          bf_target: meta.bfMeta ? parseFloat(meta.bfMeta) : null,
          weeks_estimated: meta.semEst ? parseInt(meta.semEst, 10) : null,
          priority_1: meta.p1 || null,
          priority_2: meta.p2 || null,
          priority_3: meta.p3 || null,
          scores: scoresJson,
          protocol: formData.compostos || null,
          cycle_goal: formData.compostos ? objetivoCiclo : null,
          cycle_week: semanaCiclo ? parseInt(semanaCiclo, 10) : null,
          cycle_duration: duracaoCiclo ? parseInt(duracaoCiclo, 10) : null,
          support: suporte || null,
          tdee_factor: farmMeta.tdeeFator ? parseFloat(farmMeta.tdeeFator) : null,
          protein_ideal: farmMeta.proteinaIdeal || null,
        }).select("id").single();
        if (insErr) throw insErr;
        setSavedAnalysisId((inserted as any)?.id || null);
        await fetchSyncStatus(athlete?.id || null);
        toast({ title: "✓ Análise APEX salva com sucesso" });
        fetchHistory();
      } catch (saveErr: any) {
        console.error("apex save error", saveErr);
        toast({
          title: "Análise gerada",
          description: "Erro ao salvar histórico — verifique a conexão.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erro na análise",
        description: e?.message || "Falha ao processar com a IA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [athlete, cat, formData, photos, coachId, selectedCategory, fetchHistory, fetchSyncStatus, objetivoCiclo, semanaCiclo, duracaoCiclo, suporte]);

  // ─── Generate corrective training ────────────────────
  const buildSyncPayload = useCallback(() => {
    const meta = parseMeta(analysisResult);
    const segments = parseSegments(analysisResult);
    const weakPoints = segments
      .filter((s) => s.score < 6)
      .sort((a, b) => a.score - b.score)
      .map((s) => ({ muscle: s.label, score: s.score, diagnosis: (s as any).diag || "" }));
    return {
      meta,
      weakPoints,
      posturalDeviations: parseSection(analysisResult, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS"),
      correctiveProtocol: parseSection(analysisResult, "PONTOS_FRACOS_PROTOCOLO", "CONDICIONAMENTO"),
      posturalCorrections: parseSection(analysisResult, "CORRECOES_POSTURAIS", "PONTOS_FRACOS_PROTOCOLO"),
      priorities: { p1: meta.p1, p2: meta.p2, p3: meta.p3 },
    };
  }, [analysisResult]);

  const handleGenerateTraining = useCallback(async () => {
    if (!athlete?.id || !coachId) {
      toast({ title: "Selecione um atleta antes de gerar o treino", variant: "destructive" });
      return;
    }
    setGeneratingTraining(true);
    try {
      const p = buildSyncPayload();
      const { error } = await supabase.from("apex_training_sync" as any).upsert({
        athlete_id: athlete.id,
        coach_id: user?.id,
        category: selectedCategory,
        weak_points: p.weakPoints,
        postural_deviations: p.posturalDeviations,
        corrective_protocol: p.correctiveProtocol,
        postural_corrections: p.posturalCorrections,
        priorities: p.priorities,
        bf_estimated: p.meta.bfEst ? parseFloat(p.meta.bfEst) : null,
        bf_target: p.meta.bfMeta ? parseFloat(p.meta.bfMeta) : null,
        apex_analysis_id: savedAnalysisId,
        sync_status: "pending",
        updated_at: new Date().toISOString(),
      }, { onConflict: "athlete_id" });
      if (error) throw error;
      setSyncStatus("pending");
      setShowTrainingModal(true);
    } catch (e: any) {
      toast({ title: "Erro ao sincronizar com TrainingON", description: e?.message, variant: "destructive" });
    } finally {
      setGeneratingTraining(false);
    }
  }, [athlete, coachId, user?.id, selectedCategory, savedAnalysisId, buildSyncPayload]);

  const goToTrainingOn = () => {
    if (!athlete?.id) return;
    setShowTrainingModal(false);
    navigate(`/coach/trainingon?athlete=${athlete.id}&mode=corrective`);
  };

  // ─── RENDER: LOADING ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <ApexSymbol size={96} color={cat.color} animated />
        <div className="text-lg font-bold text-foreground">APEX Intelligence analisando...</div>
        <div className="space-y-1.5 w-full max-w-md">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="text-sm transition-all"
              style={{
                color: i < stepIdx ? "#1DB87A" : i === stepIdx ? cat.color : "hsl(var(--muted-foreground))",
                opacity: i <= stepIdx ? 1 : 0.4,
                fontWeight: i === stepIdx ? 700 : 400,
              }}
            >
              {i < stepIdx ? "✓ " : i === stepIdx ? "▸ " : "  "}{s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── RENDER: RESULT ──────────────────────────────────
  if (isDone) {
    const meta = parseMeta(analysisResult);
    const farmMeta = parseFarmMeta(analysisResult);
    const farmacologiaSection = parseSection(analysisResult, "FARMACOLOGIA_SHAPE", "GANHA_PONTOS");
    const hasFarmacologia = !!farmacologiaSection && !/nenhum protocolo informado/i.test(farmacologiaSection);
    const segments = parseSegments(analysisResult);
    const tabs = [
      { key: "scores", label: "Scores" },
      { key: "postura", label: "Postura" },
      { key: "correcoes", label: "Correções" },
      { key: "protocolo", label: "Protocolo" },
      ...(hasFarmacologia ? [{ key: "farmacologia", label: "💉 Farmacologia" }] : []),
      { key: "palco", label: "Palco" },
      { key: "plano", label: "Plano" },
    ];

    return (
      <div className="space-y-5">
        {/* Header */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${cat.color}22, transparent)`, border: `1px solid ${cat.color}55` }}
        >
          <div className="text-3xl">{cat.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-foreground">{cat.label}</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-widest" style={{ background: "linear-gradient(135deg,#FFB800,#E0A000)", color: "#1A1100" }}>ELITE</span>
            </div>
            <div className="text-xs text-muted-foreground">{athlete?.nome || "Atleta"} · Análise APEX Visual Intelligence</div>
          </div>
          <button
            onClick={reset}
            className="text-xs px-3 py-2 rounded-lg border hover:bg-muted flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Nova análise
          </button>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          {meta.bfEst && <Pill label="BF estimado" value={`${meta.bfEst}%`} color="#E07030" />}
          {meta.bfMeta && <Pill label="BF meta" value={`${meta.bfMeta}%`} color="#1DB87A" />}
          {meta.semEst && <Pill label="Semanas" value={meta.semEst} color={cat.color} />}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveResultTab(t.key)}
              className="px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-all"
              style={{
                color: activeResultTab === t.key ? cat.color : "hsl(var(--muted-foreground))",
                borderBottom: `2px solid ${activeResultTab === t.key ? cat.color : "transparent"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeResultTab === "scores" && (
            <div className="space-y-3">
              {segments.length === 0 && <EmptyMsg text="Nenhum score retornado pela IA." />}
              {segments.length > 0 && (
                <>
                  <ApexGeneralScoreCard segments={segments} cat={cat} />
                  <InsightHighlights segments={segments} />
                  <ScoresRadar
                    segments={segments}
                    prevSegments={(() => {
                      const prev = history.find((h: any) => h && h.id !== savedAnalysisId && h.scores && Object.keys(h.scores).length);
                      if (!prev) return null;
                      return Object.entries(prev.scores as Record<string, number>).map(([label, score]) => ({
                        label, score: Number(score) || 0, diag: "",
                      }));
                    })()}
                  />
                </>
              )}
              {segments.map((s, i) => <SegmentBar key={i} {...s} />)}
              <InfoBlock title="Impacto visual" body={parseSection(analysisResult, "IMPACTO_VISUAL", "SCORES_SEGMENTOS")} accent={cat.color} />
            </div>
          )}
          {activeResultTab === "postura" && (
            <div className="space-y-3">
              <InfoBox color="#D94040" text="Desvios posturais detectados — músculo dominante vs inibido e impacto no palco." />
              <Pre body={parseSection(analysisResult, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS")} />
            </div>
          )}
          {activeResultTab === "correcoes" && (
            <div className="space-y-3">
              <InfoBox color="#0F8A63" text="Para cada desvio: alongamento, ativação e cue de postura." />
              <Pre body={parseSection(analysisResult, "CORRECOES_POSTURAIS", "PONTOS_FRACOS_PROTOCOLO")} />
            </div>
          )}
          {activeResultTab === "protocolo" && (
            <div className="space-y-3">
              <InfoBox color="#C47A15" text="Diagnóstico + causa + exercícios + frequência + tempo de resposta." />
              <Pre body={parseSection(analysisResult, "PONTOS_FRACOS_PROTOCOLO", "CONDICIONAMENTO")} />
              <GenerateTrainingButton onClick={handleGenerateTraining} loading={generatingTraining} />
            </div>
          )}
          {activeResultTab === "farmacologia" && hasFarmacologia && (
            <div className="space-y-3">
              <InfoBox color="#534AB7" text="💉 Análise Dr. VERTEX integrada — shape contextualizado pelo protocolo farmacológico ativo." />
              <div className="flex flex-wrap gap-2">
                {farmMeta.tdeeFator && <Pill label="TDEE fator" value={`×${farmMeta.tdeeFator}`} color="#534AB7" />}
                {farmMeta.proteinaIdeal && <Pill label="Proteína" value={farmMeta.proteinaIdeal} color="#1DB87A" />}
                {farmMeta.choEstrategia && <Pill label="CHO" value={farmMeta.choEstrategia} color="#C47A15" />}
                {farmMeta.gestaoE2 && <Pill label="E2" value={farmMeta.gestaoE2} color="#E07030" />}
                {farmMeta.alertaCardio && <Pill label="Cardio" value={farmMeta.alertaCardio} color="#D94040" />}
              </div>
              <Pre body={farmacologiaSection} />
            </div>
          )}
          {activeResultTab === "palco" && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <ScoreSide title="✅ Ganha pontos" color="#1DB87A" body={parseSection(analysisResult, "GANHA_PONTOS", "PERDE_PONTOS")} />
                <ScoreSide title="❌ Perde pontos" color="#D94040" body={parseSection(analysisResult, "PERDE_PONTOS", "PLANO_ATAQUE")} />
              </div>
              <InfoBlock title="Posing corretivo" body={parseSection(analysisResult, "POSING_CORRETIVO", "VEREDICTO")} accent={cat.color} />
            </div>
          )}
          {activeResultTab === "plano" && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <PrioCard n={1} color="#D94040" text={meta.p1} />
                <PrioCard n={2} color="#C47A15" text={meta.p2} />
                <PrioCard n={3} color="#1DB87A" text={meta.p3} />
              </div>
              <div className="flex flex-wrap gap-2">
                {meta.bfEst && <Pill label="BF estimado" value={`${meta.bfEst}%`} color="#E07030" />}
                {meta.bfMeta && <Pill label="BF meta" value={`${meta.bfMeta}%`} color="#1DB87A" />}
                {meta.semEst && <Pill label="Semanas" value={meta.semEst} color={cat.color} />}
              </div>
              <InfoBlock title="Condicionamento" body={parseSection(analysisResult, "CONDICIONAMENTO", "FARMACOLOGIA_SHAPE")} accent={cat.color} />
              <GenerateTrainingButton onClick={handleGenerateTraining} loading={generatingTraining} />
            </div>
          )}
        </div>

        {/* Sync status badge */}
        {syncStatus && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: syncStatus === "applied" ? "#1DB87A22" : "#C47A1522",
              color: syncStatus === "applied" ? "#1DB87A" : "#C47A15",
              border: `1px solid ${syncStatus === "applied" ? "#1DB87A55" : "#C47A1555"}`,
            }}
          >
            {syncStatus === "applied" ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Treino Corretivo Ativo no TrainingON</>
            ) : (
              <><Clock className="w-3.5 h-3.5" /> Aguardando TrainingON</>
            )}
          </div>
        )}

        {/* Veredicto sempre visível */}
        <div
          className="rounded-xl p-4"
          style={{ background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}11)`, border: `1px solid ${cat.color}66` }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: cat.color }}>
            <ApexSymbol size={20} color={cat.color} animated />
            <span className="text-[10px] font-bold uppercase tracking-wider">Veredicto APEX — O que falta para Top 5</span>
          </div>
          <div className="text-sm italic text-foreground whitespace-pre-wrap">
            {parseSection(analysisResult, "VEREDICTO") ? renderMd(parseSection(analysisResult, "VEREDICTO")) : "—"}
          </div>
        </div>

        {/* Modal de confirmação */}
        <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" style={{ color: cat.color }} />
                Treino Corretivo Pronto para Gerar
              </DialogTitle>
              <DialogDescription>
                Os dados da análise APEX foram sincronizados. O TrainingON vai gerar treino específico para os pontos fracos + exercícios de ativação pré-treino.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Atleta:</span> <span className="font-semibold">{athlete?.nome || "—"}</span></div>
              <div><span className="text-muted-foreground">Categoria:</span> <span className="font-semibold">{cat.label}</span></div>
              <div>
                <div className="text-muted-foreground mb-1">Pontos fracos identificados:</div>
                <div className="flex flex-wrap gap-1.5">
                  {buildSyncPayload().weakPoints.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Nenhum grupo com score &lt; 6.</span>
                  )}
                  {buildSyncPayload().weakPoints.map((w, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-semibold">
                      {w.muscle} ({w.score})
                    </span>
                  ))}
                </div>
              </div>
              {meta.p1 && (
                <div><span className="text-muted-foreground">Prioridade 1:</span> <span className="font-semibold">{meta.p1}</span></div>
              )}
            </div>
            <DialogFooter>
              <button
                onClick={() => setShowTrainingModal(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={goToTrainingOn}
                className="px-4 py-2 text-sm rounded-lg font-bold text-white"
                style={{ background: "linear-gradient(135deg, #1A6AB5, #2A8AE5)" }}
              >
                Ir para o TrainingON
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── RENDER: FORM ────────────────────────────────────
  const accent = cat.color;
  const sysFont = APEX.fontBody;
  const labelStyle: React.CSSProperties = {
    fontFamily: APEX.fontBody, fontSize: 10, fontWeight: 700,
    color: APEX.textSecondary, letterSpacing: ".12em", textTransform: "uppercase",
  };
  const cardStyle: React.CSSProperties = {
    background: APEX.surface, border: `1px solid ${APEX.border}`,
    borderRadius: 16, padding: "18px 20px",
  };
  const inputBase: React.CSSProperties = {
    width: "100%", padding: "12px 14px", background: APEX.deep,
    border: `1px solid ${APEX.border}`, borderRadius: 10,
    color: APEX.textPrimary, fontSize: 13, fontFamily: APEX.fontBody,
    lineHeight: 1.55, outline: "none", boxSizing: "border-box", transition: "border .2s",
  };
  const sectionTick = (color: string) => (
    <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
  );

  return (
    <div style={{ background: APEX.void, color: APEX.textPrimary, fontFamily: sysFont, padding: 4 }}>
      <ApexFontsAndAnimations />

      {/* ━━━ HEADER ━━━ */}
      <div style={{
        background: `linear-gradient(180deg, ${APEX.deep}, ${APEX.void})`,
        border: `1px solid ${APEX.border}`, borderRadius: 18,
        padding: "20px 24px", marginBottom: 20, position: "relative", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: APEX.textMuted, fontFamily: APEX.fontMono, letterSpacing: ".08em", marginBottom: 14 }}>
          <span>nutriON</span>
          <ChevronRight size={10} />
          <span>Coach Hub</span>
          <ChevronRight size={10} />
          <span style={{ color: APEX.electric }}>APEX Intelligence</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg, ${APEX.electricDim}, ${APEX.deep})`,
              border: `1px solid ${APEX.electric}55`, position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 30px ${APEX.electricGlow}`,
            }}>
              <ApexSymbol size={44} color={APEX.electric} animated />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 24, fontWeight: 800, color: APEX.textPrimary, letterSpacing: ".02em" }}>APEX</span>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 24, fontWeight: 800, color: APEX.electric, letterSpacing: ".02em" }}>INTELLIGENCE</span>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 24, fontWeight: 400, color: APEX.textSecondary, letterSpacing: ".02em" }}>SYSTEM</span>
                <span style={{
                  fontFamily: APEX.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: ".15em",
                  padding: "3px 8px", borderRadius: 4, color: "#1A1100",
                  background: `linear-gradient(135deg, ${APEX.gold}, #E0A000)`,
                  boxShadow: `0 0 12px ${APEX.gold}55`,
                }}>ELITE</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: APEX.textSecondary, fontFamily: APEX.fontBody, letterSpacing: ".02em" }}>
                Motor de Diagnóstico Visual <span style={{ color: APEX.textMuted, margin: "0 6px" }}>·</span>
                Padrão IFBB <span style={{ color: APEX.textMuted, margin: "0 6px" }}>·</span>
                Biomecânica <span style={{ color: APEX.textMuted, margin: "0 6px" }}>·</span>
                Farmacologia Integrada
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: APEX.deep, border: `1px solid ${APEX.emerald}44`, borderRadius: 999 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: APEX.emerald, boxShadow: `0 0 8px ${APEX.emerald}`, animation: "apex-pulse 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: APEX.fontMono, fontSize: 10, fontWeight: 700, color: APEX.emerald, letterSpacing: ".1em" }}>SISTEMA ATIVO</span>
          </div>
        </div>

        <div style={{ marginTop: 16, height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${APEX.electric}, transparent 60%)` }} />
      </div>

      {/* ━━━ ATLETA ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {sectionTick(APEX.electric)}
          <span style={labelStyle}>Atleta em Análise</span>
        </div>
        <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />
      </div>

      {/* ━━━ MODE TOGGLE: Análise IA vs Evolução Fotográfica ━━━ */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {([
          { k: "analise" as const,  l: "Análise IA",            icon: ScanLine },
          { k: "evolucao" as const, l: "Evolução Fotográfica",  icon: TrendingUp },
        ]).map(({ k, l, icon: Ic }) => {
          const active = apexMode === k;
          return (
            <button
              key={k}
              onClick={() => setApexMode(k)}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                background: active ? `linear-gradient(135deg, ${APEX.electricDim}, ${APEX.deep})` : APEX.deep,
                border: `1px solid ${active ? APEX.electric : APEX.border}`,
                color: active ? APEX.electric : APEX.textSecondary,
                fontFamily: APEX.fontDisplay, fontSize: 12, fontWeight: 700,
                letterSpacing: ".08em", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: active ? `0 0 18px ${APEX.electricGlow}` : "none",
              }}
            >
              <Ic size={14} /> {l}
            </button>
          );
        })}
      </div>

      {apexMode === "evolucao" && (
        <div style={{ marginBottom: 16 }}>
          {athlete ? (
            <ApexEvolucao
              atletaId={athlete.id}
              atletaNome={athlete.nome}
              dataCompeticao={athlete.data_competicao}
              categoriaAtleta={athlete.categoria ?? selectedCategory}
            />
          ) : (
            <div style={{ ...cardStyle, textAlign: "center", color: APEX.textSecondary, padding: 32 }}>
              Selecione um atleta para acessar a evolução fotográfica.
            </div>
          )}
        </div>
      )}

      {apexMode === "analise" && (<>


      {/* ━━━ CATEGORIA ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {sectionTick(APEX.gold)}
          <span style={labelStyle}>Categoria de Competição</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
            const c = CATEGORIES[key];
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                  fontFamily: APEX.fontBody, transition: "all .2s",
                  background: isActive ? `linear-gradient(135deg, ${c.color}25, ${c.color}10)` : APEX.deep,
                  border: `1px solid ${isActive ? c.color : APEX.border}`,
                  color: isActive ? c.color : APEX.textSecondary,
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  display: "flex", alignItems: "center", gap: 8, letterSpacing: ".01em",
                  boxShadow: isActive ? `0 0 20px ${c.color}30` : "none",
                }}
              >
                <span style={{ fontSize: 14 }}>{c.icon}</span>
                <span>{c.label}</span>
                <span style={{ fontSize: 11, opacity: .7 }}>{c.gender === "M" ? "♂" : "♀"}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 14, padding: "12px 14px", borderRadius: 10,
          background: `linear-gradient(135deg, ${accent}10, transparent)`,
          border: `1px solid ${accent}44`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Target size={11} color={accent} />
            <span style={{ fontFamily: APEX.fontMono, fontSize: 9, fontWeight: 700, color: accent, letterSpacing: ".15em" }}>
              PADRÃO DE JULGAMENTO IFBB
            </span>
          </div>
          <div style={{ fontSize: 12, color: APEX.textPrimary, lineHeight: 1.55, marginBottom: 8 }}>{cat.ideal}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cat.keyPoints.map((k) => (
              <span key={k} style={{
                fontSize: 10, fontFamily: APEX.fontMono, padding: "3px 8px", borderRadius: 4,
                background: `${accent}1A`, color: accent, border: `1px solid ${accent}33`,
              }}>{k}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ━━━ FOTOS ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {sectionTick(APEX.electric)}
            <span style={labelStyle}>Fotos para Análise</span>
          </div>
          <span style={{ fontSize: 10, color: APEX.textMuted }}>
            mín. 1 obrigatória · mais ângulos = diagnóstico mais preciso
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { key: "front" as const, label: "FRENTE", num: "01", instruction: "Relaxado, braços ao lado" },
            { key: "back" as const, label: "COSTAS", num: "02", instruction: "Dorsal visível" },
            { key: "side" as const, label: "LATERAL", num: "03", instruction: "Perfil direito ou esquerdo" },
          ].map(({ key, label, num, instruction }) => (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: APEX.fontMono, fontSize: 11, fontWeight: 700, color: APEX.electric }}>{num}</span>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 11, fontWeight: 700, color: APEX.textPrimary, letterSpacing: ".1em" }}>{label}</span>
              </div>
              <PhotoZone
                label={instruction}
                file={photos[key]}
                accent={APEX.electric}
                onPick={(f) => setPhotos((p) => ({ ...p, [key]: f }))}
                onClear={() => setPhotos((p) => ({ ...p, [key]: null }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ━━━ SEMANAS + PROTOCOLO ━━━ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {sectionTick(APEX.amber)}
            <span style={labelStyle}>Semanas para o Show</span>
          </div>
          <input
            type="number" min={0}
            value={formData.semanas}
            onChange={(e) => setFormData({ ...formData, semanas: e.target.value })}
            placeholder="Ex: 12"
            style={{ ...inputBase, fontFamily: APEX.fontMono, fontSize: 15, fontWeight: 500 }}
            onFocus={(e) => (e.target.style.borderColor = APEX.electric)}
            onBlur={(e) => (e.target.style.borderColor = APEX.border)}
          />
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {sectionTick(APEX.violet)}
              <span style={labelStyle}>Protocolo Farmacológico</span>
            </div>
            {formData.compostos && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: `${APEX.violet}15`, border: `1px solid ${APEX.violet}55`, borderRadius: 999 }}>
                <Zap size={10} color={APEX.violet} />
                <span style={{ fontFamily: APEX.fontMono, fontSize: 9, fontWeight: 700, color: APEX.violet, letterSpacing: ".1em" }}>DR. VERTEX ATIVO</span>
              </div>
            )}
          </div>
          <textarea
            value={formData.compostos}
            onChange={(e) => setFormData({ ...formData, compostos: e.target.value })}
            placeholder="Ex: Testosterona Enantato 300mg/sem, Trembolona 200mg/sem, Masteron 200mg/sem, HGH 2UI/dia..."
            rows={3}
            style={{ ...inputBase, border: `1px solid ${formData.compostos ? `${APEX.violet}44` : APEX.border}`, fontSize: 12, lineHeight: 1.65, resize: "vertical" }}
            onFocus={(e) => (e.target.style.borderColor = APEX.violet)}
            onBlur={(e) => (e.target.style.borderColor = formData.compostos ? `${APEX.violet}44` : APEX.border)}
          />
          {formData.compostos && (
            <div style={{ marginTop: 8, fontSize: 10, color: APEX.textSecondary, lineHeight: 1.5 }}>
              ✦ A análise incluirá: impacto dos compostos no shape · sinergias do stack · próximo nível do protocolo · fitoterápicos e suporte · gestão de estrogênio
            </div>
          )}
        </div>
      </div>

      {/* ━━━ CICLO DETALHES ━━━ */}
      {formData.compostos && (
        <div style={{ ...cardStyle, marginBottom: 16, borderColor: `${APEX.violet}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            {sectionTick(APEX.violet)}
            <span style={labelStyle}>Detalhes do Ciclo</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Objetivo</div>
              <select value={objetivoCiclo} onChange={(e) => setObjetivoCiclo(e.target.value)} style={inputBase}>
                <option value="cutting">Cutting</option>
                <option value="bulk">Bulk</option>
                <option value="recomp">Recomposição</option>
                <option value="peak">Peak Week</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Semana do ciclo</div>
              <input type="number" value={semanaCiclo} onChange={(e) => setSemanaCiclo(e.target.value)} placeholder="Ex: 6" style={{ ...inputBase, fontFamily: APEX.fontMono }} />
            </div>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Duração total (sem)</div>
              <input type="number" value={duracaoCiclo} onChange={(e) => setDuracaoCiclo(e.target.value)} placeholder="Ex: 16" style={{ ...inputBase, fontFamily: APEX.fontMono }} />
            </div>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Suporte em uso</div>
              <input type="text" value={suporte} onChange={(e) => setSuporte(e.target.value)} placeholder="Ex: Anastrozol 0.5mg, TUDCA" style={inputBase} />
            </div>
          </div>
        </div>
      )}

      {/* ━━━ OBSERVAÇÕES ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {sectionTick(APEX.electric)}
          <span style={labelStyle}>Observações do Coach</span>
        </div>
        <textarea
          value={formData.obs}
          onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
          placeholder="Contexto adicional: lesões, deload, dieta atual, queixas do atleta, pontos específicos para avaliar..."
          rows={3}
          style={{ ...inputBase, fontSize: 12, lineHeight: 1.65, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = APEX.electric)}
          onBlur={(e) => (e.target.style.borderColor = APEX.border)}
        />
      </div>

      {/* ━━━ HISTÓRICO ━━━ */}
      {athlete && (
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {sectionTick(APEX.textSecondary)}
            <span style={labelStyle}>Análises anteriores</span>
            <span style={{ fontSize: 10, color: APEX.textMuted, marginLeft: 4 }}>· {athlete.nome}</span>
          </div>
          {historyLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ height: 56, borderRadius: 10, background: APEX.deep, opacity: .5 }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div style={{ fontSize: 11, color: APEX.textMuted, fontStyle: "italic", padding: "16px", textAlign: "center", border: `1px dashed ${APEX.border}`, borderRadius: 10 }}>
              Nenhuma análise anterior para este atleta.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((item) => {
                const itemCat = (CATEGORIES as any)[item.category] || cat;
                return (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    background: APEX.deep, border: `1px solid ${itemCat.color}33`, borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 22 }}>{itemCat.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: APEX.textPrimary }}>{item.category_label || itemCat.label}</span>
                        <span style={{ fontSize: 10, color: APEX.textMuted, fontFamily: APEX.fontMono }}>{formatRelative(item.created_at)}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {item.bf_estimated != null && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${APEX.amber}22`, color: APEX.amber, fontFamily: APEX.fontMono }}>BF est {item.bf_estimated}%</span>}
                        {item.bf_target != null && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${APEX.emerald}22`, color: APEX.emerald, fontFamily: APEX.fontMono }}>Meta {item.bf_target}%</span>}
                        {item.weeks_estimated != null && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${itemCat.color}22`, color: itemCat.color, fontFamily: APEX.fontMono }}>{item.weeks_estimated} sem</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => openHistoryItem(item)}
                      style={{ fontSize: 10, padding: "6px 10px", borderRadius: 6, background: "transparent", color: itemCat.color, border: `1px solid ${itemCat.color}55`, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}
                    >
                      <Eye size={11} /> Ver
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      title="Excluir análise"
                      style={{ fontSize: 10, padding: "6px 10px", borderRadius: 6, background: "transparent", color: APEX.textMuted, border: `1px solid ${APEX.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, transition: "color 0.2s, border-color 0.2s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = APEX.crimson; (e.currentTarget as HTMLButtonElement).style.borderColor = `${APEX.crimson}55`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = APEX.textMuted; (e.currentTarget as HTMLButtonElement).style.borderColor = APEX.border; }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ━━━ AÇÕES ━━━ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => setShowPromptPreview(true)}
          style={{
            width: "100%", padding: "10px 16px", borderRadius: 10, cursor: "pointer",
            background: APEX.deep, border: `1px solid ${APEX.border}`,
            color: APEX.textSecondary, fontSize: 11, fontFamily: APEX.fontBody, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            letterSpacing: ".05em",
          }}
        >
          <FileText size={12} />
          Pré-visualizar prompt enviado à IA (APEX + Dr. VERTEX)
        </button>

        <button
          onClick={analyzeWithAI}
          disabled={!hasAnyPhoto}
          style={{
            width: "100%", padding: "18px 24px", borderRadius: 14, border: "none",
            cursor: hasAnyPhoto ? "pointer" : "not-allowed",
            fontFamily: APEX.fontDisplay, fontSize: 14, fontWeight: 800,
            letterSpacing: ".1em", textTransform: "uppercase",
            transition: "all .3s", position: "relative", overflow: "hidden",
            background: hasAnyPhoto ? `linear-gradient(135deg, ${accent}, ${accent}AA)` : APEX.deep,
            color: hasAnyPhoto ? "#000" : APEX.textMuted,
            boxShadow: hasAnyPhoto ? `0 0 40px ${accent}40, 0 4px 20px ${accent}30` : "none",
          }}
        >
          {hasAnyPhoto && (
            <div style={{
              position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "apex-shimmer 2.5s ease-in-out infinite",
            }} />
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative" }}>
            {hasAnyPhoto ? (
              <>
                <Crosshair size={18} strokeWidth={2.5} />
                <span>INICIAR DIAGNÓSTICO APEX{formData.compostos ? " + DR. VERTEX" : ""}</span>
              </>
            ) : (
              <>
                <ApexSymbol size={18} color={APEX.textMuted} animated={false} />
                <span>ADICIONE AO MENOS 1 FOTO PARA INICIAR</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Modal: prompt preview */}
      <Dialog open={showPromptPreview} onOpenChange={setShowPromptPreview}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Prompt completo enviado à IA
            </DialogTitle>
            <DialogDescription>
              Análise APEX {formData.compostos ? "+ Dr. VERTEX (farmacologia ativa)" : "(sem protocolo farmacológico)"} — {athlete?.nome || "atleta"} · {cat.label}
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const athleteName = athlete?.nome || "atleta";
            const protocoloCompleto = formData.compostos ? `Compostos: ${formData.compostos}
Objetivo do ciclo: ${objetivoCiclo}
Semana ${semanaCiclo || "não informada"} de ${duracaoCiclo || "não informada"} semanas
Suporte em uso: ${suporte || "não informado"}` : "";
            const system = buildSystemPrompt(cat, athleteName, protocoloCompleto);
            const contexto = `Atleta: ${athleteName} | Semanas para o show: ${formData.semanas || "n/d"} | Protocolo: ${formData.compostos || "não informado"} | Obs: ${formData.obs || "nenhuma"}\n\nGere a análise APEX completa.`;
            const fullPrompt = `━━━━━ SYSTEM PROMPT ━━━━━\n\n${system}\n\n━━━━━ USER CONTEXT ━━━━━\n\n${contexto}`;
            return (
              <>
                <div className="flex-1 overflow-auto rounded-lg border border-border bg-muted/30 p-3">
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-foreground">{fullPrompt}</pre>
                </div>
                <DialogFooter className="gap-2">
                  <div className="text-xs text-muted-foreground mr-auto self-center">{fullPrompt.length.toLocaleString()} caracteres</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(fullPrompt).then(() => {
                        setPromptCopied(true);
                        toast({ title: "Prompt copiado", description: "Conteúdo enviado à IA copiado para a área de transferência." });
                        setTimeout(() => setPromptCopied(false), 2000);
                      });
                    }}
                    className="px-4 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {promptCopied ? "✓ Copiado" : "Copiar prompt completo"}
                  </button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
      </>)}

      {/* ━━━ DELETE CONFIRMATION DIALOG ━━━ */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent style={{ background: APEX.surface, border: `1px solid ${APEX.border}`, color: APEX.textPrimary }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: APEX.textPrimary }}>Deseja excluir esta análise?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: APEX.textSecondary }}>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setItemToDelete(null)}
              style={{ background: "transparent", border: `1px solid ${APEX.border}`, color: APEX.textSecondary }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              style={{ background: APEX.crimson, color: "#fff", border: "none" }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) {
    const h = Math.floor(diffMs / 3600000);
    return h < 1 ? "agora" : `há ${h}h`;
  }
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return d.toLocaleDateString("pt-BR");
}

// ─── Small helpers ───────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
      style={{ background: color + "1A", border: `1px solid ${color}55`, color }}>
      <span className="opacity-70">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function InfoBox({ color, text }: { color: string; text: string }) {
  return (
    <div className="rounded-lg p-3 text-xs" style={{ background: color + "12", border: `1px solid ${color}44`, color }}>
      {text}
    </div>
  );
}

function Pre({ body }: { body: string }) {
  if (!body) return <EmptyMsg text="Sem conteúdo nesta seção." />;
  return (
    <div className="text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-3 border border-border">
      {renderMd(body)}
    </div>
  );
}

function InfoBlock({ title, body, accent }: { title: string; body: string; accent: string }) {
  if (!body) return null;
  return (
    <div className="rounded-lg p-3 border bg-card">
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>{stripMd(title)}</div>
      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{renderMd(body)}</div>
    </div>
  );
}

function ScoreSide({ title, color, body }: { title: string; color: string; body: string }) {
  return (
    <div className="rounded-lg p-3 border" style={{ borderColor: color + "66", background: color + "0A" }}>
      <div className="text-xs font-bold mb-2" style={{ color }}>{stripMd(title)}</div>
      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{body ? renderMd(body) : "—"}</div>
    </div>
  );
}

function PrioCard({ n, color, text }: { n: number; color: string; text?: string }) {
  return (
    <div className="rounded-lg p-3 border" style={{ borderColor: color + "66", background: color + "0A" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: color }}>
          {n}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Prioridade {n}</div>
      </div>
      <div className="text-xs text-foreground/90">{text ? renderMd(text) : "—"}</div>
    </div>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground italic px-3 py-4 text-center">{text}</div>;
}

function GenerateTrainingButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full mt-4 p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #1A6AB5, #2A8AE5)", color: "#fff" }}
    >
      <Dumbbell className="w-4 h-4" />
      {loading ? "Sincronizando..." : "Gerar Treino Corretivo no TrainingON"}
    </button>
  );
}
