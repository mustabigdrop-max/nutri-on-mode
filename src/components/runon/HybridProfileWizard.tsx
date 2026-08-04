import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";
import { RC, mono, raj } from "@/components/runon/runonUi";
import { HybridProfile, WEEKDAYS, emptyProfile } from "@/lib/runonProfile";

const C = RC.cyan;

/* ─────────── primitives ─────────── */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p style={{ ...mono(7, RC.mutedDark, 3), marginBottom: 8 }}>
      {children}
      {required && <span style={{ color: "#ef4444" }}> *</span>}
    </p>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: RC.bg2,
  border: `1px solid ${RC.border}`,
  borderRadius: 6,
  padding: "12px 16px",
  color: RC.white,
  fontSize: 14,
  outline: "none",
};

function TextField({
  label, value, onChange, placeholder, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ ...inputStyle, borderColor: focus ? `${C}44` : RC.border, boxShadow: focus ? `0 0 12px ${C}08` : "none" }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ ...inputStyle, borderColor: focus ? `${C}44` : RC.border, boxShadow: focus ? `0 0 12px ${C}08` : "none", resize: "vertical" }}
      />
    </div>
  );
}

function SelectCards({
  label, options, value, onChange, required,
}: { label: string; options: string[]; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? "" : opt)}
              className="text-left relative transition-colors"
              style={{
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${active ? `${C}44` : RC.border}`,
                background: active ? `${C}06` : RC.bg2,
                color: active ? C : "#ccc",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                boxShadow: active ? `0 0 16px ${C}08` : "none",
              }}
            >
              {opt}
              {active && <ShieldCheck className="w-4 h-4 absolute top-2 right-2" style={{ color: C }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Chips({
  label, options, values, onChange, max, exclusive,
}: { label: string; options: string[]; values: string[]; onChange: (v: string[]) => void; max?: number; exclusive?: string }) {
  const toggle = (opt: string) => {
    if (exclusive && opt === exclusive) {
      onChange(values.includes(opt) ? [] : [opt]);
      return;
    }
    let next = values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt];
    if (exclusive) next = next.filter((v) => v !== exclusive);
    if (max && next.length > max) return;
    onChange(next);
  };
  return (
    <div>
      <Label>{label}{max ? ` (máx ${max})` : ""}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="transition-colors"
              style={{
                ...mono(8, active ? C : "#444", 1),
                borderRadius: 20,
                padding: "6px 14px",
                border: `1px solid ${active ? `${C}44` : RC.border}`,
                background: active ? `${C}0a` : "transparent",
                boxShadow: active ? `0 0 8px ${C}11` : "none",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberSelector({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  const opts = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <Label required>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {opts.map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              style={{
                width: 40, height: 40, borderRadius: 8,
                border: `1px solid ${active ? `${C}44` : RC.border}`,
                background: active ? `${C}0a` : RC.bg2,
                ...raj(16, 700, active ? C : "#666"),
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── wizard ─────────── */

const STEP_TITLES = [
  "Quem é você como atleta?",
  "Seu treino de musculação atual",
  "Onde você está na corrida?",
  "Qual é sua meta na corrida?",
  "AEGIS — Perfil Ergogênico",
];

export default function HybridProfileWizard({
  initial, onSave, onCancel,
}: { initial: HybridProfile | null; onSave: (p: HybridProfile) => void; onCancel?: () => void }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<HybridProfile>(initial ?? emptyProfile);
  const set = <K extends keyof HybridProfile>(k: K, v: HybridProfile[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const valid = [
    !!p.nome && !!p.peso && !!p.altura && !!p.objetivo && !!p.nivelMusculacao,
    !!p.split && p.diasSemanaMusculacao.length > 0 && !!p.duracaoTreino,
    !!p.nivelCorrida,
    p.temProva ? !!p.distanciaAlvo : !!p.objetivoGeral,
    true,
  ][step];

  return (
    <div style={{ background: RC.card, border: `1px solid ${RC.border}`, borderRadius: 10, padding: 20 }}>
      {/* progress */}
      <div className="flex gap-1.5 mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? C : RC.border, boxShadow: i <= step ? `0 0 6px ${C}22` : "none", transition: "background 300ms" }} />
        ))}
      </div>

      <div className="flex items-center justify-between mb-1">
        <p style={mono(7, RC.mutedDark, 3)}>STEP {step + 1} DE 5</p>
        <p style={mono(7, RC.mutedDark, 3)}>{step + 1} / 5</p>
      </div>

      <h3 className="flex items-center gap-2" style={{ ...raj(18, 700), marginBottom: 4 }}>
        {step === 4 && <ShieldCheck className="w-4 h-4" style={{ color: C }} />}
        {STEP_TITLES[step]}
      </h3>
      {step === 4 && (
        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>
          Informações opcionais e confidenciais — ficam salvas apenas neste dispositivo. Usadas para calibrar protocolos de preservação muscular e performance.
        </p>
      )}

      <div key={step} className="space-y-5 mt-4 animate-fade-in">
        {step === 0 && (
          <>
            <TextField label="Nome" value={p.nome} onChange={(v) => set("nome", v)} required />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Peso corporal (kg)" type="number" value={p.peso} onChange={(v) => set("peso", v)} required />
              <TextField label="Altura (cm)" type="number" value={p.altura} onChange={(v) => set("altura", v)} required />
            </div>
            <div>
              <Label>% Gordura (estimado) — {p.gordura}%</Label>
              <input
                type="range" min={5} max={40} value={p.gordura}
                onChange={(e) => set("gordura", Number(e.target.value))}
                className="w-full" style={{ accentColor: C }}
              />
            </div>
            <SelectCards
              label="Objetivo principal" required value={p.objetivo} onChange={(v) => set("objetivo", v)}
              options={["Bodybuilding Competitivo", "Lifestyle / Shape", "Performance Híbrida", "Corrida com Shape"]}
            />
            <SelectCards
              label="Nível de experiência em musculação" required value={p.nivelMusculacao} onChange={(v) => set("nivelMusculacao", v)}
              options={["Iniciante (<1 ano)", "Intermediário (1–3 anos)", "Avançado (3–7 anos)", "Elite (7+ anos)"]}
            />
          </>
        )}

        {step === 1 && (
          <>
            <NumberSelector label="Dias de musculação por semana" value={p.diasMusculacao} onChange={(v) => set("diasMusculacao", v)} min={1} max={7} />
            <SelectCards
              label="Split atual" required value={p.split} onChange={(v) => set("split", v)}
              options={["Push/Pull/Legs", "Upper/Lower", "Bro Split (1 grupo/dia)", "Full Body", "Arnold Split", "Outro"]}
            />
            <Chips label="Dias da semana que treina musculação" options={WEEKDAYS} values={p.diasSemanaMusculacao} onChange={(v) => set("diasSemanaMusculacao", v)} />
            <SelectCards
              label="Duração média do treino" required value={p.duracaoTreino} onChange={(v) => set("duracaoTreino", v)}
              options={["30–45 min", "45–60 min", "60–90 min", "90+ min"]}
            />
            <Chips label="Prioridade muscular" max={3} options={["Peito", "Costas", "Ombros", "Braços", "Pernas", "Glúteos", "Core"]} values={p.prioridadeMuscular} onChange={(v) => set("prioridadeMuscular", v)} />
          </>
        )}

        {step === 2 && (
          <>
            <SelectCards
              label="Nível de corrida" required value={p.nivelCorrida} onChange={(v) => set("nivelCorrida", v)}
              options={["Nunca corri seriamente", "Iniciante (corro há <6 meses)", "Intermediário (6m–2 anos)", "Avançado (2+ anos)"]}
            />
            <Chips
              label="Atividade aeróbica atual" exclusive="Nenhuma"
              options={["Corrida de rua", "Esteira", "Caminhada", "Caminhada inclinada", "Bike", "Natação", "Nenhuma"]}
              values={p.atividadesAerobicas} onChange={(v) => set("atividadesAerobicas", v)}
            />
            <Chips label="Dias que faz cardio hoje" exclusive="Nenhum" options={[...WEEKDAYS, "Nenhum"]} values={p.diasCardio} onChange={(v) => set("diasCardio", v)} />
            <SelectCards
              label="Distância média por sessão" value={p.distanciaMedia} onChange={(v) => set("distanciaMedia", v)}
              options={["Não corro ainda", "Até 3 km", "3–5 km", "5–8 km", "8–12 km", "12+ km"]}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Pace médio atual" value={p.paceMedio} onChange={(v) => set("paceMedio", v)} placeholder="Ex: 6:30 /km" />
              <TextField label="FC máxima conhecida" type="number" value={p.fcMaxima} onChange={(v) => set("fcMaxima", v)} placeholder="Se não sabe, deixe vazio" />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <Label required>Tem prova/corrida alvo?</Label>
              <div className="flex gap-2">
                {[true, false].map((opt) => (
                  <button
                    key={String(opt)} type="button" onClick={() => set("temProva", opt)}
                    style={{
                      flex: 1, padding: 12, borderRadius: 8,
                      ...mono(8, p.temProva === opt ? C : "#444", 2),
                      border: `1px solid ${p.temProva === opt ? `${C}44` : RC.border}`,
                      background: p.temProva === opt ? `${C}06` : RC.bg2,
                    }}
                  >
                    {opt ? "SIM" : "NÃO"}
                  </button>
                ))}
              </div>
            </div>

            {p.temProva ? (
              <>
                <SelectCards label="Distância alvo" required value={p.distanciaAlvo} onChange={(v) => set("distanciaAlvo", v)} options={["5K", "10K", "Meia Maratona (21K)", "Maratona (42K)", "Ultra"]} />
                <TextField label="Data da prova" type="date" value={p.dataProva} onChange={(v) => set("dataProva", v)} />
                <TextField label="Nome da prova" value={p.nomeProva} onChange={(v) => set("nomeProva", v)} placeholder="Ex: Maratona do Rio 2026" />
              </>
            ) : (
              <SelectCards
                label="Objetivo geral" required value={p.objetivoGeral} onChange={(v) => set("objetivoGeral", v)}
                options={["Condicionamento geral", "Perder gordura com cardio", "Conseguir correr 5K sem parar", "Melhorar pace", "Estilo de vida ativo + shape"]}
              />
            )}

            <Chips label="Dias disponíveis para correr" options={WEEKDAYS} values={p.diasDisponiveisCorrida} onChange={(v) => set("diasDisponiveisCorrida", v)} />
            <SelectCards label="Preferência de horário" value={p.horarioPreferido} onChange={(v) => set("horarioPreferido", v)} options={["Manhã (antes das 8h)", "Manhã (8h–11h)", "Tarde", "Noite", "Tanto faz"]} />
          </>
        )}

        {step === 4 && (
          <>
            <SelectCards
              label="Faz uso de ergogênicos?" value={p.usoErgogenicos} onChange={(v) => set("usoErgogenicos", v)}
              options={["Natural (sem uso)", "Apenas suplementos", "TRT / Reposição hormonal", "Ciclo completo", "Blast & Cruise", "Prefiro não informar"]}
            />
            {["TRT / Reposição hormonal", "Ciclo completo", "Blast & Cruise"].includes(p.usoErgogenicos) && (
              <Chips
                label="Compostos atuais"
                options={["Testosterona", "Boldenona", "Primobolan", "Nandrolona", "Trembolona", "Oxandrolona", "Stanozolol", "GH", "Insulina", "T3/T4", "Outro"]}
                values={p.compostosAtuais} onChange={(v) => set("compostosAtuais", v)}
              />
            )}
            <Chips
              label="Usa peptídeos?" exclusive="Nenhum"
              options={["Nenhum", "BPC-157", "TB-500", "Ipamorelin", "CJC-1295", "MK-677", "Semaglutida", "Tirzepatida", "Outro"]}
              values={p.peptideos} onChange={(v) => set("peptideos", v)}
            />
            <Chips
              label="Suplementação atual"
              options={["Creatina", "Cafeína", "Beta-Alanina", "Citrulina", "Whey", "Caseína", "Ômega-3", "Vitamina D", "ZMA", "Melatonina", "Multivitamínico", "Eletrólitos"]}
              values={p.suplementacao} onChange={(v) => set("suplementacao", v)}
            />
            <TextArea label="Restrições / Lesões" value={p.restricoes} onChange={(v) => set("restricoes", v)} placeholder="Ex: tendinite no joelho direito, lombalgia..." />
            <TextArea label="Histórico de lesões na corrida" value={p.historicoLesoes} onChange={(v) => set("historicoLesoes", v)} placeholder="Ex: canelite, fascite plantar..." />
          </>
        )}
      </div>

      {/* nav */}
      <div className="flex items-center gap-3 mt-6">
        {step > 0 ? (
          <button
            type="button" onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 px-4 py-2"
            style={{ ...mono(8, "#444", 2), background: "transparent", border: `1px solid ${RC.border}`, borderRadius: 6 }}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> VOLTAR
          </button>
        ) : onCancel ? (
          <button
            type="button" onClick={onCancel} className="px-4 py-2"
            style={{ ...mono(8, "#444", 2), background: "transparent", border: `1px solid ${RC.border}`, borderRadius: 6 }}
          >
            CANCELAR
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            type="button" disabled={!valid} onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1 px-5 py-2 ml-auto"
            style={{
              ...mono(8, valid ? "#020205" : "#020205", 2),
              fontWeight: 700,
              background: C, borderRadius: 6,
              opacity: valid ? 1 : 0.3,
              cursor: valid ? "pointer" : "not-allowed",
            }}
          >
            PRÓXIMO <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button" onClick={() => onSave(p)}
            className="flex items-center justify-center gap-2 w-full py-3"
            style={{
              ...mono(9, "#020205", 3), fontWeight: 700, padding: 14,
              background: "linear-gradient(135deg, #00D4FF, #00B4DD)",
              borderRadius: 8, boxShadow: `0 0 20px ${C}22`,
            }}
          >
            <Sparkles className="w-4 h-4" /> GERAR MEU PROTOCOLO RUNON
          </button>
        )}
      </div>
    </div>
  );
}
