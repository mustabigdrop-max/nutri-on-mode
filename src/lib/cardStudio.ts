// Estúdio de Cards — regras do Agente de Cards, em código (sem modelo). O texto do card é sempre desenhado por código.
export type CardTipo = "A" | "B" | "D" | "C";
export type Formato = "9:16" | "4:5" | "1:1";
export type TemplateId = "mito_verdade" | "numero" | "comparacao" | "passos" | "pergunta" | "lista3" | "timeline" | "capa_serie";
export type SceneId = "balanca" | "escada" | "ponte" | "calendario" | "relogio" | "funil" | "labirinto" | "interruptor" | "engrenagem" | "setas"
  | "bifurcacao" | "bateria" | "lupa" | "cadeado" | "semente" | "alvo" | "ampulheta" | "onda" | "bussola" | "corrente" | "chave" | "farol";

export const FORMATOS: Record<Formato, { w: number; h: number }> = { "9:16": { w: 1080, h: 1920 }, "4:5": { w: 1080, h: 1350 }, "1:1": { w: 1080, h: 1080 } };

export const TEMPLATES: { id: TemplateId; nome: string; tipo: CardTipo }[] = [
  { id: "mito_verdade", nome: "Mito x Verdade", tipo: "B" },
  { id: "numero", nome: "Número gigante", tipo: "A" },
  { id: "comparacao", nome: "Comparação", tipo: "D" },
  { id: "passos", nome: "Passo a passo", tipo: "D" },
  { id: "pergunta", nome: "Pergunta", tipo: "B" },
  { id: "lista3", nome: "Lista de 3", tipo: "D" },
  { id: "timeline", nome: "Linha do tempo", tipo: "D" },
  { id: "capa_serie", nome: "Capa de série", tipo: "B" },
];
export const tipoDoTemplate = (t: TemplateId): CardTipo => TEMPLATES.find(x => x.id === t)!.tipo;

export interface CardContent {
  titulo: string;          // texto principal (máx 12 palavras)
  apoio?: string;          // linha secundária
  itens?: string[];        // passos / lista / marcos / colunas
  esquerda?: string; direita?: string; // mito/verdade, comparação
  numero?: string; rotulo?: string; fonte?: string; // card A
  parte?: number;          // capa de série
  cena: SceneId | null;    // ilustração em código
  intensidade?: number;    // 0.3–1
}
export interface Proposal { template: TemplateId; conteudo: CardContent }

export const MAX_PALAVRAS = 12;
export const palavras = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
export const limitarPalavras = (s: string, n = MAX_PALAVRAS) => s.trim().split(/\s+/).filter(Boolean).slice(0, n).join(" ");

// ---------- bloqueios absolutos (iguais nos dois modos) ----------
const BLOCKED: [RegExp, string, string][] = [
  [/\b(pessoa|homem|mulher|atleta|modelo|rosto|retrato|selfie|garot[oa]|crian[cç]a|humano|face|olhos)\b/i, "pessoa ou rosto", "uma silhueta abstrata de setas e caminhos"],
  [/\b(f[ií]sico|corpo|abd[oô]men|tanquinho|shape|silhueta|barriga|m[uú]sculo)\b/i, "corpo ou físico como resultado", "uma escada ou semente que cresce"],
  [/antes\s*(e|x|\/)\s*depois|before\s*(and|\/)\s*after|transforma[cç][aã]o corporal/i, "antes e depois", "setas de contraste entre dois estados"],
  [/\b(logo|logotipo|marca de|nike|adidas|coca|mcdonald|disney|marvel|pok[eé]mon|personagem|celebridade|famos[oa])\b/i, "marca, logo ou personagem de terceiros", "uma cena conceitual própria (engrenagem, farol, chave)"],
  [/\b(embalagem|r[oó]tulo|pote|frasco|whey|c[aá]psula)\b/i, "embalagem com alegação", "uma balança ou lupa"],
  [/\b(raio-?x|tomografia|resson[aâ]ncia|cirurgia|ferida|[oó]rg[aã]o real|tumor|sangue)\b/i, "imagem médica realista", "um diagrama abstrato de engrenagens"],
];
export function bloqueio(texto: string): { motivo: string; alternativa: string } | null {
  for (const [re, motivo, alternativa] of BLOCKED) if (re.test(texto)) return { motivo, alternativa };
  return null;
}
export const recusaBloqueio = (b: { motivo: string; alternativa: string }) => `Não faço card com ${b.motivo}. Posso fazer com ${b.alternativa}.`;

