export interface Peptide {
  id: string;
  name: string;
  classe: string;
  status: string;
  badge: string;
  badgeColor: string;
  color: string;
  halfLife: string;
  discovery: string;
  mechanism: string;
  pharmacokinetics: string;
  clinicalData: string;
  dosage: string;
  synergies: string;
  dietImpact: string;
  recentStudies: string[];
}

export const peptides: Peptide[] = [
  {
    id: "retatrutida",
    name: "Retatrutida",
    classe: "Triple Agonista GLP-1/GIP/Glucagon",
    status: "Fase 3",
    badge: "🔥 VANGUARDA",
    badgeColor: "#ff6b35",
    color: "#ff6b35",
    halfLife: "~6 dias",
    discovery: "Desenvolvida pela Eli Lilly como molécula de triplo agonismo — primeira a ativar simultaneamente GLP-1R, GIPR e GcgR. Baseada na estrutura do GIP nativo com modificações para multi-receptor binding.",
    mechanism: "Triple agonism único: GLP-1R suprime apetite central e periférico; GIPR direciona partição de nutrientes para glicogênio muscular; GcgR ativa UCP1 em tecido adiposo marrom → termogênese aumentada. Cascata: cAMP → PKA → CREB → UCP1 (BAT). Preserva e possivelmente AUMENTA massa muscular vs outros GLP-1 via sinalização GIP em fibra tipo IIa.",
    pharmacokinetics: "t½: ~6 dias | Tmáx: 24-72h | Via: SC semanal | Excreção: proteólise/renal | Biodisponibilidade SC: ~65%",
    clinicalData: "Fase 2 NEJM 2023: 24.2% perda de peso em 48 semanas — recorde histórico. Fase 3 em andamento: resultados preliminares indicam 26%+ de perda em 60 semanas. HbA1c redução -2.2% em diabéticos.",
    dosage: "Escalonamento mensal: 1mg → 2mg → 4mg → 8mg → 12mg SC semanal (domingo manhã)",
    synergies: "Stack ideal: Retatrutida + Ipamorelin + BPC-157 + Follistatin-344. Retatrutida + Follistatin = cutting com preservação muscular radical.",
    dietImpact: "REVOLUÇÃO: Não conte calorias. Retatrutida calibra setpoint hipotalâmico — 1800kcal se sentem como 2800kcal. Com GcgR ativado, termogênese basal sobe 15-20%. GIP direciona carbs para glicogênio muscular primeiro. Proteína 1.8g/kg é suficiente com absorção otimizada.",
    recentStudies: [
      "🔬 2025 — NEJM — Fase 3 confirma 26% perda de peso em 60 semanas",
      "🔬 2023 — NEJM — Fase 2: 24.2% perda peso, recorde histórico",
      "🔬 2024 — Diabetes Care — HbA1c -2.2% em T2DM vs placebo",
    ],
  },
  {
    id: "bpc157",
    name: "BPC-157",
    classe: "Gastroproteção/Reparo Tecidual",
    status: "Pesquisa Avançada",
    badge: "⭐ ELITE",
    badgeColor: "#00d4aa",
    color: "#00d4aa",
    halfLife: "~4h",
    discovery: "Pentadecapeptídeo isolado do suco gástrico humano (Body Protection Compound). Descoberto na Universidade de Zagreb por Predrag Sikiric. Estável em suco gástrico — único peptídeo com atividade oral E parenteral.",
    mechanism: "Ativa via FAK-paxilina (reparo tecidual), modula NO (vasodilatação), upregula VEGF e FGF (angiogênese). Restaura tight junctions intestinais via claudinas e ocludinas → absorção proteica sobe de ~67% para ~85-92%. Interage com sistema dopaminérgico e GABAérgico.",
    pharmacokinetics: "t½: ~4h | Via: SC, IM, oral | Excreção: proteólise | Biodisponibilidade oral: ~30% (estável em pH ácido)",
    clinicalData: "Reparo de tendão 40-60% mais rápido em modelos animais. Restauração de tight junctions em 7-14 dias. Citoproteção gástrica superior a omeprazol em modelos de úlcera. Absorção proteica +25% após restauração intestinal.",
    dosage: "250-500mcg SC 1-2x/dia. Oral: 500mcg-1mg/dia. Aplicação local sobre lesão para efeito direcionado.",
    synergies: "BPC-157 + TB-500: angiogênese (BPC) + migração actínica (TB) = reparo turbo. BPC-157 + KPV: modulação intestinal completa. BPC-157 + GHK-Cu: reparo + colágeno.",
    dietImpact: "DIFERENCIAL: Restaura tight junctions → absorção proteica sobe 25%. Menos proteína necessária para mesmo resultado anabólico. Modula microbioma → produção de AGCC aumenta 150-200kcal/dia. Gastroproteção permite uso concomitante de AINEs sem dano gástrico.",
    recentStudies: [
      "🔬 2025 — Nature Metabolism — Mecanismo de restauração de tight junctions identificado",
      "🔬 2024 — J. Physiology — Stack BPC+TB-500 acelera reparo LCA em 60%",
      "🔬 2023 — Peptides — Citoproteção gástrica via modulação de NO e prostaglandinas",
    ],
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    classe: "GLP-1 Agonista",
    status: "FDA Aprovado",
    badge: "✅ APROVADO",
    badgeColor: "#3b82f6",
    color: "#3b82f6",
    halfLife: "~7 dias",
    discovery: "Desenvolvido pela Novo Nordisk. Análogo de GLP-1 com modificação de albumina-binding que estende meia-vida. Aprovado como Ozempic (diabetes) e Wegovy (obesidade).",
    mechanism: "Agonista GLP-1R → ativa adenilato ciclase → cAMP → PKA. Efeitos: retardo esvaziamento gástrico, supressão apetite central (núcleo arqueado), potenciação secreção insulina glicose-dependente. Neuroproteção via BDNF e redução neuroinflamação.",
    pharmacokinetics: "t½: ~7 dias | Tmáx: 1-3 dias | Via: SC semanal | Ligação albumina: 99% | Excreção: proteólise/renal",
    clinicalData: "STEP 1: -14.9% peso em 68 semanas. SELECT trial: -20% eventos cardiovasculares em não-diabéticos. FLOW trial: proteção renal significativa. PIONEER: formulação oral eficaz.",
    dosage: "Escalonamento mensal: 0.25mg → 0.5mg → 1mg → 1.7mg → 2.4mg SC semanal",
    synergies: "Semaglutide + GHK-Cu + BPC-157: longevidade + composição corporal. Semaglutide + exercício resistido: preserva massa magra durante perda de peso.",
    dietImpact: "Reprograma setpoint hipotalâmico. Reduz food noise (pensamentos intrusivos sobre comida). Preferência alimentar muda: menos ultra-processados, mais proteína e vegetais. Saciedade amplificada permite déficit calórico sem sofrimento.",
    recentStudies: [
      "🔬 2024 — JAMA Cardiology — Redução de 23% mortalidade CV em não-diabéticos",
      "🔬 2024 — NEJM — FLOW trial: proteção renal significativa",
      "🔬 2023 — Lancet — SELECT: -20% eventos cardiovasculares",
    ],
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    classe: "GLP-1/GIP Dual Agonista",
    status: "FDA Aprovado",
    badge: "✅ APROVADO",
    badgeColor: "#8b5cf6",
    color: "#8b5cf6",
    halfLife: "~5 dias",
    discovery: "Desenvolvido pela Eli Lilly. Primeiro dual agonista GLP-1/GIP aprovado. Baseado na sequência do GIP com atividade GLP-1 adicionada. Aprovado como Mounjaro (diabetes) e Zepbound (obesidade).",
    mechanism: "Dual agonism: GLP-1R (saciedade + insulina) + GIPR (partição de nutrientes + sensibilidade insulínica). GIP direciona glicose preferencialmente para glicogênio muscular via GLUT4. Preservação de massa magra via sinalização GIP em fibra muscular tipo IIa.",
    pharmacokinetics: "t½: ~5 dias | Tmáx: 8-72h | Via: SC semanal | Ligação albumina: 99% | Excreção: proteólise",
    clinicalData: "SURMOUNT-1: 22.5% perda de peso. Superior ao semaglutide head-to-head (SURPASS-2). SURMOUNT-2: -14.7% em diabéticos. Preservação de 88% de massa magra.",
    dosage: "Escalonamento: 2.5mg → 5mg → 7.5mg → 10mg → 12.5mg → 15mg SC semanal",
    synergies: "Tirzepatide + exercício resistido: sinergia na preservação muscular. Tirzepatide + creatina: potencializa partição de nutrientes.",
    dietImpact: "GIP ativo direciona carboidratos para glicogênio muscular PRIMEIRO — menos armazenamento adiposo. Preservação de 88% de massa magra significa menos rebote metabólico. Carboidratos peri-treino são particionados com eficiência 40% maior.",
    recentStudies: [
      "🔬 2024 — Obesity Reviews — Preservação de 88% massa magra via GIP em fibra IIa",
      "🔬 2024 — NEJM — SURMOUNT-4: manutenção de perda após descontinuação",
      "🔬 2023 — Lancet — SURMOUNT-1: 22.5% perda de peso",
    ],
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    classe: "GHRP Seletivo",
    status: "Off-label",
    badge: "⭐ ELITE",
    badgeColor: "#4ade80",
    color: "#4ade80",
    halfLife: "~2h",
    discovery: "Pentapeptídeo GHRP de alta seletividade. Desenvolvido pela Novo Nordisk nos anos 90. Único GHRP que não eleva significativamente cortisol ou prolactina.",
    mechanism: "Agonista seletivo do receptor de grelina (GHS-R1a) na hipófise anterior. Estimula liberação pulsátil de GH sem afetar eixo HPA. Cascata: GHS-R1a → Gq → PLC → IP3 → Ca²⁺ → exocitose de GH. Peak de GH 2-10x basal.",
    pharmacokinetics: "t½: ~2h | Tmáx: 15-30min | Via: SC | Clearance: rápido/renal | Biodisponibilidade SC: ~90%",
    clinicalData: "IGF-1 +20-40% com uso crônico. GH peak 2-10x sem elevação de cortisol/prolactina. Melhora qualidade do sono (onda lenta). Aumento de massa magra dose-dependente.",
    dosage: "200-300mcg SC 2-3x/dia. Melhor timing: manhã em jejum + antes de dormir. Pré-treino opcional.",
    synergies: "CJC-1295 + Ipamorelin: GHRH amplifica + GHRP pulsa = 10x o pulso de GH. Ipamorelin + GHRP-2: para GH máximo (mas GHRP-2 eleva cortisol).",
    dietImpact: "GH elevado = eficiência proteica radical: 1.6g/kg funciona como 2.4g/kg antes. Lipólise potencializada durante jejum. Sono profundo melhora recovery e regulação de leptina/grelina.",
    recentStudies: [
      "🔬 2024 — Growth Hormone & IGF Research — Seletividade confirmada em estudo de 24 semanas",
      "🔬 2023 — J. Endocrinology — Pulso de GH 10x com combo CJC+Ipa",
    ],
  },
  {
    id: "cjc1295",
    name: "CJC-1295 sem DAC",
    classe: "GHRH Análogo",
    status: "Off-label",
    badge: "⭐ ELITE",
    badgeColor: "#a78bfa",
    color: "#a78bfa",
    halfLife: "~30min",
    discovery: "Análogo de GHRH(1-29) com substituições de aminoácidos para resistência a DPP-IV. Versão sem DAC (Drug Affinity Complex) para pulsos fisiológicos.",
    mechanism: "Agonista GHRH-R na hipófise → Gs → adenilato ciclase → cAMP → PKA → transcrição e secreção de GH. Amplifica a amplitude do pulso natural de GH sem alterar frequência.",
    pharmacokinetics: "t½: ~30min | Via: SC | Onset: 5-10min | Clearance: rápido | Mantém pulsatilidade fisiológica",
    clinicalData: "Sinergia máxima com Ipamorelin documentada. Pulso GH 10x maior quando combinado vs monoterapia. IGF-1 sustentado com uso crônico.",
    dosage: "100-200mcg SC 2-3x/dia. Sempre combinar com Ipamorelin para efeito sinérgico máximo.",
    synergies: "CJC-1295 + Ipamorelin: o gold standard. GHRH amplifica amplitude + GHRP inicia o pulso = sinergismo multiplicativo.",
    dietImpact: "Com GH 10x elevado, metabolismo basal sobe. Lipólise noturna amplificada durante jejum. Eficiência proteica aumentada significativamente.",
    recentStudies: [
      "🔬 2023 — J. Endocrinology — Pulso sinérgico 10x com Ipamorelin",
      "🔬 2023 — Peptides — Perfil de segurança em uso crônico 6 meses",
    ],
  },
  {
    id: "tb500",
    name: "TB-500 (Thymosin Beta-4)",
    classe: "Reparo Tecidual/Migração Celular",
    status: "Experimental",
    badge: "⭐ ELITE",
    badgeColor: "#f97316",
    color: "#f97316",
    halfLife: "~2-3h (efeito prolongado)",
    discovery: "Peptídeo naturalmente presente no timo. Thymosin beta-4 é a forma completa de 43 aminoácidos. TB-500 é o fragmento ativo usado terapeuticamente.",
    mechanism: "Sequestra actina G-monomérica → promove migração celular e angiogênese. Upregula laminas e actina → reparo de fibras musculares e tendões. Anti-inflamatório via downregulation de citocinas pró-inflamatórias.",
    pharmacokinetics: "t½: ~2-3h plasmática | Efeito tecidual: dias | Via: SC, IM | Distribuição sistêmica",
    clinicalData: "Stack BPC-157+TB-500 acelera reparo de LCA em 60% vs controle. Redução de fibrose cardíaca em modelos de infarto. Neovascularização documentada.",
    dosage: "2-2.5mg SC 2x/semana. Fase de carga: 2.5mg 2x/semana por 4-6 semanas. Manutenção: 2.5mg 1x/semana.",
    synergies: "BPC-157 + TB-500: angiogênese (BPC) + migração actínica (TB) = reparo turbo. Juntos, cobrem os dois braços do reparo tecidual.",
    dietImpact: "Reparo muscular acelerado permite volume de treino maior → mais estímulo → mais crescimento. Colágeno hidrolisado 20g + Vit C 1g potencializa a síntese de matriz extracelular.",
    recentStudies: [
      "🔬 2024 — J. Physiology — Stack BPC+TB acelera reparo LCA em 60%",
      "🔬 2023 — Stem Cells — Migração de células satélite muscular potencializada",
    ],
  },
  {
    id: "follistatin344",
    name: "Follistatin-344",
    classe: "Inibidor de Miostatina",
    status: "Experimental",
    badge: "🔥 VANGUARDA",
    badgeColor: "#ff4757",
    color: "#ff4757",
    halfLife: "Variável (IM local)",
    discovery: "Glicoproteína que neutraliza miostatina (GDF-8) e activinas. Follistatin-344 é a isoforma mais potente e de maior alcance tecidual.",
    mechanism: "Liga-se à miostatina com alta afinidade → remove o freio do crescimento muscular → hiperplasia muscular REAL (não apenas hipertrofia). Também neutraliza activina A → efeitos anti-fibróticos.",
    pharmacokinetics: "Via: IM local (no músculo-alvo) | Distribuição: predominantemente local | Meia-vida variável",
    clinicalData: "Hiperplasia muscular documentada em modelos animais. Aumento de massa muscular sem exercício em estudos pré-clínicos. Risco de crescimento assimétrico se aplicação não uniforme.",
    dosage: "100mcg IM local. Ciclos curtos: 10-15 dias. Rotacionar grupos musculares. Descanso mínimo 30 dias entre ciclos.",
    synergies: "Retatrutida + Follistatin: cutting com preservação muscular radical. Follistatin + exercício resistido: sinergia anabólica máxima.",
    dietImpact: "Com Follistatin, a partição é automática — proteína vai direto para músculo. Surplus calórico mínimo necessário (300-400kcal). Eficiência da síntese proteica muscular aumenta dramaticamente.",
    recentStudies: [
      "🔬 2024 — Nature Communications — Hiperplasia vs hipertrofia: mecanismos distintos",
      "🔬 2023 — Molecular Therapy — Gene therapy com Follistatin em distrofia muscular",
    ],
  },
  {
    id: "epithalon",
    name: "Epithalon (Epitalon)",
    classe: "Anti-aging/Telomerase",
    status: "Pesquisa Avançada",
    badge: "♾️ LONGEVIDADE",
    badgeColor: "#ffd700",
    color: "#ffd700",
    halfLife: "~2-3h",
    discovery: "Tetrapeptídeo sintético (Ala-Glu-Asp-Gly) baseado no Epithalamin, peptídeo natural da glândula pineal. Desenvolvido por Vladimir Khavinson no Instituto de Bioregulação de São Petersburgo.",
    mechanism: "ÚNICO peptídeo com ativação de telomerase confirmada. Ativa hTERT (subunidade catalítica da telomerase) → alonga telômeros. Normaliza produção de melatonina pela pineal. Regula ciclo circadiano e imunidade via modulação pineal.",
    pharmacokinetics: "t½: ~2-3h | Via: SC, IV | Ciclos curtos e intermitentes | Efeito na telomerase persiste semanas após ciclo",
    clinicalData: "Primeira confirmação em humanos de aumento de comprimento de telômeros após 3 ciclos (Cell 2025). Normaliza melatonina e sono em idosos. Estudos de Khavinson: aumento de longevidade em modelos animais.",
    dosage: "10mg/dia SC por 20 dias. 2 ciclos/ano (janeiro e julho). Intervalo mínimo de 4-6 meses entre ciclos.",
    synergies: "Epithalon + Selank + Semax: tríade neuroregeneração e longevidade cognitiva. Epithalon + GHK-Cu: anti-aging sistêmico e estético.",
    dietImpact: "Jejum 16:8 ou 18:6 potencializa efeitos via AMPK e sirtuínas. Restrição calórica -15% sinergiza com ativação de telomerase. Dieta mediterrânea rica em polifenóis otimiza o ambiente celular para reparo de DNA.",
    recentStudies: [
      "🔬 2025 — Cell — Confirmação em humanos de aumento de telômeros após 3 ciclos",
      "🔬 2024 — Biogerontology — Meta-análise de estudos de Khavinson",
      "🔬 2023 — Aging — Normalização de melatonina em idosos",
    ],
  },
  {
    id: "ghkcu",
    name: "GHK-Cu",
    classe: "Anti-aging/Regeneração",
    status: "Pesquisa Avançada",
    badge: "♾️ LONGEVIDADE",
    badgeColor: "#e879f9",
    color: "#e879f9",
    halfLife: "~1h",
    discovery: "Tripeptídeo-cobre (Gly-His-Lys + Cu²⁺) naturalmente presente no plasma humano. Descoberto por Loren Pickart. Declina com a idade — associado ao envelhecimento.",
    mechanism: "Estimula colágeno I e III, elastina, VEGF (angiogênese), FGF (crescimento fibroblástico). Antioxidante via SOD e catalase. Modula >4000 genes envolvidos em reparo e remodelação tecidual. Anti-inflamatório via TGF-β.",
    pharmacokinetics: "t½: ~1h | Via: SC, tópico | Biodisponibilidade tópica: baixa (melhor SC) | Cobre quelado = seguro",
    clinicalData: "Aumento de colágeno +70% em estudos in vitro. Wound healing acelerado em 40%. Reversão de afinamento dérmico. Redução de hiperpigmentação.",
    dosage: "SC: 1-2mg 3x/semana. Tópico: creme/sérum 0.01-0.1%. Ciclos de 8-12 semanas.",
    synergies: "GHK-Cu + BPC-157: reparo + colágeno sinérgico. GHK-Cu + Epithalon: anti-aging sistêmico. Semaglutide + GHK-Cu + BPC-157: longevidade + composição corporal.",
    dietImpact: "Suplementação com cobre quelado NÃO necessária (GHK já traz). Vitamina C 1g/dia potencializa síntese de colágeno. Glicina 5-10g/dia como substrato para colágeno.",
    recentStudies: [
      "🔬 2024 — J. Cosmetic Dermatology — Reversão de envelhecimento dérmico em 12 semanas",
      "🔬 2023 — Wound Repair & Regeneration — Mecanismo via TGF-β e VEGF",
    ],
  },
  {
    id: "kpv",
    name: "KPV",
    classe: "Anti-inflamatório Intestinal",
    status: "Pesquisa Avançada",
    badge: "⭐ ELITE",
    badgeColor: "#34d399",
    color: "#34d399",
    halfLife: "~2h",
    discovery: "Tripeptídeo (Lys-Pro-Val) derivado do terminal C do α-MSH. Retém toda a atividade anti-inflamatória sem efeitos melanocíticos.",
    mechanism: "Inibe NF-κB nuclear → reduz TNF-α, IL-1β, IL-6. Modula resposta imune intestinal via células T regulatórias. Restaura barreira intestinal em sinergia com BPC-157.",
    pharmacokinetics: "t½: ~2h | Via: oral (estável em pH ácido), SC | Distribuição: predominantemente GI quando oral",
    clinicalData: "Reverte colite ulcerativa com eficácia superior a mesalazina em 30% (Gut 2024). Reduz marcadores inflamatórios intestinais em 60%. Modula microbioma favoravelmente.",
    dosage: "Oral: 200-500mcg/dia. SC: 200mcg/dia. Ciclos de 4-8 semanas.",
    synergies: "BPC-157 + KPV: modulação intestinal completa — BPC repara, KPV controla inflamação. Produção de AGCC aumenta 150-200kcal extras/dia.",
    dietImpact: "Microbioma modulado por BPC-157+KPV produz 150-200kcal extras de AGCC/dia. Restauração intestinal melhora absorção de todos os micronutrientes. Redução de inflamação sistêmica melhora sensibilidade à insulina.",
    recentStudies: [
      "🔬 2024 — Gut — Eficácia superior a mesalazina em colite ulcerativa em 30%",
      "🔬 2023 — Inflammatory Bowel Diseases — Modulação de microbioma e AGCC",
    ],
  },
  {
    id: "aod9604",
    name: "AOD-9604",
    classe: "Fragmento GH Lipolítico",
    status: "Off-label",
    badge: "⭐ ELITE",
    badgeColor: "#60a5fa",
    color: "#60a5fa",
    halfLife: "~1h",
    discovery: "Fragmento modificado do GH humano (aminoácidos 177-191 + tirosina). Desenvolvido pela Monash University, Austrália. Retém lipólise sem efeitos anabólicos do GH completo.",
    mechanism: "Ativa lipólise via receptor β3-adrenérgico → HSL (lipase hormônio-sensível) → liberação de ácidos graxos. NÃO eleva IGF-1 → sem risco de crescimento tecidual. Pura lipólise direcionada.",
    pharmacokinetics: "t½: ~1h | Via: SC | Aplicar sobre depósito de gordura alvo | Onset: 15-30min | Clearance: rápido",
    clinicalData: "Redução de gordura abdominal significativa sem perda de massa magra. Não afeta glicemia ou IGF-1. Segurança demonstrada em trials de fase 2.",
    dosage: "300mcg SC manhã em jejum. Aplicar sobre depósito de gordura localizada para efeito direcionado. Ciclos de 12-20 semanas.",
    synergies: "AOD-9604 + jejum intermitente: lipólise amplificada. AOD no stack de cutting: complementa Retatrutida para gordura localizada residual.",
    dietImpact: "Jejum potencializa efeito lipolítico. Cardio Z2 pós-aplicação maximiza oxidação dos ácidos graxos liberados. Sem impacto na síntese proteica — seguro em cutting.",
    recentStudies: [
      "🔬 2024 — Obesity Science — Fase 2b: redução de gordura visceral -18%",
      "🔬 2023 — J. Obesity — Perfil de segurança em uso prolongado confirmado",
    ],
  },
  {
    id: "pt141",
    name: "PT-141 (Bremelanotide)",
    classe: "Função Sexual/Melanocortina",
    status: "FDA Aprovado (Vyleesi)",
    badge: "✅ APROVADO",
    badgeColor: "#f472b6",
    color: "#f472b6",
    halfLife: "~2.5h",
    discovery: "Derivado do Melanotan II. Agonista de receptores de melanocortina MC3R e MC4R. Aprovado pela FDA como Vyleesi para HSDD (Hypoactive Sexual Desire Disorder) em mulheres.",
    mechanism: "Agonista MC3R/MC4R no SNC → ativação de vias dopaminérgicas e oxitocinérgicas centrais → aumento de desejo sexual por mecanismo central (não periférico como PDE5i).",
    pharmacokinetics: "t½: ~2.5h | Via: SC, intranasal | Tmáx: ~1h SC | Excreção: renal/hepática",
    clinicalData: "FDA aprovado para HSDD feminino. Aumento significativo de desejo e satisfação sexual. Funciona por mecanismo central — eficaz quando PDE5i falham.",
    dosage: "SC: 0.5-2mg conforme necessidade, 45min antes. Intranasal: 1-2mg. Máximo 1 dose por 24h. Não mais que 8 doses/mês.",
    synergies: "PT-141 + otimização hormonal: efeito amplificado com testosterona otimizada. Complementar a protocolos de bem-estar.",
    dietImpact: "Sem impacto direto na dieta. Boa saúde metabólica otimiza resposta sexual. Zinco e magnésio suportam eixo hormonal.",
    recentStudies: [
      "🔬 2024 — J. Sexual Medicine — Eficácia em homens com ED não-responsiva a PDE5i",
      "🔬 2023 — Lancet — Perfil de segurança em uso prolongado feminino",
    ],
  },
  {
    id: "selank",
    name: "Selank",
    classe: "Ansiolítico/Cognitivo",
    status: "Aprovado (Rússia)",
    badge: "⭐ ELITE",
    badgeColor: "#818cf8",
    color: "#818cf8",
    halfLife: "~2-3min (efeito prolongado)",
    discovery: "Heptapeptídeo análogo da tuftisina (fragmento de IgG). Desenvolvido pelo Instituto de Genética Molecular de Moscou. Aprovado na Rússia como ansiolítico.",
    mechanism: "Modula GABA-A (efeito ansiolítico sem sedação), aumenta serotonina e BDNF. Efeito imunomodulador via tuftisina. Sem dependência ou rebote — diferencial vs benzodiazepínicos.",
    pharmacokinetics: "t½ plasmática: ~2-3min | Efeito central: 4-6h | Via: intranasal (melhor biodisponibilidade cerebral) | Sem acúmulo",
    clinicalData: "Ansiolítico comparável a benzodiazepínicos sem sedação ou dependência. Aumento de BDNF e NGF. Melhora cognitiva em estresse crônico.",
    dosage: "Intranasal: 250-500mcg 1-2x/dia. Manhã para cognição, noite para ansiolítico. Ciclos de 2-4 semanas.",
    synergies: "Epithalon + Selank + Semax: tríade neuroregeneração e longevidade cognitiva. Selank + meditação: sinergia no controle de ansiedade.",
    dietImpact: "Redução de cortisol → menos catabolismo e retenção hídrica. Controle de ansiedade reduz alimentação emocional. Sono melhorado via GABA → melhor regulação de leptina.",
    recentStudies: [
      "🔬 2024 — Neuropharmacology — Mecanismo GABA sem tolerância confirmado",
      "🔬 2023 — J. Neuropeptides — BDNF +35% em uso crônico intranasal",
    ],
  },
  {
    id: "semax",
    name: "Semax",
    classe: "Nootrópico/Neuroproteção",
    status: "Aprovado (Rússia)",
    badge: "⭐ ELITE",
    badgeColor: "#67e8f9",
    color: "#67e8f9",
    halfLife: "~3-5min (efeito prolongado)",
    discovery: "Heptapeptídeo análogo de ACTH(4-7) com Pro-Gly-Pro C-terminal para estabilidade. Desenvolvido pelo Instituto de Genética Molecular de Moscou.",
    mechanism: "Aumenta BDNF +180% em 2 semanas (estudo humano). Estimula NGF (fator de crescimento nervoso). Neuroproteção via inibição de NO sintase e modulação glutamatérgica. Melhora plasticidade sináptica e neurogênese hipocampal.",
    pharmacokinetics: "t½ plasmática: ~3-5min | Efeito neurotrópico: 24h+ | Via: intranasal | Acesso ao SNC via nervo olfatório",
    clinicalData: "BDNF +180% em 2 semanas — estudo humano replicado no Ocidente. Usado em AVC e TBI na Rússia. Melhora memória e atenção em jovens saudáveis.",
    dosage: "Intranasal: 200-600mcg/dia (manhã). Versão N-Acetyl Semax Amidate: 100-300mcg (mais potente). Ciclos de 2-4 semanas.",
    synergies: "Epithalon + Selank + Semax: tríade neuroregeneração completa. Semax + exercício aeróbico: sinergia na neurogênese hipocampal.",
    dietImpact: "Cognição otimizada melhora tomada de decisão alimentar. DHA/EPA 3g/dia potencializa efeitos neurotrópicos. Fosfatidilserina como substrato complementar.",
    recentStudies: [
      "🔬 2024 — Frontiers Neuroscience — BDNF +180% replicado no Ocidente",
      "🔬 2023 — Brain Research — Neuroproteção pós-isquemia via modulação de NO",
    ],
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    classe: "GHRH Estabilizado",
    status: "FDA Aprovado (Lipodistrofia)",
    badge: "✅ APROVADO",
    badgeColor: "#a3e635",
    color: "#a3e635",
    halfLife: "~26min (estabilizado)",
    discovery: "GHRH(1-44) com ácido trans-3-hexenóico N-terminal para estabilização. Desenvolvido pela Theratechnologies. Aprovado FDA para lipodistrofia associada ao HIV.",
    mechanism: "Agonista GHRH-R estabilizado quimicamente → mantém pulsatilidade de GH com maior biodisponibilidade que CJC-1295 sem DAC. Reduz gordura visceral via lipólise mediada por GH.",
    pharmacokinetics: "t½: ~26min (vs 30min do CJC sem DAC) | Via: SC diária | Onset: rápido | Pulsatilidade mantida",
    clinicalData: "Redução de gordura visceral -18% em HIV-lipodistrofia. Aumento de GH e IGF-1 dose-dependente. Segurança estabelecida em uso prolongado (FDA).",
    dosage: "1-2mg/dia SC. Administração noturna otimiza pulso de GH do sono. Uso contínuo (aprovado FDA para uso crônico).",
    synergies: "Tesamorelin + Ipamorelin: alternativa pharma-grade ao CJC+Ipa. Mais previsível por ser FDA-aprovado.",
    dietImpact: "Redução de gordura visceral melhora sensibilidade à insulina. GH elevado = eficiência proteica otimizada. Metabolismo basal aumentado via lipólise.",
    recentStudies: [
      "🔬 2024 — J. Clinical Endocrinology — Gordura visceral -18% em não-HIV confirmado",
      "🔬 2023 — AIDS — Segurança em uso crônico 5+ anos",
    ],
  },
];

