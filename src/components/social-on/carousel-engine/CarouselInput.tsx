import { FlaskConical, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CarouselNiche, CarouselTone } from "./carousel-engine.types";

export default function CarouselInput({ topic, niche, tone, loading, coverPhoto, onTopic, onNiche, onTone, onCoverPhoto, onGenerate }: {
  topic: string; niche: CarouselNiche; tone: CarouselTone; loading: boolean; coverPhoto?: string | null;
  onTopic: (v: string) => void; onNiche: (v: CarouselNiche) => void; onTone: (v: CarouselTone) => void;
  onCoverPhoto?: (v: string | null) => void; onGenerate: () => void;
}) {
  const lerFoto = (file?: File | null) => {
    if (!file || !onCoverPhoto) return;
    const reader = new FileReader();
    reader.onload = () => onCoverPhoto(String(reader.result || "") || null);
    reader.readAsDataURL(file);
  };
  return <section className="border border-accent/20 bg-card/60 p-5 space-y-4 rounded-none">
    <div><p className="font-tech text-[10px] tracking-[0.18em] text-accent">NOVO FORMATO · 1080 × 1350</p><h2 className="font-jarvis text-2xl uppercase text-foreground">Carousel Engine</h2><p className="text-sm text-muted-foreground">Digite o tema. A pesquisa e os cinco slides saem completos.</p></div>
    <label className="block space-y-2"><span className="font-tech text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Tema do carrossel</span><Input value={topic} onChange={(e) => onTopic(e.target.value)} placeholder='Ex: "Estresse oxidativo e exercício"' className="rounded-none" onKeyDown={(e) => e.key === "Enter" && onGenerate()} /></label>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-2"><span className="font-tech text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Nicho</span><Select value={niche} onValueChange={(v) => onNiche(v as CarouselNiche)}><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-none"><SelectItem value="nutricao">Nutrição</SelectItem><SelectItem value="treino">Treino</SelectItem><SelectItem value="hormonal">Hormonal</SelectItem><SelectItem value="mce">Comportamento · MCE</SelectItem><SelectItem value="livre">Tema livre</SelectItem></SelectContent></Select></label>
      <label className="space-y-2"><span className="font-tech text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Tom</span><Select value={tone} onValueChange={(v) => onTone(v as CarouselTone)}><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-none"><SelectItem value="cientifico">Científico</SelectItem><SelectItem value="didatico">Didático</SelectItem><SelectItem value="motivacional">Motivacional</SelectItem><SelectItem value="coach">Coach</SelectItem></SelectContent></Select></label>
    </div>
    <Button className="w-full rounded-none font-tech uppercase tracking-[0.12em]" onClick={onGenerate} disabled={loading || !topic.trim()}>{loading ? <Loader2 className="animate-spin" /> : <FlaskConical />} {loading ? "Pesquisando e construindo..." : "Gerar carrossel"}</Button>
  </section>;
}
