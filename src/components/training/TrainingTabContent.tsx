/**
 * ============================================================================
 * <TrainingTabContent /> — Renderizador unificado da aba "Treino"
 * ============================================================================
 * Decide entre:
 *   - <MelloProtocolViewer /> se o payload validar contra MelloProtocolSchema
 *   - <LegacyProtocolFallback /> caso contrário (com banner + CTA Regenerar)
 *
 * NUNCA renderiza JSON cru.
 * ============================================================================
 */

import { MelloProtocolViewer } from "@/components/training/MelloProtocolViewer";
import { MelloProtocolSchema } from "@/types/melloProtocol";
import { RegenerateLegacyButton } from "@/components/training/LegacyMigrationUI";
import { AlertTriangle } from "lucide-react";

const GOLD = "#B8922A";

interface TrainingTabContentProps {
  /** Linha bruta de training_protocols ou objeto Mello direto */
  protocol: any;
}

export function TrainingTabContent({ protocol }: TrainingTabContentProps) {
  if (!protocol) {
    return (
      <p className="text-xs text-center py-8 text-zinc-500">
        Sem dados do protocolo
      </p>
    );
  }

  // Extrai payload: pode vir de DB (protocol_json), envelope (protocol.protocol)
  // ou já ser o objeto Mello bruto.
  let raw: any = protocol.protocol_json ?? protocol;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = { _unparsed: protocol.protocol_text ?? raw };
    }
  }
  if (raw && typeof raw === "object" && raw.protocol && typeof raw.protocol === "object") {
    raw = raw.protocol;
  }

  const parsed = MelloProtocolSchema.safeParse(raw);

  if (parsed.success) {
    return <MelloProtocolViewer protocol={parsed.data} />;
  }

  return (
    <LegacyProtocolFallback
      raw={raw}
      title={protocol.title || protocol.client_name || "Protocolo Legado"}
      legacyId={protocol.id}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// <LegacyProtocolFallback /> — render legível p/ protocolos fora do padrão Mello
// ─────────────────────────────────────────────────────────────────────────────

interface LegacyProtocolFallbackProps {
  raw: any;
  title: string;
  /** id em training_protocols — habilita o botão Regenerar */
  legacyId?: string;
}

export function LegacyProtocolFallback({
  raw,
  title,
  legacyId,
}: LegacyProtocolFallbackProps) {
  return (
    <div className="space-y-3">
      {/* Banner Legado */}
      <div
        className="rounded-lg p-3 flex items-start gap-3"
        style={{
          background: "rgba(184,146,42,0.08)",
          border: `1px solid ${GOLD}40`,
        }}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>
            Protocolo em formato legado
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Clique em "Regenerar no padrão Mello" para atualizar a estrutura para a versão atual.
          </p>
        </div>
        {legacyId && (
          <RegenerateLegacyButton
            legacyId={legacyId}
            protocolTitle={title}
            variant="primary"
          />
        )}
      </div>

      {/* Render legível dos blocos */}
      {typeof raw === "string" ? (
        <div className="rounded-lg p-4 bg-zinc-900 border border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-200 mb-2">{title}</h3>
          <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed">
            {raw}
          </pre>
        </div>
      ) : raw && typeof raw === "object" ? (
        <div className="space-y-2">
          {Object.entries(raw).map(([key, value]) => (
            <LegacyBlock key={key} field={key} value={value} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500">Conteúdo indisponível.</p>
      )}
    </div>
  );
}

function LegacyBlock({ field, value }: { field: string; value: any }) {
  const label = humanize(field);

  return (
    <div className="rounded-lg p-3 bg-zinc-900/60 border border-zinc-800">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
        {label}
      </h4>
      <LegacyValue value={value} />
    </div>
  );
}

function LegacyValue({ value }: { value: any }) {
  if (value === null || value === undefined || value === "") {
    return <p className="text-[11px] text-zinc-600 italic">vazio</p>;
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return (
      <p className="text-[12px] text-zinc-200 whitespace-pre-wrap leading-relaxed">
        {String(value)}
      </p>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-[11px] text-zinc-600 italic">lista vazia</p>;
    }
    return (
      <ul className="space-y-1.5">
        {value.map((item, i) => (
          <li key={i} className="text-[11px] text-zinc-300 pl-3 border-l border-zinc-700">
            {typeof item === "object" ? (
              <div className="space-y-1 pl-1">
                {Object.entries(item || {}).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-zinc-500 font-medium">{humanize(k)}:</span>
                    <span className="text-zinc-200 break-words">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="space-y-1.5">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="text-[11px]">
            <span className="text-zinc-500 font-medium">{humanize(k)}: </span>
            <span className="text-zinc-200 break-words">
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default TrainingTabContent;
