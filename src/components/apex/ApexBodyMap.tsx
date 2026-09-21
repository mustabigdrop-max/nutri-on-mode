// APEX — MAPA MUSCULAR CLICÁVEL
// Esquema anterior/posterior com uma zona por grupo da avaliação (apex_muscle_scores).
// A cor sai do score real salvo. Grupo sem score fica cinza e é rotulado
// "sem avaliação" — nenhum valor é estimado.

import { useMemo, useState } from "react";

export type Vista = "anterior" | "posterior";

export interface ZonaMapa {
  grupo: string;
  score: number | null;
  delta: number | null;
}

interface Forma {
  grupo: string;
  /** x, y, largura, altura, raio horizontal do retângulo arredondado */
  rects: [number, number, number, number, number?][];
}

const W = 300;
const H = 620;

// Espelhamento: cada par (x, largura) é desenhado nos dois lados quando aplicável.
const ANTERIOR: Forma[] = [
  { grupo: "Trapézio superior", rects: [[118, 74, 64, 18, 8]] },
  { grupo: "Deltóide anterior", rects: [[92, 96, 26, 30, 10], [182, 96, 26, 30, 10]] },
  { grupo: "Deltóide lateral", rects: [[80, 100, 14, 40, 7], [206, 100, 14, 40, 7]] },
  { grupo: "Peitoral superior", rects: [[120, 98, 60, 22, 6]] },
  { grupo: "Peitoral inferior", rects: [[120, 122, 60, 22, 6]] },
  { grupo: "Bíceps", rects: [[82, 144, 24, 46, 10], [194, 144, 24, 46, 10]] },
  { grupo: "Antebraços", rects: [[80, 194, 22, 56, 9], [198, 194, 22, 56, 9]] },
  { grupo: "Abdômen", rects: [[130, 150, 40, 68, 6]] },
  { grupo: "Oblíquos", rects: [[114, 152, 14, 62, 6], [172, 152, 14, 62, 6]] },
  { grupo: "Quadríceps", rects: [[112, 258, 32, 110, 12], [156, 258, 32, 110, 12]] },
  { grupo: "Adutores", rects: [[144, 262, 12, 80, 6]] },
  { grupo: "Panturrilhas", rects: [[114, 400, 26, 78, 11], [160, 400, 26, 78, 11]] },
];

const POSTERIOR: Forma[] = [
  { grupo: "Trapézio superior", rects: [[116, 72, 68, 20, 8]] },
  { grupo: "Trapézio médio", rects: [[122, 96, 56, 24, 6]] },
  { grupo: "Trapézio inferior", rects: [[130, 122, 40, 24, 6]] },
  { grupo: "Romboides", rects: [[118, 100, 12, 34, 5], [170, 100, 12, 34, 5]] },
  { grupo: "Deltóide posterior", rects: [[88, 98, 26, 30, 10], [186, 98, 26, 30, 10]] },
  { grupo: "Dorsal", rects: [[106, 124, 30, 60, 8], [164, 124, 30, 60, 8]] },
  { grupo: "Eretores", rects: [[138, 150, 24, 70, 6]] },
  { grupo: "Tríceps", rects: [[80, 142, 24, 48, 10], [196, 142, 24, 48, 10]] },
  { grupo: "Antebraços", rects: [[78, 194, 22, 56, 9], [200, 194, 22, 56, 9]] },
  { grupo: "Glúteo máximo", rects: [[116, 226, 68, 40, 14]] },
  { grupo: "Glúteo médio", rects: [[104, 224, 14, 30, 7], [182, 224, 14, 30, 7]] },
  { grupo: "Posterior de coxa", rects: [[112, 272, 32, 104, 12], [156, 272, 32, 104, 12]] },
  { grupo: "Panturrilhas", rects: [[114, 398, 26, 80, 11], [160, 398, 26, 80, 11]] },
];

