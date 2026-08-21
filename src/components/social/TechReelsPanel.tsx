import { useState } from "react";
import { toast } from "sonner";
import { Clapperboard, Copy, Download, MessageCircle, CalendarClock, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TECH_REELS,
  TECH_REELS_ORDER,
  TECH_REELS_DM_REPLY,
  techReelScriptText,
  type TechReel,
} from "@/data/techReels";

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error("Não foi possível copiar");
  }
};

const downloadScript = (r: TechReel) => {
  const blob = new Blob([techReelScriptText(r)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reel-${r.id}-nutrion.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

function ReelCard({ reel }: { reel: TechReel }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ borderColor: `${reel.color}55` }}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-mono tracking-widest" style={{ color: reel.color }}>
              {reel.module}
            </p>
            <p className="font-bold text-lg leading-tight">"{reel.title}"</p>
            <p className="text-xs text-muted-foreground mt-1">
              {reel.duration} · {reel.objective}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="gap-1">
              <CalendarClock className="w-3 h-3" /> {reel.postDay} · {reel.postTime}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Formato:</span> {reel.format}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setOpen((v) => !v)} className="gap-2">
            <Film className="w-3.5 h-3.5" /> {open ? "Fechar roteiro" : "Ver roteiro"}
          </Button>
          <Button size="sm" variant="outline" className="gap-2"
            onClick={() => copyText(techReelScriptText(reel), "Roteiro completo")}>
            <Copy className="w-3.5 h-3.5" /> Copiar tudo
          </Button>
          <Button size="sm" variant="outline" className="gap-2"
            onClick={() => copyText(`${reel.caption}\n\n${reel.hashtags.join(" ")}`, "Legenda")}>
            <Copy className="w-3.5 h-3.5" /> Legenda
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => downloadScript(reel)}>
            <Download className="w-3.5 h-3.5" /> .txt
          </Button>
        </div>

        {open && (
          <div className="space-y-3 pt-2">
            {reel.frames.map((f, i) => (
              <div key={f.time} className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1">
                <p className="text-[11px] font-mono" style={{ color: reel.color }}>
                  FRAME {i + 1} · {f.time}
                </p>
                <p className="text-sm"><span className="font-semibold">Fala:</span> {f.speech}</p>
                <p className="text-sm"><span className="font-semibold">Texto na tela:</span> {f.onScreen}</p>
                <p className="text-xs text-muted-foreground">{f.broll}</p>
              </div>
            ))}

            <div className="rounded-lg border border-border/60 p-3 space-y-2">
              <p className="text-xs font-semibold">LEGENDA</p>
              <pre className="whitespace-pre-wrap text-sm font-sans">{reel.caption}</pre>
              <p className="text-xs text-muted-foreground">{reel.hashtags.join(" ")}</p>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-1">
              <p className="text-xs font-semibold">SELF-COMMENT</p>
              <p className="text-sm">{reel.selfComment}</p>
              <Button size="sm" variant="ghost" className="gap-2 h-7 px-2"
                onClick={() => copyText(reel.selfComment, "Self-comment")}>
                <Copy className="w-3 h-3" /> Copiar
              </Button>
            </div>

            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-xs font-semibold mb-1">DICAS DE EDIÇÃO</p>
              <ul className="text-sm space-y-1">
                {reel.editingTips.map((t) => (
                  <li key={t} className="text-muted-foreground">→ {t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TechReelsPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-1">
          <p className="font-bold flex items-center gap-2">
            <Clapperboard className="w-4 h-4" /> 3 Reels de Tecnologia — gravar hoje
          </p>
          <p className="text-sm text-muted-foreground">
            Roteiros prontos de APEX, PRISM e NutrySync. Mostrar o que ninguém mostra. "Transformação é sistema."
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">ORDEM DE POSTAGEM</p>
          {TECH_REELS_ORDER.map((o) => (
            <div key={o.day} className="flex flex-wrap items-baseline gap-2 text-sm">
              <Badge variant="secondary">{o.day}</Badge>
              <span className="font-semibold">{o.reel}</span>
              <span className="text-muted-foreground">· {o.time} — {o.why}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {TECH_REELS.map((r) => <ReelCard key={r.id} reel={r} />)}

      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="font-bold flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4" /> Resposta padrão pras DMs
          </p>
          <pre className="whitespace-pre-wrap text-sm font-sans bg-muted/30 rounded-lg p-3">{TECH_REELS_DM_REPLY}</pre>
          <Button size="sm" variant="outline" className="gap-2"
            onClick={() => copyText(TECH_REELS_DM_REPLY, "Resposta de DM")}>
            <Copy className="w-3.5 h-3.5" /> Copiar resposta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
