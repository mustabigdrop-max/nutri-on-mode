// MERIDIAN — Category Selector: sexo → categoria → age group.
import { CATEGORY_LABELS } from "@/lib/meridian/types";
import type {
  AgeGroup,
  BiologicalSex,
  BodybuildingCategory,
} from "@/lib/meridian/types";

interface Props {
  sex: BiologicalSex | null;
  category: BodybuildingCategory | null;
  ageGroup: AgeGroup;
  onChange: (next: {
    sex: BiologicalSex | null;
    category: BodybuildingCategory | null;
    ageGroup: AgeGroup;
  }) => void;
}

const MALE_CATS: BodybuildingCategory[] = [
  "OPEN_BODYBUILDING",
  "BODYBUILDING_212",
  "CLASSIC_PHYSIQUE",
  "MENS_PHYSIQUE",
  "WHEELCHAIR_BODYBUILDING",
];

const FEMALE_CATS: BodybuildingCategory[] = [
  "WOMENS_BODYBUILDING",
  "WOMENS_PHYSIQUE",
  "FIGURE",
  "FITNESS",
  "WELLNESS",
  "BIKINI",
];

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: "JUNIOR", label: "Junior (até 23)" },
  { value: "OPEN", label: "Open" },
  { value: "MASTERS_35", label: "Masters 35+" },
  { value: "MASTERS_40", label: "Masters 40+" },
  { value: "MASTERS_45", label: "Masters 45+" },
  { value: "MASTERS_50", label: "Masters 50+" },
  { value: "MASTERS_55", label: "Masters 55+" },
  { value: "MASTERS_60", label: "Masters 60+" },
];

const ACCENT = "#B8922A";

export default function MeridianCategorySelector({ sex, category, ageGroup, onChange }: Props) {
  const cats = sex === "MALE" ? MALE_CATS : sex === "FEMALE" ? FEMALE_CATS : [];

  return (
    <div style={{ display: "grid", gap: 18, fontFamily: "'Space Grotesk', sans-serif" }}>
      <Section title="SEXO BIOLÓGICO">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(["MALE", "FEMALE"] as BiologicalSex[]).map((s) => {
            const selected = sex === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ sex: s, category: null, ageGroup })}
                style={btnStyle(selected, false)}
              >
                {s === "MALE" ? "MASCULINO" : "FEMININO"}
              </button>
            );
          })}
        </div>
      </Section>

      {sex && (
        <Section title="CATEGORIA">
          <div style={{ display: "grid", gap: 8 }}>
            {cats.map((c) => {
              const selected = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ sex, category: c, ageGroup })}
                  style={btnStyle(selected, false)}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {category && (
        <Section title="FAIXA ETÁRIA">
          <select
            value={ageGroup}
            onChange={(e) =>
              onChange({ sex, category, ageGroup: e.target.value as AgeGroup })
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e8e8e8",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              borderRadius: 4,
            }}
          >
            {AGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#0a0a0a" }}>
                {o.label}
              </option>
            ))}
          </select>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 3,
          color: "#7a7a7a",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function btnStyle(selected: boolean, disabled: boolean): React.CSSProperties {
  return {
    padding: "12px 14px",
    background: selected ? "rgba(184,146,42,0.1)" : "rgba(255,255,255,0.02)",
    border: `1px solid ${selected ? ACCENT : "rgba(255,255,255,0.08)"}`,
    borderLeft: selected ? `3px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
    color: selected ? ACCENT : "#e8e8e8",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "left",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    borderRadius: 4,
    transition: "all 0.12s",
  };
}
