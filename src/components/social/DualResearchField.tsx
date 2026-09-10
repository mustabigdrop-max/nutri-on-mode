import { useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DOMINIOS_PESQUISA,
  pesquisarDual,
  type DominioPesquisa,
  type PesquisaDual,
} from "@/lib/dualResearch";

type Props = {
  /** Domínio sugerido pelo módulo onde o campo está (o coach pode trocar). */
  dominioPadrao?: DominioPesquisa;
  /** Tema pré-preenchido (ex.: exercício do dia, composto aberto na Vault). */
  temaPadrao?: string;
  pesquisa: PesquisaDual | null;
  onChange: (p: PesquisaDual | null) => void;
  disabled?: boolean;
};

/**
 * Campo universal de pesquisa: o coach escreve o tema, escolhe o domínio e a
 * pesquisa científica volta pronta para alimentar QUALQUER gerador de conteúdo.
 */
export default function DualResearchField({
  dominioPadrao = "livre",
  temaPadrao = "",
  pesquisa,
  onChange,
  disabled,
}: Props) {
  const [tema, setTema] = useState(temaPadrao);
  const [dominio, setDominio] = useState<DominioPesquisa>(dominioPadrao);
  const [angulo, setAngulo] = useState("");
  const [loading, setLoading] = useState(false);

  const pesquisar = async () => {
    if (!tema.trim()) return toast.error("Escreva o tema que você quer pesquisar.");
    setLoading(true);
    try {
      const res = await pesquisarDual({ tema: tema.trim(), dominio, angulo: angulo.trim() });
      onChange(res);
      toast.success("Pesquisa pronta. O conteúdo vai usar esses dados.");
    } catch (e) {
      toast.error((e as Error)?.message || "Não consegui concluir a pesquisa agora.");
    } finally {
      setLoading(false);
    }
  };

  const b = pesquisa?.brief;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-[2px] text-muted-foreground">
          PESQUISA CIENTÍFICA DO CONTEÚDO
        </span>
        {pesquisa && (
          <button
            onClick={() => onChange(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" /> limpar
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DOMINIOS_PESQUISA.map((d) => (
          <button
            key={d.id}
            title={d.hint}
            disabled={disabled || loading}
            onClick={() => setDominio(d.id)}
            className={`rounded-full border px-2.5 py-1 text-[10px] transition ${
              dominio === d.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <textarea
        value={tema}
        onChange={(e) => setTema(e.target.value)}
        disabled={disabled || loading}
        rows={2}
        placeholder="Escreva o tema: ex. retatrutida meia-vida e resposta em mulheres, ou repovoamento intestinal depois de antibiótico"
        className="w-full resize-y rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-primary"
      />
      <input
        value={angulo}
        onChange={(e) => setAngulo(e.target.value)}
        disabled={disabled || loading}
        placeholder="Ângulo (opcional): mito que quero derrubar, dúvida que mais recebo, comparação..."
        className="w-full rounded-lg border border-border bg-background p-2 text-xs outline-none focus:border-primary"
      />

      <Button size="sm" className="gap-2" disabled={disabled || loading} onClick={() => void pesquisar()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {loading ? "Pesquisando estudos..." : "Pesquisar e usar no conteúdo"}
      </Button>

      {b && (
        <div className="space-y-2 rounded-lg border border-border bg-background/60 p-3 text-xs">
          <div className="font-semibold">{b.titulo || pesquisa?.tema}</div>
          {b.resumo && <p className="text-muted-foreground">{b.resumo}</p>}
          {!!b.dados?.length && (
            <ul className="space-y-1">
              {b.dados.slice(0, 4).map((d, i) => (
                <li key={i}>
                  <span className="font-mono text-primary">{d.valor}</span> — {d.significado}
                </li>
              ))}
            </ul>
          )}
          {!!b.perguntas_publico?.length && (
            <div>
              <div className="text-[10px] tracking-[2px] text-muted-foreground">O QUE O PÚBLICO PERGUNTA</div>
              <ul className="list-disc pl-4">
                {b.perguntas_publico.slice(0, 5).map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {b.teaser && (
            <p className="rounded border border-primary/30 bg-primary/5 p-2">
              <span className="text-[10px] tracking-[2px] text-primary">FICA PARA A CONSULTORIA</span>
              <br />
              {b.teaser}
            </p>
          )}
          {!!b.fontes?.length && (
            <div className="text-[10px] text-muted-foreground">
              {b.fontes.length} fonte(s) científica(s) anexada(s) ao conteúdo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
