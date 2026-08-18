import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Flame, Loader2, RefreshCw, Rocket } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, ACCENT2, Section, callSocialAI, copyText } from "./socialUi";

type Trend = {
  trend_name: string;
  format: string;
  viral_potential: number;
  why_fits_profile: string;
  your_version: string;
  music_suggestion?: string;
  text_on_screen?: string[];
  caption?: string;
};

const ViralLabPanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [busy, setBusy] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  const load = async () => {
    setBusy(true);
    try {
      const r = await callSocialAI({ mode: "viral_lab", ...ctx });
      setTrends(r?.trends || []);
      setOpen(0);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const full = (t: Trend) =>
    `${t.trend_name}\n\n${t.your_version}\n\nMúsica: ${t.music_suggestion || "-"}\nTexto na tela: ${(t.text_on_screen || []).join(" | ")}\n\nLegenda:\n${t.caption || ""}`;

  return (
    <div className="space-y-4">
      <Section title="🔥 Viral Lab" right={
        <Button size="sm" variant="outline" className="h-7 gap-1" disabled={busy} onClick={load}>
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Atualizar trends
        </Button>
      }>
        <p className="text-sm text-muted-foreground">
          Trends do nicho fitness detectadas para a semana, já adaptadas ao seu perfil (atleta, pai, Método MCE).
        </p>
        {!trends.length && !busy && (
          <Button className="gap-2" style={{ background: ACCENT }} onClick={load}>
            <Flame className="w-4 h-4" /> Detectar trends da semana
          </Button>
        )}
      </Section>

      {trends.map((t, i) => (
        <Section key={i}
          title={`${"🔥".repeat(Math.max(1, Math.min(3, Number(t.viral_potential) || 1)))} ${t.trend_name}`}
          right={<Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(full(t))}><Copy className="w-3 h-3" /> Copiar</Button>}
        >
          <p className="text-[11px] font-mono text-muted-foreground">
            Formato: {t.format} · Encaixe: {t.why_fits_profile}
          </p>
          {open === i ? (
            <div className="space-y-2">
              <p className="text-sm whitespace-pre-wrap">{t.your_version}</p>
              {t.music_suggestion && <p className="text-xs" style={{ color: ACCENT2 }}>🎵 {t.music_suggestion}</p>}
              {t.text_on_screen?.length ? (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {t.text_on_screen.map((x, k) => <li key={k}>• {x}</li>)}
                </ul>
              ) : null}
              {t.caption && <p className="text-sm whitespace-pre-wrap">{t.caption}</p>}
            </div>
          ) : null}
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpen(open === i ? null : i)}>
            <Rocket className="w-3 h-3" /> {open === i ? "Ocultar minha versão" : "Ver minha versão"}
          </Button>
        </Section>
      ))}
    </div>
  );
};

export default ViralLabPanel;
