import { useState, useMemo } from "react";
import { ChevronLeft, Crown, Search, X, Info } from "lucide-react";
import { EXERCISE_ARSENAL, type ArsenalGroup, type ArsenalExercise, type ExerciseCategory } from "@/data/exerciseArsenal";

const CATEGORY_META: Record<ExerciseCategory, { label: string; color: string; emoji: string }> = {
  forca: { label: "Força", color: "text-red-400 border-red-500/30 bg-red-500/10", emoji: "🏋️" },
  hipertrofia: { label: "Hipertrofia", color: "text-primary border-primary/30 bg-primary/10", emoji: "💪" },
  isolamento: { label: "Isolamento", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", emoji: "🎯" },
  tecnica: { label: "Técnica", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", emoji: "🔥" },
};

const ExerciseArsenalSelector = () => {
  const [selectedGroup, setSelectedGroup] = useState<ArsenalGroup>(EXERCISE_ARSENAL[0]);
  const [selectedExercise, setSelectedExercise] = useState<ArsenalExercise | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | "todas">("todas");

  const filteredExercises = useMemo(() => {
    let list = selectedGroup.exercicios;
    if (activeCategory !== "todas") list = list.filter((e) => e.categoria === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.nome.toLowerCase().includes(q) ||
          e.descricao.toLowerCase().includes(q) ||
          e.subgrupo?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedGroup, activeCategory, search]);

  return (
    <div className="h-full overflow-y-auto px-4 py-4 pb-24">
      {/* GROUP TABS */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {EXERCISE_ARSENAL.map((group) => (
          <button
            key={group.id}
            onClick={() => {
              setSelectedGroup(group);
              setSelectedExercise(null);
              setActiveCategory("todas");
              setSearch("");
            }}
            className={`flex-shrink-0 px-3 py-2 rounded-xl border transition-all ${
              selectedGroup.id === group.id
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            <span className="text-base mr-1.5">{group.emoji}</span>
            <span className="text-xs font-bold">{group.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* GROUP HEADER */}
      <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-card to-card/60 border border-border">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{selectedGroup.emoji}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-foreground">{selectedGroup.nome}</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selectedGroup.resumo}</p>
            <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span>{selectedGroup.exercicios.length} exercícios</span>
              <span className="text-yellow-400">
                <Crown className="w-3 h-3 inline mr-0.5" />
                {selectedGroup.exercicios.filter((e) => e.rei).length} rei(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mt-3 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar em ${selectedGroup.nome.toLowerCase()}...`}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex gap-1.5 overflow-x-auto mt-3 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("todas")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            activeCategory === "todas"
              ? "bg-foreground/10 border-foreground/40 text-foreground"
              : "bg-card border-border text-muted-foreground"
          }`}
        >
          Todas ({selectedGroup.exercicios.length})
        </button>
        {(Object.keys(CATEGORY_META) as ExerciseCategory[]).map((cat) => {
          const count = selectedGroup.exercicios.filter((e) => e.categoria === cat).length;
          if (count === 0) return null;
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                activeCategory === cat ? meta.color : "bg-card border-border text-muted-foreground"
              }`}
            >
              {meta.emoji} {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* EXERCISES LIST */}
      <div className="mt-4 space-y-2">
        {filteredExercises.map((ex) => {
          const meta = CATEGORY_META[ex.categoria];
          return (
            <button
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="w-full text-left p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ex.rei && <Crown className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                    <span className="text-sm font-bold text-foreground">{ex.nome}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  {ex.subgrupo && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{ex.subgrupo}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{ex.descricao}</p>
                  {ex.serie && (
                    <p className="text-[10px] text-primary font-mono font-bold mt-1.5">📊 {ex.serie}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {filteredExercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">Nenhum exercício encontrado.</div>
        )}
      </div>

      {/* ESPECIALIZAÇÃO */}
      {selectedGroup.protocoloEspecializacao && (
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-500/10 border border-primary/20">
          <h3 className="text-sm font-black text-foreground mb-1">
            🎯 Protocolo de Especialização — {selectedGroup.protocoloEspecializacao.duracao}
          </h3>
          <div className="space-y-2 mt-3">
            {selectedGroup.protocoloEspecializacao.sessoes.map((s, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-background/40 border border-border">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-primary">{s.nome}</span>
                  <span className="text-[10px] text-muted-foreground">{s.foco}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">{s.detalhe}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTAS TÉCNICAS */}
      {selectedGroup.notasTecnicas && (
        <div className="mt-3 p-4 rounded-2xl bg-card/60 border border-border">
          <h3 className="text-xs font-black text-foreground flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-primary" />
            NOTAS TÉCNICAS
          </h3>
          <ul className="space-y-1.5">
            {selectedGroup.notasTecnicas.map((n, i) => (
              <li key={i} className="text-[11px] text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary/30">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedExercise && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-card rounded-3xl border border-border p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedExercise.rei && <Crown className="w-4 h-4 text-yellow-400" />}
                  <h3 className="text-lg font-black text-foreground">{selectedExercise.nome}</h3>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      CATEGORY_META[selectedExercise.categoria].color
                    }`}
                  >
                    {CATEGORY_META[selectedExercise.categoria].emoji} {CATEGORY_META[selectedExercise.categoria].label}
                  </span>
                  {selectedExercise.subgrupo && (
                    <span className="text-[10px] text-muted-foreground font-mono">{selectedExercise.subgrupo}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            <p className="text-sm text-foreground/80 mt-4 leading-relaxed">{selectedExercise.descricao}</p>

            <div className="mt-4">
              <h4 className="text-xs font-black text-primary mb-2">📋 COMO EXECUTAR</h4>
              <ol className="space-y-2">
                {selectedExercise.comoExecutar.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/80 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {selectedExercise.dica && (
              <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/30">
                <h4 className="text-[10px] font-black text-primary mb-1">💡 DICA TÉCNICA</h4>
                <p className="text-xs text-foreground/90 leading-relaxed">{selectedExercise.dica}</p>
              </div>
            )}

            {selectedExercise.serie && (
              <div className="mt-3 p-3 rounded-xl bg-background border border-border">
                <h4 className="text-[10px] font-black text-muted-foreground mb-1">📊 PROTOCOLO SUGERIDO</h4>
                <p className="text-sm text-foreground font-mono font-bold">{selectedExercise.serie}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseArsenalSelector;
