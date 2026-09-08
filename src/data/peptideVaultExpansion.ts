import type { Peptide } from "./peptideVaultData";

/** Expansão 2026 da PeptideVault — compostos recentes e em pesquisa. */
export const peptidesExpansion: Peptide[] = [
  {
    "id": "survodutide",
    "name": "Survodutide",
    "classe": "Coagonista duplo dos receptores GLP-1 e glucagon, peptídico, de administração semanal",
    "status": "Fase 3",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#0EA5E9",
    "halfLife": "~4-5 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "anti-aging"
    ],
    "discovery": "Survodutide, também conhecido como BI 456906, foi desenvolvido pela Boehringer Ingelheim em colaboração com a Zealand Pharma como análogo de oxintomodulina com ação em GLP-1R e GCGR. Em 2025-2026 encontra-se em desenvolvimento fase 3 para obesidade e em estudos avançados para MASH/NASH, sem aprovação FDA até o momento.",
    "mechanism": "Ativa GLP-1R, aumentando secreção de insulina dependente de glicose, reduzindo glucagon pós-prandial, retardando esvaziamento gástrico e elevando saciedade por vias hipotalâmicas e troncoencefálicas. A ativação concomitante de GCGR aumenta gasto energético, lipólise hepática e oxidação de ácidos graxos, mas pode elevar glicose se não houver contrapeso incretínico suficiente. O desenho balanceado visa obter perda ponderal maior que agonistas GLP-1 puros, com potencial benefício em esteatose hepática e inflamação metabólica. A perda de peso decorre de menor ingestão calórica e possível aumento modesto de termogênese mediado por glucagon.",
    "pharmacokinetics": "t½: aproximadamente 4-5 dias | Via: subcutânea semanal em ensaios | outros: titulação gradual é usada para reduzir eventos gastrointestinais; não há formulação aprovada comercialmente.",
    "clinicalData": "Em estudo fase 2 de obesidade, doses semanais até 4,8 mg por 46 semanas produziram perda média de peso próxima de 18,7% versus cerca de 2,8% com placebo, com maior taxa de náusea, vômito e diarreia durante titulação. Em MASH, estudos fase 2 com biópsia mostraram melhora histológica significativamente superior ao placebo, incluindo resolução/melhora de esteato-hepatite sem piora de fibrose em proporções aproximadamente na faixa de 47-62% dependendo da dose e do endpoint, versus cerca de 14% no placebo em publicações/comunicados de 2024. Ainda não há dados de desfechos cardiovasculares, mortalidade ou segurança de muito longo prazo.",
    "dosage": "Ensaios relataram titulação subcutânea semanal em faixas aproximadas de 0,3 a 6,0 mg, com doses-alvo frequentes entre 2,4 e 4,8 mg; informação apenas contextual, sem dose clínica aprovada.",
    "synergies": "Combinações conceituais discutidas incluem dieta hipocalórica hiperproteica, treinamento resistido para preservação de massa magra e, em MASH, manejo simultâneo de dislipidemia, resistência insulínica e álcool zero. Associação com outros incretínicos ou análogos de amilina não é estabelecida e pode aumentar intolerância gastrointestinal.",
    "dietImpact": "Favorece redução importante da ingestão energética por saciedade precoce; na prática exige foco em proteína, fibras e micronutrientes para reduzir perda de massa magra, constipação e baixa ingestão alimentar. O componente glucagon pode ser interessante para gordura hepática, mas requer monitoramento metabólico em diabéticos pelo potencial de alterações glicêmicas durante titulação.",
    "recentStudies": [
      "🔬 2024 — The New England Journal of Medicine/estudo fase 2 em obesidade — perda ponderal dose-dependente, chegando a aproximadamente 18,7% em 46 semanas na dose mais alta estudada.",
      "🔬 2024 — Dados fase 2 em MASH divulgados/publicados — melhora histológica de esteato-hepatite significativamente superior a placebo, apoiando avanço para fase 3.",
      "🔬 2025 — Programa SYNCHRONIZE fase 3 — avaliação de eficácia e segurança em obesidade e comorbidades metabólicas em larga escala."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Perda de peso substancial em estudos fase 2",
      "Potencial redução de gordura hepática e atividade inflamatória em MASH",
      "Melhora esperada de glicemia, resistência insulínica, pressão arterial e marcadores cardiometabólicos secundários à perda ponderal"
    ],
    "efeitosColaterais": [
      "Náusea, vômito, diarreia, constipação e desconforto abdominal",
      "Risco teórico/observado de colelitíase e pancreatite como classe incretínica, especialmente com perda rápida de peso",
      "Possível aumento de frequência cardíaca e necessidade de cautela em doença gastrointestinal grave"
    ],
    "notas": "Não deve ser usado fora de ensaio clínico. Cautela em história de pancreatite, doença biliar ativa, gastroparesia grave e uso concomitante de fármacos hipoglicemiantes como insulina ou sulfonilureias. Produtos de mercado paralelo têm risco relevante de erro de sequência, agregação, endotoxina e pureza inadequada mesmo quando rotulados como HPLC.",
    "vanguarda": true
  },
  {
    "id": "orforglipron",
    "name": "Orforglipron",
    "classe": "Agonista oral não peptídico do receptor GLP-1",
    "status": "Fase 3",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#7C3AED",
    "halfLife": "~30-40h",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo"
    ],
    "discovery": "Orforglipron, desenvolvido pela Eli Lilly, é uma pequena molécula oral agonista de GLP-1R, diferente dos peptídeos injetáveis e projetada para administração diária sem restrições complexas de jejum. Em 2025-2026 permanece em fase 3 nos programas ATTAIN e ACHIEVE para obesidade e diabetes tipo 2, sem aprovação FDA.",
    "mechanism": "Liga-se de modo alostérico/ortostérico funcional ao GLP-1R e promove sinalização incretínica com aumento de AMPc, secreção de insulina dependente de glicose e redução da ingestão alimentar. Por ser não peptídico e oral, evita degradação proteolítica típica de peptídeos, mas depende de exposição sistêmica suficiente e adesão diária. Reduz apetite por circuitos centrais de saciedade e melhora glicemia por efeitos pancreáticos e gástricos. Não ativa GIPR, GCGR ou receptor de amilina, portanto sua farmacologia é mais próxima de um agonista GLP-1 puro.",
    "pharmacokinetics": "t½: aproximadamente 30-40 horas em dados públicos | Via: oral diária | outros: não é peptídeo; nos ensaios foi administrado uma vez ao dia, com titulação para reduzir intolerância gastrointestinal.",
    "clinicalData": "No estudo fase 2 em obesidade publicado em 2023, orforglipron 12-45 mg/dia por 36 semanas reduziu peso corporal em cerca de 8,6-12,6% versus 2,0% com placebo; 46-75% dos participantes atingiram perda ≥10% conforme a dose, versus cerca de 9% no placebo. Em diabetes tipo 2, estudos fase 2 mostraram reduções clinicamente relevantes de HbA1c e peso, com eventos gastrointestinais dose-dependentes. Dados fase 3 iniciais/top-line de 2025 em diabetes relataram reduções de HbA1c aproximadamente na faixa de 1,3-1,6 ponto percentual e perda de peso dose-dependente, mas a avaliação regulatória completa ainda depende de publicações e revisão por agências.",
    "dosage": "Ensaios utilizaram doses orais diárias como 12, 24, 36 e 45 mg, com titulação gradual; não há dose aprovada para prescrição.",
    "synergies": "Pode ser combinado conceitualmente com intervenção nutricional, exercício resistido e fármacos cardiometabólicos padrão. Combinação com insulina ou sulfonilureias requer monitoramento por risco de hipoglicemia indireta; uso com outros agonistas GLP-1, tirzepatida ou análogos de amilina não é validado.",
    "dietImpact": "Tende a reduzir fome, beliscos e tamanho das porções; por ser oral diário pode melhorar acesso e adesão em pessoas avessas a injeções. Dietas muito restritivas podem piorar náusea e baixa ingestão proteica, então a estratégia prática deve priorizar proteína, hidratação, fibras e progressão calórica sustentável.",
    "recentStudies": [
      "🔬 2023 — New England Journal of Medicine — fase 2 em obesidade mostrou perda de 8,6-12,6% em 36 semanas versus 2,0% com placebo.",
      "🔬 2023 — JAMA/ensaios em diabetes tipo 2 — reduções de HbA1c e peso com perfil gastrointestinal típico de GLP-1R.",
      "🔬 2025 — Programa ACHIEVE/ATTAIN, comunicados fase 3 — eficácia glicêmica e ponderal dose-dependente; dados completos ainda aguardam publicação/revisão regulatória."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Administração oral diária sem injeção",
      "Perda de peso clinicamente significativa em fase 2",
      "Melhora de HbA1c em diabetes tipo 2"
    ],
    "efeitosColaterais": [
      "Náusea, vômito, diarreia, dispepsia e constipação",
      "Possível desidratação se vômitos forem persistentes",
      "Riscos de classe: colelitíase, pancreatite rara e cautela em gastroparesia"
    ],
    "notas": "Apesar de frequentemente agrupado com terapias incretínicas, não é peptídeo. Deve-se avaliar interações com fármacos de janela terapêutica estreita se houver vômitos ou alteração de esvaziamento gástrico. Produtos vendidos como matéria-prima de pesquisa sem cadeia GMP não são equivalentes a formulação clínica.",
    "vanguarda": true
  },
  {
    "id": "pemvidutide",
    "name": "Pemvidutide",
    "classe": "Coagonista duplo GLP-1/glucagon com extensão de meia-vida",
    "status": "Fase 2",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#06B6D4",
    "halfLife": "~6-7 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "reparo"
    ],
    "discovery": "Pemvidutide, também chamado ALT-801, é desenvolvido pela Altimmune como agonista balanceado GLP-1R/GCGR para obesidade e MASH. Em 2025-2026 permanece em desenvolvimento clínico, com dados fase 2/2b positivos e sem aprovação FDA.",
    "mechanism": "O componente GLP-1 reduz apetite, retarda esvaziamento gástrico e melhora secreção de insulina dependente de glicose. O componente glucagon aumenta oxidação lipídica, mobilização de gordura hepática e potencial gasto energético, podendo favorecer redução de gordura visceral e hepática. A modificação de meia-vida permite administração semanal e exposição sustentada. O equilíbrio entre GLP-1 e glucagon é central para evitar hiperglicemia e maximizar perda de gordura.",
    "pharmacokinetics": "t½: aproximadamente 6-7 dias | Via: subcutânea semanal | outros: molécula peptídica modificada para maior duração; titulação em ensaios reduz eventos gastrointestinais.",
    "clinicalData": "No estudo MOMENTUM fase 2 em obesidade, pemvidutide por 48 semanas gerou perda média de peso próxima de 15,6% na dose de 2,4 mg versus cerca de 2,2% com placebo, com grande parte da perda atribuída a massa gorda em subestudos de composição corporal. No estudo IMPACT em MASH, resultados fase 2b/top-line de 24 semanas relataram resolução de MASH sem piora de fibrose em aproximadamente 55-59% nos grupos pemvidutide versus cerca de 19% no placebo; melhora de fibrose também foi numericamente superior em alguns braços. Ainda faltam dados definitivos de fase 3, desfechos hepáticos rígidos e segurança prolongada.",
    "dosage": "Ensaios usaram doses semanais subcutâneas em torno de 1,2, 1,8 e 2,4 mg, com titulação; uso exclusivamente informativo e sem dose aprovada.",
    "synergies": "A literatura discute associação com dieta mediterrânea/hipocalórica, restrição de álcool em MASH, exercício resistido e controle de dislipidemia. Não há evidência robusta para combinação com outros incretínicos, e o risco de náusea, vômito e perda excessiva de massa magra pode aumentar.",
    "dietImpact": "Pode ser particularmente relevante em fenótipo com obesidade visceral e esteatose hepática. A dieta deve enfatizar proteína adequada, treinamento de força, redução de frutose/álcool e fibras, pois a perda rápida de peso pode aumentar risco biliar e reduzir massa magra se a nutrição for inadequada.",
    "recentStudies": [
      "🔬 2024 — MOMENTUM fase 2 — perda de peso até aproximadamente 15,6% em 48 semanas versus cerca de 2,2% com placebo.",
      "🔬 2025 — IMPACT fase 2b em MASH, dados top-line — resolução de MASH sem piora de fibrose em cerca de 55-59% versus cerca de 19% no placebo.",
      "🔬 2025 — Subestudos de composição corporal — sugerem predominância de perda de massa gorda, mas dados ainda precisam de confirmação independente ampla."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Perda ponderal relevante em obesidade",
      "Potencial redução de gordura hepática e melhora histológica em MASH",
      "Possível melhora de triglicerídeos, resistência insulínica e marcadores inflamatórios metabólicos"
    ],
    "efeitosColaterais": [
      "Náusea, vômito, diarreia e constipação",
      "Potencial risco de eventos biliares com perda de peso rápida",
      "Aumento de frequência cardíaca e cautela em diabetes descompensado pela atividade glucagon"
    ],
    "notas": "Não aprovado para uso clínico. Monitoramento hepático, pancreático e biliar é relevante em estudos. Amostras vendidas como research chemical podem não reproduzir a molécula clínica, especialmente por modificações de meia-vida, agregação peptídica e impurezas.",
    "vanguarda": true
  },
  {
    "id": "cagrisema",
    "name": "CagriSema",
    "classe": "Combinação fixa de cagrilintida, análogo de amilina, com semaglutida, agonista GLP-1R",
    "status": "Fase 3",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#10B981",
    "halfLife": "~7-8 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "anti-aging"
    ],
    "discovery": "CagriSema é desenvolvido pela Novo Nordisk como combinação semanal de cagrilintida 2,4 mg e semaglutida 2,4 mg. Em 2025-2026 está em fase 3 para obesidade e diabetes tipo 2; sem aprovação FDA como combinação, embora semaglutida isolada já seja aprovada para indicações metabólicas.",
    "mechanism": "Semaglutida ativa GLP-1R, aumentando saciedade, reduzindo esvaziamento gástrico e melhorando secreção de insulina dependente de glicose. Cagrilintida é análogo de amilina que atua em receptores de amilina/calcitonina no tronco encefálico e hipotálamo, aumentando saciedade e reduzindo recompensa alimentar. A combinação explora vias anorexígenas complementares, frequentemente com maior redução de ingestão energética que GLP-1 isolado. O efeito metabólico resulta de perda ponderal, melhora de glicemia, menor adiposidade visceral e possível redução de inflamação associada à obesidade.",
    "pharmacokinetics": "t½: semaglutida ~7 dias; cagrilintida ~7-8 dias | Via: subcutânea semanal | outros: combinação em titulação escalonada; farmacocinética compatível com aplicação semanal.",
    "clinicalData": "Em estudo fase 2 em diabetes tipo 2, CagriSema mostrou maior redução de peso que semaglutida ou cagrilintida isoladas, com perda percentual em torno de 15,6% em 32 semanas em análises publicadas, além de melhora de HbA1c. No programa fase 3 REDEFINE, dados top-line em obesidade sem diabetes relataram perda média de peso aproximadamente na faixa de 20,4-22,7% em 68 semanas conforme estimativa e adesão, versus cerca de 2,3% com placebo. Em diabetes tipo 2, dados top-line relataram perda de peso em torno de 15,7% em 68 semanas e redução relevante de HbA1c; os dados completos revisados por pares ainda são importantes para interpretação de tolerabilidade e adesão.",
    "dosage": "Regime investigacional alvo: cagrilintida 2,4 mg + semaglutida 2,4 mg por via subcutânea uma vez por semana, com escalonamento progressivo; sem dose aprovada para a combinação.",
    "synergies": "Dieta estruturada, terapia comportamental e treinamento resistido são essenciais para preservar massa magra. Associação com metformina, estatinas e anti-hipertensivos segue prática cardiometabólica usual; combinação com outros GLP-1, GIP/GLP-1 ou amilina não é recomendada fora de pesquisa.",
    "dietImpact": "O impacto na dieta tende a ser intenso, com forte redução de fome e porções; isso aumenta risco de ingestão insuficiente de proteína, ferro, B12, cálcio e fibras se não houver planejamento. Na recomposição corporal, treinamento resistido e ingestão proteica distribuída ao longo do dia são decisivos para mitigar perda de massa magra.",
    "recentStudies": [
      "🔬 2023 — The Lancet/estudo fase 2 em diabetes tipo 2 — combinação superou componentes isolados em perda de peso e controle glicêmico.",
      "🔬 2024 — REDEFINE-1, comunicado fase 3 — perda média de peso aproximada de 20,4-22,7% em 68 semanas, dependendo da estimativa de adesão.",
      "🔬 2025 — REDEFINE-2, comunicado fase 3 em diabetes tipo 2 — perda de peso em torno de 15,7% e melhora substancial de HbA1c."
    ],
    "evidencia": "FORTE",
    "beneficios": [
      "Perda de peso muito expressiva em estudos fase 3",
      "Melhora glicêmica robusta em diabetes tipo 2",
      "Mecanismos complementares de saciedade por GLP-1 e amilina"
    ],
    "efeitosColaterais": [
      "Náusea, vômito, constipação, diarreia e redução excessiva de apetite",
      "Risco de colelitíase associado à perda rápida de peso",
      "Hipoglicemia principalmente se combinado com insulina ou sulfonilureias"
    ],
    "notas": "Contraindicações e alertas provavelmente acompanharão a classe GLP-1, incluindo cautela em pancreatite, doença biliar, gastroparesia grave e histórico de carcinoma medular de tireoide/MEN2 para agonistas GLP-1 conforme rotulagem de semaglutida. Não comprar versões manipuladas ou de pesquisa da combinação: proporção, estabilidade e pureza são críticas.",
    "vanguarda": true
  },
  {
    "id": "mazdutide",
    "name": "Mazdutide",
    "classe": "Coagonista duplo dos receptores GLP-1 e glucagon",
    "status": "Fase 3",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#F97316",
    "halfLife": "~9-10 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo"
    ],
    "discovery": "Mazdutide, também conhecido como IBI362, é desenvolvido pela Innovent Biologics com origem em colaboração/licenciamento associado à Eli Lilly para o mercado chinês. Em 2025-2026 possui dados fase 3 na China para obesidade e diabetes tipo 2, mas não é aprovado pelo FDA.",
    "mechanism": "É um agonista duplo GLP-1R/GCGR que combina saciedade e melhora glicêmica mediadas por GLP-1 com aumento de gasto energético e oxidação lipídica mediado por glucagon. A sinalização em GLP-1R reduz ingestão calórica e melhora secreção de insulina dependente de glicose. A ativação de GCGR pode favorecer redução de gordura hepática e visceral, mas exige balanço farmacológico para evitar hiperglicemia. A longa meia-vida permite administração semanal e exposição sustentada.",
    "pharmacokinetics": "t½: aproximadamente 9-10 dias em dados clínicos públicos | Via: subcutânea semanal | outros: titulação escalonada; farmacocinética prolongada compatível com acúmulo gradual.",
    "clinicalData": "Em estudos fase 2 chineses, mazdutide produziu perda de peso dose-dependente, com doses mais altas relatando reduções de dois dígitos em 24 semanas. No estudo fase 3 GLORY-1 em adultos chineses com sobrepeso/obesidade, dados divulgados relataram perda média de peso em torno de 14,8% com 6 mg e 18,6% com 9 mg em 48 semanas, versus cerca de 2% com placebo. Em diabetes tipo 2, ensaios relataram reduções relevantes de HbA1c e peso; dados globais e de populações não chinesas ainda são mais limitados que semaglutida/tirzepatida.",
    "dosage": "Ensaios relataram doses semanais subcutâneas como 3, 4,5, 6 e 9 mg, com titulação; algumas pesquisas exploraram doses mais altas, mas não há dose aprovada pelo FDA.",
    "synergies": "Intervenção nutricional com déficit calórico, exercício resistido e manejo de esteatose hepática podem potencializar resultados. Associação com outros incretínicos não é estabelecida; antidiabéticos que causam hipoglicemia exigem ajuste e monitorização.",
    "dietImpact": "Pode reduzir fortemente apetite e peso, com possível impacto favorável em gordura visceral e hepática. O plano alimentar deve evitar subnutrição proteica e priorizar manutenção de massa magra, controle de álcool, fibras e hidratação, especialmente em doses mais altas.",
    "recentStudies": [
      "🔬 2023 — Ensaios fase 2 na China — perda de peso dose-dependente e melhora de marcadores glicometabólicos.",
      "🔬 2024 — GLORY-1 fase 3, dados divulgados pela Innovent — perda média de aproximadamente 14,8% com 6 mg e 18,6% com 9 mg em 48 semanas.",
      "🔬 2025 — Programas chineses em obesidade/diabetes — expansão regulatória e estudos de segurança, ainda sem aprovação FDA."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Perda de peso robusta em estudos chineses",
      "Melhora de HbA1c e parâmetros cardiometabólicos",
      "Potencial benefício em gordura hepática por agonismo de glucagon"
    ],
    "efeitosColaterais": [
      "Eventos gastrointestinais dose-dependentes",
      "Potencial risco biliar com perda rápida de peso",
      "Cautela com frequência cardíaca, glicemia e tolerabilidade em doses altas"
    ],
    "notas": "A generalização para populações fora dos estudos chineses requer confirmação. Não há produto FDA aprovado. Peptídeos obtidos fora de cadeia farmacêutica podem apresentar impurezas, degradação e concentração incorreta, o que é particularmente problemático em agonistas de longa meia-vida.",
    "vanguarda": true
  },
  {
    "id": "danuglipron",
    "name": "Danuglipron",
    "classe": "Agonista oral não peptídico do receptor GLP-1",
    "status": "Descontinuado",
    "badge": "⛔ DESCONTINUADO",
    "badgeColor": "#DC2626",
    "color": "#991B1B",
    "halfLife": "~4-6h",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo"
    ],
    "discovery": "Danuglipron, desenvolvido pela Pfizer, foi uma pequena molécula oral agonista de GLP-1R inicialmente estudada em formulações de administração duas vezes ao dia e posteriormente uma vez ao dia. O desenvolvimento foi interrompido em 2025 após problemas de tolerabilidade e sinais laboratoriais de segurança hepática em desenvolvimento clínico, sem aprovação FDA.",
    "mechanism": "Ativa GLP-1R para aumentar AMPc, estimular secreção de insulina dependente de glicose, reduzir apetite e retardar esvaziamento gástrico. Como pequena molécula oral de meia-vida curta, exigia exposição diária consistente e, nas formulações iniciais, doses elevadas e titulação. A farmacodinâmica é de agonismo GLP-1 puro, sem ação em GIPR, GCGR ou amilina. A eficácia ponderal foi real, mas limitada por náusea, vômito e descontinuações.",
    "pharmacokinetics": "t½: aproximadamente 4-6 horas | Via: oral, inicialmente duas vezes ao dia; formulação diária foi investigada | outros: não é peptídeo; curta meia-vida contribuiu para necessidade de doses frequentes ou formulação modificada.",
    "clinicalData": "Em diabetes tipo 2, estudos fase 2 relataram reduções de HbA1c aproximadamente até 1 ponto percentual ou mais e perda de peso de alguns quilogramas em 16 semanas, dependendo da dose. Em obesidade, fase 2b demonstrou perda de peso clinicamente relevante, mas com alta incidência de eventos gastrointestinais e taxas elevadas de abandono em doses maiores. Em 2025, a Pfizer comunicou descontinuação do programa após elevações assintomáticas de enzimas hepáticas em participante(s) de estudo da formulação uma vez ao dia, encerrando o desenvolvimento.",
    "dosage": "Ensaios investigaram ampla faixa oral, incluindo esquemas duas vezes ao dia com doses de dezenas a centenas de miligramas e formulações de liberação/uso diário; não há dose clínica aprovada e o desenvolvimento foi descontinuado.",
    "synergies": "Como programa foi descontinuado, combinações são apenas históricas/conceituais: dieta, exercício e antidiabéticos padrão. Associação com outros GLP-1 ou hepatotóxicos seria particularmente inadequada diante dos sinais de segurança.",
    "dietImpact": "Quando eficaz, reduzia ingestão calórica por saciedade, mas a tolerabilidade gastrointestinal dificultava adesão nutricional. Náuseas e vômitos poderiam comprometer hidratação, ingestão proteica e eletrólitos.",
    "recentStudies": [
      "🔬 2023 — Ensaios fase 2 em diabetes tipo 2 — melhora de HbA1c e redução de peso, com eventos gastrointestinais dose-dependentes.",
      "🔬 2023-2024 — Fase 2b em obesidade — perda ponderal significativa, porém altas taxas de náusea, vômito e descontinuação.",
      "🔬 2025 — Comunicado Pfizer — desenvolvimento interrompido após sinal de elevação de enzimas hepáticas em estudo da formulação uma vez ao dia."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Demonstrou prova de conceito para GLP-1 oral não peptídico",
      "Reduziu peso em estudos de obesidade",
      "Melhorou glicemia em diabetes tipo 2"
    ],
    "efeitosColaterais": [
      "Náusea, vômito, diarreia e dispepsia frequentes",
      "Alta taxa de descontinuação em doses maiores",
      "Sinal de segurança hepática que contribuiu para interrupção do desenvolvimento"
    ],
    "notas": "Não deve ser usado; desenvolvimento encerrado. Qualquer oferta comercial é suspeita e não corresponde a medicamento aprovado. O histórico reforça que agonistas GLP-1 orais não peptídicos exigem avaliação hepática e tolerabilidade rigorosa.",
    "vanguarda": false
  },
  {
    "id": "ecnoglutide",
    "name": "Ecnoglutide",
    "classe": "Agonista peptídico de longa ação do receptor GLP-1",
    "status": "Fase 3",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#22C55E",
    "halfLife": "~5-7 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo"
    ],
    "discovery": "Ecnoglutide, também conhecido como XW003, é desenvolvido pela Sciwind Biosciences como agonista GLP-1R semanal, com foco em obesidade e diabetes tipo 2. Em 2025-2026 está em desenvolvimento avançado principalmente na China; não possui aprovação FDA.",
    "mechanism": "Ecnoglutide ativa GLP-1R e induz sinalização incretínica com secreção de insulina dependente de glicose, redução de apetite e atraso do esvaziamento gástrico. Dados pré-clínicos e descrições do desenvolvedor sugerem perfil de longa ação e possível viés de sinalização, mas a relevância clínica desse viés ainda não é plenamente estabelecida. Como GLP-1 puro, a perda de peso depende principalmente de redução de ingestão alimentar e melhora glicometabólica. Não possui ação direta conhecida em GIPR, glucagon ou amilina.",
    "pharmacokinetics": "t½: aproximadamente 5-7 dias em estimativas públicas de longa ação | Via: subcutânea semanal | outros: dados farmacocinéticos completos revisados por pares são mais limitados que para semaglutida.",
    "clinicalData": "Ensaios fase 1/2 na China relataram redução dose-dependente de peso e HbA1c, com perfil de eventos adversos predominantemente gastrointestinal. Entretanto, a quantidade de dados humanos completos, publicados e revisados por pares ainda é menor que a de semaglutida, tirzepatida e CagriSema; muitos números vêm de divulgações corporativas e registros de estudos. Portanto, a eficácia parece promissora, mas a robustez externa e comparativa ainda é preliminar/moderada.",
    "dosage": "Ensaios investigaram administração subcutânea semanal com titulação e múltiplos níveis de dose; faixas exatas variam por protocolo e ainda não há posologia aprovada pelo FDA.",
    "synergies": "Intervenção nutricional, exercício resistido e manejo padrão de diabetes/dislipidemia são sinergias plausíveis. Combinação com outros agonistas incretínicos não tem validação clínica e tende a somar eventos gastrointestinais.",
    "dietImpact": "Deve reduzir apetite e facilitar déficit calórico, semelhante a outros GLP-1R. A conduta nutricional prática é preservar proteína, fibras e micronutrientes, com atenção a constipação, baixa ingestão e possível perda de massa magra.",
    "recentStudies": [
      "🔬 2023-2024 — Ensaios fase 1/2 na China — dados públicos indicaram perda de peso e melhora glicêmica dose-dependentes.",
      "🔬 2024 — Sciwind Biosciences, atualizações clínicas — avanço de programas em obesidade e diabetes tipo 2.",
      "🔬 2025 — Estudos fase 3/registracionais chineses — avaliação ampliada de eficácia e segurança; publicações completas ainda são aguardadas."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Potencial agonista GLP-1 semanal para obesidade e diabetes",
      "Redução de peso e HbA1c em dados iniciais",
      "Perfil mecanístico familiar à classe GLP-1"
    ],
    "efeitosColaterais": [
      "Náusea, vômito, diarreia, constipação e dispepsia",
      "Riscos de classe como doença biliar e pancreatite rara",
      "Incerteza sobre segurança comparativa de longo prazo"
    ],
    "notas": "A evidência é limitada por menor volume de publicações revisadas por pares e predominância de dados regionais/corporativos. Não aprovado pelo FDA. Formulações de pesquisa ou mercado paralelo não devem ser consideradas equivalentes ao produto clínico.",
    "vanguarda": true
  },
  {
    "id": "amycretin",
    "name": "Amycretin",
    "classe": "Coagonista unimolecular dos receptores de amilina e GLP-1",
    "status": "Fase 2",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#A855F7",
    "halfLife": "~7 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "anti-aging"
    ],
    "discovery": "Amycretin é desenvolvido pela Novo Nordisk como uma molécula única capaz de ativar vias de amilina e GLP-1, com versões subcutânea e oral investigadas. Em 2025-2026 está em desenvolvimento clínico inicial/intermediário para obesidade, com dados humanos promissores mas ainda não confirmados por fase 3.",
    "mechanism": "Combina agonismo GLP-1R com ativação de receptores de amilina/calcitonina, integrando sinalização de saciedade periférica e central. O componente GLP-1 melhora secreção de insulina dependente de glicose, reduz apetite e retarda esvaziamento gástrico. A ação tipo amilina aumenta saciedade, reduz ingestão alimentar e pode modular resposta pós-prandial por vias no tronco encefálico. A proposta é obter eficácia semelhante ou superior a combinações GLP-1 + amilina com uma única entidade molecular.",
    "pharmacokinetics": "t½: dados completos públicos ainda limitados; formulação subcutânea é compatível com uso semanal, estimada em torno de ~7 dias | Via: subcutânea semanal e formulação oral em investigação | outros: sem formulação aprovada.",
    "clinicalData": "Dados fase 1 com amycretin oral divulgados pela Novo Nordisk relataram perda média de peso de aproximadamente 13,1% em 12 semanas versus cerca de 1,1% com placebo, resultado notável mas em amostras pequenas e curta duração. Dados subcutâneos iniciais/top-line relataram perda de peso muito elevada em seguimento de meses, em torno de até 20% ou mais em determinados braços, mas ainda dependem de publicação revisada por pares e confirmação em fase 2/3. Portanto, a evidência é promissora, porém ainda preliminar.",
    "dosage": "Ensaios usaram escalonamentos específicos por protocolo para formulação oral e subcutânea; doses exatas ainda não estão consolidadas como posologia clínica e não há dose aprovada.",
    "synergies": "Sinergia esperada com dieta hipocalórica de alta qualidade, acompanhamento comportamental e musculação. Combinação com semaglutida, tirzepatida, CagriSema ou outros análogos de amilina não é estudada adequadamente e pode ser redundante ou mal tolerada.",
    "dietImpact": "Pode causar supressão intensa de apetite, exigindo planejamento para evitar ingestão calórica e proteica insuficiente. Em prática nutricional, monitorar náusea, hidratação, constipação, massa magra e sinais de deficiência micronutricional seria essencial.",
    "recentStudies": [
      "🔬 2024 — Novo Nordisk, dados fase 1 oral — perda média de peso de aproximadamente 13,1% em 12 semanas versus cerca de 1,1% com placebo.",
      "🔬 2025 — Dados clínicos iniciais subcutâneos divulgados — perda ponderal elevada em seguimento de meses, ainda aguardando publicação detalhada.",
      "🔬 2025-2026 — Planejamento/expansão de fase 2 — avaliação de dose, tolerabilidade e durabilidade da resposta."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Potencial perda de peso muito alta em dados iniciais",
      "Mecanismo duplo GLP-1 e amilina em uma molécula",
      "Possibilidade futura de formulação oral e subcutânea"
    ],
    "efeitosColaterais": [
      "Prováveis náusea, vômito, constipação e diarreia",
      "Risco de baixa ingestão alimentar e perda de massa magra se não houver suporte nutricional",
      "Segurança de longo prazo ainda desconhecida"
    ],
    "notas": "Não aprovado e ainda com evidência humana limitada. Resultados iniciais não devem ser extrapolados para uso fora de estudo. Qualquer oferta comercial é de alto risco, pois sequência, dobramento, estabilidade, pureza e dose podem divergir do composto clínico.",
    "vanguarda": true
  },
  {
    "id": "petrelintide",
    "name": "Petrelintide",
    "classe": "Análogo de amilina de longa ação",
    "status": "Fase 2",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#14B8A6",
    "halfLife": "~6-8 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo"
    ],
    "discovery": "Petrelintide, anteriormente ZP8396, é desenvolvido pela Zealand Pharma como análogo de amilina de longa ação para obesidade. Em 2025-2026 está em fase 2, com resultados iniciais promissores e foco em perda de peso possivelmente com melhor preservação de tolerabilidade gastrointestinal que algumas terapias GLP-1.",
    "mechanism": "Age como agonista de receptores de amilina/calcitonina, especialmente em circuitos de saciedade no tronco encefálico, como área postrema e núcleo do trato solitário. A amilina fisiológica é cosecretada com insulina e contribui para saciedade, menor ingestão alimentar e modulação do esvaziamento gástrico. Diferente de agonistas GLP-1, não depende primariamente de incretinismo pancreático, podendo ser complementar a GLP-1/GIP. O desenho de longa ação permite exposição semanal e potencial combinação futura.",
    "pharmacokinetics": "t½: aproximadamente 6-8 dias em estimativas de longa ação | Via: subcutânea semanal em ensaios | outros: peptídeo modificado para estabilidade; sem aprovação comercial.",
    "clinicalData": "Em estudos fase 1b/2a divulgados pela Zealand Pharma em adultos com sobrepeso/obesidade, petrelintide produziu perda de peso dose-dependente; resultados de 16 semanas relataram perda média próxima de 8,6% em doses mais altas versus cerca de 1,7% com placebo em dados top-line. O tamanho amostral ainda é pequeno e a duração curta em comparação com programas fase 3. Estudos fase 2b, como ZUPREME, buscam definir dose, segurança e durabilidade.",
    "dosage": "Ensaios investigaram doses subcutâneas semanais em múltiplos níveis com titulação; faixas exatas variam por protocolo e não há dose aprovada.",
    "synergies": "Combinação futura com agonistas GLP-1 ou GIP/GLP-1 é farmacologicamente plausível, pois amilina e GLP-1 têm vias de saciedade complementares, mas precisa de ensaios controlados. Dieta, treino resistido e terapia comportamental permanecem pilares.",
    "dietImpact": "A redução de fome pode facilitar déficit calórico com talvez menor carga incretínica pancreática. O planejamento deve garantir proteína e fibras, porque mesmo terapias centradas em saciedade podem reduzir demais a ingestão total e comprometer massa magra.",
    "recentStudies": [
      "🔬 2024 — Zealand Pharma, fase 1b — perda de peso até aproximadamente 8,6% em 16 semanas versus cerca de 1,7% com placebo.",
      "🔬 2024-2025 — Programas ZUPREME fase 2 — avaliação de dose semanal em obesidade.",
      "🔬 2025 — Atualizações clínicas — manutenção do desenvolvimento como análogo de amilina independente e potencial parceiro combinatório."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Perda de peso promissora em estudos iniciais",
      "Mecanismo distinto de GLP-1, potencialmente complementar",
      "Possível alternativa para combinações futuras com menor redundância farmacológica"
    ],
    "efeitosColaterais": [
      "Náusea e desconforto gastrointestinal, geralmente dose-dependentes",
      "Possível constipação e redução excessiva de apetite",
      "Segurança de longo prazo ainda indefinida"
    ],
    "notas": "A evidência ainda é inicial e baseada em estudos pequenos/top-line. Não usar fora de ensaio. Análogos de amilina são particularmente sensíveis a estabilidade, agregação e formulação, tornando produtos não GMP arriscados.",
    "vanguarda": true
  },
  {
    "id": "maritide-maridebart-cafraglutide",
    "name": "MariTide (maridebart cafraglutide)",
    "classe": "Conjugado anticorpo-peptídeo com agonismo GLP-1R e antagonismo GIPR",
    "status": "Fase 3",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#EC4899",
    "halfLife": "~14-21 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "anti-aging"
    ],
    "discovery": "MariTide, anteriormente AMG 133 e denominado maridebart cafraglutide, é desenvolvido pela Amgen. Em 2025-2026 avançou para programa fase 3 em obesidade, destacando-se por administração mensal ou menos frequente e por mecanismo incomum de agonismo GLP-1 com antagonismo GIP.",
    "mechanism": "A molécula combina peptídeos agonistas de GLP-1R ligados a um anticorpo monoclonal antagonista de GIPR. O agonismo GLP-1R reduz apetite, melhora secreção de insulina dependente de glicose e retarda esvaziamento gástrico. O antagonismo de GIPR contrasta com tirzepatida, que ativa GIPR; a hipótese é que bloquear GIPR em tecido adiposo e circuitos metabólicos possa aumentar perda de gordura em certos contextos. A plataforma de anticorpo prolonga a meia-vida e permite posologia muito espaçada.",
    "pharmacokinetics": "t½: aproximadamente 14-21 dias, compatível com aplicação mensal nos ensaios | Via: subcutânea | outros: conjugado de grande porte com exposição prolongada; efeitos adversos podem persistir mais tempo após dose.",
    "clinicalData": "Em fase 1, doses repetidas produziram perda de peso expressiva em 12 semanas, com relatos de reduções de até cerca de 14,5% após três doses mensais em alguns grupos. Dados fase 2 divulgados pela Amgen em 2024 relataram perda média de peso de até aproximadamente 20% em 52 semanas, sem platô claro em alguns braços, e manutenção parcial após interrupção em seguimento. Dados completos revisados por pares e resultados fase 3 são necessários para confirmar segurança, tolerabilidade, melhor esquema de titulação e comparação com tirzepatida/semaglutida.",
    "dosage": "Ensaios exploraram doses subcutâneas mensais com titulação e diferentes esquemas de manutenção; não há posologia aprovada. Pela meia-vida longa, mudanças de dose exigem cautela.",
    "synergies": "Dieta com proteína adequada, exercício resistido e acompanhamento gastrointestinal são fundamentais. Combinação com outros GLP-1/GIP/amilina não é estabelecida e pode ser arriscada, principalmente pela longa duração dos efeitos e intolerância gastrointestinal.",
    "dietImpact": "Pode induzir supressão prolongada de apetite, facilitando adesão por menor frequência de aplicação, mas também aumentando o risco de períodos longos de baixa ingestão. Estratégia nutricional deve antecipar náusea, constipação, hidratação e preservação de massa magra.",
    "recentStudies": [
      "🔬 2023-2024 — Dados fase 1 — perda ponderal de até aproximadamente 14,5% em cerca de 12 semanas em braços de dose repetida.",
      "🔬 2024 — Amgen, fase 2 top-line — perda média de peso de até aproximadamente 20% em 52 semanas, com perfil mensal.",
      "🔬 2025 — Programa MARITIME fase 3 — início/expansão de estudos registracionais em obesidade e comorbidades."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Posologia potencialmente mensal",
      "Perda de peso muito expressiva em fase 2",
      "Mecanismo diferenciado: GLP-1 agonista com GIP antagonista"
    ],
    "efeitosColaterais": [
      "Náusea, vômito e eventos gastrointestinais, especialmente no início",
      "Possível persistência prolongada de efeitos adversos pela meia-vida longa",
      "Riscos de classe: doença biliar, pancreatite rara e cautela em gastroparesia"
    ],
    "notas": "Não aprovado pelo FDA. A longa meia-vida é vantagem de adesão, mas reduz reversibilidade rápida em caso de intolerância. Como conjugado anticorpo-peptídeo, é impraticável reproduzir com segurança em mercado paralelo; pureza por HPLC isolada não garante bioatividade, imunogenicidade aceitável ou ausência de agregados.",
    "vanguarda": true
  },
  {
    "id": "vk2735",
    "name": "VK2735",
    "classe": "peptídeo incretínico agonista duplo dos receptores GLP-1 e GIP, de ação prolongada",
    "status": "Fase 2",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#16A34A",
    "halfLife": "~4-6 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "anti-aging"
    ],
    "discovery": "VK2735 é desenvolvido pela Viking Therapeutics como análogo incretínico duplo GLP-1/GIP para obesidade e distúrbios metabólicos, com formulação subcutânea semanal e programa oral em desenvolvimento. Em 2025-2026 permanece investigacional, com dados de fase 2 para obesidade e estudos iniciais para formulação oral; não possui aprovação FDA.",
    "mechanism": "Ativa receptores GLP-1 em células beta pancreáticas, trato gastrointestinal e SNC, aumentando secreção de insulina dependente de glicose, reduzindo glucagon, retardando esvaziamento gástrico e aumentando saciedade hipotalâmica. A agonização de GIP pode modular adipócito, sensibilidade insulínica e resposta incretínica pós-prandial, além de potencializar a perda ponderal quando combinada ao eixo GLP-1. Como peptídeo de ação prolongada, é desenhado para exposição sustentada e baixa frequência de administração. O perfil farmacodinâmico esperado é semelhante ao de incretínicos duplos, mas dados comparativos diretos publicados contra tirzepatida/semaglutida ainda são limitados.",
    "pharmacokinetics": "t½: ~4-6 dias para a formulação subcutânea semanal, conforme perfil compatível com peptídeo incretínico prolongado; estimativas públicas detalhadas ainda são limitadas | Via: subcutânea semanal em fase 2; formulação oral em fase 1 | Eliminação: proteólise/catabolismo peptídico, sem metabolismo CYP relevante esperado",
    "clinicalData": "Em fase 2 VENTURE, divulgada pela empresa em 2024, adultos com sobrepeso/obesidade tratados por 13 semanas apresentaram reduções médias de peso dose-dependentes, com até cerca de 14,7% de perda de peso desde o basal e diferença placebo-ajustada em torno de 13%. Alta proporção dos participantes atingiu perda ≥5% e ≥10%, com eventos adversos predominantemente gastrointestinais leves a moderados. Os dados são promissores, porém grande parte ainda deriva de comunicados corporativos/apresentações e aguardam publicação completa revisada por pares e confirmação em fase 3.",
    "dosage": "Em ensaios, foram estudadas doses subcutâneas semanais escalonadas em múltiplos níveis; programas orais avaliaram administração diária em fase 1. As faixas exatas devem ser interpretadas apenas no contexto de protocolo clínico, pois não há dose aprovada.",
    "synergies": "Intervenções dietéticas hipocalóricas com maior teor proteico, treinamento resistido para preservação de massa magra e manejo de constipação/náusea com fibras e hidratação. Combinações farmacológicas com outros incretínicos ou anorexígenos não são estabelecidas e podem aumentar eventos gastrointestinais ou risco de perda excessiva de massa magra.",
    "dietImpact": "Tende a reduzir ingestão energética por saciedade e menor apetite, facilitando déficit calórico. Na prática, a prioridade nutricional seria proteína adequada, micronutrientes, fibras e manutenção de treino resistido para limitar sarcopenia associada à perda rápida de peso.",
    "recentStudies": [
      "🔬 2024 — Viking Therapeutics, estudo VENTURE fase 2 — perda ponderal dose-dependente em 13 semanas, chegando a aproximadamente 14,7% desde o basal em obesidade.",
      "🔬 2024 — Viking Therapeutics, fase 1 formulação oral — redução de peso em 28 dias com tolerabilidade gastrointestinal compatível com agonistas incretínicos.",
      "🔬 2025 — Atualizações corporativas/regulatórias — avanço planejado para estudos tardios, ainda sem aprovação FDA e sem publicação completa de fase 3."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Redução ponderal expressiva em estudos iniciais",
      "Potencial melhora de glicemia, insulina e risco cardiometabólico por ação incretínica",
      "Administração semanal na formulação subcutânea"
    ],
    "efeitosColaterais": [
      "Náusea, vômitos, diarreia ou constipação",
      "Redução de apetite excessiva e risco de ingestão proteica insuficiente",
      "Possível colelitíase, pancreatite rara ou piora de gastroparesia por extrapolação da classe"
    ],
    "notas": "Contraindicações e alertas devem seguir cautelas da classe GLP-1/GIP até haver bula própria: histórico de pancreatite, gastroparesia importante e neoplasia endócrina múltipla/ carcinoma medular de tireoide são pontos de atenção por extrapolação. Produtos não farmacêuticos vendidos como VK2735 têm risco alto de adulteração; pureza por HPLC/LC-MS não substitui controle regulatório.",
    "vanguarda": true
  },
  {
    "id": "adipotide",
    "name": "Adipotide",
    "classe": "peptídeo pró-apoptótico direcionado à vasculatura do tecido adiposo",
    "status": "Experimental",
    "badge": "⚠️ EXPERIMENTAL",
    "badgeColor": "#F59E0B",
    "color": "#DC2626",
    "halfLife": "~minutos-horas",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo"
    ],
    "discovery": "Adipotide, também descrito como FTPP, foi desenvolvido a partir de estratégias de homing peptídico para vasos do tecido adiposo, associando um motivo ligante a proibitina a um domínio pró-apoptótico. O interesse surgiu por resultados robustos em primatas obesos, mas em 2025-2026 permanece sem desenvolvimento clínico amplo e sem aprovação, principalmente por limitações de segurança renal.",
    "mechanism": "O peptídeo contém sequência de direcionamento CKGGRAKDC que reconhece proibitina expressa em endotélio associado ao tecido adiposo branco. Após ligação e internalização, carrega um domínio pró-apoptótico D(KLAKLAK)2 que desestabiliza membranas mitocondriais, induzindo apoptose de células vasculares do tecido adiposo. A perda de suporte vascular leva a redução secundária de adipócitos e massa adiposa. O mecanismo é citotóxico e não regulatório-metabólico, o que explica tanto potência pré-clínica quanto preocupações de toxicidade.",
    "pharmacokinetics": "t½: não bem estabelecida em humanos; provavelmente curta, na faixa de minutos a poucas horas por depuração peptídica | Via: subcutânea ou intravenosa em estudos experimentais | Outros: distribuição direcionada por receptor, mas com exposição renal relevante e potencial nefrotoxicidade tubular",
    "clinicalData": "Em macacos rhesus obesos, tratamento diário por 4 semanas produziu perda de aproximadamente 11% do peso corporal, melhora de circunferência abdominal e parâmetros metabólicos. Em estudo humano inicial em homens obesos com câncer de próstata, observou-se redução modesta de peso/cintura, mas eventos renais dose-limitantes, incluindo alterações compatíveis com lesão tubular proximal reversível. Não existem ensaios grandes, randomizados e confirmatórios para obesidade comum.",
    "dosage": "Protocolos experimentais pré-clínicos e fase 1 utilizaram administração parenteral diária por ciclos curtos, com doses em mg/kg. Não há faixa terapêutica aprovada; qualquer uso fora de pesquisa é de alto risco.",
    "synergies": "Na literatura, o racional seria combinar com dieta hipocalórica e monitorização metabólica, mas não há combinações clínicas estabelecidas. Associação com nefrotóxicos, desidratação, AINEs ou contrastes iodados seria biologicamente preocupante.",
    "dietImpact": "A redução de adiposidade em modelos animais ocorre por ablação vascular do tecido adiposo, não por educação alimentar ou saciedade. Se fosse usado clinicamente, exigiria monitoramento de massa magra, eletrólitos e função renal; não substitui dieta estruturada.",
    "recentStudies": [
      "🔬 2011 — Science Translational Medicine — macacos rhesus obesos perderam cerca de 11% do peso após 4 semanas, com melhora metabólica.",
      "🔬 2016 — estudo fase 1 em homens obesos com câncer de próstata — sinais de perda de peso, mas nefrotoxicidade limitante e reversível.",
      "🔬 2025 — panorama translacional — permanece sem programa clínico avançado e sem aprovação por barreira de segurança."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Redução de adiposidade em modelos animais",
      "Conceito farmacológico altamente específico para vasculatura adiposa",
      "Possível melhora secundária de parâmetros metabólicos pré-clínicos"
    ],
    "efeitosColaterais": [
      "Nefrotoxicidade tubular proximal",
      "Náusea, fadiga e reações sistêmicas possíveis",
      "Risco teórico de dano vascular fora do alvo"
    ],
    "notas": "É um composto experimental com margem terapêutica incerta. A nefrotoxicidade observada em humanos é uma limitação central. Produtos comercializados como Adipotide fora de ensaios não têm garantia de identidade, esterilidade ou pureza por HPLC/LC-MS.",
    "vanguarda": false
  },
  {
    "id": "tesofensina",
    "name": "Tesofensina",
    "classe": "inibidor triplo da recaptação de noradrenalina, dopamina e serotonina",
    "status": "Fase 2",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#7C3AED",
    "halfLife": "~9 dias",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "neuro"
    ],
    "discovery": "Tesofensina foi originalmente desenvolvida pela NeuroSearch para doenças neurodegenerativas, mas seus efeitos anorexígenos e de perda de peso redirecionaram o interesse para obesidade. Em 2025-2026 não é aprovada pela FDA; permanece associada a programas de pesquisa, incluindo formulações combinadas como tesofensina/metoprolol para obesidades raras.",
    "mechanism": "Bloqueia transportadores DAT, NET e SERT, aumentando dopamina, noradrenalina e serotonina sinápticas em circuitos hipotalâmicos e mesolímbicos. Isso reduz apetite, aumenta saciedade e pode elevar discretamente gasto energético por maior tônus simpático. A ação dopaminérgica pode reduzir recompensa alimentar, enquanto noradrenalina contribui para termogênese e alerta. O mesmo perfil explica riscos cardiovasculares, insônia, ansiedade e potencial de abuso menor que estimulantes clássicos, mas não nulo.",
    "pharmacokinetics": "t½: ~9 dias | Via: oral diária | Outros: longa meia-vida com acúmulo; metabolização hepática e eliminação lenta; estado de equilíbrio pode demorar semanas",
    "clinicalData": "Em ensaio fase 2 de obesidade publicado no Lancet em 2008, 24 semanas de tesofensina 0,25, 0,5 e 1,0 mg/dia produziram perdas médias de peso de aproximadamente 6,7 kg, 11,3 kg e 12,8 kg, contra 2,2 kg com placebo; as diferenças placebo-ajustadas foram cerca de 4,5, 9,1 e 10,6 kg. Houve aumento de frequência cardíaca, boca seca, náusea, constipação e insônia, especialmente nas doses maiores. Estudos posteriores com Tesomet tentaram mitigar efeitos cardiovasculares com metoprolol em obesidade hipotalâmica e síndrome de Prader-Willi, mas a base ainda é limitada.",
    "dosage": "Ensaios de obesidade avaliaram 0,25-1,0 mg por via oral uma vez ao dia; 0,5 mg/dia foi considerada faixa com melhor equilíbrio entre eficácia e tolerabilidade. Combinações investigacionais usam tesofensina associada a beta-bloqueador sob protocolo.",
    "synergies": "Dieta hipocalórica, terapia comportamental, controle de sono e atividade física. Combinações com outros simpaticomiméticos, IMAO, ISRS/IRSN ou estimulantes aumentam risco de hipertensão, taquicardia, ansiedade e síndrome serotoninérgica.",
    "dietImpact": "Reduz apetite e compulsão alimentar em parte por modulação catecolaminérgica/serotoninérgica. Pode facilitar aderência ao déficit calórico, mas a perda de peso precisa ser acompanhada de proteína e treino resistido para preservar massa magra.",
    "recentStudies": [
      "🔬 2008 — Lancet — fase 2 em obesidade mostrou perda de peso placebo-ajustada de até cerca de 10,6 kg em 24 semanas.",
      "🔬 2020-2023 — estudos Tesomet/Saniona — combinação tesofensina-metoprolol investigada em obesidade hipotalâmica e Prader-Willi, com sinais de redução de peso e hiperfagia.",
      "🔬 2025 — panorama regulatório — sem aprovação FDA; desenvolvimento focado em indicações raras e controle de risco cardiovascular."
    ],
    "evidencia": "MODERADA",
    "beneficios": [
      "Perda de peso clinicamente relevante em fase 2",
      "Redução de apetite e recompensa alimentar",
      "Potencial em obesidade hipotalâmica ou hiperfagia patológica"
    ],
    "efeitosColaterais": [
      "Taquicardia e possível aumento de pressão arterial",
      "Insônia, ansiedade, boca seca e constipação",
      "Náusea e risco de interações serotoninérgicas/catecolaminérgicas"
    ],
    "notas": "Não é peptídeo; é molécula pequena neuroativa. Deve ser evitada com IMAO e usada com extrema cautela com antidepressivos, estimulantes, hipertensão não controlada, arritmias ou doença cardiovascular. A longa meia-vida aumenta risco de acúmulo e dificulta manejo de eventos adversos.",
    "vanguarda": false
  },
  {
    "id": "macimorelina",
    "name": "Macimorelina",
    "classe": "agonista oral do receptor de grelina/GHSR-1a para teste diagnóstico do eixo GH",
    "status": "FDA Aprovado",
    "badge": "✅ APROVADO",
    "badgeColor": "#16A34A",
    "color": "#0EA5E9",
    "halfLife": "~4h",
    "category": "Eixo GH",
    "tags": [
      "aprovado",
      "gh",
      "metabolismo"
    ],
    "discovery": "Macimorelina foi desenvolvida pela Aeterna Zentaris como secretagogo oral de GH para diagnóstico de deficiência de hormônio do crescimento em adultos. Recebeu aprovação FDA para teste diagnóstico, oferecendo alternativa ao teste de tolerância à insulina. Em 2025-2026 permanece aprovada para diagnóstico, não para uso anabólico, anti-aging ou emagrecimento.",
    "mechanism": "É agonista do receptor de secretagogo de GH, GHSR-1a, o mesmo eixo funcional ativado pela grelina. A ativação em hipotálamo e hipófise estimula liberação pulsátil de GH, permitindo avaliar a reserva somatotrófica. Diferentemente de secretagogos usados cronicamente, sua finalidade é teste agudo com coleta seriada de GH. Pode prolongar intervalo QT em pequena magnitude, justificando cautela com fármacos pró-arrítmicos.",
    "pharmacokinetics": "t½: ~4,1 h | Via: oral, dose única em jejum | Outros: Cmax em torno de 0,5-1,5 h; metabolização principalmente hepática, com participação de CYP3A4; coleta de GH tipicamente em 30, 45, 60 e 90 min",
    "clinicalData": "Estudos comparativos contra o teste de tolerância à insulina mostraram concordância diagnóstica clinicamente útil para deficiência de GH em adultos. Na bula norte-americana, o teste usa 0,5 mg/kg por via oral e interpreta pico de GH abaixo do ponto de corte especificado como compatível com deficiência de GH. O valor está em diagnóstico; não há evidência de benefício para composição corporal quando usada fora do protocolo diagnóstico.",
    "dosage": "Dose aprovada: 0,5 mg/kg por via oral em dose única, em jejum, para teste diagnóstico com amostras seriadas de GH. Não há regime aprovado para uso crônico.",
    "synergies": "No contexto diagnóstico, pode ser comparada ao teste de tolerância à insulina, arginina-GHRH ou glucagon conforme disponibilidade e contraindicações. Fármacos que interferem no eixo GH ou no CYP3A4 podem alterar interpretação.",
    "dietImpact": "Não tem papel prático em dieta ou composição corporal como tratamento. O jejum é importante para padronizar absorção e resposta diagnóstica; uso para anti-aging ou ganho muscular não é sustentado por evidência.",
    "recentStudies": [
      "🔬 2017 — FDA label/Macrilen — aprovação para diagnóstico de deficiência de GH em adultos.",
      "🔬 2018 — estudos comparativos publicados — desempenho diagnóstico aceitável frente ao teste de tolerância à insulina, com administração oral mais simples.",
      "🔬 2023-2025 — revisões de endocrinologia — macimorelina citada como alternativa diagnóstica, especialmente quando hipoglicemia induzida é indesejável."
    ],
    "evidencia": "FORTE",
    "beneficios": [
      "Teste oral simples para avaliação do eixo GH",
      "Evita hipoglicemia deliberada do teste de tolerância à insulina",
      "Aprovada pela FDA para indicação diagnóstica específica"
    ],
    "efeitosColaterais": [
      "Disgeusia, tontura, cefaleia e náusea",
      "Possível prolongamento de QT",
      "Risco de resultado falso se houver interferência medicamentosa ou preparo inadequado"
    ],
    "notas": "Contraindicada/cautelosa em pacientes com prolongamento de QT, arritmias ou uso de fármacos que prolongam QT. Indutores fortes de CYP3A4 podem reduzir exposição e comprometer o teste. Não deve ser confundida com terapia de reposição de GH.",
    "vanguarda": false
  },
  {
    "id": "fragmento-gh-176-191",
    "name": "Fragmento GH 176-191",
    "classe": "fragmento C-terminal lipolítico do hormônio do crescimento; análogo AOD9604 relacionado",
    "status": "Descontinuado",
    "badge": "⛔ DESCONTINUADO",
    "badgeColor": "#991B1B",
    "color": "#F97316",
    "halfLife": "~5-15min",
    "category": "Metabólico",
    "tags": [
      "emagrecimento",
      "metabolismo",
      "anti-aging"
    ],
    "discovery": "O fragmento GH 176-191 corresponde à região C-terminal do GH humano associada a efeitos lipolíticos em modelos animais, sem a maior parte da atividade de crescimento mediada por IGF-1. A versão modificada AOD9604 foi desenvolvida para obesidade, mas estudos clínicos não confirmaram eficácia robusta. Em 2025-2026 não é aprovado como medicamento para obesidade e seu desenvolvimento farmacêutico para essa finalidade é considerado fracassado/descontinuado.",
    "mechanism": "A proposta mecanística é estimular lipólise e inibir lipogênese por vias parcialmente independentes do receptor clássico de GH e sem elevação relevante de IGF-1. Em adipócitos e modelos animais, há sinais de aumento de oxidação de gordura e mobilização lipídica. Contudo, a tradução para humanos foi fraca, sugerindo baixa potência, farmacocinética desfavorável ou mecanismo insuficiente em obesidade humana. Não deve ser tratado como equivalente a GH recombinante.",
    "pharmacokinetics": "t½: ~5-15 min para fragmentos peptídicos curtos não modificados; AOD9604 também apresenta exposição curta, dependendo da via | Via: subcutânea em uso experimental; formulações orais foram estudadas clinicamente | Outros: degradação proteolítica rápida, baixa biodisponibilidade oral para peptídeos não protegidos",
    "clinicalData": "Ensaios clínicos com AOD9604 em obesidade avaliaram múltiplas doses por via oral, mas não demonstraram perda de peso consistente e clinicamente convincente em estudos maiores. Estudos menores sugeriram sinais em dose específica, porém sem confirmação robusta. Não há evidência humana forte de melhora sustentada de composição corporal com o fragmento GH 176-191 usado em clínicas ou mercado cinza.",
    "dosage": "Ensaios com AOD9604 estudaram doses orais em faixa de centenas de microgramas a miligramas ao dia. Regimes subcutâneos de 250-500 mcg/dia são relatos de mercado/uso não aprovado, não posologia validada.",
    "synergies": "Na teoria, dieta hipocalórica e exercício aumentariam qualquer efeito lipolítico detectável. Não há sinergias clínicas comprovadas com GH, secretagogos de GH, clenbuterol, hormônios tireoidianos ou incretínicos; combinações podem ampliar riscos sem benefício demonstrado.",
    "dietImpact": "O impacto real em dieta e composição corporal humana é provavelmente pequeno ou incerto. Pode gerar falsa segurança e atrasar intervenções comprovadas como déficit calórico, proteína adequada e treinamento resistido.",
    "recentStudies": [
      "🔬 2001-2007 — programas clínicos AOD9604/Metabolic Pharmaceuticals — estudos de obesidade não sustentaram eficácia suficiente para aprovação.",
      "🔬 2013 — WADA e casos esportivos — AOD9604/fragmentos relacionados passaram a ser tratados como substâncias proibidas em contexto antidoping.",
      "🔬 2025 — revisões de peptídeos metabólicos — evidência humana permanece fraca e uso é majoritariamente de mercado cinza."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Sinais lipolíticos em modelos pré-clínicos",
      "Baixa tendência de elevar IGF-1 em comparação ao GH completo",
      "Conceito teórico de mobilização de gordura"
    ],
    "efeitosColaterais": [
      "Reações no local de aplicação",
      "Eficácia incerta com risco de custo e adulteração",
      "Possível hipoglicemia leve, cefaleia ou náusea em relatos"
    ],
    "notas": "É proibido por regras antidoping em muitos contextos. Produtos manipulados ou de pesquisa frequentemente carecem de esterilidade, quantificação confiável e confirmação por LC-MS; laudo HPLC isolado pode não detectar impurezas bioativas. Não há indicação aprovada para anti-aging ou emagrecimento.",
    "vanguarda": false
  },
  {
    "id": "bpc-157-arginato",
    "name": "BPC-157 Arginato",
    "classe": "peptídeo citoprotetor/gastroprotetor experimental derivado de sequência gástrica, em sal arginato",
    "status": "Experimental",
    "badge": "⚠️ EXPERIMENTAL",
    "badgeColor": "#F59E0B",
    "color": "#22C55E",
    "halfLife": "~4h",
    "category": "Reparo",
    "tags": [
      "reparo",
      "musculação",
      "imune"
    ],
    "discovery": "BPC-157 é um pentadecapeptídeo sintético relacionado a uma sequência descrita como parte de uma proteína protetora gástrica. A forma arginato é vendida como mais estável, mas não há medicamento aprovado pela FDA nem ensaios humanos robustos de eficácia. Em 2025-2026 permanece experimental e alvo de alertas regulatórios para uso em manipulação.",
    "mechanism": "Em modelos animais, BPC-157 modula angiogênese, migração celular, síntese de colágeno e cicatrização por vias envolvendo VEGFR2-Akt-eNOS, óxido nítrico, FAK-paxilina e remodelamento de matriz extracelular. Também há efeitos descritos em mucosa gastrointestinal, endotélio e nervos periféricos, com interação funcional com sistemas dopaminérgico, serotoninérgico e NO. O sal arginato pode melhorar estabilidade físico-química e manuseio, mas isso não prova eficácia clínica. A maior parte dos achados vem de roedores, lesões experimentais e estudos in vitro.",
    "pharmacokinetics": "t½: não estabelecida em humanos; estimativas de mercado citam ~4 h, mas sem validação clínica robusta | Via: subcutânea, intramuscular, oral ou tópica em relatos; vias não aprovadas | Outros: estabilidade dependente de formulação, pH e pureza; dados de biodisponibilidade humana são insuficientes",
    "clinicalData": "Faltam ensaios clínicos humanos randomizados, adequadamente cegos e publicados para tendinopatia, lesão muscular, úlcera, doença inflamatória intestinal ou recuperação pós-operatória. A evidência de benefício é predominantemente pré-clínica e anedótica. Alertas regulatórios nos EUA destacam incertezas de segurança, imunogenicidade e ausência de dados toxicológicos adequados para uso amplo.",
    "dosage": "Relatos não aprovados frequentemente citam 200-500 mcg/dia por via subcutânea ou oral por semanas; isso não é dose validada. Estudos animais usam escalas em µg/kg a ng/kg, não diretamente transponíveis para humanos.",
    "synergies": "Reabilitação progressiva, sono adequado, proteína e colágeno/gelatina com vitamina C são estratégias discutidas para reparo tecidual, mas não há sinergia clínica comprovada com BPC-157. Combinação com TB-500, GH ou anabolizantes é comum em relatos, porém sem segurança estabelecida.",
    "dietImpact": "Não é agente de emagrecimento. Se houvesse benefício em reparo, o suporte nutricional relevante seria ingestão proteica, energia suficiente, vitamina C, zinco, cobre e controle de álcool/tabaco para cicatrização.",
    "recentStudies": [
      "🔬 2018 — revisões farmacológicas — consolidaram grande volume de dados animais sobre cicatrização, mucosa gastrointestinal e angiogênese.",
      "🔬 2022-2023 — discussões regulatórias/FDA bulk substances — BPC-157 listado com preocupações de segurança e ausência de dados clínicos adequados.",
      "🔬 2025 — panorama de medicina esportiva — evidência humana permanece anedótica, apesar do uso disseminado em mercado cinza."
    ],
    "evidencia": "ANECDÓTICA",
    "beneficios": [
      "Potencial pró-cicatricial em modelos animais",
      "Sinais pré-clínicos de proteção gastrointestinal",
      "Possível modulação de angiogênese e reparo tendíneo em animais"
    ],
    "efeitosColaterais": [
      "Reações locais, dor, eritema ou infecção por aplicação",
      "Risco imunogênico e impurezas de síntese",
      "Efeitos sistêmicos desconhecidos em uso crônico"
    ],
    "notas": "Não há aprovação FDA, posologia validada ou farmacovigilância adequada. O uso injetável de peptídeos de pesquisa exige esterilidade, endotoxina baixa e identidade por LC-MS; pureza HPLC não garante segurança. Deve ser evitado em gestação, câncer ativo, doenças proliferativas ou sem supervisão médica.",
    "vanguarda": true
  },
  {
    "id": "p21",
    "name": "P21",
    "classe": "peptídeo neurotrófico experimental derivado de CNTF, também relacionado ao composto P021",
    "status": "Experimental",
    "badge": "⚠️ EXPERIMENTAL",
    "badgeColor": "#F59E0B",
    "color": "#6366F1",
    "halfLife": "~não estabelecida",
    "category": "Neuro/Cognitivo",
    "tags": [
      "neuro",
      "cognitivo",
      "anti-aging"
    ],
    "discovery": "P21/P021 é uma família de peptídeos curtos desenvolvidos em pesquisa neurodegenerativa para mimetizar efeitos tróficos do CNTF sem a toxicidade sistêmica da citocina completa. O grupo de Khalid Iqbal e colaboradores explorou o composto em modelos de Alzheimer e tauopatia. Em 2025-2026 continua experimental, sem ensaios clínicos humanos confirmatórios.",
    "mechanism": "O P021 é descrito como peptídeo pequeno, amidado e acetilado, capaz de modular sinalização neurotrófica e aumentar expressão de BDNF em modelos animais. Estudos pré-clínicos sugerem redução de fosforilação patológica de tau, melhora de plasticidade sináptica e atenuação de déficits cognitivos. Há envolvimento relatado de vias como GSK-3β, neuroinflamação e fatores tróficos, mas o alvo molecular primário não é totalmente definido. A extrapolação para humanos é incerta.",
    "pharmacokinetics": "t½: não estabelecida em humanos | Via: oral em ração/água ou parenteral em modelos animais, conforme protocolo | Outros: peptídeo curto modificado para maior estabilidade; penetração no SNC inferida por efeitos funcionais em animais, não por farmacocinética humana robusta",
    "clinicalData": "Não há dados humanos publicados demonstrando eficácia para Alzheimer, comprometimento cognitivo leve, depressão ou neuroproteção. A base é composta por estudos em camundongos/ratos transgênicos e modelos de envelhecimento, com melhora de memória e marcadores neuropatológicos. Portanto a evidência clínica é ausente.",
    "dosage": "Em modelos animais, P021 foi administrado cronicamente na dieta ou por via experimental em doses expressas em nmol/g de ração ou mg/kg equivalentes. Não há dose humana estabelecida.",
    "synergies": "Intervenções com maior lastro para cognição incluem exercício aeróbio/resistido, sono, controle metabólico, tratamento de apneia, dieta mediterrânea e manejo vascular. Combinação com outros nootrópicos é especulativa e não estudada clinicamente.",
    "dietImpact": "Sem impacto nutricional comprovado. Se a meta for neuroproteção, fatores dietéticos com melhor evidência incluem padrão mediterrâneo, ômega-3 por dieta, controle glicêmico e prevenção de deficiência de B12, ferro e vitamina D.",
    "recentStudies": [
      "🔬 2014-2017 — estudos pré-clínicos em modelos de Alzheimer/tauopatia — P021 reduziu alterações de tau e melhorou desempenho cognitivo em animais.",
      "🔬 2020-2024 — revisões de neuropeptídeos tróficos — P021 citado como candidato pré-clínico promissor, sem validação humana.",
      "🔬 2025 — panorama translacional — permanece sem estudos fase 1/2 publicados em humanos."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Neuroproteção em modelos animais",
      "Redução pré-clínica de fosforilação de tau",
      "Melhora de memória em roedores transgênicos"
    ],
    "efeitosColaterais": [
      "Segurança humana desconhecida",
      "Risco de impurezas e degradação em material de pesquisa",
      "Possíveis efeitos imunes ou neuroendócrinos não caracterizados"
    ],
    "notas": "Não deve ser confundido com nootrópico validado em humanos. A nomenclatura P21/P021 varia entre fornecedores e literatura, aumentando risco de erro de identidade. Exigiria confirmação por LC-MS, teor peptídico e ausência de endotoxina antes de qualquer pesquisa pré-clínica séria.",
    "vanguarda": true
  },
  {
    "id": "fgl-peptide",
    "name": "FGL (FGL peptide)",
    "classe": "peptídeo mimético da molécula de adesão neural NCAM e modulador de FGFR1",
    "status": "Pesquisa",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#4F46E5",
    "halfLife": "~não estabelecida",
    "category": "Neuro/Cognitivo",
    "tags": [
      "neuro",
      "cognitivo"
    ],
    "discovery": "FGL é um peptídeo derivado do loop FG da molécula de adesão neural NCAM, desenvolvido para reproduzir efeitos de NCAM sobre plasticidade sináptica via receptor de FGF. Foi investigado sobretudo em neurociência pré-clínica para memória, neuroproteção e envelhecimento cerebral. Em 2025-2026 não possui aprovação e carece de estudos clínicos robustos.",
    "mechanism": "FGL mimetiza uma região funcional da NCAM capaz de interagir com FGFR1, ativando cascatas intracelulares como MAPK/ERK, PI3K-Akt e vias associadas à sobrevivência neuronal. Em modelos animais, promove plasticidade sináptica, crescimento neurítico, LTP e modulação de neuroinflamação. O efeito é mais neuromodulador/trófico do que estimulante agudo. A relação dose-resposta e penetração no SNC em humanos ainda não são bem definidas.",
    "pharmacokinetics": "t½: não estabelecida em humanos; peptídeos NCAM-miméticos tendem a ter estabilidade limitada sem modificações | Via: intranasal, intracerebroventricular ou sistêmica em modelos experimentais, dependendo do estudo | Outros: biodisponibilidade cerebral humana não caracterizada",
    "clinicalData": "Faltam ensaios humanos controlados e publicados demonstrando benefício cognitivo. A evidência deriva principalmente de roedores, culturas neuronais e modelos de envelhecimento/neurodegeneração, com melhora de plasticidade e tarefas de memória. Qualquer alegação clínica para demência, TDAH, depressão ou aprimoramento cognitivo é preliminar.",
    "dosage": "Estudos pré-clínicos usam doses em nmol ou mg/kg por vias experimentais; não há dose humana validada. Relatos intranasais de mercado não são padronizados nem suportados por farmacocinética clínica.",
    "synergies": "Pode ser conceitualmente combinado com reabilitação cognitiva e exercício, que também aumentam plasticidade sináptica, mas não há sinergia clínica comprovada. Combinação com outros peptídeos neurotróficos é especulativa.",
    "dietImpact": "Não há efeito direto estabelecido em dieta ou composição corporal. Para saúde neural, dieta mediterrânea, controle de resistência insulínica e sono têm evidência muito superior.",
    "recentStudies": [
      "🔬 2004-2008 — Journal of Neuroscience/European Journal of Neuroscience — peptídeos FGL/NCAM-miméticos aumentaram plasticidade sináptica e desempenho de memória em animais.",
      "🔬 2010-2020 — literatura pré-clínica — sinalização NCAM-FGFR associada a neuroproteção e remodelamento sináptico.",
      "🔬 2025 — panorama de nootrópicos peptídicos — permanece candidato de pesquisa, sem eficácia clínica demonstrada."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Aumento de plasticidade sináptica em modelos animais",
      "Potencial neurotrófico via NCAM/FGFR1",
      "Sinais pré-clínicos de melhora de memória"
    ],
    "efeitosColaterais": [
      "Segurança humana insuficientemente caracterizada",
      "Risco de irritação nasal ou reações locais em vias experimentais",
      "Efeitos proliferativos/angiogênicos teóricos por modulação de FGFR"
    ],
    "notas": "A ativação de vias FGFR exige cautela teórica em câncer ativo ou doenças proliferativas, embora o risco clínico seja desconhecido. Materiais de pesquisa devem ser verificados por identidade, pureza, teor e endotoxina; produtos comerciais raramente oferecem documentação adequada.",
    "vanguarda": true
  },
  {
    "id": "noopept",
    "name": "Noopept",
    "classe": "dipeptídeo sintético nootrópico; éster etílico de N-fenilacetil-L-prolilglicina",
    "status": "Pesquisa",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#8B5CF6",
    "halfLife": "~0,5-1h",
    "category": "Neuro/Cognitivo",
    "tags": [
      "neuro",
      "cognitivo"
    ],
    "discovery": "Noopept foi desenvolvido na Rússia como análogo peptidomimético relacionado ao piracetam, com maior potência em modelos experimentais. É comercializado/registrado em alguns mercados como nootrópico, mas não é aprovado pela FDA. Em 2025-2026 a evidência clínica internacional permanece limitada e heterogênea.",
    "mechanism": "Após absorção, é rapidamente hidrolisado em metabólitos, incluindo ciclo-prolilglicina, que pode contribuir para efeitos farmacológicos. Estudos pré-clínicos sugerem modulação glutamatérgica, especialmente AMPA/NMDA, aumento de expressão de NGF e BDNF, atividade antioxidante e efeitos anti-inflamatórios. Também há relatos de melhora de plasticidade sináptica e consolidação de memória. O mecanismo humano definitivo não está estabelecido.",
    "pharmacokinetics": "t½: ~0,5-1 h para o composto parental, com metabolismo rápido | Via: oral | Outros: alta lipofilicidade relativa; metabolismo por esterases/peptidases; parâmetros humanos publicados são escassos",
    "clinicalData": "Estudos clínicos russos pequenos em comprometimento cognitivo leve, sequelas de traumatismo cranioencefálico ou doença cerebrovascular relataram melhora em escalas cognitivas e sintomas astênicos, frequentemente comparando com piracetam. Entretanto, muitos estudos têm limitações metodológicas, amostras pequenas e pouca replicação internacional. Não há ensaios grandes multicêntricos que sustentem indicação aprovada por FDA/EMA.",
    "dosage": "Uso descrito em literatura e bula russa: 10 mg 2 vezes ao dia, podendo chegar a 30 mg/dia em alguns protocolos. Não há posologia aprovada pela FDA.",
    "synergies": "Sono adequado, treino cognitivo, exercício e correção de déficits nutricionais têm melhor base. Combinações com estimulantes, racetams, colinérgicos ou antidepressivos são comuns em relatos, mas pouco estudadas e podem aumentar ansiedade, insônia ou cefaleia.",
    "dietImpact": "Não altera composição corporal de forma relevante. Efeitos percebidos podem depender de sono, ingestão calórica adequada e controle de cafeína/álcool, pois ansiedade e insônia reduzem desempenho cognitivo.",
    "recentStudies": [
      "🔬 1990-2000 — desenvolvimento russo — caracterização como peptidomimético nootrópico de baixa dose.",
      "🔬 2009-2015 — estudos clínicos russos — relatos de melhora cognitiva em transtornos orgânicos leves, com limitações metodológicas.",
      "🔬 2025 — revisões de nootrópicos — evidência considerada preliminar fora do contexto regulatório russo."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Possível melhora subjetiva de memória e atenção",
      "Potencial neuroprotetor pré-clínico",
      "Baixa dose oral em comparação a racetams clássicos"
    ],
    "efeitosColaterais": [
      "Cefaleia, irritabilidade ou ansiedade",
      "Insônia, especialmente se usado tarde",
      "Náusea ou desconforto gastrointestinal"
    ],
    "notas": "Não é suplemento isento de risco nem medicamento aprovado pela FDA. Pode interagir funcionalmente com estimulantes, álcool, ansiolíticos e antidepressivos por efeitos no SNC. Qualidade de produtos online é variável, com risco de subdosagem ou contaminantes.",
    "vanguarda": false
  },
  {
    "id": "nsi-189",
    "name": "NSI-189",
    "classe": "molécula neurogênica experimental benzilpiperazina-aminopiridina",
    "status": "Descontinuado",
    "badge": "⛔ DESCONTINUADO",
    "badgeColor": "#991B1B",
    "color": "#9333EA",
    "halfLife": "~17-20h",
    "category": "Neuro/Cognitivo",
    "tags": [
      "neuro",
      "cognitivo"
    ],
    "discovery": "NSI-189 foi desenvolvido pela Neuralstem como composto oral pró-neurogênico para depressão maior e potencialmente distúrbios cognitivos. Após sinais iniciais em fase 1b, um estudo fase 2 não atingiu desfechos primários de depressão de forma convincente. Em 2025-2026 o desenvolvimento clínico amplo aparenta estar interrompido/descontinuado, sem aprovação regulatória.",
    "mechanism": "O mecanismo molecular não é completamente definido e não se encaixa nos antidepressivos monoaminérgicos clássicos. Em modelos pré-clínicos, aumenta neurogênese e volume/funcionalidade hipocampal, com efeitos em plasticidade sináptica e circuitos de humor. Pode modular expressão gênica associada a sobrevivência neuronal e diferenciação, mas o alvo proteico primário permanece incerto. Isso torna a translação promissora, porém biologicamente menos previsível.",
    "pharmacokinetics": "t½: ~17-20 h para NSI-189 fosfato em estudos humanos | Via: oral | Outros: administração diária ou duas vezes ao dia foi estudada; exposição sistêmica relativamente prolongada",
    "clinicalData": "Em fase 1b com adultos com depressão maior, 28 dias de tratamento sugeriram melhora de sintomas depressivos e medidas cognitivas, com persistência parcial após seguimento, mas o estudo era pequeno. Em fase 2 randomizada maior, o composto não atingiu de forma robusta o desfecho primário antidepressivo; alguns desfechos secundários cognitivos/humor mostraram sinais, mas insuficientes para aprovação. Não há evidência clínica adequada para uso como nootrópico em saudáveis.",
    "dosage": "Ensaios estudaram regimes como 40 mg/dia, 80 mg/dia ou 40 mg duas vezes ao dia, dependendo do protocolo. Não há dose aprovada.",
    "synergies": "Psicoterapia, exercício, sono, tratamento de inflamação/metabolismo e antidepressivos aprovados têm base clínica superior. Combinação com antidepressivos, estimulantes ou psicodélicos não é bem estudada e pode confundir segurança neuropsiquiátrica.",
    "dietImpact": "Sem impacto direto em dieta ou composição corporal. Como intervenção neuropsiquiátrica, poderia indiretamente afetar apetite/atividade se melhorasse humor, mas isso não foi comprovado clinicamente.",
    "recentStudies": [
      "🔬 2016 — Molecular Psychiatry/fase 1b — sinais de melhora em depressão e cognição após 28 dias, em amostra pequena.",
      "🔬 2017-2018 — fase 2 em transtorno depressivo maior — falha em desfechos primários, com alguns sinais secundários exploratórios.",
      "🔬 2025 — panorama de desenvolvimento — sem aprovação e sem programa tardio ativo amplamente documentado."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "Conceito de neurogênese hipocampal",
      "Sinais exploratórios de melhora cognitiva em depressão",
      "Boa tolerabilidade inicial em estudos curtos"
    ],
    "efeitosColaterais": [
      "Cefaleia, tontura ou sintomas gastrointestinais",
      "Ansiedade, alteração de sono ou irritabilidade em relatos",
      "Segurança de longo prazo desconhecida"
    ],
    "notas": "Não é peptídeo; é molécula pequena experimental. Deve ser evitado fora de pesquisa, especialmente em transtorno bipolar, psicose, ideação suicida instável ou polifarmácia psiquiátrica. Produtos de mercado cinza podem conter isômeros, sais ou impurezas não caracterizados.",
    "vanguarda": false
  },
  {
    "id": "cortexina",
    "name": "Cortexina",
    "classe": "complexo polipeptídico neurotrófico/bioregulador derivado de córtex cerebral animal",
    "status": "Pesquisa",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#3B82F6",
    "halfLife": "~não estabelecida; presumivelmente minutos–horas",
    "category": "Neuro/Cognitivo",
    "tags": [
      "neuro",
      "cognitivo",
      "reparo"
    ],
    "discovery": "A Cortexina é um preparado injetável desenvolvido e usado principalmente na Rússia e em alguns países do Leste Europeu, contendo frações polipeptídicas de baixo peso molecular obtidas de córtex cerebral bovino ou suíno. Em 2025-2026 permanece sem aprovação por FDA/EMA e sem desenvolvimento clínico internacional robusto; a maior parte da literatura é regional, heterogênea e de qualidade metodológica variável.",
    "mechanism": "O produto é descrito como um conjunto de peptídeos menores que 10 kDa com alegada ação neurotrófica, antioxidante e moduladora de neurotransmissão, mas a composição exata lote a lote e os alvos moleculares não são plenamente definidos em literatura regulatória internacional. Hipóteses incluem modulação de excitotoxicidade glutamatérgica, redução de peroxidação lipídica, suporte a plasticidade sináptica e influência indireta em fatores neurotróficos. A capacidade de peptídeos periféricos atravessarem a barreira hematoencefálica em concentrações farmacologicamente relevantes não é bem demonstrada. Portanto, o mecanismo deve ser tratado como plausível, porém não confirmado de forma moderna por farmacodinâmica translacional.",
    "pharmacokinetics": "t½: não caracterizada em humanos por métodos modernos | Via: intramuscular em produtos comercializados regionalmente | outros: mistura complexa de peptídeos; metabolismo esperado por peptidases plasmáticas e teciduais; biodistribuição e penetração no SNC não quantificadas adequadamente.",
    "clinicalData": "Há estudos pequenos, principalmente russos, em acidente vascular cerebral, encefalopatias, traumatismo cranioencefálico e condições pediátricas, frequentemente relatando melhora em escalas neurológicas ou cognitivas. Contudo, faltam ensaios multicêntricos, duplo-cegos, fase 3, com desfechos duros e revisão regulatória FDA/EMA. Não existem resultados numéricos internacionalmente aceitos que sustentem indicação formal em neurologia baseada em evidência.",
    "dosage": "Relatos regionais usam 10 mg IM uma vez ao dia por 10 dias em adultos; em pediatria aparecem esquemas como 0,5 mg/kg/dia em crianças abaixo de 20 kg, sempre dependentes do produto local. Uso meramente informativo, não equivalendo a recomendação clínica.",
    "synergies": "Discutida em protocolos regionais junto a reabilitação neurológica, antiagregantes/estatinas no pós-AVC, vitaminas do complexo B e outros nootrópicos, mas sem comprovação robusta de sinergia farmacológica.",
    "dietImpact": "Não há efeito direto comprovado sobre dieta, massa magra ou adiposidade. Em tese, melhora funcional neurológica poderia facilitar reabilitação e adesão alimentar, mas isso é indireto e não demonstrado em ensaios controlados.",
    "recentStudies": [
      "🔬 2024 — Bases regulatórias FDA/EMA/ClinicalTrials.gov — ausência de aprovação e de programas fase 3 internacionais para Cortexina.",
      "🔬 2021 — Literatura neurológica russa — relatos clínicos em reabilitação pós-AVC e encefalopatias, com limitações de cegamento, amostra e padronização.",
      "🔬 2020 — Revisões sobre peptídeos neuroprotetores — destacam plausibilidade biológica, mas necessidade de caracterização molecular e ensaios independentes."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "potencial neuroproteção em modelos e relatos clínicos",
      "possível suporte à recuperação neurológica",
      "interesse em cognição e plasticidade sináptica"
    ],
    "efeitosColaterais": [
      "dor ou reação no local da injeção",
      "reações alérgicas a proteínas/peptídeos de origem animal",
      "incerteza sobre imunogenicidade e variabilidade de lote"
    ],
    "notas": "Não é aprovado por FDA/EMA. Preparados de origem animal exigem atenção a pureza, esterilidade, rastreabilidade, controle de endotoxinas e perfil HPLC/LC-MS; produtos de procedência duvidosa aumentam risco de contaminação e variabilidade farmacológica.",
    "vanguarda": false
  },
  {
    "id": "defensinas-beta-defensina-3",
    "name": "Defensinas (Beta-Defensina 3)",
    "classe": "peptídeo antimicrobiano catiônico inato, imunomodulador",
    "status": "Pesquisa",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#06B6D4",
    "halfLife": "~não estabelecida; provavelmente minutos–horas em fluidos biológicos",
    "category": "Imune",
    "tags": [
      "imune",
      "reparo"
    ],
    "discovery": "A beta-defensina humana 3, codificada pelo gene DEFB103, foi identificada como parte da família de defensinas epiteliais envolvidas na defesa de pele e mucosas. Em 2025-2026 permanece como molécula de pesquisa, sem fármaco de hBD-3 aprovado, embora inspire análogos antimicrobianos e biomateriais anti-infecciosos.",
    "mechanism": "A hBD-3 é um peptídeo catiônico rico em cisteínas, estabilizado por pontes dissulfeto, capaz de interagir eletrostaticamente com membranas bacterianas aniônicas, promovendo permeabilização e morte microbiana. Além da ação direta, modula imunidade inata e adaptativa por quimiotaxia e sinalização em receptores como CCR6 e CCR2, podendo influenciar células dendríticas, monócitos e linfócitos. Também interage com componentes microbianos como LPS e pode modular inflamação local. A atividade depende fortemente de concentração, salinidade, matriz tecidual e susceptibilidade do microrganismo.",
    "pharmacokinetics": "t½: não definida em humanos | Via: nenhuma via terapêutica aprovada; pesquisa tópica, mucosal, biomateriais e formulações locais | outros: suscetível a proteólise; biodisponibilidade sistêmica baixa; análogos geralmente buscam maior estabilidade, menor hemólise e menor citotoxicidade.",
    "clinicalData": "Não há ensaios clínicos terapêuticos robustos com beta-defensina 3 humana como medicamento. A evidência é majoritariamente in vitro, ex vivo e em modelos animais de infecção, feridas e inflamação. Dados humanos são principalmente observacionais, medindo expressão de DEFB103/hBD-3 em pele, mucosas, periodonto e doenças inflamatórias.",
    "dosage": "Em estudos in vitro são comuns concentrações na faixa de microgramas/mL ou micromolar, variando conforme microrganismo e matriz. Não existe dose humana estabelecida para uso sistêmico, tópico ou mucosal.",
    "synergies": "Sinergia experimental descrita com lisozima, lactoferrina, catelicidinas, antibióticos convencionais e matrizes de curativo/biomateriais. Combinações visam reduzir concentração necessária e contornar resistência antimicrobiana.",
    "dietImpact": "Sem impacto direto em composição corporal. Nutrição adequada em proteína, zinco, vitamina D e integridade de barreira mucocutânea pode modular imunidade inata endógena, mas isso não equivale a suplementação farmacológica de hBD-3.",
    "recentStudies": [
      "🔬 2024 — Revisões em imunidade de barreira — hBD-3 destacada como peptídeo antimicrobiano e imunomodulador relevante em pele, mucosa oral e vias aéreas.",
      "🔬 2022 — International Journal of Molecular Sciences — revisões sobre defensinas descrevem atividade antimicrobiana, quimiotática e desafios de estabilidade/citotoxicidade.",
      "🔬 2020 — Frontiers in Immunology — literatura sobre peptídeos antimicrobianos reforça o potencial terapêutico, mas evidencia lacuna de ensaios clínicos."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "atividade antibacteriana e antifúngica experimental",
      "modulação de imunidade de barreira",
      "potencial em feridas, mucosas e biomateriais anti-infecciosos"
    ],
    "efeitosColaterais": [
      "potencial citotoxicidade em concentrações altas",
      "risco teórico de exacerbar inflamação local",
      "instabilidade por proteases e possível imunogenicidade de análogos"
    ],
    "notas": "Uso terapêutico humano não estabelecido. Para pesquisa, pureza por HPLC, correta formação de pontes dissulfeto, teor de endotoxina e confirmação por MS são críticos, pois pequenas variações alteram atividade e toxicidade.",
    "vanguarda": true
  },
  {
    "id": "peptideos-de-lactoferrina",
    "name": "Peptídeos de Lactoferrina",
    "classe": "peptídeos antimicrobianos e imunomoduladores derivados de lactoferrina",
    "status": "Pesquisa",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#0EA5E9",
    "halfLife": "~não estabelecida; minutos–horas conforme formulação",
    "category": "Imune",
    "tags": [
      "imune",
      "reparo",
      "metabolismo"
    ],
    "discovery": "Peptídeos como lactoferricina, lactoferrampina e hLF1-11 derivam da clivagem enzimática ou desenho sintético a partir da lactoferrina humana ou bovina, proteína abundante no leite, colostro e secreções mucosas. Em 2025-2026, a lactoferrina intacta possui literatura clínica como suplemento/nutracêutico, mas os peptídeos isolados permanecem majoritariamente em pesquisa antimicrobiana, antiviral e de biomateriais.",
    "mechanism": "Esses peptídeos são geralmente catiônicos e anfipáticos, ligando-se a membranas microbianas, LPS, ácidos teicoicos, glicoproteínas virais ou glicosaminoglicanos de superfície. A ação pode envolver permeabilização de membrana, inibição de adesão/entrada viral, neutralização de endotoxina e modulação de citocinas. Diferentemente da lactoferrina inteira, a quelação de ferro não é sempre o mecanismo dominante nos fragmentos curtos. A atividade varia intensamente com sequência, origem bovina/humana, pH, sais, proteases e sistema de entrega.",
    "pharmacokinetics": "t½: não padronizada em humanos | Via: oral, tópica, intranasal e biomaterial são estudadas; nenhuma posologia farmacêutica aprovada para fragmentos isolados | outros: peptídeos orais sofrem digestão extensiva; formulações lipossomais, hidrogéis e nanopartículas tentam aumentar estabilidade local.",
    "clinicalData": "Há ensaios humanos com lactoferrina intacta em anemia, infecções respiratórias, saúde neonatal, acne e COVID-19, com resultados variáveis e dependentes da formulação. Para peptídeos purificados de lactoferrina, faltam ensaios humanos grandes e confirmatórios; a maior parte dos dados é pré-clínica. Alguns derivados sintéticos inspirados em lactoferricina foram estudados topicamente como antimicrobianos, mas isso não valida todos os peptídeos de lactoferrina como classe terapêutica.",
    "dosage": "Lactoferrina intacta em estudos humanos frequentemente aparece entre 100 e 600 mg/dia por via oral, mas isso não deve ser extrapolado diretamente para fragmentos. Peptídeos isolados são testados in vitro em µg/mL ou µM; doses humanas não são estabelecidas.",
    "synergies": "Possível sinergia experimental com antibióticos, lisozima, defensinas, catelicidina LL-37, probióticos, zinco e sistemas de curativo. Em nutrição, colostro/lactoferrina é discutido junto a prebióticos e suporte de barreira intestinal, mas evidência para fragmentos específicos é limitada.",
    "dietImpact": "Pode ter impacto indireto em imunidade de mucosa e barreira intestinal quando fornecido como lactoferrina alimentar, especialmente em populações específicas. Não há evidência convincente de efeito direto em hipertrofia, emagrecimento ou recomposição corporal por peptídeos isolados.",
    "recentStudies": [
      "🔬 2024 — Revisões sobre lactoferrina e derivados — reforçam interesse em atividade antiviral, antibacteriana e modulação de barreira mucosa.",
      "🔬 2022 — Ensaios e revisões em COVID-19 com lactoferrina — resultados heterogêneos, sem consenso para indicação terapêutica ampla.",
      "🔬 2021 — Literatura de peptídeos antimicrobianos — lactoferricina e análogos descritos como scaffolds promissores, mas limitados por estabilidade e toxicidade."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "potencial antimicrobiano local",
      "modulação de endotoxina e inflamação de mucosa",
      "interesse em feridas, saúde oral, intestinal e respiratória"
    ],
    "efeitosColaterais": [
      "desconforto gastrointestinal quando derivados de lactoferrina são ingeridos",
      "risco alérgico em sensíveis a proteína do leite bovino",
      "citotoxicidade ou irritação local em concentrações altas de peptídeos catiônicos"
    ],
    "notas": "Distinguir lactoferrina intacta de peptídeos purificados é essencial. Especificação deve incluir sequência, origem, pureza HPLC, endotoxina, carga, grau de oxidação e estabilidade em proteases; produtos comerciais genéricos podem não conter o peptídeo declarado em quantidade farmacologicamente relevante.",
    "vanguarda": false
  },
  {
    "id": "timulina",
    "name": "Timulina",
    "classe": "nonapeptídeo tímico zinco-dependente, imunomodulador/neuroendócrino",
    "status": "Pesquisa",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#14B8A6",
    "halfLife": "~minutos; análogos podem durar horas",
    "category": "Imune",
    "tags": [
      "imune",
      "anti-aging",
      "longevidade"
    ],
    "discovery": "A timulina, também conhecida como fator tímico sérico, foi caracterizada como um nonapeptídeo produzido pelo epitélio tímico cuja atividade biológica depende da complexação com zinco. Seu interesse histórico vem de imunossenescência, doenças autoimunes e recuperação imune; em 2025-2026 não há produto aprovado por FDA/EMA nem ensaios modernos fase 3.",
    "mechanism": "A timulina ativa funções de linfócitos T e células imunes por um eixo tímico dependente de zinco, influenciando diferenciação, citotoxicidade e produção de citocinas. Também há dados pré-clínicos sugerindo interação neuroendócrina com eixo hipotálamo-hipófise e modulação de dor/inflamação. A deficiência de zinco pode reduzir atividade biológica, pois o complexo peptídeo-zinco é considerado a forma ativa. Alvos receptoriais específicos e farmacodinâmica quantitativa em humanos permanecem incompletos.",
    "pharmacokinetics": "t½: curta e pouco quantificada; peptídeo nativo é rapidamente degradado | Via: pesquisa subcutânea/injetável; análogos e terapia gênica experimental em animais | outros: depende de zinco para atividade; susceptível a peptidases; sem formulação farmacêutica aprovada internacionalmente.",
    "clinicalData": "Estudos clínicos antigos e pequenos avaliaram hormônios tímicos em imunodeficiências, infecções e autoimunidade, mas muitos não atendem padrões atuais de desenho, registro e estatística. Para timulina isolada, faltam ensaios humanos contemporâneos, randomizados e confirmatórios com desfechos clínicos relevantes. A evidência moderna é predominantemente pré-clínica, incluindo modelos de inflamação, dor e envelhecimento imune.",
    "dosage": "Não há dose aprovada. Estudos históricos usaram quantidades em faixa de microgramas por via parenteral, enquanto modelos animais utilizam doses variáveis conforme espécie e formulação; a extrapolação humana não é segura.",
    "synergies": "A relação biológica mais clara é com zinco, indispensável para atividade. Combinações teóricas incluem correção de deficiência de zinco, suporte nutricional proteico e intervenções contra imunossenescência, mas sinergia clínica não está comprovada.",
    "dietImpact": "Estado nutricional de zinco, proteína e energia influencia função tímica e imunidade celular. A timulina não tem efeito direto demonstrado em perda de gordura ou hipertrofia, mas sua biologia reforça a importância de zinco adequado para imunocompetência.",
    "recentStudies": [
      "🔬 2024 — Revisões sobre imunossenescência — eixo tímico e peptídeos tímicos permanecem tema de interesse, mas sem validação clínica moderna para timulina.",
      "🔬 2021 — Literatura pré-clínica em neuroimunomodulação — timulina e análogos avaliados em inflamação e dor em modelos animais.",
      "🔬 2020 — Revisões sobre zinco e imunidade — destacam que deficiência de zinco prejudica função tímica e imunidade T, contexto relevante para atividade da timulina."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "potencial suporte à imunidade celular",
      "interesse em imunossenescência",
      "efeitos anti-inflamatórios e analgésicos pré-clínicos"
    ],
    "efeitosColaterais": [
      "reações no local de aplicação em uso parenteral experimental",
      "risco de imunomodulação imprevisível",
      "incerteza de segurança crônica"
    ],
    "notas": "Não confundir com timosina alfa-1, que possui desenvolvimento clínico e uso regulatório em alguns países. Para pesquisa, confirmar sequência, complexo com zinco, pureza HPLC e endotoxina; evitar uso em doenças autoimunes, neoplasias ou imunossupressão sem supervisão especializada.",
    "vanguarda": false
  },
  {
    "id": "leuphasyl-pentapeptide-18",
    "name": "Leuphasyl (Pentapeptide-18)",
    "classe": "peptídeo cosmético mimético de encefalina, modulador de contração de expressão",
    "status": "Cosmético",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#8B5CF6",
    "color": "#A855F7",
    "halfLife": "~não estabelecida; degradação tópica provável em horas",
    "category": "Cosmético",
    "tags": [
      "anti-aging"
    ],
    "discovery": "Leuphasyl é o nome comercial associado ao INCI Pentapeptide-18, introduzido pela indústria cosmética como peptídeo anti-rugas de expressão. Em 2025-2026 é usado em formulações tópicas cosméticas, sem status de medicamento e sem aprovação para paralisia muscular terapêutica.",
    "mechanism": "O Pentapeptide-18 foi desenhado para mimetizar aspectos de encefalinas endógenas, modulando vias opioides periféricas em terminações nervosas cutâneas de forma proposta. A hipótese cosmética é reduzir excitabilidade neuronal e liberação de acetilcolina na junção neuromuscular superficial, suavizando microcontrações responsáveis por rugas dinâmicas. Esse efeito seria muito mais fraco e superficial que toxina botulínica, sem denervação química profunda. A penetração cutânea real e a magnitude farmacodinâmica independente são incertas.",
    "pharmacokinetics": "t½: não determinada em pele humana | Via: tópica cosmética | outros: permeação limitada pelo estrato córneo; estabilidade depende de veículo, pH, conservantes e peptidases cutâneas; exposição sistêmica esperada baixa.",
    "clinicalData": "A evidência é majoritariamente de estudos internos de fabricante, testes cosméticos pequenos e avaliações instrumentais ou fotográficas de rugas. Não há ensaios clínicos independentes, grandes, randomizados e revisados por pares demonstrando eficácia comparável a toxina botulínica. Portanto, alegações percentuais de redução de rugas devem ser interpretadas como cosméticas e preliminares/anecdóticas.",
    "dosage": "Formulações comerciais costumam empregar o ingrediente em solução na faixa aproximada de 1% a 5% do blend fornecido pelo fabricante, resultando em teor ativo muito menor. Uso típico: aplicação tópica diária ou duas vezes ao dia em áreas de linhas de expressão.",
    "synergies": "Frequentemente combinado com Acetyl Hexapeptide-8, Syn-Ake, Matrixyl, ácido hialurônico, niacinamida, retinoides suaves e fotoproteção. A sinergia mais plausível é cosmética: hidratação, estímulo de matriz dérmica e redução temporária da aparência de linhas.",
    "dietImpact": "Sem impacto metabólico ou na composição corporal. Dieta rica em proteína adequada, vitamina C, carotenoides e controle glicêmico pode favorecer colágeno e reduzir glicação dérmica, complementando cuidados tópicos.",
    "recentStudies": [
      "🔬 2024 — Revisões dermatocosméticas sobre peptídeos tópicos — Pentapeptide-18 citado como ingrediente anti-rugas com evidência clínica independente limitada.",
      "🔬 2022 — Revisões em cosmetic peptides — peptídeos neurotransmitter-inhibiting classificados como cosmecêuticos, não equivalentes a neuromoduladores injetáveis.",
      "🔬 2020 — Literatura de formulação cutânea — destaca barreira de permeação e estabilidade como limitações centrais para peptídeos tópicos."
    ],
    "evidencia": "ANECDÓTICA",
    "beneficios": [
      "suavização cosmética de linhas finas",
      "possível redução temporária de rugas de expressão",
      "boa compatibilidade com hidratantes e ativos de barreira"
    ],
    "efeitosColaterais": [
      "irritação cutânea leve",
      "dermatite de contato por excipientes da fórmula",
      "ardor ou eritema em peles sensibilizadas"
    ],
    "notas": "Não substitui toxina botulínica nem tratamento dermatológico. A qualidade depende mais da formulação final do que apenas da presença no rótulo; concentração real, estabilidade, embalagem airless e compatibilidade com pH são relevantes.",
    "vanguarda": false
  },
  {
    "id": "syn-ake-dipeptide-diaminobutyroyl-benzylamide-diacetate",
    "name": "Syn-Ake (Dipeptide Diaminobutyroyl Benzylamide Diacetate)",
    "classe": "peptídeo cosmético mimético de Waglerin-1, modulador nicotínico periférico",
    "status": "Cosmético",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#8B5CF6",
    "color": "#9333EA",
    "halfLife": "~não estabelecida; provável horas na formulação/pele",
    "category": "Cosmético",
    "tags": [
      "anti-aging"
    ],
    "discovery": "Syn-Ake é um ingrediente cosmético desenvolvido para mimetizar parcialmente a atividade do peptídeo Waglerin-1, encontrado no veneno da víbora Tropidolaemus wagleri. Em 2025-2026 permanece como ativo tópico cosmético amplamente usado em séruns e cremes anti-rugas, sem indicação médica aprovada.",
    "mechanism": "O Dipeptide Diaminobutyroyl Benzylamide Diacetate é proposto como antagonista funcional suave de receptores nicotínicos de acetilcolina na junção neuromuscular superficial. A consequência esperada é menor contração de microfibras musculares faciais e redução transitória da aparência de rugas dinâmicas. Por aplicação tópica, a penetração até alvos neuromusculares é limitada e não comparável a bloqueio colinérgico injetável. A maior parte da ação percebida pode combinar hidratação, efeito óptico da formulação e modulação neuromuscular superficial discreta.",
    "pharmacokinetics": "t½: não caracterizada em humanos | Via: tópica cosmética | outros: baixa biodisponibilidade sistêmica esperada; permeação dependente de veículo; degradação por peptidases cutâneas e estabilidade em formulação são determinantes.",
    "clinicalData": "Existem estudos de fornecedor e testes cosméticos pequenos relatando melhora de rugas após semanas de uso, mas a literatura independente, randomizada e revisada por pares é escassa. Não há evidência clínica de segurança/eficácia como fármaco neuromuscular. Resultados devem ser tratados como cosméticos, com risco de viés e sem padronização universal de desfechos.",
    "dosage": "Fornecedores geralmente sugerem uso do blend comercial em cerca de 1% a 4% na formulação final, aplicado uma ou duas vezes ao dia. A concentração do peptídeo ativo puro é muito menor que a porcentagem do blend.",
    "synergies": "Usado com ácido hialurônico, peptídeos sinalizadores como palmitoyl tripeptide/palmitoyl tetrapeptide, Pentapeptide-18, Acetyl Hexapeptide-8, antioxidantes e protetor solar. Pode ser combinado com retinoides, mas peles irritadas podem tolerar pior fórmulas complexas.",
    "dietImpact": "Não altera metabolismo, apetite ou composição corporal. Nutrição adequada, fotoproteção e redução de tabagismo/álcool têm impacto mais consistente sobre envelhecimento cutâneo do que peptídeos tópicos isolados.",
    "recentStudies": [
      "🔬 2024 — Revisões de cosmecêuticos peptídicos — Syn-Ake citado como peptídeo mimético de veneno com suporte principalmente de dados de fornecedor.",
      "🔬 2022 — Revisões sobre peptídeos anti-rugas — ressaltam que ingredientes tipo botulinum-like têm evidência inferior à toxina botulínica injetável.",
      "🔬 2020 — Literatura de entrega transdérmica — reforça que estrato córneo limita peptídeos hidrofílicos e exige formulação adequada."
    ],
    "evidencia": "ANECDÓTICA",
    "beneficios": [
      "melhora cosmética temporária de linhas de expressão",
      "sensação de pele mais lisa quando combinado a hidratantes",
      "alternativa tópica não injetável com baixo risco sistêmico esperado"
    ],
    "efeitosColaterais": [
      "irritação local",
      "dermatite de contato por fragrâncias/conservantes",
      "ressecamento ou ardor em barreira cutânea comprometida"
    ],
    "notas": "Não deve ser apresentado como toxina botulínica tópica equivalente. Avaliar concentração real do ingrediente, veículo, estabilidade, testes de irritação e procedência; alegações agressivas de paralisia muscular por cosmético são biologicamente improváveis.",
    "vanguarda": false
  },
  {
    "id": "shlp-2",
    "name": "SHLP-2",
    "classe": "peptídeo derivado do genoma mitocondrial, small humanin-like peptide",
    "status": "Pesquisa",
    "badge": "🧪 PESQUISA",
    "badgeColor": "#2563EB",
    "color": "#F97316",
    "halfLife": "~não estabelecida; presumivelmente minutos",
    "category": "Mitocondrial",
    "tags": [
      "longevidade",
      "metabolismo",
      "neuro",
      "anti-aging"
    ],
    "discovery": "SHLP-2 pertence ao grupo dos small humanin-like peptides codificados em regiões do rRNA 16S mitocondrial, descritos pelo campo de peptídeos derivados da mitocôndria associado ao laboratório de Pinchas Cohen. Em 2025-2026 é uma molécula de biologia mitocondrial e envelhecimento em pesquisa pré-clínica, sem medicamento aprovado e sem ensaios humanos intervencionais robustos.",
    "mechanism": "SHLP-2 é proposto como peptídeo sinalizador mitocondrial com efeitos citoprotetores, metabólicos e antiapoptóticos em modelos celulares. Estudos pré-clínicos sugerem melhora de sinalização de insulina, redução de estresse oxidativo, preservação de função mitocondrial e modulação de vias como ERK, STAT3 e sobrevivência celular, embora receptores e alvos diretos ainda não estejam totalmente definidos. Como outros mitochondrial-derived peptides, pode atuar como mensageiro mitonuclear, refletindo ou modulando o estado energético celular. A tradução farmacológica humana permanece altamente preliminar.",
    "pharmacokinetics": "t½: não definida em humanos | Via: sem via aprovada; estudos usam administração parenteral em animais e exposição celular in vitro | outros: peptídeo curto susceptível a proteases; análogos podem exigir modificações para estabilidade; distribuição tecidual humana desconhecida.",
    "clinicalData": "Não há ensaios clínicos humanos demonstrando eficácia terapêutica de SHLP-2. Dados disponíveis incluem estudos celulares, modelos animais e associações observacionais de níveis circulantes de peptídeos mitocondriais com idade, metabolismo ou doenças. Não existem resultados numéricos clínicos suficientes para dose-resposta, segurança crônica ou indicação.",
    "dosage": "Em pesquisa, concentrações in vitro costumam estar em faixa nanomolar a micromolar; estudos animais usam esquemas parenterais variáveis em mg/kg ou frações disso, conforme desenho experimental. Não há dose humana estabelecida.",
    "synergies": "Discussões teóricas incluem associação com exercício, restrição calórica, melhora de sono, controle glicêmico, agonistas GLP-1, metformina ou estratégias mitocondriais, mas não há sinergia clínica comprovada com SHLP-2.",
    "dietImpact": "O interesse principal é metabolismo energético e sensibilidade à insulina, mas não há evidência de que SHLP-2 exógeno produza emagrecimento ou recomposição corporal em humanos. Dieta hipocalórica, proteína adequada e exercício têm evidência muito superior para melhorar função mitocondrial e composição corporal.",
    "recentStudies": [
      "🔬 2024 — Revisões sobre mitochondrial-derived peptides — SHLP-2 citado como candidato citoprotetor/metabólico ainda pré-clínico.",
      "🔬 2022 — Literatura em envelhecimento e mitocôndria — peptídeos como humanin, MOTS-c e SHLPs discutidos como sinalizadores mitonucleares.",
      "🔬 2016 — Aging — descrição de small humanin-like peptides, incluindo SHLP-2, com efeitos em sobrevivência celular e metabolismo em modelos experimentais."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "potencial citoproteção mitocondrial",
      "interesse em sensibilidade à insulina",
      "possível neuroproteção pré-clínica"
    ],
    "efeitosColaterais": [
      "segurança humana desconhecida",
      "risco teórico de efeitos proliferativos por sinalização antiapoptótica",
      "reações imunológicas ou locais com uso parenteral experimental"
    ],
    "notas": "Produto de vanguarda, porém sem validação clínica. Pureza HPLC/MS, sequência correta, ausência de endotoxina e estabilidade são obrigatórias em pesquisa; uso fora de estudo pode gerar exposição a peptídeos degradados ou impuros.",
    "vanguarda": true
  },
  {
    "id": "shlp-6",
    "name": "SHLP-6",
    "classe": "peptídeo derivado do genoma mitocondrial, small humanin-like peptide com atividade pró-apoptótica experimental",
    "status": "Experimental",
    "badge": "⚠️ EXPERIMENTAL",
    "badgeColor": "#F59E0B",
    "color": "#EA580C",
    "halfLife": "~não estabelecida; presumivelmente minutos",
    "category": "Mitocondrial",
    "tags": [
      "longevidade",
      "metabolismo"
    ],
    "discovery": "SHLP-6 é outro membro dos small humanin-like peptides descritos a partir de pequenas ORFs no genoma mitocondrial, no mesmo contexto de descoberta de SHLP-1 a SHLP-6. Em 2025-2026 permanece em estágio experimental, com interesse biológico por efeitos distintos de SHLP-2, incluindo sinalização pró-apoptótica em certos modelos celulares.",
    "mechanism": "Ao contrário de SHLP-2, SHLP-6 foi associado em estudos iniciais a efeitos pró-apoptóticos em algumas linhagens celulares, incluindo aumento de morte celular programada e possível interferência em função mitocondrial. Mecanismos propostos envolvem estresse oxidativo, perturbação de potencial de membrana mitocondrial, ativação de caspases e alteração de vias de sobrevivência, mas os alvos diretos não estão estabelecidos. Essa atividade levanta interesse oncológico conceitual, porém também aumenta preocupação com toxicidade em tecidos normais. A farmacologia é insuficiente para inferir benefício clínico.",
    "pharmacokinetics": "t½: não definida | Via: nenhuma via terapêutica aprovada; uso restrito a modelos celulares e animais exploratórios | outros: provável rápida degradação por peptidases; estabilidade, distribuição e seletividade tecidual não caracterizadas em humanos.",
    "clinicalData": "Não existem ensaios clínicos humanos com SHLP-6 como intervenção terapêutica. A evidência é limitada a trabalhos de descoberta, ensaios celulares e hipóteses mecanísticas. Não há dados humanos de eficácia, segurança, dose máxima tolerada, farmacocinética ou biomarcadores validados.",
    "dosage": "Estudos in vitro utilizam concentrações experimentais em faixa nanomolar a micromolar, dependendo do ensaio. Não há dose animal padronizada nem dose humana justificável fora de pesquisa formal.",
    "synergies": "No campo oncológico experimental, poderia ser conceitualmente combinado com indutores de apoptose, moduladores redox ou terapias mitocondriais, mas isso é especulativo. Não há combinações clínicas validadas.",
    "dietImpact": "Sem aplicação nutricional comprovada. Como envolve apoptose e função mitocondrial, não deve ser associado a promessas de longevidade, emagrecimento ou performance; intervenções dietéticas mitocondriais têm base independente e não dependem de SHLP-6.",
    "recentStudies": [
      "🔬 2024 — Revisões sobre peptídeos derivados da mitocôndria — SHLP-6 citado como membro pouco caracterizado e sem tradução clínica.",
      "🔬 2022 — Revisões em biologia mitocondrial do envelhecimento — destacam lacunas sobre receptores, meia-vida e especificidade tecidual dos SHLPs.",
      "🔬 2016 — Aging — estudo de descoberta dos SHLPs descreveu perfis funcionais divergentes entre membros, incluindo atividade pró-apoptótica atribuída a SHLP-6 em modelos experimentais."
    ],
    "evidencia": "PRELIMINAR",
    "beneficios": [
      "ferramenta para estudar apoptose mitocondrial",
      "interesse exploratório em biologia do câncer",
      "potencial para revelar novas vias de comunicação mitonuclear"
    ],
    "efeitosColaterais": [
      "toxicidade celular potencial",
      "segurança sistêmica desconhecida",
      "risco teórico de dano a tecidos normais por indução de apoptose"
    ],
    "notas": "Não é peptídeo de bem-estar ou anti-aging pronto para uso. Qualquer material deve ser tratado como reagente experimental, com confirmação de sequência por MS, pureza HPLC, endotoxina baixa e estudos de citotoxicidade antes de aplicações biológicas.",
    "vanguarda": true
  }
];