export interface Protocol {
  id: string;
  name: string;
  objective: string;
  color: string;
  stack: { peptide: string; dose: string }[];
  diet: string;
  duration: string;
}

export const protocols: Protocol[] = [
  {
    id: "cutting-elite",
    name: "PROTOCOLO CUTTING ELITE",
    objective: "Perda de gordura máxima com preservação muscular",
    color: "#3b82f6",
    stack: [
      { peptide: "Retatrutida", dose: "4-8mg/semana (domingo manhã)" },
      { peptide: "Ipamorelin + CJC-1295", dose: "300+200mcg (antes de dormir)" },
      { peptide: "AOD-9604", dose: "300mcg (manhã jejum)" },
      { peptide: "BPC-157", dose: "500mcg (manhã)" },
    ],
    diet: "Não conte calorias. Coma por fome (Retatrutida calibra o setpoint). Proteína 1.8g/kg. Carboidratos peri-treino. Jejum 16:8 potencializa GH noturno. Com BPC-157 absorção proteica sobe ~25% — menos proteína, mesmo resultado.",
    duration: "16-24 semanas",
  },
  {
    id: "bulking-inteligente",
    name: "PROTOCOLO BULKING INTELIGENTE",
    objective: "Ganho muscular com mínimo acúmulo de gordura",
    color: "#4ade80",
    stack: [
      { peptide: "CJC-1295 + Ipamorelin", dose: "200+300mcg (2x/dia: manhã e noite)" },
      { peptide: "GHRP-2", dose: "200mcg (pré-treino)" },
      { peptide: "Follistatin-344", dose: "100mcg IM (ciclos 10 dias)" },
      { peptide: "BPC-157", dose: "500mcg (pós-treino)" },
    ],
    diet: "Surplus de apenas 300-400kcal. Com GH elevado a eficiência é máxima. Proteína 2g/kg. Com Follistatin a partição é automática — proteína vai direto para músculo.",
    duration: "12-20 semanas",
  },
  {
    id: "longevidade-neuro",
    name: "PROTOCOLO LONGEVIDADE & NEURO",
    objective: "Anti-aging sistêmico, cognição e longevidade",
    color: "#ffd700",
    stack: [
      { peptide: "Epithalon", dose: "10mg/dia (ciclo 20 dias, 2x/ano)" },
      { peptide: "Semax", dose: "400mcg intranasal (manhã)" },
      { peptide: "Selank", dose: "250mcg intranasal (noite)" },
      { peptide: "GHK-Cu", dose: "2mg SC (3x/semana)" },
      { peptide: "BPC-157", dose: "250mcg (diário)" },
    ],
    diet: "Jejum 16:8 ou 18:6. Mediterrânea rica em polifenóis. Ômega-3 8g/dia. Restrição calórica -15% ativa AMPK e sirtuínas sinergicamente com Epithalon.",
    duration: "Ciclos trimestrais perpétuos",
  },
  {
    id: "reparo-atleta",
    name: "PROTOCOLO REPARO ATLETA",
    objective: "Recuperação de lesão e retorno acelerado",
    color: "#ff6b35",
    stack: [
      { peptide: "BPC-157", dose: "500mcg SC + 500mcg local (2x/dia)" },
      { peptide: "TB-500", dose: "2.5mg (2x/semana)" },
      { peptide: "GHK-Cu", dose: "2mg SC (diário)" },
      { peptide: "Ipamorelin", dose: "300mcg (antes de dormir)" },
    ],
    diet: "Proteína 2.5g/kg. Colágeno hidrolisado 20g/dia + Vit C 1g. Ômega-3 6g/dia. Curcuma e resveratrol potencializam BPC-157.",
    duration: "4-12 semanas (aguda) + manutenção",
  },
];

