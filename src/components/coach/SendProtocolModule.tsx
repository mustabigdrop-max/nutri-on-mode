import { safeString } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Search, GraduationCap, Handshake, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type Recipient = {
  id: string; // user_id (aluno) ou partner.id (parceiro)
  user_id: string | null; // sempre o auth user_id quando disponível (para notificação)
  name: string;
  email?: string;
  tipo: "aluno" | "parceiro";
};

const ALUNO_OPTS = [
  { key: "treino", label: "Treino", table: "training_protocols" },
  { key: "plano_alimentar", label: "Plano Alimentar", table: "daily_nutrition_protocol" },
  { key: "suplementacao", label: "Suplementação", table: "lab_protocols" },
  { key: "peptideos", label: "Peptídeos", table: "peptide_search_history" },
] as const;

const PARCEIRO_OPTS = [
  { key: "protocolo_completo", label: "Protocolo Completo" },
  { key: "material_educativo", label: "Material Educativo" },
  { key: "modelo_prescricao", label: "Modelo de Prescrição" },
] as const;

interface Props {
  coachProfileId: string;
  coachUserId: string;
}

export default function SendProtocolModule({ coachProfileId, coachUserId }: Props) {
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "aluno" | "parceiro">("todos");
  const [openFor, setOpenFor] = useState<Recipient | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [observacao, setObservacao] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const all: Recipient[] = [];

      // Alunos vinculados ao coach
      const { data: patients } = await supabase
        .from("coach_patients")
        .select("patient_user_id")
        .eq("coach_id", coachProfileId)
        .eq("status", "active");

      if (patients?.length) {
        const ids = patients.map((p) => p.patient_user_id);
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", ids);
        for (const p of patients) {
          const prof = profs?.find((x) => x.user_id === p.patient_user_id);
          all.push({
            id: p.patient_user_id,
            user_id: p.patient_user_id,
            name: prof?.full_name || "Aluno",
            tipo: "aluno",
          });
        }
      }

      // Parceiros criados pelo coach
      const { data: partners } = await supabase
        .from("partners")
        .select("id, user_id, full_name, email")
        .eq("created_by", coachUserId);

      if (partners?.length) {
        for (const pa of partners) {
          all.push({
            id: pa.id,
            user_id: pa.user_id,
            name: pa.full_name || "Parceiro",
            email: pa.email || undefined,
            tipo: "parceiro",
          });
        }
      }

      setRecipients(all);
      setLoading(false);
    };
    load();
  }, [coachProfileId, coachUserId]);

  const openModal = (r: Recipient) => {
    setOpenFor(r);
    setSelected([]);
    setObservacao("");
  };

  const toggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSend = async () => {
    if (!openFor) return;
    if (selected.length === 0) {
      toast({ title: "Selecione ao menos um conteúdo", variant: "destructive" });
      return;
    }
    setSending(true);

    try {
      // Buscar IDs reais dos conteúdos quando aluno
      const conteudoIds: Record<string, string[]> = {};
      if (openFor.tipo === "aluno" && openFor.user_id) {
        for (const k of selected) {
          const opt = ALUNO_OPTS.find((o) => o.key === k);
          if (!opt) continue;
          const { data } = await (supabase as any)
            .from(opt.table)
            .select("id")
            .eq("user_id", openFor.user_id)
            .order("created_at", { ascending: false })
            .limit(1);
          const row = (data as any[] | null)?.[0];
          if (row?.id) conteudoIds[k] = [row.id];
        }
      }

      const { error: insertError } = await supabase.from("protocolo_envios").insert({
        coach_id: coachProfileId,
        destinatario_id: openFor.user_id || openFor.id,
        tipo_destinatario: openFor.tipo,
        tipo_conteudo: selected,
        conteudo_ids: conteudoIds,
        observacao: observacao || null,
        status: "enviado",
      });
      if (insertError) throw insertError;

      // Notificação (usa coach_notifications no lugar da edge function inexistente)
      if (openFor.user_id) {
        const titulo = `Novo protocolo recebido`;
        const corpo = `Seu coach enviou: ${selected.join(", ")}${observacao ? ` — ${observacao}` : ""}`;
        await supabase.from("coach_notifications").insert({
          recipient_user_id: openFor.user_id,
          sender_user_id: coachUserId,
          notification_type: "protocol_sent",
          title: titulo,
          message: corpo,
        });

        // Tenta também a edge function (opcional, se existir)
        try {
          await supabase.functions.invoke("dispara_notificacao", {
            body: { destinatario_id: openFor.user_id, titulo, corpo },
          });
        } catch {}
      }

      toast({ title: "Protocolo enviado! 📨", description: `Para ${openFor.name}` });
      setOpenFor(null);
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const filtered = recipients
    .filter((r) => filter === "todos" || r.tipo === filter)
    .filter((r) => safeString(r.name).toLowerCase().includes(safeString(search).toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const opts = openFor?.tipo === "aluno" ? ALUNO_OPTS : PARCEIRO_OPTS;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar destinatário..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["todos", "aluno", "parceiro"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "todos" ? "Todos" : f === "aluno" ? "Alunos" : "Parceiros"}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            Nenhum destinatário encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((r, i) => (
            <motion.div
              key={`${r.tipo}-${r.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{r.name}</p>
                      <Badge
                        variant="outline"
                        className="text-[10px] mt-1 flex items-center gap-1 w-fit"
                      >
                        {r.tipo === "aluno" ? (
                          <GraduationCap className="w-3 h-3" />
                        ) : (
                          <Handshake className="w-3 h-3" />
                        )}
                        {r.tipo === "aluno" ? "Aluno" : "Parceiro"}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => openModal(r)}>
                    <Send className="w-3.5 h-3.5 mr-1" /> Enviar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!openFor} onOpenChange={(o) => !o && setOpenFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Enviar Protocolo
            </DialogTitle>
          </DialogHeader>
          {openFor && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Destinatário</label>
                <Input value={openFor.name} readOnly className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tipo</label>
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">
                    {openFor.tipo === "aluno" ? (
                      <GraduationCap className="w-3 h-3 mr-1" />
                    ) : (
                      <Handshake className="w-3 h-3 mr-1" />
                    )}
                    {openFor.tipo}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  O que enviar?
                </label>
                <div className="space-y-2">
                  {opts.map((o) => (
                    <label
                      key={o.key}
                      className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selected.includes(o.key)}
                        onCheckedChange={() => toggle(o.key)}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Observação (opcional)
                </label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  placeholder="Mensagem para o destinatário..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>

              <Button onClick={handleSend} disabled={sending} className="w-full">
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar agora
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
