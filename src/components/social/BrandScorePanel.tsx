import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Rocket } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, ACCENT2, Section } from "./socialUi";
import { BRAND_PILLARS, PILLAR_ACTIONS, brandLevel } from "@/data/socialOnSurreal";
import { isMobileDevice, saveImage, renderBrandScoreStory } from "@/lib/socialImageKit";

const DEFAULTS: Record<string, number> = {
  consistencia: 85, mix: 68, copy: 75, visual: 60, conversao: 55, engajamento: 80, crescimento: 78,
};

const BrandScorePanel = ({ handle, onGenerate }: { handle?: string | null; onGenerate?: (prompt: string) => void }) => {
  const [values, setValues] = useState<Record<string, number>>(DEFAULTS);
  const [followers, setFollowers] = useState("247");
  const [streak, setStreak] = useState("12");

  const score = useMemo(
    () => Math.round(BRAND_PILLARS.reduce((a, p) => a + (values[p.key] ?? 0), 0) / BRAND_PILLARS.length),
    [values],
  );

  const weakest = useMemo(
    () => [...BRAND_PILLARS].sort((a, b) => (values[a.key] ?? 0) - (values[b.key] ?? 0)).slice(0, 2),
    [values],
  );

  const shareStory = async () => {
    const url = await renderBrandScoreStory({
      score,
      pillars: BRAND_PILLARS.map((p) => ({ label: `${p.emoji} ${p.label}`, value: values[p.key] ?? 0 })),
      followers: followers ? `+${followers} seguidores esta semana` : undefined,
      streak: streak ? `🔥 Streak: ${streak} semanas postando` : undefined,
      handle: `@${String(handle || "diogo.mell0").replace("@", "")}`,
    });
    (await saveImage(url, "brand-score.png"))
      ? toast.success(isMobileDevice() ? 'Toque em "Salvar imagem" para ir pra galeria' : "brand-score.png baixado!")
      : toast.error("Não consegui salvar a imagem");
  };

  return (
    <div className="space-y-4">
      <Section title="🏆 Seu Brand Score" right={
        <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={shareStory}><Download className="w-3 h-3" /> Story</Button>
      }>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black" style={{ color: ACCENT2 }}>{score}</span>
          <span className="text-sm text-muted-foreground">/100 · {brandLevel(score)}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-full" style={{ width: `${score}%`, background: ACCENT }} />
        </div>
      </Section>

      <Section title="Detalhamento (ajuste com seus números da semana)">
        <div className="space-y-3">
          {BRAND_PILLARS.map((p) => (
            <div key={p.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{p.emoji} {p.label}</span>
                <span className="font-mono" style={{ color: (values[p.key] ?? 0) >= 70 ? ACCENT2 : "#FF6B6B" }}>
                  {values[p.key] ?? 0}/100
                </span>
              </div>
              <input
                type="range" min={0} max={100} value={values[p.key] ?? 0}
                onChange={(e) => setValues({ ...values, [p.key]: Number(e.target.value) })}
                className="w-full accent-purple-500"
                aria-label={p.label}
              />
              <p className="text-[10px] text-muted-foreground">{p.hint}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Dados do story">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Novos seguidores</p>
            <Input value={followers} inputMode="numeric" onChange={(e) => setFollowers(e.target.value)} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Semanas de streak</p>
            <Input value={streak} inputMode="numeric" onChange={(e) => setStreak(e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Ação pra subir o score">
        {weakest.map((p, i) => (
          <div key={p.key} className="space-y-1">
            <p className="text-xs font-semibold">
              {i === 0 ? "Ponto mais fraco" : "Segundo mais fraco"}: {p.label} ({values[p.key]})
            </p>
            <p className="text-sm">✅ {PILLAR_ACTIONS[p.key]?.action}</p>
            {onGenerate && (
              <Button size="sm" className="gap-1" style={{ background: ACCENT }}
                onClick={() => onGenerate(PILLAR_ACTIONS[p.key]?.prompt || p.label)}>
                <Rocket className="w-3 h-3" /> Gerar esse conteúdo agora
              </Button>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
};

export default BrandScorePanel;
