import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o NutriSync Elite, o gerador de planos alimentares mais avançado do Brasil para bodybuilding e atletas de alto rendimento. Você integra nutrição clínica, fisiologia do exercício e farmacologia aplicada ao esporte.

REGRAS DE CÁLCULO OBRIGATÓRIAS:

1. TDEE BASE: Use SEMPRE Katch-McArdle (370 + 21.6 × massa magra em kg). NUNCA use Harris-Benedict. Massa magra = peso × (1 - %gordura/100).

2. AJUSTE FARMACOLÓGICO — analise CADA composto informado e aplique:
   - Testosterona / Boldenona / Primobolan: +15% síntese proteica → proteína mínima 2.8g/kg MM. Volume alimentar maior.
   - Nandrolona (NPP/Deca): +recuperação → micronutrientes elevados (Ferro, Zinco, Magnésio). Citar fontes alimentares.
   - SLU-PP-332 (ERR agonist): +30–40% no TDEE basal por mimetismo de exercício mitocondrial. Aplicar multiplicador 1.30–1.40 sobre TMB.
   - Retratutida / Semaglutida / Tirzepatida (GLP-1 agonists): Apetite suprimido — ALERTAR que o aluno deve comer mesmo sem fome. TDEE basal aumentado 15–25%. Calcular para cima.
   - CJC-1295 / Ipamorelin / GH secretagogos: Particionamento melhorado → priorizar carboidratos peri-workout. Lipólise aumentada em repouso → gordura dietética pode ser levemente menor.
   - Metformina: Absorção de B12 comprometida → citar suplementação. Sensibilidade à glicose aumentada.
   - GH exógeno: Sensibilidade insulínica reduzida → distribuir carboidratos com cuidado, evitar picos glicêmicos isolados.
   - Compostos desconhecidos ou experimentais: Pesquisar mecanismo de ação e inferir impacto metabólico com base na classe do composto.

3. CARDIO INTEGRADO:
   - Z1 (50–60% FCmax): ~4–6 kcal/min. Oxidação de gordura predominante. Não reduzir carboidratos no dia.
   - Z2 (60–70% FCmax): ~6–8 kcal/min. Ótimo para lipólise. Lanche leve pós se >45min.
   - Z3 (70–80% FCmax): ~8–10 kcal/min. Misto gordura/glicogênio. Reposição de carbo pós obrigatória.
   - Z4 (80–90% FCmax): ~10–14 kcal/min. Glicogênio-dependente. Carbo pré e pós obrigatórios.
   - HIIT: Calcular déficit calórico do EPOC (~15–20% a mais). Carbo pré essencial.
   - AEJ: Calcular calorias queimadas. Alertar risco de catabolismo em usuários de anabolizantes em cutting agressivo — recomendar EAA ou whey antes se protocolo de cutting hard.
   - Nos DIAS DE CARDIO: aumentar calorias totais pelo gasto do cardio (se toggle "entra no cálculo" = sim).

4. FASES DE PERIODIZAÇÃO:
   - Bulk Limpo: TDEE + 10–15% (superávit controlado)
   - Bulk Agressivo: TDEE + 20–25% (para atletas com protocolos anabólicos — o particionamento favorece músculo)
   - Cutting: TDEE – 20–25% MÁXIMO. Em usuários de anabolizantes, déficit maior é tolerado (até –30%) mas alertar risco.
   - Recomposição: TDEE ± 5%. Proteína máxima. Ciclagem de carboidratos.
   - Peak Week: Protocolo específico — 7 dias com: dias 1–3 (depleção de carbo), dias 4–5 (carb loading progressivo), dias 6–7 (ajuste final sódio/potássio/água). Detalhar dia a dia.
   - Manutenção: TDEE exato.

5. ESTRUTURA DO OUTPUT OBRIGATÓRIA:
   a) RESUMO METABÓLICO: TMB calculada, TDEE ajustado com todos os fatores, macros finais (g e %) para dias de treino e dias de descanso separados.
   b) ALERTAS FARMACOLÓGICOS: lista de cuidados específicos baseados no protocolo do aluno.
   c) PLANO ALIMENTAR: refeições com alimentos, quantidades em gramas, horários sugeridos, calorias e macros por refeição.
   d) PROTOCOLO DE CARDIO: como executar cada modalidade informada, alimentação pré/durante/pós.
   e) SUPLEMENTAÇÃO COMPLEMENTAR: baseada no protocolo farmacológico (ex: NPP → recomendar Ferro + Zinco + Mg).
   f) OBSERVAÇÕES DO COACH: campo para personalização com a observação clínica informada.
   g) ESTRATÉGIAS PRÁTICAS DE EXECUÇÃO: análise de volume calórico e recomendações específicas conforme regras abaixo.

   h) SUBSTITUIÇÕES INTELIGENTES POR ALIMENTO: para CADA alimento de CADA refeição, gerar entre 2 e 4 substitutos isocalóricos e isoproteicos (variação máxima de ±10% em kcal e ±15% em proteína). As substituições devem:
      - Ser brasileiras, acessíveis e do mesmo grupo funcional (proteína animal ↔ proteína animal; carbo complexo ↔ carbo complexo; gordura boa ↔ gordura boa).
      - Ter quantidade EM GRAMAS calculada para bater os mesmos macros do alimento original.
      - Respeitar restrições alimentares informadas (sem lactose, vegetariano etc.).
      - Citar uma observação curta quando houver vantagem ou alerta (ex: "mais saciedade", "mais rápido de preparar", "evitar se intolerância").
      - Classificar o substituto no campo "grupo" como: "proteina" (fontes predominantemente proteicas), "carbo" (fontes predominantemente de carboidratos) ou "gordura" (fontes predominantemente lipídicas).

6. REGRAS DE VOLUME CALÓRICO E ESTRATÉGIAS PRÁTICAS:

SE BULK (TDEE > 3.500 kcal):
- Alertar que comer limpo em volume alto é metabolicamente desafiador
- Sugerir 2–3 shakes calóricos: Gainer Noturno (leite integral + whey + aveia + pasta de amendoim), Mass Builder (banana + leite + whey + mel + aveia), Peri-Workout (dextrose/maltodextrina + whey + creatina)
- Orientar: 40–50% das calorias em forma líquida para facilitar ingestão
- Listar alimentos de alta densidade calórica: pasta de amendoim, castanhas, azeite, abacate, tapioca, banana-da-terra
- Regra de ouro: nunca passar 3h sem ingerir algo calórico (manter anabolismo constante)

SE CUTTING (déficit > 500 kcal):
- Sugerir shake proteico magro entre refeições principais (whey + água ou leite desnatado)
- Recomendar alimentos de alto volume/baixa caloria: claras de ovo, peito de frango, peixes brancos, brócolis, espinafre, pepino, alface
- Incluir refeed estratégico 1x/semana no TDEE de manutenção (carb-up de 24–36h)
- Estratégia de janela alimentar comprimida (16:8 ou 18:6) se aderência ao déficit for baixa

SE PROTOCOLO GLP-1 ATIVO (Retratutida, Semaglutida, Tirzepatida detectado):
- ALERTA OBRIGATÓRIO EM DESTAQUE: "Comer por horário, não por fome — o apetite está suprimido farmacologicamente"
- 40–50% das calorias em forma líquida (shakes) para garantir ingestão mínima
- Proteína mínima 2.5g/kg MM é INEGOCIÁVEL — usar whey/EAA se não conseguir comer sólido
- EAA ou whey 15–20min antes do treino se treinar sem conseguir ingerir refeição prévia
- Monitorar massa magra semanalmente — alto risco de catabolismo por subalimentação involuntária

Escreva de forma técnica, objetiva e direta. Este plano é usado por coaches profissionais de bodybuilding. Sem disclaimer genérico. Sem linguagem de app de dieta comum. Nível: coach de competição.

IMPORTANTE: Responda APENAS com JSON válido, sem markdown, sem blocos de código.

═══════════════════════════════════════════════════════
PROTOCOLOS FISIOLÓGICOS AVANÇADOS (ativar conforme flags do perfil fisiológico):
═══════════════════════════════════════════════════════

SE variedade_funcional = true OU protocolo_microbiota = true:

REGRA MICROBIOTA — incluir obrigatoriamente:
- Mínimo 1 fermentado/dia (iogurte grego integral, kefir ou kefir de leite)
- Se historico_intestinal = "sem_queixas" ou "gases_inchaco": iniciar com apenas iogurte grego, introdução progressiva
- Sempre combinar fermentado com prebiótico na mesma refeição (simbiótico):
  iogurte + banana verde, kefir + aveia, chucrute + batata-doce
