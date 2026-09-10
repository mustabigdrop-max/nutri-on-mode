import { useCallback, useEffect, useState } from "react";

/** Estilo visual dos carrosséis: clássico (âmbar nutriON) ou tech científico. */
export type CarouselStyle = "classico" | "tech";

const KEY = "nutrion:estilo-carrossel";
const EVENT = "nutrion:estilo-carrossel-mudou";

export const getCarouselStyle = (): CarouselStyle =>
  (typeof localStorage !== "undefined" && localStorage.getItem(KEY) === "tech" ? "tech" : "classico");

/**
 * Preferência de estilo compartilhada por todos os geradores de conteúdo.
 * Fica salva no navegador do coach e sincroniza entre os painéis abertos.
 */
export function useCarouselStyle(): [CarouselStyle, (s: CarouselStyle) => void] {
  const [style, setStyleState] = useState<CarouselStyle>(getCarouselStyle);

  useEffect(() => {
    const sync = () => setStyleState(getCarouselStyle());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setStyle = useCallback((s: CarouselStyle) => {
    try {
      localStorage.setItem(KEY, s);
    } catch {
      /* modo privado: só não persiste */
    }
    setStyleState(s);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [style, setStyle];
}
