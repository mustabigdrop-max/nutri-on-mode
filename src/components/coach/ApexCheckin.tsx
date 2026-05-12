import { useState, useRef, useCallback } from "react";

// ─── Paleta nutriON ───────────────────────────────────────────────
const C = {
  bg: "#0A0C0F",
  surface: "#111318",
  surfaceUp: "#181C23",
  border: "#1E2430",
  borderHi: "#2A3240",
  gold: "#B8922A",
  goldLight: "#D4A93C",
  goldDim: "#7A5C10",
  green: "#1D9E75",
  amber: "#BA7517",
  red: "#E24B4A",
  text: "#E8ECF2",
  textSec: "#7A8599",
  textDim: "#4A5568",
};

const scoreColor = (v: number) => (v >= 8 ? C.green : v >= 5 ? C.amber : C.red);
const scoreLabel = (v: number) =>
  v >= 8 ? "Elite" : v >= 6 ? "Bom" : v >= 4 ? "Regular" : "Crítico";

function Slider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const pct = ((value - 1) / 9) * 100;
  const col = scoreColor(value);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
          <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{hint}</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: col }}>{value}</span>
          <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>{scoreLabel(value)}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 8, background: C.surface, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: col, transition: "all .2s" }} />
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", height: "100%" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: C.textDim }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}

function PhotoZone({
  label,
  icon,
  file,
  onFile,
  onClear,
}: {
  label: string;
  icon: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile],
  );

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
        {icon} {label}
      </div>
      <div
        onClick={() => !file && ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          position: "relative",
          height: 180,
          borderRadius: 12,
          border: `1.5px dashed ${drag ? C.gold : file ? C.green : C.border}`,
          background: file ? "transparent" : drag ? C.gold + "0A" : C.surface,
          cursor: file ? "default" : "pointer",
          overflow: "hidden",
          transition: "all .2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {file && preview ? (
          <>
            <img src={preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#00000099",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, #000000cc)",
                color: "#fff",
                padding: "16px 10px 8px",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              {file.name}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>Arraste ou clique para enviar</div>
            <div style={{ fontSize: 10, color: C.textSec, marginTop: 4 }}>JPG, PNG, WEBP</div>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}

function MetricField({
  label,
  value,
  onChange,
  unit,
  placeholder,
  type = "number",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
        {label}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: unit ? "12px 36px 12px 14px" : "12px 14px",
            background: C.surface,
            border: `1px solid ${value ? C.borderHi : C.border}`,
            borderRadius: 10,
            color: C.text,
            fontSize: 15,
            fontWeight: 500,
            outline: "none",
            transition: "border .2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.gold)}
          onBlur={(e) => (e.target.style.borderColor = value ? C.borderHi : C.border)}
        />
        {unit && (
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              color: C.textSec,
              fontWeight: 600,
              pointerEvents: "none",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreBadge({ total, max }: { total: number; max: number }) {
  const pct = (total / max) * 100;
  const col = pct >= 80 ? C.green : pct >= 55 ? C.amber : C.red;
  const label =
    pct >= 80 ? "Shape Elite" : pct >= 65 ? "Shape Bom" : pct >= 50 ? "Shape Regular" : "Shape Crítico";
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: C.surfaceUp,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "14px 18px",
      }}
    >
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke={C.border} strokeWidth="6" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={col}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray .4s" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            color: col,
          }}
        >
          {total}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: col }}>{label}</div>
        <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>
          Score {total}/{max} · {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
}

export interface ApexCheckinPayload {
  peso: string;
  bf: string;
  cintura: string;
  energia: number;
  sono: number;
  separacao: number;
  textura: number;
  dureza: number;
  obs: string;
  scoreTotal: number;
  fotoFrente: File | null;
  fotoCostas: File | null;
  fotoLateral: File | null;
}

