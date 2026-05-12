import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const C = {
  bg: "#0A0C0F", surface: "#111318", surfaceUp: "#181C23",
  border: "#1E2430", borderHi: "#2A3240",
  gold: "#B8922A", goldLight: "#D4A93C", goldDim: "#7A5C10",
  green: "#1D9E75", amber: "#BA7517", red: "#E24B4A",
  blue: "#185FA5", purple: "#534AB7",
  text: "#E8ECF2", textSec: "#7A8599", textDim: "#4A5568",
};

const scoreColor = (v: number) => (v >= 8 ? C.green : v >= 5 ? C.amber : C.red);
const scoreLabel = (v: number) => (v >= 8 ? "Elite" : v >= 6 ? "Bom" : v >= 4 ? "Regular" : "Crítico");

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseScores(text: string) {
  const sep = text.match(/Separação:\s*(\d+)/i)?.[1];
  const tex = text.match(/Textura:\s*(\d+)/i)?.[1];
  const dur = text.match(/Dureza:\s*(\d+)/i)?.[1];
  const tot = text.match(/Score shape:\s*(\d+)/i)?.[1];
  return {
    separacao: sep ? parseInt(sep) : null,
    textura: tex ? parseInt(tex) : null,
    dureza: dur ? parseInt(dur) : null,
    total: tot ? parseInt(tot) : null,
  };
}

function parseSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const keys = ["SCORES", "ANÁLISE VISUAL", "PONTOS FORTES", "PONTOS FRACOS", "AJUSTES PRESCRITOS", "POSING E APRESENTAÇÃO", "MCE"];
  keys.forEach((key, i) => {
    const next = keys[i + 1];
    const regex = next
      ? new RegExp(`##\\s*${key}([\\s\\S]*?)##\\s*${next}`, "i")
      : new RegExp(`##\\s*${key}([\\s\\S]*)`, "i");
    const m = text.match(regex);
    if (m) sections[key] = m[1].trim();
  });
  return sections;
}

function PhotoUpload({ label, file, onFile, onClear }: { label: string; file: File | null; onFile: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  }, [onFile]);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div
        onClick={() => !file && ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          height: 160, borderRadius: 12, position: "relative", overflow: "hidden",
          border: `1.5px dashed ${drag ? C.gold : file ? C.green : C.border}`,
          background: file ? "transparent" : C.surface,
          cursor: file ? "default" : "pointer", transition: "all .2s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {file && preview ? (
          <>
            <img src={preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "#000000cc", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</button>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, #000c)", color: "#fff", padding: "12px 8px 6px", fontSize: 10, textAlign: "center" }}>
              ✓ {file.name.length > 20 ? file.name.slice(0, 18) + "..." : file.name}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>Arraste ou clique</div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>
    </div>
  );
}

