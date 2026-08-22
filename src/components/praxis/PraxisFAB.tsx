import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

const PraxisFAB = ({ disabled = false }: { disabled?: boolean }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => !disabled && navigate("/praxis")}
      disabled={disabled}
      aria-label="Abrir seu protocolo"
      className="fixed right-5 bottom-24 w-14 h-14 rounded-full flex items-center justify-center z-50 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: "linear-gradient(135deg, #00D4FF, #00FF88)",
        boxShadow: "0 4px 20px rgba(0, 212, 255, 0.35)",
      }}
    >
      <Zap className="w-6 h-6" strokeWidth={2.5} style={{ color: "#02121a" }} />
    </button>
  );
};

export default PraxisFAB;
