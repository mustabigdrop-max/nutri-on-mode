import { useState } from "react";
import { AlertTriangle, Camera, ChevronDown, ClipboardList, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Sex = "female" | "male";
type CalibrationTab = "markers" | "photos" | "categories" | "protocol";
type MarkerLevel = { bf: string; score: number; desc: string };
type Marker = { zone: string; weight: number; levels: MarkerLevel[] };

const COLORS = {
  bg: "#03040A", surface: "#0A0D16", card: "#0E1220", cyan: "#00D4FF",
  gold: "#FFB800", text: "#EDF2FF", dim: "#7A8AAA", green: "#00E676",
  red: "#FF3366", orange: "#FFB300", purple: "#9C27B0", border: "#161D2E",
};

const sharedMarkers = {
  female: [
    ["ABDÔMEN", 25, [["8–12%",10,"Estriações visíveis, separação completa, vascularização e pouca gordura subcutânea aparente"],["12–15%",8,"Abdômen definido, linhas claras, oblíquos marcados e vascularização leve"],["15–18%",6,"Porção superior visível, linha alba marcada e oblíquos com sombra"],["18–22%",4,"Contorno visível com contração e camada subcutânea leve"],["22–26%",2,"Sem definição abdominal, sem excesso visual acentuado"],["26%+",0,"Acúmulo abdominal e ausência de contorno muscular"]]],
    ["DELTÓIDES / OMBROS", 15, [["8–12%",10,"Estriações, separação entre cabeças e vascularização"],["12–15%",8,"Contorno definido e separação entre cabeças"],["15–18%",6,"Forma arredondada e separação deltóide-bíceps"],["18–22%",4,"Contorno presente, porém suavizado"],["22%+",2,"Sem separação visual clara"]]],
    ["BRAÇOS", 12, [["8–12%",10,"Vascularização proeminente, separação e estriações"],["12–15%",8,"Vascularização e separação muscular claras"],["15–18%",6,"Forma definida; veias podem aparecer sob esforço"],["18–22%",4,"Contorno sem vascularização evidente"],["22%+",2,"Aparência suave, sem separação"]]],
    ["PERNAS", 15, [["8–12%",10,"Separação completa do quadríceps, estriações e vascularização"],["12–15%",8,"Separação entre porções do quadríceps"],["15–18%",6,"Contorno definido e vasto medial visível sob contração"],["18–22%",4,"Massa presente, sem separação clara"],["22%+",2,"Sem definição muscular aparente"]]],
    ["GLÚTEOS / LOMBAR", 18, [["8–12%",10,"Estriações glúteas e região lombar visualmente seca"],["12–15%",8,"Glúteos definidos, lombar seca e fossetas visíveis"],["15–18%",6,"Forma muscular com camada lombar leve"],["18–22%",4,"Forma arredondada, sem definição e camada moderada"],["22–26%",2,"Acúmulo lombar e ausência de contorno"],["26%+",0,"Acúmulo visual significativo"]]],
    ["VASCULARIZAÇÃO", 8, [["8–12%",10,"Veias em braços, ombros, abdômen e pernas"],["12–15%",8,"Vascularização em braços e ombros"],["15–18%",6,"Veias visíveis sob esforço ou calor"],["18–22%",4,"Vascularização mínima"],["22%+",2,"Sem vascularização aparente"]]],
    ["PELE / SUBCUTÂNEO", 7, [["8–12%",10,"Pele visualmente fina, textura muscular evidente"],["12–15%",8,"Textura muscular visível em várias regiões"],["15–18%",6,"Espessura moderada e textura localizada"],["18–22%",4,"Camada presente, suavizando contornos"],["22%+",2,"Camada espessa e aparência lisa"]]],
  ],
  male: [
    ["ABDÔMEN", 25, [["4–7%",10,"Estriações profundas, veias, separação intercostal e aspecto granulado"],["7–10%",8,"Seis blocos definidos, oblíquos e vascularização inguinal"],["10–13%",6,"Seis blocos visíveis e oblíquos sombreados"],["13–16%",4,"Porção superior visível e camada inferior leve"],["16–20%",2,"Contorno apenas sob contração"],["20%+",0,"Sem definição abdominal"]]],
    ["DELTÓIDES / OMBROS", 15, [["4–7%",10,"Estriações em todas as cabeças e vascularização"],["7–10%",8,"Separação clara entre cabeças"],["10–13%",6,"Contorno definido e separação deltóide-bíceps"],["13–16%",4,"Forma arredondada, porém suavizada"],["16%+",2,"Sem separação visual"]]],
    ["BRAÇOS", 12, [["4–7%",10,"Estriações no tríceps, veias e separação completa"],["7–10%",8,"Veia cefálica proeminente e separação clara"],["10–13%",6,"Vascularização sob esforço e forma definida"],["13–16%",4,"Contorno muscular presente"],["16%+",2,"Aparência suave"]]],
    ["PERNAS", 15, [["4–7%",10,"Separação completa, estriações e vascularização femoral"],["7–10%",8,"Separação entre porções e vasto medial visível"],["10–13%",6,"Contorno definido e separação sob contração"],["13–16%",4,"Massa presente, sem separação"],["16%+",2,"Sem definição aparente"]]],
    ["LOMBAR / GLÚTEOS", 18, [["4–7%",10,"Christmas tree lombar e estriações glúteas"],["7–10%",8,"Lombar seca e contorno glúteo definido"],["10–13%",6,"Camada leve na lombar e forma glútea"],["13–16%",4,"Camada lombar moderada"],["16–20%",2,"Acúmulo lombar visível"],["20%+",0,"Acúmulo visual significativo"]]],
    ["VASCULARIZAÇÃO", 8, [["4–7%",10,"Veias em abdômen, pernas, peito e braços"],["7–10%",8,"Veias em braços, ombros e antebraços"],["10–13%",6,"Cefálica e antebraços visíveis"],["13–16%",4,"Vascularização mínima"],["16%+",2,"Sem vascularização aparente"]]],
    ["PELE / SUBCUTÂNEO", 7, [["4–7%",10,"Pele visualmente fina e fibras visíveis em repouso"],["7–10%",8,"Textura muscular em várias regiões"],["10–13%",6,"Espessura moderada e textura sob contração"],["13–16%",4,"Camada presente, suavizando contornos"],["16%+",2,"Aparência lisa, sem textura"]]],
  ],
} as const;

const scoreMaps = {
  female: [["9–10","8–12%","Contest"],["7,5–9","12–15%","Physique"],["6–7,5","15–18%","Atlético"],["4–6","18–22%","Fitness"],["2–4","22–26%","Médio"],["0–2","26%+","Alto"]],
  male: [["9–10","4–7%","Contest"],["7,5–9","7–10%","Definição alta"],["6–7,5","10–13%","Atlético"],["4–6","13–16%","Fitness"],["2–4","16–20%","Médio"],["0–2","20%+","Alto"]],
};

const categories = {
  female: [["Bikini / Wellness","14–18%","18–24%"],["Figure / Physique","12–15%","16–20%"],["Bodybuilding","8–12%","14–18%"],["Fitness geral","18–24%","20–28%"]],
  male: [["Classic Physique","5–8%","10–14%"],["Bodybuilding","3–6%","8–12%"],["Men's Physique","6–9%","10–14%"],["Fitness geral","12–18%","14–22%"]],
};

const photos = [
  ["FRONTAL", "Abdômen, ombros, quadríceps, braços e vascularização frontal", "40%", true],
  ["LATERAL", "Espessura subcutânea, peitoral, lombar, abdômen lateral e pernas", "25%", true],
  ["POSTERIOR", "Lombar, glúteos, posteriores, costas e tríceps", "25%", true],
  ["FRONTAL RELAXADO", "Diferença entre pose e repouso para calibrar a leitura", "10%", false],
] as const;

function MarkerCard({ marker }: { marker: Marker }) {
  const [open, setOpen] = useState(false);
  return (
    <section style={{ border: `1px solid ${COLORS.border}`, background: COLORS.card }}>
      <Button variant="ghost" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="h-auto w-full justify-between rounded-none px-4 py-4 hover:bg-muted/10">
        <span className="text-left font-heading text-sm font-bold" style={{ color: COLORS.text }}>{marker.zone}</span>
        <span className="flex items-center gap-3 font-mono text-[10px]" style={{ color: COLORS.gold }}>PESO {marker.weight}% <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} /></span>
      </Button>
      {open && <div className="grid gap-px border-t" style={{ borderColor: COLORS.border, background: COLORS.border }}>
        {marker.levels.map((level) => <div key={`${level.bf}-${level.score}`} className="grid grid-cols-[72px_1fr] gap-3 p-4 sm:grid-cols-[84px_80px_1fr]" style={{ background: COLORS.surface }}>
          <strong className="font-heading text-base" style={{ color: COLORS.cyan }}>{level.bf}</strong>
          <span className="font-mono text-[10px] uppercase" style={{ color: COLORS.gold }}>score {level.score}</span>
          <p className="col-span-2 text-xs leading-5 sm:col-span-1" style={{ color: COLORS.dim }}>{level.desc}</p>
        </div>)}
      </div>}
    </section>
  );
}

