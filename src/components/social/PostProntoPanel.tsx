import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Loader2, Rocket, Upload, Zap } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, ACCENT2, Section, callSocialAI, copyText } from "./socialUi";
import { PHOTO_SUBJECTS, QUICK_GOALS } from "@/data/socialOnSurreal";
import {
  cropToRatio, downloadDataUrl, fileToDataUrl, gradeDarkPremium, gradeFitness,
  renderSlide, renderStoryFrame,
} from "@/lib/socialImageKit";

type Pkg = {
  caption?: string;
  hook?: string;
  hashtags?: string[];
  best_time?: string;
  reach_forecast?: string;
  self_comment?: string;
  carousel?: { title: string; body: string }[];
  stories?: { title: string; body: string }[];
};

const PostProntoPanel = ({ ctx, handle }: { ctx: Record<string, any>; handle?: string | null }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>("shape");
  const [goal, setGoal] = useState<string>("viralizar");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [carousel, setCarousel] = useState<string[]>([]);
  const [stories, setStories] = useState<string[]>([]);
  const [pkg, setPkg] = useState<Pkg | null>(null);

  const brand = `@${String(handle || "diogo.mell0").replace("@", "")} · nutrion.app.br`;

  const pick = async (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Envie uma imagem (vídeo: use o roteiro gerado).");
    setSrc(await fileToDataUrl(f));
    setPhotos({});
    setCarousel([]);
    setStories([]);
    setPkg(null);
  };

  const buildVisuals = async (image: string, data: Pkg) => {
    setStep("Editando a foto…");
    const fitness = await gradeFitness(image);
    const dark = await gradeDarkPremium(image);
    const c45 = await cropToRatio(fitness, 4, 5);
    const c916 = await cropToRatio(fitness, 9, 16);
    setPhotos({ original: image, fitness, dark, crop45: c45, crop916: c916 });

    setStep("Montando carrossel…");
    const slides: string[] = [];
    slides.push(await renderSlide({
      backgroundImage: dark,
      overlay: "rgba(2,2,5,0.68)",
      eyebrow: "arrasta →",
      title: data.hook || data.caption?.split("\n")[0] || "Sistema > motivação",
      footer: brand,
    }));
    for (const [i, p] of (data.carousel || []).slice(0, 3).entries()) {
      slides.push(await renderSlide({
        eyebrow: `0${i + 2}`,
        title: p.title,
        body: p.body,
        footer: brand,
      }));
    }
    slides.push(await renderSlide({
      title: "Salva esse post.",
      body: "Manda pra quem precisa ler isso hoje.",
      footer: brand,
      accent: "#00FF88",
    }));
    setCarousel(slides);

    setStep("Montando Stories…");
    const st: string[] = [];
    st.push(await renderStoryFrame({
      backgroundImage: c916,
      overlay: "rgba(2,2,5,0.55)",
      title: data.stories?.[0]?.title || data.hook || "",
      body: data.stories?.[0]?.body || "",
      footer: brand,
    }));
    for (const s of (data.stories || []).slice(1, 3)) {
      st.push(await renderStoryFrame({ title: s.title, body: s.body, footer: brand, accent: ACCENT2 }));
    }
    setStories(st);
  };

  const generate = async (lightning = false) => {
    if (!src) return toast.error("Envie uma foto primeiro");
    setBusy(true);
    try {
      setStep("Gerando copy…");
      const data: Pkg = await callSocialAI({
        mode: "post_package",
        subject: PHOTO_SUBJECTS.find((s) => s.id === subject)?.label,
        quickGoal: QUICK_GOALS.find((g) => g.id === goal)?.label,
        lightning,
        ...ctx,
      });
      setPkg(data);
      await buildVisuals(src, data);
      toast.success(lightning ? "Modo Relâmpago pronto" : "Pacote completo pronto");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const dl = (url: string, name: string) => downloadDataUrl(url, name);
  const dlAll = (list: string[], prefix: string) => list.forEach((u, i) => dl(u, `${prefix}-${i + 1}.png`));

  return (
    <div className="space-y-4">
      <Section title="📸 Passo 1 — sua foto">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
          className="rounded-xl border border-dashed p-6 text-center space-y-3"
          style={{ borderColor: `${ACCENT}55` }}
        >
          {src ? (
            <img src={src} alt="Foto selecionada para o post" className="mx-auto max-h-56 rounded-lg" />
          ) : (
            <p className="text-xs text-muted-foreground">Arraste aqui ou selecione a foto crua</p>
          )}
          <Button size="sm" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
            <Upload className="w-3 h-3" /> {src ? "Trocar foto" : "Selecionar foto"}
          </Button>
        </div>
      </Section>

      <Section title="🎯 Passo 2 — o que tem na foto?">
        <div className="flex flex-wrap gap-2">
          {PHOTO_SUBJECTS.map((s) => (
            <button key={s.id} type="button" onClick={() => setSubject(s.id)}
              className="px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{ borderColor: subject === s.id ? ACCENT : "rgba(255,255,255,0.12)", background: subject === s.id ? `${ACCENT}22` : "transparent" }}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="⚡ Passo 3 — objetivo">
        <div className="flex flex-wrap gap-2">
          {QUICK_GOALS.map((g) => (
            <button key={g.id} type="button" onClick={() => setGoal(g.id)}
              className="px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{ borderColor: goal === g.id ? ACCENT2 : "rgba(255,255,255,0.12)", background: goal === g.id ? `${ACCENT2}22` : "transparent" }}>
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button disabled={busy} onClick={() => generate(false)} className="gap-2" style={{ background: ACCENT }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Gerar pacote completo
          </Button>
          <Button disabled={busy} variant="outline" className="gap-2" onClick={() => generate(true)}>
            <Zap className="w-4 h-4" /> Modo relâmpago
          </Button>
        </div>
        {busy && <p className="text-xs font-mono text-muted-foreground">{step}</p>}
      </Section>

      {photos.fitness && (
        <Section title="1. Foto editada" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => {
            dl(photos.fitness, "fitness-grade.jpg"); dl(photos.dark, "dark-premium.jpg");
            dl(photos.crop45, "feed-4x5.jpg"); dl(photos.crop916, "stories-9x16.jpg");
          }}><Download className="w-3 h-3" /> Baixar todas</Button>
        }>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { k: "original", l: "Original" }, { k: "fitness", l: "Fitness grade" },
              { k: "dark", l: "Dark premium" }, { k: "crop916", l: "9:16 Stories" },
            ].map((v) => (
              <div key={v.k} className="space-y-1">
                <img src={photos[v.k]} alt={`Versão ${v.l} da foto`} className="rounded-lg w-full object-cover" />
                <p className="text-[10px] font-mono text-muted-foreground">{v.l}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Crops 4:5 (feed) e 9:16 (Stories) gerados.</p>
        </Section>
      )}

      {pkg?.caption && (
        <Section title="2. Legenda pronta" right={
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(pkg.caption!)}><Copy className="w-3 h-3" /> Copiar</Button>
            <Button size="sm" variant="ghost" className="h-7" disabled={busy} onClick={() => generate(false)}>🔄 Outra</Button>
          </div>
        }>
          <p className="text-sm whitespace-pre-wrap">{pkg.caption}</p>
        </Section>
      )}

      {carousel.length > 0 && (
        <Section title={`3. Carrossel (${carousel.length} slides)`} right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => dlAll(carousel, "carrossel")}><Download className="w-3 h-3" /> Baixar PNGs</Button>
        }>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {carousel.map((s, i) => <img key={i} src={s} alt={`Slide ${i + 1} do carrossel`} className="h-44 rounded-lg" />)}
          </div>
        </Section>
      )}

      {stories.length > 0 && (
        <Section title={`4. Stories (${stories.length} frames)`} right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => dlAll(stories, "story")}><Download className="w-3 h-3" /> Baixar PNGs</Button>
        }>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stories.map((s, i) => <img key={i} src={s} alt={`Story ${i + 1}`} className="h-52 rounded-lg" />)}
          </div>
        </Section>
      )}

      {pkg?.hashtags?.length ? (
        <Section title="5. Hashtags + horário" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(pkg.hashtags!.join(" "))}><Copy className="w-3 h-3" /> Copiar</Button>
        }>
          <p className="text-sm" style={{ color: ACCENT2 }}>{pkg.hashtags.join(" ")}</p>
          <p className="text-xs font-mono text-muted-foreground">
            ⏰ Melhor horário: {pkg.best_time || "12h30"} · 📊 Alcance previsto: {pkg.reach_forecast || "alto"}
          </p>
        </Section>
      ) : null}

      {pkg?.self_comment && (
        <Section title="6. Self-comment" right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => copyText(pkg.self_comment!)}><Copy className="w-3 h-3" /> Copiar</Button>
        }>
          <p className="text-sm whitespace-pre-wrap">{pkg.self_comment}</p>
        </Section>
      )}

      {pkg && (
        <Section title="Resumo do pacote">
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✅ 3 versões da foto + 2 crops (4:5 e 9:16)</li>
            <li>✅ 1 legenda completa com hook + ciência + CTA</li>
            <li>✅ {carousel.length} slides de carrossel · {stories.length} frames de Stories</li>
            <li>✅ {pkg.hashtags?.length || 0} hashtags · horário ideal · self-comment</li>
          </ul>
        </Section>
      )}
    </div>
  );
};

export default PostProntoPanel;
