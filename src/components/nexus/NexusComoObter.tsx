import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AMBER = "#EF9F27";
const INK = "#F5F0E8";
const OK = "#22C55E";
const WARN = "#EAB308";
const BAD = "#EF4444";

export const COMO_OBTER_DISCLAIMER =
  "⚕️ Informação educacional baseada em literatura científica. Não constitui prescrição, recomendação de uso ou indicação médica. Fármacos exigem prescrição. Consulte seu médico antes de iniciar qualquer protocolo. Valores e disponibilidade podem variar.";

type Suplemento = {
  nome?: string;
  fabricante?: string;
  dose?: string;
  via?: string;
  custo_estimado?: string;
  disponivel_brasil?: boolean;
  status_regulatorio?: string;
  onde_comprar?: string;
};
type Comercial = {
  marca?: string;
  fabricante?: string;
  indicacao?: string;
  doses?: string;
  via?: string;
  anvisa?: boolean;
  custo_brasil?: string;
};
type Farmaco = {
  nome?: string;
  mecanismo?: string;
  estudo?: string;
  dose_estudada?: string;
  prescricao?: boolean;
  disponivel_brasil?: boolean;
};
type Prebiotico = { nome?: string; fonte_alimentar?: string; estudo?: string; dose?: string };
type Estilo = { fator?: string; mecanismo?: string; estudo?: string; dose?: string };
type Escalonamento = { semana?: string; dose?: string; nota?: string };
type Combinacao = { combinacao?: string; motivo?: string; evidencia?: string; protocolo?: string };
type Centro = { centro?: string; pais?: string; protocolo?: string; pesquisador?: string };

export type ComoObter = {
  suplementos?: Suplemento[];
  nomes_comerciais?: Comercial[];
  farmacos_moduladores?: Farmaco[];
  prebioticos_estimulantes?: Prebiotico[];
  estilo_vida?: Estilo[];
  fatores_reducao?: string[];
  escalonamento?: Escalonamento[];
  exames_recomendados?: string[];
  combinacoes?: Combinacao[];
  protocolos_referencia?: Centro[];
};

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: `${AMBER}20`, background: "#111" }}>
      <p className="mb-2 text-[8px] font-bold uppercase tracking-widest" style={{ color: AMBER }}>
        {titulo}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

const Linha = ({ label, valor }: { label: string; valor?: string }) =>
  valor ? (
    <p className="text-[13px]" style={{ color: INK }}>
      <span className="text-[10px] uppercase tracking-wide text-gray-500">{label}: </span>
      {valor}
    </p>
  ) : null;

const Ref = ({ texto }: { texto?: string }) =>
  texto ? <p className="text-[10px] italic text-[#666]">{texto}</p> : null;