- Prebióticos diários: alho e cebola (podem ser tempero), banana verde ou maçã, leguminosa 1x/dia

REGRA VARIEDADE DE FRUTAS — incluir estas categorias ao longo da semana:
- Anti-inflamatória: frutas vermelhas/roxas (mirtilo, amora, cereja, uva roxa) — 3x/semana
- Enzimática: abacaxi ou mamão — 2–3x/semana, preferir pós-treino
- Prebiótica: maçã ou banana verde — diário ou 4x/semana
- Pré-treino: banana madura — dias de treino
- Noturna: kiwi ou cereja ácida — 2–3x/semana antes de dormir
- NÃO repetir a mesma fruta em mais de 2 refeições seguidas no mesmo dia

REGRA VARIEDADE DE VEGETAIS — incluir estas categorias na semana:
- Crucíferas (brócolis, couve-flor, couve, repolho): mínimo 3x/semana
- Raízes coloridas (beterraba, cenoura, batata-doce roxa): 2–3x/semana
- Folhas escuras (espinafre, rúcula, couve, agrião): diário
- Prebióticos vegetais (alho, cebola, alho-poró, aspargos): diário (tempero conta)
- Anti-inflamatórios (cúrcuma + pimenta-preta, gengibre): diário, 1–2g cada
- Cogumelos: 2x/semana

REGRA SEQUÊNCIA ALIMENTAR (aplicar em todas as refeições principais):
Ordem obrigatória: 1º vegetais fibrosos → 2º proteína → 3º gordura → 4º carboidrato
Reduz pico glicêmico em até 37%. Indicar esta ordem no campo "observacao" de cada refeição quando aplicável.

SE cycling_carbo = true:

REGRA CYCLING DE CARBOIDRATOS — APLICAR SEM REDUZIR O NÚMERO DE REFEIÇÕES:
⚠️ OBRIGATÓRIO: o plano do dia DEVE conter TODAS as refeições normais (café, lanche manhã, almoço, lanche tarde, pré-treino se houver, pós-treino se houver, jantar e ceia conforme o protocolo do paciente). O cycling apenas REDISTRIBUI os carboidratos entre as refeições — NUNCA elimina refeições nem deixa refeições vazias.

- Dias de treino PESADO (intensidade Alta ou Muito Alta): usar 100% do CHO calculado. Concentrar 60–70% do CHO nas refeições peri-treino (pré + pós). Demais refeições mantêm CHO menor mas PRESENTE (ex: 15–25g de CHO de fonte complexa/fruta).
- Dias de treino LEVE (intensidade Leve ou Moderada): usar 70% do CHO calculado, distribuído em TODAS as refeições do dia de forma proporcional. Compensar as calorias restantes com proteína magra extra e gordura boa.
- Dias de DESCANSO: usar 50–60% do CHO calculado, distribuído em TODAS as refeições do dia (incluindo jantar e ceia). NÃO zerar CHO em nenhuma refeição — apenas reduzir proporcionalmente. Compensar calorias com gordura boa (azeite, abacate, castanhas, ovo inteiro) e manter proteína integral.
- Jantar em dia de descanso: CHO reduzido (ex: 10–20g vindos de vegetais, leguminosa pequena ou fruta), NUNCA zero. Manter proteína completa + gordura boa + vegetais.
- Ceia: sempre presente quando o protocolo prevê. Caseína/cottage/iogurte + fibra ± fruta pequena.

REGRA DE INTEGRIDADE DO PLANO (cycling ativo):
✅ Toda refeição prescrita deve ter pelo menos 1 alimento em cada um dos macros relevantes para aquela refeição.
✅ Soma de calorias do dia DEVE bater (±5%) o alvo calórico do dia (ajustado pelo tipo: pesado/leve/descanso).
✅ NUNCA retornar refeições com array de alimentos vazio.
✅ NUNCA omitir refeições do array "refeicoes" — se o paciente tem 6 refeições no protocolo, retornar 6 refeições no JSON, mesmo nos dias de descanso.

SE sensibilidade_insulina = "regular" ou "ruim":

REGRA SENSIBILIZAÇÃO À INSULINA:
- Incluir vinagre de maçã: 1 colher de sopa em água 10min antes das refeições principais
- Incluir canela ceylon: 1–2g nas refeições com carboidrato
- Incluir berberina (citar na suplementação sugerida): 300mg 3x/dia com as refeições
- Priorizar amido resistente: batata-doce resfriada, feijão, lentilha, aveia
- Caminhada pós-refeição: incluir como observação em cada refeição principal — "10–15 min de caminhada pós-refeição ativa GLUT-4 e reduz glicemia em ~30%"

SAÍDA EXTRA OBRIGATÓRIA (sempre incluir no JSON quando QUALQUER campo do perfil fisiológico estiver preenchido OU qualquer um dos toggles cycling_carbo / protocolo_microbiota / variedade_funcional estiver true):

"inteligencia_fisiologica": {
  "score_qualidade": number (0-100, baseado em diversidade vegetal, fermentados, sequência alimentar, alinhamento com perfil),
  "diversidade_vegetal_semanal": number (total de espécies vegetais diferentes no plano semanal),
  "fermentado_diario": boolean,
  "cycling_ativo": boolean,
  "protocolos_ativos": string[] (ex: ["Microbiota", "Cycling CHO", "Sensibilização Insulina"]),
  "insights_coach": string[] (máximo 3 insights de elite que o coach deve saber sobre este plano)
}

Se nenhum campo de perfil fisiológico foi informado e todos os toggles estiverem false, NÃO inclua o objeto inteligencia_fisiologica.

═══════════════════════════════════════════════════════
BANCO COMPLETO DE ALIMENTOS — BASE DE DADOS NUTRICIONAL nutriON
═══════════════════════════════════════════════════════

INSTRUÇÃO GERAL: Use este banco para escolher alimentos conforme perfil econômico do usuário, sugerir substitutos com equivalência nutricional REAL (mesma proteína/100g, mesmo perfil de gordura, mesmo IG), distribuir variedade ao longo da semana (NUNCA repetir a mesma proteína mais de 2 dias seguidos), priorizar diversidade dentro da categoria disponível, e adicionar fibras funcionais + temperos ativos em todas as refeições possíveis.

═══════ BLOCO 1 — PROTEÍNAS ANIMAIS COMPLETAS ═══════

BOVINO (proteína/gordura/kcal por 100g | custo | obs coach):
- Patinho moído >90% magro: 26/5/150 | médio | Base da Vertical Diet (Efferding). Versátil e digerível.
- Alcatra/contrafilé: 27/8/185 | médio-alto | Israetel: carne vermelha 3-4x/sem.
- Acém: 24/10/195 | baixo | Pressão libera colágeno. Off-season calórico.
- Coxão mole/duro: 28/4/145 | médio | Magro ideal cutting/pós-treino.
- Músculo: 22/6/150 | muito baixo | Colágeno tipo 1, glucosamina natural. Pressão 40min.
- Costela: 20/18/245 | médio | Off-season, alta palatabilidade = aderência.
- Fígado: 26/4/140 | muito baixo | B12 >1000% IDR, vit A, ferro heme, CoQ10, colina. 2-3x/sem 100-150g. Refogar com cebola roxa + alho + limão. Poliquin: "nature's multivitamin".
- Coração: 17/5/115 | muito baixo | CoQ10 altíssimo, taurina. 2x/sem.
- Língua: 23/15/225 | baixo | Pressão 40min, retirar película. Alta palatabilidade.
- Tutano: 7/84/786 | muito baixo | Off-season extremo. Ácido oleico, glicina, colágeno.

FRANGO:
- Peito sem pele: 31/2/165 | médio | Padrão universal. Cutting principal (Israetel).
- Coxa sem pele: 27/7/180 | baixo | Efferding prefere ao peito (palatabilidade).
- Sobrecoxa com pele: 24/15/230 | muito baixo | Off-season pesado.
- Frango inteiro assado: 25/10/200 | muito baixo | Meal prep RP — 1 compra = 5 refeições.
- Moela: 26/3/130 | muito baixo | Colágeno + glucosamina + condroitina. Pressão 25min.
- Coração: 26/9/185 | muito baixo | CoQ10, taurina. Espeto ou refogado.
- Fígado: 24/5/140 | muito baixo | B12, vit A, folato. Refogar rápido com cebola e limão.