// ---------- regra de dado ----------
export const RECUSA_DADO = "Sem fonte verificada, não gero card de dado. Posso fazer um card conceitual.";
export const temNumero = (s: string) => /\d|por\s*cento|percent|estudo|pesquisa/i.test(s);
export interface FonteCtx { fonte_status?: string | null; tipo_afirmacao?: string | null; referencia?: string | null }
export function podeCardDado(ctx: FonteCtx | null): boolean {
  return !!ctx && (ctx.fonte_status === "verificada" || ctx.fonte_status === "parcial") && ctx.tipo_afirmacao === "achado_cientifico" && !!ctx.referencia?.trim();
}

// ---------- escolha de cena pelo significado ----------
const SCENE_KEYS: [SceneId, RegExp][] = [
  ["balanca", /equil[ií]br|balan|pesar|compara|versus|\bvs\b|\bx\b/i],
  ["ponte", /inten[cç][aã]o|a[cç][aã]o|ligar|conect|entre|ponte|gap|dist[aâ]ncia/i],
  ["escada", /passo|etapa|subir|progress|evolu|n[ií]vel/i],
  ["calendario", /dia|semana|m[eê]s|rotina|h[aá]bito|consist/i],
  ["relogio", /hora|tempo|janela|cedo|tarde|noite|jejum/i],
  ["funil", /filtr|funil|reduz|foco|priori/i],
  ["labirinto", /confus|perdid|complica|labirinto|d[uú]vida/i],
  ["interruptor", /se[- ]ent[aã]o|gatilho|ligar|desligar|decis|escolha/i],
  ["engrenagem", /mecanismo|processo|sistema|funciona|metabol/i],
  ["setas", /mito|verdade|contraste|oposto|errado|certo/i],
  ["bifurcacao", /caminho|op[cç][aã]o|ou\b|escolher|decid/i],
  ["bateria", /energia|cansa|fadiga|disposi|recupera/i],
  ["lupa", /detalhe|olhar|investig|r[oó]tulo|ler|pergunta/i],
  ["cadeado", /trava|bloque|seguran|proteg|limite/i],
  ["semente", /come[cç]|crescer|plantar|resultado|longo prazo/i],
  ["alvo", /meta|objetivo|alvo|mirar|precis/i],
  ["ampulheta", /paci[eê]ncia|esperar|demora|prazo/i],
  ["onda", /fome|vontade|impulso|ansiedade|emo[cç]/i],
  ["bussola", /dire[cç]|rumo|norte|orienta/i],
  ["corrente", /depend|ciclo|v[ií]cio|corrente|repeti/i],
  ["chave", /segredo|solu[cç]|resposta|chave|abrir/i],
  ["farol", /alerta|aten[cç][aã]o|sinal|aviso|s[eé]rie|capa/i],
];
export const ALL_SCENES: SceneId[] = SCENE_KEYS.map(([s]) => s);
export function escolherCenas(texto: string, n = 3): SceneId[] {
  const hits = SCENE_KEYS.filter(([, re]) => re.test(texto)).map(([s]) => s);
  const out = [...new Set([...hits, "engrenagem", "farol", "semente"] as SceneId[])];
  return out.slice(0, n);
}

// ---------- agente ----------
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function tema(cmd: string) {
  return cmd.replace(/^\s*(fa[cç]a|crie|gere|gerar|quero|me d[aá])?\s*(um|uma|o|a)?\s*(card|cards|capa)?\s*(sobre|de|do|da|com)?\s*/i, "").trim();
}

export type AgentReply = { tipo: "propostas"; propostas: Proposal[] } | { tipo: "recusa"; mensagem: string; alternativa?: Proposal[] };

