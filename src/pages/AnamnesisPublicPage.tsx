import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AnamnesisSectionForm } from "@/components/anamnesis/AnamnesisFields";
import { ANAMNESIS_SECTIONS } from "@/data/anamnesisSchema";
import {
  countCompletedSections,
  emptyAnamnesisData,
  rowToData,
  type AnamnesisData,
  type AnamnesisRow,
} from "@/lib/anamnesis";
import { getAnamnesisByToken, saveAnamnesisByToken } from "@/lib/anamnesisApi";

const CYAN = "#00D4FF";
const GREEN = "#00FF88";

const AnamnesisPublicPage = () => {
  const { token = "" } = useParams();
  const [row, setRow] = useState<AnamnesisRow | null>(null);
  const [data, setData] = useState<AnamnesisData>(emptyAnamnesisData());
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await getAnamnesisByToken(token);
        if (!r) {
          setError("Link inválido ou expirado. Peça um novo link ao seu coach.");
        } else {
          setRow(r);
          setData(rowToData(r));
          if (r.status === "completed") setDone(true);
        }
      } catch {
        setError("Não foi possível carregar a anamnese.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const sections = ANAMNESIS_SECTIONS;
  const current = sections[step];
  const filled = useMemo(() => countCompletedSections(data), [data]);
  const pct = Math.round(((step + 1) / sections.length) * 100);

  const onChange = useCallback((sectionKey: string, fieldKey: string, value: any) => {
    setData((prev) => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [fieldKey]: value } }));
  }, []);

  const persist = async (status: "draft" | "completed") => {
    setSaving(true);
    try {
      await saveAnamnesisByToken(token, data, status);
      if (status === "completed") setDone(true);
      else toast.success("Rascunho salvo — você pode continuar depois pelo mesmo link.");
    } catch {
      toast.error("Não foi possível salvar. Verifique sua conexão.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020205" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: CYAN }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#020205" }}>
        <p className="text-center text-sm text-muted-foreground max-w-xs">{error}</p>
      </div>
    );
  }

  if (done) {
    const g = data.goals || {};
    const t = data.training || {};
    const ph = data.pharmacology || {};
    return (
      <div className="min-h-screen px-5 py-12" style={{ background: "#020205" }}>
        <div className="max-w-[480px] mx-auto text-center">
          <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: GREEN }} />
          <h1 className="text-xl font-black tracking-tight text-foreground mb-2">ANAMNESE CONCLUÍDA!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Obrigado por preencher{data.personal?.full_name ? `, ${String(data.personal.full_name).split(" ")[0]}` : ""}.
            Seu coach receberá todas as informações e entrará em contato para montar seu protocolo.
          </p>
          <div className="rounded-xl p-5 text-left" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: CYAN }}>Resumo</p>
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              <li>• {filled} de {sections.length} seções preenchidas</li>
              {g.main_objective && <li>• Objetivo: {g.main_objective}</li>}
              {t.frequency && <li>• Treina: {t.frequency}/semana · {t.modality || "—"}</li>}
              {t.weight && <li>• Peso: {t.weight}kg{g.target_weight ? ` · Meta: ${g.target_weight}kg` : ""}</li>}
              {ph.uses_pharma && <li>• Farmacológico: {ph.uses_pharma === "Sim" ? "Informado" : ph.uses_pharma}</li>}
            </ul>
            <div className="mt-4 pt-3 text-[12px] text-muted-foreground" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              Coach: Diogo Mello · @diogo.mell0<br />nutrion.app.br
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#020205" }}>
      <div className="max-w-[480px] mx-auto px-5 pb-28 pt-8">
        <header className="text-center mb-5">
          <p className="text-[22px] font-bold tracking-[0.15em] text-foreground">ANAMNESE</p>
          <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: CYAN }}>nutriON · Método MCE</p>
        </header>

        <div className="flex gap-1.5 justify-center mb-3">
          {sections.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              aria-label={s.title}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ background: i === step ? CYAN : i < step ? GREEN : "rgba(255,255,255,0.12)" }}
            />
          ))}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CYAN}, ${GREEN})` }} />
        </div>
        <p className="text-[11px] text-muted-foreground text-center mb-6">
          Seção {step + 1} de {sections.length} · {pct}%
        </p>

        <h2 className="text-[16px] font-bold text-foreground">{current.title}</h2>
        <p className="text-[12px] text-muted-foreground mb-5">{current.subtitle}</p>

        <AnamnesisSectionForm section={current} data={data} onChange={onChange} />

        <div className="flex gap-3 mt-7">
          {step > 0 && (
            <button
              onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }}
              className="px-5 py-3.5 rounded-[10px] text-sm text-muted-foreground"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {step < sections.length - 1 ? (
            <button
              onClick={() => { persist("draft"); setStep(step + 1); window.scrollTo(0, 0); }}
              className="flex-1 rounded-[10px] py-3.5 font-bold text-[15px] flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${GREEN})`, color: "#020205" }}
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={saving}
              onClick={() => persist("completed")}
              className="flex-1 rounded-[10px] py-3.5 font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${CYAN}, ${GREEN})`, color: "#020205" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Finalizar anamnese
            </button>
          )}
        </div>

        <button
          onClick={() => persist("draft")}
          disabled={saving}
          className="w-full mt-3 py-3 rounded-[10px] text-[13px] text-muted-foreground flex items-center justify-center gap-2"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Save className="w-3.5 h-3.5" /> Salvar e continuar depois
        </button>

        <p className="text-[11px] text-muted-foreground mt-6 flex items-start gap-2 leading-snug">
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: CYAN }} />
          Suas respostas são sigilosas e usadas apenas para montar seu protocolo.
        </p>
      </div>
    </div>
  );
};

export default AnamnesisPublicPage;
