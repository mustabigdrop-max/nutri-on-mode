// Cenas conceituais abstratas em SVG (sem pessoas, corpos ou rostos). Props de cor e intensidade.
import type { SceneId } from "@/lib/cardStudio";

export const SCENE_NAMES: Record<SceneId, string> = {
  balanca: "Balança", escada: "Escada", ponte: "Ponte", calendario: "Calendário", relogio: "Relógio", funil: "Funil", labirinto: "Labirinto",
  interruptor: "Interruptor", engrenagem: "Engrenagem", setas: "Setas de contraste", bifurcacao: "Bifurcação", bateria: "Bateria", lupa: "Lupa",
  cadeado: "Cadeado", semente: "Semente que cresce", alvo: "Alvo", ampulheta: "Ampulheta", onda: "Onda", bussola: "Bússola", corrente: "Corrente", chave: "Chave", farol: "Farol",
};

export function Scene({ id, cor, acento, intensidade = 0.8, size = "100%" }: { id: SceneId; cor: string; acento: string; intensidade?: number; size?: number | string }) {
  const p = { fill: "none", stroke: cor, strokeWidth: 4, strokeLinecap: "square" as const, strokeLinejoin: "miter" as const };
  const a = { ...p, stroke: acento };
  const f = { fill: acento, opacity: 0.9 };
  const body: Record<SceneId, JSX.Element> = {
    balanca: <><path {...p} d="M100 30v130M60 160h80M40 60h120" /><path {...a} d="M40 60l-20 45h40zM160 60l-20 35h40z" /><circle {...f} cx="100" cy="30" r="6" /></>,
    escada: <><path {...p} d="M30 170h35v-30h35v-30h35v-30h35v-30" /><path {...a} d="M150 30l20 20M170 30v20h-20" /></>,
    ponte: <><circle {...f} cx="35" cy="120" r="12" /><circle {...f} cx="165" cy="120" r="12" /><path {...p} d="M35 120Q100 40 165 120M35 120h130" /><path {...a} d="M60 120v-30M100 120v-50M140 120v-30" /></>,
    calendario: <><rect {...p} x="35" y="45" width="130" height="120" /><path {...p} d="M35 75h130M65 35v20M135 35v20" />{[0, 1, 2, 3].map(i => <rect key={i} x={50 + i * 28} y={90} width="16" height="16" fill={i < 3 ? acento : "none"} stroke={acento} strokeWidth="3" />)}<path {...a} d="M50 130h100" /></>,
    relogio: <><circle {...p} cx="100" cy="100" r="65" /><path {...a} d="M100 100V55M100 100l30 20" /><circle {...f} cx="100" cy="100" r="5" /></>,
    funil: <><path {...p} d="M30 40h140l-50 60v50l-40 20v-70z" />{[0, 1, 2].map(i => <circle key={i} {...f} cx={60 + i * 40} cy={25} r="5" />)}<circle {...f} cx="100" cy="185" r="6" /></>,
    labirinto: <><rect {...p} x="30" y="30" width="140" height="140" /><path {...p} d="M30 65h105M65 100h105M30 135h105M65 30v35M135 100v35M100 135v35" /><path {...a} d="M45 45l0 0" /><circle {...f} cx="155" cy="155" r="6" /></>,
    interruptor: <><rect {...p} x="60" y="40" width="80" height="120" /><rect x="78" y="58" width="44" height="44" fill={acento} /><path {...p} d="M80 130h40" /></>,
    engrenagem: <><circle {...p} cx="80" cy="100" r="35" /><circle {...a} cx="80" cy="100" r="10" />{[...Array(8)].map((_, i) => { const t = i * Math.PI / 4; return <path key={i} {...p} d={`M${80 + 35 * Math.cos(t)} ${100 + 35 * Math.sin(t)}L${80 + 50 * Math.cos(t)} ${100 + 50 * Math.sin(t)}`} />; })}<circle {...a} cx="145" cy="60" r="20" /></>,
    setas: <><path {...p} d="M20 80h120l-20-20M140 80l-20 20" /><path {...a} d="M180 130H60l20-20M60 130l20 20" /></>,
    bifurcacao: <><path {...p} d="M100 180V110L50 40M100 110l50-70" /><path {...a} d="M40 40h20v20M160 40h-20v20" /></>,
    bateria: <><rect {...p} x="45" y="60" width="100" height="70" /><path {...p} d="M145 80h12v30h-12" />{[0, 1, 2].map(i => <rect key={i} x={55 + i * 30} y="70" width="22" height="50" fill={i < 2 ? acento : "none"} stroke={acento} strokeWidth="3" />)}</>,
    lupa: <><circle {...p} cx="85" cy="85" r="45" /><path {...a} d="M118 118l50 50" strokeWidth="8" /><path {...a} d="M65 85h40" /></>,
    cadeado: <><rect {...p} x="55" y="90" width="90" height="75" /><path {...a} d="M75 90V65a25 25 0 0 1 50 0v25" /><circle {...f} cx="100" cy="125" r="8" /></>,
    semente: <><path {...p} d="M30 170h140" /><path {...a} d="M100 170V80" /><path {...a} d="M100 120q-35-5-40-35q35 0 40 35M100 95q30-5 35-35q-30 0-35 35" /><circle {...f} cx="100" cy="172" r="7" /></>,
    alvo: <><circle {...p} cx="100" cy="100" r="65" /><circle {...p} cx="100" cy="100" r="40" /><circle {...f} cx="100" cy="100" r="14" /><path {...a} d="M170 30l-60 60M170 30h-20M170 30v20" /></>,
    ampulheta: <><path {...p} d="M55 30h90M55 170h90M65 30q0 50 35 70q-35 20-35 70M135 30q0 50-35 70q35 20 35 70" /><path fill={acento} d="M80 160h40l-20-25z" /></>,
    onda: <><path {...p} d="M10 110q22-40 45 0t45 0t45 0t45 0" /><path {...a} d="M10 140q22-25 45 0t45 0t45 0t45 0" /></>,
    bussola: <><circle {...p} cx="100" cy="100" r="65" /><path fill={acento} d="M100 45l14 55h-28z" /><path {...p} d="M100 155l-14-55h28z" /></>,
    corrente: <>{[0, 1, 2].map(i => <rect key={i} {...(i === 1 ? a : p)} x={25 + i * 50} y={80} width="60" height="36" rx="18" />)}</>,
    chave: <><circle {...p} cx="60" cy="100" r="28" /><path {...a} d="M88 100h85M150 100v22M170 100v15" /></>,
    farol: <><path {...p} d="M85 170l8-110h14l8 110zM70 170h60" /><rect x="88" y="45" width="24" height="15" fill={acento} /><path {...a} d="M112 52l70-25M112 52l70 25" opacity="0.7" /></>,
  };
  return <svg viewBox="0 0 200 200" width={size} height={size} style={{ opacity: Math.max(0.3, Math.min(1, intensidade)) }} aria-hidden>{body[id]}</svg>;
}
