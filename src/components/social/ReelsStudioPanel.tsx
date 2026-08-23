import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, BookOpen, Briefcase, CalendarDays, Camera, Check, ChevronRight, Clock, Copy,
  Crown, Download, Dumbbell, Eye, FileText, Flame, Hash, Heart, History, Image, Layers, Music, RefreshCw,
  ShieldCheck, Sparkles, Target, TrendingUp, Trash2, Type, Upload, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { buildFullCaption, downloadTxt } from "@/lib/reelsExport";
import ReelsStoriesPanel from "./ReelsStoriesPanel";
import ReelsQualityPanel from "./ReelsQualityPanel";
import ReelsVariationsPanel from "./ReelsVariationsPanel";
import ReelsCalendar30 from "./ReelsCalendar30";


const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22",
  gold: "#B8922A", goldDim: "#B8922A55", goldBg: "#B8922A08",
  cyan: "#00D4FF", cyanBg: "#00D4FF0A", green: "#00C896",
  red: "#ff4444", purple: "#7C3AED", orange: "#E8A020", pink: "#EC4899",
  text: "#F5F0E8", textMid: "#A0A0A0", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

const FONT = {
  xs: 10, sm: 12, base: 14, md: 16, lg: 18, xl: 22, "2xl": 28, "3xl": 36,
} as const;

type Template = { id: string; name: string; icon: typeof Eye; color: string; desc: string };

const TEMPLATES: Template[] = [
  { id: "fisheye_pov", name: "Fisheye POV", icon: Eye, color: C.cyan, desc: "Lente olho de peixe, câmera baixa, walking + talking" },
  { id: "black_culture", name: "Representatividade", icon: Crown, color: C.gold, desc: "Cultura preta, referências, ícones do esporte e da música" },
  { id: "fitness_lifestyle", name: "Fitness Lifestyle", icon: Dumbbell, color: C.green, desc: "Shape, rotina, prep, suplementação, treino pesado" },
  { id: "girl_dad", name: "Pai de Menina", icon: Heart, color: C.pink, desc: "Momentos com a filha, rotina de pai, ternura + disciplina" },
  { id: "treino_edit", name: "Training Edit", icon: Flame, color: C.orange, desc: "Edit puro de treino, frames rápidos, beat sync" },
  { id: "tela_preta", name: "Tela Preta", icon: Type, color: C.text, desc: "Texto polêmico + câmera frontal direta" },
  { id: "business_ceo", name: "Modo CEO", icon: Briefcase, color: C.purple, desc: "Empreendedorismo, vendas, metas, disciplina" },
  { id: "mce_ciencia", name: "MCE Científico", icon: BookOpen, color: C.cyan, desc: "Conceito científico + autor + insight aplicado" },
  { id: "vlog_dia", name: "Vlog Dia a Dia", icon: Camera, color: C.green, desc: "Rotina real, manhã à noite, bastidores autênticos" },
  { id: "antes_depois", name: "Antes / Depois", icon: Image, color: C.orange, desc: "Transformação visual com storytelling de evolução" },
  { id: "pergunta_resposta", name: "Pergunta Resposta", icon: Type, color: C.cyan, desc: "Pergunta do público + resposta direta e técnica" },
  { id: "bastidores", name: "Bastidores", icon: Zap, color: C.gold, desc: "Como o conteúdo é feito: equipe, erro, processo" },
];

type Result = {
  id?: string;
  analise_visual?: string; template_match?: string; hook?: string;
  roteiro?: Record<string, string>;
  legendas?: { tom: string; texto: string }[];
  hashtags?: string[]; self_comment?: string; melhor_horario?: string;
  stories?: string[]; produto_sugerido?: string; nivel_funil?: string;
};

type HistoryItem = {
  id: string;
  created_at: string;
  subtype: string | null;
  ai_content: Result | null;
};

function CopyBtn({ textToCopy, label = "COPIAR" }: { textToCopy: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(textToCopy); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, ...fM, fontSize: FONT.sm, color: copied ? C.green : C.textMid }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "COPIADO" : label}
    </button>
  );
}

