import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, MessageCircle, Search, Send, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MceRadar from "@/components/mce/MceRadar";
import { PILLAR_META, QUESTIONS, bioLink, insightFor, levelFor, weakestPillar, type DiagPillar } from "@/data/mceDiagnostico";

interface Lead {
  id: string;
  created_at: string;
  name: string;
  whatsapp: string | null;
  goal: string | null;
  score_mentalidade: number;
  score_comportamento: number;
  score_execucao: number;
  score_total: number;
  level: string;
  answers: { pillar: DiagPillar; question_index: number; score: number }[];
  status: string;
  notes: string | null;
  contacted_at: string | null;
  last_followup_at: string | null;
  followup_count: number | null;
  utm_source: string | null;
  utm_campaign: string | null;
}

interface Activity {
  id: string;
  created_at: string;
  type: string;
  content: string | null;
  old_value: string | null;
  new_value: string | null;
}

const STATUSES = ["novo", "contatado", "em_negociacao", "convertido", "perdido"] as const;
const STATUS_LABEL: Record<string, string> = {
  novo: "NOVO",
  contatado: "CONTATADO",
  em_negociacao: "EM NEGOCIAÇÃO",
  convertido: "CONVERTIDO",
  perdido: "PERDIDO",
};
const STATUS_COLOR: Record<string, string> = {
  novo: "#00D4FF",
  contatado: "#ffd93d",
  em_negociacao: "#ff9f43",
  convertido: "#00d4a1",
  perdido: "#ff4757",
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [funnel, setFunnel] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "Leads — Diagnóstico MCE";
    load();
    loadFunnel();
  }, []);

  async function loadFunnel() {
    const { data } = await supabase
      .from("mce_funnel_events")
      .select("step, session_id")
      .order("created_at", { ascending: false })
      .limit(5000);
    const seen: Record<string, Set<string>> = {};
    ((data as unknown as { step: string; session_id: string }[]) || []).forEach((e) => {
      (seen[e.step] ||= new Set()).add(e.session_id);
    });
    setFunnel(Object.fromEntries(Object.entries(seen).map(([k, v]) => [k, v.size])));
  }

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("mce_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Não foi possível carregar os leads");
    setLeads((data as unknown as Lead[]) || []);
    setLoading(false);
  }

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (filter === "todos" || l.status === filter) &&
          l.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [leads, filter, search]
  );

  const queue = useMemo(
    () =>
      leads.filter(
        (l) =>
          !!l.whatsapp &&
          l.status !== "convertido" &&
          l.status !== "perdido" &&
          !l.contacted_at &&
          hoursSince(l.created_at) >= 24 &&
          (!l.last_followup_at || hoursSince(l.last_followup_at) >= 24)
      ),
    [leads]
  );

  async function runFollowupQueue() {
    if (!queue.length || sending) return;
    setSending(true);
    // Abre todas as janelas de forma síncrona (mantém o gesto do usuário)
    const openedLeads = queue.filter((lead) => {
      const win = window.open(waLink(lead, followupMessage(lead)), "_blank");
      return !!win;
    });
    for (const lead of openedLeads) {
      const now = new Date().toISOString();
      await supabase
        .from("mce_leads")
        .update({ last_followup_at: now, followup_count: (lead.followup_count || 0) + 1, status: "contatado", contacted_at: now })
        .eq("id", lead.id);
      if (user?.id) {
        await supabase.from("mce_lead_activities").insert({
          lead_id: lead.id,
          coach_id: user.id,
          type: "whatsapp_followup",
          content: "Follow-up automático de 24h disparado pela fila",
        });
      }
    }
    await load();
    setSending(false);
    if (!openedLeads.length) {
      toast.error("Nenhuma conversa foi aberta. Libere pop-ups deste site e tente novamente.");
    } else if (openedLeads.length < queue.length) {
      toast.warning(
        `${openedLeads.length} de ${queue.length} abertos. Libere pop-ups para disparar o restante — os demais seguem na fila.`,
      );
    } else {
      toast.success(`${openedLeads.length} follow-up(s) disparado(s)`);
    }
  }


  const total = leads.length;
  const novos = leads.filter((l) => l.status === "novo").length;
  const convertidos = leads.filter((l) => l.status === "convertido").length;
  const taxa = total ? Math.round((convertidos / total) * 100) : 0;

  if (selected) {
    return (
      <LeadDetail
        lead={selected}
        coachId={user?.id ?? null}
        onBack={() => setSelected(null)}
        onChanged={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          setSelected(updated);
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
          <div>
            <h1 className="text-xl font-bold tracking-wide">Leads — Diagnóstico MCE</h1>
            <p className="text-[10px] tracking-[3px] text-muted-foreground font-mono">CAPTAÇÃO VIA LINK DA BIO</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="TOTAL" value={String(total)} />
          <Metric label="NOVOS" value={String(novos)} />
          <Metric label="CONVERSÃO" value={`${taxa}%`} />
        </div>

        <BioLinkCard />
        <FunnelPanel funnel={funnel} leads={leads} />

        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground">FILA DE FOLLOW-UP · 24H SEM CONTATO</div>
              <div className="text-2xl font-bold mt-1">{queue.length}</div>
            </div>
            <button
              onClick={runFollowupQueue}
              disabled={!queue.length || sending}
              className="px-4 py-3 text-[10px] font-mono tracking-widest flex items-center gap-2 disabled:opacity-40"
              style={{ background: "#25D366", color: "#fff" }}
            >
              <Send className="w-3 h-3" /> {sending ? "DISPARANDO..." : "DISPARAR FILA"}
            </button>
          </div>
          {queue.length > 0 && (
            <p className="text-[10px] font-mono text-muted-foreground mt-2">
              {queue.map((l) => l.name).join(" · ")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {["todos", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[10px] font-mono tracking-widest border ${
                filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              }`}
            >
              {s === "todos" ? "TODOS" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border border-border px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lead encontrado.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => (
              <LeadCard key={l.id} lead={l} onOpen={() => setSelected(l)} />
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

function hoursSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

function waLink(lead: Lead, message: string) {
  const digits = (lead.whatsapp || "").replace(/\D/g, "");
  const phone = digits.length > 11 ? digits : `55${digits}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function followupMessage(lead: Lead) {
  const w = weakestPillar({ M: lead.score_mentalidade, C: lead.score_comportamento, E: lead.score_execucao });
  return `Oi ${lead.name}, aqui é o Diogo Mello. Seu Diagnóstico MCE apontou ${PILLAR_META[w].label.toLowerCase()} como o ponto mais frágil — e é exatamente isso que trava a maioria.\n\nTransformação é sistema. Quer que eu te mostre o primeiro passo?`;
}

function BioLinkCard() {
  const link = bioLink();
  return (
    <div className="border border-border bg-card p-4">
      <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground">LINK DA BIO · @diogo.mell0</div>
      <div className="text-xs font-mono break-all mt-2">{link}</div>
      <button
        onClick={() => {
          void navigator.clipboard.writeText(link);
          toast.success("Link copiado");
        }}
        className="mt-3 px-3 py-2 text-[10px] font-mono tracking-widest border border-border flex items-center gap-1"
      >
        <Copy className="w-3 h-3" /> COPIAR LINK
      </button>
    </div>
  );
}

function FunnelPanel({ funnel, leads }: { funnel: Record<string, number>; leads: Lead[] }) {
  const views = funnel.view || 0;
  const started = funnel.quiz_start || 0;
  const completed = funnel.quiz_complete || 0;
  const withWhats = leads.filter((l) => !!l.whatsapp).length;
  const rows: [string, number][] = [
    ["CHEGARAM EM /DIAGNOSTICO", views],
    ["COMEÇARAM O QUIZ", started],
    ["COMPLETARAM O QUIZ", completed],
    ["DEIXARAM WHATSAPP", withWhats],
  ];
  const base = Math.max(views, 1);
  return (
    <div className="border border-border bg-card p-4 space-y-3">
      <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground">FUNIL REAL</div>
      {rows.map(([label, value]) => (
        <div key={label}>
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold">
              {value} · {Math.round((value / base) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted mt-1">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (value / base) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function contextMessage(lead: Lead) {
  const w = weakestPillar({ M: lead.score_mentalidade, C: lead.score_comportamento, E: lead.score_execucao });
  const scoreMap = { M: lead.score_mentalidade, C: lead.score_comportamento, E: lead.score_execucao };
  return `Oi ${lead.name}! Aqui é o Coach Diogo. Vi que você fez o Diagnóstico MCE e seu maior gap foi em ${PILLAR_META[w].label.toLowerCase()} (${scoreMap[w]}%).\n\nPosso te explicar como o Método MCE trabalha exatamente esse ponto. Tem 5 minutos pra gente conversar?`;
}

function LeadCard({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
  const color = levelFor(lead.score_total).color;
  const stale = lead.status === "novo" && !lead.contacted_at ? hoursSince(lead.created_at) : 0;
  return (
    <div className="border border-border bg-card p-4" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold">{lead.name}</div>
          <div className="text-xs text-muted-foreground">
            {lead.whatsapp || "sem WhatsApp"} · {lead.goal || "objetivo não informado"}
          </div>
        </div>
        <span
          className="text-[9px] font-mono tracking-widest px-2 py-1 border"
          style={{ color: STATUS_COLOR[lead.status], borderColor: STATUS_COLOR[lead.status] }}
        >
          {STATUS_LABEL[lead.status] ?? lead.status}
        </span>
      </div>
      <div className="flex gap-4 mt-3 text-xs font-mono">
        <span style={{ color: PILLAR_META.M.color }}>🧠 {lead.score_mentalidade}%</span>
        <span style={{ color: PILLAR_META.C.color }}>⚡ {lead.score_comportamento}%</span>
        <span style={{ color: PILLAR_META.E.color }}>🎯 {lead.score_execucao}%</span>
        <span className="ml-auto font-bold" style={{ color }}>
          {lead.score_total}% · {lead.level}
        </span>
      </div>
      {stale >= 24 && (
        <div className="mt-2 text-[10px] font-mono" style={{ color: stale >= 48 ? "#ff4757" : "#ffd93d" }}>
          SEM CONTATO HÁ {Math.floor(stale)}H
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] font-mono text-muted-foreground mr-auto">
          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
        </span>
        {lead.whatsapp && (
          <a
            href={waLink(lead, contextMessage(lead))}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-mono tracking-widest px-3 py-2 flex items-center gap-1"
            style={{ background: "#25D366", color: "#fff" }}
          >
            <MessageCircle className="w-3 h-3" /> WHATSAPP
          </a>
        )}
        <button onClick={onOpen} className="text-[10px] font-mono tracking-widest px-3 py-2 border border-border">
          DETALHES
        </button>
      </div>
    </div>
  );
}

function LeadDetail({
  lead,
  coachId,
  onBack,
  onChanged,
}: {
  lead: Lead;
  coachId: string | null;
  onBack: () => void;
  onChanged: (l: Lead) => void;
}) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(lead.notes || "");
  const [activities, setActivities] = useState<Activity[]>([]);
  const weakest = weakestPillar({ M: lead.score_mentalidade, C: lead.score_comportamento, E: lead.score_execucao });
  const weakScore = { M: lead.score_mentalidade, C: lead.score_comportamento, E: lead.score_execucao }[weakest];

  useEffect(() => {
    supabase
      .from("mce_lead_activities")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setActivities((data as unknown as Activity[]) || []));
  }, [lead.id]);

  async function logActivity(type: string, content: string, oldValue?: string, newValue?: string) {
    if (!coachId) return;
    const { data } = await supabase
      .from("mce_lead_activities")
      .insert({ lead_id: lead.id, type, content, old_value: oldValue ?? null, new_value: newValue ?? null, coach_id: coachId })
      .select()
      .single();
    if (data) setActivities((prev) => [data as unknown as Activity, ...prev]);
  }

  async function changeStatus(status: string) {
    const patch: { status: string; contacted_at?: string; converted_at?: string } = { status };
    if (status === "contatado" && !lead.contacted_at) patch.contacted_at = new Date().toISOString();
    if (status === "convertido") patch.converted_at = new Date().toISOString();
    const { data, error } = await supabase.from("mce_leads").update(patch).eq("id", lead.id).select().single();
    if (error) return toast.error("Não foi possível atualizar o status");
    onChanged(data as unknown as Lead);
    await logActivity("status_change", `Status alterado para ${STATUS_LABEL[status]}`, lead.status, status);
    toast.success("Status atualizado");
  }

  async function saveNotes() {
    const { data, error } = await supabase.from("mce_leads").update({ notes }).eq("id", lead.id).select().single();
    if (error) return toast.error("Não foi possível salvar a nota");
    onChanged(data as unknown as Lead);
    await logActivity("note", notes);
    toast.success("Nota salva");
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{lead.name}</h1>
            <p className="text-xs text-muted-foreground">
              {lead.whatsapp || "sem WhatsApp"} · {lead.goal || "objetivo não informado"} ·{" "}
              {new Date(lead.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="border border-border bg-card p-4">
          <MceRadar m={lead.score_mentalidade} c={lead.score_comportamento} e={lead.score_execucao} size={240} />
          <div className="text-center text-2xl font-bold" style={{ color: levelFor(lead.score_total).color }}>
            {lead.score_total}% · {lead.level}
          </div>
          {(lead.utm_source || lead.utm_campaign) && (
            <div className="text-center text-[10px] font-mono text-muted-foreground mt-2">
              ORIGEM: {lead.utm_source || "—"} / {lead.utm_campaign || "—"}
            </div>
          )}
        </div>

        <div className="border border-border bg-card p-4">
          <div className="text-[9px] font-mono tracking-[2px]" style={{ color: "#ff4757" }}>
            MAIOR GAP · {PILLAR_META[weakest].label} {weakScore}%
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{insightFor(weakest, weakScore)}</p>
        </div>

        <div className="border border-border bg-card p-4 space-y-2">
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground">RESPOSTAS</div>
          {(lead.answers || []).map((a, i) => {
            const q = QUESTIONS[a.question_index];
            if (!q) return null;
            const opt = q.options.find((o) => o.value === a.score);
            return (
              <div key={i} className="text-xs">
                <span style={{ color: PILLAR_META[a.pillar].color }}>{q.emoji} </span>
                <span className="text-muted-foreground">{q.text}</span>
                <div className="text-foreground">→ {opt?.text ?? `valor ${a.score}`}</div>
              </div>
            );
          })}
        </div>

        <div className="border border-border bg-card p-4">
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-2">STATUS</div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className="px-3 py-1.5 text-[10px] font-mono tracking-widest border"
                style={
                  lead.status === s
                    ? { background: STATUS_COLOR[s], color: "#000", borderColor: STATUS_COLOR[s] }
                    : { borderColor: "hsl(var(--border))" }
                }
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground mt-4 mb-2">NOTAS</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border p-2 text-sm outline-none"
          />
          <button onClick={saveNotes} className="mt-2 px-4 py-2 text-[10px] font-mono tracking-widest bg-primary text-primary-foreground">
            SALVAR NOTA
          </button>
        </div>

        <button
          onClick={() => navigate(`/clientes?lead=${lead.id}`)}
          className="w-full flex items-center justify-center gap-2 py-4 font-bold tracking-widest bg-primary text-primary-foreground"
        >
          <UserPlus className="w-4 h-4" /> TRANSFORMAR EM CLIENTE
        </button>

        {lead.whatsapp && (
          <a
            href={waLink(lead, contextMessage(lead))}
            target="_blank"
            rel="noreferrer"
            onClick={() => logActivity("whatsapp_sent", "Mensagem enviada pelo WhatsApp")}
            className="block text-center py-4 font-bold tracking-widest"
            style={{ background: "#25D366", color: "#fff" }}
          >
            FALAR NO WHATSAPP
          </a>
        )}

        <div className="border border-border bg-card p-4">
          <div className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-3">HISTÓRICO</div>
          {activities.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem atividades registradas.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="text-xs border-l border-border pl-3">
                  <div className="text-muted-foreground font-mono text-[10px]">
                    {new Date(a.created_at).toLocaleString("pt-BR")} · {a.type}
                  </div>
                  <div>{a.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
