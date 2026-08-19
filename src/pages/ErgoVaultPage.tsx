import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap, Dot, BookOpen } from "lucide-react";
import {
  ERGO_COMPOUNDS,
  ERGO_CATEGORIAS,
  RISCO_CONFIG,
  FASES_CICLO,
  type ErgoCategoria,
  type ErgoCompound,
} from "@/data/ergoData";
import ErgoAgentPanel from "@/components/ergo/ErgoAgentPanel";

// ── Paleta ERGO VAULT (apenas nesta página) ─────────────────────────────
const PALETTE = {
  obsidian: "#05050A",
  rose: "#C4546A",
  rosePale: "#E8A0AE",
  mauve: "#9B6D8A",
  gold: "#C9A96E",
  sage: "#7A9A7A",
  lavender: "#8878AA",
  cyan: "#4FC3F7",
  cream: "#EDE6DA",
};

const FONT_DISPLAY = "'Playfair Display', serif";
const FONT_IMPACT = "'Bebas Neue', sans-serif";
const FONT_UI = "'Barlow Condensed', sans-serif";
const FONT_MONO = "'Share Tech Mono', monospace";

// ── Subcomponente: Card de composto ──────────────────────────────────────
const CompoundCard = ({
  c,
  onAgent,
}: {
  c: ErgoCompound;
  onAgent: (agent: "vertex" | "nexus", c: ErgoCompound) => void;
}) => {
  const risco = RISCO_CONFIG[c.risco];
  const cat = ERGO_CATEGORIAS.find((x) => x.id === c.categoria);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-2xl border p-6 transition-all hover:scale-[1.01]"
      style={{
        background: `linear-gradient(180deg, rgba(196,84,106,0.04) 0%, rgba(5,5,10,0.6) 100%)`,
        borderColor: "rgba(196,84,106,0.18)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header: categoria + risco */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className="inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em]"
          style={{
            fontFamily: FONT_MONO,
            color: PALETTE.cream,
            borderColor: "rgba(237,230,218,0.2)",
            background: "rgba(237,230,218,0.04)",
          }}
        >
          {cat?.label}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] tracking-widest ${risco.bg} ${risco.text}`}
          style={{ fontFamily: FONT_MONO }}
        >
          {risco.label}
        </span>
      </div>

      {/* Nome */}
      <h3
        className="mb-1 text-2xl leading-tight"
        style={{ fontFamily: FONT_DISPLAY, color: PALETTE.cream }}
      >
        {c.nome}
      </h3>
      <p
        className="mb-4 text-xs italic"
        style={{ color: PALETTE.rosePale, fontFamily: FONT_DISPLAY }}
      >
        {c.nomeCientifico}
      </p>

      {/* Doses */}
      <div className="mb-4 grid gap-2 text-xs" style={{ fontFamily: FONT_UI }}>
        <div className="flex justify-between gap-3">
          <span style={{ color: PALETTE.rosePale }}>♀ DOSE FEMININA</span>
          <span className="text-right" style={{ color: PALETTE.cream }}>
            {c.doseFeminina}
          </span>
        </div>
        {c.doseMasculina && (
          <div className="flex justify-between gap-3 opacity-60">
            <span>♂ Dose masculina</span>
            <span className="text-right">{c.doseMasculina}</span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span style={{ color: PALETTE.rosePale }}>⏱ TIMING</span>
          <span className="text-right" style={{ color: PALETTE.cream }}>
            {c.timing}
          </span>
        </div>
      </div>

      {/* Descrição */}
      <p
        className="mb-4 text-sm leading-relaxed"
        style={{ color: "rgba(237,230,218,0.78)", fontFamily: FONT_UI }}
      >
        {c.descricao}
      </p>

      {/* Diferencial Feminino */}
      <div
        className="mb-4 rounded-xl border-l-2 p-3"
        style={{
          background: "rgba(196,84,106,0.08)",
          borderColor: PALETTE.rose,
        }}
      >
        <div
          className="mb-1 text-[10px] uppercase tracking-[0.25em]"
          style={{ fontFamily: FONT_MONO, color: PALETTE.rose }}
        >
          ♀ Diferencial Feminino
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: PALETTE.cream, fontFamily: FONT_UI }}
        >
          {c.diferencialFeminino}
        </p>
      </div>

      {/* Tags benefícios */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {c.beneficios.slice(0, 6).map((b) => (
          <span
            key={b}
            className="rounded-full px-2.5 py-0.5 text-[10px]"
            style={{
              fontFamily: FONT_UI,
              background: "rgba(122,154,122,0.12)",
              color: PALETTE.sage,
              border: `1px solid rgba(122,154,122,0.25)`,
            }}
          >
            {b}
          </span>
        ))}
      </div>

      {/* Aviso */}
      {c.aviso && (
        <div
          className="mb-4 rounded-lg p-2.5 text-xs"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#FCD34D",
            fontFamily: FONT_UI,
          }}
        >
          ⚠ {c.aviso}
        </div>
      )}

      {/* Fases do ciclo */}
      {c.faseCiclo && c.faseCiclo.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {c.faseCiclo.map((f) => {
            const fase = FASES_CICLO[f];
            return (
              <span
                key={f}
                className="rounded px-2 py-0.5 text-[10px]"
                style={{
                  fontFamily: FONT_MONO,
                  color: fase.hex,
                  background: `${fase.hex}15`,
                  border: `1px solid ${fase.hex}40`,
                }}
              >
                {fase.label} {fase.dias}
              </span>
            );
          })}
        </div>
      )}

      {/* CTAs Agentes */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => onAgent("vertex", c)}
          className="group flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02]"
          style={{
            fontFamily: FONT_MONO,
            color: PALETTE.sage,
            borderColor: "rgba(122,154,122,0.4)",
            background: "rgba(122,154,122,0.06)",
          }}
        >
          <Sparkles className="h-3 w-3" /> DR.VERTEX
        </button>
        <button
          onClick={() => onAgent("nexus", c)}
          className="group flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02]"
          style={{
            fontFamily: FONT_MONO,
            color: PALETTE.lavender,
            borderColor: "rgba(136,120,170,0.4)",
            background: "rgba(136,120,170,0.06)",
          }}
        >
          <Zap className="h-3 w-3" /> DR.NEXUS
        </button>
      </div>
    </motion.article>
  );
};

// ── Página principal ─────────────────────────────────────────────────────
export default function ErgoVaultPage() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<ErgoCategoria | "todos">("todos");
  const [agentPanel, setAgentPanel] = useState<{
    agent: "vertex" | "nexus";
    compound: ErgoCompound;
  } | null>(null);

  const compostos = useMemo(
    () =>
      filtro === "todos"
        ? ERGO_COMPOUNDS
        : ERGO_COMPOUNDS.filter((c) => c.categoria === filtro),
    [filtro]
  );

  const handleAgent = (agent: "vertex" | "nexus", c: ErgoCompound) => {
    setAgentPanel({ agent, compound: c });
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: `radial-gradient(ellipse at top, rgba(196,84,106,0.08) 0%, ${PALETTE.obsidian} 50%)`,
        color: PALETTE.cream,
        fontFamily: FONT_UI,
      }}
    >
      {/* Fonts loader */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600&family=Share+Tech+Mono&display=swap"
      />

      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Topbar */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{
          borderColor: "rgba(196,84,106,0.15)",
          background: "rgba(5,5,10,0.85)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-70 transition-opacity hover:opacity-100"
            style={{ fontFamily: FONT_MONO, color: PALETTE.cream }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>

          <div className="flex items-center gap-2">
            <span
              className="text-base"
              style={{ fontFamily: FONT_DISPLAY, color: PALETTE.cream, letterSpacing: "0.05em" }}
            >
              ERGO <span style={{ color: PALETTE.rose }}>VAULT</span>
            </span>
            <span
              className="hidden text-[10px] opacity-60 sm:inline"
              style={{ fontFamily: FONT_MONO }}
            >
              · nutriON
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ergo-diary")}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition hover:scale-[1.03]"
              style={{
                fontFamily: FONT_MONO,
                color: PALETTE.rose,
                borderColor: "rgba(196,84,106,0.4)",
                background: "rgba(196,84,106,0.06)",
              }}
            >
              <BookOpen className="h-3 w-3" /> Diários
            </button>
            <span
              className="hidden items-center gap-1 text-[10px] uppercase tracking-[0.2em] md:flex"
              style={{ fontFamily: FONT_MONO, color: PALETTE.sage }}
            >
              <Dot className="h-4 w-4 animate-pulse" style={{ color: PALETTE.sage }} />
              VERTEX
            </span>
            <span
              className="hidden items-center gap-1 text-[10px] uppercase tracking-[0.2em] md:flex"
              style={{ fontFamily: FONT_MONO, color: PALETTE.lavender }}
            >
              <Dot className="h-4 w-4 animate-pulse" style={{ color: PALETTE.lavender }} />
              NEXUS
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <div
              className="mb-5 inline-block rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
              style={{
                fontFamily: FONT_MONO,
                color: PALETTE.rose,
                borderColor: "rgba(196,84,106,0.3)",
                background: "rgba(196,84,106,0.06)",
              }}
            >
              ♀ Enciclopédia Feminina · DR.VERTEX + DR.NEXUS
            </div>

            <h1
              className="mb-6 text-4xl leading-[1.05] md:text-6xl lg:text-7xl"
              style={{
                fontFamily: FONT_DISPLAY,
                color: PALETTE.cream,
                fontWeight: 400,
              }}
            >
              A Ciência Completa do{" "}
              <span style={{ color: PALETTE.rose, fontStyle: "italic" }}>
                Corpo Feminino
              </span>
            </h1>

            <p
              className="mb-8 max-w-xl text-base md:text-lg"
              style={{ color: "rgba(237,230,218,0.7)", fontFamily: FONT_UI }}
            >
              Transformação é sistema. O comportamento vem antes do alimento — e a ciência feminina vem antes da prescrição.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#enciclopedia"
                className="rounded-full px-6 py-3 text-xs uppercase tracking-[0.25em] transition-all hover:scale-105"
                style={{
                  fontFamily: FONT_MONO,
                  background: PALETTE.rose,
                  color: PALETTE.obsidian,
                  fontWeight: 600,
                }}
              >
                Explorar Enciclopédia
              </a>
              <a
                href="#protocolo"
                className="rounded-full border px-6 py-3 text-xs uppercase tracking-[0.25em] transition-all hover:bg-white/5"
                style={{
                  fontFamily: FONT_MONO,
                  color: PALETTE.cream,
                  borderColor: "rgba(237,230,218,0.3)",
                }}
              >
                Protocolo Cíclico
              </a>
            </div>
          </div>

          {/* Visual orbital ♀ */}
          <div className="relative hidden h-[360px] items-center justify-center md:flex">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
              className="absolute inset-0 rounded-full border opacity-20"
              style={{ borderColor: PALETTE.rose }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 90, ease: "linear", repeat: Infinity }}
              className="absolute inset-8 rounded-full border opacity-15"
              style={{ borderColor: PALETTE.gold }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
              className="absolute inset-16 rounded-full border opacity-10"
              style={{ borderColor: PALETTE.lavender }}
            />
            <div
              className="text-[180px] leading-none"
              style={{
                fontFamily: FONT_DISPLAY,
                color: PALETTE.rose,
                textShadow: `0 0 60px ${PALETTE.rose}80`,
              }}
            >
              ♀
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="relative z-10 border-y"
        style={{ borderColor: "rgba(196,84,106,0.12)", background: "rgba(196,84,106,0.03)" }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {[
            { v: `${ERGO_COMPOUNDS.length}+`, l: "Compostos" },
            { v: ERGO_COMPOUNDS.filter((c) => c.categoria === "peptideo").length, l: "Peptídeos" },
            { v: "4", l: "Fases Cíclicas" },
            { v: "2", l: "Agentes" },
          ].map((s) => (
            <div key={s.l} className="px-6 py-8 text-center">
              <div
                className="mb-2 text-4xl md:text-5xl"
                style={{ fontFamily: FONT_IMPACT, color: PALETTE.rose, letterSpacing: "0.05em" }}
              >
                {s.v}
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.3em] opacity-70"
                style={{ fontFamily: FONT_MONO }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enciclopédia */}
      <section id="enciclopedia" className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 text-center">
          <div
            className="mb-3 text-[10px] uppercase tracking-[0.4em] opacity-60"
            style={{ fontFamily: FONT_MONO, color: PALETTE.rose }}
          >
            01 · Enciclopédia
          </div>
          <h2
            className="mb-2 text-4xl md:text-5xl"
            style={{ fontFamily: FONT_DISPLAY, color: PALETTE.cream }}
          >
            Compostos Femininos
          </h2>
          <p className="opacity-70">Filtre por categoria. Cada card abre os agentes especialistas.</p>
        </div>

        {/* Filtros */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {ERGO_CATEGORIAS.map((cat) => {
            const active = filtro === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFiltro(cat.id)}
                className="rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all"
                style={{
                  fontFamily: FONT_MONO,
                  background: active ? PALETTE.rose : "transparent",
                  color: active ? PALETTE.obsidian : PALETTE.cream,
                  borderColor: active ? PALETTE.rose : "rgba(237,230,218,0.2)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {compostos.map((c) => (
            <CompoundCard key={c.id} c={c} onAgent={handleAgent} />
          ))}
        </div>
      </section>

      {/* Protocolo Cíclico (preview) */}
      <section
        id="protocolo"
        className="relative z-10 mx-auto max-w-7xl px-4 py-20"
      >
        <div className="mb-10 text-center">
          <div
            className="mb-3 text-[10px] uppercase tracking-[0.4em] opacity-60"
            style={{ fontFamily: FONT_MONO, color: PALETTE.rose }}
          >
            02 · Protocolo Cíclico
          </div>
          <h2
            className="mb-2 text-4xl md:text-5xl"
            style={{ fontFamily: FONT_DISPLAY, color: PALETTE.cream }}
          >
            As 4 Fases do Ciclo
          </h2>
          <p className="opacity-70">Compostos recomendados por fase hormonal.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(FASES_CICLO) as Array<keyof typeof FASES_CICLO>).map((key) => {
            const f = FASES_CICLO[key];
            const compostosFase = ERGO_COMPOUNDS.filter((c) =>
              c.faseCiclo?.includes(key)
            ).slice(0, 5);
            return (
              <div
                key={key}
                className="rounded-2xl border p-5"
                style={{
                  borderColor: `${f.hex}40`,
                  background: `linear-gradient(180deg, ${f.hex}0A 0%, rgba(5,5,10,0.6) 100%)`,
                  boxShadow: `0 0 30px ${f.hex}10`,
                }}
              >
                <div
                  className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                  style={{ fontFamily: FONT_MONO, color: f.hex }}
                >
                  {f.dias}
                </div>
                <h3
                  className="mb-4 text-2xl"
                  style={{ fontFamily: FONT_DISPLAY, color: PALETTE.cream }}
                >
                  {f.label}
                </h3>
                <ul className="space-y-1.5 text-sm" style={{ fontFamily: FONT_UI }}>
                  {compostosFase.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-start gap-2 opacity-80"
                    >
                      <span style={{ color: f.hex }}>✦</span>
                      <span>{c.nome}</span>
                    </li>
                  ))}
                  {compostosFase.length === 0 && (
                    <li className="opacity-50">Em breve</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
        <div
          className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-6"
          style={{ fontFamily: FONT_MONO, color: PALETTE.rose }}
        >
          Manifesto nutriON
        </div>
        <blockquote
          className="text-2xl leading-relaxed md:text-4xl"
          style={{ fontFamily: FONT_DISPLAY, color: PALETTE.cream, fontStyle: "italic" }}
        >
          "O corpo feminino não é um corpo masculino com 30% menos. É outra
          fisiologia. Outra farmacologia. Outra ciência."
        </blockquote>
        <div
          className="mt-6 text-xs uppercase tracking-[0.3em] opacity-60"
          style={{ fontFamily: FONT_MONO }}
        >
          Diogo Mello · nutriON
        </div>
      </section>

      {/* Disclaimer */}
      <footer
        className="relative z-10 border-t px-4 py-10 text-center text-xs leading-relaxed opacity-60"
        style={{
          borderColor: "rgba(196,84,106,0.12)",
          fontFamily: FONT_UI,
          color: PALETTE.cream,
        }}
      >
        <div className="mx-auto max-w-3xl">
          ⚠ Conteúdo de natureza educacional e clínica. Não substitui prescrição
          médica. O uso de ergogênicos farmacológicos, peptídeos e esteroides
          anabolizantes sem acompanhamento profissional é ilegal e
          potencialmente perigoso. Compostos com risco de virilização contêm
          efeitos IRREVERSÍVEIS. Consulte sempre seu médico endocrinologista.
        </div>
      </footer>

      {/* Painel dos agentes DR.VERTEX / DR.NEXUS */}
      <ErgoAgentPanel
        isOpen={!!agentPanel}
        onClose={() => setAgentPanel(null)}
        agent={agentPanel?.agent ?? "vertex"}
        compoundName={agentPanel?.compound.nome ?? ""}
        quickActions={
          agentPanel
            ? agentPanel.agent === "vertex"
              ? agentPanel.compound.quickActionsVertex
              : agentPanel.compound.quickActionsNexus
            : []
        }
      />
    </div>
  );
}
