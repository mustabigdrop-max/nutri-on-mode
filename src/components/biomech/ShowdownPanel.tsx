import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Copy, Swords } from "lucide-react";
import {
  BADGE_LABEL, FORMATO_LABEL, OBJETIVO_LABEL, SHOWDOWNS, SHOWDOWN_GRUPOS,
  badgeDoExercicio, buildShowdownContent, nomeVencedor,
  type FormatoShowdown, type Objetivo, type Showdown,
} from "@/lib/kinesisShowdown";

const C = { verde: "#4ade80", texto: "#f0fdf4", cinza: "#9ca3af", borda: "rgba(74,222,128,0.15)" };

function BadgeEvidencia({ tipo }: { tipo: "ESTUDO" | "ESTIMATIVA" | "PRATICA" }) {
  const cor = tipo === "ESTUDO" ? "#4ade80" : tipo === "ESTIMATIVA" ? "#E8A020" : "#AFA9EC";
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ border: `1px solid ${cor}`, color: cor }}>
      {BADGE_LABEL[tipo]}
    </span>
  );
}

function DadosBrutos({ s }: { s: Showdown }) {
  return (
    <div className="space-y-4">
      {[s.a, s.b].map((e, i) => (
        <div key={e.nome} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borda}` }}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: C.texto }}>{i === 0 ? "A" : "B"} · {e.nome}</span>
            <BadgeEvidencia tipo={badgeDoExercicio(e)} />
          </div>
          <p className="text-xs mt-1" style={{ color: C.cinza }}>{e.foco}</p>
          <p className="text-[11px] mt-1" style={{ color: C.cinza }}>
            Estabilização: {e.estabilizacao} · Risco: {e.risco} · Nível: {e.dificuldade}
          </p>
          {e.emg && (
            <p className="text-[11px] mt-1" style={{ color: C.verde }}>EMG: {e.emg.descricao} — {e.emg.fonte}</p>
          )}
          <p className="text-[11px] mt-1" style={{ color: C.texto }}>Quando usar: {e.quandoUsar}</p>
        </div>
      ))}
      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borda}` }}>
        <div className="text-[10px] tracking-widest mb-2" style={{ color: C.cinza }}>VEREDICTO POR OBJETIVO</div>
        {(Object.keys(OBJETIVO_LABEL) as Objetivo[]).map((o) => (
          <p key={o} className="text-xs mb-1" style={{ color: C.texto }}>
            <span style={{ color: C.cinza }}>{OBJETIVO_LABEL[o]}:</span>{" "}
            <strong style={{ color: C.verde }}>{nomeVencedor(s, s.veredictos[o])}</strong> — {s.veredictos[o].justificativa}
          </p>
        ))}
      </div>
      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borda}` }}>
        <div className="text-[10px] tracking-widest mb-2" style={{ color: C.cinza }}>FONTES</div>
        {s.fontes.length ? (
          s.fontes.map((f) => <p key={f} className="text-[11px] mb-1" style={{ color: C.texto }}>• {f}</p>)
        ) : (
          <p className="text-[11px]" style={{ color: "#E8A020" }}>
            Comparação 100% em estimativa biomecânica — nenhum número de estudo citado.
          </p>
        )}
      </div>
    </div>
  );
}

const ShowdownPanel = () => {
  const [grupo, setGrupo] = useState(SHOWDOWN_GRUPOS[0]);
  const [showdownId, setShowdownId] = useState(SHOWDOWNS[0].id);
  const [formato, setFormato] = useState<FormatoShowdown>("carrossel");

  const lista = useMemo(() => SHOWDOWNS.filter((s) => s.grupo === grupo), [grupo]);
  const showdown = useMemo(
    () => lista.find((s) => s.id === showdownId) || lista[0],
    [lista, showdownId],
  );
  const conteudo = useMemo(
    () => (showdown && formato !== "dados_brutos" ? buildShowdownContent(showdown, formato) : ""),
    [showdown, formato],
  );

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(conteudo);
      toast({ title: "Copiado", description: "Conteúdo do showdown na área de transferência." });
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  return (
    <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(74,222,128,0.2)" }}>
      <div className="flex items-center gap-2">
        <Swords className="w-4 h-4" style={{ color: C.verde }} />
        <div>
          <div className="text-sm font-bold" style={{ color: C.texto }}>KINESIS Showdown</div>
          <div className="text-[10px]" style={{ color: C.cinza }}>
            Comparação científica de exercícios — veredicto sempre por objetivo, nunca "melhor" sem contexto.
          </div>
        </div>
      </div>

      {/* Grupo */}
      <div className="flex flex-wrap gap-1.5">
        {SHOWDOWN_GRUPOS.map((g) => (
          <button
            key={g}
            onClick={() => { setGrupo(g); setShowdownId(SHOWDOWNS.find((s) => s.grupo === g)!.id); }}
            className="px-2.5 py-1 rounded-full text-[11px]"
            style={{
              background: grupo === g ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${grupo === g ? C.verde : "rgba(255,255,255,0.08)"}`,
              color: grupo === g ? C.verde : C.cinza,
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Showdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {lista.map((s) => (
          <button
            key={s.id}
            onClick={() => setShowdownId(s.id)}
            className="px-3 py-2 rounded-lg text-xs text-left"
            style={{
              background: showdown?.id === s.id ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${showdown?.id === s.id ? C.verde : "rgba(255,255,255,0.08)"}`,
              color: C.texto,
            }}
          >
            {s.a.nome} <span style={{ color: C.verde }}>×</span> {s.b.nome}
            <span className="block mt-1">
              {s.fontes.length > 0
                ? <BadgeEvidencia tipo="ESTUDO" />
                : <BadgeEvidencia tipo="ESTIMATIVA" />}
            </span>
          </button>
        ))}
      </div>

      {/* Formato */}
      {showdown && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(FORMATO_LABEL) as FormatoShowdown[]).map((f) => (
              <Badge
                key={f}
                onClick={() => setFormato(f)}
                className="cursor-pointer text-[10px]"
                style={{
                  background: formato === f ? C.verde : "rgba(255,255,255,0.04)",
                  color: formato === f ? "#0a0f0a" : C.cinza,
                  border: `1px solid ${formato === f ? C.verde : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {FORMATO_LABEL[f]}
              </Badge>
            ))}
          </div>

          {formato === "dados_brutos" ? (
            <DadosBrutos s={showdown} />
          ) : (
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={copiar} style={{ borderColor: C.borda, color: C.texto }}>
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar conteúdo
                </Button>
              </div>
              <pre
                className="whitespace-pre-wrap text-xs rounded-lg p-4"
                style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${C.borda}`, color: C.texto, fontFamily: "'Space Mono', monospace" }}
              >
                {conteudo}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShowdownPanel;
