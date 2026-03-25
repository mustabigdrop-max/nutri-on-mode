import { useState } from "react";
import { Fingerprint, Edit3, Vote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BehavioralProfile } from "@/hooks/useBehavioral";

interface Props {
  profile: BehavioralProfile | null;
  onSave: (data: Partial<BehavioralProfile>) => void;
  onVote: () => void;
}

export default function IdentityCard({ profile, onSave, onVote }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(profile?.declaracao_identidade || "");
  const [voted, setVoted] = useState(false);

  const handleVote = (answer: string) => {
    if (voted) return;
    setVoted(true);
    onVote();
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary" /> Declaração de Identidade
        </CardTitle>
        <p className="text-[10px] text-muted-foreground italic">"Cada ação é um voto para o tipo de pessoa que você está se tornando" — James Clear</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {editing ? (
          <>
            <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Eu sou uma pessoa que..." className="text-xs min-h-[120px]" />
            <Button onClick={() => { onSave({ declaracao_identidade: text }); setEditing(false); }} className="w-full" size="sm">Salvar</Button>
          </>
        ) : profile?.declaracao_identidade ? (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs whitespace-pre-line leading-relaxed">{profile.declaracao_identidade}</p>
            <Button variant="ghost" size="sm" onClick={() => { setText(profile.declaracao_identidade || ""); setEditing(true); }} className="mt-2 h-6 text-[10px] gap-1">
              <Edit3 className="w-3 h-3" /> Editar
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-[10px] text-muted-foreground mb-2">Crie sua declaração de identidade</p>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="text-[10px]">
              Criar Declaração
            </Button>
          </div>
        )}

        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-[10px] font-semibold mb-2">Hoje você agiu como a pessoa que quer se tornar?</p>
          <div className="flex gap-2">
            {[
              { emoji: "✅", label: "Sim" },
              { emoji: "🔄", label: "Parcialmente" },
              { emoji: "❌", label: "Não, mas sei o que fazer" },
            ].map(opt => (
              <button key={opt.label} onClick={() => handleVote(opt.label)}
                disabled={voted}
                className={`flex-1 py-2 rounded-lg text-[9px] border transition-all ${voted ? "opacity-50 cursor-default" : "hover:border-primary/50 hover:bg-primary/5"} border-border`}>
                <div>{opt.emoji}</div>
                <div className="mt-0.5">{opt.label}</div>
              </button>
            ))}
          </div>
          {voted && <p className="text-[9px] text-emerald-400 text-center mt-2">+1 voto para sua nova identidade! Total: {(profile?.votos_identidade || 0) + 1}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
