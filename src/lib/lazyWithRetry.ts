import { lazy as reactLazy, type ComponentType } from "react";

type Factory<T> = () => Promise<{ default: T }>;

const RELOAD_KEY = "__chunk_reload_at";

/**
 * React.lazy com resiliência a falhas de carregamento de chunk.
 * - Tenta novamente 2x (rede instável / deploy em andamento)
 * - Se ainda falhar, força um reload único da página (index.html novo)
 */
export function lazyWithRetry<T extends ComponentType<any>>(factory: Factory<T>) {
  return reactLazy(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await factory();
      } catch (err) {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          continue;
        }
        // Provável chunk obsoleto após novo deploy: recarrega uma única vez sem cache
        try {
          const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
          if (Date.now() - last > 30000) {
            sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
            try {
              if ("caches" in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
              }
            } catch {
              /* cache indisponível */
            }
            const url = new URL(window.location.href);
            url.searchParams.set("_r", Date.now().toString(36));
            window.location.replace(url.toString());
            await new Promise(() => {});
          }
        } catch {
          /* sessionStorage indisponível */
        }
        throw err;
      }
    }
    throw new Error("unreachable");
  });
}

export default lazyWithRetry;
