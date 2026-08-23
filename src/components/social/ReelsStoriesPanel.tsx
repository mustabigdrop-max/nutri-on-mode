import { useMemo, useState } from "react";
import { Download, ImageDown, Layers } from "lucide-react";
import { buildStoryScreens, downloadAllStories, downloadStory, renderStoryCanvas, type ReelExportData } from "@/lib/reelsExport";

const C = {
  bg: "#020205", card: "#080810", border: "#B8922A22", gold: "#B8922A",
  green: "#00C896", text: "#F5F0E8", textMid: "#A0A0A0", textMuted: "#4A4A4A",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

export default function ReelsStoriesPanel({ result, accent = C.gold }: { result: ReelExportData; accent?: string }) {
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const screens = useMemo(() => buildStoryScreens(result, accent), [result, accent]);
  const previews = useMemo(() => screens.map((s) => renderStoryCanvas(s, "jpg")), [screens]);

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ ...fT, fontSize: 22, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
            <Layers size={18} color={accent} /> 3 TELAS DE STORIES
          </div>
          <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 2 }}>1080x1920 · chamada, valor e CTA</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(["png", "jpg"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={{ padding: "8px 14px", background: format === f ? `${accent}18` : "transparent", border: `1px solid ${format === f ? `${accent}66` : C.border}`, ...fM, fontSize: 13, color: format === f ? accent : C.textMid, cursor: "pointer" }}
            >{f.toUpperCase()}</button>
          ))}
          <button
            onClick={() => downloadAllStories(screens, format)}
            style={{ padding: "9px 16px", background: accent, border: "none", ...fT, fontSize: 15, color: C.bg, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Download size={15} /> BAIXAR AS 3
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {screens.map((s, i) => (
          <div key={s.index} style={{ flex: "1 1 180px", minWidth: 170, background: C.card, border: `1px solid ${C.border}`, padding: 10 }}>
            <img src={previews[i]} alt={`Prévia do Story ${s.index}`} style={{ width: "100%", display: "block", border: `1px solid ${C.border}` }} />
            <div style={{ ...fM, fontSize: 11, color: s.accent, marginTop: 8, letterSpacing: "0.08em" }}>{s.kicker}</div>
            <button
              onClick={() => downloadStory(s, format)}
              style={{ width: "100%", marginTop: 8, padding: "9px 0", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 12, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <ImageDown size={13} /> BAIXAR {format.toUpperCase()}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
