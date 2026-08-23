import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Users, AlertTriangle, DollarSign,
  Activity, Shield, Zap, Brain, ChevronRight, ArrowLeft,
  BarChart3, Flame, ArrowUpRight, ArrowDownRight,
  CheckCircle, Trophy,
} from "lucide-react";

// nutriON Design System (HUD presentation palette)
const C = {
  bg: "#020205",
  card: "#080810",
  border: "#B8922A22",
  gold: "#B8922A",
  goldDim: "#B8922A55",
  goldBg: "#B8922A08",
  cyan: "#00D4FF",
  green: "#00C896",
  red: "#ff4444",
  purple: "#7C3AED",
  orange: "#E8A020",
  text: "#F5F0E8",
  textMid: "#888888",
  textMuted: "#5A5A5A",
};

const fontT: React.CSSProperties = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 };
const fontM: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

function Badge({ children, color = C.gold, pulse }: { children: React.ReactNode; color?: string; pulse?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px",
      border: `1px solid ${color}44`, background: `${color}0F`, color,
      ...fontM, fontSize: 8, letterSpacing: "0.08em",
    }}>
      {pulse && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, animation: "gp-pulse 1.6s infinite" }} />}
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = C.gold, trend, trendVal }: any) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Icon size={14} color={color} aria-hidden />
        {trend && (
          <span style={{ display: "flex", alignItems: "center", gap: 2, ...fontM, fontSize: 8, color: trend === "up" ? C.green : C.red }}>
            {trend === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trendVal}
          </span>
        )}
      </div>
      <div style={{ ...fontT, fontSize: 24, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ ...fontM, fontSize: 8, color: C.textMid, marginTop: 4, letterSpacing: "0.06em" }}>{label}</div>
      {sub && <div style={{ ...fontM, fontSize: 7, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ icon: Icon, children, color = C.gold, right }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <Icon size={13} color={color} aria-hidden />
      <h2 style={{ ...fontT, fontSize: 14, color: C.text, letterSpacing: "0.04em", margin: 0, flex: 1 }}>{children}</h2>
      {right}
    </div>
  );
}

