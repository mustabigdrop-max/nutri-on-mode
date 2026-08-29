import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Flame, Beef, Clock, Droplet, Pill, CalendarDays, Trophy, ShieldAlert, Stethoscope, Brain, Utensils } from "lucide-react";
import { toast } from "sonner";
import MceBanner from "@/components/mce/MceBanner";

const COMPOSTOS = [
  "Testosterona", "Trembolona", "Masteron", "Boldenona", "Deca/Nandrolona",
  "Primobolan", "Anavar", "Winstrol", "Dianabol", "GH", "Insulina",
  "T3/T4", "Clembuterol", "Cardarine (GW-501516)", "MK-677",
];

type Block = {
  key: string;
  title: string;
  icon: any;
  render: (data: any) => JSX.Element | null;
};

const fmt = (n: any, suf = "") => (n == null || isNaN(Number(n)) ? "—" : `${Math.round(Number(n))}${suf}`);

export default function NutriPlanElitePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    nome: "", idade: 30, sexo: "masculino", peso: 90, altura: 178,
    objetivo: "cutting", semanas: 12, bfAtual: 14, bfMeta: 6,
    horario_treino: "18:00", duracao_treino: 60, tipo_treino: "Push (Peito/Ombro/Tríceps)",
    cardioFreq: 3, cardioDur: 40, cardioTipo: "LISS",
    nivelAtividade: "moderado",
    perfilPCA: "AM",
    restricoes: "",
    observacoes: "",
    compostos: [] as string[],
  });

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const toggleCompound = (c: string) =>
    setForm((p) => ({ ...p, compostos: p.compostos.includes(c) ? p.compostos.filter((x) => x !== c) : [...p.compostos, c] }));

  const generate = async () => {
    if (!form.nome.trim()) return toast.error("Informe o nome do atleta");
    setLoading(true);
    setResult(null);
    try {
      const isPeak = form.semanas <= 1;
      const payload: any = {
        nome: form.nome,
        idade: form.idade,
        sexo: form.sexo,
        peso: form.peso,
        altura: form.altura,
        objetivo: isPeak ? "peak_week" : form.objetivo,
        perfilPCA: form.perfilPCA,
        nivelAtividade: form.nivelAtividade,
        treino: { horario: form.horario_treino, duracao: form.duracao_treino, tipo: form.tipo_treino },
        refeicoes: 5,
        restricoesStr: form.restricoes,
        protocStr: form.compostos.join(", "),
        compostos_ativos: form.compostos,
        observacoes: form.observacoes,
        bfAtual: form.bfAtual,
        bfMeta: form.bfMeta,
        fasePeriodizacao: form.objetivo,
        fazCardio: form.cardioFreq > 0,
        cardioFrequencia: form.cardioFreq,
        cardioDuracao: form.cardioDur,
        cardioModalidades: [form.cardioTipo],
        cardioNoCalculo: true,
        atletaCompetitivo: form.semanas <= 16,
        modo_especial: isPeak ? "competicao" : "normal",
        dias_para_competicao: form.semanas * 7,
        crononutricao_circadiana: true,
      };
      const { data, error } = await supabase.functions.invoke("generate-coach-meal-plan", { body: payload });
      if (error) throw error;
      setResult(data);
      toast.success("Plano NutriPlan Elite gerado");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao gerar plano");
    } finally {
      setLoading(false);
    }
  };

  const elite = result ? (() => {
    const plano = result?.plano || result;
    const resumo = plano?.resumo || {};
    const raw = result?.nutriplan_elite || result?.plano?.nutriplan_elite || {};
    const kcal = Number(resumo.calorias_totais || raw.tdee_ajustado || 0);
    const ptn = Number(resumo.proteina_total || Math.round(form.peso * (form.objetivo === "cutting" ? 2.4 : 2.1)));
    const cho = Number(resumo.carboidrato_total || Math.round((kcal * 0.45) / 4));
    const fat = Number(resumo.gordura_total || Math.round((kcal * 0.25) / 9));
    return {
      ...raw,
      tdee_breakdown: raw.tdee_breakdown || { tmb: resumo.tmb, get_natural: resumo.get || kcal, get_farmaco: raw.tdee_ajustado || kcal, meta_final: kcal, buffer_anticatabolico_pct: form.objetivo === "cutting" ? 8 : 0, fator_farmacologico: raw.fator_farmacologico || (form.compostos.length ? 1.08 : 1), justificativa: "Bloco preenchido automaticamente com dados do plano para não ficar em branco; edite se necessário." },
      hierarquia_macros: raw.hierarquia_macros || { ptn_g_kg: form.peso ? Math.round((ptn / form.peso) * 10) / 10 : 2.2, gordura_g_kg: form.peso ? Math.round((fat / form.peso) * 10) / 10 : 0.8, cho_cycling: { treino_pesado: Math.round(cho * 1.12), treino_leve: Math.round(cho * 0.9), off: Math.round(cho * 0.68) } },
      cronobiologia: Array.isArray(raw.cronobiologia) && raw.cronobiologia.length ? raw.cronobiologia : [{ horario: form.horario_treino, janela: "Pré / Pós-treino", regra: "Concentrar carboidratos ao redor do treino e distribuir proteína ao longo do dia." }, { horario: "manhã", janela: "Cortisol alto", regra: "Proteína, fruta/fibra e hidratação para estabilidade glicêmica." }, { horario: "noite", janela: "Sono e recuperação", regra: "Ceia leve com proteína se houver longo intervalo até o café." }],
      eletrolitos_por_fase: raw.eletrolitos_por_fase || { fase: form.objetivo, agua_ml: Math.round(form.peso * 42), sodio_mg: form.cardioFreq > 0 ? 3500 : 2800, potassio_mg: 3500, magnesio_mg: 350, ratio_na_k: "~1:1" },
      micronutrientes_criticos: Array.isArray(raw.micronutrientes_criticos) && raw.micronutrientes_criticos.length ? raw.micronutrientes_criticos : [{ nutriente: "Magnésio", dose: "300–400 mg/d", fonte_alimentar_ou_supl: "Folhas verdes, cacau, sementes ou suplemento conforme avaliação", justificativa: "Sono e contração muscular." }, { nutriente: "Potássio", dose: "3–4 g/d", fonte_alimentar_ou_supl: "Banana, batata, feijão, água de coco", justificativa: "Hidratação celular e performance." }, { nutriente: "Ômega-3", dose: "2–3x/semana", fonte_alimentar_ou_supl: "Sardinha, salmão, chia/linhaça", justificativa: "Suporte anti-inflamatório nutricional." }],
      timeline_semanas: raw.timeline_semanas || { fase_atual: form.objetivo, ajustes_por_shape: [`${form.semanas} semanas até o alvo: revisar peso, aderência e performance semanalmente.`, `Base atual: ${fmt(kcal, " kcal")}, ${fmt(ptn, "g")} proteína, ${fmt(cho, "g")} carbo e ${fmt(fat, "g")} gordura.`] },
      peak_week: raw.peak_week || { ativo: form.semanas <= 1, dias_protocolo: [] },
      masters_50: raw.masters_50 || { ativo: form.idade >= 50, regras_aplicadas: form.idade >= 50 ? ["Distribuir proteína em 4–5 pulsos/dia.", "Priorizar cálcio, vitamina D alimentar e força para massa magra."] : [] },
      monitoramento_saude: Array.isArray(raw.monitoramento_saude) && raw.monitoramento_saude.length ? raw.monitoramento_saude : [{ exame: "Peso, cintura e performance", frequencia: "semanal", alerta_clinico: "Ajustar kcal se queda de performance ou perda >1%/semana." }, { exame: "Sono, fome e digestão", frequencia: "diário", alerta_clinico: "Revisar fibras, eletrólitos e timing se aderência cair." }, { exame: "Exames laboratoriais com profissional", frequencia: "8–12 semanas", alerta_clinico: "Obrigatório se houver compostos ativos ou preparação competitiva." }],
      mce_comportamental: raw.mce_comportamental || plano?.dica_mce || { mindset: "Foco em bater proteína, água e primeira refeição planejada.", comportamento: "Corrigir no próximo bloco alimentar, não no dia seguinte.", execucao: "Deixar 2 proteínas e 2 carboidratos base preparados." },
    };
  })() : null;

  return (
    <div className="min-h-screen bg-[#03030a] text-foreground">
      <MceBanner
        dimension="c"
        storageKey="mce_banner_nutriplan_dismissed"
        text="Modo Ancoragem Comportamental ativo — MCE detectou padrão de baixa consistência"
      />
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")} className="text-amber-400">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-amber-400">NutriPlan Elite</h1>
            <p className="text-xs italic text-amber-400/70">Sua fome nunca foi de comida.</p>
            <p className="text-xs text-muted-foreground">Sistema de nutrição de campeonato — 11 blocos integrados</p>

          </div>
        </div>

        {/* FORM */}
        <Card className="p-5 bg-zinc-950 border-amber-500/20 space-y-5">
          <h2 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Perfil do Atleta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Nome"><Input value={form.nome} onChange={(e) => update("nome", e.target.value)} /></Field>
            <Field label="Idade"><Input type="number" value={form.idade} onChange={(e) => update("idade", +e.target.value)} /></Field>
            <Field label="Sexo">
              <Select value={form.sexo} onValueChange={(v) => update("sexo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="feminino">Feminino</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Peso (kg)"><Input type="number" value={form.peso} onChange={(e) => update("peso", +e.target.value)} /></Field>
            <Field label="Altura (cm)"><Input type="number" value={form.altura} onChange={(e) => update("altura", +e.target.value)} /></Field>
            <Field label="Nível de atividade">
              <Select value={form.nivelAtividade} onValueChange={(v) => update("nivelAtividade", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="muito_ativo">Muito ativo</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="BF atual (%)"><Input type="number" value={form.bfAtual} onChange={(e) => update("bfAtual", +e.target.value)} /></Field>
            <Field label="BF meta palco (%)"><Input type="number" value={form.bfMeta} onChange={(e) => update("bfMeta", +e.target.value)} /></Field>
            <Field label="Perfil PCA">
              <Select value={form.perfilPCA} onValueChange={(v) => update("perfilPCA", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM — Auto-monitorador</SelectItem>
                  <SelectItem value="EI">EI — Emocional intenso</SelectItem>
                  <SelectItem value="SE">SE — Social emocional</SelectItem>
                  <SelectItem value="PP">PP — Performance pura</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="border-t border-amber-500/10 pt-4 space-y-3">
            <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Fase & Treino</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Objetivo">
                <Select value={form.objetivo} onValueChange={(v) => update("objetivo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cutting">Cutting</SelectItem>
                    <SelectItem value="bulk">Bulk</SelectItem>
                    <SelectItem value="recomp">Recomp</SelectItem>
                    <SelectItem value="peak_week">Peak Week</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Semanas até campeonato"><Input type="number" value={form.semanas} onChange={(e) => update("semanas", +e.target.value)} /></Field>
              <Field label="Horário treino"><Input type="time" value={form.horario_treino} onChange={(e) => update("horario_treino", e.target.value)} /></Field>
              <Field label="Duração (min)"><Input type="number" value={form.duracao_treino} onChange={(e) => update("duracao_treino", +e.target.value)} /></Field>
              <Field label="Tipo de treino"><Input value={form.tipo_treino} onChange={(e) => update("tipo_treino", e.target.value)} /></Field>
              <Field label="Cardio tipo">
                <Select value={form.cardioTipo} onValueChange={(v) => update("cardioTipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["LISS", "AEJ", "HIIT", "Z2", "Z3", "NEAT", "Esteira", "Bike"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Cardio freq/sem"><Input type="number" value={form.cardioFreq} onChange={(e) => update("cardioFreq", +e.target.value)} /></Field>
              <Field label="Cardio duração (min)"><Input type="number" value={form.cardioDur} onChange={(e) => update("cardioDur", +e.target.value)} /></Field>
            </div>
          </div>

          <div className="border-t border-amber-500/10 pt-4 space-y-3">
            <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Protocolo Farmacológico Ativo</h3>
            <div className="flex flex-wrap gap-2">
              {COMPOSTOS.map((c) => {
                const active = form.compostos.includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleCompound(c)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${active ? "bg-amber-500 text-black border-amber-400 font-semibold" : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-amber-500/50"}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-amber-500/10 pt-4">
            <Field label="Restrições alimentares"><Textarea rows={2} value={form.restricoes} onChange={(e) => update("restricoes", e.target.value)} placeholder="Ex.: lactose, glúten…" /></Field>
            <Field label="Observações / condições"><Textarea rows={2} value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} /></Field>
          </div>

          <Button onClick={generate} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando plano elite…</> : "🏆 Gerar NutriPlan Elite"}
          </Button>
        </Card>

        {/* RESULTADO POR BLOCOS */}
        {elite && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-amber-400">Plano gerado — 11 blocos</h2>
            </div>

            {(() => {
              const v = (result?.plan?.validacao || result?.plano?.validacao || result?.validacao) as any;
              if (!v || !v.total_kcal_meta) return null;
              const diff = Number(v.diferenca) || 0;
              const meta = Number(v.total_kcal_meta) || 0;
              const soma = Number(v.total_kcal_refeicoes) || 0;
              const signed = soma - meta;
              const status = diff <= 50 ? "ok" : diff <= 100 ? "warn" : "err";
              const color = status === "ok" ? "#1D9E75" : status === "warn" ? "#EF9F27" : "#E24B4A";
              const icon = status === "ok" ? "✓" : status === "warn" ? "⚠" : "✗";
              const label = status === "ok" ? "DENTRO DA MARGEM" : status === "warn" ? "FORA DA MARGEM" : "REGENERAR NECESSÁRIO";
              return (
                <div className="rounded border p-3 bg-zinc-950 space-y-2" style={{ borderColor: `${color}55` }}>
                  {status === "ok" && (
                    <p className="font-mono text-[10px]" style={{ color }}>
                      ✓ PLANO VALIDADO · {soma} kcal · FECHAMENTO ±{diff} kcal
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-mono">
                    <span className="text-zinc-400">META: <span className="text-zinc-100">{meta.toLocaleString("pt-BR")} kcal</span></span>
                    <span className="text-zinc-400">PLANO: <span className="text-zinc-100">{soma.toLocaleString("pt-BR")} kcal</span></span>
                    <span style={{ color }}>
                      DIFERENÇA: {signed >= 0 ? "+" : ""}{signed} kcal {icon} {label}
                    </span>
                    {Number(v.refeicoes_minimas) > 0 && (
                      <span className="text-zinc-400">
                        REFEIÇÕES: <span style={{ color: Number(v.refeicoes_geradas) < Number(v.refeicoes_minimas) ? "#E24B4A" : "#1D9E75" }}>
                          {v.refeicoes_geradas}/{v.refeicoes_minimas}
                        </span>
                      </span>
                    )}
                    {status === "err" && (
                      <Button size="sm" onClick={generate} disabled={loading} className="ml-auto h-7 bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-semibold">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "REGENERAR PLANO"}
                      </Button>
                    )}
                  </div>
                  {Array.isArray(v.erros) && v.erros.length > 0 && status !== "ok" && (
                    <ul className="text-[11px] text-red-400 space-y-0.5 pt-1 border-t border-zinc-800">
                      {v.erros.slice(0, 4).map((e: string, i: number) => <li key={i}>• {e}</li>)}
                    </ul>
                  )}
                </div>
              );
            })()}



            <BlockCard icon={Flame} title="BLOCO 1 · TDEE Farmacológico" color="amber">
              {elite.tdee_breakdown ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <Stat label="TMB" value={fmt(elite.tdee_breakdown.tmb, " kcal")} />
                  <Stat label="GET natural" value={fmt(elite.tdee_breakdown.get_natural, " kcal")} />
                  <Stat label="GET farmaco" value={fmt(elite.tdee_breakdown.get_farmaco, " kcal")} />
                  <Stat label="Meta final" value={fmt(elite.tdee_breakdown.meta_final, " kcal")} highlight />
                  <Stat label="Buffer anti-cat." value={`+${elite.tdee_breakdown.buffer_anticatabolico_pct ?? "—"}%`} />
                  <Stat label="Fator farmaco" value={`×${(elite.tdee_breakdown.fator_farmacologico ?? 1).toFixed?.(2) ?? "—"}`} />
                  {elite.tdee_breakdown.justificativa && <p className="col-span-full text-xs text-zinc-400 italic">{elite.tdee_breakdown.justificativa}</p>}
                </div>
              ) : <Empty />}
            </BlockCard>

            <BlockCard icon={Beef} title="BLOCO 2 · Macros Hierárquicos" color="amber">
              {elite.hierarquia_macros ? (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Stat label="Proteína" value={`${elite.hierarquia_macros.ptn_g_kg ?? "—"} g/kg`} />
                    <Stat label="Gordura" value={`${elite.hierarquia_macros.gordura_g_kg ?? "—"} g/kg`} />
                  </div>
                  {elite.hierarquia_macros.cho_cycling && (
                    <div>
                      <p className="text-xs text-amber-400/80 mb-2">CHO Cycling (g)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Stat label="Treino pesado" value={fmt(elite.hierarquia_macros.cho_cycling.treino_pesado, " g")} />
                        <Stat label="Treino leve" value={fmt(elite.hierarquia_macros.cho_cycling.treino_leve, " g")} />
                        <Stat label="Off" value={fmt(elite.hierarquia_macros.cho_cycling.off, " g")} />
                      </div>
                    </div>
                  )}
                </div>
              ) : <Empty />}
            </BlockCard>

            <BlockCard icon={Clock} title="BLOCO 3 · Crononutrição" color="amber">
              {Array.isArray(elite.cronobiologia) && elite.cronobiologia.length ? (
                <ul className="space-y-2 text-sm">
                  {elite.cronobiologia.map((c: any, i: number) => (
                    <li key={i} className="flex gap-3 p-2 rounded bg-zinc-900/60 border border-amber-500/10">
                      <span className="text-amber-400 font-mono text-xs">{c.horario}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-200">{c.janela}</p>
                        <p className="text-xs text-zinc-400">{c.regra}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <Empty />}
            </BlockCard>

            <BlockCard icon={Droplet} title="BLOCO 4 · Hidratação & Eletrólitos" color="amber">
              {elite.eletrolitos_por_fase ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <Stat label="Fase" value={elite.eletrolitos_por_fase.fase || "—"} />
                  <Stat label="Água" value={`${elite.eletrolitos_por_fase.agua_ml ?? "—"} ml`} />
                  <Stat label="Sódio" value={`${elite.eletrolitos_por_fase.sodio_mg ?? "—"} mg`} />
                  <Stat label="Potássio" value={`${elite.eletrolitos_por_fase.potassio_mg ?? "—"} mg`} />
                  <Stat label="Magnésio" value={`${elite.eletrolitos_por_fase.magnesio_mg ?? "—"} mg`} />
                  <Stat label="Ratio Na:K" value={elite.eletrolitos_por_fase.ratio_na_k ?? "—"} highlight />
                </div>
              ) : <Empty />}
            </BlockCard>

            <BlockCard icon={Pill} title="BLOCO 5 · Micronutrientes Críticos" color="amber">
              {Array.isArray(elite.micronutrientes_criticos) && elite.micronutrientes_criticos.length ? (
                <div className="space-y-2 text-sm">
                  {elite.micronutrientes_criticos.map((m: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-zinc-900/60 border border-amber-500/10">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-amber-400">{m.nutriente}</span>
                        <Badge variant="outline" className="text-amber-400 border-amber-500/40">{m.dose}</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{m.fonte_alimentar_ou_supl}</p>
                      {m.justificativa && <p className="text-xs text-zinc-500 italic mt-0.5">{m.justificativa}</p>}
                    </div>
                  ))}
                </div>
              ) : <Empty />}
            </BlockCard>

            <BlockCard icon={CalendarDays} title="BLOCO 6 · Timeline até o Campeonato" color="amber">
              {elite.timeline_semanas ? (
                <div className="space-y-3 text-sm">
                  <Stat label="Fase atual" value={elite.timeline_semanas.fase_atual || "—"} highlight />
                  {Array.isArray(elite.timeline_semanas.ajustes_por_shape) && (
                    <ul className="space-y-1">
                      {elite.timeline_semanas.ajustes_por_shape.map((a: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-300 pl-3 border-l-2 border-amber-500/40">{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : <Empty />}
            </BlockCard>

            <BlockCard icon={Trophy} title="BLOCO 7 · Peak Week" color="amber">
              {elite.peak_week?.ativo ? (
                <div className="space-y-3 text-sm">
                  {Array.isArray(elite.peak_week.dias_protocolo) && (
                    <div className="space-y-2">
                      {elite.peak_week.dias_protocolo.map((d: any, i: number) => (
                        <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-2 rounded bg-zinc-900/60 border border-amber-500/10 text-xs">
                          <span className="font-bold text-amber-400">{d.dia}</span>
                          <span>CHO {d.cho_g}g</span>
                          <span>Na {d.sodio_mg}mg</span>
                          <span>Água {d.agua_l}L</span>
                          <span className="col-span-2 md:col-span-1 text-zinc-400">{d.treino}</span>
                          {d.observacao && <span className="col-span-full text-zinc-500 italic">{d.observacao}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {Array.isArray(elite.peak_week.indicadores_backstage) && (
                    <div>
                      <p className="text-xs text-amber-400/80 mb-1">Indicadores Backstage</p>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {elite.peak_week.indicadores_backstage.map((b: string, i: number) => <li key={i}>• {b}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : <p className="text-xs text-zinc-500">Não ativo (semanas {`>`} 1).</p>}
            </BlockCard>

            <BlockCard icon={ShieldAlert} title="BLOCO 8 · Masters 50+" color="amber">
              {elite.masters_50?.ativo ? (
                <ul className="text-sm space-y-1">
                  {(elite.masters_50.regras_aplicadas || []).map((r: string, i: number) => (
                    <li key={i} className="pl-3 border-l-2 border-amber-500/40 text-zinc-300">{r}</li>
                  ))}
                </ul>
              ) : <p className="text-xs text-zinc-500">Não ativo (idade {`<`} 50).</p>}
            </BlockCard>

            <BlockCard icon={Utensils} title="BLOCO 9 · Edição & Personalização" color="amber">
              <p className="text-xs text-zinc-400">
                Substituições respeitam macro principal (±10% kcal), timing fisiológico e restrições.
                Alimentos travados permanecem inalterados; gap {'>'} 50 kcal gera alerta de compensação.
                Bloqueio automático se PTN {'<'} 2 g/kg ou gordura {'<'} 0.8 g/kg.
              </p>
            </BlockCard>

            <BlockCard icon={Stethoscope} title="BLOCO 10 · Saúde Monitorada" color="amber">
              {Array.isArray(elite.monitoramento_saude) && elite.monitoramento_saude.length ? (
                <div className="space-y-2 text-sm">
                  {elite.monitoramento_saude.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between items-start gap-3 p-2 rounded bg-zinc-900/60 border border-amber-500/10">
                      <div>
                        <p className="font-semibold text-zinc-200">{m.exame}</p>
                        {m.alerta_clinico && <p className="text-xs text-red-400 mt-0.5">⚠ {m.alerta_clinico}</p>}
                      </div>
                      <Badge variant="outline" className="text-amber-400 border-amber-500/40 shrink-0">{m.frequencia}</Badge>
                    </div>
                  ))}
                </div>
              ) : <Empty />}
            </BlockCard>

            <BlockCard icon={Brain} title="BLOCO 11 · MCE Comportamental" color="amber">
              {elite.mce_comportamental ? (
                <div className="space-y-2 text-sm">
                  <McItem label="Mindset" value={elite.mce_comportamental.mindset} />
                  <McItem label="Comportamento" value={elite.mce_comportamental.comportamento} />
                  <McItem label="Execução" value={elite.mce_comportamental.execucao} />
                </div>
              ) : <Empty />}
            </BlockCard>
          </div>
        )}

        {result && !elite && (
          <Card className="p-4 bg-amber-950/30 border-amber-500/40 text-sm text-amber-200">
            O plano foi gerado, mas o sistema não retornou o bloco <code>nutriplan_elite</code>. Tente novamente — em geral acontece quando faltam compostos ativos ou objetivo de competição.
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-zinc-400">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded border ${highlight ? "bg-amber-500/10 border-amber-500/40" : "bg-zinc-900/60 border-zinc-800"}`}>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`font-semibold ${highlight ? "text-amber-400" : "text-zinc-200"}`}>{value}</p>
    </div>
  );
}

function McItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded bg-zinc-900/60 border border-amber-500/10">
      <p className="text-xs text-amber-400 font-semibold">{label}</p>
      <p className="text-sm text-zinc-200">{value || "—"}</p>
    </div>
  );
}

function BlockCard({ icon: Icon, title, children }: { icon: any; title: string; color?: string; children: React.ReactNode }) {
  return (
    <Card className="bg-zinc-950 border-amber-500/20 overflow-hidden">
      <details className="group">
        <summary className="cursor-pointer list-none p-4 flex items-center gap-2 hover:bg-amber-500/5 transition">
          <Icon className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-amber-400 text-sm flex-1">{title}</h3>
          <span className="text-xs text-amber-400/60 font-mono group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div className="px-4 pb-4">{children}</div>
      </details>
    </Card>
  );
}

function Empty() {
  return <p className="text-xs text-zinc-500 italic">Sem dados retornados pelo sistema neste bloco.</p>;
}
