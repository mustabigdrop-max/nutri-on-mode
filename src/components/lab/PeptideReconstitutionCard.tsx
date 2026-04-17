import { Beaker, AlertTriangle, BookOpen, Pill, Droplet } from "lucide-react";
import { getReconstitution } from "@/data/peptideReconstitution";

interface Props {
  peptideId: string;
}

export function PeptideReconstitutionCard({ peptideId }: Props) {
  const r = getReconstitution(peptideId);
  if (!r) return null;

  // Casos especiais: oral, tópico ou pronto para uso
  if (r.oral || r.topical || r.ready) {
    const Icon = r.oral ? Pill : r.topical ? Droplet : Beaker;
    const label = r.oral ? "Via Oral" : r.topical ? "Uso Tópico" : "Pronto para Uso";
    return (
      <div className="space-y-3 mt-4 border border-primary/30 bg-primary/5 rounded-lg p-4">
        <div className="flex items-center gap-2 text-base font-bold text-primary">
          <Icon className="w-5 h-5" />
          Diluição & Aplicação — {label}
        </div>
        <p className="text-sm text-foreground/80">{r.concentration}</p>
        {r.note && <p className="text-xs text-muted-foreground italic">{r.note}</p>}
        <RefList refs={r.references} />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 border border-primary/30 bg-primary/5 rounded-lg p-4">
      <div className="flex items-center gap-2 text-base font-bold text-primary">
        <Beaker className="w-5 h-5" />
        Diluição com Referências Científicas
      </div>

      {/* Grid de parâmetros */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Frasco" value={`${r.vialMg} mg`} />
        <Field label="Água bacteriostática" value={`${r.bacWaterMl} mL`} />
        <Field label="Dose terapêutica" value={r.doseMcg} />
        <Field label="Volume na seringa 100U" value={r.unitsPer100u} />
        <Field label="Concentração final" value={r.concentration} full />
      </div>

      {/* Correção de diluição */}
      {r.bacWaterCurrentMl && r.bacWaterCurrentMl !== r.bacWaterMl && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-200">
            <strong>Correção sugerida:</strong> diluição atual de {r.bacWaterCurrentMl}mL → recomendado{" "}
            <strong>{r.bacWaterMl}mL</strong> para maior precisão.
          </p>
        </div>
      )}

      {/* Nota prática */}
      {r.note && (
        <div className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3">
          {r.note}
        </div>
      )}

      {/* Aviso de segurança */}
      {r.warning && (
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{r.warning}</p>
        </div>
      )}

      {/* Referências científicas */}
      <RefList refs={r.references} />

      {/* Fórmula */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-primary/80 hover:text-primary">
          📐 Fórmula utilizada
        </summary>
        <div className="mt-2 p-3 bg-background/50 rounded font-mono text-[11px] leading-relaxed">
          Água (mL) = (mg do frasco × 1000) / (dose em mcg × 20)
          <br />
          <span className="text-muted-foreground/70">
            → resulta em ~20U por aplicação (ponto ideal de precisão na seringa 100U)
          </span>
        </div>
      </details>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`bg-background/40 rounded-lg p-2 ${full ? "col-span-2" : ""}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function RefList({ refs }: { refs: { citation: string; source?: string }[] }) {
  if (!refs?.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-primary/80 mb-2">
        <BookOpen className="w-3.5 h-3.5" />
        Referências científicas
      </div>
      <ul className="space-y-1.5">
        {refs.map((ref, i) => (
          <li key={i} className="text-[11px] text-muted-foreground leading-relaxed pl-3 border-l border-primary/30">
            {ref.citation}
          </li>
        ))}
      </ul>
    </div>
  );
}
