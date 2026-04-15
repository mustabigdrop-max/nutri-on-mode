import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, FileText, Newspaper, AlertTriangle, GitBranch, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DrNexusChat from "@/components/nexus/DrNexusChat";
import DrNexusGenerator from "@/components/nexus/DrNexusGenerator";

const DrNexusPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Dr. NEXUS — Pharmacological Intelligence</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] text-red-400 font-mono">nutriON CSO | v1.0</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 bg-muted/50 p-1 rounded-xl grid grid-cols-6 h-auto">
          <TabsTrigger value="chat" className="text-[10px] py-1.5 gap-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <MessageSquare className="w-3 h-3" /> Chat
          </TabsTrigger>
          <TabsTrigger value="ficha" className="text-[10px] py-1.5 gap-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <FileText className="w-3 h-3" /> Ficha
          </TabsTrigger>
          <TabsTrigger value="editorial" className="text-[10px] py-1.5 gap-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <Newspaper className="w-3 h-3" /> Editorial
          </TabsTrigger>
          <TabsTrigger value="briefing" className="text-[10px] py-1.5 gap-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <FileText className="w-3 h-3" /> Briefing
          </TabsTrigger>
          <TabsTrigger value="offlabel" className="text-[10px] py-1.5 gap-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <AlertTriangle className="w-3 h-3" /> Off-Label
          </TabsTrigger>
          <TabsTrigger value="sinergias" className="text-[10px] py-1.5 gap-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            <GitBranch className="w-3 h-3" /> Sinergias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
          <DrNexusChat />
        </TabsContent>
        <TabsContent value="ficha" className="flex-1 overflow-y-auto mt-0">
          <DrNexusGenerator mode="ficha" title="Ficha Técnica Completa" description="Gera ficha com 9 blocos: identificação, mecanismo, evidências, aplicações, protocolos, sinergias, segurança, regulatório e Take NEXUS." />
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
