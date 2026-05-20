import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, AlertCircle, Calendar, Activity, Target, Trophy, Link2 } from "lucide-react";
import ApexMarkdown from "@/components/apex/ApexMarkdown";

// ─── Types ───────────────────────────────────────────────────────
export type Segment = { label: string; score: number; diag: string };
export type FarmMeta = {
  classificacao?: string;
  scoreOtim?: string;
  tdeeFator?: string;
  proteinaIdeal?: string;
  choEstrategia?: string;
  gestaoE2?: string;
  alertaCardio?: string;
};

type Props = {
  activeTab: "auditoria" | "sinergia" | "contencao" | "periodizacao" | "veredicto";
  analysisResult: string;
  segments: Segment[];
  farmMeta: FarmMeta;
  categoryColor: string;
  parseSection: (text: string, key: string, nextKey?: string) => string;
};

// ─── Helpers ─────────────────────────────────────────────────────
function statusFromIcon(text: string): "ok" | "warn" | "red" {
  if (/🔴|red\s*flag/i.test(text)) return "red";
  if (/⚠️|ajustar|atenção/i.test(text)) return "warn";
  return "ok";
}

const STATUS_COLOR: Record<"ok" | "warn" | "red", string> = {
  ok: "#1DB87A",
  warn: "#C47A15",
  red: "#D94040",
};

// Parse "▸ COMPOSTO:" blocks
function parseCompounds(audText: string) {
  const blocks = audText.split(/(?=▸\s*COMPOSTO\s*:)/i).filter(b => /▸/.test(b));
  return blocks.map(block => {
    const name = block.match(/▸\s*COMPOSTO\s*:\s*([^\n]+)/i)?.[1]?.trim() || "Composto";
    const status = block.match(/STATUS\s*:\s*([^\n]+)/i)?.[1]?.trim() || "";
    const sev = statusFromIcon(status);
    const field = (label: string) =>
      block.match(new RegExp(`-\\s*${label}\\s*:\\s*([^\\n]+)`, "i"))?.[1]?.trim();
    return {
      name,
      status,
      sev,
      funcao: field("Função no protocolo"),
      dose: field("Dose avaliada"),
      timing: field("Timing ideal"),
      sinergia: field("Sinergia com os demais"),
      shape: field("Impacto no shape"),
      postural: field("Impacto postural\\/biomecânico") || field("Impacto postural"),
      redFlags: field("Red flags"),
    };
  });
}

// Parse SINERGIA interactions
function parseInteractions(synText: string) {
  const lines = synText.split("\n").map(l => l.trim());
  const getMap = (key: string) =>
    lines.filter(l => new RegExp(`^${key}\\s*[→:]`, "i").test(l))
      .map(l => l.replace(new RegExp(`^${key}\\s*[→:]\\s*`, "i"), "").trim());
  return {
    potencializam: getMap("POTENCIALIZAM"),
    competem: getMap("COMPETEM"),
    compensam: getMap("COMPENSAM"),
  };
}

// Parse CONTENCAO systems
function parseSystems(contText: string) {
  const SYSTEMS = ["CARDIOVASCULAR", "HEPÁTICO", "HEPATICO", "RENAL", "HEMATOLÓGICO", "HEMATOLOGICO", "ENDÓCRINO", "ENDOCRINO", "ARTICULAR/TENDINOSO", "ARTICULAR"];
  const found: { name: string; sev: "ok" | "warn" | "red"; body: string }[] = [];
  // Split into chunks per known header
  const re = /(CARDIOVASCULAR|HEP[ÁA]TICO|RENAL|HEMATOL[ÓO]GICO|END[ÓO]CRINO|ARTICULAR[\/]?TENDINOSO?|ARTICULAR)\s*—\s*SEMA?FORO\s*:\s*([^\n]+)([\s\S]*?)(?=(?:CARDIOVASCULAR|HEP[ÁA]TICO|RENAL|HEMATOL[ÓO]GICO|END[ÓO]CRINO|ARTICULAR[\/]?TENDINOSO?|ARTICULAR)\s*—\s*SEMA?FORO|EXAMES\s*RECOMENDADOS|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(contText)) !== null) {
    const name = m[1];
    const sev = statusFromIcon(m[2]);
    const body = m[3].trim();
    found.push({ name, sev, body });
  }
  const exames = contText.match(/EXAMES\s*RECOMENDADOS\s*:?([\s\S]*)/i)?.[1]?.trim() || "";
  return { systems: found, exames };
}

