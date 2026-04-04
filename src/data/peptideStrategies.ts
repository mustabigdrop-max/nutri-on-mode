export type PeptideStrategy = {
  mechanismSummary: string;
  macros: { cho: string; ptn: string; lip: string };
  timing: string;
  warning: string;
  synergyStack: string;
  tags: string[];
  strategies: Array<{ title: string; detail: string }>;
};

export const peptideStrategies: Record<string, PeptideStrategy> = {

  "retatrutida": {
    mechanismSummary: "Agonista triplo GLP-1/GIP/Glucagon. GLP-1 → saciedade. GIP → sensibilidade insulínica. Glucagon → oxidação hepática e termogênese.",
    macros: { cho: "40–45%", ptn: "35–40%", lip: "20–25%" },
    timing: "Dias 1–3 pós-dose semanal: refeições menores, alta proteína. Dias 4–7: CHO complexo peri-treino, proteína distribuída. Sempre: eletrólitos ativos.",
    warning: "Ação natriurética do glucagon eleva perda de sódio. Repor eletrólitos (Na, K, Mg) ativamente. Náuseas: fracionar 5–6 refeições menores.",
    synergyStack: "Fibra solúvel 20g + Berberina 500mg 2x/dia + Ômega-3 3g + Zinco 30mg + Cromo 200mcg. Potencializa os 3 receptores simultaneamente.",
    tags: ["GLP-1", "GIP", "Glucagon", "CHO estratégico", "Eletrólitos", "Berberina"],
    strategies: [
      { title: "CHO aumentado e estratégico (sim, carboidrato!)", detail: "O glucagon estimula glicogenólise e gliconeogênese — o corpo fica em maior demanda glicêmica basal. Carboidratos complexos (aveia, batata-doce, arroz integral) sustentam esse balanço sem picos. Reduzir CHO demais com glucagon ativo causa hipoglicemia relativa e fadiga." },
      { title: "Proteína mínima 2g/kg — obrigatório", detail: "O déficit agressivo induzido pela retatrutida sem proteína adequada resulta em catabolismo muscular intenso. A tripla ação hormonal não protege massa magra — a proteína sim." },
      { title: "Fibras solúveis 15–25g/dia", detail: "Psyllium, goma guar, β-glucana estimulam células L intestinais a produzir GLP-1 endógeno adicional, potencializando o análogo exógeno. Fibra também retarda absorção de CHO — parceiro ideal." },
      { title: "Berberina 500mg 2x/dia", detail: "Imita metformina no eixo AMPK e potencializa sinalização GIP. Reduz glicemia de jejum e pós-prandial, sinérgica com os 3 receptores da retatrutida." },
      { title: "Repor eletrólitos ativamente", detail: "Glucagon tem ação natriurética — aumenta excreção renal de sódio e água. Suplementar: sódio 1–2g/dia extra, potássio (banana, batata), magnésio 400mg. Comum: cãibras e fadiga por déficit eletrolítico." },
      { title: "Gordura: qualidade, não quantidade", detail: "GIP otimiza sensibilidade a ácidos graxos. Priorize ômega-3, azeite, abacate. Evite saturada em excesso pois a lipólise hepática acelerada pelo glucagon já mobiliza gordura — não sobrecarregue o metabolismo hepático." }
    ]
  },

  "semaglutida": {
    mechanismSummary: "Análogo GLP-1 de ação prolongada. Retarda esvaziamento gástrico, suprime glucagon prandial e age no hipotálamo para saciedade.",
    macros: { cho: "30–38%", ptn: "38–42%", lip: "22–28%" },
    timing: "48h pós-dose: refeições leves 5–6x/dia. Semana toda: CHO complexo, fibra alta, proteína distribuída a cada 3–4h.",
    warning: "Álcool: risco de hipoglicemia + intensifica náuseas. Pancreatite: contraindicação absoluta. Monitorar amílase se dor abdominal.",
    synergyStack: "Probióticos (L. reuteri + B. longum) + Fibra solúvel 20g + Berberina 500mg + Exercício aeróbico 150min/semana. GLP-1 endógeno amplificado.",
    tags: ["GLP-1", "Baixo IG", "Probióticos", "Fibra", "Sem álcool"],
    strategies: [
      { title: "Carboidratos de baixo IG em todas as refeições", detail: "GLP-1 exógeno já suprime glucagon. CHO de alto IG nesse contexto causa pico insulínico desproporcional. Priorizar: aveia, quinoa, legumes, batata-doce. Evitar pão branco, arroz branco, sucos." },
      { title: "Probióticos para eixo gut-brain", detail: "GLP-1 é produzido pelas células L do intestino distal, moduladas pelo microbioma. Lactobacillus reuteri e Bifidobacterium longum aumentam produção endógena de GLP-1, amplificando o análogo exógeno." },
      { title: "Volume reduzido por refeição", detail: "Esvaziamento gástrico lento gera desconforto intenso com refeições volumosas. Regra: dividir a quantidade habitual em 5–6 refeições menores sem reduzir densidade nutricional." },
      { title: "Leucina ≥ 3g por refeição", detail: "O déficit calórico induzido é substancial. Leucina ativa mTOR e preserva massa magra mesmo em restrição severa. Whey pós-treino é obrigatório no protocolo." },
      { title: "B12 + Magnésio suplementados", detail: "A redução da ingestão alimentar pode causar deficiência de B12 (especialmente vegetarianos) e magnésio. A semaglutida não protege contra deficiências micronutricionais — suplementar proativamente." },
      { title: "Álcool: eliminação total", detail: "Álcool inibe a sinalização de saciedade hipotalâmica, intensifica náuseas e pode causar hipoglicemia reativa. Uma dose de bebida pode antagonizar 2–3 dias de protocolo." }
    ]
  },

  "tirzepatida": {
    mechanismSummary: "Agonista duplo GLP-1+GIP. GIP tem receptor no adipócito e potencializa lipólise diferenciada. Superior à semaglutida em perda de gordura.",
    macros: { cho: "32–38%", ptn: "35–40%", lip: "25–30%" },
    timing: "72h pós-dose: foco em proteína + gordura saudável, CHO mínimo. Após: retornar ao protocolo. Inositol com todas as refeições.",
    warning: "GIP pode paradoxalmente reduzir emagrecimento em polimorfismos do receptor GIPR (rs1800437). Monitorar resposta individual nas primeiras 8 semanas.",
    synergyStack: "Inositol mio-inositol 4g + Vitamina D3 8000UI + EGCG 400mg + Ômega-3 3g. Stack específico GIP.",
    tags: ["GLP-1", "GIP", "Receptor adiposo", "Inositol", "Vitamina D"],
    strategies: [
      { title: "Gordura de qualidade em percentual maior", detail: "GIP tem receptores diretos no adipócito. Ácidos graxos monoinsaturados e ômega-3 ativam esses receptores favoravelmente, potencializando a sinalização do GIP exógeno no tecido adiposo." },
      { title: "Inositol mio-inositol 4g/dia", detail: "Potencializa sinalização pós-receptor de insulina via IP3 (inositol trifosfato). Sinergia direta com GIP para sensibilidade insulínica periférica. Especialmente eficaz em SOP e resistência insulínica." },
      { title: "EGCG 400mg/dia", detail: "Inibe DPP-4, enzima que degrada GLP-1 e GIP endógenos. Prolonga a meia-vida dos análogos endógenos produzidos durante o tratamento, amplificando o efeito da tirzepatida." },
      { title: "Vitamina D3 + Cálcio", detail: "GIP tem receptor nos ossos e regula metabolismo ósseo e adiposo. Deficiência de vitamina D (muito comum no Brasil) compromete a ação plena do GIP exógeno." },
      { title: "CHO com índice insulinêmico baixo", detail: "GIP estimula insulina potentemente. CHO de alto índice insulinêmico pode causar hipoglicemia reativa com tirzepatida. Priorizar CHO integral + fibra para curva glicêmica suave." },
      { title: "Proteína vegetal + animal combinadas", detail: "Aminoácidos vegetais (legumes, soja, ervilha) têm perfil insulinogênico diferente dos animais. A combinação otimiza a resposta insulínica sem sobrecarregar a via GIP." }
    ]
  },

  "folistatina-344": {
    mechanismSummary: "Inibe miostatina endogenamente, removendo o principal freio à hipertrofia. Ativa células satélites e diferenciação miogênica.",
    macros: { cho: "45–52%", ptn: "30–35%", lip: "18–22%" },
    timing: "Pré-treino: CHO 60g + proteína 30g (60min antes). Intra: BCAA ou EAA. Pós imediato: whey 40g + CHO rápido 60–80g. Noite: caseína 40g + HMB 3g.",
    warning: "Folistatina também inibe activina A e B — função reprodutiva e fertilidade podem ser afetadas com uso prolongado. Ciclos curtos recomendados.",
    synergyStack: "Leucina 4g/refeição + Creatina 5g + HMB 3g + Ômega-3 3g + Vitamina D3 5000UI. Anabolismo máximo sem hormônios.",
    tags: ["Anti-miostatina", "mTOR", "Leucina", "Creatina", "Superávit"],
    strategies: [
      { title: "Superávit calórico +400–600 kcal", detail: "Com miostatina inibida, o músculo está geneticamente liberado para crescer além do limite natural. Mais substrato energético = mais síntese proteica. Não manter déficit durante o protocolo de folistatina." },
      { title: "Leucina 3–4g por refeição, 5x/dia", detail: "mTORC1 é o gatilho anabólico central. Leucina é o ativador primário por via PI3K/Akt/mTOR. Com folistatina removendo o freio da miostatina, cada dose de leucina tem impacto anabólico amplificado." },
      { title: "CHO peri-treino alto: 1–1.5g/kg", detail: "Insulina é o parceiro anabólico da folistatina. Pico insulínico pós-treino (CHO rápido) + folistatina ativa = janela de síntese proteica maximizada. Whey + dextrose ou maltodextrina no imediato pós-treino." },
      { title: "Creatina monohidratada 5g/dia", detail: "Folistatina expande fibras tipo II (contração rápida). Creatina satura os estoques de fosfocreatina nessas fibras. Sinergia muscular direta: um favorece crescimento, outro a força e volume celular." },
      { title: "HMB 3g/dia", detail: "β-hidroxi β-metilbutirato reduz proteólise muscular e ativa mTOR por via diferente da leucina. Com folistatina, cria duplo estímulo anabólico + anti-catabólico simultâneo." },
      { title: "Ômega-3 3g + Vitamina D3 5000UI", detail: "Ômega-3 ativa PPARγ, favorecendo diferenciação de células satélites. Vitamina D tem receptor no miócito e potencializa síntese proteica muscular de forma independente." }
    ]
  },

  "bpc-157": {
    mechanismSummary: "Derivado da proteína de proteção gástrica. Ativa VEGF, NO sintase e fatores de crescimento para reparo de tendões, ligamentos e mucosa.",
    macros: { cho: "40–45%", ptn: "30–35%", lip: "22–26%" },
    timing: "Matinal em jejum: BPC-157. 30min depois: colágeno 15g + Vit C 500mg. Pré-treino: segunda dose de colágeno + Vit C. Jantar: caldo de osso como base.",
    warning: "AINEs (ibuprofeno, diclofenaco, naproxeno) antagonizam diretamente o BPC-157. Eliminar completamente durante o protocolo de reparo.",
    synergyStack: "Colágeno 15g + Glicina 5g + Silício orgânico 10mg + Zinco 30mg + Vitamina C 1g + Cúrcuma 500mg. Reparo tecidual completo.",
    tags: ["Colágeno", "Glicina", "Sem AINEs", "Cúrcuma", "VEGF", "Tendão"],
    strategies: [
      { title: "Colágeno hidrolisado 15g + Vitamina C 500mg pré-treino", detail: "Gly-Pro-Hyp (tripeptídeo do colágeno) direciona aminoácidos exatamente aos tecidos que o BPC-157 está sinalizando para reparar. Vitamina C é cofator obrigatório da hidroxilação do colágeno. Sem ela, o colágeno não matura." },
      { title: "Glicina 5g extra/dia", detail: "Glicina é 33% da composição do tendão e 25% da cartilagem. Fontes excelentes: caldo de osso (10–15g glicina/litro), gelatina sem sabor, pele de frango. Suplementar adicionalmente aos alimentos." },
      { title: "Cúrcuma 500mg + Piperina (pimenta preta)", detail: "BPC-157 já modula COX-2. Curcumina potencializa sem bloquear a fase inflamatória pró-reparo — diferente dos AINEs que bloqueiam completamente. Piperina aumenta biodisponibilidade da curcumina em 2000%." },
      { title: "ELIMINAR AINEs completamente", detail: "Ibuprofeno, diclofenaco e naproxeno bloqueiam prostaglandinas E2, necessárias para ativação de células satélites e recrutamento de fibroblastos — exatamente o mecanismo que o BPC-157 estimula. Antagonismo direto." },
      { title: "Zinco 30mg + Cobre 2mg + Vitamina A", detail: "Zinco é cofator da prolil-4-hidroxilase (enzima do colágeno). Vitamina A ativa fibroblastos. Cobre é essencial para cross-linking das fibras de colágeno via lisil oxidase." },
      { title: "Silício orgânico 10mg/dia", detail: "Silício estimula síntese de colágeno tipo I e III — os tipos presentes em tendões e ligamentos que o BPC-157 está reparando. Ácido ortossilícico é a forma mais biodisponível." }
    ]
  },

  "tb-500": {
    mechanismSummary: "Regula polimerização de actina G. Promove migração e diferenciação celular, angiogênese sistêmica e mobilização de células-tronco mesenquimais.",
    macros: { cho: "40–45%", ptn: "30–35%", lip: "22–26%" },
    timing: "Aplicação pré-sono. Caseína 40g + Magnésio 400mg ao deitar. Sono ≥ 8h. Manhã: glutamina 7g em jejum. Pós-treino: glutamina 8g + proteína.",
    warning: "Hidratação crítica: TB-500 aumenta demanda hídrica celular. Mínimo 40ml/kg/dia com eletrólitos. Evitar álcool — compromete migração celular.",
    synergyStack: "Caseína 40g + Glicina 5g + Magnésio glicinato 400mg + Vitamina D3 5000UI + Glutamina 8g antes de dormir. Reparo máximo.",
    tags: ["Actina G", "Glutamina", "Vitamina D", "Sono", "Migração celular"],
    strategies: [
      { title: "L-Glutamina 15g/dia dividida em 2 doses", detail: "Glutamina é combustível primário de fibroblastos, macrófagos e células epiteliais em migração. TB-500 aumenta tráfego celular — glutamina fornece o ATP e nitrogênio para essa mobilidade aumentada." },
      { title: "Vitamina D3 5.000UI + K2 MK-7 100mcg", detail: "Vitamina D tem receptor em células-tronco mesenquimais — as mesmas que TB-500 mobiliza. Ativa genes de diferenciação e reduz inflamação sistêmica que inibe a migração celular." },
      { title: "Ferro heme biodisponível (carne vermelha magra)", detail: "Angiogênese (formação de novos vasos) requer síntese de hemoglobina para suprir os vasos formados. Deficiência de ferro é o principal limitante do crescimento vascular induzido pelo TB-500." },
      { title: "Antioxidantes MODERADOS — não em megadose", detail: "ROS em concentrações fisiológicas ativam HIF-1α e VEGF, sinais de reparo essenciais. Megadoses de vitamina C/E pós-treino capturam esses radicais e podem atenuar a angiogênese estimulada pelo TB-500." },
      { title: "Magnésio glicinato 400mg à noite", detail: "Sono profundo (estágios N3/N4) é quando TB-500 tem maior janela de ação regenerativa. Magnésio glicinato melhora qualidade do sono sem sedação. A glicina adicional tem efeito regenerativo próprio." },
      { title: "Caseína micelar antes de dormir", detail: "Mantém aminoácidos circulantes por 7–8h — janela exatamente coincidente com a fase de reparo noturno potencializada pelo TB-500. Superior ao whey para o protocolo noturno." }
    ]
  },

  "ipamorelin-cjc1295": {
    mechanismSummary: "Ipamorelin mima GHRP sem elevar cortisol. CJC-1295 DAC estende meia-vida do GHRH endógeno. Pulsos fisiológicos e sustentados de GH.",
    macros: { cho: "30–38%", ptn: "38–42%", lip: "25–30%" },
    timing: "Protocolo noturno (preferido): 30–60min antes de dormir, jejum de CHO. Protocolo manhã: em jejum, pré-treino. Jantar: proteína + gordura, último CHO ≥ 3h antes.",
    warning: "CJC-1295 com DAC tem meia-vida de 8 dias — acúmulo progressivo. Monitorar IGF-1 a cada 8 semanas. Sem álcool: suprime GH por até 24h.",
    synergyStack: "L-Arginina 3g + L-Ornitina 2g + Zinco 30mg + Magnésio 400mg antes de dormir. Pico de GH máximo sem cortisol.",
    tags: ["GH", "Sem CHO noturno", "Arginina", "Jejum", "IGF-1"],
    strategies: [
      { title: "ZERO CHO na refeição pré-dose", detail: "Insulina e GH são antagonistas hormonais. Glicemia >100mg/dL suprime o eixo somatotrófico em até 70%. Última refeição antes da dose: apenas proteína + gordura. Regra não negociável." },
      { title: "L-Arginina 3g + L-Ornitina 2g pré-sono", detail: "Arginina estimula GH hipofisário via síntese de NO. Ornitina potencializa esse efeito. Administrar junto com ipamorelin no protocolo noturno cria pico sinérgico de GH por vias complementares." },
      { title: "Gordura saudável no jantar (sem CHO)", detail: "Salmão, ovos inteiros, azeite, abacate. Gordura não eleva insulina significativamente. Refeição noturna com gordura + proteína cria o ambiente hormonal ideal para o protocolo noturno de GH." },
      { title: "Jejum de 2–3h antes de qualquer dose", detail: "Regra universal independente do horário: dose sempre em estado de baixa insulina. O ambiente de baixa glicemia é pré-requisito para amplitude máxima do pico de GH." },
      { title: "Zinco 30mg + Vitamina B6 P5P 50mg", detail: "Cofatores necessários para síntese do próprio GH na hipófise. Se a hipófise não tem os precursores, o secretagogo estimula uma síntese subótima. P5P (forma ativa) age diretamente sem necessidade de conversão." },
      { title: "Álcool: tolerância zero durante o protocolo", detail: "Álcool suprime GH de forma dose-dependente por até 24h após consumo. Uma dose de bebida alcoólica pode nulificar 2–3 dias de protocolo. Incompatível com qualquer secretagogo de GH." }
    ]
  },

  "mots-c": {
    mechanismSummary: "Derivado do DNA mitocondrial (16S rRNA). Ativa AMPK e FOXO3, melhora sensibilidade insulínica e promove biogênese mitocondrial.",
    macros: { cho: "38–43%", ptn: "25–30%", lip: "28–32%" },
    timing: "Aplicar 30min antes de exercício aeróbico em jejum. Suplementos: CoQ10 + ômega-3 com primeira refeição. Polifenóis no almoço.",
    warning: "Evitar antioxidantes em megadose pós-treino — atenuam sinalização AMPK via ROS. ROS fisiológico é necessário para o sinal de adaptação mitocondrial.",
    synergyStack: "CoQ10 ubiquinol 300mg + Resveratrol 250mg + Quercetina 500mg + DHA 2g + Jejum 16h. AMPK e biogênese mitocondrial máximas.",
    tags: ["AMPK", "CoQ10", "Jejum", "Polifenóis", "Mitocôndria", "FOXO3"],
    strategies: [
      { title: "Jejum intermitente 16:8 ou 18:6", detail: "AMPK é ativada em estado de baixo ATP e baixa insulina — exatamente o jejum. MOTS-c potencializa essa ativação. JI cria o ambiente hormonal ideal para o peptídeo agir com máxima eficiência." },
      { title: "Polifenóis: Resveratrol + Quercetina + EGCG diários", detail: "Todos ativam SIRT1 e AMPK por vias complementares ao MOTS-c. Resveratrol 250mg + Quercetina 500mg + EGCG 400mg = amplificação da biogênese mitocondrial por 4 vias simultâneas." },
      { title: "CoQ10 ubiquinol 200–400mg/dia", detail: "Cofator direto da cadeia transportadora de elétrons (complexo I, II, III). MOTS-c melhora eficiência mitocondrial — CoQ10 garante que a maquinaria tem o cofator necessário para essa eficiência maior funcionar." },
      { title: "DHA 2g/dia (membrana mitocondrial)", detail: "DHA é incorporado à cardiolipina na membrana mitocondrial interna. Cardiolipina saudável é estruturalmente necessária para o complexo respiratório funcionar com a eficiência que o MOTS-c promove." },
      { title: "Exercício aeróbico em jejum (gatilho AMPK triplo)", detail: "AMPK é mais ativada quando há demanda energética real. Aplicar MOTS-c 30min antes de aeróbico em jejum = triplo estímulo AMPK: jejum + exercício + peptídeo. Efeito sinérgico comprovado." },
      { title: "Eliminar açúcar, álcool e ultraprocessados", detail: "Esses três causam estresse mitocondrial oxidativo e dessensibilização de AMPK — efeito diametralmente oposto ao MOTS-c. Não é possível potencializar a mitocôndria com o peptídeo e destruí-la simultaneamente." }
    ]
  },

  "epithalon": {
    mechanismSummary: "Ativa telomerase (hTERT), protege telômeros, regula eixo pineal e melatonina. Anti-envelhecimento epigenético documentado desde os anos 1980.",
    macros: { cho: "38–42%", ptn: "22–28%", lip: "30–36%" },
    timing: "Aplicar antes de dormir. Jantar leve finalizado ≥ 3h antes. Escuridão total (melatonina máxima). Ciclo clássico: 10 dias, 2x/ano.",
    warning: "Telomerase pode ser problemática em células com mutações oncogênicas. Não usar com histórico de câncer sem supervisão médica especializada.",
    synergyStack: "Astaxantina 12mg + NMN 500mg + Resveratrol 250mg + Vitamina D3 8000UI + Melatonina 0.5mg. Proteção telomérica máxima.",
    tags: ["Telomerase", "Melatonina", "Epigenética", "NRF2", "Anti-aging"],
    strategies: [
      { title: "Antioxidantes específicos para DNA: Astaxantina + Selênio", detail: "Telômeros são as regiões mais vulneráveis ao estresse oxidativo. Astaxantina 12mg (antioxidante mais potente conhecido, 6000x a vitamina C), Selênio 200mcg e tocotrienóis protegem o DNA telomérico." },
      { title: "Padrão mediterrâneo como base absoluta", detail: "Meta-análises associam padrão mediterrâneo a telômeros biologicamente 4–9 anos mais longos. Azeite extra-virgem, peixes azuis, vegetais coloridos, oleaginosas. Epithalon potencializa o que a dieta inicia." },
      { title: "Jejum noturno ≥ 13h + escuridão total", detail: "Melatonina, produzida na glândula pineal no escuro e em jejum, é o cofator endógeno da ação epigenética do epithalon. Terminar jantar 3–4h antes de dormir e ambiente escuro total maximiza a produção." },
      { title: "Eliminar AGEs completamente", detail: "Produtos de glicação avançada (carne carbonizada, frituras, açúcar + proteína aquecidos) aceleram encurtamento telomérico diretamente. Epithalon está tentando preservar o que os AGEs destroem ativamente." },
      { title: "Vitamina D3 8.000UI + K2 MK-7 + Magnésio L-treonato", detail: "Vitamina D regula mais de 1.200 genes, vários relacionados à integridade genômica. Magnésio L-treonato atravessa a barreira hemato-encefálica e suporta a ação do epithalon no SNC." },
      { title: "Curcumina + Piperina (ativação NRF2)", detail: "NRF2 é o mestre regulador antioxidante celular. Curcumina ativa NRF2 protegendo telômeros por via independente da telomerase. Dupla proteção: epithalon via telomerase, curcumina via NRF2." }
    ]
  },

  "semax": {
    mechanismSummary: "Heptapeptídeo derivado da ACTH. Eleva BDNF, melhora memória, foco, neuroplasticidade e tem ação neuroprotetora.",
    macros: { cho: "30–38%", ptn: "30–35%", lip: "28–35%" },
    timing: "Intranasal pela manhã, em jejum ou low-carb. Alpha-GPC + Magnésio com primeira refeição. DHA à noite. Ciclo: 2 semanas ON, 2 semanas OFF.",
    warning: "Pode aumentar ansiedade em doses altas. Monitorar pressão arterial — efeito vasomotor via ACTH. Não usar com estimulantes em excesso.",
    synergyStack: "Alpha-GPC 600mg + Magnésio L-treonato 2g + DHA 2g + Cacau 85% 30g pela manhã. BDNF e neuroplasticidade maximizados.",
    tags: ["BDNF", "Alpha-GPC", "Neuroplasticidade", "Colina", "Nootrópico"],
    strategies: [
      { title: "Alpha-GPC 600mg ou CDP-Colina 500mg/dia", detail: "Semax eleva BDNF colinérgico — BDNF dos neurônios colinérgicos do prosencéfalo basal. Sem substrato de colina suficiente, o aumento de BDNF não se traduz em melhora funcional de memória e foco." },
      { title: "DHA 2–3g/dia (substrato neuronal)", detail: "DHA é 40% dos fosfolipídeos cerebrais. Semax eleva BDNF — BDNF requer membranas neuronais saudáveis para sinalizar eficientemente. DHA é o substrato estrutural dessa sinalização aumentada." },
      { title: "Magnésio L-treonato 2g/dia", detail: "Atravessa a barreira hemato-encefálica e aumenta densidade sináptica. Sinergia direta com BDNF elevado pelo semax: mais BDNF + mais sinapses = neuroplasticidade amplificada de forma sinérgica." },
      { title: "Corpos cetônicos (jejum ou low-carb matinal)", detail: "BHB (β-hidroxibutirato) é combustível cerebral mais eficiente que glicose e eleva BDNF por inibição de HDACs. Semax em estado cetogênico leve tem efeito cognitivo potencializado." },
      { title: "Cacau 85%+ 30g pela manhã", detail: "Flavonóides do cacau (epicatequina, teobromina) aumentam fluxo sanguíneo cerebral e BDNF independentemente. Cacau amargo antes da dose de semax = duplo estímulo BDNF por vias distintas." },
      { title: "Tirosina + Fenilalanina", detail: "Precursores de dopamina e noradrenalina. Semax tem efeito dopaminérgico e catecolaminérgico. Garantir substrato para síntese das catecolaminas que o semax mobiliza e utiliza." }
    ]
  },

  "selank": {
    mechanismSummary: "Derivado da tuftosina. Ansiolítico sem sedação, aumenta GABA endógeno, modula eixo HPA (cortisol) e melhora resiliência ao estresse crônico.",
    macros: { cho: "42–48%", ptn: "25–30%", lip: "25–30%" },
    timing: "Intranasal matinal. Magnésio + Teanina no período vespertino. Triptofano + P5P à noite. Evitar cafeína após 14h nos dias de dose.",
    warning: "Não combinar com benzodiazepínicos ou álcool — potencialização do efeito sedativo. Descontinuação gradual após uso prolongado.",
    synergyStack: "Magnésio glicinato 400mg + L-Teanina 200mg + Ashwagandha KSM-66 600mg + Taurina 2g + Triptofano 500mg (noite). Regulação HPA máxima.",
    tags: ["GABA", "Ansiolítico", "HPA", "Ashwagandha", "Teanina"],
    strategies: [
      { title: "Triptofano 500mg + B6 P5P à noite", detail: "Triptofano é precursor de serotonina e melatonina. Selank modula eixo HPA — serotonina basal elevada amplifica a estabilidade emocional. P5P é cofator obrigatório da conversão triptofano → serotonina (sem ele a conversão é mínima)." },
      { title: "L-Teanina 200mg + Magnésio glicinato 400mg", detail: "Ambos são GABA-érgicos naturais que potencializam o efeito ansiolítico do selank. Teanina atravessa a BHE e eleva GABA e dopamina. Magnésio bloqueia receptor NMDA (associado ao estresse agudo)." },
      { title: "Ashwagandha KSM-66 600mg/dia", detail: "Witanolídeos inibem cortisol via HIOMT e modulam receptores GABA-A. Sinergia direta com selank para regulação do eixo HPA: adaptogênico + ansiolítico peptídico = controle de cortisol duplo." },
      { title: "Taurina 2–3g/dia", detail: "Agonista de receptores GABA-A e modulador de glicina. Selank eleva GABA endógeno — taurina amplifica essa sinalização inibitória. Efeito ansiolítico aditivo sem sedação." },
      { title: "Limitar cafeína: máximo 1 dose antes das 12h", detail: "Cafeína bloqueia adenosina e eleva cortisol — efeito antagonista ao selank. Consumo excessivo ou tardio de cafeína pode nulificar o efeito de regulação do HPA pelo peptídeo." },
      { title: "Dieta anti-inflamatória: minimizar glúten e laticínios", detail: "Inflamação intestinal eleva cortisol via eixo gut-brain-HPA. Sensibilidades alimentares não tratadas mantêm o eixo HPA cronicamente ativado, reduzindo o espaço que o selank tem para agir." }
    ]
  },

  "aod-9604": {
    mechanismSummary: "Fragmento C-terminal do GH (aa 176–191). Ação lipolítica específica via receptor β-3 adrenérgico sem efeitos diabetogênicos ou de crescimento.",
    macros: { cho: "25–35%", ptn: "40–45%", lip: "22–28%" },
    timing: "Dose em jejum matinal 30–60min antes do aeróbico. L-Carnitina + Cafeína pré-treino. Primeira refeição pós-exercício: proteína + CHO moderado.",
    warning: "Zero efeito anabólico — não tem ação de crescimento. Sem treinamento de força combinado, a perda de gordura pode ser acompanhada de perda muscular.",
    synergyStack: "L-Carnitina tartarato 2g + Cafeína 200mg + Sinefrina 25mg + CLA 3g + Yohimbina (opcional). Lipolítico β-adrenérgico máximo.",
    tags: ["β-3 adrenérgico", "Lipólise", "Carnitina", "Jejum", "Sem IGF-1"],
    strategies: [
      { title: "Déficit calórico moderado -400 a -500 kcal", detail: "AOD-9604 acelera lipólise via receptor β-3 adrenérgico no adipócito. O déficit cria o gradiente de mobilização; o peptídeo aumenta a taxa de liberação de AGL. Déficit excessivo + lipólise acelerada = catabolismo muscular inevitável." },
      { title: "L-Carnitina tartarato 2g pré-treino", detail: "Carnitina transporta ácidos graxos para a mitocôndria para β-oxidação. AOD-9604 mobiliza gordura do adipócito — carnitina garante que essa gordura chegue à mitocôndria e seja queimada, não recirculada de volta ao tecido adiposo." },
      { title: "Cafeína 200mg + Sinefrina 25mg (β-agonistas)", detail: "Potencializam o receptor β-3 adrenérgico — o mesmo que o AOD-9604 ativa. Efeito sinérgico na mobilização e oxidação de gordura. Stack lipolítico direto sem os riscos dos β-agonistas puros." },
      { title: "CHO baixo a moderado 25–35%", detail: "Insulina alta inibe lipólise via supressão de HSL (lipase hormônio-sensível). CHO moderado mantém insulina suficientemente baixa para o AOD-9604 agir na lipólise sem interferência insulínica." },
      { title: "Proteína alta 2.2–2.5g/kg (única proteção muscular)", detail: "AOD-9604 não afeta IGF-1 — zero proteção anabólica, diferente do GH completo. Proteína alta é o único protetor de massa magra durante a lipólise acelerada que o fragmento induz." },
      { title: "Aplicar em jejum matinal + aeróbico imediato", detail: "Lipólise em jejum (insulina baixa) + AOD-9604 + exercício aeróbico = triple fat-burning state. Exercício aumenta o clearance dos AGL mobilizados pela oxidação mitocondrial muscular." }
    ]
  },

  "ghk-cu": {
    mechanismSummary: "Tripeptídeo Gly-His-Lys com cobre. Ativa mais de 4.000 genes de reparo. Estimula colágeno, elastina, angiogênese e tem ação antioxidante potente.",
    macros: { cho: "40–45%", ptn: "28–32%", lip: "25–30%" },
    timing: "Vitamina C + Colágeno pela manhã. Cobre alimentar (ostras) 2x/semana. Silício + Biotina com almoço. Astaxantina com refeição gordurosa.",
    warning: "Não suplementar cobre isolado em altas doses — hepatotoxicidade. Obter via alimentos (ostras, fígado). Zinco >50mg/dia antagoniza absorção de cobre.",
    synergyStack: "Colágeno 15g + Vitamina C 1g + Silício orgânico 10mg + Biotina 5mg + Ostras 2x/semana + Astaxantina 12mg. Matrix extracelular completa.",
    tags: ["Colágeno", "Cobre", "4000 genes", "Elastina", "Antioxidante"],
    strategies: [
      { title: "Ostras, fígado e castanha-do-pará (cobre alimentar)", detail: "GHK-Cu requer cobre como cofator estrutural do próprio peptídeo. Deficiência de cobre dietético limita a formação do complexo peptídeo-cobre in vivo. Ostras são a fonte mais biodisponível (4–5mg/porção)." },
      { title: "Vitamina C 1g/dia (cofator colágeno)", detail: "GHK-Cu estimula colágeno tipos I, III e IV. Vitamina C é cofator obrigatório da prolil e lisil-hidroxilase. Sem ela, o colágeno estimulado pelo GHK-Cu não matura — ficam cadeias de procolágeno não funcionais." },
      { title: "Zinco ≤ 30mg/dia (não em excesso)", detail: "Zinco e cobre competem pela absorção via transportador DMT1 intestinal. Suplementação excessiva de zinco (>50mg) depleta o cobre necessário para o GHK-Cu funcionar. Manter equilíbrio Cu:Zn." },
      { title: "Silício orgânico 10mg + Biotina 5mg", detail: "Silício e biotina são cofatores de elastina e proteoglicanas — estruturas que GHK-Cu também estimula. Stack completo de matrix extracelular: peptídeo + cofatores estruturais." },
      { title: "Glicina 5g/dia (substrato fibroblasto)", detail: "GHK-Cu ativa fibroblastos intensamente. Fibroblastos precisam de glicina, prolina e lisina para produzir colágeno. Sem substrato aminoacídico adequado, o fibroblasto ativado não tem material para trabalhar." },
      { title: "Astaxantina 12mg + Tocotrienóis", detail: "GHK-Cu ativa SOD (superóxido dismutase). Potencializar com antioxidantes lipofílicos que protegem membranas celulares onde os fibroblastos estão trabalhando e os novos vasos estão sendo formados." }
    ]
  }
};
