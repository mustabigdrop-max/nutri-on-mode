// Academia GRAVITAS: medidas de fala, XP, níveis e radar — tudo em código, sem modelo.
export type FonteNivel = "verificada" | "classica" | "tecnica_de_producao";
export const FONTE_SELO: Record<FonteNivel, { label: string; color: string; aviso?: string }> = {
  verificada: { label: "Fonte verificada", color: "#5DCAA5" },
  classica: { label: "Tradição retórica", color: "#AFA9EC" },
  tecnica_de_producao: { label: "Técnica de produção", color: "#EF9F27", aviso: "Teste com os seus dados na Calibração" },
};
export const TRILHAS = ["Retórica clássica", "Persuasão com ciência", "Atenção e retenção", "Oratória na câmera"];

export const NIVEIS = [{ nome: "Ouvinte", min: 0 }, { nome: "Orador", min: 100 }, { nome: "Retor", min: 300 }, { nome: "Mestre", min: 600 }];
export function calcXp(aulasConcluidas: number, notasLab: number[]) {
  return aulasConcluidas * 10 + notasLab.filter(n => n >= 70).length * 5;
}
export function nivelDe(xp: number) {
  let i = 0; NIVEIS.forEach((n, k) => { if (xp >= n.min) i = k; });
  const prox = NIVEIS[i + 1];
  return { nome: NIVEIS[i].nome, prox: prox?.nome ?? null, faltam: prox ? prox.min - xp : 0 };
}

export const EIXOS = ["gancho", "figuras", "prova", "ritmo", "voz", "cta"] as const;
export type Eixo = typeof EIXOS[number];
export const EIXO_LABEL: Record<Eixo, string> = { gancho: "Gancho", figuras: "Figuras", prova: "Prova", ritmo: "Ritmo", voz: "Voz", cta: "CTA" };
export const RADAR_EXEMPLO: Record<Eixo, number> = { gancho: 62, figuras: 48, prova: 55, ritmo: 70, voz: 40, cta: 58 };
/** Cada eixo = média das últimas 10 tentativas que mediram aquele eixo. null = sem tentativas. */
export function radarDominio(attempts: { created_at: string; resultado: any }[]): Record<Eixo, number> | null {
  const ord = [...attempts].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const out = {} as Record<Eixo, number>; let algum = false;
  for (const e of EIXOS) {
    const v = ord.map(a => a.resultado?.eixos?.[e]).filter((x): x is number => typeof x === "number").slice(0, 10);
    out[e] = v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : 0;
    if (v.length) algum = true;
  }
  return algum ? out : null;
}

export const MULETAS_PADRAO = ["né", "tipo", "então", "aí", "assim", "basicamente", "entendeu", "sabe", "meio que"];
const SAUDACAO = /^\s*(oi|ol[áa]|fala,? (pessoal|galera)|e a[íi],? (pessoal|galera)|bom dia|boa (tarde|noite)|tudo bem)\b/i;
const norm = (s: string) => s.toLowerCase().normalize("NFC");
export const palavras = (s: string) => s.trim().split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));
export const frases = (s: string) => s.split(/(?<=[.!?…])\s+|\n+/).map(f => f.trim()).filter(f => palavras(f).length);

