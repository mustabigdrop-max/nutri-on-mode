// ARSENAL VIRAL — PHYSIQUE CARD DO nutriON
// Todos os números vêm da avaliação APEX salva e dos logs reais do aluno.
import { forwardRef } from "react";
import { corDoScore, STATUS_CORES, type DestaqueGrupo, type Rank } from "@/lib/apexRanks";

export type CardVariant = "standard" | "evolution" | "achievement" | "season" | "minimal";
export type CardFormat = "4:5" | "9:16";

export interface PhysiqueCardData {
  nome: string;
  fotoUrl: string | null;
  objetivo: string | null;
  fase: string | null;
  scoreAtual: number;
  scoreAnterior: number | null;
  delta: number | null;
  rank: Rank;
  pesoKg: number | null;
  bfPercent: number | null;
  alturaCm: number | null;
  streakDias: number;
  totalTreinos: number;
  destaques: DestaqueGrupo[];
  conquistas: { badge: string; titulo: string }[];
  conquistaDestaque?: { badge: string; titulo: string; mensagem: string } | null;
}

interface Props {
  data: PhysiqueCardData;
  variant: CardVariant;
  format: CardFormat;
}

const W = 1080;
const H: Record<CardFormat, number> = { "4:5": 1350, "9:16": 1920 };

const mono = "'Space Mono', monospace";
const disp = "'Rajdhani', sans-serif";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
    <span style={{ font: `700 42px ${disp}`, color: "#EF9F27", letterSpacing: "-.02em" }}>nutri</span>
    <span style={{ font: `700 42px ${disp}`, color: "#F5F0E8", letterSpacing: "-.02em" }}>ON</span>
  </div>
);

const Divider = () => <div style={{ height: 1, background: "rgba(255,255,255,.1)", width: "100%" }} />;

const ScoreBar = ({ score }: { score: number }) => (
  <div style={{ width: "100%", height: 22, background: "rgba(255,255,255,.07)", position: "relative" }}>
    <div
      style={{
        position: "absolute", inset: 0, width: `${Math.max(0, Math.min(100, score))}%`,
        background: `linear-gradient(90deg, #FF4444 0%, #B8922A 50%, ${corDoScore(score)} 100%)`,
      }}
    />
  </div>
);

const Stat = ({ label, valor }: { label: string; valor: string }) => (
  <div style={{ flex: 1, border: "1px solid rgba(255,255,255,.1)", padding: "14px 16px" }}>
    <div style={{ font: `400 16px ${mono}`, color: "rgba(255,255,255,.4)", letterSpacing: ".14em" }}>{label}</div>
    <div style={{ font: `700 34px ${disp}`, color: "#F5F0E8", marginTop: 4 }}>{valor}</div>
  </div>
);

