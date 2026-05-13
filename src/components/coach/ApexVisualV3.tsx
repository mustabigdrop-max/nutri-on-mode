import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

// ─── PALETA APEX v3 ───────────────────────────────────────────────
const C = {
  void: "#04050A", deep: "#080B12", surface: "#0C1018",
  card: "#101520", cardHi: "#141A26",
  border: "#1C2333", borderHi: "#28344A",
  apex: "#00E5FF", apexDim: "#00E5FF22", apexGlow: "#00E5FF44",
  gold: "#FFB800", goldDim: "#FFB80022",
  green: "#00E676", greenDim: "#00E67622",
  amber: "#FFB300",
  red: "#FF3D57", redDim: "#FF3D5722",
  purple: "#7C4DFF", purpleDim: "#7C4DFF22",
  pink: "#FF4081", pinkDim: "#FF408122",
  text: "#F0F4FF", textSec: "#5A6A88", textDim: "#2A3348",
};

type Cat = { l: string; i: string; g: "M" | "F"; c: string; ideal: string; pts: string[] };
const CATS: Record<string, Cat> = {
  mens_physique:    { l:"Men's Physique",   i:"🏄", g:"M", c:C.apex,   ideal:"Shape atlético, cintura estreita, ombros largos, condicionamento sem estriação excessiva.", pts:["deltoide lateral","inserção lat","cintura","abdômen"] },
  classic_physique: { l:"Classic Physique", i:"🏛", g:"M", c:C.gold,   ideal:"Golden Era — Zane, Reeves. Cintura tiny, ombros e peitoral dominantes, proporção peso/altura.", pts:["proporção peso/altura","cintura","peitoral","simetria"] },
  bodybuilding:     { l:"Bodybuilding",     i:"💪", g:"M", c:C.red,    ideal:"Máximo tamanho + máximo condicionamento. Sem pontos fracos.", pts:["quadríceps","panturrilha","dorsal inferior","condicionamento"] },
  bikini:           { l:"Bikini",           i:"👙", g:"F", c:C.pink,   ideal:"Glúteos centrais, cintura estreita, fitness saudável com feminilidade.", pts:["glúteos","cintura","proporção","condicionamento moderado"] },
  wellness:         { l:"Wellness",         i:"🌸", g:"F", c:C.purple, ideal:"MMII dominantes. Glúteos e pernas em destaque. Contraste cintura-quadril máximo.", pts:["glúteos","coxas posteriores","contraste cintura-quadril"] },
  figure:           { l:"Figure",           i:"⚡", g:"F", c:C.green,  ideal:"Forma X perfeita. Músculo visível com feminilidade.", pts:["ombros","simetria topo-base","definição","cintura"] },
  womens_physique:  { l:"Women's Physique", i:"🔥", g:"F", c:C.amber,  ideal:"Máximo desenvolvimento mantendo forma feminina.", pts:["separação","condicionamento","dorsais","simetria"] },
};

type Athlete = { nome: string; idade: string; peso: string; altura: string; semanas: string; fase: string };
type Protocol = { compostos: string; objetivo: string; semana: string; duracao: string; suporte: string; faseCorpo: string; pesoAtual: string; pesoPico: string };

// ─── SYSTEM PROMPT MASTER ─────────────────────────────────────────
const buildSystem = (cat: Cat, athlete: Athlete, protocol: Protocol) => `Você é o APEX Visual Intelligence v3 — o sistema de análise mais avançado para atletas de fisiculturismo enhanced e natty.

Você é simultaneamente:
▸ Juiz IFBB com 20+ anos de experiência
▸ Coach master visual (Hany Rambod, Neil Hill, Chad Nicholls, Miloš Sarcev)
▸ Especialista em biomecânica e correção postural (Joe Bennett, Eric Cressey)
▸ Químico/farmacologista esportivo (William Llewellyn, Trevor Kouritzin, Dr. Michael Scally)
▸ Nutricionista de alto rendimento integrado à farmacologia

ATLETA: ${athlete.nome || "não informado"} | ${athlete.idade ? athlete.idade + " anos" : ""} | ${athlete.peso ? athlete.peso + "kg" : ""} | ${athlete.altura ? athlete.altura + "cm" : ""}
CATEGORIA: ${cat.l} | ${cat.g === "M" ? "Masculino" : "Feminino"}
IDEAL: ${cat.ideal}
PONTOS CRÍTICOS: ${cat.pts.join(" | ")}
SEMANAS PARA O SHOW: ${athlete.semanas || "não informado"}
FASE ATUAL: ${athlete.fase || "não informada"}

${protocol.compostos ? `
━━━ PROTOCOLO FARMACOLÓGICO ATIVO ━━━
Compostos: ${protocol.compostos}
Objetivo do ciclo: ${protocol.objetivo || "não informado"}
Semana do ciclo: ${protocol.semana || "não informada"} de ${protocol.duracao || "?"} semanas
Suporte: ${protocol.suporte || "não informado"}
Fase corporal: ${protocol.faseCorpo || "não informada"} ${protocol.pesoAtual && protocol.pesoPico ? `(${protocol.pesoAtual}kg atual / ${protocol.pesoPico}kg pico bulk)` : ""}

INSTRUÇÃO CRÍTICA: toda análise contextualizada pelo protocolo. Cada seção considera como os compostos afetam shape, velocidade de resposta, retenção, dureza.
` : "Nenhum protocolo informado — análise como atleta natural."}

━━━ PROTOCOLO DE ANÁLISE APEX v3 ━━━
Tom: técnico, direto, sem alarmismo. Cada prescrição com mecanismo fisiológico.

Use EXATAMENTE estes headers:

## IMPACTO_VISUAL
[O que as fotos comunicam em 3 segundos como juiz IFBB]

## SCORES_SEGMENTOS
[SEGMENTO: X/10 — diagnóstico em 1 linha. Para cada grupo muscular visível.]

## COMPOSICAO_CORPORAL
BF_ESTIMADO: XX%
BF_META: XX%
MASSA_MAGRA_EST: XXkg
SEMANAS_META: X
VEREDICTO_FASE: [continuar_bulk | reduzir_bulk | iniciar_cutting | aprofundar_cutting | manter | peak_week]
[Análise detalhada. ${protocol.compostos ? "Diferenciar gordura real vs retenção dos compostos." : ""}]

## DECISAO_MANOBRA
MANOBRA_PRINCIPAL: [nome]
URGENCIA: [imediata | proxima_semana | proximas_2_semanas | sem_pressa]
[Manobras A/B/C/D com ajustes calóricos, cardio, transição de protocolo.]

## POSTURA_DESVIOS
[Desvios visíveis: dominante vs inibido + impacto no palco]

## CORRECOES_POSTURAIS
[Para cada desvio: a) Alongamento b) Ativação c) Cue de palco]

## PONTOS_FRACOS_PROTOCOLO
[Para cada grupo fraco: diagnóstico + 3 exercícios (ativação/sobrecarga/pump) + frequência + tempo de resposta${protocol.compostos ? " + impacto dos compostos" : ""}]

## FARMACOLOGIA_INTEGRADA
${protocol.compostos ? `[COMPOSTOS_ATIVOS, SINERGIA_STACK, O_QUE_ESTA_FAZENDO, O_QUE_NAO_RESOLVE, PROXIMO_NIVEL, FITOTERÁPICOS_PROBIÓTICOS, TDEE_FATOR: X.XX, PROTEINA_IDEAL: Xg/kg, CHO_ESTRATEGIA, GESTAO_E2, ALERTA_CARDIOVASCULAR, RECUPERACAO_EIXO, EXAMES_PRIORITARIOS]` : "[Sem protocolo — análise natty]"}

## NUTRICAO_FASE
[Calorias, macros, timing, alimentos estratégicos para a fase]

## GANHA_PONTOS
[Máx 4 — o que vai pontuar]

## PERDE_PONTOS
[Máx 4 — o que vai perder pontos]

## PLANO_ATAQUE
PRIORIDADE_1: [grupo + prescrição]
PRIORIDADE_2: [grupo + prescrição]
PRIORIDADE_3: [grupo + prescrição]

## POSING_CORRETIVO
[Cues por pose mandatória — compensar fraquezas + vender pontos fortes]

## VEREDICTO
[3 frases — o que falta para top 5. Resolvível agora vs requer tempo.]`;

