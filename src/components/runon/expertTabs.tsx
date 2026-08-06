/** RunON — Adendo Expert: abas Stride Lab, Shoes, HRV, BFR, Joint, Weather, Restore, Mind, Couch, Ranks, Integrações. */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Footprints, ShoppingBag, HeartPulse, Lock, ShieldPlus, CloudSun, Sparkles,
  Brain, Rocket, Trophy, Network, Activity, AlertTriangle, CheckCircle2, XCircle,
  Gauge, Route, Camera, Thermometer, Droplets, Timer, TrendingUp, Scale,
} from "lucide-react";
import { RC, mono, raj, IconBox, RBadge, SectionCard, StatCard, Chip } from "./runonUi";
import { loadProfile } from "@/lib/runonProfile";
import {
  bodybuilderDrills, strideChecks, shoeTiers, shoeRules, hrvWearables,
  bfrProtocols, bfrScheduling, bfrEvidence, jointSupplements, jointPeptides,
  surfaceTable, recoveryMatrix, saunaBenefits, weatherBands, mindConflicts,
  mindReframes, couchProgram, preStartChecklist, runonBadges, integrationMap,
  uniqueMetrics,
} from "@/data/runonExpertData";
import {
  cadenceTarget, impactMath, recommendShoe, shoeWear, hrvReadiness,
  weatherAdvice, dualRpe, tendonLoad, toNum,
} from "@/lib/runonExpert";

/* ─────────── helpers ─────────── */
function useAthlete() {
  return useMemo(() => {
    const p = loadProfile();
    return {
      peso: toNum(p?.peso, 90) || 90,
      altura: toNum(p?.altura, 178) || 178,
      nivel: p?.nivelCorrida || "Iniciante",
      nome: p?.nome || "Atleta",
    };
  }, []);
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className="py-3" style={{ borderBottom: last ? "none" : `1px solid ${RC.bg2}` }}>
      {children}
    </div>
  );
}

function Slider({
  label, value, min, max, step = 1, unit, onChange, color = RC.cyan,
}: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (v: number) => void; color?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span style={mono(7, RC.mutedDark, 2)}>{label}</span>
        <span style={raj(16, 700, color)}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2"
        style={{ accentColor: color }}
      />
    </div>
  );
}

function Note({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: RC.bg2, padding: "12px 16px", borderRadius: 6 }}>
      <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

