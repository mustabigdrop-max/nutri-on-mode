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

// =====================================================================
// NUTRION — Banco de Substituições v2.0 (expansão aditiva — não altera o banco original acima)
// Estrutura espelhada do JSON v2.0: por refeição, alimento principal e substitutos
// com gramatura, categoria e nota nutricional. Inclui grupo "carboidrato_puro"
// para janela anabólica (R4) quando o atleta não usa shakes.
// =====================================================================

export type FoodCategoryV2 =
  | "peixe"
  | "frutos_do_mar"
  | "carne_vermelha"
  | "ave"
  | "porco"
  | "laticinios"
  | "shake"
  | "fruta"
  | "vegetal"
  | "legume_tuberculo";

export interface SubstituteV2 {
  nome: string;
  medida_caseira: string;
  gramatura_g: number;
  categoria: FoodCategoryV2;
  nota: string;
  grupo?: "carboidrato_puro";
}

export interface MainFoodV2 {
  id: string;
  nome: string;
  medida_caseira: string;
  gramatura_g: number;
  nota_nutricional: string;
  substitutos: SubstituteV2[];
  nota_protocolo_carboidrato_puro?: string;
}

export interface MealBlockV2 {
  id: string;
  horario: string;
  contexto: string;
  kcal_referencia: number;
  macros_referencia: { proteina_g: number; carbo_g: number; gordura_g: number };
  nota_protocolo?: string;
  alimentos: MainFoodV2[];
}

