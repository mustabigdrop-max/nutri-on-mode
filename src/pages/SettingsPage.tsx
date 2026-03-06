import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  ArrowLeft, Save, LogOut, User, Target, Activity,
  Scale, Ruler, Calendar, Dumbbell, Heart, Shield, Bell
} from "lucide-react";
import { toast } from "sonner";

const GOALS: Record<string, string> = {
  lose_weight: "Emagrecimento",
  gain_muscle: "Hipertrofia",
  definition: "Definição",
  health: "Saúde Geral",
  maintenance: "Manutenção",
  performance: "Performance",
  glp1: "Protocolo GLP-1",
};

const ACTIVITY_LEVELS: Record<string, string> = {
  sedentary: "Sedentário",
  light: "Leve",
  moderate: "Moderado",
  very_active: "Muito Ativo",
  athlete: "Atleta",
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [trainingFrequency, setTrainingFrequency] = useState("");
  const [sport, setSport] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [conditions, setConditions] = useState("");
  const [usesGlp1, setUsesGlp1] = useState(false);

  // Populate from profile
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || "");
    setDateOfBirth(profile.date_of_birth || "");
    setSex(profile.sex || "");
    setWeightKg(profile.weight_kg ? String(profile.weight_kg) : "");
    setHeightCm(profile.height_cm ? String(profile.height_cm) : "");
    setGoal(profile.goal || "");
    setActivityLevel(profile.activity_level || "");
    setTrainingFrequency(profile.training_frequency ? String(profile.training_frequency) : "");
    setSport(profile.sport || "");
    setRestrictions(profile.dietary_restrictions?.join(", ") || "");
    setConditions(profile.health_conditions?.join(", ") || "");
    setUsesGlp1(profile.uses_glp1 || false);
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const ACTIVITY_FACTORS: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725, athlete: 1.9,
    };
    const w = Number(weightKg) || 70;
    const h = Number(heightCm) || 170;
    const birthDate = dateOfBirth ? new Date(dateOfBirth) : new Date(1990, 0, 1);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const s = sex || "male";

    // Mifflin-St Jeor
    const geb = s === "male" ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
    const factor = ACTIVITY_FACTORS[activityLevel] || 1.55;
    const get = geb * factor;

    // Macros
    let vet = get;
    let proteinPerKg = 1.6;
    switch (goal) {
      case "lose_weight": vet = get - 500; proteinPerKg = 2.0; break;
      case "gain_muscle": vet = get + 350; proteinPerKg = 2.2; break;
      case "definition": vet = get - 500; proteinPerKg = 2.2; break;
      case "performance": vet = get + 250; proteinPerKg = 2.0; break;
      case "glp1": vet = get - 400; proteinPerKg = 2.2; break;
    }
    if (usesGlp1) proteinPerKg = Math.max(proteinPerKg, 2.0);
    const protein = Math.round(w * proteinPerKg);
    const fat = Math.round((vet * 0.25) / 9);
    const carbs = Math.round(Math.max((vet - protein * 4 - fat * 9) / 4, 50));

    const error = await updateProfile({
      full_name: fullName || null,
      date_of_birth: dateOfBirth || null,
      sex: s,
      weight_kg: w,
      height_cm: h,
      goal: goal || null,
      activity_level: activityLevel || null,
      training_frequency: trainingFrequency ? Number(trainingFrequency) : null,
      sport: sport || null,
      dietary_restrictions: restrictions ? restrictions.split(",").map(r => r.trim()) : null,
      health_conditions: conditions ? conditions.split(",").map(c => c.trim()) : null,
      uses_glp1: usesGlp1,
      geb_kcal: Math.round(geb),
      get_kcal: Math.round(get),
      vet_kcal: Math.round(vet),
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
    });

    if (error) {
      toast.error("Erro ao salvar configurações");
    } else {
      toast.success("Configurações salvas! Macros recalculados ✓");
    }
    setSaving(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5";
  const selectClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none";

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/profile")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Configurações</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Editar perfil e metas</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" /> {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="relative z-10 px-4 mt-4 max-w-lg mx-auto space-y-6">
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Dados Pessoais
          </h2>
          <div>
            <label className={labelClass}>Nome completo</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="Seu nome" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><Calendar className="w-3 h-3" /> Nascimento</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sexo</label>
              <select value={sex} onChange={e => setSex(e.target.value)} className={selectClass}>
                <option value="">—</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Body */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" /> Medidas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><Scale className="w-3 h-3" /> Peso (kg)</label>
              <input type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Ruler className="w-3 h-3" /> Altura (cm)</label>
              <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={inputClass} />
            </div>
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Objetivo & Atividade
          </h2>
          <div>
            <label className={labelClass}>Objetivo principal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className={selectClass}>
              <option value="">—</option>
              {Object.entries(GOALS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}><Activity className="w-3 h-3" /> Nível de atividade</label>
            <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className={selectClass}>
              <option value="">—</option>
              {Object.entries(ACTIVITY_LEVELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><Dumbbell className="w-3 h-3" /> Treinos/semana</label>
              <input type="number" min="0" max="14" value={trainingFrequency} onChange={e => setTrainingFrequency(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Esporte</label>
              <input value={sport} onChange={e => setSport(e.target.value)} className={inputClass} placeholder="Musculação, corrida..." />
            </div>
          </div>
        </motion.div>

        {/* Health */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-3.5 h-3.5" /> Saúde & Restrições
          </h2>
          <div>
            <label className={labelClass}>Restrições alimentares (separadas por vírgula)</label>
            <input value={restrictions} onChange={e => setRestrictions(e.target.value)} className={inputClass} placeholder="Lactose, glúten..." />
          </div>
          <div>
            <label className={labelClass}>Condições de saúde</label>
            <input value={conditions} onChange={e => setConditions(e.target.value)} className={inputClass} placeholder="Diabetes, hipertensão..." />
          </div>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer">
            <input
              type="checkbox"
              checked={usesGlp1}
              onChange={e => setUsesGlp1(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <div>
              <span className="text-sm font-semibold text-foreground">Usa GLP-1 (Ozempic, Wegovy...)</span>
              <p className="text-[10px] text-muted-foreground">Ativa protocolo com proteína elevada</p>
            </div>
          </label>
        </motion.div>

        {/* Calculated macros preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Protocolo Atual
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <span className="text-muted-foreground">Meta calórica:</span>
            <span className="text-foreground font-semibold">{profile.vet_kcal} kcal</span>
            <span className="text-muted-foreground">Proteína:</span>
            <span className="text-foreground font-semibold">{profile.protein_g}g</span>
            <span className="text-muted-foreground">Carboidrato:</span>
            <span className="text-foreground font-semibold">{profile.carbs_g}g</span>
            <span className="text-muted-foreground">Gordura:</span>
            <span className="text-foreground font-semibold">{profile.fat_g}g</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            * Macros serão recalculados ao salvar com base nos novos dados
          </p>
        </motion.div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default SettingsPage;
