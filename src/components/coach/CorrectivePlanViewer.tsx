import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Flame, Zap, TrendingUp, Link2, FileText, Copy, Check } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// ─── Parsing helpers ────────────────────────────────────────────
function section(text: string, header: string, nextHeaders: string[] = []): string {
  const re = new RegExp(`##\\s*${header}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*(?:${nextHeaders.join("|")})\\s*\\n|$)`, "i");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

export interface ParsedExercise {
  EXERCICIO?: string;
  VARIACAO?: string;
  GRUPO?: string;
  SERIES?: string;
  VOLUME_AJUSTE?: string;
  RPE?: string;
  CUE?: string;
  FOCO_CORRETIVO?: string;
  raw: string;
}

function parseExercises(block: string): ParsedExercise[] {
  if (!block) return [];
  // Split into exercise chunks: each starts with EXERCICIO:
  const parts = block.split(/(?=^\s*EXERCICIO\s*:)/im).map((p) => p.trim()).filter(Boolean);
  return parts.map((raw) => {
    const ex: ParsedExercise = { raw };
    raw.split(/\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z_]+)\s*:\s*(.+)$/);
      if (m) (ex as any)[m[1].toUpperCase()] = m[2].trim();
    });
    return ex;
  });
}

// Split SEMANA_TIPO into per-day blocks. Days start with day name in Portuguese.
const DAYS = ["Segunda", "Terça", "Terca", "Quarta", "Quinta", "Sexta", "Sábado", "Sabado", "Domingo"];
function parseDays(block: string): { day: string; body: string }[] {
  if (!block) return [];
  const re = new RegExp(`(?=^\\s*(?:${DAYS.join("|")})\\b)`, "im");
  const parts = block.split(re).map((p) => p.trim()).filter(Boolean);
  return parts.map((p) => {
    const m = p.match(/^\s*([^\n:•-]+)/);
    return { day: m ? m[1].trim() : "Sessão", body: p };
  });
}

// ─── Apex score badge ───────────────────────────────────────────
function apexScoreBadge(grupo: string | undefined, scores: Record<string, number>) {
  if (!grupo) return null;
  const norm = grupo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const key = Object.keys(scores).find((k) => {
    const kn = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return kn.includes(norm) || norm.includes(kn);
  });
  if (!key) return null;
  const score = scores[key];
  if (score >= 8) return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/40">✓ Forte APEX ({score}/10)</Badge>;
  if (score >= 6) return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/40">⚠ Monitorar ({score}/10)</Badge>;
  return <Badge className="bg-red-500/15 text-red-400 border-red-500/40">🎯 Ponto fraco ({score}/10)</Badge>;
}

// ─── Exercise card ──────────────────────────────────────────────
function ExerciseCard({ ex, scores }: { ex: ParsedExercise; scores: Record<string, number> }) {
  const corretivo = /\bsim\b/i.test(ex.FOCO_CORRETIVO || "");
  return (
    <Card className="border-border bg-card/60">
      <CardContent className="pt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-bold text-foreground">{ex.EXERCICIO || "Exercício"}</div>
          {ex.VARIACAO && <span className="text-xs text-muted-foreground">· {ex.VARIACAO}</span>}
          {corretivo && <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/40">CORRETIVO APEX</Badge>}
          {apexScoreBadge(ex.GRUPO, scores)}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {ex.SERIES && <Stat label="Séries" v={ex.SERIES} />}
          {ex.RPE && <Stat label="RPE" v={ex.RPE} />}
          {ex.GRUPO && <Stat label="Grupo" v={ex.GRUPO} />}
          {ex.VOLUME_AJUSTE && ex.VOLUME_AJUSTE !== "padrão" && (
            <Stat label="Ajuste APEX" v={ex.VOLUME_AJUSTE} accent="text-blue-300" />
          )}
        </div>
        {ex.CUE && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-100/90">
            <span className="font-bold text-amber-400">CUE:</span> {ex.CUE}
          </div>
        )}
        {ex.FOCO_CORRETIVO && (
          <div className="text-[11px] text-muted-foreground">
            <span className="font-semibold">Foco corretivo:</span> {ex.FOCO_CORRETIVO}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, v, accent }: { label: string; v: string; accent?: string }) {
  return (
    <div className="px-2 py-1 rounded-md bg-muted/50">
      <span className="text-muted-foreground">{label}: </span>
      <span className={`font-semibold ${accent || "text-foreground"}`}>{v}</span>
    </div>
  );
}

// ─── Main viewer ────────────────────────────────────────────────
const TABS = [
  { key: "semana", label: "📋 Semana Tipo", icon: ClipboardList },
  { key: "ativacao", label: "🔥 Ativação", icon: Flame },
  { key: "finalizadores", label: "⚡ Finalizadores", icon: Zap },
  { key: "progressao", label: "📈 Progressão", icon: TrendingUp },
  { key: "integracao", label: "🔗 Integração APEX", icon: Link2 },
  { key: "raw", label: "📄 Recomendações (texto completo)", icon: FileText },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); }}
      className="gap-2"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado" : "Copiar tudo"}
    </Button>
  );
}

