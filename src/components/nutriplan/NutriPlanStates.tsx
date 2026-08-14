import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Loader2, UtensilsCrossed } from "lucide-react";

const BG = "#020205";
const CYAN = "#00D4FF";
const DIM = "#A0A0A0";

const Shell = ({ children }: { children: ReactNode }) => (
  <div
    className="min-h-screen w-full flex items-center justify-center p-6"
    style={{ background: BG, color: "#FFFFFF" }}
  >
    <div className="w-full max-w-md text-center space-y-3">{children}</div>
  </div>
);

export const LoadingState = ({ message = "Carregando seu plano alimentar..." }: { message?: string }) => (
  <Shell>
    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: CYAN }} />
    <p className="text-sm" style={{ color: DIM }}>{message}</p>
  </Shell>
);

export const EmptyState = ({
  message = "Nenhum plano alimentar encontrado",
  hint = "Assim que um plano for gerado ou enviado, ele aparece aqui.",
  actionLabel,
  onAction,
}: {
  message?: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <Shell>
    <UtensilsCrossed className="w-8 h-8 mx-auto" style={{ color: CYAN }} />
    <p className="text-base font-bold">{message}</p>
    <p className="text-xs" style={{ color: DIM }}>{hint}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold"
        style={{ background: `${CYAN}1a`, color: CYAN, border: `1px solid ${CYAN}55` }}
      >
        {actionLabel}
      </button>
    )}
  </Shell>
);

export const ErrorState = ({
  message,
  onRetry,
  title = "Não foi possível carregar seu plano alimentar",
}: {
  message?: string;
  onRetry?: () => void;
  title?: string;
}) => (
  <Shell>
    <AlertTriangle className="w-8 h-8 mx-auto" style={{ color: "#FF6B6B" }} />
    <p className="text-base font-bold">{title}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-2 rounded-xl text-sm font-semibold"
        style={{ background: `${CYAN}1a`, color: CYAN, border: `1px solid ${CYAN}55` }}
      >
        Tentar novamente
      </button>
    )}
    {message && (
      <p className="text-[11px] font-mono break-words pt-2" style={{ color: DIM }}>
        {message}
      </p>
    )}
  </Shell>
);

interface BProps { children: ReactNode }
interface BState { error: Error | null }

export class NutriPlanErrorBoundary extends Component<BProps, BState> {
  state: BState = { error: null };

  static getDerivedStateFromError(error: Error): BState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[NutriPlan] erro de renderização:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          message={this.state.error.message || "Erro inesperado."}
          onRetry={() => {
            this.setState({ error: null });
            window.location.reload();
          }}
        />
      );
    }
    return this.props.children;
  }
}

export default NutriPlanErrorBoundary;