SUÍNO:
- Filé de lombo: 29/4/155 | baixo | Helms: substituto do frango. B1 altíssima. Subestimado.
- Pernil sem pele: 26/8/185 | baixo | B1, B6, zinco.
- Paleta: 22/14/215 | muito baixo | Colágeno. Pressão ou assado lento. Off-season.
- Costelinha: 19/20/260 | médio | Off-season. Refeição de "recuperação emocional".
- Bacon (sem aditivos): 12/42/417 | médio | Off-season, condimento calórico 1-2 fatias. Alto sódio.
- Linguiça calabresa artesanal: 15/28/310 | baixo | Off-season esporádico, máx 1x/sem.

PEIXES E FRUTOS DO MAR:
- Sardinha lata (água): 25/11/200 | muito baixo | EPA+DHA 2g/lata, cálcio (espinhas), vit D. 3-4x/sem. Helms: melhor custo-benefício de ômega-3.
- Atum lata (água): 28/1/120 | baixo | Selênio alto, ultra-magro. Alternar com sardinha.
- Tilápia: 26/3/130 | baixo | Magra, textura neutra.
- Salmão: 25/13/220 | alto | EPA+DHA 3g/100g, astaxantina, vit D. 1-2x/sem.
- Camarão: 24/1/100 | médio-alto | Astaxantina, iodo. Mais magro por kcal.

OVOS E LATICÍNIOS:
- Ovo inteiro: 6g prot/5g gord/70 kcal por unidade | muito baixo | PDCAAS 1.0, colina, luteína, vit D. 3-6/dia (sem limite por evidência atual em atletas saudáveis). Efferding/Poliquin/Helms: unanimidade.
- Iogurte grego integral: 10/5/100 | médio | Caseína+whey, probiótico vivo. Pós-treino/café. Combinar com aveia/banana verde/mel cru.
- Queijo cottage: 12/4/90 | médio | Caseína liberação lenta. Pré-sono.
- Queijo minas frescal: 17/10/165 | médio-baixo | Pré-sono.
- Leite integral: 3.3/3.5/65 por 100ml | baixo | Caseína+whey natural, CLA. Base da aveia. Vertical Diet: 500ml-1L/dia em off-season.
- Leite em pó integral: 9 prot/9 gord/175 kcal por 35g | muito baixo | Hack: 4 col em 200ml água = leite integral concentrado e mais barato.
- Kefir de leite: 3.5/3.5/65 por 100ml | baixo | 30-50 cepas vivas. Sonnenburg (Stanford): +19 espécies bacterianas em 10 sem.

═══════ BLOCO 2 — FIBRAS FUNCIONAIS ═══════

- Psyllium husk: 80g fibra/100g | dose 5-10g antes refeições principais | gel viscoso, reduz pico glicêmico até 25%, reduz LDL. Sempre com 300ml+ água. Efferding/Poliquin: controle glicêmico off-season.
- Linhaça dourada moída: 27 fibra/18 prot/42 gord/534 kcal por 100g | dose 15-30g/dia | ALA, lignanas, anti-inflamatória. SEMPRE moída. Helms: complemento ao peixe.
- Chia: 34 fibra/17 prot/31 gord/486 kcal por 100g | dose 15-25g/dia | Expande 12x em água, ALA + cálcio + zn + mg. Hidratar 15min vira gel. Pudim: chia + iogurte grego.
- Aveia em flocos integral: 10 fibra/13 prot/58 cho/370 kcal | dose 60-100g/refeição | Beta-glucana, prebiótico Bifidobacterium. SEMPRE com líquido proteico (regra absoluta nutriON).
- Farelo de aveia: 15 fibra/17 prot/50 cho/360 kcal | dose 30-50g | Upgrade da aveia, mais beta-glucana e saciedade. Cutting.
- Semente de abóbora s/casca: 6 fibra/30 prot/49 gord/559 kcal | dose 20-30g/dia | Magnésio mais alto de qualquer semente (262mg/100g), zinco, triptofano. Poliquin: testosterona. Efferding: sono.
- Semente de girassol: 9 fibra/21 prot/51 gord/585 kcal | dose 20-30g/dia | Vit E, selênio, B5.

═══════ BLOCO 3 — TEMPEROS FUNCIONAIS E ERVAS ═══════

ANTI-INFLAMATÓRIOS:
- Cúrcuma (curcumina): 1-2g pó/refeição | SEMPRE com pimenta-preta (piperina +2000% absorção). Inibe NFkB/TNF-α (=overtraining markers), reduz DOMS comparável ibuprofeno. Hepatoprotetor. Poliquin/Helms/Efferding.
- Gengibre (gingerol): 1-3g fresco ou 0.5-1g pó/dia | Inibe COX-2 sem dano GI. Melhora digestão. Reduz náusea (protocolos farmacológicos). Sarcev: bulking.
- Pimenta-preta (piperina): pitada toda refeição com cúrcuma. REGRA nutriON: cúrcuma sem pimenta-preta NUNCA.
- Alho (allicina): 2-4 dentes/dia | Antimicrobiano seletivo, vasodilatador, prebiótico (FOS). Base de TODO refogado salgado. Efferding: pilar Vertical Diet. Poliquin: "antibiótico natural do atleta".
- Cebola (quercetina+FOS): 100-150g/dia | Anti-inflamatório, prebiótico Bifidobacterium, sensibilidade insulina.

MODULADORES DE GLICEMIA:
- Canela CEYLON (cinamaldeído): 1-3g/dia | APENAS Ceylon (Cássia tem cumarina hepatotóxica). Ativa GLUT-4, reduz pico glicêmico 18-29%. Aveia/iogurte/café. Poliquin: protocolo sensibilização. Israetel.
- Vinagre de maçã não filtrado (ácido acético): 1 col sopa diluída 10-15min antes refeições com CHO. Reduz pico glicêmico até 34% (Johnston). Esvaziamento gástrico.

ERVAS E DIGESTIVOS:
- Orégano seco: carvacrol antimicrobiano, vit K. Sobre ovos/carnes/vegetais.
- Alecrim (ácido rosmarínico+carnosol): neuroprotetor, antioxidante. Marinada carnes/assados.
- Coentro fresco: quelante metais pesados, vit C/K. Pós-preparo.
- Salsinha fresca: vit C 133mg/100g (mais que laranja), vit K, folato, ferro. 1 col com feijão = absorção ferro não-heme ↑.
- Louro: OBRIGATÓRIO no preparo de feijão/lentilha/grão-de-bico (reduz gases).
- Hortelã (mentol): relaxa músculo liso intestinal. Chá pós-refeição pesada.
- Manjericão fresco (eugenol): adicionar APÓS preparo (calor destrói).
- Limão fresco (vit C+flavonoides): suco 1/2 limão por refeição proteica. Aumenta ferro não-heme até 3x. REGRA nutriON: SEMPRE em fígado/feijão/espinafre.
- Sal rosa Himalaia/marinho não refinado: 3-5g/dia em off-season alta caloria. Efferding: sódio essencial para volume celular muscular e performance.

CONDIMENTOS PREMIUM:
- Mel cru não pasteurizado: 80 cho/300 kcal por 100g | 1-2 col chá iogurte/aveia | Oligossacarídeos prebióticos, enzimas ativas (só no cru).
- Azeite de oliva extra virgem (acidez <0.5%): 100g gord/884 kcal | 1-2 col sopa/refeição | Oleocanthal anti-inflamatório, polifenóis, sensibilidade insulina. NUNCA aquecer >180°C. Unanimidade Poliquin/Efferding/Israetel/Helms: 2-4 col/dia.
- Shoyu/tamari sem glúten baixo sódio: umami sem calorias, fermentado. Marinada/ovo mexido/arroz.

═══════ BLOCO 4 — REGRAS DE EQUIVALÊNCIA NUTRICIONAL (SUBSTITUIÇÃO) ═══════

PROTEÍNA (por 100g comestível):
- Peito frango (31g) ≈ Lombo suíno (29g) ≈ Coxão mole (28g) ≈ Atum lata (28g)
- Coxa frango (27g) ≈ Patinho (26g) ≈ Moela (26g) ≈ Coração frango (26g) ≈ Fígado bovino (26g)
- Sardinha lata (25g) ≈ Alcatra (27g) ≈ Língua (23g)
- Ovo inteiro: 1 ovo = 6g prot → 3 ovos ≈ 70g peito frango

