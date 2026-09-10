import { useEffect, useState } from "react";
import { PESQUISA_EVENT, getPesquisaAtiva, setPesquisaAtiva, type PesquisaDual } from "@/lib/dualResearch";

/** Pesquisa científica ativa, compartilhada por todos os geradores de conteúdo. */
export function usePesquisaAtiva(): [PesquisaDual | null, (p: PesquisaDual | null) => void] {
  const [p, setP] = useState<PesquisaDual | null>(getPesquisaAtiva());
  useEffect(() => {
    const on = () => setP(getPesquisaAtiva());
    window.addEventListener(PESQUISA_EVENT, on);
    return () => window.removeEventListener(PESQUISA_EVENT, on);
  }, []);
  return [p, setPesquisaAtiva];
}
