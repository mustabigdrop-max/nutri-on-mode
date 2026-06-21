/**
 * ============================================================================
 * Componentes de migração de protocolos legados → Mello v1
 * ----------------------------------------------------------------------------
 *  - <LegacyProtocolBadge />     badge "Legado"
 *  - <MelloV1Badge />            badge "Mello v1"
 *  - <RegenerateLegacyButton />  botão + modal de confirmação
 *  - <MigrationDashboard />      painel com progresso + ação em lote
 * ============================================================================
 */
import { useState } from "react";
import {
  AlertCircle,
  ArrowRightCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import {
  useRegenerateLegacy,
  useMigrationStats,
  useBatchRegenerate,
} from "@/hooks/useLegacyMigration";

const GOLD = "#B8922A";

/* ── Badges ───────────────────────────────────────────────────────────────── */

export function LegacyProtocolBadge({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm font-mono uppercase tracking-wider font-semibold bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30 ${sizeClass} ${className}`}
    >
      <AlertCircle className="w-3 h-3" />
      Legado
    </span>
  );
}

export function MelloV1Badge({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm font-mono uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30 ${sizeClass} ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      Mello v1
    </span>
  );
}

/* ── RegenerateLegacyButton ───────────────────────────────────────────────── */

export interface RegenerateLegacyButtonProps {
  legacyId: string;
  protocolTitle?: string;
  athleteName?: string;
  variant?: "primary" | "ghost";
  onSuccess?: (newId: string) => void;
}

export function RegenerateLegacyButton({
  legacyId,
  protocolTitle,
  athleteName,
  variant = "primary",
  onSuccess,
}: RegenerateLegacyButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const regenerate = useRegenerateLegacy();

  const handleConfirm = async () => {
    try {
      const result = await regenerate.mutateAsync({
        legacy_protocol_id: legacyId,
      });
      setConfirmOpen(false);
      onSuccess?.(result.new_protocol_id);
    } catch {
      /* mantém erro na mutation pra UI */
    }
  };

  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors disabled:opacity-50";
  const variantClasses =
    variant === "primary"
      ? "px-3 py-1.5 ring-1 hover:bg-amber-500/15"
      : "px-2 py-1 text-zinc-400 hover:text-amber-300";

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className={`${baseClasses} ${variantClasses}`}
        style={
          variant === "primary"
            ? { color: GOLD, borderColor: `${GOLD}55` }
            : undefined
        }
        disabled={regenerate.isPending}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Regenerar no padrão Mello
      </button>

      {confirmOpen && (
        <ConfirmModal
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
          isLoading={regenerate.isPending}
          error={regenerate.error?.message}
          protocolTitle={protocolTitle}
          athleteName={athleteName}
        />
      )}
    </>
  );
}

function ConfirmModal({
  onClose,
  onConfirm,
  isLoading,
  error,
  protocolTitle,
  athleteName,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error?: string;
  protocolTitle?: string;
  athleteName?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-zinc-950 ring-1 ring-zinc-800 shadow-2xl">
        <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1"
              style={{ color: GOLD }}
            >
              ── Confirmar Regeneração ──
            </div>
            <h3 className="text-white font-semibold text-base">
              Migrar para padrão Mello v1?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {protocolTitle && (
            <div className="rounded bg-zinc-900/60 ring-1 ring-zinc-800 px-3 py-2">
              <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 mb-0.5">
                Protocolo
              </div>
              <div className="text-zinc-200 text-sm">{protocolTitle}</div>
              {athleteName && (
                <div className="text-zinc-500 text-xs mt-1">
                  atleta: {athleteName}
                </div>
              )}
            </div>
          )}

          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex gap-2">
              <Sparkles
                className="w-4 h-4 mt-0.5 shrink-0"
                style={{ color: GOLD }}
              />
              <span>
                Vou gerar uma nova versão no padrão{" "}
                <strong className="text-zinc-100">Mello v1</strong> usando os
                mesmos dados do atleta.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
              <span>
                O protocolo legado fica preservado no histórico (não é
                deletado), apenas marcado como substituído.
              </span>
            </li>
            <li className="flex gap-2">
              <Loader2 className="w-4 h-4 mt-0.5 shrink-0 text-zinc-500" />
              <span>
                A geração leva entre 30 e 90 segundos (Gemini 2.5 Flash Lite).
              </span>
            </li>
          </ul>

          {error && (
            <div className="flex gap-2 rounded bg-red-500/10 ring-1 ring-red-500/30 px-3 py-2">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <div className="min-w-0">
                <div className="font-mono text-[9px] uppercase tracking-wider text-red-400 mb-0.5">
                  Erro
                </div>
                <div className="text-red-200 text-xs break-words">{error}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider font-semibold ring-1 hover:bg-amber-500/15 disabled:opacity-50"
            style={{ color: GOLD, borderColor: `${GOLD}55` }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Confirmar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MigrationDashboard ───────────────────────────────────────────────────── */

export interface MigrationDashboardProps {
  pendingLegacyIds: string[];
  onComplete?: () => void;
}

export function MigrationDashboard({
  pendingLegacyIds,
  onComplete,
}: MigrationDashboardProps) {
  const stats = useMigrationStats();
  const batch = useBatchRegenerate();

  if (stats.isLoading || !stats.data) return null;

  const { legacy_pending, mello_v1_count, total_protocols } = stats.data;

  if (legacy_pending === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-emerald-500/5 ring-1 ring-emerald-500/20 px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
            Migração completa
          </div>
          <div className="text-sm text-zinc-300">
            Todos os {mello_v1_count} protocolos estão no padrão Mello v1.
          </div>
        </div>
      </div>
    );
  }

  const pct =
    total_protocols > 0
      ? Math.round((mello_v1_count / total_protocols) * 100)
      : 0;

  const handleBatchRun = async () => {
    await batch.run(pendingLegacyIds);
    onComplete?.();
  };

  const batchPct =
    batch.progress.total > 0
      ? (batch.progress.current / batch.progress.total) * 100
      : 0;

  return (
    <div className="rounded-lg bg-zinc-900/60 ring-1 ring-zinc-800 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1"
            style={{ color: GOLD }}
          >
            ── Migração para Mello v1 ──
          </div>
          <div className="text-zinc-200 text-sm font-semibold">
            {legacy_pending} protocolo{legacy_pending > 1 ? "s" : ""} pendente
            {legacy_pending > 1 ? "s" : ""}
          </div>
          <div className="text-zinc-500 text-xs mt-0.5">
            {mello_v1_count} de {total_protocols} já no padrão novo ({pct}%)
          </div>
        </div>

        <button
          type="button"
          onClick={handleBatchRun}
          disabled={
            batch.progress.isRunning || pendingLegacyIds.length === 0
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] uppercase tracking-wider font-semibold ring-1 hover:bg-amber-500/15 disabled:opacity-50 shrink-0"
          style={{ color: GOLD, borderColor: `${GOLD}55` }}
        >
          {batch.progress.isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Migrando...
            </>
          ) : (
            <>
              <ArrowRightCircle className="w-3.5 h-3.5" />
              Migrar todos
            </>
          )}
        </button>
      </div>

      {/* progress bar total */}
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500/70 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {batch.progress.isRunning && (
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-mono uppercase tracking-wider">
              Lote em andamento
            </span>
            <span className="text-zinc-300 font-mono">
              {batch.progress.current}/{batch.progress.total}
            </span>
          </div>
          <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${batchPct}%`, backgroundColor: GOLD }}
            />
          </div>
          {batch.progress.failed.length > 0 && (
            <div className="text-[11px] text-red-300">
              {batch.progress.failed.length} falha
              {batch.progress.failed.length > 1 ? "s" : ""} no lote — veja
              detalhes no console.
            </div>
          )}
        </div>
      )}

      {batch.progress.isDone && !batch.progress.isRunning && (
        <div className="flex items-start gap-2 pt-2 border-t border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-sm text-zinc-300">
            <strong className="text-emerald-300">
              {batch.progress.completed.length}
            </strong>{" "}
            migrado(s) com sucesso
            {batch.progress.failed.length > 0 && (
              <>
                ,{" "}
                <strong className="text-red-300">
                  {batch.progress.failed.length}
                </strong>{" "}
                falhou(aram)
              </>
            )}
            .
          </div>
        </div>
      )}
    </div>
  );
}