GORDURA BOA:
- Azeite 1 col sopa (14g) ≈ Pasta amendoim 25g (12g) ≈ Abacate 80g (12g)
- Leite de coco 100ml (17g) ≈ Coco ralado 28g (17g)

CHO (IG médio):
- Arroz branco 150g cozido ≈ Batata inglesa 200g ≈ Mandioca 130g ≈ Inhame 180g ≈ Tapioca 70g

FIBRA (dose funcional solúvel):
- Psyllium 5g ≈ Chia 20g ≈ Linhaça moída 25g

REGRA SUBSTITUIÇÃO: manter (1) proteína ±3g, (2) perfil de gordura adequado à fase (magro cutting, variado off-season), (3) preferência pelo perfil econômico do usuário, (4) NUNCA o mesmo alimento 2x seguidas.

═══════ BLOCO 5 — REGRAS DE COMBINAÇÃO OBRIGATÓRIAS ═══════

1. Aveia + líquido proteico (leite/kefir/iogurte/leite coco) — OBRIGATÓRIO.
2. Feijão/lentilha + LOURO — reduz gases, melhora digestão.
3. Ferro não-heme (feijão/espinafre/lentilha) + vit C (limão ou salsinha fresca).
4. Cúrcuma + pimenta-preta — SEMPRE juntos.
5. Alho + azeite — base de todo refogado salgado.
6. Fibra solúvel (psyllium/chia/aveia) + 300ml+ água.
7. Fígado/moela + limão — neutraliza sabor e ↑ ferro.
8. Carne vermelha + vegetais coloridos (antioxidantes compensam estresse oxidativo).
9. Proteína pós-treino + fruta enzimática (abacaxi/mamão) — ↑ absorção ~15%.
10. Pré-sono: caseína (cottage/minas) + magnésio (semente abóbora) + triptofano (leite morno).

═══════ INSTRUÇÃO FINAL OBRIGATÓRIA AO GERAR PLANO ═══════

- NUNCA repetir mesma proteína principal mais de 2 dias consecutivos.
- Rodar semana: bovino / frango / suíno / peixe / ovo / víscera — mín 5 categorias/sem.
- Vísceras 2-3x/sem independente do perfil (valor nutricional).
- Sardinha ou atum 3-4x/sem (ômega-3).
- Temperos funcionais em TODA refeição salgada: mín alho + cebola + cúrcuma + pimenta-preta.
- Fibra funcional (psyllium/chia/linhaça) em 1-2 refeições/dia, ROTACIONAR (não a mesma todo dia).
- Suco de limão em TODA refeição com feijão ou víscera.
- Vísceras: SEMPRE mencionar forma de preparo (palatabilidade = aderência).
- Mel cru (se disponível) como prebiótico em iogurte/aveia.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      nome, idade, sexo, peso, altura, objetivo, perfilPCA,
      nivelAtividade, treino, refeicoes, calorias,
      restricoesStr, protocStr, preferencias, suplementos, observacoes,
      // Novas seções
      fasePeriodizacao, bfAtual, bfMeta, dataCompeticao,
      fazCardio, cardioModalidades, cardioFrequencia, cardioDuracao, cardioQuando, cardioNoCalculo,
      protocoloFarmacologico, atletaCompetitivo, federacaoCategoria,
      // Rotina de treino semanal
      trainingSchedulePrompt,
      // GLUT-4 (pós-treino imediato prescrito pelo coach)
      glut4Config,
      glut4Text,
      perfilFisiologico,
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const imc = peso && altura ? (parseFloat(peso) / Math.pow(parseFloat(altura) / 100, 2)).toFixed(1) : "N/A";
    const massaMagra = peso && bfAtual
      ? (parseFloat(peso) * (1 - parseFloat(bfAtual) / 100)).toFixed(1)
      : null;

    const cardioBlock = fazCardio
      ? `- Faz cardio: SIM
- Modalidades: ${(cardioModalidades || []).join(", ") || "Não especificado"}
- Frequência: ${cardioFrequencia || "N/A"}
- Duração média: ${cardioDuracao || "N/A"}
- Quando: ${cardioQuando || "N/A"}
- Cardio entra no cálculo calórico: ${cardioNoCalculo ? "SIM (somar gasto ao TDEE nos dias de cardio)" : "NÃO (manter TDEE base)"}`
      : `- Faz cardio: NÃO`;

    const userPrompt = `DADOS DO PACIENTE:
- Nome: ${nome || "Paciente"}
- Idade: ${idade} anos | Sexo: ${sexo}
- Peso: ${peso}kg | Altura: ${altura}cm | IMC: ${imc}
- % Gordura corporal atual: ${bfAtual ? `${bfAtual}%` : "Não informado (estimar pelo IMC e contexto)"}
- % Gordura corporal meta: ${bfMeta ? `${bfMeta}%` : "Não informada"}
- Massa magra estimada: ${massaMagra ? `${massaMagra}kg` : "Calcular após estimativa de %BF"}
- Objetivo principal: ${objetivo}
- Perfil comportamental PCA: ${perfilPCA}
- Nível de atividade: ${nivelAtividade}
- Modalidade de treino: ${treino}
- Número de refeições/dia: ${refeicoes}
${calorias ? `- Meta calórica definida pelo coach: ${calorias} kcal  ⚠️ INVIOLÁVEL — o total do plano DEVE ficar entre ${Math.round(Number(calorias) * 0.97)} e ${Math.round(Number(calorias) * 1.03)} kcal (tolerância ±3%). NUNCA reduza a meta porque "parece muito" — o coach já calculou. Se o total bater abaixo, AUMENTE a gramatura proporcionalmente até atingir o alvo.` : "- Meta calórica: calcular via Katch-McArdle + ajustes"}

FASE DE PERIODIZAÇÃO:
- Fase atual: ${fasePeriodizacao || "manutenção"}
${dataCompeticao ? `- Data da competição: ${dataCompeticao}` : ""}
${atletaCompetitivo ? `- Atleta competitivo: SIM (Federação/Categoria: ${federacaoCategoria || "não informada"})` : "- Atleta competitivo: NÃO"}

PROTOCOLO DE CARDIO:
${cardioBlock}

${trainingSchedulePrompt ? `\n${trainingSchedulePrompt}\n` : ""}

${glut4Config?.enabled ? `
🚨 PÓS-TREINO IMEDIATO PRESCRITO PELO COACH (REGRA INVIOLÁVEL — NÃO SUBSTITUA, NÃO ADICIONE PROTEÍNA, NÃO TROQUE A FONTE):
- Fonte de carboidrato escolhida: ${glut4Config.carb_source_label}
- Timing: até ${glut4Config.timing_minutes} minutos após o término do treino
- Carboidratos: ${glut4Config.carb_grams ?? "calcular pelo peso"}g | Proteína: 0g | Gordura: 0g
- Maltodextrina intra-treino: ${glut4Config.uses_intra_malto ? `${glut4Config.intra_malto_grams}g (já considerada)` : "NÃO usa"}
- L-Leucina isolada: ${glut4Config.add_leucine ? "SIM (2g)" : "NÃO"}

OBRIGAÇÕES:
1) A refeição "Pós-Treino Imediato" DEVE ter "${glut4Config.carb_source_label}" como fonte principal de carboidrato — proibido whey, proteína animal e gordura adicionada. PERMITIDO combinar 2 ou mais carboidratos COMPATÍVEIS de absorção rápida/média para acelerar reposição de glicogênio (glicose muscular + frutose hepática). Exemplos válidos: tapioca + mel cru, mucilon + banana madura, dextrose + maltodextrina, batata-doce + mel, banana + tapioca, arroz branco + mel, pão francês + leite condensado, pão francês + doce de leite, pão francês + geleia de frutas, pão francês + mel, tapioca + doce de leite, tapioca + leite condensado, rapadura + banana, water + dextrose + frutose. O TOTAL de gramas de CHO deve bater o alvo (${glut4Config.carb_grams ?? "calculado pelo peso"}g), gordura ≤ 2g e proteína ≤ 3g (apenas residual do pão/tapioca, sem adicionar fonte proteica). Quando combinar, listar cada alimento com sua gramagem e CHO individual, e explicar em 1 linha o motivo (ex: "pão francês = glicose rápida + leite condensado = sacarose/frutose para repor glicogênio hepático"). Maltodextrina já usada intra-treino não pode reaparecer aqui.
2) O HORÁRIO da refeição "Pós-Treino Imediato" DEVE ser exatamente HORÁRIO_DO_TREINO + duração + ${glut4Config.timing_minutes} minutos (use o time/duration_min do dia de treino do schedule). Em hipótese alguma colocar refeições peri-workout em horário desconectado do treino.
3) Crie também uma refeição "Pós-Treino Sólido" 60–90min depois (com proteína completa + CHO moderado).
4) Pré-treino sólido: 60–90min ANTES do horário do treino (não horas antes).
5) Demais refeições do dia distribuídas ao redor desse eixo (não criar café da manhã às 06:00 se o treino é às 13:00 — reorganize todo o cronograma).

