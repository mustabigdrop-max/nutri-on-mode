import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Identidade do Social ON — dourado (autoridade/elite, mesmo tom do "ELITE"
// do Apex Visual) como destaque principal em todo painel, ciano como
// secundário (dado/precisão). Era roxo antes — sem relação com o resto da
// marca, deixava a experiência do Social ON parecendo um produto à parte.
export const ACCENT = "#B8922A";
export const ACCENT2 = "#00D4FF";


export const copyText = (t: string) => {
  navigator.clipboard.writeText(t);
  toast.success("Copiado");
};

export const callSocialAI = async (body: Record<string, any>) => {
  const { data, error } = await supabase.functions.invoke("social-on-generate", { body });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).result;
};

export const Section = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: `${ACCENT}33`, background: "rgba(255,255,255,0.02)" }}>
    <div className="flex items-center justify-between gap-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">{title}</p>
      {right}
    </div>
    {children}
  </div>
);

export const Pill = ({ active, label, onClick }: { active?: boolean; label: string; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-3 py-1.5 rounded-full text-xs border transition-colors"
    style={{
      borderColor: active ? ACCENT : "rgba(255,255,255,0.12)",
      background: active ? `${ACCENT}22` : "transparent",
      color: active ? ACCENT : undefined,
    }}
  >
    {label}
  </button>
);

/** Bloco com 3 variações (A/B/C) do mesmo conteúdo: hook ou legenda. */
export const VariationBlock = ({
  label, items, accent = ACCENT, highlight,
}: { label: string; items: string[]; accent?: string; highlight?: boolean }) => {
  const [i, setI] = useState(0);
  const list = (items || []).filter((t) => !!t && t.trim().length > 0);
  if (!list.length) return null;
  const text = list[Math.min(i, list.length - 1)];

  return (
    <div
      className={highlight ? "rounded-lg p-3 space-y-2" : "space-y-2"}
      style={highlight ? { background: `${accent}12`, border: `1px solid ${accent}33` } : undefined}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}{list.length > 1 ? ` · ${list.length} variações` : ""}
        </p>
        <div className="flex items-center gap-1">
          {list.length > 1 && list.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className="w-6 h-6 rounded-md text-[11px] font-semibold border transition-colors"
              style={{
                borderColor: idx === i ? accent : "rgba(255,255,255,0.14)",
                background: idx === i ? `${accent}22` : "transparent",
                color: idx === i ? accent : undefined,
              }}
            >
              {String.fromCharCode(65 + idx)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => copyText(text)}
            className="ml-1 h-6 px-2 rounded-md text-[11px] flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-3 h-3" /> Copiar
          </button>
        </div>
      </div>
      <p className={highlight ? "font-semibold text-sm whitespace-pre-wrap" : "text-xs whitespace-pre-wrap"}>{text}</p>
    </div>
  );
};
