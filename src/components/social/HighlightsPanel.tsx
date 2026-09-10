import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ACCENT, Section, copyText } from "./socialUi";
import SaveShareButtons from "./SaveShareButtons";
import { HIGHLIGHTS } from "@/lib/socialGrowth";
import { renderHighlightCover, renderHighlightStory } from "@/lib/highlightCover";

export default function HighlightsPanel() {
  const [capas, setCapas] = useState<{ url: string; filename: string }[]>([]);
  const [aberto, setAberto] = useState<string | null>(null);
  const [stories, setStories] = useState<Record<string, string[]>>({});

  const gerarCapas = () => {
    try {
      setCapas(HIGHLIGHTS.map((h) => ({ url: renderHighlightCover(h.titulo, h.icone), filename: `highlight-${h.id}.png` })));
      toast.success("6 capas geradas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar capas");
    }
  };

  const gerarStories = (id: string) => {
    const h = HIGHLIGHTS.find((x) => x.id === id);
    if (!h) return;
    const total = h.stories.length;
    setStories((s) => ({
      ...s,
      [id]: h.stories.map((t, i) => renderHighlightStory(t, i, total, h.titulo, i === total - 1)),
    }));
    toast.success(`${total} stories gerados para ${h.titulo}`);
  };

  return (
    <div className="space-y-4">
      <Section title="📌 Gerador de highlights do perfil">
        <p className="text-sm text-muted-foreground">
          Cada destaque é uma vitrine pra quem chega novo: capa com a identidade nutriON, 5–15 stories e CTA no último.
        </p>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHTS.map((h) => (
            <div key={h.id} className="rounded-lg border px-3 py-2 text-center w-24" style={{ borderColor: `${ACCENT}44` }}>
              <p className="text-xl">{h.icone}</p>
              <p className="text-[10px] font-mono uppercase leading-tight">{h.titulo}</p>
            </div>
          ))}
        </div>
        <Button onClick={gerarCapas} className="gap-2" style={{ background: ACCENT }}>✦ Gerar capas dos 6 highlights</Button>
        {capas.length > 0 && (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {capas.map((c) => <img key={c.filename} src={c.url} alt={c.filename} className="rounded-md border" />)}
            </div>
            <SaveShareButtons items={capas} />
          </>
        )}
      </Section>

      {HIGHLIGHTS.map((h) => (
        <Section
          key={h.id}
          title={`${h.icone} ${h.titulo}`}
          right={
            <Button size="sm" variant="ghost" className="h-7" onClick={() => setAberto(aberto === h.id ? null : h.id)}>
              {aberto === h.id ? "Fechar" : "Abrir"}
            </Button>
          }
        >
          {aberto === h.id && (
            <>
              <ol className="space-y-1 text-sm list-decimal pl-5">
                {h.stories.map((s, i) => <li key={i} className={i === h.stories.length - 1 ? "font-semibold" : ""}>{s}</li>)}
              </ol>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(h.stories.join("\n"))}>Copiar roteiro</Button>
                <Button size="sm" onClick={() => gerarStories(h.id)} style={{ background: ACCENT }}>✦ Gerar stories deste destaque</Button>
              </div>
              {stories[h.id] && (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {stories[h.id].map((s, i) => <img key={i} src={s} alt={`Story ${i + 1} de ${h.titulo}`} className="rounded-md border" />)}
                  </div>
                  <SaveShareButtons items={stories[h.id].map((url, i) => ({ url, filename: `highlight-${h.id}-story-${i + 1}.png` }))} />
                </>
              )}
            </>
          )}
        </Section>
      ))}
    </div>
  );
}
