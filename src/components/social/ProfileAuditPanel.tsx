import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ChevronDown, Copy, FileDown, Loader2, Pin, Search, Sparkles, Star, Type, Link2, Target,
} from "lucide-react";
import { ACCENT, ACCENT2, callSocialAI, copyText, Section } from "./socialUi";

const BIO_LIMIT = 150;
const NAME_LIMIT = 30;

type ScoreItem = { key: string; label: string; score: number; verdict?: string; findings?: string[]; fix?: string };
type BioVersion = { id?: string; style?: string; bio: string; why?: string };

type AuditResult = {
  overall_score?: number;
  summary?: string;
  scores?: ScoreItem[];
  bio_versions?: BioVersion[];
  name_analysis?: {
    current?: string;
    score?: number;
    keyword_found?: boolean;
    issues?: string[];
    suggestions?: { name: string; why?: string }[];
  };
  category_suggestion?: { recommended?: string; alternatives?: string[]; why?: string };
  link_strategy?: { verdict?: string; recommended?: string; why?: string };
  highlights?: {
    current_estimate?: number;
    essentials?: { name: string; purpose?: string; capa?: string; first_stories?: string[] }[];
    missing?: string[];
  };
  pinned?: { slot?: number; role?: string; why?: string; what_to_pin?: string; hook?: string }[];
  quick_wins?: string[];
};

const band = (n: number) =>
  n >= 80
    ? { color: "#00FF88", label: "Excelente" }
    : n >= 60
      ? { color: ACCENT2, label: "Bom" }
      : n >= 40
        ? { color: "#FFC53D", label: "Precisa melhorar" }
        : { color: "#FF5C5C", label: "Crítico" };

const ScoreBar = ({ item }: { item: ScoreItem }) => {
  const value = Math.max(0, Math.min(100, Number(item.score) || 0));
  const b = band(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{item.label}</span>
        <span className="font-mono" style={{ color: b.color }}>
          {value}/100 · {b.label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: b.color }} />
      </div>
    </div>
  );
};

const ScoreRing = ({ value }: { value: number }) => {
  const v = Math.max(0, Math.min(100, value));
  const b = band(v);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-[136px] h-[136px] shrink-0">
      <svg viewBox="0 0 136 136" className="w-full h-full -rotate-90">
        <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle
          cx="68" cy="68" r={r} fill="none" stroke={b.color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono leading-none" style={{ color: b.color }}>{v}</span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mt-1">{b.label}</span>
      </div>
    </div>
  );
};

const Collapsible = ({
  title, icon, defaultOpen, children,
}: { title: string; icon?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-xl border" style={{ borderColor: `${ACCENT}22`, background: "rgba(255,255,255,0.02)" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

const CharCounter = ({ value, limit }: { value: number; limit: number }) => (
  <span className="font-mono text-[11px]" style={{ color: value <= limit ? "#00FF88" : "#FF5C5C" }}>
    {value}/{limit} {value <= limit ? "✓" : "✕"}
  </span>
);

const BioCard = ({ version, index }: { version: BioVersion; index: number }) => {
  const [text, setText] = useState(version.bio || "");
  const [editing, setEditing] = useState(false);
  useEffect(() => setText(version.bio || ""), [version.bio]);

  return (
    <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: `${ACCENT}22` }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.16em] font-mono text-muted-foreground">
          Versão {version.id || index + 1} · {version.style || "Bio"}
        </p>
        <CharCounter value={text.length} limit={BIO_LIMIT} />
      </div>

      {editing ? (
        <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className="text-sm" />
      ) : (
        <pre className="text-sm whitespace-pre-wrap font-sans leading-snug">{text}</pre>
      )}

      {version.why && <p className="text-[11px] text-muted-foreground">💡 {version.why}</p>}

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => copyText(text)}>
          <Copy className="w-3 h-3" /> Copiar
        </Button>
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" onClick={() => setEditing((e) => !e)}>
          <Type className="w-3 h-3" /> {editing ? "Concluir" : "Editar"}
        </Button>
      </div>
    </div>
  );
};

const CopyLine = ({ text }: { text: string }) => (
  <button
    type="button"
    onClick={() => copyText(text)}
    className="text-muted-foreground hover:text-foreground shrink-0"
    aria-label="Copiar sugestão"
  >
    <Copy className="w-3 h-3" />
  </button>
);

type Props = {
  handle: string;
  bio: string;
  profileName?: string;
  ctx?: Record<string, unknown>;
  onScore?: (score: number) => void;
};

