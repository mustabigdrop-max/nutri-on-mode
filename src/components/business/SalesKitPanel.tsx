import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { SALES_ASSETS, SALES_DOCS, SALES_MESSAGES, SALES_SCRIPTS } from "@/lib/gymBusiness";

const copy = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado.`);
  } catch {
    toast.error("Não foi possível copiar.");
  }
};

const download = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <Card><CardContent className="p-0 divide-y divide-border">{children}</CardContent></Card>
    </div>
  );
}

function Row({ title, subtitle, action }: { title: string; subtitle?: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground line-clamp-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default function SalesKitPanel() {
  return (
    <div className="space-y-5 mb-6">
      <Group title="Mensagens de prospecção">
        {SALES_MESSAGES.map((m) => (
          <Row key={m.title} title={m.title} subtitle={m.text.split("\n")[0]}
            action={
              <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(m.text, m.title)}>
                <Copy className="w-3.5 h-3.5" /> Copiar
              </Button>
            } />
        ))}
      </Group>

      <Group title="Roteiros">
        {SALES_SCRIPTS.map((m) => (
          <Row key={m.title} title={m.title} subtitle={m.text.split("\n")[0]}
            action={
              <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(m.text, m.title)}>
                <Copy className="w-3.5 h-3.5" /> Copiar
              </Button>
            } />
        ))}
      </Group>

      <Group title="Materiais gráficos">
        {SALES_ASSETS.map((a) => (
          <Row key={a.title} title={a.title} subtitle={a.specs}
            action={
              <Button size="sm" variant="outline" className="gap-1"
                onClick={() => download(a.title.replace(/[^\w]+/g, "-"), `${a.title}\n\n${a.specs}`)}>
                <Download className="w-3.5 h-3.5" /> Specs
              </Button>
            } />
        ))}
      </Group>

      <Group title="Documentos">
        {SALES_DOCS.map((d) => (
          <Row key={d.title} title={d.title} subtitle={d.text.split("\n")[0]}
            action={
              <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(d.text, d.title)}>
                <Copy className="w-3.5 h-3.5" /> Copiar
              </Button>
            } />
        ))}
      </Group>
    </div>
  );
}
