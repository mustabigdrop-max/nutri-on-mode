import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Client {
  id: string;
  lead_id: string | null;
  name: string;
  whatsapp: string | null;
  goal: string | null;
  plan: string | null;
  monthly_value: number | null;
  status: string;
  started_at: string;
  notes: string | null;
}

interface ClientRecord {
  id: string;
  type: string;
  title: string;
  content: string | null;
  record_date: string;
}

const RECORD_TYPES = [
  { value: "prescricao", label: "PRESCRIÇÃO" },
  { value: "treino", label: "TREINO" },
  { value: "checkin", label: "CHECK-IN" },
] as const;

const STATUS = ["ativo", "pausado", "encerrado"] as const;
const STATUS_COLOR: Record<string, string> = { ativo: "#00d4a1", pausado: "#ffd93d", encerrado: "#ff4757" };

export default function ClientesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", whatsapp: "", goal: "", plan: "", monthly_value: "" });

  useEffect(() => {
    document.title = "Clientes — nutriON";
    void load();
  }, []);

  useEffect(() => {
    const leadId = params.get("lead");
    if (!leadId || !user) return;
    void convertLead(leadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, user]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("mce_clients").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Não foi possível carregar os clientes");
    setClients((data as unknown as Client[]) || []);
    setLoading(false);
  }

  async function convertLead(leadId: string) {
    if (!user) return;
    const { data: existing } = await supabase.from("mce_clients").select("id").eq("lead_id", leadId).maybeSingle();
    if (existing) {
      setParams({}, { replace: true });
      return;
    }
    const { data: lead } = await supabase.from("mce_leads").select("*").eq("id", leadId).maybeSingle();
    if (!lead) return;
    const { data, error } = await supabase
      .from("mce_clients")
      .insert({
        coach_id: user.id,
        lead_id: leadId,
        name: (lead as { name: string }).name,
        whatsapp: (lead as { whatsapp: string | null }).whatsapp,
        goal: (lead as { goal: string | null }).goal,
      })
      .select()
      .single();
    if (error) {
      toast.error("Não foi possível converter o lead");
      return;
    }
    await supabase.from("mce_leads").update({ status: "convertido", converted_at: new Date().toISOString() }).eq("id", leadId);
    toast.success("Lead virou cliente");
    setParams({}, { replace: true });
    setClients((prev) => [data as unknown as Client, ...prev]);
    setSelected(data as unknown as Client);
  }

  async function createClient() {
    if (!user || !form.name.trim()) return;
    const { data, error } = await supabase
      .from("mce_clients")
      .insert({
        coach_id: user.id,
        name: form.name.trim(),
        whatsapp: form.whatsapp.trim() || null,
        goal: form.goal.trim() || null,
        plan: form.plan.trim() || null,
        monthly_value: form.monthly_value ? Number(form.monthly_value) : null,
      })
      .select()
      .single();
    if (error) return toast.error("Não foi possível criar o cliente");
    setClients((prev) => [data as unknown as Client, ...prev]);
    setCreating(false);
    setForm({ name: "", whatsapp: "", goal: "", plan: "", monthly_value: "" });
    toast.success("Cliente criado");
  }

  const filtered = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase())),
    [clients, search]
  );

  const ativos = clients.filter((c) => c.status === "ativo").length;
  const mrr = clients.filter((c) => c.status === "ativo").reduce((s, c) => s + (c.monthly_value || 0), 0);

  if (selected) {
    return (
      <ClientDetail
        client={selected}
        coachId={user?.id ?? null}
        onBack={() => setSelected(null)}
        onChanged={(c) => {
          setClients((prev) => prev.map((x) => (x.id === c.id ? c : x)));
          setSelected(c);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coach/dashboard")} className="p-2 border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-wide">Clientes</h1>
            <p className="text-[10px] tracking-[3px] text-muted-foreground font-mono">DO LEAD AO PROTOCOLO ATIVO</p>
          </div>
          <button
            onClick={() => setCreating((v) => !v)}
            className="px-3 py-2 text-[10px] font-mono tracking-widest bg-primary text-primary-foreground flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> NOVO
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="CLIENTES" value={String(clients.length)} />
          <Metric label="ATIVOS" value={String(ativos)} />
          <Metric label="RECEITA/MÊS" value={`R$ ${mrr.toFixed(0)}`} />
        </div>

        {creating && (
          <div className="border border-border bg-card p-4 space-y-2">
            {(
              [
                ["name", "Nome"],
                ["whatsapp", "WhatsApp"],
                ["goal", "Objetivo"],
                ["plan", "Plano"],
                ["monthly_value", "Valor mensal"],
              ] as const
            ).map(([key, label]) => (
              <input
                key={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={label}
                className="w-full bg-background border border-border p-2 text-sm outline-none"
              />
            ))}
            <button onClick={createClient} className="px-4 py-2 text-[10px] font-mono tracking-widest bg-primary text-primary-foreground">
              SALVAR CLIENTE
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border border-border px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cliente ainda. Converta um lead em /leads.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="w-full text-left border border-border bg-card p-4"
                style={{ borderLeft: `3px solid ${STATUS_COLOR[c.status] ?? "#666"}` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.goal || "objetivo não informado"} · desde {new Date(c.started_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <span
                    className="text-[9px] font-mono tracking-widest px-2 py-1 border"
                    style={{ color: STATUS_COLOR[c.status], borderColor: STATUS_COLOR[c.status] }}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function ClientDetail({
  client,
  coachId,
  onBack,
  onChanged,
}: {
  client: Client;
  coachId: string | null;
  onBack: () => void;
  onChanged: (c: Client) => void;
}) {
  const [records, setRecords] = useState<ClientRecord[]>([]);
  const [type, setType] = useState<string>("prescricao");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState(client.notes || "");

  useEffect(() => {
    supabase
      .from("mce_client_records")
      .select("*")
      .eq("client_id", client.id)
      .order("record_date", { ascending: false })
      .then(({ data }) => setRecords((data as unknown as ClientRecord[]) || []));
  }, [client.id]);

  async function addRecord() {
    if (!coachId || !title.trim()) return;
    const { data, error } = await supabase
      .from("mce_client_records")
      .insert({ client_id: client.id, coach_id: coachId, type, title: title.trim(), content: content.trim() || null })
      .select()
      .single();
    if (error) return toast.error("Não foi possível salvar o registro");
    setRecords((prev) => [data as unknown as ClientRecord, ...prev]);
    setTitle("");
    setContent("");
    toast.success("Registro adicionado ao histórico");
  }

  async function patch(p: Partial<Client>) {
    const { data, error } = await supabase.from("mce_clients").update(p).eq("id", client.id).select().single();
    if (error) return toast.error("Não foi possível atualizar");
    onChanged(data as unknown as Client);
    toast.success("Atualizado");
  }

  const waHref = client.whatsapp
    ? `https://wa.me/${(client.whatsapp.replace(/\D/g, "").length > 11 ? "" : "55") + client.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{client.name}</h1>
            <p className="text-xs text-muted-foreground">
              {client.whatsapp || "sem WhatsApp"} · {client.plan || "sem plano definido"}
            </p>
          </div>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-[10px] font-mono tracking-widest flex items-center gap-1"
              style={{ background: "#25D366", color: "#fff" }}
            >
              <MessageCircle className="w-3 h-3" /> WHATSAPP
            </a>
          )}
        </div>

        <div className="border border-border bg-card p-4">
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-2">STATUS</div>
          <div className="flex gap-2">
            {STATUS.map((s) => (
              <button
                key={s}
                onClick={() => patch({ status: s })}
                className="px-3 py-1.5 text-[10px] font-mono tracking-widest border"
                style={
                  client.status === s
                    ? { background: STATUS_COLOR[s], color: "#000", borderColor: STATUS_COLOR[s] }
                    : { borderColor: "hsl(var(--border))" }
                }
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground mt-4 mb-2">OBSERVAÇÕES</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border p-2 text-sm outline-none"
          />
          <button
            onClick={() => patch({ notes })}
            className="mt-2 px-4 py-2 text-[10px] font-mono tracking-widest bg-primary text-primary-foreground"
          >
            SALVAR
          </button>
        </div>

        <div className="border border-border bg-card p-4 space-y-2">
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground">NOVO REGISTRO</div>
          <div className="flex gap-2">
            {RECORD_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-3 py-1.5 text-[10px] font-mono tracking-widest border ${
                  type === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (ex: Protocolo cutting — semana 1)"
            className="w-full bg-background border border-border p-2 text-sm outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Detalhes da prescrição ou do treino"
            className="w-full bg-background border border-border p-2 text-sm outline-none"
          />
          <button onClick={addRecord} className="px-4 py-2 text-[10px] font-mono tracking-widest bg-primary text-primary-foreground">
            ADICIONAR AO HISTÓRICO
          </button>
        </div>

        <div className="border border-border bg-card p-4">
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-3">HISTÓRICO</div>
          {records.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma prescrição ou treino registrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="border-l border-border pl-3">
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {new Date(r.record_date).toLocaleDateString("pt-BR")} ·{" "}
                    {RECORD_TYPES.find((t) => t.value === r.type)?.label ?? r.type.toUpperCase()}
                  </div>
                  <div className="font-bold text-sm">{r.title}</div>
                  {r.content && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{r.content}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
