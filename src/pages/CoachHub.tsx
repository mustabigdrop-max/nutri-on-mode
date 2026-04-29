import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Camera,
  UtensilsCrossed,
  Dumbbell,
  FlaskConical,
  FileBarChart,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import AthleteRoster from "@/components/coach/AthleteRoster";
import PlanoAlimentarIA from "@/components/coach/PlanoAlimentarIA";
import CoachApexVisualPage from "@/pages/coach/CoachApexVisualPage";
import CoachTrainingOnPage from "@/pages/coach/CoachTrainingOnPage";
import CoachLabExamsPage from "@/pages/coach/CoachLabExamsPage";
import CoachReportsPage from "@/pages/coach/CoachReportsPage";

type ModuleKey = "atletas" | "apex" | "plano" | "training" | "lab" | "relatorios";

const modules: {
  key: ModuleKey;
  title: string;
  icon: any;
  description: string;
  badge?: string;
}[] = [
  { key: "atletas", title: "Atletas", icon: Trophy, description: "Roster, timeline visual e fluxo semanal", badge: "Hub" },
  { key: "apex", title: "APEX Visual", icon: Camera, description: "Análise de fotos por IA e scores" },
  { key: "plano", title: "Plano Alimentar", icon: UtensilsCrossed, description: "Macros, carb cycling e sync" },
  { key: "training", title: "TrainingON", icon: Dumbbell, description: "Sistema, fibra, volume e STRATUM" },
  { key: "lab", title: "Exames Lab", icon: FlaskConical, description: "Score metabólico e alertas" },
  { key: "relatorios", title: "Relatórios", icon: FileBarChart, description: "Relatório semanal IA" },
];

function CoachHubSidebar({ active, setActive }: { active: ModuleKey; setActive: (k: ModuleKey) => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Coach Hub</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((m) => (
                <SidebarMenuItem key={m.key}>
                  <SidebarMenuButton
                    isActive={active === m.key}
                    onClick={() => setActive(m.key)}
                    className="flex items-center gap-2"
                  >
                    <m.icon className="h-4 w-4" />
                    {!collapsed && <span>{m.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/coach/dashboard")}>
                  <Home className="h-4 w-4" />
                  {!collapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4" />
                  {!collapsed && <span>Voltar</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}


const CoachHub = () => {
  const [active, setActive] = useState<ModuleKey>("atletas");
  const navigate = useNavigate();

  const renderModule = () => {
    switch (active) {
      case "atletas":
        return <AthleteRoster />;
      case "apex":
        return <CoachApexVisualPage />;
      case "plano":
        return <PlanoAlimentarIA />;
      case "training":
        return <CoachTrainingOnPage />;
      case "lab":
        return <CoachLabExamsPage />;
      case "relatorios":
        return <CoachReportsPage />;
    }
  };

  const current = modules.find((m) => m.key === active)!;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CoachHubSidebar active={active} setActive={setActive} />

        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 bg-card/40 backdrop-blur">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <current.icon className="h-5 w-5 text-amber-500" />
              <h1 className="text-lg font-semibold">{current.title}</h1>
              {current.badge && (
                <Badge variant="outline" className="border-amber-500/40 text-amber-500">
                  {current.badge}
                </Badge>
              )}
            </div>
            <div className="ml-auto text-xs text-muted-foreground">Coach Hub · NUTRION</div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderModule()}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CoachHub;
