import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Images, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import CarouselStyleSwitch from "@/components/social/CarouselStyleSwitch";
import { useCarouselStyle } from "@/hooks/useCarouselStyle";
import { renderTechSlides } from "@/lib/techSlideTemplate";
import { treinoHojeToTech } from "@/lib/techAdapters";
import SaveShareButtons from "@/components/social/SaveShareButtons";
import SlideTextEditor from "@/components/social/SlideTextEditor";
import {
  getProtocoloPreferido,
  getTreinoDeHoje,
  listarProtocolosTreino,
  setProtocoloPreferido,
  type ProtocoloOpcao,
  type TreinoHoje,
} from "@/lib/treinoHojeData";
import {
  TREINO_HASHTAGS,
  TREINO_STORY_LABELS,
  renderTreinoHojeCarousel,
  renderTreinoHojeStories,
  treinoHojeLegenda,
  treinoHojeSlideLabels,
} from "@/lib/treinoHojeTemplate";

const AMBER = "#EF9F27";

const loadPhoto = (file: File) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });

/**
 * "Treino de hoje": lê a sessão real do TrainingON do próprio coach e monta o
 * post (carrossel + stories) com a foto dele na capa. Sem print, sem invenção.
 */
export default function TreinoHojePanel({ file, handle }: { file?: File | null; handle?: string }) {
  const at = handle || "diogo.mell0";
  const [treino, setTreino] = useState<TreinoHoje | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [slides, setSlides] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);
  const [ativo, setAtivo] = useState(0);
  const [fotoImg, setFotoImg] = useState<HTMLImageElement | null>(null);
  const [protocolos, setProtocolos] = useState<ProtocoloOpcao[]>([]);
  const [protocoloId, setProtocoloId] = useState<string>("");
  const [style, setStyle] = useCarouselStyle();

  /** Carrossel no estilo escolhido: clássico (foto na capa) ou tech científico. */
  const renderCarrossel = async (t: TreinoHoje, foto: HTMLImageElement | null, estilo: typeof style) =>
    estilo === "tech"
      ? renderTechSlides(treinoHojeToTech(t), { handle: at })
      : renderTreinoHojeCarousel(t, foto, at);

  const carregar = async (id?: string) => {
    setCarregando(true);
    try {
      const t = await getTreinoDeHoje(id || undefined);
      setTreino(t);
      if (!t) toast.error("Não encontrei um protocolo do TrainingON com exercícios para hoje.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const lista = await listarProtocolosTreino();
      setProtocolos(lista);
      const salvo = getProtocoloPreferido();
      const inicial = (salvo && lista.some((p) => p.id === salvo) ? salvo : lista[0]?.id) || "";
      setProtocoloId(inicial);
      await carregar(inicial);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const gerar = async () => {
    if (!treino) return;
    setGerando(true);
    try {
      const foto = file ? await loadPhoto(file) : null;
      setFotoImg(foto);
      setSlides(await renderCarrossel(treino, foto, style));
      setStories(renderTreinoHojeStories(treino, foto, at));
      setAtivo(0);
      toast.success("Post do treino de hoje pronto.");
    } catch {
      toast.error("Não consegui montar as imagens agora.");
    } finally {
      setGerando(false);
    }
  };

  const legenda = treino ? treinoHojeLegenda(treino) : "";
  const labels = treino ? treinoHojeSlideLabels(treino) : [];
  const itens = [
    ...slides.map((url, i) => ({ url, filename: `treino-hoje-${String(i + 1).padStart(2, "0")}.png` })),
    ...stories.map((url, i) => ({ url, filename: `treino-hoje-story-${i + 1}.png` })),
  ];

  if (carregando) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/10 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Sincronizando com o TrainingON...
      </div>
    );
  }

  if (!treino) {
    return (
      <div className="rounded-lg border border-white/10 p-4 text-sm text-muted-foreground">
        Não achei a sua sessão de hoje no TrainingON. Gere ou abra o protocolo lá e volte aqui.
        <div className="mt-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void carregar(protocoloId)}>
            <RefreshCw className="h-4 w-4" /> Tentar de novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {protocolos.length > 1 && (
        <div className="rounded-lg border border-white/10 p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Protocolo do TrainingON</div>
          <select
            value={protocoloId}
            onChange={(e) => {
              setProtocoloId(e.target.value);
              setProtocoloPreferido(e.target.value);
              setSlides([]);
              setStories([]);
              void carregar(e.target.value);
            }}
            className="mt-2 w-full rounded-md border border-white/10 bg-transparent p-2 text-sm"
          >
            {protocolos.map((p) => (
              <option key={p.id} value={p.id} className="bg-background">
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="rounded-lg border border-white/10 p-4">

        <div className="text-[10px] uppercase tracking-widest" style={{ color: AMBER }}>
          {treino.sincronizado ? "Sincronizado com a agenda de hoje" : "Treino de hoje"}
        </div>
        <div className="mt-1 text-lg font-bold">{treino.nomeTreino}</div>
        <div className="text-xs text-muted-foreground">
          {[treino.diaSemana, treino.duracao, treino.agenda?.horario, treino.grupos.slice(0, 4).join(" · ")]
            .filter(Boolean)
            .join(" · ")}
        </div>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {treino.exercicios.map((e, i) => (
            <li key={`${e.nome}-${i}`}>
              <span style={{ color: AMBER }}>{String(i + 1).padStart(2, "0")}</span> {e.nome}
              {e.sets[0]?.detail ? ` — ${e.sets[0].detail}` : ""}
            </li>
          ))}
        </ul>
      </div>

      <CarouselStyleSwitch style={style} onChange={setStyle} disabled={gerando} />

      <div className="flex flex-wrap gap-2">
        <Button className="gap-2" disabled={gerando} onClick={() => void gerar()}>
          {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}
          Gerar post do treino
        </Button>
        <Button variant="outline" size="icon" onClick={() => void carregar(protocoloId)} title="Recarregar treino">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {!file && (
        <div className="text-xs text-muted-foreground">
          Escolha uma foto no álbum para ela entrar como capa do carrossel e do story.
        </div>
      )}

      {!!slides.length && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[...labels, ...TREINO_STORY_LABELS.map((l) => `STORY ${l}`)].map((l, i) => (
              <button
                key={`${l}-${i}`}
                onClick={() => setAtivo(i)}
                className="shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide"
                style={{
                  borderColor: i === ativo ? AMBER : "#ffffff22",
                  color: i === ativo ? AMBER : "#888",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <img
            src={[...slides, ...stories][ativo]}
            alt={`Slide ${ativo + 1} do treino de hoje`}
            className="w-full rounded-lg border border-white/10"
          />
          <SlideTextEditor
            content={treino}
            onApply={(next) => {
              setTreino(next);
              void renderCarrossel(next, fotoImg, style).then(setSlides);
              setStories(renderTreinoHojeStories(next, fotoImg, at));
            }}
          />
          <SaveShareButtons items={itens} texto={legenda} />
        </>
      )}

      <div className="rounded-lg border border-white/10 p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Legenda</div>
        <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{legenda}</pre>
        <div className="mt-2 text-xs" style={{ color: AMBER }}>
          {TREINO_HASHTAGS.join(" ")}
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              navigator.clipboard.writeText(`${legenda}\n\n${TREINO_HASHTAGS.join(" ")}`);
              toast.success("Legenda copiada.");
            }}
          >
            <Copy className="h-4 w-4" /> Copiar legenda
          </Button>
        </div>
      </div>
    </div>
  );
}
