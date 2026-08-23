import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Search } from "lucide-react";
import { Section, Pill, copyText } from "./socialUi";
import { HOOK_BANK_30, DAILY_PILLARS, type DailyPillarId } from "@/data/dailyContentSystem";
import { HOOK_LIBRARY } from "@/data/socialHooks";

type Row = { text: string; category: string; pillar?: DailyPillarId };

const LEGACY: Row[] = HOOK_LIBRARY.flatMap((g) => g.hooks.map((h) => ({ text: h, category: g.category })));

export default function HookBankPanel({ onBack, onUse }: { onBack?: () => void; onUse?: (h: string) => void }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");

  const all: Row[] = useMemo(() => [...HOOK_BANK_30, ...LEGACY], []);
  const categories = useMemo(() => Array.from(new Set(all.map((h) => h.category))), [all]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all.filter(
      (h) => (!cat || h.category === cat) && (!term || h.text.toLowerCase().includes(term) || h.category.toLowerCase().includes(term)),
    );
  }, [all, q, cat]);

  return (
    <div className="space-y-4">
      {onBack && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">← Modos</Button>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#FF4D6D" }}>🪝 Banco de Hooks</p>
            <p className="text-[11px] text-muted-foreground">{all.length} hooks prontos, por pilar e categoria</p>
          </div>
        </div>
      )}

      <Section title="Buscar">
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar hook..." className="pl-8 text-sm" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Pill label="Todos" active={!cat} onClick={() => setCat("")} />
            {categories.map((c) => (
              <Pill key={c} label={c} active={cat === c} onClick={() => setCat(cat === c ? "" : c)} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DAILY_PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setQ("")}
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{ borderColor: `${p.color}44`, color: p.color }}
                title={p.focus}
              >
                {p.emoji} {p.weekday}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title={`Hooks (${list.length})`}>
        <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
          {list.map((h, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-white/8 p-2.5">
              <div className="flex-1">
                <p className="text-xs leading-snug">{h.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{h.category}</p>
              </div>
              {onUse && (
                <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => onUse(h.text)}>usar</Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyText(h.text)}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {!list.length && <p className="text-xs text-muted-foreground">Nenhum hook encontrado.</p>}
        </div>
      </Section>
    </div>
  );
}
