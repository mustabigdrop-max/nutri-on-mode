import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CategoriaTema, TemaPostado } from "@/data/bancoTemas";

/** Registro dos temas já postados — usado pra não repetir tema em menos de 30 dias. */
export function useTemasPostados() {
  const [postados, setPostados] = useState<TemaPostado[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setPostados([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("social_temas_postados")
      .select("titulo, postado_em, formato")
      .eq("user_id", auth.user.id)
      .order("postado_em", { ascending: false })
      .limit(500);
    setPostados((data as TemaPostado[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const marcarPostado = useCallback(
    async (tema: { titulo: string; categoria: CategoriaTema }, formato?: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return false;
      const hoje = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("social_temas_postados").upsert(
        {
          user_id: auth.user.id,
          titulo: tema.titulo,
          categoria: tema.categoria,
          formato: formato ?? null,
          postado_em: hoje,
        },
        { onConflict: "user_id,titulo,postado_em" },
      );
      if (error) return false;
      await load();
      return true;
    },
    [load],
  );

  const desmarcar = useCallback(
    async (titulo: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      await supabase.from("social_temas_postados").delete().eq("user_id", auth.user.id).eq("titulo", titulo);
      await load();
    },
    [load],
  );

  return { postados, loading, marcarPostado, desmarcar, reload: load };
}
