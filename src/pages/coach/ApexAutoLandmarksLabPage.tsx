import { useState } from "react";
import ApexAutoLandmarks from "@/components/apex/ApexAutoLandmarks";

const VIEWS = [["frente","Frente"],["lateral","Lateral"],["costas","Costas"]] as const;

export default function ApexAutoLandmarksLabPage() {
  const [view, setView] = useState<"frente"|"lateral"|"costas">("frente");
  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-4">
      <h1 className="text-xl font-bold">APEX · Pontos automáticos (teste)</h1>
      <p className="text-sm text-muted-foreground">Tela de teste separada. Não altera o APEX atual nem salva dados.</p>
      <div className="flex gap-2">
        {VIEWS.map(([v,l]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1 border text-sm ${view===v ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      <ApexAutoLandmarks key={view} viewAngle={view} />
    </div>
  );
}
