import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { ACCENT, Section, copyText } from "./socialUi";
import {
  BATCHING_BLOCKS, BATCHING_TOTAL, COMMENT_TEMPLATES, SEASONAL_CALENDAR,
  SELF_COMMENT_TIP, UGC_REQUEST_TEMPLATE, UGC_STRATEGIES,
} from "@/data/socialOnExpert";

const PlaybookPanel = () => {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="space-y-4">
      <Section title="📦 Batching dominical — gravar a semana em 1 dia">
        {BATCHING_BLOCKS.map((b) => (
          <div key={b.title} className="rounded-lg border p-3 space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-semibold">{b.title} <span className="text-muted-foreground font-normal">({b.time})</span></p>
            {b.meta.map((m) => <p key={m} className="text-[11px] font-mono text-muted-foreground">{m}</p>)}
            {b.items.map((i) => <p key={i} className="text-sm">→ {i}</p>)}
            {b.tip && <p className="text-[11px] text-muted-foreground">💡 {b.tip}</p>}
            <p className="text-xs font-mono" style={{ color: ACCENT }}>Isso vira: {b.output}</p>
          </div>
        ))}
        <p className="text-sm font-semibold text-center" style={{ color: ACCENT }}>{BATCHING_TOTAL}</p>
      </Section>

      <Section title="💬 Comentários estratégicos">
        <p className="text-sm text-muted-foreground">
          O Instagram prioriza posts com comentários longos e respostas do criador. Cada resposta sua = mais alcance.
        </p>
        {COMMENT_TEMPLATES.map((c) => (
          <div key={c.comment} className="rounded-lg border p-3 space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-semibold">Comentário: "{c.comment}"</p>
            <p className="text-sm text-red-400">❌ {c.wrong} <span className="text-muted-foreground">({c.wrongWhy})</span></p>
            <p className="text-sm text-emerald-400">✅ {c.right} <span className="text-muted-foreground">({c.rightWhy})</span></p>
            <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(c.right)}><Copy className="w-3 h-3" /> Copiar</Button>
          </div>
        ))}
        <p className="text-sm">🔁 <strong>Self-comment:</strong> {SELF_COMMENT_TIP}</p>
      </Section>

      <Section title="📅 Calendário sazonal">
        {SEASONAL_CALENDAR.map((m) => {
          const active = m.month === currentMonth;
          const soon = m.month === (currentMonth % 12) + 1;
          return (
            <div key={m.month} className="rounded-lg border p-3 space-y-1"
              style={{ borderColor: active ? ACCENT : "rgba(255,255,255,0.08)", background: active ? `${ACCENT}12` : undefined }}>
              <p className="text-sm font-semibold">
                {m.name}: {m.theme}
                {active && <span className="ml-2 text-[10px] font-mono" style={{ color: ACCENT }}>AGORA</span>}
                {soon && <span className="ml-2 text-[10px] font-mono text-amber-400">PREPARAR (2 semanas)</span>}
              </p>
              {m.notes.map((n) => <p key={n} className="text-sm text-muted-foreground">→ {n}</p>)}
            </div>
          );
        })}
      </Section>

      <Section title="🤝 Estratégia UGC">
        <p className="text-sm text-muted-foreground">
          UGC = conteúdo do seu cliente sobre você. Vale mais que qualquer post seu porque é prova social de terceiros.
        </p>
        {UGC_STRATEGIES.map((s) => (
          <div key={s.title} className="rounded-lg border p-3 space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-semibold">{s.title}</p>
            {s.items.map((i) => <p key={i} className="text-sm text-muted-foreground">→ {i}</p>)}
          </div>
        ))}
        <div className="rounded-lg border p-3" style={{ borderColor: `${ACCENT}44` }}>
          <p className="text-[11px] font-mono text-muted-foreground mb-1">TEMPLATE PRA PEDIR UGC</p>
          <p className="text-sm whitespace-pre-wrap">{UGC_REQUEST_TEMPLATE}</p>
          <Button size="sm" variant="outline" className="gap-1 mt-2" onClick={() => copyText(UGC_REQUEST_TEMPLATE)}>
            <Copy className="w-3 h-3" /> Copiar mensagem
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default PlaybookPanel;