/* ─────────── 1. STRIDE LAB ─────────── */
export function StrideLabTab() {
  const a = useAthlete();
  const [peso, setPeso] = useState(Math.round(a.peso));
  const [altura, setAltura] = useState(Math.round(a.altura));
  const cad = cadenceTarget(peso, altura, a.nivel);
  const imp = impactMath(peso);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <SectionCard label="ANÁLISE DE CADÊNCIA INTELIGENTE" icon={Gauge}>
        <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6, marginBottom: 16 }}>
          O bodybuilder não corre como um corredor leve: massa de coxa e glúteo altera a mecânica de quadril,
          o centro de gravidade é mais alto e a passada tende a ser longa e pesada. A cadência-alvo do RunON é
          calculada para o seu corpo — não para um corredor de 65 kg.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Slider label="PESO CORPORAL" value={peso} min={60} max={140} unit=" kg" onChange={setPeso} />
          <Slider label="ALTURA" value={altura} min={150} max={210} unit=" cm" onChange={setAltura} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <StatCard label="CADÊNCIA ALVO" value={`${cad.target} spm`} />
          <StatCard label="FAIXA ÚTIL" value={`${cad.range[0]}–${cad.range[1]}`} />
          <StatCard label="ESTIMATIVA ATUAL" value={`${cad.current} spm`} color={RC.orange} />
          <StatCard label="GANHO SUGERIDO" value={`+${cad.gainPct}%`} color={RC.green} />
        </div>
        <div className="mt-4">
          <Note color={RC.cyan}>{cad.note}</Note>
        </div>
      </SectionCard>

      <SectionCard label="CARGA MECÂNICA POR PASSADA" icon={Scale}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="IMPACTO / PASSADA" value={`${imp.perStride} kg`} color={RC.orange} />
          <StatCard label="PASSADAS EM 5 KM" value={`${imp.strides5k}`} />
          <StatCard label="TOTAL EM 5 KM" value={`${imp.tons5k} t`} color={RC.red} />
          <StatCard label="VS ATLETA 70 KG" value={`+${imp.vsLight}%`} color={RC.red} />
        </div>
        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginTop: 14 }}>
          É por isso que progressão lenta é obrigatória, tênis adequado é não-negociável e superfície macia é preferida.
        </p>
      </SectionCard>

      <SectionCard label="DRILLS PARA ATLETA MUSCULOSO" icon={Footprints}>
        {bodybuilderDrills.map((d, i) => (
          <Row key={d.name} last={i === bodybuilderDrills.length - 1}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 700, color: RC.white }}>{d.name}</p>
                <p style={{ ...mono(7, RC.cyan, 1), marginTop: 3 }}>{d.prescription}</p>
                <p style={{ fontSize: 11.5, color: "#555", lineHeight: 1.5, marginTop: 5 }}>{d.why}</p>
              </div>
              <RBadge color={RC.purple}>{d.focus}</RBadge>
            </div>
          </Row>
        ))}
      </SectionCard>

      <SectionCard label="CHECKLIST BIOMECÂNICO — APEX VISUAL" icon={Camera}>
        {strideChecks.map((c, i) => (
          <Row key={c.name} last={i === strideChecks.length - 1}>
            <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{c.name}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
              <span style={{ fontSize: 11.5, color: RC.green }}>✓ {c.ideal}</span>
              <span style={{ fontSize: 11.5, color: RC.red }}>✕ {c.risk}</span>
            </div>
          </Row>
        ))}
        <button
          onClick={() => navigate("/coach/apex-visual")}
          className="w-full mt-4"
          style={{
            ...mono(8, RC.cyan, 2), border: `1px solid ${RC.cyanBorder}`,
            background: RC.cyanDim, padding: 12, borderRadius: 8,
          }}
        >
          ABRIR APEX VISUAL INTELLIGENCE →
        </button>
      </SectionCard>
    </div>
  );
}

