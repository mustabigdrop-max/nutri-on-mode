// MERIDIAN — Cycle Tracker: log de ciclo menstrual e exibição da fase atual.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { CyclePhaseMeridian, MeridianMenstrualCycleEntry } from "@/lib/meridian/types";

const ACCENT = "#B8922A";
const PINK = "#d97a9a";

function inferPhase(startISO: string, cycleLen: number = 28): CyclePhaseMeridian {
  const start = new Date(startISO + "T00:00:00Z").getTime();
  const day = Math.floor((Date.now() - start) / 86400000) % cycleLen;
  if (day < 5) return "MENSTRUAL";
  if (day < 13) return "FOLLICULAR";
  if (day < 16) return "OVULATORY";
  return "LUTEAL";
}

const PHASE_LABEL: Record<CyclePhaseMeridian, string> = {
  MENSTRUAL: "Menstrual",
  FOLLICULAR: "Folicular",
  OVULATORY: "Ovulatória",
  LUTEAL: "Lútea",
};

const PHASE_NOTE: Record<CyclePhaseMeridian, string> = {
  MENSTRUAL: "Energia baixa. Priorize recuperação e proteína. Cardio leve.",
  FOLLICULAR: "Janela anabólica. Cargas pesadas, melhor tolerância a déficit.",
  OVULATORY: "Pico de força. Maior risco de lesão ligamentar — controle técnica.",
  LUTEAL: "Retenção e fome aumentadas. Aceite oscilação de peso, mantenha déficit moderado.",
};

export default function MeridianCycleTracker() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MeridianMenstrualCycleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [cycleLen, setCycleLen] = useState("28");
  const [duration, setDuration] = useState("5");
  const [saving, setSaving] = useState(false);

  async function reload() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_menstrual_cycle" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("cycle_start_date", { ascending: false })
      .limit(6);
    setEntries(((data ?? []) as unknown) as MeridianMenstrualCycleEntry[]);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleSave() {
    if (!user || !startDate) return;
    setSaving(true);
    try {
      const len = Number(cycleLen) || 28;
      const phase = inferPhase(startDate, len);
      const { error } = await supabase.from("meridian_menstrual_cycle" as any).insert({
        user_id: user.id,
        cycle_start_date: startDate,
        cycle_length_days: len,
        menstruation_duration_days: Number(duration) || null,
        current_phase: phase,
      });
      if (error) throw error;
      toast.success("Ciclo registrado.");
      setStartDate("");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar ciclo.");
    } finally {
      setSaving(false);
    }
  }

  const last = entries[0];
  const currentPhase: CyclePhaseMeridian | null = last
    ? inferPhase(last.cycle_start_date, last.cycle_length_days || 28)
    : null;

  return (
    <div
      style={{
        background: "rgba(217,122,154,0.05)",
        border: "1px solid rgba(217,122,154,0.35)",
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
          SITREP // CICLO MENSTRUAL
        </div>
        {currentPhase && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: PINK }}>
              Fase {PHASE_LABEL[currentPhase]}
            </span>
            <span style={{ fontSize: 12, color: "#999" }}>
              · último início {last?.cycle_start_date}
            </span>
          </div>
        )}
        {currentPhase && (
          <div style={{ fontSize: 12, color: "#b8b8b8", marginTop: 6, lineHeight: 1.5 }}>
            {PHASE_NOTE[currentPhase]}
          </div>
        )}
        {!loading && entries.length === 0 && (
          <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
            Sem registros. Informe o início do último ciclo para ativar cycle-sync.
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8 }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Início"
          style={inputStyle}
        />
        <input
          type="number"
          value={cycleLen}
          onChange={(e) => setCycleLen(e.target.value)}
          placeholder="Ciclo (dias)"
          style={inputStyle}
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duração (dias)"
          style={inputStyle}
        />
        <button
          type="button"
          disabled={!startDate || saving}
          onClick={handleSave}
          style={{
            background: PINK,
            border: "none",
            color: "#0a0a0a",
            padding: "0 14px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            borderRadius: 3,
            cursor: !startDate || saving ? "not-allowed" : "pointer",
            opacity: !startDate || saving ? 0.5 : 1,
          }}
        >
          {saving ? "..." : "LOG"}
        </button>
      </div>

      {entries.length > 1 && (
        <div style={{ display: "grid", gap: 4, fontSize: 11, color: "#999" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#666" }}>HISTÓRICO</div>
          {entries.slice(0, 4).map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{e.cycle_start_date}</span>
              <span style={{ color: ACCENT }}>
                {e.cycle_length_days ?? 28}d · {e.menstruation_duration_days ?? "-"}d fluxo
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
