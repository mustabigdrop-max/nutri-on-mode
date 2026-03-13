import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function MetabolicReversionPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Reversão Metabólica</h1>
          <p className="text-xs text-white/50">Protocolo de reverse diet</p>
        </div>
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <TrendingUp size={18} className="text-cyan-400" />
        </div>
      </div>
      <div className="px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-white/50 text-sm">Em breve — protocolo guiado de reverse diet para restaurar metabolismo.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
