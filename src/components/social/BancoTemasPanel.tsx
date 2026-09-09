import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Flame, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  BANCO_TEMAS,
  CATEGORIAS_TEMA,
  FORMATO_LABEL,
  ROTACAO_SEMANAL,
  TIPO_LABEL,
  diasDesdePost,
  sugestoesDoDia,
  todosOsTemas,
  type CategoriaTema,
  type TemaComCategoria,
} from "@/data/bancoTemas";
import { useTemasPostados } from "@/hooks/useTemasPostados";

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function BancoTemasPanel({ onUsarTema }: { onUsarTema?: (tema: TemaComCategoria) => void }) {
  const { postados, loading, marcarPostado, desmarcar } = useTemasPostados();
  const [cat, setCat] = useState<CategoriaTema | "TODOS">("TODOS");
  const hoje = new Date();

  const sugestoes = useMemo(() => sugestoesDoDia(postados, hoje), [postados]);
  const lista = useMemo(() => {
    const base = cat === "TODOS" ? todosOsTemas() : todosOsTemas().filter((t) => t.categoria === cat);
    return [...base].sort((a, b) => b.potencial - a.potencial);
  }, [cat]);

  const usar = (t: TemaComCategoria) => {
    if (onUsarTema) return onUsarTema(t);
    navigator.clipboard.writeText(`${t.titulo} — ${t.subtitulo}`);
    toast.success("Tema copiado.");
  };

  const TemaCard = ({ t, destaque }: { t: TemaComCategoria; destaque?: boolean }) => {
    const dias = diasDesdePost(t.titulo, postados);
    const bloqueado = dias !== null && dias <= 30;
    return (
      <div
        className="rounded-xl border p-3 space-y-2"
        style={{
          borderColor: destaque ? "#EF9F2755" : "rgba(255,255,255,0.10)",
          background: destaque ? "#EF9F270A" : undefined,
          opacity: bloqueado ? 0.55 : 1,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">
              {t.icone} {t.titulo}
            </p>
            <p className="text-xs text-muted-foreground">{t.subtitulo}</p>
          </div>
          <Badge className="shrink-0 border text-[10px]" style={{ background: "#EF9F2715", color: "#EF9F27", borderColor: "#EF9F2740" }}>
            {t.potencial}/10
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="rounded border px-1.5 py-0.5">{FORMATO_LABEL[t.formato_ideal]}</span>
          <span className="rounded border px-1.5 py-0.5">{TIPO_LABEL[t.tipo]}</span>
          <span className="rounded border px-1.5 py-0.5">{BANCO_TEMAS[t.categoria].label}</span>
          {bloqueado && <span style={{ color: "#888" }}>postado há {dias} dia(s) — livre em {31 - (dias ?? 0)} dia(s)</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1.5" disabled={bloqueado} onClick={() => usar(t)}>
            <Sparkles className="h-3.5 w-3.5" /> Gerar {FORMATO_LABEL[t.formato_ideal].toLowerCase()}
          </Button>
          {bloqueado ? (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => desmarcar(t.titulo)}>
              <RotateCcw className="h-3.5 w-3.5" /> Liberar tema
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={async () => {
                const ok = await marcarPostado(t, t.formato_ideal);
                toast[ok ? "success" : "error"](ok ? "Marcado como postado hoje." : "Entre na sua conta pra marcar.");
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Já postei
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4" style={{ borderColor: "#EF9F2733", background: "#EF9F270A" }}>
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4" style={{ color: "#EF9F27" }} />
          <p className="font-semibold tracking-wide">BANCO DE TEMAS</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Temas organizados por vault e por série, com potencial viral e formato ideal. O sistema rotaciona as categorias
          durante a semana, prioriza potencial 9-10 e nunca sugere de novo um tema postado nos últimos 30 dias.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarDays className="h-4 w-4" style={{ color: "#EF9F27" }} />
            {DIAS_SEMANA[hoje.getDay()]} · {ROTACAO_SEMANAL[hoje.getDay()].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-xs text-muted-foreground">Carregando o histórico de temas…</p>
          ) : (
            sugestoes.map((t) => <TemaCard key={t.titulo} t={t} destaque />)
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        {(["TODOS", ...CATEGORIAS_TEMA] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c as CategoriaTema | "TODOS")}
            className="rounded-full border px-2.5 py-1 text-[11px] transition"
            style={cat === c ? { borderColor: "#EF9F2755", color: "#EF9F27", background: "#EF9F2715" } : undefined}
          >
            {c === "TODOS" ? "Todos" : `${BANCO_TEMAS[c as CategoriaTema].icone} ${BANCO_TEMAS[c as CategoriaTema].label}`}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {lista.map((t) => (
          <TemaCard key={t.titulo} t={t} />
        ))}
      </div>
    </div>
  );
}
