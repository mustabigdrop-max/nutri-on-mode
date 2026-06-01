// MERIDIAN — Female Athlete Triad / RED-S logger e alertas de segurança.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { MeridianTriadEntry, MenstrualStatus } from "@/lib/meridian/types";

const PINK = "#d97a9a";
const RED = "#ef4444";
const YELLOW = "#facc15";
const GREEN = "#4ade80";

const STATUS_OPTIONS: { value: MenstrualStatus; label: string }[] = [
  { value: "REGULAR", label: "Regular" },
  { value: "IRREGULAR", label: "Irregular" },
  { value: "AMENORRHEA", label: "Amenorreia" },
  { value: "PMS_AFFECTED", label: "TPM severa" },
  { value: "PILL", label: "Pílula" },
  { value: "IUD_HORMONAL", label: "DIU hormonal" },
  { value: "IUD_COPPER", label: "DIU cobre" },
  { value: "POST_MENOPAUSE", label: "Pós-menopausa" },
];

// Triad / RED-S evaluator — determinístico, conservador.
function evaluate(input: {
  menstrual_status?: MenstrualStatus | null;
  months_since_menstruation?: number | null;
  weight_loss_rate_pct_per_week?: number | null;
  energy_availability?: number | null;
}): { severity: "GREEN" | "YELLOW" | "RED"; flags: string[] } {
  const flags: string[] = [];
  let red = false;
  let yellow = false;

  // Amenorreia
  if (input.menstrual_status === "AMENORRHEA") {
    const m = input.months_since_menstruation ?? 0;
    if (m >= 3) {
      red = true;
      flags.push(`AMENORREIA_${m}M`);
    } else if (m >= 1) {
      yellow = true;
      flags.push("CICLO_INTERROMPIDO");
    }
  } else if (input.menstrual_status === "IRREGULAR") {
    yellow = true;
    flags.push("CICLO_IRREGULAR");
  }

  // Taxa de perda (%/semana)
  const wl = input.weight_loss_rate_pct_per_week ?? 0;
  if (wl > 1.0) {
    red = true;
    flags.push("PERDA_ACELERADA");
  } else if (wl > 0.7) {
    yellow = true;
    flags.push("PERDA_AGRESSIVA");
  }

  // Energy availability (kcal/kg LBM/dia) — <30 clínico; <45 subótimo
  const ea = input.energy_availability ?? 0;
  if (ea > 0 && ea < 30) {
    red = true;
    flags.push("LOW_EA_CLINICAL");
  } else if (ea > 0 && ea < 45) {
    yellow = true;
    flags.push("LOW_EA_SUBOPTIMAL");
  }

  if (red) return { severity: "RED", flags };
  if (yellow) return { severity: "YELLOW", flags };
  return { severity: "GREEN", flags };
}

interface Props {
  competitionId?: string;
}

