import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useFamily, FamilyMember } from "@/hooks/useFamily";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Users,
  Baby,
  UserRound,
  Heart,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import ChildProfileCard from "@/components/family/ChildProfileCard";
import ElderlyProfileCard from "@/components/family/ElderlyProfileCard";
import FamilyWeeklyReport from "@/components/family/FamilyWeeklyReport";

const profileTypeIcons: Record<string, any> = {
  adult: UserRound,
  child: Baby,
  elderly: Heart,
};

const profileTypeLabels: Record<string, string> = {
  adult: "Adulto",
  child: "Criança",
  elderly: "Idoso",
};

const avatarOptions = ["👤", "👦", "👧", "👨", "👩", "👴", "👵", "🧒", "👶", "🦸", "🧑‍🍳"];

const FamilyPage = () => {
  const navigate = useNavigate();
  const { members, mealLogs, loading, addMember, updateMember, deleteMember, addMealLog, awardStars, getWeeklyReport } = useFamily();
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [profileType, setProfileType] = useState<"adult" | "child" | "elderly">("adult");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState("👤");
  const [medications, setMedications] = useState("");
  const [healthNotes, setHealthNotes] = useState("");
  const [hydrationGoal, setHydrationGoal] = useState("2000");

  const today = format(new Date(), "yyyy-MM-dd");

  const resetForm = () => {
    setName("");
    setProfileType("adult");
    setAge("");
    setAvatar("👤");
    setMedications("");
    setHealthNotes("");
    setHydrationGoal("2000");
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    const error = await addMember({
      name: name.trim(),
      profile_type: profileType,
      avatar_emoji: avatar,
      age: age ? parseInt(age) : null,
      medications: medications ? medications.split(",").map((m) => m.trim()) : [],
      health_notes: healthNotes || null,
      hydration_goal_ml: parseInt(hydrationGoal) || 2000,
    } as any);
    if (!error) {
      toast({ title: "✅ Membro adicionado!" });
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMember(id);
    toast({ title: "Membro removido" });
    if (selectedMember === id) setSelectedMember(null);
  };

  const getMemberTodayLogs = (memberId: string) =>
    mealLogs.filter((l) => l.member_id === memberId && l.meal_date === today);

  const handleLogFruit = async (memberId: string) => {
    await addMealLog({
      member_id: memberId,
      meal_type: "snack",
      description: "Fruta",
      fruits_eaten: 1,
    });
    await awardStars(memberId, 1);
    toast({ title: "🍎 +1 fruta! ⭐ +1 estrela!" });
  };

  const handleLogWater = async (memberId: string) => {
    await addMealLog({
      member_id: memberId,
      meal_type: "hydration",
      description: "Água",
      hydration_ml: 200,
    });
    toast({ title: "💧 +200ml de água!" });
  };

  const active = selectedMember ? members.find((m) => m.id === selectedMember) : null;
  const report = getWeeklyReport();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold font-heading flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Modo Família
            </h1>
            <p className="text-xs text-muted-foreground">{members.length} membro(s)</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="ml-auto bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6 pb-24">
        {/* Add member form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Novo membro</CardTitle>
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Nome</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome do familiar"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Perfil</Label>
                      <Select value={profileType} onValueChange={(v) => setProfileType(v as any)}>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult">🧑 Adulto</SelectItem>
                          <SelectItem value="child">👶 Criança</SelectItem>
                          <SelectItem value="elderly">👴 Idoso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Idade</Label>
                      <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="—"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Avatar</Label>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {avatarOptions.map((e) => (
                        <button
                          key={e}
                          onClick={() => setAvatar(e)}
                          className={`text-2xl p-1 rounded-lg transition-all ${
                            avatar === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-secondary"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  {profileType === "elderly" && (
                    <>
                      <div>
                        <Label className="text-xs">Medicamentos (separados por vírgula)</Label>
                        <Input
                          value={medications}
                          onChange={(e) => setMedications(e.target.value)}
                          placeholder="Ex: Losartana, Metformina"
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Meta de hidratação (ml)</Label>
                        <Input
                          type="number"
                          value={hydrationGoal}
                          onChange={(e) => setHydrationGoal(e.target.value)}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Observações de saúde</Label>
                        <Textarea
                          value={healthNotes}
                          onChange={(e) => setHealthNotes(e.target.value)}
                          placeholder="Ex: Diabético tipo 2, restrição de sódio"
                          className="bg-secondary border-border"
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                  <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground">
                    Adicionar membro
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member list */}
        {members.length === 0 && !loading && (
          <div className="text-center py-12 space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum membro da família adicionado</p>
            <p className="text-xs text-muted-foreground">
              Adicione perfis para Adultos, Crianças ou Idosos
            </p>
          </div>
        )}

        <div className="space-y-3">
          {members.map((member) => {
            const Icon = profileTypeIcons[member.profile_type] || UserRound;
            const isSelected = selectedMember === member.id;

            return (
              <motion.div key={member.id} layout>
                {/* Member selector */}
                <div
                  onClick={() => setSelectedMember(isSelected ? null : member.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  <span className="text-3xl">{member.avatar_emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{member.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      <span>{profileTypeLabels[member.profile_type]}</span>
                      {member.age && <span>· {member.age} anos</span>}
                      {member.profile_type === "child" && (
                        <span className="text-primary">⭐ {member.stars}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(member.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expanded profile card */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      {member.profile_type === "child" && (
                        <ChildProfileCard
                          member={member}
                          todayFruits={getMemberTodayLogs(member.id).reduce(
                            (s, l) => s + (l.fruits_eaten ?? 0),
                            0
                          )}
                          todayHydration={getMemberTodayLogs(member.id).reduce(
                            (s, l) => s + (l.hydration_ml ?? 0),
                            0
                          )}
                          onLogFruit={() => handleLogFruit(member.id)}
                          onLogWater={() => handleLogWater(member.id)}
                        />
                      )}
                      {member.profile_type === "elderly" && (
                        <ElderlyProfileCard
                          member={member}
                          todayHydration={getMemberTodayLogs(member.id).reduce(
                            (s, l) => s + (l.hydration_ml ?? 0),
                            0
                          )}
                          onLogWater={() => handleLogWater(member.id)}
                        />
                      )}
                      {member.profile_type === "adult" && (
                        <Card className="bg-card border-border">
                          <CardContent className="p-4 text-center text-sm text-muted-foreground">
                            <UserRound className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p>Perfil adulto usa o dashboard principal.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => navigate("/dashboard")}
                            >
                              Ir ao dashboard
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly family report */}
        {members.length > 0 && <FamilyWeeklyReport report={report} />}
      </div>
      <BottomNav />
    </div>
  );
};

export default FamilyPage;
