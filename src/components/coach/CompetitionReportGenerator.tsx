import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Props {
  planId: string;
}

const CompetitionReportGenerator = ({ planId }: Props) => {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-competition-report", {
        body: { plan_id: planId },
      });
      if (error || !data?.success) throw new Error(error?.message || "Falha ao gerar relatório");

      const r = data.report;
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210;
      let y = 15;

      const line = (txt: string, size = 10, bold = false, color: [number, number, number] = [30, 30, 30]) => {
        pdf.setFontSize(size);
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(txt, W - 30);
        pdf.text(lines, 15, y);
        y += lines.length * (size * 0.45) + 1;
      };

      const sep = () => {
        pdf.setDrawColor(232, 160, 32);
        pdf.setLineWidth(0.3);
        pdf.line(15, y, W - 15, y);
        y += 4;
      };

      const sect = (title: string) => {
        if (y > 260) { pdf.addPage(); y = 15; }
        y += 2;
        pdf.setFillColor(232, 160, 32);
        pdf.rect(15, y - 4, W - 30, 6, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(title, 17, y);
        y += 5;
      };

      // ===== HEADER =====
      pdf.setFillColor(3, 3, 10);
      pdf.rect(0, 0, W, 30, "F");
      pdf.setTextColor(232, 160, 32);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("RELATÓRIO DE COMPETIÇÃO", W / 2, 12, { align: "center" });
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(200, 200, 200);
      pdf.text("nutriON · Competition Mode", W / 2, 18, { align: "center" });
      pdf.setFontSize(8);
      pdf.text(`Emitido em ${new Date(r.plano.data_relatorio).toLocaleDateString("pt-BR")}`, W / 2, 24, { align: "center" });
      y = 38;

      // ===== DADOS DA COMPETIÇÃO =====
      line(`${r.plano.atleta_nome}`, 14, true);
      line(`Categoria: ${r.plano.categoria} · Federação: ${r.plano.federacao}`, 9, false, [100, 100, 100]);
      line(`Competição: ${r.plano.nome_competicao}`, 9, false, [100, 100, 100]);
      line(`Data: ${new Date(r.plano.data_competicao).toLocaleDateString("pt-BR")}${r.plano.local_competicao ? ` · ${r.plano.local_competicao}` : ""}`, 9, false, [100, 100, 100]);
      line(`Coach: ${r.plano.coach_nome}`, 9, false, [100, 100, 100]);
      sep();

      // ===== BIOMETRIA =====
      sect("DADOS BIOMÉTRICOS");
      const b = r.biometria;
      line(`Peso inicial: ${b.peso_inicial} kg`);
      line(`Peso palco (alvo): ${b.peso_palco_alvo} kg`);
      line(`Peso final: ${b.peso_final} kg`);
      line(`Perda total: ${b.perda_total.toFixed(1)} kg`, 10, true, [232, 90, 30]);
      line(`Duração da prep: ${b.duracao_semanas} semanas`);
      line(`Altura: ${b.altura} cm`);

      sect("COMPOSIÇÃO CORPORAL");
      line(`BF inicial: ${b.bf_inicial !== null ? b.bf_inicial + "%" : "—"}`);
      line(`BF palco estimado: ${b.bf_final_estimado !== null ? b.bf_final_estimado + "%" : "—"}`);
      line(`Massa magra: ${b.massa_magra !== null ? b.massa_magra + " kg" : "—"}`);

      // ===== GRÁFICO DE PESO (texto + linha simples) =====
      if (r.progresso.peso_semana_a_semana.length > 0) {
        sect("PROGRESSO DE PESO");
        const pts = r.progresso.peso_semana_a_semana;
        const maxP = Math.max(...pts.map((p: any) => p.peso));
        const minP = Math.min(...pts.map((p: any) => p.peso), b.peso_palco_alvo);
        const range = maxP - minP || 1;
        const gW = W - 30;
        const gH = 30;
        const gX = 15;
        const gY = y;

        pdf.setDrawColor(220, 220, 220);
        pdf.rect(gX, gY, gW, gH);
        // alvo line
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineDashPattern([1, 1], 0);
        const yAlvo = gY + gH - ((b.peso_palco_alvo - minP) / range) * gH;
        pdf.line(gX, yAlvo, gX + gW, yAlvo);
        pdf.setLineDashPattern([], 0);
        // pontos
        pdf.setDrawColor(232, 160, 32);
        pdf.setFillColor(232, 160, 32);
        pdf.setLineWidth(0.5);
        const semMax = Math.max(...pts.map((p: any) => p.semana), b.duracao_semanas);
        let prev: { x: number; y: number } | null = null;
        pts.forEach((p: any) => {
          const x = gX + (p.semana / semMax) * gW;
          const yp = gY + gH - ((p.peso - minP) / range) * gH;
          pdf.circle(x, yp, 0.8, "F");
          if (prev) pdf.line(prev.x, prev.y, x, yp);
          prev = { x, y: yp };
        });
        y = gY + gH + 4;
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`linha pontilhada = peso alvo (${b.peso_palco_alvo}kg) · pontos = peso real semanal`, 15, y);
        y += 5;

        // tabela
        pdf.setFontSize(8);
        pdf.setTextColor(60, 60, 60);
        pts.forEach((p: any) => {
          if (y > 270) { pdf.addPage(); y = 15; }
          pdf.text(`Semana ${p.semana}: ${p.peso} kg${p.bf ? ` · BF ${p.bf}%` : ""}`, 17, y);
          y += 4;
        });
      }

      // ===== ADERÊNCIA =====
      sect("ADERÊNCIA");
      const a = r.aderencia;
      line(`Treinos: ${a.treino_pct}% das sessões`);
      line(`Nutrição: ${a.dieta_pct}% de aderência`);
      line(`Posing: ${a.posing_horas_total} horas totais (${a.posing_min_total} min)`);
      line(`Recovery médio: ${a.recovery_medio}/10`);
      line(`Sono médio: ${a.sono_medio}/10`);
      line(`Energia média: ${a.energia_media}/10`);
      line(`Check-ins realizados: ${a.check_ins_realizados}`);
      if (a.binge_episodios > 0) {
        line(`Episódios de binge: ${a.binge_episodios}`, 10, true, [220, 90, 30]);
      }

      // ===== ASSINATURA =====
      if (y > 240) { pdf.addPage(); y = 15; }
      y += 15;
      sep();
      y += 8;
      pdf.setDrawColor(50, 50, 50);
      pdf.line(W / 2 - 40, y, W / 2 + 40, y);
      y += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(50, 50, 50);
      pdf.text(r.plano.coach_nome, W / 2, y, { align: "center" });
      y += 4;
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text("Coach responsável", W / 2, y, { align: "center" });
      y += 4;
      pdf.text(`Relatório emitido em ${new Date(r.plano.data_relatorio).toLocaleDateString("pt-BR")}`, W / 2, y, { align: "center" });

      // Footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`nutriON Competition Mode · página ${i}/${pageCount}`, W / 2, 290, { align: "center" });
      }

      const fileName = `relatorio-${r.plano.atleta_nome.replace(/\s+/g, "_")}-${r.plano.nome_competicao.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
      toast({ title: "Relatório gerado", description: fileName });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Relatório final pós-competição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Gera um PDF consolidado com biometria, composição corporal, progresso semanal,
          aderência treino/dieta/posing e assinatura do coach.
        </p>
        <Button onClick={generate} disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Compilando relatório...</>
          ) : (
            <><FileDown className="w-4 h-4 mr-2" />Gerar relatório PDF</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompetitionReportGenerator;