export default function ApexCheckin({
  atletaNome = "Cebola",
  semana = 3,
  campeonatoSem = 8,
  onSave,
}: {
  atletaNome?: string;
  semana?: number;
  campeonatoSem?: number;
  onSave?: (p: ApexCheckinPayload) => void;
}) {
  const [peso, setPeso] = useState("");
  const [bf, setBf] = useState("");
  const [cintura, setCintura] = useState("");
  const [energia, setEnergia] = useState(7);
  const [sono, setSono] = useState(7);
  const [separacao, setSep] = useState(7);
  const [textura, setTex] = useState(7);
  const [dureza, setDur] = useState(7);
  const [obs, setObs] = useState("");
  const [fotoFrente, setFotoFrente] = useState<File | null>(null);
  const [fotoCostas, setFotoCostas] = useState<File | null>(null);
  const [fotoLateral, setFotoLateral] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const scoreShape = Math.round(((separacao + textura + dureza) / 3) * 10);
  const scoreBem = Math.round(((energia + sono) / 2) * 10);
  const scoreTotal = Math.round(scoreShape * 0.7 + scoreBem * 0.3);
  const semPct = Math.round((semana / campeonatoSem) * 100);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSave?.({
      peso, bf, cintura, energia, sono, separacao, textura, dureza, obs,
      scoreTotal, fotoFrente, fotoCostas, fotoLateral,
    });
  };

  return (
    <div style={{ background: C.bg, color: C.text, padding: 24, borderRadius: 16, maxWidth: 1100, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏆</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em" }}>APEX Visual Coach</div>
            <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Check-in Semanal · {atletaNome}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.textSec, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Semana {semana} de {campeonatoSem}
          </div>
          <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginTop: 2 }}>
            {campeonatoSem - semana} sem para o show
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textSec, marginBottom: 6 }}>
          <span>Progresso da preparação</span>
          <span>{semPct}%</span>
        </div>
        <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${semPct}%`, height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, transition: "width .4s" }} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        <ScoreBadge total={scoreTotal} max={100} />

        {/* Métricas */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>📐 Métricas da semana</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <MetricField label="Peso" value={peso} onChange={setPeso} unit="kg" placeholder="0.0" />
            <MetricField label="BF estimado" value={bf} onChange={setBf} unit="%" placeholder="0.0" />
            <MetricField label="Cintura" value={cintura} onChange={setCintura} unit="cm" placeholder="0" />
          </div>
        </div>

        {/* Fotos */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>📸 Fotos da semana</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <PhotoZone label="Frente" icon="🟡" file={fotoFrente} onFile={setFotoFrente} onClear={() => setFotoFrente(null)} />
            <PhotoZone label="Costas" icon="🟡" file={fotoCostas} onFile={setFotoCostas} onClear={() => setFotoCostas(null)} />
            <PhotoZone label="Lateral" icon="🟡" file={fotoLateral} onFile={setFotoLateral} onClear={() => setFotoLateral(null)} />
          </div>
        </div>

        {/* Shape scoring */}
        <div style={{ background: C.surfaceUp, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: ".05em" }}>🎯 Scoring de shape — protocolo Neil Hill</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{scoreShape}/100</div>
          </div>
          <Slider label="Separação" hint="Definição entre grupos musculares" value={separacao} onChange={setSep} />
          <Slider label="Textura" hint="Estrias e detalhe muscular sob a pele" value={textura} onChange={setTex} />
          <Slider label="Dureza" hint="Densidade e ausência de retenção" value={dureza} onChange={setDur} />
        </div>

        {/* Bem-estar */}
        <div style={{ background: C.surfaceUp, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: ".05em" }}>⚡ Bem-estar da semana</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{scoreBem}/100</div>
          </div>
          <Slider label="Energia" hint="Disposição geral nos treinos e dia a dia" value={energia} onChange={setEnergia} />
          <Slider label="Sono" hint="Qualidade e recuperação noturna" value={sono} onChange={setSono} />
        </div>

        {/* Observações */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>💬 Observações do coach</div>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Notas sobre o shape desta semana, ajustes realizados, comportamento do atleta, intercorrências..."
            rows={4}
            style={{
              width: "100%", background: C.surface, border: `1px solid ${obs ? C.borderHi : C.border}`,
              borderRadius: 12, color: C.text, fontSize: 13, lineHeight: 1.6, padding: "14px 16px",
              outline: "none", resize: "vertical", boxSizing: "border-box", transition: "border .2s",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e) => (e.target.style.borderColor = obs ? C.borderHi : C.border)}
          />
        </div>

        {/* Resumo */}
        <div style={{ background: C.surfaceUp, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", flexWrap: "wrap" }}>
          {[
            { label: "Separação", val: separacao * 10, color: scoreColor(separacao) },
            { label: "Textura", val: textura * 10, color: scoreColor(textura) },
            { label: "Dureza", val: dureza * 10, color: scoreColor(dureza) },
            { label: "Energia", val: energia * 10, color: scoreColor(energia) },
            { label: "Sono", val: sono * 10, color: scoreColor(sono) },
            { label: "TOTAL", val: scoreTotal, color: scoreTotal >= 70 ? C.green : scoreTotal >= 50 ? C.amber : C.red, bold: true },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              flex: 1, minWidth: 70, padding: "8px 12px",
              borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 18, fontWeight: item.bold ? 800 : 600, color: item.color }}>{item.val}</div>
              <div style={{ fontSize: 10, color: C.textSec, marginTop: 2, fontWeight: item.bold ? 700 : 400 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={handleSave}
          disabled={saving || !peso}
          style={{
            marginTop: 4, width: "100%", padding: "16px 24px",
            background: saved ? C.green : saving ? C.goldDim : `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
            border: "none", borderRadius: 14, cursor: peso && !saving ? "pointer" : "not-allowed",
            fontSize: 15, fontWeight: 700, color: saved || saving ? "#fff" : "#000",
            letterSpacing: ".03em", transition: "all .2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: saving || !peso ? "none" : `0 4px 24px ${C.gold}44`,
          }}
        >
          {saving ? (
            <><span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 18 }}>⟳</span> Salvando check-in...</>
          ) : saved ? (
            <><span>✓</span> Check-in salvo com sucesso!</>
          ) : (
            <><span>📊</span> Salvar check-in da semana {semana}</>
          )}
        </button>
        {!peso && <div style={{ textAlign: "center", fontSize: 11, color: C.textSec, marginTop: 8 }}>Preencha o peso para salvar</div>}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:${C.gold}; cursor:pointer; border:2px solid ${C.bg}; }
        input[type=range]::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:${C.gold}; cursor:pointer; border:2px solid ${C.bg}; }
      `}</style>
    </div>
  );
}