export function agenteCards(cmd: string, fonte: FonteCtx | null = null): AgentReply {
  const raw = cmd.trim();
  if (raw.length < 3) return { tipo: "recusa", mensagem: "Descreva o card em poucas palavras." };
  const b = bloqueio(raw);
  if (b) return { tipo: "recusa", mensagem: recusaBloqueio(b) };
  const t = tema(raw) || raw;
  const cenas = escolherCenas(t, 3);
  const titulo = limitarPalavras(cap(t));

  // pedido com número/estudo → card A só com fonte verificada
  if (/\d|percent|por\s*cento|estudo|pesquisa/i.test(raw)) {
    if (!podeCardDado(fonte)) {
      return { tipo: "recusa", mensagem: RECUSA_DADO, alternativa: [
        { template: "pergunta", conteudo: { titulo: limitarPalavras(cap(t.replace(/\d+[.,]?\d*\s*%?/g, "").trim()) || titulo), apoio: "", cena: cenas[0] } },
      ] };
    }
    const m = raw.match(/\d+[.,]?\d*\s*%?/);
    return { tipo: "propostas", propostas: [0, 1, 2].map(i => ({ template: "numero" as TemplateId, conteudo: {
      titulo, numero: m?.[0].replace(/\s+/g, "") ?? "", rotulo: limitarPalavras(t.replace(m?.[0] ?? "", "").trim(), 8), fonte: fonte!.referencia!, cena: cenas[i] ?? null } })) };
  }

  const serie = raw.match(/s[eé]rie\s+(de|do|da|dos|das)?\s*([^,.]+)/i);
  if (/capa/i.test(raw) || serie) {
    const nome = limitarPalavras(cap((serie?.[2] ?? t).replace(/^capa\s*(da|de)?\s*s[eé]rie\s*(de|do|da)?\s*/i, "")), 6);
    const parte = Number(raw.match(/parte\s*(\d+)/i)?.[1] ?? 1);
    return { tipo: "propostas", propostas: [
      { template: "capa_serie", conteudo: { titulo: nome, parte, cena: "farol" } },
      { template: "capa_serie", conteudo: { titulo: nome, parte, cena: cenas[0] === "farol" ? "setas" : cenas[0] } },
      { template: "pergunta", conteudo: { titulo: limitarPalavras(`${nome}: o que é verdade?`), cena: "lupa" } },
    ] };
  }

  const vs = t.split(/\s+(?:versus|vs\.?|x|contra|ou)\s+/i);
  if (vs.length === 2) {
    const [a, c] = vs.map(s => limitarPalavras(cap(s.trim()), 5));
    return { tipo: "propostas", propostas: [
      { template: "comparacao", conteudo: { titulo: `${a} x ${c}`, esquerda: a, direita: c, itens: [], cena: cenas[0] } },
      { template: "mito_verdade", conteudo: { titulo: `${a} não é ${c}`, esquerda: a, direita: c, cena: cenas[1] ?? "setas" } },
      { template: "pergunta", conteudo: { titulo: limitarPalavras(`${a} ou ${c}: qual decide?`), cena: cenas[2] ?? "ponte" } },
    ] };
  }

  const nPassos = Number(raw.match(/(\d)\s*passos?/i)?.[1] ?? 0);
  if (nPassos || /passo|etapa/i.test(raw)) {
    const n = Math.min(5, Math.max(3, nPassos || 3));
    const itens = Array.from({ length: n }, (_, i) => `Passo ${i + 1}`);
    const tt = limitarPalavras(cap(t.replace(/^\d\s*passos?\s*(do|da|de)?\s*/i, "")));
    return { tipo: "propostas", propostas: [
      { template: "passos", conteudo: { titulo: tt, itens, cena: "escada" } },
      { template: "timeline", conteudo: { titulo: tt, itens, cena: "calendario" } },
      { template: "lista3", conteudo: { titulo: tt, itens: itens.slice(0, 3), cena: cenas[0] } },
    ] };
  }

  return { tipo: "propostas", propostas: [
    { template: "pergunta", conteudo: { titulo: limitarPalavras(`${titulo}?`.replace(/\?\?$/, "?")), cena: cenas[0] } },
    { template: "mito_verdade", conteudo: { titulo, esquerda: "O que dizem", direita: titulo, cena: cenas[1] } },
    { template: "lista3", conteudo: { titulo, itens: ["Ponto 1", "Ponto 2", "Ponto 3"], cena: cenas[2] } },
  ] };
}

