import React, { useState } from "react";
import { Camera, Search, Check, Pencil, X, AlertTriangle, Scale, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  BODY_PROFILES, COMORBIDITIES, ABW_FACTORS, VISUAL_DISCLAIMER,
  calculateTMB, getMacroDistribution, idealWeightKg, bmi, leanMassKg,
  type BodyProfileType, type BodyProfile,
} from "@/lib/bodyProfile";
import {
  SPECIAL_CONDITIONS, getSpecialCondition, sodiumTargetForConditions, effectiveSodiumTarget,
  sodiumTier, sodiumSplit, sodiumAvoidList,
  SODIUM_TARGET_MIN_MG, SODIUM_TARGET_MAX_MG,
} from "@/lib/specialConditions";

const GOLD = "#B8922A";
const EMERALD = "#00C896";
const CYAN = "#00D4FF";
const TEXT = "#E8E8E8";
const MUTED = "#8A8A8A";
const MONO = "'Space Mono', ui-monospace, monospace";

const label: React.CSSProperties = {
  fontFamily: MONO, fontSize: 9, fontWeight: 700, color: GOLD,
  letterSpacing: ".22em", textTransform: "uppercase",
};
const box: React.CSSProperties = {
  marginBottom: 16, padding: "16px 18px",
  background: "#06060a", border: "1px solid #1a1a22", borderLeft: `2px solid ${GOLD}`,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", background: "#020205",
  border: "1px solid #ffffff14", color: TEXT, fontSize: 13, fontFamily: "inherit",
};

export interface PerfilCorporalState {
  type: BodyProfileType;
  bfPercent: string;
  leanMass: string;
  waist: string;
  abwFactor: number;
  comorbidities: string[];
  /** Condições especiais (lipedema, SOP...) — coexistem com qualquer perfil. */
  specialConditions: string[];
  /** Meta de sódio diária (mg) definida pelo coach. */
  sodiumTargetMg: number | null;
  source: "manual" | "apex_visual";
  fatDistribution?: string;
  muscleDevelopment?: string;
  visualIndicators: string[];
  nutritionalPriorities: string[];
}

export const PERFIL_CORPORAL_DEFAULT: PerfilCorporalState = {
  type: "padrao",
  bfPercent: "",
  leanMass: "",
  waist: "",
  abwFactor: 0.25,
  comorbidities: [],
  specialConditions: [],
  sodiumTargetMg: null,
  source: "manual",
  visualIndicators: [],
  nutritionalPriorities: [],
};


export function toBodyProfile(
  s: PerfilCorporalState,
  base: { weight: number; height: number; age: number; sex: "M" | "F" }
): BodyProfile {
  return {
    type: s.type,
    weight_kg: base.weight,
    height_cm: base.height,
    age: base.age,
    sex: base.sex,
    bf_percent: s.bfPercent ? Number(s.bfPercent) : undefined,
    lean_mass_kg: s.leanMass ? Number(s.leanMass) : undefined,
    waist_cm: s.waist ? Number(s.waist) : undefined,
    abw_factor: s.abwFactor,
    comorbidities: s.comorbidities,
  };
}

interface Suggestion {
  suggested_profile: BodyProfileType;
  estimated_bf_range?: [number, number];
  fat_distribution?: string;
  muscle_development?: string;
  visual_indicators?: string[];
  nutritional_priorities?: string[];
  abw_factor_suggestion?: number;
  protein_reference?: string;
  confidence?: string;
  photo_date?: string;
  client_data?: { weight_kg: number; height_cm: number; age: number; sex: string; imc: string };
}

