// Bloqueio automático por validade do plano.
// Roda 1x ao dia: avisa 7, 3 e 1 dia antes; no dia do vencimento bloqueia,
// notifica o aluno e alerta o coach. Usa somente as datas reais definidas pelo coach.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const fmt = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
const primeiroNome = (nome: string) => (nome || "").trim().split(" ")[0] || "atleta";

interface Link {
  id: string;
  coach_id: string;
  patient_user_id: string;
  plan_expires_at: string;
  lock_history: unknown;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const agora = new Date();
  const now = agora.toISOString();
  const em7dias = new Date(agora.getTime() + 7 * 86400000).toISOString();

  try {
    const { data: links, error } = await supabase
      .from("coach_patients")
      .select("id, coach_id, patient_user_id, plan_expires_at, lock_history")
      .eq("status", "active")
      .eq("is_locked", false)
      .not("plan_expires_at", "is", null)
      .lte("plan_expires_at", em7dias);

    if (error) throw error;

    const rows = (links || []).filter((l) => l.patient_user_id && l.plan_expires_at) as Link[];
    if (rows.length === 0) {
      return new Response(JSON.stringify({ locked: 0, avisos: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ids = rows.map((l) => l.patient_user_id);
    const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
    const nomeDe = (uid: string) =>
      primeiroNome(((profs || []).find((p) => p.user_id === uid)?.full_name as string) || "");

    let bloqueados = 0;
    let avisos = 0;

    for (const link of rows) {
      const expira = new Date(link.plan_expires_at);
      const nome = nomeDe(link.patient_user_id);

      // Vencido: bloqueia
      if (expira.getTime() <= agora.getTime()) {
        const historico = Array.isArray(link.lock_history) ? link.lock_history : [];
        const { error: updErr } = await supabase
          .from("coach_patients")
          .update({
            is_locked: true,
            locked_at: now,
            lock_reason: "plan_expired",
            lock_notified: true,
            lock_history: [...historico, { action: "locked", reason: "plan_expired", at: now, by: "system" }],
          })
          .eq("id", link.id);
        if (updErr) {
          console.error("auto-lock-clients: falha ao bloquear", link.id, updErr.message);
          continue;
        }

        await supabase.from("notifications").insert({
          user_id: link.patient_user_id,
          type: "plan_expired",
          title: "Seu acesso foi pausado",
          body: `Olá ${nome}! Seu plano expirou em ${fmt(link.plan_expires_at)}. Para voltar a acessar treino, plano alimentar e acompanhamento, fale com o Coach Diogo Mello para renovar.`,
          action_url: "/acesso-pausado",
          read: false,
        });

        await supabase.from("coach_alerts").insert({
          coach_id: link.coach_id,
          patient_user_id: link.patient_user_id,
          alert_type: "client_locked",
          severity: "high",
          message: `Aluno bloqueado automaticamente — plano expirou em ${fmt(link.plan_expires_at)}. Desbloqueie quando renovar.`,
          resolved: false,
        });

        bloqueados += 1;
        continue;
      }

      // Pré-expiração: avisa em 7, 3 e 1 dia
      const diasRestantes = Math.ceil((expira.getTime() - agora.getTime()) / 86400000);
      if (![7, 3, 1].includes(diasRestantes)) continue;

      const tipo = `expiry_warning_${diasRestantes}d`;
      const inicioDoDia = new Date(agora);
      inicioDoDia.setUTCHours(0, 0, 0, 0);

      const { data: jaAvisado } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", link.patient_user_id)
        .eq("type", tipo)
        .gte("created_at", inicioDoDia.toISOString())
        .maybeSingle();
      if (jaAvisado) continue;

      await supabase.from("notifications").insert({
        user_id: link.patient_user_id,
        type: tipo,
        title: diasRestantes === 1 ? "Último dia do seu plano" : `Seu plano expira em ${diasRestantes} dias`,
        body:
          diasRestantes === 1
            ? `${nome}, amanhã seu acesso será pausado. Fale com o Coach Diogo Mello para renovar e não perder o seu progresso.`
            : `${nome}, seu plano expira em ${diasRestantes} dias (${fmt(link.plan_expires_at)}). Renove para continuar o acompanhamento.`,
        action_url: "/notifications",
        read: false,
      });
      avisos += 1;
    }

    return new Response(JSON.stringify({ locked: bloqueados, avisos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const e = err as Error;
    console.error("auto-lock-clients:", e?.message);
    return new Response(JSON.stringify({ error: true, message: e?.message || "erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
