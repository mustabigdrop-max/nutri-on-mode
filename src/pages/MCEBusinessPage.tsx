import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ChevronDown, Building2, Trophy, Users, QrCode, Target, TrendingUp, Megaphone, Calendar, CheckCircle2, BarChart3, Smartphone, Dumbbell, Camera, Wallet, MapPin } from "lucide-react";

import BusinessDashboardTab from "@/components/business/BusinessDashboardTab";
import BusinessGymsTab from "@/components/business/BusinessGymsTab";
import BusinessChallengesTab from "@/components/business/BusinessChallengesTab";
import SalesKitPanel from "@/components/business/SalesKitPanel";

const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "academias", label: "🏢 Academias" },
  { id: "desafios", label: "🏆 Desafios" },
  { id: "kit", label: "📋 Kit" },
] as const;

const MONO = "'Space Mono', ui-monospace, monospace";
const DISPLAY = "'Rajdhani', system-ui, sans-serif";
const CYAN = "#00D4FF";
const AMBER = "#E8A020";
const GREEN = "#00FF88";

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      background: "rgba(255,255,255,0.02)",
      marginBottom: 14,
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <Icon size={20} style={{ color: CYAN, flexShrink: 0 }} />
        <span style={{ flex: 1, fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
          {title}
        </span>
        <ChevronDown size={18} style={{ color: "rgba(255,255,255,0.4)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s ease" }} />
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", fontFamily: DISPLAY, fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.72)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Badge({ children, color = CYAN }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 6,
      background: `${color}12`, border: `1px solid ${color}30`,
      color, fontFamily: MONO, fontSize: 10, letterSpacing: 0.5,
    }}>
      {children}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center", padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: AMBER }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 1, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function MCEBusinessPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("dashboard");
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: "#05070C", color: "#fff", paddingBottom: 96 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .business-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; display: block; overflow-x: auto; }
        .business-table th { font-family: ${MONO}; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.5); text-align: left; padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.12); white-space: nowrap; }
        .business-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; color: rgba(255,255,255,0.75); }
        .business-list { margin: 10px 0; padding-left: 0; list-style: none; }
        .business-list li { position: relative; padding-left: 18px; margin: 8px 0; }
        .business-list li::before { content: "▸"; position: absolute; left: 0; color: ${GREEN}; }
        .business-quote { margin: 14px 0; padding: 14px 16px; border-left: 2px solid ${AMBER}; background: rgba(232,160,32,0.06); border-radius: 0 10px 10px 0; font-style: italic; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex" }}
            >
              <ArrowLeft size={18} />
            </button>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 3, color: CYAN }}>NUTRION</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)" }}>MCE BUSINESS</span>
          </div>
          <Badge color={GREEN}>B2B2C</Badge>
        </header>

        {/* Tabs */}
        <nav style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 0" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                whiteSpace: "nowrap",
                padding: "9px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: DISPLAY,
                fontSize: 14,
                fontWeight: 700,
                background: tab === t.id ? `${AMBER}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${tab === t.id ? `${AMBER}55` : "rgba(255,255,255,0.08)"}`,
                color: tab === t.id ? AMBER : "rgba(255,255,255,0.6)",
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && <BusinessDashboardTab reloadKey={reloadKey} />}
        {tab === "academias" && <BusinessGymsTab onChanged={() => setReloadKey((k) => k + 1)} />}
        {tab === "desafios" && <BusinessChallengesTab />}

        {tab === "kit" && (<>
        <SalesKitPanel />

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "32px 0 20px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
            ESTRATÉGIA DE EXPANSÃO
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1.05, margin: 0 }}>
            nutriON <span style={{ color: AMBER }}>GYM</span>
          </h1>
          <p style={{ fontFamily: DISPLAY, fontSize: 16, color: "rgba(255,255,255,0.55)", marginTop: 10, maxWidth: 560, marginInline: "auto" }}>
            O plano que transforma 12 clientes em 500 em 6 meses — entrando nas academias da Zona Sul do Rio.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
            <Badge color={CYAN}>@diogo.mell0</Badge>
            <Badge color={AMBER}>Modelo B2B2C</Badge>
            <Badge color={GREEN}>Rio de Janeiro</Badge>
          </div>
        </section>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
          <Stat value="500" label="Clientes em 6 meses" />
          <Stat value="15" label="Academias parceiras" />
          <Stat value="R$ 75k" label="Receita líquida/mês" />
        </div>

        {/* Problem pitch */}
        <Section title="O Problema da Academia" icon={Building2} defaultOpen>
          <p>
            Todo dono de academia tem o mesmo pesadelo: <strong style={{ color: "#fff" }}>retenção</strong>.
          </p>
          <ul className="business-list">
            <li>67% dos alunos desistem nos primeiros 3 meses</li>
            <li>O aluno paga, vai 3 semanas, para de ir, e cancela</li>
            <li>A academia gasta R$150-300 pra adquirir cada aluno novo</li>
            <li>O aluno sai porque <strong style={{ color: "#fff" }}>não vê resultado</strong></li>
            <li>E não vê resultado porque treina sem comer direito</li>
          </ul>
          <div className="business-quote">
            A academia vende TREINO. Mas resultado é TREINO + NUTRIÇÃO + COMPORTAMENTO. Sem os dois últimos, o treino não entrega. E o aluno culpa a academia.
          </div>
          <p style={{ color: GREEN, fontWeight: 600 }}>Você entra nessa lacuna.</p>
        </Section>

        {/* Concept */}
        <Section title="A Ideia: nutriON WALL + Desafio 90 Dias" icon={Target}>
          <p>Uma tela ao vivo dentro da academia mostrando o ranking MCE dos alunos, alimentada por um desafio de 90 dias onde todo mundo compete, transforma o corpo, posta stories e paga pra ter orientação nutricional.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
            {[
              { icon: Trophy, title: "THE WALL", desc: "Tela física com ranking ao vivo" },
              { icon: Calendar, title: "DESAFIO 90 DIAS", desc: "Competição trimestral entre alunos" },
              { icon: Users, title: "GYM PARTNER", desc: "Programa de parceria com a academia" },
            ].map((c) => (
              <div key={c.title} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                <c.icon size={22} style={{ color: CYAN, marginBottom: 8 }} />
                <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* The Wall */}
        <Section title="Componente 1 — The Wall" icon={Smartphone}>
          <p>Uma TV 50-65" montada na parede principal da academia, rodando um dashboard ao vivo do nutriON:</p>
          <ul className="business-list">
            <li>Ranking MCE dos alunos (top 8-10)</li>
            <li>Transformações em destaque</li>
            <li>Atletas treinando agora</li>
            <li>QR Code de entrada no desafio</li>
            <li>Certificação "nutriON Certified Gym"</li>
          </ul>
          <table className="business-table">
            <thead>
              <tr><th>Item</th><th>Custo</th><th>Quem paga</th></tr>
            </thead>
            <tbody>
              <tr><td>Smart TV 55" 4K</td><td>R$ 2.000-3.000</td><td>nutriON</td></tr>
              <tr><td>Suporte de parede</td><td>R$ 100-200</td><td>nutriON</td></tr>
              <tr><td>Fire Stick / Chromecast</td><td>R$ 250-400</td><td>nutriON</td></tr>
              <tr><td>Instalação</td><td>R$ 200-300</td><td>nutriON</td></tr>
              <tr><td><strong>Total por academia</strong></td><td><strong>~R$ 3.000</strong></td><td><strong>nutriON</strong></td></tr>
            </tbody>
          </table>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            A TV se paga no primeiro mês: 30 participantes × R$ 150/mês = R$ 4.500/mês.
          </p>
        </Section>

        {/* 90 Day Challenge */}
        <Section title="Componente 2 — Desafio 90 Dias" icon={Calendar}>
          <p>Evento trimestral que atrai alunos, cria competição saudável, gera transformações reais e converte participantes em clientes pagantes.</p>

          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: CYAN, marginBottom: 10 }}>TIERS DE PARTICIPAÇÃO</div>
            <table className="business-table">
              <thead>
                <tr><th>Tier</th><th>Preço</th><th>O que inclui</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: GREEN }}>🆓 FREE</td>
                  <td>Grátis</td>
                  <td>MCE Score, hidratação, check-in diário, ranking, briefing + 3 episódios, Story Generator básico</td>
                </tr>
                <tr>
                  <td style={{ color: CYAN }}>💎 PREMIUM</td>
                  <td>R$ 149/mês</td>
                  <td>Plano alimentar, NutriSync, lista de compras, receitas, biblioteca MCE completa, progresso, suplementação, ritual</td>
                </tr>
                <tr>
                  <td style={{ color: AMBER }}>🏆 VIP</td>
                  <td>R$ 249/mês</td>
                  <td>Tudo do Premium + ajuste semanal do coach, áudio personalizado, suporte via chat, consultoria de treino</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: CYAN, marginBottom: 10 }}>PREMIAÇÃO</div>
          <ul className="business-list">
            <li><strong style={{ color: "#fff" }}>🥇 1º lugar:</strong> 3 meses grátis de Premium + foto na The Wall + story de destaque + troféu físico</li>
            <li><strong style={{ color: "#fff" }}>🥈 2º lugar:</strong> 2 meses grátis de Premium + foto na The Wall por 60 dias</li>
            <li><strong style={{ color: "#fff" }}>🥉 3º lugar:</strong> 1 mês grátis de Premium + foto na The Wall por 30 dias</li>
            <li><strong style={{ color: "#fff" }}>🏅 Prêmios especiais:</strong> Maior streak, maior evolução, melhor foto do prato, mais episódios ouvidos</li>
          </ul>
        </Section>

        {/* Pitch */}
        <Section title="Pitch de 5 Minutos pro Dono da Academia" icon={Megaphone}>
          <div className="business-quote" style={{ borderLeftColor: CYAN }}>
            "[Nome], eu resolvo seu maior problema — retenção — sem custo nenhum pra você. E ainda te pago por isso."
          </div>
          <ol style={{ margin: "10px 0", paddingLeft: 18, color: "rgba(255,255,255,0.75)" }}>
            <li style={{ marginBottom: 8 }}>Eu coloco uma tela na sua academia. Eu pago.</li>
            <li style={{ marginBottom: 8 }}>Seus alunos escaneiam o QR Code e entram num desafio de 90 dias GRATUITO.</li>
            <li style={{ marginBottom: 8 }}>A tela mostra o ranking ao vivo. Seus alunos começam a competir e a vir todo dia.</li>
            <li style={{ marginBottom: 8 }}>Quem quiser plano alimentar personalizado assina o premium. De cada assinatura, 25% é seu.</li>
            <li style={{ marginBottom: 8 }}>A cada 90 dias, novo desafio, novas transformações, novos posts marcando sua academia.</li>
          </ol>
          <p style={{ color: GREEN, fontWeight: 700 }}>Custo pra academia: R$ 0.</p>
        </Section>

        {/* Gym Partner Package */}
        <Section title="Pacote nutriON Gym Partner" icon={CheckCircle2}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 6 }}>
            {[
              { title: "🏅 Certificação", items: ["Selo nutriON Certified Gym", "Placa física", "Logo no site"] },
              { title: "📺 The Wall", items: ["Smart TV 55\" instalada", "Dashboard ao vivo", "Ranking + QR Code"] },
              { title: "📊 Dashboard", items: ["Alunos participando", "Taxa de retenção", "Comissões e engajamento"] },
              { title: "💰 Receita", items: ["25% de comissão", "Pagamento mensal via Pix", "Sem burocracia"] },
              { title: "📸 Marketing", items: ["Posts no @diogo.mell0", "Stories com tag da academia", "Before/after com logo"] },
              { title: "🏆 Desafios", items: ["4 desafios por ano", "Evento de lançamento", "Troféus e premiação"] },
            ].map((p) => (
              <div key={p.title} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{p.title}</div>
                <ul style={{ margin: 0, paddingLeft: 14, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  {p.items.map((i) => <li key={i} style={{ marginBottom: 4 }}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Expansion */}
        <Section title="Estratégia de Expansão — Zona Sul" icon={MapPin}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: CYAN, marginBottom: 8 }}>FASE 1 — PILOTO (MÊS 1-3): 3 ACADEMIAS</div>
            <ul className="business-list">
              <li>Boutique em Botafogo — público A/B, decisão rápida</li>
              <li>Médio porte em Copacabana — alto volume</li>
              <li>Boutique em Ipanema/Leblon — ticket alto</li>
            </ul>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Meta: 100 participantes, 35 pagantes, R$ 6.000/mês.</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: CYAN, marginBottom: 8 }}>FASE 2 — VALIDAÇÃO (MÊS 4-6): +5 ACADEMIAS</div>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>Humaitá, Flamengo, Jardim Botânico, Lagoa, Gávea.</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Meta: 8 academias, 300 participantes, 120 pagantes, R$ 20.000+/mês.</p>
          </div>

          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: CYAN, marginBottom: 8 }}>FASE 3 — ESCALA (MÊS 7-12)</div>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>Zona Sul completa + Barra. 15 academias, 500+ pagantes.</p>
            <p style={{ color: GREEN, fontWeight: 700 }}>Receita líquida projetada: R$ 76.500/mês.</p>
          </div>
        </Section>

        {/* QR Codes */}
        <Section title="QR Codes nos Equipamentos" icon={QrCode} defaultOpen>
          <p style={{ marginBottom: 14 }}>Escaneie para entrar direto no Desafio 90 Dias da academia. Os códigos são otimizados para leitura em telas e impressos.</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <a
              href="/desafio-21"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", padding: "10px 16px", borderRadius: 10, background: AMBER, color: "#111", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
            >
              Abrir cadastro público (grátis + senha gerada)
            </a>
            <a
              href="/gym/challenges"
              style={{ display: "inline-block", padding: "10px 16px", borderRadius: 10, border: `1px solid ${AMBER}40`, color: AMBER, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Ver conversão do QR (cadastros × pagantes)
            </a>
            <a
              href="/mce/business/challenges"
              style={{ display: "inline-block", padding: "10px 16px", borderRadius: 10, border: `1px solid ${AMBER}40`, color: AMBER, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Painel de desafios (status · participantes · pagantes)
            </a>
            <a
              href="/coach/social"
              style={{ display: "inline-block", padding: "10px 16px", borderRadius: 10, border: `1px solid ${AMBER}40`, color: AMBER, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              SOCIAL ON (conteúdo · calendário · publicar)
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 6 }}>
            {[
              {
                icon: Trophy,
                title: "Desafio da Academia",
                loc: "Cartaz / recepção / The Wall",
                url: "https://nutrion.app.br/desafio-21",
                desc: "Entre no Desafio 90 Dias",
                color: AMBER,
              },
              {
                icon: Smartphone,
                title: "App nutriON",
                loc: "Recepção / cartaz",
                url: "https://nutrion.app.br",
                desc: "Acesse o app completo",
                color: GREEN,
              },
              {
                icon: Dumbbell,
                title: "Cardio",
                loc: "Esteira / bike",
                url: "https://nutrion.app.br/audio-academy",
                desc: "MCE Audio durante o cardio",
                color: CYAN,
              },
              {
                icon: Camera,
                title: "Progresso",
                loc: "Espelho do vestiário",
                url: "https://nutrion.app.br/progress",
                desc: "Foto de progresso semanal",
                color: CYAN,
              },
            ].map((q) => (
              <div key={q.title} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${q.color}20`, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                  <q.icon size={18} style={{ color: q.color }} />
                  <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: "#fff" }}>{q.title}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>{q.loc}</div>

                <div style={{
                  display: "inline-flex",
                  padding: 10,
                  borderRadius: 12,
                  background: "#fff",
                  marginBottom: 10,
                }}>
                  <QRCodeSVG
                    value={q.url}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#05070C"
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div style={{ fontFamily: MONO, fontSize: 10, color: q.color, marginBottom: 4 }}>{q.desc}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.35)", wordBreak: "break-all" }}>{q.url}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Launch Event */}
        <Section title="Evento de Lançamento (30 min)" icon={Calendar}>
          <table className="business-table">
            <thead>
              <tr><th>Tempo</th><th>Ação</th></tr>
            </thead>
            <tbody>
              <tr><td>0-5 min</td><td>Apresentação: quem é o Diogo e qual problema resolve</td></tr>
              <tr><td>5-15 min</td><td>O MCE: Mindset, Comportamento, Execução</td></tr>
              <tr><td>15-20 min</td><td>O Desafio: ranking, competição, premiação</td></tr>
              <tr><td>20-25 min</td><td>Demonstração ao vivo: escanear QR e fazer onboarding</td></tr>
              <tr><td>25-30 min</td><td>Call to Action: escaneia agora e ganhe 7 dias de Premium</td></tr>
            </tbody>
          </table>
        </Section>

        {/* Funnel */}
        <Section title="Funil de Conversão" icon={TrendingUp}>
          <p>Exemplo para academia com 500 alunos:</p>
          <table className="business-table">
            <thead>
              <tr><th>Etapa</th><th>Volume</th><th>Taxa</th></tr>
            </thead>
            <tbody>
              <tr><td>Veem The Wall</td><td>200</td><td>40%</td></tr>
              <tr><td>Escaneiam QR Code</td><td>80</td><td>40%</td></tr>
              <tr><td>Se inscrevem FREE</td><td>60</td><td>75%</td></tr>
              <tr><td>Convertem PREMIUM (mês 1)</td><td>25</td><td>42%</td></tr>
              <tr><td>Convertem VIP</td><td>10</td><td>17%</td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: CYAN, marginBottom: 8 }}>RECEITA MÊS 1 POR ACADEMIA</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span>25 × R$ 149</span><span style={{ color: "#fff" }}>R$ 3.725</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span>10 × R$ 249</span><span style={{ color: "#fff" }}>R$ 2.490</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 8 }}>
              <span>Total bruto</span><span style={{ color: AMBER }}>R$ 6.215/mês</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
              <span>Comissão academia (25%)</span><span style={{ color: GREEN }}>R$ 1.554/mês</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>Receita nutriON (75%)</span><span style={{ color: "#fff" }}>R$ 4.661/mês</span>
            </div>
          </div>
        </Section>

        {/* Projections */}
        <Section title="Projeção 12 Meses" icon={BarChart3}>
          <table className="business-table">
            <thead>
              <tr><th>Período</th><th>Academias</th><th>Pagantes</th><th>Receita Líquida/mês</th></tr>
            </thead>
            <tbody>
              <tr><td>Mês 1-3 (Piloto)</td><td>3</td><td>105</td><td>R$ 13.500</td></tr>
              <tr><td>Mês 4-6 (Validação)</td><td>8</td><td>280</td><td>R$ 36.000</td></tr>
              <tr><td>Mês 7-12 (Escala)</td><td>15</td><td>600</td><td>R$ 76.500</td></tr>
            </tbody>
          </table>
          <p style={{ color: GREEN, fontWeight: 700, fontSize: 16, textAlign: "center", marginTop: 14 }}>
            RECEITA ANUAL PROJETADA: R$ 600.000+
          </p>
        </Section>

        {/* Why it works */}
        <Section title="Por Que Funciona" icon={Wallet}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 6 }}>
            {[
              { title: "Pra Academia", items: ["Retenção sobe 30-50%", "Receita extra sem trabalho", "Diferenciação", "Marketing orgânico", "Custo: ZERO"] },
              { title: "Pro Aluno", items: ["Vê resultado de verdade", "Competição saudável", "Comunidade", "Conteúdo de valor", "Transformação documentada"] },
              { title: "Pro nutriON", items: ["De 12 pra 600 clientes", "Presença física", "Marca vista por 10.000+/dia", "Receita recorrente", "Posicionamento líder MCE"] },
            ].map((b) => (
              <div key={b.title} style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: CYAN, marginBottom: 8 }}>{b.title}</div>
                <ul className="business-list" style={{ margin: 0 }}>
                  {b.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Next steps */}
        <Section title="Próximos Passos Imediatos" icon={Target} defaultOpen>
          <table className="business-table">
            <thead>
              <tr><th>Semana</th><th>Ações</th></tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>Landing page /gym, deck PDF, material gráfico, The Wall, QR Codes dinâmicos</td></tr>
              <tr><td>2</td><td>Mapear 10 academias alvo na Zona Sul, visitar 3, fechar piloto</td></tr>
              <tr><td>3</td><td>Instalar The Wall, preparar evento de lançamento, conteúdo pro @diogo.mell0</td></tr>
              <tr><td>4</td><td>Lançar Desafio 90 Dias, evento presencial, primeiro QR scan</td></tr>
            </tbody>
          </table>
        </Section>

        {/* Footer quote */}
        <div style={{ textAlign: "center", padding: "30px 0 40px" }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: "italic", color: "rgba(255,255,255,0.8)" }}>
            "Transformação é sistema. O comportamento vem antes do alimento."
          </p>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>
            Coach Diogo Mello · @diogo.mell0 · nutrion.app.br
          </div>
        </div>
        </>)}
      </div>
    </div>
  );
}
