import { Section, ACCENT, ACCENT2, copyText } from "./socialUi";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  IG_AUDIENCE, IG_AUDIENCE_RULE, IG_BY_OBJECTIVE, IG_FEED_SCHEDULE, IG_GRID, IG_GRID_RULES,
  IG_HIGHLIGHTS, IG_HIGHLIGHT_DESIGN, IG_PALETTE, IG_PALETTE_RULES, IG_SALES, IG_SALES_NEVER,
  IG_SALES_RULE, IG_STORIES_SCHEDULE, IG_STORY_FUNNEL, IG_STORY_FUNNEL_RULE,
} from "@/data/instagramGuide";

const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="text-xs text-muted-foreground flex gap-2">
    <span style={{ color: ACCENT2 }}>→</span>
    <span>{children}</span>
  </li>
);

const InstagramGuidePanel = () => (
  <div className="space-y-4">
    <Section title="🎨 Paleta oficial @diogo.mell0">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {IG_PALETTE.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => copyText(c.hex)}
            className="flex items-center gap-2 rounded-lg border p-2 text-left"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            <span className="w-8 h-8 rounded-md border border-white/10 shrink-0" style={{ background: c.hex }} />
            <span className="min-w-0">
              <span className="block text-[11px] font-mono">{c.hex}</span>
              <span className="block text-[10px] text-muted-foreground truncate">{c.name}</span>
              <span className="block text-[10px] text-muted-foreground">{c.use}</span>
            </span>
          </button>
        ))}
      </div>
      <ul className="space-y-1">{IG_PALETTE_RULES.map((r) => <Li key={r}>{r}</Li>)}</ul>
    </Section>

    <Section title="⭐ 9 destaques do perfil">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {IG_HIGHLIGHTS.map((h) => (
          <div key={h.n} className="rounded-lg border p-3 space-y-1" style={{ borderColor: `${h.color}44` }}>
            <p className="text-xs font-semibold" style={{ color: h.color }}>{h.n}. {h.emoji} {h.label}</p>
            <p className="text-[10px] font-mono text-muted-foreground">ícone: {h.icon}</p>
            <p className="text-[11px] text-muted-foreground">{h.content}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-1">{IG_HIGHLIGHT_DESIGN.map((d) => <Li key={d}>{d}</Li>)}</ul>
    </Section>

    <Section title="🔲 Grid das primeiras 9 fotos">
      <div className="grid grid-cols-3 gap-2">
        {IG_GRID.flat().map((cell, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg border flex items-center justify-center p-2 text-center"
            style={{ borderColor: `${ACCENT}33`, background: "rgba(255,255,255,0.02)" }}
          >
            <span className="text-[10px] text-muted-foreground">{cell}</span>
          </div>
        ))}
      </div>
      <ul className="space-y-1">{IG_GRID_RULES.map((r) => <Li key={r}>{r}</Li>)}</ul>
    </Section>

    <Section title="⏰ Horários — feed e Reels">
      <div className="space-y-2">
        {IG_FEED_SCHEDULE.map((d) => (
          <div key={d.day} className="rounded-lg border p-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs font-semibold">
              {d.day} · <span style={{ color: ACCENT2 }}>{d.time}</span>
            </p>
            <p className="text-[11px]">{d.type}</p>
            <p className="text-[10px] text-muted-foreground">{d.why}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="📲 Stories — 8 a 12 por dia">
      <div className="grid gap-2 md:grid-cols-2">
        {IG_STORIES_SCHEDULE.map((b) => (
          <div key={b.block} className="rounded-lg border p-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs font-semibold">{b.block} <span className="font-mono text-muted-foreground">{b.time}</span></p>
            <ul className="space-y-1 pt-1">{b.items.map((i) => <Li key={i}>{i}</Li>)}</ul>
          </div>
        ))}
      </div>
    </Section>

    <Section title="🎯 Por objetivo">
      <div className="space-y-2">
        {IG_BY_OBJECTIVE.map((o) => (
          <div key={o.goal} className="rounded-lg border p-3" style={{ borderColor: `${ACCENT}33` }}>
            <p className="text-xs font-semibold" style={{ color: ACCENT }}>{o.goal}</p>
            <p className="text-[11px] text-muted-foreground">⏰ {o.time} · 🎬 {o.format}</p>
            <p className="text-[11px] text-muted-foreground">📅 {o.day} · 💡 {o.content}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="👥 Conteúdo por gênero">
      <div className="grid gap-3 md:grid-cols-2">
        {IG_AUDIENCE.map((a) => (
          <div key={a.key} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs font-semibold">{a.title}</p>
            <p className="text-[10px] font-mono text-muted-foreground">O QUE FUNCIONA</p>
            <ul className="space-y-1">{a.works.map((w) => <Li key={w}>{w}</Li>)}</ul>
            <p className="text-[10px] font-mono text-muted-foreground">HOOKS</p>
            <ul className="space-y-1">
              {a.hooks.map((h) => (
                <li key={h} className="text-xs flex items-start justify-between gap-2">
                  <span>"{h}"</span>
                  <Button size="sm" variant="ghost" className="h-6 shrink-0" onClick={() => copyText(h)} aria-label="Copiar hook">
                    <Copy className="w-3 h-3" />
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-[10px] font-mono text-muted-foreground">EDITS QUE VIRALIZAM</p>
            <ul className="space-y-1">{a.edits.map((e) => <Li key={e}>{e}</Li>)}</ul>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">{IG_AUDIENCE_RULE}</p>
    </Section>

    <Section title="💰 Vender sem parecer que está vendendo">
      <p className="text-xs" style={{ color: ACCENT }}>{IG_SALES_RULE}</p>
      <div className="space-y-2">
        {IG_SALES.map((s) => (
          <div key={s.level} className="rounded-lg border p-3" style={{ borderColor: `${s.color}44` }}>
            <p className="text-xs font-semibold" style={{ color: s.color }}>{s.level} · {s.freq}</p>
            <ul className="space-y-1 pt-1">{s.items.map((i) => <Li key={i}>{i}</Li>)}</ul>
          </div>
        ))}
      </div>
      <div className="rounded-lg border p-3" style={{ borderColor: "#FF6B6B44" }}>
        <p className="text-xs font-semibold" style={{ color: "#FF6B6B" }}>NUNCA</p>
        <ul className="space-y-1 pt-1">{IG_SALES_NEVER.map((n) => (
          <li key={n} className="text-xs text-muted-foreground">❌ {n}</li>
        ))}</ul>
      </div>
    </Section>

    <Section
      title="📖 Sequência de vendas por Stories"
      right={
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1"
          onClick={() => copyText(IG_STORY_FUNNEL.map((s) => `Story ${s.n} — ${s.title}\n${s.body}`).join("\n\n"))}
        >
          <Copy className="w-3 h-3" /> Copiar
        </Button>
      }
    >
      <div className="space-y-2">
        {IG_STORY_FUNNEL.map((s) => (
          <div key={s.n} className="rounded-lg border p-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-xs font-semibold">Story {s.n} — <span style={{ color: ACCENT2 }}>{s.title}</span></p>
            <p className="text-[11px] text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">{IG_STORY_FUNNEL_RULE}</p>
    </Section>
  </div>
);

export default InstagramGuidePanel;