// Parse PERIODIZAÇÃO weeks
function parseWeeks(perText: string) {
  const lines = perText.split("\n").map(l => l.trim()).filter(Boolean);
  const weeks: { label: string; body: string; isPeak: boolean; isShow: boolean }[] = [];
  let current: { label: string; body: string[] } | null = null;
  for (const l of lines) {
    const wMatch = l.match(/^SEMANA\s*([-+]?\d+|0)\s*(?:\(([^)]+)\))?\s*:\s*(.*)$/i);
    if (wMatch) {
      if (current) {
        const isPeak = /peak/i.test(current.label);
        const isShow = /show|0/i.test(current.label) && !isPeak;
        weeks.push({ label: current.label, body: current.body.join(" "), isPeak, isShow: /SHOW/i.test(current.label) });
      }
      const lbl = `SEMANA ${wMatch[1]}${wMatch[2] ? ` (${wMatch[2]})` : ""}`;
      current = { label: lbl, body: wMatch[3] ? [wMatch[3]] : [] };
    } else if (current) {
      current.body.push(l);
    }
  }
  if (current) {
    weeks.push({
      label: current.label,
      body: current.body.join(" "),
      isPeak: /peak/i.test(current.label),
      isShow: /SHOW/i.test(current.label),
    });
  }
  return weeks;
}

// Parse VEREDICTO
function parseVeredicto(verText: string) {
  return {
    classificacao: verText.match(/CLASSIFICA[ÇC][ÃA]O\s*:\s*([^\n]+)/i)?.[1]?.trim(),
    score: verText.match(/SCORE\s*DE\s*OTIMIZA[ÇC][ÃA]O\s*:\s*([\d.]+)\s*\/\s*10/i)?.[1],
    impacto: verText.match(/MUDAN[ÇC]A\s*DE\s*MAIOR\s*IMPACTO\s*:\s*([^\n]+)/i)?.[1]?.trim(),
    mensagem: verText.match(/MENSAGEM\s*DO\s*COACH\s*:\s*([\s\S]*?)(?=PROJE[ÇC][ÃA]O|$)/i)?.[1]?.trim(),
    cenarioA: verText.match(/Cen[áa]rio\s*A[^:]*:\s*([^\n]+)/i)?.[1]?.trim(),
    cenarioB: verText.match(/Cen[áa]rio\s*B[^:]*:\s*([^\n]+)/i)?.[1]?.trim(),
  };
}

