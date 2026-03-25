import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Heart, RefreshCw, Fingerprint, Battery, BookOpen, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useBehavioral } from "@/hooks/useBehavioral";
import BehavioralProfileCard from "@/components/behavioral/BehavioralProfileCard";
import BehavioralDiary from "@/components/behavioral/BehavioralDiary";
import BehavioralLoops from "@/components/behavioral/BehavioralLoops";
import IdentityCard from "@/components/behavioral/IdentityCard";
import WillpowerCard from "@/components/behavioral/WillpowerCard";
import EmotionRegulationModal from "@/components/behavioral/EmotionRegulationModal";
import { Button } from "@/components/ui/button";

export default function BehavioralTriggersPage() {
  const navigate = useNavigate();
  const { profile, diary, loops, loading, saveProfile, addDiaryEntry, addLoop, addEmotionLog, incrementVoto } = useBehavioral();
  const [tab, setTab] = useState("perfil");
  const [showRegulation, setShowRegulation] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">APEX Behavioral Engine</h1>
          <p className="text-[10px] text-muted-foreground">Análise e transformação comportamental avançada</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowRegulation(true)} className="text-[10px] h-8 gap-1 border-pink-500/30 text-pink-400 hover:bg-pink-500/10">
          <AlertTriangle className="w-3.5 h-3.5" /> SOS
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="px-4 mt-3">
        <TabsList className="w-full bg-card border border-border h-9 overflow-x-auto">
          <TabsTrigger value="perfil" className="flex-1 text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Brain className="w-3 h-3" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="diario" className="flex-1 text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <BookOpen className="w-3 h-3" /> Diário
          </TabsTrigger>
          <TabsTrigger value="loops" className="flex-1 text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <RefreshCw className="w-3 h-3" /> Loops
          </TabsTrigger>
          <TabsTrigger value="identidade" className="flex-1 text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Fingerprint className="w-3 h-3" /> Identidade
          </TabsTrigger>
          <TabsTrigger value="vontade" className="flex-1 text-[10px] gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Battery className="w-3 h-3" /> Vontade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-3">
          <BehavioralProfileCard profile={profile} onSave={saveProfile} />
        </TabsContent>

        <TabsContent value="diario" className="mt-3">
          <BehavioralDiary entries={diary} onAdd={addDiaryEntry} />
        </TabsContent>

        <TabsContent value="loops" className="mt-3">
          <BehavioralLoops loops={loops} onAdd={addLoop} />
        </TabsContent>

        <TabsContent value="identidade" className="mt-3">
          <IdentityCard profile={profile} onSave={saveProfile} onVote={incrementVoto} />
        </TabsContent>

        <TabsContent value="vontade" className="mt-3">
          <WillpowerCard profile={profile} onSave={saveProfile} />
        </TabsContent>
      </Tabs>

      <EmotionRegulationModal open={showRegulation} onClose={() => setShowRegulation(false)} onSave={addEmotionLog} />
      <BottomNav />
    </div>
  );
}
