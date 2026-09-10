import { useEffect, useMemo, useState } from "react";
import { Copy, Images, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SaveShareButtons from "@/components/social/SaveShareButtons";
import InstagramAcoesPanel from "@/components/social/InstagramAcoesPanel";
import { supabase } from "@/integrations/supabase/client";
import { renderModuleCarousel, type ModuleSlide } from "@/lib/moduleCarouselTemplate";
import CarouselStyleSwitch from "@/components/social/CarouselStyleSwitch";
import { useCarouselStyle } from "@/hooks/useCarouselStyle";
import { renderTechSlides } from "@/lib/techSlideTemplate";
import { moduleToTech } from "@/lib/techAdapters";
import { renderStoryFrames, type StoryFrame } from "@/lib/storyFrameTemplate";
import {
  CONFIGS_MODULO,
  TIPOS_POR_MODULO,
  coletarDadosModulo,
  type DadosModulo,
  type ModuloConteudo,
  type TipoConteudo,
} from "@/lib/moduleContent";

type Formato = "carrossel" | "reels" | "stories";

type Resultado = {
  titulo?: string;
  carrossel?: {
    slides?: ModuleSlide[];
    legenda?: string;
    self_comment?: string;
    hashtags_top5?: string[];
    hashtags_15?: string[];
  };
  reels?: {
    hook?: string;
    duracao?: string;
    cortes?: { segundo?: string; texto_tela?: string; fala?: string; acao?: string }[];
    legenda_reels?: string;
    musica?: string;
  };
  stories?: { frames?: { tipo?: string; texto?: string; subtexto?: string; opcoes?: string[]; fundo?: string }[] };
  timing?: { stories?: string; reels?: string; carrossel?: string };
  checklist?: string[];
  disclaimer?: string;
};

const copiar = async (texto: string, label: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado.`);
  } catch {
    toast.error("Não consegui copiar agora.");
  }
};

const paraStoryFrames = (frames: NonNullable<Resultado["stories"]>["frames"] = []): StoryFrame[] =>
  frames.map((f) => {
    const interativo = f.tipo === "ENQUETE" || f.tipo === "QUIZ";
    return {
      tipo: f.tipo,
      texto_principal: f.texto,
      texto_secundario: f.subtexto,
      pergunta: interativo ? f.texto : undefined,
      opcao_1: interativo ? f.opcoes?.[0] : undefined,
      opcao_2: interativo ? f.opcoes?.[1] : undefined,
      cor_fundo: f.fundo,
      cta: f.tipo === "CTA" ? f.subtexto : undefined,
    };
  });

export default function ModuleContentPanel({
  modulo,
  handle = "diogo.mell0",
}: {
  modulo: ModuloConteudo;
  handle?: string;
}) {
  const config = CONFIGS_MODULO[modulo];
  const tipos = TIPOS_POR_MODULO[modulo];
  const [contexto, setContexto] = useState<DadosModulo | null>(null);
  const [foco, setFoco] = useState<string>("");
  const [gerando, setGerando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);
  const [slidesBrutos, setSlidesBrutos] = useState<ModuleSlide[] | null>(null);
  const [style, setStyle] = useCarouselStyle();

  /** Desenha os slides do módulo no estilo escolhido. */
  const renderSlidesModulo = async (brutos: ModuleSlide[], estilo: typeof style) =>
    estilo === "tech"
      ? renderTechSlides(moduleToTech(brutos, config.titulo), { handle })
      : renderModuleCarousel(brutos, handle, config.titulo);

  // Ao trocar o estilo, redesenha o carrossel já gerado.
  useEffect(() => {
    if (!slidesBrutos?.length) return;
    let vivo = true;
    void (async () => {
      const imgs = await renderSlidesModulo(slidesBrutos, style);
      if (vivo) setSlides(imgs);
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slidesBrutos, style]);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const d = await coletarDadosModulo(modulo);
      if (vivo) {
        setContexto(d);
        setFoco(d.focos[0] || "");
      }
    })();
    return () => {
      vivo = false;
    };
  }, [modulo]);

  const sugestao = useMemo(() => tipos[0], [tipos]);

  const gerar = async (tipo: TipoConteudo, formatos: Formato[]) => {
    setGerando(`${tipo.id}-${formatos.join()}`);
    setResultado(null);
    setSlides([]);
    setSlidesBrutos(null);
    setStories([]);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: "module_content",
          modulo,
          tipoConteudo: `${tipo.titulo} — ${tipo.descricao}`,
          foco: foco || undefined,
          formatos,
          dadosReais: contexto?.dados ?? null,
          handle,
          tom: config.tom,
          cta: config.cta,
          emojis: config.emojis,
          hashtagsFixas: config.hashtagsFixas,
          nuncaMencionar: config.nuncaMencionar,
          disclaimer: !!config.disclaimer,
        },
      });
      if (error) throw error;
      const res = (data?.result || {}) as Resultado;
      setResultado(res);

      if (formatos.includes("carrossel") && res.carrossel?.slides?.length) {
        setSlidesBrutos(res.carrossel.slides);
      }
      if (formatos.includes("stories") && res.stories?.frames?.length) {
        setStories(renderStoryFrames({ frames: paraStoryFrames(res.stories.frames) }, handle));
      }
      toast.success("Conteúdo gerado com os dados reais desta tela.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar o conteúdo agora.");
    } finally {
      setGerando(null);
    }
  };

  const busy = (id: string) => gerando?.startsWith(id);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <p className="text-xs uppercase tracking-widest text-primary">{config.titulo}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {contexto ? contexto.resumo : "Lendo os dados desta tela…"}
        </p>
      </div>

      <CarouselStyleSwitch style={style} onChange={setStyle} disabled={!!gerando} />

      <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">⚡ Melhor pra hoje</p>
        <p className="mt-1 text-sm font-semibold">{sugestao.titulo}</p>
        <p className="text-xs text-muted-foreground">{sugestao.descricao}</p>
        <Button
          className="mt-3 w-full gap-2"
          disabled={!!gerando}
          onClick={() => gerar(sugestao, sugestao.formatos)}
        >
          {busy(sugestao.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Gerar tudo
        </Button>
      </div>

      {contexto?.focos.length ? (
        <label className="block text-xs text-muted-foreground">
          Foco
          <select
            className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
            value={foco}
            onChange={(e) => setFoco(e.target.value)}
          >
            {contexto.focos.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Escolher manualmente</p>
        {tipos.map((t) => (
          <div key={t.id} className="rounded-lg border border-border/60 p-3">
            <p className="text-sm font-semibold">
              {t.emoji} {t.titulo}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t.descricao}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.formatos.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant="outline"
                  disabled={!!gerando}
                  onClick={() => gerar(t, [f])}
                >
                  {f === "carrossel" ? "📑 Carrossel" : f === "reels" ? "🎬 Reels" : "📱 Stories"}
                </Button>
              ))}
              {t.formatos.length > 1 && (
                <Button size="sm" disabled={!!gerando} onClick={() => gerar(t, t.formatos)}>
                  ✦ Tudo
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {resultado && (
        <div className="space-y-4 border-t border-border/60 pt-4">
          <p className="text-sm font-bold">✅ {resultado.titulo || "Conteúdo gerado"}</p>

          {slides.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                <Images className="mr-1 inline h-3 w-3" /> Carrossel ({slides.length} slides)
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {slides.map((s, i) => (
                  <img key={i} src={s} alt={`Slide ${i + 1}`} className="h-40 w-auto rounded border border-border/60" />
                ))}
              </div>
              <SaveShareButtons
                items={slides.map((url, i) => ({ url, filename: `nutrion-${modulo.toLowerCase()}-${i + 1}.png` }))}
                texto={resultado.carrossel?.legenda}
              />
            </div>
          )}

          {(slides.length > 0 || stories.length > 0) && (
            <InstagramAcoesPanel tema={config.titulo} />
          )}

          {stories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Stories ({stories.length})</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {stories.map((s, i) => (
                  <img key={i} src={s} alt={`Story ${i + 1}`} className="h-40 w-auto rounded border border-border/60" />
                ))}
              </div>
              <SaveShareButtons
                items={stories.map((url, i) => ({ url, filename: `nutrion-story-${i + 1}.png` }))}
                labelSalvar={`Salvar ${stories.length} stories`}
              />
            </div>
          )}

          {resultado.reels?.cortes?.length ? (
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Roteiro Reels {resultado.reels.duracao ? `(${resultado.reels.duracao})` : ""}
              </p>
              <p className="text-sm font-semibold">{resultado.reels.hook}</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {resultado.reels.cortes.map((c, i) => (
                  <li key={i}>
                    <span className="text-primary">{c.segundo}</span> · <strong>{c.texto_tela}</strong> — {c.fala}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() =>
                    copiar(
                      (resultado.reels?.cortes || [])
                        .map((c) => `${c.segundo}\n${c.texto_tela}\n${c.fala}\n${c.acao}`)
                        .join("\n\n"),
                      "Roteiro",
                    )
                  }
                >
                  <Copy className="h-3 w-3" /> Roteiro
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() =>
                    copiar((resultado.reels?.cortes || []).map((c) => c.texto_tela || "").join("\n"), "Textos de tela")
                  }
                >
                  <Copy className="h-3 w-3" /> Textos de tela
                </Button>
              </div>
            </div>
          ) : null}

          {resultado.carrossel?.legenda && (
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              <p className="whitespace-pre-wrap text-xs text-muted-foreground">{resultado.carrossel.legenda}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => copiar(resultado.carrossel!.legenda!, "Legenda")}>
                  <Copy className="h-3 w-3" /> Legenda
                </Button>
                {resultado.carrossel.self_comment && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => copiar(resultado.carrossel!.self_comment!, "Self-comment")}>
                    <Copy className="h-3 w-3" /> Self-comment
                  </Button>
                )}
                {resultado.carrossel.hashtags_top5?.length ? (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => copiar(resultado.carrossel!.hashtags_top5!.join(" "), "Top 5 hashtags")}>
                    <Copy className="h-3 w-3" /> Top 5
                  </Button>
                ) : null}
                {resultado.carrossel.hashtags_15?.length ? (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => copiar(resultado.carrossel!.hashtags_15!.join(" "), "15 hashtags")}>
                    <Copy className="h-3 w-3" /> 15 hashtags
                  </Button>
                ) : null}
              </div>
            </div>
          )}

          {resultado.timing && (
            <p className="text-xs text-muted-foreground">
              ⏰ Stories {resultado.timing.stories} · Reels {resultado.timing.reels} · Carrossel {resultado.timing.carrossel}
            </p>
          )}

          {resultado.checklist?.length ? (
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Checklist</p>
              <ul className="mt-1 space-y-1 text-xs">
                {resultado.checklist.map((c, i) => (
                  <li key={i}>☐ {c}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {resultado.disclaimer ? (
            <Badge variant="outline" className="whitespace-normal text-[10px] leading-tight">
              {resultado.disclaimer}
            </Badge>
          ) : null}
        </div>
      )}
    </div>
  );
}
