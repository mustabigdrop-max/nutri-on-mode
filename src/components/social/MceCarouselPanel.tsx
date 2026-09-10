import { useEffect, useState } from "react";
import { Clock, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SaveShareButtons from "@/components/social/SaveShareButtons";
import { melhorHorario } from "@/lib/socialViral";
import { renderMceCarousel, MCE_CTA_SLIDE, type MceCarouselContent } from "@/lib/mceCarouselTemplate";
import PosSlidesPanel from "@/components/social/PosSlidesPanel";
import SlideTextEditor from "@/components/social/SlideTextEditor";
import CarouselStyleSwitch from "@/components/social/CarouselStyleSwitch";
import { useCarouselStyle } from "@/hooks/useCarouselStyle";
import { renderTechSlides } from "@/lib/techSlideTemplate";
import { mceToTech } from "@/lib/techAdapters";

const SLIDE_LABELS = ["CAPA", "A DOR", "PILAR M", "PILAR C", "PILAR E", "INTEGRAÇÃO", "CTA"];

const fallback = (tema: string): Omit<MceCarouselContent, "handle"> => ({
  tema,
  capa: { tag: "método mce", titulo: `Por que **${tema}** trava o seu resultado`, subtitulo: "O que ninguém te explica antes de mandar você começar de novo." },
  dor: { tag: "o problema", titulo: "Você já sabe o que precisa fazer.", impacto: "E mesmo assim não faz.", corpo: "O problema quase nunca é **informação**. É o **sistema** que sustenta a decisão quando a motivação some — e ele nunca foi construído." },
  pilares: {
    M: { frase: "Antes de mudar a rotina, muda a **leitura**.", corpo: "A forma como você interpreta a falha define se ela vira **aprendizado** ou desistência." },
    C: { frase: "Comportamento é **ambiente**, não força de vontade.", corpo: "Reduza o número de decisões por dia e o padrão certo passa a acontecer sozinho.", lista: ["Deixe a próxima ação pronta na véspera", "Corte um gatilho por semana"] },
    E: { frase: "Execução é o que sobra num dia **ruim**.", corpo: "Um plano só é bom se você consegue cumprir a versão mínima dele em qualquer dia." },
  },
  integracao: { tag: "os 3 pilares", titulo: "Nenhum funciona **sozinho**", verbos: { M: "Enxerga", C: "Sustenta", E: "Entrega" }, conexao: "Mentalidade sem comportamento vira teoria. Comportamento sem execução vira intenção. **Transformação é sistema.**" },
});

/** Gerador de carrossel MCE Educacional — 7 slides fixos, 1080x1350. */
export default function MceCarouselPanel({ handle, initialTema }: { handle?: string | null; initialTema?: string }) {
  const [tema, setTema] = useState(initialTema || "");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState<MceCarouselContent | null>(null);
  const [active, setActive] = useState(0);
  const horarioHoje = melhorHorario("CARROSSEL_MCE");
  const [style, setStyle] = useCarouselStyle();

  // re-renderiza sempre que o conteúdo ou o estilo mudam
  useEffect(() => {
    if (!content) return;
    let vivo = true;
    (async () => {
      const imgs =
        style === "tech"
          ? await renderTechSlides(mceToTech(content), { handle: content.handle || handle || undefined })
          : renderMceCarousel(content);
      if (vivo) setImages(imgs);
    })();
    return () => {
      vivo = false;
    };
  }, [content, style, handle]);

  const generate = async () => {
    if (!tema.trim()) return toast.error("Escreva o tema do carrossel.");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "mce_carousel", topic: tema.trim(), handle },
      });
      if (error) throw error;
      const content = { ...(data?.result || {}), tema, handle: handle || "diogo.mell0" } as MceCarouselContent;
      const safe: MceCarouselContent = { ...fallback(tema), ...content, handle: content.handle };
      setContent(safe);
      setActive(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4" style={{ borderColor: "#EF9F2733", background: "#EF9F270A" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "#EF9F27" }} />
          <p className="font-semibold tracking-wide">CARROSSEL MCE EDUCACIONAL</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          7 slides fixos em 4:5: capa, a dor, os pilares M / C / E, integração e o convite pro Diagnóstico MCE.
        </p>
      </div>

      <CarouselStyleSwitch style={style} onChange={setStyle} disabled={loading} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder='Tema do carrossel (ex: "Por que a dieta falha")'
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Gerando…" : "Gerar 7 slides"}
        </Button>
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="mx-auto max-w-sm overflow-hidden rounded-xl border" style={{ borderColor: "#EF9F2733" }}>
            <img src={images[active]} alt={`Slide ${active + 1} — ${SLIDE_LABELS[active]}`} className="w-full" />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className="rounded-md border px-2 py-1 text-[10px] font-mono"
                style={{
                  borderColor: i === active ? "#EF9F27" : "rgba(255,255,255,0.12)",
                  color: i === active ? "#EF9F27" : undefined,
                }}
              >
                {i + 1} · {SLIDE_LABELS[i]}
              </button>
            ))}
          </div>
          {content && (
            <SlideTextEditor
              content={content}
              onApply={(next) => setContent(next)}
            />
          )}
          <SaveShareButtons
            items={images.map((url, i) => ({
              url,
              filename: `mce-carrossel-${i + 1}-${SLIDE_LABELS[i].toLowerCase().replace(/\s+/g, "-")}.png`,
            }))}
            labelSalvar="Salvar os 7 slides no álbum"
            texto={tema}
          />
          <div className="rounded-xl border p-4" style={{ borderColor: "#5DCAA533", background: "#5DCAA50A" }}>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: "#5DCAA5" }} />
              <p className="text-sm font-semibold tracking-wide">MELHORES HORÁRIOS PARA POSTAR</p>
            </div>
            <p className="mt-2 text-sm">
              Hoje: <strong style={{ color: "#5DCAA5" }}>{horarioHoje.hora}</strong>{" "}
              <span className="text-muted-foreground">— {horarioHoje.motivo}</span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Carrossel educativo: <strong>12h30</strong> (dia útil) · <strong>10h30</strong> (fim de semana)</li>
              <li>Janela alternativa de salvamento: <strong>20h-22h</strong> — conteúdo de referência é salvo à noite</li>
              <li>Stories chamando o carrossel: <strong>08h-09h</strong>, <strong>12h-13h</strong> e <strong>21h-22h</strong></li>
              <li>Comentário fixo com o link do Diagnóstico: <strong>até 5 min</strong> depois de publicar</li>
            </ul>
          </div>
          <PosSlidesPanel tipo="MCE" tema={tema} handle={handle} />
          <p className="text-center text-[11px] text-muted-foreground">
            Slide 7 fixo: {MCE_CTA_SLIDE.titulo} — {MCE_CTA_SLIDE.caixa}.
          </p>
        </div>
      )}
    </div>
  );
}