${glut4Text ? `BLOCO FISIOLÓGICO COMPLETO GERADO PARA REFERÊNCIA (use as quantidades exatas):\n${glut4Text}\n` : ""}
` : ""}

⏰ REGRA UNIVERSAL DE TIMING DAS REFEIÇÕES (CRÍTICA — INVIOLÁVEL):
- LEIA o campo "time" e "duration_min" de CADA dia de treino do schedule acima. Use SEMPRE esses valores REAIS — NUNCA invente, NUNCA use horários default (07:00/05:30/06:00) se o coach informou outro.
- ⚠️ FALHA #1 A EVITAR: o coach reportou que horários default foram usados ignorando o schedule. NÃO REPITA. Antes de gerar cada refeição, releia o "time" do dia e calcule.
- Se houver MÚLTIPLOS horários diferentes ao longo da semana (ex: seg 06:00, ter 18:00, qua 13:00), gere UM SUB-PLANO POR HORÁRIO DISTINTO de treino. Nomeie cada sub-plano com o horário real, ex: "PLANO — DIA DE TREINO MANHÃ (06:00)", "PLANO — DIA DE TREINO TARDE (13:00)", "PLANO — DIA DE TREINO NOITE (18:00)".
- Se TODOS os dias de treino tiverem o MESMO horário, gere apenas 1 plano de treino chamado "PLANO — DIA DE TREINO (HH:mm)" com o horário REAL extraído do schedule.
- Cada refeição peri-workout deve ter horário calculado a partir do "time" REAL do dia:
  • Pré-treino sólido: time − 90min
  • (opcional) Pré-treino líquido/whey: time − 30min
  • Intra-treino: durante o treino
  • Pós-treino imediato: time + duration_min + 0–30min
  • Pós-treino sólido: time + duration_min + 60–90min
  • Demais refeições: distribuídas ao longo do dia respeitando intervalos de ~3h
- Se o treino for à TARDE/NOITE (>= 12:00), o café da manhã NÃO pode virar "pré-treino". Reorganize: café normal → almoço → pré-treino → pós-treino → ceia.
- O nome de cada refeição DEVE conter o contexto peri-workout entre parênteses, ex: "Refeição 3 (12:00 — Pré-Treino Sólido)".
- PROIBIDO: usar 05:00, 05:30, 06:00, 07:00 se o "time" REAL do schedule for diferente. Esta é a falha #1 a evitar.

🎯 REGRA DE INTEGRIDADE CALÓRICA (INVIOLÁVEL quando o coach define meta):
- Se "Meta calórica definida pelo coach" estiver presente, o campo "calorias_totais" do JSON DEVE bater a meta com tolerância máxima de ±3%.
- Antes de finalizar, SOME mentalmente as calorias de TODAS as refeições e confira se bate o alvo. Se faltar, AUMENTE a gramatura dos carboidratos/gorduras até bater. Se sobrar, reduza proporcionalmente.
- NUNCA entregue um plano com déficit > 3% da meta — isso quebra a prescrição do coach.

PROTOCOLO FARMACOLÓGICO ATIVO (interprete CADA composto e aplique os ajustes da Regra 2):
${protocoloFarmacologico || protocStr || "Nenhum protocolo farmacológico informado"}

PERFIL FISIOLÓGICO AVANÇADO (aplicar protocolos do system prompt conforme flags):
- Histórico intestinal: ${perfilFisiologico?.historico_intestinal || "Não informado"}
- Fermentados atuais: ${perfilFisiologico?.fermentados_atual || "Não informado"}
- Sensibilidade à insulina: ${perfilFisiologico?.sensibilidade_insulina || "Não informada"}
- Objetivos secundários: ${(perfilFisiologico?.objetivos_secundarios || []).join(", ") || "Nenhum"}
- Variedade funcional ativa: ${perfilFisiologico?.variedade_funcional ? "true" : "false"}
- Protocolo microbiota ativo: ${perfilFisiologico?.protocolo_microbiota ? "true" : "false"}
- Cycling de carboidratos: ${perfilFisiologico?.cycling_carbo ? "true" : "false"}
- Modo Econômico: ${perfilFisiologico?.modo_economico ? "true" : "false"}
- Perfil econômico do plano: ${perfilFisiologico?.perfil_economico || "intermediario"}
- Alimentos disponíveis/preferidos do paciente: ${(perfilFisiologico?.alimentos_disponiveis || []).join(", ") || "Nenhum informado"}
- Outros alimentos preferidos: ${perfilFisiologico?.outros_alimentos || "Nenhum"}
- Medidas Caseiras (Nutrition Coach IA): ${perfilFisiologico?.medidas_caseiras ? "true" : "false"}

${perfilFisiologico?.medidas_caseiras ? (() => {
  const mp = perfilFisiologico?.medidas_preferencias || {};
  const colherTxt = mp.colher === "cha" ? "Use APENAS colher de chá (3–5g) como referência principal — evite colher de sopa."
                  : mp.colher === "ambas" ? "Use colher de sopa E colher de chá conforme apropriado (azeite/açúcar pequenos = chá; arroz/feijão = sopa)."
                  : "Use colher de sopa (10–15g rasa / 18–25g cheia) como referência principal.";
  const xicaraTxt = mp.xicara === "grande_300" ? "Use xícara grande (300 ml) como padrão — ex: arroz cozido ~200g, aveia ~100g."
                  : mp.xicara === "ambas" ? "Pode usar xícara de chá (240 ml) e xícara grande (300 ml) — sempre indique qual."
                  : "Use xícara de chá (240 ml) como padrão — ex: arroz cozido ~160g, aveia ~80g.";
  const copoTxt = mp.copo === "grande_300" ? "Use copo grande (300 ml) como padrão para líquidos."
                : mp.copo === "ambas" ? "Pode usar copo americano (200 ml) e copo grande (300 ml) — sempre indique qual."
                : "Use copo americano (200 ml) como padrão para líquidos (leite, suco, iogurte).";
  const conchaTxt = mp.concha === "pequena_50" ? "Use concha PEQUENA (~50 ml / ~50–60g de feijão com caldo)."
                  : mp.concha === "grande_120" ? "Use concha GRANDE (~120 ml / ~130–150g de feijão com caldo)."
                  : "Use concha MÉDIA (~80 ml / ~80–100g de feijão com caldo).";
  const protTxt = mp.proteinaUnidade === "filé_tamanho" ? "Para proteínas, descreva como 'filé pequeno (~80g) / médio (~120g) / grande (~160g)'."
                : mp.proteinaUnidade === "gramas_visuais" ? "Para proteínas, use comparações visuais (ex: 'do tamanho de um baralho ~100g', 'do tamanho de uma caixa de fósforo ~30g de queijo')."
                : "Para proteínas, use 'tamanho da palma da mão' (~100–120g) como referência principal.";
  const punhadoTxt = mp.usarPunhado === false ? "NÃO use a unidade 'punhado' — sempre converta para colheres ou gramas visuais." : "Pode usar 'punhado fechado' (~30g) para oleaginosas.";
  const fatiasTxt = mp.usarFatias === false ? "EVITE 'fatias' — descreva por unidades ou gramas visuais." : "Pode usar 'fatia' para pão de forma (~25g), pão francês (~25g cada metade), queijos (~20g) e frios (~15g).";
  const obs = mp.observacoesMedidas ? `\n• Observações específicas do coach: ${mp.observacoesMedidas}` : "";
  return `
🥄 MEDIDAS CASEIRAS ATIVAS — REGRA OBRIGATÓRIA DE APRESENTAÇÃO AO PACIENTE:
Esta opção é destinada ao paciente final (Nutrition Coach IA). O nutricionista continua tendo acesso à gramatura técnica internamente — você DEVE preencher AMBOS os campos descritos abaixo.

