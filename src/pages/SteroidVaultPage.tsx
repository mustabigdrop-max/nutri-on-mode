import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Copy, Dna, Flame, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import NexusContentCreator from "@/components/nexus/NexusContentCreator";
import {
  steroidItems,
  steroidStats,
  ordenarSteroids,
  STEROID_CATEGORIAS,
  STEROID_DISCLAIMER,
  STEROID_HOOKS,
  STEROID_CARROSSEIS_PRONTOS,
  STATUS_COLOR_STEROID,
  BHASIN_2001,
  COLATERAIS_DOSE_DEPENDENTES,
  EXAMES_OBRIGATORIOS,
  type SteroidItem,
  type Severidade,
} from "@/data/steroidVaultData";

const ACCENT = "#EF4444";
const AMBER = "#EF9F27";

const SEVERIDADE_COR: Record<Severidade, string> = {
  LEVE: "#888888",
  MODERADO: "#EF9F27",
  GRAVE: "#EF4444",
  POTENCIALMENTE_FATAL: "#B91C1C",
};

function Disclaimer({ className = "" }: { className?: string }) {
  return <p className={`text-[10px] leading-relaxed text-gray-500 ${className}`}>{STEROID_DISCLAIMER}</p>;
}

/** Curva "menos é mais" — dados do Bhasin et al., 2001. */
function CurvaMenosEMais() {
  const max = Math.max(...BHASIN_2001.pontos.map((p) => p.ganho_kg));
  return (
    <Card className="border border-gray-800 bg-gray-900/50">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: ACCENT }}>
          <TrendingDown className="w-4 h-4" /> Menos é mais — a curva dose x ganho
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {BHASIN_2001.pontos.map((p) => (
          <div key={p.dose}>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{p.dose}</span>
              <span className="text-white font-semibold">+{p.ganho_kg.toString().replace(".", ",")} kg</span>
            </div>
            <div className="h-2 rounded-full bg-gray-800 mt-1 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(p.ganho_kg / max) * 100}%`, background: AMBER }} />
            </div>
            <p className="text-[10px] text-gray-600 mt-0.5">Eficiência por mg: {p.eficiencia_relativa}</p>
          </div>
        ))}
        <p className="text-xs text-gray-400 leading-relaxed">{BHASIN_2001.leitura}</p>
        <p className="text-xs leading-relaxed" style={{ color: ACCENT }}>{BHASIN_2001.tese}</p>
        <p className="text-[10px] text-gray-600">{BHASIN_2001.referencia}</p>
      </CardContent>
    </Card>
  );
}

