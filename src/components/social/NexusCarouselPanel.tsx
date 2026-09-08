import { useMemo, useState } from "react";
import { Copy, Download, FlaskConical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { downloadMany } from "@/lib/socialImageKit";
import { peptides } from "@/data/peptideVaultData";
import { microbiotaItems } from "@/data/microbiotaVaultData";
import {
  NEXUS_TPL,
  NEXUS_CTA_SLIDE,
  nexusSlideLabels,
  renderNexusCarousel,
  type NexusCarouselContent,
  type NexusStatus,
} from "@/lib/nexusCarouselTemplate";

const norm = (v: string) => v.trim().toLowerCase();

/** Busca a ficha completa do composto nos dois vaults. */
const findCompound = (tema: string) => {
  const q = norm(tema);
  if (!q) return null;
  const pep = peptides.find((p) => norm(p.name) === q) || peptides.find((p) => norm(p.name).includes(q));
  if (pep) return { origem: "PeptideVault" as const, data: pep, classe: pep.classe, status: pep.status };
  const mic =
    microbiotaItems.find((m) => norm(m.nome) === q) || microbiotaItems.find((m) => norm(m.nome).includes(q));
  if (mic) return { origem: "MicrobiotaVault" as const, data: mic, classe: mic.classe, status: mic.status };
  return null;
};

const statusFrom = (raw?: string): NexusStatus => {
  const v = (raw || "").toUpperCase();
  if (/APROVAD|VALIDAD|FDA/.test(v)) return "APROVADO";
  if (/EXPERIMENTAL|VANGUARDA|OFF-?LABEL/.test(v)) return "EXPERIMENTAL";
  return "PESQUISA";
};

const fallback = (tema: string, classe?: string, status?: string): NexusCarouselContent => ({
  composto: tema,
  slide1_gancho: `O que a ciência realmente sabe sobre ${tema}.`,
  slide1_classe: classe || "Composto",
  slide1_status: statusFrom(status),
  slide2_ficha: { composto: tema, classe: classe || "Composto", nivel_evidencia: "PRELIMINAR" },
  slide3_mecanismo: {
    passos: ["Mecanismo de ação em revisão — gere novamente para o detalhamento completo."],
    traducao_leiga: "Em resumo: gere novamente para a tradução em linguagem simples.",
  },
  slide4_beneficios: [{ numero: "—", desc: "Gere novamente para trazer os achados dos estudos." }],
  slide5_riscos: [{ risco: "Efeitos adversos precisam ser avaliados individualmente." }],
  slide5_nao_indicado: "Gestantes, lactantes, menores de 18 anos e sem avaliação médica.",
  slide7_faz_sentido: ["Acompanhamento profissional ativo."],
  slide7_nao_faz_sentido: ["Uso por conta própria, sem avaliação."],
  slide8_perguntas_medico: [
    "Esse composto faz sentido pro meu caso específico?",
    "Quais exames devo fazer antes de iniciar?",
    "Qual o plano de saída quando eu parar?",
  ],
  slide9_resumo: { oque: "", beneficio: "", risco: "", evidencia: "PRELIMINAR", veredicto: "" },
});


/** Gerador de carrossel NEXUS-BIO — científico, 9 ou 10 slides, 1080x1350. */
export default function NexusCarouselPanel({
  handle,
  initialTema,
}: {
  handle?: string | null;
  initialTema?: string;
}) {
  const [tema, setTema] = useState(initialTema || "");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [legenda, setLegenda] = useState("");
  const [active, setActive] = useState(0);

  const match = useMemo(() => findCompound(tema), [tema]);

  /** Busca dados extras no Lab (nexus_compounds e protocolos) — complementam a ficha. */
  const fetchLabData = async (nome: string) => {
    const [comp, prot] = await Promise.all([
      supabase
        .from("nexus_compounds")
        .select(
          "nome, classe, familia_farmacologica, status_regulatorio, mecanismo_acao, nivel_evidencia, estudos_chave, lacunas_evidencia, aplicacoes_clinicas, uso_performance, protocolos, sinergias, perfil_seguranca, briefing_rapido",
        )
        .ilike("nome", `%${nome}%`)
        .limit(1)
        .maybeSingle(),
      supabase.from("lab_protocols").select("titulo, conteudo, fontes").ilike("titulo", `%${nome}%`).limit(2),
    ]);
    const lab = { composto: comp.data || null, protocolos: prot.data || [] };
    return comp.data || (prot.data && prot.data.length) ? lab : null;
  };

  const generate = async () => {
    if (!tema.trim()) return toast.error("Escreva o nome do composto.");
    setLoading(true);
    try {
      const found = findCompound(tema);
      const labData = await fetchLabData(tema.trim()).catch(() => null);
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: "nexus_carousel",
          topic: tema.trim(),
          origem: found?.origem || "PeptideVault",
          compoundData: found?.data || null,
          labData,
          handle,
        },
      });

      if (error) throw error;
      const result = (data?.result || {}) as Partial<NexusCarouselContent>;
      const content: NexusCarouselContent = {
        ...fallback(tema.trim(), found?.classe, found?.status),
        ...result,
        composto: tema.trim(),
        origem: found?.origem || "PeptideVault",
        slide1_status: statusFrom(result.slide1_status || found?.status),
        handle: handle || "diogo.mell0",

      };
      setImages(renderNexusCarousel(content));
      setLabels(nexusSlideLabels(content));
      setLegenda(cleanCaption(content.legenda));
      setActive(0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4" style={{ borderColor: `${NEXUS_TPL.accent}33`, background: `${NEXUS_TPL.accent}0A` }}>
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4" style={{ color: NEXUS_TPL.accent }} />
          <p className="font-semibold tracking-wide">CARROSSEL NEXUS-BIO · CIENTÍFICO</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Template exclusivo do PeptideVault e do MicrobiotaVault: capa, o que é, mecanismo, benefícios com estudos,
          riscos, comparativo, evidência, na prática, resumo e CTA. Sem pilares M / C / E — aqui é só ciência.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder='Composto (ex: "Semaglutida", "Akkermansia muciniphila")'
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
          {loading ? "Gerando…" : "Gerar carrossel"}
        </Button>
      </div>

      {match && (
        <p className="text-xs text-muted-foreground">
          Ficha encontrada no <strong>{match.origem}</strong> — {match.classe} · {match.status}. Os dados reais da ficha
          vão para a geração.
        </p>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="mx-auto max-w-sm overflow-hidden rounded-xl border" style={{ borderColor: `${NEXUS_TPL.accent}33` }}>
            <img src={images[active]} alt={`Slide ${active + 1} — ${labels[active]}`} className="w-full" />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className="rounded-md border px-2 py-1 text-[10px] font-mono"
                style={{
                  borderColor: i === active ? NEXUS_TPL.accent : "rgba(255,255,255,0.12)",
                  color: i === active ? NEXUS_TPL.accent : undefined,
                }}
              >
                {i + 1} · {labels[i]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                downloadMany(
                  images.map((url, i) => ({
                    url,
                    filename: `nexus-bio-slide-${i + 1}-${(labels[i] || "").toLowerCase().replace(/\s+/g, "-")}.png`,
                  })),
                )
              }
            >
              <Download className="h-4 w-4" /> Baixar os {images.length} slides
            </Button>
            {legenda && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(legenda);
                  toast.success("Legenda copiada.");
                }}
              >
                <Copy className="h-4 w-4" /> Copiar legenda
              </Button>
            )}
          </div>
          {legenda && (
            <div className="rounded-xl border p-4 text-sm whitespace-pre-wrap" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              {legenda}
            </div>
          )}
          <p className="text-center text-[11px] text-muted-foreground">{NEXUS_CTA_SLIDE.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
