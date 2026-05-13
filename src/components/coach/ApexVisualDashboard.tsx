import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";
import { Upload, X, FlaskConical, RotateCcw, History, Eye, Dumbbell, CheckCircle2, Clock } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

// ─── Categorias ──────────────────────────────────────────────────
type CategoryKey =
  | "mens_physique" | "classic_physique" | "bodybuilding"
  | "bikini" | "wellness" | "figure" | "womens_physique";

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

const buildSystemPrompt = (cat: CategoryDef, athleteName: string) => `
Você é o APEX Visual Intelligence v2 — sistema de análise visual para atletas de fisiculturismo com olhar de juiz IFBB + coach de elite (Hany Rambod, Neil Hill, Chad Nicholls, Miloš Sarcev) + especialista em biomecânica (Joe Bennett).

CATEGORIA: ${cat.label} | GÊNERO: ${cat.gender === "M" ? "Masculino" : "Feminino"} | ATLETA: ${athleteName}
IDEAL: ${cat.ideal}
PONTOS CRÍTICOS: ${cat.keyPoints.join(" | ")}
POSES: ${cat.poses.join(" | ")}

Tom: técnico, direto, sem elogios vazios. Cada problema tem causa E solução específica.

Use EXATAMENTE estes headers:

## IMPACTO_VISUAL
[Análise imediata em 2 parágrafos]

## SCORES_SEGMENTOS
[Uma linha por segmento no formato: NOME: X/10 — diagnóstico]

## POSTURA_DESVIOS
[Desvios posturais: músculo dominante vs inibido + impacto no palco]

## CORRECOES_POSTURAIS
[Para cada desvio: a) Alongamento b) Ativação c) Cue de postura para o palco]

## PONTOS_FRACOS_PROTOCOLO
[Para cada ponto fraco: Diagnóstico + Causa + Exercício 1 + Exercício 2 + Exercício 3 + Frequência + Tempo de resposta]

## CONDICIONAMENTO
BF_ESTIMADO: XX%
BF_META: XX%
SEMANAS_ESTIMADAS: X
[Análise detalhada]

## GANHA_PONTOS
[Máx 4 — o que o juiz vai valorizar]

## PERDE_PONTOS
[Máx 4 — o que o juiz vai penalizar]

## PLANO_ATAQUE
PRIORIDADE_1: [texto]
PRIORIDADE_2: [texto]
PRIORIDADE_3: [texto]

## POSING_CORRETIVO
[Cues por pose mandatória]

## VEREDICTO
[3 frases — o que falta para top 5]
`;

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