// ─── Component ───────────────────────────────────────────────────
export default function VertexEnhancedView({
  activeTab, analysisResult, segments, farmMeta, categoryColor, parseSection,
}: Props) {
  const audText = parseSection(analysisResult, "VERTEX_AUDITORIA", "VERTEX_SINERGIA");
  const synText = parseSection(analysisResult, "VERTEX_SINERGIA", "VERTEX_OTIMIZACAO");
  const otimText = parseSection(analysisResult, "VERTEX_OTIMIZACAO", "VERTEX_CONTENCAO");
  const contText = parseSection(analysisResult, "VERTEX_CONTENCAO", "VERTEX_PERIODIZACAO");
  const perText = parseSection(analysisResult, "VERTEX_PERIODIZACAO", "VERTEX_SHAPE");
  const shapeText = parseSection(analysisResult, "VERTEX_SHAPE", "VERTEX_VEREDICTO");
  const verText = parseSection(analysisResult, "VERTEX_VEREDICTO", "GANHA_PONTOS");

  const compounds = useMemo(() => parseCompounds(audText), [audText]);
  const interactions = useMemo(() => parseInteractions(synText), [synText]);
  const { systems, exames } = useMemo(() => parseSystems(contText), [contText]);
  const weeks = useMemo(() => parseWeeks(perText), [perText]);
  const veredicto = useMemo(() => parseVeredicto(verText), [verText]);

  // Weak muscles cross-reference (score ≤ 6)
  const weakMuscles = useMemo(() => segments.filter(s => s.score <= 6).sort((a, b) => a.score - b.score), [segments]);

  if (activeTab === "auditoria") {
    return (
      <div className="space-y-3">
        {compounds.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">Nenhum composto extraído. Verifique o protocolo informado.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-2">
            {compounds.map((c, i) => {
              const color = STATUS_COLOR[c.sev];
              return (
                <div key={i} className="rounded-lg border p-3 bg-card/50 space-y-1.5" style={{ borderColor: `${color}55` }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-bold truncate" style={{ color }}>{c.name}</div>
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
                      {c.status}
                    </div>
                  </div>
                  {c.funcao && <Row label="Função" value={c.funcao} />}
                  {c.dose && <Row label="Dose" value={c.dose} />}
                  {c.timing && <Row label="Timing" value={c.timing} />}
                  {c.shape && <Row label="Shape" value={c.shape} accent={categoryColor} />}
                  {c.sinergia && <Row label="Sinergia" value={c.sinergia} />}
                  {c.postural && <Row label="Postural" value={c.postural} />}
                  {c.redFlags && c.sev !== "ok" && (
                    <div className="mt-1 text-[10px] flex items-start gap-1 p-1.5 rounded" style={{ background: `${color}15`, color }}>
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{c.redFlags}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {weakMuscles.length > 0 && (
          <CrossShapeBlock weak={weakMuscles} shapeText={shapeText} color={categoryColor} />
        )}
      </div>
    );
  }

  if (activeTab === "sinergia") {
    return (
      <div className="space-y-3">
        <div className="grid md:grid-cols-3 gap-2">
          <InteractionColumn title="🟢 Potencializam" items={interactions.potencializam} color="#1DB87A" />
          <InteractionColumn title="🔴 Competem" items={interactions.competem} color="#D94040" />
          <InteractionColumn title="🟡 Compensam" items={interactions.compensam} color="#C47A15" />
        </div>

        {/* Synergy ratios pills */}
        <div className="flex flex-wrap gap-2">
          {farmMeta.gestaoE2 && <Pill label="Estrogênio" value={farmMeta.gestaoE2} color="#E07030" />}
          {farmMeta.scoreOtim && <Pill label="Sinergia geral" value={`${farmMeta.scoreOtim.replace("/10","")}/10`} color="#534AB7" />}
        </div>

        {/* Full synergy analysis fallback (text) */}
        {synText && <CollapsibleText title="Análise completa do stack" body={synText} accent="#3B82F6" />}

        {/* Otimização sugerida */}
        {otimText && <CollapsibleText title="🛠 Otimização sugerida" body={otimText} accent="#1DB87A" defaultOpen />}
      </div>
    );
  }

  if (activeTab === "contencao") {
    return (
      <div className="space-y-3">
        {systems.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">Nenhum sistema analisado.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-2">
            {systems.map((s, i) => (
              <SystemCard key={i} name={s.name} sev={s.sev} body={s.body} />
            ))}
          </div>
        )}
        {exames && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Exames recomendados
            </div>
            <div className="text-[11px] text-foreground/90 leading-snug"><ApexMarkdown text={exames} /></div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "periodizacao") {
    return (
      <div className="space-y-2">
        {weeks.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">Cronograma não extraído.</div>
        ) : (
          <div className="relative pl-5 space-y-1.5">
            {/* Vertical line */}
            <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-purple-500/40 via-amber-500/40 to-red-500/40" />
            {weeks.map((w, i) => {
              const color = w.isShow ? "#D94040" : w.isPeak ? "#FFB800" : "#534AB7";
              return (
                <div key={i} className="relative">
                  <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full border-2" style={{ background: color, borderColor: `${color}88` }} />
                  <div className="rounded-md border p-2" style={{ borderColor: `${color}33`, background: `${color}08` }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Calendar className="w-3 h-3" style={{ color }} />
                      <div className="text-[11px] font-bold" style={{ color }}>{w.label}</div>
                    </div>
                    <div className="text-[11px] text-foreground/90 leading-snug"><ApexMarkdown text={w.body} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "veredicto") {
    const scoreNum = veredicto.score ? parseFloat(veredicto.score) : (farmMeta.scoreOtim ? parseFloat(farmMeta.scoreOtim) : null);
    const scoreColor = !scoreNum ? "#888" : scoreNum >= 8 ? "#1DB87A" : scoreNum >= 6 ? "#C47A15" : "#D94040";
    return (
      <div className="space-y-3">
        {/* Big score gauge */}
        <div className="rounded-xl border p-4 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" style={{ borderColor: `${scoreColor}55` }}>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="42" cy="42" r="36" fill="none"
                  stroke={scoreColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${((scoreNum || 0) / 10) * 226} 226`}
                  transform="rotate(-90 42 42)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-extrabold leading-none" style={{ color: scoreColor }}>{scoreNum ?? "—"}</div>
                <div className="text-[8px] font-bold text-muted-foreground">/10</div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classificação</div>
              <div className="text-base font-extrabold" style={{ color: scoreColor }}>
                {veredicto.classificacao || farmMeta.classificacao || "—"}
              </div>
              {veredicto.impacto && (
                <div className="text-[11px] text-foreground/90 mt-1 flex items-start gap-1">
                  <Target className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                  <span><strong>Maior impacto:</strong> {veredicto.impacto}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem do coach */}
        {veredicto.mensagem && (
          <div className="rounded-lg border-l-4 p-3 bg-card/50" style={{ borderLeftColor: "#534AB7" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Mensagem do Dr. VERTEX
            </div>
            <div className="text-xs text-foreground/95 leading-relaxed italic"><ApexMarkdown text={veredicto.mensagem} /></div>
          </div>
        )}

        {/* Projeção comparativa */}
        {(veredicto.cenarioA || veredicto.cenarioB) && (
          <div className="grid md:grid-cols-2 gap-2">
            {veredicto.cenarioA && (
              <div className="rounded-lg border p-2.5" style={{ borderColor: "#88888855", background: "#88888810" }}>
                <div className="text-[10px] font-bold text-muted-foreground mb-1">A · Mantendo atual</div>
                <div className="text-[11px] leading-snug"><ApexMarkdown text={veredicto.cenarioA} /></div>
              </div>
            )}
            {veredicto.cenarioB && (
              <div className="rounded-lg border p-2.5" style={{ borderColor: "#1DB87A55", background: "#1DB87A10" }}>
                <div className="text-[10px] font-bold text-emerald-400 mb-1">B · Otimizado</div>
                <div className="text-[11px] leading-snug"><ApexMarkdown text={veredicto.cenarioB} /></div>
              </div>
            )}
          </div>
        )}

        {weakMuscles.length > 0 && <CrossShapeBlock weak={weakMuscles} shapeText={shapeText} color={categoryColor} />}
      </div>
    );
  }

  return null;
}

// ─── Sub-components ──────────────────────────────────────────────
function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="text-[10px] leading-snug">
      <span className="font-bold text-muted-foreground">{label}: </span>
      <span style={{ color: accent || "hsl(var(--foreground))" }}>{value}</span>
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border" style={{ borderColor: `${color}66`, background: `${color}15`, color }}>
      <span className="opacity-70">{label}</span><span>{value}</span>
    </div>
  );
}

function InteractionColumn({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-lg border p-2" style={{ borderColor: `${color}55`, background: `${color}08` }}>
      <div className="text-[10px] font-bold mb-1.5" style={{ color }}>{title}</div>
      {items.length === 0 ? (
        <div className="text-[10px] text-muted-foreground italic">Nenhum</div>
      ) : (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i} className="text-[11px] flex gap-1 leading-snug">
              <Link2 className="w-3 h-3 mt-0.5 shrink-0 opacity-60" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SystemCard({ name, sev, body }: { name: string; sev: "ok" | "warn" | "red"; body: string }) {
  const color = STATUS_COLOR[sev];
  const icon = sev === "red" ? "🔴" : sev === "warn" ? "🟡" : "🟢";
  const Icn = sev === "red" ? AlertTriangle : sev === "warn" ? AlertCircle : CheckCircle2;
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: `${color}55`, background: `${color}08` }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icn className="w-4 h-4" style={{ color }} />
        <div className="text-xs font-bold" style={{ color }}>{name}</div>
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}22`, color }}>
          {icon} {sev === "red" ? "Alto" : sev === "warn" ? "Moderado" : "Baixo"}
        </span>
      </div>
      <div className="text-[11px] text-foreground/90 leading-snug"><ApexMarkdown text={body} /></div>
    </div>
  );
}

function CrossShapeBlock({ weak, shapeText, color }: { weak: Segment[]; shapeText: string; color: string }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: `${color}55`, background: `${color}08` }}>
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color }}>
        🔗 Cross-Shape × Farmacologia
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mb-2">
        {weak.slice(0, 4).map((m, i) => (
          <div key={i} className="rounded border p-1.5 text-[10px] bg-card/40" style={{ borderColor: `${color}33` }}>
            <div className="flex items-center justify-between">
              <span className="font-bold truncate">{m.label}</span>
              <span className="font-mono shrink-0" style={{ color }}>{m.score}/10</span>
            </div>
            <div className="opacity-70 line-clamp-2 mt-0.5">{m.diag}</div>
          </div>
        ))}
      </div>
      {shapeText && (
        <div className="text-[11px] text-foreground/90 whitespace-pre-wrap leading-snug border-t pt-2" style={{ borderColor: `${color}33` }}>
          {shapeText}
        </div>
      )}
    </div>
  );
}

function CollapsibleText({ title, body, accent, defaultOpen }: { title: string; body: string; accent: string; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="rounded-lg border p-2 bg-card/40" style={{ borderColor: `${accent}33` }}>
      <summary className="cursor-pointer text-[11px] font-bold" style={{ color: accent }}>{title}</summary>
      <div className="text-[11px] mt-1.5 whitespace-pre-wrap leading-snug text-foreground/90">{body}</div>
    </details>
  );
}
