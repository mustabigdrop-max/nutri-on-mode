import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Type, ArrowLeft, Download, Share2, Copy, Check, Loader2, Star, Zap, Heart, Shield, Bug, Sparkles, ChevronDown, ChevronUp, Clock, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import VoiceRecorderButton from "@/components/ui/VoiceRecorderButton";
import html2canvas from "html2canvas";

// Types
interface MealAnalysis {
  refeicao: { descricao: string; itens: { alimento: string; porcao_g: number; calorias: number; proteinas_g: number; carboidratos_g: number; gorduras_g: number; fibras_g: number }[] };
  totais: { calorias: number; proteinas_g: number; carboidratos_g: number; carboidratos_simples_g: number; carboidratos_complexos_g: number; fibras_g: number; gorduras_g: number; gorduras_saturadas_g: number; gorduras_insaturadas_g: number; gorduras_trans_g: number; sodio_mg: number; indice_glicemico: string };
  micronutrientes: { vitamina_c_pct: number; vitamina_a_pct: number; vitamina_d_pct: number; ferro_pct: number; calcio_pct: number; magnesio_pct: number; zinco_pct: number; potassio_pct: number; antioxidantes: string[]; prebioticos_presentes: boolean };
  score: { total: number; classificacao: string; emoji: string; densidade_nutricional: number; equilibrio_macros: number; qualidade_alimentos: number; indice_inflamatorio: number };
  insights: { o_que_faz_nas_proximas_2h: string; ponto_forte: string; o_que_faltou: string; sugestao_complemento: string; impacto_microbioma: string };
  social: { legenda_educativa: string; legenda_motivacional: string; legenda_casual: string; hashtags: string[]; frase_destaque: string };
}

type InputMode = "select" | "text" | "photo" | "audio";
type CardTheme = "dark-green" | "black" | "white" | "sunset" | "purple";

const THEMES: { id: CardTheme; label: string; emoji: string; bg: string; text: string; accent: string }[] = [
  { id: "dark-green", label: "Dark Green", emoji: "🌿", bg: "bg-[#0a0f0a]", text: "text-green-400", accent: "border-green-500/30" },
  { id: "black", label: "Black Premium", emoji: "⚫", bg: "bg-black", text: "text-white", accent: "border-white/20" },
  { id: "white", label: "White Clean", emoji: "🤍", bg: "bg-white", text: "text-gray-900", accent: "border-gray-200" },
  { id: "sunset", label: "Sunset", emoji: "🌅", bg: "bg-gradient-to-br from-orange-500 to-pink-600", text: "text-white", accent: "border-white/20" },
  { id: "purple", label: "Purple Vibe", emoji: "💜", bg: "bg-gradient-to-br from-purple-700 to-violet-900", text: "text-white", accent: "border-white/20" },
];

// Count-up animation hook
const useCountUp = (target: number, duration = 800) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
};

