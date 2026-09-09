import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Film, Images, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import SaveShareButtons from "@/components/social/SaveShareButtons";
import PosSlidesPanel from "@/components/social/PosSlidesPanel";
import {
  PRINT_SLIDE_LABELS,
  PRINT_STORY_LABELS,
  renderPrintCarousel,
  renderPrintStories,
  type PrintAnalise,
} from "@/lib/printCarouselTemplate";

const AMBER = "#EF9F27";

const loadPhoto = (file: File) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });

const copiar = (txt: string, label: string) => {
  navigator.clipboard.writeText(txt);
  toast.success(`${label} copiado.`);
};

/**
 * "Print do app": o coach sobe UM screenshot de uma tela do nutriON e sai com
 * o carrossel de mockup premium, os 3 stories e o roteiro de Reels — tudo
 * construído a partir do que realmente aparece no print.
 */
export default function PrintNutrionPanel({ file, handle }: { file: File; handle?: string }) {
  const at = handle || "diogo.mell0";
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState<PrintAnalise | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);
  const [slideAtivo, setSlideAtivo] = useState(0);
  const [storyAtivo, setStoryAtivo] = useState(0);

  const gerar = async () => {
    setLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Não consegui ler esse print."));
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "print_nutrion", topic: "print de tela do nutriON", handle: at, images: [base64] },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error!);
      const res = ((data as { result?: PrintAnalise })?.result || {}) as PrintAnalise;
      setAnalise(res);

      const img = await loadPhoto(file);
      if (!img) throw new Error("Não consegui abrir esse print.");
      setSlides(renderPrintCarousel(res, img, at));
      setStories(renderPrintStories(res.stories || [], img, at));
      setSlideAtivo(0);
      setStoryAtivo(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(false);
    }
  };

  const labels = analise ? PRINT_SLIDE_LABELS(analise) : [];
  const legenda = cleanCaption(analise?.legenda);
  const hashtags = (analise?.hashtags_top5 || []).join(" ");
  const roteiro = (analise?.reels?.cortes || [])
    .map((c) => `${c.segundo} — ${c.texto_tela}\n${c.acao || ""}`)
    .join("\n\n");

  return (
    <div className="space-y-4 rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-wide" style={{ color: AMBER }}>
            PRINT DO nutriON
          </p>
          <p className="text-[11px] text-muted-foreground">
            Um print de tela vira carrossel com mockup, stories e roteiro de Reels.
          </p>
        </div>
        <Button size="sm" className="gap-2" disabled={loading} onClick={gerar}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "Lendo o print…" : slides.length ? "Gerar de novo" : "Gerar conteúdo"}
        </Button>
      </div>

      {analise && (
        <div className="rounded-lg border p-3 text-[11px]" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-muted-foreground">
            Tela lida: <span className="text-foreground">{analise.titulo_tela || analise.tipo_tela}</span>
          </p>
          {!!analise.dados_extraidos?.exercicios?.length && (
            <p className="mt-1 text-muted-foreground">
              Exercícios no print: {analise.dados_extraidos.exercicios.join(" · ")}
            </p>
          )}
          {analise.dados_extraidos?.calorias && (
            <p className="mt-1 text-muted-foreground">Calorias no print: {analise.dados_extraidos.calorias}</p>
          )}
        </div>
      )}

      {!!slides.length && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Images className="h-3 w-3" /> Carrossel · {slides.length} slides
          </p>
          <div className="flex flex-wrap gap-2">
            {slides.map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={i === slideAtivo ? "default" : "outline"}
                className="h-7 px-2 text-[10px]"
                onClick={() => setSlideAtivo(i)}
              >
                {i + 1} · {labels[i] || ""}
              </Button>
            ))}
          </div>
          <img
            src={slides[slideAtivo]}
            alt={`Slide ${slideAtivo + 1} do carrossel gerado a partir do print`}
            className="mx-auto w-full max-w-[260px] rounded-lg"
          />
          <SaveShareButtons
            items={slides.map((url, i) => ({ url, filename: `print-carrossel-${i + 1}.png` }))}
            texto={legenda}
          />
        </div>
      )}

      {!!stories.length && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Stories · {stories.length} frames
          </p>
          <div className="flex flex-wrap gap-2">
            {stories.map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={i === storyAtivo ? "default" : "outline"}
                className="h-7 px-2 text-[10px]"
                onClick={() => setStoryAtivo(i)}
              >
                {PRINT_STORY_LABELS[i] || i + 1}
              </Button>
            ))}
          </div>
          <img
            src={stories[storyAtivo]}
            alt={`Story ${storyAtivo + 1} gerado a partir do print`}
            className="mx-auto w-full max-w-[220px] rounded-lg"
          />
          <SaveShareButtons items={stories.map((url, i) => ({ url, filename: `print-story-${i + 1}.png` }))} />
        </div>
      )}

      {!!analise?.reels?.cortes?.length && (
        <div className="space-y-2 rounded-lg border p-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Film className="h-3 w-3" /> Roteiro de Reels · 20s
          </p>
          <p className="text-[12px] font-semibold">{analise.reels.hook}</p>
          {analise.reels.cortes.map((c, i) => (
            <div key={i} className="text-[11px]">
              <span style={{ color: AMBER }}>{c.segundo}</span> — {c.texto_tela}
              <div className="text-muted-foreground">{c.acao}</div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => copiar(`${analise.reels?.hook}\n\n${roteiro}`, "Roteiro")}
          >
            <Copy className="h-3 w-3" /> Copiar roteiro
          </Button>
        </div>
      )}

      {analise && (legenda || hashtags) && (
        <div className="space-y-2 rounded-lg border p-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="whitespace-pre-wrap text-[12px] text-gray-300">{legenda}</p>
          {analise.self_comment && (
            <p className="text-[11px] text-muted-foreground">Primeiro comentário: {analise.self_comment}</p>
          )}
          <p className="text-[11px] text-gray-400">{hashtags}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => copiar(legenda, "Legenda")}>
              <Copy className="h-3 w-3" /> Copiar legenda
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => copiar(hashtags, "Hashtags")}>
              <Copy className="h-3 w-3" /> Copiar hashtags
            </Button>
          </div>
        </div>
      )}

      {analise && (
        <PosSlidesPanel
          tipo="NUTRION_FEATURE"
          tema={analise.titulo_tela || "funcionalidade do nutriON"}
          dados={analise.dados_extraidos}
          handle={at}
        />
      )}
    </div>
  );
}
