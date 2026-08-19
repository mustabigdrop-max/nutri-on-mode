import { useRef, useState } from "react";
import { ChallengeHeader } from "@/components/challenge/ChallengeLayout";
import { useChallenge } from "@/hooks/useChallenge";
import { useProgressPhotos } from "@/hooks/useProgressPhotos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ChallengeEvolutionPage() {
  const { participant, reload } = useChallenge();
  const { photos, loading, uploading, uploadPhoto } = useProgressPhotos();
  const inputRef = useRef<HTMLInputElement>(null);
  const [weight, setWeight] = useState("");

  if (!participant) return null;

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const kg = weight ? Number(weight) : undefined;
      await uploadPhoto(file, {
        weight_kg: kg,
        streak_days: participant.streak,
        kcal_target: participant.target_kcal,
        notes: "Desafio 90 Dias",
      });
      if (kg) {
        await supabase
          .from("challenge_participants")
          .update({
            weight_current: kg,
            weight_start: participant.weight_start ?? kg,
          })
          .eq("id", participant.id);
        await reload();
      }
      toast.success("Foto registrada!");
      setWeight("");
    } catch {
      toast.error("Não foi possível enviar a foto.");
    }
  };

  const start = participant.weight_start;
  const current = participant.weight_current;
  const delta = start && current ? current - start : null;

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeHeader title="📸 Evolução" subtitle="Foto e peso a cada 15 dias" />

      <div className="px-4 space-y-4">
        <Card>
          <CardContent className="p-4 grid grid-cols-3 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">Inicial</p>
              <p className="font-black">{start ? `${start} kg` : "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Atual</p>
              <p className="font-black">{current ? `${current} kg` : "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Δ</p>
              <p className="font-black text-primary">
                {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Peso de hoje (kg)"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button className="w-full gap-2" disabled={uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Registrar foto
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {photos.map((p) => (
              <div key={p.id} className="rounded-xl overflow-hidden border border-border">
                <img src={p.signedUrl} alt={`Progresso em ${p.photo_date}`} className="w-full h-40 object-cover" loading="lazy" />
                <p className="px-2 py-1 text-[11px] text-muted-foreground">
                  {new Date(p.photo_date).toLocaleDateString("pt-BR")} {p.weight_kg ? `· ${p.weight_kg} kg` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
