import { memo } from "react";
import type { AnamnesisField, AnamnesisSection } from "@/data/anamnesisSchema";
import type { AnamnesisData } from "@/lib/anamnesis";

const CYAN = "#00D4FF";

interface FieldProps {
  section: AnamnesisSection;
  field: AnamnesisField;
  value: any;
  onChange: (v: any) => void;
}

const inputCls =
  "w-full rounded-lg px-3 py-2.5 text-sm bg-white/[0.03] border border-white/10 text-foreground outline-none focus:border-[#00D4FF]/60 transition-colors";

const FieldRenderer = ({ field, value, onChange }: FieldProps) => {
  const label = (
    <label className="block text-[12px] font-semibold mb-1.5 text-foreground/90">
      {field.label}
      {field.required && <span style={{ color: CYAN }}> *</span>}
      {field.suffix && <span className="text-muted-foreground font-normal"> ({field.suffix})</span>}
    </label>
  );

  if (field.type === "radio") {
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-1.5">
          {(field.options || []).map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(active ? "" : opt)}
                className="px-3 py-2 rounded-lg text-[12px] font-medium transition-all text-left"
                style={{
                  background: active ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: active ? CYAN : "#a1a1aa",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {field.hint && <p className="text-[11px] text-muted-foreground mt-2 leading-snug">⚠️ {field.hint}</p>}
      </div>
    );
  }

  if (field.type === "multi") {
    const arr: string[] = Array.isArray(value) ? value : [];
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-1.5">
          {(field.options || []).map((opt) => {
            const active = arr.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(active ? arr.filter((x) => x !== opt) : [...arr, opt])}
                className="px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: active ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(0,255,136,0.45)" : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#00FF88" : "#a1a1aa",
                }}
              >
                {active ? "✓ " : ""}
                {opt}
              </button>
            );
          })}
        </div>
        {field.hint && <p className="text-[11px] text-muted-foreground mt-2">{field.hint}</p>}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          className={inputCls}
          rows={3}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        className={inputCls}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

interface SectionProps {
  section: AnamnesisSection;
  data: AnamnesisData;
  onChange: (sectionKey: string, fieldKey: string, value: any) => void;
  compact?: boolean;
}

export const AnamnesisSectionForm = memo(({ section, data, onChange, compact }: SectionProps) => {
  const values = data[section.key] || {};
  const visible = section.fields.filter((f) => (f.showIf ? f.showIf(data) : true));

  return (
    <div className={compact ? "grid md:grid-cols-2 gap-4" : "space-y-5"}>
      {visible.map((f) => (
        <div key={f.key} className={compact && (f.type === "multi" || f.type === "textarea") ? "md:col-span-2" : ""}>
          <FieldRenderer
            section={section}
            field={f}
            value={values[f.key]}
            onChange={(v) => onChange(section.key, f.key, v)}
          />
        </div>
      ))}
    </div>
  );
});

AnamnesisSectionForm.displayName = "AnamnesisSectionForm";