export const SUBSTITUTION_BANK_V2: MealBlockV2[] = [
  {
    id: "R1",
    horario: "06:00",
    contexto: "Café da Manhã",
    kcal_referencia: 850,
    macros_referencia: { proteina_g: 55, carbo_g: 105, gordura_g: 22 },
    alimentos: [
      {
        id: "R1_A1",
        nome: "Ovo Cozido",
        medida_caseira: "4 unidades grandes",
        gramatura_g: 200,
        nota_nutricional: "Excelente fonte de colina e proteína completa. Comer com gema.",
        substitutos: [
          { nome: "Omelete de ovo inteiro", medida_caseira: "4 ovos na frigideira", gramatura_g: 200, categoria: "ave", nota: "Adicionar ervas finas ou queijo para variar sabor" },
          { nome: "Ovo mexido com leite", medida_caseira: "4 ovos + 50ml leite", gramatura_g: 250, categoria: "laticinios", nota: "O leite torna a textura mais cremosa e adiciona cálcio" },
          { nome: "Shake de ovos + whey + leite", medida_caseira: "3 ovos + 1 scoop whey + 200ml leite", gramatura_g: 350, categoria: "shake", nota: "Bater no liquidificador. Opção rápida com alto valor proteico" },
          { nome: "Queijo cottage", medida_caseira: "200g + 2 ovos cozidos", gramatura_g: 300, categoria: "laticinios", nota: "Combina caseína de digestão lenta com proteína completa do ovo" },
          { nome: "Atum em água", medida_caseira: "1 lata grande", gramatura_g: 120, categoria: "peixe", nota: "Completar com azeite e limão. Alto teor de proteína magra" },
          { nome: "Claras pasteurizadas líquidas", medida_caseira: "8 col de sopa", gramatura_g: 240, categoria: "ave", nota: "Prático, sem risco de salmonela, misturar com 1 ovo inteiro para sabor" },
          { nome: "Frango desfiado com azeite", medida_caseira: "1 filé grande", gramatura_g: 150, categoria: "ave", nota: "Sobra do dia anterior. Completar com fruta ou tapioca" },
        ],
      },
      {
        id: "R1_A2",
        nome: "Aveia em Flakes com Leite Integral",
        medida_caseira: "1 xícara chá + 1 copo americano",
        gramatura_g: 280,
        nota_nutricional: "Fermentado diário e prebiótico. A gordura do leite retarda IG.",
        substitutos: [
          { nome: "Mingau de banana com aveia", medida_caseira: "80g aveia + 1 banana amassada + 200ml leite", gramatura_g: 380, categoria: "fruta", nota: "A banana substitui o adoçante. Potássio extra" },
          { nome: "Overnight oats com iogurte e frutas vermelhas", medida_caseira: "60g aveia + 150g iogurte grego + 100g mirtilo ou morango", gramatura_g: 310, categoria: "laticinios", nota: "Preparar na noite anterior. Antioxidantes das frutas vermelhas" },
          { nome: "Shake de aveia + whey + banana", medida_caseira: "40g aveia + 1 scoop whey + 1 banana + 200ml leite", gramatura_g: 440, categoria: "shake", nota: "Bater tudo. Carbo de liberação mista ideal para manhã" },
          { nome: "Tapioca com queijo branco e mamão", medida_caseira: "2 tapiocas médias + 50g queijo branco + 150g mamão", gramatura_g: 300, categoria: "fruta", nota: "Variação nordestina. Mamão facilita digestão das proteínas" },
          { nome: "Cuscuz nordestino com leite e ovo", medida_caseira: "100g cuscuz preparado + 200ml leite + 1 ovo cozido", gramatura_g: 400, categoria: "laticinios", nota: "Refeição típica brasileira. Alto IG compensado pela proteína do ovo" },
          { nome: "Pães de queijo caseiros com iogurte", medida_caseira: "3 pães de queijo + 150g iogurte", gramatura_g: 350, categoria: "laticinios", nota: "Polvilho tem amido resistente. Combinar com iogurte para equilibrar" },
          { nome: "Açaí sem adição de açúcar com granola e banana", medida_caseira: "200ml açaí + 40g granola + 1 banana", gramatura_g: 350, categoria: "fruta", nota: "Versão sem xarope. Açaí tem gordura boa e antioxidantes" },
        ],
      },
      {
        id: "R1_A3",
        nome: "Amendoim Torrado sem Sal",
        medida_caseira: "1 punhado fechado",
        gramatura_g: 30,
        nota_nutricional: "Gordura boa e proteína vegetal. Evitar em excesso perto do treino.",
        substitutos: [
          { nome: "Pasta de amendoim integral", medida_caseira: "1 colher de sopa cheia", gramatura_g: 30, categoria: "legume_tuberculo", nota: "Sem adicionados. Verificar rótulo — deve ter apenas amendoim" },
          { nome: "Castanha-do-pará", medida_caseira: "4 unidades", gramatura_g: 20, categoria: "legume_tuberculo", nota: "Rica em selênio. Não ultrapassar 4 unidades por dia" },
          { nome: "Amêndoas cruas", medida_caseira: "1 punhado", gramatura_g: 25, categoria: "legume_tuberculo", nota: "Vitamina E e magnésio. Deixar de molho 8h melhora absorção" },
          { nome: "Abacate", medida_caseira: "1/4 unidade média", gramatura_g: 80, categoria: "fruta", nota: "Gordura monoinsaturada. Combinar com ovo para refeição completa" },
          { nome: "Nozes", medida_caseira: "4 metades", gramatura_g: 20, categoria: "legume_tuberculo", nota: "Ômega-3 vegetal. Anti-inflamatória" },
        ],
      },
      {
        id: "R1_A4",
        nome: "Banana Madura",
        medida_caseira: "1 unidade média",
        gramatura_g: 100,
        nota_nutricional: "Fonte de carboidrato e potássio. Prebiótica.",
        substitutos: [
          { nome: "Mamão papaia", medida_caseira: "1 fatia grande", gramatura_g: 200, categoria: "fruta", nota: "Papaína melhora digestão de proteínas. Ideal pela manhã" },
          { nome: "Manga palmer", medida_caseira: "1/2 unidade", gramatura_g: 150, categoria: "fruta", nota: "Vitamina A, C e beta-caroteno. Carbo de médio IG" },
          { nome: "Maracujá com mel", medida_caseira: "2 maracujás + 1 colher chá mel", gramatura_g: 140, categoria: "fruta", nota: "Fibras e passiflorina. Efeito calmante útil se ansioso pré-treino" },
          { nome: "Uva sem semente", medida_caseira: "1 cacho pequeno", gramatura_g: 120, categoria: "fruta", nota: "Resveratrol e rápida liberação de energia" },
          { nome: "Abacaxi", medida_caseira: "2 rodelas", gramatura_g: 150, categoria: "fruta", nota: "Bromelina anti-inflamatória. Auxilia digestão de proteínas" },
          { nome: "Laranja bahia", medida_caseira: "1 unidade grande", gramatura_g: 180, categoria: "fruta", nota: "Vitamina C melhora absorção de ferro não-heme. Comer antes da refeição proteica" },
          { nome: "Pera", medida_caseira: "1 unidade média", gramatura_g: 150, categoria: "fruta", nota: "Baixo IG, rica em fibras solúveis" },
          { nome: "Maçã verde", medida_caseira: "1 unidade", gramatura_g: 130, categoria: "fruta", nota: "Pectina prebiótica. IG mais baixo que banana" },
          { nome: "Mirtilo ou morango", medida_caseira: "1 xícara", gramatura_g: 120, categoria: "fruta", nota: "Altíssimo teor de antioxidantes. Baixo IG" },
        ],
      },
    ],
  },
  {
    id: "R2",
    horario: "10:00",
    contexto: "Lanche da Manhã",
    kcal_referencia: 650,
    macros_referencia: { proteina_g: 40, carbo_g: 80, gordura_g: 20 },
    alimentos: [
      {
        id: "R2_A1",
        nome: "Frango Cozido Desfiado (coxa/sobrecoxa)",
        medida_caseira: "1 filé grande",
        gramatura_g: 150,
        nota_nutricional: "Rico em vitaminas do complexo B. Mais saboroso que peito.",
        substitutos: [
          { nome: "Peito de peru fatiado", medida_caseira: "5 fatias", gramatura_g: 150, categoria: "ave", nota: "Sem adicionados. Verificar sódio no rótulo" },
          { nome: "Lombo de porco cozido desfiado", medida_caseira: "1 filé", gramatura_g: 150, categoria: "porco", nota: "Cozinhar na pressão com alho e louro. Proteína completa e saborosa" },
          { nome: "Atum em água", medida_caseira: "1 lata grande", gramatura_g: 150, categoria: "peixe", nota: "Misturar com azeite e limão para melhorar sabor e absorção" },
          { nome: "Salmão cozido desfiado", medida_caseira: "1 filé médio", gramatura_g: 120, categoria: "peixe", nota: "Ômega-3 EPA+DHA. Cozinhar no vapor para preservar nutrientes" },
          { nome: "Tilápia grelhada", medida_caseira: "1 filé grande", gramatura_g: 150, categoria: "peixe", nota: "Peixe magro, econômico e de sabor neutro" },
          { nome: "Camarão cozido", medida_caseira: "1 concha média", gramatura_g: 150, categoria: "frutos_do_mar", nota: "Alto teor de proteína e zinco. Cozinhar no alho e azeite" },
          { nome: "Patinho moído refogado", medida_caseira: "1 porção", gramatura_g: 150, categoria: "carne_vermelha", nota: "Corte magro. Refogar com tomate e alho" },
          { nome: "Bacalhau dessalgado cozido", medida_caseira: "1 porção", gramatura_g: 130, categoria: "peixe", nota: "Dessalgar por 24h trocando água. Rico em ômega-3 e vitamina D" },
          { nome: "Lula grelhada", medida_caseira: "150g", gramatura_g: 150, categoria: "frutos_do_mar", nota: "Proteína magra de alto valor biológico" },
          { nome: "Shake proteico completo", medida_caseira: "2 scoops whey + 300ml leite + 40g aveia", gramatura_g: 450, categoria: "shake", nota: "Opção rápida. Whey + aveia = proteína + carbo de qualidade" },
          { nome: "Frango ao molho de iogurte", medida_caseira: "150g frango + 100g iogurte natural", gramatura_g: 250, categoria: "laticinios", nota: "Marinar o frango no iogurte deixa mais macio. Grego é melhor" },
        ],
      },
      {
        id: "R2_A2",
        nome: "Batata Inglesa Cozida",
        medida_caseira: "1 e 1/2 xícara chá",
        gramatura_g: 200,
        nota_nutricional: "Carboidrato de fácil digestão. Inhame é boa alternativa.",
        substitutos: [
          { nome: "Batata-doce cozida", medida_caseira: "1 unidade média", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Beta-caroteno e fibras. IG médio, mais nutritiva que batata inglesa" },
          { nome: "Mandioca cozida", medida_caseira: "1 porção", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Típica brasileira. Amido resistente, prebiótica" },
          { nome: "Inhame cozido", medida_caseira: "1 porção", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Diosgenina anti-inflamatória. Excelente para protocolos hormonais" },
          { nome: "Cará cozido", medida_caseira: "1 porção", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Similar ao inhame. Bom para diversificar tubérculos" },
          { nome: "Macarrão integral cozido", medida_caseira: "1 porção", gramatura_g: 200, categoria: "legume_tuberculo", nota: "IG médio, fibras. Combinar com azeite e não manteiga" },
          { nome: "Arroz integral cozido", medida_caseira: "2 xícaras", gramatura_g: 240, categoria: "legume_tuberculo", nota: "Mais fibras que branco. IG menor" },
          { nome: "Banana-da-terra cozida", medida_caseira: "1 unidade média", gramatura_g: 150, categoria: "fruta", nota: "Alto teor de amido resistente quando verde. Carboidrato de qualidade" },
          { nome: "Aipim frito na airfryer", medida_caseira: "200g", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Alternativa saborosa sem óleo em excesso" },
        ],
      },
      {
        id: "R2_A3",
        nome: "Iogurte Natural Integral",
        medida_caseira: "1 copo americano",
        gramatura_g: 200,
        nota_nutricional: "Probióticos, cálcio e proteína de fácil absorção.",
        substitutos: [
          { nome: "Iogurte grego integral", medida_caseira: "150g", gramatura_g: 150, categoria: "laticinios", nota: "Mais proteína e menos carbo que iogurte comum. Cremoso" },
          { nome: "Queijo cottage", medida_caseira: "1 pote", gramatura_g: 200, categoria: "laticinios", nota: "Caseína e soro do leite. Perfeito para refeições intermediárias" },
          { nome: "Leite fermentado integral", medida_caseira: "1 garrafa", gramatura_g: 200, categoria: "laticinios", nota: "Lactobacilos vivos. Mais prático que iogurte" },
          { nome: "Ricota cremosa", medida_caseira: "150g", gramatura_g: 150, categoria: "laticinios", nota: "Mais macia que comum. Misturar com ervas para adicionar sabor" },
          { nome: "Kefir integral", medida_caseira: "1 copo americano", gramatura_g: 200, categoria: "laticinios", nota: "Maior diversidade de probióticos que iogurte convencional" },
          { nome: "Shake de whey com leite", medida_caseira: "1 scoop + 200ml leite integral", gramatura_g: 230, categoria: "shake", nota: "Quando não tiver iogurte disponível. Adicionar canela para sabor" },
          { nome: "Coalhada seca", medida_caseira: "100g", gramatura_g: 100, categoria: "laticinios", nota: "Labaneh. Alta proteína, levemente azeda. Usar com azeite e zaatar" },
        ],
      },
    ],
  },
  {
    id: "R3",
    horario: "12:00",
    contexto: "Pré-Treino Sólido",
    kcal_referencia: 900,
    macros_referencia: { proteina_g: 60, carbo_g: 110, gordura_g: 25 },
    alimentos: [
      {
        id: "R3_A1",
        nome: "Peito de Frango Grelhado",
        medida_caseira: "1 e 1/2 filé grande",
        gramatura_g: 225,
        nota_nutricional: "Proteína clássica, versátil e magra.",
        substitutos: [
          { nome: "Filé de merluza grelhado", medida_caseira: "1 filé grande", gramatura_g: 200, categoria: "peixe", nota: "Peixe magro e econômico. Grelhar com limão e alho" },
          { nome: "Filé de tilápia grelhado", medida_caseira: "1 filé grande", gramatura_g: 200, categoria: "peixe", nota: "Peito de frango do mar. Sabor neutro, fácil preparo" },
          { nome: "Patinho grelhado", medida_caseira: "1 filé", gramatura_g: 180, categoria: "carne_vermelha", nota: "Corte magro bovino. Creatina natural, ferro heme" },
          { nome: "Alcatra grelhada", medida_caseira: "1 filé", gramatura_g: 150, categoria: "carne_vermelha", nota: "Mais saborosa que patinho, menos gordura que picanha" },
          { nome: "Lombo de porco grelhado", medida_caseira: "1 filé", gramatura_g: 180, categoria: "porco", nota: "Vitamina B1 em alta quantidade. Sabor intenso" },
          { nome: "Costela de porco magra cozida", medida_caseira: "2 ossos", gramatura_g: 200, categoria: "porco", nota: "Colágeno natural. Cozinhar na pressão por 40min" },
          { nome: "Atum selado na frigideira", medida_caseira: "1 filé", gramatura_g: 200, categoria: "peixe", nota: "Ômega-3, proteína completa. Grelhar 2 min cada lado" },
          { nome: "Bacalhau cozido desfiado", medida_caseira: "1 porção", gramatura_g: 150, categoria: "peixe", nota: "Dessalgar 24h. Vitamina D e ômega-3" },
          { nome: "Camarão grelhado", medida_caseira: "150g", gramatura_g: 150, categoria: "frutos_do_mar", nota: "Zinco, selênio e proteína magra. Grelhar com alho e manteiga" },
          { nome: "Lula grelhada", medida_caseira: "1 porção", gramatura_g: 200, categoria: "frutos_do_mar", nota: "Proteína magra. Marinar antes para abrir sabor" },
          { nome: "Salmão grelhado", medida_caseira: "1 filé médio", gramatura_g: 180, categoria: "peixe", nota: "Ômega-3, DHA para função cognitiva. Melhor peixe para pré-treino" },
          { nome: "Frango inteiro assado (coxa + sobrecoxa)", medida_caseira: "1 porção", gramatura_g: 200, categoria: "ave", nota: "Mais saboroso. Remover pele para redução de gordura saturada" },
        ],
      },
      {
        id: "R3_A2",
        nome: "Arroz Branco Cozido",
        medida_caseira: "2 xícaras cheias",
        gramatura_g: 300,
        nota_nutricional: "Principal fonte de energia para o treino.",
        substitutos: [
          { nome: "Batata-doce cozida", medida_caseira: "300g", gramatura_g: 300, categoria: "legume_tuberculo", nota: "IG médio, boa opção pré-treino para energia sustentada" },
          { nome: "Macarrão integral cozido", medida_caseira: "1 porção", gramatura_g: 300, categoria: "legume_tuberculo", nota: "Fibras retardam digestão, bom para treino de longa duração" },
          { nome: "Mandioca cozida", medida_caseira: "300g", gramatura_g: 300, categoria: "legume_tuberculo", nota: "Amido resistente. Calórico e sacietógeno" },
          { nome: "Quinoa cozida", medida_caseira: "200g", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Proteína completa + carbo. Todos aminoácidos essenciais" },
          { nome: "Arroz integral cozido", medida_caseira: "300g", gramatura_g: 300, categoria: "legume_tuberculo", nota: "Mais fibras e vitaminas do complexo B que o branco" },
          { nome: "Cuscuz nordestino", medida_caseira: "150g seco preparado", gramatura_g: 300, categoria: "legume_tuberculo", nota: "Milho, típico brasileiro. Alto IG, bom pré-treino intenso" },
          { nome: "Batata Asterix cozida", medida_caseira: "300g", gramatura_g: 300, categoria: "legume_tuberculo", nota: "A batata roxa tem mais antocianinas que a comum" },
        ],
      },
      {
        id: "R3_A3",
        nome: "Brócolis Cozido",
        medida_caseira: "1 xícara chá",
        gramatura_g: 150,
        nota_nutricional: "Crucífera crucial para protocolo D.I.M. Fibras e vitaminas.",
        substitutos: [
          { nome: "Couve-flor no vapor", medida_caseira: "1 xícara", gramatura_g: 150, categoria: "vegetal", nota: "Também crucífera. Sulforafano e indol-3-carbinol" },
          { nome: "Abobrinha refogada", medida_caseira: "1 xícara", gramatura_g: 150, categoria: "vegetal", nota: "Leve e de fácil digestão. Bom pré-treino" },
          { nome: "Chuchu cozido", medida_caseira: "200g", gramatura_g: 200, categoria: "vegetal", nota: "Baixo calórico, hidratante. Bom para volume de prato" },
          { nome: "Couve refogada", medida_caseira: "2 col de sopa", gramatura_g: 80, categoria: "vegetal", nota: "Crucífera. Vitamina K, C e ferro" },
          { nome: "Aspargos no vapor", medida_caseira: "150g", gramatura_g: 150, categoria: "vegetal", nota: "Prebiótico. Asparagina diurética. Bom para circulação" },
          { nome: "Vagem cozida", medida_caseira: "150g", gramatura_g: 150, categoria: "vegetal", nota: "Fibras e magnésio. Levemente proteica" },
          { nome: "Repolho refogado com azeite", medida_caseira: "200g", gramatura_g: 200, categoria: "vegetal", nota: "Crucífera econômica. Glutamina natural para mucosa intestinal" },
          { nome: "Pepino com limão e sal", medida_caseira: "1 unidade", gramatura_g: 200, categoria: "vegetal", nota: "Hidratante, leve. Silício para articulações" },
        ],
      },
    ],
  },
  {
    id: "R4",
    horario: "14:45",
    contexto: "Pós-Treino Imediato",
    kcal_referencia: 180,
    macros_referencia: { proteina_g: 0, carbo_g: 45, gordura_g: 0 },
    nota_protocolo: "Janela anabólica. Spike glicêmico rápido para repor glicogênio e ativar IGF-1. Zero gordura e zero fibra nesta janela.",
    alimentos: [
      {
        id: "R4_A1",
        nome: "Leite Condensado Desnatado",
        medida_caseira: "45g",
        gramatura_g: 120,
        nota_nutricional: "Sacarose para reposição rápida. Zero gordura para não retardar absorção.",
        nota_protocolo_carboidrato_puro: "Quando o atleta não usa shakes nesta janela, priorizar carboidratos sólidos ou líquidos de alto IG do grupo carboidrato_puro. ZERO gordura, ZERO fibra, ZERO suplemento obrigatório.",
        substitutos: [
          { nome: "Whey isolado + dextrose", medida_caseira: "1 scoop whey + 30g dextrose + 200ml água", gramatura_g: 250, categoria: "shake", nota: "Combinação clássica. Proteína + carbo de alto IG simultâneos" },
          { nome: "Whey concentrado + banana", medida_caseira: "1 scoop + 1 banana + 200ml leite desnatado", gramatura_g: 400, categoria: "shake", nota: "Versão natural do spike. Banana substitui a dextrose" },
          { nome: "Mel + suco de laranja", medida_caseira: "2 col sopa mel + 200ml suco natural", gramatura_g: 230, categoria: "fruta", nota: "Frutose + glicose naturais. Também repõe vitamina C" },
          { nome: "Isotônico natural", medida_caseira: "300ml água de coco + 1 banana pequena", gramatura_g: 430, categoria: "fruta", nota: "Eletrólitos + carbo. Hidratação e reposição juntas" },
          { nome: "Shake de chocolate com leite desnatado", medida_caseira: "1 scoop whey choc + 200ml leite desnatado", gramatura_g: 230, categoria: "shake", nota: "Opção saborosa. Leite desnatado tem carbo sem gordura" },
          { nome: "Arroz branco + mel", medida_caseira: "1 xícara arroz cozido + 1 col sopa mel", gramatura_g: 180, categoria: "legume_tuberculo", nota: "Alternativa sólida ao líquido. Alto IG, zero gordura" },
          { nome: "Tapioca com mel", medida_caseira: "2 tapiocas pequenas + 1 col sopa mel", gramatura_g: 120, categoria: "legume_tuberculo", nota: "Polvilho azedo tem IG alto. Mel amplifica o pico glicêmico" },
          { nome: "Banana madura amassada", medida_caseira: "2 unidades pequenas", gramatura_g: 150, categoria: "fruta", nota: "Frutose + glicose + potássio — spike natural eficiente. Zero gordura, zero fibra relevante", grupo: "carboidrato_puro" },
          { nome: "Mel puro", medida_caseira: "3 colheres de sopa", gramatura_g: 60, categoria: "fruta", nota: "Glicose + frutose de absorção imediata — um dos carboidratos mais rápidos disponíveis", grupo: "carboidrato_puro" },
          { nome: "Tâmara sem caroço", medida_caseira: "4 unidades", gramatura_g: 60, categoria: "fruta", nota: "Glicose de altíssimo IG — prático, sem preparo, carregar na bolsa da academia", grupo: "carboidrato_puro" },
          { nome: "Suco de uva integral", medida_caseira: "200ml", gramatura_g: 200, categoria: "fruta", nota: "Frutose + glicose + resveratrol — alto IG, zero gordura", grupo: "carboidrato_puro" },
          { nome: "Batata inglesa cozida amassada sem casca", medida_caseira: "200g", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Alto IG sem fibra da casca — sólido e econômico", grupo: "carboidrato_puro" },
          { nome: "Cuscuz nordestino simples", medida_caseira: "100g preparado", gramatura_g: 100, categoria: "legume_tuberculo", nota: "Milho de alto IG — sem azeite, sem queijo, carboidrato puro", grupo: "carboidrato_puro" },
          { nome: "Banana-passa", medida_caseira: "6 unidades", gramatura_g: 40, categoria: "fruta", nota: "Açúcar concentrado de rápida absorção — prático pós-treino", grupo: "carboidrato_puro" },
          { nome: "Suco de manga natural", medida_caseira: "200ml sem adição de água", gramatura_g: 200, categoria: "fruta", nota: "Frutose densa, vitamina A — spike natural pós-treino", grupo: "carboidrato_puro" },
        ],
      },
    ],
  },
  {
    id: "R5",
    horario: "16:00",
    contexto: "Pós-Treino Sólido",
    kcal_referencia: 1050,
    macros_referencia: { proteina_g: 70, carbo_g: 150, gordura_g: 20 },
    alimentos: [
      {
        id: "R5_A1",
        nome: "Músculo Bovino Cozido",
        medida_caseira: "2 filés grandes",
        gramatura_g: 200,
        nota_nutricional: "Colágeno tipo 1, glucosamina natural. Cozinhar na pressão 40min.",
        substitutos: [
          { nome: "Coxão mole cozido", medida_caseira: "200g", gramatura_g: 200, categoria: "carne_vermelha", nota: "Corte magro macio. Rico em colágeno também" },
          { nome: "Acém desfiado na pressão", medida_caseira: "200g", gramatura_g: 200, categoria: "carne_vermelha", nota: "Econômico e proteico. Desfia facilmente após cozimento" },
          { nome: "Fraldinha grelhada", medida_caseira: "180g", gramatura_g: 180, categoria: "carne_vermelha", nota: "Fibras longas, saborosa. Menos colágeno, mais proteína muscular" },
          { nome: "Salmão grelhado", medida_caseira: "1 filé", gramatura_g: 200, categoria: "peixe", nota: "Ômega-3 + proteína completa. Ideal no pós-treino pelo DHA" },
          { nome: "Atum fresco selado", medida_caseira: "1 filé", gramatura_g: 200, categoria: "peixe", nota: "Proteína magra e Ômega-3. Selar 2 min cada lado" },
          { nome: "Bacalhau ao forno", medida_caseira: "180g dessalgado", gramatura_g: 180, categoria: "peixe", nota: "Dessalgar 24h. Ômega-3 e vitamina D para recuperação" },
          { nome: "Polvo cozido", medida_caseira: "200g", gramatura_g: 200, categoria: "frutos_do_mar", nota: "Proteína densa, taurina. Cozinhar na pressão por 20min" },
          { nome: "Mariscos cozidos", medida_caseira: "200g", gramatura_g: 200, categoria: "frutos_do_mar", nota: "Zinco e ferro altíssimos. Excelente para recuperação hormonal" },
          { nome: "Pernil de porco cozido", medida_caseira: "200g", gramatura_g: 200, categoria: "porco", nota: "Proteína completa, vitamina B1. Remover excesso de gordura" },
          { nome: "Linguiça toscana magra grelhada", medida_caseira: "2 unidades", gramatura_g: 150, categoria: "porco", nota: "Verificar sódio. Grelhar para reduzir gordura. Saborosa" },
          { nome: "Shake hipercalórico", medida_caseira: "2 scoops whey + 100g aveia + 2 bananas + 200ml leite", gramatura_g: 650, categoria: "shake", nota: "Quando não tiver tempo de cozinhar. 700-800 kcal em um shake" },
          { nome: "Ovos mexidos com queijo", medida_caseira: "4 ovos + 50g queijo mussarela", gramatura_g: 280, categoria: "laticinios", nota: "Rápido e nutritivo. Adicionar tomate para antioxidantes" },
        ],
      },
      {
        id: "R5_A2",
        nome: "Feijão Preto Cozido",
        medida_caseira: "2 conchas médias",
        gramatura_g: 200,
        nota_nutricional: "Fibras, ferro e proteína vegetal. Adicionar louro no cozimento.",
        substitutos: [
          { nome: "Feijão carioca cozido", medida_caseira: "2 conchas", gramatura_g: 200, categoria: "legume_tuberculo", nota: "O feijão mais brasileiro. Perfil nutricional similar ao preto" },
          { nome: "Lentilha cozida", medida_caseira: "1 concha cheia", gramatura_g: 150, categoria: "legume_tuberculo", nota: "Mais proteína que feijão. Ferro e ácido fólico em abundância" },
          { nome: "Grão-de-bico cozido", medida_caseira: "1 concha cheia", gramatura_g: 150, categoria: "legume_tuberculo", nota: "Proteína vegetal completa quando combinado com arroz" },
          { nome: "Feijão-fradinho cozido", medida_caseira: "2 conchas", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Base do acarajé. Rico em proteína vegetal e fibras" },
          { nome: "Ervilha cozida", medida_caseira: "2 conchas", gramatura_g: 200, categoria: "legume_tuberculo", nota: "Mais doce. Vitamina K e manganês" },
        ],
      },
      {
        id: "R5_A3",
        nome: "Abacate",
        medida_caseira: "1/2 unidade média",
        gramatura_g: 80,
        nota_nutricional: "Gordura monoinsaturada e potássio para recuperação.",
        substitutos: [
          { nome: "Azeite de oliva extra virgem", medida_caseira: "2 col de sopa", gramatura_g: 20, categoria: "vegetal", nota: "Oleocanthal anti-inflamatório. Usar sobre a refeição já pronta" },
          { nome: "Pasta de amendoim integral", medida_caseira: "1 col sopa cheia", gramatura_g: 30, categoria: "legume_tuberculo", nota: "Gordura boa + magnésio. Misturar com arroz ou batata" },
          { nome: "Castanha-do-pará", medida_caseira: "4 unidades", gramatura_g: 20, categoria: "legume_tuberculo", nota: "Selênio para conversão de T4 em T3. Não ultrapassar 4 unidades" },
          { nome: "Amêndoas", medida_caseira: "1 punhado", gramatura_g: 25, categoria: "legume_tuberculo", nota: "Vitamina E antioxidante. Magnésio para síntese proteica" },
        ],
      },
    ],
  },
  {
    id: "R6",
    horario: "20:00",
    contexto: "Jantar",
    kcal_referencia: 1050,
    macros_referencia: { proteina_g: 79, carbo_g: 232, gordura_g: 24 },
    alimentos: [
      {
        id: "R6_A1",
        nome: "Sardinha em Lata em Água",
        medida_caseira: "2 latas médias",
        gramatura_g: 200,
        nota_nutricional: "Ômega-3 EPA+DHA, cálcio, vitamina D. Melhor custo-benefício.",
        substitutos: [
          { nome: "Salmão grelhado", medida_caseira: "1 filé", gramatura_g: 200, categoria: "peixe", nota: "Maior concentração de ômega-3. DHA para recuperação neural" },
          { nome: "Cavalinha grelhada", medida_caseira: "1 filé", gramatura_g: 200, categoria: "peixe", nota: "Muito rica em ômega-3, barata e acessível" },
          { nome: "Atum em azeite", medida_caseira: "1 lata grande", gramatura_g: 180, categoria: "peixe", nota: "O azeite ajuda na absorção de vitaminas lipossolúveis do peixe" },
          { nome: "Tilápia ao forno", medida_caseira: "1 filé grande", gramatura_g: 200, categoria: "peixe", nota: "Magra e de sabor neutro. Marinar com limão e ervas" },
          { nome: "Filé de merluza grelhado", medida_caseira: "1 filé grande", gramatura_g: 200, categoria: "peixe", nota: "Proteína magra, fácil preparo" },
          { nome: "Polvo refogado com alho e azeite", medida_caseira: "200g cozido", gramatura_g: 200, categoria: "frutos_do_mar", nota: "Taurina, zinco e proteína densa. Cozinhar antes de refogar" },
          { nome: "Camarão refogado ao alho e óleo", medida_caseira: "200g", gramatura_g: 200, categoria: "frutos_do_mar", nota: "Zinco, selênio e proteína magra. Rápido preparo" },
          { nome: "Mariscos no vapor", medida_caseira: "200g", gramatura_g: 200, categoria: "frutos_do_mar", nota: "Fonte excepcional de zinco e ferro. Cozinhar no vapor com vinho" },
          { nome: "Costelinha de porco ao forno", medida_caseira: "200g", gramatura_g: 200, categoria: "porco", nota: "Colágeno + proteína. Marinar com laranja e ervas. Remover gordura visível" },
          { nome: "Picanha bovina grelhada", medida_caseira: "180g", gramatura_g: 180, categoria: "carne_vermelha", nota: "Refeição satisfatória. Ferro heme e creatina. Cortar gordura da borda" },
          { nome: "Shake de caseína + frutas", medida_caseira: "2 scoops caseína + 300ml leite + 150g mamão", gramatura_g: 600, categoria: "shake", nota: "Quando sem tempo. Caseína é proteína de digestão lenta para noite" },
          { nome: "Frango assado inteiro", medida_caseira: "1 porção grande", gramatura_g: 220, categoria: "ave", nota: "Prático de preparar em quantidade. Coxa + sobrecoxa tem mais sabor" },
        ],
      },
      {
        id: "R6_A2",
        nome: "Espinafre Refogado",
        medida_caseira: "1 prato cheio",
        gramatura_g: 200,
        nota_nutricional: "Ferro, vitamina K e folato. Consumir com limão para melhor absorção.",
        substitutos: [
          { nome: "Couve refogada no alho", medida_caseira: "200g", gramatura_g: 200, categoria: "vegetal", nota: "Crucífera com luteína e zeaxantina para saúde ocular" },
          { nome: "Acelga refogada", medida_caseira: "200g", gramatura_g: 200, categoria: "vegetal", nota: "Semelhante ao espinafre. Rica em magnésio e potássio" },
          { nome: "Rúcula com azeite e limão", medida_caseira: "1 prato", gramatura_g: 100, categoria: "vegetal", nota: "Crucífera. Glucosinolatos e nitratos para vasodilatação" },
          { nome: "Alface + tomate", medida_caseira: "1 prato grande", gramatura_g: 250, categoria: "vegetal", nota: "Licopeno do tomate + folato da alface. Simples e acessível" },
          { nome: "Repolho refogado", medida_caseira: "200g", gramatura_g: 200, categoria: "vegetal", nota: "Glutamina natural, ação anti-ulcerosa. Econômico" },
          { nome: "Beterraba cozida + salada verde", medida_caseira: "100g beterraba + 150g salada", gramatura_g: 250, categoria: "vegetal", nota: "Nitratos da beterraba aumentam vasodilatação e performance" },
          { nome: "Abobrinha grelhada com alho", medida_caseira: "200g", gramatura_g: 200, categoria: "vegetal", nota: "Leve para digestão noturna. Vitaminas do complexo B" },
        ],
      },
    ],
  },
  {
    id: "R7",
    horario: "22:30",
    contexto: "Ceia",
    kcal_referencia: 783,
    macros_referencia: { proteina_g: 80, carbo_g: 82, gordura_g: 20 },
    nota_protocolo: "Refeição pré-sono. Priorizar caseína ou proteína de digestão lenta + carbo de baixo IG para manter anabolismo noturno.",
    alimentos: [
      {
        id: "R7_A1",
        nome: "Moela de Frango Cozida e Desfiada",
        medida_caseira: "2 unidades grandes",
        gramatura_g: 150,
        nota_nutricional: "Colágeno e glucosamina para suporte articular.",
        substitutos: [
          { nome: "Peito de frango desfiado com tempero", medida_caseira: "1 filé", gramatura_g: 150, categoria: "ave", nota: "Proteína magra pré-sono. Adicionar azeite para gordura de qualidade" },
          { nome: "Queijo cottage com azeite", medida_caseira: "200g + 1 col azeite", gramatura_g: 220, categoria: "laticinios", nota: "Caseína + gordura boa. Perfil ideal para noite" },
          { nome: "Iogurte grego com mel", medida_caseira: "200g + 1 col mel", gramatura_g: 215, categoria: "laticinios", nota: "Probióticos + caseína + carbo para estabilizar glicemia noturna" },
          { nome: "Shake de caseína noturna", medida_caseira: "1.5 scoops caseína + 200ml leite integral", gramatura_g: 250, categoria: "shake", nota: "Digestão de 6-8h. Opção ideal quando não tem alimento disponível" },
          { nome: "Atum em água com azeite", medida_caseira: "1 lata + 1 col azeite", gramatura_g: 140, categoria: "peixe", nota: "Rápido. Ômega-3 + proteína antes do sono" },
          { nome: "Sardinha com limão", medida_caseira: "1 lata + limão", gramatura_g: 120, categoria: "peixe", nota: "Cálcio das espinhas + ômega-3. Combinar com aveia" },
          { nome: "Lombo de porco cozido desfiado", medida_caseira: "150g", gramatura_g: 150, categoria: "porco", nota: "Triptofano do porco auxilia produção de serotonina e sono" },
          { nome: "Ovo mexido com queijo branco", medida_caseira: "3 ovos + 50g queijo", gramatura_g: 250, categoria: "laticinios", nota: "Triptofano do ovo + caseína do queijo. Combinação pró-sono" },
          { nome: "Ricota com azeite e ervas", medida_caseira: "150g + 1 col azeite", gramatura_g: 170, categoria: "laticinios", nota: "Proteína leve, fácil digestão. Calórico com o azeite" },
          { nome: "Queijo minas frescal com azeite", medida_caseira: "150g + 1 col azeite", gramatura_g: 170, categoria: "laticinios", nota: "Caseína + gordura boa. Sabor neutro, combina com ervas" },
          { nome: "Carne moída magra refogada", medida_caseira: "150g patinho moído", gramatura_g: 150, categoria: "carne_vermelha", nota: "Ferro heme + creatina. Refogar com cebola e alho" },
          { nome: "Camarão com manteiga ghee", medida_caseira: "150g + 1 col ghee", gramatura_g: 160, categoria: "frutos_do_mar", nota: "Zinco e selênio. Ghee é gordura limpa e estável" },
        ],
      },
    ],
  },
];

