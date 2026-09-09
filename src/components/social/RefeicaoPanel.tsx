import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Download, Film, Layers, Loader2, Images } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import PosSlidesPanel from "@/components/social/PosSlidesPanel";
import {
  getDadosRefeicao,
  getDadosDeRegistro,
  getRefeicoesRegistradasHoje,
  type DadosRefeicao,
  type RefeicaoRegistrada,
} from "@/lib/refeicaoData";
import { renderRefeicaoCarousel, type RefeicaoSlide } from "@/lib/refeicaoCarouselTemplate";
import { renderRefeicaoStories, type RefeicaoStoryFrame } from "@/lib/refeicaoStoriesTemplate";

const AMBER = "#EF9F27";

type CarrosselAI = {
  capa?: { tag?: string; titulo?: string; subtitulo?: string };
  contexto?: { titulo?: string; corpo?: string };
  ciencia?: { alimento?: string; frase?: string }[];
  aplicacao?: { titulo?: string; bullets?: string[] };
  legenda?: string;
  legenda_curta?: string;
  hashtags?: { alcance?: string[]; nicho?: string[]; micro?: string[] };
  timing?: { feed_horario?: string; motivo_horario?: string };
};
type StoriesAI = { frames?: RefeicaoStoryFrame[]; legenda?: string; hashtags?: string[] };
type ReelsAI = {
  hook?: string;
  duracao_total?: string;
  cortes?: { segundo?: string; texto_tela?: string; fala?: string; acao?: string }[];
  musica_sugerida?: string;
  legenda?: string;
  hashtags?: string[];
};

const loadPhoto = (file: File) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });

const baixar = (dataUrl: string, nome: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = nome;
  a.click();
};

const copiar = (txt: string) => {
  navigator.clipboard.writeText(txt);
  toast.success("Copiado.");
};

/** Monta os 9 slides misturando dados REAIS do plano com os textos gerados. */
function montarSlides(d: DadosRefeicao, ai: CarrosselAI): RefeicaoSlide[] {
  const slides: RefeicaoSlide[] = [];
  slides.push({
    tipo: "CAPA",
    tag: ai.capa?.tag || "REFEIÇÃO REAL",
    titulo: ai.capa?.titulo || d.nome,
    subtitulo: ai.capa?.subtitulo || [d.tag, d.calorias ? `${d.calorias} kcal` : ""].filter(Boolean).join(" · "),
  });

  const linhas: { label: string; valor: string }[] = [];
  if (d.calorias) linhas.push({ label: "Calorias", valor: `${d.calorias} kcal` });
  if (d.macros.proteina) linhas.push({ label: "Proteína", valor: `${d.macros.proteina}g` });
  if (d.macros.carbo) linhas.push({ label: "Carboidrato", valor: `${d.macros.carbo}g` });
  if (d.macros.gordura) linhas.push({ label: "Gordura", valor: `${d.macros.gordura}g` });
  linhas.push({ label: "Horário", valor: d.horario });
  if (d.tag) linhas.push({ label: "Momento", valor: d.tag });
  slides.push({ tipo: "FICHA", tag: "FICHA DA REFEIÇÃO", titulo: d.nome, linhas });

  slides.push({
    tipo: "LISTA",
    tag: "O QUE TEM NO PRATO",
    titulo: "Alimentos e porções",
    itens: d.alimentos.slice(0, 7).map((a) => ({
      titulo: a.nome,
      sub: [a.porcao, a.kcal ? `${Math.round(a.kcal)} kcal` : ""].filter(Boolean).join(" · ") || undefined,
    })),
  });

  const frases = new Map((ai.ciencia || []).map((c) => [(c.alimento || "").toLowerCase(), c.frase || ""]));
  for (const item of d.ciencia.slice(0, 3)) {
    slides.push({
      tipo: "CIENCIA",
      tag: "POR QUE FUNCIONA",
      alimento: item.alimento,
      nutriente: item.ciencia.nutriente_chave,
      mecanismo: frases.get(item.alimento.toLowerCase()) || item.ciencia.mecanismo,
      dado: item.ciencia.dado,
      bonus: item.ciencia.bonus || item.ciencia.conexao_microbiota,
      fonte: item.ciencia.estudo,
    });
  }

  if (d.nutrisync) {
    const b: string[] = [];
    if (d.nutrisync.meta) b.push(`Meta de hoje: ${d.nutrisync.meta} kcal`);
    if (d.nutrisync.ajusteTreino) b.push(`Ajuste do treino: +${d.nutrisync.ajusteTreino} kcal`);
    if (d.nutrisync.consumidoAteAgora) b.push(`Consumido até agora: ${d.nutrisync.consumidoAteAgora} kcal`);
    if (d.nutrisync.restante) b.push(`Restante do dia: ${d.nutrisync.restante} kcal`);
    if (d.nutrisync.treinoTipo) b.push(`Treino do dia: ${d.nutrisync.treinoTipo}`);
    if (b.length)
      slides.push({
        tipo: "TEXTO",
        tag: "CONTEXTO DO DIA",
        titulo: ai.contexto?.titulo || "Esse prato não é aleatório",
        corpo: ai.contexto?.corpo,
        bullets: b,
      });
  }

  if (ai.aplicacao?.bullets?.length)
    slides.push({
      tipo: "TEXTO",
      tag: "NA PRÁTICA",
      titulo: ai.aplicacao.titulo || "Como aplicar hoje",
      bullets: ai.aplicacao.bullets.slice(0, 5),
    });

  slides.push({
    tipo: "CTA",
    tag: "PRÓXIMO PASSO",
    titulo: "Diagnóstico MCE Gratuito",
    subtitulo: "Descubra qual pilar está travando seu resultado.",
    caixa: "Link na bio",
    caixaSub: "14 perguntas · 4 minutos · resultado imediato",
  });

  return slides;
}