function ChurnPrediction() {
  const clients = [
    { name: "Carlos M.", risk: 92, days: 8, reason: "Score MCE caiu 34pts em 2 semanas. Sem registro há 5 dias.", pillar: "Mindset", photo: "CM" },
    { name: "Fernanda L.", risk: 78, days: 4, reason: "Acionou SOS 4x na semana. Padrão noturno de compulsão.", pillar: "Comportamento", photo: "FL" },
    { name: "Ricardo S.", risk: 71, days: 3, reason: "Treinou 1/5 dias. Não abriu o plano alimentar há 6 dias.", pillar: "Execução", photo: "RS" },
    { name: "Amanda T.", risk: 45, days: 0, reason: "Comportamento estável mas Mindset caindo. Monitorar.", pillar: "Mindset", photo: "AT" },
  ];
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
      <SectionTitle icon={AlertTriangle} color={C.red} right={<Badge color={C.red} pulse>3 EM RISCO</Badge>}>
        Predição de Churn
      </SectionTitle>
      <p style={{ ...fontM, fontSize: 9, color: C.textMid, lineHeight: 1.6, marginBottom: 12 }}>
        Clientes com maior probabilidade de cancelar nos próximos 14 dias, baseado no padrão comportamental MCE.
      </p>

      {clients.map((c, i) => {
        const risky = c.risk >= 70;
        const accent = risky ? C.red : c.risk >= 50 ? C.orange : C.green;
        return (
          <button
            key={c.name}
            onClick={() => setExpanded(expanded === i ? null : i)}
            aria-expanded={expanded === i}
            style={{
              width: "100%", textAlign: "left", background: C.bg,
              border: `1px solid ${risky ? `${C.red}22` : C.border}`,
              borderLeft: `3px solid ${accent}`, padding: "10px 12px", marginBottom: 3, cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, background: `${accent}12`, border: `1px solid ${accent}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...fontT, fontSize: 10, color: accent,
              }}>{c.photo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ ...fontT, fontSize: 13, color: C.text }}>{c.name}</span>
                  {c.days > 0 && <span style={{ ...fontM, fontSize: 7, color: C.red }}>{c.days}d sem registro</span>}
                </div>
                <div style={{ ...fontM, fontSize: 8, color: C.textMid, marginTop: 2 }}>Pilar fraco: {c.pillar}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...fontT, fontSize: 18, color: accent, lineHeight: 1 }}>{c.risk}%</div>
                <div style={{ ...fontM, fontSize: 6, color: C.textMuted }}>RISCO</div>
              </div>
            </div>

            {expanded === i && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                <p style={{ ...fontM, fontSize: 9, color: C.textMid, lineHeight: 1.6, margin: 0 }}>{c.reason}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <span style={{ ...fontM, fontSize: 8, padding: "5px 8px", border: `1px solid ${C.gold}44`, background: C.goldBg, color: C.gold }}>CONTATAR AGORA</span>
                  <span style={{ ...fontM, fontSize: 8, padding: "5px 8px", border: `1px solid ${C.border}`, color: C.textMid }}>VER HISTÓRICO MCE</span>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RetentionChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const data = {
      semMCE: [100, 82, 68, 55, 45, 38, 32, 28],
      comMCE: [100, 96, 91, 87, 84, 81, 79, 77],
    };
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);

    const padL = 35, padR = 32, padT = 15, padB = 25;
    const plotW = w - padL - padR, plotH = h - padT - padB;

    ctx.strokeStyle = "#ffffff10";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = C.textMuted;
      ctx.font = "8px 'Space Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${100 - i * 25}%`, padL - 4, y + 3);
    }

    ctx.textAlign = "center";
    for (let i = 0; i < 8; i++) {
      const x = padL + (plotW / 7) * i;
      ctx.fillStyle = C.textMuted;
      ctx.fillText(`M${i + 1}`, x, h - 5);
    }

    const drawLine = (vals: number[], color: string, fill: string) => {
      ctx.beginPath();
      vals.forEach((v, i) => {
        const x = padL + (plotW / 7) * i;
        const y = padT + plotH - (v / 100) * plotH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.lineTo(padL, padT + plotH);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      vals.forEach((v, i) => {
        const x = padL + (plotW / 7) * i;
        const y = padT + plotH - (v / 100) * plotH;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
      });
    };

    drawLine(data.semMCE, C.red, `${C.red}12`);
    drawLine(data.comMCE, C.green, `${C.green}12`);

    ctx.font = "bold 11px 'Rajdhani', sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = C.red;
    ctx.fillText("28%", padL + plotW + 4, padT + plotH - (28 / 100) * plotH + 3);
    ctx.fillStyle = C.green;
    ctx.fillText("77%", padL + plotW + 4, padT + plotH - (77 / 100) * plotH + 3);
  }, []);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
      <SectionTitle icon={TrendingUp} color={C.green}>Retenção: Com MCE vs Sem MCE</SectionTitle>

      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, ...fontM, fontSize: 8, color: C.green }}>
          <span style={{ width: 10, height: 2, background: C.green }} /> COM nutriON MCE
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, ...fontM, fontSize: 8, color: C.red }}>
          <span style={{ width: 10, height: 2, background: C.red }} /> SEM MÉTODO
        </span>
      </div>

      <canvas ref={canvasRef} width={520} height={200} style={{ width: "100%", height: "auto" }} role="img" aria-label="Gráfico de retenção comparando academias com e sem o método MCE" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
        <div style={{ border: `1px solid ${C.green}33`, background: `${C.green}08`, padding: 10 }}>
          <div style={{ ...fontT, fontSize: 22, color: C.green, lineHeight: 1 }}>77%</div>
          <div style={{ ...fontM, fontSize: 7, color: C.textMid, marginTop: 3 }}>RETENÇÃO 8 MESES</div>
          <div style={{ ...fontM, fontSize: 7, color: C.textMuted }}>Com MCE</div>
        </div>
        <div style={{ border: `1px solid ${C.red}33`, background: `${C.red}08`, padding: 10 }}>
          <div style={{ ...fontT, fontSize: 22, color: C.red, lineHeight: 1 }}>28%</div>
          <div style={{ ...fontM, fontSize: 7, color: C.textMid, marginTop: 3 }}>RETENÇÃO 8 MESES</div>
          <div style={{ ...fontM, fontSize: 7, color: C.textMuted }}>Sem método</div>
        </div>
      </div>
    </div>
  );
}

