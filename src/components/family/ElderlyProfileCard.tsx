import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Pill, Heart, Sun } from "lucide-react";
import type { FamilyMember } from "@/hooks/useFamily";

interface ElderlyProfileCardProps {
  member: FamilyMember;
  todayHydration: number;
  onLogWater: () => void;
}

const ElderlyProfileCard = ({ member, todayHydration, onLogWater }: ElderlyProfileCardProps) => {
  const hydrationPct = Math.min(Math.round((todayHydration / (member.hydration_goal_ml || 2000)) * 100), 100);

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-accent/30">
      <CardContent className="p-5 space-y-5">
        {/* Header — larger text */}
        <div className="flex items-center gap-4">
          <span className="text-5xl">{member.avatar_emoji}</span>
          <div>
            <h3 className="text-xl font-bold">{member.name}</h3>
            {member.age && (
              <p className="text-base text-muted-foreground">{member.age} anos</p>
            )}
          </div>
          <Sun className="ml-auto h-8 w-8 text-primary" />
        </div>

        {/* Hydration — prominent */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <div className="flex items-center gap-3">
            <Droplets className="h-7 w-7 text-accent" />
            <div>
              <p className="text-lg font-bold">Hidratação</p>
              <p className="text-base text-muted-foreground">
                {todayHydration} / {member.hydration_goal_ml} ml
              </p>
            </div>
          </div>
          <div className="h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${hydrationPct}%` }}
            />
          </div>
          <Button
            onClick={onLogWater}
            className="w-full bg-accent text-accent-foreground text-lg py-6 font-bold"
          >
            💧 Registrar 200ml de água
          </Button>
        </div>

        {/* Medications */}
        {member.medications.length > 0 && (
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center gap-2">
              <Pill className="h-6 w-6 text-primary" />
              <p className="text-lg font-bold">Medicamentos</p>
            </div>
            <div className="space-y-2">
              {member.medications.map((med, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 text-base"
                >
                  <span>💊</span>
                  <span className="font-medium">{med}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health notes */}
        {member.health_notes && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-6 w-6 text-destructive" />
              <p className="text-lg font-bold">Observações</p>
            </div>
            <p className="text-base text-muted-foreground">{member.health_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ElderlyProfileCard;
