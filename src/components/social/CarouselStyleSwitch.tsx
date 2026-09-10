import type { CarouselStyle } from "@/hooks/useCarouselStyle";

const OPCOES: { id: CarouselStyle; label: string; hint: string; cor: string }[] = [
  { id: "classico", label: "CLÁSSICO", hint: "âmbar nutriON", cor: "#EF9F27" },
  { id: "tech", label: "TECH CIENTÍFICO", hint: "ciano + dourado", cor: "#00D4FF" },
];

/** Seletor de estilo visual, usado em todos os geradores de conteúdo. */
export default function CarouselStyleSwitch({
  style,
  onChange,
  disabled,
}: {
  style: CarouselStyle;
  onChange: (s: CarouselStyle) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Estilo</span>
      {OPCOES.map((o) => {
        const ativo = style === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className="rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition-colors disabled:opacity-50"
            style={{
              borderColor: ativo ? o.cor : "rgba(255,255,255,0.12)",
              color: ativo ? o.cor : undefined,
              background: ativo ? "rgba(255,255,255,0.04)" : undefined,
            }}
          >
            {o.label} <span className="font-normal opacity-60">· {o.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