function ScoreRing({ value, label, size = 64 }: { value: number; label: string; size?: number }) {
  const col = scoreColor(value);
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={5} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={5} strokeDasharray={`${(value / 10) * circ} ${circ}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 60 ? 16 : 13, fontWeight: 800, color: col }}>{value}</div>
      </div>
      <div style={{ fontSize: 10, color: C.textSec, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 9, color: col, fontWeight: 700 }}>{scoreLabel(value)}</div>
    </div>
  );
}

function Section({ title, icon, content }: { title: string; icon: string; content: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: C.surfaceUp, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between", color: C.text,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 700 }}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", color: C.textSec }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px" }}>
          <div style={{ height: 1, background: C.border, marginBottom: 12 }} />
          <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text, whiteSpace: "pre-wrap" }}>{content}</div>
        </div>
      )}
    </div>
  );
}

export interface ApexVisualIAProps {
  atletaNome?: string;
  atletaIdade?: number;
  categoria?: string;
  semana?: number;
  campeonatoSem?: number;
  compostos?: string;
  pesoAtual?: string;
  bfAtual?: string;
  semanaAnterior?: { separacao: number; textura: number; dureza: number; total: number; obs?: string } | null;
}

export default function ApexVisualIA({
  atletaNome = "Atleta",
  atletaIdade = 30,
  categoria = "Mens Physique",
  semana = 1,
  campeonatoSem = 8,
  compostos = "—",
  pesoAtual = "",
  bfAtual = "",
  semanaAnterior = null,
}: ApexVisualIAProps) {
  const [fotoFrente, setFotoFrente] = useState<File | null>(null);
  const [fotoCostas, setFotoCostas] = useState<File | null>(null);
  const [fotoLateral, setFotoLateral] = useState<File | null>(null);
  const [peso, setPeso] = useState(pesoAtual);
  const [bf, setBf] = useState(bfAtual);
  const [obsCoach, setObsCoach] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<ReturnType<typeof parseScores> | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});

  const temFoto = fotoFrente || fotoCostas || fotoLateral;
  const semRestantes = campeonatoSem - semana;
  const semPct = Math.round((semana / campeonatoSem) * 100);

  const analisar = async () => {
    if (!temFoto) return;
    setLoading(true); setResult(null); setError(null); setScores(null); setSections({});

    try {
      const fotos: { label: string; data: string; mime: string }[] = [];
      for (const [label, file] of [["Frente", fotoFrente], ["Costas", fotoCostas], ["Lateral", fotoLateral]] as const) {
        if (!file) continue;
        fotos.push({ label, data: await fileToBase64(file), mime: file.type || "image/jpeg" });
      }

      const contexto = `
CONTEXTO DO ATLETA:
Nome: ${atletaNome}
Idade: ${atletaIdade} anos
Categoria: ${categoria}
Semana: ${semana} de ${campeonatoSem} (${semRestantes} semanas para o campeonato)
Protocolo farmacológico: ${compostos}
Peso atual: ${peso || "não informado"} kg
BF estimado: ${bf || "não informado"}%
Observação do coach: ${obsCoach || "nenhuma"}

${semanaAnterior ? `SEMANA ANTERIOR:
Separação: ${semanaAnterior.separacao}/10
Textura: ${semanaAnterior.textura}/10
Dureza: ${semanaAnterior.dureza}/10
Score: ${semanaAnterior.total}/100
Obs: ${semanaAnterior.obs || "—"}` : "PRIMEIRA AVALIAÇÃO — sem histórico anterior."}

Analise as fotos e gere o relatório APEX Visual completo.
${semRestantes <= 2 ? "ATENÇÃO: últimas semanas — priorizar peak week." : ""}
${semRestantes <= 1 ? "PEAK WEEK ATIVA — foco em sódio, água e CHO." : ""}
      `.trim();

      const { data, error: fnErr } = await supabase.functions.invoke("apex-visual-analyze", {
        body: { fotos, contexto },
      });
      if (fnErr) throw fnErr;
      if ((data as any)?.error) throw new Error((data as any).error);

      const text: string = (data as any).text || "";
      setResult(text);
      setScores(parseScores(text));
      setSections(parseSections(text));
    } catch (e: any) {
      setError(e?.message || "Erro na análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: C.bg, color: C.text, padding: 24, borderRadius: 16, maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏆</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>APEX Visual Coach</div>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Análise por IA · {atletaNome} · {categoria}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: C.textSec, fontWeight: 600, textTransform: "uppercase" }}>Sem {semana}/{campeonatoSem}</div>
            <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginTop: 2 }}>
              {semRestantes <= 0 ? "🔴 SHOW DAY" : `${semRestantes} sem para o show`}
            </div>
          </div>
        </div>
        <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${semPct}%`, height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})` }} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {/* Upload */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>📸 Fotos para análise (mín. 1)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <PhotoUpload label="Frente" file={fotoFrente} onFile={setFotoFrente} onClear={() => setFotoFrente(null)} />
            <PhotoUpload label="Costas" file={fotoCostas} onFile={setFotoCostas} onClear={() => setFotoCostas(null)} />
            <PhotoUpload label="Lateral" file={fotoLateral} onFile={setFotoLateral} onClear={() => setFotoLateral(null)} />
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Peso (kg)", val: peso, set: setPeso, ph: "98.0", unit: "kg" },
            { label: "BF estimado", val: bf, set: setBf, ph: "16", unit: "%" },
          ].map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6, textTransform: "uppercase" }}>{f.label}</div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  style={{ width: "100%", padding: "11px 32px 11px 12px", background: C.surface, border: `1px solid ${f.val ? C.borderHi : C.border}`, borderRadius: 10, color: C.text, fontSize: 15, fontWeight: 500, outline: "none", boxSizing: "border-box" }}
                />
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.textSec, fontWeight: 600 }}>{f.unit}</span>
              </div>
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6, textTransform: "uppercase" }}>Observação do coach</div>
            <input
              type="text"
              value={obsCoach}
              onChange={(e) => setObsCoach(e.target.value)}
              placeholder="Ex: atleta com retenção lombar, flat nos ombros..."
              style={{ width: "100%", padding: "11px 12px", background: C.surface, border: `1px solid ${obsCoach ? C.borderHi : C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={analisar}
          disabled={loading || !temFoto}
          style={{
            width: "100%", padding: "16px", border: "none", borderRadius: 14, cursor: temFoto && !loading ? "pointer" : "not-allowed",
            background: !temFoto || loading ? C.goldDim : `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
            color: !temFoto || loading ? "#fff" : "#000", fontSize: 15, fontWeight: 700, letterSpacing: ".03em",
            boxShadow: temFoto && !loading ? `0 4px 24px ${C.gold}44` : "none",
          }}
        >
          {loading ? "⟳ Analisando..." : !temFoto ? "📸 Adicione ao menos 1 foto" : "🔬 Analisar shape com APEX IA"}
        </button>

        {error && (
          <div style={{ background: C.red + "22", border: `1px solid ${C.red}55`, color: C.red, padding: "12px 16px", borderRadius: 10, fontSize: 13 }}>⚠ {error}</div>
        )}

        {/* Resultado */}
        {result && scores && !loading && (
          <div style={{ display: "grid", gap: 14 }}>
            {scores.separacao !== null && (
              <div style={{ background: C.surfaceUp, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>📊 Scores da semana {semana}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-around", alignItems: "center" }}>
                  <ScoreRing value={scores.separacao!} label="Separação" />
                  <ScoreRing value={scores.textura ?? 0} label="Textura" />
                  <ScoreRing value={scores.dureza ?? 0} label="Dureza" />
                  {scores.total !== null && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ position: "relative", width: 80, height: 80 }}>
                        <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                          <circle cx={40} cy={40} r={32} fill="none" stroke={C.border} strokeWidth={6} />
                          <circle cx={40} cy={40} r={32} fill="none"
                            stroke={scores.total >= 70 ? C.green : scores.total >= 50 ? C.amber : C.red}
                            strokeWidth={6}
                            strokeDasharray={`${2 * Math.PI * 32 * (scores.total / 100)} ${2 * Math.PI * 32}`}
                            strokeLinecap="round" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: scores.total >= 70 ? C.green : scores.total >= 50 ? C.amber : C.red }}>{scores.total}</div>
                      </div>
                      <div style={{ fontSize: 10, color: C.textSec, fontWeight: 600 }}>TOTAL</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: scores.total >= 70 ? C.green : scores.total >= 50 ? C.amber : C.red }}>
                        {scores.total >= 80 ? "Shape Elite" : scores.total >= 65 ? "Shape Bom" : scores.total >= 50 ? "Shape Regular" : "Shape Crítico"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sections["ANÁLISE VISUAL"] && <Section title="Análise visual" icon="🔍" content={sections["ANÁLISE VISUAL"]} />}
            {sections["PONTOS FORTES"] && <Section title="Pontos fortes" icon="💪" content={sections["PONTOS FORTES"]} />}
            {sections["PONTOS FRACOS"] && <Section title="Pontos fracos" icon="⚠" content={sections["PONTOS FRACOS"]} />}
            {sections["AJUSTES PRESCRITOS"] && <Section title="Ajustes prescritos" icon="🎯" content={sections["AJUSTES PRESCRITOS"]} />}
            {sections["POSING E APRESENTAÇÃO"] && <Section title="Posing e apresentação" icon="🎭" content={sections["POSING E APRESENTAÇÃO"]} />}
            {sections["MCE"] && <Section title="MCE — Mindset · Comportamento · Execução" icon="🧠" content={sections["MCE"]} />}

            <button
              onClick={() => { setResult(null); setScores(null); setSections({}); setFotoFrente(null); setFotoCostas(null); setFotoLateral(null); }}
              style={{ width: "100%", padding: "13px", background: "none", border: `1px solid ${C.border}`, borderRadius: 12, color: C.textSec, fontSize: 13, cursor: "pointer", marginTop: 4 }}
            >+ Nova análise</button>
          </div>
        )}
      </div>
    </div>
  );
}
