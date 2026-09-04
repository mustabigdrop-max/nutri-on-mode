import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

const RECOVER_KEY = "__chunk_recover_at";

/** Erros típicos de chunk obsoleto (app atualizado enquanto o celular tinha cache antigo). */
function isChunkError(error: Error) {
  const msg = `${error?.name || ""} ${error?.message || ""}`.toLowerCase();
  return (
    msg.includes("dynamically imported module") ||
    msg.includes("failed to fetch") ||
    msg.includes("importing a module script failed") ||
    msg.includes("loading chunk") ||
    msg.includes("chunkloaderror") ||
    msg.includes("expected a javascript module")
  );
}

/** Recarrega ignorando cache (importante no Safari/Chrome mobile). */
async function hardReload() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    /* ignora */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("_r", Date.now().toString(36));
  window.location.replace(url.toString());
}

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RouteErrorBoundary]", error, info.componentStack);
    if (isChunkError(error)) {
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(RECOVER_KEY) || 0);
      } catch {
        /* storage indisponível */
      }
      if (Date.now() - last > 30000) {
        try {
          sessionStorage.setItem(RECOVER_KEY, String(Date.now()));
        } catch {
          /* storage indisponível */
        }
        void hardReload();
      }
    }
  }

  render() {
    if (this.state.error) {
      const chunk = isChunkError(this.state.error);
      return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-border p-6 text-center space-y-3">
            <h1 className="text-lg font-semibold">
              {chunk ? "Atualizando o aplicativo" : "Não foi possível carregar este módulo"}
            </h1>
            <p className="text-sm text-muted-foreground break-words">
              {chunk
                ? "Seu celular estava com uma versão antiga em cache. Toque em Atualizar para carregar a versão mais recente."
                : this.state.error.message || "Erro inesperado."}
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <button
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
                onClick={() => { void hardReload(); }}
              >
                Atualizar
              </button>
              <button
                className="px-4 py-2 rounded-md border border-border text-sm"
                onClick={() => { window.location.href = "/"; }}
              >
                Ir para o início
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
