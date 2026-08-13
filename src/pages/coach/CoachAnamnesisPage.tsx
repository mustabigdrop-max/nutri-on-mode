import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Copy, FileDown, Loader2, Save, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnamnesisSectionForm } from "@/components/anamnesis/AnamnesisFields";
import { ANAMNESIS_SECTIONS } from "@/data/anamnesisSchema";
import {
  anamnesisLink,
  buildAlerts,
  countCompletedSections,
  emptyAnamnesisData,
  exportAnamnesisPDF,
  rowToData,
  stashPrefill,
  type AnamnesisData,
  type AnamnesisRow,
} from "@/lib/anamnesis";
import { listCoachAnamnesis, saveAnamnesis } from "@/lib/anamnesisApi";

const CYAN = "#00D4FF";
const BG = "#03030a";

const CoachAnamnesisPage = () => {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const openId = params.get("id");

  const [rows, setRows] = useState<AnamnesisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnamnesisData>(emptyAnamnesisData());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      setRows(await listCoachAnamnesis(auth.user.id));
    } catch {
      toast.error("Erro ao carregar anamneses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = useMemo(() => rows.find((r) => r.id === openId) || null, [rows, openId]);

  useEffect(() => {
    if (active) setData(rowToData(active));
  }, [active]);

  const onChange = useCallback((sectionKey: string, fieldKey: string, value: any) => {
    setData((prev) => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [fieldKey]: value } }));
  }, []);

  const persist = async (status: "draft" | "completed") => {
    if (!active) return;
    setSaving(true);
    try {
      await saveAnamnesis(active.id, data, status);
      toast.success(status === "completed" ? "Anamnese concluída" : "Rascunho salvo");
      await load();
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  const alerts = useMemo(() => buildAlerts(data), [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: CYAN }} />
      </div>
    );
  }

  // ── Detalhe / preenchimento (scroll contínuo) ──
  if (active) {
    const filled = countCompletedSections(data);
    return (
      <div className="min-h-screen px-4 py-6" style={{ background: BG }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setParams({})}
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-foreground truncate">
                📋 {active.athlete_name || "Anamnese"}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: CYAN }}>
                {filled}/{ANAMNESIS_SECTIONS.length} seções · modo {active.mode}
              </p>
            </div>
            <button className="quick-action-sm" onClick={() => exportAnamnesisPDF(active, data)}>
              <FileDown className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              className="quick-action-sm"
              onClick={() => {
                if (active.athlete_id) stashPrefill(active.athlete_id, data);
                nav("/coach/plano-alimentar");
              }}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" /> NutriPlan
            </button>
          </div>

          {alerts.length > 0 && (
            <div className="rounded-lg p-3 mb-5" style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)" }}>
              <p className="text-[11px] font-bold mb-1" style={{ color: "#FF4444" }}>⚠️ ALERTAS AUTOMÁTICOS</p>
              <ul className="text-[12px] text-muted-foreground space-y-0.5">
                {alerts.map((a) => <li key={a}>• {a}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-8">
            {ANAMNESIS_SECTIONS.map((s, i) => (
              <section key={s.key} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h2 className="text-[15px] font-bold text-foreground">{i + 1}. {s.title}</h2>
                <p className="text-[12px] text-muted-foreground mb-4">{s.subtitle}</p>
                <AnamnesisSectionForm section={s} data={data} onChange={onChange} compact />
              </section>
            ))}
          </div>

          <div className="flex gap-3 mt-6 sticky bottom-4">
            <button
              className="flex-1 rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ border: "1px solid rgba(255,255,255,0.12)", background: BG, color: "#a1a1aa" }}
              disabled={saving}
              onClick={() => persist("draft")}
            >
              <Save className="w-4 h-4" /> Salvar rascunho
            </button>
            <button
              className="flex-1 rounded-lg py-3 text-sm font-bold disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${CYAN}, #00FF88)`, color: "#020205" }}
              disabled={saving}
              onClick={() => persist("completed")}
            >
              {saving ? "Salvando..." : "Concluir anamnese"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Lista ──
  return (
    <div className="min-h-screen px-4 py-6" style={{ background: BG }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => nav("/coach/dashboard")}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-black text-foreground">Anamneses</h1>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: CYAN }}>
              {rows.length} registro(s)
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <ClipboardList className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma anamnese ainda. Abra o card de um atleta e clique em “Anamnese”.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.athlete_name || "Sem nome"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.status === "completed" ? "✅ Concluída" : r.status === "draft" ? "⏳ Em andamento" : "⚠️ Pendente"} ·{" "}
                    {r.sections_completed}/{r.total_sections} · {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {r.invite_token && (
                  <button
                    className="quick-action-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(anamnesisLink(r.invite_token!));
                      toast.success("Link copiado");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Link
                  </button>
                )}
                <button className="quick-action-sm" onClick={() => setParams({ id: r.id })}>
                  Abrir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachAnamnesisPage;
