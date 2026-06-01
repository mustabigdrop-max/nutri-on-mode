// MERIDIAN — Wizard: Track → Categoria → Prova → Parâmetros → Submit.
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MeridianTrackSelector from "./MeridianTrackSelector";
import MeridianCategorySelector from "./MeridianCategorySelector";
import MeridianDashboard from "./MeridianDashboard";
import { useMeridian } from "@/hooks/useMeridian";
import type {
  AgeGroup,
  AthleteTrack,
  BiologicalSex,
  BodybuildingCategory,
  MeridianCompetition,
  MeridianPlan,
} from "@/lib/meridian/types";

const ACCENT = "#B8922A";

export default function MeridianPlanBuilder() {
  const { user } = useAuth();
  const { calculatePlan } = useMeridian();

  const [step, setStep] = useState(1);
  const [track, setTrack] = useState<AthleteTrack | null>(null);
  const [sex, setSex] = useState<BiologicalSex | null>(null);
  const [category, setCategory] = useState<BodybuildingCategory | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("OPEN");

  const [compName, setCompName] = useState("");
  const [federation, setFederation] = useState("IFBB Pro");
  const [compDate, setCompDate] = useState("");
  const [location, setLocation] = useState("");

  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bfPercent, setBfPercent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ plan: MeridianPlan; competition: MeridianCompetition } | null>(null);

  const canNext1 = !!track;
  const canNext2 = !!sex && !!category;
  const canNext3 = compName.trim() && federation.trim() && compDate;
  const canSubmit = heightCm && weightKg && bfPercent;

  async function handleSubmit() {
    if (!user || !track || !sex || !category) return;
    setSubmitting(true);
    try {
      // 1. Upsert athlete parameters
      const { error: aErr } = await supabase.from("meridian_athlete_parameters" as any).upsert({
        user_id: user.id,
        biological_sex: sex,
        athlete_track: track,
        height_cm: Number(heightCm),
        current_weight_kg: Number(weightKg),
        current_bf_percent: Number(bfPercent),
        updated_at: new Date().toISOString(),
      });
      if (aErr) throw aErr;

      // 2. Create competition
      const { data: comp, error: cErr } = await supabase
        .from("meridian_competitions" as any)
        .insert({
          user_id: user.id,
          name: compName.trim(),
          federation: federation.trim(),
          is_natural_federation: track === "NATURAL",
          category,
          age_group: ageGroup,
          competition_date: compDate,
          location: location.trim() || null,
          is_primary: true,
        })
        .select()
        .single();
      if (cErr || !comp) throw cErr ?? new Error("Falha ao criar prova");

      // 3. Calculate plan
      const plan = await calculatePlan((comp as any).id);
      setResult({ plan, competition: comp as any });
      toast.success("Plano MERIDIAN gerado.");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar plano.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <MeridianDashboard
        plan={result.plan}
        competition={result.competition}
        onReset={() => {
          setResult(null);
          setStep(1);
        }}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#e8e8e8", display: "grid", gap: 18 }}>
      <Stepper step={step} />

      {step === 1 && (
        <>
          <MeridianTrackSelector value={track} onChange={setTrack} />
          <NavBtns onNext={() => setStep(2)} canNext={canNext1} />
        </>
      )}

      {step === 2 && (
        <>
          <MeridianCategorySelector
            sex={sex}
            category={category}
            ageGroup={ageGroup}
            onChange={(n) => {
              setSex(n.sex);
              setCategory(n.category);
              setAgeGroup(n.ageGroup);
            }}
          />
          <NavBtns onBack={() => setStep(1)} onNext={() => setStep(3)} canNext={canNext2} />
        </>
      )}

      {step === 3 && (
        <>
          <Section title="DADOS DA PROVA">
            <Field label="Nome da prova">
              <input style={inputStyle} value={compName} onChange={(e) => setCompName(e.target.value)} />
            </Field>
            <Field label="Federação">
              <input style={inputStyle} value={federation} onChange={(e) => setFederation(e.target.value)} />
            </Field>
            <Field label="Data da prova">
              <input type="date" style={inputStyle} value={compDate} onChange={(e) => setCompDate(e.target.value)} />
            </Field>
            <Field label="Local (opcional)">
              <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field>
          </Section>
          <NavBtns onBack={() => setStep(2)} onNext={() => setStep(4)} canNext={!!canNext3} />
        </>
      )}

      {step === 4 && (
        <>
          <Section title="PARÂMETROS ATUAIS">
            <Field label="Altura (cm)">
              <input type="number" style={inputStyle} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </Field>
            <Field label="Peso atual (kg)">
              <input type="number" style={inputStyle} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </Field>
            <Field label="BF% estimado">
              <input type="number" style={inputStyle} value={bfPercent} onChange={(e) => setBfPercent(e.target.value)} />
            </Field>
          </Section>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setStep(3)} style={btnSecondary}>◀ VOLTAR</button>
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              style={{ ...btnPrimary, opacity: !canSubmit || submitting ? 0.5 : 1 }}
            >
              {submitting ? "CALCULANDO..." : "GERAR PLANO ▶"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["TRACK", "CATEGORIA", "PROVA", "ATLETA"];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {labels.map((l, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div
            key={l}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderTop: `2px solid ${active || done ? ACCENT : "rgba(255,255,255,0.1)"}`,
              fontSize: 10,
              letterSpacing: 2,
              color: active ? ACCENT : done ? "#999" : "#555",
            }}
          >
            {n}. {l}
          </div>
        );
      })}
    </div>
  );
}

function NavBtns({ onBack, onNext, canNext }: { onBack?: () => void; onNext: () => void; canNext: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {onBack && <button type="button" onClick={onBack} style={btnSecondary}>◀ VOLTAR</button>}
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        style={{ ...btnPrimary, opacity: canNext ? 1 : 0.4 }}
      >
        AVANÇAR ▶
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a", textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 11, color: "#999", letterSpacing: 1 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e8e8e8",
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 14,
  borderRadius: 3,
};

const btnPrimary: React.CSSProperties = {
  padding: "12px 20px",
  background: ACCENT,
  border: "none",
  color: "#0a0a0a",
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 2,
  cursor: "pointer",
  borderRadius: 3,
};

const btnSecondary: React.CSSProperties = {
  padding: "12px 18px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#999",
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 11,
  letterSpacing: 2,
  cursor: "pointer",
  borderRadius: 3,
};
