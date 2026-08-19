import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  MEAL_OPTIONS, OBJETIVOS, Objetivo, PORTES, Porte, computeTargets,
} from "@/lib/challenge";
import { cn } from "@/lib/utils";

interface PublicChallenge {
  id: string;
  name: string;
  slug: string;
  gym_name: string;
  start_date: string;
  end_date: string;
  status: string;
  participants: number;
}

export default function ChallengeSignupPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<PublicChallenge | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [objetivo, setObjetivo] = useState<Objetivo>("emagrecer");
  const [porte, setPorte] = useState<Porte>("medio");
  const [meals, setMeals] = useState(5);
  const [loading, setLoading] = useState(false);

  const targets = useMemo(() => computeTargets(objetivo, porte), [objetivo, porte]);

  useEffect(() => {
    supabase
      .rpc("get_challenge_public", { _slug: slug })
      .maybeSingle()
      .then(({ data }) => setChallenge((data as PublicChallenge) ?? null));
  }, [slug]);

  const handleSignup = async () => {
    if (!challenge) return;
    if (name.trim().length < 2) return toast.error("Informe seu nome completo.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error("Informe um e-mail válido.");
    if (password.length < 6) return toast.error("A senha precisa de pelo menos 6 caracteres.");

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/desafio/dashboard`,
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user?.identities?.length === 0) {
        toast.error("Este e-mail já tem conta. Faça login para entrar no desafio.");
        navigate("/auth");
        return;
      }
      const userId = data.user?.id;
      if (!userId) return;

      if (data.session) {
        await supabase.from("profiles").update({
          role: "challenge_participant",
          origin: "challenge",
          challenge_id: challenge.id,
          full_name: name.trim(),
        }).eq("user_id", userId);

        const { error: pErr } = await supabase.from("challenge_participants").insert({
          challenge_id: challenge.id,
          user_id: userId,
          full_name: name.trim(),
          email: cleanEmail,
          whatsapp: whatsapp.trim() || null,
          objetivo,
          porte,
          meals_per_day: meals,
          target_kcal: targets.kcal,
          protein_g: targets.protein_g,
          carbs_g: targets.carbs_g,
          fat_g: targets.fat_g,
        });
        if (pErr) {
          toast.error("Não foi possível concluir a inscrição.");
          return;
        }
        await supabase.from("challenge_signups").insert({
          user_id: userId,
          email: cleanEmail,
          full_name: name.trim(),
          source: "qr",
          gym_slug: slug,
        });
        toast.success("Você está no desafio!");
        navigate("/desafio/dashboard", { replace: true });
      } else {
        toast.success("Confirme seu e-mail para liberar o acesso ao desafio.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (challenge === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (challenge === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold">Desafio não encontrado</h1>
          <p className="text-sm text-muted-foreground mt-2">Verifique o QR Code da sua academia.</p>
        </div>
      </div>
    );
  }

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
        active
          ? "border-primary bg-primary/15 text-primary shadow-[0_0_18px_hsl(var(--primary)/0.25)]"
          : "border-border bg-card/40 text-muted-foreground",
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <p className="text-[11px] tracking-[0.4em] text-muted-foreground">N U T R I O N</p>
          <h1 className="flex items-center justify-center gap-2 text-2xl font-black">
            <Trophy className="w-6 h-6 text-primary" /> DESAFIO 90 DIAS
          </h1>
          <p className="text-sm font-semibold text-primary uppercase">{challenge.gym_name || challenge.name}</p>
          <p className="text-xs text-muted-foreground">
            90 dias. Ranking ao vivo. Premiação.<br />Plano alimentar incluso. GRATUITO.
          </p>
        </div>

        <div className="space-y-3">
          <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" />
          <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Objetivo</p>
          <div className="flex gap-2">
            {OBJETIVOS.map((o) => (
              <Chip key={o.id} active={objetivo === o.id} onClick={() => setObjetivo(o.id)}>
                {o.emoji} {o.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Porte</p>
          <div className="flex gap-2">
            {PORTES.map((p) => (
              <Chip key={p.id} active={porte === p.id} onClick={() => setPorte(p.id)}>{p.label}</Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Refeições por dia</p>
          <div className="flex gap-2">
            {MEAL_OPTIONS.map((m) => (
              <Chip key={m} active={meals === m} onClick={() => setMeals(m)}>{m}</Chip>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">Seu plano base</p>
          <p className="text-lg font-black text-primary">{targets.kcal.toLocaleString("pt-BR")} kcal</p>
          <p className="text-[11px] text-muted-foreground">
            {targets.protein_g}g P · {targets.carbs_g}g C · {targets.fat_g}g G
          </p>
        </div>

        <Button className="w-full h-12 text-base font-bold" onClick={handleSignup} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}🚀 ENTRAR NO DESAFIO
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">🆓 Gratuito · Sem cartão</p>
        <p className="text-center text-[11px] text-muted-foreground">@diogo.mell0 · nutrion.app.br</p>
      </div>
    </div>
  );
}
