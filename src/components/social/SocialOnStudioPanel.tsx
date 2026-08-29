// SOCIAL ON — Studio: upload de mídia, legendas automáticas (IA), editor de
// fontes/estilos, textos overlay e geração de 4 versões prontas pra postar.
// IA via Edge Function `social-on-generate` (modos studio_subtitles / studio_versions).

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { callSocialAI } from "./socialUi";

const T = {
  bg: "#020205", surface: "#0A0A0F", surface2: "#111118", surface3: "#1A1A24",
  cyan: "#00D4FF", gold: "#B8922A", green: "#22C55E", red: "#EF4444",
  purple: "#A855F7", muted: "#555566", text: "#E8E8F0", white: "#FFF",
  ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace", fb: "'Inter',sans-serif",
};

const FONTS = [
  { id: "inter", name: "Inter", family: "'Inter',sans-serif", style: "Clean" },
  { id: "rajdhani", name: "Rajdhani", family: "'Rajdhani',sans-serif", style: "Bold" },
  { id: "poppins", name: "Poppins", family: "'Poppins',sans-serif", style: "Moderna" },
  { id: "oswald", name: "Oswald", family: "'Oswald',sans-serif", style: "Impacto" },
  { id: "playfair", name: "Playfair", family: "'Playfair Display',serif", style: "Elegante" },
  { id: "bebas", name: "Bebas Neue", family: "'Bebas Neue',sans-serif", style: "Título" },
  { id: "mono", name: "Space Mono", family: "'Space Mono',monospace", style: "Tech" },
  { id: "montserrat", name: "Montserrat", family: "'Montserrat',sans-serif", style: "Pro" },
];

const SUBTITLE_STYLES = [
  { id: "capcut", name: "CapCut Viral", bg: "transparent", color: "#FFF", shadow: true, outline: false, bgBox: false, glow: false, animated: true, highlight: "#00D4FF" },
  { id: "minimal", name: "Minimal", bg: "transparent", color: "#FFF", shadow: true, outline: false, bgBox: false, glow: false },
  { id: "boxed", name: "Caixa", bg: "#000000CC", color: "#FFF", shadow: false, outline: false, bgBox: true, glow: false },
  { id: "highlight", name: "Highlight", bg: "#00D4FF", color: "#000", shadow: false, outline: false, bgBox: true, glow: false },
  { id: "outline", name: "Contorno", bg: "transparent", color: "#FFF", shadow: false, outline: true, bgBox: false, glow: false },
  { id: "gradient", name: "Gradiente", bg: "linear-gradient(90deg,#00D4FF,#A855F7)", color: "#FFF", shadow: false, outline: false, bgBox: true, glow: false },
  { id: "neon", name: "Neon", bg: "transparent", color: "#00D4FF", shadow: true, outline: false, bgBox: false, glow: true },
];

const CAPTION_POSITIONS = [
  { id: "bottom", name: "Inferior", y: 80 },
  { id: "center", name: "Centro", y: 50 },
  { id: "top", name: "Superior", y: 15 },
];

type Subtitle = { start: string; end: string; text: string };
type Overlay = { text: string; x: number; y: number; font: string; fontSize: number; fontWeight: number; color: string; bg: string };
type StudioConfig = {
  font: string; fontSize: number; fontWeight: number; position: string;
  subtitleStyle: string; textColor: string; bgColor: string;
};

const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copiado"); };

