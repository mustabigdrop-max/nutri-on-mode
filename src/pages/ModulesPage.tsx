import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { allModules } from "@/data/landingModules";

const ModulesPage = () => (
  <div className="min-h-screen bg-[#03030a] text-[#f0edf8] font-landing px-6 md:px-12 py-16">
    <div className="max-w-[1080px] mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 font-mono text-[.72rem] tracking-[.12em] text-[#8A8A8A] hover:text-[#00D4FF] transition-colors mb-10">
        <ArrowLeft className="w-4 h-4" /> VOLTAR
      </Link>

      <div className="font-mono text-[.65rem] text-primary tracking-[.2em] uppercase mb-4 flex items-center gap-2.5">
        <span className="w-4 h-px bg-primary" />— SISTEMA COMPLETO
      </div>
      <h1 className="font-heading leading-[.95] mb-4" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
        <span className="block text-white">TODOS OS MÓDULOS</span>
        <span className="block text-[#B8922A]">DO NUTRION.</span>
      </h1>
      <p className="text-[#8A8A8A] max-w-[600px] mb-12 leading-[1.7]">
        Cada módulo resolve um problema real. Todos integrados. Transformação é sistema.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allModules.map((m, i) => (
          <motion.div
            key={m.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            className="relative rounded-lg p-5"
            style={{ background: "#0d0d1f", border: "1px solid #ffffff12", borderLeft: `2px solid ${m.color}` }}
          >
            <span className="absolute top-3 right-4 font-mono text-[11px]" style={{ color: "#B8922A" }}>{m.num}</span>
            <div className="text-[20px] mb-2.5">{m.icon}</div>
            <div className="font-heading font-bold text-[15px] uppercase tracking-[.04em] text-white mb-1 pr-8">{m.title}</div>
            <div className="text-[11px] mb-3" style={{ color: m.color }}>{m.subtitle}</div>
            <p className="text-[12px] text-[#888] leading-[1.6]">{m.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Link
          to="/auth"
          className="inline-block font-mono text-[.8rem] tracking-[.1em] text-white px-8 py-4 rounded-lg"
          style={{ border: "2px solid #00D4FF" }}
        >
          Começar agora →
        </Link>
      </div>
    </div>
  </div>
);

export default ModulesPage;