function RevenueImpact() {
  const [clients, setClients] = useState(200);
  const ticket = 150;
  const lostSem = Math.round(clients * 0.12);
  const lostCom = Math.round(clients * 0.04);
  const saved = lostSem - lostCom;
  const revenueSaved = saved * ticket;
  const annual = revenueSaved * 12;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
      <SectionTitle icon={DollarSign}>Impacto Financeiro</SectionTitle>
      <p style={{ ...fontM, fontSize: 9, color: C.textMid, lineHeight: 1.6, marginBottom: 14 }}>
        Simulação de receita salva pela redução de churn com o método MCE integrado.
      </p>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <label htmlFor="gp-clients" style={{ ...fontM, fontSize: 8, color: C.textMid }}>ALUNOS ATIVOS NA ACADEMIA</label>
          <span style={{ ...fontT, fontSize: 14, color: C.gold }}>{clients}</span>
        </div>
        <input
          id="gp-clients" type="range" min={50} max={800} step={10} value={clients}
          onChange={(e) => setClients(+e.target.value)}
          style={{ width: "100%", accentColor: C.gold }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", ...fontM, fontSize: 7, color: C.textMuted }}>
          <span>50</span><span>800</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
        <div style={{ border: `1px solid ${C.red}33`, background: `${C.red}08`, padding: 10 }}>
          <div style={{ ...fontM, fontSize: 7, color: C.textMid }}>CHURN MENSAL SEM MCE</div>
          <div style={{ ...fontT, fontSize: 20, color: C.red, marginTop: 4 }}>{lostSem} alunos</div>
          <div style={{ ...fontM, fontSize: 7, color: C.textMuted }}>12% ao mês</div>
        </div>
        <div style={{ border: `1px solid ${C.green}33`, background: `${C.green}08`, padding: 10 }}>
          <div style={{ ...fontM, fontSize: 7, color: C.textMid }}>CHURN MENSAL COM MCE</div>
          <div style={{ ...fontT, fontSize: 20, color: C.green, marginTop: 4 }}>{lostCom} alunos</div>
          <div style={{ ...fontM, fontSize: 7, color: C.textMuted }}>4% ao mês</div>
        </div>
      </div>

      <div style={{ border: `1px solid ${C.gold}44`, background: C.goldBg, padding: 14, textAlign: "center" }}>
        <div style={{ ...fontM, fontSize: 8, color: C.goldDim, letterSpacing: "0.1em" }}>RECEITA SALVA POR MÊS</div>
        <div style={{ ...fontT, fontSize: 32, color: C.gold, lineHeight: 1.2 }}>R$ {revenueSaved.toLocaleString("pt-BR")}</div>
        <div style={{ ...fontM, fontSize: 8, color: C.textMid }}>{saved} alunos retidos × R$ {ticket} ticket médio</div>
        <div style={{ ...fontM, fontSize: 9, color: C.green, marginTop: 8 }}>
          R$ {annual.toLocaleString("pt-BR")} / ano em receita protegida
        </div>
      </div>
    </div>
  );
}