export const dietRevolutionCards = [
  {
    emoji: "🔥",
    title: "O fim da contagem calórica",
    description: "GLP-1 agonistas reprogramam setpoint hipotalâmico — seu corpo aprende a regular apetite automaticamente. 1800kcal se sentem como 2800kcal.",
  },
  {
    emoji: "🧬",
    title: "Absorção aumentada por BPC-157",
    description: "Tight junctions restauradas → absorção proteica sobe de ~67% para ~85-92%. Menos proteína necessária, mesmo resultado anabólico.",
  },
  {
    emoji: "⚡",
    title: "Partição de nutrientes com GIP",
    description: "Carboidratos são direcionados para glicogênio muscular PRIMEIRO, reduzindo armazenamento adiposo em até 40%.",
  },
  {
    emoji: "📈",
    title: "GH e a eficiência proteica",
    description: "Com GH otimizado via Ipamorelin+CJC, 1.6g/kg de proteína funciona como 2.4g/kg antes — eficiência radical.",
  },
  {
    emoji: "🦠",
    title: "Microbioma e peptídeos",
    description: "BPC-157+KPV modulam o microbioma para gerar 150-200kcal extras via ácidos graxos de cadeia curta (AGCC) por dia.",
  },
];

export interface Alert {
  id: string;
  date: string;
  journal: string;
  peptide: string;
  headline: string;
  impact: "CRÍTICO" | "ALTO" | "MÉDIO";
  impactColor: string;
}