export default function MeridianTriadLog({ competitionId }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MeridianTriadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<MenstrualStatus>("REGULAR");
  const [months, setMonths] = useState("");
  const [wlRate, setWlRate] = useState("");
  const [ea, setEa] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function reload() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_triad_log" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(6);
    setEntries(((data ?? []) as unknown) as MeridianTriadEntry[]);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const preview = useMemo(
    () =>
      evaluate({
        menstrual_status: status,
        months_since_menstruation: months ? Number(months) : null,
        weight_loss_rate_pct_per_week: wlRate ? Number(wlRate) : null,
        energy_availability: ea ? Number(ea) : null,
      }),
    [status, months, wlRate, ea]
  );

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("meridian_triad_log" as any).insert({
        user_id: user.id,
        competition_id: competitionId ?? null,
        log_date: new Date().toISOString().slice(0, 10),
        menstrual_status: status,
        months_since_menstruation: months ? Number(months) : null,
        weight_loss_rate_pct_per_week: wlRate ? Number(wlRate) : null,
        energy_availability_kcal_per_kg_lbm: ea ? Number(ea) : null,
        severity: preview.severity,
        flags: preview.flags,
        notes: notes || null,
      });
      if (error) throw error;
      if (preview.severity === "RED") {
        toast.error("ALERTA RED-S: ajuste imediato + acompanhamento médico recomendado.");
      } else if (preview.severity === "YELLOW") {
        toast.warning("Sinais subótimos detectados. Reavalie déficit e EA.");
      } else {
        toast.success("Triad log registrado.");
      }
      setMonths("");
      setWlRate("");
      setEa("");
      setNotes("");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar log.");
    } finally {
      setSaving(false);
    }
  }

  const last = entries[0];
  const sevColor = (s: string) => (s === "RED" ? RED : s === "YELLOW" ? YELLOW : GREEN);

  return (
    <div
      style={{
        background: "rgba(217,122,154,0.04)",
        border: "1px solid rgba(217,122,154,0.3)",
        borderLeft: `4px solid ${PINK}`,
        padding: 18,
        borderRadius: 4,
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#e8e8e8",
        display: "grid",
        gap: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a" }}>
          SITREP // FEMALE ATHLETE TRIAD / RED-S
        </div>
        {last && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: sevColor(last.severity) }}>
              {last.severity}
            </span>
            <span style={{ fontSize: 12, color: "#999" }}>
              · último log {last.log_date}
              {last.flags && last.flags.length > 0 ? ` · ${last.flags.join(", ")}` : ""}
            </span>
          </div>
        )}
        {!loading && entries.length === 0 && (
          <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
            Sem logs. Registre status menstrual + taxa de perda + EA para ativar monitoramento.
          </div>
        )}
        <div style={{ fontSize: 11, color: "#999", marginTop: 8, lineHeight: 1.5 }}>
          Energy Availability (EA) = (kcal ingerida − kcal treino) / kg LBM. Alvo {">"}45. Clínico {"<"}30.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value as MenstrualStatus)} style={inputStyle}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="number"
          step="1"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="Meses sem menstruar"
          style={inputStyle}
        />
        <input
          type="number"
          step="0.1"
          value={wlRate}
          onChange={(e) => setWlRate(e.target.value)}
          placeholder="Perda %/semana"
          style={inputStyle}
        />
        <input
          type="number"
          step="0.1"
          value={ea}
          onChange={(e) => setEa(e.target.value)}
          placeholder="EA (kcal/kg LBM)"
          style={inputStyle}
        />
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas (sintomas, libido, sono...)"
        style={inputStyle}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            padding: "4px 10px",
            border: `1px solid ${sevColor(preview.severity)}66`,
            color: sevColor(preview.severity),
            borderRadius: 2,
            fontSize: 11,
            letterSpacing: 1,
            fontWeight: 700,
          }}
        >
          PREVIEW: {preview.severity}
          {preview.flags.length > 0 ? ` · ${preview.flags.join(", ")}` : ""}
        </span>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          style={{
            marginLeft: "auto",
            background: PINK,
            border: "none",
            color: "#0a0a0a",
            padding: "8px 16px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            borderRadius: 3,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "..." : "LOG TRIAD"}
        </button>
      </div>

      {preview.severity === "RED" && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: `1px solid ${RED}55`,
            borderLeft: `3px solid ${RED}`,
            padding: 10,
            borderRadius: 3,
            fontSize: 12,
            color: "#fcd5d5",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: RED }}>AÇÃO REQUERIDA:</strong> RED-S indicado. Reduza déficit
          imediatamente, aumente EA para {">"}45 kcal/kg LBM, suspenda hard cut e procure
          acompanhamento médico (ginecologia + endocrinologia).
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ display: "grid", gap: 4, fontSize: 11, color: "#999" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666" }}>HISTÓRICO</div>
          {entries.slice(0, 4).map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span>{e.log_date}</span>
              <span style={{ color: sevColor(e.severity) }}>
                {e.severity}
                {e.flags && e.flags.length > 0 ? ` · ${e.flags.slice(0, 2).join(",")}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  background: "rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8e8e8",
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 12,
  borderRadius: 3,
};
