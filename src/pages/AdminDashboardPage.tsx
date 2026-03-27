import { Navigate, useNavigate } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, FlaskConical, LayoutDashboard, LogOut, ChevronRight } from "lucide-react";

const ADMIN_MODULES = [
  {
    title: "Gestão de Parceiros",
    description: "Cadastrar, bloquear e gerenciar parceiros e comissões",
    icon: Users,
    path: "/admin/partners",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "APEX Elite Coach",
    description: "Agente IA irrestrito para protocolos avançados de atletas",
    icon: FlaskConical,
    path: "/admin/apex-coach",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

export default function AdminDashboardPage() {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = usePartner();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0e1318]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold">Painel Admin</h1>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Administrador
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">Bem-vindo ao Painel</h2>
          <p className="text-gray-400">Gerencie parceiros, acesse ferramentas de elite e monitore o sistema.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADMIN_MODULES.map((mod) => (
            <Card
              key={mod.path}
              className="bg-[#0e1318] border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
              onClick={() => navigate(mod.path)}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${mod.bg}`}>
                  <mod.icon className={`w-6 h-6 ${mod.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{mod.title}</h3>
                  <p className="text-sm text-gray-400">{mod.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
