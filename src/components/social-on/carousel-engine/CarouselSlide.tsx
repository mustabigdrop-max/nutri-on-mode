import { Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CarouselSlide({ src, index, active, busy, onSelect, onEdit, onRegenerate }: { src:string; index:number; active:boolean; busy:boolean; onSelect:()=>void; onEdit:()=>void; onRegenerate:()=>void }) {
  return <article className={`border bg-[#020205] p-2 rounded-none ${active ? "border-[#00D4FF]" : "border-white/10"}`}>
    <button type="button" className="block w-full" onClick={onSelect}><img src={src} alt={`Slide ${index+1} do carrossel`} className="w-full" /></button>
    <div className="mt-2 flex items-center justify-between gap-2"><span className="font-tech text-[10px] text-[#00D4FF]">SLIDE {index+1}/5</span><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={onEdit}><Pencil />Editar</Button><Button size="sm" variant="ghost" disabled={busy} onClick={onRegenerate}><RefreshCw className={busy?"animate-spin":""}/>Refazer</Button></div></div>
  </article>;
}
