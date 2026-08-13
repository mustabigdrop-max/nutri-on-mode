import { useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Loader2, Search, Bookmark, Download, ExternalLink, Database, Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { VertexLogo48 } from "@/components/vertex/VertexLogoSmall";

interface DrNexusGeneratorProps {
  mode: string;
  title: string;
  description: string;
}

interface UploadedFile {
  name: string;
  type: string;
  base64: string;
  preview?: string;
  size: number;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

const COMPOUND_SUGGESTIONS: Record<string, string[]> = {
  ficha: ["Retatrutida", "BPC-157", "Oxandrolona", "Semaglutida", "RAD-140", "Ashwagandha KSM-66"],
  editorial: ["Retatrutida vs Tirzepatida", "BPC-157 na recuperação muscular", "SARMs em 2026", "Berberina vs Metformina"],
  briefing: ["Testosterona TRT", "Clenbuterol", "Ipamorelin + CJC-1295", "Creatina", "Melatonina"],
  offlabel: ["Tadalafila", "Metformina", "Rapamicina", "LDN", "Modafinil"],
  sinergias: ["BPC-157 + TB-500", "Ipamorelin + CJC-1295", "Retatrutida + Follistatin", "Berberina + Silimarina"],
  comparativo: ["Retatrutida vs Tirzepatida", "Oxandrolona vs Turinabol", "Ostarine vs LGD-4033", "BPC-157 vs TB-500"],
  exames: ["Painel hormonal masculino", "Painel hepático pós-ciclo", "Painel tireoidiano", "Painel lipídico"],
  dose: ["BPC-157 80kg", "Ipamorelin 75kg", "Semaglutida 90kg", "TB-500 70kg"],
  pct: ["PCT após Test E + Deca", "PCT após RAD-140", "PCT após Test + Trembolona", "PCT após Oxandrolona"],
  interacoes: ["Test E + Deca + AI", "BPC-157 + TB-500 + GHK-Cu", "Metformina + Berberina", "Semaglutida + Ipamorelin"],
  exportar: ["Retatrutida", "BPC-157", "Oxandrolona", "Semaglutida"],
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DrNexusGenerator = ({ mode, title, description }: DrNexusGeneratorProps) => {
  const { user } = useAuth();
  const [compound, setCompound] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExamesMode = mode === "exames";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Formato não suportado: ${file.name}. Use JPG, PNG, WEBP ou PDF.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Arquivo muito grande: ${file.name}. Máximo 20MB.`);
        continue;
      }

      const base64 = await fileToBase64(file);
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

      newFiles.push({
        name: file.name,
        type: file.type,
        base64,
        preview,
        size: file.size,
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:...;base64, prefix
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!);
      updated.splice(index, 1);
      return updated;
    });
  };

  const generate = async (compoundName?: string) => {
    const name = compoundName || compound;
    if (!name.trim() && uploadedFiles.length === 0) return;
    if (name) setCompound(name);
    setIsLoading(true);
    setResult(null);

    try {
      const body: any = { compound: name.trim(), mode };

      if (isExamesMode && uploadedFiles.length > 0) {
        body.attachments = uploadedFiles.map(f => ({
          name: f.name,
          type: f.type,
          base64: f.base64,
        }));
      }

      const { data, error } = await supabase.functions.invoke("dr-nexus", { body });
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
        <h2 className="text-lg font-['Rajdhani'] font-bold text-[#a78bfa]">{title}</h2>
        <p className="text-xs text-muted-foreground font-['JetBrains_Mono']">{description}</p>
      </div>

      {/* File Upload Area for Exames Mode */}
      {isExamesMode && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadedFiles.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#7c3aed]/30 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-[#7c3aed]/60 hover:bg-[#7c3aed]/5 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center group-hover:bg-[#7c3aed]/20 transition-colors">
                <Upload className="w-7 h-7 text-[#a78bfa]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#a78bfa] font-['Rajdhani']">
                  Envie foto ou PDF dos exames
                </p>
                <p className="text-[10px] text-muted-foreground font-['JetBrains_Mono'] mt-1">
                  JPG, PNG, WEBP ou PDF — até 20MB por arquivo
                </p>
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa] uppercase tracking-wider">
                  {uploadedFiles.length} arquivo{uploadedFiles.length > 1 ? "s" : ""} anexado{uploadedFiles.length > 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Adicionar mais
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-[#7c3aed]/20 bg-[#0a0514] overflow-hidden group"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 flex flex-col items-center justify-center gap-2 bg-[#7c3aed]/5">
                        <FileText className="w-8 h-8 text-[#a78bfa]" />
                        <span className="text-[9px] font-['JetBrains_Mono'] text-muted-foreground">PDF</span>
                      </div>
                    )}
                    <div className="px-2 py-1.5 border-t border-[#7c3aed]/10">
                      <p className="text-[9px] font-['JetBrains_Mono'] text-muted-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-[8px] font-['JetBrains_Mono'] text-muted-foreground/60">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={compound} onChange={e => setCompound(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder={isExamesMode
              ? "Contexto adicional (sexo, idade, uso atual...)"
              : mode === "pct" ? "Ex: PCT após Test E 500mg 12 semanas..." : "Nome do composto..."}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#7c3aed]/20 bg-[#0a0514] text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 font-['JetBrains_Mono']" />
        </div>
        <button onClick={() => generate()} disabled={(!compound.trim() && uploadedFiles.length === 0) || isLoading}
          className="px-6 py-3 rounded-xl bg-[#7c3aed] text-white text-sm font-medium disabled:opacity-50 transition-all hover:bg-[#6d28d9] font-['Rajdhani']">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isExamesMode && uploadedFiles.length > 0 ? "Analisar" : "Gerar"}
        </button>
      </div>

      {!result && !isLoading && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => generate(s)}
              className="px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[11px] text-[#a78bfa] hover:bg-[#7c3aed]/20 transition-colors font-['JetBrains_Mono']">
              {s}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl bg-[#0a0514] border border-[#7c3aed]/20 p-6 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground font-['Rajdhani']">
              {isExamesMode && uploadedFiles.length > 0 ? "Dr. VERTEX analisando exames..." : "Dr. VERTEX convergindo..."}
            </p>
            <p className="text-[10px] font-['JetBrains_Mono'] text-muted-foreground mt-1">
              {isExamesMode && uploadedFiles.length > 0
                ? `Processando ${uploadedFiles.length} arquivo${uploadedFiles.length > 1 ? "s" : ""} → OCR → Interpretação clínica`
                : "Varredura nutriON → Perplexity → Análise"}
            </p>
          </div>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {result.varreduraStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[10px] font-['JetBrains_Mono'] text-[#a78bfa]">
                <Database className="w-3 h-3" /> {result.varreduraStatus}
              </span>
            )}
            {result.perplexityUsed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[10px] font-['JetBrains_Mono'] text-[#06b6d4]">
                📎 {result.citations?.length || 0} fontes científicas
              </span>
            )}
            {isExamesMode && uploadedFiles.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[10px] font-['JetBrains_Mono'] text-[#22c55e]">
                <ImageIcon className="w-3 h-3" /> {uploadedFiles.length} arquivo{uploadedFiles.length > 1 ? "s" : ""} analisado{uploadedFiles.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="rounded-2xl bg-[#0a0514] border border-[#7c3aed]/20 px-5 py-5">
            <div className="prose prose-sm prose-invert max-w-none text-sm
              [&_p]:mb-3 [&_ul]:mb-3 [&_strong]:text-[#a78bfa] [&_h1]:text-[#c4b5fd] [&_h1]:text-lg [&_h1]:font-bold
              [&_h2]:text-[#a78bfa] [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-[#a78bfa] [&_h3]:text-sm [&_h3]:font-bold
              [&_code]:bg-[#7c3aed]/10 [&_code]:text-[#06b6d4] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
              [&_blockquote]:border-l-[#7c3aed] [&_blockquote]:bg-[#7c3aed]/5">
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>
          </div>

          {result.citations && result.citations.length > 0 && (
            <div className="rounded-xl bg-[#0a0514] border border-[#7c3aed]/15 p-4 space-y-2">
              <p className="text-[10px] font-['JetBrains_Mono'] text-muted-foreground uppercase">Fontes Científicas</p>
              {result.citations.slice(0, 8).map((c: string, i: number) => (
                <a key={i} href={c} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#a78bfa]/70 hover:text-[#a78bfa] truncate">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" /> {c}
                </a>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={saveToNotebook}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-sm text-[#a78bfa] hover:bg-[#7c3aed]/20 transition-colors font-['JetBrains_Mono']">
              <Bookmark className="w-4 h-4" /> Salvar no Caderno
            </button>
            <button onClick={() => {
              const blob = new Blob([JSON.stringify({ compound, mode, ...result }, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `vertex-${mode}-${compound}.json`; a.click();
            }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-muted-foreground hover:text-foreground transition-colors font-['JetBrains_Mono']">
              <Download className="w-4 h-4" /> Exportar JSON
            </button>
          </div>

          <p className="text-[9px] text-muted-foreground/60 italic font-['JetBrains_Mono']">
            Este conteúdo é para fins educacionais e informativos. Aplicações práticas requerem supervisão de profissional habilitado.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DrNexusGenerator;
