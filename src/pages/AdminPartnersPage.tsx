import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, AlertTriangle, DollarSign, UserPlus, Shield, Ban, Eye, RotateCcw, Trash2, Key } from "lucide-react";

const MODULE_OPTIONS = [
  { key: "pca", label: "PCA Assessment" },
  { key: "protocolo_atleta", label: "Protocolo Atleta" },
  { key: "nutricao_sport", label: "Nutrição Sport" },
  { key: "cardio_on", label: "CardioON" },
  { key: "apex_lab", label: "APEX Lab" },
  { key: "glp1_pro", label: "GLP-1 Pro" },
  { key: "protocolo_feminino", label: "Protocolo Feminino" },
  { key: "ergogenicos", label: "Ergogênicos" },
];

export default function AdminPartnersPage() {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = usePartner();
  const [tab, setTab] = useState("dashboard");
  const [partners, setPartners] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, blocked: 0, commissions: 0, referrals: 0 });

  // New partner form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlan, setNewPlan] = useState("on_plus");
  const [newModules, setNewModules] = useState<string[]>(["pca", "protocolo_atleta", "nutricao_sport", "cardio_on"]);
  const [newNote, setNewNote] = useState("");
  const [creating, setCreating] = useState(false);

  // Detail modal
  const [detailPartner, setDetailPartner] = useState<any>(null);

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState<any>(null);
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  // View password
  const [viewPasswordPartner, setViewPasswordPartner] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const loadData = async () => {
    const { data: p } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
    setPartners(p || []);

    const active = p?.filter((x: any) => x.status === "active").length || 0;
    const blocked = p?.filter((x: any) => x.status === "blocked").length || 0;
    const totalRef = p?.reduce((s: number, x: any) => s + (x.referral_count || 0), 0) || 0;

    const { data: comms } = await supabase.from("commissions").select("amount");
    const totalComm = comms?.reduce((s: number, x: any) => s + (x.amount || 0), 0) || 0;

    setStats({ active, blocked, commissions: totalComm, referrals: totalRef });

    const { data: al } = await supabase.from("session_alerts").select("*").eq("action_taken", "pending").order("created_at", { ascending: false });
    setAlerts(al || []);

    const { data: ral } = await supabase.from("session_alerts").select("*").neq("action_taken", "pending").order("created_at", { ascending: false }).limit(50);
    setResolvedAlerts(ral || []);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    setNewPassword(Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
  };

  const toggleModule = (key: string) => {
    setNewModules((prev) => prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]);
  };

  const createPartner = async () => {
    if (!newName || !newEmail || !newPassword) {
      toast.error("Preencha nome, email e senha");
      return;
    }

    setCreating(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("Sua sessão expirou. Faça login novamente.");
      }

      if (!sessionData.session?.access_token) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      // Use edge function to create user (admin API requires service role)
      const { data, error } = await supabase.functions.invoke("create-partner", {
        body: { email: newEmail, password: newPassword, full_name: newName, plan: newPlan, modules: newModules, internal_note: newNote, created_by: user?.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Parceiro cadastrado com sucesso!");
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewNote("");
      setNewModules(["pca", "protocolo_atleta", "nutricao_sport", "cardio_on"]);
      loadData();
      setTab("parceiros");
    } catch (err: any) {
      toast.error(err?.message || err?.context?.error || "Erro ao criar parceiro");
    } finally {
      setCreating(false);
    }
  };

  const toggleBlock = async (partner: any) => {
    const newStatus = partner.status === "blocked" ? "active" : "blocked";
    await supabase.from("partners").update({ status: newStatus }).eq("id", partner.id);
    if (newStatus === "blocked") {
      // Clear sessions
      await supabase.from("partner_sessions").delete().eq("partner_id", partner.id);
    }
    toast.success(newStatus === "blocked" ? "Parceiro bloqueado" : "Parceiro reativado");
    loadData();
  };

  const revokePartner = async () => {
    if (!revokeTarget) return;
    await supabase.from("partners").update({ status: "revoked" }).eq("id", revokeTarget.id);
    await supabase.from("partner_sessions").delete().eq("partner_id", revokeTarget.id);
    toast.success("Acesso do parceiro revogado");
    setRevokeTarget(null);
    loadData();
  };

  const deletePartner = async () => {
    if (!deleteTarget) return;
    await supabase.from("partner_sessions").delete().eq("partner_id", deleteTarget.id);
    await supabase.from("commissions").delete().eq("partner_id", deleteTarget.id);
    await supabase.from("partners").delete().eq("id", deleteTarget.id);
    toast.success("Parceiro excluído");
    setDeleteTarget(null);
    loadData();
  };

  const resolveAlert = async (alert: any, action: string) => {
    await supabase.from("session_alerts").update({ action_taken: action }).eq("id", alert.id);
    if (action === "blocked") {
      await supabase.from("partners").update({ status: "blocked" }).eq("id", alert.partner_id);
      await supabase.from("partner_sessions").delete().eq("partner_id", alert.partner_id);
    }
    toast.success(action === "blocked" ? "Parceiro bloqueado" : "Alerta ignorado");
    loadData();
  };

  if (roleLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  const statusBadge = (s: string) => {
    if (s === "active") return <Badge className="bg-[#3B6D11] text-white">Ativo</Badge>;
    if (s === "blocked") return <Badge variant="destructive">Bloqueado</Badge>;
    return <Badge variant="secondary">Revogado</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#f7f9f4]">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#3B6D11]" />
          <h1 className="text-xl font-bold text-[#27500A]">nutriON Admin</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut()}>Sair</Button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r min-h-[calc(100vh-65px)] p-4 space-y-2">
          {[
            { key: "dashboard", icon: Users, label: "Dashboard" },
            { key: "parceiros", icon: Users, label: "Parceiros" },
            { key: "alertas", icon: AlertTriangle, label: "Alertas", badge: alerts.length },
            { key: "novo", icon: UserPlus, label: "Novo Parceiro" },
          ].map((item) => (
            <button key={item.key} onClick={() => setTab(item.key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === item.key ? "bg-[#EAF3DE] text-[#27500A]" : "text-[#5F5E5A] hover:bg-gray-50"}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.badge ? <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{item.badge}</span> : null}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          {tab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#27500A]">Visão Geral</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-[#3B6D11]">{stats.active}</p><p className="text-sm text-muted-foreground">Parceiros ativos</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-[#A32D2D]">{stats.blocked}</p><p className="text-sm text-muted-foreground">Bloqueados</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-[#3B6D11]">R$ {stats.commissions.toFixed(2)}</p><p className="text-sm text-muted-foreground">Comissões do mês</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-[#27500A]">{stats.referrals}</p><p className="text-sm text-muted-foreground">Indicações do mês</p></CardContent></Card>
              </div>
            </div>
          )}

          {tab === "parceiros" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#27500A]">Parceiros</h2>
              <div className="bg-white rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50"><th className="px-4 py-3 text-left">Nome</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3">Plano</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Indicações</th><th className="px-4 py-3">Ações</th></tr></thead>
                  <tbody>
                    {partners.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{p.full_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                        <td className="px-4 py-3 text-center"><Badge variant="outline" className="border-[#3B6D11] text-[#3B6D11]">ON+</Badge></td>
                        <td className="px-4 py-3 text-center">{statusBadge(p.status)}</td>
                        <td className="px-4 py-3 text-center">{p.referral_count || 0}</td>
                        <td className="px-4 py-3 text-center space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetailPartner(p)}><Eye className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleBlock(p)}>{p.status === "blocked" ? <RotateCcw className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-red-600" />}</Button>
                          {p.status !== "revoked" && <Button size="sm" variant="ghost" onClick={() => setRevokeTarget(p)} className="text-red-600">Revogar</Button>}
                        </td>
                      </tr>
                    ))}
                    {partners.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum parceiro cadastrado</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "alertas" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#27500A]">Alertas de Sessão</h2>
              {alerts.length === 0 && <p className="text-muted-foreground">Nenhum alerta pendente 🎉</p>}
              <div className="space-y-3">
                {alerts.map((a) => (
                  <Card key={a.id} className="border-red-200 bg-[#FCEBEB]">
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#A32D2D]">{a.partner_name}</p>
                        <p className="text-sm">{a.sessions_count} sessões simultâneas · IPs: {a.ips?.join(", ")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => resolveAlert(a, "blocked")}>Bloquear</Button>
                        <Button size="sm" variant="outline" onClick={() => resolveAlert(a, "ignored")}>Ignorar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {resolvedAlerts.length > 0 && (
                <>
                  <h3 className="text-md font-semibold text-muted-foreground mt-6">Histórico</h3>
                  <div className="bg-white rounded-lg border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b bg-gray-50"><th className="px-4 py-2 text-left">Parceiro</th><th className="px-4 py-2">Sessões</th><th className="px-4 py-2">Ação</th><th className="px-4 py-2">Data</th></tr></thead>
                      <tbody>
                        {resolvedAlerts.map((a) => (
                          <tr key={a.id} className="border-b"><td className="px-4 py-2">{a.partner_name}</td><td className="px-4 py-2 text-center">{a.sessions_count}</td><td className="px-4 py-2 text-center">{a.action_taken === "blocked" ? <Badge variant="destructive">Bloqueado</Badge> : <Badge variant="secondary">Ignorado</Badge>}</td><td className="px-4 py-2 text-center">{new Date(a.created_at).toLocaleDateString("pt-BR")}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "novo" && (
            <div className="max-w-xl space-y-6">
              <h2 className="text-lg font-bold text-[#27500A]">Novo Parceiro</h2>
              <div className="space-y-4 bg-white p-6 rounded-lg border">
                <div><Label>Nome completo</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
                <div>
                  <Label>Senha temporária</Label>
                  <div className="flex gap-2"><Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><Button variant="outline" size="sm" onClick={generatePassword}>Gerar</Button></div>
                </div>
                <div>
                  <Label>Plano</Label>
                  <select className="w-full border rounded-md p-2 text-sm" value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
                    <option value="on">ON</option>
                    <option value="on_plus">ON+</option>
                    <option value="on_pro">ON PRO</option>
                  </select>
                </div>
                <div>
                  <Label>Módulos</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {MODULE_OPTIONS.map((m) => (
                      <label key={m.key} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={newModules.includes(m.key)} onCheckedChange={() => toggleModule(m.key)} />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div><Label>Nota interna</Label><Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Visível apenas para admin..." /></div>
                <Button className="w-full bg-[#3B6D11] hover:bg-[#27500A]" onClick={createPartner} disabled={creating}>{creating ? "Criando..." : "Cadastrar Parceiro"}</Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailPartner} onOpenChange={() => setDetailPartner(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Parceiro</DialogTitle></DialogHeader>
          {detailPartner && (
            <div className="space-y-3 text-sm">
              <p><strong>Nome:</strong> {detailPartner.full_name}</p>
              <p><strong>Email:</strong> {detailPartner.email}</p>
              <p><strong>Plano:</strong> {detailPartner.plan}</p>
              <p><strong>Status:</strong> {detailPartner.status}</p>
              <p><strong>Módulos:</strong> {detailPartner.modules?.join(", ")}</p>
              <p><strong>Comissões:</strong> R$ {(detailPartner.commission_total || 0).toFixed(2)}</p>
              <p><strong>Indicações:</strong> {detailPartner.referral_count || 0}</p>
              {detailPartner.internal_note && <p><strong>Nota interna:</strong> {detailPartner.internal_note}</p>}
              <p><strong>Criado em:</strong> {new Date(detailPartner.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <Dialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Revogar acesso</DialogTitle></DialogHeader>
          <p className="text-sm">Tem certeza que deseja revogar permanentemente o acesso de <strong>{revokeTarget?.full_name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={revokePartner}>Revogar Acesso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
