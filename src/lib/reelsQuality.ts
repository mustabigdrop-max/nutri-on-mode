// Reels Studio V2 — checklist de qualidade antes de finalizar o Reel

import type { ReelExportData } from "./reelsExport";

export type QualityStatus = "ok" | "warn" | "fail";

export type QualityCheck = {
  id: string;
  label: string;
  status: QualityStatus;
  detail: string;
  suggestion?: string;
};

const WEAK_OPENERS = ["olá", "oi gente", "fala galera", "bom dia", "hoje eu vou falar", "nesse vídeo"];
const CTA_VERBS = ["comenta", "salva", "compartilha", "clica", "link", "manda", "chama", "assina", "entra", "segue", "baixa", "responde"];
const OFF_TONE = ["talvez", "acho que", "meio que", "não sei se", "quem sabe"];

function parseSeconds(text?: string): number | null {
  if (!text) return null;
  const m = text.match(/(\d{1,3})\s*(s|seg|segundos)/i);
  if (m) return Number(m[1]);
  const mm = text.match(/(\d{1,2}):(\d{2})/);
  if (mm) return Number(mm[1]) * 60 + Number(mm[2]);
  const n = text.match(/\d{1,3}/);
  return n ? Number(n[0]) : null;
}

export function runQualityChecklist(result: ReelExportData): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const hook = (result.hook || "").trim();
  const r = result.roteiro || {};
  const cta = (r.cta_28_35s || "").trim();
  const caption = result.legendas?.[0]?.texto || "";

  // 1. Hook
  const hookWords = hook.split(/\s+/).filter(Boolean).length;
  const weak = WEAK_OPENERS.some((w) => hook.toLowerCase().startsWith(w));
  checks.push(
    !hook
      ? { id: "hook", label: "Hook nos 2 primeiros segundos", status: "fail", detail: "Nenhum hook definido.", suggestion: "Gere de novo ou escreva um hook com tensão: afirmação polêmica, número ou pergunta direta." }
      : weak
        ? { id: "hook", label: "Hook nos 2 primeiros segundos", status: "warn", detail: `Começa com abertura fraca ("${hook.split(" ").slice(0, 3).join(" ")}...").`, suggestion: "Corte a saudação. Comece direto pela tensão: \"Você não precisa de motivação. Precisa de sistema.\"" }
        : hookWords > 16
          ? { id: "hook", label: "Hook nos 2 primeiros segundos", status: "warn", detail: `Hook com ${hookWords} palavras — longo demais para 2s.`, suggestion: "Reduza para no máximo 12 palavras. Uma frase, um golpe." }
          : { id: "hook", label: "Hook nos 2 primeiros segundos", status: "ok", detail: `${hookWords} palavras, abertura direta.` },
  );

  // 2. Duração
  const secs = parseSeconds(r.duracao_total);
  checks.push(
    secs == null
      ? { id: "duracao", label: "Duração ideal (20–45s)", status: "warn", detail: "Duração não definida no roteiro.", suggestion: "Defina a duração alvo. Reels de 25–35s costumam reter melhor." }
      : secs < 15
        ? { id: "duracao", label: "Duração ideal (20–45s)", status: "warn", detail: `${secs}s — curto demais para entregar valor.`, suggestion: "Adicione 1 exemplo prático no corpo e leve para 25–30s." }
        : secs > 60
          ? { id: "duracao", label: "Duração ideal (20–45s)", status: "warn", detail: `${secs}s — longo, a retenção cai.`, suggestion: "Corte o corpo pela metade e mantenha só o argumento mais forte." }
          : { id: "duracao", label: "Duração ideal (20–45s)", status: "ok", detail: `${secs}s dentro da faixa de retenção.` },
  );

  // 3. Clareza do CTA
  const hasVerb = CTA_VERBS.some((v) => cta.toLowerCase().includes(v));
  checks.push(
    !cta
      ? { id: "cta", label: "CTA claro e único", status: "fail", detail: "Sem CTA no fechamento.", suggestion: "Feche com uma ação única: \"Comenta SISTEMA que eu te mando o protocolo.\"" }
      : !hasVerb
        ? { id: "cta", label: "CTA claro e único", status: "warn", detail: "O CTA não pede uma ação concreta.", suggestion: "Use um verbo de ação (comenta, salva, clica no link da bio) e apenas um pedido." }
        : cta.split(/[.!?]/).filter((s) => CTA_VERBS.some((v) => s.toLowerCase().includes(v))).length > 1
          ? { id: "cta", label: "CTA claro e único", status: "warn", detail: "Mais de um pedido no CTA.", suggestion: "Escolha uma ação só. Dois pedidos dividem a audiência e derrubam a conversão." }
          : { id: "cta", label: "CTA claro e único", status: "ok", detail: "Ação única e explícita." },
  );

  // 4. Consistência de tom
  const blob = `${hook} ${r.corpo_2_20s || ""} ${caption}`.toLowerCase();
  const hedges = OFF_TONE.filter((w) => blob.includes(w));
  checks.push(
    hedges.length
      ? { id: "tom", label: "Consistência de tom (direto, sem rodeio)", status: "warn", detail: `Expressões que enfraquecem: ${hedges.join(", ")}.`, suggestion: "Troque por afirmações diretas. O tom do Diogo é assertivo: afirma, não sugere." }
      : { id: "tom", label: "Consistência de tom (direto, sem rodeio)", status: "ok", detail: "Tom direto e assertivo mantido." },
  );

  // 5. Legenda e hashtags
  const tags = result.hashtags?.length || 0;
  checks.push(
    !caption
      ? { id: "legenda", label: "Legenda + hashtags", status: "fail", detail: "Sem legenda gerada.", suggestion: "Gere a legenda antes de publicar — ela sustenta o alcance depois das primeiras horas." }
      : tags < 5
        ? { id: "legenda", label: "Legenda + hashtags", status: "warn", detail: `Só ${tags} hashtags.`, suggestion: "Use de 8 a 15 hashtags misturando nicho amplo e nicho específico." }
        : { id: "legenda", label: "Legenda + hashtags", status: "ok", detail: `Legenda pronta com ${tags} hashtags.` },
  );

  // 6. Stories de apoio
  const st = result.stories?.length || 0;
  checks.push(
    st < 3
      ? { id: "stories", label: "3 Stories de apoio", status: "warn", detail: `${st} de 3 Stories.`, suggestion: "Gere as 3 telas (chamada, valor, CTA) na aba Stories e publique junto com o Reel." }
      : { id: "stories", label: "3 Stories de apoio", status: "ok", detail: "3 telas prontas para publicar junto." },
  );

  return checks;
}

export function qualityScore(checks: QualityCheck[]): number {
  if (!checks.length) return 0;
  const pts = checks.reduce((a, c) => a + (c.status === "ok" ? 1 : c.status === "warn" ? 0.5 : 0), 0);
  return Math.round((pts / checks.length) * 100);
}
