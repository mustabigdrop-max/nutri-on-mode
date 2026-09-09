import { useState } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanCaption } from "@/lib/captionText";
import { TIPO_CARROSSEL_LABEL, type PosSlidesResult, type TipoCarrossel } from "@/lib/carouselPostConfig";

const copiar = (texto: string, label: string) => {
  navigator.clipboard.writeText(texto);
  toast.success(`${label} copiado.`);
};

/**
 * Conteúdo pós-slides (legenda, comentário, hashtags e CTA) específico do tipo
 * de carrossel — cada universo tem o seu, sem misturar comportamento e ciência.
 */
export default function PosSlidesPanel({
  tipo,
  tema,
  dados,
  grupo,
  handle,
}: {
  tipo: TipoCarrossel;
  tema: string;
  dados?: unknown;
  /** Grupo muscular, só no tipo RESULTADO_PROTOCOLO (pernas, costas...). */
  grupo?: string;
  handle?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<PosSlidesResult | null>(null);

  const gerar = async () => {
    if (!tema.trim()) return toast.error("Defina o tema antes de gerar a legenda.");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "pos_slides", tipoCarrossel: tipo, topic: tema, dados: dados ?? null, grupo, handle },
      });
      if (error) throw error;
      const r = (data?.result || {}) as PosSlidesResult;
      setRes({ ...r, legenda: cleanCaption(r.legenda) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(false);
    }
  };

  const hashtags5 = res?.hashtags_top5?.join(" ") || "";
  const hashtags15 = res?.hashtags_15?.join(" ") || "";

  return (
    <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide" style={{ color: "#EF9F27" }}>
          LEGENDA + HASHTAGS · {TIPO_CARROSSEL_LABEL[tipo]}
        </p>
        <Button size="sm" onClick={gerar} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "Gerando…" : res ? "Gerar de novo" : "Gerar legenda"}
        </Button>
      </div>

      {!res && (
        <p className="text-[11px] text-muted-foreground">
          A legenda, o primeiro comentário e as hashtags saem no universo deste carrossel — sem misturar temas.
        </p>
      )}

      {res && (
        <div className="space-y-3">
          {res.legenda && (
            <div>
              <p className="whitespace-pre-wrap text-[12px] text-gray-300">{res.legenda}</p>
              <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => copiar(res.legenda, "Legenda")}>
                <Copy className="h-3 w-3" /> Copiar legenda
              </Button>
            </div>
          )}

          {res.self_comment && (
            <div className="rounded-lg border p-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Primeiro comentário</p>
              <p className="mt-1 text-[12px]">{res.self_comment}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 gap-2"
                onClick={() => copiar(res.self_comment, "Comentário")}
              >
                <Copy className="h-3 w-3" /> Copiar comentário
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Hashtags</p>
            <p className="text-[11px] text-gray-400">{hashtags5}</p>
            <p className="text-[11px] text-gray-500">{hashtags15}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => copiar(hashtags5, "Top 5")}>
                <Copy className="h-3 w-3" /> Copiar top 5
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => copiar(hashtags15, "15 hashtags")}>
                <Copy className="h-3 w-3" /> Copiar as 15
              </Button>
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-muted-foreground">
            {res.cta && <p>CTA: {res.cta}</p>}
            {res.cta_save && <p>Save: {res.cta_save}</p>}
            {res.melhor_horario && <p>Melhor horário: {res.melhor_horario}</p>}
            {res.dica_engajamento && <p>Dica: {res.dica_engajamento}</p>}
            {res.disclaimer && <p style={{ color: "#888" }}>{res.disclaimer}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
