import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DesafioDashboard from "@/components/desafio-21/DesafioDashboard";
import { DesafioConfig, loadConfig } from "@/lib/desafio21";

export default function Desafio21DashboardPage() {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<DesafioConfig | null | undefined>(undefined);

  useEffect(() => {
    const loaded = loadConfig();
    if (!loaded) navigate("/runon/desafio-21", { replace: true });
    setCfg(loaded);
  }, [navigate]);

  if (!cfg) return <div style={{ background: "#020205", minHeight: "100vh" }} />;

  return <DesafioDashboard config={cfg} onChange={setCfg} />;
}
