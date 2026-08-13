import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Upload, X, Camera, TrendingUp, TrendingDown, Minus, Mic, Check, AlertTriangle,
  Image as ImageIcon, BarChart3, ChevronRight, Loader2, Download, Sparkles,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

// ──────────── Design tokens ────────────
const T = {
  bg: "#0A0C0F",
  surface: "#111318",
  surfaceHi: "#181C23",
  border: "#1E2430",
  gold: "#B8922A",
  goldGlow: "#FFD86A",
  violet: "#8B5CF6",
  green: "#1D9E75",
  amber: "#EF9F27",
  red: "#D85A30",
  text: "#EDF2FF",
  textDim: "#7A8AAA",
  textMuted: "#3F4A66",
};

const PHASES = [
  { key: "off",     label: "Off Season", color: T.gold },
  { key: "cutting", label: "Cutting",    color: T.green },
  { key: "peak",    label: "Peak Week",  color: T.violet },
] as const;
type PhaseKey = typeof PHASES[number]["key"];

interface Props {
  atletaId: string;
  atletaNome: string;
  dataCompeticao?: string | null;
  categoriaAtleta?: string | null;
}

interface Checkin {
  id: string;
  semana: number;
  semanas_faltam: number | null;
  foto_url: string;
  fase: string;
  peso_kg: number | null;
  bf_percent: number | null;
  score_geral: number | null;
  score_separacao: number | null;
  score_textura: number | null;
  score_dureza: number | null;
  score_proporcao: number | null;
  analise_ia: any;
  delta_score: number | null;
  delta_analise: string | null;
  created_at: string;
  signed_url?: string;
}

// ──────────── Helpers ────────────
const scoreColor = (n: number | null | undefined) => {
  if (n == null) return T.textMuted;
  if (n >= 8) return T.green;
  if (n >= 5) return T.amber;
  return T.red;
};
const stageColor = (s: number | null | undefined) => {
  if (s == null) return T.textMuted;
  if (s >= 81) return T.gold;
  if (s >= 61) return "#1A7A58";
  if (s >= 31) return "#BA7517";
  return "#E24B4A";
};
const fileToBase64 = (f: File): Promise<{ b64: string; mime: string }> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      const [meta, data] = url.split(",");
      const mime = meta.match(/data:(.*);base64/)?.[1] ?? f.type ?? "image/jpeg";
      res({ b64: data, mime });
    };
    r.onerror = rej;
    r.readAsDataURL(f);
  });

async function downloadAsBase64(path: string): Promise<{ b64: string; mime: string } | null> {
  try {
    const { data, error } = await supabase.storage.from("apex-checkins").download(path);
    if (error || !data) return null;
    const buf = await data.arrayBuffer();
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return { b64: btoa(bin), mime: data.type || "image/jpeg" };
  } catch { return null; }
}

// ──────────── Subcomponents ────────────
const ScoreBar = ({ label, value }: { label: string; value: number | null }) => {
  const v = value ?? 0;
  const c = scoreColor(value);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: T.textDim }}>
        <span>{label}</span>
        <span style={{ color: c, fontWeight: 700 }}>{value?.toFixed(1) ?? "—"}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.surfaceHi }}>
        <div className="h-full transition-all" style={{ width: `${(v / 10) * 100}%`, background: c }} />
      </div>
    </div>
  );
};

