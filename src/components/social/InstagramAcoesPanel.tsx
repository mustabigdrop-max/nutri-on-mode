import { Instagram, Lightbulb } from "lucide-react";
import { acoesInstagram, acoesDosStories, DICA_INSTAGRAM, type AcaoInstagram } from "@/lib/publicLanguage";

/**
 * Enquete, quiz e caixa de perguntas não são slide — são ação no Instagram.
 * Esse bloco fica ABAIXO dos slides, como roteiro pro coach aplicar ao postar.
 */
export const InstagramAcoesPanel = ({
  tema,
  pergunta,
  enquete,
  frames,
}: {
  tema?: string;
  pergunta?: string;
  enquete?: { pergunta: string; opcao1: string; opcao2: string };
  /** Frames de story gerados — quando vêm, as instruções seguem eles. */
  frames?: Parameters<typeof acoesDosStories>[0];
}) => {
  const acoes: AcaoInstagram[] = frames?.length
    ? acoesDosStories(frames)
    : acoesInstagram({ tema, pergunta, enquete });
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: "rgba(239,159,39,0.28)", background: "rgba(239,159,39,0.05)" }}>
      <p className="text-[11px] uppercase tracking-[0.18em] font-mono flex items-center gap-2" style={{ color: "#EF9F27" }}>
        <Instagram className="h-3.5 w-3.5" /> Ações no Instagram (após postar)
      </p>
      <div className="space-y-2">
        {acoes.map((a) => (
          <div key={a.story} className="rounded-lg border p-3 space-y-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold">
              <span style={{ color: "#EF9F27" }}>{a.story}:</span> {a.titulo}
            </p>
            {a.detalhe && <p className="text-xs text-muted-foreground">“{a.detalhe}”</p>}
            {a.opcoes && (
              <div className="flex gap-2 pt-1">
                {a.opcoes.map((o) => (
                  <span key={o} className="px-2 py-1 rounded-md text-[11px] border" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    {o}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground flex gap-2">
        <Lightbulb className="h-3.5 w-3.5 shrink-0" style={{ color: "#5DCAA5" }} />
        {DICA_INSTAGRAM}
      </p>
    </div>
  );
};

export default InstagramAcoesPanel;
