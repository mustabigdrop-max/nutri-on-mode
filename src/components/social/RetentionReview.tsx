import { useEffect, useState } from "react";

const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function RetentionReview({ value }: { value: unknown }) {
  const reviews = Array.isArray(value) ? value : value ? [value] : [];
  if (!reviews.length) return null;
  return <section aria-label="Crítica de retenção" className="space-y-4 border-t border-border py-4 text-sm">
    <h3 className="font-semibold text-foreground">Crítica de retenção · notas estimadas</h3>
    {reviews.map((raw, i) => {
      const review = object(raw);
      const notes = Array.isArray(review.notas_por_bloco) ? review.notas_por_bloco.map(object) : [];
      return <div key={i} className="space-y-3">
        <p className="font-medium">Roteiro {i + 1} · {typeof review.nota_geral === "number" ? `${review.nota_geral}/10` : "Sem nota"} · {Number(review.rodadas) || 0} revisões</p>
        {typeof review.erro === "string" && <p role="alert" className="text-destructive">{review.erro}</p>}
        {notes.map((note, index) => <div key={index} className="border-l border-border pl-3 space-y-1">
          <p className={Number(note.nota) < 8 ? "font-semibold text-destructive" : "font-semibold text-foreground"}>Bloco {String(note.id)} · {String(note.nota)}/10</p>
          {typeof note.causa_da_queda === "string" && note.causa_da_queda && <p>{note.causa_da_queda}</p>}
          {typeof note.correcao === "string" && note.correcao && <p className="text-muted-foreground">Correção: {note.correcao}</p>}
        </div>)}
        {Array.isArray(review.riscos_de_conteudo) && review.riscos_de_conteudo.map((raw, index) => { const risk = object(raw); return <p key={index} className="text-destructive">Risco · bloco {String(risk.id)}: {String(risk.risco || "Verificar afirmação")}</p>; })}
        {Array.isArray(review.avisos) && review.avisos.map((raw, index) => { const warning = object(raw); return typeof warning.texto === "string" ? <p key={index} role="alert" className="text-destructive">Bloco {String(warning.id)}: {warning.texto}</p> : null; })}
        {typeof review.veredito === "string" && <p className="font-medium">{review.veredito}</p>}
        {Array.isArray(review.historico) && review.historico.length > 0 && <details><summary className="cursor-pointer text-muted-foreground">Notas anteriores</summary><pre className="whitespace-pre-wrap break-words text-xs mt-2">{JSON.stringify(review.historico, null, 2)}</pre></details>}
      </div>;
    })}
  </section>;
}

export function SocialRetentionReview() {
  const [value, setValue] = useState<unknown>(null);
  useEffect(() => {
    const listener = (event: Event) => setValue((event as CustomEvent).detail);
    window.addEventListener("social-retention-review", listener);
    return () => window.removeEventListener("social-retention-review", listener);
  }, []);
  return <RetentionReview value={value} />;
}