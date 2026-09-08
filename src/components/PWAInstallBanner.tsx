import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const DISMISS_KEY = "nutrion_pwa_banner_dismissed_at";
const DISMISS_DAYS = 7;

export function PWAInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const ios = isIos();

  useEffect(() => {
    if (isStandalone()) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile && !ios) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 86400_000) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS não dispara beforeinstallprompt — mostrar instrução manual
    if (ios) setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [ios]);

  if (!visible) return null;

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setDeferred(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div
      className="fixed left-3 right-3 z-[90] rounded-2xl border border-[#EF9F27]/40 bg-[#0A0A0A]/95 p-4 shadow-2xl backdrop-blur-md"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)" }}
      role="dialog"
      aria-label="Instalar o app nutriON"
    >
      <button
        onClick={dismiss}
        aria-label="Fechar"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <img
          src="/icons/icon-96.png"
          alt="nutriON"
          width={44}
          height={44}
          className="rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Instalar o nutriON</p>
          <p className="text-xs leading-snug text-neutral-400">
            {ios
              ? "Toque em Compartilhar e depois em “Adicionar à Tela de Início”."
              : "Abra direto da sua tela inicial, como um app."}
          </p>
        </div>
      </div>

      {ios ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-neutral-300">
          <Share className="h-4 w-4 shrink-0 text-[#EF9F27]" />
          <span>
            No Safari: botão <strong className="text-white">Compartilhar</strong> →{" "}
            <strong className="text-white">Adicionar à Tela de Início</strong>
          </span>
        </div>
      ) : (
        <button
          onClick={install}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#EF9F27] text-sm font-bold text-[#0A0A0A] active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          INSTALAR AGORA
        </button>
      )}
    </div>
  );
}
