import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          Resultado não acontece quando você quer.
          <br />
          <span className="text-gradient-gold">Acontece quando você estrutura.</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10">
          Entra no modo ON.
        </p>
        <button className="group px-10 py-5 rounded-xl bg-primary text-primary-foreground font-bold text-lg transition-all hover:scale-105 glow-gold-lg">
          <span className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Começar minha transformação
          </span>
        </button>
        <p className="mt-6 text-sm text-muted-foreground">
          7 dias grátis · Sem cartão · Cancele quando quiser
        </p>
      </motion.div>

      {/* Footer */}
      <div className="relative z-10 mt-24 pt-8 border-t border-border max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-lg">
            <span className="text-foreground">NUTRI</span>
            <span className="text-primary">ON</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 NUTRION. Ciência que alimenta. Atitude que transforma.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
