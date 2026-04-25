import { useState } from "react";
import { Search, X, AlertTriangle, Sparkles, Clock, Heart } from "lucide-react";
import { RECOVERY_PROTOCOLS, RecoveryProtocol } from "@/data/recoveryProtocols";

const CATEGORIAS = ["Todas", "Ativa", "Térmica", "Sono", "Vascular", "Hormonal"] as const;

const intensidadeColor = (n: number) => {
  if (n <= 1) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (n === 2) return "text-lime-400 bg-lime-500/10 border-lime-500/30";
  if (n === 3) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  if (n === 4) return "text-orange-400 bg-orange-500/10 border-orange-500/30";
  return "text-red-400 bg-red-500/10 border-red-500/30";
};

const categoriaColor = (cat: RecoveryProtocol["categoria"]) => {
  switch (cat) {
    case "Ativa": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    case "Térmica": return "text-orange-400 border-orange-500/30 bg-orange-500/10";
    case "Sono": return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
    case "Vascular": return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    case "Hormonal": return "text-pink-400 border-pink-500/30 bg-pink-500/10";
  }
};

const RecoveryProtocolsSelector = () => {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<typeof CATEGORIAS[number]>("Todas");
  const [selected, setSelected] = useState<RecoveryProtocol | null>(null);

  const filtered = RECOVERY_PROTOCOLS.filter((p) => {
    const matchSearch = !search ||
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.resumo.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Todas" || p.categoria === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar protocolo (sauna, sono, contraste...)"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              filterCat === c
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="text-left p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors group"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="text-2xl">{p.emoji}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {p.nome}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${categoriaColor(p.categoria)}`}>
                    {p.categoria}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${intensidadeColor(p.intensidade)}`}>
                    Intens. {p.intensidade}/5
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">{p.resumo}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum protocolo encontrado.</div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border sm:rounded-2xl rounded-t-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl">{selected.emoji}</div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-foreground leading-tight truncate">{selected.nome}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${categoriaColor(selected.categoria)}`}>
                      {selected.categoria}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${intensidadeColor(selected.intensidade)}`}>
                      Intens. {selected.intensidade}/5
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{selected.resumo}</p>

              {/* Protocolo */}
              <div>
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Protocolo passo-a-passo
                </h3>
                <div className="space-y-2">
                  {selected.protocolo.map((step, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold text-foreground">
                          {i + 1}. {step.fase}
                        </span>
                        {step.duracao && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                            {step.duracao}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{step.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefícios */}
              <div>
                <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Benefícios
                </h3>
                <ul className="space-y-1.5">
                  {selected.beneficios.map((b, i) => (
                    <li key={i} className="text-[11px] text-foreground/90 leading-relaxed flex gap-2">
                      <span className="text-emerald-400 flex-shrink-0">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sinergias */}
              <div>
                <h3 className="text-[11px] font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Sinergias
                </h3>
                <ul className="space-y-1.5">
                  {selected.sinergias.map((s, i) => (
                    <li key={i} className="text-[11px] text-foreground/90 leading-relaxed flex gap-2">
                      <span className="text-pink-400 flex-shrink-0">✦</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quando usar */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">Quando usar</h3>
                <p className="text-[11px] text-foreground/90 leading-relaxed">{selected.quandoUsar}</p>
              </div>

              {/* Evitar */}
              {selected.evitar && (
                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/30">
                  <h3 className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">Evitar</h3>
                  <p className="text-[11px] text-foreground/90 leading-relaxed">{selected.evitar}</p>
                </div>
              )}

              {/* Alerta */}
              {selected.alerta && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/30 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1">Alerta</h3>
                    <p className="text-[11px] text-foreground/90 leading-relaxed">{selected.alerta}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryProtocolsSelector;