const ProfileAuditPanel = ({ handle, bio, profileName, ctx, onScore }: Props) => {
  const [name, setName] = useState(profileName || "");
  const [category, setCategory] = useState("");
  const [link, setLink] = useState("");
  const [highlights, setHighlights] = useState("");
  const [pinnedPosts, setPinnedPosts] = useState("");
  const [bioText, setBioText] = useState(bio || "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => setBioText(bio || ""), [bio]);
  useEffect(() => { if (profileName) setName(profileName); }, [profileName]);

  const scores = useMemo(() => (result?.scores || []).filter((s) => s && s.label), [result]);

  const run = async () => {
    if (!bioText.trim() && !name.trim()) {
      toast.error("Informe ao menos a bio ou o nome do perfil.");
      return;
    }
    setBusy(true);
    try {
      const r: AuditResult = await callSocialAI({
        mode: "profile_audit",
        handle,
        bio: bioText,
        profile_name: name,
        category,
        link,
        highlights,
        pinnedPosts,
        ...(ctx || {}),
      });
      setResult(r);
      if (typeof r?.overall_score === "number") onScore?.(r.overall_score);
      toast.success("Análise concluída");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar análise");
    } finally {
      setBusy(false);
    }
  };

  const exportPdf = async () => {
    if (!result) return;
    const { default: JsPDF } = await import("jspdf");
    const doc = new JsPDF({ unit: "pt", format: "a4" });
    const M = 44;
    let y = 56;
    const line = (text: string, size = 10, bold = false) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.splitTextToSize(text, 515 - M).forEach((l: string) => {
        if (y > 780) { doc.addPage(); y = 56; }
        doc.text(l, M, y);
        y += size + 4;
      });
    };

    line("SOCIAL ON — Auditoria de perfil", 18, true);
    line(`@${handle.replace("@", "") || "—"}  ·  ${new Date().toLocaleDateString("pt-BR")}`, 10);
    y += 8;
    line(`Score geral: ${result.overall_score ?? "—"}/100`, 14, true);
    if (result.summary) line(result.summary);
    y += 6;

    line("Scores por item", 13, true);
    scores.forEach((s) => line(`${s.label}: ${s.score}/100 — ${s.verdict || ""}`));
    y += 6;

    line("Sugestões de bio (máx. 150 caracteres)", 13, true);
    (result.bio_versions || []).forEach((v, i) => {
      line(`Versão ${v.id || i + 1} · ${v.style || ""} (${(v.bio || "").length}/150)`, 11, true);
      line(v.bio || "");
    });
    y += 6;

    if (result.name_analysis) {
      line("Nome do perfil (SEO)", 13, true);
      line(`Score: ${result.name_analysis.score ?? "—"}/100`);
      (result.name_analysis.suggestions || []).forEach((s) => line(`• ${s.name} — ${s.why || ""}`));
      y += 6;
    }

    if (result.highlights?.essentials?.length) {
      line("Destaques essenciais", 13, true);
      result.highlights.essentials.forEach((h) => line(`• ${h.name}: ${h.purpose || ""}`));
      y += 6;
    }

    if (result.pinned?.length) {
      line("Posts fixados", 13, true);
      result.pinned.forEach((p) => line(`• Pin ${p.slot}: ${p.role} — ${p.what_to_pin || ""}`));
      y += 6;
    }

    if (result.quick_wins?.length) {
      line("Ações imediatas", 13, true);
      result.quick_wins.forEach((q, i) => line(`${i + 1}. ${q}`));
    }

    doc.save(`auditoria-perfil-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Section title="🔍 Auditoria completa do perfil">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Nome do perfil (não é o @)
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Diogo Mello | Coach Fitness" />
          <div className="flex justify-end"><CharCounter value={name.length} limit={NAME_LIMIT} /></div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Categoria do perfil</label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Criador de conteúdo digital" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Bio atual</label>
          <CharCounter value={bioText.length} limit={BIO_LIMIT} />
        </div>
        <Textarea rows={4} value={bioText} onChange={(e) => setBioText(e.target.value)} placeholder="Cole sua bio atual" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Link da bio</label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="nutrion.app.br ou linktr.ee/..." />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Destaques que você já tem</label>
          <Input value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Ex: Resultados, Treinos, Dia a dia" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Posts fixados hoje (opcional)</label>
        <Input value={pinnedPosts} onChange={(e) => setPinnedPosts(e.target.value)} placeholder="Ex: reel de transformação, carrossel do método" />
      </div>

      <Button onClick={run} disabled={busy} className="gap-2" style={{ background: ACCENT }}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {busy ? "Analisando perfil…" : "Gerar análise completa"}
      </Button>

      {result && (
        <div className="space-y-3 pt-2">
          <div
            className="rounded-xl border p-4 flex flex-col sm:flex-row items-center gap-4"
            style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}
          >
            <ScoreRing value={Number(result.overall_score) || 0} />
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">Score geral do perfil</p>
              {result.summary && <p className="text-sm">{result.summary}</p>}
              <div className="space-y-2 pt-1">
                {scores.map((s) => <ScoreBar key={s.key || s.label} item={s} />)}
              </div>
            </div>
          </div>

          <Collapsible title="Bio — 3 versões prontas" icon={<Sparkles className="w-4 h-4" style={{ color: ACCENT }} />} defaultOpen>
            <p className="text-[11px] text-muted-foreground">Limite do Instagram: 150 caracteres. Edite à vontade — o contador atualiza ao vivo.</p>
            {(result.bio_versions || []).map((v, i) => <BioCard key={v.id || i} version={v} index={i} />)}
          </Collapsible>

          {result.name_analysis && (
            <Collapsible title="Nome do perfil — SEO" icon={<Type className="w-4 h-4" style={{ color: ACCENT2 }} />}>
              <ScoreBar item={{ key: "nome", label: "SEO do nome", score: Number(result.name_analysis.score) || 0 }} />
              <p className="text-xs text-muted-foreground">
                Palavra-chave pesquisável: {result.name_analysis.keyword_found ? "detectada ✓" : "ausente ✕"}
              </p>
              {(result.name_analysis.issues || []).map((t, i) => <p key={i} className="text-sm">→ {t}</p>)}
              <div className="space-y-2">
                {(result.name_analysis.suggestions || []).map((s, i) => (
                  <div key={i} className="rounded-lg border p-2.5 space-y-1" style={{ borderColor: `${ACCENT}22` }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{s.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <CharCounter value={(s.name || "").length} limit={NAME_LIMIT} />
                        <CopyLine text={s.name} />
                      </div>
                    </div>
                    {s.why && <p className="text-[11px] text-muted-foreground">{s.why}</p>}
                  </div>
                ))}
              </div>
            </Collapsible>
          )}

          {(result.category_suggestion || result.link_strategy) && (
            <Collapsible title="Categoria, CTA e link" icon={<Link2 className="w-4 h-4" style={{ color: ACCENT2 }} />}>
              {result.category_suggestion && (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Categoria recomendada</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{result.category_suggestion.recommended}</p>
                    <CopyLine text={result.category_suggestion.recommended || ""} />
                  </div>
                  {result.category_suggestion.why && <p className="text-xs text-muted-foreground">{result.category_suggestion.why}</p>}
                  {!!result.category_suggestion.alternatives?.length && (
                    <p className="text-xs text-muted-foreground">Alternativas: {result.category_suggestion.alternatives.join(" · ")}</p>
                  )}
                </div>
              )}
              {result.link_strategy && (
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Link da bio</p>
                  <p className="text-sm">{result.link_strategy.verdict}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: ACCENT2 }}>{result.link_strategy.recommended}</p>
                    <CopyLine text={result.link_strategy.recommended || ""} />
                  </div>
                  {result.link_strategy.why && <p className="text-xs text-muted-foreground">{result.link_strategy.why}</p>}
                </div>
              )}
            </Collapsible>
          )}

          {result.highlights && (
            <Collapsible title="Destaques (Highlights)" icon={<Star className="w-4 h-4" style={{ color: "#FFC53D" }} />}>
              <p className="text-xs text-muted-foreground">
                Destaques detectados: <b>{result.highlights.current_estimate ?? 0}</b> · essenciais para fitness: 5
              </p>
              {!!result.highlights.missing?.length && (
                <p className="text-xs" style={{ color: "#FFC53D" }}>Faltando: {result.highlights.missing.join(" · ")}</p>
              )}
              <div className="space-y-2">
                {(result.highlights.essentials || []).map((h, i) => (
                  <div key={i} className="rounded-lg border p-2.5 space-y-1" style={{ borderColor: `${ACCENT}22` }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{h.name}</p>
                      <CopyLine text={`${h.name}\n${h.purpose || ""}\n${(h.first_stories || []).join("\n")}`} />
                    </div>
                    {h.purpose && <p className="text-xs text-muted-foreground">{h.purpose}</p>}
                    {h.capa && <p className="text-[11px] text-muted-foreground">🎨 Capa: {h.capa}</p>}
                    {(h.first_stories || []).map((s, j) => <p key={j} className="text-xs">→ {s}</p>)}
                  </div>
                ))}
              </div>
            </Collapsible>
          )}

          {!!result.pinned?.length && (
            <Collapsible title="Posts fixados (3 pins)" icon={<Pin className="w-4 h-4" style={{ color: ACCENT }} />}>
              {result.pinned.map((p, i) => (
                <div key={i} className="rounded-lg border p-2.5 space-y-1" style={{ borderColor: `${ACCENT}22` }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">📌 Pin {p.slot ?? i + 1} · {p.role}</p>
                    <CopyLine text={`Pin ${p.slot ?? i + 1} — ${p.role}\n${p.what_to_pin || ""}\nHook: ${p.hook || ""}`} />
                  </div>
                  {p.what_to_pin && <p className="text-xs">{p.what_to_pin}</p>}
                  {p.hook && <p className="text-xs" style={{ color: ACCENT2 }}>Hook: {p.hook}</p>}
                  {p.why && <p className="text-[11px] text-muted-foreground">Por quê: {p.why}</p>}
                </div>
              ))}
            </Collapsible>
          )}

          {!!result.quick_wins?.length && (
            <Collapsible title="Ações imediatas" icon={<Target className="w-4 h-4" style={{ color: "#00FF88" }} />} defaultOpen>
              {result.quick_wins.map((q, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <p className="text-sm">{i + 1}. {q}</p>
                  <CopyLine text={q} />
                </div>
              ))}
            </Collapsible>
          )}

          <Button variant="outline" onClick={exportPdf} className="gap-2">
            <FileDown className="w-4 h-4" /> Gerar relatório PDF
          </Button>
        </div>
      )}
    </Section>
  );
};

export default ProfileAuditPanel;