/** Seção premium "COMO OBTER" — gerada sob demanda e cacheada no banco. */
export default function NexusComoObter({
  nome,
  origem,
  compoundData,
}: {
  nome: string;
  origem: "PeptideVault" | "MicrobiotaVault" | "SteroidVault";
  compoundData?: unknown;
}) {
  const [dados, setDados] = useState<ComoObter | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let vivo = true;
    setDados(null);
    setChecked(false);
    supabase
      .from("nexus_como_obter")
      .select("dados")
      .eq("composto", nome.toLowerCase())
      .maybeSingle()
      .then(({ data }) => {
        if (!vivo) return;
        if (data?.dados) setDados(data.dados as ComoObter);
        setChecked(true);
      });
    return () => {
      vivo = false;
    };
  }, [nome]);

  const gerar = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "nexus_como_obter", topic: nome, origem, compoundData: compoundData ?? null },
      });
      if (error) throw error;
      const result = (data?.result || {}) as ComoObter;
      setDados(result);
      await supabase
        .from("nexus_como_obter")
        .upsert({ composto: nome.toLowerCase(), origem, dados: result }, { onConflict: "composto" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui buscar agora.");
    } finally {
      setLoading(false);
    }
  }, [nome, origem, compoundData]);

  const vazio =
    !dados ||
    !(
      dados.suplementos?.length ||
      dados.nomes_comerciais?.length ||
      dados.farmacos_moduladores?.length ||
      dados.prebioticos_estimulantes?.length ||
      dados.estilo_vida?.length ||
      dados.fatores_reducao?.length ||
      dados.escalonamento?.length ||
      dados.exames_recomendados?.length ||
      dados.combinacoes?.length ||
      dados.protocolos_referencia?.length
    );

  return (
    <Card className="border" style={{ borderColor: `${AMBER}30`, background: "#0d0d0d" }}>
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="flex items-center justify-between gap-2 text-sm font-semibold" style={{ color: AMBER }}>
          <span>💊 Como obter — {nome}</span>
          {dados && (
            <button onClick={gerar} disabled={loading} className="text-gray-500 hover:text-gray-300" aria-label="Atualizar">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {vazio ? (
          <>
            <p className="text-xs text-gray-500">
              Suplementos, fármacos, alimentos, protocolos de centros de referência e exames — informação prática de
              como obter ou estimular este composto.
            </p>
            <Button onClick={gerar} disabled={loading || !checked} className="w-full gap-2 bg-[#EF9F27] text-black hover:bg-[#EF9F27]/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "💊"} Buscar informações práticas
            </Button>
          </>
        ) : (
          <>
            {!!dados?.nomes_comerciais?.length && (
              <Bloco titulo="Fármacos comerciais">
                {dados.nomes_comerciais.map((c, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      {c.marca} {c.fabricante ? <span className="text-[10px] text-gray-500">· {c.fabricante}</span> : null}
                    </p>
                    <Linha label="Indicação" valor={c.indicacao} />
                    <Linha label="Doses" valor={c.doses} />
                    <Linha label="Via" valor={c.via} />
                    <Linha label="Custo Brasil" valor={c.custo_brasil} />
                    <p className="text-[11px]" style={{ color: c.anvisa ? OK : BAD }}>
                      {c.anvisa ? "✅ ANVISA aprovado" : "❌ Sem aprovação ANVISA"}
                    </p>
                  </div>
                ))}
              </Bloco>
            )}

            {!!dados?.suplementos?.length && (
              <Bloco titulo="Suplementos">
                {dados.suplementos.map((s, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      {s.nome} {s.fabricante ? <span className="text-[10px] text-gray-500">· {s.fabricante}</span> : null}
                    </p>
                    <Linha label="Dose" valor={s.dose} />
                    <Linha label="Via" valor={s.via} />
                    <Linha label="Custo" valor={s.custo_estimado} />
                    <Linha label="Status" valor={s.status_regulatorio} />
                    <Linha label="Onde comprar" valor={s.onde_comprar} />
                    <p className="text-[11px]" style={{ color: s.disponivel_brasil ? OK : WARN }}>
                      {s.disponivel_brasil ? "✅ Disponível no Brasil" : "⚠️ Não disponível diretamente no Brasil"}
                    </p>
                  </div>
                ))}
              </Bloco>
            )}

            {!!dados?.escalonamento?.length && (
              <Bloco titulo="Protocolo de escalonamento">
                {dados.escalonamento.map((e, i) => (
                  <div key={i}>
                    <p className="text-[13px]" style={{ color: INK }}>
                      {e.semana}: {e.dose}
                    </p>
                    <Ref texto={e.nota} />
                  </div>
                ))}
                <p className="text-[11px]" style={{ color: WARN }}>
                  ⚠️ Escalonamento conduzido por médico. Iniciar na dose máxima causa efeitos adversos severos.
                </p>
              </Bloco>
            )}

            {!!dados?.farmacos_moduladores?.length && (
              <Bloco titulo="Fármacos que modulam / aumentam">
                {dados.farmacos_moduladores.map((f, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      {f.nome}
                    </p>
                    <Linha label="Mecanismo" valor={f.mecanismo} />
                    <Linha label="Dose estudada" valor={f.dose_estudada} />
                    <Ref texto={f.estudo} />
                    <p className="text-[11px]" style={{ color: f.prescricao ? WARN : OK }}>
                      {f.prescricao ? "⚠️ Requer prescrição médica" : "✅ Sem prescrição"}
                      {f.disponivel_brasil === false ? " · não disponível no Brasil" : ""}
                    </p>
                  </div>
                ))}
              </Bloco>
            )}

            {!!dados?.prebioticos_estimulantes?.length && (
              <Bloco titulo="Alimentos e prebióticos que estimulam">
                {dados.prebioticos_estimulantes.map((p, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      🥗 {p.nome}
                    </p>
                    <Linha label="Fonte" valor={p.fonte_alimentar} />
                    <Linha label="Dose" valor={p.dose} />
                    <Ref texto={p.estudo} />
                  </div>
                ))}
              </Bloco>
            )}

            {(!!dados?.estilo_vida?.length || !!dados?.fatores_reducao?.length) && (
              <Bloco titulo="Estilo de vida">
                {(dados.estilo_vida || []).map((e, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      ⚡ {e.fator}
                    </p>
                    <Linha label="Mecanismo" valor={e.mecanismo} />
                    <Linha label="Dose" valor={e.dose} />
                    <Ref texto={e.estudo} />
                  </div>
                ))}
                {!!dados.fatores_reducao?.length && (
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: BAD }}>
                      ❌ O que reduz / prejudica
                    </p>
                    {dados.fatores_reducao.map((f) => (
                      <p key={f} className="text-[12px] text-gray-400">
                        • {f}
                      </p>
                    ))}
                  </div>
                )}
              </Bloco>
            )}

            {!!dados?.exames_recomendados?.length && (
              <Bloco titulo="Exames recomendados antes">
                {dados.exames_recomendados.map((e) => (
                  <p key={e} className="text-[13px]" style={{ color: INK }}>
                    🔬 {e}
                  </p>
                ))}
              </Bloco>
            )}

            {!!dados?.combinacoes?.length && (
              <Bloco titulo="Combinações documentadas">
                {dados.combinacoes.map((c, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      🔗 {c.combinacao}
                    </p>
                    <Linha label="Por quê" valor={c.motivo} />
                    <Linha label="Protocolo" valor={c.protocolo} />
                    <Ref texto={c.evidencia} />
                  </div>
                ))}
              </Bloco>
            )}

            {!!dados?.protocolos_referencia?.length && (
              <Bloco titulo="Centros de referência">
                {dados.protocolos_referencia.map((c, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>
                      🏥 {c.centro} {c.pais ? <span className="text-[10px] text-gray-500">· {c.pais}</span> : null}
                    </p>
                    <Linha label="Protocolo" valor={c.protocolo} />
                    <Ref texto={c.pesquisador} />
                  </div>
                ))}
              </Bloco>
            )}
          </>
        )}

        <p className="text-[10px] leading-relaxed text-gray-500">{COMO_OBTER_DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}
