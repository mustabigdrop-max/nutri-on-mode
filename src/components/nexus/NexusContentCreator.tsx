import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Film, Layers, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";

const AMBER = "#EF9F27";

export const NEXUS_ANGULOS = [
  { id: "educativo", label: "Educativo", hint: "o que é, como funciona" },
  { id: "mito_metodo", label: "Mito ou Método", hint: "desmistificar" },
  { id: "comparativo", label: "Comparativo", hint: "um contra o outro" },
  { id: "novidade", label: "Novidade", hint: "estudo recente" },
  { id: "leigos", label: "Para leigos", hint: "explicar simples" },
  { id: "receita", label: "Receita/Prático", hint: "o que fazer na prática" },
  { id: "cross_vault", label: "Cross-Vault (Peptídeos × Microbiota)", hint: "comparação de ouro" },
];

export const NEXUS_FORMATOS = [
  { id: "carrossel", label: "Carrossel Educativo", hint: "9-10 slides" },
  { id: "reels", label: "Roteiro Reels", hint: "30-60s" },
  { id: "stories", label: "Stories Sequência", hint: "4 frames" },
];

type Corte = { segundo?: string; texto_tela?: string; fala?: string; acao?: string };
type Reels = {
  hook?: string;
  duracao_total?: string;
  cortes?: Corte[];
  musica_sugerida?: string;
  hashtags?: string[];
  legenda?: string;
};
type Frame = {
  tipo?: string;
  texto?: string;
  subtexto?: string;
  bullets?: string[];
  pergunta?: string;
  opcao1?: string;
  opcao2?: string;
  cta?: string;
  instrucao?: string;
};
type Stories = { frames?: Frame[] };

const copy = (txt: string, msg = "Copiado.") => {
  navigator.clipboard.writeText(txt);
  toast.success(msg);
};

function CopyBtn({ text, label = "Copiar" }: { text: string; label?: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 border-gray-700 text-[11px] text-gray-300"
      onClick={() => copy(text)}
    >
      <Copy className="h-3 w-3" /> {label}
    </Button>
  );
}

/**
 * Bloco "Criar conteúdo" do NEXUS-BIO — mesmo comportamento no PeptideVault
 * e no MicrobiotaVault. Carrossel abre o gerador científico; Reels e Stories
 * são gerados aqui mesmo, com timeline e frames prontos pra copiar.
 */
