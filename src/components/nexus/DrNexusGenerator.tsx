import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Brain, Loader2, Search, Bookmark, Download, ExternalLink, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DrNexusGeneratorProps {
  mode: string;
  title: string;
  description: string;
}

const COMPOUND_SUGGESTIONS: Record<string, string[]> = {
  ficha: ["Retatrutida", "BPC-157", "Oxandrolona", "Semaglutida", "RAD-140", "Ashwagandha KSM-66"],
  editorial: ["Retatrutida vs Tirzepatida", "BPC-157 na recuperação muscular", "SARMs em 2026", "Berberina vs Metformina"],
  briefing: ["Testosterona TRT", "Clenbuterol", "Ipamorelin + CJC-1295", "Creatina", "Melatonina"],
  offlabel: ["Tadalafila", "Metformina", "Rapamicina", "LDN", "Modafinil"],
  sinergias: ["BPC-157 + TB-500", "Ipamorelin + CJC-1295", "Retatrutida + Follistatin", "Berberina + Silimarina"],
};

const DrNexusGenerator = ({ mode, title, description }: DrNexusGeneratorProps) => {
  const { user } = useAuth();
  const [compound, setCompound] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async (compoundName?: string) => {
    const name = compoundName || compound;
    if (!name.trim()) return;
    setCompound(name);
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("dr-nexus", {
        body: { compound: name.trim(), mode },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      console.error("Dr. VERTEX generator error:", e);
      toast.error("Erro ao gerar conteúdo.");
    }
    setIsLoading(false);
  };

  const saveToNotebook = async () => {
    if (!user || !result) return;
    await supabase.from("lab_saved_items").insert({
      user_id: user.id,
      tipo: mode === "ficha" ? "ficha_tecnica" : mode,
      titulo: `[${mode.toUpperCase()}] ${compound}`,
      conteudo: { compound, mode, answer: result.answer, citations: result.citations, varreduraStatus: result.varreduraStatus },
      tags: ["dr-vertex", mode, compound.toLowerCase()],
    });
    toast.success("Salvo no Caderno Científico!");
  };

  const suggestions = COMPOUND_SUGGESTIONS[mode] || COMPOUND_SUGGESTIONS.ficha;

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={compound} onChange={e => setCompound(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="Nome do composto..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50" />
        </div>
        <button onClick={() => generate()} disabled={!compound.trim() || isLoading}
          className="px-6 py-3 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-50 transition-all hover:bg-red-600">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gerar"}
        </button>
      </div>

      {!result && !isLoading && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => generate(s)}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 hover:bg-red-500/20 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl bg-card border border-red-500/20 p-6 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-red-400 animate-spin mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Dr. VERTEX convergindo...</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">Varredura nutriON → Perplexity → Análise IA</p>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {result.varreduraStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-400">
                <Database className="w-3 h-3" /> {result.varreduraStatus}
              </span>
            )}
            {result.perplexityUsed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400">
                📎 {result.citations?.length || 0} fontes científicas
              </span>
            )}
          </div>

          <div className="rounded-2xl bg-card border border-red-500/20 px-5 py-5">
            <div className="prose prose-sm prose-invert max-w-none text-sm
              [&_p]:mb-3 [&_ul]:mb-3 [&_strong]:text-red-400 [&_h1]:text-red-400 [&_h1]:text-lg [&_h1]:font-bold
              [&_h2]:text-red-400 [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-red-400 [&_h3]:text-sm [&_h3]:font-bold
              [&_code]:bg-secondary [&_code]:text-accent [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
              [&_blockquote]:border-l-red-500 [&_blockquote]:bg-red-500/5">
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>
          </div>

          {result.citations && result.citations.length > 0 && (
            <div className="rounded-xl bg-card border border-border p-4 space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase">Fontes Científicas</p>
              {result.citations.slice(0, 8).map((c: string, i: number) => (
                <a key={i} href={c} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-red-400/70 hover:text-red-400 truncate">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" /> {c}
                </a>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={saveToNotebook}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition-colors">
              <Bookmark className="w-4 h-4" /> Salvar no Caderno
            </button>
            <button onClick={() => {
              const blob = new Blob([JSON.stringify({ compound, mode, ...result }, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `vertex-${mode}-${compound}.json`; a.click();
            }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-4 h-4" /> Exportar JSON
            </button>
          </div>

          <p className="text-[9px] text-muted-foreground/60 italic">
            Este conteúdo é para fins educacionais e informativos. Aplicações práticas requerem supervisão de profissional habilitado.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DrNexusGenerator;
