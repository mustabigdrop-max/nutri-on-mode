import { useState } from "react";

const CYAN = "#00D4FF";
const GOLD = "#B8922A";
const PURPLE = "#A855F7";
const GREEN = "#22C55E";
const BG = "#020205";
const SURFACE = "#0A0A0F";
const SURFACE2 = "#111118";
const MUTED = "#555566";
const TEXT = "#E8E8F0";

type Tool = { id: string; name: string; icon: string; desc: string; hot?: boolean; isNew?: boolean };
type HubSection = { id: string; label: string; accent: string; tools: Tool[] };

const SECTIONS: HubSection[] = [
  {
    id: "quick",
    label: "RÁPIDO",
    accent: CYAN,
    tools: [
      { id: "um_toque", name: "1 Toque", icon: "✦", desc: "Upload → 4 versões prontas", hot: true },
      { id: "post_pronto", name: "Post Pronto", icon: "📋", desc: "Templates editáveis" },
      { id: "editor", name: "Editor", icon: "✏️", desc: "Texto + mídia em tempo real" },
      { id: "criar", name: "Criar", icon: "⚙️", desc: "Do zero, com IA guiada" },
    ],
  },
  {
    id: "strategy",
    label: "ESTRATÉGIA",
    accent: PURPLE,
    tools: [
      { id: "intelligence", name: "Intelligence", icon: "✦", desc: "Algoritmo 2026 · 4 sinais críticos", hot: true },
      { id: "vitrine", name: "Vitrine", icon: "🏗️", desc: "Grid · Bio · Fixados", hot: true },
      { id: "prism", name: "PRISM", icon: "◈", desc: "8 modos de inteligência de conteúdo" },
      { id: "estrategista", name: "Estrategista", icon: "🧠", desc: "IA analisa e direciona" },
      { id: "pro", name: "Social ON Pro", icon: "✨", desc: "Modo avançado completo" },
      { id: "auditoria", name: "Auditoria", icon: "🔍", desc: "Diagnóstico do perfil" },
      { id: "calendario", name: "Calendário", icon: "📅", desc: "Planejamento visual" },
      { id: "metricas", name: "Métricas", icon: "📊", desc: "KPIs e performance" },
    ],
  },
  {
    id: "growth",
    label: "CRESCIMENTO",
    accent: GREEN,
    tools: [
      { id: "viral", name: "Viral", icon: "🔥", desc: "Formatos que escalam" },
      { id: "viral_lab", name: "Viral Lab", icon: "🧪", desc: "Teste A/B de criativos" },
      { id: "dna", name: "DNA", icon: "🧬", desc: "Identidade de marca" },
      { id: "brand_score", name: "Brand Score", icon: "🏷️", desc: "Nota da sua marca" },
      { id: "ideias", name: "Ideias", icon: "💡", desc: "Gerador infinito" },
      { id: "repurposer", name: "Repurposer", icon: "🔄", desc: "1 conteúdo → 10 formatos", isNew: true },
      { id: "dm", name: "DM & Objeções", icon: "💬", desc: "Scripts de conversão" },
      { id: "prova", name: "Prova Social", icon: "⭐", desc: "Depoimentos formatados" },
      { id: "esteira", name: "Esteira", icon: "🏗️", desc: "Funil de conteúdo" },
    ],
  },
  {
    id: "learn",
    label: "APRENDER",
    accent: GOLD,
    tools: [
      { id: "academia", name: "Academia", icon: "📚", desc: "Conteúdo educativo" },
      { id: "playbook", name: "Playbook", icon: "📖", desc: "Guias passo a passo" },
      { id: "autoridade", name: "Autoridade", icon: "🏛️", desc: "Posicionamento expert" },
      { id: "ciencia", name: "Ciência", icon: "🔬", desc: "Embasamento científico" },
    ],
  },
];

const fontTitle = "'Rajdhani', 'Segoe UI', sans-serif";
const fontMono = "'Space Mono', 'Courier New', monospace";