export type Marca = { t: number; palavras: number }; // palavras ditas até o segundo t (ditado)
export type MedidasFala = {
  total_palavras: number; duracao_seg: number | null; pps: number | null;
  trechos: { ini: number; fim: number; pps: number }[];
  frases_longas: string[]; abertura_palavras: number; abertura_longa: boolean; saudacao: boolean;
  muletas: { termo: string; n: number }[]; muletas_por_100: number;
  pausas_estimadas: number | null;
};
export function contarMuleta(texto: string, termo: string) {
  const esc = termo.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  if (!esc) return 0;
  return (norm(texto).match(new RegExp(`(?<![\\p{L}])${norm(esc)}(?![\\p{L}])`, "gu")) ?? []).length;
}
export function medirFala(texto: string, opts: { duracao_seg?: number | null; marcas?: Marca[]; muletas?: string[] } = {}): MedidasFala {
  const ws = palavras(texto); const total = ws.length;
  const dur = opts.duracao_seg && opts.duracao_seg > 0 ? opts.duracao_seg : null;
  const fs = frases(texto);
  const abertura = fs[0] ? palavras(fs[0]).length : 0;
  const muletas = (opts.muletas ?? MULETAS_PADRAO).map(t => ({ termo: t, n: contarMuleta(texto, t) })).filter(m => m.n > 0).sort((a, b) => b.n - a.n);
  const nm = muletas.reduce((s, m) => s + m.n, 0);
  const trechos: MedidasFala["trechos"] = [];
  if (dur) {
    const marcas = opts.marcas?.length ? [...opts.marcas].sort((a, b) => a.t - b.t) : null;
    const até = (t: number) => {
      if (!marcas) return (total * Math.min(t, dur)) / dur; // sem marcas: distribuição uniforme
      let w = 0; for (const m of marcas) if (m.t <= t) w = m.palavras; return w;
    };
    for (let ini = 0; ini < dur; ini += 5) {
      const fim = Math.min(ini + 5, dur);
      trechos.push({ ini, fim, pps: +((até(fim) - até(ini)) / (fim - ini)).toFixed(2) });
    }
  }
  let pausas: number | null = null;
  if (opts.marcas && opts.marcas.length > 1) {
    const m = [...opts.marcas].sort((a, b) => a.t - b.t); pausas = 0;
    for (let i = 1; i < m.length; i++) if (m[i].t - m[i - 1].t >= 1.2) pausas++;
  }
  return {
    total_palavras: total, duracao_seg: dur, pps: dur ? +(total / dur).toFixed(2) : null, trechos,
    frases_longas: fs.filter(f => palavras(f).length > 14), abertura_palavras: abertura, abertura_longa: abertura > 12,
    saudacao: SAUDACAO.test(texto), muletas, muletas_por_100: total ? +((nm * 100) / total).toFixed(1) : 0, pausas_estimadas: pausas,
  };
}
/** Nota objetiva 0–100 a partir das medidas (regras do GRAVITAS). */
export function notaObjetiva(m: MedidasFala) {
  let n = 100;
  if (m.saudacao) n -= 25;
  if (m.abertura_longa) n -= 15;
  n -= Math.min(30, m.frases_longas.length * 6);
  n -= Math.min(20, Math.round(m.muletas_por_100 * 4));
  if (m.pps != null && (m.pps < 2 || m.pps > 3.3)) n -= 10;
  return Math.max(0, Math.min(100, n));
}
export function ritmoEixo(m: MedidasFala): number | null {
  if (m.pps == null) return null;
  const d = m.pps < 2.5 ? 2.5 - m.pps : m.pps > 3 ? m.pps - 3 : 0;
  return Math.max(0, Math.round(100 - d * 80));
}

export const TREINOS_60S = [
  { lab: "figuras", figura: "antítese", texto: "Reescreva esta abertura com antítese: \"Você precisa comer melhor para emagrecer.\"" },
  { lab: "gancho", texto: "Reescreva esta abertura sem saudação e em até 12 palavras: \"Oi, gente, hoje eu vou falar sobre proteína.\"" },
  { lab: "figuras", figura: "regra de três", texto: "Escreva uma frase com regra de três sobre rotina de treino." },
  { lab: "figuras", figura: "prolepse", texto: "Responda antes a objeção \"não tenho tempo\" em uma frase." },
  { lab: "gancho", texto: "Transforme \"dicas de sono\" em uma abertura com lacuna específica." },
  { lab: "figuras", figura: "pergunta retórica", texto: "Escreva uma pergunta retórica sobre beliscar à noite e responda na frase seguinte." },
  { lab: "fala", texto: "Fale por 20 segundos sobre seu café da manhã sem usar \"né\" nem \"tipo\"." },
] as const;
export const treinoDoDia = (d = new Date()) => {
  const k = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  return TREINOS_60S[k % TREINOS_60S.length];
};
