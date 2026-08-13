import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RouteErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-border p-6 text-center space-y-3">
            <h1 className="text-lg font-semibold">Não foi possível carregar este módulo</h1>
            <p className="text-sm text-muted-foreground break-words">
              {this.state.error.message || "Erro inesperado."}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
                onClick={() => window.location.reload()}
              >
                Recarregar
              </button>
              <button
                className="px-4 py-2 rounded-md border border-border text-sm"
                onClick={() => { window.location.href = "/coach"; }}
              >
                Voltar ao painel
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
