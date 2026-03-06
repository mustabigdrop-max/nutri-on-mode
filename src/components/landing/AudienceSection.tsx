import { motion } from "framer-motion";

const audiences = [
  {
    label: "Emagrecer",
    quote: "Chega de dieta que funciona 3 semanas. O NUTRION te coloca num protocolo científico que continua funcionando quando a motivação vai embora.",
  },
  {
    label: "Treina pesado",
    quote: "Você já treina. Falta a nutrição no mesmo nível. O NUTRION sincroniza o que você come com o que você treina — automaticamente.",
  },
  {
    label: "Usa caneta",
    quote: "A caneta reduz seu apetite. O NUTRION garante que o peso que você perde é gordura — não músculo.",
  },
  {
    label: "Nunca fez dieta",
    quote: "Você não precisa saber nada de nutrição. A IA sabe por você. Você só precisa estar no modo ON.",
  },
  {
    label: "Já tentou tudo",
    quote: "Não é mais uma dieta. É um sistema. Protocolo, IA, coach e ciência — juntos para que dessa vez seja diferente.",
  },
  {
    label: "Profissional",
    quote: "Prescreva com a ferramenta que seus pacientes vão realmente usar.",
  },
];

const AudienceSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-mono text-accent tracking-widest uppercase mb-4 block">
            Para quem é
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Para <span className="text-gradient-gold">todo mundo</span> que decidiu{" "}
            <br className="hidden sm:block" />
            parar de improvisar.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {audiences.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="p-6 rounded-xl border border-border bg-card/30 hover:border-primary/20 transition-all"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold mb-3">
                {a.label}
              </span>
              <p className="text-foreground/90 text-sm leading-relaxed italic">"{a.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
