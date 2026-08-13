// APEX — Renderizador de markdown para textos gerados pelo sistema.
// Aplica estilo APEX (dourado/cyan, mono) em **bold**, *italic*, ## heading,
// listas com bullet • e `código`.
import ReactMarkdown from "react-markdown";

interface Props {
  children?: string;
  text?: string;
  className?: string;
}

export function ApexMarkdown({ children, text, className }: Props) {
  const content = (children ?? text ?? "").trim();
  if (!content) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...p }) => (
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#B8922A", marginTop: 12, marginBottom: 6 }} {...p} />
          ),
          h2: ({ node, ...p }) => (
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#B8922A", marginTop: 12, marginBottom: 6 }} {...p} />
          ),
          h3: ({ node, ...p }) => (
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#B8922A", marginTop: 10, marginBottom: 4 }} {...p} />
          ),
          strong: ({ node, ...p }) => (
            <strong style={{ fontWeight: 600, color: "#ffffff" }} {...p} />
          ),
          em: ({ node, ...p }) => (
            <em style={{ fontStyle: "italic", color: "#888" }} {...p} />
          ),
          code: ({ node, ...p }) => (
            <code
              style={{
                background: "#0d1520",
                color: "#00D4FF",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: "0.92em",
                fontFamily: "'Space Mono', monospace",
              }}
              {...p}
            />
          ),
          ul: ({ node, ...p }) => (
            <ul style={{ paddingLeft: 16, margin: "6px 0", listStyle: "none" }} {...p} />
          ),
          ol: ({ node, ...p }) => (
            <ol style={{ paddingLeft: 20, margin: "6px 0" }} {...p} />
          ),
          li: ({ node, children, ...p }) => (
            <li style={{ position: "relative", paddingLeft: 14, marginBottom: 6 }} {...p}>
              <span style={{ position: "absolute", left: 0, color: "#B8922A" }}>•</span>
              {children}
            </li>
          ),
          p: ({ node, ...p }) => (
            <p style={{ margin: "4px 0", lineHeight: 1.6 }} {...p} />
          ),
          a: ({ node, ...p }) => (
            <a style={{ color: "#00D4FF", textDecoration: "underline" }} target="_blank" rel="noreferrer" {...p} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default ApexMarkdown;