/* ---------------- Upload ---------------- */

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const validate = (file: File) => {
    setError(null);
    const maxSize = 500 * 1024 * 1024;
    if (!/^(image|video)\//.test(file.type)) {
      setError("Formato não suportado. Use JPG, PNG, MP4, MOV ou WEBM.");
      return false;
    }
    if (file.size > maxSize) {
      setError("Arquivo muito grande. Máximo 500MB.");
      return false;
    }
    return true;
  };

  const handle = (file?: File | null) => {
    if (file && validate(file)) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer?.files?.[0]); }}
      onClick={() => ref.current?.click()}
      style={{
        border: `2px dashed ${error ? T.red : drag ? T.cyan : "#ffffff15"}`,
        background: drag ? `${T.cyan}05` : T.surface,
        padding: "52px 24px", cursor: "pointer", textAlign: "center",
        transition: "all 0.3s", position: "relative",
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute", width: 20, height: 20,
          borderColor: drag ? T.cyan : error ? T.red : `${T.cyan}30`, borderStyle: "solid", borderWidth: 0,
          transition: "border-color 0.3s",
          ...(i === 0 && { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 }),
          ...(i === 1 && { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 }),
          ...(i === 2 && { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 }),
          ...(i === 3 && { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 }),
        }} />
      ))}
      <input ref={ref} type="file" accept="image/*,video/*" style={{ display: "none" }}
        onChange={(e) => handle(e.target.files?.[0])} />
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>{drag ? "↓" : "🎬"}</div>
      <p style={{ fontFamily: T.ft, fontSize: 20, fontWeight: 700, color: T.white, margin: "0 0 6px" }}>
        {drag ? "Solte o arquivo" : "Suba seu vídeo ou imagem"}
      </p>
      <p style={{ fontFamily: T.fb, fontSize: 13, color: T.muted, margin: 0 }}>
        Arraste ou clique · MP4, MOV, WEBM, JPG, PNG · até 500MB
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
        {["MP4", "MOV", "WEBM", "JPG", "PNG"].map((f) => (
          <span key={f} style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, background: "#ffffff06", padding: "3px 10px", letterSpacing: 1 }}>{f}</span>
        ))}
      </div>
      {error && (
        <p style={{ fontFamily: T.fb, fontSize: 12, color: T.red, margin: "12px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

/* ---------------- Editor de legendas ---------------- */

function SubtitleEditor({ subtitles, onChange, config, onConfigChange }: {
  subtitles: Subtitle[]; onChange: (s: Subtitle[]) => void;
  config: StudioConfig; onConfigChange: (c: StudioConfig) => void;
}) {
  const updateSub = (idx: number, field: keyof Subtitle, val: string) => {
    const next = [...subtitles];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };
  const removeSub = (idx: number) => onChange(subtitles.filter((_, i) => i !== idx));
  const addSub = () => onChange([...subtitles, { start: "00:00", end: "00:03", text: "Nova legenda" }]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 8px" }}>ESTILO DE LEGENDA</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {SUBTITLE_STYLES.map((s) => (
            <button key={s.id} onClick={() => onConfigChange({ ...config, subtitleStyle: s.id })} style={{
              background: config.subtitleStyle === s.id ? `${T.cyan}10` : T.surface3,
              border: `1px solid ${config.subtitleStyle === s.id ? T.cyan : "#ffffff08"}`,
              borderRadius: 0, padding: "10px 8px", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{
                padding: "4px 8px", marginBottom: 4, display: "inline-block",
                background: s.bgBox ? s.bg : "transparent",
                color: s.color, fontFamily: T.ft, fontSize: 11, fontWeight: 700,
                textShadow: s.shadow ? "0 2px 4px rgba(0,0,0,.8)" : s.glow ? `0 0 10px ${s.color}` : "none",
                WebkitTextStroke: s.outline ? "1px #000" : "none",
              }}>Aa</div>
              <div style={{ fontFamily: T.fm, fontSize: 9, color: config.subtitleStyle === s.id ? T.cyan : T.muted }}>{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 8px" }}>FONTE</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
          {FONTS.map((f) => (
            <button key={f.id} onClick={() => onConfigChange({ ...config, font: f.id })} style={{
              background: config.font === f.id ? `${T.cyan}10` : T.surface3,
              border: `1px solid ${config.font === f.id ? T.cyan : "#ffffff08"}`,
              borderRadius: 0, padding: "8px 4px", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontFamily: f.family, fontSize: 14, fontWeight: 700, color: config.font === f.id ? T.white : T.muted, marginBottom: 2 }}>Aa</div>
              <div style={{ fontFamily: T.fm, fontSize: 7, color: T.muted, letterSpacing: 0.5 }}>{f.style}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 8px" }}>
            TAMANHO · {config.fontSize}px
          </p>
          <input type="range" min={12} max={64} value={config.fontSize}
            onChange={(e) => onConfigChange({ ...config, fontSize: +e.target.value })}
            style={{ width: "100%", accentColor: T.cyan }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: T.fm, fontSize: 8, color: T.muted }}>12px</span>
            <span style={{ fontFamily: T.fm, fontSize: 8, color: T.muted }}>64px</span>
          </div>
        </div>
        <div>
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 8px" }}>POSIÇÃO</p>
          <div style={{ display: "flex", gap: 4 }}>
            {CAPTION_POSITIONS.map((p) => (
              <button key={p.id} onClick={() => onConfigChange({ ...config, position: p.id })} style={{
                flex: 1, padding: "8px 4px", background: config.position === p.id ? `${T.cyan}10` : T.surface3,
                border: `1px solid ${config.position === p.id ? T.cyan : "#ffffff08"}`,
                borderRadius: 0, cursor: "pointer",
                fontFamily: T.fm, fontSize: 8, color: config.position === p.id ? T.cyan : T.muted,
              }}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 6px" }}>COR DO TEXTO</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["#FFFFFF", "#00D4FF", "#B8922A", "#22C55E", "#EF4444", "#000000"].map((c) => (
              <button key={c} onClick={() => onConfigChange({ ...config, textColor: c })} style={{
                width: 24, height: 24, background: c, border: `2px solid ${config.textColor === c ? T.cyan : "#ffffff15"}`,
                borderRadius: 0, cursor: "pointer",
              }} />
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 6px" }}>COR DO FUNDO</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["transparent", "#000000CC", "#00D4FFCC", "#B8922ACC", "#EF4444CC", "#FFFFFFCC"].map((c) => (
              <button key={c} onClick={() => onConfigChange({ ...config, bgColor: c })} style={{
                width: 24, height: 24,
                background: c === "transparent" ? "repeating-conic-gradient(#ffffff15 0% 25%, transparent 0% 50%) 0 0 / 8px 8px" : c,
                border: `2px solid ${config.bgColor === c ? T.cyan : "#ffffff15"}`,
                borderRadius: 0, cursor: "pointer",
              }} />
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 6px" }}>PESO</p>
          <div style={{ display: "flex", gap: 4 }}>
            {[{ v: 400, l: "Normal" }, { v: 600, l: "Semi" }, { v: 700, l: "Bold" }, { v: 900, l: "Black" }].map((w) => (
              <button key={w.v} onClick={() => onConfigChange({ ...config, fontWeight: w.v })} style={{
                flex: 1, padding: "6px 2px", background: config.fontWeight === w.v ? `${T.cyan}10` : T.surface3,
                border: `1px solid ${config.fontWeight === w.v ? T.cyan : "#ffffff08"}`,
                borderRadius: 0, cursor: "pointer", fontFamily: T.fm, fontSize: 7, color: config.fontWeight === w.v ? T.cyan : T.muted,
              }}>{w.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: 0 }}>LEGENDAS ({subtitles.length})</p>
        <button onClick={addSub} style={{
          background: `${T.cyan}10`, border: `1px solid ${T.cyan}30`, borderRadius: 0,
          padding: "4px 10px", cursor: "pointer", fontFamily: T.fm, fontSize: 10, color: T.cyan,
        }}>+ Linha</button>
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {subtitles.map((sub, i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, background: T.surface2, padding: "6px 8px" }}>
            <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, width: 16, flexShrink: 0 }}>{i + 1}</span>
            <input value={sub.start} onChange={(e) => updateSub(i, "start", e.target.value)}
              style={{ width: 52, padding: "4px 6px", background: T.surface3, border: "1px solid #ffffff08", borderRadius: 0, color: T.cyan, fontFamily: T.fm, fontSize: 10, textAlign: "center" }} />
            <span style={{ color: T.muted, fontSize: 10 }}>→</span>
            <input value={sub.end} onChange={(e) => updateSub(i, "end", e.target.value)}
              style={{ width: 52, padding: "4px 6px", background: T.surface3, border: "1px solid #ffffff08", borderRadius: 0, color: T.cyan, fontFamily: T.fm, fontSize: 10, textAlign: "center" }} />
            <input value={sub.text} onChange={(e) => updateSub(i, "text", e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "4px 8px", background: T.surface3, border: "1px solid #ffffff08", borderRadius: 0, color: T.text, fontFamily: T.fb, fontSize: 12 }} />
            <button onClick={() => removeSub(i)} style={{
              background: "transparent", border: "none", color: T.red, cursor: "pointer", fontSize: 14, padding: "2px 6px",
            }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Preview ---------------- */

const FORMATS = [
  { id: "reels", label: "REELS 9:16", ratio: "9/16" },
  { id: "feed", label: "FEED 1:1", ratio: "1/1" },
  { id: "stories", label: "STORIES 9:16", ratio: "9/16" },
  { id: "carousel", label: "CARROSSEL 4:5", ratio: "4/5" },
];

/** Legenda palavra a palavra, estilo CapCut. */
function AnimatedSubtitle({ text, style, textStyle, highlight }: {
  text: string; style: React.CSSProperties; textStyle: React.CSSProperties; highlight: string;
}) {
  const words = text.split(" ").filter(Boolean);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setActive((p) => (p + 1) % words.length), 420);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <div style={{ ...style, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
      {words.map((w, i) => (
        <span key={i} style={{
          ...textStyle,
          background: i === active ? highlight : "transparent",
          color: i === active ? "#000" : textStyle.color,
          padding: "1px 6px",
          transition: "all 0.15s",
        }}>{w}</span>
      ))}
    </div>
  );
}

function Preview({ fileUrl, subtitles, overlays, config, isVideo, format = "reels" }: {
  fileUrl: string | null; subtitles: Subtitle[]; overlays: Overlay[]; config: StudioConfig; isVideo: boolean; format?: string;
}) {
  const fmt = FORMATS.find((f) => f.id === format) || FORMATS[0];
  const font = FONTS.find((f) => f.id === config.font) || FONTS[0];
  const style = SUBTITLE_STYLES.find((s) => s.id === config.subtitleStyle) || SUBTITLE_STYLES[0];
  const pos = CAPTION_POSITIONS.find((p) => p.id === config.position) || CAPTION_POSITIONS[0];
  const previewText = subtitles[0]?.text || "Prévia da legenda";

  const textStyle: React.CSSProperties = {
    fontFamily: font.family,
    fontSize: `clamp(14px, 3.5vw, ${config.fontSize}px)`,
    fontWeight: config.fontWeight,
    color: config.textColor || style.color,
    textShadow: style.shadow ? "0 2px 8px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.5)" : style.glow ? `0 0 20px ${style.color}, 0 0 40px ${style.color}50` : "none",
    WebkitTextStroke: style.outline ? "1.5px #000" : "none",
    background: style.bgBox ? (config.bgColor !== "transparent" ? config.bgColor : style.bg) : "transparent",
    padding: style.bgBox ? "6px 14px" : "0",
    textAlign: "center",
    lineHeight: 1.3,
    maxWidth: "90%",
    wordBreak: "break-word",
  };

  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: fmt.ratio,
      background: isVideo ? "#000" : fileUrl ? `url(${fileUrl}) center/cover` : T.surface2,
      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {isVideo && fileUrl && (
        <video src={fileUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }}
          autoPlay muted loop playsInline />
      )}

      {/* Overlays */}
      {overlays.map((ov, i) => {
        const ovFont = FONTS.find((f) => f.id === ov.font) || FONTS[0];
        return (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0, top: `${ov.y}%`,
            display: "flex", justifyContent: "center", pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: ovFont.family, fontSize: ov.fontSize, fontWeight: ov.fontWeight,
              color: ov.color, textShadow: "0 2px 8px rgba(0,0,0,.8)", maxWidth: "90%", textAlign: "center",
            }}>{ov.text}</span>
          </div>
        );
      })}

      {/* Legenda */}
      <div style={{
        position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center",
        top: pos.y === 15 ? "12%" : pos.y === 50 ? "45%" : "auto",
        bottom: pos.y === 80 ? "10%" : "auto",
        padding: "0 12px",
      }}>
        {(style as { animated?: boolean }).animated ? (
          <AnimatedSubtitle
            text={previewText}
            style={{ maxWidth: "92%" }}
            textStyle={{ ...textStyle, maxWidth: "none", padding: 0 }}
            highlight={(style as { highlight?: string }).highlight || T.cyan}
          />
        ) : (
          <div style={textStyle}>{previewText}</div>
        )}
      </div>

      {/* Grid de terços */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "33.3%", top: 0, bottom: 0, width: 1, background: "#ffffff08" }} />
        <div style={{ position: "absolute", left: "66.6%", top: 0, bottom: 0, width: 1, background: "#ffffff08" }} />
        <div style={{ position: "absolute", top: "33.3%", left: 0, right: 0, height: 1, background: "#ffffff08" }} />
        <div style={{ position: "absolute", top: "66.6%", left: 0, right: 0, height: 1, background: "#ffffff08" }} />
      </div>

      <div style={{ position: "absolute", top: 8, left: 8, fontFamily: T.fm, fontSize: 9, color: T.muted, background: "#000000AA", padding: "3px 8px" }}>
        {fmt.label}
      </div>
      {/* Zona segura */}
      <div style={{ position: "absolute", top: "12%", bottom: "16%", left: "6%", right: "6%", border: "1px dashed #ffffff10", pointerEvents: "none" }} />
    </div>
  );
}

/* ---------------- Overlays ---------------- */

function TextOverlayEditor({ overlays, onChange, config }: {
  overlays: Overlay[]; onChange: (o: Overlay[]) => void; config: StudioConfig;
}) {
  const addOverlay = () => onChange([...overlays, {
    text: "Novo texto", x: 50, y: 30,
    font: config.font, fontSize: 24, fontWeight: 700,
    color: "#FFFFFF", bg: "transparent",
  }]);
  const update = (idx: number, field: keyof Overlay, val: string | number) => {
    const next = [...overlays];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };
  const remove = (idx: number) => onChange(overlays.filter((_, i) => i !== idx));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: 0 }}>TEXTOS OVERLAY ({overlays.length})</p>
        <button onClick={addOverlay} style={{
          background: `${T.gold}10`, border: `1px solid ${T.gold}30`, borderRadius: 0,
          padding: "4px 10px", cursor: "pointer", fontFamily: T.fm, fontSize: 10, color: T.gold,
        }}>+ Texto</button>
      </div>
      {overlays.map((ov, i) => (
        <div key={i} style={{ background: T.surface2, padding: 10, marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: T.fm, fontSize: 9, color: T.gold }}>T{i + 1}</span>
            <input value={ov.text} onChange={(e) => update(i, "text", e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "6px 8px", background: T.surface3, border: "1px solid #ffffff08", borderRadius: 0, color: T.text, fontFamily: T.fb, fontSize: 12 }} />
            <button onClick={() => remove(i)} style={{ background: "transparent", border: "none", color: T.red, cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <span style={{ fontFamily: T.fm, fontSize: 8, color: T.muted }}>Tamanho: {ov.fontSize}px</span>
              <input type="range" min={10} max={72} value={ov.fontSize}
                onChange={(e) => update(i, "fontSize", +e.target.value)}
                style={{ width: "100%", accentColor: T.gold }} />
            </div>
            <select value={ov.font} onChange={(e) => update(i, "font", e.target.value)} style={{
              padding: "4px", background: T.surface3, border: "1px solid #ffffff08", borderRadius: 0, color: T.text, fontFamily: T.fm, fontSize: 9, width: 80,
            }}>
              {FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 2 }}>
              {["#FFF", "#00D4FF", "#B8922A", "#000"].map((c) => (
                <button key={c} onClick={() => update(i, "color", c)} style={{
                  width: 20, height: 20, background: c, border: `1px solid ${ov.color === c ? T.cyan : "#ffffff15"}`, borderRadius: 0, cursor: "pointer",
                }} />
              ))}
            </div>
          </div>
        </div>
      ))}
      {overlays.length === 0 && (
        <p style={{ fontFamily: T.fb, fontSize: 12, color: T.muted, textAlign: "center", padding: "16px 0" }}>
          Nenhum texto overlay. Clique em "+ Texto" pra adicionar.
        </p>
      )}
    </div>
  );
}

/* ---------------- Painel principal ---------------- */

type Version = {
  name: string; format: string; caption: string; hashtags: string[];
  text_overlays?: { text: string; position: string; style: string }[];
  cta: string; tone: string; objective?: string;
  predicted_performance?: { views?: string; saves?: string; shares?: string };
};

type Vision = {
  viral_score: number;
  predicted_views?: string; predicted_saves?: string; predicted_shares?: string;
  detected_elements?: { icon: string; label: string; detail: string }[];
  optimizations?: { text: string; priority: string }[];
  best_time?: string; hook_suggestion?: string; content_pillars_match?: string[];
};

/* Painel de análise visual */
function VisionPanel({ analysis, loading, onRun }: { analysis: Vision | null; loading: boolean; onRun: () => void }) {
  if (loading) {
    return (
      <div style={{ padding: "28px 0" }}>
        {["Analisando conteúdo visual", "Detectando elementos-chave", "Mapeando potencial viral", "Calculando performance"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, opacity: 0.5 }}>
            <span style={{ width: 6, height: 6, background: T.cyan, display: "inline-block" }} />
            <span style={{ fontFamily: T.fm, fontSize: 11, color: T.muted }}>{s}...</span>
          </div>
        ))}
      </div>
    );
  }
  if (!analysis) {
    return (
      <div style={{ textAlign: "center", padding: "28px 0" }}>
        <p style={{ fontFamily: T.fb, fontSize: 13, color: T.muted, marginBottom: 12 }}>
          Analise o potencial do conteúdo antes de postar.
        </p>
        <button onClick={onRun} style={{
          padding: "12px 26px", background: `${T.cyan}15`, border: `1px solid ${T.cyan}40`, borderRadius: 0,
          cursor: "pointer", fontFamily: T.ft, fontSize: 15, fontWeight: 700, color: T.cyan, letterSpacing: 1,
        }}>🧠 ANALISAR CONTEÚDO</button>
      </div>
    );
  }
  const score = analysis.viral_score ?? 0;
  const scoreColor = score >= 70 ? T.green : score >= 40 ? T.gold : T.red;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
        {[
          { l: "VIEWS", v: analysis.predicted_views, c: T.cyan },
          { l: "SAVES", v: analysis.predicted_saves, c: T.gold },
          { l: "SHARES", v: analysis.predicted_shares, c: T.purple },
          { l: "SCORE", v: `${score}/100`, c: scoreColor },
        ].map((s, i) => (
          <div key={i} style={{ background: T.surface2, padding: "10px 6px", textAlign: "center" }}>
            <div style={{ fontFamily: T.ft, fontSize: 16, fontWeight: 700, color: s.c }}>{s.v || "—"}</div>
            <div style={{ fontFamily: T.fm, fontSize: 8, color: T.muted, letterSpacing: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {!!analysis.detected_elements?.length && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 8px" }}>DETECTADO</p>
          {analysis.detected_elements.map((el, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", background: T.surface2, padding: "8px 10px", marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{el.icon}</span>
              <span style={{ fontFamily: T.ft, fontSize: 13, fontWeight: 700, color: T.white }}>{el.label}</span>
              <span style={{ fontFamily: T.fb, fontSize: 11, color: T.muted }}>{el.detail}</span>
            </div>
          ))}
        </div>
      )}

      {!!analysis.optimizations?.length && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, letterSpacing: 2, margin: "0 0 8px" }}>OTIMIZAÇÕES</p>
          {analysis.optimizations.map((o, i) => (
            <div key={i} style={{ background: T.surface2, padding: "8px 10px", marginBottom: 4, borderLeft: `2px solid ${o.priority === "alta" ? T.red : T.gold}` }}>
              <span style={{ fontFamily: T.fm, fontSize: 8, color: o.priority === "alta" ? T.red : T.gold, letterSpacing: 1 }}>{(o.priority || "").toUpperCase()}</span>
              <p style={{ fontFamily: T.fb, fontSize: 12, color: T.text, margin: "2px 0 0" }}>{o.text}</p>
            </div>
          ))}
        </div>
      )}

      {analysis.hook_suggestion && (
        <div style={{ background: `${T.cyan}08`, padding: "10px 12px", marginBottom: 8 }}>
          <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: 1 }}>HOOK SUGERIDO</span>
          <p style={{ fontFamily: T.ft, fontSize: 15, fontWeight: 700, color: T.cyan, margin: "2px 0 0" }}>{analysis.hook_suggestion}</p>
        </div>
      )}

      {analysis.best_time && (
        <div style={{ background: `${T.gold}08`, padding: "10px 12px", marginBottom: 8 }}>
          <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, letterSpacing: 1 }}>MELHOR HORÁRIO</span>
          <p style={{ fontFamily: T.ft, fontSize: 15, fontWeight: 700, color: T.gold, margin: "2px 0 0" }}>{analysis.best_time}</p>
        </div>
      )}

      <button onClick={onRun} style={{
        background: `${T.cyan}10`, border: `1px solid ${T.cyan}30`, borderRadius: 0,
        padding: "6px 14px", cursor: "pointer", fontFamily: T.fm, fontSize: 10, color: T.cyan,
      }}>⚡ Refazer análise</button>
    </div>
  );
}


export default function SocialOnStudioPanel({ ctx }: { ctx?: Record<string, unknown> }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [tab, setTab] = useState("legendas");
  const [loading, setLoading] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [config, setConfig] = useState<StudioConfig>({
    font: "montserrat", fontSize: 22, fontWeight: 700, position: "bottom",
    subtitleStyle: "boxed", textColor: "#FFFFFF", bgColor: "#000000CC",
  });
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [previewFormat, setPreviewFormat] = useState("reels");
  const [vision, setVision] = useState<Vision | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);

  const runVision = useCallback(async (f: File) => {
    setVisionLoading(true);
    try {
      const r = await callSocialAI({
        mode: "studio_vision",
        mediaInfo: `${f.name} (${f.type}, ${(f.size / 1024 / 1024).toFixed(1)}MB)`,
        topic: `Conteúdo ${f.type.startsWith("video") ? "em vídeo" : "em imagem"} do Coach Diogo Mello (fitness/nutrição, Método MCE) para Instagram.`,
        ...(ctx || {}),
      });
      if (r?.viral_score !== undefined) setVision(r as Vision);
      else toast.error("Não foi possível analisar a mídia");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setVisionLoading(false);
    }
  }, [ctx]);

  const handleFile = useCallback((f: File) => {
    const url = URL.createObjectURL(f);
    setFile(f);
    setFileUrl(url);
    setIsVideo(f.type.startsWith("video"));
    setSubtitles([]);
    setOverlays([]);
    setVersions(null);
    setVision(null);
    runVision(f);
  }, [runVision]);

  const transcribe = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const r = await callSocialAI({
        mode: "studio_subtitles",
        mediaInfo: `${file.name} (${file.type})`,
        topic: `Vídeo fitness/coaching para Instagram Reels do Coach Diogo Mello (Método MCE). Contexto: ${isVideo ? "vídeo" : "imagem estática"}.`,
        ...(ctx || {}),
      });
      if (r?.subtitles?.length) {
        setSubtitles(r.subtitles);
        toast.success("Legendas geradas");
      } else {
        toast.error("Não foi possível gerar as legendas");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const generateVersions = async () => {
    setGenLoading(true);
    try {
      const subsText = subtitles.map((s) => s.text).join(" ");
      const r = await callSocialAI({
        mode: "studio_versions",
        topic: subsText || "vídeo de fitness/coaching",
        overlays: overlays.map((o) => o.text).join(", "),
        ...(ctx || {}),
      });
      if (r?.versions?.length) {
        setVersions(r.versions);
        toast.success("4 versões geradas");
      } else {
        toast.error("Não foi possível gerar as versões");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenLoading(false);
    }
  };

  const clearFile = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null); setFileUrl(null); setIsVideo(false);
    setSubtitles([]); setOverlays([]); setVersions(null); setVision(null);
  };

  const tabs = [
    { id: "legendas", label: "Legendas", icon: "💬", color: T.cyan },
    { id: "texto", label: "Texto", icon: "✏️", color: T.gold },
    { id: "analise", label: "Análise", icon: "🧠", color: T.purple },
    { id: "versoes", label: "4 Versões", icon: "✦", color: T.green },
  ];

  return (
    <div style={{ background: T.bg, color: T.text, borderRadius: 12, overflow: "hidden", border: "1px solid #ffffff08" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #ffffff06", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.cyan, fontSize: 16 }}>✦</span>
          <h2 style={{ fontFamily: T.ft, fontSize: 18, fontWeight: 700, color: T.white, letterSpacing: 1, margin: 0 }}>
            STUDIO
          </h2>
          <span style={{ fontFamily: T.fm, fontSize: 9, color: T.bg, background: `linear-gradient(90deg,${T.cyan},${T.purple})`, padding: "2px 10px", letterSpacing: 1 }}>
            EDITOR
          </span>
        </div>
        {file && (
          <button onClick={clearFile} style={{
            background: T.surface2, border: "1px solid #ffffff10", borderRadius: 0,
            padding: "6px 14px", cursor: "pointer", fontFamily: T.fm, fontSize: 10, color: T.muted,
          }}>Nova mídia</button>
        )}
      </div>

      {!file ? (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ fontFamily: T.ft, fontSize: 26, fontWeight: 700, color: T.white, margin: "0 0 8px", letterSpacing: 1 }}>
              Sube. Edite. Poste.
            </h3>
            <p style={{ fontFamily: T.fb, fontSize: 14, color: T.muted, margin: 0 }}>
              Upload → legendas automáticas → editor de fontes → 4 versões prontas
            </p>
          </div>
          <UploadZone onFile={handleFile} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 20 }}>
            {[
              { icon: "💬", title: "Auto legendas", desc: "IA gera as falas" },
              { icon: "🎨", title: "Editor visual", desc: "Fontes, cores, estilos" },
              { icon: "✦", title: "4 versões", desc: "Prontas pra cada formato" },
            ].map((f, i) => (
              <div key={i} style={{ background: T.surface2, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontFamily: T.ft, fontSize: 13, fontWeight: 700, color: T.white }}>{f.title}</div>
                <div style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, marginTop: 2 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/* Preview */}
          <div style={{ width: 280, flexShrink: 0, background: T.surface, borderRight: "1px solid #ffffff06", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #ffffff06" }}>
              {FORMATS.map((f) => (
                <button key={f.id} onClick={() => setPreviewFormat(f.id)} style={{
                  flex: 1, padding: "8px 2px", background: previewFormat === f.id ? `${T.cyan}06` : "transparent",
                  border: "none", borderBottom: previewFormat === f.id ? `2px solid ${T.cyan}` : "2px solid transparent",
                  cursor: "pointer", fontFamily: T.fm, fontSize: 8, letterSpacing: 1,
                  color: previewFormat === f.id ? T.cyan : T.muted,
                }}>{f.id.toUpperCase()}</button>
              ))}
            </div>
            <div style={{ flex: 1, padding: 12, display: "flex", alignItems: "center" }}>
              <Preview fileUrl={fileUrl} subtitles={subtitles} overlays={overlays} config={config} isVideo={isVideo} format={previewFormat} />
            </div>
            <div style={{ padding: "10px 12px", borderTop: "1px solid #ffffff06" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{isVideo ? "🎬" : "🖼️"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: T.fb, fontSize: 11, color: T.white, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                  <p style={{ fontFamily: T.fm, fontSize: 9, color: T.green, margin: "2px 0 0" }}>✓ Carregado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 280 }}>
            <div style={{ display: "flex", borderBottom: "1px solid #ffffff06" }}>
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: 1, padding: "12px 8px", background: tab === t.id ? `${t.color}06` : "transparent",
                  border: "none", borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent",
                  cursor: "pointer", textAlign: "center",
                }}>
                  <span style={{ fontSize: 14, marginRight: 4 }}>{t.icon}</span>
                  <span style={{ fontFamily: T.fm, fontSize: 9, letterSpacing: 1, color: tab === t.id ? t.color : T.muted }}>{t.label.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <div style={{ flex: 1, padding: "16px 20px" }}>
              {tab === "legendas" && (
                <div>
                  {isVideo && subtitles.length === 0 && (
                    <button onClick={transcribe} disabled={loading} style={{
                      width: "100%", padding: "14px", marginBottom: 16,
                      background: `linear-gradient(90deg,${T.cyan},${T.purple})`,
                      border: "none", borderRadius: 0, cursor: loading ? "wait" : "pointer",
                      fontFamily: T.ft, fontSize: 16, fontWeight: 700, color: T.white, letterSpacing: 1,
                      opacity: loading ? 0.7 : 1,
                    }}>
                      {loading ? "⏳ Gerando legendas..." : "⚡ GERAR LEGENDAS AUTOMATICAMENTE"}
                    </button>
                  )}
                  {!isVideo && subtitles.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px 0", marginBottom: 16 }}>
                      <p style={{ fontFamily: T.fb, fontSize: 13, color: T.muted }}>Imagem detectada. Adicione legendas manualmente ou gere com IA.</p>
                      <button onClick={transcribe} disabled={loading} style={{
                        marginTop: 8, padding: "10px 20px", background: `${T.cyan}15`, border: `1px solid ${T.cyan}30`,
                        borderRadius: 0, cursor: "pointer", fontFamily: T.ft, fontSize: 14, fontWeight: 700, color: T.cyan,
                        opacity: loading ? 0.7 : 1,
                      }}>
                        {loading ? "⏳ Gerando..." : "✦ Gerar texto com IA"}
                      </button>
                    </div>
                  )}
                  <SubtitleEditor subtitles={subtitles} onChange={setSubtitles} config={config} onConfigChange={setConfig} />
                </div>
              )}

              {tab === "texto" && (
                <TextOverlayEditor overlays={overlays} onChange={setOverlays} config={config} />
              )}

              {tab === "analise" && (
                <VisionPanel analysis={vision} loading={visionLoading} onRun={() => file && runVision(file)} />
              )}

              {tab === "versoes" && (
                <div>
                  {!versions ? (
                    <div style={{ textAlign: "center", padding: "32px 0" }}>
                      <p style={{ fontFamily: T.fb, fontSize: 14, color: T.text, margin: "0 0 16px" }}>
                        Gere 4 versões otimizadas do seu conteúdo — uma pra cada formato.
                      </p>
                      <button onClick={generateVersions} disabled={genLoading} style={{
                        padding: "16px 32px",
                        background: `linear-gradient(90deg,${T.cyan},${T.green})`,
                        border: "none", borderRadius: 0, cursor: genLoading ? "wait" : "pointer",
                        fontFamily: T.ft, fontSize: 18, fontWeight: 700, color: T.bg, letterSpacing: 1,
                        opacity: genLoading ? 0.7 : 1,
                      }}>
                        {genLoading ? "⏳ Gerando versões..." : "✦ GERAR 4 VERSÕES"}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <p style={{ fontFamily: T.ft, fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>4 versões prontas</p>
                        <button onClick={() => setVersions(null)} style={{
                          background: `${T.cyan}10`, border: `1px solid ${T.cyan}30`, borderRadius: 0,
                          padding: "4px 12px", cursor: "pointer", fontFamily: T.fm, fontSize: 10, color: T.cyan,
                        }}>Refazer</button>
                      </div>
                      {versions.map((v, i) => {
                        const colors = [T.cyan, T.purple, T.green, T.gold];
                        const captionFull = `${v.caption}\n\n${(v.hashtags || []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`;
                        return (
                          <div key={i} style={{ background: T.surface2, marginBottom: 8, overflow: "hidden", borderLeft: `3px solid ${colors[i % 4]}` }}>
                            <div style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
                                <span style={{ fontFamily: T.ft, fontSize: 14, fontWeight: 700, color: T.white }}>{v.name}</span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <span style={{ fontFamily: T.fm, fontSize: 9, color: colors[i % 4], background: `${colors[i % 4]}12`, padding: "2px 6px" }}>{v.format}</span>
                                  <span style={{ fontFamily: T.fm, fontSize: 9, color: T.muted, background: T.surface3, padding: "2px 6px" }}>{v.tone}</span>
                                  {v.objective && (
                                    <span style={{ fontFamily: T.fm, fontSize: 9, color: T.gold, background: `${T.gold}12`, padding: "2px 6px" }}>{v.objective}</span>
                                  )}
                                </div>
                              </div>
                              {v.predicted_performance && (
                                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                                  <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>👁 {v.predicted_performance.views}</span>
                                  <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>💾 {v.predicted_performance.saves}</span>
                                  <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>📤 {v.predicted_performance.shares}</span>
                                </div>
                              )}
                              <p style={{ fontFamily: T.fb, fontSize: 12, color: T.text, margin: "0 0 8px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{v.caption}</p>
                              {v.text_overlays?.map((to, j) => (
                                <div key={j} style={{ background: `${colors[i % 4]}08`, padding: "6px 10px", marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
                                  <span style={{ fontFamily: T.fm, fontSize: 8, color: T.muted }}>{to.position}</span>
                                  <span style={{ fontFamily: T.ft, fontSize: 13, fontWeight: 700, color: colors[i % 4] }}>{to.text}</span>
                                </div>
                              ))}
                              <div style={{ background: `${T.gold}06`, padding: "6px 10px", marginBottom: 6 }}>
                                <span style={{ fontFamily: T.fm, fontSize: 8, color: T.muted }}>CTA</span>
                                <p style={{ fontFamily: T.fb, fontSize: 12, color: T.gold, margin: "2px 0 0" }}>{v.cta}</p>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                                {v.hashtags?.map((h, j) => (
                                  <span key={j} style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan, background: `${T.cyan}10`, padding: "2px 8px" }}>
                                    {h.startsWith("#") ? h : `#${h}`}
                                  </span>
                                ))}
                              </div>
                              <button onClick={() => copy(captionFull)} style={{
                                width: "100%", padding: "10px", background: `${T.cyan}10`, border: `1px solid ${T.cyan}30`,
                                borderRadius: 0, cursor: "pointer", fontFamily: T.fm, fontSize: 10, color: T.cyan, letterSpacing: 1,
                              }}>
                                COPIAR LEGENDA + HASHTAGS
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