const ScoreBar = ({ value, label }: { value: number; label: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-mono"><span className="text-muted-foreground">{label}</span><span className="text-green-400">{value}</span></div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} className="h-full bg-green-500 rounded-full" /></div>
  </div>
);

const MicroBar = ({ label, pct }: { label: string; pct: number }) => (
  <div className="flex items-center gap-2 text-xs font-mono">
    <span className="w-16 text-muted-foreground truncate">{label}</span>
    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-green-500/80 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
    <span className="w-8 text-right text-green-400">{pct}%</span>
  </div>
);

export default function RefeicaoSnapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [mode, setMode] = useState<InputMode>("select");
  const [texto, setTexto] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "social" | "history">("analysis");
  const [cardTheme, setCardTheme] = useState<CardTheme>("dark-green");
  const [expandedCard, setExpandedCard] = useState<string | null>("macros");
  const [copiedLegend, setCopiedLegend] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kcalAnim = useCountUp(analysis?.totais?.calorias || 0);
  const scoreAnim = useCountUp(analysis?.score?.total || 0);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any).from("refeicoes_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setHistory((data as any[]) || []);
  }, [user]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Handle photo
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  // Analyze
  const analyze = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const age = profile?.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / 31557600000) : undefined;
      const payload: any = {
        tipo: imageBase64 ? "foto" : "texto",
        perfilUsuario: {
          sexo: profile?.sex || undefined,
          idade: age,
          peso: profile?.weight_kg || undefined,
          objetivo: profile?.objetivo_principal || profile?.goal || undefined,
          metaCalorica: profile?.vet_kcal || undefined,
        },
      };
      if (imageBase64) payload.imagemBase64 = imageBase64;
      else payload.texto = texto;

      const { data, error } = await supabase.functions.invoke("refeicao-snap", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const a = data.analise as MealAnalysis;
      setAnalysis(a);
      setActiveTab("analysis");

      // Save to DB
      await (supabase as any).from("refeicoes_log").insert({
        user_id: user.id,
        tipo_input: imageBase64 ? "foto" : "texto",
        descricao_usuario: texto || a.refeicao?.descricao || "",
        analise_completa: a as any,
        calorias_total: a.totais?.calorias || 0,
        proteinas_g: a.totais?.proteinas_g || 0,
        carboidratos_g: a.totais?.carboidratos_g || 0,
        gorduras_g: a.totais?.gorduras_g || 0,
        score: a.score?.total || 0,
        classificacao: a.score?.classificacao || "",
      });
      fetchHistory();
      toast.success("Refeição analisada com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao analisar refeição");
    } finally {
      setLoading(false);
    }
  };

  // Export card as image
  const exportCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const link = document.createElement("a");
      link.download = `nutrion-snap-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Card salvo!");
    } catch { toast.error("Erro ao exportar"); }
  };

  // Share
  const shareCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "nutrion-snap.png", { type: "image/png" });
        if (navigator.share) {
          await navigator.share({ files: [file], title: "nutriON Snap", text: analysis?.social?.frase_destaque || "" });
        } else {
          const link = document.createElement("a");
          link.download = "nutrion-snap.png";
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });
    } catch { toast.error("Erro ao compartilhar"); }
  };

  const copyLegend = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLegend(key);
    toast.success("Legenda copiada!");
    setTimeout(() => setCopiedLegend(null), 2000);
  };

  const resetInput = () => {
    setMode("select");
    setTexto("");
    setImagePreview(null);
    setImageBase64(null);
    setAnalysis(null);
  };

  const toggle = (id: string) => setExpandedCard(expandedCard === id ? null : id);

  const theme = THEMES.find((t) => t.id === cardTheme) || THEMES[0];

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b10] flex flex-col items-center justify-center gap-6 p-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-green-500/30" />
          <div className="absolute inset-0 rounded-full border-t-2 border-green-400" />
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div key={i} className="absolute w-2 h-2 bg-green-400 rounded-full" animate={{ x: [0, 30, 0, -30, 0], y: [0, -30, 0, 30, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }} />
          ))}
        </motion.div>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-green-400 font-mono text-sm text-center">
          Analisando sua refeição...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#080b10]/95 backdrop-blur border-b border-green-500/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => (analysis ? resetInput() : navigate("/coach/dashboard"))} className="text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-lg font-bold text-green-400 font-mono">Refeição Snap</h1>
          <p className="text-xs text-muted-foreground">Análise instantânea pelo sistema</p>
        </div>
      </div>

      {/* If no analysis yet, show input */}
      {!analysis ? (
        <div className="p-4 space-y-4">
          <AnimatePresence mode="wait">
            {mode === "select" && (
              <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3 pt-8">
                <p className="text-center text-muted-foreground text-sm font-mono mb-6">Como deseja registrar?</p>
                {[
                  { m: "photo" as InputMode, icon: Camera, label: "FOTO DA REFEIÇÃO", desc: "Tire ou envie uma foto", color: "from-green-500/20 to-emerald-500/10" },
                  { m: "audio" as InputMode, icon: Mic, label: "DESCREVER POR ÁUDIO", desc: "Grave o que comeu", color: "from-blue-500/20 to-cyan-500/10" },
                  { m: "text" as InputMode, icon: Type, label: "DIGITAR O QUE COMI", desc: "Descreva livremente", color: "from-purple-500/20 to-violet-500/10" },
                ].map(({ m, icon: Icon, label, desc, color }) => (
                  <motion.button key={m} whileTap={{ scale: 0.97 }} onClick={() => setMode(m)} className={`w-full bg-gradient-to-r ${color} border border-green-500/20 rounded-2xl p-5 flex items-center gap-4 text-left`}>
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center"><Icon className="w-6 h-6 text-green-400" /></div>
                    <div><p className="font-bold font-mono text-sm text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {mode === "text" && (
              <motion.div key="text" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 pt-4">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Ex: comi arroz integral, frango grelhado 150g, brócolis no vapor e azeite..."
                  className="w-full h-32 bg-[#0e1318] border border-green-500/20 rounded-xl p-4 text-sm font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-green-500/50"
                />
                <div className="flex gap-2">
                  <VoiceRecorderButton onTranscript={(t) => setTexto((prev) => (prev ? prev + " " + t : t))} size="sm" />
                  <Button onClick={analyze} disabled={!texto.trim()} className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold font-mono">
                    <Sparkles className="w-4 h-4 mr-2" /> ANALISAR AGORA
                  </Button>
                </div>
                <button onClick={() => setMode("select")} className="text-xs text-muted-foreground underline">← Voltar</button>
              </motion.div>
            )}

            {mode === "photo" && (
              <motion.div key="photo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 pt-4">
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                {!imagePreview ? (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-green-500/30 rounded-2xl flex flex-col items-center justify-center gap-3 bg-[#0e1318]">
                    <Camera className="w-10 h-10 text-green-400" />
                    <span className="text-sm text-muted-foreground font-mono">Toque para tirar foto ou enviar</span>
                  </button>
                ) : (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                    <button onClick={() => { setImagePreview(null); setImageBase64(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">✕</button>
                  </div>
                )}
                <Button onClick={analyze} disabled={!imageBase64} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold font-mono">
                  <Sparkles className="w-4 h-4 mr-2" /> ANALISAR FOTO
                </Button>
                <button onClick={() => setMode("select")} className="text-xs text-muted-foreground underline">← Voltar</button>
              </motion.div>
            )}

            {mode === "audio" && (
              <motion.div key="audio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 pt-4">
                <p className="text-center text-muted-foreground text-sm font-mono">Toque no microfone e descreva o que comeu</p>
                <div className="flex justify-center">
                  <VoiceRecorderButton onTranscript={(t) => setTexto((prev) => (prev ? prev + " " + t : t))} size="md" />
                </div>
                {texto && (
                  <div className="bg-[#0e1318] border border-green-500/20 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1 font-mono">Transcrição:</p>
                    <p className="text-sm text-foreground">{texto}</p>
                  </div>
                )}
                <Button onClick={analyze} disabled={!texto.trim()} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold font-mono">
                  <Sparkles className="w-4 h-4 mr-2" /> ANALISAR AGORA
                </Button>
                <button onClick={() => { setMode("select"); setTexto(""); }} className="text-xs text-muted-foreground underline">← Voltar</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Analysis results */
        <div className="p-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#0e1318] rounded-xl p-1">
            {(["analysis", "social", "history"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${activeTab === t ? "bg-green-500/20 text-green-400" : "text-muted-foreground"}`}>
                {t === "analysis" ? "📊 Análise" : t === "social" ? "📸 Social" : "📋 Histórico"}
              </button>
            ))}
          </div>

          {activeTab === "analysis" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {/* Score Header */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-5 text-center">
                <p className="text-5xl font-bold font-mono text-green-400">{scoreAnim}</p>
                <p className="text-sm text-muted-foreground font-mono">{analysis.score?.classificacao} {analysis.score?.emoji}</p>
                <p className="text-xs text-muted-foreground mt-1">{analysis.refeicao?.descricao}</p>
              </div>

              {/* Macros Card */}
              <div className="bg-[#0e1318] border border-green-500/10 rounded-xl overflow-hidden">
                <button onClick={() => toggle("macros")} className="w-full flex items-center justify-between p-4">
                  <span className="text-sm font-bold font-mono text-green-400">🔥 Macronutrientes</span>
                  {expandedCard === "macros" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedCard === "macros" && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { label: "Calorias", val: kcalAnim, unit: "kcal", emoji: "🔥" },
                            { label: "Proteína", val: analysis.totais?.proteinas_g, unit: "g", emoji: "💪" },
                            { label: "Carbo", val: analysis.totais?.carboidratos_g, unit: "g", emoji: "⚡" },
                            { label: "Gordura", val: analysis.totais?.gorduras_g, unit: "g", emoji: "🥑" },
                          ].map((m) => (
                            <div key={m.label} className="bg-[#141a22] rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">{m.emoji}</p>
                              <p className="text-lg font-bold font-mono text-foreground">{m.val}</p>
                              <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs font-mono space-y-1 text-muted-foreground">
                          <p>Fibras: {analysis.totais?.fibras_g}g | Sódio: {analysis.totais?.sodio_mg}mg</p>
                          <p>IG: <span className={analysis.totais?.indice_glicemico === "baixo" ? "text-green-400" : analysis.totais?.indice_glicemico === "medio" ? "text-yellow-400" : "text-red-400"}>{analysis.totais?.indice_glicemico}</span></p>
                        </div>
                        {/* Items */}
                        <div className="space-y-1">
                          {analysis.refeicao?.itens?.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs font-mono bg-[#141a22] rounded px-2 py-1">
                              <span className="text-foreground truncate flex-1">{item.alimento}</span>
                              <span className="text-green-400 ml-2">{item.calorias}kcal</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Micronutrients */}
              <div className="bg-[#0e1318] border border-green-500/10 rounded-xl overflow-hidden">
                <button onClick={() => toggle("micro")} className="w-full flex items-center justify-between p-4">
                  <span className="text-sm font-bold font-mono text-green-400">🧬 Micronutrientes</span>
                  {expandedCard === "micro" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedCard === "micro" && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <MicroBar label="Vit. C" pct={analysis.micronutrientes?.vitamina_c_pct || 0} />
                        <MicroBar label="Vit. A" pct={analysis.micronutrientes?.vitamina_a_pct || 0} />
                        <MicroBar label="Vit. D" pct={analysis.micronutrientes?.vitamina_d_pct || 0} />
                        <MicroBar label="Ferro" pct={analysis.micronutrientes?.ferro_pct || 0} />
                        <MicroBar label="Cálcio" pct={analysis.micronutrientes?.calcio_pct || 0} />
                        <MicroBar label="Magnésio" pct={analysis.micronutrientes?.magnesio_pct || 0} />
                        <MicroBar label="Zinco" pct={analysis.micronutrientes?.zinco_pct || 0} />
                        <MicroBar label="Potássio" pct={analysis.micronutrientes?.potassio_pct || 0} />
                        {analysis.micronutrientes?.antioxidantes?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">Antioxidantes: {analysis.micronutrientes.antioxidantes.join(", ")}</p>
                        )}
                        {analysis.micronutrientes?.prebioticos_presentes && (
                          <p className="text-xs text-green-400 mt-1">✅ Prebióticos presentes</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Score Breakdown */}
              <div className="bg-[#0e1318] border border-green-500/10 rounded-xl overflow-hidden">
                <button onClick={() => toggle("score")} className="w-full flex items-center justify-between p-4">
                  <span className="text-sm font-bold font-mono text-green-400">🏆 Score Detalhado</span>
                  {expandedCard === "score" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedCard === "score" && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <ScoreBar value={analysis.score?.densidade_nutricional || 0} label="Densidade Nutricional" />
                        <ScoreBar value={analysis.score?.equilibrio_macros || 0} label="Equilíbrio de Macros" />
                        <ScoreBar value={analysis.score?.qualidade_alimentos || 0} label="Qualidade dos Alimentos" />
                        <ScoreBar value={analysis.score?.indice_inflamatorio || 0} label="Índice Anti-Inflamatório" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Insights */}
              <div className="bg-[#0e1318] border border-green-500/10 rounded-xl overflow-hidden">
                <button onClick={() => toggle("insights")} className="w-full flex items-center justify-between p-4">
                  <span className="text-sm font-bold font-mono text-green-400">💡 Insights</span>
                  {expandedCard === "insights" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedCard === "insights" && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3 text-xs font-mono">
                        {[
                          { icon: "⏱️", label: "Próximas 2h", text: analysis.insights?.o_que_faz_nas_proximas_2h },
                          { icon: "💪", label: "Ponto forte", text: analysis.insights?.ponto_forte },
                          { icon: "⚠️", label: "O que faltou", text: analysis.insights?.o_que_faltou },
                          { icon: "💡", label: "Sugestão", text: analysis.insights?.sugestao_complemento },
                          { icon: "🦠", label: "Microbioma", text: analysis.insights?.impacto_microbioma },
                        ].map((ins) => (
                          <div key={ins.label} className="bg-[#141a22] rounded-lg p-3">
                            <p className="text-green-400 font-bold mb-1">{ins.icon} {ins.label}</p>
                            <p className="text-muted-foreground leading-relaxed">{ins.text}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button onClick={resetInput} variant="outline" className="w-full border-green-500/20 text-green-400 font-mono">
                Nova Análise
              </Button>
            </motion.div>
          )}

          {activeTab === "social" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Theme selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {THEMES.map((t) => (
                  <button key={t.id} onClick={() => setCardTheme(t.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono border ${cardTheme === t.id ? "border-green-500 text-green-400" : "border-muted text-muted-foreground"}`}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              {/* Story Card */}
              <div ref={cardRef} className={`${theme.bg} ${theme.accent} border rounded-2xl p-6 space-y-4`} style={{ aspectRatio: "9/16", maxHeight: 500, overflow: "hidden" }}>
                <p className={`text-xs font-mono ${theme.text} opacity-60`}>nutriON</p>
                {imagePreview && <img src={imagePreview} alt="Meal" className="w-full h-28 object-cover rounded-xl" />}
                <div className={`border ${theme.accent} rounded-xl p-4 space-y-2`}>
                  <p className={`text-xs font-bold font-mono ${theme.text}`}>ANÁLISE NUTRICIONAL</p>
                  <p className={`text-sm font-mono ${theme.text}`}>🔥 {analysis.totais?.calorias} kcal</p>
                  <p className={`text-sm font-mono ${theme.text}`}>💪 {analysis.totais?.proteinas_g}g proteína</p>
                  <p className={`text-sm font-mono ${theme.text}`}>⚡ {analysis.totais?.carboidratos_g}g carbo</p>
                  <p className={`text-sm font-mono ${theme.text}`}>🥑 {analysis.totais?.gorduras_g}g gordura</p>
                </div>
                {/* Score bar */}
                <div>
                  <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${analysis.score?.total || 0}%` }} />
                  </div>
                  <p className={`text-sm font-mono font-bold mt-1 ${theme.text}`}>{analysis.score?.total}/100 — {analysis.score?.classificacao} {analysis.score?.emoji}</p>
                </div>
                <p className={`text-xs font-mono ${theme.text} opacity-80 italic`}>"{analysis.social?.frase_destaque}"</p>
                <p className={`text-[10px] font-mono ${theme.text} opacity-40`}>#nutriON #SuaFomeNuncaFoi</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button onClick={exportCard} variant="outline" className="flex-1 border-green-500/20 text-green-400 font-mono text-xs">
                  <Download className="w-4 h-4 mr-1" /> Salvar
                </Button>
                <Button onClick={shareCard} className="flex-1 bg-green-500 hover:bg-green-600 text-black font-mono text-xs">
                  <Share2 className="w-4 h-4 mr-1" /> Compartilhar
                </Button>
              </div>

              {/* Legends */}
              <div className="space-y-3">
                <p className="text-sm font-bold font-mono text-green-400">📝 Legendas prontas</p>
                {[
                  { key: "edu", label: "📚 Educativo", text: analysis.social?.legenda_educativa },
                  { key: "motiv", label: "🔥 Motivacional", text: analysis.social?.legenda_motivacional },
                  { key: "casual", label: "😎 Casual", text: analysis.social?.legenda_casual },
                ].map(({ key, label, text }) => (
                  <div key={key} className="bg-[#0e1318] border border-green-500/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-green-400">{label}</span>
                      <button onClick={() => copyLegend(text || "", key)} className="text-xs text-muted-foreground flex items-center gap-1">
                        {copiedLegend === key ? <><Check className="w-3 h-3 text-green-400" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm font-mono py-8">Nenhuma refeição registrada ainda</p>
              ) : (
                history.map((h) => {
                  const a = h.analise_completa as MealAnalysis | null;
                  return (
                    <div key={h.id} className="bg-[#0e1318] border border-green-500/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(h.created_at).toLocaleDateString("pt-BR")} {new Date(h.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-xs font-mono text-green-400">{h.score}/100 {a?.score?.emoji || ""}</span>
                      </div>
                      <p className="text-sm text-foreground font-mono truncate">{h.descricao_usuario || a?.refeicao?.descricao || "—"}</p>
                      <div className="flex gap-3 mt-2 text-xs font-mono text-muted-foreground">
                        <span>🔥 {h.calorias_total}kcal</span>
                        <span>💪 {Number(h.proteinas_g).toFixed(0)}g</span>
                        <span>⚡ {Number(h.carboidratos_g).toFixed(0)}g</span>
                        <span>🥑 {Number(h.gorduras_g).toFixed(0)}g</span>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