function EngagementOverview() {
  const metrics = [
    { label: "Check-ins hoje", value: "47", total: "/62 alunos", pct: 76, color: C.green },
    { label: "Treinos registrados", value: "38", total: "essa semana", pct: 84, color: C.cyan },
    { label: "SOS acionados", value: "3", total: "últimas 24h", pct: 5, color: C.red },
    { label: "Desafios cumpridos", value: "156", total: "essa semana", pct: 72, color: C.gold },
  ];
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
      <SectionTitle icon={Activity} color={C.cyan} right={<Badge color={C.green} pulse>LIVE</Badge>}>
        Engajamento em Tempo Real
      </SectionTitle>
      <div style={{ display: "grid", gap: 8 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...fontT, fontSize: 18, color: m.color, minWidth: 44 }}>{m.value}</div>
            <div style={{ flex: 1 }}>
              <div style={{ ...fontM, fontSize: 8, color: C.textMid, marginBottom: 4 }}>{m.label}</div>
              <div style={{ height: 3, background: "#ffffff0D" }}>
                <div style={{ width: `${m.pct}%`, height: "100%", background: m.color }} />
              </div>
            </div>
            <span style={{ ...fontM, fontSize: 7, color: C.textMuted }}>{m.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengePreview() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
      <SectionTitle icon={Flame} color={C.orange}>Desafio 30 Dias — Motor de Retenção</SectionTitle>
      <p style={{ ...fontM, fontSize: 9, color: C.textMid, lineHeight: 1.6, marginBottom: 12 }}>
        Sistema de desafio integrado que a academia lança para os alunos. Leaderboard, prêmios,
        engajamento de comunidade — tudo dentro do nutriON.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 14 }}>
        {[
          { n: "62", l: "INSCRITOS", c: C.cyan },
          { n: "47", l: "ATIVOS", c: C.green },
          { n: "89%", l: "ADERÊNCIA", c: C.gold },
          { n: "Dia 34", l: "PROGRESSO", c: C.orange },
        ].map((s) => (
          <div key={s.l} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 8, textAlign: "center" }}>
            <div style={{ ...fontT, fontSize: 16, color: s.c }}>{s.n}</div>
            <div style={{ ...fontM, fontSize: 6, color: C.textMuted, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ ...fontM, fontSize: 8, color: C.goldDim, letterSpacing: "0.1em", marginBottom: 6 }}>TOP 3 — LEADERBOARD</div>
      {[
        { pos: "1º", name: "Ana Clara", score: 94, streak: 34 },
        { pos: "2º", name: "Marcos V.", score: 91, streak: 31 },
        { pos: "3º", name: "Julia R.", score: 88, streak: 29 },
      ].map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, border: `1px solid ${C.border}`, padding: "8px 10px", marginBottom: 3 }}>
          <span style={{ ...fontT, fontSize: 12, color: C.gold, width: 20 }}>{p.pos}</span>
          <span style={{ ...fontT, fontSize: 12, color: C.text, flex: 1 }}>{p.name}</span>
          <span style={{ ...fontM, fontSize: 7, color: C.orange }}>{p.streak}d streak</span>
          <span style={{ ...fontT, fontSize: 14, color: C.green }}>{p.score}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, ...fontM, fontSize: 8, color: C.textMid }}>
        <Trophy size={11} color={C.gold} aria-hidden />
        Prêmio: MindForce Creatine + 1 mês grátis na academia parceira
      </div>
    </div>
  );
}