const PhysiqueCard = forwardRef<HTMLDivElement, Props>(({ data, variant, format }, ref) => {
  const h = H[format];
  const compacto = variant === "minimal";
  const score = Math.round(data.scoreAtual);
  const deltaTexto = data.delta === null ? null : `${data.delta >= 0 ? "▲+" : "▼"}${Math.abs(data.delta)}`;
  const deltaCor = data.delta === null ? "#555566" : data.delta >= 0 ? "#00FF88" : "#FF4444";

  return (
    <div
      ref={ref}
      style={{
        width: W, height: h, background: "#020205", color: "#F5F0E8", position: "relative",
        padding: 56, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 28,
        borderRadius: 0, overflow: "hidden", fontFamily: disp,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 0%, rgba(0,212,255,.1), transparent 55%)" }} />

      {/* Topo */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
            border: `1px solid ${data.rank.cor}`, background: "rgba(0,0,0,.4)",
            boxShadow: data.rank.glow ? `0 0 20px ${data.rank.cor}44` : "none",
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>{data.rank.icone}</span>
          <span style={{ font: `700 24px ${disp}`, letterSpacing: ".1em", color: data.rank.cor }}>{data.rank.nome}</span>
        </div>
      </div>

      {/* Identificação + foto */}
      <div style={{ position: "relative", display: "flex", gap: 26, alignItems: "stretch" }}>
        {data.fotoUrl && (
          <div style={{ width: compacto ? 240 : 300, height: compacto ? 240 : 300, overflow: "hidden", border: "1px solid rgba(0,212,255,.35)", flex: "0 0 auto" }}>
            <img src={data.fotoUrl} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <div style={{ font: `700 ${compacto ? 58 : 66}px ${disp}`, lineHeight: 1, textTransform: "uppercase" }}>{data.nome}</div>
          {data.objetivo && (
            <div style={{ font: `400 20px ${mono}`, color: "#00D4FF", letterSpacing: ".1em", textTransform: "uppercase" }}>{data.objetivo}</div>
          )}
          {data.fase && <div style={{ font: `400 18px ${mono}`, color: "rgba(255,255,255,.5)" }}>{data.fase}</div>}
        </div>
      </div>

      {/* APEX Score */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ font: `400 18px ${mono}`, color: "rgba(255,255,255,.45)", letterSpacing: ".2em" }}>APEX SCORE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ font: `700 140px ${disp}`, lineHeight: .9, color: corDoScore(score) }}>{score}</span>
              <span style={{ font: `400 26px ${mono}`, color: "rgba(255,255,255,.35)" }}>/100</span>
              {deltaTexto && <span style={{ font: `700 34px ${disp}`, color: deltaCor }}>{deltaTexto}</span>}
            </div>
          </div>
          {variant === "evolution" && data.scoreAnterior !== null && (
            <div style={{ textAlign: "right" }}>
              <div style={{ font: `400 16px ${mono}`, color: "rgba(255,255,255,.4)", letterSpacing: ".14em" }}>ANTES</div>
              <div style={{ font: `700 76px ${disp}`, lineHeight: 1, color: "rgba(255,255,255,.35)" }}>{Math.round(data.scoreAnterior)}</div>
            </div>
          )}
        </div>
        <ScoreBar score={score} />
      </div>

      {variant === "achievement" && data.conquistaDestaque && (
        <div style={{ position: "relative", border: "1px solid rgba(0,212,255,.4)", padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 108, lineHeight: 1 }}>{data.conquistaDestaque.badge}</div>
          <div style={{ font: `700 46px ${disp}`, color: "#00D4FF", marginTop: 10, textTransform: "uppercase" }}>{data.conquistaDestaque.titulo}</div>
          <div style={{ font: `400 20px ${mono}`, color: "rgba(255,255,255,.65)", marginTop: 12, lineHeight: 1.5 }}>{data.conquistaDestaque.mensagem}</div>
        </div>
      )}

      {/* Destaques */}
      {!compacto && data.destaques.length > 0 && (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ font: `400 16px ${mono}`, color: "rgba(255,255,255,.4)", letterSpacing: ".2em" }}>DESTAQUES DO CICLO</div>
          {data.destaques.map((d) => (
            <div key={d.grupo} style={{ display: "flex", alignItems: "center", gap: 14, border: `1px solid ${STATUS_CORES[d.status]}44`, padding: "14px 18px" }}>
              <span style={{ width: 8, height: 30, background: STATUS_CORES[d.status], boxShadow: d.status === "elite" ? `0 0 14px ${STATUS_CORES[d.status]}` : "none" }} />
              <span style={{ font: `700 30px ${disp}`, flex: 1, textTransform: "uppercase" }}>{d.grupo}</span>
              {d.nota && <span style={{ font: `400 16px ${mono}`, color: STATUS_CORES[d.status] }}>{d.nota}</span>}
              <span style={{ font: `700 32px ${disp}`, color: STATUS_CORES[d.status] }}>
                {d.delta > 0 ? `+${d.delta}` : d.delta}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ position: "relative", display: "flex", gap: 14 }}>
        {data.pesoKg !== null && <Stat label="PESO" valor={`${data.pesoKg.toFixed(1)}kg`} />}
        {data.bfPercent !== null && <Stat label="BF" valor={`${data.bfPercent.toFixed(1)}%`} />}
        {data.alturaCm !== null && <Stat label="ALTURA" valor={`${Math.round(data.alturaCm)}cm`} />}
      </div>

      <div style={{ position: "relative", display: "flex", gap: 14 }}>
        <Stat label="STREAK" valor={`${data.streakDias} dias 🔥`} />
        <Stat label="TREINOS" valor={`${data.totalTreinos}`} />
      </div>

      {!compacto && data.conquistas.length > 0 && (
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 10 }}>
          {data.conquistas.slice(0, format === "9:16" ? 6 : 3).map((c) => (
            <span key={c.titulo} style={{ font: `400 18px ${mono}`, color: "#B8922A", border: "1px solid rgba(184,146,42,.4)", padding: "8px 14px" }}>
              {c.badge} {c.titulo}
            </span>
          ))}
        </div>
      )}

      <div style={{ position: "relative", marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <Divider />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ font: `700 26px ${disp}`, color: "#F5F0E8" }}>Coach Diogo Mello</div>
            <div style={{ font: `400 18px ${mono}`, color: "#EF9F27", letterSpacing: ".08em" }}>nutrion.app.br</div>
          </div>
          <div style={{ font: `700 24px ${disp}`, color: "rgba(255,255,255,.55)", letterSpacing: ".04em" }}>Transformação é sistema.</div>
        </div>
      </div>
    </div>
  );
});

PhysiqueCard.displayName = "PhysiqueCard";
export default PhysiqueCard;
export { W as CARD_WIDTH, H as CARD_HEIGHTS };