export default function ApexBFCalibration() {
  const [sex, setSex] = useState<Sex>("female");
  const [tab, setTab] = useState<CalibrationTab>("markers");
  const markers: Marker[] = sharedMarkers[sex].map(([zone, weight, levels]) => ({ zone, weight, levels: levels.map(([bf, score, desc]) => ({ bf, score, desc })) }));
  const tabs: { key: CalibrationTab; label: string; icon: typeof Scale }[] = [
    { key: "markers", label: "Marcadores", icon: Scale }, { key: "photos", label: "Fotos", icon: Camera },
    { key: "categories", label: "Calibração", icon: ShieldCheck }, { key: "protocol", label: "Protocolo", icon: ClipboardList },
  ];

  return <div className="space-y-4" style={{ color: COLORS.text }}>
    <header className="border p-5 sm:p-6" style={{ borderColor: COLORS.border, background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.bg})` }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: COLORS.cyan }}>APEX Visual Intelligence</p>
      <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">Calibração visual de composição corporal</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: COLORS.dim }}>Rubrica anatômica para estimativas visuais em faixa. Não substitui DEXA, dobras cutâneas ou avaliação profissional presencial.</p>
    </header>

    <div className="grid grid-cols-2 gap-2">
      {(["female", "male"] as Sex[]).map((value) => <Button key={value} variant="outline" onClick={() => setSex(value)} className="rounded-none border py-5 font-heading font-bold" style={{ borderColor: value === "female" ? COLORS.purple : COLORS.cyan, background: sex === value ? (value === "female" ? COLORS.purple : COLORS.cyan) : COLORS.surface, color: sex === value ? COLORS.bg : COLORS.dim }}>{value === "female" ? "FEMININO" : "MASCULINO"}</Button>)}
    </div>

    <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Seções da calibração">
      {tabs.map(({ key, label, icon: Icon }) => <Button key={key} variant="ghost" onClick={() => setTab(key)} className="h-12 rounded-none border px-2 font-mono text-[10px] uppercase" style={{ borderColor: tab === key ? COLORS.gold : COLORS.border, color: tab === key ? COLORS.gold : COLORS.dim, background: tab === key ? COLORS.card : COLORS.surface }}><Icon className="h-4 w-4" />{label}</Button>)}
    </nav>

    {tab === "markers" && <div className="space-y-3">
      <p className="border-l-2 pl-3 text-xs leading-5" style={{ borderColor: COLORS.cyan, color: COLORS.dim }}>Cada zona recebe score de 0 a 10. O resultado ponderado aponta uma faixa visual, nunca um valor pontual.</p>
      {markers.map((marker) => <MarkerCard key={marker.zone} marker={marker} />)}
      <section className="border p-4" style={{ borderColor: COLORS.border, background: COLORS.surface }}>
        <h3 className="mb-4 font-mono text-[11px] font-bold uppercase" style={{ color: COLORS.gold }}>Score ponderado → faixa visual</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{scoreMaps[sex].map(([range, bf, label], index) => <div key={range} className="border p-3" style={{ borderColor: COLORS.border, background: COLORS.card }}><strong className="block font-heading text-xl" style={{ color: index < 2 ? COLORS.orange : index < 4 ? COLORS.cyan : COLORS.dim }}>{bf}</strong><span className="block font-mono text-[9px]" style={{ color: COLORS.dim }}>SCORE {range}</span><span className="mt-2 block text-xs">{label}</span></div>)}</div>
      </section>
    </div>}

    {tab === "photos" && <div className="space-y-3">
      <div className="flex gap-3 border p-4" style={{ borderColor: `${COLORS.orange}55`, background: COLORS.card }}><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: COLORS.orange }} /><p className="text-sm leading-6" style={{ color: COLORS.dim }}>Uma única foto frontal limita a leitura. Frente, lateral e posterior cobrem as regiões críticas; luz, pose e estado pós-treino ainda podem distorcer a aparência.</p></div>
      {photos.map(([angle, evaluates, confidence, required]) => <section key={angle} className="border p-4" style={{ borderColor: COLORS.border, background: COLORS.card }}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading font-bold">{angle}</h3><div className="flex gap-2"><span className="border px-2 py-1 font-mono text-[9px]" style={{ borderColor: required ? COLORS.red : COLORS.border, color: required ? COLORS.red : COLORS.dim }}>{required ? "OBRIGATÓRIA" : "OPCIONAL"}</span><span className="font-mono text-xs" style={{ color: COLORS.cyan }}>{confidence} da cobertura</span></div></div><p className="mt-3 text-xs leading-5" style={{ color: COLORS.dim }}>{evaluates}</p></section>)}
      <p className="text-xs leading-5" style={{ color: COLORS.dim }}>Os percentuais acima representam cobertura heurística das zonas, não probabilidade estatística nem precisão clínica.</p>
    </div>}

    {tab === "categories" && <div className="space-y-3">
      <p className="text-sm leading-6" style={{ color: COLORS.dim }}>A categoria muda a referência visual porque volume muscular não deve ser interpretado automaticamente como gordura. As faixas abaixo são referências de calibração, não metas ou prescrição.</p>
      {categories[sex].map(([label, stage, off]) => <section key={label} className="border p-4" style={{ borderColor: COLORS.border, background: COLORS.card }}><h3 className="font-heading text-lg font-bold">{label}</h3><div className="mt-3 grid grid-cols-2 gap-3"><div><span className="font-mono text-[9px] uppercase" style={{ color: COLORS.dim }}>Referência de palco</span><strong className="block text-xl" style={{ color: COLORS.gold }}>{stage}</strong></div><div><span className="font-mono text-[9px] uppercase" style={{ color: COLORS.dim }}>Referência fora de palco</span><strong className="block text-xl" style={{ color: COLORS.cyan }}>{off}</strong></div></div></section>)}
    </div>}

    {tab === "protocol" && <section className="border p-5" style={{ borderColor: COLORS.border, background: COLORS.card }}>
      <h3 className="font-heading text-xl font-bold">Protocolo de leitura visual</h3>
      <ol className="mt-5 space-y-4">{[
        "Confirmar sexo, categoria e contexto das fotos antes da leitura.",
        "Avaliar cada zona separadamente de 0 a 10 e registrar somente sinais visíveis.",
        "Ponderar abdômen 25%, lombar/glúteos 18%, ombros 15%, pernas 15%, braços 12%, vascularização 8% e pele 7%.",
        "Reduzir a confiança quando faltarem ângulos ou quando iluminação, pose, pump e qualidade da imagem interferirem.",
        "Retornar uma faixa de BF%, scores por zona, fotos utilizadas, limitações e alertas; nunca um número isolado.",
      ].map((item, index) => <li key={item} className="grid grid-cols-[32px_1fr] gap-3 text-sm leading-6" style={{ color: COLORS.dim }}><span className="flex h-8 w-8 items-center justify-center border font-mono text-xs" style={{ borderColor: COLORS.gold, color: COLORS.gold }}>{index + 1}</span>{item}</li>)}</ol>
      <div className="mt-6 border-l-2 p-4" style={{ borderColor: COLORS.green, background: COLORS.surface }}><strong className="font-mono text-xs" style={{ color: COLORS.green }}>SAÍDA SEGURA</strong><p className="mt-2 text-sm leading-6" style={{ color: COLORS.dim }}>Faixa estimada + confiança qualitativa + zonas não avaliadas + fatores de distorção. Divergências relevantes devem ser confirmadas por método presencial adequado.</p></div>
    </section>}
  </div>;
}