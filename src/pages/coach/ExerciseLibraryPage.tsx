// Biblioteca de exercícios analisados: salva músculos, cues, ângulos e alertas
// para reutilizar no Overlay Studio sem reanalisar o mesmo movimento.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, Search, Trash2, Play, Loader2 } from "lucide-react";
import BilateralActivation from "@/components/social/BilateralActivation";
import {
  listExercises, deleteExercise, sendToOverlay, markExerciseUsed, type SavedExercise,
} from "@/lib/exerciseLibrary";

const T = {
  bg: "#020205", s: "#0a0e18", border: "#1e2d45",
  cyan: "#00D4FF", gold: "#B8922A", red: "#ff4757",
  text: "#e8edf5", muted: "#6b7a94", font: "'Rajdhani', sans-serif", mono: "'Space Mono', monospace",
};

const ExerciseLibraryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listExercises());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar a biblioteca.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.exercicio, i.padrao, ...(i.data.musculos_primarios || [])].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  const reuse = async (item: SavedExercise) => {
    sendToOverlay(item);
    await markExerciseUsed(item.id, item.times_used);
    navigate("/coach/social");
  };

  const remove = async (id: string) => {
    await deleteExercise(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.font, padding: "18px 14px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <button onClick={() => navigate("/coach/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, fontFamily: T.font, marginBottom: 14 }}>
          <ArrowLeft size={16} /> Painel do coach
        </button>

        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.cyan}18`, border: `1px solid ${T.cyan}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={20} color={T.cyan} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1, margin: 0 }}>BIBLIOTECA DE EXERCÍCIOS</h1>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, letterSpacing: 1 }}>
              {items.length} exercício(s) salvos · reutilize no Overlay Studio
            </div>
          </div>
        </header>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} color={T.muted} style={{ position: "absolute", left: 12, top: 13 }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por exercício, padrão ou músculo"
            style={{ width: "100%", padding: "11px 12px 11px 34px", background: T.s, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, fontFamily: T.font, outline: "none" }} />
        </div>

        {error && (
          <div style={{ background: `${T.red}14`, border: `1px solid ${T.red}55`, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: T.red, marginBottom: 12 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: T.muted }}>
            <Loader2 size={22} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontSize: 12, fontFamily: T.mono }}>Carregando biblioteca...</div>
          </div>
        ) : !filtered.length ? (
          <div style={{ textAlign: "center", padding: 48, background: T.s, border: `1px dashed ${T.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🗂️</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Nenhum exercício salvo ainda</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
              Analise um vídeo no Overlay Studio e toque em "Salvar na biblioteca".
            </div>
            <button onClick={() => navigate("/coach/social")}
              style={{ marginTop: 14, padding: "11px 18px", background: T.cyan, color: "#000", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontFamily: T.font }}>
              IR PARA O OVERLAY STUDIO
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((item) => {
              const expanded = open === item.id;
              return (
                <div key={item.id} style={{ background: T.s, border: `1px solid ${expanded ? `${T.cyan}55` : T.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setOpen(expanded ? null : item.id)}
                      style={{ flex: 1, textAlign: "left", background: "transparent", border: "none", color: T.text, cursor: "pointer", fontFamily: T.font, padding: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{item.exercicio}</div>
                      <div style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, marginTop: 2 }}>
                        {item.padrao || "—"} · {(item.data.musculos_primarios || []).slice(0, 3).join(", ") || "sem primários"}
                        {item.times_used > 0 ? ` · usado ${item.times_used}x` : ""}
                      </div>
                    </button>
                    <button onClick={() => void reuse(item)} title="Usar no overlay"
                      style={{ padding: "9px 12px", background: `${T.cyan}18`, border: `1px solid ${T.cyan}55`, color: T.cyan, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, fontFamily: T.font }}>
                      <Play size={13} /> USAR
                    </button>
                    <button onClick={() => void remove(item.id)} title="Apagar"
                      style={{ padding: 9, background: "transparent", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
                      <BilateralActivation musculos={item.data.musculos} />
                      {item.data.cue_principal && (
                        <div style={{ fontSize: 12, color: T.gold }}>🎯 {item.data.cue_principal}</div>
                      )}
                      {(item.data.cues || []).map((c, i) => (
                        <div key={i} style={{ fontSize: 11, color: T.muted }}>· {c}</div>
                      ))}
                      {!!(item.data.angulos || []).length && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {(item.data.angulos || []).map((a) => (
                            <span key={a} style={{ fontSize: 10, fontFamily: T.mono, padding: "3px 8px", borderRadius: 999, color: "#00d4a1", background: "#00d4a118", border: "1px solid #00d4a155" }}>{a}</span>
                          ))}
                        </div>
                      )}
                      {!!(item.data.fases || []).length && (
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: 1.2, fontFamily: T.mono, color: T.muted, marginBottom: 6 }}>FASES DO MOVIMENTO</div>
                          {(item.data.fases || []).map((f, i) => (
                            <div key={i} style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>
                              <strong>{f.nome}</strong> <span style={{ color: T.muted }}>{Math.round((f.inicio ?? 0) * 100)}–{Math.round((f.fim ?? 1) * 100)}%</span> · {f.cue}
                            </div>
                          ))}
                        </div>
                      )}
                      {item.data.alerta && (
                        <div style={{ fontSize: 11, color: T.red, background: `${T.red}12`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "8px 10px" }}>
                          ⚠ {item.data.alerta}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibraryPage;
