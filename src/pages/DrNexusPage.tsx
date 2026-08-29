import { useState } from "react";
import { ArrowLeft, FileText, Newspaper, AlertTriangle, GitBranch, MessageSquare, Scale, FlaskConical, Calculator, Shield, AlertCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DrNexusChat from "@/components/nexus/DrNexusChat";
import DrNexusGenerator from "@/components/nexus/DrNexusGenerator";
import VertexLogoHorizontal from "@/components/vertex/VertexLogoHorizontal";

const TABS = [
  { value: "chat", label: "Chat", icon: MessageSquare },
  { value: "ficha", label: "Ficha", icon: FileText },
  { value: "editorial", label: "Editorial", icon: Newspaper },
  { value: "briefing", label: "Briefing", icon: FileText },
  { value: "offlabel", label: "Off-Label", icon: AlertTriangle },
  { value: "sinergias", label: "Sinergias", icon: GitBranch },
  { value: "comparativo", label: "Comparar", icon: Scale },
  { value: "exames", label: "Exames", icon: FlaskConical },
  { value: "dose", label: "Dose", icon: Calculator },
  { value: "pct", label: "PCT", icon: Shield },
  { value: "interacoes", label: "Interações", icon: AlertCircle },
  { value: "exportar", label: "Exportar", icon: Download },
];

const TAB_META: Record<string, { title: string; description: string }> = {
  ficha: { title: "Ficha Técnica Completa", description: "Identificação, mecanismo, farmacocinética, evidências, dosagem, sinergias, impacto na dieta e TOME VERTEX." },
  editorial: { title: "Estudo da Semana", description: "Editorial científico — contexto, ciência, prática, gap e conclusão provocativa." },
  briefing: { title: "Briefing Rápido", description: "Resumo de ~2 min para pré-atendimento com cliente." },
  offlabel: { title: "Análise Off-Label", description: "Contraste uso aprovado vs. prática avançada com riscos regulatórios." },
  sinergias: { title: "Mapa de Sinergias", description: "Combinações sinérgicas com mecanismos moleculares e protocolos práticos." },
  comparativo: { title: "Comparativo Lado a Lado", description: "Análise comparativa detalhada entre dois compostos — mecanismo, dose, segurança e decisão." },
  exames: { title: "Interpretação de Exames", description: "Análise laboratorial na ótica do atleta — hormonal, metabólico, hepático, renal e cardiovascular." },
  dose: { title: "Calculadora de Dose", description: "Dose calibrada por peso com reconstituição, seringa e protocolo completo." },
  pct: { title: "Protocolo PCT", description: "Restauração de eixo pós-ciclo com SERMs, hCG, ancilares e suporte nutricional." },
  interacoes: { title: "Verificador de Interações", description: "Análise de stack — combinações seguras, antagonismos, gaps e otimização." },
  exportar: { title: "Exportar JSON", description: "Gera ficha estruturada em JSON para integração com o banco de dados nutriON." },
};

const DrNexusPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-[#030408] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#7c3aed]/20 bg-[#0a0514]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coach/dashboard")} className="p-2 rounded-lg hover:bg-[#7c3aed]/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#a78bfa]" />
          </button>
          <VertexLogoHorizontal className="h-[52px] w-auto" />
        </div>
      </div>

      {/* Tab bar - scrollable */}
      <div className="border-b border-[#7c3aed]/10 bg-[#0a0514]/80">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-0.5 px-3 py-2 min-w-max">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-['JetBrains_Mono'] whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30"
                      : "text-[#a78bfa]/40 hover:text-[#a78bfa]/70 hover:bg-[#7c3aed]/5 border border-transparent"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "chat" ? (
          <DrNexusChat />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <DrNexusGenerator
              mode={activeTab}
              title={TAB_META[activeTab]?.title || activeTab}
              description={TAB_META[activeTab]?.description || ""}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DrNexusPage;