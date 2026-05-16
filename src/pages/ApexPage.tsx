import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";

const ApexPage = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24"
      style={{ background: "#03030a" }}
    >
      <div className="max-w-lg mx-auto px-4 pt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="font-mono text-[.55rem] text-[#40406a] hover:text-[#7890ff]/70 transition-colors mb-4"
        >
          ← voltar
        </button>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-heading text-[1.4rem]" style={{ color: "#7890ff" }}>
            APEX
          </span>
          <span className="font-mono text-[.5rem] text-[#50507a] tracking-[.15em]">
            VISUAL INTELLIGENCE
          </span>
        </div>
        <div className="font-mono text-[.5rem] text-[#30304a] tracking-[.12em] mb-8">
          CINESIOLOGIA · PhD LEVEL
        </div>
        <div
          className="border rounded-[3px] p-6 text-center"
          style={{ borderColor: "rgba(120,144,255,.18)", background: "rgba(6,6,16,.9)" }}
        >
          <div className="font-mono text-[.6rem] text-[#7890ff]/70 tracking-[.12em] mb-2">
            MÓDULO EM CONSTRUÇÃO
          </div>
          <p className="font-mono text-[.75rem] text-[#8888b0] leading-[1.6]">
            Avaliação postural, FMS, mobilidade, mapa de dor, shape e protocolo corretivo NASM CES
            chegam em breve.
          </p>
        </div>
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default ApexPage;
