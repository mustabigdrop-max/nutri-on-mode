import { useState } from "react";
import { Copy, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCENT, ACCENT2, Section, copyText } from "./socialUi";
import {
  CONTENT_PACK_POSTS,
  CONTENT_PACK_RULES,
  CONTENT_PACK_SCHEDULE,
  type PackBlock,
  type PackPost,
} from "@/data/contentPackToday";

const CopyBtn = ({ text, label = "Copiar" }: { text: string; label?: string }) => (
  <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => copyText(text)}>
    <Copy className="w-3 h-3" /> {label}
  </Button>
);

const BlockList = ({ title, blocks }: { title: string; blocks: PackBlock[] }) => (
  <Section title={title}>
    <div className="space-y-2">
      {blocks.map((b) => (
        <div key={b.label} className="rounded-lg border p-3" style={{ borderColor: `${ACCENT2}22` }}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: ACCENT2 }}>
              {b.label}
            </p>
            <CopyBtn text={b.text} />
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{b.text}</p>
        </div>
      ))}
    </div>
  </Section>
);

const PostView = ({ post }: { post: PackPost }) => {
  const full = `${post.caption}\n\n${post.hashtags}`;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground">
        <span className="rounded border px-2 py-0.5" style={{ borderColor: `${ACCENT}44`, color: ACCENT }}>
          {post.format}
        </span>
        <span className="rounded border px-2 py-0.5" style={{ borderColor: `${ACCENT2}44`, color: ACCENT2 }}>
          Melhor horário: {post.bestTime}
        </span>
        {post.goal && <span>· {post.goal}</span>}
      </div>

      {post.hooks && <BlockList title="Ganchos — escolha 1" blocks={post.hooks} />}
      {post.slides && <BlockList title="Slides do carrossel" blocks={post.slides} />}

      <Section
        title="Legenda completa"
        right={<CopyBtn text={full} label="Copiar legenda + hashtags" />}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.caption}</p>
        <div className="flex items-start justify-between gap-2 pt-2">
          <p className="text-xs leading-relaxed text-muted-foreground">{post.hashtags}</p>
          <CopyBtn text={post.hashtags} label="Hashtags" />
        </div>
      </Section>

      {post.onScreen && <BlockList title="Texto na tela do Reels" blocks={post.onScreen} />}
      {post.stories && <BlockList title="Sequência de Stories" blocks={post.stories} />}
    </div>
  );
};

/** Pacote de conteúdo pronto pra postar: Reels, carrossel, stories e cronograma. */
export default function ContentPackTodayPanel() {
  const [active, setActive] = useState(CONTENT_PACK_POSTS[0].id);
  const post = CONTENT_PACK_POSTS.find((p) => p.id === active) ?? CONTENT_PACK_POSTS[0];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}08` }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
          <p className="font-semibold tracking-wide">PACOTE PRONTO PRA POSTAR</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Tudo já escrito: é só copiar, colar e publicar nos horários indicados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CONTENT_PACK_POSTS.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className="rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={{
                borderColor: on ? ACCENT : "rgba(255,255,255,0.12)",
                color: on ? ACCENT : undefined,
                background: on ? `${ACCENT}12` : "transparent",
              }}
            >
              {p.title}
            </button>
          );
        })}
      </div>

      <PostView post={post} />

      <Section title="Cronograma de publicação" right={<Calendar className="w-3.5 h-3.5 text-muted-foreground" />}>
        <div className="grid gap-2 sm:grid-cols-3">
          {CONTENT_PACK_SCHEDULE.map((d) => (
            <div key={d.day} className="rounded-lg border p-3" style={{ borderColor: `${ACCENT}22` }}>
              <p className="text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
                {d.day}
              </p>
              <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {d.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Regras pra maximizar alcance">
        <ol className="space-y-1.5 text-sm leading-relaxed">
          {CONTENT_PACK_RULES.map((r, i) => (
            <li key={r} className="flex gap-2">
              <span className="font-mono text-xs" style={{ color: ACCENT2 }}>
                {i + 1}.
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
