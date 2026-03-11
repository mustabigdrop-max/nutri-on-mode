import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Palette, Globe, Shield, Brain, BarChart3, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "nutriON Coach",
    description: "Painel com marca nutriON",
    badge: "Coach Pro",
    tiers: [
      { patients: "até 30 pacientes", price: "R$297", period: "/mês" },
      { patients: "até 100 pacientes", price: "R$497", period: "/mês" },
      { patients: "ilimitado", price: "R$997", period: "/mês" },
    ],
    features: [
      "Dashboard de pacientes completo",
      "Alertas inteligentes por IA",
      "Geração de protocolos com IA",
      "Chat com pacientes",
      "Relatórios automáticos",
      "Score de execução por paciente",
      "Gestão de exames",
      "Briefings semanais por IA",
    ],
    highlight: false,
  },
  {
    name: "nutriON White Label",
    description: "App com sua marca própria",
    badge: "White Label Partner",
    tiers: [
      { patients: "até 30 pacientes", price: "R$597", period: "/mês" },
      { patients: "até 100 pacientes", price: "R$997", period: "/mês" },
      { patients: "ilimitado", price: "R$1.997", period: "/mês" },
    ],
    features: [
      "Tudo do Coach Pro +",
      "App com sua marca própria",
      "Logo personalizado em todas as telas",
      "Cores da sua marca",
      "Domínio personalizado",
      "Splash screen com sua identidade",
      "Emails com sua marca",
      "Zero menção ao nutriON para pacientes",
    ],
    highlight: true,
  },
];

const CoachLandingPage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<Record<number, number>>({ 0: 0, 1: 0 });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
              B2B para Profissionais de Nutrição
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Gerencie todos os seus pacientes com{" "}
              <span className="text-primary">tecnologia de elite.</span>
              <br />
              <span className="text-muted-foreground">Sua marca. Nossa inteligência.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Alertas automáticos, protocolos gerados por IA, relatórios profissionais.
              Você foca no paciente — a tecnologia cuida do resto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Brain, label: "Protocolos por IA" },
            { icon: BarChart3, label: "Score de Execução" },
            { icon: Shield, label: "Alertas Inteligentes" },
            { icon: MessageSquare, label: "Chat Integrado" },
            { icon: Users, label: "Até ilimitado pacientes" },
            { icon: Globe, label: "Domínio Próprio" },
            { icon: Palette, label: "White Label" },
            { icon: Star, label: "Relatórios Premium" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border"
            >
              <f.icon className="w-6 h-6 text-primary" />
              <span className="text-xs text-center text-foreground font-medium">{f.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-foreground mb-10">Escolha seu plano</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, planIdx) => (
            <Card
              key={planIdx}
              className={`relative overflow-hidden ${plan.highlight ? "border-primary ring-2 ring-primary/20" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs py-1 font-semibold">
                  MAIS POPULAR
                </div>
              )}
              <CardHeader className={plan.highlight ? "pt-8" : ""}>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{plan.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tier selector */}
                <div className="space-y-2">
                  {plan.tiers.map((tier, tierIdx) => (
                    <button
                      key={tierIdx}
                      onClick={() => setSelectedTier(prev => ({ ...prev, [planIdx]: tierIdx }))}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                        selectedTier[planIdx] === tierIdx
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-sm text-foreground">{tier.patients}</span>
                      <span className="font-bold text-foreground">
                        {tier.price}<span className="text-xs text-muted-foreground font-normal">{tier.period}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  size="lg"
                  onClick={() => navigate("/coach/onboarding", { state: { plan: plan.highlight ? "white_label" : "coach" } })}
                >
                  Quero começar agora — 7 dias grátis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* White Label CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-10 border border-primary/20">
          <Palette className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Seu app. Sua marca. Nossa tecnologia.
          </h3>
          <p className="text-muted-foreground mb-6">
            Zero desenvolvimento, zero manutenção. Só resultado para seus pacientes e receita recorrente para você.
          </p>
          <Button size="lg" onClick={() => navigate("/coach/onboarding", { state: { plan: "white_label" } })}>
            Começar com White Label
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs text-muted-foreground border-t border-border">
        nutriON Coach © {new Date().getFullYear()} — Tecnologia de elite para profissionais de nutrição
      </footer>
    </div>
  );
};

export default CoachLandingPage;