async function extractVideoFrame(videoFile: File): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const done = (v: string | null) => { URL.revokeObjectURL(video.src); resolve(v); };
    video.onloadeddata = () => { video.currentTime = Math.min(1, (video.duration || 5) * 0.2); };
    video.onseeked = () => {
      canvas.width = Math.min(video.videoWidth || 720, 1024);
      canvas.height = Math.min(video.videoHeight || 1280, 1024);
      const ctx = canvas.getContext("2d");
      if (!ctx) return done(null);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.8));
    };
    video.onerror = () => done(null);
    video.src = URL.createObjectURL(videoFile);
  });
}

const readAsDataUrl = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error("Erro ao ler arquivo"));
    r.readAsDataURL(f);
  });

const LOADING_MSGS = [
  "Analisando sua imagem...", "Detectando contexto visual...", "Cruzando com seu DNA de conteúdo...",
  "Gerando hook viral...", "Escrevendo 3 legendas...", "Selecionando hashtags...",
  "Montando roteiro completo...", "Finalizando pacote...",
];

export default function ReelsStudioPanel({ onBack, context: ctxSeed }: { onBack?: () => void; context?: string }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [context, setContext] = useState(ctxSeed || "");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCaption, setActiveCaption] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [resultTab, setResultTab] = useState<"pacote" | "stories" | "qualidade" | "variacoes">("pacote");
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("prism_analyses")
      .select("id, created_at, subtype, ai_content")
      .eq("mode", "reels_studio")
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setHistory(data as HistoryItem[]);
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("prism_analyses").delete().eq("id", id);
    if (error) return toast.error("Erro ao remover");
    setHistory((p) => p.filter((h) => h.id !== id));
    toast.success("Removido");
  };

  const restoreFromHistory = (item: HistoryItem) => {
    if (!item.ai_content) return;
    setResult({ ...item.ai_content, id: item.id });
    setActiveCaption(0);
    setError(null);
    const tpl = TEMPLATES.find((t) => t.name === item.subtype) || null;
    setTemplate(tpl);
    setShowHistory(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 60 * 1024 * 1024) return toast.error("Arquivo acima de 60MB");
    setFile(f);
    setTrim(null);
    setPreview(f.type.startsWith("image/") ? await readAsDataUrl(f) : await extractVideoFrame(f));
  };

  const handleGenerate = async () => {
    if (!file || !template || loading) return;
    setLoading(true); setError(null); setResult(null); setActiveCaption(0);

    let i = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const interval = window.setInterval(() => {
      i = Math.min(i + 1, LOADING_MSGS.length - 1);
      setLoadingMsg(LOADING_MSGS[i]);
    }, 2500);

    try {
      const isVideo = file.type.startsWith("video/");
      const image = isVideo ? preview ?? (await extractVideoFrame(file)) : await readAsDataUrl(file);
      if (!image) throw new Error("Não consegui extrair um frame desse vídeo. Sobe uma foto ou outro arquivo.");

      const trimContext = trim
        ? `${context ? context + "\n" : ""}Trecho do vídeo selecionado: ${trim.start}s até ${trim.end}s (${trim.duration}s de duração). Ajuste o roteiro para caber nesse tempo.`
        : context;

      const { data, error: fnError } = await supabase.functions.invoke("prism-analyze", {
        body: { mode: "reels_studio", image, from_video: isVideo, template_name: template.name, template_desc: template.desc, context: trimContext },
      });

      if (fnError) throw new Error(fnError.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult((data as any).result as Result);
      if ((data as any)?.id) setResult((r) => ({ ...r, id: (data as any).id } as Result));
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar. Tente novamente.");
    } finally {
      window.clearInterval(interval);
      setLoading(false);
    }
  };

  const saveToHistory = async () => {
    if (!result || result.id || saving) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const coach_id = userData.user?.id;
    if (!coach_id) {
      toast.error("Você precisa estar logado");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("prism_analyses")
      .insert({
        coach_id,
        mode: "reels_studio",
        subtype: template?.name || null,
        ai_content: result as any,
        files_count: file ? 1 : 0,
        file_types: file ? [file.type.startsWith("video/") ? "video" : "image"] : [],
        context,
      })
      .select("id")
      .single();
    if (!error && data?.id) {
      setResult((r) => ({ ...r, id: data.id } as Result));
      toast.success("Salvo no histórico do PRISM");
      loadHistory();
    } else {
      toast.error("Erro ao salvar");
    }
    setSaving(false);
  };

  const reset = () => { setResult(null); setFile(null); setPreview(null); setTemplate(null); setError(null); setActiveCaption(0); };
  const captionColors = [C.red, C.cyan, C.pink, C.orange];

  const historyTitle = (item: HistoryItem) => {
    const hook = item.ai_content?.hook || "";
    return hook ? hook.slice(0, 50) + (hook.length > 50 ? "…" : "") : item.subtype || "Reel";
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", ...fM, fontSize: FONT.sm, color: C.textMid, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
          <ChevronRight size={13} style={{ transform: "rotate(180deg)" }} /> MODOS
        </button>
      )}

      <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 12, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ ...fT, fontSize: FONT["2xl"], color: C.text }}>SOCIAL ON · <span style={{ color: C.gold }}>REELS STUDIO</span></div>
          <div style={{ ...fM, fontSize: FONT.sm, color: C.textMid, marginTop: 4 }}>@diogo.mell0 · transformação é sistema.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { setShowCalendar((s) => !s); setShowHistory(false); }}
            style={{ background: showCalendar ? `${C.cyan}18` : "transparent", border: `1px solid ${C.border}`, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, ...fM, fontSize: FONT.sm, color: showCalendar ? C.cyan : C.textMid }}
          >
            <CalendarDays size={15} /> {showCalendar ? "OCULTAR" : "CALENDÁRIO 30D"}
          </button>
          <button
            onClick={() => { setShowHistory((s) => !s); setShowCalendar(false); }}
            style={{ background: showHistory ? `${C.gold}18` : "transparent", border: `1px solid ${C.border}`, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, ...fM, fontSize: FONT.sm, color: showHistory ? C.gold : C.textMid }}
          >
            <History size={15} /> {showHistory ? "OCULTAR" : "HISTÓRICO"}
          </button>
        </div>
      </div>

      {showCalendar && (
        <div style={{ marginBottom: 18 }}>
          <ReelsCalendar30 />
        </div>
      )}


      {showHistory && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16, marginBottom: 18 }}>
          <div style={{ ...fT, fontSize: FONT.lg, color: C.text, marginBottom: 10 }}>Últimos Reels gerados</div>
          {history.length === 0 ? (
            <div style={{ ...fM, fontSize: FONT.base, color: C.textMid }}>Nenhum Reel salvo ainda.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => restoreFromHistory(item)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: C.card, border: `1px solid ${C.border}`, cursor: "pointer" }}
                >
                  <div>
                    <div style={{ ...fT, fontSize: FONT.md, color: C.text }}>{historyTitle(item)}</div>
                    <div style={{ ...fM, fontSize: FONT.xs, color: C.textMid, marginTop: 2 }}>{item.subtype || "Reel"} · {new Date(item.created_at).toLocaleString("pt-BR")}</div>
                  </div>
                  <button onClick={(e) => deleteHistoryItem(item.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && (
        <div>
          <div style={{ ...fM, fontSize: FONT.sm, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>PASSO 1 — SOBE SEU CONTEÚDO</div>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              background: file ? `${C.green}06` : C.bg,
              border: `2px dashed ${file ? C.green : C.border}`,
              padding: preview ? 10 : "40px 24px", textAlign: "center", cursor: "pointer", marginBottom: 20,
            }}
          >
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />
            {preview ? (
              <div>
                <img src={preview} alt="Prévia do conteúdo enviado" style={{ maxHeight: 220, margin: "0 auto", display: "block", objectFit: "contain" }} />
                <div style={{ ...fM, fontSize: FONT.sm, color: C.textMid, marginTop: 8 }}>
                  {file?.name} · {((file?.size || 0) / 1024 / 1024).toFixed(1)}MB · toque pra trocar
                </div>
              </div>
            ) : (
              <div>
                <Upload size={28} color={C.textMid} />
                <p style={{ ...fT, fontSize: FONT.xl, color: C.text, marginTop: 10 }}>Sobe foto ou vídeo</p>
                <p style={{ ...fM, fontSize: FONT.sm, color: C.textMid, marginTop: 6 }}>O sistema analisa o que VÊ e gera tudo automaticamente</p>
              </div>
            )}
          </div>

          <div style={{ ...fM, fontSize: FONT.sm, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>PASSO 2 — ESCOLHE O ESTILO</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {TEMPLATES.map((t) => {
              const Icon = t.icon;
              const active = template?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t)}
                  style={{
                    flex: "1 1 calc(50% - 10px)", minWidth: 170, textAlign: "left",
                    background: active ? `${t.color}12` : C.bg,
                    border: `1px solid ${active ? `${t.color}66` : C.border}`,
                    padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <Icon size={20} color={t.color} style={{ flexShrink: 0 }} />
                  <span>
                    <span style={{ ...fT, fontSize: FONT.md, color: active ? t.color : C.text, display: "block" }}>{t.name}</span>
                    <span style={{ ...fM, fontSize: FONT.xs, color: C.textMid, display: "block", lineHeight: 1.4 }}>{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ ...fM, fontSize: FONT.sm, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>PASSO 3 — CONTEXTO (opcional)</div>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: quero vender o nutriON, gravei depois do treino de costas, tô em cutting, tava com minha filha..."
            rows={3}
            style={{ width: "100%", padding: "12px 14px", ...fM, fontSize: FONT.base, background: C.bg, border: `1px solid ${C.border}`, color: C.text, resize: "none", boxSizing: "border-box", marginBottom: 16 }}
          />

          {error && (
            <div style={{ ...fM, fontSize: FONT.base, color: C.red, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!file || !template || loading}
            style={{
              width: "100%", padding: "16px 0",
              background: file && template && !loading ? C.gold : C.bg,
              border: file && template ? "none" : `1px solid ${C.border}`,
              ...fT, fontSize: FONT.xl, color: file && template && !loading ? C.bg : C.textMuted,
              cursor: file && template && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (<><RefreshCw size={16} className="animate-spin" /> {loadingMsg}</>) : (<><Sparkles size={16} /> ANALISAR E GERAR TUDO</>)}
          </button>
        </div>
      )}

      {result && (
        <div>
          <button onClick={reset} style={{ background: "none", border: "none", ...fM, fontSize: FONT.sm, color: C.textMid, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <ChevronRight size={13} style={{ transform: "rotate(180deg)" }} /> NOVO REEL
          </button>

          {!result.id && (
            <button
              onClick={saveToHistory}
              disabled={saving}
              style={{ width: "100%", marginBottom: 14, padding: "12px 0", background: `${C.green}12`, border: `1px solid ${C.green}44`, ...fM, fontSize: FONT.base, color: C.green, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} SALVAR NO HISTÓRICO DO PRISM
            </button>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => { navigator.clipboard.writeText(buildFullCaption(result, { templateName: template?.name, captionIndex: activeCaption })); toast.success("Legenda completa copiada"); }}
              style={{ flex: "1 1 200px", padding: "12px 0", background: `${C.gold}14`, border: `1px solid ${C.gold}55`, ...fM, fontSize: FONT.base, color: C.gold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Copy size={14} /> COPIAR LEGENDA COMPLETA
            </button>
            <button
              onClick={() => { downloadTxt(`reel-${(result.hook || "nutrion").slice(0, 30).replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase()}`, buildFullCaption(result, { templateName: template?.name, captionIndex: activeCaption })); toast.success("TXT baixado"); }}
              style={{ flex: "1 1 200px", padding: "12px 0", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: FONT.base, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <FileText size={14} /> EXPORTAR TXT
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {([
              { id: "pacote" as const, label: "PACOTE", Icon: Download, color: C.gold },
              { id: "stories" as const, label: "STORIES", Icon: Layers, color: C.purple },
              { id: "qualidade" as const, label: "QUALIDADE", Icon: ShieldCheck, color: C.green },
              { id: "variacoes" as const, label: "VARIAÇÕES", Icon: TrendingUp, color: C.cyan },
            ]).map((t) => {
              const active = resultTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setResultTab(t.id)}
                  style={{ flex: "1 1 120px", padding: "10px 0", background: active ? `${t.color}18` : "transparent", border: `1px solid ${active ? `${t.color}66` : C.border}`, ...fM, fontSize: FONT.sm, color: active ? t.color : C.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <t.Icon size={13} /> {t.label}
                </button>
              );
            })}
          </div>

          {resultTab === "stories" && <ReelsStoriesPanel result={result} accent={template?.color || C.gold} />}
          {resultTab === "qualidade" && <ReelsQualityPanel result={result} />}
          {resultTab === "variacoes" && <ReelsVariationsPanel result={result} analysisId={result.id} />}

          {resultTab === "pacote" && (<>


          {result.analise_visual && (
            <div style={{ background: C.cyanBg, border: `1px solid ${C.cyan}22`, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Eye size={14} color={C.cyan} />
                <span style={{ ...fM, fontSize: FONT.xs, color: C.cyan, letterSpacing: "0.1em" }}>ANÁLISE VISUAL</span>
              </div>
              <div style={{ ...fM, fontSize: FONT.base, color: C.textMid, lineHeight: 1.7 }}>{result.analise_visual}</div>
              {result.template_match && <div style={{ ...fM, fontSize: FONT.sm, color: C.textMid, marginTop: 6, fontStyle: "italic" }}>→ {result.template_match}</div>}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {preview && (
              <div style={{ width: 110, height: 110, flexShrink: 0, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <img src={preview} alt="Frame analisado" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ flex: 1, background: `${template?.color || C.gold}0f`, border: `1px solid ${template?.color || C.gold}33`, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...fM, fontSize: FONT.xs, color: template?.color || C.gold, letterSpacing: "0.1em" }}>HOOK DO REEL</span>
                <CopyBtn textToCopy={result.hook || ""} />
              </div>
              <div style={{ ...fT, fontSize: FONT["2xl"], color: C.text, lineHeight: 1.25 }}>"{result.hook}"</div>
            </div>
          </div>

          {result.roteiro && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ ...fM, fontSize: FONT.xs, color: C.textMuted, letterSpacing: "0.1em" }}>ROTEIRO COMPLETO</span>
                <CopyBtn textToCopy={Object.values(result.roteiro).join("\n")} />
              </div>
              {[
                { k: "hook_0_2s", label: "HOOK", time: "0-2s", color: C.red },
                { k: "corpo_2_20s", label: "CORPO", time: "2-20s", color: C.cyan },
                { k: "punch_20_28s", label: "PUNCH", time: "20-28s", color: C.gold },
                { k: "cta_28_35s", label: "CTA", time: "28-35s", color: C.green },
              ].map((r, i) => result.roteiro?.[r.k] && (
                <div key={r.k} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ ...fM, fontSize: FONT.sm, color: r.color, width: 48, flexShrink: 0 }}>{r.time}</span>
                  <span style={{ ...fM, fontSize: FONT.sm, color: r.color, width: 52, flexShrink: 0 }}>{r.label}</span>
                  <span style={{ ...fM, fontSize: FONT.base, color: C.textMid, flex: 1, lineHeight: 1.6 }}>{result.roteiro?.[r.k]}</span>
                </div>
              ))}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                {result.roteiro.duracao_total && <span style={{ ...fM, fontSize: FONT.sm, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {result.roteiro.duracao_total}</span>}
                {result.roteiro.musica && <span style={{ ...fM, fontSize: FONT.sm, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}><Music size={12} /> {result.roteiro.musica}</span>}
                {result.melhor_horario && <span style={{ ...fM, fontSize: FONT.sm, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}><Target size={12} /> {result.melhor_horario}</span>}
              </div>
              {result.roteiro.edicao && (
                <div style={{ ...fM, fontSize: FONT.sm, color: C.orange, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                  <Sparkles size={12} style={{ verticalAlign: "middle", marginRight: 6 }} />{result.roteiro.edicao}
                </div>
              )}
            </div>
          )}

          {!!result.legendas?.length && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ ...fM, fontSize: FONT.xs, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>
                {result.legendas.length} LEGENDAS — TOQUE PRA TROCAR
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {result.legendas.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCaption(i)}
                    style={{
                      flex: 1, padding: "9px 0",
                      background: activeCaption === i ? `${captionColors[i % 4]}18` : "transparent",
                      border: `1px solid ${activeCaption === i ? `${captionColors[i % 4]}66` : C.border}`,
                      ...fM, fontSize: FONT.sm, color: activeCaption === i ? captionColors[i % 4] : C.textMid, cursor: "pointer",
                    }}
                  >{l.tom || `TOM ${i + 1}`}</button>
                ))}
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <CopyBtn textToCopy={result.legendas[activeCaption]?.texto || ""} label="COPIAR LEGENDA" />
                </div>
                <div style={{ ...fM, fontSize: FONT.base, color: C.textMid, lineHeight: 1.9, whiteSpace: "pre-line" }}>
                  {result.legendas[activeCaption]?.texto}
                </div>
              </div>
            </div>
          )}

          {!!result.hashtags?.length && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ ...fM, fontSize: FONT.xs, color: C.textMuted, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6 }}>
                  <Hash size={12} color={C.gold} /> HASHTAGS ({result.hashtags.length})
                </span>
                <CopyBtn textToCopy={result.hashtags.join(" ")} label="COPIAR TODAS" />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.hashtags.map((h, i) => (
                  <span key={i} style={{ ...fM, fontSize: FONT.sm, color: C.cyan, background: C.cyanBg, padding: "3px 8px" }}>{h}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {result.self_comment && (
              <div style={{ flex: "1 1 220px", background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ ...fM, fontSize: FONT.xs, color: C.textMuted, letterSpacing: "0.1em" }}>SELF-COMMENT</span>
                  <CopyBtn textToCopy={result.self_comment} label="" />
                </div>
                <div style={{ ...fM, fontSize: FONT.sm, color: C.textMid, lineHeight: 1.6 }}>{result.self_comment}</div>
              </div>
            )}
            {result.produto_sugerido && (
              <div style={{ flex: "1 1 180px", background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
                <span style={{ ...fM, fontSize: FONT.xs, color: C.textMuted, letterSpacing: "0.1em" }}>PRODUTO</span>
                <div style={{ ...fT, fontSize: FONT.lg, color: C.gold, marginTop: 4 }}>{result.produto_sugerido}</div>
                <span style={{ ...fM, fontSize: FONT.xs, color: result.nivel_funil === "BOFU" ? C.green : result.nivel_funil === "MOFU" ? C.cyan : C.gold }}>
                  {result.nivel_funil || "TOFU"}
                </span>
              </div>
            )}
          </div>

          {!!result.stories?.length && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
              <div style={{ ...fM, fontSize: FONT.xs, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 10 }}>STORIES DO DIA ({result.stories.length})</div>
              {result.stories.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < (result.stories?.length || 0) - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ width: 24, height: 24, flexShrink: 0, background: `${C.purple}18`, border: `1px solid ${C.purple}33`, display: "flex", alignItems: "center", justifyContent: "center", ...fT, fontSize: FONT.sm, color: C.purple }}>{i + 1}</span>
                  <span style={{ ...fM, fontSize: FONT.base, color: C.textMid, lineHeight: 1.6, flex: 1 }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          </>)}



          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={reset} style={{ flex: 1, padding: "14px 0", background: "transparent", border: `1px solid ${C.border}`, ...fT, fontSize: FONT.lg, color: C.textMid, cursor: "pointer" }}>NOVO REEL</button>
            <button onClick={handleGenerate} disabled={loading} style={{ flex: 1, padding: "14px 0", background: C.gold, border: "none", ...fT, fontSize: FONT.lg, color: C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> REGENERAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