/* ─────────── 2. SHOE SELECTOR ─────────── */
export function ShoeTab() {
  const a = useAthlete();
  const [peso, setPeso] = useState(Math.round(a.peso));
  const [km, setKm] = useState(180);
  const rec = recommendShoe(peso);
  const wear = shoeWear(peso, km);

  return (
    <div className="space-y-4">
      <SectionCard label="SHOE SELECTOR — RECOMENDAÇÃO POR PESO" icon={ShoppingBag}>
        <Slider label="PESO CORPORAL" value={peso} min={60} max={140} unit=" kg" onChange={setPeso} />
        <div
          className="mt-5"
          style={{ background: `${rec.color}0a`, border: `1px solid ${rec.color}33`, borderRadius: 10, padding: 18 }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p style={mono(7, rec.color, 3)}>SEU TIER</p>
              <p style={{ ...raj(24, 800, RC.white), marginTop: 4 }}>{rec.type}</p>
            </div>
            <RBadge color={rec.color}>{rec.range}</RBadge>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {rec.models.map((m) => (
              <span key={m} style={{ ...mono(8, RC.white, 1), textTransform: "none", background: RC.bg2, border: `1px solid ${RC.border}`, padding: "6px 12px", borderRadius: 6 }}>
                {m}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: RC.muted, marginTop: 12, lineHeight: 1.6 }}>{rec.why}</p>
        </div>
      </SectionCard>

      <SectionCard label="ALERTA DE DESGASTE" icon={Timer}>
        <Slider label="KM ACUMULADOS NO PAR ATUAL" value={km} min={0} max={800} step={10} unit=" km" color={wear.color} onChange={setKm} />
        <div className="grid grid-cols-3 gap-3 mt-4">
          <StatCard label="VIDA ÚTIL" value={`${wear.limitKm} km`} />
          <StatCard label="CONSUMIDO" value={`${wear.usedPct}%`} color={wear.color} />
          <StatCard label="AMORTECIMENTO PERDIDO" value={`${wear.lostCushionPct}%`} color={wear.color} />
        </div>
        <div className="mt-4">
          <Note color={wear.color}>{wear.message}</Note>
        </div>
      </SectionCard>

      <SectionCard label="TABELA COMPLETA 2026" icon={ShoppingBag}>
        {shoeTiers.map((t, i) => (
          <Row key={t.id} last={i === shoeTiers.length - 1}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 700, color: t.color }}>{t.type}</p>
                <p style={{ fontSize: 12, color: RC.white, marginTop: 3 }}>{t.models.join(" · ")}</p>
                <p style={{ fontSize: 11.5, color: "#555", marginTop: 4, lineHeight: 1.5 }}>{t.why}</p>
              </div>
              <RBadge color={t.color}>{t.range}</RBadge>
            </div>
          </Row>
        ))}
      </SectionCard>

      <SectionCard label="REGRAS PARA O BODYBUILDER" icon={AlertTriangle} color={RC.orange}>
        {shoeRules.map((r, i) => (
          <div key={r} className="flex gap-2 py-2" style={{ borderBottom: i < shoeRules.length - 1 ? `1px solid ${RC.bg2}` : "none" }}>
            <span style={{ color: RC.orange, fontSize: 12 }}>→</span>
            <span style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.5 }}>{r}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── 3. HRV READINESS ─────────── */
export function HrvTab() {
  const [hrv, setHrv] = useState(58);
  const [baseline, setBaseline] = useState(65);
  const [sd, setSd] = useState(8);
  const [dias, setDias] = useState(1);
  const r = hrvReadiness(hrv, baseline, sd, dias);

  return (
    <div className="space-y-4">
      <SectionCard label="READINESS SCORE — HRV GUIDED" icon={HeartPulse} color={r.color}>
        <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6, marginBottom: 16 }}>
          O atleta híbrido estressa dois sistemas ao mesmo tempo. A variabilidade da frequência cardíaca revela
          se o sistema nervoso autônomo está parassimpático (recuperado) ou simpático (em overreaching) — antes de você sentir.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Slider label="HRV DE HOJE (ms)" value={hrv} min={15} max={140} unit="" color={r.color} onChange={setHrv} />
          <Slider label="BASELINE (média 30d)" value={baseline} min={15} max={140} unit="" onChange={setBaseline} />
          <Slider label="DESVIO PADRÃO" value={sd} min={1} max={25} unit="" onChange={setSd} />
          <Slider label="DIAS ABAIXO DA BASELINE" value={dias} min={0} max={7} unit=" d" color={RC.orange} onChange={setDias} />
        </div>

        <div
          className="mt-5"
          style={{ background: `${r.color}0a`, border: `1px solid ${r.color}44`, borderRadius: 10, padding: 20 }}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-full animate-pulse" style={{ width: 14, height: 14, background: r.color, display: "inline-block" }} />
            <p style={raj(30, 900, r.color)}>{r.level}</p>
            <RBadge color={r.color}>z = {r.z}</RBadge>
          </div>
          <p style={{ ...raj(18, 700, RC.white), marginTop: 10 }}>{r.headline}</p>
          <p style={{ fontSize: 13, color: RC.muted, lineHeight: 1.6, marginTop: 6 }}>{r.action}</p>
        </div>
      </SectionCard>

      <SectionCard label="LÓGICA DE DECISÃO" icon={Activity}>
        {[
          { l: "VERDE", c: "#22c55e", t: "HRV > baseline + 1 DP → sessão intensa liberada (peso pesado + tempo/intervalado)." },
          { l: "AMARELO", c: "#eab308", t: "HRV dentro de ±1 DP → seguir programação padrão." },
          { l: "LARANJA", c: "#f97316", t: "HRV < baseline − 1 DP por 1 dia → corrida vira caminhada/LISS leve, cargas reduzidas." },
          { l: "VERMELHO", c: "#ef4444", t: "HRV < baseline − 1 DP por 3+ dias → cancelar corrida, −30% de volume de peso, foco em recuperação." },
        ].map((x, i, arr) => (
          <Row key={x.l} last={i === arr.length - 1}>
            <div className="flex items-start gap-3">
              <RBadge color={x.c}>{x.l}</RBadge>
              <span style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.55 }}>{x.t}</span>
            </div>
          </Row>
        ))}
        <div className="mt-4">
          <Note color={RC.purple}>
            Atleta em AAS tende a ter baseline de HRV deslocada — o sistema compara sempre contra a sua própria
            média móvel, nunca contra normas populacionais.
          </Note>
        </div>
      </SectionCard>

      <SectionCard label="WEARABLES COMPATÍVEIS" icon={Gauge}>
        <div className="grid grid-cols-2 gap-3">
          {hrvWearables.map((w) => <StatCard key={w.name} label={w.name} value={w.metric} />)}
        </div>
      </SectionCard>
    </div>
  );
}

