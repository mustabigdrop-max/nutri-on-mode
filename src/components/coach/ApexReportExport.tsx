import { useState } from "react";
import { Image as ImageIcon, Loader2, Download, Copy, Film } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  generateApexReport,
  downloadApexReport,
  type ApexReportData,
  type ApexReportMode,
} from "@/lib/apexReportImage";
import { apexReelScriptText, APEX_REEL_TITLE } from "@/data/apexReelScript";

const MODES: { key: ApexReportMode; label: string; hint: string }[] = [
  { key: "coach", label: "Coach", hint: "1080×1920 · completo" },
  { key: "client", label: "Cliente", hint: "1080×1350 · simplificado" },
  { key: "instagram", label: "Instagram", hint: "1080×1080 · feed" },
];

export default function ApexReportExport({
  data,
  compact,
}: {
  data: ApexReportData;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState<ApexReportMode | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const run = async (mode: ApexReportMode) => {
    setBusy(mode);
    try {
      const url = await generateApexReport(data, mode);
      setPreview(url);
      downloadApexReport(
        url,
        `apex-${mode}-${(data.athleteName || "atleta").toLowerCase().replace(/\s+/g, "-")}.png`,
      );
      toast({ title: "Relatório visual gerado", description: "Imagem baixada e pronta pra postar." });
    } catch (e: any) {
      toast({ title: "Erro ao gerar relatório", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const copyReel = async () => {
    try {
      await navigator.clipboard.writeText(apexReelScriptText());
      toast({ title: "Roteiro copiado", description: APEX_REEL_TITLE });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted flex items-center gap-1.5 font-semibold"
      >
        <ImageIcon className="w-3.5 h-3.5" /> Gerar Relatório Visual
      </button>

      {open && (
        <div className={`rounded-xl border border-border p-3 space-y-3 ${compact ? "" : "bg-card"}`}>
          <div className="grid gap-2 sm:grid-cols-3">
            {MODES.map((m) => (
              <button
                key={m.key}
                disabled={!!busy}
                onClick={() => run(m.key)}
                className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted disabled:opacity-60"
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  {busy === m.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  {m.label}
                </div>
                <div className="text-[10px] text-muted-foreground">{m.hint}</div>
              </button>
            ))}
          </div>

          <button
            onClick={copyReel}
            className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" /> Copiar roteiro do Reel
            <Copy className="w-3 h-3 opacity-60" />
          </button>

          {preview && (
            <img
              src={preview}
              alt="Prévia do relatório APEX"
              className="w-full max-w-[220px] rounded-lg border border-border"
            />
          )}
        </div>
      )}
    </div>
  );
}
