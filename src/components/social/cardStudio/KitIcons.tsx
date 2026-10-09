// Ícones esquemáticos em SVG (linha em duas cores, brilho suave). Sem pessoas, rostos ou corpos.
import type { Icone } from "@/lib/cardKits";
import { Scene } from "./Scenes";

export const ICONE_NOME: Record<Icone, string> = {
  haltere: "Haltere", bateria: "Bateria", folha: "Folha", lua: "Lua", cerebro: "Cérebro", rim: "Rim", colher: "Colher", escudo: "Escudo",
  balanca: "Balança", calendario: "Calendário", relogio: "Relógio", funil: "Funil", lupa: "Lupa", cadeado: "Cadeado", semente: "Semente",
  escada: "Escada", ponte: "Ponte", interruptor: "Interruptor", engrenagem: "Engrenagem", bussola: "Bússola", check: "Check", alerta: "Alerta",
};
const NOVOS = new Set(["haltere", "folha", "lua", "cerebro", "rim", "colher", "escudo", "check", "alerta"]);

export function KitIcon({ id, cor, acento, size = 200 }: { id: Icone; cor: string; acento: string; size?: number }) {
  if (!NOVOS.has(id)) return <Scene id={id as any} cor={cor} acento={acento} intensidade={0.95} size={size} />;
  const p = { fill: "none", stroke: cor, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const a = { ...p, stroke: acento };
  const body: Record<string, JSX.Element> = {
    haltere: <><path {...p} d="M60 100h80" /><rect {...a} x="30" y="70" width="16" height="60" /><rect {...a} x="46" y="80" width="14" height="40" /><rect {...a} x="154" y="70" width="16" height="60" /><rect {...a} x="140" y="80" width="14" height="40" /></>,
    folha: <><path {...p} d="M50 160C40 90 90 40 160 40c0 70-40 120-110 120z" /><path {...a} d="M50 160L130 70M90 120h-20M110 98V78" /></>,
    lua: <><path {...p} d="M130 40a65 65 0 1 0 30 110a55 55 0 1 1-30-110z" /><path {...a} d="M150 50l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" /></>,
    cerebro: <><path {...p} d="M100 45c-20-15-55-5-55 25-15 10-15 40 5 50 0 25 30 35 50 20 20 15 50 5 50-20 20-10 20-40 5-50 0-30-35-40-55-25z" /><path {...a} d="M100 45v110M75 75c10 5 15 15 10 25M125 75c-10 5-15 15-10 25M70 125c10-5 20-5 25 5M130 125c-10-5-20-5-25 5" /></>,
    rim: <><path {...p} d="M120 40c-45-10-80 25-80 65s30 65 70 55c20-5 15-30 0-40-10-7-10-23 0-30 20-10 30-45 10-50z" /><path {...a} d="M110 100h40M150 100v50" /></>,
    colher: <><ellipse {...p} cx="80" cy="70" rx="30" ry="40" transform="rotate(-35 80 70)" /><path {...a} d="M100 95l60 65" strokeWidth={8} /></>,
    escudo: <><path {...p} d="M100 30l60 22v45c0 40-28 62-60 75-32-13-60-35-60-75V52z" /><path {...a} d="M75 100l18 18 35-38" /></>,
    check: <><circle {...p} cx="100" cy="100" r="65" /><path {...a} d="M70 102l22 22 40-45" strokeWidth={7} /></>,
    alerta: <><path {...p} d="M100 35l70 125H30z" /><path {...a} d="M100 80v40" strokeWidth={7} /><circle cx="100" cy="138" r="5" fill={acento} /></>,
  };
  return <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden style={{ filter: `drop-shadow(0 0 10px ${cor}66)` }}>{body[id]}</svg>;
}
