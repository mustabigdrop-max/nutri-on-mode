import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AthleteDashboard from "@/pages/athlete/AthleteDashboard";

const ViewAsClient = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!athleteId) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", athleteId)
        .maybeSingle();
      setName(data?.full_name ?? null);
    })();
  }, [athleteId]);

  if (!athleteId) {
    navigate("/coach/dashboard", { replace: true });
    return null;
  }

  return (
    <div>
      <div
        className="sticky top-0 z-[60] flex items-center justify-between gap-3 px-4 py-2.5"
        style={{
          background: "rgba(255,165,0,0.12)",
          borderBottom: "1px solid rgba(255,165,0,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider"
          style={{ color: "#FFA500" }}
        >
          <Eye className="w-4 h-4" />
          Modo visualização · Vendo como {name || "cliente"}
        </span>
        <button
          onClick={() => navigate("/coach/dashboard")}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold"
          style={{
            background: "rgba(255,165,0,0.2)",
            border: "1px solid rgba(255,165,0,0.4)",
            color: "#FFA500",
          }}
        >
          <X className="w-3.5 h-3.5" /> Voltar ao Coach
        </button>
      </div>

      <AthleteDashboard overrideUserId={athleteId} overrideName={name} viewMode="coach-preview" />
    </div>
  );
};

export default ViewAsClient;