export default function CorrectivePlanViewer({
  text,
  apexScores,
}: {
  text: string;
  apexScores: Record<string, number>;
}) {
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("semana");

  const parsed = useMemo(() => {
    const allHeaders = [
      "RESUMO_CORRETIVO",
      "ATIVACAO_PRE_TREINO",
      "SEMANA_TIPO",
      "FREQUENCIA_GRUPOS_FRACOS",
      "PROGRESSAO_4_SEMANAS",
      "EXERCICIOS_CORRETIVOS_POS",
      "INTEGRACAO_APEX",
    ];
    const next = (h: string) => allHeaders.filter((x) => x !== h);
    return {
      resumo: section(text, "RESUMO_CORRETIVO", next("RESUMO_CORRETIVO")),
      ativacao: section(text, "ATIVACAO_PRE_TREINO", next("ATIVACAO_PRE_TREINO")),
      semanaRaw: section(text, "SEMANA_TIPO", next("SEMANA_TIPO")),
      freq: section(text, "FREQUENCIA_GRUPOS_FRACOS", next("FREQUENCIA_GRUPOS_FRACOS")),
      progressao: section(text, "PROGRESSAO_4_SEMANAS", next("PROGRESSAO_4_SEMANAS")),
      finalizadores: section(text, "EXERCICIOS_CORRETIVOS_POS", next("EXERCICIOS_CORRETIVOS_POS")),
      integracao: section(text, "INTEGRACAO_APEX", next("INTEGRACAO_APEX")),
    };
  }, [text]);

  const days = useMemo(() => parseDays(parsed.semanaRaw), [parsed.semanaRaw]);

  return (
    <div className="space-y-3">
      {parsed.resumo && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-foreground/90 whitespace-pre-wrap">
          <div className="text-[10px] font-bold uppercase text-blue-400 mb-1">Resumo corretivo</div>
          {parsed.resumo}
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-all"
            style={{
              color: tab === t.key ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              borderBottom: `2px solid ${tab === t.key ? "hsl(var(--primary))" : "transparent"}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "semana" && (
        <div className="space-y-4">
          {days.length === 0 && <Empty text="Sem dias detectados na resposta." raw={parsed.semanaRaw} />}
          {days.map((d, i) => {
            const exs = parseExercises(d.body);
            return (
              <div key={i} className="space-y-2">
                <div className="text-sm font-bold text-foreground">{d.day}</div>
                {exs.length === 0 ? (
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">{d.body}</pre>
                ) : (
                  <div className="grid md:grid-cols-2 gap-2">
                    {exs.map((ex, j) => <ExerciseCard key={j} ex={ex} scores={apexScores} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "ativacao" && <Pre text={parsed.ativacao} />}
      {tab === "finalizadores" && <Pre text={parsed.finalizadores} />}
      {tab === "progressao" && <Pre text={parsed.progressao} />}
      {tab === "integracao" && (
        <div className="space-y-3">
          <Pre text={parsed.integracao} />
          {parsed.freq && (
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                Frequência grupos fracos
              </div>
              <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/90">{parsed.freq}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pre({ text }: { text: string }) {
  if (!text) return <Empty text="—" />;
  return (
    <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/90 max-h-[600px] overflow-y-auto p-3 rounded-lg border border-border bg-card/60">
      {text}
    </pre>
  );
}

function Empty({ text, raw }: { text: string; raw?: string }) {
  return (
    <div className="text-xs italic text-muted-foreground p-4 text-center">
      {text}
      {raw && (
        <pre className="text-left mt-2 text-[11px] font-mono whitespace-pre-wrap">{raw}</pre>
      )}
    </div>
  );
}
