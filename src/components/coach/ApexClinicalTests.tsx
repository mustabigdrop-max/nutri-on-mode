// APEX Visual — Testes Clínicos do Método Fenner com análise por IA (foto + Gemini Vision)
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Upload, Loader2, Camera, ChevronRight, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  FENNER_AI_TESTS,
  FENNER_AI_GROUPS,
  type FennerAiTest,
  type AiTestGroup,
} from "@/data/fennerTests";
import TestResultCard, { type TestAiResult } from "@/components/apex/TestResultCard";
import { ApexFramingGuide } from "@/components/coach/ApexFramingGuide";

// ─── Design tokens (HUD Jarvis) ─────────────────────────────────
const C = {
  bg: "#0a0a1a",
  card: "rgba(10,10,26,0.8)",
  border: "rgba(0,212,255,0.18)",
  borderHi: "rgba(0,212,255,0.45)",
  cyan: "#00D4FF",
  gold: "#B8922A",
  green: "#00C896",
  text: "#F5F0E8",
  muted: "#9AA6B8",
  fontMono: "'Space Mono', 'JetBrains Mono', monospace",
};

interface AthleteData {
  height?: number;
  weight?: number;
  sex?: "M" | "F";
  age?: number;
}

interface Props {
  athleteId?: string | null;
  coachId?: string | null;
  athleteData?: AthleteData;
}

