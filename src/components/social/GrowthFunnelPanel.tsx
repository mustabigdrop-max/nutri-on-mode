import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, RefreshCw, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Section, ACCENT } from "./socialUi";
import SaveShareButtons from "./SaveShareButtons";
import { renderModuleCarousel } from "@/lib/moduleCarouselTemplate";
import {
  APRESENTACAO_SLIDES,
  TIPOS_POST,
  atualizarMetricas,
  carregarFunil,
  insightRanking,
  listarPosts,
  ranking,
  registrarPost,
  removerPost,
  sugestaoFixados,
  type Funil,
  type PostRastreado,
} from "@/lib/socialGrowth";

const pct = (v: number | null) => (v == null ? "—" : `${v.toFixed(1)}%`);
const medalha = (i: number) => ["🥇", "🥈", "🥉"][i] || `${i + 1}.`;

const NUM_FIELDS: { key: keyof PostRastreado; label: string }[] = [
  { key: "curtidas", label: "Curtidas" },
  { key: "comentarios", label: "Comentários" },
  { key: "salvamentos", label: "Salvamentos" },
  { key: "compartilhamentos", label: "Compart." },
  { key: "alcance", label: "Alcance" },
  { key: "leads_gerados", label: "Leads" },
];

export default function GrowthFunnelPanel({ seguidores }: { seguidores?: number | null }) {
  const [funil, setFunil] = useState<Funil | null>(null);
  const [posts, setPosts] = useState<PostRastreado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novo, setNovo] = useState({ tipo: TIPOS_POST[0] as string, tema: "", modulo_origem: "", formato: "carrossel" });
  const [rascunho, setRascunho] = useState<Record<string, Record<string, string>>>({});
  const [slides, setSlides] = useState<string[]>([]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [f, p] = await Promise.all([carregarFunil(seguidores ?? null), listarPosts()]);
      setFunil(f);
      setPosts(p);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar o funil");
    } finally {
      setCarregando(false);
    }
  }, [seguidores]);

  useEffect(() => { void carregar(); }, [carregar]);

  const salvarNovo = async () => {
    if (!novo.tema.trim()) return toast.error("Escreva o tema do post");
    try {
      await registrarPost({ ...novo, leads_gerados: 0 });
      toast.success("Post registrado");
      setNovo({ ...novo, tema: "" });
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao registrar");
    }
  };

  const salvarMetricas = async (p: PostRastreado) => {
    const r = rascunho[p.id] || {};
    const num = (k: string, atual: number | null) => (r[k] === undefined || r[k] === "" ? atual : Number(r[k]));
    try {
      await atualizarMetricas(p.id, {
        curtidas: num("curtidas", p.curtidas),
        comentarios: num("comentarios", p.comentarios),
        salvamentos: num("salvamentos", p.salvamentos),
        compartilhamentos: num("compartilhamentos", p.compartilhamentos),
        alcance: num("alcance", p.alcance),
        leads_gerados: num("leads_gerados", p.leads_gerados) || 0,
      });
      toast.success("Métricas salvas");
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar");
    }
  };

  const rk = ranking(posts);
  const insight = insightRanking(rk);
  const fixados = sugestaoFixados(rk, posts);

  const gerarApresentacao = () => {
    try {
      setSlides(renderModuleCarousel(APRESENTACAO_SLIDES, "diogo.mell0", "Quem é Diogo Mello"));
      toast.success("Carrossel de apresentação gerado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar");
    }
  };

  return (
    <div className="space-y-4">
      <Section
        title="📊 Funil de conversão"
        right={
          <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => void carregar()}>
            <RefreshCw className="w-3 h-3" /> Atualizar
          </Button>
        }
      >
        {carregando || !funil ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { l: "Alcance", v: funil.seguidores != null ? String(funil.seguidores) : "—", s: "seguidores" },
                { l: "Engajamento", v: String(funil.interacoesSemana), s: "interações / 7 dias" },
                { l: "Leads", v: String(funil.leadsMes), s: "diagnósticos este mês" },
                { l: "Clientes", v: String(funil.clientesMes), s: "convertidos este mês" },
              ].map((c) => (
                <div key={c.l} className="rounded-lg border p-3" style={{ borderColor: `${ACCENT}33` }}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{c.l}</p>
                  <p className="text-2xl font-bold" style={{ color: ACCENT }}>{c.v}</p>
                  <p className="text-[10px] text-muted-foreground">{c.s}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-sm font-semibold">{pct(funil.taxaEngajamento)}</p><p className="text-[10px] text-muted-foreground">seguidor → engajamento</p></div>
              <div><p className="text-sm font-semibold">{pct(funil.taxaLead)}</p><p className="text-[10px] text-muted-foreground">interação → lead</p></div>
              <div><p className="text-sm font-semibold">{pct(funil.taxaCliente)}</p><p className="text-[10px] text-muted-foreground">lead → cliente</p></div>
            </div>
            <div className="rounded-lg border p-3 text-sm" style={{ borderColor: "#EF9F2755", background: "#EF9F2710" }}>
              <p className="font-semibold">💡 Seu gargalo: {funil.gargalo.etapa}</p>
              <p className="text-muted-foreground">{funil.gargalo.acao}</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">{funil.postsMes} post(s) registrado(s) este mês</p>
            </div>
          </>
        )}
      </Section>

      <Section title="📝 Registrar post publicado">
        <div className="grid md:grid-cols-4 gap-2">
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={novo.tipo}
            onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
          >
            {TIPOS_POST.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Input placeholder="Tema" value={novo.tema} onChange={(e) => setNovo({ ...novo, tema: e.target.value })} />
          <Input placeholder="Módulo de origem (MCE, NEXUS…)" value={novo.modulo_origem} onChange={(e) => setNovo({ ...novo, modulo_origem: e.target.value })} />
          <Input placeholder="Formato" value={novo.formato} onChange={(e) => setNovo({ ...novo, formato: e.target.value })} />
        </div>
        <Button onClick={() => void salvarNovo()} className="gap-2" style={{ background: ACCENT }}>
          <Plus className="w-4 h-4" /> Registrar
        </Button>
      </Section>

      {posts.length > 0 && (
        <Section title="📈 Métricas por post">
          <div className="space-y-3">
            {posts.slice(0, 12).map((p) => (
              <div key={p.id} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "#ffffff12" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{p.tipo}</p>
                    <p className="text-[11px] text-muted-foreground">{p.data} · {p.tema || "sem tema"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.score_performance != null && <span className="text-xs font-mono" style={{ color: ACCENT }}>score {Math.round(Number(p.score_performance))}</span>}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => void removerPost(p.id).then(carregar)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {NUM_FIELDS.map((f) => (
                    <Input
                      key={String(f.key)}
                      type="number"
                      placeholder={f.label}
                      defaultValue={p[f.key] == null ? "" : String(p[f.key])}
                      onChange={(e) => setRascunho((r) => ({ ...r, [p.id]: { ...(r[p.id] || {}), [String(f.key)]: e.target.value } }))}
                      className="h-8 text-xs"
                    />
                  ))}
                </div>
                <Button size="sm" variant="outline" className="gap-1 h-7" onClick={() => void salvarMetricas(p)}>
                  <Save className="w-3 h-3" /> Salvar métricas
                </Button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {rk.length > 0 && (
        <Section title="🏆 Ranking de performance por tipo">
          <div className="space-y-2">
            {rk.map((r, i) => (
              <div key={r.tipo} className="flex items-center justify-between gap-2 text-sm border-b pb-2" style={{ borderColor: "#ffffff10" }}>
                <span>{medalha(i)} {r.tipo}</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {r.alcanceMedio != null && `alcance ${r.alcanceMedio} · `}
                  {r.savesMedio != null && `saves ${r.savesMedio} · `}
                  score {r.score}
                </span>
              </div>
            ))}
          </div>
          {insight && <p className="text-sm text-muted-foreground mt-2">💡 {insight}</p>}
        </Section>
      )}

      <Section title="📌 Posts fixados — sugestão">
        <p className="text-xs text-muted-foreground">O Instagram permite 3 posts fixados. São a primeira coisa que um visitante novo vê.</p>
        {fixados.map((f) => (
          <div key={f.pin} className="rounded-lg border p-3" style={{ borderColor: "#ffffff12" }}>
            <p className="text-xs font-mono" style={{ color: ACCENT }}>{f.icone} {f.pin}</p>
            <p className="text-sm">{f.valor}</p>
          </div>
        ))}
        <Button onClick={gerarApresentacao} className="gap-2" style={{ background: ACCENT }}>
          ✦ Gerar post de apresentação (PIN 3)
        </Button>
        {slides.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {slides.map((s, i) => <img key={i} src={s} alt={`Slide ${i + 1} do carrossel de apresentação`} className="rounded-md border" />)}
            </div>
            <SaveShareButtons items={slides.map((url, i) => ({ url, filename: `nutrion-apresentacao-${i + 1}.png` }))} />
          </>
        )}
      </Section>
    </div>
  );
}
