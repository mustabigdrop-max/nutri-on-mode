import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PerformanceExam } from "@/hooks/usePerformancePro";
import { Plus, Activity } from "lucide-react";

const EXAM_FIELDS: { key: keyof PerformanceExam; label: string; unit: string; greenMax: number; yellowMax: number }[] = [
  { key: "ldl", label: "LDL", unit: "mg/dL", greenMax: 130, yellowMax: 160 },
  { key: "hdl", label: "HDL", unit: "mg/dL", greenMax: 999, yellowMax: 40 },
  { key: "triglycerides", label: "Triglicerídeos", unit: "mg/dL", greenMax: 150, yellowMax: 200 },
  { key: "tgo", label: "TGO", unit: "U/L", greenMax: 40, yellowMax: 80 },
  { key: "tgp", label: "TGP", unit: "U/L", greenMax: 41, yellowMax: 100 },
  { key: "ggt", label: "GGT", unit: "U/L", greenMax: 60, yellowMax: 120 },
  { key: "hematocrit", label: "Hematócrito", unit: "%", greenMax: 50, yellowMax: 54 },
  { key: "hemoglobin", label: "Hemoglobina", unit: "g/dL", greenMax: 17, yellowMax: 18.5 },
  { key: "testosterone_total", label: "Testosterona Total", unit: "ng/dL", greenMax: 9999, yellowMax: 0 },
  { key: "estradiol", label: "Estradiol", unit: "pg/mL", greenMax: 40, yellowMax: 60 },
  { key: "creatinine", label: "Creatinina", unit: "mg/dL", greenMax: 1.3, yellowMax: 1.6 },
  { key: "blood_pressure_systolic", label: "PA Sistólica", unit: "mmHg", greenMax: 130, yellowMax: 140 },
  { key: "blood_pressure_diastolic", label: "PA Diastólica", unit: "mmHg", greenMax: 85, yellowMax: 90 },
];

const getStatus = (value: number | null, field: typeof EXAM_FIELDS[0]) => {
  if (value === null || value === undefined) return "none";
  // HDL is inverted — higher is better
  if (field.key === "hdl") {
    if (value >= 40) return "green";
    if (value >= 30) return "yellow";
    return "red";
  }
  if (value <= field.greenMax) return "green";
  if (value <= field.yellowMax) return "yellow";
  return "red";
};

const STATUS_COLORS = {
  green: "text-green-500",
  yellow: "text-yellow-500",
  red: "text-red-500",
  none: "text-muted-foreground",
};

const STATUS_EMOJI = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
  none: "⚪",
};

interface Props {
  exams: PerformanceExam[];
  onSaveExam: (exam: Omit<PerformanceExam, "id" | "ai_analysis">) => Promise<void>;
}

const ExamTracker = ({ exams, onSaveExam }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const latestExam = exams[0] || null;

  const handleSave = async () => {
    setSaving(true);
    const examData: Record<string, unknown> = {
      exam_date: formData.exam_date || new Date().toISOString().split("T")[0],
    };
    EXAM_FIELDS.forEach((f) => {
      const val = formData[f.key];
      if (val) examData[f.key] = parseFloat(val);
    });
    examData.notes = formData.notes || null;
    await onSaveExam(examData as unknown as Omit<PerformanceExam, "id" | "ai_analysis">);
    setFormData({});
    setShowForm(false);
    setSaving(false);
  };

  const daysSinceLastExam = latestExam
    ? Math.floor(
        (Date.now() - new Date(latestExam.exam_date).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FF6B00]" />
          Monitoramento de Exames
        </h3>
        <Button
          size="sm"
          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Novo exame
        </Button>
      </div>

      {daysSinceLastExam !== null && daysSinceLastExam > 56 && (
        <Card className="p-3 border-l-4 border-l-yellow-500 bg-yellow-500/5">
          <p className="text-sm">
            ⚠️ Seu último exame foi há {daysSinceLastExam} dias — recomendamos
            repetir antes de continuar o ciclo.
          </p>
        </Card>
      )}

      {showForm && (
        <Card className="p-4 space-y-3">
          <div>
            <Label className="text-xs">Data do exame</Label>
            <Input
              type="date"
              value={formData.exam_date || ""}
              onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {EXAM_FIELDS.map((f) => (
              <div key={f.key}>
                <Label className="text-xs">
                  {f.label} ({f.unit})
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="—"
                  value={formData[f.key] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [f.key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
          <div>
            <Label className="text-xs">Observações</Label>
            <Input
              placeholder="Notas sobre o exame"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <Button
            className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar exame"}
          </Button>
        </Card>
      )}

      {/* Latest exam dashboard */}
      {latestExam && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Último exame: {new Date(latestExam.exam_date).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXAM_FIELDS.map((f) => {
              const val = latestExam[f.key] as number | null;
              if (val === null || val === undefined) return null;
              const status = getStatus(val, f);
              return (
                <div
                  key={f.key}
                  className="flex items-center justify-between p-2 rounded bg-muted/30"
                >
                  <span className="text-xs">{f.label}</span>
                  <span className={`text-sm font-mono font-bold ${STATUS_COLORS[status]}`}>
                    {STATUS_EMOJI[status]} {val}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {exams.length === 0 && !showForm && (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum exame registrado. Adicione seus valores para monitoramento.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ExamTracker;
