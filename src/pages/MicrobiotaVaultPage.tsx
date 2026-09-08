import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Sparkles, Dna, Flame } from "lucide-react";
import {
  microbiotaItems,
  microbiotaStats,
  ordenarMicrobiota,
  MICROBIOTA_CATEGORIAS,
  MICROBIOTA_OBJETIVOS,
  MICROBIOTA_HOOKS,
  MICROBIOTA_ANGULOS,
  MICROBIOTA_FORMATOS,
  MICROBIOTA_DISCLAIMER,
  STATUS_COLOR,
  type MicrobiotaItem,
} from "@/data/microbiotaVaultData";

const ACCENT = "#4ade80";

function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[10px] leading-relaxed text-gray-500 ${className}`}>{MICROBIOTA_DISCLAIMER}</p>
  );
}

export default function MicrobiotaVaultPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<MicrobiotaItem | null>(null);
  const [catFilter, setCatFilter] = useState<string>("Todos");
  const [objFilter, setObjFilter] = useState("todos");
  const [sortBy, setSortBy] = useState<"status" | "nome" | "categoria">("status");

  const stats = microbiotaStats();

  const filtered = useMemo(() => {
    let list = microbiotaItems;
    if (catFilter !== "Todos") list = list.filter((i) => i.categoria === catFilter);
    if (objFilter !== "todos") list = list.filter((i) => i.objetivos.includes(objFilter));
    return ordenarMicrobiota(list, sortBy);
  }, [catFilter, objFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0f0a", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => (selected ? setSelected(null) : navigate("/lab"))} className="text-[#4ade80]">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-[#4ade80]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            🦠 NEXUS-BIO MicrobiotaVault
          </h1>
          <p className="text-xs text-gray-500">Enciclopédia viva da microbiota</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {selected ? (
          <ItemDetail item={selected} onBack={() => setSelected(null)} />
        ) : (
          <ScrollArea className="h-full px-4">
            <div className="py-4 space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: "🦠", val: stats.total, label: "Total" },
                  { icon: "✅", val: stats.validados, label: "Validados" },
                  { icon: "🔬", val: stats.cepas, label: "Cepas" },
                  { icon: "🔥", val: stats.vanguarda, label: "Vanguarda+" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-2 text-center">
                    <span className="text-lg">{s.icon}</span>
                    <p className="text-sm font-bold text-white">{s.val}</p>
                    <p className="text-[9px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Categorias */}
              <div className="flex flex-wrap gap-1.5">
                {MICROBIOTA_CATEGORIAS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(c)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                      catFilter === c
                        ? "bg-[#4ade80]/20 border-[#4ade80]/50 text-[#4ade80]"
                        : "border-gray-700 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Objetivos */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-gray-600 self-center mr-1">Objetivo:</span>
                {MICROBIOTA_OBJETIVOS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setObjFilter(t)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      objFilter === t
                        ? "bg-[#4ade80]/15 border-[#4ade80]/40 text-[#4ade80]"
                        : "border-gray-800 text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Ordenar */}
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>Ordenar:</span>
                {(["status", "nome", "categoria"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-2 py-0.5 rounded border transition ${
                      sortBy === s ? "border-[#4ade80]/40 text-[#4ade80]" : "border-gray-800 hover:text-gray-300"
                    }`}
                  >
                    {s === "status" ? "Status" : s === "nome" ? "A-Z" : "Categoria"}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-gray-600">
                {filtered.length} de {microbiotaItems.length} itens
              </p>

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">Nenhum item para esses filtros.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map((i) => {
                    const color = STATUS_COLOR[i.status];
                    return (
                      <button
                        key={i.id}
                        onClick={() => setSelected(i)}
                        className="text-left rounded-xl p-3 border transition-all hover:scale-[1.02]"
                        style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
                      >
                        <Badge
                          className="text-[9px] mb-2 border"
                          style={{ backgroundColor: `${color}15`, color, borderColor: `${color}40` }}
                        >
                          {i.status}
                        </Badge>
                        <h3 className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                          {i.nome}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{i.classe}</p>
                        <p className="text-[9px] text-gray-600 mt-0.5">
                          {i.categoria}
                          {i.evidencia_cientifica ? ` · evidência ${i.evidencia_cientifica.toLowerCase()}` : ""}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {i.objetivos.slice(0, 3).map((t) => (
                            <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full border border-gray-800 text-gray-500">
                              {t}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hooks virais */}
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold text-[#EF9F27] flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Hooks prontos para microbiota
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1.5">
                  {MICROBIOTA_HOOKS.map((h, idx) => (
                    <button
                      key={h}
                      onClick={() => navigate(`/coach/social?tab=carrossel_mce&tema=${encodeURIComponent(h)}`)}
                      className="block w-full text-left text-xs text-gray-400 hover:text-[#EF9F27] transition"
                    >
                      {idx + 1}. {h}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Disclaimer className="text-center" />
              <p className="text-center text-[10px] text-gray-700 py-4">NEXUS-BIO MicrobiotaVault · nutriON</p>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

function ItemDetail({ item, onBack }: { item: MicrobiotaItem; onBack: () => void }) {
  const navigate = useNavigate();
  const [angulo, setAngulo] = useState("educativo");
  const color = STATUS_COLOR[item.status];

  const gerar = (formato: string) => {
    const anguloLabel = MICROBIOTA_ANGULOS.find((a) => a.id === angulo)?.label ?? "Educativo";
    // Carrossel do NEXUS-BIO usa o template científico (só o nome do composto,
    // a ficha completa é carregada no gerador). Reels/Stories seguem por tema.
    if (formato === "carrossel") {
      navigate(`/coach/social?tab=carrossel_nexus&tema=${encodeURIComponent(item.nome)}`);
      return;
    }
    const tema =
      angulo === "cross_vault"
        ? `${item.nome} × peptídeos: comparação honesta (microbiota vs fármaco) — ${item.mecanismo_acao}`
        : `${item.nome} (${item.classe}) — ângulo ${anguloLabel}. ${item.mecanismo_acao}${
            item.dica_pratica ? ` Dica prática: ${item.dica_pratica}` : ""
          }`;
    const tab = formato === "reels" ? "reels" : "stories";
    navigate(`/coach/social?tab=${tab}&tema=${encodeURIComponent(tema)}`);
  };

  return (
    <ScrollArea className="h-full px-4">
      <div className="py-4 space-y-4">
        <Button variant="ghost" onClick={onBack} className="text-[#4ade80] -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk'" }}>
            {item.nome}
          </h2>
          <Badge className="border text-xs" style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}>
            {item.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">
          {item.classe} · {item.categoria}
          {item.cepa ? ` · cepa ${item.cepa}` : ""}
        </p>

        {/* Criar conteúdo */}
        <NexusContentCreator
          nome={item.nome}
          origem="MicrobiotaVault"
          compoundData={item}
          contexto={item.mecanismo_acao}
        />

        <NexusComoObter nome={item.nome} origem="MicrobiotaVault" compoundData={item} />


        {[
          { title: "⚙️ Como funciona", content: item.mecanismo_acao },
          { title: "🎯 Objetivos", content: item.objetivos.join(" · ") },
          item.dose_estudada ? { title: "📏 Dose estudada", content: item.dose_estudada } : null,
          item.alimentos_fonte?.length ? { title: "🍽️ Onde encontrar", content: item.alimentos_fonte.join(", ") } : null,
          item.evidencia_cientifica ? { title: "🔬 Evidência", content: item.evidencia_cientifica } : null,
        ]
          .filter(Boolean)
          .map((s) => (
            <Card key={(s as { title: string }).title} className="border border-gray-800 bg-gray-900/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-300">{(s as { title: string }).title}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs text-gray-400 leading-relaxed">{(s as { content: string }).content}</p>
              </CardContent>
            </Card>
          ))}

        {!!item.beneficios?.length && (
          <Card className="border border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold" style={{ color: ACCENT }}>
                ✅ Benefícios documentados
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0.5">
              {item.beneficios.map((b) => (
                <p key={b} className="text-xs text-gray-400">
                  • {b}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {(item.dica_pratica || item.conexao_mce || item.notas) && (
          <Card className="border border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-gray-300">🧾 Prática e contexto</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {item.dica_pratica && (
                <div>
                  <p className="text-[11px] font-semibold text-[#4ade80] mb-1">Dica prática</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.dica_pratica}</p>
                </div>
              )}
              {item.conexao_mce && (
                <div>
                  <p className="text-[11px] font-semibold text-[#EF9F27] mb-1">Conexão MCE</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.conexao_mce}</p>
                </div>
              )}
              {item.notas && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">Notas</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full gap-2 border-gray-700 text-gray-300" onClick={() => navigate("/peptide-vault")}>
          <Dna className="w-4 h-4" /> Abrir PeptideVault
        </Button>

        <Disclaimer />
        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