const StageReadiness = ({ score, label }: { score: number | null; label?: string }) => {
  const c = stageColor(score);
  const glow = score && score >= 81 ? `0 0 32px ${T.gold}88` : `0 0 18px ${c}55`;
  return (
    <div
      className="rounded-2xl p-6 flex flex-col items-center gap-3"
      style={{ background: T.surface, border: `1px solid ${c}66`, boxShadow: glow }}
    >
      <div className="text-xs uppercase tracking-wider" style={{ color: T.textDim }}>Stage Readiness</div>
      <div className="text-6xl font-black tabular-nums" style={{ color: c, fontFamily: "Barlow Condensed, sans-serif" }}>
        {score ?? "—"}
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: T.surfaceHi }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score ?? 0}%`, background: c }} />
      </div>
      <div className="text-sm font-semibold" style={{ color: c }}>{label ?? "—"}</div>
    </div>
  );
};

const AnalysisCards = ({ analise }: { analise: any }) => {
  if (!analise) return null;
  if (analise.score_geral == null) {
    return (
      <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: T.surface, border: `1px solid ${T.amber}55` }}>
        <AlertTriangle className="w-5 h-5" style={{ color: T.amber }} />
        <div>
          <div className="font-semibold" style={{ color: T.amber }}>Foto com baixa qualidade</div>
          <div className="text-sm" style={{ color: T.textDim }}>{analise.parecer_geral ?? "Refaça em boa iluminação."}</div>
        </div>
      </div>
    );
  }

  const ev = analise.delta_comparativo?.evolucao;
  const evColor = ev === "melhorou" ? T.green : ev === "piorou" ? T.red : T.amber;
  const EvIcon = ev === "melhorou" ? TrendingUp : ev === "piorou" ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <StageReadiness score={analise.stage_readiness_score} label={analise.stage_readiness_label} />
        <div className="md:col-span-2 rounded-2xl p-5 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider" style={{ color: T.textDim }}>Score Geral</div>
            <div className="text-3xl font-black tabular-nums" style={{ color: scoreColor(analise.score_geral), fontFamily: "Barlow Condensed" }}>
              {analise.score_geral?.toFixed(1)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <ScoreBar label="Separação" value={analise.score_separacao} />
            <ScoreBar label="Textura" value={analise.score_textura} />
            <ScoreBar label="Dureza" value={analise.score_dureza} />
            <ScoreBar label="Proporção" value={analise.score_proporcao} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider" style={{ color: T.textDim }}>
          <Mic className="w-4 h-4" /> Parecer do Coach
        </div>
        <div className="text-base leading-relaxed" style={{ color: T.text }}>{analise.parecer_geral}</div>
        {analise.recomendacao_coach && (
          <div className="mt-4 pl-4 italic text-sm" style={{ borderLeft: `3px solid ${T.gold}`, color: T.goldGlow }}>
            {analise.recomendacao_coach}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.green}33` }}>
          <div className="flex items-center gap-2 mb-3 font-semibold" style={{ color: T.green }}>
            <Check className="w-4 h-4" /> Pontos Fortes
          </div>
          <ul className="space-y-2 text-sm" style={{ color: T.text }}>
            {(analise.pontos_fortes ?? []).map((p: string, i: number) => (
              <li key={i} className="flex gap-2"><span style={{ color: T.green }}>▸</span>{p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.red}33` }}>
          <div className="flex items-center gap-2 mb-3 font-semibold" style={{ color: T.red }}>
            <AlertTriangle className="w-4 h-4" /> Pontos Fracos
          </div>
          <ul className="space-y-2 text-sm" style={{ color: T.text }}>
            {(analise.pontos_fracos ?? []).map((p: string, i: number) => (
              <li key={i} className="flex gap-2"><span style={{ color: T.red }}>▸</span>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {analise.ajustes_semana && (
        <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="px-5 py-3 text-xs uppercase tracking-wider" style={{ color: T.textDim, background: T.surfaceHi }}>
            Ajustes da Semana
          </div>
          {(["dieta", "treino", "cardio"] as const).map((k, i) => (
            <div key={k} className="px-5 py-3 flex gap-3" style={{ background: i % 2 === 0 ? T.surface : T.surfaceHi }}>
              <div className="text-xs font-bold uppercase w-16 mt-0.5" style={{ color: T.gold }}>{k}</div>
              <div className="text-sm flex-1" style={{ color: T.text }}>{analise.ajustes_semana[k]}</div>
            </div>
          ))}
        </div>
      )}

      {analise.delta_comparativo && (analise.delta_comparativo.delta_texto || ev) && (
        <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${evColor}55` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider" style={{ color: T.textDim }}>Evolução vs semana anterior</div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5"
              style={{ background: `${evColor}22`, color: evColor, border: `1px solid ${evColor}66` }}
            >
              <EvIcon className="w-3.5 h-3.5" /> {ev ?? "—"}
            </div>
          </div>
          {analise.delta_comparativo.delta_texto && (
            <div className="text-sm mb-3" style={{ color: T.text }}>{analise.delta_comparativo.delta_texto}</div>
          )}
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: T.green }}>Melhorou</div>
              <ul className="space-y-1" style={{ color: T.text }}>
                {(analise.delta_comparativo.pontos_melhorados ?? []).map((p: string, i: number) =>
                  <li key={i}>▸ {p}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: T.red }}>Regrediu</div>
              <ul className="space-y-1" style={{ color: T.text }}>
                {(analise.delta_comparativo.pontos_regredidos ?? []).map((p: string, i: number) =>
                  <li key={i}>▸ {p}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────── Main ────────────
export default function ApexEvolucao({ atletaId, atletaNome, dataCompeticao, categoriaAtleta }: Props) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  const [semana, setSemana] = useState<number>(1);
  const [peso, setPeso] = useState<string>("");
  const [bf, setBf] = useState<string>("");
  const [fase, setFase] = useState<PhaseKey>("cutting");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const [view, setView] = useState<"fotos" | "grafico">("fotos");
  const [modalCheckin, setModalCheckin] = useState<Checkin | null>(null);

  const semanasRestantes = useMemo(() => {
    if (!dataCompeticao) return null;
    const diff = (new Date(dataCompeticao).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7);
    return Math.max(0, Math.round(diff));
  }, [dataCompeticao]);

  const loadCheckins = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("apex_checkins" as any)
      .select("*")
      .eq("atleta_id", atletaId)
      .order("semana", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar check-ins", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const list = ((data as any) || []) as Checkin[];
    // Sign URLs
    for (const c of list) {
      const path = c.foto_url;
      if (path) {
        const { data: signed } = await supabase.storage.from("apex-checkins").createSignedUrl(path, 60 * 60);
        c.signed_url = signed?.signedUrl;
      }
    }
    setCheckins(list);
    const next = (list[list.length - 1]?.semana ?? 0) + 1;
    setSemana(next);
    setLoading(false);
  }, [atletaId]);

  useEffect(() => { if (atletaId) loadCheckins(); }, [atletaId, loadCheckins]);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB.", variant: "destructive" });
      return;
    }
    setFoto(f);
    setFotoPreview(URL.createObjectURL(f));
    setResultado(null);
  };

  const analisar = async () => {
    if (!foto) return;
    setAnalyzing(true);
    setResultado(null);
    try {
      // 1. Upload
      const ext = foto.name.split(".").pop() || "jpg";
      const path = `${atletaId}/semana-${semana}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("apex-checkins")
        .upload(path, foto, { upsert: false, contentType: foto.type });
      if (upErr) throw upErr;

      // 2. Base64 atual
      const { b64, mime } = await fileToBase64(foto);

      // 3. Foto anterior (se existir)
      const ultimo = checkins[checkins.length - 1];
      let prev: { b64: string; mime: string } | null = null;
      if (ultimo?.foto_url) prev = await downloadAsBase64(ultimo.foto_url);

      // 4. Edge function
      const { data, error } = await supabase.functions.invoke("apex-evolucao-analyze", {
        body: {
          atletaNome, categoriaAtleta, semana, semanasRestantes, fase,
          peso: peso ? parseFloat(peso) : null,
          bf:   bf   ? parseFloat(bf)   : null,
          fotoAtualBase64: b64,
          fotoAtualMime: mime,
          ...(prev ? { fotoAnteriorBase64: prev.b64, fotoAnteriorMime: prev.mime } : {}),
        },
      });
      if (error) throw error;
      const analise = data?.analise;
      if (!analise) throw new Error("Resposta vazia do sistema");

      // 5. Salvar
      const ultimoScore = ultimo?.score_geral ?? null;
      const deltaScore = (analise.score_geral != null && ultimoScore != null)
        ? Number((analise.score_geral - ultimoScore).toFixed(1))
        : null;

      const insert = {
        atleta_id: atletaId,
        admin_id: user?.id ?? null,
        semana,
        semanas_faltam: semanasRestantes,
        foto_url: path,
        fase,
        peso_kg: peso ? parseFloat(peso) : null,
        bf_percent: bf ? parseFloat(bf) : null,
        score_geral: analise.score_geral,
        score_separacao: analise.score_separacao,
        score_textura: analise.score_textura,
        score_dureza: analise.score_dureza,
        score_proporcao: analise.score_proporcao,
        analise_ia: analise,
        delta_score: deltaScore,
        delta_analise: analise.delta_comparativo?.delta_texto ?? null,
      };
      const { error: insErr } = await supabase.from("apex_checkins" as any).insert(insert);
      if (insErr) throw insErr;

      setResultado(analise);
      toast({ title: "Análise concluída", description: `Semana ${semana} salva no histórico.` });
      setFoto(null); setFotoPreview(null); setPeso(""); setBf("");
      await loadCheckins();
    } catch (e: any) {
      toast({ title: "Erro na análise", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = checkins.map((c) => ({
    semana: `S${c.semana}`,
    geral: c.score_geral, separacao: c.score_separacao, textura: c.score_textura,
    dureza: c.score_dureza, proporcao: c.score_proporcao,
    stage: c.analise_ia?.stage_readiness_score,
  }));

  return (
    <div className="space-y-5" style={{ background: T.bg, color: T.text, fontFamily: "Barlow, sans-serif" }}>
      {/* Header */}
      <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4"
        style={{ background: `linear-gradient(135deg, ${T.surface}, ${T.surfaceHi})`, border: `1px solid ${T.border}` }}>
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" style={{ color: T.gold }} />
            <h2 className="text-2xl font-black uppercase tracking-wider" style={{ color: T.text, fontFamily: "Barlow Condensed" }}>
              APEX — Evolução Fotográfica
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded"
              style={{ background: `${T.violet}22`, color: T.violet, border: `1px solid ${T.violet}55` }}>
              Sistema Ativo
            </span>
          </div>
          <div className="text-sm mt-1" style={{ color: T.textDim }}>Análise visual semanal </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold" style={{ color: T.text }}>{atletaNome}</div>
          {semanasRestantes != null && (
            <div className="text-xs mt-0.5" style={{ color: T.gold }}>
              {semanasRestantes} {semanasRestantes === 1 ? "semana" : "semanas"} para o palco
            </div>
          )}
        </div>
      </div>

      {/* Upload card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full px-5 py-4 flex items-center justify-between"
          style={{ background: T.surfaceHi }}
        >
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5" style={{ color: T.gold }} />
            <span className="font-semibold uppercase tracking-wider text-sm">Novo Check-in</span>
          </div>
          <ChevronRight className="w-4 h-4 transition-transform" style={{
            color: T.textDim, transform: open ? "rotate(90deg)" : "rotate(0)",
          }} />
        </button>

        {open && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Semana" value={semana} onChange={(v) => setSemana(Number(v) || 1)} />
              <NumberField label="Peso (kg)" value={peso} onChange={setPeso} step="0.1" />
              <NumberField label="BF (%)" value={bf} onChange={setBf} step="0.1" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: T.textDim }}>Fase</div>
              <div className="flex gap-2 flex-wrap">
                {PHASES.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setFase(p.key)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: fase === p.key ? `${p.color}22` : T.surfaceHi,
                      border: `1px solid ${fase === p.key ? p.color : T.border}`,
                      color: fase === p.key ? p.color : T.textDim,
                    }}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: T.textDim }}>Foto</div>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] ?? null); }}
                className="rounded-xl p-6 text-center cursor-pointer transition-all"
                style={{ border: `2px dashed ${T.border}`, background: T.bg }}
              >
                {fotoPreview ? (
                  <div className="relative inline-block">
                    <img src={fotoPreview} alt="preview" className="max-h-64 rounded-lg" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setFoto(null); setFotoPreview(null); }}
                      className="absolute -top-2 -right-2 rounded-full p-1"
                      style={{ background: T.red, color: "white" }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2" style={{ color: T.textDim }}>
                    <Upload className="w-8 h-8 mx-auto" />
                    <div className="text-sm">Arraste a foto ou clique para selecionar</div>
                    <div className="text-xs" style={{ color: T.textMuted }}>JPG, PNG, WEBP — máx 10MB</div>
                  </div>
                )}
                <input
                  ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <button
              onClick={analisar}
              disabled={!foto || analyzing}
              className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: foto && !analyzing
                  ? `linear-gradient(135deg, ${T.violet}, ${T.gold})`
                  : T.surfaceHi,
                color: foto && !analyzing ? "white" : T.textMuted,
                cursor: foto && !analyzing ? "pointer" : "not-allowed",
                boxShadow: foto && !analyzing ? `0 0 24px ${T.violet}55` : "none",
              }}
            >
              {analyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analisando... (15-20s)</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analisar </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider" style={{ color: T.gold }}>Análise da Semana {semana}</div>
          <AnalysisCards analise={resultado} />
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl p-5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>
            Linha do Tempo
          </h3>
          <div className="flex gap-1 rounded-lg p-1" style={{ background: T.surfaceHi }}>
            {([
              { k: "fotos",   l: "Fotos",   I: ImageIcon },
              { k: "grafico", l: "Gráfico", I: BarChart3 },
            ] as const).map(({ k, l, I }) => (
              <button
                key={k}
                onClick={() => setView(k)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"
                style={{
                  background: view === k ? T.gold : "transparent",
                  color: view === k ? T.bg : T.textDim,
                }}
              ><I className="w-3.5 h-3.5" />{l}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-xl animate-pulse" style={{ background: T.surfaceHi }} />
            ))}
          </div>
        ) : checkins.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Camera className="w-10 h-10 mx-auto" style={{ color: T.textMuted }} />
            <div className="text-sm" style={{ color: T.textDim }}>
              Faça o primeiro check-in visual do atleta
            </div>
          </div>
        ) : view === "fotos" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {checkins.map((c, idx) => {
              const isLatest = idx === checkins.length - 1;
              const delta = c.delta_score;
              return (
                <button
                  key={c.id}
                  onClick={() => setModalCheckin(c)}
                  className="rounded-xl overflow-hidden text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: T.surfaceHi,
                    border: `1px solid ${isLatest ? T.gold : T.border}`,
                    boxShadow: isLatest ? `0 0 24px ${T.gold}55` : "none",
                  }}
                >
                  <div className="aspect-[3/4] relative" style={{ background: T.bg }}>
                    {c.signed_url
                      ? <img src={c.signed_url} alt={`Semana ${c.semana}`} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8" style={{ color: T.textMuted }} /></div>
                    }
                    {delta != null && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                        style={{
                          background: delta > 0 ? T.green : delta < 0 ? T.red : T.amber,
                          color: "white",
                        }}>
                        {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <div className="text-xs uppercase tracking-wider" style={{ color: T.textDim }}>Semana {c.semana}</div>
                      <div className="text-lg font-black tabular-nums"
                        style={{ color: scoreColor(c.score_geral), fontFamily: "Barlow Condensed" }}>
                        {c.score_geral?.toFixed(1) ?? "—"}
                      </div>
                    </div>
                    <div className="text-[11px]" style={{ color: stageColor(c.analise_ia?.stage_readiness_score) }}>
                      {c.analise_ia?.stage_readiness_label ?? "—"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                <XAxis dataKey="semana" stroke={T.textDim} fontSize={12} />
                <YAxis yAxisId="l" domain={[0, 10]} stroke={T.textDim} fontSize={12} />
                <YAxis yAxisId="r" orientation="right" domain={[0, 100]} stroke={T.textDim} fontSize={12} />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine yAxisId="l" y={7} stroke={T.gold} strokeDasharray="4 4" label={{ value: "Meta 7.0", fill: T.gold, fontSize: 10 }} />
                <Line yAxisId="l" type="monotone" dataKey="geral" name="Geral" stroke={T.gold} strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="l" type="monotone" dataKey="separacao" name="Separação" stroke="#3B82F6" />
                <Line yAxisId="l" type="monotone" dataKey="textura" name="Textura" stroke={T.green} />
                <Line yAxisId="l" type="monotone" dataKey="dureza" name="Dureza" stroke={T.violet} />
                <Line yAxisId="l" type="monotone" dataKey="proporcao" name="Proporção" stroke={T.amber} />
                <Line yAxisId="r" type="monotone" dataKey="stage" name="Stage Readiness" stroke="#FFFFFF" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Modal lateral */}
      {modalCheckin && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setModalCheckin(null)}
        >
          <div
            className="w-full max-w-2xl h-full overflow-y-auto p-6 space-y-4"
            style={{ background: T.bg, borderLeft: `1px solid ${T.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: T.gold }}>
                  Semana {modalCheckin.semana} · {modalCheckin.fase}
                </div>
                <div className="text-xs mt-0.5" style={{ color: T.textDim }}>
                  {new Date(modalCheckin.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <button onClick={() => setModalCheckin(null)} className="p-2 rounded-lg" style={{ background: T.surface }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalCheckin.signed_url && (
              <img src={modalCheckin.signed_url} alt="" className="w-full rounded-xl" />
            )}

            <AnalysisCards analise={modalCheckin.analise_ia} />

            <button
              onClick={() => window.print()}
              className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
              style={{ background: T.surfaceHi, border: `1px solid ${T.border}`, color: T.text }}
            >
              <Download className="w-4 h-4" /> Exportar Análise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, step = "1" }: { label: string; value: any; onChange: (v: string) => void; step?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider mb-1.5" style={{ color: T.textDim }}>{label}</div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm font-semibold tabular-nums focus:outline-none"
        style={{ background: T.surfaceHi, border: `1px solid ${T.border}`, color: T.text }}
      />
    </div>
  );
}