/* ─────────── 4. FLOW LOCK (BFR) ─────────── */
export function BfrTab() {
  const [open, setOpen] = useState(bfrProtocols[0].id);
  return (
    <div className="space-y-4">
      <SectionCard label="FLOW LOCK — BLOOD FLOW RESTRICTION" icon={Lock} color={RC.purple}>
        <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6 }}>
          A ferramenta mais subutilizada do atleta híbrido: hipertrofia de pernas em dias de cardio leve,
          <span style={{ color: RC.purple }}> sem impacto de corrida e sem carga pesada adicional</span>.
        </p>
        <div className="mt-4 space-y-2">
          {bfrEvidence.map((e) => (
            <div key={e} className="flex gap-2">
              <CheckCircle2 style={{ width: 14, height: 14, color: RC.green, flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: RC.muted, lineHeight: 1.5 }}>{e}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {bfrProtocols.map((p) => (
          <Chip key={p.id} active={p.id === open} color={p.color} onClick={() => setOpen(p.id)}>{p.name}</Chip>
        ))}
      </div>

      {bfrProtocols.filter((p) => p.id === open).map((p) => (
        <SectionCard key={p.id} accent={p.color}>
          <div className="flex items-start gap-3">
            <IconBox icon={Lock} color={p.color} size={44} iconSize={20} />
            <div className="flex-1 min-w-0">
              <p style={raj(20, 800, p.color)}>{p.name}</p>
              <p style={mono(7, RC.mutedDark, 1)}>{p.when}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <StatCard label="PRESSÃO" value={p.pressure} color={p.color} />
            <StatCard label="ESQUEMA" value={p.scheme} color={p.color} />
          </div>
          <div className="mt-4"><Note color={p.color}>{p.detail}</Note></div>
        </SectionCard>
      ))}

      <SectionCard label="SCHEDULING NO RUNON" icon={Activity}>
        {bfrScheduling.map((s, i) => (
          <Row key={s.day} last={i === bfrScheduling.length - 1}>
            <div className="flex items-start gap-3">
              {s.ok
                ? <CheckCircle2 style={{ width: 16, height: 16, color: RC.green, flexShrink: 0, marginTop: 2 }} />
                : <XCircle style={{ width: 16, height: 16, color: RC.red, flexShrink: 0, marginTop: 2 }} />}
              <div className="min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{s.day}</p>
                <p style={{ fontSize: 12, color: s.ok ? RC.green : RC.red, marginTop: 2 }}>{s.rule}</p>
                <p style={{ fontSize: 11.5, color: "#555", marginTop: 2 }}>{s.note}</p>
              </div>
            </div>
          </Row>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── 5. JOINT SHIELD ─────────── */
export function JointTab() {
  const a = useAthlete();
  const [peso, setPeso] = useState(Math.round(a.peso));
  const [kmSemana, setKmSemana] = useState(20);
  const [superficie, setSuperficie] = useState(1);
  const [shoePct, setShoePct] = useState(40);
  const imp = impactMath(peso);
  const tls = tendonLoad(peso, kmSemana, superficie, shoePct);

  const surfaceOptions = [
    { label: "GRAMA/TERRA", v: 0.7 }, { label: "ESTEIRA", v: 0.85 },
    { label: "ASFALTO", v: 1 }, { label: "CONCRETO", v: 1.25 },
  ];

  return (
    <div className="space-y-4">
      <SectionCard label="CALCULADORA DE IMPACTO ARTICULAR" icon={ShieldPlus} color={RC.orange}>
        <Slider label="PESO CORPORAL" value={peso} min={60} max={140} unit=" kg" color={RC.orange} onChange={setPeso} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <StatCard label="POR PASSADA" value={`${imp.perStride} kg`} color={RC.orange} />
          <StatCard label="PASSADAS 5 KM" value={`${imp.strides5k}`} />
          <StatCard label="TOTAL 5 KM" value={`${imp.tons5k} t`} color={RC.red} />
          <StatCard label="TOTAL 10 KM" value={`${imp.tons10k} t`} color={RC.red} />
        </div>
      </SectionCard>

      <SectionCard label="TENDON LOAD SCORE" icon={Activity} color={tls.color}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Slider label="VOLUME SEMANAL" value={kmSemana} min={0} max={80} unit=" km" color={tls.color} onChange={setKmSemana} />
          <Slider label="DESGASTE DO TÊNIS" value={shoePct} min={0} max={120} step={5} unit="%" color={tls.color} onChange={setShoePct} />
        </div>
        <div className="flex gap-2 flex-wrap mt-4">
          {surfaceOptions.map((o) => (
            <Chip key={o.label} active={superficie === o.v} onClick={() => setSuperficie(o.v)}>{o.label}</Chip>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-5">
          <p style={raj(44, 900, tls.color)}>{tls.score}</p>
          <div>
            <RBadge color={tls.color}>{tls.label}</RBadge>
            <p style={{ fontSize: 12, color: RC.muted, marginTop: 6 }}>Carga acumulada nos tendões (0–10)</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard label="PROTOCOLO DE PROTEÇÃO ARTICULAR" icon={ShieldPlus}>
        {jointSupplements.map((s, i) => (
          <Row key={s.name} last={i === jointSupplements.length - 1}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{s.name}</p>
                <p style={{ fontSize: 11.5, color: "#555", marginTop: 2 }}>{s.goal}</p>
              </div>
              <RBadge color={RC.cyan}>{s.dose}</RBadge>
            </div>
          </Row>
        ))}
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${RC.bg2}` }}>
          <p style={mono(7, RC.purple, 3)}>PEPTÍDEOS COMPLEMENTARES</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {jointPeptides.map((p) => <StatCard key={p.name} label={p.name} value={p.goal} color={RC.purple} />)}
          </div>
        </div>
      </SectionCard>

      <SectionCard label="SELEÇÃO DE SUPERFÍCIE" icon={Route}>
        {surfaceTable.map((s, i) => (
          <Row key={s.surface} last={i === surfaceTable.length - 1}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{s.surface}</p>
                <p style={{ fontSize: 11.5, color: "#555", marginTop: 2 }}>{s.rec}</p>
              </div>
              <RBadge color={s.color}>{s.impact}</RBadge>
            </div>
          </Row>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── 6. RESTORE ENGINE ─────────── */
export function RestoreTab() {
  return (
    <div className="space-y-4">
      <SectionCard label="RESTORE ENGINE — RANKING BASEADO EM EVIDÊNCIA" icon={Sparkles}>
        {recoveryMatrix.map((m, i) => (
          <Row key={m.modality} last={i === recoveryMatrix.length - 1}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{m.modality}</p>
                <p style={{ fontSize: 11.5, color: "#555", marginTop: 2, lineHeight: 1.5 }}>{m.benefit}</p>
                <p style={{ ...mono(7, RC.mutedDark, 1), marginTop: 4 }}>{m.timing}</p>
              </div>
              <RBadge color={m.color}>{m.evidence}</RBadge>
            </div>
          </Row>
        ))}
      </SectionCard>

      <SectionCard label="REGRA CRÍTICA — COLD PLUNGE × HIPERTROFIA" icon={AlertTriangle} color={RC.red}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div style={{ background: "#ef444408", border: "1px solid #ef444433", borderRadius: 8, padding: 16 }}>
            <p style={mono(7, RC.red, 2)}>PÓS-MUSCULAÇÃO</p>
            <p style={{ ...raj(18, 800, RC.red), marginTop: 6 }}>NÃO fazer cold plunge</p>
            <p style={{ fontSize: 12, color: RC.muted, marginTop: 6, lineHeight: 1.5 }}>
              A inflamação pós-treino de peso é sinal necessário para mTOR. O frio corta a adaptação.
            </p>
          </div>
          <div style={{ background: "#22c55e08", border: "1px solid #22c55e33", borderRadius: 8, padding: 16 }}>
            <p style={mono(7, RC.green, 2)}>PÓS-CORRIDA</p>
            <p style={{ ...raj(18, 800, RC.green), marginTop: 6 }}>Cold plunge liberado</p>
            <p style={{ fontSize: 12, color: RC.muted, marginTop: 6, lineHeight: 1.5 }}>
              Reduz dano muscular excêntrico e acelera o retorno para a próxima sessão.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Note color={RC.orange}>
            Sessão dupla no mesmo dia: aguardar 4–6 horas após o treino de peso antes de qualquer imersão fria.
          </Note>
        </div>
      </SectionCard>

      <SectionCard label="SAUNA COMO CARDIO PASSIVO" icon={Thermometer} color={RC.orange}>
        {saunaBenefits.map((b, i) => (
          <div key={b} className="flex gap-2 py-2" style={{ borderBottom: i < saunaBenefits.length - 1 ? `1px solid ${RC.bg2}` : "none" }}>
            <span style={{ color: RC.orange }}>→</span>
            <span style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── 7. WEATHER SHIELD ─────────── */
export function WeatherTab() {
  const a = useAthlete();
  const [temp, setTemp] = useState(29);
  const [umid, setUmid] = useState(78);
  const w = weatherAdvice(temp, umid, a.peso);

  return (
    <div className="space-y-4">
      <SectionCard label="WEATHER SHIELD — AJUSTE POR CLIMA" icon={CloudSun} color={w.color}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Slider label="TEMPERATURA" value={temp} min={5} max={45} unit=" °C" color={w.color} onChange={setTemp} />
          <Slider label="UMIDADE RELATIVA" value={umid} min={10} max={100} unit="%" color={w.color} onChange={setUmid} />
        </div>
        <div
          className="mt-5"
          style={{ background: `${w.color}0a`, border: `1px solid ${w.color}44`, borderRadius: 10, padding: 20 }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <p style={raj(28, 900, w.color)}>{w.band}</p>
            <RBadge color={w.color}>ÍNDICE {w.heatIndex}</RBadge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <StatCard label="PACE" value={w.paceAdj} color={w.color} />
            <StatCard label="VOLUME" value={w.volumeAdj} color={w.color} />
            <StatCard label="HIDRATAÇÃO" value={w.hydration} color={w.color} />
          </div>
          <p style={{ fontSize: 13, color: RC.muted, lineHeight: 1.6, marginTop: 14 }}>{w.action}</p>
        </div>
        <div className="mt-4">
          <Note color={RC.purple}>
            Mais massa = mais produção de calor metabólico e menor superfície relativa para dissipação.
            O ajuste do RunON considera o seu peso ({Math.round(a.peso)} kg) no índice de calor.
          </Note>
        </div>
      </SectionCard>

      <SectionCard label="FAIXAS DE DECISÃO" icon={Droplets}>
        {weatherBands.map((b, i) => (
          <Row key={b.id} last={i === weatherBands.length - 1}>
            <div className="flex items-start gap-3">
              <RBadge color={b.color}>{b.label}</RBadge>
              <div className="min-w-0">
                <p style={{ ...mono(7, RC.mutedDark, 1) }}>{b.cond}</p>
                <p style={{ fontSize: 12.5, color: RC.muted, marginTop: 4, lineHeight: 1.5 }}>{b.action}</p>
              </div>
            </div>
          </Row>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── 8. MIND TRACK ─────────── */
export function MindTab() {
  const navigate = useNavigate();
  const [rpeLift, setRpeLift] = useState(8);
  const [rpeRun, setRpeRun] = useState(7);
  const d = dualRpe(rpeLift, rpeRun);

  return (
    <div className="space-y-4">
      <SectionCard label="CONFLITO PSICOLÓGICO DO BODYBUILDER QUE CORRE" icon={Brain} color={RC.purple}>
        {mindConflicts.map((c, i) => (
          <div key={c} className="flex gap-2 py-2" style={{ borderBottom: i < mindConflicts.length - 1 ? `1px solid ${RC.bg2}` : "none" }}>
            <span style={{ color: RC.purple }}>•</span>
            <span style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.5 }}>{c}</span>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="REFRAMES — MCE METHOD" icon={Sparkles} color={RC.purple}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mindReframes.map((m) => (
            <div key={m.title} style={{ background: RC.bg2, border: `1px solid ${RC.purpleBorder}`, borderRadius: 10, padding: 16 }}>
              <p style={raj(16, 800, RC.purple)}>{m.title}</p>
              <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6, marginTop: 8 }}>{m.body}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/mce")}
          className="w-full mt-4"
          style={{ ...mono(8, RC.purple, 2), border: `1px solid ${RC.purpleBorder}`, background: RC.purpleDim, padding: 12, borderRadius: 8 }}
        >
          ABRIR MCE INTELLIGENCE →
        </button>
      </SectionCard>

      <SectionCard label="RPE DUAL SYSTEM" icon={Gauge} color={d.color}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Slider label="RPE MUSCULAÇÃO" value={rpeLift} min={1} max={10} unit="/10" color={d.color} onChange={setRpeLift} />
          <Slider label="RPE CORRIDA" value={rpeRun} min={1} max={10} unit="/10" color={d.color} onChange={setRpeRun} />
        </div>
        <div className="flex items-center gap-4 mt-5">
          <p style={raj(44, 900, d.color)}>{d.total}</p>
          <div>
            <RBadge color={d.color}>{d.label}</RBadge>
            <p style={{ fontSize: 12.5, color: RC.muted, marginTop: 6, lineHeight: 1.5 }}>{d.message}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─────────── 9. COUCH TO RUN ON ─────────── */
export function CouchTab() {
  const [done, setDone] = useState<Record<number, boolean>>({});
  return (
    <div className="space-y-4">
      <SectionCard label="COUCH TO RUN ON — 12 SEMANAS" icon={Rocket}>
        <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6, marginBottom: 16 }}>
          Sair correndo 5 km no primeiro dia com 90–100 kg é receita para lesão de joelho, Aquiles ou fascíite plantar.
          Esta é a rampa de adaptação obrigatória antes da programação completa do RunON.
        </p>
        {couchProgram.map((w, i) => (
          <div
            key={w.weeks}
            className="flex items-start gap-3 py-3"
            style={{ borderBottom: i < couchProgram.length - 1 ? `1px solid ${RC.bg2}` : "none" }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 40, height: 40, borderRadius: 6, background: `${w.color}12`, border: `1px solid ${w.color}33`, ...raj(14, 800, w.color) }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p style={raj(15, 800, w.color)}>{w.phase}</p>
                <RBadge color={w.color}>{w.weeks}</RBadge>
              </div>
              <p style={{ fontSize: 12.5, color: RC.white, marginTop: 4 }}>{w.session}</p>
              <p style={{ fontSize: 11.5, color: "#555", marginTop: 2 }}>{w.goal}</p>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard label="CHECKLIST PRÉ-INÍCIO" icon={CheckCircle2} color={RC.green}>
        {preStartChecklist.map((c, i) => (
          <button
            key={c}
            onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
            className="w-full flex items-start gap-3 py-3 text-left"
            style={{ borderBottom: i < preStartChecklist.length - 1 ? `1px solid ${RC.bg2}` : "none" }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 18, height: 18, borderRadius: 4, marginTop: 1,
                border: `1px solid ${done[i] ? RC.green : RC.border}`,
                background: done[i] ? `${RC.green}22` : "transparent",
              }}
            >
              {done[i] && <CheckCircle2 style={{ width: 12, height: 12, color: RC.green }} />}
            </div>
            <span style={{ fontSize: 12.5, color: done[i] ? RC.green : RC.muted, lineHeight: 1.5 }}>{c}</span>
          </button>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── 10. RANKS ─────────── */
export function RanksTab() {
  return (
    <div className="space-y-4">
      <SectionCard label="RUN ON RANKS — ACHIEVEMENTS" icon={Trophy} color={RC.gold}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {runonBadges.map((b) => (
            <div key={b.name} style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 10, padding: 16 }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 26 }}>{b.icon}</span>
                <div className="min-w-0">
                  <p style={raj(16, 800, RC.gold)}>{b.name}</p>
                  <p style={{ ...mono(7, RC.mutedDark, 1) }}>{b.meaning}</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: RC.muted, marginTop: 10, lineHeight: 1.5 }}>{b.req}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard label="LEADERBOARD POR FAIXA DE PESO" icon={TrendingUp}>
        <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6 }}>
          Ranking justo: km/semana, evolução de pace e circunferência de coxa mantida — sempre comparando
          atletas da mesma faixa de peso. 95 kg compete com 95 kg.
        </p>
        <div className="mt-4">
          <RBadge color={RC.mutedDark}>EM BREVE · COMUNIDADE HYBRID</RBadge>
        </div>
      </SectionCard>

      <SectionCard label="MÉTRICAS ÚNICAS DO RUNON" icon={Activity}>
        {uniqueMetrics.map((m, i) => (
          <Row key={m.code} last={i === uniqueMetrics.length - 1}>
            <div className="flex items-start gap-3">
              <RBadge color={RC.cyan}>{m.code}</RBadge>
              <div className="min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: RC.white }}>{m.name}</p>
                <p style={{ fontSize: 11.5, color: "#555", marginTop: 3, lineHeight: 1.5 }}>{m.desc}</p>
              </div>
            </div>
          </Row>
        ))}
      </SectionCard>
    </div>
  );
}

/* ─────────── 11. INTEGRAÇÕES ─────────── */
export function IntegrationsTab() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <SectionCard label="MAPA DE INTEGRAÇÕES NUTRION" icon={Network}>
        <p style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.6, marginBottom: 8 }}>
          O RunON não é um módulo de corrida nem de musculação. É o sistema de integração completa para o
          atleta que se recusa a escolher entre ser forte e ser funcional.
        </p>
      </SectionCard>

      {integrationMap.map((m) => (
        <SectionCard key={m.module} accent={RC.cyan}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p style={raj(18, 800, RC.white)}>
              RUN<span style={{ color: RC.cyan }}>ON</span> ←→ {m.module}
            </p>
            <button
              onClick={() => navigate(m.route)}
              style={{ ...mono(7, RC.cyan, 2), border: `1px solid ${RC.cyanBorder}`, borderRadius: 4, padding: "5px 12px" }}
            >
              ABRIR →
            </button>
          </div>
          <div className="mt-3">
            {m.points.map((p) => (
              <div key={p} className="flex gap-2 py-1.5">
                <span style={{ color: RC.cyan }}>•</span>
                <span style={{ fontSize: 12.5, color: RC.muted, lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
