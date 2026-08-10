import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DesafioWizard from "@/components/desafio-21/DesafioWizard";
import { DesafioConfig, loadConfig, saveConfig } from "@/lib/desafio21";

export default function Desafio21Page() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loadConfig()) navigate("/runon/desafio-21/dashboard", { replace: true });
    else setReady(true);
  }, [navigate]);

  if (!ready) return <div style={{ background: "#020205", minHeight: "100vh" }} />;

  const finish = (cfg: DesafioConfig) => {
    saveConfig(cfg);
    navigate("/runon/desafio-21/dashboard", { replace: true });
  };

  return <DesafioWizard onCancel={() => navigate("/runon")} onComplete={finish} />;
}
