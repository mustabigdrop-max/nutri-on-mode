import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Newspaper, AlertTriangle, GitBranch, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DrNexusChat from "@/components/nexus/DrNexusChat";
import DrNexusGenerator from "@/components/nexus/DrNexusGenerator";
import VertexLogoHorizontal from "@/components/vertex/VertexLogoHorizontal";

const DrNexusPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030408] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#7c3aed]/20 bg-[#0a0514]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#7c3aed]/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#a78bfa]" />
          </button>
          <VertexLogoHorizontal className="h-[52px] w-auto" />
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 bg-[#0a0514] p-1 rounded-xl grid grid-cols-6 h-auto border border-[#7c3aed]/15">
          <TabsTrigger value="chat" className="text-[10px] py-1.5 gap-1 text-[#a78bfa]/60 data-[state=active]:bg-[#7c3aed]/20 data-[state=active]:text-[#a78bfa]">
            <MessageSquare className="w-3 h-3" /> Chat
          </TabsTrigger>
          <TabsTrigger value="ficha" className="text-[10px] py-1.5 gap-1 text-[#a78bfa]/60 data-[state=active]:bg-[#7c3aed]/20 data-[state=active]:text-[#a78bfa]">
            <FileText className="w-3 h-3" /> Ficha
          </TabsTrigger>
          <TabsTrigger value="editorial" className="text-[10px] py-1.5 gap-1 text-[#a78bfa]/60 data-[state=active]:bg-[#7c3aed]/20 data-[state=active]:text-[#a78bfa]">
            <Newspaper className="w-3 h-3" /> Editorial
          </TabsTrigger>
          <TabsTrigger value="briefing" className="text-[10px] py-1.5 gap-1 text-[#a78bfa]/60 data-[state=active]:bg-[#7c3aed]/20 data-[state=active]:text-[#a78bfa]">
            <FileText className="w-3 h-3" /> Briefing
          </TabsTrigger>
          <TabsTrigger value="offlabel" className="text-[10px] py-1.5 gap-1 text-[#a78bfa]/60 data-[state=active]:bg-[#7c3aed]/20 data-[state=active]:text-[#a78bfa]">
            <AlertTriangle className="w-3 h-3" /> Off-Label
          </TabsTrigger>
          <TabsTrigger value="sinergias" className="text-[10px] py-1.5 gap-1 text-[#a78bfa]/60 data-[state=active]:bg-[#7c3aed]/20 data-[state=active]:text-[#a78bfa]">
            <GitBranch className="w-3 h-3" /> Sinergias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <DrNexusChat />
        </TabsContent>
        <TabsContent value="ficha" className="flex-1 overflow-y-auto mt-0">
          <DrNexusGenerator mode="ficha" title="Ficha Técnica Completa" description="Gera ficha com identificação, mecanismo, evidências, aplicações, protocolos, sinergias, segurança, regulatório e TOME VERTEX." />
        </TabsContent>
        <TabsContent value="editorial" className="flex-1 overflow-y-auto mt-0">
          <DrNexusGenerator mode="editorial" title="Estudo da Semana" description="Editorial científico para publicação — contexto, ciência, prática, gap e conclusão." />
        </TabsContent>
        <TabsContent value="briefing" className="flex-1 overflow-y-auto mt-0">
          <DrNexusGenerator mode="briefing" title="Briefing Rápido" description="Resumo de ~2 min para pré-atendimento com cliente." />
        </TabsContent>
        <TabsContent value="offlabel" className="flex-1 overflow-y-auto mt-0">
          <DrNexusGenerator mode="offlabel" title="Análise Off-Label" description="Contraste uso aprovado vs. prática avançada com riscos regulatórios." />
        </TabsContent>
        <TabsContent value="sinergias" className="flex-1 overflow-y-auto mt-0">
          <DrNexusGenerator mode="sinergias" title="Mapa de Sinergias" description="Combinações sinérgicas com mecanismos e protocolos práticos." />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DrNexusPage;