export default function GymPartnerDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, paddingBottom: 40 }}>
      <style>{`
        @keyframes gp-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* TOPBAR */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: C.card,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => navigate("/mce")} aria-label="Voltar para o MCE"
            style={{ background: "transparent", border: "none", color: C.gold, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={16} />
          </button>
          <span style={{ ...fontT, fontSize: 15, color: C.gold }}>nutriON</span>
          <Badge>GYM PARTNER</Badge>
        </div>
        <span style={{ ...fontM, fontSize: 8, color: C.textMid, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, animation: "gp-pulse 1.6s infinite" }} />
          ACADEMIA PARCEIRA
        </span>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 14px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...fontM, fontSize: 8, color: C.goldDim, letterSpacing: "0.16em", marginBottom: 6 }}>
            PAINEL DA ACADEMIA PARCEIRA
          </div>
          <h1 style={{ ...fontT, fontSize: 30, color: C.text, margin: 0, lineHeight: 1.1 }}>
            Inteligência de Retenção
          </h1>
          <p style={{ ...fontM, fontSize: 9, color: C.textMid, marginTop: 8, lineHeight: 1.6 }}>
            Dados comportamentais dos seus alunos em tempo real. Churn preditivo. Receita protegida.
          </p>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
          {[
            { id: "overview", label: "VISÃO GERAL", icon: BarChart3 },
            { id: "churn", label: "CHURN", icon: AlertTriangle },
            { id: "revenue", label: "RECEITA", icon: DollarSign },
            { id: "challenge", label: "DESAFIO 90D", icon: Flame },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
              style={{
                flex: 1, padding: "9px 0", background: tab === t.id ? C.goldBg : "transparent",
                border: "none", borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                ...fontM, fontSize: 8, letterSpacing: "0.06em",
                color: tab === t.id ? C.gold : C.textMuted,
              }}>
              <t.icon size={11} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <StatCard icon={Users} label="ALUNOS ATIVOS" value="62" sub="no nutriON" trend="up" trendVal="+8" />
              <StatCard icon={Shield} label="RETENÇÃO 90D" value="89%" sub="vs 61% antes" color={C.green} trend="up" trendVal="+28pt" />
              <StatCard icon={AlertTriangle} label="EM RISCO" value="3" sub="ação recomendada" color={C.red} trend="down" trendVal="-2" />
              <StatCard icon={TrendingDown} label="CHURN MENSAL" value="4%" sub="média do setor: 12%" color={C.cyan} trend="down" trendVal="-8pt" />
            </div>

            <EngagementOverview />

            <button onClick={() => setTab("churn")}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                background: `${C.red}08`, border: `1px solid ${C.red}33`, padding: 12, cursor: "pointer",
              }}>
              <AlertTriangle size={16} color={C.red} aria-hidden />
              <div style={{ flex: 1 }}>
                <div style={{ ...fontT, fontSize: 13, color: C.text }}>3 alunos em risco de cancelamento</div>
                <div style={{ ...fontM, fontSize: 8, color: C.textMid, marginTop: 2 }}>Detectado por padrão comportamental MCE</div>
              </div>
              <ChevronRight size={14} color={C.red} />
            </button>

            <div style={{ border: `1px solid ${C.gold}33`, background: C.goldBg, padding: 16, textAlign: "center" }}>
              <div style={{ ...fontT, fontSize: 20, color: C.gold }}>Transformação é sistema.</div>
              <p style={{ ...fontM, fontSize: 9, color: C.textMid, lineHeight: 1.7, marginTop: 8 }}>
                Enquanto outras academias perdem 12% dos alunos por mês sem saber por quê,
                você vê o comportamento de cada um em tempo real e age ANTES do cancelamento.
              </p>
              <div style={{ ...fontM, fontSize: 7, color: C.textMuted, marginTop: 10, letterSpacing: "0.1em" }}>
                NUTRION · SISTEMA INTEGRADO DE PERFORMANCE HUMANA · @diogo.mell0
              </div>
            </div>
          </div>
        )}

        {tab === "churn" && <ChurnPrediction />}

        {tab === "revenue" && (
          <div style={{ display: "grid", gap: 10 }}>
            <RevenueImpact />
            <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
              <SectionTitle icon={Brain} color={C.purple}>Por que o MCE reduz churn?</SectionTitle>
              {[
                { icon: Brain, text: "Mindset — detecta quando o aluno está perdendo a convicção ANTES dele cancelar", color: C.purple },
                { icon: Activity, text: "Comportamento — monitora padrões (fins de semana, horários, frequência) e alerta o coach", color: C.green },
                { icon: Zap, text: "Execução — se o aluno parou de registrar treino, o sistema avisa em 48h, não em 30 dias", color: C.orange },
                { icon: Shield, text: "SOS — quando o aluno está em crise comportamental, ele aciona o protocolo em vez de desistir", color: C.red },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <item.icon size={12} color={item.color} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
                  <span style={{ ...fontM, fontSize: 9, color: C.textMid, lineHeight: 1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>
            <RetentionChart />
          </div>
        )}

        {tab === "challenge" && (
          <div style={{ display: "grid", gap: 10 }}>
            <ChallengePreview />
            <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 14 }}>
              <SectionTitle icon={CheckCircle} color={C.green}>O que a academia ganha com o Desafio</SectionTitle>
              {[
                "Alunos engajados ficam em média 4.2 meses a mais",
                "Leaderboard cria competição saudável — aluno puxa aluno",
                "Prêmios da academia viram marketing (posts, stories, indicações)",
                "Dados do desafio alimentam o sistema de predição de churn",
                "O coach usa os dados MCE pra personalizar o acompanhamento",
              ].map((t) => (
                <div key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <CheckCircle size={12} color={C.green} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
                  <span style={{ ...fontM, fontSize: 9, color: C.textMid, lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ ...fontM, fontSize: 7, color: C.textMuted, letterSpacing: "0.14em" }}>
            NUTRION · MÉTODO MCE · @DIOGO.MELL0
          </div>
          <div style={{ ...fontM, fontSize: 7, color: C.textMuted, marginTop: 4 }}>
            SISTEMA INTEGRADO DE PERFORMANCE HUMANA
          </div>
        </div>
      </div>
    </div>
  );
}
