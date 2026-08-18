import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Check, Copy, MessageCircle, SkipForward } from "lucide-react";
import { toast } from "sonner";
import {
  Gym, WA_TEMPLATES, buildWhatsAppMessage, gymPhone, statusMeta, templateForStatus,
} from "@/lib/gymBusiness";

interface Props {
  gyms: Gym[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Registra o envio (timeline + avanço de status). */
  onSend: (gym: Gym, templateId: string, text: string) => Promise<void> | void;
  onFinished?: () => void;
}

export default function BulkWhatsAppDialog({ gyms, open, onOpenChange, onSend, onFinished }: Props) {
  const [index, setIndex] = useState(0);
  const [override, setOverride] = useState<string>("auto");
  const [text, setText] = useState("");
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const queue = useMemo(() => gyms.filter((g) => gymPhone(g)), [gyms]);
  const noPhone = gyms.length - queue.length;
  const current = queue[index];

  const currentTpl = useMemo(() => {
    if (!current) return null;
    return override === "auto"
      ? templateForStatus(current.status)
      : WA_TEMPLATES.find((t) => t.id === override) ?? templateForStatus(current.status);
  }, [current, override]);

  useEffect(() => {
    if (open) { setIndex(0); setSentIds([]); setSkipped([]); setOverride("auto"); }
  }, [open]);

  useEffect(() => {
    if (!current || !currentTpl) return;
    setText(buildWhatsAppMessage(current, currentTpl.id).text);
  }, [current, currentTpl]);

  const advance = () => {
    if (index + 1 >= queue.length) {
      onFinished?.();
      onOpenChange(false);
      return;
    }
    setIndex((i) => i + 1);
  };

  const send = async () => {
    if (!current || !currentTpl) return;
    setBusy(true);
    const phone = gymPhone(current);
    const full = phone.startsWith("55") ? phone : `55${phone}`;
    // window.open dentro do clique do usuário evita bloqueio de pop-up
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    try {
      await onSend(current, currentTpl.id, text);
      setSentIds((p) => [...p, current.id]);
    } catch {
      toast.error("Não foi possível registrar o envio na timeline.");
    }
    setBusy(false);
    advance();
  };

  const skip = () => {
    if (current) setSkipped((p) => [...p, current.id]);
    advance();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" /> Envio em massa · WhatsApp
          </DialogTitle>
          <DialogDescription>
            Um envio por vez para o WhatsApp não bloquear as janelas. Cada envio é registrado na timeline.
          </DialogDescription>
        </DialogHeader>

        {queue.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma das academias selecionadas tem telefone cadastrado.
          </p>
        ) : !current ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Fila concluída.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {index + 1} de {queue.length} · {sentIds.length} enviada(s)
                {skipped.length ? ` · ${skipped.length} pulada(s)` : ""}
              </span>
              {noPhone > 0 && (
                <span className="text-muted-foreground">{noPhone} sem telefone</span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all"
                style={{ width: `${((index) / queue.length) * 100}%` }} />
            </div>

            <div className="rounded-lg border p-3">
              <p className="font-semibold text-sm">{current.name}</p>
              <p className="text-xs text-muted-foreground">
                {[current.neighborhood || current.city, current.owner_name || current.contact_name,
                  gymPhone(current)].filter(Boolean).join(" · ")}
              </p>
              <p className="text-[11px] mt-1" style={{ color: statusMeta(current.status).color }}>
                {statusMeta(current.status).dot} {statusMeta(current.status).label}
              </p>
            </div>

            <Select value={override} onValueChange={setOverride}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático (template da etapa atual)</SelectItem>
                {WA_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea value={text} onChange={(e) => setText(e.target.value)}
              className="min-h-[160px] text-xs" />

            <div className="flex flex-wrap gap-2">
              <Button onClick={send} disabled={busy} className="gap-2">
                <MessageCircle className="w-4 h-4" /> Abrir e registrar
              </Button>
              <Button variant="outline" onClick={skip} disabled={busy} className="gap-2">
                <SkipForward className="w-4 h-4" /> Pular
              </Button>
              <Button variant="ghost" className="gap-2"
                onClick={() => { navigator.clipboard.writeText(text); toast.success("Mensagem copiada."); }}>
                <Copy className="w-4 h-4" /> Copiar
              </Button>
              <Button variant="ghost" className="ml-auto gap-2"
                onClick={() => { onFinished?.(); onOpenChange(false); }}>
                <Check className="w-4 h-4" /> Encerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
