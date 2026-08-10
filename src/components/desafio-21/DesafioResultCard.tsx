import { useRef, useState } from "react";
import { Share2, Download } from "lucide-react";
import { BADGES, DesafioConfig, getPlan, getStats } from "@/lib/desafio21";

const mono = (s: number, c: string, sp = 1.5): React.CSSProperties => ({
  fontFamily: "'Space Mono', monospace", fontSize: s, color: c, letterSpacing: `${sp}px`,
});
const raj = (s: number, w = 700, c = "#F5F0E8"): React.CSSProperties => ({
  fontFamily: "'Rajdhani', sans-serif", fontSize: s, fontWeight: w, color: c, lineHeight: 1.15,
});

export default function DesafioResultCard({ cfg }: { cfg: DesafioConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const stats = getStats(cfg);
  const plan = getPlan(cfg);

  const dotColor = (day: number) => {
    if (cfg.completedDays.includes(day)) {
      const t = plan.find((p) => p.day === day)?.type ?? "descanso";
      return t.startsWith("musculacao") ? "#00D4FF" : t.startsWith("corrida") ? "#00FF88" : "#FFB800";
    }
    return day < cfg.currentDay ? "#FF4444" : "#1a2a3a";
  };

  const share = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(ref.current, { width: 1080, height: 1350, scale: 2, backgroundColor: "#020205" });
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png", 1.0));
      if (!blob) return;
      const file = new File([blob], "desafio-21-nutrion.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Desafio 21 Dias — Atleta Híbrido",
          text: "Completei o Desafio 21 Dias do nutriON! 💪🏃",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "desafio-21-nutrion.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Preview escalado */}
      <div style={{ width: "100%", overflow: "hidden", borderRadius: 12, height: "calc(1350px * var(--desafio-card-scale, 0.3))" }}>
        <div style={{ width: 1080, height: 1350, transformOrigin: "top left", transform: "scale(var(--desafio-card-scale, 0.3))" }}>

          <div
            id="resultado-card"
            ref={ref}
            style={{
              width: 1080, height: 1350, padding: 72,
              background: "radial-gradient(circle at 50% 40%, #0a1a2a 0%, #020205 75%)",
              border: "1px solid rgba(0,212,255,0.3)",
              display: "flex", flexDirection: "column", gap: 40,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={raj(56, 700, "#00D4FF")}>nutriON</p>
              <p style={{ ...mono(26, "#F5F0E8", 3), marginTop: 16 }}>DESAFIO 21 DIAS — ATLETA HÍBRIDO</p>
              <p style={{ ...mono(24, "#00FF88", 4), marginTop: 14 }}>✅ COMPLETADO</p>
            </div>

            <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 24, padding: 44 }}>
              <p style={{ ...mono(22, "#5a6a79", 4), marginBottom: 28 }}>MEUS NÚMEROS</p>
              {[
                `💪 ${stats.gym} treinos de musculação`,
                `🏃 ${stats.runs} corridas completadas`,
                `🔥 Streak máximo: ${cfg.maxStreak} dias`,
                `⚡ ${cfg.totalXP.toLocaleString("pt-BR")} XP total`,
                `🏆 ${cfg.badges.length} de ${BADGES.length} badges conquistados`,
              ].map((l) => (
                <p key={l} style={{ ...mono(30, "#F5F0E8", 0), marginBottom: 20 }}>{l}</p>
              ))}
            </div>

            <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 24, padding: 36 }}>
              {[0, 1, 2].map((w) => (
                <div key={w} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
                  <span style={mono(22, "#5a6a79", 3)}>SEMANA {w + 1}</span>
                  <span style={{ display: "flex", gap: 12 }}>
                    {Array.from({ length: 7 }, (_, i) => w * 7 + i + 1).map((d) => (
                      <span key={d} style={{ width: 24, height: 24, borderRadius: 999, background: dotColor(d), display: "inline-block" }} />
                    ))}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ ...raj(38, 400, "#00D4FF"), fontStyle: "italic", textAlign: "center" }}>
              "Corra. Levante. Prove que dá pra fazer os dois."
            </p>

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between" }}>
              <span style={mono(22, "#666", 2)}>@diogomello180</span>
              <span style={mono(22, "#666", 2)}>nutrion.app.br</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          aria-label="Compartilhar card do desafio"
          onClick={share}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2"
          style={{ background: "#00D4FF", borderRadius: 8, padding: "13px 0", ...raj(16, 700, "#020205"), opacity: busy ? 0.6 : 1 }}
        >
          {busy ? <Download style={{ width: 15, height: 15 }} /> : <Share2 style={{ width: 15, height: 15 }} />}
          {busy ? "GERANDO..." : "COMPARTILHAR"}
        </button>
      </div>
    </div>
  );
}
