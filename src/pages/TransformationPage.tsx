import { useState, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Upload, Loader2, Share2, Sparkles, SlidersHorizontal, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useProgressPhotos, ProgressPhoto } from "@/hooks/useProgressPhotos";
import { useMonthlyCard } from "@/hooks/useMonthlyCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PhotoTimeline from "@/components/transformation/PhotoTimeline";
import BeforeAfterSlider from "@/components/transformation/BeforeAfterSlider";
import TransformationShareCard from "@/components/transformation/TransformationShareCard";
import MonthlyTransformationCard from "@/components/transformation/MonthlyTransformationCard";

const TransformationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { photos, loading, uploading, uploadPhoto, deletePhoto } = useProgressPhotos();
  const { cardData, loading: cardLoading, generateCard, setCardData } = useMonthlyCard();

  const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
  const [showSlider, setShowSlider] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMonthlyCard, setShowMonthlyCard] = useState(false);
  const [uploadWeight, setUploadWeight] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowUploadForm(true);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    try {
      await uploadPhoto(pendingFile, {
        weight_kg: uploadWeight ? Number(uploadWeight) : undefined,
        streak_days: profile?.streak_days || 0,
        kcal_target: profile?.vet_kcal || undefined,
      });
      toast.success("Foto salva! 📸");
      setShowUploadForm(false);
      setPendingFile(null);
      setUploadWeight("");
    } catch {
      toast.error("Erro ao enviar foto");
    }
  };

  const toggleSelect = (photo: ProgressPhoto) => {
    setSelectedPhotos(prev => {
      const exists = prev.find(p => p.id === photo.id);
      if (exists) return prev.filter(p => p.id !== photo.id);
      if (prev.length >= 2) return [prev[1], photo]; // Keep last 2
      return [...prev, photo];
    });
  };

  const handleCompare = () => {
    if (selectedPhotos.length === 2) setShowSlider(true);
  };

  const analyzeWithAI = async () => {
    if (photos.length < 2) { toast.error("Precisa de pelo menos 2 fotos"); return; }
    setAnalyzingAi(true);
    try {
      const photoSummary = photos.slice(0, 20).map(p =>
        `${p.photo_date}: ${p.weight_kg ? p.weight_kg + "kg" : "sem peso"}, streak: ${p.streak_days}d`
      ).join("\n");

      const { data, error } = await supabase.functions.invoke("nutri-coach", {
        body: {
          messages: [
            {
              role: "user",
              content: `Analise minha evolução corporal baseado nestes registros fotográficos:\n\n${photoSummary}\n\nTotal de fotos: ${photos.length}\nPeríodo: ${photos[photos.length - 1]?.photo_date} a ${photos[0]?.photo_date}\n\nGere um relatório motivacional sobre minha consistência, progresso de peso e evolução. Use dados concretos.`
            }
          ],
          profileContext: profile ? `Nome: ${profile.full_name}, Objetivo: ${profile.goal}, Meta: ${profile.vet_kcal}kcal` : "",
        },
      });

      // Parse streaming response
      if (error) throw error;
      const reader = data.getReader?.();
      if (!reader) {
        setAiAnalysis("Não foi possível gerar a análise.");
        setAnalyzingAi(false);
        return;
      }
      const decoder = new TextDecoder();
      let result = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { result += c; setAiAnalysis(result); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro na análise IA");
    }
    setAnalyzingAi(false);
  };

  const handleDelete = async (photo: ProgressPhoto) => {
    await deletePhoto(photo);
    setSelectedPhotos(prev => prev.filter(p => p.id !== photo.id));
    toast.success("Foto removida");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">Transformação</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Diário fotográfico e evolução</p>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-4 max-w-lg mx-auto space-y-4">
        {/* Upload + Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {uploading ? "Enviando..." : "Nova Foto"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

          <button
            onClick={async () => {
              const data = await generateCard(photos);
              if (data) setShowMonthlyCard(true);
              else toast.error("Não foi possível gerar o card");
            }}
            disabled={cardLoading}
            className="px-4 py-3 rounded-xl bg-card border border-border text-xs font-bold text-foreground flex items-center gap-1 disabled:opacity-50"
          >
            {cardLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarDays className="w-3.5 h-3.5" />}
            Card Mensal
          </button>

          {selectedPhotos.length === 2 && (
            <>
              <button
                onClick={handleCompare}
                className="px-4 py-3 rounded-xl bg-card border border-border text-xs font-bold text-foreground flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Comparar
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="px-4 py-3 rounded-xl bg-card border border-border text-xs font-bold text-foreground flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Upload form modal */}
        <AnimatePresence>
          {showUploadForm && pendingFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={URL.createObjectURL(pendingFile)}
                  alt="Preview"
                  className="w-16 h-20 rounded-lg object-cover border border-border"
                />
                <div className="flex-1 space-y-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Peso atual (kg)"
                    value={uploadWeight}
                    onChange={e => setUploadWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpload} disabled={uploading} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
                  {uploading ? "Salvando..." : "Salvar Foto"}
                </button>
                <button onClick={() => { setShowUploadForm(false); setPendingFile(null); }} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs">
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis */}
        {photos.length >= 2 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">Análise IA</span>
              </div>
              <button
                onClick={analyzeWithAI}
                disabled={analyzingAi}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold disabled:opacity-50"
              >
                {analyzingAi ? "Analisando..." : "Gerar Relatório"}
              </button>
            </div>
            {aiAnalysis && (
              <div className="prose prose-sm prose-invert max-w-none text-xs [&_p]:mb-2 [&_strong]:text-primary mt-2">
                <p className="text-muted-foreground whitespace-pre-wrap">{aiAnalysis}</p>
              </div>
            )}
          </div>
        )}

        {/* Before/After Slider */}
        <AnimatePresence>
          {showSlider && selectedPhotos.length === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">Antes × Depois</span>
                <button onClick={() => setShowSlider(false)} className="text-[10px] text-muted-foreground">Fechar</button>
              </div>
              <BeforeAfterSlider
                before={selectedPhotos[0].photo_date <= selectedPhotos[1].photo_date ? selectedPhotos[0] : selectedPhotos[1]}
                after={selectedPhotos[0].photo_date > selectedPhotos[1].photo_date ? selectedPhotos[0] : selectedPhotos[1]}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        {selectedPhotos.length > 0 && selectedPhotos.length < 2 && (
          <p className="text-[10px] text-muted-foreground text-center">Selecione mais 1 foto para comparar</p>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-sm font-bold text-foreground mb-1">Comece seu diário</h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Tire sua primeira foto corporal. A cada semana, registre seu progresso e veja sua transformação!
            </p>
          </div>
        ) : (
          <PhotoTimeline
            photos={photos}
            onSelect={toggleSelect}
            onDelete={handleDelete}
            selectedIds={selectedPhotos.map(p => p.id)}
          />
        )}
      </div>

      {/* Share card */}
      <AnimatePresence>
        {showShare && selectedPhotos.length === 2 && (
          <TransformationShareCard
            before={selectedPhotos[0].photo_date <= selectedPhotos[1].photo_date ? selectedPhotos[0] : selectedPhotos[1]}
            after={selectedPhotos[0].photo_date > selectedPhotos[1].photo_date ? selectedPhotos[0] : selectedPhotos[1]}
            onClose={() => setShowShare(false)}
            userName={profile?.full_name || ""}
            streakDays={profile?.streak_days || 0}
          />
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default TransformationPage;
