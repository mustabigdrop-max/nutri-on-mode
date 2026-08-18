import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, MessageCircle, Pencil, StickyNote, Loader2, Trash2, ChevronDown, LayoutList, Kanban } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GYM_STATUSES, GYM_TYPES, Gym, GymStatus, gymPhone, openWhatsApp,
  statusMeta, WA_TEMPLATES, buildWhatsAppMessage, templateForStatus,
} from "@/lib/gymBusiness";
import GymKanbanBoard from "./GymKanbanBoard";

const emptyForm = {
  name: "", neighborhood: "", address: "", owner_name: "", owner_phone: "",
  instagram: "", estimated_members: "", gym_type: "boutique", notes: "",
};

const SELECT_COLS =
  "id, name, city, neighborhood, address, owner_name, owner_phone, contact_name, contact_phone, instagram, estimated_members, gym_type, status, commission_percent, notes, challenge_slug, active, contacted_at, visited_at, closed_at, created_at";

export default function BusinessGymsTab({ onChanged }: { onChanged?: () => void }) {
  const { user } = useAuth();
  const [gyms, setGyms] = useState<Gym[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fStatus, setFStatus] = useState<string>("all");
  const [fHood, setFHood] = useState<string>("all");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [view, setView] = useState<"lista" | "kanban">("lista");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("partner_gyms")
      .select(SELECT_COLS)
      .order("created_at", { ascending: false });
    if (error) toast.error("Não foi possível carregar as academias.");
    setGyms((data as unknown as Gym[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const hoods = useMemo(
    () => Array.from(new Set((gyms ?? []).map((g) => g.neighborhood || g.city).filter(Boolean) as string[])),
    [gyms],
  );

  const filtered = useMemo(
    () =>
      (gyms ?? []).filter(
        (g) =>
          (fStatus === "all" || g.status === fStatus) &&
          (fHood === "all" || (g.neighborhood || g.city) === fHood),
      ),
    [gyms, fStatus, fHood],
  );

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (g: Gym) => {
    setEditing(g.id);
    setForm({
      name: g.name ?? "",
      neighborhood: g.neighborhood ?? g.city ?? "",
      address: g.address ?? "",
      owner_name: g.owner_name ?? g.contact_name ?? "",
      owner_phone: g.owner_phone ?? g.contact_phone ?? "",
      instagram: g.instagram ?? "",
      estimated_members: g.estimated_members ? String(g.estimated_members) : "",
      gym_type: g.gym_type ?? "boutique",
      notes: g.notes ?? "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!user) return;
    if (form.name.trim().length < 2) return toast.error("Informe o nome da academia.");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      neighborhood: form.neighborhood.trim() || null,
      city: form.neighborhood.trim() || null,
      address: form.address.trim() || null,
      owner_name: form.owner_name.trim() || null,
      contact_name: form.owner_name.trim() || null,
      owner_phone: form.owner_phone.trim() || null,
      contact_phone: form.owner_phone.trim() || null,
      instagram: form.instagram.trim().replace(/^@/, "") || null,
      estimated_members: form.estimated_members ? Number(form.estimated_members) : null,
      gym_type: form.gym_type,
      notes: form.notes.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("partner_gyms").update(payload).eq("id", editing)
      : await supabase.from("partner_gyms").insert({ ...payload, coach_user_id: user.id });
    setSaving(false);
    if (error) return toast.error("Erro ao salvar academia.");
    toast.success(editing ? "Academia atualizada." : "Academia cadastrada.");
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
    onChanged?.();
  };

  const logInteraction = async (gymId: string, type: string, description: string) => {
    if (!user) return;
    await supabase.from("gym_interactions").insert({
      gym_id: gymId, coach_user_id: user.id, type, description,
    });
  };

  const moveStatus = async (gym: Gym, status: GymStatus) => {
    const patch: { status: GymStatus; contacted_at?: string; visited_at?: string; closed_at?: string } = { status };
    if (status === "prospectada" && !gym.contacted_at) patch.contacted_at = new Date().toISOString();
    if (status === "visitada" && !gym.visited_at) patch.visited_at = new Date().toISOString();
    if (status === "fechada") patch.closed_at = new Date().toISOString();
    setGyms((prev) => prev?.map((g) => (g.id === gym.id ? { ...g, status } : g)) ?? prev);
    const { error } = await supabase.from("partner_gyms").update(patch).eq("id", gym.id);
    if (error) { toast.error("Erro ao mover status."); load(); return; }
    logInteraction(gym.id, "nota", `Status alterado para ${statusMeta(status).label}`);
    onChanged?.();
  };

  const bulkMoveStatus = async (list: Gym[], status: GymStatus) => {
    if (!user || list.length === 0) return;
    const now = new Date().toISOString();
    setGyms((prev) => prev?.map((g) => (list.some((l) => l.id === g.id) ? { ...g, status } : g)) ?? prev);

    const results = await Promise.all(
      list.map((gym) => {
        const patch: { status: GymStatus; contacted_at?: string; visited_at?: string; closed_at?: string } = { status };
        if (status === "prospectada" && !gym.contacted_at) patch.contacted_at = now;
        if (status === "visitada" && !gym.visited_at) patch.visited_at = now;
        if (status === "fechada") patch.closed_at = now;
        return supabase.from("partner_gyms").update(patch).eq("id", gym.id);
      }),
    );
    const failed = results.filter((r) => r.error).length;

    await supabase.from("gym_interactions").insert(
      list.map((gym) => ({
        gym_id: gym.id,
        coach_user_id: user.id,
        type: "nota",
        description: `Movida em massa para ${statusMeta(status).label} (lote de ${list.length})`,
      })),
    );

    if (failed) { toast.error(`${failed} academia(s) não foram movidas.`); load(); }
    else toast.success(`${list.length} academia(s) movidas para ${statusMeta(status).label}.`);
    onChanged?.();
  };


  const whatsapp = async (gym: Gym, templateId?: string) => {
    const phone = gymPhone(gym);
    if (!phone) return toast.error("Cadastre um telefone para essa academia.");
    const { tpl, text } = buildWhatsAppMessage(gym, templateId);
    openWhatsApp(phone, text);
    toast.success(`WhatsApp aberto · ${tpl.label}`);
    await logInteraction(gym.id, "whatsapp", `WhatsApp enviado — ${tpl.label}`);
    if (gym.status === "nao_contactada") moveStatus(gym, "prospectada");
  };

  const saveNote = async (gym: Gym) => {
    if (!noteText.trim()) return setNoteFor(null);
    await logInteraction(gym.id, "nota", noteText.trim());
    await supabase.from("partner_gyms").update({ notes: noteText.trim() }).eq("id", gym.id);
    setNoteFor(null);
    setNoteText("");
    toast.success("Nota registrada.");
    load();
  };

  const remove = async (gym: Gym) => {
    const { error } = await supabase.from("partner_gyms").delete().eq("id", gym.id);
    if (error) return toast.error("Erro ao remover academia.");
    setGyms((prev) => prev?.filter((g) => g.id !== gym.id) ?? prev);
    onChanged?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Nova academia
        </Button>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {GYM_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.dot} {s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fHood} onValueChange={setFHood}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Bairro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os bairros</SelectItem>
            {hoods.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex ml-auto">
          <Button size="sm" variant={view === "lista" ? "default" : "outline"}
            className="gap-1 rounded-r-none" onClick={() => setView("lista")}>
            <LayoutList className="w-3.5 h-3.5" /> Lista
          </Button>
          <Button size="sm" variant={view === "kanban" ? "default" : "outline"}
            className="gap-1 rounded-l-none" onClick={() => setView("kanban")}>
            <Kanban className="w-3.5 h-3.5" /> Kanban
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Nome da academia" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Bairro" value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            <Input placeholder="Endereço" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="Dono / gerente" value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
            <Input placeholder="Telefone / WhatsApp" value={form.owner_phone}
              onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} />
            <Input placeholder="Instagram" value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            <Input placeholder="Nº estimado de alunos" inputMode="numeric" value={form.estimated_members}
              onChange={(e) => setForm({ ...form, estimated_members: e.target.value.replace(/\D/g, "") })} />
            <Select value={form.gym_type} onValueChange={(v) => setForm({ ...form, gym_type: v })}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                {GYM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea className="sm:col-span-2" placeholder="Notas" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="sm:col-span-2 flex gap-2">
              <Button onClick={save} disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!gyms && (
        <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      )}
      {gyms && filtered.length === 0 && (
        <p className="p-6 text-sm text-muted-foreground text-center">
          Nenhuma academia neste filtro. Cadastre a primeira e comece a prospecção.
        </p>
      )}

      {gyms && view === "kanban" && filtered.length > 0 && (
        <GymKanbanBoard
          gyms={filtered}
          onMove={(g, s) => moveStatus(g, s)}
          onBulkMove={bulkMoveStatus}

          onEdit={openEdit}
          onWhatsApp={(g) => whatsapp(g)}
        />
      )}

      <div className={view === "kanban" ? "hidden" : "space-y-3"}>
        {filtered.map((g) => {
          const meta = statusMeta(g.status);
          return (
            <Card key={g.id} style={{ borderColor: `${meta.color}33` }}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{meta.dot} {g.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[g.neighborhood || g.city, g.address].filter(Boolean).join(" · ") || "Sem endereço"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[g.owner_name || g.contact_name, g.owner_phone || g.contact_phone,
                        g.instagram ? `@${g.instagram}` : null].filter(Boolean).join(" · ") || "Sem contato"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {g.estimated_members ? `~${g.estimated_members} alunos` : "alunos não informados"}
                      {g.gym_type ? ` · ${GYM_TYPES.find((t) => t.value === g.gym_type)?.label ?? g.gym_type}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full border shrink-0"
                    style={{ borderColor: `${meta.color}55`, color: meta.color }}>
                    {meta.label.toUpperCase()}
                  </span>
                </div>

                {g.notes && <p className="text-xs text-muted-foreground italic">“{g.notes}”</p>}

                {noteFor === g.id ? (
                  <div className="flex gap-2">
                    <Input autoFocus placeholder="Nova nota…" value={noteText}
                      onChange={(e) => setNoteText(e.target.value)} />
                    <Button size="sm" onClick={() => saveNote(g)}>Salvar</Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex">
                      <Button size="sm" variant="outline" className="gap-1 rounded-r-none border-r-0"
                        onClick={() => whatsapp(g)}>
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        <span className="hidden sm:inline text-[10px] text-muted-foreground">
                          · {templateForStatus(g.status).label.replace(/^\S+\s/, "")}
                        </span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="rounded-l-none px-2"
                            aria-label="Escolher template de mensagem">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-60">
                          <DropdownMenuLabel className="text-xs">Template do funil</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {WA_TEMPLATES.map((t) => (
                            <DropdownMenuItem key={t.id} onClick={() => whatsapp(g, t.id)} className="text-xs">
                              {t.label}
                              {t.status === g.status && (
                                <span className="ml-auto text-[10px] text-primary">recomendado</span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(g)}>
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1"
                      onClick={() => { setNoteFor(g.id); setNoteText(""); }}>
                      <StickyNote className="w-3.5 h-3.5" /> Notas
                    </Button>
                    <Select value={g.status} onValueChange={(v) => moveStatus(g, v as GymStatus)}>
                      <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GYM_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.dot} {s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => remove(g)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
