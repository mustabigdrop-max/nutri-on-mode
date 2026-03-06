import { motion } from "framer-motion";
import { Flame, TrendingUp, Droplets, Moon, Dumbbell, Apple } from "lucide-react";

const macros = [
  { label: "Proteína", value: 142, target: 180, unit: "g", percent: 79, color: "bg-primary" },
  { label: "Carboidrato", value: 198, target: 250, unit: "g", percent: 79, color: "bg-accent" },
  { label: "Gordura", value: 52, target: 70, unit: "g", percent: 74, color: "bg-danger" },
];

const DashboardPreview = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-mono text-accent tracking-widest uppercase mb-4 block">
            Dashboard HUD
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Seu cockpit de{" "}
            <span className="text-gradient-gold">performance</span>
          </h2>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-md mx-auto"
        >
          {/* Phone frame */}
          <div className="rounded-[2rem] border-2 border-border bg-background p-4 shadow-2xl">
            {/* Status bar */}
            <div className="flex items-center justify-between px-2 mb-4">
              <span className="text-xs font-mono text-muted-foreground">09:41</span>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-bold text-sm">NUTRI</span>
                <span className="text-primary font-bold text-sm">ON</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gold" />
                <span className="text-xs font-mono text-primary">ON</span>
              </div>
            </div>

            {/* Calories center */}
            <div className="text-center mb-6">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Consumidas hoje</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-bold font-mono text-foreground">1.847</span>
                <span className="text-xl text-muted-foreground font-mono">/ 2.350</span>
              </div>
              <span className="text-xs text-primary font-mono">kcal</span>
            </div>

            {/* Macro bars */}
            <div className="space-y-3 mb-6">
              {macros.map((macro, i) => (
                <motion.div
                  key={macro.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{macro.label}</span>
                    <span className="text-xs font-mono text-foreground">
                      {macro.value}<span className="text-muted-foreground">/{macro.target}{macro.unit}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${macro.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${macro.color}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-foreground">12</span>
                <p className="text-[10px] text-muted-foreground font-mono">Streak 🔥</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-foreground">Lv.7</span>
                <p className="text-[10px] text-muted-foreground font-mono">Máquina</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3 text-center">
                <Droplets className="w-5 h-5 text-accent mx-auto mb-1" />
                <span className="text-lg font-bold font-mono text-foreground">2.1L</span>
                <p className="text-[10px] text-muted-foreground font-mono">Água</p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse-gold" />
                <span className="text-sm font-mono text-primary font-semibold">MODO ON</span>
                <span className="text-xs text-muted-foreground ml-auto">Dia está no controle ✓</span>
              </div>
            </div>

            {/* Next meal */}
            <div className="rounded-xl bg-card border border-border p-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Apple className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Lanche da tarde</p>
                  <p className="text-xs text-muted-foreground">15:30 · 320 kcal · 28g prot</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                  Confirmar
                </button>
              </div>
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-around pt-3 border-t border-border">
              {[
                { icon: "📊", label: "Home", active: true },
                { icon: "🍽️", label: "Plano" },
                { icon: "➕", label: "", isAdd: true },
                { icon: "💬", label: "Chat" },
                { icon: "👤", label: "Perfil" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  {item.isAdd ? (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold -mt-4 glow-gold">
                      +
                    </div>
                  ) : (
                    <>
                      <span className="text-lg">{item.icon}</span>
                      <span className={`text-[9px] font-mono ${item.active ? "text-primary" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Glow behind phone */}
          <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-primary/5 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