export default function RefeicaoPanel({ file, handle }: { file: File; handle: string }) {
  const [dados, setDados] = useState<DadosRefeicao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [carrossel, setCarrossel] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);
  const [reels, setReels] = useState<ReelsAI | null>(null);
  const [legenda, setLegenda] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [timing, setTiming] = useState<{ feed_horario?: string; motivo_horario?: string } | null>(null);
  const [registros, setRegistros] = useState<RefeicaoRegistrada[]>([]);
  const [registroId, setRegistroId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        const [doPlano, logs] = await Promise.all([getDadosRefeicao(), getRefeicoesRegistradasHoje()]);
        setRegistros(logs);
        // Se o coach já registrou essa refeição hoje, ela vale mais que o plano:
        // são as kcal e os macros que ele de fato comeu.
        const igual = doPlano ? logs.find((l) => l.slotKey === doPlano.slotKey) : logs[0];
        if (igual) {
          setRegistroId(igual.id);
          setDados(await getDadosDeRegistro(igual));
        } else {
          setDados(doPlano);
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  /** Troca a fonte do conteúdo: refeição registrada X refeição do plano. */
  const usarRegistro = async (r: RefeicaoRegistrada | null) => {
    setCarregando(true);
    try {
      setRegistroId(r?.id ?? null);
      setDados(r ? await getDadosDeRegistro(r) : await getDadosRefeicao());
      setCarrossel([]);
      setStories([]);
      setReels(null);
    } finally {
      setCarregando(false);
    }
  };

  const gerar = async (formato: "carrossel" | "stories" | "reels") => {
    setLoading(formato);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode:
            formato === "carrossel"
              ? "refeicao_carrossel"
              : formato === "stories"
                ? "refeicao_stories"
                : "refeicao_reels",
          topic: dados?.nome || "refeição do dia",
          handle,
          refeicaoData: dados,
        },
      });
      if (error) throw error;
      const result = (data as { result?: unknown })?.result || {};
      const photo = await loadPhoto(file);

      if (formato === "carrossel") {
        const ai = result as CarrosselAI;
        if (!dados) throw new Error("Sem plano alimentar de hoje para essa refeição.");
        setCarrossel(renderRefeicaoCarousel(montarSlides(dados, ai), handle, photo));
        setLegenda(cleanCaption(ai.legenda));
        setHashtags([...(ai.hashtags?.alcance || []), ...(ai.hashtags?.nicho || []), ...(ai.hashtags?.micro || [])]);
        setTiming(ai.timing || null);
        setStories([]);
        setReels(null);
      } else if (formato === "stories") {
        const ai = result as StoriesAI;
        setStories(renderRefeicaoStories(ai.frames || [], handle, photo));
        setLegenda(cleanCaption(ai.legenda));
        setHashtags(ai.hashtags || []);
        setCarrossel([]);
        setReels(null);
      } else {
        const ai = result as ReelsAI;
        setReels(ai);
        setLegenda(cleanCaption(ai.legenda));
        setHashtags(ai.hashtags || []);
        setCarrossel([]);
        setStories([]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(null);
    }
  };

  const roteiro = reels
    ? [
        `ROTEIRO REELS — ${dados?.nome || "refeição"}`,
        `Hook: ${reels.hook || ""}`,
        "",
        ...(reels.cortes || []).map((c) => `[${c.segundo}] TELA: ${c.texto_tela}\nFALA: ${c.fala}\nAÇÃO: ${c.acao}`),
      ].join("\n")
    : "";

  return (
    <div className="space-y-3">
      <Card className="border" style={{ borderColor: `${AMBER}40`, backgroundColor: `${AMBER}0A` }}>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-semibold" style={{ color: AMBER }}>
            🍽️ REFEIÇÃO DETECTADA
          </p>

          {carregando && (
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Puxando a refeição do seu plano…
            </p>
          )}

          {!!registros.length && (
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Refeições que você registrou hoje</p>
              <div className="flex flex-wrap gap-1.5">
                {registros.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => usarRegistro(r)}
                    className="rounded-md border px-2 py-1 text-[10px]"
                    style={{
                      borderColor: registroId === r.id ? AMBER : "rgba(255,255,255,0.12)",
                      color: registroId === r.id ? AMBER : "#9ca3af",
                    }}
                  >
                    {r.nome} · {r.horario}
                    {r.calorias ? ` · ${Math.round(r.calorias)} kcal` : ""}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => usarRegistro(null)}
                  className="rounded-md border px-2 py-1 text-[10px]"
                  style={{
                    borderColor: registroId === null ? AMBER : "rgba(255,255,255,0.12)",
                    color: registroId === null ? AMBER : "#9ca3af",
                  }}
                >
                  Usar o plano
                </button>
              </div>
            </div>
          )}

          {!carregando && !dados && (
            <p className="text-xs text-gray-400">
              Não encontrei essa refeição no seu plano alimentar de hoje. Cadastre no NutriPlan para o conteúdo sair
              com os dados reais do prato.
            </p>
          )}

          {dados && (
            <div className="space-y-2">
              <p className="text-xs text-gray-300">
                {dados.nome} · {dados.horario}
                {dados.tag ? ` · ${dados.tag}` : ""}
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-400">
                {dados.calorias && <span className="rounded border border-gray-800 px-2 py-1">{dados.calorias} kcal</span>}
                {dados.macros.proteina && <span className="rounded border border-gray-800 px-2 py-1">P {dados.macros.proteina}g</span>}
                {dados.macros.carbo && <span className="rounded border border-gray-800 px-2 py-1">C {dados.macros.carbo}g</span>}
                {dados.macros.gordura && <span className="rounded border border-gray-800 px-2 py-1">G {dados.macros.gordura}g</span>}
              </div>
              <ul className="space-y-0.5">
                {dados.alimentos.map((a) => (
                  <li key={a.nome} className="text-[11px] text-gray-400">
                    • {a.nome}
                    {a.porcao ? ` — ${a.porcao}` : ""}
                  </li>
                ))}
              </ul>
              {!!dados.ciencia.length && (
                <p className="text-[10px] text-gray-500">
                  Ciência disponível para: {dados.ciencia.map((c) => c.alimento).join(", ")}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                { id: "stories", label: "Stories (5)", icon: <Layers className="h-4 w-4" /> },
                { id: "carrossel", label: "Carrossel (9)", icon: <Images className="h-4 w-4" /> },
                { id: "reels", label: "Reels 30s", icon: <Film className="h-4 w-4" /> },
              ] as const
            ).map((b) => (
              <Button
                key={b.id}
                onClick={() => gerar(b.id)}
                disabled={!!loading || !dados}
                className="gap-2 bg-[#EF9F27] text-black hover:bg-[#EF9F27]/90"
              >
                {loading === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : b.icon}
                {b.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!!(carrossel.length || stories.length) && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[...carrossel, ...stories].map((src, i) => (
            <div key={i} className="space-y-1">
              <img src={src} alt={`Slide ${i + 1}`} className="w-full rounded-lg border border-gray-800" />
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1 border-gray-700 text-[10px] text-gray-300"
                onClick={() => baixar(src, `refeicao-${carrossel.length ? "slide" : "story"}-${i + 1}.png`)}
              >
                <Download className="h-3 w-3" /> Baixar
              </Button>
            </div>
          ))}
        </div>
      )}

      {reels && (
        <Card className="border-gray-800 bg-black/40">
          <CardContent className="space-y-2 p-4">
            <p className="text-xs font-semibold text-white">🎬 Roteiro Reels — {dados?.nome}</p>
            {reels.hook && <p className="text-xs text-gray-300">Hook: {reels.hook}</p>}
            {(reels.cortes || []).map((c, i) => (
              <div key={i} className="rounded-lg border p-3" style={{ borderColor: `${AMBER}26` }}>
                <p className="text-[10px] font-bold" style={{ color: AMBER }}>
                  {c.segundo}
                </p>
                <p className="text-xs font-bold uppercase text-white">{c.texto_tela}</p>
                <p className="mt-1 text-[11px] text-gray-400">Fala: {c.fala}</p>
                <p className="text-[11px] text-gray-500">Ação: {c.acao}</p>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-gray-700 text-[11px] text-gray-300"
              onClick={() => copiar(roteiro)}
            >
              <Copy className="h-3 w-3" /> Copiar roteiro
            </Button>
          </CardContent>
        </Card>
      )}

      {(legenda || hashtags.length) && (
        <Card className="border-gray-800 bg-black/40">
          <CardContent className="space-y-2 p-4">
            {legenda && <p className="whitespace-pre-wrap text-[11px] text-gray-300">{legenda}</p>}
            {!!hashtags.length && <p className="text-[10px] text-gray-500">{hashtags.join(" ")}</p>}
            {timing?.feed_horario && (
              <p className="text-[10px] text-gray-500">
                ⏰ {timing.feed_horario} — {timing.motivo_horario}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {legenda && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-gray-700 text-[11px] text-gray-300"
                  onClick={() => copiar(legenda)}
                >
                  <Copy className="h-3 w-3" /> Copiar legenda
                </Button>
              )}
              {!!hashtags.length && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-gray-700 text-[11px] text-gray-300"
                  onClick={() => copiar(hashtags.join(" "))}
                >
                  <Copy className="h-3 w-3" /> Copiar hashtags
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(!!carrossel.length || !!stories.length || !!reels) && (
        <PosSlidesPanel tipo="REFEICAO" tema={dados?.nome || "refeição do dia"} dados={dados} handle={handle} />
      )}
    </div>
  );
}