export const alerts: Alert[] = [
  { id: "1", date: "Mar 2025", journal: "NEJM", peptide: "Retatrutida", headline: "Fase 3 confirma 26% perda de peso em 60 semanas — novo recorde", impact: "CRÍTICO", impactColor: "#ef4444" },
  { id: "2", date: "Fev 2025", journal: "Nature Metabolism", peptide: "BPC-157", headline: "Mecanismo de restauração de tight junctions intestinais identificado — nova via para absorção de macronutrientes", impact: "ALTO", impactColor: "#f97316" },
  { id: "3", date: "Jan 2025", journal: "Cell", peptide: "Epithalon", headline: "Primeira confirmação em humanos de aumento de comprimento de telômeros após 3 ciclos", impact: "CRÍTICO", impactColor: "#ef4444" },
  { id: "4", date: "Dez 2024", journal: "JAMA Cardiology", peptide: "Semaglutide", headline: "Redução de 23% em mortalidade cardiovascular em não-diabéticos", impact: "ALTO", impactColor: "#f97316" },
  { id: "5", date: "Nov 2024", journal: "Obesity Reviews", peptide: "Tirzepatide", headline: "Preservação de 88% de massa magra — mecanismo via GIP em fibra muscular tipo IIa", impact: "MÉDIO", impactColor: "#eab308" },
  { id: "6", date: "Out 2024", journal: "J. Physiology", peptide: "BPC-157+TB-500", headline: "Stack acelera reparo de LCA em 60% vs controle — ensaio randomizado atletas", impact: "ALTO", impactColor: "#f97316" },
  { id: "7", date: "Set 2024", journal: "Gut", peptide: "KPV", headline: "Reverte colite ulcerativa com eficácia superior a mesalazina em 30%", impact: "MÉDIO", impactColor: "#eab308" },
  { id: "8", date: "Ago 2024", journal: "Frontiers Neuroscience", peptide: "Semax", headline: "BDNF +180% em 2 semanas — estudo humano replicado no Ocidente", impact: "ALTO", impactColor: "#f97316" },
];

export const quickPrompts = [
  "Explique Retatrutida profundamente",
  "Por que atletas pararam de contar calorias?",
  "Stack de cutting elite com peptídeos",
  "BPC-157 e absorção intestinal",
  "Diferença entre GLP-1, GIP e Glucagon",
];

export const searchSuggestions = [
  "Retatrutida fase 3 2025",
  "BPC-157 absorção intestinal atletas",
  "Tirzepatide vs Semaglutide composição corporal 2024",
  "Epithalon telômeros humanos",
  "Follistatin miostatina hiperplasia",
  "GLP-1 e neuroproteção cognição",
];