function CarrosseisProntos() {
  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Roteiro copiado.");
  };
  return (
    <Card className="border border-gray-800 bg-gray-900/50">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-gray-300">🗂️ Carrosséis educativos prontos</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        {STEROID_CARROSSEIS_PRONTOS.map((c) => {
          const texto = c.slides
            .map((s, i) => `SLIDE ${i + 1} — ${s.titulo}\n${s.linhas.map((l) => `• ${l}`).join("\n")}`)
            .join("\n\n");
          return (
            <div key={c.id} className="rounded-lg border border-gray-800 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white">{c.titulo}</p>
                <Button variant="outline" size="sm" className="gap-1.5 border-gray-700 text-[11px] text-gray-300" onClick={() => copiar(texto)}>
                  <Copy className="h-3 w-3" /> Copiar
                </Button>
              </div>
              {c.slides.map((s, i) => (
                <div key={s.titulo}>
                  <p className="text-[11px] font-semibold" style={{ color: AMBER }}>
                    {i + 1}. {s.titulo}
                  </p>
                  {s.linhas.map((l) => (
                    <p key={l} className="text-[11px] text-gray-400 leading-relaxed">
                      • {l}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function SteroidVaultPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SteroidItem | null>(null);
  const [catFilter, setCatFilter] = useState<string>("Todos");
  const [sortBy, setSortBy] = useState<"status" | "nome" | "categoria">("categoria");

  const stats = steroidStats();

  const filtered = useMemo(() => {
    let list = steroidItems;
    if (catFilter !== "Todos") list = list.filter((i) => i.categoria === catFilter);
    return ordenarSteroids(list, sortBy);
  }, [catFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0A", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => (selected ? setSelected(null) : navigate("/lab"))} style={{ color: ACCENT }}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold" style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}>
            💉 NEXUS-BIO SteroidVault
          </h1>
          <p className="text-xs text-gray-500">Educação e redução de danos — esteroides, SARMs e PEDs</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {selected ? (
          <ItemDetail item={selected} onBack={() => setSelected(null)} />
        ) : (
          <ScrollArea className="h-full px-4">
            <div className="py-4 space-y-3">
              <div className="rounded-xl border p-3" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0A` }}>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Esta vault não promove nem demoniza o uso. Ela informa com ciência: dose-resposta real, riscos com o mesmo
                  peso dos benefícios, exames obrigatórios e situação legal.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: "💉", val: stats.total, label: "Compostos" },
                  { icon: "🗂️", val: stats.categorias, label: "Categorias" },
                  { icon: "🚫", val: stats.banidos, label: "Banidos" },
                  { icon: "🔬", val: stats.estudos, label: "Estudos" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-2 text-center">
                    <span className="text-lg">{s.icon}</span>
                    <p className="text-sm font-bold text-white">{s.val}</p>
                    <p className="text-[9px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              <CurvaMenosEMais />

              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold" style={{ color: ACCENT }}>
                    ⚠️ Efeitos que escalam com a dose
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-0.5">
                  {COLATERAIS_DOSE_DEPENDENTES.map((c) => (
                    <p key={c} className="text-xs text-gray-400">• {c}</p>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-1.5">
                {STEROID_CATEGORIAS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(c)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                      catFilter === c ? "text-white" : "border-gray-700 text-gray-500 hover:text-gray-300"
                    }`}
                    style={catFilter === c ? { backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}55`, color: ACCENT } : undefined}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>Ordenar:</span>
                {(["categoria", "status", "nome"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className="px-2 py-0.5 rounded border transition"
                    style={sortBy === s ? { borderColor: `${ACCENT}55`, color: ACCENT } : { borderColor: "#1f2937" }}
                  >
                    {s === "status" ? "Status" : s === "nome" ? "A-Z" : "Categoria"}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-gray-600">
                {filtered.length} de {steroidItems.length} compostos
              </p>

              <div className="grid grid-cols-2 gap-3">
                {filtered.map((i) => {
                  const color = STATUS_COLOR_STEROID[i.status];
                  return (
                    <button
                      key={i.id}
                      onClick={() => setSelected(i)}
                      className="text-left rounded-xl p-3 border transition-all hover:scale-[1.02]"
                      style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
                    >
                      <Badge className="text-[9px] mb-2 border" style={{ backgroundColor: `${color}15`, color, borderColor: `${color}40` }}>
                        {i.status.replace("_", " ")}
                      </Badge>
                      <h3 className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                        {i.nome}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{i.classe}</p>
                      <p className="text-[9px] text-gray-600 mt-0.5">
                        {i.categoria} · evidência {i.evidencia.toLowerCase()}
                      </p>
                    </button>
                  );
                })}
              </div>

              <CarrosseisProntos />

              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: AMBER }}>
                    <Flame className="w-4 h-4" /> Ganchos educativos prontos
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1.5">
                  {STEROID_HOOKS.map((h, idx) => (
                    <button
                      key={h}
                      onClick={() => {
                        navigator.clipboard.writeText(h);
                        toast.success("Gancho copiado.");
                      }}
                      className="block w-full text-left text-xs text-gray-400 hover:text-[#EF9F27] transition"
                    >
                      {idx + 1}. {h}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold text-gray-300">🩺 Exames obrigatórios — se usa, monitore</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-0.5">
                  {EXAMES_OBRIGATORIOS.map((e) => (
                    <p key={e} className="text-xs text-gray-400">• {e}</p>
                  ))}
                </CardContent>
              </Card>

              <Disclaimer className="text-center" />
              <p className="text-center text-[10px] text-gray-700 py-4">NEXUS-BIO SteroidVault · nutriON</p>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

function ItemDetail({ item, onBack }: { item: SteroidItem; onBack: () => void }) {
  const navigate = useNavigate();
  const color = STATUS_COLOR_STEROID[item.status];

  const fichas: { title: string; content: string }[] = [
    { title: "⏱️ Meia-vida", content: item.meia_vida },
    { title: "💉 Via", content: item.via },
    { title: "🔎 Detecção antidoping", content: item.deteccao },
    { title: "⚖️ Razão anabólica : androgênica", content: item.ratio_anabolico_androgenico },
    { title: "📐 Comparativo com testosterona", content: item.comparativo_testosterona },
    { title: "🔬 Nível de evidência", content: item.evidencia },
    { title: "🏛️ Legalidade no Brasil", content: item.legalidade_brasil },
    { title: "📄 Classificação ANVISA", content: item.classificacao_anvisa },
  ];

  return (
    <ScrollArea className="h-full px-4">
      <div className="py-4 space-y-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2" style={{ color: ACCENT }}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk'" }}>
            {item.nome}
          </h2>
          <Badge className="border text-xs" style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}>
            {item.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">
          {item.classe} · {item.categoria}
        </p>

        <NexusContentCreator nome={item.nome} origem="SteroidVault" compoundData={item} contexto={item.comparativo_testosterona} />

        <div className="grid grid-cols-2 gap-2">
          {fichas.map((f) => (
            <div key={f.title} className="rounded-lg border border-gray-800 bg-gray-900/50 p-3">
              <p className="text-[10px] text-gray-500">{f.title}</p>
              <p className="text-xs text-gray-300 leading-relaxed mt-0.5">{f.content}</p>
            </div>
          ))}
        </div>

        {(item.dose_trt || item.dose_performance || item.dose_abuso || item.ganho_esperado) && (
          <Card className="border border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold" style={{ color: AMBER }}>
                📊 Dose-resposta documentada
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {item.dose_trt && <p className="text-xs text-gray-400"><span className="text-gray-500">Uso clínico:</span> {item.dose_trt}</p>}
              {item.dose_performance && <p className="text-xs text-gray-400"><span className="text-gray-500">Faixas descritas na literatura:</span> {item.dose_performance}</p>}
              {item.dose_abuso && <p className="text-xs text-gray-400"><span className="text-gray-500">Relatos de abuso:</span> {item.dose_abuso}</p>}
              {item.ganho_esperado?.dose_baixa && <p className="text-xs text-gray-400">• {item.ganho_esperado.dose_baixa}</p>}
              {item.ganho_esperado?.dose_media && <p className="text-xs text-gray-400">• {item.ganho_esperado.dose_media}</p>}
              {item.ganho_esperado?.dose_alta && <p className="text-xs text-gray-400">• {item.ganho_esperado.dose_alta}</p>}
              {item.ganho_esperado?.eficiencia && (
                <p className="text-xs leading-relaxed" style={{ color: ACCENT }}>{item.ganho_esperado.eficiencia}</p>
              )}
              <p className="text-[10px] text-gray-600">Dados de literatura científica. Não constituem recomendação de dose.</p>
            </CardContent>
          </Card>
        )}

        {(item.ponto_retorno_decrescente || item.colateral_por_mg_extra) && (
          <Card className="border border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: ACCENT }}>
                <TrendingDown className="w-4 h-4" /> Menos é mais
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {item.ponto_retorno_decrescente && (
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-gray-500">Ponto de retorno decrescente:</span> {item.ponto_retorno_decrescente}
                </p>
              )}
              {item.colateral_por_mg_extra && (
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-gray-500">Custo de cada mg extra:</span> {item.colateral_por_mg_extra}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-300">✅ Efeitos documentados</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-0.5">
            {item.beneficios.map((b) => (
              <p key={b} className="text-xs text-gray-400">• {b}</p>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold" style={{ color: ACCENT }}>
              ⚠️ Efeitos colaterais
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {item.efeitos_colaterais.map((e) => (
              <div key={e.efeito} className="rounded-lg border border-gray-800 p-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-gray-300 leading-relaxed">{e.efeito}</p>
                  <Badge
                    className="text-[9px] border shrink-0"
                    style={{
                      backgroundColor: `${SEVERIDADE_COR[e.severidade]}15`,
                      color: SEVERIDADE_COR[e.severidade],
                      borderColor: `${SEVERIDADE_COR[e.severidade]}40`,
                    }}
                  >
                    {e.severidade.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-[10px] text-gray-600 mt-1">
                  {e.frequencia} · {e.dose_dependente ? "dose-dependente" : "não dose-dependente"} ·{" "}
                  {e.reversivel ? "reversível" : "pode ser irreversível"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-300">🔬 Estudos-chave</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {item.estudos_chave.map((e) => (
              <div key={`${e.autor}-${e.ano}`}>
                <p className="text-[11px] font-semibold" style={{ color: AMBER }}>
                  {e.autor}, {e.ano} — {e.journal}
                  {e.n ? ` · n = ${e.n}` : ""}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">{e.achado_principal}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {!!item.empilhamentos_comuns?.length && (
          <Card className="border border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-gray-300">🧩 Combinações descritas na literatura</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {item.empilhamentos_comuns.map((s) => (
                <div key={s.nome}>
                  <p className="text-[11px] font-semibold text-white">{s.nome}</p>
                  <p className="text-xs text-gray-400">{s.compostos.join(" + ")} — {s.objetivo}</p>
                  <p className="text-[10px]" style={{ color: ACCENT }}>Risco: {s.risco}</p>
                </div>
              ))}
              <p className="text-[10px] text-gray-600">Descrição informativa. Não é recomendação de protocolo.</p>
            </CardContent>
          </Card>
        )}

        <Card className="border border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-300">🩺 Monitoramento e segurança</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div>
              <p className="text-[11px] font-semibold" style={{ color: AMBER }}>Exames obrigatórios</p>
              {item.exames_obrigatorios.map((e) => (
                <p key={e} className="text-xs text-gray-400">• {e}</p>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold" style={{ color: ACCENT }}>Sinais para parar imediatamente</p>
              {item.sinais_alerta.map((s) => (
                <p key={s} className="text-xs text-gray-400">• {s}</p>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400">Interações perigosas</p>
              {item.interacoes_perigosas.map((s) => (
                <p key={s} className="text-xs text-gray-400">• {s}</p>
              ))}
            </div>
            {item.pct_recomendado && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400">Recuperação hormonal</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.pct_recomendado}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full gap-2 border-gray-700 text-gray-300" onClick={() => navigate("/peptide-vault")}>
          <Dna className="w-4 h-4" /> Abrir PeptideVault
        </Button>

        <Disclaimer />
        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
