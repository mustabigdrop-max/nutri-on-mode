import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ViewAsContextType {
  /** true quando o coach está visualizando o painel de um cliente */
  isViewingAs: boolean;
  /** ID do atleta sendo visualizado (null no modo normal) */
  targetUserId: string | null;
  /** ID que deve ser usado em TODAS as queries (atleta no modo view-as, usuário real no modo normal) */
  effectiveUserId: string;
}

const ViewAsContext = createContext<ViewAsContextType>({
  isViewingAs: false,
  targetUserId: null,
  effectiveUserId: "",
});

export function useViewAs(): ViewAsContextType {
  return useContext(ViewAsContext);
}

/** Atalho: ID do atleta cujos dados devem ser carregados */
export function useAthleteId(): string {
  return useViewAs().effectiveUserId;
}

export function ViewAsProvider({
  children,
  targetUserId,
}: {
  children: ReactNode;
  targetUserId?: string | null;
}) {
  const { user } = useAuth();
  const realId = user?.id || "";

  const value = useMemo<ViewAsContextType>(
    () => ({
      isViewingAs: !!targetUserId,
      targetUserId: targetUserId || null,
      effectiveUserId: targetUserId || realId,
    }),
    [targetUserId, realId]
  );

  return <ViewAsContext.Provider value={value}>{children}</ViewAsContext.Provider>;
}
