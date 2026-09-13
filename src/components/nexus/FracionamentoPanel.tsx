import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Syringe } from "lucide-react";
import { toast } from "sonner";
import {
  FRAC_COMPARATIVO,
  FRAC_CONCLUSAO,
  FRAC_CURVA_DOSE_RESPOSTA,
  FRAC_NOTAS,
  FRAC_PILARES,
  FRAC_PROTOCOLOS,
  FRAC_VIA_SC_IM,
  fracionamentoRoteiro,
} from "@/data/fracionamentoTestosterona";

const ACCENT = "#EF4444";
const AMBER = "#EF9F27";
const TEAL = "#5DCAA5";
const LILAC = "#AFA9EC";

const BADGE_COR: Record<string, string> = {
  ESTUDO: TEAL,
  DADO: AMBER,
  "BRO SCIENCE": LILAC,
  "OFF-LABEL": ACCENT,
};

export default function FracionamentoPanel() {
  const copiar = () => {
    navigator.clipboard.writeText(fracionamentoRoteiro());
    toast.success("Roteiro copiado.");
  };

  return (
    <Card className="border border-gray-800 bg-gray-900/50">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: ACCENT }}>
            <Syringe className="w-4 h-4" /> 300 mg fracionada vs 500 mg convencional
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5 border-gray-700 text-[11px] text-gray-300" onClick={copiar}>
            <Copy className="h-3 w-3" /> Copiar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        {/* Curva dose-resposta */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold" style={{ color: AMBER }}>
            Curva dose-resposta logarítmica
          </p>
          {FRAC_CURVA_DOSE_RESPOSTA.pontos.map((p) => (
            <div key={p.dose} className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="text-gray-400">{p.dose}</span>
              <span className="text-white font-semibold">{p.ganho}</span>
              <span className="text-gray-600">colaterais: {p.colaterais}</span>
            </div>
          ))}
          <p className="text-xs leading-relaxed" style={{ color: TEAL }}>
            {FRAC_CURVA_DOSE_RESPOSTA.leitura}
          </p>
          <p className="text-[10px] text-gray-600">Fonte: {FRAC_CURVA_DOSE_RESPOSTA.referencia}</p>
        </div>

        {/* Pilares */}
        <div className="space-y-2">
          {FRAC_PILARES.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-800 p-3">
              <p className="text-[11px] font-semibold text-white">{p.titulo}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{p.texto}</p>
            </div>
          ))}
        </div>

        {/* Protocolos */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold" style={{ color: AMBER }}>
            Protocolos de fracionamento
          </p>
          {FRAC_PROTOCOLOS.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-800 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-white">{p.nome}</p>
                {p.destaque && (
                  <Badge className="text-[9px] border" style={{ backgroundColor: `${TEAL}15`, color: TEAL, borderColor: `${TEAL}40` }}>
                    {p.destaque}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-gray-300">Dose: {p.dose}</p>
              {p.como && <p className="text-[11px] text-gray-500">Como: {p.como}</p>}
              <p className="text-[11px] text-gray-500">
                Flutuação: {p.flutuacao} · Nível: {p.nivel}
                {p.ia ? ` · IA: ${p.ia}` : ""}
              </p>
              <p className="text-[11px]" style={{ color: TEAL }}>
                Prós: {p.pros.join(" · ")}
              </p>
              {p.contras?.length ? (
                <p className="text-[11px]" style={{ color: AMBER }}>
                  Contras: {p.contras.join(" · ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {/* SC vs IM */}
        <div className="rounded-lg border border-gray-800 p-3">
          <p className="text-[11px] font-semibold text-white">{FRAC_VIA_SC_IM.titulo}</p>
          <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{FRAC_VIA_SC_IM.texto}</p>
        </div>

        {/* Comparativo */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold" style={{ color: AMBER }}>
            Comparação direta
          </p>
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-x-2 text-[10px] text-gray-600 pb-1 border-b border-gray-800">
            <span>Parâmetro</span>
            <span>500 mg 2x/sem</span>
            <span>300 mg ED</span>
          </div>
          {FRAC_COMPARATIVO.map((l) => (
            <div key={l.parametro} className="grid grid-cols-[1.2fr_1fr_1fr] gap-x-2 text-[11px] py-0.5 border-b border-gray-900">
              <span className="text-gray-400">{l.parametro}</span>
              <span style={{ color: l.favoravel === "convencional" ? TEAL : "#888" }}>{l.convencional}</span>
              <span style={{ color: l.favoravel === "fracionada" ? TEAL : "#888" }}>{l.fracionada}</span>
            </div>
          ))}
          <p className="text-[11px] text-gray-300 leading-relaxed pt-2">
            <span style={{ color: ACCENT }}>Conclusão: </span>
            {FRAC_CONCLUSAO}
          </p>
        </div>

        {/* Bro science + off-label */}
        <div className="space-y-2">
          {FRAC_NOTAS.map((n) => (
            <div key={n.titulo} className="rounded-lg border border-gray-800 p-3 space-y-1">
              <Badge
                className="text-[9px] border"
                style={{
                  backgroundColor: `${BADGE_COR[n.badge]}15`,
                  color: BADGE_COR[n.badge],
                  borderColor: `${BADGE_COR[n.badge]}40`,
                }}
              >
                {n.badge}
              </Badge>
              <p className="text-[11px] font-semibold text-white">{n.titulo}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{n.texto}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
