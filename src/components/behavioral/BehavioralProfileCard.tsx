import { useState } from "react";
import { Brain, Target, Shield, Flame, Heart, Eye, Crown, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BehavioralProfile } from "@/hooks/useBehavioral";

const PERFIS = [
  { key: "executor_impulsivo", label: "Executor Impulsivo", icon: Flame, color: "text-orange-400", desc: "Faz tudo na velocidade máxima até parar completamente" },
  { key: "planejador_paralisado", label: "Planejador Paralisado", icon: Target, color: "text-blue-400", desc: "Sabe tudo mas nunca começa porque nunca está pronto" },
  { key: "consistente_invisivel", label: "Consistente Invisível", icon: Eye, color: "text-emerald-400", desc: "Faz tudo certo mas sabota nos detalhes que não conta" },
  { key: "emocional_ciclico", label: "Emocional Cíclico", icon: Heart, color: "text-pink-400", desc: "O estado emocional determina tudo" },
  { key: "sabotador_inconsciente", label: "Sabotador Inconsciente", icon: Shield, color: "text-red-400", desc: "Chega perto do objetivo e destrói tudo" },
  { key: "perfeccionista_destrutivo", label: "Perfeccionista Autodestrutivo", icon: Crown, color: "text-purple-400", desc: "Tudo ou nada — e como o perfeito é impossível, sempre é nada" },
  { key: "dependente_validacao", label: "Dependente de Validação", icon: Users, color: "text-amber-400", desc: "Funciona com acompanhamento, para quando a atenção acaba" },
];

const ESTAGIOS = ["Pré-contemplação", "Contemplação", "Preparação", "Ação", "Manutenção"];

interface Props {
  profile: BehavioralProfile | null;
  onSave: (data: Partial<BehavioralProfile>) => void;
}

export default function BehavioralProfileCard({ profile, onSave }: Props) {
  const [selecting, setSelecting] = useState(!profile?.perfil_primario);
  const [selected, setSelected] = useState<string[]>(
    [profile?.perfil_primario, profile?.perfil_secundario].filter(Boolean) as string[]
  );

  const handleSave = () => {
    onSave({ perfil_primario: selected[0] || null, perfil_secundario: selected[1] || null });
    setSelecting(false);
  };

  const togglePerfil = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(p => p !== key) : prev.length < 2 ? [...prev, key] : [prev[1], key]);
  };

  const primaryPerfil = PERFIS.find(p => p.key === profile?.perfil_primario);
  const estagioIdx = ESTAGIOS.indexOf(profile?.estagio_mudanca || "Contemplação");

  if (selecting) {
    return (
      <Card className="border-primary/20 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Identifique Seus Perfis</CardTitle>
          <p className="text-[10px] text-muted-foreground">Selecione até 2 perfis (primário + secundário)</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {PERFIS.map(p => {
            const Icon = p.icon;
            const isSelected = selected.includes(p.key);
            const idx = selected.indexOf(p.key);
            return (
              <button key={p.key} onClick={() => togglePerfil(p.key)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? "border-primary/50 bg-primary/10" : "border-border bg-background hover:bg-muted/50"}`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${p.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{p.label}</span>
                      {idx === 0 && <Badge variant="default" className="text-[8px] px-1 py-0">Primário</Badge>}
                      {idx === 1 && <Badge variant="secondary" className="text-[8px] px-1 py-0">Secundário</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
          <Button onClick={handleSave} disabled={selected.length === 0} className="w-full mt-3" size="sm">
            Salvar Perfis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Perfil Comportamental</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setSelecting(true)} className="text-[10px] h-6">Alterar</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {primaryPerfil && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <primaryPerfil.icon className={`w-8 h-8 ${primaryPerfil.color}`} />
            <div>
              <p className="text-xs font-bold">{primaryPerfil.label}</p>
              <p className="text-[10px] text-muted-foreground">{primaryPerfil.desc}</p>
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Estágio de Mudança</p>
          <div className="flex gap-1">
            {ESTAGIOS.map((e, i) => (
              <button key={e} onClick={() => onSave({ estagio_mudanca: e })}
                className={`flex-1 text-[8px] py-1.5 rounded-lg text-center transition-all ${i <= estagioIdx ? "bg-primary/20 text-primary font-bold" : "bg-muted text-muted-foreground"}`}>
                {e.split("-")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-primary">{profile?.streak_atual || 0}</p>
            <p className="text-[8px] text-muted-foreground">Streak</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-emerald-400">{profile?.votos_identidade || 0}</p>
            <p className="text-[8px] text-muted-foreground">Votos</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-amber-400">{Math.round(profile?.taxa_aderencia_geral || 0)}%</p>
            <p className="text-[8px] text-muted-foreground">Aderência</p>
          </div>
        </div>

        {profile?.risco_abandono !== undefined && profile.risco_abandono > 0 && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-red-400 font-semibold">Risco de Abandono</span>
              <span className="text-[10px] text-red-400">{profile.risco_abandono}%</span>
            </div>
            <Progress value={profile.risco_abandono} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