const SILHUETA =
  "M150 40c11 0 18 9 18 21s-7 21-18 21-18-9-18-21S139 40 150 40z " +
  "M112 74h76c22 4 34 16 36 38l6 62c2 18-2 26-12 28l-8-2-6 78c-2 20-6 34-6 56l-4 100 " +
  "c0 26 4 60 6 92l2 44h-34l-4-44-8-84-6 84-4 44h-34l2-44c2-32 6-66 6-92l-4-100 " +
  "c0-22-4-36-6-56l-6-78-8 2c-10-2-14-10-12-28l6-62c2-22 14-34 36-38z";

function corDoScore(score: number | null): string {
  if (score === null) return "#262a33";
  if (score >= 80) return "#5DCAA5";
  if (score >= 70) return "#3F9E7C";
  if (score >= 60) return "#EF9F27";
  if (score >= 50) return "#D87A27";
  return "#D8402E";
}

interface Props {
  zonas: ZonaMapa[];
  vistaInicial?: Vista;
  onSelecionar?: (grupo: string) => void;
}

const ApexBodyMap = ({ zonas, vistaInicial = "anterior", onSelecionar }: Props) => {
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const porGrupo = useMemo(() => {
    const m = new Map<string, ZonaMapa>();
    zonas.forEach((z) => m.set(z.grupo, z));
    return m;
  }, [zonas]);

  const formas = vista === "anterior" ? ANTERIOR : POSTERIOR;
  const atual = selecionado ? porGrupo.get(selecionado) ?? { grupo: selecionado, score: null, delta: null } : null;

  const clicar = (grupo: string) => {
    setSelecionado(grupo);
    onSelecionar?.(grupo);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["anterior", "posterior"] as Vista[]).map((v) => (
          <button
            key={v}
            onClick={() => setVista(v)}
            className="px-3 py-1.5 text-[11px] tracking-widest border font-mono uppercase"
            style={{
              borderColor: vista === v ? "#B8922A" : "rgba(255,255,255,.14)",
              color: vista === v ? "#B8922A" : "rgba(255,255,255,.5)",
              background: vista === v ? "rgba(184,146,42,.08)" : "transparent",
            }}
          >
            {v === "anterior" ? "Frente" : "Costas"}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[320px] mx-auto block" role="img" aria-label={`Mapa muscular — ${vista}`}>
        <path d={SILHUETA} fill="#12151b" stroke="#1E2430" strokeWidth={2} />
        {formas.map((f) =>
          f.rects.map(([x, y, w, h, r], i) => {
            const z = porGrupo.get(f.grupo);
            const ativo = selecionado === f.grupo;
            return (
              <rect
                key={`${f.grupo}-${i}`}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={r ?? 6}
                fill={corDoScore(z?.score ?? null)}
                fillOpacity={z?.score === undefined || z?.score === null ? 0.5 : 0.85}
                stroke={ativo ? "#FFD86A" : "rgba(0,0,0,.35)"}
                strokeWidth={ativo ? 2.5 : 1}
                style={{ cursor: "pointer" }}
                onClick={() => clicar(f.grupo)}
              >
                <title>{`${f.grupo}: ${z?.score ?? "sem avaliação"}`}</title>
              </rect>
            );
          }),
        )}
      </svg>

      {atual && (
        <div className="border p-3" style={{ borderColor: "rgba(184,146,42,.3)" }}>
          <p className="text-white text-sm font-semibold">{atual.grupo}</p>
          {atual.score === null ? (
            <p className="text-xs text-white/50 mt-1">Sem avaliação registrada para este grupo.</p>
          ) : (
            <p className="text-xs font-mono mt-1" style={{ color: corDoScore(atual.score) }}>
              Score {atual.score}
              {atual.delta !== null && (
                <span style={{ color: atual.delta >= 0 ? "#5DCAA5" : "#D8402E" }}>
                  {"  "}{atual.delta >= 0 ? "+" : ""}{atual.delta} vs avaliação anterior
                </span>
              )}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-[10px] font-mono text-white/45">
        {[["≥80", 85], ["70-79", 75], ["60-69", 65], ["50-59", 55], ["<50", 40], ["sem dado", null]].map(([label, v]) => (
          <span key={String(label)} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3" style={{ background: corDoScore(v as number | null) }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ApexBodyMap;
