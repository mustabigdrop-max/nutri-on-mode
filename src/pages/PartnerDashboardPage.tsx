import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign, Users, LogOut } from "lucide-react";

const MODULE_MAP: Record<string, { label: string; desc: string; color: string }> = {
  pca: { label: "PCA Assessment", desc: "Perfil comportamental", color: "#3B6D11" },
  protocolo_atleta: { label: "Protocolo Atleta", desc: "Performance e recuperação", color: "#0097ff" },
  nutricao_sport: { label: "Nutrição Sport", desc: "8 modalidades esportivas", color: "#ff6b35" },
  cardio_on: { label: "CardioON", desc: "Prescrição de cardio", color: "#00e5a0" },
  apex_lab: { label: "APEX Lab", desc: "Peptídeos e fitoterapia", color: "#9333ea" },
  glp1_pro: { label: "GLP-1 Pro", desc: "Protocolo GLP-1", color: "#ec4899" },
  protocolo_feminino: { label: "Protocolo Feminino", desc: "Saúde hormonal feminina", color: "#f59e0b" },
  ergogenicos: { label: "Ergogênicos", desc: "Suplementação avançada", color: "#06b6d4" },
};

export default function PartnerDashboardPage() {
  const { user, signOut } = useAuth();
  const { partner, loading } = usePartner();
  const navigate = useNavigate();
  const [commissions, setCommissions] = useState<any[]>([]);

  useEffect(() => {
    if (!partner) return;
    if (partner.status !== "active") {
      navigate("/blocked", { replace: true });
      return;
    }

    // Session check
    const sessionToken = localStorage.getItem("partner_session") || crypto.randomUUID();
    localStorage.setItem("partner_session", sessionToken);

    supabase.functions.invoke("check-session", {
      body: { partner_id: partner.id, session_token: sessionToken, ip: "browser" },
    }).then(({ data }) => {
      if (data && !data.allowed) navigate("/blocked", { replace: true });
    });

    // Load commissions
    supabase.from("commissions").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }).then(({ data }) => setCommissions(data || []));
  }, [partner]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#3B6D11] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!partner) return <Navigate to="/auth" replace />;
  if (partner.status !== "active") return <Navigate to="/blocked" replace />;

  const modules = partner.modules || [];

  return (
    <div className="min-h-screen bg-[#f7f9f4]">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#27500A]">nutriON</span>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm font-medium">{partner.full_name}</span>
          <Badge className="bg-[#3B6D11] text-white">ON+ Parceiro</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut()}><LogOut className="w-4 h-4 mr-1" /> Sair</Button>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EAF3DE] flex items-center justify-center"><CheckCircle className="w-5 h-5 text-[#3B6D11]" /></div>
              <div><p className="text-sm text-muted-foreground">Status da parceria</p><Badge className="bg-[#3B6D11] text-white mt-1">Ativo</Badge></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EAF3DE] flex items-center justify-center"><DollarSign className="w-5 h-5 text-[#3B6D11]" /></div>
              <div><p className="text-sm text-muted-foreground">Comissões geradas</p><p className="text-xl font-bold text-[#27500A]">R$ {(partner.commission_total || 0).toFixed(2)}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EAF3DE] flex items-center justify-center"><Users className="w-5 h-5 text-[#3B6D11]" /></div>
              <div><p className="text-sm text-muted-foreground">Indicações</p><p className="text-xl font-bold text-[#27500A]">{partner.referral_count || 0}</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div>
          <h2 className="text-lg font-bold text-[#27500A] mb-4">Módulos Liberados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modules.map((key: string) => {
              const mod = MODULE_MAP[key];
              if (!mod) return null;
              return (
                <Card key={key} className="hover:shadow-md transition-shadow cursor-default">
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: mod.color }}>{key.slice(0, 2).toUpperCase()}</div>
                    <p className="font-semibold text-sm">{mod.label}</p>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Commissions History */}
        <div>
          <h2 className="text-lg font-bold text-[#27500A] mb-4">Histórico de Comissões</h2>
          {commissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma comissão ainda</p>
          ) : (
            <div className="bg-white rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left">Cliente</th><th className="px-4 py-3">Plano</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Data</th></tr></thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b"><td className="px-4 py-3">{c.client_name}</td><td className="px-4 py-3 text-center">{c.plan_purchased}</td><td className="px-4 py-3 text-center">R$ {(c.amount || 0).toFixed(2)}</td><td className="px-4 py-3 text-center">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
