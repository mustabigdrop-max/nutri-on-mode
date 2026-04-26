// NUTRION — Banco de Substituições Alimentares v2.0
// Banco expandido com variedade real por refeição

export type FoodCategory =
  | "ave"
  | "carne vermelha"
  | "porco"
  | "peixe"
  | "frutos do mar"
  | "laticínios"
  | "shake"
  | "fruta"
  | "legume"
  | "vegetal";

export interface Substitute {
  name: string;
  portion: string;
  category: FoodCategory;
  note: string;
}

export interface MainFood {
  name: string;
  note?: string;
  substitutes: Substitute[];
}

export interface MealBlock {
  id: string;
  time: string;
  label: string;
  kcal: number;
  protocol?: string;
  mains: MainFood[];
}

export const SUBSTITUTION_BANK: MealBlock[] = [
  {
    id: "r1",
    time: "06:00",
    label: "Café da Manhã",
    kcal: 850,
    mains: [
      {
        name: "Ovo Cozido (4 unidades ~200g)",
        note: "proteína completa, colina, comer com gema",
        substitutes: [
          { name: "Omelete de ovo inteiro", portion: "4 ovos na frigideira", category: "ave", note: "Adicionar ervas finas ou queijo para variar sabor" },
          { name: "Ovo mexido com leite", portion: "4 ovos + 50ml leite", category: "laticínios", note: "O leite torna a textura cremosa e adiciona cálcio" },
          { name: "Shake de ovos + whey + leite", portion: "3 ovos + 1 scoop whey + 200ml leite", category: "shake", note: "Bater no liquidificador — opção rápida de alto valor proteico" },
          { name: "Queijo cottage", portion: "200g + 2 ovos cozidos", category: "laticínios", note: "Combina caseína de digestão lenta com proteína completa do ovo" },
          { name: "Atum em água", portion: "1 lata grande (~120g)", category: "peixe", note: "Completar com azeite e limão — alto teor de proteína magra" },
          { name: "Claras pasteurizadas líquidas", portion: "8 col de sopa (~240g)", category: "ave", note: "Prático, sem risco, misturar com 1 ovo inteiro para sabor" },
          { name: "Frango desfiado com azeite", portion: "1 filé grande (~150g)", category: "ave", note: "Sobra do dia anterior — completar com fruta ou tapioca" },
        ],
      },
      {
        name: "Aveia em Flakes com Leite Integral (80g + 200ml)",
        note: "prebiótico, fermentado diário, gordura do leite retarda IG",
        substitutes: [
          { name: "Mingau de banana com aveia", portion: "80g aveia + 1 banana + 200ml leite", category: "fruta", note: "Banana substitui o adoçante, potássio extra" },
          { name: "Overnight oats com iogurte e frutas vermelhas", portion: "60g aveia + 150g iogurte grego + 100g mirtilo/morango", category: "laticínios", note: "Preparar na noite anterior — antioxidantes das frutas vermelhas" },
          { name: "Shake de aveia + whey + banana", portion: "40g aveia + 1 scoop whey + 1 banana + 200ml leite", category: "shake", note: "Carbo de liberação mista ideal para manhã" },
          { name: "Tapioca com queijo branco e mamão", portion: "2 tapiocas médias + 50g queijo branco + 150g mamão", category: "fruta", note: "Variação nordestina — mamão facilita digestão das proteínas" },
          { name: "Cuscuz nordestino com leite e ovo", portion: "100g cuscuz preparado + 200ml leite + 1 ovo", category: "laticínios", note: "Refeição brasileira — alto IG compensado pela proteína do ovo" },
          { name: "Pão de queijo caseiro com iogurte", portion: "3 pães de queijo + 150g iogurte", category: "laticínios", note: "Polvilho tem amido resistente — combinar com iogurte para equilibrar" },
          { name: "Açaí sem açúcar com granola e banana", portion: "200ml açaí + 40g granola + 1 banana", category: "fruta", note: "Versão sem xarope — açaí tem gordura boa e antioxidantes" },
        ],
      },
      {
        name: "Amendoim Torrado sem Sal (1 punhado ~30g)",
        note: "gordura boa e proteína vegetal",
        substitutes: [
          { name: "Pasta de amendoim integral", portion: "1 col sopa cheia (~30g)", category: "legume", note: "Verificar rótulo — deve ter apenas amendoim" },
          { name: "Castanha-do-pará", portion: "4 unidades (~20g)", category: "legume", note: "Rica em selênio — não ultrapassar 4 unidades por dia" },
          { name: "Amêndoas cruas", portion: "1 punhado (~25g)", category: "legume", note: "Vitamina E e magnésio — deixar de molho 8h melhora absorção" },
          { name: "Abacate", portion: "1/4 unidade média (~80g)", category: "fruta", note: "Gordura monoinsaturada — combinar com ovo para refeição completa" },
          { name: "Nozes", portion: "4 metades (~20g)", category: "legume", note: "Ômega-3 vegetal, anti-inflamatório" },
        ],
      },
      {
        name: "Banana Madura (1 unidade média ~100g)",
        note: "carboidrato, potássio, prebiótica",
        substitutes: [
          { name: "Mamão papaia", portion: "1 fatia grande (~200g)", category: "fruta", note: "Papaína melhora digestão de proteínas — ideal pela manhã" },
          { name: "Manga palmer", portion: "1/2 unidade (~150g)", category: "fruta", note: "Vitamina A, C e beta-caroteno — carbo de médio IG" },
          { name: "Maracujá com mel", portion: "2 maracujás + 1 col chá mel", category: "fruta", note: "Fibras e passiflorina — efeito calmante útil se ansioso pré-treino" },
          { name: "Uva sem semente", portion: "1 cacho pequeno (~120g)", category: "fruta", note: "Resveratrol e rápida liberação de energia" },
          { name: "Abacaxi", portion: "2 rodelas (~150g)", category: "fruta", note: "Bromelina anti-inflamatória — auxilia digestão de proteínas" },
          { name: "Laranja bahia", portion: "1 unidade grande (~180g)", category: "fruta", note: "Vitamina C melhora absorção de ferro não-heme" },
          { name: "Pera", portion: "1 unidade média (~150g)", category: "fruta", note: "Baixo IG, rica em fibras solúveis" },
          { name: "Maçã verde", portion: "1 unidade (~130g)", category: "fruta", note: "Pectina prebiótica — IG mais baixo que banana" },
          { name: "Mirtilo ou morango", portion: "1 xícara (~120g)", category: "fruta", note: "Altíssimo teor de antioxidantes — baixo IG" },
        ],
      },
    ],
  },
  {
    id: "r2",
    time: "10:00",
    label: "Lanche da Manhã",
    kcal: 650,
    mains: [
      {
        name: "Frango Cozido Desfiado (1 filé ~150g)",
        note: "rico em vitaminas do complexo B",
        substitutes: [
          { name: "Peito de peru fatiado", portion: "5 fatias (~150g)", category: "ave", note: "Sem adicionados — verificar sódio no rótulo" },
          { name: "Lombo de porco cozido desfiado", portion: "1 filé (~150g)", category: "porco", note: "Cozinhar na pressão com alho e louro — proteína completa e saborosa" },
          { name: "Atum em água", portion: "1 lata grande (~150g)", category: "peixe", note: "Misturar com azeite e limão para melhorar sabor e absorção" },
          { name: "Salmão cozido desfiado", portion: "1 filé médio (~120g)", category: "peixe", note: "Ômega-3 EPA+DHA — cozinhar no vapor para preservar nutrientes" },
          { name: "Tilápia grelhada", portion: "1 filé grande (~150g)", category: "peixe", note: "Peixe magro, econômico e de sabor neutro" },
          { name: "Camarão cozido", portion: "1 concha média (~150g)", category: "frutos do mar", note: "Alto teor de proteína e zinco — cozinhar no alho e azeite" },
          { name: "Patinho moído refogado", portion: "1 porção (~150g)", category: "carne vermelha", note: "Corte magro — refogar com tomate e alho" },
          { name: "Bacalhau dessalgado cozido", portion: "1 porção (~130g)", category: "peixe", note: "Dessalgar 24h trocando água — rico em ômega-3 e vitamina D" },
          { name: "Lula grelhada", portion: "150g", category: "frutos do mar", note: "Proteína magra de alto valor biológico" },
          { name: "Shake proteico completo", portion: "2 scoops whey + 300ml leite + 40g aveia", category: "shake", note: "Opção rápida — whey + aveia = proteína + carbo de qualidade" },
          { name: "Frango ao molho de iogurte", portion: "150g frango + 100g iogurte natural", category: "laticínios", note: "Marinar o frango no iogurte deixa mais macio" },
        ],
      },
      {
        name: "Batata Inglesa Cozida (1½ xícara ~200g)",
        substitutes: [
          { name: "Batata-doce cozida", portion: "200g", category: "legume", note: "Beta-caroteno e fibras — IG médio, mais nutritiva" },
          { name: "Mandioca cozida", portion: "200g", category: "legume", note: "Típica brasileira — amido resistente, prebiótica" },
          { name: "Inhame cozido", portion: "200g", category: "legume", note: "Diosgenina anti-inflamatória — excelente para protocolos hormonais" },
          { name: "Cará cozido", portion: "200g", category: "legume", note: "Similar ao inhame — bom para diversificar" },
          { name: "Macarrão integral cozido", portion: "200g", category: "legume", note: "IG médio, fibras — combinar com azeite" },
          { name: "Arroz integral cozido", portion: "2 xícaras (~240g)", category: "legume", note: "Mais fibras e vitaminas B que o branco" },
          { name: "Banana-da-terra cozida", portion: "1 unidade média", category: "fruta", note: "Amido resistente quando verde — carboidrato de qualidade" },
          { name: "Aipim na airfryer", portion: "200g", category: "legume", note: "Alternativa saborosa sem óleo em excesso" },
        ],
      },
      {
        name: "Iogurte Natural Integral (1 copo ~200g)",
        substitutes: [
          { name: "Iogurte grego integral", portion: "150g", category: "laticínios", note: "Mais proteína e menos carbo que o comum — cremoso" },
          { name: "Queijo cottage", portion: "1 pote (~200g)", category: "laticínios", note: "Caseína e soro do leite — perfeito para refeições intermediárias" },
          { name: "Leite fermentado integral", portion: "1 garrafa (~200ml)", category: "laticínios", note: "Lactobacilos vivos — mais prático que iogurte" },
          { name: "Ricota cremosa", portion: "150g", category: "laticínios", note: "Mais macia — misturar com ervas para adicionar sabor" },
          { name: "Kefir integral", portion: "1 copo (200ml)", category: "laticínios", note: "Maior diversidade de probióticos que iogurte convencional" },
          { name: "Shake de whey com leite", portion: "1 scoop + 200ml leite integral", category: "shake", note: "Quando não tiver iogurte — adicionar canela" },
          { name: "Coalhada seca (labaneh)", portion: "100g", category: "laticínios", note: "Alta proteína, levemente azeda — usar com azeite e zaatar" },
        ],
      },
    ],
  },
  {
    id: "r3",
    time: "12:00",
    label: "Pré-Treino Sólido",
    kcal: 900,
    protocol: "Refeição pré-treino — energia sustentada",
    mains: [
      {
        name: "Peito de Frango Grelhado (1½ filé grande)",
        substitutes: [
          { name: "Filé de merluza grelhado", portion: "1 filé grande (~200g)", category: "peixe", note: "Peixe magro e econômico — grelhar com limão e alho" },
          { name: "Filé de tilápia grelhado", portion: "1 filé grande (~200g)", category: "peixe", note: "Peito de frango do mar — sabor neutro, fácil preparo" },
          { name: "Patinho grelhado", portion: "1 filé (~180g)", category: "carne vermelha", note: "Corte magro bovino — creatina natural, ferro heme" },
          { name: "Alcatra grelhada", portion: "1 filé (~150g)", category: "carne vermelha", note: "Mais saborosa que patinho, menos gordura que picanha" },
          { name: "Lombo de porco grelhado", portion: "1 filé (~180g)", category: "porco", note: "Vitamina B1 em alta quantidade — sabor intenso" },
          { name: "Costela de porco magra cozida", portion: "2 ossos (~200g)", category: "porco", note: "Colágeno natural — cozinhar na pressão por 40min" },
          { name: "Atum selado na frigideira", portion: "1 filé (~200g)", category: "peixe", note: "Ômega-3, proteína completa — grelhar 2 min cada lado" },
          { name: "Bacalhau cozido desfiado", portion: "1 porção (~150g)", category: "peixe", note: "Dessalgar 24h — vitamina D e ômega-3" },
          { name: "Camarão grelhado", portion: "150g", category: "frutos do mar", note: "Zinco, selênio e proteína magra — alho e manteiga" },
          { name: "Lula grelhada", portion: "1 porção (~200g)", category: "frutos do mar", note: "Proteína magra — marinar antes para abrir sabor" },
          { name: "Salmão grelhado", portion: "1 filé médio (~180g)", category: "peixe", note: "Ômega-3 + DHA para função cognitiva — melhor peixe pré-treino" },
          { name: "Frango assado coxa+sobrecoxa", portion: "1 porção (~200g)", category: "ave", note: "Mais saboroso — remover pele para reduzir gordura saturada" },
        ],
      },
      {
        name: "Arroz Branco Cozido (2 xícaras ~300g)",
        substitutes: [
          { name: "Batata-doce cozida", portion: "300g", category: "legume", note: "IG médio — boa opção pré-treino para energia sustentada" },
          { name: "Macarrão integral cozido", portion: "300g", category: "legume", note: "Fibras retardam digestão — bom para treino de longa duração" },
          { name: "Mandioca cozida", portion: "300g", category: "legume", note: "Amido resistente — calórico e sacietogênico" },
          { name: "Quinoa cozida", portion: "200g", category: "legume", note: "Proteína completa + carbo — todos aminoácidos essenciais" },
          { name: "Arroz integral cozido", portion: "300g", category: "legume", note: "Mais fibras e vitaminas B que o branco" },
          { name: "Cuscuz nordestino", portion: "150g seco preparado", category: "legume", note: "Milho típico brasileiro — alto IG, bom pré-treino intenso" },
          { name: "Batata Asterix cozida", portion: "300g", category: "legume", note: "Batata roxa tem mais antocianinas que a comum" },
        ],
      },
      {
        name: "Brócolis Cozido (1 xícara ~150g)",
        substitutes: [
          { name: "Couve-flor no vapor", portion: "150g", category: "vegetal", note: "Crucífera — sulforafano e indol-3-carbinol" },
          { name: "Abobrinha refogada", portion: "150g", category: "vegetal", note: "Leve e de fácil digestão — bom pré-treino" },
          { name: "Chuchu cozido", portion: "200g", category: "vegetal", note: "Baixo calórico, hidratante — bom para volume de prato" },
          { name: "Couve refogada", portion: "2 col sopa (~80g)", category: "vegetal", note: "Crucífera — vitamina K, C e ferro" },
          { name: "Aspargos no vapor", portion: "150g", category: "vegetal", note: "Prebiótico — asparagina diurética, bom para circulação" },
          { name: "Vagem cozida", portion: "150g", category: "vegetal", note: "Fibras e magnésio — levemente proteica" },
          { name: "Repolho refogado com azeite", portion: "200g", category: "vegetal", note: "Crucífera econômica — glutamina natural para mucosa intestinal" },
          { name: "Pepino com limão e sal", portion: "1 unidade (~200g)", category: "vegetal", note: "Hidratante, levíssimo — silício para articulações" },
        ],
      },
    ],
  },
  {
    id: "r4",
    time: "14:45",
    label: "Pós-Treino Imediato",
    kcal: 180,
    protocol: "Janela anabólica — Spike glicêmico rápido — ZERO gordura — ZERO fibra",
    mains: [
      {
        name: "Leite Condensado Desnatado (45g)",
        substitutes: [
          { name: "Whey isolado + dextrose", portion: "1 scoop + 30g dextrose + 200ml água", category: "shake", note: "Combinação clássica — proteína + carbo de alto IG simultâneos" },
          { name: "Whey concentrado + banana", portion: "1 scoop + 1 banana + 200ml leite desnatado", category: "shake", note: "Versão natural do spike — banana substitui a dextrose" },
          { name: "Mel + suco de laranja", portion: "2 col sopa mel + 200ml suco natural", category: "fruta", note: "Frutose + glicose naturais — repõe vitamina C" },
          { name: "Isotônico natural", portion: "300ml água de coco + 1 banana pequena", category: "fruta", note: "Eletrólitos + carbo — hidratação e reposição" },
          { name: "Shake de chocolate com leite desnatado", portion: "1 scoop whey chocolate + 200ml leite desnatado", category: "shake", note: "Leite desnatado tem carbo sem gordura" },
          { name: "Arroz branco + mel", portion: "1 xícara arroz cozido + 1 col sopa mel", category: "legume", note: "Alternativa sólida — alto IG, zero gordura" },
          { name: "Tapioca com mel", portion: "2 tapiocas pequenas + 1 col sopa mel", category: "legume", note: "Polvilho azedo de alto IG — mel amplifica o pico glicêmico" },
          { name: "Banana madura amassada", portion: "2 unidades pequenas (~150g)", category: "fruta", note: "Frutose + glicose + potássio — spike natural eficiente" },
          { name: "Mel puro", portion: "3 col sopa (~60g)", category: "fruta", note: "Glicose + frutose de absorção imediata" },
          { name: "Tâmaras sem caroço", portion: "4 unidades (~60g)", category: "fruta", note: "Glicose de altíssimo IG — prático, sem preparo" },
          { name: "Suco de uva integral", portion: "200ml", category: "fruta", note: "Frutose + glicose + resveratrol — alto IG, zero gordura" },
          { name: "Batata inglesa cozida amassada", portion: "200g sem pele", category: "legume", note: "Alto IG sem fibra da casca — sólido e econômico" },
          { name: "Cuscuz nordestino simples", portion: "100g preparado", category: "legume", note: "Milho de alto IG — sem azeite, sem queijo, carbo puro" },
          { name: "Banana-passa", portion: "40g (~6 unidades)", category: "fruta", note: "Açúcar concentrado de rápida absorção — prático" },
          { name: "Suco de manga natural", portion: "200ml sem adição de água", category: "fruta", note: "Frutose densa, vitamina A — spike natural" },
        ],
      },
    ],
  },
  {
    id: "r5",
    time: "16:00",
    label: "Pós-Treino Sólido",
    kcal: 1050,
    mains: [
      {
        name: "Músculo Bovino Cozido (2 filés ~200g)",
        note: "colágeno tipo 1, glucosamina natural — pressão 40min",
        substitutes: [
          { name: "Coxão mole cozido", portion: "200g", category: "carne vermelha", note: "Corte magro e macio — rico em colágeno também" },
          { name: "Acém desfiado na pressão", portion: "200g", category: "carne vermelha", note: "Econômico e proteico — desfia facilmente após cozimento" },
          { name: "Fraldinha grelhada", portion: "180g", category: "carne vermelha", note: "Fibras longas, saborosa — mais proteína muscular" },
          { name: "Salmão grelhado", portion: "1 filé (~200g)", category: "peixe", note: "Ômega-3 + proteína completa — ideal pelo DHA" },
          { name: "Atum fresco selado", portion: "1 filé (~200g)", category: "peixe", note: "Proteína magra e ômega-3 — selar 2 min cada lado" },
          { name: "Bacalhau ao forno", portion: "180g dessalgado", category: "peixe", note: "Dessalgar 24h — ômega-3 e vitamina D para recuperação" },
          { name: "Polvo cozido", portion: "200g", category: "frutos do mar", note: "Proteína densa, taurina — pressão por 20min" },
          { name: "Mariscos cozidos", portion: "200g", category: "frutos do mar", note: "Zinco e ferro altíssimos — recuperação hormonal" },
          { name: "Pernil de porco cozido", portion: "200g", category: "porco", note: "Proteína completa, vitamina B1 — remover excesso de gordura" },
          { name: "Linguiça toscana magra grelhada", portion: "2 unidades (~150g)", category: "porco", note: "Verificar sódio — grelhar para reduzir gordura" },
          { name: "Shake hipercalórico", portion: "2 scoops whey + 100g aveia + 2 bananas + 200ml leite", category: "shake", note: "Sem tempo de cozinhar — 700-800 kcal em um shake" },
          { name: "Ovos mexidos com queijo", portion: "4 ovos + 50g queijo muçarela", category: "laticínios", note: "Rápido e nutritivo — adicionar tomate para antioxidantes" },
        ],
      },
      {
        name: "Feijão Preto Cozido (2 conchas ~200g)",
        substitutes: [
          { name: "Feijão carioca cozido", portion: "2 conchas (~200g)", category: "legume", note: "O feijão mais brasileiro — perfil similar ao preto" },
          { name: "Lentilha cozida", portion: "1 concha cheia (~150g)", category: "legume", note: "Mais proteína que feijão — ferro e ácido fólico" },
          { name: "Grão-de-bico cozido", portion: "1 concha cheia (~150g)", category: "legume", note: "Proteína vegetal completa quando combinado com arroz" },
          { name: "Feijão-fradinho cozido", portion: "2 conchas (~200g)", category: "legume", note: "Base do acarajé — proteína vegetal e fibras" },
          { name: "Ervilha cozida", portion: "2 conchas (~200g)", category: "legume", note: "Mais doce — vitamina K e manganês" },
        ],
      },
      {
        name: "Abacate (½ unidade ~80g)",
        substitutes: [
          { name: "Azeite de oliva extra virgem", portion: "2 col sopa (~20g)", category: "vegetal", note: "Oleocanthal anti-inflamatório — usar sobre a refeição pronta" },
          { name: "Pasta de amendoim integral", portion: "1 col sopa cheia (~30g)", category: "legume", note: "Gordura boa + magnésio — misturar com arroz ou batata" },
          { name: "Castanha-do-pará", portion: "4 unidades (~20g)", category: "legume", note: "Selênio para conversão de T4 em T3 — máx 4 unidades" },
          { name: "Amêndoas", portion: "1 punhado (~25g)", category: "legume", note: "Vitamina E antioxidante — magnésio para síntese proteica" },
        ],
      },
    ],
  },
  {
    id: "r6",
    time: "20:00",
    label: "Jantar",
    kcal: 1050,
    mains: [
      {
        name: "Sardinha em Lata em Água (2 latas ~200g)",
        note: "ômega-3 EPA+DHA, cálcio e vitamina D",
        substitutes: [
          { name: "Salmão grelhado", portion: "1 filé (~200g)", category: "peixe", note: "Maior concentração de ômega-3 — DHA para recuperação neural" },
          { name: "Cavalinha grelhada", portion: "1 filé (~200g)", category: "peixe", note: "Muito rica em ômega-3, barata e acessível" },
          { name: "Atum em azeite", portion: "1 lata grande (~180g)", category: "peixe", note: "O azeite ajuda na absorção de vitaminas lipossolúveis" },
          { name: "Tilápia ao forno", portion: "1 filé grande (~200g)", category: "peixe", note: "Magra e de sabor neutro — marinar com limão e ervas" },
          { name: "Filé de merluza grelhado", portion: "1 filé grande (~200g)", category: "peixe", note: "Proteína magra, fácil preparo" },
          { name: "Polvo refogado com alho e azeite", portion: "200g cozido", category: "frutos do mar", note: "Taurina, zinco e proteína densa" },
          { name: "Camarão refogado ao alho e óleo", portion: "200g", category: "frutos do mar", note: "Zinco, selênio e proteína magra" },
          { name: "Mariscos no vapor", portion: "200g", category: "frutos do mar", note: "Fonte excepcional de zinco e ferro" },
          { name: "Costelinha de porco ao forno", portion: "200g", category: "porco", note: "Colágeno + proteína — marinar com laranja e ervas" },
          { name: "Picanha bovina grelhada", portion: "180g", category: "carne vermelha", note: "Ferro heme e creatina — cortar gordura da borda" },
          { name: "Shake de caseína + frutas", portion: "2 scoops caseína + 300ml leite + 150g mamão", category: "shake", note: "Caseína é proteína de digestão lenta para noite" },
          { name: "Frango assado inteiro", portion: "1 porção grande (~220g)", category: "ave", note: "Coxa + sobrecoxa têm mais sabor" },
        ],
      },
      {
        name: "Espinafre Refogado (1 prato ~200g)",
        note: "ferro, vitamina K e folato — consumir com limão",
        substitutes: [
          { name: "Couve refogada no alho", portion: "200g", category: "vegetal", note: "Crucífera com luteína e zeaxantina para saúde ocular" },
          { name: "Acelga refogada", portion: "200g", category: "vegetal", note: "Semelhante ao espinafre — magnésio e potássio" },
          { name: "Rúcula com azeite e limão", portion: "1 prato (~100g)", category: "vegetal", note: "Glucosinolatos e nitratos para vasodilatação" },
          { name: "Alface + tomate", portion: "1 prato grande (~250g)", category: "vegetal", note: "Licopeno do tomate + folato da alface" },
          { name: "Repolho refogado", portion: "200g", category: "vegetal", note: "Glutamina natural — ação anti-ulcerosa, econômico" },
          { name: "Beterraba cozida + salada verde", portion: "100g beterraba + 150g salada", category: "vegetal", note: "Nitratos aumentam vasodilatação e performance" },
          { name: "Abobrinha grelhada com alho", portion: "200g", category: "vegetal", note: "Leve para digestão noturna — vitaminas B" },
        ],
      },
    ],
  },
  {
    id: "r7",
    time: "22:30",
    label: "Ceia",
    kcal: 783,
    protocol: "Refeição pré-sono — proteína de digestão lenta + carbo baixo IG",
    mains: [
      {
        name: "Moela de Frango Cozida e Desfiada (2 unidades ~150g)",
        substitutes: [
          { name: "Peito de frango desfiado com tempero", portion: "1 filé (~150g)", category: "ave", note: "Proteína magra pré-sono — adicionar azeite" },
          { name: "Queijo cottage com azeite", portion: "200g + 1 col azeite", category: "laticínios", note: "Caseína + gordura boa — perfil ideal para noite" },
          { name: "Iogurte grego com mel", portion: "200g + 1 col mel", category: "laticínios", note: "Probióticos + caseína + carbo para estabilizar glicemia noturna" },
          { name: "Shake de caseína noturna", portion: "1,5 scoops caseína + 200ml leite integral", category: "shake", note: "Digestão de 6-8h" },
          { name: "Atum em água com azeite", portion: "1 lata + 1 col azeite", category: "peixe", note: "Ômega-3 + proteína antes do sono" },
          { name: "Sardinha com limão", portion: "1 lata + limão", category: "peixe", note: "Cálcio das espinhas + ômega-3" },
          { name: "Lombo de porco cozido desfiado", portion: "150g", category: "porco", note: "Triptofano do porco auxilia produção de serotonina e sono" },
          { name: "Ovo mexido com queijo branco", portion: "3 ovos + 50g queijo", category: "laticínios", note: "Triptofano do ovo + caseína do queijo — combinação pro sono" },
          { name: "Ricota com azeite e ervas", portion: "150g + 1 col azeite", category: "laticínios", note: "Proteína leve, fácil digestão" },
          { name: "Queijo minas frescal com azeite", portion: "150g + 1 col azeite", category: "laticínios", note: "Proteína do leite de digestão lenta — sem suplemento" },
          { name: "Ovos cozidos com pasta de amendoim", portion: "3 ovos + 30g pasta", category: "laticínios", note: "Triptofano + gordura boa — digestão lenta natural" },
          { name: "Frango desfiado com iogurte grego", portion: "100g frango + 100g iogurte", category: "laticínios", note: "Proteína rápida + lenta combinadas" },
          { name: "Coalhada seca com azeite", portion: "150g + 1 col azeite", category: "laticínios", note: "Proteína concentrada — digestão lenta natural" },
          { name: "Leite integral com ovo mexido", portion: "200ml leite + 2 ovos", category: "laticínios", note: "Caseína + albumina — proteína noturna completa sem pó" },
        ],
      },
      {
        name: "Aveia para Ceia (1 xícara ~80g)",
        substitutes: [
          { name: "Mingau de aveia com leite integral", portion: "80g aveia + 200ml leite", category: "laticínios", note: "Quente acalma e induz sono — adicionar canela" },
          { name: "Granola artesanal sem açúcar", portion: "60g + 150ml leite", category: "laticínios", note: "Verificar rótulo sem mel ou açúcar adicionado" },
          { name: "Tapioca com pasta de amendoim", portion: "2 tapiocas + 30g pasta", category: "legume", note: "Carbo + gordura boa — digestão lenta noturna" },
          { name: "Batata-doce assada com canela", portion: "150g", category: "legume", note: "Canela melhora sensibilidade à insulina" },
          { name: "Banana assada com mel", portion: "1 banana + 1 col mel", category: "fruta", note: "Triptofano da banana + mel — clássico da ceia" },
          { name: "Maçã cozida com canela", portion: "1 unidade (~130g)", category: "fruta", note: "Pectina prebiótica — leve para digestão noturna" },
          { name: "Abacate com mel e cacau", portion: "½ unidade + 1 col mel + 1 col cacau", category: "fruta", note: "Magnésio do cacau para relaxamento muscular" },
        ],
      },
      {
        name: "Leite Integral (1 copo ~200ml)",
        substitutes: [
          { name: "Leite integral com cacau puro", portion: "200ml + 1 col sopa cacau", category: "laticínios", note: "Magnésio do cacau + caseína — duo do sono" },
          { name: "Kefir integral", portion: "200ml", category: "laticínios", note: "Probióticos + caseína — microbioma ativo durante o sono" },
          { name: "Shake de caseína com leite", portion: "1 scoop caseína + 200ml leite", category: "shake", note: "Maior carga de proteína de digestão lenta" },
          { name: "Leite com mel e canela", portion: "200ml + 1 col mel + canela", category: "laticínios", note: "Receita tradicional para sono — repõe glicogênio" },
          { name: "Bebida vegetal de castanha de caju", portion: "200ml", category: "laticínios", note: "Para intolerância à lactose leve" },
        ],
      },
    ],
  },
];

export const CATEGORY_COLORS: Record<FoodCategory, string> = {
  "ave": "bg-amber-500/20 text-amber-300 border-amber-500/40",
  "carne vermelha": "bg-red-500/20 text-red-300 border-red-500/40",
  "porco": "bg-pink-500/20 text-pink-300 border-pink-500/40",
  "peixe": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  "frutos do mar": "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  "laticínios": "bg-yellow-500/20 text-yellow-200 border-yellow-500/40",
  "shake": "bg-purple-500/20 text-purple-300 border-purple-500/40",
  "fruta": "bg-orange-500/20 text-orange-300 border-orange-500/40",
  "legume": "bg-green-500/20 text-green-300 border-green-500/40",
  "vegetal": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

export const CATEGORY_ICONS: Record<FoodCategory, string> = {
  "ave": "🍗",
  "carne vermelha": "🥩",
  "porco": "🥓",
  "peixe": "🐟",
  "frutos do mar": "🦐",
  "laticínios": "🥛",
  "shake": "🥤",
  "fruta": "🍎",
  "legume": "🌾",
  "vegetal": "🥦",
};
