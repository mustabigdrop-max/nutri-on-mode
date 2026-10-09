// Ícones esquemáticos em SVG (linha em duas cores, brilho suave). Sem pessoas, rostos ou corpos.
import { useId } from "react";
import type { Icone } from "@/lib/cardKits";
import { Scene } from "./Scenes";

export const ICONE_NOME: Record<Icone, string> = {
  cerebro: "Cérebro", neuronio: "Neurônio", bateria: "Bateria", lua: "Lua", haltere: "Haltere", folha: "Folha", rim: "Rim", escudo: "Escudo",
  colher: "Colher", balanca: "Balança", calendario: "Calendário", lupa: "Lupa", cadeado: "Cadeado", semente: "Semente", funil: "Funil",
  check: "Check", alerta: "Alerta", relogio: "Relógio", escada: "Escada", bussola: "Bússola", nenhum: "Sem ícone",
};
const NOVOS = new Set(["haltere", "folha", "lua", "rim", "colher", "escudo", "check", "alerta", "neuronio"]);

/** Cérebro oficial do P2 (SVG exato; cores do brand kit). */
export function BrainSVG({ cor, acento, fundo, width }: { cor: string; acento: string; fundo: string; width: number }) {
  const u = useId().replace(/:/g, ""); const g = `glow${u}`, b = `blur${u}`;
  return <svg viewBox="0 0 600 460" width={width} height={width * 460 / 600} xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs><radialGradient id={g} cx="50%" cy="50%" r="55%"><stop offset="0" stopColor={cor} stopOpacity=".28" /><stop offset="1" stopColor={cor} stopOpacity="0" /></radialGradient><filter id={b}><feGaussianBlur stdDeviation="6" /></filter></defs>
    <ellipse cx="300" cy="235" rx="290" ry="215" fill={`url(#${g})`} />
    <path d="M118 262 C84 236 92 178 132 160 C128 120 170 86 212 98 C236 62 296 58 322 92 C356 66 418 78 436 120 C484 124 514 170 498 212 C526 236 520 292 478 308 C474 346 430 372 392 358 C368 388 318 392 296 366 C268 386 226 382 212 352 C170 360 130 326 118 262 Z" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <g fill="none" stroke={cor} strokeOpacity=".55" strokeWidth="3.5" strokeLinecap="round"><path d="M300 96 C288 140 316 160 296 204 C282 240 306 262 296 366" /><path d="M132 160 C170 172 190 150 212 98" /><path d="M150 232 C186 226 214 242 244 226 C270 212 262 190 232 186" /><path d="M498 212 C462 206 440 226 408 214 C380 204 384 176 410 170" /><path d="M214 300 C246 290 262 308 290 300" /><path d="M398 300 C366 292 346 310 318 300" /><path d="M330 130 C360 136 372 160 354 182" /></g>
    <g stroke={acento} strokeOpacity=".8" strokeWidth="3" fill="none"><path d="M232 262 L292 236 L352 268 L412 244" /><path d="M292 236 L300 182 L360 150" /><path d="M352 268 L340 322" /><path d="M232 262 L206 214" /></g>
    <circle cx="232" cy="262" r="13" fill={fundo} stroke={acento} strokeWidth="4" /><circle cx="292" cy="236" r="16" fill={acento} /><circle cx="352" cy="268" r="13" fill={fundo} stroke={acento} strokeWidth="4" /><circle cx="412" cy="244" r="12" fill={fundo} stroke={acento} strokeWidth="4" /><circle cx="300" cy="182" r="11" fill={fundo} stroke={acento} strokeWidth="4" /><circle cx="360" cy="150" r="10" fill={acento} /><circle cx="340" cy="322" r="10" fill={fundo} stroke={acento} strokeWidth="4" /><circle cx="206" cy="214" r="10" fill={fundo} stroke={acento} strokeWidth="4" /><circle cx="292" cy="236" r="30" fill={acento} opacity=".25" filter={`url(#${b})`} />
  </svg>;
}

export function KitIcon({ id, cor, acento, size = 200, fundo = "#05070D" }: { id: Icone | "engrenagem"; cor: string; acento: string; size?: number; fundo?: string }) {
  if (id === "nenhum" || id === "engrenagem") return null;
  if (id === "cerebro") return <BrainSVG cor={cor} acento={acento} fundo={fundo} width={size} />;
  if (!NOVOS.has(id)) return <Scene id={id as any} cor={cor} acento={acento} intensidade={0.95} size={size} />;
  const p = { fill: "none", stroke: cor, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const a = { ...p, stroke: acento };
  const body: Record<string, JSX.Element> = {
    haltere: <><path {...p} d="M60 100h80" /><rect {...a} x="30" y="70" width="16" height="60" /><rect {...a} x="46" y="80" width="14" height="40" /><rect {...a} x="154" y="70" width="16" height="60" /><rect {...a} x="140" y="80" width="14" height="40" /></>,
    folha: <><path {...p} d="M50 160C40 90 90 40 160 40c0 70-40 120-110 120z" /><path {...a} d="M50 160L130 70M90 120h-20M110 98V78" /></>,
    lua: <><path {...p} d="M130 40a65 65 0 1 0 30 110a55 55 0 1 1-30-110z" /><path {...a} d="M150 50l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" /></>,
    neuronio: <><circle {...p} cx="100" cy="100" r="26" /><path {...p} d="M100 74V30M74 100H30M120 118l40 40M120 82l35-35M82 120l-35 35" /><circle cx="100" cy="30" r="7" fill={acento} /><circle cx="30" cy="100" r="7" fill={acento} /><circle cx="160" cy="158" r="7" fill={acento} /><circle cx="155" cy="47" r="7" fill={acento} /><circle cx="47" cy="155" r="7" fill={acento} /><circle cx="100" cy="100" r="8" fill={acento} /></>,
    rim: <><path {...p} d="M120 40c-45-10-80 25-80 65s30 65 70 55c20-5 15-30 0-40-10-7-10-23 0-30 20-10 30-45 10-50z" /><path {...a} d="M110 100h40M150 100v50" /></>,
    colher: <><ellipse {...p} cx="80" cy="70" rx="30" ry="40" transform="rotate(-35 80 70)" /><path {...a} d="M100 95l60 65" strokeWidth={8} /></>,
    escudo: <><path {...p} d="M100 30l60 22v45c0 40-28 62-60 75-32-13-60-35-60-75V52z" /><path {...a} d="M75 100l18 18 35-38" /></>,
    check: <><circle {...p} cx="100" cy="100" r="65" /><path {...a} d="M70 102l22 22 40-45" strokeWidth={7} /></>,
    alerta: <><path {...p} d="M100 35l70 125H30z" /><path {...a} d="M100 80v40" strokeWidth={7} /><circle cx="100" cy="138" r="5" fill={acento} /></>,
  };
  return <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden style={{ filter: `drop-shadow(0 0 10px ${cor}66)` }}>{body[id]}</svg>;
}