// ---------- cards de um reel ----------
const s = (v: any): string => typeof v === "string" ? v : v == null ? "" : typeof v === "object" ? String(v.texto ?? v.text ?? "") : String(v);
export interface ReelCtx { tema: string; titulo?: string | null; fonte_status?: string | null; tipo_afirmacao?: string | null; referencia?: string | null; palavraChave?: string | null }
export interface ReelCard extends Proposal { bloco_ref: number | null; tipo: CardTipo; nome: string }

export function cardsDoReel(blocos: any[], ctx: ReelCtx): ReelCard[] {
  const out: ReelCard[] = [];
  const titulo = limitarPalavras(ctx.titulo || ctx.tema, 8);
  out.push({ bloco_ref: null, tipo: "B", nome: "capa", template: "capa_serie", conteudo: { titulo, parte: 1, cena: escolherCenas(titulo, 1)[0] } });
  blocos.forEach((b, i) => {
    const funcao = s(b?.funcao).toLowerCase();
    if (/cta/.test(funcao)) return;
    const texto = (s(b?.texto_tela) || s(b?.fala)).trim();
    if (!texto) return;
    const ref = Number(b?.id ?? i + 1) || i + 1;
    const cena = escolherCenas(texto, 1)[0];
    if (temNumero(texto) && podeCardDado(ctx)) {
      const m = texto.match(/\d+[.,]?\d*\s*%?/);
      out.push({ bloco_ref: ref, tipo: "A", nome: `bloco_${ref}`, template: "numero", conteudo: { titulo: limitarPalavras(texto), numero: m?.[0].replace(/\s+/g, "") ?? "", rotulo: limitarPalavras(texto.replace(m?.[0] ?? "", ""), 8), fonte: ctx.referencia!, cena: null } });
    } else if (/(passo|etapa|primeiro|segundo|→|->|lista)/i.test(texto)) {
      const itens = texto.split(/[,;→]|->/).map(x => limitarPalavras(x.trim(), 5)).filter(Boolean).slice(0, 5);
      out.push({ bloco_ref: ref, tipo: "D", nome: `bloco_${ref}`, template: itens.length >= 3 ? "passos" : "lista3", conteudo: { titulo: limitarPalavras(texto, 6), itens: itens.length >= 3 ? itens : [...itens, "", ""].slice(0, 3), cena } });
    } else {
      // número sem fonte vira card conceitual — nunca dado
      out.push({ bloco_ref: ref, tipo: "B", nome: `bloco_${ref}`, template: "pergunta", conteudo: { titulo: limitarPalavras(texto), cena } });
    }
  });
  const kw = (ctx.palavraChave || "").trim().toUpperCase();
  out.push({ bloco_ref: null, tipo: "B", nome: "cta", template: "pergunta", conteudo: { titulo: kw ? `Comenta ${kw}` : "Comenta a palavra-chave", apoio: kw ? "e eu te mando" : "", cena: "chave" } });
  return out;
}

export function palavraChaveDoCta(blocos: any[], legenda?: string): string | null {
  const txt = [...blocos.map(b => `${s(b?.fala)} ${s(b?.texto_tela)}`), legenda ?? ""].join(" ");
  const m = txt.match(/comenta\s+["“']?([A-ZÁÉÍÓÚÂÊÔÃÕÇ]{3,})["”']?/);
  return m?.[1] ?? null;
}

// ---------- contraste AA ----------
function lum(hex: string) {
  const h = hex.replace("#", ""); const n = h.length === 3 ? h.split("").map(c => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contraste(a: string, b: string) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
/** Cor de texto que garante AA (4.5) sobre o fundo; senão cai para claro/escuro. */
export function corTextoAA(fundo: string, desejada: string) {
  if (contraste(fundo, desejada) >= 4.5) return desejada;
  return contraste(fundo, "#F5F0E8") >= contraste(fundo, "#0A0A0A") ? "#F5F0E8" : "#0A0A0A";
}
export const temIAouAI = (s: string) => /\b(IA|AI)\b/.test(s);
