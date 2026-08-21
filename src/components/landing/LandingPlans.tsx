import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { usePlanSlots } from "@/hooks/usePlanSlots";
import UpgradeModal from "@/components/landing/UpgradeModal";
import { Shield, Star, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NUTRIPLAN_SHORT: string[] = [
  "7 objetivos: Emagrecimento · Hipertrofia · Recomp · Performance · Saúde Geral · Gestante / Pós-parto",
  "TDEE farmacológico — 22 compostos com multiplicadores automáticos",
  "Crononutrição circadiana — cortisol, insulina e GH sincronizados",
  "GLUT-4 Sync — janela pós-treino calculada automaticamente",
  "Carb cycling automático — dias de treino vs descanso",
  "Perfil PCA comportamental — 4 perfis",
  "Banco TACO/IBGE — medidas caseiras com mapa de referência de gramatura",
  "Substituições inteligentes — até 16 por alimento com kcal equivalente",
  "Hidratação farmacológica — Na⁺ K⁺ Mg²⁺ ajustados ao protocolo",
  "Modo econômico — mesmas equivalências nutricionais com menor custo",
  "8 modos especiais: Peak Week · GLP-1 · Feminino · Vegano · Low-FODMAP · Longevidade · Cetogênico · Circadiano",
];

const NUTRIPLAN_FULL: { category: string; items: string[] }[] = [
  {
    category: "Objetivos e Cálculo Metabólico",
    items: [
      "7 objetivos prescritivos: Emagrecimento, Hipertrofia, Recomposição, Performance, Saúde Geral, Gestante, Pós-parto",
      "TDEE adaptativo com calibração diária por logs de peso reais",
      "TDEE farmacológico — 22 compostos com multiplicadores automáticos (GLP-1, T3, clenbuterol, MK-677, etc.)",
      "Projeção VENTA (7700 kcal/kg) com tracking semanal de desvio",
    ],
  },
  {
    category: "Crononutrição & Sincronização",
    items: [
      "Janelas circadianas: cortisol matinal, insulina pós-treino, GH noturno",
      "GLUT-4 Sync — janela anabólica pós-treino calculada por intensidade",
      "Carb cycling automático — alto em dias de treino, baixo em descanso",
      "Timing peri-workout: pré, intra e pós com macros específicos",
    ],
  },
  {
    category: "Banco de Alimentos & Substituições",
    items: [
      "Banco TACO + IBGE — alimentos 100% brasileiros regionais",
      "Medidas caseiras com mapa visual de referência de gramatura",
      "Até 16 substituições inteligentes por alimento com kcal equivalente",
      "Validação de macros automática em cada troca (delta P/C/G)",
      "Modo econômico — equivalências nutricionais com menor custo de mercado",
    ],
  },
  {
    category: "Perfil Comportamental PCA",
    items: [
      "4 perfis comportamentais (Disciplinado, Emocional, Social, Caótico)",
      "Plano adaptado por perfil — estrutura de refeições, frequência e flexibilidade",
      "Receitas personalizadas por perfil comportamental",
      "Alertas preditivos de sabotagem com base no perfil",
    ],
  },
  {
    category: "Hidratação & Eletrólitos",
    items: [
      "Hidratação farmacológica — Na⁺ K⁺ Mg²⁺ ajustados ao protocolo ativo",
      "Compensação de diurese (cafeína, GLP-1, ciclos farmacológicos)",
      "Alertas de desidratação preditivos por temperatura e atividade",
    ],
  },
  {
    category: "8 Modos Especiais",
    items: [
      "Peak Week — protocolo de palco com SRI automático D-7",
      "GLP-1 — proteína 1.8–2.2g/kg, faixa de saciedade ajustada",
      "Feminino — periodização por fase do ciclo, RED-S safety",
      "Vegano — combinação proteica completa + B12/ferro/ômega",
      "Low-FODMAP — protocolo 3 fases (eliminação · reintrodução · personalização)",
      "Longevidade — densidade nutricional, autofagia, restrição calórica suave",
      "Cetogênico — cetose induzida, eletrólitos reforçados",
      "Circadiano — refeições alinhadas ao cronotipo individual",
    ],
  },
];

const TRAININGON_PILLS = [
  "Prescrição", "Readiness", "Fibras", "Sistemas", "STRATUM",
  "Competição", "Progressão", "Volume", "Histórico",
];

const TRAININGON_SHORT: string[] = [
  "Inclui 100% do NUTRIPLAN (plano ON+) — treino e dieta no mesmo sistema",
  "6 fases de treinamento: Bulking · Cutting · Manutenção · Recomposição · Emagrecimento · Performance",
  "27 sistemas de treino em 5 categorias: Periodização · Força Lendária · Hipertrofia Específica · Atlético/Olímpico · Bodybuilding Clássico",
  "Sistemas inclusos: Linear · DUP · WUP · Westside · Bloco · APRE · 5/3/1 Wendler · Smolov · Texas Method · GVT · DC Training · Mountain Dog · RP · Doggcrapp · EDT · Heavy Duty · Weider · Flushing · Staggered · VBT · Bulgarian e mais 6 especializados",
  "13 músculos prioritários configuráveis: Peitoral · Costas · Deltoides · Bíceps · Tríceps · Quadríceps · Posterior · Glúteos · Panturrilha · Core · Trapézio · Antebraço · Romboides",
  "Protocolo corretivo APEX integrado — exercícios corretivos injetados automaticamente no treino",
  "Verificação de compatibilidade — detecta conflitos entre sistema escolhido e restrições do aluno",
  "Readiness diário — score de prontidão antes de cada sessão",
  "Análise de fibras musculares — dominância Tipo I · IIA · IIX",
  "STRATUM — 7 camadas de periodização (módulo ADM)",
  "Competição — prep para palco (módulo ADM)",
  "Progressão e LoadTracker Pro",
  "Volume por grupo muscular",
  "Histórico completo de sessões",
  "Painel coach — até 30 alunos",
  "Relatório PDF mensal por aluno",
  "Protocolo farmacológico integrado — IA ajusta volume e intensidade conforme compostos ativos",
  "2 check-ins mensais por vídeo/áudio com o Coach humano",
  "Canal prioritário com o Coach — resposta em até 24h",
];

const TRAININGON_SYSTEMS: { category: string; items: { name: string; desc: string }[] }[] = [
  {
    category: "Periodização",
    items: [
      { name: "Linear", desc: "Progressão clássica de carga semanal — base universal." },
      { name: "DUP (Daily Undulating Periodization)", desc: "Variação diária de volume/intensidade na mesma semana." },
      { name: "WUP (Weekly Undulating Periodization)", desc: "Ondulação semanal de estímulo — força, hipertrofia, potência." },
      { name: "Block Periodization", desc: "Blocos sequenciais focados (acumulação · transmutação · realização)." },
      { name: "Conjugate (Westside)", desc: "Max Effort + Dynamic Effort + Repetition — Louie Simmons." },
      { name: "APRE (Autoregulatory Progressive Resistance Exercise)", desc: "Auto-regulação por desempenho real do dia." },
    ],
  },
  {
    category: "Força Lendária",
    items: [
      { name: "5/3/1 Wendler", desc: "Ciclos de 4 semanas com TM (Training Max) e PRs por AMRAP." },
      { name: "Smolov", desc: "Programa russo brutal de agachamento — 13 semanas." },
      { name: "Texas Method", desc: "Volume na segunda, recuperação na quarta, intensidade na sexta." },
      { name: "Bulgarian Method", desc: "Máxima diária, alta frequência — atletismo de força." },
      { name: "VBT (Velocity Based Training)", desc: "Prescrição baseada em velocidade da barra." },
    ],
  },
  {
    category: "Hipertrofia Específica",
    items: [
      { name: "GVT (German Volume Training)", desc: "10x10 — choque hipertrófico clássico." },
      { name: "RP (Renaissance Periodization)", desc: "MV · MEV · MAV · MRV — volume por mesociclo." },
      { name: "DC Training (Doggcrapp)", desc: "Rest-pause + extreme stretching, baixa frequência alta intensidade." },
      { name: "Mountain Dog (John Meadows)", desc: "Pré-exaustão, ângulos múltiplos, conexão neuromuscular." },
      { name: "EDT (Escalating Density Training)", desc: "PR Zones — mais trabalho no mesmo tempo." },
      { name: "Heavy Duty (Mike Mentzer)", desc: "Uma série até a falha absoluta, baixíssima frequência." },
    ],
  },
  {
    category: "Atlético / Olímpico",
    items: [
      { name: "Olympic Weightlifting", desc: "Snatch e Clean & Jerk — periodização técnica." },
      { name: "Tier System (Joe Kenn)", desc: "Total · Upper · Lower em rotação para atletas." },
      { name: "Triphasic Training (Cal Dietz)", desc: "Excêntrico · Isométrico · Concêntrico." },
      { name: "PHA (Peripheral Heart Action)", desc: "Circuito alternando membros superior/inferior." },
    ],
  },
  {
    category: "Bodybuilding Clássico",
    items: [
      { name: "Sistema Weider", desc: "Princípios fundadores do BB — pirâmide, superséries, drop sets." },
      { name: "Flushing", desc: "Múltiplos exercícios consecutivos para um único grupo." },
      { name: "Staggered Sets", desc: "Intercalar grupos atrasados entre séries principais." },
      { name: "Pre-Exhaustion", desc: "Isolador antes do composto — falha muscular precoce." },
      { name: "Giant Sets", desc: "4+ exercícios em sequência para o mesmo grupo." },
      { name: "FST-7 (Hany Rambod)", desc: "7 séries finais com pump máximo para expansão fascial." },
    ],
  },
];

const MCE_BLOCKS: { icon: string; title: string; items: string[]; bonus?: boolean }[] = [
  {
    icon: "🍽",
    title: "NUTRIPLAN",
    items: [
      "7 objetivos de protocolo",
      "TDEE farmacológico automático",
      "Crononutrição circadiana",
      "GLUT-4 Sync pós-treino",
      "Carb cycling automático",
      "Banco TACO/IBGE",
      "Substituições inteligentes",
      "Perfil PCA comportamental",
      "8 modos especiais",
      "Medidas caseiras automáticas",
    ],
  },
  {
    icon: "⚡",
    title: "TRAININGON",
    items: [
      "27 sistemas de treino",
      "6 fases de treinamento",
      "13 músculos prioritários",
      "Readiness diário",
      "LoadTracker Pro",
      "Fibras musculares",
      "Progressão automática",
      "Histórico de sessões",
    ],
  },
  {
    icon: "👁",
    title: "APEX VISUAL",
    items: [
      "Análise postural por foto",
      "33 landmarks biomecânicos",
      "Protocolo corretivo 4 fases",
      "Exercícios contraindicados bloqueados automaticamente",
      "Cadeia cinética detectada",
      "FCS — Fenner Clinical Score",
      "Plano mestre de evolução",
      "Análises ilimitadas",
    ],
  },
  {
    icon: "🦠",
    title: "MICROBIOTA — GUT-BRAIN",
    bonus: true,
    items: [
      "Análise em 4 dimensões",
      "Eixo intestino-cérebro",
      "Modulação por nutrição",
      "Prebióticos e probióticos",
      "Protocolo personalizado",
      "Impacto em composição corporal",
    ],
  },
  {
    icon: "🌿",
    title: "FITOTERÁPICOS",
    bonus: true,
    items: [
      "100+ fitoterápicos catalogados",
      "Adaptógenos e nootropics",
      "Mecanismos de ação completos",
      "Dosagens e protocolos",
      "Interações com fármacos",
      "Oracle IA ilimitado",
    ],
  },
];

const plans: any[] = [
  {
    name: "MCE Coaching",
    mce: true,
    subtitle: "Sistema Integrado de Performance Humana",
    badge: "CONSULTORIA 1:1",
    price: "R$247",
    featured: false,
    checkoutUrl: "https://pay.kiwify.com.br/Y1e8Oi6",
    blocks: MCE_BLOCKS,
    cta: "Começar agora →",
  },
  {
    name: "ON +", price: "R$97", oldPrice: "R$147", discount: "34% off", featured: true,
    slotKey: "on_plus",
    checkoutUrl: "https://pay.kiwify.com.br/S3AGTbz",
    badge: "PREÇO DE FUNDADOR",
    cta: "Garantir vaga de fundador →",
  },
  {
    name: "ON PRO", price: "R$97", oldPrice: "R$147", discount: "34% off", featured: false,
    slotKey: "on_pro",
    checkoutUrl: "https://pay.kiwify.com.br/boprEBl",
    badge: "VAGAS LIMITADAS",
    cta: "Quero acompanhamento real →",
  },
];

const LandingPlans = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const navigate = useNavigate();
  const { getRemaining } = usePlanSlots();
  const [modal, setModal] = useState<{ open: boolean; plan: string; feature: string }>({ open: false, plan: "", feature: "" });
  const [nutriplanOpen, setNutriplanOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);

  const slotBadge = (planKey: string | undefined) => {
    if (!planKey) return null;
    const remaining = getRemaining(planKey);
    if (remaining === null) return null;
    return remaining <= 0
      ? "ESGOTADO"
      : `🔥 ${remaining} VAGAS RESTANTES`;
  };

  return (
    <section id="plans" className="bg-[#080814] px-6 md:px-12 py-[120px]">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
        <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
          <span className="w-4 h-px bg-primary" />Planos e preços
        </div>
        <h2 className="font-heading leading-[.92] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
          SIMPLES.<br /><span className="text-primary">SEM SURPRESA.</span>
        </h2>
      </motion.div>

      <div className="mb-12" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-[#03030a] border rounded-xl p-8 md:p-9 relative overflow-hidden transition-all hover:-translate-y-1 ${
              plan.mce
                ? ""
                : plan.featured
                ? "border-primary/30 bg-primary/[.02]"
                : "border-[#14142a] hover:border-[#2a2a4a]"
            }`}
            style={
              plan.mce
                ? { borderColor: "#B8922A", boxShadow: "0 0 30px #B8922A20" }
                : undefined
            }
          >
            {plan.mce && (
              <div className="absolute top-4 right-4">
                <span
                  className="font-mono text-[.55rem] px-2 py-1 rounded-[2px] tracking-[.1em] font-bold"
                  style={{ background: "#B8922A", color: "#0a0a1a" }}
                >
                  {plan.badge}
                </span>
              </div>
            )}
            {(plan.badge || plan.slotKey) && !plan.mce && (
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                {plan.badge && (
                  <span className="font-mono text-[.55rem] text-black bg-primary px-2 py-1 rounded-[2px] tracking-[.1em]">{plan.badge}</span>
                )}
                {plan.slotKey && slotBadge(plan.slotKey) && (
                  <span className={`font-mono text-[.55rem] px-2 py-1 rounded-[2px] tracking-[.1em] animate-pulse ${
                    getRemaining(plan.slotKey) === 0
                      ? "bg-red-500 text-white"
                      : "bg-[#1a1a2e] text-primary border border-primary/30"
                  }`}>
                    {slotBadge(plan.slotKey)}
                  </span>
                )}
              </div>
            )}
            {plan.name === "ON +" ? (
              <div className="mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-heading text-[1.25rem] tracking-[.06em] text-[#f0edf8] leading-tight">
                    NUTRIPLAN INTELLIGENCE SYSTEM
                  </div>
                  <span className="font-mono text-[.55rem] text-black bg-primary px-1.5 py-0.5 rounded-[2px] tracking-[.1em] font-bold">PRO</span>
                </div>
                <div className="font-mono text-[.6rem] text-[#6060a0] mt-1.5 leading-relaxed">
                  Geração Avançada · Nutrição Esportiva · Protocolo PCA · Crononutrição
                </div>
                <div className="mt-2 inline-flex items-center gap-2 font-mono text-[.72rem] font-semibold tracking-wide px-2.5 py-1 rounded-md bg-[#4a8a5a]/15 text-[#7dd3a0] border border-[#4a8a5a]/25">
                  <span className="w-2 h-2 rounded-full bg-[#7dd3a0] animate-pulse" />
                  Para nutricionistas e nutrition coaches
                </div>
              </div>
            ) : plan.name === "ON PRO" ? (
              <div className="mb-1.5">
                <div className="font-heading text-[1.5rem] tracking-[.06em] text-[#f0edf8] leading-tight">
                  TRAINING<span style={{ color: "#1D9E75" }}>ON</span>
                </div>
                <div className="font-mono text-[.55rem] mt-1.5 tracking-[.08em]" style={{ color: "#1D9E75" }}>
                  MOTOR DE PRESCRIÇÃO DE ELITE v2.4
                </div>
                <div className="font-mono text-[.6rem] text-[#6060a0] mt-1.5 leading-relaxed">
                  Prescrição individualizada · 27 sistemas · STRATUM 7 camadas
                </div>
                <div className="mt-2 inline-flex items-center gap-2 font-mono text-[.72rem] font-semibold tracking-wide px-2.5 py-1 rounded-md bg-[#1D9E75]/15 text-[#4adeb0] border border-[#1D9E75]/25">
                  <span className="w-2 h-2 rounded-full bg-[#4adeb0] animate-pulse" />
                  Para personais e treinadores
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {TRAININGON_PILLS.map((p) => (
                    <span
                      key={p}
                      className="font-mono text-[.55rem] px-1.5 py-0.5 rounded-[2px] tracking-wider"
                      style={{ background: "#1D9E7510", border: "1px solid #1D9E7530", color: "#1D9E75" }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ) : plan.mce ? (
              <div className="mb-1.5">
                <div className="font-heading text-[1.5rem] tracking-[.06em] leading-tight" style={{ color: "#B8922A" }}>
                  MCE COACHING
                </div>
                <div className="font-mono text-[.65rem] text-[#8a8aa8] mt-1.5 leading-relaxed">
                  {plan.subtitle}
                </div>
              </div>
            ) : (
              <div className="font-heading text-[1.5rem] tracking-[.08em] mb-1.5 text-[#f0edf8]">{plan.name}</div>
            )}

            {/* Price with anchoring */}
            {plan.name === "ON PRO" ? (
              <div className="my-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[.7rem] text-[#50507a] line-through">R$147</span>
                  <span className="font-heading text-[2.4rem] leading-none font-bold" style={{ color: "#1D9E75" }}>R$97</span>
                  <span className="font-mono text-[.65rem] text-[#50507a]">/mês</span>
                  <span
                    className="font-mono text-[.6rem] px-2 py-0.5 rounded-sm tracking-[.05em]"
                    style={{ background: "#1D9E7520", border: "1px solid #1D9E7540", color: "#1D9E75" }}
                  >
                    34% OFF
                  </span>
                </div>
                <div className="font-mono text-[.65rem] text-[#7070a0] mt-2">
                  ou R$970/ano — 2 meses grátis
                </div>
                <div className="font-mono text-[.6rem] text-[#6060a0] mt-2.5 leading-relaxed">
                  Vagas limitadas — sobe para R$147 quando as vagas esgotarem.
                </div>
              </div>
            ) : plan.mce ? (
              <div className="my-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-heading text-[3.5rem] leading-none" style={{ color: "#B8922A" }}>{plan.price}</span>
                  <span className="font-mono text-[.65rem] text-[#50507a]">/mês</span>
                </div>
              </div>
            ) : (
              <div className="my-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-heading text-[3.5rem] text-primary leading-none">{plan.price}</span>
                  <span className="font-mono text-[.65rem] text-[#50507a]">/mês</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-mono text-[.7rem] text-[#50507a] line-through">{plan.oldPrice}</span>
                  <span className="font-mono text-[.6rem] text-primary bg-primary/10 px-2 py-0.5 rounded-sm tracking-[.05em]">
                    {plan.discount}
                  </span>
                </div>
              </div>
            )}

            {plan.mce ? (
              <div className="flex flex-col gap-4 mb-6">
                {plan.blocks.map((block: any) => (
                  <div key={block.title}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-mono font-bold text-[10px] tracking-[.1em]" style={{ color: "#B8922A" }}>
                        {block.icon} {block.title}
                      </div>
                      {block.bonus && (
                        <span
                          className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] tracking-[.1em]"
                          style={{ background: "#1D9E7520", border: "1px solid #1D9E7560", color: "#1D9E75" }}
                        >
                          BÔNUS
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {block.items.map((t: string) => (
                        <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                          <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#B8922A" }}>✓</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : plan.name === "ON +" ? (
              <>
                <ul className="flex flex-col gap-2 mb-3">
                  {NUTRIPLAN_SHORT.map((text, i) => (
                    <li key={i} className="text-[.78rem] flex items-start gap-2 font-landing text-[#8585b0] leading-snug">
                      <span className="text-[.7rem] mt-0.5 shrink-0 text-primary">✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                  <li
                    className="text-[.78rem] flex items-start gap-2 font-landing text-[#40405a] cursor-pointer hover:text-[#6060a0] transition-colors"
                    onClick={() => setModal({ open: true, plan: "ON +", feature: "Acesso ao Coach" })}
                  >
                    <span className="text-[.7rem] mt-0.5 shrink-0 text-[#40405a]">✗</span>
                    <span>Acesso ao Coach humano 🔒</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setNutriplanOpen(true)}
                  className="w-full text-center py-2 mb-6 rounded border text-[11px] font-mono tracking-wider transition-colors hover:border-primary/40 hover:text-[#aaa]"
                  style={{ background: "transparent", borderColor: "#ffffff20", color: "#888" }}
                >
                  Ver tudo incluído →
                </button>
              </>
            ) : plan.name === "ON PRO" ? (
              <>
                <ul className="flex flex-col gap-2 mb-3">
                  {TRAININGON_SHORT.map((text, i) => (
                    <li key={i} className="text-[.78rem] flex items-start gap-2 font-landing text-[#8585b0] leading-snug">
                      <span className="text-[.7rem] mt-0.5 shrink-0" style={{ color: "#1D9E75" }}>✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setTrainingOpen(true)}
                  className="w-full text-center py-2 mb-6 rounded border text-[11px] font-mono tracking-wider transition-colors hover:border-[#1D9E7560] hover:text-[#aaa]"
                  style={{ background: "transparent", borderColor: "#ffffff20", color: "#888" }}
                >
                  Ver todos os 27 sistemas →
                </button>
              </>
            ) : null}
            <a
              href={plan.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-center py-3.5 rounded font-mono text-[.72rem] tracking-[.08em] transition-all ${
                plan.mce
                  ? "font-bold hover:scale-[1.01]"
                  : plan.featured
                  ? "bg-primary text-black font-medium hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary"
                  : "border border-[#2a2a4a] text-[#50507a] hover:border-primary hover:text-primary"
              }`}
              style={plan.mce ? { background: "#B8922A", color: "#0a0a1a" } : undefined}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      {/* ===== SEÇÃO PLANOS PROFISSIONAIS ===== */}
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px" style={{ background: "#B8922A30" }} />
          <span className="font-mono text-[.65rem] tracking-[.2em] uppercase" style={{ color: "#B8922A" }}>
            Planos Premium
          </span>
          <div className="flex-1 h-px" style={{ background: "#B8922A30" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARD — NUTRION PERFORMANCE */}
          <div
            className="relative rounded-xl p-6 overflow-hidden transition-all hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #0d0d1f 0%, #1a0f00 100%)",
              border: "1.5px solid #FF6B0055",
              boxShadow: "0 0 30px #FF6B0010",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-mono text-[10px] font-bold rounded-full px-2.5 py-0.5"
                style={{ background: "#FF6B0020", border: "1px solid #FF6B0055", color: "#FF6B00" }}
              >
                PROFISSIONAL
              </span>
              <span
                className="font-mono text-[10px] font-bold rounded-full px-2.5 py-0.5"
                style={{ background: "#FF6B00", color: "#0a0a1a" }}
              >
                PERFORMANCE COMPLETO
              </span>
            </div>

            <div className="font-heading font-bold text-white text-[24px] leading-none tracking-wide">PERFORMANCE</div>
            <div className="font-mono text-[11px] mt-1.5" style={{ color: "#888" }}>
              NutriPlan · TrainingON · APEX Visual
            </div>

            <div className="mt-5">
              <div className="font-heading font-bold text-[32px] leading-none" style={{ color: "#FF6B00" }}>
                R$147<span className="text-[14px] font-mono font-normal">/mês</span>
              </div>
              <div className="text-[11px] mt-2" style={{ color: "#888" }}>
                ou R$1.470/ano — 2 meses grátis · 24% off vs. separados (R$194)
              </div>
            </div>

            <div style={{ height: "0.5px", background: "#ffffff10", margin: "14px 0" }} />

            <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#1D9E75" }}>
              🍽 NUTRIPLAN
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {["7 objetivos de protocolo","TDEE farmacológico automático","Crononutrição circadiana","GLUT-4 Sync pós-treino","Carb cycling automático","Banco TACO/IBGE","Substituições inteligentes","Perfil PCA comportamental","8 modos especiais","Medidas caseiras automáticas"].map((t) => (
                <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                  <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#1D9E75" }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#1D9E75" }}>
              ⚡ TRAININGON
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {["27 sistemas de treino","6 fases de treinamento","13 músculos prioritários","Readiness diário","LoadTracker Pro","Fibras musculares","Progressão automática","Histórico de sessões"].map((t) => (
                <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                  <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#1D9E75" }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#00D4FF" }}>
              👁 APEX VISUAL
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {["Análise postural por foto","33 landmarks biomecânicos","Protocolo corretivo 4 fases","Exercícios contraindicados bloqueados automaticamente","Cadeia cinética detectada","FCS — Fenner Clinical Score","Plano mestre de evolução","Análises ilimitadas"].map((t) => (
                <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                  <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#00D4FF" }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#FF6B00" }}>
              📊 PAINEL COACH
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {["Até 30 alunos simultâneos","Gestão completa de alunos","Score de aderência por aluno","Alertas automáticos de risco","Relatório PDF mensal automático","Check-in dos alunos em tempo real","Diário fotográfico por aluno","Histórico completo por aluno"].map((t) => (
                <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                  <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#FF6B00" }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://pay.kiwify.com.br/DjoJxnu"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center font-bold text-[14px] rounded-lg transition-all hover:scale-[1.01]"
              style={{ background: "#FF6B00", color: "#0a0a1a", padding: "14px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FF8533")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FF6B00")}
            >
              COMEÇAR COMO PROFISSIONAL →
            </a>
            <p className="text-center text-[10px] mt-3" style={{ color: "#888" }}>
              Cancele quando quiser.<br />Sem fidelidade. Acesso imediato.
            </p>
          </div>

          {/* CARD — MASTER */}
          <div
            className="relative rounded-xl p-6 overflow-hidden transition-all hover:-translate-y-1 md:col-span-2"
            style={{
              background: "linear-gradient(135deg, #0d0d1f 0%, #1a0f00 100%)",
              border: "1.5px solid #7C3AED55",
              boxShadow: "0 0 30px #7C3AED10",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-mono text-[10px] font-bold rounded-full px-2.5 py-0.5"
                style={{ background: "#7C3AED20", border: "1px solid #7C3AED55", color: "#7C3AED" }}
              >
                PROFISSIONAL
              </span>
              <span
                className="font-mono text-[10px] font-bold rounded-full px-2.5 py-1"
                style={{ background: "#7C3AED", color: "#0a0a1a" }}
              >
                MASTER
              </span>
            </div>

            <div className="font-heading font-bold text-white text-[24px] leading-none tracking-wide">MASTER</div>
            <div className="font-mono text-[11px] mt-1.5" style={{ color: "#888" }}>
              Todos os módulos. Sem restrições. Alunos ilimitados.
            </div>

            <div className="mt-5">
              <div className="font-heading font-bold text-[32px] leading-none" style={{ color: "#7C3AED" }}>
                R$197<span className="text-[14px] font-mono font-normal">/mês</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="text-[11px]" style={{ color: "#888" }}>
                  ou R$1.970/ano — 2 meses grátis
                </div>
                <span
                  className="font-mono text-[10px] font-bold"
                  style={{
                    background: "#1D9E7520",
                    border: "0.5px solid #1D9E7540",
                    color: "#1D9E75",
                    borderRadius: "99px",
                    padding: "2px 8px",
                  }}
                >
                  ECONOMIZE R$244/mês
                </span>
              </div>
            </div>

            <div style={{ height: "0.5px", background: "#ffffff10", margin: "14px 0" }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#1D9E75" }}>
                  🍽 NUTRIPLAN
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "NutriPlan Intelligence System completo",
                    "TDEE farmacológico",
                    "Crononutrição circadiana",
                    "GLUT-4 Sync",
                    "Carb cycling automático",
                    "Banco TACO/IBGE",
                    "8 modos especiais",
                    "PCA Comportamental",
                    "Medidas caseiras automáticas",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#1D9E75" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#1D9E75" }}>
                  ⚡ TRAININGON
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "27 sistemas de treino",
                    "STRATUM — 7 camadas",
                    "6 fases de treinamento",
                    "LoadTracker Pro",
                    "Fibras musculares",
                    "Readiness diário",
                    "Progressão automática",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#1D9E75" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#00D4FF" }}>
                  👁 APEX VISUAL INTELLIGENCE
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "33 landmarks biomecânicos",
                    "Protocolo corretivo 4 fases",
                    "Cadeia cinética detectada",
                    "FCS — Fenner Clinical Score",
                    "Plano mestre de evolução",
                    "Análises ilimitadas",
                    "Comparativo de evolução",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#00D4FF" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#7C3AED" }}>
                  ⚗ DR. VERTEX
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "85+ compostos farmacológicos",
                    "Auditoria de protocolo",
                    "Análise de sinergia",
                    "Alertas de interação",
                    "Damage Control por órgão",
                    "Periodização farmacológica",
                    "PCT completo",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#7C3AED" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#7C3AED" }}>
                  🧬 DR. NEXUS — PEPTIDEVAULT
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "132 peptídeos catalogados",
                    "Bioreguladores de Khavinson",
                    "Blends de cutting elite",
                    "Senolíticos e FOXO4-DRI",
                    "Oracle IA ilimitado",
                    "Mecanismos moleculares",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#7C3AED" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#7C3AED" }}>
                  🦠 MICROBIOTA — GUT-BRAIN
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "Análise em 4 dimensões",
                    "Eixo intestino-cérebro",
                    "Modulação por nutrição",
                    "Prebióticos e probióticos",
                    "Protocolo personalizado",
                    "Impacto em composição corporal",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#7C3AED" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#7C3AED" }}>
                  🌿 FITOTERÁPICOS
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "100+ fitoterápicos catalogados",
                    "Adaptógenos e nootropics",
                    "Mecanismos de ação completos",
                    "Dosagens e protocolos",
                    "Interações com fármacos",
                    "Oracle IA ilimitado",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#7C3AED" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ height: "0.5px", background: "#ffffff10", margin: "14px 0" }} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              <div>
                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#7C3AED" }}>
                  🦴 BIOMECHANICS VAULT
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "Biblioteca biomecânica completa",
                    "Análise de movimento",
                    "Padrões de recrutamento muscular",
                    "Integração com APEX Visual",
                    "Referências científicas",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#7C3AED" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#7C3AED" }}>
                  📊 PAINEL COACH ELITE
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "Alunos ilimitados",
                    "Gestão completa",
                    "Alertas automáticos",
                    "Relatórios PDF automáticos",
                    "Check-in em tempo real",
                    "Diário fotográfico por aluno",
                    "Histórico completo",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#7C3AED" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono font-bold text-[10px] tracking-[.1em] mb-2" style={{ color: "#7C3AED" }}>
                  EXTRAS
                </div>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {[
                    "Módulo feminino completo",
                    "Lab Intelligence",
                    "Loja interna de materiais",
                    "Acesso antecipado a novos módulos",
                    "Suporte prioritário",
                  ].map((t) => (
                    <li key={t} className="text-[12px] flex items-start gap-2 font-landing text-[#a0a0c0] leading-snug">
                      <span className="text-[11px] mt-0.5 shrink-0" style={{ color: "#7C3AED" }}>✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href="https://pay.kiwify.com.br/rJ3fQZq"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center font-bold text-[14px] rounded-lg transition-all hover:scale-[1.01] mt-2"
              style={{ background: "#7C3AED", color: "#0a0a1a", padding: "14px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#9361F5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#7C3AED")}
            >
              COMEÇAR COMO PROFISSIONAL →
            </a>
            <p className="text-center text-[10px] mt-3" style={{ color: "#888" }}>
              Cancele quando quiser.<br />Sem fidelidade. Acesso imediato.
            </p>
          </div>
        </div>
      </div>



      {/* Trust bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-12 py-4">
        <div className="flex items-center gap-2 text-[.7rem] font-mono text-[#50507a]">
          <Shield className="w-3.5 h-3.5 text-primary/60" />
          Cancele quando quiser
        </div>
        <div className="flex items-center gap-2 text-[.7rem] font-mono text-[#50507a]">
          <Star className="w-3.5 h-3.5 text-primary/60" />
          Pagamento seguro via Kiwify
        </div>
        <div className="flex items-center gap-2 text-[.7rem] font-mono text-[#50507a]">
          <Zap className="w-3.5 h-3.5 text-primary/60" />
          Acesso imediato após confirmação
        </div>
      </div>

      <UpgradeModal
        open={modal.open}
        onClose={() => setModal({ open: false, plan: "", feature: "" })}
        fromPlan={modal.plan}
        lockedFeature={modal.feature}
      />

      <Dialog open={nutriplanOpen} onOpenChange={setNutriplanOpen}>
        <DialogContent className="max-w-2xl bg-[#0a0a18] border-[#2a2a4a] text-[#e0e0f0] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-[1.3rem] tracking-[.06em] text-[#f0edf8] flex items-center gap-2 flex-wrap">
              NUTRIPLAN INTELLIGENCE SYSTEM
              <span className="font-mono text-[.55rem] text-black bg-primary px-1.5 py-0.5 rounded-[2px] tracking-[.1em] font-bold">PRO</span>
            </DialogTitle>
            <p className="font-mono text-[.65rem] text-[#7070a0] tracking-wide mt-1">
              Tudo o que está incluído no sistema
            </p>
          </DialogHeader>
          <Accordion type="multiple" defaultValue={[NUTRIPLAN_FULL[0].category]} className="w-full mt-2">
            {NUTRIPLAN_FULL.map((cat) => (
              <AccordionItem key={cat.category} value={cat.category} className="border-[#1f1f3a]">
                <AccordionTrigger className="text-[.85rem] font-landing text-[#f0edf8] hover:text-primary hover:no-underline">
                  {cat.category}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-2 pt-1">
                    {cat.items.map((it, i) => (
                      <li key={i} className="text-[.78rem] flex items-start gap-2 text-[#8585b0] leading-snug font-landing">
                        <span className="text-primary text-[.7rem] mt-0.5 shrink-0">✓</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DialogContent>
      </Dialog>

      <Dialog open={trainingOpen} onOpenChange={setTrainingOpen}>
        <DialogContent className="max-w-2xl bg-[#0a0a18] border-[#2a2a4a] text-[#e0e0f0] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-[1.3rem] tracking-[.06em] text-[#f0edf8] flex items-center gap-2 flex-wrap">
              TRAININGON
              <span className="font-mono text-[.55rem] px-1.5 py-0.5 rounded-[2px] tracking-[.1em] font-bold" style={{ background: "#1D9E7520", border: "1px solid #1D9E7540", color: "#1D9E75" }}>
                27 SISTEMAS
              </span>
            </DialogTitle>
            <p className="font-mono text-[.65rem] text-[#7070a0] tracking-wide mt-1">
              Sistemas de treino organizados em 5 categorias
            </p>
          </DialogHeader>
          <Accordion type="multiple" defaultValue={[TRAININGON_SYSTEMS[0].category]} className="w-full mt-2">
            {TRAININGON_SYSTEMS.map((cat) => (
              <AccordionItem key={cat.category} value={cat.category} className="border-[#1f1f3a]">
                <AccordionTrigger className="text-[.85rem] font-landing text-[#f0edf8] hover:no-underline" style={{ color: "#f0edf8" }}>
                  <span className="flex items-center gap-2">
                    <span style={{ color: "#1D9E75" }}>▸</span>
                    {cat.category}
                    <span className="font-mono text-[.6rem] text-[#6060a0]">({cat.items.length})</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-3 pt-1">
                    {cat.items.map((it, i) => (
                      <li key={i} className="text-[.78rem] flex flex-col gap-0.5 leading-snug font-landing">
                        <span className="font-semibold text-[#f0edf8]">{it.name}</span>
                        <span className="text-[#8585b0]">{it.desc}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default LandingPlans;
