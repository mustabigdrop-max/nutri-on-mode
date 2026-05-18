import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const SPECIALTIES = [
  { code: "EM", label: "emagrecimento" },
  { code: "HT", label: "hipertrofia" },
  { code: "PE", label: "performance" },
  { code: "G1", label: "GLP-1" },
  { code: "ES", label: "esportiva" },
  { code: "IN", label: "infantil" },
  { code: "CL", label: "clínica" },
];

const HudInput = ({
  type = "text", placeholder, value, onChange, icon, required,
}: {
  type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: string; required?: boolean;
}) => (
  <div className="relative group">
    <div
      className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
      style={{ width: 44, borderRight: "1px solid rgba(184,146,42,0.2)" }}
    >
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.08em", color: "rgba(184,146,42,0.5)" }}>
        {icon}
      </span>
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={{
        width: "100%",
        paddingLeft: 52,
        paddingRight: 16,
        paddingTop: 13,
        paddingBottom: 13,
        background: "rgba(10,10,26,0.8)",
        border: "1px solid rgba(184,146,42,0.18)",
        color: "#F5F0E8",
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "0.88rem",
        outline: "none",
        transition: "border-color 0.2s",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
      }}
      onFocus={(e) => { e.target.style.borderColor = `rgba(184,146,42,0.5)`; }}
      onBlur={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.18)"; }}
    />
    <span
      className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
      style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
    />
  </div>
);

const CoachOnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = (location.state as any)?.plan || "coach";
  const isWhiteLabel = selectedPlan === "white_label";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    professional_name: "",
    crn: "",
    bio: "",
    specialties: [] as string[],
    wl_app_name: "",
    wl_primary: "#E8A020",
    wl_secondary: "#1a1a2e",
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
        ...(isWhiteLabel ? {
          white_label_app_name: form.wl_app_name || null,
          white_label_primary_color: form.wl_primary,
          white_label_secondary_color: form.wl_secondary,
          white_label_domain: form.wl_domain || null,
        } : {}),
      });
      if (error) throw error;
      toast({ title: "Perfil profissional ativado!" });
      navigate("/coach/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao criar perfil", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#0a0a1a", fontFamily: "'Space Grotesk', sans-serif", color: "#F5F0E8" }}
    >
      {/* Hex grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(184,146,42,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,146,42,.04) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <div className="hud-scan-line" />

      {/* Nav */}
      <nav
        className="relative z-10 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}
      >
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "0.06em" }}>
          <span style={{ color: "#F5F0E8" }}>NUTRI</span>
          <span style={{ color: GOLD }}>ON</span>
        </span>
        <span
          className="px-2.5 py-1"
          style={{
            border: `1px solid ${isWhiteLabel ? CYAN : GOLD}44`,
            color: isWhiteLabel ? CYAN : GOLD,
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.48rem",
            letterSpacing: "0.15em",
          }}
        >
          {isWhiteLabel ? "ELITE PARTNER" : "COACH PRO"}
        </span>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 56, height: 56,
              background: `rgba(${isWhiteLabel ? "0,212,255" : "184,146,42"},0.1)`,
              border: `1px solid ${isWhiteLabel ? CYAN : GOLD}44`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: isWhiteLabel ? CYAN : GOLD }}>
              {isWhiteLabel ? "WL" : "CP"}
            </span>
          </div>
          <h1
            className="leading-tight mb-2"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "2.2rem" }}
          >
            ATIVAR PERFIL PROFISSIONAL
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.7)" }}>
            CONFIGURE SEU ACESSO AO MÓDULO COACH
          </p>
        </motion.div>

        <div className="space-y-5">
          {/* Professional data card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              border: "1px solid rgba(184,146,42,0.12)",
              background: "rgba(10,10,26,0.6)",
              clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
            }}
          >
            {/* Card header */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid rgba(184,146,42,0.08)" }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" }}>
                Dados Profissionais
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.4)" }}>
                PROF-DATA
              </span>
            </div>

            <div className="p-5 space-y-3">
              <HudInput
                placeholder="Nome profissional *"
                value={form.professional_name}
                onChange={v => setForm(p => ({ ...p, professional_name: v }))}
                icon="NOM"
                required
              />
              <HudInput
                placeholder="CRN (opcional)"
                value={form.crn}
                onChange={v => setForm(p => ({ ...p, crn: v }))}
                icon="CRN"
              />

              {/* Bio textarea */}
              <div className="relative group">
                <div
                  className="absolute left-0 top-0 flex items-center justify-center"
                  style={{ width: 44, height: 44, borderRight: "1px solid rgba(184,146,42,0.2)" }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.08em", color: "rgba(184,146,42,0.5)" }}>BIO</span>
                </div>
                <textarea
                  placeholder="Conte sobre sua experiência e especialidades..."
                  value={form.bio}
                  onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  style={{
                    width: "100%",
                    paddingLeft: 52,
                    paddingRight: 16,
                    paddingTop: 13,
                    paddingBottom: 13,
                    background: "rgba(10,10,26,0.8)",
                    border: "1px solid rgba(184,146,42,0.18)",
                    color: "#F5F0E8",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.88rem",
                    outline: "none",
                    resize: "none",
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(184,146,42,0.18)"; }}
                />
              </div>

              {/* Specialties */}
              <div>
                <div className="mb-3" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.12em", color: "rgba(80,80,122,0.7)", textTransform: "uppercase" }}>
                  Especialidades
                </div>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => {
                    const sel = form.specialties.includes(s.label);
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => toggleSpecialty(s.label)}
                        className="flex items-center gap-1.5 transition-all"
                        style={{
                          padding: "5px 10px",
                          background: sel ? `rgba(184,146,42,0.12)` : "transparent",
                          border: `1px solid ${sel ? GOLD + "66" : "rgba(80,80,122,0.3)"}`,
                          color: sel ? GOLD : "rgba(80,80,122,0.8)",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "0.5rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ opacity: 0.6, fontSize: "0.42rem" }}>{s.code}</span>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* White Label config */}
          {isWhiteLabel && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                border: `1px solid ${CYAN}22`,
                background: "rgba(0,212,255,0.02)",
                clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: `1px solid ${CYAN}14` }}
              >
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.15em", color: CYAN, textTransform: "uppercase" }}>
                  Configuração White Label
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.45rem", letterSpacing: "0.1em", color: "rgba(0,212,255,0.3)" }}>
                  WL-CONFIG
                </span>
              </div>

              <div className="p-5 space-y-3">
                <HudInput
                  placeholder='Nome do app (ex: "NutriVida by Dra. Ana")'
                  value={form.wl_app_name}
                  onChange={v => setForm(p => ({ ...p, wl_app_name: v }))}
                  icon="APP"
                />
                <HudInput
                  placeholder="Domínio personalizado (ex: app.draana.com.br)"
                  value={form.wl_domain}
                  onChange={v => setForm(p => ({ ...p, wl_domain: v }))}
                  icon="DNS"
                />

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "wl_primary", label: "Cor primária", icon: "C1" },
                    { key: "wl_secondary", label: "Cor secundária", icon: "C2" },
                  ].map(({ key, label, icon }) => (
                    <div key={key}>
                      <div className="mb-1.5" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.1em", color: "rgba(80,80,122,0.7)" }}>
                        {label}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(form as any)[key]}
                          onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                          style={{ width: 36, height: 36, border: "1px solid rgba(0,212,255,0.2)", background: "none", cursor: "pointer", padding: 2 }}
                        />
                        <input
                          type="text"
                          value={(form as any)[key]}
                          onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            background: "rgba(10,10,26,0.8)",
                            border: "1px solid rgba(0,212,255,0.18)",
                            color: "#F5F0E8",
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "0.65rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.48rem", letterSpacing: "0.08em", color: "rgba(80,80,122,0.5)" }}>
                  Configure CNAME do domínio após ativação
                </p>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            style={{
              background: isWhiteLabel ? CYAN : GOLD,
              color: "#0a0a1a",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "1.1rem",
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "ATIVANDO PERFIL..." : "ATIVAR MÓDULO COACH →"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CoachOnboardingPage;