// ─── Segment bar ────────────────────────────────────────────────
function SegmentBar({ label, score, diag }: { label: string; score: number; diag: string }) {
  const color = segColor(score);
  return (
    <div className="rounded-lg p-3 border bg-card">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold text-foreground">{label}</div>
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
      {diag && <div className="text-xs text-muted-foreground leading-snug">{diag}</div>}
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
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [activeResultTab, setActiveResultTab] = useState("scores");
  const [isDone, setIsDone] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"pending" | "applied" | null>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [generatingTraining, setGeneratingTraining] = useState(false);
  const navigate = useNavigate();

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
    setActiveResultTab("scores");
  };

  const openHistoryItem = (item: any) => {
    const cat = (Object.keys(CATEGORIES) as CategoryKey[]).find(
      (k) => k === item.category
    ) || "mens_physique";
    setSelectedCategory(cat);
    setAnalysisResult(item.analysis_text || "");
    setIsDone(true);
    setActiveResultTab("scores");
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
      const contexto = `Atleta: ${athleteName} | Semanas para o show: ${formData.semanas || "n/d"} | Protocolo: ${formData.compostos || "não informado"} | Obs: ${formData.obs || "nenhuma"}\n\nGere a análise APEX v2 completa.`;
      const system = buildSystemPrompt(cat, athleteName);

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
        const segments = parseSegments(text);
        const scoresJson = segments.reduce((acc, s) => {
          acc[s.label] = s.score;
          return acc;
        }, {} as Record<string, number>);

        const { error: insErr } = await supabase.from("apex_analyses" as any).insert({
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
        });
        if (insErr) throw insErr;
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
  }, [athlete, cat, formData, photos, coachId, selectedCategory, fetchHistory]);

  // ─── RENDER: LOADING ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="text-6xl animate-pulse">🔬</div>
        <div className="text-lg font-bold text-foreground">APEX v2 analisando...</div>
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
    const segments = parseSegments(analysisResult);
    const tabs = [
      { key: "scores", label: "Scores" },
      { key: "postura", label: "Postura" },
      { key: "correcoes", label: "Correções" },
      { key: "protocolo", label: "Protocolo" },
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
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: cat.color, color: "#fff" }}>v2</span>
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
              <InfoBlock title="Condicionamento" body={parseSection(analysisResult, "CONDICIONAMENTO", "GANHA_PONTOS")} accent={cat.color} />
            </div>
          )}
        </div>

        {/* Veredicto sempre visível */}
        <div
          className="rounded-xl p-4"
          style={{ background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}11)`, border: `1px solid ${cat.color}66` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: cat.color }}>
            Veredicto APEX
          </div>
          <div className="text-sm italic text-foreground whitespace-pre-wrap">
            {parseSection(analysisResult, "VEREDICTO") || "—"}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: FORM ────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-amber-500" />
        <div>
          <div className="text-base font-black text-foreground">🔬 APEX Visual Intelligence v2</div>
          <div className="text-xs text-muted-foreground">Análise visual por IA · Padrão IFBB · Postura + protocolo corretivo</div>
        </div>
      </div>

      {/* Athlete */}
      <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />

      {/* Category grid */}
      <div>
        <div className="text-xs font-semibold mb-2 text-foreground">Categoria</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
            const c = CATEGORIES[key];
            const active = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className="rounded-lg p-3 text-left transition-all border-2"
                style={{
                  borderColor: active ? c.color : "hsl(var(--border))",
                  background: active ? `${c.color}1A` : "transparent",
                  color: active ? c.color : "hsl(var(--foreground))",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: c.color + "33", color: c.color }}>
                    {c.gender === "M" ? "♂" : "♀"}
                  </span>
                </div>
                <div className="text-[11px] font-bold leading-tight">{c.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ideal box */}
      <div className="rounded-lg p-3 border" style={{ borderColor: cat.color + "55", background: cat.color + "0A" }}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: cat.color }}>
          Ideal · {cat.label}
        </div>
        <div className="text-xs text-foreground/90 leading-snug mb-2">{cat.ideal}</div>
        <div className="flex flex-wrap gap-1">
          {cat.keyPoints.map((k) => (
            <span key={k} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: cat.color + "22", color: cat.color }}>
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Form fields */}
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Semanas para o show">
          <input
            type="number"
            min={0}
            value={formData.semanas}
            onChange={(e) => setFormData({ ...formData, semanas: e.target.value })}
            placeholder="ex: 12"
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground"
          />
        </Field>
        <Field label="Protocolo / compostos">
          <input
            type="text"
            value={formData.compostos}
            onChange={(e) => setFormData({ ...formData, compostos: e.target.value })}
            placeholder="ex: TRT 200mg + Anavar 40mg"
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground"
          />
        </Field>
      </div>
      <Field label="Observações">
        <textarea
          value={formData.obs}
          onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
          rows={2}
          placeholder="contexto extra: lesões, deload, dieta atual..."
          className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground"
        />
      </Field>

      {/* Photos */}
      <div>
        <div className="text-xs font-semibold mb-2 text-foreground">Fotos (mínimo 1)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PhotoZone label="Frente" file={photos.front} accent={cat.color}
            onPick={(f) => setPhotos((p) => ({ ...p, front: f }))}
            onClear={() => setPhotos((p) => ({ ...p, front: null }))} />
          <PhotoZone label="Costas" file={photos.back} accent={cat.color}
            onPick={(f) => setPhotos((p) => ({ ...p, back: f }))}
            onClear={() => setPhotos((p) => ({ ...p, back: null }))} />
          <PhotoZone label="Lateral" file={photos.side} accent={cat.color}
            onPick={(f) => setPhotos((p) => ({ ...p, side: f }))}
            onClear={() => setPhotos((p) => ({ ...p, side: null }))} />
        </div>
      </div>

      {/* History */}
      {athlete && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <div className="text-xs font-semibold text-foreground">Análises anteriores</div>
            <div className="text-[10px] text-muted-foreground">· {athlete.nome}</div>
          </div>
          {historyLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-xs text-muted-foreground italic px-3 py-4 text-center border border-dashed border-border rounded-lg">
              Nenhuma análise anterior para este atleta.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => {
                const itemCat = (CATEGORIES as any)[item.category] || cat;
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-card p-3 flex items-center gap-3"
                    style={{ borderColor: itemCat.color + "44" }}
                  >
                    <div className="text-2xl">{itemCat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground">{item.category_label || itemCat.label}</span>
                        <span className="text-[10px] text-muted-foreground">{formatRelative(item.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {item.bf_estimated != null && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#E0703022", color: "#E07030" }}>
                            BF est {item.bf_estimated}%
                          </span>
                        )}
                        {item.bf_target != null && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#1DB87A22", color: "#1DB87A" }}>
                            Meta {item.bf_target}%
                          </span>
                        )}
                        {item.weeks_estimated != null && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: itemCat.color + "22", color: itemCat.color }}>
                            {item.weeks_estimated} sem
                          </span>
                        )}
                      </div>
                      {item.priority_1 && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          <span className="font-semibold text-foreground/80">P1:</span> {item.priority_1}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openHistoryItem(item)}
                      className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-lg border hover:bg-muted flex items-center gap-1 font-semibold"
                      style={{ borderColor: itemCat.color + "55", color: itemCat.color }}
                    >
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={analyzeWithAI}
        disabled={!hasAnyPhoto}
        className="w-full py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: hasAnyPhoto ? cat.color : "hsl(var(--muted))",
          color: hasAnyPhoto ? "#fff" : "hsl(var(--muted-foreground))",
          boxShadow: hasAnyPhoto ? `0 8px 24px -8px ${cat.color}99` : "none",
        }}
      >
        🔬 Analisar com APEX v2
      </button>
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
    <pre className="text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-3 border border-border">
      {body}
    </pre>
  );
}

function InfoBlock({ title, body, accent }: { title: string; body: string; accent: string }) {
  if (!body) return null;
  return (
    <div className="rounded-lg p-3 border bg-card">
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>{title}</div>
      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{body}</div>
    </div>
  );
}

function ScoreSide({ title, color, body }: { title: string; color: string; body: string }) {
  return (
    <div className="rounded-lg p-3 border" style={{ borderColor: color + "66", background: color + "0A" }}>
      <div className="text-xs font-bold mb-2" style={{ color }}>{title}</div>
      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{body || "—"}</div>
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
      <div className="text-xs text-foreground/90">{text || "—"}</div>
    </div>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground italic px-3 py-4 text-center">{text}</div>;
}
