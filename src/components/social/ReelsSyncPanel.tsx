import { useMemo } from "react";
import { Clock, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { buildTimedScript, fitStatus, formatTimedScript, splitIntoLines } from "@/lib/reelsTiming";
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
  const beats = useMemo(() => buildTimedScript(parts, trimDuration), [JSON.stringify(parts), trimDuration]);
  const fit = useMemo(() => fitStatus(parts, trimDuration), [JSON.stringify(parts), trimDuration]);

  if (!trimDuration) {
    return (
      <div style={{ ...fM, fontSize: 13, color: C.textMid, background: C.card, border: `1px solid ${C.border}`, padding: 16 }}>
        Corte um trecho do vídeo no passo 1 para eu sincronizar legenda e CTA com o tempo exato.
      </div>
    );
  }

  const fitColor = fit.status === "ok" ? C.green : fit.status === "long" ? C.red : C.orange;
  const fullText = formatTimedScript(beats, caption, cta);

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

      {beats.map((b) => (
        <div key={b.label} style={{ background: C.bg, border: `1px solid ${(LABEL_COLORS[b.label] || C.gold)}44`, padding: 14 }}>
          <div style={{ ...fM, fontSize: 12, color: LABEL_COLORS[b.label] || C.gold, letterSpacing: "0.1em" }}>
            {b.from.toFixed(1)}s – {b.to.toFixed(1)}s · {b.label}
          </div>
          <div style={{ marginTop: 8 }}>
            {splitIntoLines(b.text).map((l, i) => (
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
          style={{ flex: "1 1 160px", padding: "11px 0", background: `${C.gold}18`, border: `1px solid ${C.gold}66`, ...fT, fontSize: 15, color: C.gold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Copy size={14} /> COPIAR SINCRONIZADO
        </button>
        <button
          onClick={() => { downloadTxt(`reel-sincronizado-${trimDuration}s`, fullText); toast.success("TXT baixado"); }}
          style={{ flex: "1 1 160px", padding: "11px 0", background: `${C.green}18`, border: `1px solid ${C.green}66`, ...fT, fontSize: 15, color: C.green, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Download size={14} /> BAIXAR TXT
        </button>
      </div>
    </div>
  );
}