// ─── HELPERS ─────────────────────────────────────────────────────
const toB64 = (f: File): Promise<string> => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res((r.result as string).split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(f);
});

const secParse = (t: string, k: string, n: string | null) => {
  const p = n ? new RegExp(`##\\s*${k}([\\s\\S]*?)##\\s*${n}`, "i") : new RegExp(`##\\s*${k}([\\s\\S]*)`, "i");
  return t.match(p)?.[1]?.trim() || "";
};

const parseSegs = (t: string) => {
  const b = secParse(t, "SCORES_SEGMENTOS", "COMPOSICAO_CORPORAL");
  return b.split("\n").map(l => l.trim()).filter(l => l.includes(":") && l.includes("/10")).map(l => {
    const [a, b2] = l.split(":");
    const s = parseInt(b2?.match(/(\d+)\/10/)?.[1] || "0");
    const d = b2?.replace(/\d+\/10/, "").replace(/^[\s—\-]+/, "").trim() || "";
    return { label: a.trim(), score: s, diag: d };
  }).filter(s => s.label && s.score > 0);
};

const parseMeta = (t: string) => ({
  bfEst: t.match(/BF_ESTIMADO:\s*([\d.]+)/i)?.[1],
  bfMeta: t.match(/BF_META:\s*([\d.]+)/i)?.[1],
  massaMagra: t.match(/MASSA_MAGRA_EST:\s*([\d.]+)/i)?.[1],
  semMeta: t.match(/SEMANAS_META:\s*(\d+)/i)?.[1],
  veredictoFase: t.match(/VEREDICTO_FASE:\s*([^\n]+)/i)?.[1]?.trim(),
  manobraPrincipal: t.match(/MANOBRA_PRINCIPAL:\s*([^\n]+)/i)?.[1]?.trim(),
  urgencia: t.match(/URGENCIA:\s*([^\n]+)/i)?.[1]?.trim(),
  tdeeFator: t.match(/TDEE_FATOR:\s*([\d.]+)/i)?.[1],
  proteinaIdeal: t.match(/PROTEINA_IDEAL:\s*([^\n]+)/i)?.[1],
  gestaoE2: t.match(/GESTAO_E2:\s*([^\n]+)/i)?.[1],
  alertaCardio: t.match(/ALERTA_CARDIOVASCULAR:\s*([^\n]+)/i)?.[1],
  p1: t.match(/PRIORIDADE_1:\s*([^\n]+)/i)?.[1],
  p2: t.match(/PRIORIDADE_2:\s*([^\n]+)/i)?.[1],
  p3: t.match(/PRIORIDADE_3:\s*([^\n]+)/i)?.[1],
});

const scCol = (v: number) => v >= 8 ? C.green : v >= 6 ? C.amber : v >= 4 ? "#FF8C00" : C.red;
const scLbl = (v: number) => v >= 8 ? "Elite" : v >= 6 ? "Bom" : v >= 4 ? "Regular" : "Crítico";

const FASE_CONFIG: Record<string, { label: string; col: string; icon: string; desc: string }> = {
  continuar_bulk:     { label:"Continuar Bulk",    col:C.green, icon:"📈", desc:"Shape evoluindo bem. Manter protocolo atual." },
  reduzir_bulk:       { label:"Reduzir Bulk",      col:C.amber, icon:"⚠️", desc:"BF acumulando. Reduzir surplus e adicionar cardio." },
  iniciar_cutting:    { label:"Iniciar Cutting",   col:C.red,   icon:"🔥", desc:"Hora de virar. Ajustar protocolo e dieta." },
  aprofundar_cutting: { label:"Aprofundar Cutting",col:C.red,   icon:"💧", desc:"Intensificar déficit. Cardio obrigatório." },
  manter:             { label:"Manutenção",        col:C.apex,  icon:"⚖️", desc:"Shape estável. Refinar sem perder massa." },
  peak_week:          { label:"Peak Week",         col:C.gold,  icon:"🏆", desc:"Protocolo de palco ativado." },
};

const URGENCIA_CONFIG: Record<string, { col: string; label: string }> = {
  imediata:           { col:C.red,   label:"Ação imediata" },
  proxima_semana:     { col:C.amber, label:"Esta semana" },
  proximas_2_semanas: { col:C.apex,  label:"Nas próximas 2 semanas" },
  sem_pressa:         { col:C.green, label:"Sem urgência" },
};