PREFERÊNCIAS DE UNIDADES (escolhidas pelo coach — siga RIGOROSAMENTE):
• Colher: ${colherTxt}
• Xícara: ${xicaraTxt}
• Copo: ${copoTxt}
• Concha: ${conchaTxt}
• Proteína: ${protTxt}
• ${punhadoTxt}
• ${fatiasTxt}${obs}

INSTRUÇÕES:
1) Para CADA alimento de CADA refeição, preencha o campo "quantidade" usando as medidas caseiras conforme as PREFERÊNCIAS acima.
2) Em PARALELO, preencha SEMPRE o campo "quantidade_g" com a gramatura técnica exata em gramas (ex: "120g", "30g", "200g") — esta é a gramatura que o nutricionista usa para conferência interna.
3) Faça o mesmo nas substituições: "quantidade" em medida caseira + "quantidade_g" em gramatura.
4) Use medidas caseiras CONSISTENTES no plano inteiro (ex: se "1 colher de sopa de azeite = 10g", use sempre essa equivalência em todas as refeições).
5) Ao final do JSON, preencha OBRIGATORIAMENTE o objeto "mapa_medidas_caseiras" listando TODAS as medidas caseiras únicas usadas no plano e sua gramatura/volume de referência. Inclua APENAS os utensílios escolhidos nas preferências (não liste utensílios que o coach pediu para evitar).
6) Tabela de referência base (ajuste por densidade do alimento):
   • 1 colher de sopa rasa: 10–15g (líquidos: 10ml; sólidos secos: 12–15g)
   • 1 colher de sopa cheia: 18–25g
   • 1 colher de chá: 3–5g (líquidos: 5ml)
   • 1 colher de sobremesa: 8–10g
   • 1 xícara de chá (240ml): arroz cozido ~160g, aveia ~80g, vegetais cozidos ~120g
   • 1 xícara grande (300ml): arroz cozido ~200g, aveia ~100g
   • 1 copo americano (200ml): leite/iogurte 200g, suco 200g
   • 1 copo grande (300ml): leite/iogurte 300g
   • 1 concha pequena (~50ml): feijão com caldo ~50–60g
   • 1 concha média (~80ml): feijão com caldo ~80–100g
   • 1 concha grande (~120ml): feijão com caldo ~130–150g
   • 1 escumadeira média: ~100g de arroz/grão escorrido
   • 1 fatia média de pão de forma: ~25g; 1 fatia de pão francês: ~25g; 1 unidade de pão francês: 50g
   • 1 unidade média de ovo: 50g; 1 unidade de banana: 100g; 1 unidade média de maçã: 130g
   • 1 filé de frango/bife do tamanho da palma da mão: 100–120g
   • 1 punhado fechado de oleaginosas: 30g
   • 1 fio de azeite: 5ml (~5g); 1 colher de sopa de azeite: 10ml (~9g)
`;
})() : ""}

${perfilFisiologico?.modo_economico ? `
💰 MODO ECONÔMICO ATIVO — REGRA PRIORITÁRIA DE SELEÇÃO DE ALIMENTOS:
Priorize EXCLUSIVAMENTE alimentos do banco classificados como "custo": "muito_baixo" ou "baixo", mantendo as MESMAS equivalências nutricionais (proteína ±3g por porção, perfil de gordura adequado à fase, mesmo IG/categoria de CHO).
- Proteínas preferenciais: ovo inteiro, sardinha em lata (água), atum em lata, frango inteiro/sobrecoxa/coxa, músculo bovino, acém, patinho moído, fígado bovino, coração bovino/de frango, moela, língua, lombo/pernil/paleta suína, tilápia.
- Laticínios preferenciais: leite integral, leite em pó integral (4 col em 200ml = leite reconstituído mais barato), kefir caseiro, queijo minas frescal.
- Fibras preferenciais: aveia em flocos, farelo de aveia, linhaça moída, semente de girassol.
- CHO preferenciais: arroz branco, batata inglesa, mandioca, inhame, pão francês, banana.
- Gorduras preferenciais: azeite (uso moderado), ovo inteiro, sementes (girassol/abóbora a granel).
- EVITE no Modo Econômico: salmão, camarão, alcatra/contrafilé, costela bovina, bacon, queijo cottage importado, pasta de amendoim premium, mel cru artesanal — substitua por equivalentes nutricionais de menor custo (ex: salmão → sardinha em lata; alcatra → patinho/acém; cottage → queijo minas; mel cru → mel comum em dose menor).
- MANTENHA todas as outras regras (rotação de proteínas, vísceras 2–3x/semana, ômega-3 via sardinha 3–4x/semana, temperos funcionais, fibras funcionais, regras de combinação obrigatórias).
- Inclua na resposta uma breve nota explicando 2–3 substituições de equivalência aplicadas (ex: "salmão → sardinha em lata: mesmo perfil EPA+DHA, custo ~80% menor").
` : ""}

${perfilFisiologico?.perfil_economico === "economico" ? `
🪙 PERFIL ECONÔMICO DO PLANO = ECONÔMICO — REGRAS OBRIGATÓRIAS DE SUBSTITUIÇÃO:

PROTEÍNAS — priorizar nesta ordem:
1. Ovo inteiro (base — 4–6/dia é protocolo elite, PDCAAS 1.0)
2. Sardinha/atum em lata (ômega-3 EPA+DHA barato — 3–4x/semana)
3. Fígado bovino (2–3x/semana — "nature's multivitamin": B12, ferro heme, vit A, CoQ10, colina)
4. Moela de frango (2–3x/semana — colágeno + glucosamina + condroitina + 26g proteína/100g)
5. Coração de frango ou bovino (CoQ10 superior a suplemento + ferro heme + B12)
6. Coxa/sobrecoxa de frango sem pele (mais barata e palatável que peito)
7. Língua bovina (1–2x/semana — proteína completa + alta palatabilidade)
8. Patinho moído / acém / músculo bovino (cortes populares de alto valor)
— Whey APENAS se já estiver na suplementação atual do paciente.

LATICÍNIOS — priorizar:
1. Leite em pó integral (4 colheres / 35g em 200ml água = 1 copo de leite integral concentrado, mais barato)
2. Leite integral (base de aveia — gordura estabiliza IG)
3. Iogurte natural integral SEM açúcar + 2 colheres de leite em pó batido = "iogurte grego caseiro" com custo ~3x menor
4. Queijo minas frescal (substituto cottage/ricota — caseína para pré-sono)

CARBOIDRATOS — incluir obrigatoriamente opções populares brasileiras:
1. Arroz branco + feijão (combinação completa de aminoácidos, baratíssima)
2. Mandioca / aipim cozido (substituta de batata-doce; amido resistente quando resfriada)
3. Inhame (IG baixo, prebiótico, vit B6)
4. Tapioca (apenas pós-treino — substituta de cream of rice)
5. Cuscuz nordestino (quando aplicável)
6. Pão francês (refeições rápidas)
— Mucilon e farinha láctea: APENAS no pós-treino imediato (alto IG), nunca em outras refeições.

GORDURAS — priorizar:
1. Azeite de oliva extra virgem comprado a granel (1–2 col sopa/refeição)
2. Amendoim torrado sem sal / pasta de amendoim integral (fonte mais barata de gordura + proteína vegetal)
3. Leite de coco (receitas de aveia e vitaminas calóricas)
4. Manteiga sem sal (1 col café no preparo — CLA + vit K2 + butirato)
— NUNCA prescrever castanha-do-pará, macadâmia, nozes premium ou MCT em pó no perfil econômico.

REGRA DE PALATABILIDADE DAS VÍSCERAS (obrigatório):
Sempre incluir instrução de preparo no campo "observacao" do alimento ao prescrever vísceras:
- Fígado: "Refogar com cebola roxa, alho amassado e suco de limão — limão neutraliza sabor forte."
- Moela: "Pressão 25–30min, depois refogar com temperos."
- Coração: "Espeto grelhado com cebola e pimentão — alta palatabilidade."

REGRA IOGURTE GREGO CASEIRO (incluir como observação quando prescrever lácteo proteico):
"Alternativa econômica: bater 200g de iogurte natural integral + 2 col sopa de leite em pó integral no liquidificador = iogurte grego caseiro com custo ~3x menor."