export default function NexusContentCreator({
  nome,
  origem,
  compoundData,
  contexto,
}: {
  nome: string;
  origem: "PeptideVault" | "MicrobiotaVault" | "SteroidVault" | "FitoVault";
  compoundData?: unknown;
  contexto?: string;
}) {
  const navigate = useNavigate();
  const [angulo, setAngulo] = useState("educativo");
  const [loading, setLoading] = useState<string | null>(null);
  const [reels, setReels] = useState<Reels | null>(null);
  const [stories, setStories] = useState<Stories | null>(null);

  const anguloLabel = NEXUS_ANGULOS.find((a) => a.id === angulo)?.label ?? "Educativo";
  const crossHint =
    origem === "PeptideVault"
      ? "cruze com a microbiota (ex.: o próprio intestino também produz GLP-1)"
      : "cruze com peptídeos/fármacos da mesma finalidade";

  const tema =
    angulo === "cross_vault"
      ? `${nome} — ${crossHint}. ${contexto || ""}`
      : `${nome} — ângulo ${anguloLabel}. ${contexto || ""}`;

  const gerar = async (formato: string) => {
    if (formato === "carrossel") {
      navigate(`/coach/social?tab=carrossel_nexus&tema=${encodeURIComponent(nome)}`);
      return;
    }
    setLoading(formato);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: formato === "reels" ? "nexus_reels" : "nexus_stories",
          topic: tema,
          origem,
          angulo: anguloLabel,
          compoundData: compoundData ?? null,
        },
      });
      if (error) throw error;
      if (formato === "reels") {
        setReels((data?.result || {}) as Reels);
        setStories(null);
      } else {
        setStories((data?.result || {}) as Stories);
        setReels(null);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(null);
    }
  };

  const roteiroTexto = reels
    ? [
        `ROTEIRO REELS — ${nome}`,
        `Hook: ${reels.hook || ""}`,
        `Duração: ${reels.duracao_total || ""}`,
        "",
        ...(reels.cortes || []).map(
          (c) => `[${c.segundo}] TELA: ${c.texto_tela}\nFALA: ${c.fala}\nAÇÃO: ${c.acao}`,
        ),
        "",
        `Música: ${reels.musica_sugerida || ""}`,
        (reels.hashtags || []).join(" "),
      ].join("\n")
    : "";

  const textosTela = (reels?.cortes || []).map((c) => c.texto_tela || "").filter(Boolean).join("\n");

  return (
    <Card className="border" style={{ borderColor: `${AMBER}40`, backgroundColor: `${AMBER}0A` }}>
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold" style={{ color: AMBER }}>
          📲 Criar conteúdo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {NEXUS_ANGULOS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAngulo(a.id)}
              title={a.hint}
              className={`rounded-full border px-2 py-1 text-[10px] transition ${
                angulo === a.id
                  ? "border-[#EF9F27]/60 bg-[#EF9F27]/20 text-[#EF9F27]"
                  : "border-gray-700 text-gray-500 hover:text-gray-300"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {NEXUS_FORMATOS.map((f) => (
            <Button
              key={f.id}
              onClick={() => gerar(f.id)}
              disabled={!!loading}
              className="gap-2 bg-[#EF9F27] text-black hover:bg-[#EF9F27]/90"
            >
              {loading === f.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : f.id === "reels" ? (
                <Film className="h-4 w-4" />
              ) : f.id === "stories" ? (
                <Layers className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {f.label}
            </Button>
          ))}
        </div>

        <p className="text-[10px] text-gray-500">
          O ângulo Cross-Vault cruza este composto com{" "}
          {origem === "PeptideVault" ? "o MicrobiotaVault" : "o PeptideVault"}.
        </p>

        {reels && (
          <div className="space-y-3 rounded-xl border border-gray-800 bg-black/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-white">🎬 Roteiro Reels — {nome}</p>
              <span className="text-[10px] text-gray-500">{reels.duracao_total}</span>
            </div>
            {reels.hook && <p className="text-xs text-gray-300">Hook: {reels.hook}</p>}

            <div className="flex flex-wrap gap-1 text-[9px] text-gray-500">
              {(reels.cortes || []).map((c, i) => (
                <span key={i} className="rounded border border-gray-800 px-1.5 py-0.5">
                  {c.segundo}
                </span>
              ))}
            </div>

            <div className="space-y-2">
              {(reels.cortes || []).map((c, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ borderColor: `${AMBER}26` }}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: AMBER }}>
                      {c.segundo}
                    </span>
                    <button
                      onClick={() => copy(`TELA: ${c.texto_tela}\nFALA: ${c.fala}\nAÇÃO: ${c.acao}`)}
                      className="text-gray-500 hover:text-gray-300"
                      aria-label="Copiar corte"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs font-bold uppercase text-white">{c.texto_tela}</p>
                  <p className="mt-1 text-[11px] text-gray-400">Fala: {c.fala}</p>
                  <p className="text-[11px] text-gray-500">Ação: {c.acao}</p>
                </div>
              ))}
            </div>

            {reels.musica_sugerida && (
              <p className="text-[10px] text-gray-500">🎵 {reels.musica_sugerida}</p>
            )}
            {!!reels.hashtags?.length && (
              <p className="text-[10px] text-gray-500">{reels.hashtags.join(" ")}</p>
            )}
            {reels.legenda && (
              <p className="whitespace-pre-wrap rounded-lg border border-gray-800 p-2 text-[11px] text-gray-400">
                {cleanCaption(reels.legenda)}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <CopyBtn text={roteiroTexto} label="Copiar roteiro completo" />
              <CopyBtn text={textosTela} label="Só textos de tela (CapCut)" />
              {reels.legenda && <CopyBtn text={cleanCaption(reels.legenda)} label="Copiar legenda" />}
            </div>
          </div>
        )}

        {stories && (
          <div className="space-y-2 rounded-xl border border-gray-800 bg-black/40 p-3">
            <p className="text-xs font-semibold text-white">📱 Stories — {nome}</p>
            {(stories.frames || []).map((f, i) => (
              <div key={i} className="rounded-lg border p-3" style={{ borderColor: `${AMBER}26` }}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color: AMBER }}>
                    {i + 1}. {f.tipo}
                  </span>
                  <button
                    onClick={() =>
                      copy(
                        [f.texto, f.subtexto, (f.bullets || []).join("\n"), f.pergunta, f.opcao1, f.opcao2, f.cta]
                          .filter(Boolean)
                          .join("\n"),
                      )
                    }
                    className="text-gray-500 hover:text-gray-300"
                    aria-label="Copiar frame"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                {f.texto && <p className="text-xs font-semibold text-white">{f.texto}</p>}
                {f.subtexto && <p className="text-[11px] text-gray-400">{f.subtexto}</p>}
                {!!f.bullets?.length && (
                  <ul className="mt-1 space-y-0.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="text-[11px] text-gray-400">
                        • {b}
                      </li>
                    ))}
                  </ul>
                )}
                {f.pergunta && (
                  <div className="mt-1 text-[11px] text-gray-300">
                    <p>{f.pergunta}</p>
                    <p className="text-gray-500">
                      {f.opcao1} · {f.opcao2}
                    </p>
                  </div>
                )}
                {f.cta && <p className="mt-1 text-[11px] text-[#EF9F27]">{f.cta}</p>}
                {f.instrucao && <p className="mt-1 text-[10px] italic text-gray-600">{f.instrucao}</p>}
              </div>
            ))}
            <CopyBtn
              text={(stories.frames || [])
                .map(
                  (f, i) =>
                    `FRAME ${i + 1} — ${f.tipo}\n${[f.texto, f.subtexto, (f.bullets || []).join("\n"), f.pergunta, f.opcao1, f.opcao2, f.cta]
                      .filter(Boolean)
                      .join("\n")}`,
                )
                .join("\n\n")}
              label="Copiar sequência"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
