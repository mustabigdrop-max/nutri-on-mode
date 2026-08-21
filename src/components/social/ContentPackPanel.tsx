import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Film, CalendarDays, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CONTENT_PACK,
  PACK_CATEGORIES,
  PACK_WEEK,
  MINDFORCE_STORY_SEQUENCE,
  packItemText,
  type PackItem,
} from "@/data/contentPack";

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error("Não foi possível copiar");
  }
};

const download = (item: PackItem) => {
  const blob = new Blob([packItemText(item)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.id}-nutrion.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

function PackCard({ item }: { item: PackItem }) {
  const [open, setOpen] = useState(false);
  const cat = PACK_CATEGORIES[item.category];
  return (
    <Card style={{ borderColor: `${cat.color}55` }}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-mono tracking-widest" style={{ color: cat.color }}>
              {cat.label.toUpperCase()}
            </p>
            <p className="font-bold leading-tight">{item.title}</p>
            {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
          </div>
          <Badge variant="outline">{item.duration}</Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Formato:</span> {item.format}
          {item.music ? ` · Música: ${item.music}` : ""}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setOpen((v) => !v)} className="gap-2">
            <Film className="w-3.5 h-3.5" /> {open ? "Fechar" : "Ver roteiro"}
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => copyText(packItemText(item), "Roteiro")}>
            <Copy className="w-3.5 h-3.5" /> Copiar tudo
          </Button>
          {item.caption && (
            <Button size="sm" variant="outline" className="gap-2"
              onClick={() => copyText(`${item.caption}\n\n${(item.hashtags || []).join(" ")}`, "Legenda")}>
              <Copy className="w-3.5 h-3.5" /> Legenda
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-2" onClick={() => download(item)}>
            <Download className="w-3.5 h-3.5" /> .txt
          </Button>
        </div>

        {open && (
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              {item.frames.map((f, i) => (
                <div key={`${f.time}-${i}`} className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1">
                  <p className="text-[11px] font-mono" style={{ color: cat.color }}>{f.time}</p>
                  <p className="text-sm">{f.visual}</p>
                  {f.onScreen && (
                    <p className="text-sm"><span className="font-semibold">Texto na tela:</span> {f.onScreen}</p>
                  )}
                </div>
              ))}
            </div>

            {item.script && (
              <div className="rounded-lg border border-border/60 p-3 space-y-2">
                <p className="text-xs font-semibold">ROTEIRO / FALA</p>
                <pre className="whitespace-pre-wrap text-sm font-sans">{item.script}</pre>
                <Button size="sm" variant="ghost" className="gap-2 h-7 px-2" onClick={() => copyText(item.script!, "Roteiro")}>
                  <Copy className="w-3 h-3" /> Copiar fala
                </Button>
              </div>
            )}

            {!!item.notes?.length && (
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs font-semibold mb-1">NOTAS DE EDIÇÃO</p>
                <ul className="text-sm space-y-1">
                  {item.notes.map((n) => <li key={n} className="text-muted-foreground">→ {n}</li>)}
                </ul>
              </div>
            )}

            {item.caption && (
              <div className="rounded-lg border border-border/60 p-3 space-y-2">
                <p className="text-xs font-semibold">LEGENDA</p>
                <pre className="whitespace-pre-wrap text-sm font-sans">{item.caption}</pre>
                {!!item.hashtags?.length && (
                  <p className="text-xs text-muted-foreground">{item.hashtags.join(" ")}</p>
                )}
              </div>
            )}

            {item.whyItWorks && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Por que viraliza:</span> {item.whyItWorks}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ContentPackPanel() {
  const [filter, setFilter] = useState<"todos" | PackItem["category"]>("todos");
  const items = useMemo(
    () => (filter === "todos" ? CONTENT_PACK : CONTENT_PACK.filter((i) => i.category === filter)),
    [filter],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Pack de Conteúdo — Representatividade, Viral e Vendas
          </p>
          <p className="text-sm text-muted-foreground">
            Edits, POVs fisheye, reels de venda do nutriON e placement da MindForce. "Transformação é sistema."
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant={filter === "todos" ? "default" : "outline"} onClick={() => setFilter("todos")}>
              Todos ({CONTENT_PACK.length})
            </Button>
            {(Object.entries(PACK_CATEGORIES) as [PackItem["category"], any][]).map(([k, c]) => (
              <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)}>
                {c.label}
              </Button>
            ))}
          </div>
          {filter !== "todos" && (
            <p className="text-xs text-muted-foreground">{PACK_CATEGORIES[filter].hint}</p>
          )}
        </CardContent>
      </Card>

      {items.map((i) => <PackCard key={i.id} item={i} />)}

      {(filter === "todos" || filter === "mindforce") && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="font-bold text-sm">Stories MindForce — sequência de venda semanal</p>
            {MINDFORCE_STORY_SEQUENCE.map((s) => (
              <div key={s.step} className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-0.5">
                <p className="text-[11px] font-mono text-muted-foreground">{s.step}</p>
                <p className="text-sm">{s.visual}</p>
                <p className="text-sm font-semibold">"{s.text}"</p>
                <p className="text-xs text-muted-foreground">Sticker: {s.sticker}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="font-bold text-sm flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Calendário semanal ideal
          </p>
          <div className="space-y-1">
            {PACK_WEEK.map((d) => (
              <div key={d.day} className="flex flex-wrap items-baseline gap-2 text-sm border-b border-border/40 pb-1">
                <Badge variant="secondary" className="w-20 justify-center">{d.day}</Badge>
                <span className="font-semibold">{d.feed}</span>
                <span className="text-muted-foreground">· {d.stories}</span>
                <Badge variant="outline" className="ml-auto">{d.goal}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
