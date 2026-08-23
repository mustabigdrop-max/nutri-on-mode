import { useRef, useState } from "react";
import {
  AlertTriangle, BookOpen, Briefcase, Check, ChevronRight, Clock, Copy, Crown,
  Dumbbell, Eye, Flame, Hash, Heart, Music, RefreshCw, Sparkles, Target, Type, Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22",
  gold: "#B8922A", cyan: "#00D4FF", cyanBg: "#00D4FF0A", green: "#00C896",
  red: "#ff4444", purple: "#7C3AED", orange: "#E8A020", pink: "#EC4899",
  text: "#F5F0E8", textMid: "#888888", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

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
];

type Result = {
  analise_visual?: string; template_match?: string; hook?: string;
  roteiro?: Record<string, string>;
  legendas?: { tom: string; texto: string }[];
  hashtags?: string[]; self_comment?: string; melhor_horario?: string;
  stories?: string[]; produto_sugerido?: string; nivel_funil?: string;
};

function CopyBtn({ textToCopy, label = "COPIAR" }: { textToCopy: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(textToCopy); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, ...fM, fontSize: 9, color: copied ? C.green : C.textMid }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
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
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 60 * 1024 * 1024) return toast.error("Arquivo acima de 60MB");
    setFile(f);
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

      const { data, error: fnError } = await supabase.functions.invoke("prism-analyze", {
        body: { mode: "reels_studio", image, from_video: isVideo, template_name: template.name, template_desc: template.desc, context },
      });
      if (fnError) throw new Error(fnError.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult((data as any).result as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar. Tente novamente.");
    } finally {
      window.clearInterval(interval);
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setFile(null); setPreview(null); setTemplate(null); setError(null); };
  const captionColors = [C.red, C.cyan, C.pink, C.orange];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 16 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", ...fM, fontSize: 10, color: C.textMid, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
          <ChevronRight size={11} style={{ transform: "rotate(180deg)" }} /> MODOS
        </button>
      )}

      <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ ...fT, fontSize: 20, color: C.text }}>SOCIAL ON · <span style={{ color: C.gold }}>REELS STUDIO</span></div>
        <div style={{ ...fM, fontSize: 9, color: C.textMid, marginTop: 2 }}>@diogo.mell0 · transformação é sistema.</div>
      </div>

      {!result && (
        <div>
          <div style={{ ...fM, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6 }}>PASSO 1 — SOBE SEU CONTEÚDO</div>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              background: file ? `${C.green}06` : C.bg,
              border: `2px dashed ${file ? C.green : C.border}`,
              padding: preview ? 8 : "32px 20px", textAlign: "center", cursor: "pointer", marginBottom: 16,
            }}
          >
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />
            {preview ? (
              <div>
                <img src={preview} alt="Prévia do conteúdo enviado" style={{ maxHeight: 180, margin: "0 auto", display: "block", objectFit: "contain" }} />
                <div style={{ ...fM, fontSize: 9, color: C.textMid, marginTop: 6 }}>
                  {file?.name} · {((file?.size || 0) / 1024 / 1024).toFixed(1)}MB · toque pra trocar
                </div>
              </div>
            ) : (
              <div>
                <Upload size={22} color={C.textMid} />
                <p style={{ ...fT, fontSize: 15, color: C.text, marginTop: 8 }}>Sobe foto ou vídeo</p>
                <p style={{ ...fM, fontSize: 9, color: C.textMid, marginTop: 4 }}>O sistema analisa o que VÊ e gera tudo automaticamente</p>
              </div>
            )}
          </div>

          <div style={{ ...fM, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6 }}>PASSO 2 — ESCOLHE O ESTILO</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {TEMPLATES.map((t) => {
              const Icon = t.icon;
              const active = template?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t)}
                  style={{
                    flex: "1 1 calc(50% - 8px)", minWidth: 160, textAlign: "left",
                    background: active ? `${t.color}12` : C.bg,
                    border: `1px solid ${active ? `${t.color}66` : C.border}`,
                    padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <Icon size={16} color={t.color} style={{ flexShrink: 0 }} />
                  <span>
                    <span style={{ ...fT, fontSize: 13, color: active ? t.color : C.text, display: "block" }}>{t.name}</span>
                    <span style={{ ...fM, fontSize: 8, color: C.textMid, display: "block", lineHeight: 1.4 }}>{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ ...fM, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6 }}>PASSO 3 — CONTEXTO (opcional)</div>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: quero vender o nutriON, gravei depois do treino de costas, tô em cutting, tava com minha filha..."
            rows={2}
            style={{ width: "100%", padding: "10px 12px", ...fM, fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, color: C.text, resize: "none", boxSizing: "border-box", marginBottom: 14 }}
          />

          {error && (
            <div style={{ ...fM, fontSize: 10, color: C.red, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={11} /> {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!file || !template || loading}
            style={{
              width: "100%", padding: "14px 0",
              background: file && template && !loading ? C.gold : C.bg,
              border: file && template ? "none" : `1px solid ${C.border}`,
              ...fT, fontSize: 15, color: file && template && !loading ? C.bg : C.textMuted,
              cursor: file && template && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (<><RefreshCw size={14} className="animate-spin" /> {loadingMsg}</>) : (<><Sparkles size={14} /> ANALISAR E GERAR TUDO</>)}
          </button>
        </div>
      )}

      {result && (
        <div>
          <button onClick={reset} style={{ background: "none", border: "none", ...fM, fontSize: 9, color: C.textMid, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
            <ChevronRight size={11} style={{ transform: "rotate(180deg)" }} /> NOVO REEL
          </button>

          {result.analise_visual && (
            <div style={{ background: C.cyanBg, border: `1px solid ${C.cyan}22`, padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <Eye size={11} color={C.cyan} />
                <span style={{ ...fM, fontSize: 8, color: C.cyan, letterSpacing: "0.1em" }}>ANÁLISE VISUAL</span>
              </div>
              <div style={{ ...fM, fontSize: 11, color: C.textMid, lineHeight: 1.7 }}>{result.analise_visual}</div>
              {result.template_match && <div style={{ ...fM, fontSize: 10, color: C.textMid, marginTop: 4, fontStyle: "italic" }}>→ {result.template_match}</div>}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            {preview && (
              <div style={{ width: 96, height: 96, flexShrink: 0, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <img src={preview} alt="Frame analisado" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ flex: 1, background: `${template?.color || C.gold}0f`, border: `1px solid ${template?.color || C.gold}33`, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ ...fM, fontSize: 8, color: template?.color || C.gold, letterSpacing: "0.1em" }}>HOOK DO REEL</span>
                <CopyBtn textToCopy={result.hook || ""} />
              </div>
              <div style={{ ...fT, fontSize: 18, color: C.text, lineHeight: 1.3 }}>"{result.hook}"</div>
            </div>
          </div>

          {result.roteiro && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ ...fM, fontSize: 8, color: C.textMuted, letterSpacing: "0.1em" }}>ROTEIRO COMPLETO</span>
                <CopyBtn textToCopy={Object.values(result.roteiro).join("\n")} />
              </div>
              {[
                { k: "hook_0_2s", label: "HOOK", time: "0-2s", color: C.red },
                { k: "corpo_2_20s", label: "CORPO", time: "2-20s", color: C.cyan },
                { k: "punch_20_28s", label: "PUNCH", time: "20-28s", color: C.gold },
                { k: "cta_28_35s", label: "CTA", time: "28-35s", color: C.green },
              ].map((r, i) => result.roteiro?.[r.k] && (
                <div key={r.k} style={{ display: "flex", gap: 6, padding: "6px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ ...fM, fontSize: 9, color: r.color, width: 40, flexShrink: 0 }}>{r.time}</span>
                  <span style={{ ...fM, fontSize: 9, color: r.color, width: 42, flexShrink: 0 }}>{r.label}</span>
                  <span style={{ ...fM, fontSize: 10, color: C.textMid, flex: 1, lineHeight: 1.6 }}>{result.roteiro?.[r.k]}</span>
                </div>
              ))}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                {result.roteiro.duracao_total && <span style={{ ...fM, fontSize: 9, color: C.textMid, display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} /> {result.roteiro.duracao_total}</span>}
                {result.roteiro.musica && <span style={{ ...fM, fontSize: 9, color: C.textMid, display: "flex", alignItems: "center", gap: 3 }}><Music size={10} /> {result.roteiro.musica}</span>}
                {result.melhor_horario && <span style={{ ...fM, fontSize: 9, color: C.textMid, display: "flex", alignItems: "center", gap: 3 }}><Target size={10} /> {result.melhor_horario}</span>}
              </div>
              {result.roteiro.edicao && (
                <div style={{ ...fM, fontSize: 9, color: C.orange, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
                  <Sparkles size={10} style={{ verticalAlign: "middle", marginRight: 4 }} />{result.roteiro.edicao}
                </div>
              )}
            </div>
          )}

          {!!result.legendas?.length && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ ...fM, fontSize: 8, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6 }}>
                {result.legendas.length} LEGENDAS — TOQUE PRA TROCAR
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {result.legendas.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCaption(i)}
                    style={{
                      flex: 1, padding: "7px 0",
                      background: activeCaption === i ? `${captionColors[i % 4]}18` : "transparent",
                      border: `1px solid ${activeCaption === i ? `${captionColors[i % 4]}66` : C.border}`,
                      ...fM, fontSize: 9, color: activeCaption === i ? captionColors[i % 4] : C.textMid, cursor: "pointer",
                    }}
                  >{l.tom || `TOM ${i + 1}`}</button>
                ))}
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                  <CopyBtn textToCopy={result.legendas[activeCaption]?.texto || ""} label="COPIAR LEGENDA" />
                </div>
                <div style={{ ...fM, fontSize: 11, color: C.textMid, lineHeight: 1.9, whiteSpace: "pre-line" }}>
                  {result.legendas[activeCaption]?.texto}
                </div>
              </div>
            </div>
          )}

          {!!result.hashtags?.length && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ ...fM, fontSize: 8, color: C.textMuted, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
                  <Hash size={10} color={C.gold} /> HASHTAGS ({result.hashtags.length})
                </span>
                <CopyBtn textToCopy={result.hashtags.join(" ")} label="COPIAR TODAS" />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {result.hashtags.map((h, i) => (
                  <span key={i} style={{ ...fM, fontSize: 10, color: C.cyan, background: C.cyanBg, padding: "2px 6px" }}>{h}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {result.self_comment && (
              <div style={{ flex: "1 1 200px", background: C.bg, border: `1px solid ${C.border}`, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ ...fM, fontSize: 8, color: C.textMuted, letterSpacing: "0.1em" }}>SELF-COMMENT</span>
                  <CopyBtn textToCopy={result.self_comment} label="" />
                </div>
                <div style={{ ...fM, fontSize: 10, color: C.textMid, lineHeight: 1.6 }}>{result.self_comment}</div>
              </div>
            )}
            {result.produto_sugerido && (
              <div style={{ flex: "1 1 160px", background: C.bg, border: `1px solid ${C.border}`, padding: 10 }}>
                <span style={{ ...fM, fontSize: 8, color: C.textMuted, letterSpacing: "0.1em" }}>PRODUTO</span>
                <div style={{ ...fT, fontSize: 14, color: C.gold, marginTop: 3 }}>{result.produto_sugerido}</div>
                <span style={{ ...fM, fontSize: 8, color: result.nivel_funil === "BOFU" ? C.green : result.nivel_funil === "MOFU" ? C.cyan : C.gold }}>
                  {result.nivel_funil || "TOFU"}
                </span>
              </div>
            )}
          </div>

          {!!result.stories?.length && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14, marginBottom: 8 }}>
              <div style={{ ...fM, fontSize: 8, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>STORIES DO DIA ({result.stories.length})</div>
              {result.stories.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: i < (result.stories?.length || 0) - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ width: 20, height: 20, flexShrink: 0, background: `${C.purple}18`, border: `1px solid ${C.purple}33`, display: "flex", alignItems: "center", justifyContent: "center", ...fT, fontSize: 10, color: C.purple }}>{i + 1}</span>
                  <span style={{ ...fM, fontSize: 10, color: C.textMid, lineHeight: 1.6, flex: 1 }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            <button onClick={reset} style={{ flex: 1, padding: "12px 0", background: "transparent", border: `1px solid ${C.border}`, ...fT, fontSize: 13, color: C.textMid, cursor: "pointer" }}>NOVO REEL</button>
            <button onClick={handleGenerate} disabled={loading} style={{ flex: 1, padding: "12px 0", background: C.gold, border: "none", ...fT, fontSize: 13, color: C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> REGENERAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
