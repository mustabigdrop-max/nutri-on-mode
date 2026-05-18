import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { HudShell, HudStatusBar, HudHex, HudPanel } from "@/components/hud/HudShell";

const SPECIALTIES: { id: string; code: string }[] = [
  { id: "emagrecimento", code: "EM" },
  { id: "hipertrofia", code: "HP" },
  { id: "performance", code: "PF" },
  { id: "GLP-1", code: "GL" },
  { id: "esportiva", code: "ES" },
  { id: "infantil", code: "IN" },
  { id: "clínica", code: "CL" },
];

const CoachOnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = (location.state as any)?.plan || "coach";
  const isWL = selectedPlan === "white_label";
  const accent = isWL ? "#00D4FF" : "#B8922A";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    professional_name: "",
    crn: "",
    bio: "",
    specialties: [] as string[],
    wl_app_name: "",
    wl_primary: "#B8922A",
    wl_secondary: "#0a0a1a",
    wl_domain: "",
  });

  const toggleSpecialty = (s: string) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s],
    }));
  };

  const handleSubmit = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!form.professional_name.trim()) {
      toast({ title: "Preencha seu nome profissional", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("coach_profiles").insert({
        user_id: user.id,
        professional_name: form.professional_name,
        crn: form.crn || null,
        bio: form.bio || null,
        specialties: form.specialties,
        plan: selectedPlan,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ...(isWL ? {
          white_label_app_name: form.wl_app_name || null,
          white_label_primary_color: form.wl_primary,
          white_label_secondary_color: form.wl_secondary,
          white_label_domain: form.wl_domain || null,
        } : {}),
      });
      if (error) throw error;
      toast({ title: "Perfil de coach criado com sucesso!" });
      navigate("/coach/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao criar perfil", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <HudShell>
      <nav className="px-6 py-5 flex items-center justify-between max-w-3xl mx-auto">
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "0.08em" }}>
          <span style={{ color: "#F5F0E8" }}>NUTRI</span>
          <span style={{ color: "#B8922A" }}>ON</span>
        </div>
        <HudStatusBar label={isWL ? "ELITE PARTNER" : "COACH PRO"} color={accent} />
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-12 space-y-6">
        <div className="text-center space-y-4 py-6">
          <div className="inline-block"><HudHex code={isWL ? "WL" : "CP"} color={accent} size={72} /></div>
          <h1
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 30, color: "#F5F0E8", letterSpacing: "0.05em" }}
          >
            ATIVAR PERFIL PROFISSIONAL
          </h1>
          <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
            PREENCHA OS DADOS PARA COMEÇAR A GERENCIAR PACIENTES
          </p>
        </div>

        <HudPanel tag="PROF-DATA">
          <div className="p-6 space-y-4">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: "#B8922A", letterSpacing: "0.06em" }}>
              DADOS PROFISSIONAIS
            </h2>

            <div className="hud-input-row">
              <span className="hud-tag">NOM</span>
              <input
                placeholder="Dra. Ana Paula"
                value={form.professional_name}
                onChange={e => setForm(p => ({ ...p, professional_name: e.target.value }))}
              />
            </div>

            <div className="hud-input-row">
              <span className="hud-tag">CRN</span>
              <input
                placeholder="CRN-3 12345"
                value={form.crn}
                onChange={e => setForm(p => ({ ...p, crn: e.target.value }))}
              />
            </div>

            <div className="hud-input-row">
              <span className="hud-tag">BIO</span>
              <textarea
                placeholder="Conte sobre sua experiência e especialidades..."
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={3}
                style={{ resize: "vertical", minHeight: 80 }}
              />
            </div>

            <div>
              <p className="hud-tech mb-3" style={{ color: "#B8922A" }}>ESPECIALIDADES</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => {
                  const sel = form.specialties.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSpecialty(s.id)}
                      className="flex items-center gap-2 px-3 py-1.5 transition-all"
                      style={{
                        background: sel ? "rgba(184,146,42,0.15)" : "rgba(10,10,26,0.6)",
                        border: `1px solid ${sel ? "#B8922A" : "rgba(184,146,42,0.18)"}`,
                        clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 10,
                        letterSpacing: "0.15em",
                        color: sel ? "#F5F0E8" : "rgba(170,170,200,0.7)",
                      }}
                    >
                      <span style={{ color: "#B8922A", fontWeight: 700 }}>{s.code}</span>
                      <span className="uppercase">{s.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </HudPanel>

        {isWL && (
          <HudPanel tag="WL-CONFIG" tagColor="#00D4FF">
            <div className="p-6 space-y-4" style={{ borderTop: "1px solid rgba(0,212,255,0.25)" }}>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: "#00D4FF", letterSpacing: "0.06em" }}>
                CONFIGURAÇÃO WHITE LABEL
              </h2>

              <div className="hud-input-row">
                <span className="hud-tag" style={{ color: "#00D4FF" }}>APP</span>
                <input
                  placeholder='Ex: "NutriVida by Dra. Ana"'
                  value={form.wl_app_name}
                  onChange={e => setForm(p => ({ ...p, wl_app_name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "wl_primary", label: "C-1" },
                  { key: "wl_secondary", label: "C-2" },
                ].map(({ key, label }) => (
                  <div key={key} className="hud-input-row">
                    <span className="hud-tag" style={{ color: "#00D4FF" }}>{label}</span>
                    <input
                      type="color"
                      value={(form as any)[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      style={{ padding: "4px", height: 42, cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>

              <div className="hud-input-row">
                <span className="hud-tag" style={{ color: "#00D4FF" }}>DNS</span>
                <input
                  placeholder="app.draanapaula.com.br"
                  value={form.wl_domain}
                  onChange={e => setForm(p => ({ ...p, wl_domain: e.target.value }))}
                />
              </div>
              <p className="hud-tech" style={{ color: "rgba(80,80,122,1)" }}>
                CONFIGURE VIA CNAME APÓS ATIVAÇÃO
              </p>
            </div>
          </HudPanel>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="hud-btn w-full"
          style={{ background: accent }}
        >
          {loading ? "PROCESSANDO..." : "ATIVAR MÓDULO COACH ►"}
        </button>
      </div>
    </HudShell>
  );
};

export default CoachOnboardingPage;
