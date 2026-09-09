import { useEffect, useMemo, useState } from "react";
import { Pencil, RotateCcw, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { collectSlideTexts, setAtPath } from "@/lib/slideTextFields";

/**
 * Editor manual dos textos de um carrossel já gerado.
 * O coach reescreve qualquer frase e as imagens são desenhadas de novo com o texto dele.
 */
export default function SlideTextEditor<T>({
  content,
  onApply,
  accent = "#EF9F27",
  titulo = "EDITAR OS TEXTOS DOS SLIDES",
}: {
  content: T;
  onApply: (next: T) => void;
  accent?: string;
  titulo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T>(content);

  useEffect(() => setDraft(content), [content]);

  const fields = useMemo(() => collectSlideTexts(draft), [draft]);
  const grupos = useMemo(() => {
    const map = new Map<string, typeof fields>();
    fields.forEach((f) => {
      const list = map.get(f.group) || [];
      list.push(f);
      map.set(f.group, list);
    });
    return [...map.entries()];
  }, [fields]);

  if (!open) {
    return (
      <div className="flex justify-center">
        <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" /> Editar os textos dos slides
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: `${accent}33`, background: `${accent}0A` }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4" style={{ color: accent }} />
          <p className="text-sm font-semibold tracking-wide">{titulo}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Reescreva qualquer frase e clique em aplicar — os slides são desenhados de novo com o seu texto.
      </p>

      <div className="mt-3 space-y-4">
        {grupos.map(([grupo, lista]) => (
          <div key={grupo} className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wide" style={{ color: accent }}>
              <ChevronRight className="mr-1 inline h-3 w-3" />
              {grupo}
            </p>
            {lista.map((f) => {
              const key = f.path.join(".");
              return (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">{f.label}</label>
                  {f.long ? (
                    <Textarea
                      value={f.value}
                      rows={3}
                      onChange={(e) => setDraft((d) => setAtPath(d, f.path, e.target.value))}
                    />
                  ) : (
                    <Input value={f.value} onChange={(e) => setDraft((d) => setAtPath(d, f.path, e.target.value))} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          className="gap-2"
          onClick={() => {
            onApply(draft);
            toast.success("Slides atualizados com os seus textos.");
          }}
        >
          <Check className="h-4 w-4" /> Aplicar e redesenhar
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setDraft(content)}>
          <RotateCcw className="h-4 w-4" /> Voltar ao texto gerado
        </Button>
      </div>
    </div>
  );
}
