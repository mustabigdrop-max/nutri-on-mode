import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Copy, Loader2, Music2, Scissors, Sparkles, Clapperboard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Section, Pill, copyText, VariationBlock } from "./socialUi";
import type { StudioConcept, StudioResult } from "./PrismStudioPanel";
import {
  DAILY_PILLARS, REEL_FORMULAS, CALENDAR_30, DEFAULT_FORMULA_BY_PILLAR,
  pillarForToday, pillarById, formulaById, STORIES_STRATEGY, DAILY_RULE, FUNNEL_RULE,
  type DailyPillarId,
} from "@/data/dailyContentSystem";

export default function DailyReelPanel({
  packMode = false, onBack,
}: { packMode?: boolean; onBack: () => void }) {
  const today = pillarForToday();
  const [pillar, setPillar] = useState<DailyPillarId>(today.id);
  const [formula, setFormula] = useState<string>(DEFAULT_FORMULA_BY_PILLAR[today.id]);
  const [theme, setTheme] = useState("");
  const [hook, setHook] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<StudioResult | null>(null);
  const [open, setOpen] = useState(0);

  const p = pillarById(pillar)!;
  const f = formulaById(formula) || REEL_FORMULAS[0];
  const accent = p.color;

  const dayPlan = useMemo(() => {
    const d = new Date().getDate();
    return CALENDAR_30.find((c) => c.day === d) || null;
  }, []);

  const applyPlan = () => {
    if (!dayPlan) return;
    setPillar(dayPlan.pillar);
    setFormula(dayPlan.formula);
    setHook(dayPlan.hook);
    setTheme(dayPlan.notes || "");
    toast.success(`Dia ${dayPlan.day} do calendário carregado`);
  };

  const brief = () =>
    [
      `PILAR DO DIA (${p.weekday}): ${p.label} — tom ${p.tone}. Foco: ${p.focus}.`,
      `Produto do dia: ${p.product} (${p.funnel}).`,
      `FÓRMULA: ${f.label} — ${f.why}`,
      `ESTRUTURA OBRIGATÓRIA:\n${f.structure.map((s) => `- ${s}`).join("\n")}`,
      hook ? `HOOK BASE (usar ou melhorar mantendo o ângulo): ${hook}` : "",
      `Duração alvo do Reel: 15 a 40 segundos.`,
      FUNNEL_RULE,
      packMode
        ? `STORIES DO DIA:\n${STORIES_STRATEGY.map((s) => `- ${s.label}: ${s.desc}`).join("\n")}`
        : "",
    ].filter(Boolean).join("\n\n");

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("prism-analyze", {
        body: {
          mode: "studio",
          prism_mode: packMode ? "pack_dia" : "reel_diario",
          subtype: formula,
          tone: p.tone,
          objective: p.funnel === "BOFU" ? "vender" : p.funnel === "MOFU" ? "engajar" : "seguidores",
          theme: theme || p.example,
          daily_brief: brief(),
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult((data as any).result as StudioResult);
      setOpen(0);
      toast.success(packMode ? "Pack do dia pronto" : "Roteiro do Reel pronto");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar");
    } finally {
      setLoading(false);
    }
  };

  const saveToCalendar = async () => {
    const c = result?.concepts?.[0];
    if (!c) return;
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const coachId = auth?.user?.id;
      if (!coachId) throw new Error("Sessão expirada");
      const script = [
        c.hook ? `HOOK: ${c.hook}` : "",
        (c.screen_texts || []).join("\n"),
        c.script?.development || "",
        c.script?.cta ? `CTA: ${c.script.cta}` : "",
      ].filter(Boolean).join("\n\n");
      const { error } = await supabase.from("social_content_calendar").insert({
        coach_id: coachId,
        date: new Date().toISOString().slice(0, 10),
        scheduled_time: "19:30",
        pillar: p.dbPillar,
        format: "reel",
        topic: c.title || `${p.label} · ${f.label}`,
        hook: c.hook || hook || null,
        caption: c.caption || null,
        reel_script: script,
        hashtags: c.hashtags || [],
        status: "ready",
        source: "prism",
      });
      if (error) throw error;
      toast.success("Salvo no calendário como PRONTO");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const conceptText = (c: StudioConcept) =>
    [
      c.title,
      c.hook ? `HOOK: ${c.hook}` : "",
      (c.screen_texts || []).length ? `\nTEXTOS NA TELA:\n${(c.screen_texts || []).join("\n")}` : "",
      c.script?.development ? `\nFALA:\n${c.script.development}` : "",
      c.script?.cta ? `CTA: ${c.script.cta}` : "",
      c.music_suggestion ? `\nMÚSICA: ${c.music_suggestion}` : "",
      c.caption ? `\nLEGENDA:\n${c.caption}` : "",
      (c.hashtags || []).join(" "),
      c.self_comment ? `\nSELF-COMMENT: ${c.self_comment}` : "",
    ].filter(Boolean).join("\n");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">← Modos</Button>
        <span className="text-lg">{packMode ? "📦" : "🎬"}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: accent }}>
            {packMode ? "Pack do Dia" : "Reel Diário"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {packMode ? "1 Reel + 3 Stories + legenda, tudo no pilar do dia" : "Pilar do dia + fórmula = roteiro pronto pra gravar"}
          </p>
        </div>
      </div>

      <Section
        title={`Hoje é ${p.weekday} — ${p.label}`}
        right={dayPlan ? <Button variant="outline" size="sm" className="text-[11px] h-7" onClick={applyPlan}>Usar dia {dayPlan.day} do plano</Button> : undefined}
      >
        <ul className="space-y-1">
          {DAILY_RULE.map((r, i) => <li key={i} className="text-[11px] text-muted-foreground">• {r}</li>)}
        </ul>
      </Section>

      <Section title="Briefing">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">Pilar do dia</p>
            <div className="flex flex-wrap gap-1.5">
              {DAILY_PILLARS.map((x) => (
                <Pill
                  key={x.id}
                  label={`${x.emoji} ${x.weekday} · ${x.label}`}
                  active={pillar === x.id}
                  onClick={() => { setPillar(x.id); setFormula(DEFAULT_FORMULA_BY_PILLAR[x.id]); }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Tom {p.tone} · {p.focus} · {p.product} ({p.funnel})
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">Fórmula do Reel</p>
            <div className="flex flex-wrap gap-1.5">
              {REEL_FORMULAS.map((x) => (
                <Pill key={x.id} label={`${x.emoji} ${x.label}`} active={formula === x.id} onClick={() => setFormula(x.id)} />
              ))}
            </div>
            <div className="rounded-lg p-3 mt-1" style={{ background: `${accent}10`, border: `1px solid ${accent}33` }}>
              <p className="text-[11px] font-medium" style={{ color: accent }}>{f.emoji} {f.label} — {f.hint}</p>
              <ul className="mt-1.5 space-y-0.5">
                {f.structure.map((s, i) => <li key={i} className="text-[11px] text-muted-foreground">{s}</li>)}
              </ul>
              {!!f.examples.length && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {f.examples.map((ex, i) => (
                    <button key={i} onClick={() => setHook(ex)} className="text-[10px] px-2 py-1 rounded border border-white/10 hover:border-white/30 text-left">
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Textarea
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="Hook base (opcional) — cole do banco de hooks ou escreva o seu"
            rows={2}
            className="text-sm"
          />

          <Textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="O que está acontecendo hoje? Ex: treino de perna, aluno bateu meta, filha foi na academia comigo..."
            rows={3}
            className="text-sm"
          />

          <Button onClick={generate} disabled={loading} className="w-full gap-2" style={{ background: accent, color: "#000" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Montando o roteiro..." : packMode ? "Gerar pack do dia" : "Gerar roteiro do Reel"}
          </Button>
        </div>
      </Section>

      {!!result?.concepts?.length && (
        <Section
          title={packMode ? "Pack do dia" : "Roteiro"}
          right={
            <Button variant="outline" size="sm" className="text-[11px] h-7 gap-1" onClick={saveToCalendar} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarPlus className="w-3 h-3" />} Calendário
            </Button>
          }
        >
          {result.concepts.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {result.concepts.map((c, i) => (
                <Pill key={i} label={c.title || `Peça ${i + 1}`} active={open === i} onClick={() => setOpen(i)} />
              ))}
            </div>
          )}
          {(() => {
            const c = result.concepts?.[open];
            if (!c) return null;
            return (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-1.5">
                  {[c.format, c.duration_suggested ? `${c.duration_suggested}s` : "", f.label]
                    .filter(Boolean)
                    .map((t, i) => <Badge key={i} variant="outline" className="text-[10px]">{String(t)}</Badge>)}
                </div>

                {(c.hook || !!c.hook_variations?.length) && (
                  <VariationBlock label="Hook" highlight accent={accent} items={c.hook_variations?.length ? c.hook_variations : [c.hook || ""]} />
                )}

                {!!c.screen_texts?.length && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <Clapperboard className="w-3 h-3" /> Texto na tela (por tempo)
                    </p>
                    <ul className="space-y-1">
                      {c.screen_texts.map((t, i) => (
                        <li key={i} className="text-xs font-mono">{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {c.script?.development && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Fala</p>
                    <p className="text-xs whitespace-pre-wrap">{c.script.development}</p>
                    {c.script.cta && <p className="text-xs mt-1 font-medium">CTA: {c.script.cta}</p>}
                  </div>
                )}

                {!!c.shot_list?.length && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">O que gravar</p>
                    <ul className="space-y-1">{c.shot_list.map((t, i) => <li key={i} className="text-xs">• {t}</li>)}</ul>
                  </div>
                )}

                {!!c.editing_tips?.length && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> Edição
                    </p>
                    <ul className="space-y-1">{c.editing_tips.map((t, i) => <li key={i} className="text-xs">• {t}</li>)}</ul>
                  </div>
                )}

                {c.music_suggestion && (
                  <p className="text-xs flex items-center gap-1 text-muted-foreground">
                    <Music2 className="w-3 h-3" /> {c.music_suggestion}
                  </p>
                )}

                {(c.caption || !!c.caption_variations?.length) && (
                  <VariationBlock label="Legenda" accent={accent} items={c.caption_variations?.length ? c.caption_variations : [c.caption || ""]} />
                )}

                {!!c.hashtags?.length && (
                  <p className="text-[11px] text-muted-foreground break-words">{c.hashtags.join(" ")}</p>
                )}

                {c.self_comment && (
                  <p className="text-xs"><span className="text-muted-foreground">Self-comment: </span>{c.self_comment}</p>
                )}

                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => copyText(conceptText(c))}>
                  <Copy className="w-3.5 h-3.5" /> Copiar tudo
                </Button>
              </div>
            );
          })()}
        </Section>
      )}
    </div>
  );
}
