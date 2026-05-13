import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trophy, Calendar, Activity, FlaskConical, Loader2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string; // coach_profiles.id
  athleteId: string; // auth.users.id
  athleteName?: string;
  onCreated?: (planId: string) => void;
}

const FEDERACOES = ["IFBB Pro", "IFBB Elite", "NPC", "NABBA", "WFF", "WBPF", "Outra"];
const CATEGORIAS = ["Shape Lifestyle", "Classic Physique", "Men's Physique", "Bodybuilding", "212", "Wellness", "Bikini", "Figure", "Women's Physique", "Outra"];

const CoachCompetitionWizard = ({ open, onOpenChange, coachId, athleteId, athleteName, onCreated }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Competição
  const [nomeCompeticao, setNomeCompeticao] = useState("");
  const [federacao, setFederacao] = useState("IFBB Pro");
  const [categoria, setCategoria] = useState("");
  const [dataCompeticao, setDataCompeticao] = useState("");
  const [localCompeticao, setLocalCompeticao] = useState("");

  // Step 2 — Biometria
  const [pesoAtual, setPesoAtual] = useState("");
  const [altura, setAltura] = useState("");
  const [bfAtual, setBfAtual] = useState("");
  const [massaMagra, setMassaMagra] = useState("");
  const [pesoAlvoPalco, setPesoAlvoPalco] = useState("");
  const [pesoLimiteCategoria, setPesoLimiteCategoria] = useState("");

  // Step 3 — Farmacológico
  const [protocoloFarmacologico, setProtocoloFarmacologico] = useState("");

  const reset = () => {
    setStep(1);
    setNomeCompeticao(""); setFederacao("IFBB Pro"); setCategoria("Classic Physique");
    setDataCompeticao(""); setLocalCompeticao("");
    setPesoAtual(""); setAltura(""); setBfAtual(""); setMassaMagra("");
    setPesoAlvoPalco(""); setPesoLimiteCategoria("");
    setProtocoloFarmacologico("");
  };

  const semanasAteComp = (() => {
    if (!dataCompeticao) return 0;
    const diff = new Date(dataCompeticao).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)));
  })();

  const perdaTotalKg = pesoAtual && pesoAlvoPalco ? (Number(pesoAtual) - Number(pesoAlvoPalco)).toFixed(1) : "—";

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!nomeCompeticao.trim() || !dataCompeticao) {
        toast({ title: "Preencha nome e data da competição", variant: "destructive" });
        return false;
      }
      if (semanasAteComp < 4) {
        toast({ title: "Data muito próxima", description: "Mínimo 4 semanas até a competição.", variant: "destructive" });
        return false;
      }
    }
    if (step === 2) {
      if (!pesoAtual || !altura || !pesoAlvoPalco) {
        toast({ title: "Peso atual, altura e peso alvo são obrigatórios", variant: "destructive" });
        return false;
      }
      if (Number(pesoAlvoPalco) >= Number(pesoAtual)) {
        toast({ title: "Peso alvo deve ser menor que peso atual", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(step + 1); };
  const back = () => setStep(Math.max(1, step - 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      // 1) cria plano
      const { data: plan, error: insertError } = await supabase
        .from("competition_plans" as any)
        .insert({
          coach_id: coachId,
          athlete_id: athleteId,
          nome_competicao: nomeCompeticao,
          federacao,
          categoria: categoria || null,
          data_competicao: dataCompeticao,
          local_competicao: localCompeticao || null,
          peso_atual: Number(pesoAtual),
          altura: Number(altura),
          bf_atual: bfAtual ? Number(bfAtual) : null,
          massa_magra: massaMagra ? Number(massaMagra) : null,
          peso_alvo_palco: Number(pesoAlvoPalco),
          peso_limite_categoria: pesoLimiteCategoria ? Number(pesoLimiteCategoria) : null,
          protocolo_farmacologico: protocoloFarmacologico || null,
        })
        .select("id")
        .single();

      if (insertError || !plan) throw insertError || new Error("Falha ao criar plano");
      const planId = (plan as any).id as string;

      // 2) calcula blocos via edge function
      const { data: { session } } = await supabase.auth.getSession();
      const calcRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-competition-blocks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            plan_id: planId,
            data_competicao: dataCompeticao,
            peso_atual: Number(pesoAtual),
            peso_alvo_palco: Number(pesoAlvoPalco),
            bf_atual: bfAtual ? Number(bfAtual) : undefined,
            altura: Number(altura),
            protocolo_farmacologico: protocoloFarmacologico || undefined,
            federacao,
            categoria,
          }),
        }
      );

      if (!calcRes.ok) {
        const err = await calcRes.json().catch(() => ({}));
        throw new Error(err.error || "Falha ao calcular blocos");
      }

      toast({ title: "Plano criado!", description: "Blocos calculados com sucesso." });
      reset();
      onOpenChange(false);
      onCreated?.(planId);
      navigate(`/coach/competition/${planId}`);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erro", description: e.message || "Tente novamente", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Criar Plano de Competição
            {athleteName && <span className="text-sm font-normal text-muted-foreground">— {athleteName}</span>}
          </DialogTitle>
          <DialogDescription>
            Etapa {step} de 3 — {step === 1 ? "Dados da competição" : step === 2 ? "Biometria do atleta" : "Protocolo farmacológico"}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex gap-1 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* STEP 1 — COMPETIÇÃO */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome da competição *</Label>
              <Input value={nomeCompeticao} onChange={(e) => setNomeCompeticao(e.target.value)} placeholder="Ex: Mr. Olympia Brasil 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Federação</Label>
                <Select value={federacao} onValueChange={setFederacao}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FEDERACOES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Categoria (opcional)</Label>
                <Select value={categoria || "__none__"} onValueChange={(v) => setCategoria(v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="— Sem categoria —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Sem categoria (cliente) —</SelectItem>
                    {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Data da competição *</Label>
                <Input type="date" value={dataCompeticao} onChange={(e) => setDataCompeticao(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Local (opcional)</Label>
                <Input value={localCompeticao} onChange={(e) => setLocalCompeticao(e.target.value)} placeholder="Cidade, país" />
              </div>
            </div>

            {dataCompeticao && (
              <Card className="bg-primary/5 border-primary/20 p-3">
                <p className="text-xs flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary" />
                  <span><span className="font-bold text-primary">{semanasAteComp} semanas</span> até a competição</span>
                </p>
                {semanasAteComp < 12 && semanasAteComp >= 4 && (
                  <p className="text-[11px] text-yellow-500 mt-1">⚠️ Janela curta — prep agressivo</p>
                )}
                {semanasAteComp >= 16 && (
                  <p className="text-[11px] text-green-500 mt-1">✓ Janela ideal para prep otimizado</p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* STEP 2 — BIOMETRIA */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Peso atual (kg) *</Label>
                <Input type="number" step="0.1" value={pesoAtual} onChange={(e) => setPesoAtual(e.target.value)} placeholder="92.5" />
              </div>
              <div>
                <Label className="text-xs">Altura (cm) *</Label>
                <Input type="number" step="0.1" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="178" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">BF atual (%)</Label>
                <Input type="number" step="0.1" value={bfAtual} onChange={(e) => setBfAtual(e.target.value)} placeholder="14.5" />
              </div>
              <div>
                <Label className="text-xs">Massa magra (kg)</Label>
                <Input type="number" step="0.1" value={massaMagra} onChange={(e) => setMassaMagra(e.target.value)} placeholder="79" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Peso alvo no palco (kg) *</Label>
                <Input type="number" step="0.1" value={pesoAlvoPalco} onChange={(e) => setPesoAlvoPalco(e.target.value)} placeholder="84" />
              </div>
              <div>
                <Label className="text-xs">Limite categoria (kg)</Label>
                <Input type="number" step="0.1" value={pesoLimiteCategoria} onChange={(e) => setPesoLimiteCategoria(e.target.value)} placeholder="85" />
              </div>
            </div>

            {pesoAtual && pesoAlvoPalco && (
              <Card className="bg-orange-500/5 border-orange-500/20 p-3 space-y-1">
                <p className="text-xs flex items-center gap-2">
                  <Activity className="w-3 h-3 text-orange-500" />
                  <span>Perda total: <span className="font-bold text-orange-500">{perdaTotalKg} kg</span></span>
                </p>
                {semanasAteComp > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Taxa média: <span className="text-foreground font-medium">{(Number(perdaTotalKg) / semanasAteComp).toFixed(2)} kg/semana</span> ({((Number(perdaTotalKg) / semanasAteComp / Number(pesoAtual)) * 100).toFixed(2)}%/sem)
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* STEP 3 — FARMA */}
        {step === 3 && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-primary" />
                Protocolo farmacológico (opcional, confidencial)
              </Label>
              <Textarea
                value={protocoloFarmacologico}
                onChange={(e) => setProtocoloFarmacologico(e.target.value)}
                placeholder={"Ex:\nTestosterona Cipionato 500mg/sem\nNandrolona Decanoato 300mg/sem\nMasteron 400mg/sem\nT3 25mcg/dia\nClembuterol cycled\nGH 4UI/dia\nCJC + Ipamorelin 100mcg 3x/dia"}
                rows={8}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Detectaremos compostos anabólicos para ajustar a taxa de perda alvo (0.55%/sem natural vs 0.7%/sem com suporte).
              </p>
            </div>

            <Card className="bg-primary/5 border-primary/20 p-3 space-y-1">
              <p className="text-xs font-semibold text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Resumo do plano
              </p>
              <div className="text-[11px] space-y-0.5 text-muted-foreground">
                <p>▸ <span className="text-foreground">{nomeCompeticao || "—"}</span> ({federacao} / {categoria || "sem categoria"})</p>
                <p>▸ Data: {dataCompeticao || "—"} ({semanasAteComp} semanas)</p>
                <p>▸ Peso: {pesoAtual} kg → {pesoAlvoPalco} kg (perda {perdaTotalKg} kg)</p>
                {bfAtual && <p>▸ BF inicial: {bfAtual}%</p>}
              </div>
            </Card>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={back} disabled={step === 1 || submitting}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          {step < 3 ? (
            <Button size="sm" onClick={next}>
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={submitting} className="bg-primary text-primary-foreground">
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Calculando blocos…</> : <><Sparkles className="w-4 h-4 mr-1" /> Criar e calcular plano</>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoachCompetitionWizard;
