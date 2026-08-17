import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Search, Check, Pencil, X, AlertTriangle, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const C = {
  emerald: "#00C896",
  text: "#E8ECEF",
  dim: "#8A9299",
  card: "#0E1417",
  border: "#1E2A2F",
  amber: "#F0B429",
};

export type BodyProfileKey =
  | "padrao" | "atletico" | "sobrepeso" | "obeso" | "obeso_severo" | "masters" | "adolescente";

export const BODY_PROFILES: {
  key: BodyProfileKey; label: string; desc: string; abw: number | null; protein: "real" | "ideal" | "ajustado";
}[] = [
  { key: "padrao", label: "Padrão", desc: "IMC 18.5–27 · Mifflin-St Jeor com peso real", abw: null, protein: "real" },
  { key: "atletico", label: "Atlético / Muscular", desc: "BF baixo e massa magra elevada · Katch-McArdle", abw: null, protein: "real" },
  { key: "sobrepeso", label: "Sobrepeso", desc: "IMC 27–30 · Mifflin com leve ajuste", abw: 0.5, protein: "ajustado" },
  { key: "obeso", label: "Obesidade", desc: "IMC 30–40 · Mifflin + ABW (0.25)", abw: 0.25, protein: "ideal" },
  { key: "obeso_severo", label: "Obesidade severa", desc: "IMC > 40 · Mifflin + ABW (0.25) conservador", abw: 0.25, protein: "ideal" },
  { key: "masters", label: "Masters (50+)", desc: "Ajuste por perda de massa magra e sarcopenia", abw: null, protein: "real" },
  { key: "adolescente", label: "Adolescente", desc: "Demanda de crescimento · sem déficit agressivo", abw: null, protein: "real" },
];

export interface BodyProfileSuggestion {
  suggested_profile: BodyProfileKey;
  estimated_bf_range: [number, number];
  fat_distribution: string;
  muscle_development: string;
  visual_indicators: string[];
  nutritional_priorities: string[];
  abw_factor_suggestion: number;
  protein_reference: string;
  confidence: string;
  photo_used?: string;
  photo_date?: string;
  photo_source?: string;
  client_data?: { weight: number | null; height: number | null; age: number | null; sex: string; imc: string };
  current_profile?: BodyProfileKey | null;
  current_bf?: number | null;
  current_analyzed_at?: string | null;
  history?: { data_avaliacao?: string; created_at?: string; bf_estimado?: number | null; peso_kg?: number | null }[];
}

interface Props {
  patients: { user_id: string; name: string }[];
  clientData: { peso?: string; altura?: string; idade?: string; sexo?: string };
  value: BodyProfileKey | "";
  onChange: (profile: BodyProfileKey, extras?: { bf?: number; abw?: number | null }) => void;
}

const DISCLAIMER =
  "A análise visual é uma estimativa baseada em foto e dados biométricos. Para precisão clínica, recomenda-se avaliação por bioimpedância, DEXA ou pesagem hidrostática. O coach tem a decisão final sobre o perfil utilizado no plano.";

