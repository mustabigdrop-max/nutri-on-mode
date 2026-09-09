import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import { loadImage, ensureFonts } from "@/lib/photoStoryTemplates";
import { downloadMany } from "@/lib/socialImageKit";
import {
  FOCO_OPTIONS, getDadosTreino, type FocoResultado, type DadosTreino,
} from "@/lib/resultadoProtocoloData";
import {
  renderResultadoProtocoloCarousel, RP_SLIDE_LABELS, RP_TPL, type ResultadoProtocoloContent,
} from "@/lib/resultadoProtocoloTemplate";

const C = {
  s1: "#0B0B12", s2: "#10101A", border: "#ffffff14",
  gold: RP_TPL.gold, green: RP_TPL.green, purple: RP_TPL.purple,
  white: "#F0F0F8", text: "#C8C8D8", muted: "#6A6A7A",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

type Formato = "carrossel" | "reels" | "stories";
const FORMATOS: { id: Formato; label: string; emoji: string }[] = [
  { id: "carrossel", label: "Carrossel", emoji: "📑" },
  { id: "reels", label: "Reels", emoji: "🎬" },
  { id: "stories", label: "Stories", emoji: "📱" },
];

const Bloco = ({ titulo, cor, children }: { titulo: string; cor: string; children: React.ReactNode }) => (
  <div style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
    <div style={{ fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: cor, marginBottom: 10 }}>{titulo}</div>
    {children}
  </div>
);

const acao = (cor: string): React.CSSProperties => ({
  padding: "8px 12px", background: `${cor}16`, border: `1px solid ${cor}55`, borderRadius: 8,
  color: cor, fontFamily: F.t, fontSize: 12, fontWeight: 700, cursor: "pointer",
});

const copiar = async (texto: string, label: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`);
  } catch {
    toast.error("Não consegui copiar aqui.");
  }
};

type RoteiroTexto = { legenda: string; hashtags: string[] };

/** Shape do resultado da IA para o modo "resultado_protocolo" (ver SCHEMAS no edge function). */
type ResultadoProtocoloAI = {
  capa?: { tag?: string; titulo?: string; subtitulo?: string };
  resultado?: { titulo?: string; corpo?: string; numero?: string; numero_label?: string };
  nutricao?: { titulo?: string; corpo?: string };
  resumo_frase?: string;
  legenda?: string;
  hashtags?: string[];
};

/**
 * "Resultado + Protocolo": conecta a evolução física real do coach com o
 * protocolo (APEX/TrainingON) que ele usou. Puxa dados reais do treino,
 * a IA só escreve a narrativa em cima deles.
 */
export default function ResultadoProtocoloPanel({
  file, handle,
}: {
  file: File;
  handle?: string;
}) {
  const at = handle || "diogo.mell0";
  const [foco, setFoco] = useState<FocoResultado | null>(null);
  const [formato, setFormato] = useState<Formato>("carrossel");
  const [loading, setLoading] = useState(false);
  const [treino, setTreino] = useState<DadosTreino | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [legenda, setLegenda] = useState("");
  const [hashtagsTxt, setHashtagsTxt] = useState("");
  const [roteiro, setRoteiro] = useState<RoteiroTexto | null>(null);
  const [active, setActive] = useState(0);

  const gerar = async (f: FocoResultado) => {
    setFoco(f);
    setLoading(true);
    setImages([]);
    setRoteiro(null);
    try {
      const dados = await getDadosTreino(f);
      if (!dados) {
        toast.error("Nenhum protocolo estruturado encontrado no TrainingON ainda — gere um protocolo primeiro.");
        setLoading(false);
        return;
      }
      setTreino(dados);

      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: "resultado_protocolo",
          foco: dados.focoLabel,
          treinoData: dados,
          formato,
          handle: at,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error!);
      const r = (data as { result?: ResultadoProtocoloAI })?.result || {};

      const hashtags: string[] = Array.isArray(r.hashtags) ? r.hashtags : [];
      const legendaLimpa = cleanCaption(r.legenda || "");
      setLegenda(legendaLimpa);
      setHashtagsTxt(hashtags.join(" "));

      if (formato !== "carrossel") {
        setRoteiro({ legenda: legendaLimpa, hashtags });
        setLoading(false);
        return;
      }

      const content: ResultadoProtocoloContent = {
        focoLabel: dados.focoLabel,
        handle: at,
        capa: {
          tag: r.capa?.tag || "RESULTADO REAL",
          titulo: r.capa?.titulo || `${dados.focoLabel}: o protocolo por trás`,
          subtitulo: r.capa?.subtitulo || "Como cheguei aqui — passo a passo.",
        },
        resultado: {
          titulo: r.resultado?.titulo || "A evolução não veio por acaso",
          corpo: r.resultado?.corpo || "Cada treino seguiu um sistema documentado — sem improviso, sem achismo.",
          numero: r.resultado?.numero || "",
          numeroLabel: r.resultado?.numero_label || "",
        },
        treino: { nome: dados.nomeTreino, duracao: dados.duracao, grupos: dados.grupos },
        aquecimento: dados.aquecimento,
        exercicios: dados.exercicios,
        apex: dados.apex,
        nutricao: {
          titulo: r.nutricao?.titulo || "A nutrição sustenta o treino",
          corpo:
            r.nutricao?.corpo ||
            (dados.nutricao?.metaDiaKcal
              ? `Meta do dia ajustada para ${dados.nutricao.metaDiaKcal} kcal, considerando o treino de hoje.`
              : "Prioriza proteína e carboidrato de rápida absorção na janela pós-treino — sem isso, o estímulo se perde."),
        },
        resumo: {
          protocolo: `${dados.apex.nome} · ${dados.nomeTreino}`,
          frase: r.resumo_frase || "**Transformação é sistema.** Não é motivação.",
        },
      };

      await ensureFonts();
      const img = await loadImage(file);
      setImages(renderResultadoProtocoloCarousel(content, img));
      setActive(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(false);
    }
  };

  const fullHashtags = useMemo(() => hashtagsTxt, [hashtagsTxt]);

  return (
    <div>
      <Bloco titulo="🏆 RESULTADO + PROTOCOLO" cor={C.gold}>
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginBottom: 12 }}>
          Conecte sua evolução com o protocolo que você usou de verdade. Prova real, dados reais do TrainingON.
        </div>

        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>
          QUAL RESULTADO VOCÊ QUER MOSTRAR?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
          {FOCO_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => !loading && gerar(f.id)}
              disabled={loading}
              style={{
                ...acao(foco === f.id ? C.gold : C.muted),
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px",
                opacity: loading && foco !== f.id ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 16 }}>{f.emoji}</span>
              <span style={{ fontSize: 9 }}>{f.label.toUpperCase()}</span>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 2, color: C.muted, marginBottom: 6 }}>FORMATO</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          {FORMATOS.map((fm) => (
            <button
              key={fm.id}
              onClick={() => setFormato(fm.id)}
              disabled={loading}
              style={{ ...acao(formato === fm.id ? C.green : C.muted), flex: 1 }}
            >
              {fm.emoji} {fm.label.toUpperCase()}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ fontFamily: F.m, fontSize: 10, color: C.gold, marginTop: 10 }}>
            Puxando o treino real do TrainingON e montando o conteúdo...
          </div>
        )}
      </Bloco>

      {treino && !treino.matchExato && (
        <Bloco titulo="AVISO" cor={C.muted}>
          <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted }}>
            Não achei um treino de {treino.focoLabel.toLowerCase()} no seu protocolo atual — usei o treino disponível
            (<strong style={{ color: C.text }}>{treino.nomeTreino}</strong>) pra montar o conteúdo.
          </div>
        </Bloco>
      )}

      {formato === "carrossel" && images.length > 0 && (
        <Bloco titulo={`CARROSSEL PRONTO (${images.length} SLIDES)`} cor={C.gold}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{ ...acao(i === active ? C.gold : C.muted), fontSize: 9, padding: "5px 8px" }}
              >
                {i + 1} · {RP_SLIDE_LABELS[i]}
              </button>
            ))}
          </div>
          {images[active] && (
            <img
              src={images[active]}
              alt={`Slide ${active + 1} — ${RP_SLIDE_LABELS[active]}`}
              style={{ width: "100%", maxWidth: 280, borderRadius: 10, display: "block", margin: "0 auto 10px" }}
            />
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() =>
                downloadMany(
                  images.map((url, i) => ({
                    url, filename: `resultado-protocolo-${i + 1}-${(RP_SLIDE_LABELS[i] || "").toLowerCase().replace(/\s+/g, "-")}.png`,
                  })),
                )
              }
              style={acao(C.green)}
            >
              BAIXAR OS {images.length} SLIDES
            </button>
          </div>
        </Bloco>
      )}

      {formato !== "carrossel" && roteiro && (
        <Bloco titulo={formato === "reels" ? "ROTEIRO DO REELS" : "TEXTO DOS STORIES"} cor={C.gold}>
          <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, whiteSpace: "pre-wrap", marginBottom: 10 }}>
            {roteiro.legenda}
          </div>
          <button onClick={() => copiar(roteiro.legenda, "Texto")} style={acao(C.gold)}>COPIAR TEXTO</button>
        </Bloco>
      )}

      {legenda && (
        <Bloco titulo="LEGENDA" cor={C.purple}>
          <div style={{ fontFamily: F.b, fontSize: 12, color: C.text, whiteSpace: "pre-wrap", marginBottom: 10 }}>{legenda}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => copiar(legenda, "Legenda")} style={acao(C.purple)}>COPIAR LEGENDA</button>
            {fullHashtags && <button onClick={() => copiar(fullHashtags, "Hashtags")} style={acao(C.gold)}>COPIAR HASHTAGS</button>}
          </div>
        </Bloco>
      )}
    </div>
  );
}
