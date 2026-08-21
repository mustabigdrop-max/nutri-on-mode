import { useState } from "react";
import { Image as ImageIcon, Loader2, Download, Copy, Film, Instagram, Settings2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  generateApexReport,
  generateApexInstagramPackage,
  downloadApexReport,
  APEX_PALETTES,
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
  const [busy, setBusy] = useState<ApexReportMode | "package" | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);

  // Template customizável
  const [title, setTitle] = useState("APEX INTELLIGENCE SYSTEM");
  const [coachName, setCoachName] = useState("Coach Diogo Mello");
  const [handle, setHandle] = useState("nutrion.app.br");
  const [paletteKey, setPaletteKey] = useState(APEX_PALETTES[0].key);

  const palette = APEX_PALETTES.find((p) => p.key === paletteKey) || APEX_PALETTES[0];

  const withTemplate = (): ApexReportData => ({
    ...data,
    title: title.trim() || undefined,
    coachName: coachName.trim() || undefined,
    handle: handle.trim() || undefined,
    accent: palette.accent,
    bg: palette.bg,
  });

  const slug = (data.athleteName || "atleta").toLowerCase().replace(/\s+/g, "-");

  const run = async (mode: ApexReportMode) => {
    setBusy(mode);
    try {
      const url = await generateApexReport(withTemplate(), mode);
      setPreview(url);
      downloadApexReport(url, `apex-${mode}-${slug}.png`);
      toast({ title: "Relatório visual gerado", description: "Imagem baixada e pronta pra postar." });
    } catch (e: any) {
      toast({ title: "Erro ao gerar relatório", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const runPackage = async () => {
    setBusy("package");
    try {
      const pkg = await generateApexInstagramPackage(withTemplate());
      setPreview(pkg.story);
      setCaption(pkg.caption);
      downloadApexReport(pkg.story, `apex-story-${slug}.png`);
      downloadApexReport(pkg.feed, `apex-feed-${slug}.png`);
      try {
        await navigator.clipboard.writeText(pkg.caption);
      } catch {
        /* clipboard opcional */
      }
      toast({ title: "Pacote Instagram pronto", description: "Story + feed baixados e legenda copiada." });
    } catch (e: any) {
      toast({ title: "Erro no pacote Instagram", description: e?.message, variant: "destructive" });
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

  const field = "w-full text-xs rounded-lg border border-border bg-background px-2 py-1.5";

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
          <button
            onClick={() => setShowTemplate((v) => !v)}
            className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="w-3.5 h-3.5" /> Personalizar template
          </button>

          {showTemplate && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Título</span>
                  <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Nome do coach</span>
                  <input className={field} value={coachName} onChange={(e) => setCoachName(e.target.value)} />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Handle / site</span>
                  <input className={field} value={handle} onChange={(e) => setHandle(e.target.value)} />
                </label>
              </div>

              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Paleta</div>
                <div className="flex flex-wrap gap-2">
                  {APEX_PALETTES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPaletteKey(p.key)}
                      className="flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold"
                      style={{ borderColor: paletteKey === p.key ? p.accent : "hsl(var(--border))" }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
                      <span className="w-3 h-3 rounded-full border border-border" style={{ background: p.bg }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

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
            disabled={!!busy}
            onClick={runPackage}
            className="w-full rounded-lg border border-border px-3 py-2 text-left hover:bg-muted disabled:opacity-60"
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              {busy === "package" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Instagram className="w-3 h-3" />}
              Pacote Instagram (Story + Feed + legenda)
            </div>
            <div className="text-[10px] text-muted-foreground">
              Story 1080×1920, feed 1080×1080 e legenda gerada a partir desta análise
            </div>
          </button>

          <button
            onClick={copyReel}
            className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" /> Copiar roteiro do Reel
            <Copy className="w-3 h-3 opacity-60" />
          </button>

          {caption && (
            <div className="space-y-1">
              <textarea
                readOnly
                value={caption}
                rows={8}
                className="w-full text-[11px] rounded-lg border border-border bg-background p-2 font-mono"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(caption);
                  toast({ title: "Legenda copiada" });
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted flex items-center gap-1.5"
              >
                <Copy className="w-3 h-3" /> Copiar legenda
              </button>
            </div>
          )}

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