interface CompletedTest {
  test: FennerAiTest;
  imageUrl: string;
  result: TestAiResult;
  evaluatedAt: string;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function ApexClinicalTests({ athleteId, coachId, athleteData }: Props) {
  const [activeGroup, setActiveGroup] = useState<AiTestGroup>("flexibility");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [completed, setCompleted] = useState<CompletedTest[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);

  const groupedTests = useMemo(() => {
    const map: Record<AiTestGroup, FennerAiTest[]> = { flexibility: [], strength: [], dynamic: [], static: [] };
    FENNER_AI_TESTS.forEach((t) => map[t.group].push(t));
    return map;
  }, []);

  const selectedTest = useMemo(
    () => FENNER_AI_TESTS.find((t) => t.id === selectedTestId) || null,
    [selectedTestId],
  );

  // Carregar histórico do atleta
  useEffect(() => {
    if (!athleteId) { setCompleted([]); return; }
    (async () => {
      const { data, error } = await supabase
        .from("apex_test_results" as any)
        .select("*")
        .eq("athlete_id", athleteId)
        .order("evaluated_at", { ascending: false })
        .limit(20);
      if (error || !data) return;
      const rows: CompletedTest[] = (data as any[])
        .map((r) => {
          const test = FENNER_AI_TESTS.find((t) => t.id === r.test_id);
          if (!test) return null;
          return { test, imageUrl: r.image_url || "", result: r.raw_result || {}, evaluatedAt: r.evaluated_at };
        })
        .filter(Boolean) as CompletedTest[];
      setCompleted(rows);
    })();
  }, [athleteId]);

  const uploadImageToStorage = useCallback(async (file: File): Promise<string | null> => {
    if (!coachId) return null;
    const path = `${coachId}/${athleteId ?? "_anon"}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("apex-visual-photos").upload(path, file, { upsert: false });
    if (error) { console.error(error); return null; }
    const { data: signed } = await supabase.storage.from("apex-visual-photos").createSignedUrl(path, 60 * 60 * 24 * 7);
    return signed?.signedUrl ?? null;
  }, [coachId, athleteId]);

  const handleFile = useCallback(async (file: File) => {
    if (!selectedTest) { toast({ title: "Selecione um teste antes de enviar a foto." }); return; }
    if (file.size > 15 * 1024 * 1024) { toast({ title: "Arquivo muito grande (máx 15 MB)." }); return; }

    setAnalyzing(true);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      const b64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("apex-analyze-test", {
        body: {
          testId: selectedTest.id,
          testName: selectedTest.name,
          testGroup: selectedTest.group,
          aiPrompt: selectedTest.aiPrompt,
          imageBase64: b64,
          athleteData: athleteData ?? {},
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Falha na análise");

      const result = data.result as TestAiResult;

      // upload da imagem para storage (signed) e salvar registro
      const signedUrl = await uploadImageToStorage(file);
      const finalImg = signedUrl ?? localUrl;

      if (athleteId && coachId) {
        await supabase.from("apex_test_results" as any).insert({
          athlete_id: athleteId,
          coach_id: coachId,
          test_id: selectedTest.id,
          test_name: selectedTest.name,
          test_group: selectedTest.group,
          image_url: signedUrl,
          raw_result: result,
          measurements: {},
          muscle_updates: [],
          findings_text: result?.findings ?? null,
          overall_severity: pickSeverity(result),
        });
      }

      setCompleted((prev) => [{ test: selectedTest, imageUrl: finalImg, result, evaluatedAt: new Date().toISOString() }, ...prev]);
      toast({ title: "Análise concluída", description: selectedTest.name });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro na análise", description: String(err?.message ?? err), variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  }, [selectedTest, athleteData, athleteId, coachId, uploadImageToStorage]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const hasSevereFinding = completed.some(
    (c) => pickSeverity(c.result) === "severe" || pickSeverity(c.result) === "inibido"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes apex-pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>

      {/* Cabeçalho */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={16} style={{ color: C.cyan }} />
          <div>
            <div style={{ fontFamily: C.fontMono, fontSize: 11, color: C.muted, letterSpacing: 1.5 }}>
              APEX · TESTES CLÍNICOS
            </div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginTop: 2 }}>
              Avaliação Funcional APEX
            </div>
          </div>
        </div>
        <div style={{ fontFamily: C.fontMono, fontSize: 11, color: C.cyan }}>
          {completed.length} {completed.length === 1 ? "teste" : "testes"} realizados
        </div>
      </div>

      {hasSevereFinding && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, color: "#FCA5A5",
          fontSize: 12,
        }}>
          <AlertTriangle size={14} />
          <span><strong>Achado severo detectado</strong> — revisar protocolo antes de prescrever treino.</span>
        </div>
      )}

      {/* Tabs de grupo */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FENNER_AI_GROUPS.map((g) => {
          const isActive = activeGroup === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              style={{
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                background: isActive ? `${g.color}22` : "transparent",
                border: `1px solid ${isActive ? g.color : C.border}`,
                color: isActive ? g.color : C.muted,
                fontFamily: C.fontMono, fontSize: 11, fontWeight: 700, letterSpacing: 1,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span>{g.icon}</span> {g.label}
              <span style={{ opacity: 0.6 }}>· {groupedTests[g.id].length}</span>
            </button>
          );
        })}
      </div>

      {/* Grid de testes do grupo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
        {groupedTests[activeGroup].map((t) => {
          const sel = selectedTestId === t.id;
          const done = completed.some((c) => c.test.id === t.id);
          return (
            <button
              key={t.id}
              onClick={() => { setSelectedTestId(t.id); setPreviewUrl(null); }}
              style={{
                textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer",
                background: sel ? "rgba(0,212,255,0.08)" : C.card,
                border: `1px solid ${sel ? C.borderHi : C.border}`,
                color: C.text, position: "relative",
                transition: "all 0.18s",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.fontMono }}>
                {t.photoAngle}
              </div>
              {done && (
                <span style={{
                  position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%",
                  background: C.green, boxShadow: `0 0 6px ${C.green}`,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Instrução + Upload */}
      {selectedTest && (
        <div style={{
          background: C.card, border: `1px solid ${C.borderHi}`, borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontFamily: C.fontMono, fontSize: 10, color: C.cyan, letterSpacing: 1.5, marginBottom: 6 }}>
            INSTRUÇÃO DA POSIÇÃO
          </div>
          <div style={{ color: C.text, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            {selectedTest.instruction}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 14 }}>
            {selectedTest.normalValues.map((nv, i) => (
              <div key={i} style={{ padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: C.fontMono, marginBottom: 4 }}>{nv.metric}</div>
                <div style={{ fontSize: 11, color: C.green }}>✓ {nv.normal}</div>
                <div style={{ fontSize: 11, color: C.gold }}>~ {nv.mild}</div>
                <div style={{ fontSize: 11, color: "#FCA5A5" }}>✗ {nv.severe}</div>
              </div>
            ))}
          </div>

          {/* Guia de enquadramento */}
          <div style={{ marginBottom: 12 }}>
            <ApexFramingGuide />
          </div>

          {/* Drag & drop + botões */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${C.border}`, borderRadius: 12, padding: 20,
              textAlign: "center", color: C.muted,
              background: "rgba(0,212,255,0.03)",
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
            <input
              ref={albumRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
            {analyzing ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: C.cyan, padding: 8 }}>
                <Loader2 size={18} className="animate-spin" /> Analisando posição com IA...
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                  <Upload size={18} style={{ color: C.cyan }} />
                </div>
                <div style={{ fontSize: 13, color: C.text, marginBottom: 2 }}>
                  Arraste a foto aqui
                </div>
                <div style={{ fontSize: 11, marginBottom: 10 }}>{selectedTest.photoAngle.toUpperCase()} · MÁX 15MB</div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>ou</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "#0d1520", border: "0.5px solid #00D4FF40",
                      color: "#00D4FF", fontSize: 12, fontWeight: 700,
                      borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                      fontFamily: C.fontMono,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#001520"; e.currentTarget.style.borderColor = "#00D4FF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0d1520"; e.currentTarget.style.borderColor = "#00D4FF40"; }}
                  >
                    <Camera size={14} /> Tirar foto
                  </button>
                  <button
                    type="button"
                    onClick={() => albumRef.current?.click()}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "#0d1520", border: "0.5px solid #00D4FF40",
                      color: "#00D4FF", fontSize: 12, fontWeight: 700,
                      borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                      fontFamily: C.fontMono,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#001520"; e.currentTarget.style.borderColor = "#00D4FF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0d1520"; e.currentTarget.style.borderColor = "#00D4FF40"; }}
                  >
                    <Upload size={14} /> Escolher do álbum
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resultados */}
      {completed.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ChevronRight size={14} style={{ color: C.cyan }} />
            <span style={{ fontFamily: C.fontMono, fontSize: 11, color: C.muted, letterSpacing: 1.5 }}>
              RESULTADOS
            </span>
          </div>
          {completed.map((c, i) => (
            <TestResultCard key={`${c.test.id}_${i}`} test={c.test} imageUrl={c.imageUrl} result={c.result} />
          ))}
        </div>
      )}

      {completed.length >= 3 && (
        <button style={{
          marginTop: 8, padding: "12px 18px", borderRadius: 10,
          background: `linear-gradient(135deg, ${C.gold}, #D4A53A)`,
          color: "#03040A", fontWeight: 800, fontFamily: C.fontMono,
          letterSpacing: 1, border: "none", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
        }}>
          <Sparkles size={14} /> GERAR DIAGNÓSTICO FINAL
        </button>
      )}
    </div>
  );
}

function pickSeverity(result: TestAiResult): string {
  const keys = Object.keys(result).filter((k) => k.startsWith("classificacao") || k === "severity");
  const rank: Record<string, number> = { normal: 0, mild: 1, fraqueza_relativa: 2, moderate: 3, inibido: 4, severe: 5 };
  let worst = "normal";
  for (const k of keys) {
    const v = String(result[k]);
    if (rank[v] !== undefined && rank[v] > (rank[worst] ?? 0)) worst = v;
  }
  return worst;
}

export default ApexClinicalTests;
