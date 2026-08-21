import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ACCENT = "#A855F7";
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
