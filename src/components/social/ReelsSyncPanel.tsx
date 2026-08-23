import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Copy, Download, FileDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  PACING_VARIANTS, buildCues, buildVariantScript, cuesToSRT, cuesToVTT, downloadText,
  fitStatus, formatTimedScript, moveCueEnd, moveCueStart, splitIntoLines, type Cue,
} from "@/lib/reelsTiming";
import { downloadTxt, type ReelExportData } from "@/lib/reelsExport";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22",
  gold: "#B8922A", cyan: "#00D4FF", green: "#00C896", orange: "#E8A020", red: "#ff4444",
  text: "#F5F0E8", textMid: "#A0A0A0", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

const LABEL_COLORS: Record<string, string> = { HOOK: "#B8922A", CORPO: "#00D4FF", PUNCH: "#E8A020", CTA: "#00C896" };

/** Legenda e CTA quebrados e sincronizados com a duração do trecho recortado. */
export default function ReelsSyncPanel({
  result, trimDuration, captionIndex = 0,
}: { result: ReelExportData; trimDuration: number; captionIndex?: number }) {
  const r = result.roteiro || {};
  const caption = result.legendas?.[captionIndex]?.texto || "";
  const cta = r.cta_28_35s || "";

  const parts = { hook: result.hook || r.hook_0_2s, corpo: r.corpo_2_20s, punch: r.punch_20_28s, cta };
  const partsKey = JSON.stringify(parts);

  const [variantId, setVariantId] = useState("b");
  const variant = PACING_VARIANTS.find((v) => v.id === variantId) || PACING_VARIANTS[1];

  const variants = useMemo(
    () => PACING_VARIANTS.map((v) => ({ v, beats: buildVariantScript(parts, trimDuration, v) })),
    [partsKey, trimDuration],
  );
  const beats = variants.find((x) => x.v.id === variantId)?.beats || [];
  const fit = useMemo(() => fitStatus(parts, trimDuration), [partsKey, trimDuration]);

  const [cues, setCues] = useState<Cue[]>([]);
  useEffect(() => { setCues(buildCues(beats, variant.maxChars)); }, [partsKey, trimDuration, variantId]);

  // arraste dos marcadores
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; edge: "start" | "end" } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      const el = trackRef.current;
      if (!d || !el || !trimDuration) return;
      const rect = el.getBoundingClientRect();
      const t = ((e.clientX - rect.left) / rect.width) * trimDuration;
      setCues((prev) => (d.edge === "start" ? moveCueStart(prev, d.id, t, trimDuration) : moveCueEnd(prev, d.id, t, trimDuration)));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [trimDuration]);

  if (!trimDuration) {
    return (
      <div style={{ ...fM, fontSize: 13, color: C.textMid, background: C.card, border: `1px solid ${C.border}`, padding: 16 }}>
        Corte um trecho do vídeo no passo 1 para eu sincronizar legenda e CTA com o tempo exato.
      </div>
    );
  }

  const fitColor = fit.status === "ok" ? C.green : fit.status === "long" ? C.red : C.orange;
  const fullText = formatTimedScript(beats, caption, cta);
  const pct = (s: number) => `${Math.min(100, Math.max(0, (s / trimDuration) * 100))}%`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.card, border: `1px solid ${fitColor}55`, padding: 14 }}>
        <div style={{ ...fM, fontSize: 12, color: fitColor, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={13} /> CORTE DE {trimDuration}s
        </div>
        <p style={{ ...fM, fontSize: 13, color: C.text, marginTop: 8, lineHeight: 1.6 }}>{fit.msg}</p>
        <p style={{ ...fM, fontSize: 12, color: C.textMuted, marginTop: 4 }}>
          Fala estimada: {Math.round(fit.needed)}s · ritmo de 2,8 palavras por segundo
        </p>
      </div>

      {/* Variações de ritmo */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
        <div style={{ ...fM, fontSize: 12, color: C.gold, letterSpacing: "0.1em" }}>VARIAÇÕES DE QUEBRA POR TEMPO</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginTop: 10 }}>
          {variants.map(({ v, beats: bs }) => {
            const active = v.id === variantId;
            return (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                style={{
                  textAlign: "left", padding: 12, cursor: "pointer",
                  background: active ? `${C.gold}18` : C.bg,
                  border: `1px solid ${active ? C.gold : C.border}`,
                }}
              >
                <div style={{ ...fT, fontSize: 16, color: active ? C.gold : C.text }}>{v.name}</div>
                <div style={{ ...fM, fontSize: 11, color: C.textMid, marginTop: 4, lineHeight: 1.5 }}>{v.desc}</div>
                <div style={{ ...fM, fontSize: 11, color: C.textMuted, marginTop: 6 }}>
                  {bs.map((b) => `${b.label} ${Math.round(b.to - b.from)}s`).join(" · ")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline com marcadores arrastáveis */}
      <div style={{ background: C.card, border: `1px solid ${C.cyan}33`, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...fM, fontSize: 12, color: C.cyan, letterSpacing: "0.1em" }}>MOMENTOS DA LEGENDA · ARRASTE AS BORDAS</div>
          <button
            onClick={() => setCues(buildCues(beats, variant.maxChars))}
            style={{ ...fM, fontSize: 11, color: C.textMid, background: "transparent", border: `1px solid ${C.border}`, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            <RotateCcw size={11} /> RESETAR
          </button>
        </div>

        <div ref={trackRef} style={{ position: "relative", marginTop: 12, background: C.bg, border: `1px solid ${C.border}`, height: Math.max(cues.length * 30 + 12, 60) }}>
          {cues.map((c, i) => {
            const col = LABEL_COLORS[c.label] || C.gold;
            return (
              <div
                key={c.id}
                style={{
                  position: "absolute", top: 6 + i * 30, height: 24,
                  left: pct(c.start), width: `calc(${pct(c.end)} - ${pct(c.start)})`,
                  background: `${col}22`, border: `1px solid ${col}88`,
                  display: "flex", alignItems: "center", overflow: "hidden",
                }}
                title={`${c.start.toFixed(2)}s – ${c.end.toFixed(2)}s`}
              >
                <div
                  onPointerDown={() => { dragRef.current = { id: c.id, edge: "start" }; }}
                  style={{ width: 8, alignSelf: "stretch", background: col, cursor: "ew-resize", flexShrink: 0 }}
                />
                <span style={{ ...fM, fontSize: 10, color: C.text, padding: "0 6px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", flex: 1 }}>
                  {c.text}
                </span>
                <div
                  onPointerDown={() => { dragRef.current = { id: c.id, edge: "end" }; }}
                  style={{ width: 8, alignSelf: "stretch", background: col, cursor: "ew-resize", flexShrink: 0 }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", ...fM, fontSize: 11, color: C.textMuted, marginTop: 6 }}>
          <span>0s</span><span>{trimDuration}s</span>
        </div>
      </div>

      {beats.map((b) => (
        <div key={b.label} style={{ background: C.bg, border: `1px solid ${(LABEL_COLORS[b.label] || C.gold)}44`, padding: 14 }}>
          <div style={{ ...fM, fontSize: 12, color: LABEL_COLORS[b.label] || C.gold, letterSpacing: "0.1em" }}>
            {b.from.toFixed(1)}s – {b.to.toFixed(1)}s · {b.label}
          </div>
          <div style={{ marginTop: 8 }}>
            {splitIntoLines(b.text, variant.maxChars).map((l, i) => (
              <p key={i} style={{ ...fT, fontSize: 17, color: C.text, lineHeight: 1.45 }}>{l}</p>
            ))}
          </div>
        </div>
      ))}

      {caption && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
          <div style={{ ...fM, fontSize: 12, color: C.textMuted, letterSpacing: "0.1em" }}>LEGENDA COM QUEBRAS SUGERIDAS</div>
          <div style={{ marginTop: 8 }}>
            {splitIntoLines(caption, 60).map((l, i) => (
              <p key={i} style={{ ...fM, fontSize: 14, color: C.textMid, lineHeight: 1.7 }}>{l}</p>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => { navigator.clipboard.writeText(fullText); toast.success("Roteiro sincronizado copiado"); }}
          style={{ flex: "1 1 150px", padding: "11px 0", background: `${C.gold}18`, border: `1px solid ${C.gold}66`, ...fT, fontSize: 15, color: C.gold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Copy size={14} /> COPIAR SINCRONIZADO
        </button>
        <button
          onClick={() => { downloadTxt(`reel-sincronizado-${trimDuration}s`, fullText); toast.success("TXT baixado"); }}
          style={{ flex: "1 1 130px", padding: "11px 0", background: `${C.green}18`, border: `1px solid ${C.green}66`, ...fT, fontSize: 15, color: C.green, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Download size={14} /> BAIXAR TXT
        </button>
        <button
          onClick={() => { downloadText(`reel-${variant.id}-${trimDuration}s.srt`, cuesToSRT(cues), "application/x-subrip"); toast.success("SRT baixado"); }}
          style={{ flex: "1 1 120px", padding: "11px 0", background: `${C.cyan}18`, border: `1px solid ${C.cyan}66`, ...fT, fontSize: 15, color: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <FileDown size={14} /> SRT
        </button>
        <button
          onClick={() => { downloadText(`reel-${variant.id}-${trimDuration}s.vtt`, cuesToVTT(cues), "text/vtt"); toast.success("VTT baixado"); }}
          style={{ flex: "1 1 120px", padding: "11px 0", background: `${C.orange}18`, border: `1px solid ${C.orange}66`, ...fT, fontSize: 15, color: C.orange, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <FileDown size={14} /> VTT
        </button>
      </div>
    </div>
  );
}