function ToolCard({ tool, accent, onClick }: { tool: Tool; accent: string; onClick: (t: Tool) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(tool)}
      style={{
        position: "relative",
        background: hovered ? `${accent}08` : SURFACE2,
        border: `1px solid ${hovered ? `${accent}40` : "#ffffff08"}`,
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: 12,
        overflow: "hidden",
        minWidth: 0,
        borderRadius: 10,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: hovered ? accent : "transparent",
          transition: "background 0.2s",
        }}
      />
      <span style={{ fontSize: 18, flexShrink: 0 }}>{tool.icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontFamily: fontTitle, fontSize: 14, fontWeight: 700, color: TEXT }}>{tool.name}</span>
          {tool.hot && (
            <span style={{ fontFamily: fontMono, fontSize: 8, color: BG, background: CYAN, padding: "1px 5px", fontWeight: 700 }}>
              HERO
            </span>
          )}
          {tool.isNew && (
            <span style={{ fontFamily: fontMono, fontSize: 8, color: GREEN, border: `1px solid ${GREEN}50`, padding: "1px 5px" }}>
              NOVO
            </span>
          )}
        </span>
        <span style={{ display: "block", fontFamily: fontMono, fontSize: 10, color: MUTED, marginTop: 2 }}>{tool.desc}</span>
      </span>
      <span style={{ color: hovered ? accent : "#ffffff15", fontSize: 14, transition: "color 0.2s" }}>→</span>
    </button>
  );
}

export default function SocialOnHub({
  handle,
  stats,
  onOpenTool,
}: {
  handle?: string;
  stats: { label: string; value: string; color: string }[];
  onOpenTool: (tabId: string) => void;
}) {
  return (
    <div style={{ background: BG, minHeight: "100%", margin: "-16px", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>📱</span>
          <span style={{ fontFamily: fontTitle, fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: 1 }}>
            SOCIAL ON
          </span>
        </div>
        {handle && (
          <span style={{ fontFamily: fontMono, fontSize: 11, color: CYAN }}>@{handle.replace("@", "")}</span>
        )}
      </div>

      {/* Hero: 1 Toque CTA */}
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => onOpenTool("um_toque")}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${CYAN}10, ${CYAN}05)`,
            border: `1px solid ${CYAN}25`,
            borderRadius: 12,
            padding: "20px 24px",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `${CYAN}15`,
              border: `1px solid ${CYAN}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: CYAN,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ✦
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: fontTitle, fontSize: 18, fontWeight: 700, color: TEXT }}>
              1 TOQUE
            </span>
            <span style={{ display: "block", fontFamily: fontMono, fontSize: 11, color: MUTED, marginTop: 2 }}>
              Sobe a mídia → sai com 4 versões prontas pra postar
            </span>
          </span>
          <span style={{ color: CYAN, fontSize: 18 }}>→</span>
        </button>
      </div>

      {/* Quick Stats Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "#ffffff08",
          border: "1px solid #ffffff08",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ background: SURFACE, padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontFamily: fontTitle, fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontFamily: fontMono, fontSize: 8, color: MUTED, letterSpacing: 1, margin: "2px 0 0" }}>
              {s.label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      {/* Tool Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {SECTIONS.map((section) => (
          <div key={section.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: "1px solid #ffffff08",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: section.accent,
                  boxShadow: `0 0 8px ${section.accent}60`,
                }}
              />
              <span style={{ fontFamily: fontMono, fontSize: 10, color: section.accent, letterSpacing: 2 }}>
                {section.label}
              </span>
              <span style={{ fontFamily: fontMono, fontSize: 9, color: MUTED }}>{section.tools.length}</span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 8,
              }}
            >
              {section.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} accent={section.accent} onClick={(t) => onOpenTool(t.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 28, paddingTop: 16, borderTop: "1px solid #ffffff05" }}>
        <p style={{ fontFamily: fontMono, fontSize: 9, color: MUTED, letterSpacing: 2, margin: 0 }}>
          SOCIAL ON · NUTRION
        </p>
      </div>
    </div>
  );
}