export default function BlocoPerfilCorporal({
  value, onChange, base, athleteId, objetivo,
}: {
  value: PerfilCorporalState;
  onChange: (v: Partial<PerfilCorporalState>) => void;
  base: { weight: number; height: number; age: number; sex: "M" | "F" };
  athleteId?: string | null;
  objetivo?: string;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [previous, setPrevious] = useState<{ body_profile?: string; bf_percent?: number; profile_analyzed_at?: string } | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const hasBase = base.weight > 0 && base.height > 0 && base.age > 0;
  const profile = toBodyProfile(value, base);
  const tmb = hasBase ? calculateTMB(profile) : null;
  const macros = hasBase ? getMacroDistribution(profile, objetivo || "cutting") : null;
  const imc = hasBase ? bmi(base.weight, base.height) : 0;
  const ideal = base.height ? idealWeightKg(base.height) : 0;
  const lbm = leanMassKg(base.weight, value.bfPercent ? Number(value.bfPercent) : undefined);
  const meta = BODY_PROFILES.find((p) => p.v === value.type);

  /** Comprime e converte para dataURL (máx. 1280px, jpeg 0.8) */
  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Não consegui ler o arquivo."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
        img.onload = () => {
          const max = 1280;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Não consegui processar a imagem."));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Envie uma imagem (JPG ou PNG).", variant: "destructive" });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "Foto muito grande", description: "Envie uma imagem de até 25MB.", variant: "destructive" });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setUploadPreview(dataUrl);
      await analisar(dataUrl);
    } catch (err: any) {
      toast({ title: "Erro ao carregar a foto", description: err?.message || "Tente outra imagem.", variant: "destructive" });
    }
  };

  const analisar = async (imageBase64?: string) => {
    if (!athleteId) {
      toast({ title: "Selecione o cliente", description: "Escolha o aluno para buscar as fotos do APEX Visual.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    setSuggestion(null);
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("body_profile, bf_percent, profile_analyzed_at")
        .eq("user_id", athleteId)
        .maybeSingle();
      setPrevious(prof as any);

      const { data, error } = await supabase.functions.invoke("analyze-body-profile", {
        body: {
          athleteId,
          imageBase64: imageBase64 || uploadPreview || undefined,
          manual: { weight_kg: base.weight, height_cm: base.height, age: base.age, sex: base.sex },
        },
      });

      let err = (data as any)?.message || (data as any)?.error || null;
      if (!err && error) {
        // Extrai a mensagem real do corpo da resposta não-2xx
        try {
          const ctx: any = (error as any).context;
          const parsed = ctx?.json ? await ctx.json() : null;
          err = parsed?.message || parsed?.error || error.message;
        } catch {
          err = error.message;
        }
      }
      if (err || !(data as any)?.suggested_profile) {
        toast({ title: "Análise indisponível", description: err || "Não consegui analisar as fotos.", variant: "destructive" });
        return;
      }
      setSuggestion(data as Suggestion);
    } catch (e: any) {
      toast({ title: "Erro na análise", description: e?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };


  const aceitar = async () => {
    if (!suggestion) return;
    const range = suggestion.estimated_bf_range;
    const bf = range && range.length === 2 ? (Number(range[0]) + Number(range[1])) / 2 : undefined;
    onChange({
      type: suggestion.suggested_profile,
      bfPercent: bf ? String(Math.round(bf * 10) / 10) : value.bfPercent,
      abwFactor: suggestion.abw_factor_suggestion || value.abwFactor,
      source: "apex_visual",
      fatDistribution: suggestion.fat_distribution,
      muscleDevelopment: suggestion.muscle_development,
      visualIndicators: suggestion.visual_indicators || [],
      nutritionalPriorities: suggestion.nutritional_priorities || [],
    });

    if (athleteId) {
      const idealW = base.height ? Math.round(idealWeightKg(base.height) * 10) / 10 : null;
      const abwF = suggestion.abw_factor_suggestion || value.abwFactor;
      const adjusted = idealW && base.weight ? Math.round((idealW + abwF * (base.weight - idealW)) * 10) / 10 : null;
      const { error } = await supabase
        .from("profiles")
        .update({
          body_profile: suggestion.suggested_profile,
          bf_percent: bf ?? null,
          abw_factor: abwF,
          fat_distribution: suggestion.fat_distribution ?? null,
          muscle_development: suggestion.muscle_development ?? null,
          visual_indicators: suggestion.visual_indicators ?? [],
          nutritional_priorities: suggestion.nutritional_priorities ?? [],
          protein_reference: suggestion.protein_reference === "ideal" ? "ideal" : "real",
          ideal_weight_kg: idealW,
          adjusted_weight_kg: adjusted,
          profile_source: "apex_visual",
          profile_analyzed_at: new Date().toISOString(),
        } as any)
        .eq("user_id", athleteId);
      if (error) console.error("[perfil-corporal] update", error);
    }
    setSuggestion(null);
    toast({ title: "Perfil aplicado", description: "TMB e macros recalculados pelo perfil sugerido." });
  };

  const toggleComorb = (c: string) =>
    onChange({
      comorbidities: value.comorbidities.includes(c)
        ? value.comorbidities.filter((x) => x !== c)
        : [...value.comorbidities, c],
    });

  const specials = value.specialConditions || [];
  const activeSpecials = specials
    .map(getSpecialCondition)
    .filter((c): c is NonNullable<ReturnType<typeof getSpecialCondition>> => !!c && !!c.macros);
  const toggleSpecial = (k: string) => {
    const next = specials.includes(k) ? specials.filter((x) => x !== k) : [...specials, k];
    onChange({ specialConditions: next });
    if (athleteId) {
      supabase
        .from("profiles")
        .update({ special_conditions: next })
        .eq("user_id", athleteId)
        .then(({ error }) => { if (error) console.error("[condicoes-especiais] update", error); });
    }
  };

  const conditionSodium = sodiumTargetForConditions(specials);
  const sodiumTarget = effectiveSodiumTarget(specials, value.sodiumTargetMg);
  const saveSodium = (mg: number | null) => {
    onChange({ sodiumTargetMg: mg });
    if (athleteId) {
      supabase
        .from("profiles")
        .update({ sodium_target_mg: mg } as any)
        .eq("user_id", athleteId)
        .then(({ error }) => { if (error) console.error("[meta-sodio] update", error); });
    }
  };




  const changed = suggestion && previous?.body_profile && previous.body_profile !== suggestion.suggested_profile;

  return (
    <div style={box}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Scale size={12} strokeWidth={2} color={GOLD} />
        <span style={label}>Perfil corporal</span>
        <span style={{ fontSize: 11, color: MUTED }}>— define a fórmula de TMB e os macros</span>
      </div>

      {/* APEX Visual */}
      <div style={{ padding: 14, background: "#020205", border: `1px solid ${CYAN}33`, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Camera size={13} color={CYAN} />
          <span style={{ ...label, color: CYAN }}>Sugerir pelo APEX Visual</span>
        </div>
        <p style={{ fontSize: 11.5, color: MUTED, marginBottom: 10 }}>
          Analisar as fotos do cliente e sugerir o perfil automaticamente. Sem foto no APEX? Envie uma direto aqui.
        </p>
        {uploadPreview && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <img src={uploadPreview} alt="Foto enviada para análise corporal" style={{ width: 54, height: 54, objectFit: "cover", border: `1px solid ${CYAN}55` }} />
            <button type="button" onClick={() => setUploadPreview(null)}
              style={{ background: "none", border: "none", color: MUTED, fontSize: 11, cursor: "pointer" }}>
              remover foto enviada
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => analisar()}
            disabled={analyzing}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 14px",
              background: `${CYAN}18`, border: `1px solid ${CYAN}`, color: CYAN,
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
              cursor: analyzing ? "wait" : "pointer", opacity: analyzing ? 0.6 : 1,
            }}
          >
            {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            {analyzing ? "Analisando fotos…" : "Analisar fotos →"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={analyzing}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 14px",
              background: "transparent", border: "1px solid #ffffff22", color: TEXT,
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
              cursor: analyzing ? "wait" : "pointer", opacity: analyzing ? 0.6 : 1,
            }}
          >
            <Camera size={13} /> Enviar foto
          </button>
        </div>
      </div>


      {/* Resultado da análise */}
      {suggestion && (
        <div style={{ padding: 14, background: "#04060a", border: `1px solid ${EMERALD}55`, marginBottom: 14 }}>
          <div style={{ ...label, color: EMERALD, marginBottom: 10 }}>
            🔍 Análise visual · sugestão do sistema
          </div>
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, marginBottom: 10 }}>
            <div><b>Perfil:</b> {BODY_PROFILES.find((p) => p.v === suggestion.suggested_profile)?.l || suggestion.suggested_profile}</div>
            {suggestion.estimated_bf_range && (
              <div><b>BF estimado:</b> {suggestion.estimated_bf_range[0]}–{suggestion.estimated_bf_range[1]}%</div>
            )}
            {suggestion.fat_distribution && <div><b>Distribuição:</b> {suggestion.fat_distribution}</div>}
            {suggestion.muscle_development && <div><b>Massa muscular:</b> {suggestion.muscle_development}</div>}
            {suggestion.confidence && <div><b>Confiança:</b> {suggestion.confidence}</div>}
            {suggestion.photo_date && (
              <div style={{ color: MUTED, fontSize: 11 }}>
                Foto usada: {new Date(suggestion.photo_date).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>

          {!!suggestion.visual_indicators?.length && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Indicadores visuais detectados</div>
              {suggestion.visual_indicators.map((i, k) => (
                <div key={k} style={{ fontSize: 12, color: TEXT }}>✅ {i}</div>
              ))}
            </div>
          )}

          {!!suggestion.nutritional_priorities?.length && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ ...label, color: MUTED, marginBottom: 6 }}>Prioridades nutricionais sugeridas</div>
              {suggestion.nutritional_priorities.map((i, k) => (
                <div key={k} style={{ fontSize: 12, color: TEXT }}>→ {i}</div>
              ))}
            </div>
          )}

          {changed && (
            <div style={{ padding: 10, background: `${GOLD}10`, border: `1px solid ${GOLD}44`, marginBottom: 10, fontSize: 12, color: TEXT }}>
              📊 <b>Evolução do perfil:</b> o cliente estava como{" "}
              <b>{BODY_PROFILES.find((p) => p.v === previous?.body_profile)?.l || previous?.body_profile}</b>
              {previous?.bf_percent ? ` (BF ~${previous.bf_percent}%)` : ""} e agora aparece como{" "}
              <b>{BODY_PROFILES.find((p) => p.v === suggestion.suggested_profile)?.l}</b>. Recalcular o plano com a nova fórmula.
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" onClick={aceitar}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", background: `${EMERALD}18`, border: `1px solid ${EMERALD}`, color: EMERALD, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              <Check size={13} /> Aceitar sugestão
            </button>
            <button type="button"
              onClick={() => { onChange({ type: suggestion.suggested_profile, source: "manual" }); setSuggestion(null); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", background: "#020205", border: `1px solid ${GOLD}55`, color: GOLD, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              <Pencil size={13} /> Ajustar manualmente
            </button>
            <button type="button" onClick={() => setSuggestion(null)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", background: "#020205", border: "1px solid #ffffff14", color: MUTED, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              <X size={13} /> Ignorar e selecionar
            </button>
          </div>

          <p style={{ display: "flex", gap: 6, marginTop: 10, fontSize: 10.5, color: MUTED, lineHeight: 1.6 }}>
            <AlertTriangle size={12} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
            {VISUAL_DISCLAIMER}
          </p>
        </div>
      )}

      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>— ou selecionar manualmente —</div>

      {/* Seletor */}
      <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
        {BODY_PROFILES.map((p) => {
          const active = value.type === p.v;
          return (
            <button key={p.v} type="button"
              onClick={() => onChange({ type: p.v, source: "manual", abwFactor: p.v === "obeso_severo" ? 0.2 : value.abwFactor })}
              style={{
                textAlign: "left", padding: "10px 12px", cursor: "pointer",
                background: active ? `${EMERALD}12` : "#020205",
                border: `1px solid ${active ? EMERALD : "#ffffff10"}`,
                color: active ? TEXT : "#a9a9a9", fontFamily: "inherit",
              }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: active ? EMERALD : TEXT }}>
                {active ? "●" : "○"} {p.l}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{p.d}</div>
              {p.bf && <div style={{ fontSize: 10.5, color: MUTED }}>{p.bf}</div>}
              <div style={{ fontSize: 10.5, fontFamily: MONO, color: GOLD, marginTop: 3 }}>{p.formula}</div>
              {p.warn && <div style={{ fontSize: 10.5, color: "#ff9f43", marginTop: 2 }}>⚠️ {p.warn}</div>}
            </button>
          );
        })}
      </div>

      {/* Dados de composição */}
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Dados de composição</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 4 }}>BF estimado (%)</div>
          <input style={inputStyle} inputMode="decimal" value={value.bfPercent}
            onChange={(e) => onChange({ bfPercent: e.target.value })} placeholder="ex: 42" />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 4 }}>Massa magra (kg)</div>
          <input style={inputStyle} inputMode="decimal" value={value.leanMass}
            onChange={(e) => onChange({ leanMass: e.target.value })}
            placeholder={lbm ? `~${lbm.toFixed(1)}` : "opcional"} />
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 4 }}>Circ. abdominal (cm)</div>
          <input style={inputStyle} inputMode="decimal" value={value.waist}
            onChange={(e) => onChange({ waist: e.target.value })} placeholder="ex: 128" />
        </div>
        {(value.type === "obeso" || value.type === "obeso_severo") && (
          <div>
            <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 4 }}>Fator ABW</div>
            <select style={inputStyle} value={value.abwFactor}
              onChange={(e) => onChange({ abwFactor: Number(e.target.value) })}>
              {ABW_FACTORS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Comorbidades */}
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Comorbidades</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {COMORBIDITIES.map((c) => {
          const active = value.comorbidities.includes(c);
          return (
            <button key={c} type="button" onClick={() => toggleComorb(c)}
              style={{
                padding: "7px 12px", cursor: "pointer",
                background: active ? `${EMERALD}15` : "#020205",
                border: `1px solid ${active ? EMERALD : "#ffffff14"}`,
                color: active ? EMERALD : MUTED, fontSize: 12, fontWeight: 600, fontFamily: "inherit",
              }}>{c}</button>
          );
        })}
        <button type="button" onClick={() => onChange({ comorbidities: [] })}
          style={{ padding: "7px 12px", cursor: "pointer", background: "#020205", border: "1px solid #ffffff14", color: MUTED, fontSize: 12, fontFamily: "inherit" }}>
          Nenhuma
        </button>
      </div>

      {/* Condições especiais */}
      <div style={{ ...label, color: MUTED, marginBottom: 8 }}>Condições especiais</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {SPECIAL_CONDITIONS.map((c) => {
          const active = specials.includes(c.key);
          const hero = c.key === "lipedema";
          const accent = hero ? CYAN : EMERALD;
          return (
            <button key={c.key} type="button" onClick={() => toggleSpecial(c.key)}
              style={{
                padding: "7px 12px", cursor: "pointer",
                background: active ? `${accent}15` : "#020205",
                border: `1px solid ${active ? accent : "#ffffff14"}`,
                color: active ? accent : MUTED, fontSize: 12,
                fontWeight: hero ? 800 : 600, fontFamily: "inherit",
                letterSpacing: hero ? ".06em" : undefined,
              }}>{active ? "☑ " : "☐ "}{c.label}</button>
          );
        })}
      </div>

      {/* Meta de sódio */}
      {conditionSodium && (
        <div style={{ marginBottom: 14, padding: 14, background: "#020205", border: `1px solid ${GOLD}33`, borderLeft: `2px solid ${GOLD}` }}>
          <div style={{ ...label, marginBottom: 6 }}>🧂 Meta de sódio diária</div>
          <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, marginBottom: 10 }}>
            Define o teto de sódio do plano. Ao alterar, o sistema recalcula os alimentos evitados,
            a divisão por refeição e as badges 🧂 no plano do cliente.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <input
              style={{ ...inputStyle, width: 130 }}
              inputMode="numeric"
              value={value.sodiumTargetMg ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/\D/g, ""));
                saveSodium(n > 0 ? n : null);
              }}
              placeholder={`padrão ${conditionSodium}`}
              aria-label="Meta de sódio em miligramas por dia"
            />
            <span style={{ fontSize: 12, color: MUTED }}>mg/dia</span>
            {[1500, 2000, 2300].map((v) => (
              <button key={v} type="button" onClick={() => saveSodium(v)}
                style={{
                  padding: "6px 11px", cursor: "pointer",
                  background: sodiumTarget === v ? `${GOLD}18` : "#020205",
                  border: `1px solid ${sodiumTarget === v ? GOLD : "#ffffff14"}`,
                  color: sodiumTarget === v ? GOLD : MUTED, fontSize: 11.5, fontWeight: 700, fontFamily: "inherit",
                }}>&lt; {v.toLocaleString("pt-BR")}</button>
            ))}
            {value.sodiumTargetMg && (
              <button type="button" onClick={() => saveSodium(null)}
                style={{ padding: "6px 11px", cursor: "pointer", background: "#020205", border: "1px solid #ffffff14", color: MUTED, fontSize: 11.5, fontFamily: "inherit" }}>
                usar padrão
              </button>
            )}
          </div>
          {sodiumTarget && (
            <>
              {(sodiumTarget < SODIUM_TARGET_MIN_MG || sodiumTarget > SODIUM_TARGET_MAX_MG) && (
                <div style={{ fontSize: 11.5, color: "#ff9f43", marginBottom: 8 }}>
                  ⚠️ Fora da faixa segura usual ({SODIUM_TARGET_MIN_MG}–{SODIUM_TARGET_MAX_MG} mg/dia). Validar com médico.
                </div>
              )}
              <div style={{ fontFamily: MONO, fontSize: 11, color: TEXT, marginBottom: 8 }}>
                RIGOR: {sodiumTier(sodiumTarget).toUpperCase()} · {sodiumSplit(sodiumTarget).map((s) => `${s.slot} ≤ ${s.mg}mg`).join(" · ")}
              </div>
              <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.7 }}>
                <span style={{ color: TEXT, fontWeight: 700 }}>Evitar nesta meta: </span>
                {sodiumAvoidList(sodiumTarget).join(" · ")}
              </div>
            </>
          )}
        </div>
      )}

      {activeSpecials.map((c) => (

        <div key={c.key} style={{ marginBottom: 14, padding: 14, background: "#020205", border: `1px solid ${CYAN}33`, borderLeft: `2px solid ${CYAN}` }}>
          <div style={{ ...label, color: CYAN, marginBottom: 6 }}>Protocolo · {c.label}</div>
          {c.short && <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, marginBottom: 10 }}>{c.short}</div>}
          <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.8, marginBottom: 10 }}>
            {c.activates.map((a) => <div key={a}>→ {a}</div>)}
          </div>
          {c.macros && (
            <div style={{ fontFamily: MONO, fontSize: 11, color: TEXT, marginBottom: 10 }}>
              MACROS: P {c.macros.protein[0]}–{c.macros.protein[1]}% · C {c.macros.carb[0]}–{c.macros.carb[1]}% · G {c.macros.fat[0]}–{c.macros.fat[1]}%
              {c.sodiumMaxMg ? ` · SÓDIO < ${sodiumTarget ?? c.sodiumMaxMg}mg/dia` : ""}
            </div>
          )}
          {!!c.supplements?.length && (
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.7 }}>
              <div style={{ color: TEXT, fontWeight: 700, marginBottom: 4 }}>Suplementação sugerida</div>
              {c.supplements.map((s) => (
                <div key={s.name}>{s.optional ? "☐" : "☑"} {s.name} — {s.dose}</div>
              ))}
              <div style={{ marginTop: 8, color: GOLD }}>⚠️ O sistema sugere, o médico/nutrólogo decide.</div>
            </div>
          )}
        </div>
      ))}


      {/* Prévia do cálculo */}
      {tmb && macros ? (
        <div style={{ padding: 14, background: "#020205", border: `1px solid ${GOLD}33` }}>
          <div style={{ ...label, marginBottom: 10 }}>🔥 Prévia do cálculo · {meta?.l}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, fontSize: 12, color: TEXT }}>
            <div><span style={{ color: MUTED }}>Peso real</span><br />{base.weight.toFixed(1)} kg</div>
            <div><span style={{ color: MUTED }}>Peso ideal</span><br />{ideal.toFixed(1)} kg</div>
            {tmb.adjusted_weight && (
              <div><span style={{ color: MUTED }}>Peso ajustado</span><br />{tmb.adjusted_weight} kg (f {tmb.abw_factor})</div>
            )}
            <div><span style={{ color: MUTED }}>IMC</span><br />{imc.toFixed(1)}</div>
            {lbm && <div><span style={{ color: MUTED }}>Massa magra</span><br />{lbm.toFixed(1)} kg</div>}
            <div><span style={{ color: MUTED }}>TMB</span><br /><b style={{ color: GOLD }}>{tmb.tmb} kcal</b></div>
            <div><span style={{ color: MUTED }}>Proteína</span><br />{macros.protein_total} g ({macros.protein_g_per_kg} g/kg {macros.protein_reference})</div>
            <div><span style={{ color: MUTED }}>Fibra mínima</span><br />{macros.fiber_min} g</div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: GOLD, marginTop: 10 }}>
            Fórmula: {tmb.formula}
          </div>
          {tmb.note && <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{tmb.note}</div>}
          {tmb.alerts.map((a, i) => (
            <div key={i} style={{ fontSize: 11, color: "#ff9f43", marginTop: 4 }}>⚠️ {a}</div>
          ))}
          {value.source === "apex_visual" && (
            <p style={{ display: "flex", gap: 6, marginTop: 10, fontSize: 10.5, color: MUTED, lineHeight: 1.6 }}>
              <AlertTriangle size={12} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
              {VISUAL_DISCLAIMER}
            </p>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 11.5, color: MUTED }}>
          Preencha peso, altura e idade do paciente para ver TMB e macros do perfil.
        </div>
      )}
    </div>
  );
}