export default function BodyProfileSelector({ patients, clientData, value, onChange }: Props) {
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [sug, setSug] = useState<BodyProfileSuggestion | null>(null);
  const [error, setError] = useState("");

  const abwWeight = (() => {
    const peso = Number(clientData.peso) || sug?.client_data?.weight || 0;
    const altura = Number(clientData.altura) || sug?.client_data?.height || 0;
    const factor = sug?.abw_factor_suggestion ?? 0.25;
    if (!peso || !altura) return null;
    const ideal = 22 * Math.pow(altura / 100, 2); // IMC 22 como peso ideal
    if (peso <= ideal) return peso;
    return Math.round((ideal + factor * (peso - ideal)) * 10) / 10;
  })();

  const analyze = async () => {
    if (!patientId) { toast.error("Selecione o cliente para analisar as fotos do APEX."); return; }
    setLoading(true); setError(""); setSug(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-body-profile", {
        body: {
          action: "analyze",
          patient_user_id: patientId,
          weight_kg: Number(clientData.peso) || undefined,
          height_cm: Number(clientData.altura) || undefined,
          age: Number(clientData.idade) || undefined,
          sex: clientData.sexo,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSug(data as BodyProfileSuggestion);
    } catch (e: any) {
      setError(e?.message || "Não foi possível analisar as fotos.");
    } finally {
      setLoading(false);
    }
  };

  const accept = async () => {
    if (!sug) return;
    setApplying(true);
    const bf = (sug.estimated_bf_range?.[0] + sug.estimated_bf_range?.[1]) / 2;
    try {
      const { error } = await supabase.functions.invoke("analyze-body-profile", {
        body: { action: "apply", patient_user_id: patientId, suggestion: sug },
      });
      if (error) throw error;
      onChange(sug.suggested_profile, { bf, abw: sug.abw_factor_suggestion });
      toast.success(`Perfil aplicado: ${BODY_PROFILES.find(p => p.key === sug.suggested_profile)?.label ?? sug.suggested_profile}`);
      setSug(null);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao aplicar sugestão");
    } finally {
      setApplying(false);
    }
  };

  const evolution = (() => {
    if (!sug?.current_profile || sug.current_profile === sug.suggested_profile) return null;
    return { from: sug.current_profile, to: sug.suggested_profile, fromBf: sug.current_bf, at: sug.current_analyzed_at };
  })();

  const label = (k?: string | null) => BODY_PROFILES.find(p => p.key === k)?.label ?? "—";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Bloco APEX */}
      <div style={{ border: `1px solid ${C.emerald}33`, background: `${C.emerald}0D`, borderRadius: 8, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Camera size={14} color={C.emerald} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.emerald, letterSpacing: ".06em", textTransform: "uppercase" }}>
            Sugerir pelo APEX Visual
          </span>
        </div>
        <p style={{ fontSize: 12, color: C.dim, margin: "0 0 10px" }}>
          Analisar as fotos do cliente e sugerir o perfil corporal automaticamente.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            style={{
              flex: "1 1 220px", background: C.card, color: C.text, border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "8px 10px", fontSize: 12,
            }}
          >
            <option value="">Selecionar cliente…</option>
            {patients.map(p => <option key={p.user_id} value={p.user_id}>{p.name}</option>)}
          </select>
          <button
            onClick={analyze}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: C.emerald, color: "#04110D",
              border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 700,
              cursor: loading ? "wait" : "pointer", opacity: loading ? .6 : 1,
            }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            {loading ? "Analisando…" : "Analisar fotos"}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 10, fontSize: 12, color: C.amber, display: "flex", gap: 6 }}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}
      </div>

      {/* Resultado */}
      {sug && (
        <div style={{ border: `1px solid ${C.border}`, background: C.card, borderRadius: 8, padding: 14, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.emerald, letterSpacing: ".06em", textTransform: "uppercase" }}>
            🔍 Análise visual · sugestão do sistema
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {sug.photo_used && (
              <img
                src={sug.photo_used}
                alt="Foto usada na análise visual do perfil corporal"
                style={{ width: 110, height: 150, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}` }}
              />
            )}
            <div style={{ flex: "1 1 240px", display: "grid", gap: 4, fontSize: 13, color: C.text }}>
              <div><span style={{ color: C.dim }}>Perfil: </span><b>{label(sug.suggested_profile).toUpperCase()}</b></div>
              <div><span style={{ color: C.dim }}>BF estimado: </span>{sug.estimated_bf_range?.[0]}–{sug.estimated_bf_range?.[1]}%</div>
              <div><span style={{ color: C.dim }}>Distribuição: </span>{sug.fat_distribution}</div>
              <div><span style={{ color: C.dim }}>Musculatura: </span>{sug.muscle_development}</div>
              <div><span style={{ color: C.dim }}>Confiança: </span>{sug.confidence}</div>
              {sug.photo_date && (
                <div style={{ fontSize: 11, color: C.dim }}>
                  Foto de {new Date(sug.photo_date).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          </div>

          {!!sug.visual_indicators?.length && (
            <div>
              <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                Indicadores visuais detectados
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.text, display: "grid", gap: 2 }}>
                {sug.visual_indicators.map((i, n) => <li key={n}>{i}</li>)}
              </ul>
            </div>
          )}

          <div style={{ fontSize: 12, color: C.text, display: "grid", gap: 2 }}>
            <div><span style={{ color: C.dim }}>Fórmula sugerida: </span>Mifflin + ABW ({sug.abw_factor_suggestion})</div>
            {abwWeight && <div><span style={{ color: C.dim }}>Peso ajustado estimado: </span>~{abwWeight} kg</div>}
            <div><span style={{ color: C.dim }}>Proteína por: </span>peso {sug.protein_reference === "ideal" ? "ideal" : "real"}</div>
          </div>

          {!!sug.nutritional_priorities?.length && (
            <div>
              <div style={{ fontSize: 11, color: C.dim, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                Prioridades nutricionais sugeridas
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.text, display: "grid", gap: 2 }}>
                {sug.nutritional_priorities.map((i, n) => <li key={n}>→ {i}</li>)}
              </ul>
            </div>
          )}

          {evolution && (
            <div style={{ border: `1px solid ${C.amber}44`, background: `${C.amber}0D`, borderRadius: 6, padding: 10, fontSize: 12, color: C.text }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: C.amber, marginBottom: 4 }}>
                <TrendingDown size={13} /> Evolução do perfil
              </div>
              <div>
                Antes: <b>{label(evolution.from).toUpperCase()}</b>
                {evolution.fromBf ? ` · BF ~${Math.round(evolution.fromBf)}%` : ""}
                {evolution.at ? ` (${new Date(evolution.at).toLocaleDateString("pt-BR")})` : ""}
              </div>
              <div>Agora: <b>{label(evolution.to).toUpperCase()}</b> · BF ~{sug.estimated_bf_range?.[0]}–{sug.estimated_bf_range?.[1]}%</div>
              <div style={{ marginTop: 4 }}>
                💡 O cliente mudou de perfil — recalcule o plano com a fórmula de <b>{label(evolution.to)}</b>.
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={accept} disabled={applying}
              style={{ display: "flex", alignItems: "center", gap: 6, background: C.emerald, color: "#04110D", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: applying ? .6 : 1 }}>
              <Check size={13} /> Aceitar sugestão
            </button>
            <button onClick={() => { onChange(sug.suggested_profile, { bf: (sug.estimated_bf_range[0] + sug.estimated_bf_range[1]) / 2, abw: sug.abw_factor_suggestion }); setSug(null); }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Pencil size={13} /> Ajustar manualmente
            </button>
            <button onClick={() => setSug(null)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", color: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <X size={13} /> Ignorar e selecionar
            </button>
          </div>

          <div style={{ fontSize: 11, color: C.dim, display: "flex", gap: 6 }}>
            <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} /> {DISCLAIMER}
          </div>
        </div>
      )}

      {/* Manual */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 10, color: C.dim, letterSpacing: ".1em", textTransform: "uppercase" }}>ou selecionar manualmente</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {BODY_PROFILES.map(p => {
          const active = value === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onChange(p.key, { abw: p.abw })}
              style={{
                textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer",
                background: active ? `${C.emerald}12` : "transparent",
                border: `1px solid ${active ? C.emerald + "66" : C.border}`,
                borderRadius: 6, padding: "9px 12px",
              }}
            >
              <span style={{
                width: 12, height: 12, borderRadius: "50%", marginTop: 2, flexShrink: 0,
                border: `2px solid ${active ? C.emerald : C.dim}`, background: active ? C.emerald : "transparent",
              }} />
              <span>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: active ? C.emerald : C.text }}>{p.label}</span>
                <span style={{ display: "block", fontSize: 11, color: C.dim }}>{p.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