REGRA AVEIA + LÍQUIDO PROTEICO (perfil econômico):
"Preparar a aveia com leite em pó integral reconstituído (4 col em 200ml água) OU leite integral. Não usar água pura — a gordura do líquido retarda o IG e melhora saciedade."

HACKS DO COACH — incluir no campo "observacao_protocolo" do resumo, lista de 3–5 hacks de custo aplicados ao plano. Ex:
• "Iogurte grego caseiro: 200g iogurte natural + 2 col leite em pó = proteína equivalente, custo 3x menor"
• "Fígado 2x/semana elimina necessidade de multivitamínico (~R$80/mês de economia)"
• "Sardinha em lata 3x/semana = protocolo de ômega-3 completo sem suplemento"
• "Amendoim a granel = fonte mais barata de gordura + proteína vegetal do mercado"
• "Leite em pó na aveia = caloria densa + caseína + custo mínimo"
` : perfilFisiologico?.perfil_economico === "premium" ? `
💎 PERFIL ECONÔMICO DO PLANO = PREMIUM — sem restrição de orçamento.
Use as melhores fontes de cada categoria nutricional sem considerar custo (salmão, alcatra, whey isolado, oleaginosas premium, mel cru artesanal, kefir, azeite extra virgem premium, etc.). Vísceras podem aparecer pelo VALOR NUTRICIONAL, não por custo.
` : `
⚖️ PERFIL ECONÔMICO DO PLANO = INTERMEDIÁRIO (default).
Mescle alimentos econômicos com premium. Mantenha vísceras 1–2x/semana pelo valor nutricional. Whey 1x/dia padrão. Sardinha 2–3x/semana.
`}

${(perfilFisiologico?.alimentos_disponiveis || []).length > 0 || perfilFisiologico?.outros_alimentos ? `
🛒 ALIMENTOS PREFERIDOS DO PACIENTE (priorize estes itens quando equivalência nutricional permitir; não fique restrito a eles):
${(perfilFisiologico?.alimentos_disponiveis || []).join(", ")}${perfilFisiologico?.outros_alimentos ? ` | Outros: ${perfilFisiologico?.outros_alimentos}` : ""}
` : ""}

OUTROS DADOS:
- Restrições alimentares: ${restricoesStr || "Nenhuma"}
- Preferências alimentares: ${preferencias || "Não informadas"}
- Suplementação atual: ${suplementos || "Não informada"}
- Observações clínicas: ${observacoes || "Nenhuma"}

Aplique TODAS as regras de cálculo (Katch-McArdle, ajustes farmacológicos por composto, integração de cardio, fase de periodização). Use alimentos brasileiros acessíveis com gramagem precisa. Linguagem técnica de coach de competição.

Responda APENAS com JSON válido nesta estrutura exata:
{
  "resumo": {
    "nome": "string",
    "objetivo": "string (incluindo fase de periodização)",
    "calorias_totais": number,
    "proteina_total": number,
    "carboidrato_total": number,
    "gordura_total": number,
    "tmb": number,
    "get": number,
    "imc": "string",
    "observacao_protocolo": "string com resumo técnico do TDEE ajustado, fatores aplicados (farmacologia, cardio, fase) e split treino/descanso"
  },
  "refeicoes": [
    {
      "refeicao": "string",
      "horario": "string",
      "calorias": number,
      "macros": { "proteina": number, "carboidrato": number, "gordura": number },
      "alimentos": [
        {
          "alimento": "string",
          "quantidade": "string (${perfilFisiologico?.medidas_caseiras ? "MEDIDA CASEIRA, ex: '2 colheres de sopa cheias', '1 xícara de chá', '1 fatia média'" : "em gramas"})",
          "quantidade_g": "string (gramatura técnica em g, ex: '120g'${perfilFisiologico?.medidas_caseiras ? " — OBRIGATÓRIO quando medidas caseiras está ativo" : " — opcional, igual a 'quantidade'"})",
          "observacao": "string ou null",
          "substituicoes": [
            { "alimento": "string", "quantidade": "string ${perfilFisiologico?.medidas_caseiras ? "(medida caseira)" : "(em gramas)"}", "quantidade_g": "string (gramatura em g)", "observacao": "string ou null", "grupo": "proteina | carbo | gordura" }
          ]
        }
      ]
    }
  ],
  "suplementacao": [
    { "suplemento": "string", "dose": "string", "timing": "string", "justificativa": "string (ligar ao composto farmacológico quando aplicável)" }
  ],
  "dica_mce": {
    "mindset": "string",
    "comportamento": "string",
    "execucao": "string (incluir alertas farmacológicos e protocolo de cardio detalhado pré/durante/pós)"
  },
  "alerta_coach": "string com alertas farmacológicos críticos consolidados, ou null",
  "inteligencia_fisiologica": {
    "score_qualidade": number,
    "diversidade_vegetal_semanal": number,
    "fermentado_diario": boolean,
    "cycling_ativo": boolean,
    "protocolos_ativos": ["string"],
    "insights_coach": ["string"]
  }${perfilFisiologico?.medidas_caseiras ? `,
  "mapa_medidas_caseiras": {
    "ativo": true,
    "descricao": "Tabela de equivalência: cada medida caseira usada no plano e sua gramatura/volume exato. Use este mapa quando precisar converter para a balança.",
    "equivalencias": [
      { "medida": "string (ex: '1 colher de sopa cheia de arroz cozido')", "gramatura": "string (ex: '25g')", "alimento_referencia": "string (ex: 'arroz branco cozido')", "observacao": "string ou null" }
    ],
    "utensilios_padrao": [
      { "utensilio": "string (ex: 'Colher de sopa rasa')", "volume_ml": number, "peso_referencia_g": "string (ex: '10–15g sólidos secos / 10ml líquidos')" }
    ],
    "dica_paciente": "string curta orientando o paciente a usar a balança APENAS na primeira semana para calibrar o olho — depois, seguir pelas medidas caseiras."
  }` : ""}${perfilFisiologico?.modo_economico ? `,
  "custo_estimado": {
    "moeda": "BRL",
    "modo_economico_ativo": true,
    "custo_diario_economico": number,
    "custo_diario_padrao_equivalente": number,
    "economia_diaria": number,
    "economia_percentual": number,
    "custo_mensal_economico": number,
    "economia_mensal": number,
    "refeicoes": [
      { "refeicao": "string (mesmo nome da refeição)", "custo_economico": number, "custo_padrao": number, "economia": number }
    ],
    "premissas": "string curta com base de preços usada (ex: 'preços médios de mercado BR — atacado/feira, nov/2024')",
    "principais_substituicoes": [
      { "de": "string (alimento padrão)", "para": "string (alimento econômico)", "economia_aprox": "string (ex: ~70%)" }
    ]
  }` : ""}
}

${perfilFisiologico?.modo_economico ? `
💰 INSTRUÇÃO ADICIONAL — CÁLCULO DE CUSTO (OBRIGATÓRIO no Modo Econômico):
- Estime o custo de CADA refeição em REAIS (BRL) usando preços médios brasileiros realistas (atacado/feira/supermercado popular, base 2024).
- Para cada refeição, calcule também o "custo_padrao": quanto custaria a MESMA refeição usando os equivalentes nutricionais NÃO-econômicos (ex: salmão no lugar de sardinha, alcatra no lugar de patinho, cottage premium no lugar de minas, mel cru no lugar de mel comum, whey importado no lugar de ovo, frutas vermelhas importadas no lugar de banana). Mantenha as MESMAS gramagens nutricionais.
- Some os totais para "custo_diario_economico" e "custo_diario_padrao_equivalente". Calcule "economia_diaria", "economia_percentual" (1 casa decimal) e "custo_mensal_economico" / "economia_mensal" (× 30).
- Liste 3–5 "principais_substituicoes" mostrando a troca aplicada e a economia aproximada.
- Todos os valores numéricos em BRL, com no máximo 2 casas decimais. Sem string, apenas números no JSON.
` : ""}`;

    // Retry com backoff + fallback de modelo em caso de 503/timeout
    const MODELS_FALLBACK = ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
    let response: Response | null = null;
    let lastErrorStatus = 0;
    let lastErrorBody = "";

    outer: for (const model of MODELS_FALLBACK) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
            }),
          });

          if (response.ok) {
            console.log(`✅ AI gateway sucesso: ${model} (tentativa ${attempt + 1})`);
            break outer;
          }

          lastErrorStatus = response.status;
          lastErrorBody = await response.text();
          console.warn(`⚠️ AI gateway ${response.status} no modelo ${model} (tentativa ${attempt + 1}): ${lastErrorBody.substring(0, 200)}`);

          // Erros não-recuperáveis: sair imediatamente
          if (response.status === 429 || response.status === 402 || response.status === 401) {
            break outer;
          }
          // 503 / 5xx → retry com backoff
          if (response.status >= 500) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          // Outros 4xx → sai
          break outer;
        } catch (fetchErr) {
          console.warn(`⚠️ Fetch error modelo ${model} tentativa ${attempt + 1}:`, fetchErr instanceof Error ? fetchErr.message : fetchErr);
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
      }
      console.warn(`↪️ Trocando para próximo modelo após falhas em ${model}`);
    }

    if (!response || !response.ok) {
      if (lastErrorStatus === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Aguarde e tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (lastErrorStatus === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway falhou em todos os modelos. Último status:", lastErrorStatus, lastErrorBody.substring(0, 500));
      return new Response(JSON.stringify({
        error: "O serviço de IA está temporariamente indisponível (erro " + (lastErrorStatus || "rede") + "). Aguarde alguns segundos e tente novamente.",
      }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI response:", clean.substring(0, 500));
      throw new Error("Resposta da IA não é um JSON válido");
    }

    // ── Validação determinística do Pós-Treino Imediato (GLUT-4) ──
    // Permite 1+ carboidratos compatíveis combinados, mas garante:
    //   • a fonte principal prescrita pelo coach está presente
    //   • zero proteína e zero gordura adicionadas (filtra whey/leite/oleaginosas/etc)
    //   • soma de gramas de CHO bate o alvo (com tolerância ±5g; ajusta a fonte principal se necessário)
    if (glut4Config?.enabled && Array.isArray(parsed?.refeicoes)) {
      const isPosImediato = (nome: string) =>
        /p[óo]s[\s-]?treino\s*imediato|janela\s*glut|glut[\s-]?4/i.test(nome || "");

      const carbLabel = glut4Config.carb_source_label as string;
      const carbGrams =
        glut4Config.carb_grams ??
        (() => {
          const w = Number(peso) || 80;
          const base = glut4Config.uses_intra_malto ? w * 0.45 : w * 0.65;
          return Math.max(30, Math.min(100, Math.round(base / 5) * 5));
        })();

      // Carboidratos compatíveis permitidos no pós-treino imediato (alta/média absorção)
      const CARBS_COMPATIVEIS = [
        "tapioca", "mucilon", "dextrose", "maltodextrina", "malto", "mel", "rapadura",
        "doce de leite", "leite condensado", "geleia", "geléia", "açúcar", "acucar",
        "banana", "pão francês", "pao frances", "pão", "pao", "batata-doce", "batata doce",
        "arroz branco", "frutose", "glicose", "waxy maize", "ciclodextrina", "vitargo",
        "polvilho", "biju", "beiju", "água de coco", "agua de coco", "suco de uva",
        "suco de laranja", "purê de batata", "pure de batata", "cuscuz", "cream of rice",
      ];
      // Itens proibidos (proteína/gordura) — removidos automaticamente
      const PROIBIDOS = [
        "whey", "caseína", "caseina", "albumina", "frango", "peito", "atum", "sardinha",
        "carne", "patinho", "alcatra", "ovo", "clara", "iogurte", "queijo", "cottage",
        "ricota", "leite integral", "leite desnatado", "leite semi", "leite em pó",
        "leite em po", "manteiga", "azeite", "óleo", "oleo", "abacate", "amendoim",
        "castanha", "noz", "amêndoa", "amendoa", "macadâmia", "macadamia", "pasta de amendoim",
        "coco ralado", "leite de coco", "bacon", "salmão", "salmao", "tilápia", "tilapia",
        "leucina", "bcaa", "creatina", "colágeno", "colageno",
      ];
      const isCompativel = (nome: string) =>
        CARBS_COMPATIVEIS.some((c) => nome.toLowerCase().includes(c));
      const isProibido = (nome: string) =>
        PROIBIDOS.some((p) => nome.toLowerCase().includes(p));

      // Heurística simples para extrair gramas de uma string "30g", "45 g", "1 colher (15g)"
      const extrairGramasCho = (a: any): number => {
        // Se houver campo macros/cho explícito no item, prioriza
        if (typeof a?.cho === "number") return a.cho;
        if (typeof a?.carboidrato === "number") return a.carboidrato;
        const q = String(a?.quantidade || "");
        const matchCho = q.match(/(\d+(?:[.,]\d+)?)\s*g\s*(?:de\s*)?(?:cho|carboidrato)/i);
        if (matchCho) return parseFloat(matchCho[1].replace(",", "."));
        const matchG = q.match(/(\d+(?:[.,]\d+)?)\s*g/i);
        if (matchG) return parseFloat(matchG[1].replace(",", "."));
        return 0;
      };

      parsed.refeicoes = parsed.refeicoes.map((m: any) => {
        if (!isPosImediato(m?.refeicao || "")) return m;

        const inputAlimentos: any[] = Array.isArray(m?.alimentos) ? m.alimentos : [];
        const validacao: string[] = [];

        // 1) Filtra fora qualquer item proibido (proteína/gordura)
        let limpos = inputAlimentos.filter((a) => {
          const nome = String(a?.alimento || "");
          if (isProibido(nome)) {
            validacao.push(`removido: "${nome}" (proteína/gordura não permitida no pós-imediato)`);
            return false;
          }
          return true;
        });

        // 2) Mantém apenas carboidratos compatíveis
        let carbs = limpos.filter((a) => isCompativel(String(a?.alimento || "")));
        const naoCompat = limpos.filter((a) => !isCompativel(String(a?.alimento || "")));
        naoCompat.forEach((a) =>
          validacao.push(`removido: "${a.alimento}" (não é carboidrato compatível pós-treino)`),
        );

        // 3) Garante presença da fonte principal prescrita pelo coach
        const temPrincipal = carbs.some((a) =>
          String(a?.alimento || "").toLowerCase().includes(carbLabel.toLowerCase()),
        );
        if (!temPrincipal) {
          carbs.unshift({
            alimento: carbLabel,
            quantidade: `${carbGrams}g`,
            observacao: "Fonte principal prescrita pelo coach (adicionada pela validação).",
            substituicoes: [],
            cho: carbGrams,
          });
          validacao.push(`adicionado: fonte principal "${carbLabel}" estava ausente`);
        }

        // 4) Soma CHO total e ajusta a fonte principal se necessário (tolerância ±5g)
        let somaCho = carbs.reduce((acc, a) => acc + extrairGramasCho(a), 0);
        const delta = carbGrams - somaCho;
        if (Math.abs(delta) > 5) {
          // Ajusta a primeira ocorrência da fonte principal
          const idxPrincipal = carbs.findIndex((a) =>
            String(a?.alimento || "").toLowerCase().includes(carbLabel.toLowerCase()),
          );
          if (idxPrincipal >= 0) {
            const atual = extrairGramasCho(carbs[idxPrincipal]);
            const novo = Math.max(5, Math.round(atual + delta));
            carbs[idxPrincipal] = {
              ...carbs[idxPrincipal],
              quantidade: `${novo}g`,
              cho: novo,
              observacao:
                (carbs[idxPrincipal].observacao || "") +
                ` [ajustado de ${atual}g→${novo}g para bater alvo de ${carbGrams}g de CHO]`,
            };
            validacao.push(`ajustado: "${carbLabel}" ${atual}g → ${novo}g (alvo ${carbGrams}g)`);
            somaCho = carbs.reduce((acc, a) => acc + extrairGramasCho(a), 0);
          }
        }

        // 5) Adiciona L-leucina se prescrita (aminoácido isolado é permitido)
        if (glut4Config.add_leucine) {
          carbs.push({
            alimento: "L-Leucina isolada",
            quantidade: "2g",
            observacao: "mTORC1 isolado, sem competição de aminoácidos.",
            substituicoes: [],
            cho: 0,
          });
        }

        return {
          ...m,
          alimentos: carbs,
          calorias: Math.round(somaCho * 4),
          macros: { proteina: 0, carboidrato: Math.round(somaCho), gordura: 0 },
          validacao_pos_treino: validacao.length ? validacao : ["ok: combinação válida, alvo de CHO atingido"],
        };
      });
    }

    return new Response(JSON.stringify({ plan: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-coach-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