const inputStyle: React.CSSProperties = { width:"100%", padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border .2s" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor:"pointer" };

// ─── DROPZONE ────────────────────────────────────────────────────
function DropZone({ angle, file, onFile, onClear }: { angle: string; file: File | null; onFile: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const prev = file ? URL.createObjectURL(file) : null;
  return (
    <div>
      <div style={{ fontSize:10, color:C.textSec, marginBottom:6, letterSpacing:".1em", textTransform:"uppercase" }}>{angle}</div>
      <div
        onClick={() => !file && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }}
        style={{ height:160, borderRadius:12, position:"relative", overflow:"hidden", border:`1.5px dashed ${drag?C.apex:file?C.green:C.border}`, background:file?"transparent":C.card, cursor:file?"default":"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {file && prev ? (
          <>
            <img src={prev} alt={angle} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <button onClick={e => { e.stopPropagation(); onClear(); }} style={{ position:"absolute", top:6, right:6, width:24, height:24, borderRadius:"50%", background:"#000000CC", border:"none", cursor:"pointer", color:"#fff", fontSize:12 }}>✕</button>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"4px 8px", background:"linear-gradient(transparent,#000C)", color:C.green, fontSize:9, fontWeight:600 }}>✓ foto carregada</div>
          </>
        ) : (
          <div style={{ textAlign:"center", color:C.textSec }}>
            <div style={{ fontSize:24, marginBottom:4 }}>◈</div>
            <div style={{ fontSize:10, letterSpacing:".1em" }}>+ FOTO</div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
    </div>
  );
}

// ─── SCORE BAR ───────────────────────────────────────────────────
function ScoreBar({ label, score, diag, hasFarma }: { label: string; score: number; diag: string; hasFarma: boolean }) {
  const col = scCol(score);
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{label}</span>
          {hasFarma && score < 6 && <span style={{ fontSize:8, padding:"2px 6px", borderRadius:4, background:C.purpleDim, color:C.purple, fontWeight:700, letterSpacing:".05em" }}>APEX+FARMA</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:9, color:col, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{scLbl(score)}</span>
          <span style={{ fontSize:13, color:col, fontWeight:800 }}>{score}/10</span>
        </div>
      </div>
      <div style={{ height:6, background:C.card, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${score*10}%`, background:col, transition:"width .6s" }} />
      </div>
      {diag && <div style={{ fontSize:11, color:C.textSec, marginTop:4, fontStyle:"italic" }}>{diag}</div>}
    </div>
  );
}

// ─── MANEUVER CARD ───────────────────────────────────────────────
function ManeuverCard({ manobra, urgencia }: { manobra: string; urgencia: string }) {
  const fc = FASE_CONFIG[manobra] || FASE_CONFIG.manter;
  const uc = URGENCIA_CONFIG[urgencia] || URGENCIA_CONFIG.sem_pressa;
  return (
    <div style={{ background:`linear-gradient(135deg,${fc.col}22,${fc.col}05)`, border:`1.5px solid ${fc.col}55`, borderRadius:14, padding:"14px 18px", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <div style={{ fontSize:32 }}>{fc.icon}</div>
        <div style={{ flex:1, minWidth:180 }}>
          <div style={{ fontSize:14, fontWeight:800, color:fc.col, letterSpacing:".05em" }}>{fc.label}</div>
          <div style={{ fontSize:11, color:C.textSec, marginTop:2 }}>{fc.desc}</div>
        </div>
        <div style={{ padding:"6px 12px", borderRadius:8, background:uc.col+"22", border:`1px solid ${uc.col}55`, fontSize:10, color:uc.col, fontWeight:700, letterSpacing:".05em", textTransform:"uppercase" }}>⚡ {uc.label}</div>
      </div>
    </div>
  );
}

// ─── TIPOGRAFIA · TOKENS ─────────────────────────────────────────
// Escala única para garantir hierarquia consistente em qualquer seção
const T = {
  // tamanhos
  micro: 10,        // labels, chips, hints fortes
  caption: 11,      // legendas, hints, meta
  small: 12,        // controles, pills
  body: 13.5,       // corpo principal — leitura confortável
  bodyStrong: 14,
  h3: 13,           // títulos de panel
  h2: 16,
  h1: 22,
  // line-heights
  lhTight: 1.4,
  lhBody: 1.7,      // texto longo
  lhRelaxed: 1.85,
  // tracking
  trackTitle: ".08em",
  trackLabel: ".1em",
  // largura máxima (~72ch) p/ legibilidade de prosa longa
  proseMaxWidth: 760,
  // espaçamentos verticais
  spXS: 6, spSM: 10, spMD: 14, spLG: 20, spXL: 28,
};

// ─── PROSE TEXT ──────────────────────────────────────────────────
// Wrapper único para todo conteúdo textual longo das seções
function ProseText({ children, tone = "secondary", emphasis = false }: { children: React.ReactNode; tone?: "primary" | "secondary"; emphasis?: boolean }) {
  const color = tone === "primary" ? C.text : C.textSec;
  return (
    <div style={{
      fontSize: T.body,
      color,
      lineHeight: T.lhBody,
      whiteSpace: "pre-wrap",
      maxWidth: T.proseMaxWidth,
      letterSpacing: ".005em",
      fontWeight: emphasis ? 500 : 400,
      wordBreak: "break-word",
    }}>{children}</div>
  );
}

// ─── HINT ────────────────────────────────────────────────────────
// Banner discreto acima do conteúdo, com acento configurável
function Hint({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: T.caption,
      color: C.textSec,
      background: accent + "12",
      border: `1px solid ${accent}33`,
      borderRadius: 8,
      padding: "9px 13px",
      marginBottom: T.spMD,
      lineHeight: T.lhTight,
    }}>{children}</div>
  );
}

// ─── PANEL ───────────────────────────────────────────────────────
function Panel({ icon, title, children, accent = C.apex, defaultOpen = true }: { icon: string; title: string; children: React.ReactNode; accent?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:T.spMD, overflow:"hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"inherit" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:T.h2 }}>{icon}</span>
          <span style={{ fontSize:T.h3, color:accent, fontWeight:700, letterSpacing:T.trackTitle, textTransform:"uppercase" }}>{title}</span>
        </div>
        <span style={{ color:accent, transform:open?"rotate(0)":"rotate(-90deg)", transition:"transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:"0 18px 18px" }}>
          <div style={{ height:1, background:C.border, marginBottom:14 }} />
          {children}
        </div>
      )}
    </div>
  );
}

// ─── LOADING ─────────────────────────────────────────────────────
function Loading({ catColor }: { catColor: string }) {
  const steps = ["Carregando protocolo APEX v3...", "Analisando estrutura corporal...", "Lendo composição corporal...", "Detectando desvios posturais...", "Avaliando pontos fracos...", "Analisando protocolo farmacológico...", "Calculando manobras disponíveis...", "Prescrevendo exercícios corretivos...", "Consultando estratégias de elite...", "Gerando veredicto master..."];
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 900); return () => clearInterval(t); }, []);
  return (
    <div style={{ padding:"40px 20px", textAlign:"center" }}>
      <div style={{ width:80, height:80, margin:"0 auto 20px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, border:`3px solid ${C.border}`, borderTopColor:catColor, borderRadius:"50%", animation:"spin 1s linear infinite" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🔬</div>
      </div>
      <div style={{ fontSize:14, fontWeight:800, color:catColor, letterSpacing:".1em", marginBottom:6 }}>APEX v3 ANALISANDO</div>
      <div style={{ fontSize:11, color:C.textSec, marginBottom:24 }}>Visual + Postura + Farmacologia + Manobras de Elite</div>
      <div style={{ maxWidth:380, margin:"0 auto", textAlign:"left" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", fontSize:11, color:i<=step?C.text:C.textDim, transition:"color .3s" }}>
            <span style={{ color:i<step?C.green:i===step?catColor:C.textDim }}>{i<step?"✓":i===step?"●":"○"}</span>
            {s}
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── PILL ────────────────────────────────────────────────────────
function Pill({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:color+"15", border:`1px solid ${color}44`, borderRadius:10 }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <div>
        <div style={{ fontSize:13, color, fontWeight:700, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:9, color:C.textSec, marginTop:2, letterSpacing:".05em", textTransform:"uppercase" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── INPUT FIELD ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize:10, color:C.textSec, marginBottom:5, letterSpacing:".08em", textTransform:"uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function ApexVisualV3() {
  const [catKey, setCatKey] = useState("mens_physique");
  const [fotoF, setFotoF] = useState<File | null>(null);
  const [fotoC, setFotoC] = useState<File | null>(null);
  const [fotoL, setFotoL] = useState<File | null>(null);

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [semanas, setSemanas] = useState("8");
  const [fase, setFase] = useState("cutting");
  const [obs, setObs] = useState("");

  const [compostos, setCompostos] = useState("");
  const [objetivoCiclo, setObjetivoCiclo] = useState("cutting");
  const [semanaCiclo, setSemanaCiclo] = useState("");
  const [duracaoCiclo, setDuracaoCiclo] = useState("");
  const [suporte, setSuporte] = useState("");
  const [faseCorpo, setFaseCorpo] = useState("bulk");
  const [pesoAtual, setPesoAtual] = useState("");
  const [pesoPico, setPesoPico] = useState("");

  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const cat = CATS[catKey];
  const temFoto = !!(fotoF || fotoC || fotoL);
  const temProtocolo = compostos.trim().length > 0;

  const meta = parseMeta(raw);
  const segs = parseSegs(raw);

  const S = {
    impacto:    secParse(raw, "IMPACTO_VISUAL",          "SCORES_SEGMENTOS"),
    composicao: secParse(raw, "COMPOSICAO_CORPORAL",     "DECISAO_MANOBRA"),
    manobra:    secParse(raw, "DECISAO_MANOBRA",         "POSTURA_DESVIOS"),
    postura:    secParse(raw, "POSTURA_DESVIOS",         "CORRECOES_POSTURAIS"),
    correcoes:  secParse(raw, "CORRECOES_POSTURAIS",     "PONTOS_FRACOS_PROTOCOLO"),
    fracos:     secParse(raw, "PONTOS_FRACOS_PROTOCOLO", "FARMACOLOGIA_INTEGRADA"),
    farma:      secParse(raw, "FARMACOLOGIA_INTEGRADA",  "NUTRICAO_FASE"),
    nutricao:   secParse(raw, "NUTRICAO_FASE",           "GANHA_PONTOS"),
    ganha:      secParse(raw, "GANHA_PONTOS",            "PERDE_PONTOS"),
    perde:      secParse(raw, "PERDE_PONTOS",            "PLANO_ATAQUE"),
    plano:      secParse(raw, "PLANO_ATAQUE",            "POSING_CORRETIVO"),
    posing:     secParse(raw, "POSING_CORRETIVO",        "VEREDICTO"),
    veredicto:  secParse(raw, "VEREDICTO",               null),
  };

  const RESULT_TABS = [
    { id:"overview",     label:"⚡ Overview",     show: segs.length > 0 || !!S.impacto },
    { id:"manobra",      label:"🎯 Manobra",      show: !!meta.manobraPrincipal || !!S.manobra },
    { id:"postura",      label:"🦴 Postura",      show: !!S.postura },
    { id:"correcoes",    label:"🔧 Correções",    show: !!S.correcoes },
    { id:"protocolo",    label:"⚡ Protocolo",    show: !!S.fracos },
    { id:"farmacologia", label:"💉 Farmacologia", show: temProtocolo && !!S.farma },
    { id:"palco",        label:"🎭 Palco",        show: !!S.ganha || !!S.posing },
    { id:"plano",        label:"🗺 Plano",        show: !!meta.p1 || !!S.plano || !!S.veredicto },
  ].filter(t => t.show || !done);

  const analisar = async () => {
    if (!temFoto) return;
    setLoading(true); setRaw(""); setDone(false); setError(null); setStreaming(false);
    try {
      const fotos: { label: string; mime: string; data: string }[] = [];
      for (const [ang, file] of [["Frente", fotoF], ["Costas", fotoC], ["Lateral", fotoL]] as const) {
        if (!file) continue;
        fotos.push({ label: ang, mime: file.type || "image/jpeg", data: await toB64(file) });
      }

      const athlete: Athlete = { nome, idade, peso, altura, semanas, fase };
      const protocol: Protocol = { compostos, objetivo: objetivoCiclo, semana: semanaCiclo, duracao: duracaoCiclo, suporte, faseCorpo, pesoAtual, pesoPico };

      // Timeout de 90s
      const timeoutPromise = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("Tempo esgotado (90s). A IA demorou demais para responder — tente novamente.")), 90000)
      );

      const invokePromise = supabase.functions.invoke("apex-visual-analyze", {
        body: {
          fotos,
          contexto: `Fase corporal declarada: ${fase}. Observação do coach: ${obs || "nenhuma"}. Gere análise APEX v3 completa.`,
          system: buildSystem(cat, athlete, protocol),
        },
      });

      const { data, error: fnErr } = await Promise.race([invokePromise, timeoutPromise]) as any;
      if (fnErr) {
        const msg = (fnErr as any)?.message || "";
        if (msg.includes("429") || msg.toLowerCase().includes("rate")) throw new Error("Limite de requisições atingido. Aguarde alguns instantes e tente novamente.");
        if (msg.includes("402")) throw new Error("Créditos da IA esgotados. Adicione em Settings → Workspace → Usage.");
        if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("failed to fetch")) throw new Error("Falha de conexão. Verifique sua internet e tente novamente.");
        throw new Error(msg || "Falha ao chamar a análise APEX.");
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      const text: string = (data as any)?.text || "";

      if (!text || text.trim().length < 100) {
        throw new Error("Resposta vazia ou muito curta da IA. Tente novamente — se persistir, troque/recoloque as fotos.");
      }
      if (!/##\s*(IMPACTO_VISUAL|SCORES_SEGMENTOS|VEREDICTO)/i.test(text)) {
        throw new Error("A IA respondeu fora do formato esperado (sem cabeçalhos ##). Clique em tentar novamente.");
      }

      setStreaming(true); setLoading(false);
      let idx = 0;
      const iv = setInterval(() => {
        idx = Math.min(idx + 24, text.length);
        setRaw(text.slice(0, idx));
        if (idx >= text.length) { clearInterval(iv); setStreaming(false); setDone(true); setActiveTab("overview"); }
      }, 16);
    } catch (e: any) {
      setError(e?.message || "Erro desconhecido na análise.");
      setLoading(false);
      setStreaming(false);
    }
  };

  // Mapa das 13+1 seções esperadas → checagem de completude
  const SECTION_CHECK: { key: string; label: string }[] = [
    { key: "impacto",    label: "Impacto visual" },
    { key: "composicao", label: "Composição corporal" },
    { key: "manobra",    label: "Decisão de manobra" },
    { key: "postura",    label: "Postura · desvios" },
    { key: "correcoes",  label: "Correções posturais" },
    { key: "fracos",     label: "Pontos fracos · protocolo" },
    { key: "farma",      label: "Farmacologia integrada" },
    { key: "nutricao",   label: "Nutrição da fase" },
    { key: "ganha",      label: "Ganha pontos" },
    { key: "perde",      label: "Perde pontos" },
    { key: "plano",      label: "Plano de ataque" },
    { key: "posing",     label: "Posing corretivo" },
    { key: "veredicto",  label: "Veredicto master" },
  ];


  const reset = () => { setRaw(""); setDone(false); setError(null); setFotoF(null); setFotoC(null); setFotoL(null); setStreaming(false); };

  const exportarPDF = () => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, H = 297, M = 15;
    const maxW = W - M * 2;
    let y = M;

    // Cores (RGB)
    const RGB = {
      ink: [22, 26, 38] as [number, number, number],
      sub: [95, 105, 125] as [number, number, number],
      mute: [140, 150, 170] as [number, number, number],
      line: [220, 224, 232] as [number, number, number],
      brand: [0, 130, 160] as [number, number, number],
      gold: [200, 140, 20] as [number, number, number],
      green: [20, 140, 70] as [number, number, number],
      red: [200, 50, 70] as [number, number, number],
      purple: [110, 70, 200] as [number, number, number],
      bgSoft: [245, 247, 252] as [number, number, number],
    };

    // ===== ESCALA TIPOGRÁFICA PDF (espelha tokens T do componente) =====
    // body 13.5px web ≈ 10pt PDF · lh 1.7 web → 1.5 PDF · prose 760px ≈ 175mm
    const PT = {
      h1: 18,        // título da capa
      h2: 11,        // títulos de seção
      h3: 10,        // sub-cabeçalhos / labels
      body: 10,      // texto corrido
      small: 8.5,    // anotações / diag
      caption: 7.5,  // rodapé / pílulas label
      lhBody: 1.5,
      lhTight: 1.35,
      lhHeading: 1.2,
      // espaçamentos em mm
      spXS: 1.5,
      spSM: 3,
      spMD: 5,
      spLG: 8,
      spXL: 11,
      // largura de prosa (clamped a maxW)
      proseW: Math.min(maxW, 175),
      trackTitle: 0.25,  // letter-spacing aproximado em pt
    };

    const need = (h: number) => { if (y + h > H - M) { pdf.addPage(); y = M; } };

    const text = (txt: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; lh?: number; width?: number } = {}) => {
      const { size = PT.body, bold = false, color = RGB.ink, indent = 0, lh = PT.lhBody, width } = opts;
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...color);
      const w = (width ?? PT.proseW) - indent;
      const lines = pdf.splitTextToSize(txt, w);
      const lineH = size * 0.3528 * lh;
      for (const ln of lines) {
        need(lineH);
        pdf.text(ln, M + indent, y);
        y += lineH;
      }
    };

    const sectionHeader = (num: number, title: string, accent: [number, number, number]) => {
      need(PT.spLG + PT.spMD);
      y += PT.spSM;
      const barH = 9;
      pdf.setFillColor(...accent);
      pdf.rect(M, y, 3, barH, "F");
      pdf.setFillColor(...RGB.bgSoft);
      pdf.rect(M + 3, y, maxW - 3, barH, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(PT.h2);
      pdf.setTextColor(...accent);
      pdf.text(`${String(num).padStart(2, "0")}`, M + 6, y + 6.2);
      pdf.setTextColor(...RGB.ink);
      pdf.setCharSpace(PT.trackTitle);
      pdf.text(title.toUpperCase(), M + 16, y + 6.2);
      pdf.setCharSpace(0);
      y += barH + PT.spMD;
    };

    const sectionBody = (body: string) => {
      const cleaned = (body || "").trim();
      if (!cleaned) {
        text("— sem conteúdo gerado —", { size: PT.small, color: RGB.mute });
        y += PT.spSM;
        return;
      }
      const paragraphs = cleaned.split(/\n+/).map(p => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        if (/^[-•*]\s+/.test(p)) {
          const t = p.replace(/^[-•*]\s+/, "");
          need(PT.body * 0.3528 * PT.lhBody);
          pdf.setFillColor(...RGB.brand);
          pdf.circle(M + 2, y - 1.4, 0.8, "F");
          text(t, { size: PT.body, color: RGB.ink, indent: 6 });
        } else if (/^[A-Z_ ]{3,}:/.test(p)) {
          const idx = p.indexOf(":");
          const k = p.slice(0, idx);
          const v = p.slice(idx + 1).trim();
          text(k + ":", { size: PT.h3, bold: true, color: RGB.brand, lh: PT.lhTight });
          if (v) text(v, { size: PT.body, color: RGB.ink, indent: 4 });
        } else {
          text(p, { size: PT.body, color: RGB.ink, lh: PT.lhBody });
        }
        y += PT.spSM;
      }
      y += PT.spMD;
    };

    const hr = () => { need(4); pdf.setDrawColor(...RGB.line); pdf.setLineWidth(0.2); pdf.line(M, y, W - M, y); y += 4; };

    // ===== CAPA =====
    pdf.setFillColor(8, 12, 24);
    pdf.rect(0, 0, W, 50, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(PT.h1);
    pdf.text("APEX VISUAL v3", M, 22);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(PT.body);
    pdf.setTextColor(180, 200, 230);
    pdf.text("Análise Visual + Postura + Farmacologia + Manobras de Elite", M, 30);
    pdf.setFontSize(PT.small);
    pdf.text(`Categoria: ${cat.l}  ·  Atleta: ${nome || "—"}  ·  ${idade ? idade + " anos · " : ""}${peso ? peso + "kg · " : ""}${altura ? altura + "cm" : ""}`, M, 38);
    pdf.text(`Semanas para o show: ${semanas || "—"}  ·  Fase: ${fase}  ·  Emitido: ${new Date().toLocaleDateString("pt-BR")}`, M, 44);
    y = 60;

    // ===== SUMÁRIO EXECUTIVO =====
    sectionHeader(0, "SUMÁRIO EXECUTIVO", RGB.brand);

    if (meta.manobraPrincipal) {
      const fc = FASE_CONFIG[(meta.manobraPrincipal || "").toLowerCase().replace(/ /g, "_")] || FASE_CONFIG.manter;
      const uc = URGENCIA_CONFIG[(meta.urgencia || "").toLowerCase().replace(/ /g, "_")] || URGENCIA_CONFIG.sem_pressa;
      need(16);
      pdf.setFillColor(245, 247, 252);
      pdf.rect(M, y, maxW, 14, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...RGB.ink);
      pdf.text("Manobra principal:", M + 3, y + 5.5);
      pdf.setFont("helvetica", "normal");
      pdf.text(fc.label, M + 42, y + 5.5);
      pdf.setFont("helvetica", "bold"); pdf.text("Urgência:", M + 3, y + 11);
      pdf.setFont("helvetica", "normal"); pdf.text(uc.label, M + 42, y + 11);
      y += 18;
    }

    // Pílulas de métricas
    const pills: { label: string; value: string }[] = [];
    if (meta.bfEst) pills.push({ label: "BF atual", value: meta.bfEst + "%" });
    if (meta.bfMeta) pills.push({ label: "BF meta", value: meta.bfMeta + "%" });
    if (meta.massaMagra) pills.push({ label: "Massa magra", value: meta.massaMagra + "kg" });
    if (meta.semMeta) pills.push({ label: "Semanas meta", value: meta.semMeta });
    if (meta.tdeeFator) pills.push({ label: "TDEE fator", value: "×" + meta.tdeeFator });
    if (meta.proteinaIdeal) pills.push({ label: "Proteína", value: meta.proteinaIdeal });
    if (pills.length) {
      need(14);
      let px = M;
      const pw = (maxW - 4 * 2) / 3;
      pills.forEach((p, i) => {
        if (i > 0 && i % 3 === 0) { y += 14; px = M; need(14); }
        pdf.setDrawColor(...RGB.line); pdf.setLineWidth(0.3);
        pdf.roundedRect(px, y, pw, 12, 1.5, 1.5, "S");
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(...RGB.mute);
        pdf.text(p.label.toUpperCase(), px + 2.5, y + 4);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...RGB.ink);
        pdf.text(p.value, px + 2.5, y + 9.5);
        px += pw + 4;
      });
      y += 16;
    }

    // Scores tabela
    if (segs.length) {
      text("Scores por segmento", { size: PT.h3, bold: true, color: RGB.ink, lh: PT.lhTight });
      y += 1;
      const rowH = 6.5;
      segs.forEach(s => {
        need(rowH + 1);
        const col = s.score >= 8 ? RGB.green : s.score >= 6 ? RGB.gold : RGB.red;
        // label
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...RGB.ink);
        pdf.text(s.label, M, y + 4);
        // bar
        const barX = M + 60, barW = maxW - 60 - 18;
        pdf.setFillColor(235, 238, 244); pdf.rect(barX, y + 1.5, barW, 4, "F");
        pdf.setFillColor(...col); pdf.rect(barX, y + 1.5, (barW * s.score) / 10, 4, "F");
        // score
        pdf.setFont("helvetica", "bold"); pdf.setTextColor(...col);
        pdf.text(`${s.score}/10`, W - M - 14, y + 4);
        y += rowH;
        if (s.diag) {
          pdf.setFont("helvetica", "italic"); pdf.setFontSize(8); pdf.setTextColor(...RGB.sub);
          const lns = pdf.splitTextToSize(s.diag, maxW - 4);
          for (const ln of lns) { need(3.5); pdf.text(ln, M + 2, y + 2.5); y += 3.5; }
          y += 1;
        }
      });
      y += 3;
    }

    // Plano de ataque resumo
    if (meta.p1 || meta.p2 || meta.p3) {
      text("Plano de ataque", { size: PT.h3, bold: true, color: RGB.ink, lh: PT.lhTight });
      y += 1;
      const items: { n: number; v?: string; c: [number, number, number] }[] = [
        { n: 1, v: meta.p1, c: RGB.red },
        { n: 2, v: meta.p2, c: RGB.gold },
        { n: 3, v: meta.p3, c: RGB.green },
      ];
      items.filter(i => i.v).forEach(i => {
        const lns = pdf.splitTextToSize(i.v!, maxW - 14);
        const blockH = lns.length * 4.2 + 4;
        need(blockH);
        pdf.setFillColor(248, 249, 252); pdf.rect(M, y, maxW, blockH, "F");
        pdf.setFillColor(...i.c); pdf.rect(M, y, 2, blockH, "F");
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...i.c);
        pdf.text(`P${i.n}`, M + 4, y + 6);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5); pdf.setTextColor(...RGB.ink);
        let yy = y + 6;
        lns.forEach((ln: string) => { pdf.text(ln, M + 12, yy); yy += 4.2; });
        y += blockH + 2;
      });
    }

    hr();

    // ===== 13 SEÇÕES =====
    const sections: { title: string; body: string; color: [number, number, number] }[] = [
      { title: "IMPACTO VISUAL",            body: S.impacto,    color: RGB.brand },
      { title: "SCORES POR SEGMENTO",       body: secParse(raw, "SCORES_SEGMENTOS", "COMPOSICAO_CORPORAL"), color: RGB.brand },
      { title: "COMPOSIÇÃO CORPORAL",       body: S.composicao, color: RGB.gold },
      { title: "DECISÃO DE MANOBRA",        body: S.manobra,    color: RGB.red },
      { title: "POSTURA · DESVIOS",         body: S.postura,    color: RGB.red },
      { title: "CORREÇÕES POSTURAIS",       body: S.correcoes,  color: RGB.brand },
      { title: "PONTOS FRACOS · PROTOCOLO", body: S.fracos,     color: RGB.gold },
      { title: "FARMACOLOGIA INTEGRADA",    body: S.farma,      color: RGB.purple },
      { title: "NUTRIÇÃO DA FASE",          body: S.nutricao,   color: RGB.green },
      { title: "GANHA PONTOS",              body: S.ganha,      color: RGB.green },
      { title: "PERDE PONTOS",              body: S.perde,      color: RGB.red },
      { title: "PLANO DE ATAQUE",           body: S.plano,      color: RGB.brand },
      { title: "POSING CORRETIVO",          body: S.posing,     color: RGB.gold },
      { title: "VEREDICTO MASTER",          body: S.veredicto,  color: RGB.gold },
    ];

    sections.forEach((s, i) => {
      sectionHeader(i + 1, s.title, s.color);
      sectionBody(s.body);
    });

    // ===== RODAPÉ =====
    const total = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(...RGB.mute);
      pdf.text(`APEX Visual v3 · ${cat.l} · ${nome || "Atleta"}`, M, H - 6);
      pdf.text(`Página ${i}/${total}`, W - M, H - 6, { align: "right" });
    }

    const safe = (nome || "atleta").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    pdf.save(`apex-visual-v3-${safe}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at top,${C.deep},${C.void})`, color:C.text, fontFamily:"'Space Grotesk',-apple-system,sans-serif", padding:"20px 16px" }}>
      {/* HEADER */}
      <div style={{ maxWidth:1100, margin:"0 auto 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ fontSize:36 }}>{cat.i}</div>
            <div>
              <div style={{ display:"flex", gap:6, alignItems:"baseline" }}>
                <span style={{ fontSize:22, fontWeight:900, color:C.text, letterSpacing:".05em" }}>APEX</span>
                <span style={{ fontSize:22, fontWeight:300, color:cat.c, letterSpacing:".05em" }}>VISUAL</span>
                <span style={{ fontSize:11, fontWeight:700, color:cat.c, padding:"2px 6px", border:`1px solid ${cat.c}55`, borderRadius:4, letterSpacing:".1em" }}>v3</span>
              </div>
              <div style={{ fontSize:9, color:C.textSec, letterSpacing:".15em", marginTop:2 }}>VISUAL · POSTURA · FARMACOLOGIA · MANOBRAS · {cat.l.toUpperCase()}</div>
            </div>
          </div>
          {(done || streaming) && (
            <div style={{ display:"flex", gap:8 }}>
              {streaming && <div style={{ padding:"6px 12px", borderRadius:8, background:cat.c+"22", border:`1px solid ${cat.c}55`, fontSize:10, color:cat.c, fontWeight:700, letterSpacing:".1em" }}>● ANALISANDO</div>}
              {done && <button onClick={exportarPDF} style={{ padding:"6px 14px", borderRadius:8, background:cat.c+"22", border:`1px solid ${cat.c}66`, color:cat.c, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em", fontWeight:700 }}>⬇ EXPORTAR PDF</button>}
              {done && <button onClick={reset} style={{ padding:"6px 14px", borderRadius:8, background:C.card, border:`1px solid ${C.border}`, color:C.text, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em" }}>+ NOVA ANÁLISE</button>}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        {/* FORMULÁRIO */}
        {!done && !loading && !streaming && (
          <>
            {/* CATEGORIAS */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, color:C.textSec, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase" }}>Categoria IFBB</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {Object.entries(CATS).map(([k, c]) => (
                  <button key={k} onClick={() => setCatKey(k)} style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", background:catKey===k?c.c+"22":C.card, border:`1.5px solid ${catKey===k?c.c:C.border}`, color:catKey===k?c.c:C.textSec, fontSize:11, fontWeight:catKey===k?700:400, display:"flex", alignItems:"center", gap:6, transition:"all .2s", letterSpacing:".02em" }}>
                    <span>{c.i}</span><span>{c.l}</span><span style={{ opacity:.6 }}>{c.g==="M"?"♂":"♀"}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop:10, padding:"10px 14px", background:cat.c+"10", border:`1px solid ${cat.c}33`, borderRadius:10 }}>
                <div style={{ fontSize:9, color:cat.c, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>Ideal da categoria</div>
                <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{cat.ideal}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                  {cat.pts.map(p => <span key={p} style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:C.card, color:C.textSec, letterSpacing:".05em" }}>{p}</span>)}
                </div>
              </div>
            </div>

            {/* DADOS DO ATLETA */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, color:C.textSec, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase" }}>Dados do atleta</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
                <Field label="Nome"><input style={inputStyle} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do atleta"/></Field>
                <Field label="Idade"><input style={inputStyle} type="number" value={idade} onChange={e=>setIdade(e.target.value)} placeholder="30"/></Field>
                <Field label="Peso (kg)"><input style={inputStyle} type="number" value={peso} onChange={e=>setPeso(e.target.value)} placeholder="90"/></Field>
                <Field label="Altura (cm)"><input style={inputStyle} type="number" value={altura} onChange={e=>setAltura(e.target.value)} placeholder="178"/></Field>
                <Field label="Semanas show"><input style={inputStyle} type="number" value={semanas} onChange={e=>setSemanas(e.target.value)} placeholder="8"/></Field>
                <Field label="Fase atual">
                  <select style={selectStyle} value={fase} onChange={e=>setFase(e.target.value)}>
                    <option value="bulk">Bulk</option>
                    <option value="cutting">Cutting</option>
                    <option value="recomp">Recomposição</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="peak">Peak Week</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* FOTOS */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, color:C.textSec, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase" }}>Fotos — mín. 1 obrigatória · mais ângulos = análise mais precisa</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
                <DropZone angle="Frente"  file={fotoF} onFile={setFotoF} onClear={() => setFotoF(null)} />
                <DropZone angle="Costas"  file={fotoC} onFile={setFotoC} onClear={() => setFotoC(null)} />
                <DropZone angle="Lateral" file={fotoL} onFile={setFotoL} onClear={() => setFotoL(null)} />
              </div>
            </div>

            {/* PROTOCOLO FARMACOLÓGICO */}
            <div style={{ marginBottom:20, padding:16, background:temProtocolo?C.purpleDim:C.card, border:`1px solid ${temProtocolo?C.purple+"55":C.border}`, borderRadius:12, transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:20 }}>💉</span>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontSize:12, color:temProtocolo?C.purple:C.text, fontWeight:700, letterSpacing:".05em" }}>Protocolo farmacológico</div>
                  <div style={{ fontSize:10, color:C.textSec, marginTop:2 }}>Opcional — quando preenchido ativa a análise Dr. VERTEX integrada</div>
                </div>
                {temProtocolo && <span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:C.purple+"33", color:C.purple, fontWeight:700, letterSpacing:".05em" }}>DR. VERTEX ATIVO</span>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <Field label="Compostos em uso">
                  <textarea value={compostos} onChange={e=>setCompostos(e.target.value)} rows={2} placeholder="Ex: Testosterona Enantato 300mg/sem, Trembolona Acetato 200mg/sem, Masteron 200mg/sem, HGH 2UI/dia, BPC-157 500mcg/dia..." style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
                </Field>
                {temProtocolo && (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <div style={{ flex:1, minWidth:110 }}>
                      <Field label="Objetivo do ciclo">
                        <select style={selectStyle} value={objetivoCiclo} onChange={e=>setObjetivoCiclo(e.target.value)}>
                          <option value="cutting">Cutting</option>
                          <option value="bulk">Bulk limpo</option>
                          <option value="recomp">Recomposição</option>
                          <option value="peak">Peak Week</option>
                          <option value="manutencao">Manutenção</option>
                        </select>
                      </Field>
                    </div>
                    <div style={{ flex:1, minWidth:80 }}><Field label="Semana do ciclo"><input style={inputStyle} type="number" value={semanaCiclo} onChange={e=>setSemanaCiclo(e.target.value)} placeholder="6"/></Field></div>
                    <div style={{ flex:1, minWidth:80 }}><Field label="Duração total"><input style={inputStyle} type="number" value={duracaoCiclo} onChange={e=>setDuracaoCiclo(e.target.value)} placeholder="16 sem"/></Field></div>
                    <div style={{ flex:1, minWidth:110 }}>
                      <Field label="Fase corporal">
                        <select style={selectStyle} value={faseCorpo} onChange={e=>setFaseCorpo(e.target.value)}>
                          <option value="bulk">Bulk ativo</option>
                          <option value="bulk_fim">Fim do bulk</option>
                          <option value="cutting">Cutting</option>
                          <option value="transicao">Transição</option>
                          <option value="peak">Peak Week</option>
                        </select>
                      </Field>
                    </div>
                    {(faseCorpo === "bulk" || faseCorpo === "bulk_fim") && (
                      <>
                        <div style={{ flex:1, minWidth:80 }}><Field label="Peso atual (kg)"><input style={inputStyle} type="number" value={pesoAtual} onChange={e=>setPesoAtual(e.target.value)} placeholder="98"/></Field></div>
                        <div style={{ flex:1, minWidth:80 }}><Field label="Peso pico bulk"><input style={inputStyle} type="number" value={pesoPico} onChange={e=>setPesoPico(e.target.value)} placeholder="Meta kg"/></Field></div>
                      </>
                    )}
                    <div style={{ flex:2, minWidth:180 }}><Field label="Suporte em uso"><input style={inputStyle} value={suporte} onChange={e=>setSuporte(e.target.value)} placeholder="Ex: Anastrozol 0.5mg EOD, TUDCA 500mg, NAC 600mg 2x, Ômega-3 4g"/></Field></div>
                  </div>
                )}
              </div>
            </div>

            {/* OBSERVAÇÃO */}
            <div style={{ marginBottom:20 }}>
              <Field label="Observação do coach">
                <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Ex: atleta passou do ponto no bulk, ombro esquerdo caindo, insônia com tren, sensível à aromatização..." style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
              </Field>
            </div>

            <button onClick={analisar} disabled={!temFoto} style={{ width:"100%", padding:"18px 24px", background:temFoto?`linear-gradient(135deg,${cat.c},${cat.c}88)`:C.card, border:`1.5px solid ${temFoto?cat.c:C.border}`, borderRadius:14, cursor:temFoto?"pointer":"not-allowed", fontSize:14, fontWeight:700, color:temFoto?"#000":C.textDim, letterSpacing:".06em", transition:"all .25s", boxShadow:temFoto?`0 0 40px ${cat.c}44`:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit", textTransform:"uppercase" }}>
              {temFoto ? <>{cat.i} ANALISAR COM APEX v3 {temProtocolo?"+ DR. VERTEX":""}</> : <>◈ ADICIONE AO MENOS 1 FOTO</>}
            </button>

            {error && (
              <div style={{ marginTop:14, background:C.redDim, border:`1.5px solid ${C.red}55`, borderRadius:12, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:20 }}>⚠️</span>
                  <div style={{ fontSize:12, fontWeight:800, color:C.red, letterSpacing:".08em", textTransform:"uppercase" }}>Falha na análise APEX</div>
                </div>
                <div style={{ fontSize:13, color:C.text, lineHeight:1.6, marginBottom:12 }}>{error}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button onClick={analisar} disabled={!temFoto} style={{ padding:"10px 18px", background:cat.c, border:"none", borderRadius:10, color:"#000", fontSize:12, fontWeight:700, cursor:temFoto?"pointer":"not-allowed", fontFamily:"inherit", letterSpacing:".05em", opacity:temFoto?1:.5 }}>↻ TENTAR NOVAMENTE</button>
                  <button onClick={() => setError(null)} style={{ padding:"10px 18px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em" }}>Fechar</button>
                </div>
                <div style={{ fontSize:10, color:C.textSec, marginTop:10, lineHeight:1.5 }}>
                  Dicas: verifique sua conexão · use fotos nítidas em boa luz · se o erro for de limite, aguarde alguns minutos.
                </div>
              </div>
            )}
          </>
        )}

        {loading && <Loading catColor={cat.c} />}

        {(streaming || done) && (
          <div>
            <div style={{ background:`linear-gradient(135deg,${cat.c}18,${cat.c}05)`, border:`1.5px solid ${cat.c}44`, borderRadius:16, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ fontSize:28 }}>{cat.i}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:cat.c, letterSpacing:".05em" }}>APEX v3 · {cat.l.toUpperCase()}</div>
                <div style={{ fontSize:11, color:C.textSec, marginTop:2 }}>
                  {nome||"Atleta"} {idade?`· ${idade} anos`:""} {peso?`· ${peso}kg`:""} · {semanas} semanas para o show
                  {temProtocolo && <span style={{ color:C.purple, fontWeight:700 }}> · Dr. VERTEX ativo</span>}
                </div>
              </div>
            </div>

            {done && (() => {
              const missing = SECTION_CHECK.filter(sc => {
                if (sc.key === "farma" && !temProtocolo) return false;
                return !((S as any)[sc.key] || "").trim();
              });
              if (missing.length === 0) return null;
              const critico = missing.length >= 6;
              const accent = critico ? C.red : C.amber;
              return (
                <div style={{ background:accent+"15", border:`1.5px solid ${accent}55`, borderRadius:12, padding:"14px 18px", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:18 }}>{critico ? "⚠️" : "ℹ️"}</span>
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ fontSize:12, fontWeight:800, color:accent, letterSpacing:".06em", textTransform:"uppercase" }}>
                        Análise {critico ? "muito incompleta" : "parcialmente incompleta"} — {missing.length} de {SECTION_CHECK.length} seção(ões) faltando
                      </div>
                      <div style={{ fontSize:11, color:C.textSec, marginTop:3 }}>
                        A IA não retornou os blocos abaixo. Você pode usar o que veio ou refazer a análise.
                      </div>
                    </div>
                    <button onClick={analisar} style={{ padding:"8px 14px", background:accent, border:"none", borderRadius:8, color:"#000", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em" }}>↻ RE-ANALISAR</button>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:6 }}>
                    {missing.map(m => (
                      <span key={m.key} style={{ fontSize:10, padding:"4px 10px", borderRadius:6, background:C.card, color:accent, border:`1px solid ${accent}44`, fontWeight:600, letterSpacing:".03em" }}>
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {meta.manobraPrincipal && done && (
              <ManeuverCard manobra={(meta.manobraPrincipal||"").toLowerCase().replace(/ /g,"_")} urgencia={(meta.urgencia||"").toLowerCase().replace(/ /g,"_")} />
            )}

            {done && (meta.bfEst || meta.bfMeta || meta.tdeeFator || meta.semMeta) && (
              <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                {meta.bfEst      && <Pill icon="📊" label="BF atual"     value={meta.bfEst+"%"}        color={C.amber} />}
                {meta.bfMeta     && <Pill icon="🎯" label="BF meta"      value={meta.bfMeta+"%"}       color={C.green} />}
                {meta.massaMagra && <Pill icon="💪" label="Massa magra"  value={meta.massaMagra+"kg"}  color={cat.c} />}
                {meta.semMeta    && <Pill icon="📅" label="Semanas"      value={meta.semMeta}          color={C.apex} />}
                {meta.tdeeFator  && <Pill icon="⚡" label="TDEE fator"   value={"×"+meta.tdeeFator}    color={C.purple} />}
              </div>
            )}

            {done && (
              <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:16, overflowX:"auto" }}>
                {RESULT_TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontSize:10, padding:"9px 12px", background:"none", border:"none", cursor:"pointer", color:activeTab===t.id?cat.c:C.textSec, borderBottom:`2px solid ${activeTab===t.id?cat.c:"transparent"}`, fontWeight:activeTab===t.id?700:400, whiteSpace:"nowrap", transition:"all .15s", fontFamily:"inherit", letterSpacing:".03em" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div>
              {(!done || activeTab === "overview") && (
                <div style={{ display: done && activeTab !== "overview" ? "none" : "block" }}>
                  {segs.length > 0 && (
                    <Panel icon="📊" title="SCORES POR SEGMENTO" accent={cat.c}>
                      {segs.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} diag={s.diag} hasFarma={temProtocolo} />)}
                    </Panel>
                  )}
                  {S.impacto && (
                    <Panel icon="👁" title="IMPACTO VISUAL" accent={C.apex} defaultOpen={false}>
                      <ProseText>{S.impacto}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "manobra" && (
                <div>
                  {S.composicao && (
                    <Panel icon="⚖️" title="COMPOSIÇÃO CORPORAL" accent={C.amber}>
                      <ProseText>{S.composicao.replace(/BF_ESTIMADO:[^\n]*/i,"").replace(/BF_META:[^\n]*/i,"").replace(/MASSA_MAGRA_EST:[^\n]*/i,"").replace(/SEMANAS_META:[^\n]*/i,"").replace(/VEREDICTO_FASE:[^\n]*/i,"").trim()}</ProseText>
                    </Panel>
                  )}
                  {S.manobra && (
                    <Panel icon="🎯" title="DECISÃO DE MANOBRA" accent={C.red}>
                      <Hint accent={C.red}>Manobras disponíveis com ajuste calórico, cardio e protocolo específico.</Hint>
                      <ProseText>{S.manobra.replace(/MANOBRA_PRINCIPAL:[^\n]*/i,"").replace(/URGENCIA:[^\n]*/i,"").trim()}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "postura" && S.postura && (
                <Panel icon="🦴" title="DESVIOS POSTURAIS" accent={C.red}>
                  <Hint accent={C.red}>Cada desvio afeta o visual no palco e indica desequilíbrios musculares corrigíveis.</Hint>
                  <ProseText>{S.postura}</ProseText>
                </Panel>
              )}

              {done && activeTab === "correcoes" && S.correcoes && (
                <Panel icon="🔧" title="CORREÇÕES POSTURAIS" accent={C.apex}>
                  <Hint accent={C.apex}>Execute antes de cada sessão do grupo afetado.</Hint>
                  <ProseText>{S.correcoes}</ProseText>
                </Panel>
              )}

              {done && activeTab === "protocolo" && S.fracos && (
                <Panel icon="⚡" title="PROTOCOLO DE EXERCÍCIOS CORRETIVOS" accent={C.amber}>
                  <Hint accent={C.gold}>Para cada ponto fraco: 3 exercícios (ativação/sobrecarga/pump), frequência e tempo de resposta.</Hint>
                  <ProseText>{S.fracos}</ProseText>
                </Panel>
              )}

              {done && activeTab === "farmacologia" && temProtocolo && (
                <div>
                  {(meta.tdeeFator || meta.proteinaIdeal) && (
                    <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                      {meta.tdeeFator    && <Pill icon="⚡" label="TDEE fator" value={"×"+meta.tdeeFator}  color={C.purple} />}
                      {meta.proteinaIdeal && <Pill icon="🥩" label="Proteína"  value={meta.proteinaIdeal} color={C.green} />}
                    </div>
                  )}
                  <Panel icon="💉" title="DR. VERTEX — ANÁLISE FARMACOLÓGICA INTEGRADA" accent={C.purple}>
                    <Hint accent={C.purple}>Composto a composto · sinergias · próximo nível · fitoterápicos · gestão E2 · cardiovascular · recuperação do eixo.</Hint>
                    <ProseText>{S.farma}</ProseText>
                  </Panel>
                  {S.nutricao && (
                    <Panel icon="🥗" title="NUTRIÇÃO INTEGRADA AO PROTOCOLO" accent={C.green} defaultOpen={false}>
                      <ProseText>{S.nutricao}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "palco" && (
                <div>
                  {S.ganha && (
                    <Panel icon="✅" title="GANHA PONTOS" accent={C.green}>
                      <ProseText>{S.ganha}</ProseText>
                    </Panel>
                  )}
                  {S.perde && (
                    <Panel icon="⚠️" title="PERDE PONTOS" accent={C.red}>
                      <ProseText>{S.perde}</ProseText>
                    </Panel>
                  )}
                  {S.posing && (
                    <Panel icon="🎭" title="POSING CORRETIVO" accent={C.gold}>
                      <Hint accent={C.gold}>Cues por pose mandatória — compensar fraquezas + vender pontos fortes.</Hint>
                      <ProseText>{S.posing}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "plano" && (
                <div>
                  {(meta.p1 || meta.p2 || meta.p3) && (
                    <Panel icon="🗺" title="PLANO DE ATAQUE" accent={cat.c}>
                      {[{ n:1, v:meta.p1, c:C.red },{ n:2, v:meta.p2, c:C.amber },{ n:3, v:meta.p3, c:C.green }].filter(p=>p.v).map(p => (
                        <div key={p.n} style={{ display:"flex", gap:12, padding:"10px 12px", marginBottom:8, background:p.c+"10", border:`1px solid ${p.c}33`, borderRadius:10 }}>
                          <div style={{ fontSize:18, fontWeight:900, color:p.c, minWidth:24 }}>P{p.n}</div>
                          <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{p.v}</div>
                        </div>
                      ))}
                    </Panel>
                  )}
                  {S.plano && (
                    <Panel icon="📋" title="DETALHAMENTO" accent={C.apex} defaultOpen={false}>
                      <ProseText>{S.plano.replace(/PRIORIDADE_[123]:[^\n]*/gi,"").trim()}</ProseText>
                    </Panel>
                  )}
                  {S.veredicto && (
                    <Panel icon="🏆" title="VEREDICTO MASTER" accent={C.gold}>
                      <div style={{ padding:"14px 16px", background:C.goldDim, border:`1px solid ${C.gold}33`, borderRadius:10 }}><ProseText tone="primary" emphasis>{S.veredicto}</ProseText></div>
                    </Panel>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
