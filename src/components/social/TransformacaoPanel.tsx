import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCENT, Section } from "./socialUi";
import SaveShareButtons from "./SaveShareButtons";
import { renderModuleCarousel, type ModuleSlide } from "@/lib/moduleCarouselTemplate";

type Lead = {
  id: string;
  name: string;
  whatsapp: string | null;
  created_at: string;
  score_mentalidade: number | null;
  score_comportamento: number | null;
  score_execucao: number | null;
  score_total: number | null;
};

type Pessoa = { chave: string; nome: string; inicial: Lead; atual: Lead; semanas: number };

const semanasEntre = (a: string, b: string) =>
  Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / (7 * 864e5)));

export default function TransformacaoPanel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [sel, setSel] = useState<string>("");
  const [depoimento, setDepoimento] = useState("");
  const [slides, setSlides] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("mce_leads")
        .select("id, name, whatsapp, created_at, score_mentalidade, score_comportamento, score_execucao, score_total")
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) toast.error(error.message);
      setLeads((data || []) as Lead[]);
      setCarregando(false);
    })();
  }, []);

  const pessoas = useMemo<Pessoa[]>(() => {
    const mapa = new Map<string, Lead[]>();
    for (const l of leads) {
      const chave = (l.whatsapp || l.name || "").trim().toLowerCase();
      if (!chave) continue;
      mapa.set(chave, [...(mapa.get(chave) || []), l]);
    }
    return [...mapa.entries()]
      .filter(([, lista]) => lista.length >= 2)
      .map(([chave, lista]) => {
        const inicial = lista[0];
        const atual = lista[lista.length - 1];
        return { chave, nome: atual.name, inicial, atual, semanas: semanasEntre(inicial.created_at, atual.created_at) };
      });
  }, [leads]);

  const pessoa = pessoas.find((p) => p.chave === sel);

  const gerar = () => {
    if (!pessoa) return;
    const i = pessoa.inicial;
    const a = pessoa.atual;
    const d = (x: number | null, y: number | null) => (x == null || y == null ? "—" : `${y - x > 0 ? "+" : ""}${y - x}%`);
    const slidesData: ModuleSlide[] = [
      {
        tipo: "capa",
        tag: "TRANSFORMAÇÃO",
        titulo: `De ${i.score_total ?? "—"}% pra ${a.score_total ?? "—"}% em ${pessoa.semanas} semanas.`,
        corpo: `${pessoa.nome} — Diagnóstico MCE inicial vs. atual.`,
      },
      {
        tipo: "dados",
        tag: "ONDE ELA ESTAVA",
        titulo: "Diagnóstico inicial",
        dados: [
          { label: "Mentalidade", valor: `${i.score_mentalidade ?? "—"}%` },
          { label: "Comportamento", valor: `${i.score_comportamento ?? "—"}%` },
          { label: "Execução", valor: `${i.score_execucao ?? "—"}%` },
          { label: "Total", valor: `${i.score_total ?? "—"}%` },
        ],
      },
      {
        tipo: "conteudo",
        tag: "O QUE MUDAMOS",
        titulo: "Sistema, não força de vontade.",
        corpo: "Método MCE aplicado: Mentalidade para sustentar a decisão, Comportamento para criar o ambiente, Execução para tornar o plano inegociável.",
      },
      {
        tipo: "dados",
        tag: "EVOLUÇÃO",
        titulo: `${pessoa.semanas} semanas depois`,
        dados: [
          { label: "Mentalidade", valor: d(i.score_mentalidade, a.score_mentalidade) },
          { label: "Comportamento", valor: d(i.score_comportamento, a.score_comportamento) },
          { label: "Execução", valor: d(i.score_execucao, a.score_execucao) },
          { label: "Total", valor: d(i.score_total, a.score_total) },
        ],
      },
      ...(depoimento.trim()
        ? [{ tipo: "conteudo", tag: "NA VOZ DELA", titulo: "Depoimento", corpo: depoimento.trim() } as ModuleSlide]
        : []),
      {
        tipo: "dados",
        tag: "OS NÚMEROS NÃO MENTEM",
        titulo: "Diagnóstico atual",
        dados: [
          { label: "Mentalidade", valor: `${a.score_mentalidade ?? "—"}%` },
          { label: "Comportamento", valor: `${a.score_comportamento ?? "—"}%` },
          { label: "Execução", valor: `${a.score_execucao ?? "—"}%` },
          { label: "Total", valor: `${a.score_total ?? "—"}%` },
        ],
      },
      {
        tipo: "cta",
        tag: "SUA VEZ",
        titulo: "Quer ser o próximo?",
        corpo: "Diagnóstico MCE gratuito — link na bio.",
        destaque: "14 perguntas · 4 minutos · resultado imediato",
      },
    ];
    setSlides(renderModuleCarousel(slidesData, "diogo.mell0", "Transformação"));
    toast.success("Carrossel de prova social gerado");
  };

  return (
    <div className="space-y-4">
      <Section title="⭐ Prova social — transformação com dados reais">
        {carregando ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando diagnósticos…</p>
        ) : pessoas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há ninguém com dois diagnósticos MCE registrados. O carrossel só é gerado com o diagnóstico
            inicial e o mais recente da mesma pessoa — nenhum número é inventado.
          </p>
        ) : (
          <>
            <select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={sel} onChange={(e) => { setSel(e.target.value); setSlides([]); }}>
              <option value="">Selecione a pessoa</option>
              {pessoas.map((p) => <option key={p.chave} value={p.chave}>{p.nome} · {p.semanas} semanas</option>)}
            </select>
            {pessoa && (
              <div className="text-sm space-y-1">
                <p>Inicial: M {pessoa.inicial.score_mentalidade ?? "—"}% · C {pessoa.inicial.score_comportamento ?? "—"}% · E {pessoa.inicial.score_execucao ?? "—"}% · Total {pessoa.inicial.score_total ?? "—"}%</p>
                <p>Atual: M {pessoa.atual.score_mentalidade ?? "—"}% · C {pessoa.atual.score_comportamento ?? "—"}% · E {pessoa.atual.score_execucao ?? "—"}% · Total {pessoa.atual.score_total ?? "—"}%</p>
              </div>
            )}
            <Textarea rows={4} placeholder="Depoimento da pessoa (opcional)" value={depoimento} onChange={(e) => setDepoimento(e.target.value)} />
            <Button disabled={!pessoa} onClick={gerar} className="gap-2" style={{ background: ACCENT }}>✦ Gerar conteúdo de prova social</Button>
          </>
        )}
      </Section>

      {slides.length > 0 && (
        <Section title="Carrossel gerado">
          <div className="grid grid-cols-3 gap-2">
            {slides.map((s, i) => <img key={i} src={s} alt={`Slide ${i + 1} da transformação`} className="rounded-md border" />)}
          </div>
          <SaveShareButtons items={slides.map((url, i) => ({ url, filename: `nutrion-transformacao-${i + 1}.png` }))} />
        </Section>
      )}
    </div>
  );
}
