import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const plans = [
  {
    name: "Básico", price: "R$37", featured: false,
    features: [
      "Dashboard HUD + macros em tempo real",
      "Log de refeições + banco TACO/IBGE",
      "Evolução de peso com gráfico",
      "Anamnese inteligente (IA)",
      { text: "Chat IA <strong>50 msgs/mês</strong>" },
      "Receitas e plano semanal básico",
    ],
    cta: "Começar grátis →",
  },
  {
    name: "Pro", price: "R$97", featured: true,
    features: [
      { text: "<strong>Tudo do Básico</strong> +" },
      "10 protocolos de dieta + motor kcal",
      "Coach humano integrado",
      "Wearables · Sono · Cronobiologia",
      "IA lê exames de sangue",
      "Gamificação completa + ranking",
      "Modo família (3 perfis)",
      "Diário fotográfico + slider",
      "Stack de suplementação IA",
      "Lista de compras + custo da dieta",
      { text: "Chat IA <strong>ilimitado</strong>" },
    ],
    cta: "Começar agora →",
  },
  {
    name: "Profissional", price: "R$197", featured: false,
    features: [
      { text: "<strong>Tudo do Pro</strong> +" },
      { text: "Para <strong>Coaches, Nutricionistas e Personais</strong>" },
      { text: "Painel com até <strong>30 pacientes/alunos</strong>" },
      "Alertas automáticos de risco por perfil",
      "IA gera prescrição e sugere feedback",
      { text: "Plano com <strong>assinatura do profissional</strong>" },
      "Relatórios PDF prontos para consulta",
      "White label — sua marca no app",
      "Exportação de dados do paciente",
      "Suporte prioritário 24h",
    ],
    cta: "Criar conta profissional →",
  },
];

const LandingPlans = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const navigate = useNavigate();

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-[#03030a] border rounded-xl p-8 md:p-9 relative overflow-hidden transition-all hover:-translate-y-1 ${
              plan.featured ? "border-primary/30 bg-primary/[.02]" : "border-[#14142a] hover:border-[#2a2a4a]"
            }`}
          >
            {plan.featured && (
              <span className="absolute top-4 right-4 font-mono text-[.55rem] text-black bg-primary px-2 py-1 rounded-[2px] tracking-[.1em]">MAIS POPULAR</span>
            )}
            <div className="font-heading text-[1.5rem] tracking-[.08em] mb-1.5 text-[#f0edf8]">{plan.name}</div>
            <div className="my-5">
              <span className="font-heading text-[3.5rem] text-primary leading-none">{plan.price}</span>
              <span className="font-mono text-[.65rem] text-[#50507a]">/mês</span>
            </div>
            <ul className="flex flex-col gap-2.5 mb-8">
              {plan.features.map((f, i) => {
                const text = typeof f === "string" ? f : f.text;
                return (
                  <li key={i} className="text-[.82rem] text-[#7070a0] flex items-start gap-2 font-landing">
                    <span className="text-primary text-[.7rem] mt-0.5 shrink-0">→</span>
                    <span className="[&_strong]:text-[#f0edf8]" dangerouslySetInnerHTML={{ __html: text }} />
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => navigate("/auth")}
              className={`block w-full text-center py-3.5 rounded font-mono text-[.72rem] tracking-[.08em] transition-all ${
                plan.featured
                  ? "bg-primary text-black font-medium hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary"
                  : "border border-[#2a2a4a] text-[#50507a] hover:border-primary hover:text-primary"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LandingPlans;
