import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `⛔ REGRA CRÍTICA — LER ANTES DE GERAR QUALQUER COISA:

AEJ (Aeróbico Em Jejum) = JEJUM TOTAL.
- AEJ NÃO é uma refeição.
- AEJ NÃO tem alimentos.
- AEJ NÃO tem calorias.
- AEJ NÃO aparece na lista de refeições do JSON.
- AEJ NÃO tem horário de refeição associado.

NUNCA crie refeição chamada (ou contendo) qualquer variação de:
- "AEJ"
- "Pré-AEJ"
- "AEJ com SLU-PP-332"
- "Refeição 1 (05:00 — AEJ)"
- Qualquer nome que mencione "AEJ" / "Aeróbico em Jejum" / "Aerobico em Jejum"

SLU-PP-332 (e qualquer composto pré-AEJ) é tomado em JEJUM, ANTES do cardio, SEM COMIDA — apenas o composto com água. NÃO é refeição, é suplemento. Cite-o em "suplementacao" ou "observacoes", JAMAIS como item do array "refeicoes".

ROTINA CORRETA QUANDO HÁ AEJ NO PROTOCOLO:
07:00 — Acorda
07:10 — Toma SLU-PP-332 com água (NÃO é refeição)
07:15 — Inicia cardio AEJ (jejum total)
08:15 — Termina cardio
08:30 — PRIMEIRA REFEIÇÃO DO DIA ← começa AQUI

A primeira refeição do dia é SEMPRE a partir das 08:30.
NUNCA antes das 08:00. NUNCA às 05:00, 06:00 ou 07:00.

═══════════════════════════════════════════════════════

Você é o NutriSync Elite, o gerador de planos alimentares mais avançado do Brasil para bodybuilding e atletas de alto rendimento. Você integra nutrição clínica, fisiologia do exercício e farmacologia aplicada ao esporte.

REGRAS DE CÁLCULO OBRIGATÓRIAS:

1. TDEE BASE: A fórmula de TMB é selecionada AUTOMATICAMENTE pelo motor (Mifflin-St Jeor, Harris-Benedict Revisada, Schofield, FAO/OMS, Cunningham ou Katch-McArdle) e o valor já vem pré-calculado no bloco "VALORES CALCULADOS DETERMINISTICAMENTE". NÃO recalcule TMB. NÃO troque a fórmula. Use o valor exato fornecido e apenas distribua os macros.

2. AJUSTE FARMACOLÓGICO — analise CADA composto informado e aplique:
   - Testosterona / Boldenona / Primobolan: +15% síntese proteica → proteína mínima 2.8g/kg MM. Volume alimentar maior.
   - Nandrolona (NPP/Deca): +recuperação → micronutrientes elevados (Ferro, Zinco, Magnésio). Citar fontes alimentares.
   - SLU-PP-332 (agonista ERR — exercício mimético): biogênese mitocondrial e oxidação de gordura. NÃO é GLP-1, NÃO suprime apetite. Aumenta gasto energético mitocondrial. Garantir ingestão calórica integral mesmo em dias de menor apetite. Suporte: CoQ10 200mg + PQQ 20mg + Ômega 3 4g/dia.
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
   - Bulk Limpo: TDEE + 10% FIXO (NÃO usar faixa 10–15%, NÃO arredondar para cima — superávit exato de 10%)
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
      // Novos campos para cálculo determinístico expandido
      neat,                  // "baixo" | "medio" | "alto"
      qualidadeSono,         // "boa" | "regular" | "ruim"
      semanasEmDeficit,      // number
      cyclingCarbo,          // boolean (já existia em perfilFisiologico)
    } = body;
    // Fallbacks para suportar payload antigo
    const _neat = neat ?? perfilFisiologico?.neat ?? "medio";
    const _qualidadeSono = qualidadeSono ?? perfilFisiologico?.qualidade_sono ?? "boa";
    const _semanasDef = Number(semanasEmDeficit ?? perfilFisiologico?.semanas_em_deficit ?? 0);
    const _cyclingCarbo = cyclingCarbo ?? perfilFisiologico?.cycling_carbo ?? false;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const imc = peso && altura ? (parseFloat(peso) / Math.pow(parseFloat(altura) / 100, 2)).toFixed(1) : "N/A";

    // ═══════════════════════════════════════════════════════════════
    // SELEÇÃO AUTOMÁTICA DE FÓRMULA TMB + cálculo de BF
    // (Mifflin / Harris-Benedict / Schofield / FAO-OMS / Cunningham / Katch-McArdle)
    // ═══════════════════════════════════════════════════════════════
    const calcularTMBCompleto = (f: any) => {
      const pesoN = Number(f.peso) || 0;
      const altN = Number(f.altura) || 0;
      const idadeN = Number(f.idade) || 0;
      const sexoNorm = String(f.sexo || "").toLowerCase();
      const isHomem = /masc|homem|^m/.test(sexoNorm);
      const imcN = pesoN && altN ? pesoN / Math.pow(altN / 100, 2) : 0;
      const anosTreino = Number(f.anosTreino) || 0;
      const atletaComp = !!f.atletaCompetitivo;
      const metodoBF = String(f.metodoBF || "nao_sei");

      // PASSO 1 — BF
      let bf: number | null = null;
      let metodo_bf = "nao_disponivel";
      let confiabilidade_bf: "alta" | "media-alta" | "media" | "baixa" = "baixa";
      let aviso_bf: string | null = null;

      if (metodoBF === "tenho_bf" && f.bfAtual && Number(f.bfAtual) > 0) {
        bf = Number(f.bfAtual);
        metodo_bf = "informado_coach";
        confiabilidade_bf = "alta";
      } else if (metodoBF === "navy" && f.circPescoco && f.circAbdomen) {
        const pescoco = Number(f.circPescoco);
        const abdomen = Number(f.circAbdomen);
        const quadril = Number(f.circQuadril) || 0;
        let bfCalc: number;
        if (isHomem) {
          bfCalc = 495 / (1.0324 - 0.19077 * Math.log10(abdomen - pescoco) + 0.15456 * Math.log10(altN)) - 450;
        } else {
          bfCalc = 495 / (1.29579 - 0.35004 * Math.log10(abdomen + quadril - pescoco) + 0.22100 * Math.log10(altN)) - 450;
        }
        if (atletaComp) bfCalc -= 3;
        else if (anosTreino >= 5) bfCalc -= 2;
        else if (anosTreino >= 3) bfCalc -= 1;
        bf = Math.max(4, Math.min(50, Math.round(bfCalc * 10) / 10));
        metodo_bf = "navy";
        confiabilidade_bf = "media-alta";
        aviso_bf = `BF estimado pelo Método Navy: ${bf}% (±3-4%)`;
      } else if (metodoBF === "visual" && f.perfilVisual) {
        const mapaM: Record<string, number> = {
          competicao: 5, definido_repouso: 9, atletico_contracao: 13,
          forma_boa: 18, forma_media: 23, acima_peso: 28, obesidade: 35,
        };
        const mapaF: Record<string, number> = {
          competicao: 12, definido_repouso: 16, atletico_contracao: 21,
          forma_boa: 26, forma_media: 31, acima_peso: 36, obesidade: 42,
        };
        const mapa = isHomem ? mapaM : mapaF;
        bf = mapa[String(f.perfilVisual)] ?? null;
        metodo_bf = "visual";
        confiabilidade_bf = "media";
        if (bf !== null) aviso_bf = `BF estimado visualmente: ${bf}% (±5%)`;
      } else {
        // Estimativa automática (Deurenberg ajustado)
        let bfCalc = (1.20 * imcN) + (0.23 * idadeN) - (10.8 * (isHomem ? 1 : 0)) - 5.4;
        if (atletaComp) bfCalc -= 8;
        else if (anosTreino >= 10) bfCalc -= 7;
        else if (anosTreino >= 5) bfCalc -= 5;
        else if (anosTreino >= 3) bfCalc -= 3;
        else if (anosTreino >= 1) bfCalc -= 1;
        bf = Math.max(4, Math.min(50, Math.round(bfCalc * 10) / 10));
        metodo_bf = "estimativa_automatica";
        confiabilidade_bf = "baixa";
        aviso_bf = `BF estimado automaticamente: ${bf}%. Recomendado informar BF real (bioimpedância, Navy ou DEXA) para maior precisão.`;
      }

      const massa_magra = bf !== null && pesoN > 0
        ? Math.round(pesoN * (1 - bf / 100) * 10) / 10
        : null;

      // PASSO 2 — fórmula TMB
      let tmb = 0;
      let formula = "";
      let justificativa = "";

      if (idadeN > 0 && idadeN < 18) {
        if (isHomem) {
          tmb = idadeN < 10 ? (22.7 * pesoN) + 495 : (17.5 * pesoN) + 651;
        } else {
          tmb = idadeN < 10 ? (22.5 * pesoN) + 499 : (12.2 * pesoN) + 746;
        }
        formula = "Schofield";
        justificativa = `Paciente ${idadeN} anos — Schofield validado para menores de 18 anos.`;
      } else if (idadeN >= 60) {
        tmb = isHomem
          ? 88.362 + (13.397 * pesoN) + (4.799 * altN) - (5.677 * idadeN)
          : 447.593 + (9.247 * pesoN) + (3.098 * altN) - (4.330 * idadeN);
        formula = "Harris-Benedict Revisada";
        justificativa = `Paciente ${idadeN} anos — Harris-Benedict mais precisa para idosos.`;
      } else if (imcN > 0 && imcN < 17) {
        tmb = isHomem ? (15.3 * pesoN) + 679 : (14.7 * pesoN) + 496;
        formula = "FAO/OMS";
        justificativa = `IMC ${imcN.toFixed(1)} — FAO/OMS indicada para baixo peso/desnutrição.`;
      } else if (atletaComp && bf !== null && bf < 10 && massa_magra !== null) {
        tmb = 500 + (22 * massa_magra);
        formula = "Cunningham";
        justificativa = `Atleta competitivo elite, BF ${bf}% < 10% — Cunningham mais preciso.`;
      } else if ((atletaComp || anosTreino >= 3) && bf !== null && massa_magra !== null && confiabilidade_bf !== "baixa") {
        tmb = 370 + (21.6 * massa_magra);
        formula = "Katch-McArdle";
        justificativa = `Atleta com BF ${bf}% (${metodo_bf}) — Katch-McArdle mais preciso.`;
      } else if (atletaComp || anosTreino >= 3) {
        const base = isHomem
          ? (10 * pesoN) + (6.25 * altN) - (5 * idadeN) + 5
          : (10 * pesoN) + (6.25 * altN) - (5 * idadeN) - 161;
        tmb = Math.round(base * 1.05);
        formula = "Mifflin-St Jeor (+5% atleta)";
        justificativa = `Atleta sem BF confiável — Mifflin com ajuste +5% para massa muscular. ${aviso_bf || ""} Recomendado medir BF para usar Katch-McArdle.`;
      } else {
        tmb = isHomem
          ? (10 * pesoN) + (6.25 * altN) - (5 * idadeN) + 5
          : (10 * pesoN) + (6.25 * altN) - (5 * idadeN) - 161;
        formula = "Mifflin-St Jeor";
        justificativa = "Fórmula padrão — mais validada para população geral.";
      }

      return {
        tmb: Math.round(tmb),
        formula,
        justificativa,
        bf,
        massa_magra,
        metodo_bf,
        confiabilidade_bf,
        aviso_bf,
        imc: imcN ? Math.round(imcN * 10) / 10 : 0,
      };
    };

    const resultadoTMB = calcularTMBCompleto(body);
    const massaMagra = resultadoTMB.massa_magra !== null ? String(resultadoTMB.massa_magra) : null;

    // ═══════════════════════════════════════════════════════════════
    // CÁLCULO DETERMINÍSTICO COMPLETO — TMB / GET / Macros / Cycling / Refeeding
    // BLOCOS 1–10. Mesmos inputs → mesmos valores SEMPRE.
    // ═══════════════════════════════════════════════════════════════
    const calc = (() => {
      const pesoNum = parseFloat(peso) || 0;
      const altNum = parseFloat(altura) || 0;
      const idadeNum = parseFloat(idade) || 0;
      if (!pesoNum || !altNum || !idadeNum) return null;

      // ── BLOCO 1: TMB — fórmula selecionada automaticamente ──
      // Pode ser Mifflin / Harris-Benedict / Schofield / FAO-OMS /
      // Cunningham / Katch-McArdle dependendo do perfil (idade, IMC, atleta, BF).
      const sexoNorm = String(sexo || "").toLowerCase();
      const isHomem = /masc|homem|m$|^m/i.test(sexoNorm);
      const tmb = resultadoTMB.tmb;

      // ── BLOCO 2: Fator de atividade ──
      const nivelRaw = String(nivelAtividade || "moderado").toLowerCase().trim();
      const FATORES: Record<string, number> = {
        sedentario: 1.2, sedentário: 1.2, sed: 1.2,
        leve: 1.375, levemente_ativo: 1.375,
        moderado: 1.55, moderadamente_ativo: 1.55, mod: 1.55,
        ativo: 1.725, intenso: 1.725,
        muito_ativo: 1.9, "muito ativo": 1.9, atleta: 1.9,
      };
      let fatorAtividade = 1.55;
      for (const k of Object.keys(FATORES)) {
        if (nivelRaw.includes(k)) { fatorAtividade = FATORES[k]; break; }
      }
      let getBase = tmb * fatorAtividade;

      // ── BLOCO 3: Cardio (somado ao GET base) ──
      let kcalCardio = 0;
      const flagsCardio: string[] = [];
      if (fazCardio && cardioNoCalculo) {
        const freqMatch = String(cardioFrequencia || "").match(/(\d+)/);
        const durMatch = String(cardioDuracao || "").match(/(\d+)/);
        const freqSemana = freqMatch ? parseInt(freqMatch[1]) : 0;
        const durMin = durMatch ? parseInt(durMatch[1]) : 0;
        if (freqSemana > 0 && durMin > 0) {
          kcalCardio = Math.round((freqSemana / 7) * durMin * 7);
          flagsCardio.push(`+${kcalCardio}kcal/dia (${freqSemana}×/sem × ${durMin}min × 7kcal/min ÷ 7)`);
          getBase += kcalCardio;
        }
      }

      // ── BLOCO 6: Protocolo farmacológico — DETECTOR COMPLETO COMPOSTOS ──
      // Normaliza o texto: lowercase, sem acentos
      const protoRaw = String(protocoloFarmacologico || protocStr || "");
      const protoStr = protoRaw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      type Composto = {
        keywords: string[];
        fator_get?: number;
        proteina_bonus_gkg?: number;
        carbo_delta_pct?: number;
        gordura_delta_pct?: number;
        gordura_min_pct?: number;
        categoria?: string;
        hepatotoxico?: boolean;
        alerta_critico?: boolean;
        alerta_cv?: boolean;
        refeicoes_minimo?: number;
        proteina_compensar_carbo?: boolean;
        micronutrientes?: string[];
        timing?: string;
        alerta?: string;
        alerta_ghrp6?: string;
      };

      const COMPOSTOS: Record<string, Composto> = {
        testosterona: { keywords:["testosterona","testosterone","enantato","cipionato","propionato","sustanon","omnadren","nebido","undecanoato","test e","test c","test p","test base","trt"], fator_get:1.12, proteina_bonus_gkg:0.20, categoria:"eaa", micronutrientes:["Zinco 25mg/dia","Vitamina D 5000UI/dia","Crucíferos diários (DIM natural)"], alerta:"Monitorar E2 — aromatização elevada.", gordura_min_pct:20 },
        nandrolona: { keywords:["nandrolona","nandrolone","npp","deca decanoato","fenilpropionato","deca-durabolin","deca durabolin","deca"], fator_get:1.06, proteina_bonus_gkg:0.10, categoria:"eaa", micronutrientes:["Colágeno hidrolisado 10g/dia","Vitamina C 1g/dia","Vitamina B6 100mg (prolactina)"], alerta:"Monitorar prolactina. Cabergolina se necessário." },
        boldenona: { keywords:["boldenona","boldenone","equipoise","eq","undecylenate","bold"], fator_get:1.08, proteina_bonus_gkg:0.10, categoria:"eaa", micronutrientes:["Ferro heme aumentado","Vitamina B6 50mg","Hidratação +500ml/dia"], alerta:"Hematócrito pode subir — hidratação aumentada obrigatória." },
        trembolona: { keywords:["trembolona","trenbolone","tren","parabolan","tren a","tren e","hexahidrobenzilcarbonato","acetato de trembolona"], fator_get:1.15, proteina_bonus_gkg:0.30, carbo_delta_pct:-5, categoria:"eaa", alerta_cv:true, micronutrientes:["Vitamina B6 100mg/dia","Taurina 3g/dia","Eletrólitos aumentados (sudorese noturna)"], alerta:"Trembolona eleva prolactina e causa sudorese noturna severa. Eletrólitos diários obrigatórios." },
        masteron: { keywords:["masteron","drostanolona","drostanolone","mast e","mast p"], fator_get:1.05, proteina_bonus_gkg:0.10, gordura_delta_pct:-3, categoria:"eaa", micronutrientes:["Ômega 3 3g/dia"], alerta:"Efeito anti-estrogênico leve. Manter gorduras boas no plano." },
        stanozolol: { keywords:["stanozolol","winstrol","estanozolol","winny","stan"], fator_get:1.08, proteina_bonus_gkg:0.15, categoria:"eaa", hepatotoxico:true, micronutrientes:["Ômega 3 4g/dia","Plant sterols 2g/dia","TUDCA 500mg/dia","Cardo Mariano 300mg/dia"], alerta:"Stanozolol impacta HDL severamente. Exame lipídico a cada 6 semanas." },
        oximetolona: { keywords:["oximetolona","oxymetholone","hemogenin","anapolon","anadrol"], fator_get:1.08, proteina_bonus_gkg:0.20, categoria:"eaa", hepatotoxico:true, micronutrientes:["TUDCA 500mg/dia OBRIGATÓRIO","Cardo Mariano 300mg/dia","Cúrcuma 500mg + Piperina","Beterraba diária","Crucíferos diários"], alerta:"⚠️ 17-alfa alquilado HEPATOTÓXICO. TUDCA 500mg obrigatório. ALT/AST a cada 4 semanas. Uso máximo 6 semanas." },
        oxandrolona: { keywords:["oxandrolona","oxandrolone","anavar","var","oxan"], fator_get:1.06, proteina_bonus_gkg:0.10, categoria:"eaa", micronutrientes:["Ômega 3 3g/dia","Plant sterols 1g/dia"], alerta:"Impacto lipídico moderado. Exame lipídico recomendado." },
        dianabol: { keywords:["dianabol","dbol","metandrostenolona","methandrostenolone","naposim","metandienona"], fator_get:1.08, proteina_bonus_gkg:0.20, categoria:"eaa", hepatotoxico:true, micronutrientes:["TUDCA 500mg/dia OBRIGATÓRIO","Cardo Mariano 300mg/dia","Sódio controlado no plano"], alerta:"⚠️ 17-alfa alquilado. TUDCA obrigatório. Retenção hídrica — sódio controlado." },
        primobolan: { keywords:["primobolan","metenolona","methenolone","primo"], fator_get:1.06, proteina_bonus_gkg:0.10, categoria:"eaa", micronutrientes:["Ômega 3 2g/dia"], alerta:"Perfil lipídico favorável. Excelente para cutting — manter proteína alta." },
        ostarine: { keywords:["ostarine","mk-2866","mk2866","enobosarm","ostarina"], fator_get:1.05, proteina_bonus_gkg:0.10, categoria:"sarm", micronutrientes:["Zinco 15mg/dia","Vitamina D 3000UI"], alerta:"Supressão leve. PCT leve pós-ciclo. Exame hormonal pós-ciclo." },
        lgd4033: { keywords:["lgd-4033","lgd4033","ligandrol","lgd"], fator_get:1.08, proteina_bonus_gkg:0.15, categoria:"sarm", micronutrientes:["Ômega 3 3g/dia (suporte lipídico)"], alerta:"Supressão moderada. PCT necessária. Monitorar HDL." },
        rad140: { keywords:["rad-140","rad140","testolone","rad"], fator_get:1.10, proteina_bonus_gkg:0.20, categoria:"sarm", micronutrientes:["Suporte hepático leve recomendado"], alerta:"Mais androgênico dos SARMs. Supressão significativa. PCT obrigatória." },
        mk677: { keywords:["mk-677","mk677","ibutamoren","nutrobal"], fator_get:1.08, proteina_bonus_gkg:0.10, carbo_delta_pct:5, categoria:"sarm", micronutrientes:["Magnésio 300mg/dia","Zinco 15mg/dia"], alerta:"MK-677 aumenta fome (grelina). Monitorar glicemia em jejum. Cuidado com excesso calórico." },
        cardarine: { keywords:["gw-501516","gw501516","cardarine","endurobol"], fator_get:1.10, carbo_delta_pct:8, categoria:"sarm", micronutrientes:["Antioxidantes aumentados","Vitamina E 400UI"], alerta:"Cardarine — oxidação de gordura aumentada. Garantir calorias suficientes." },
        sr9009: { keywords:["sr9009","sr-9009","stenabolic"], fator_get:1.08, categoria:"sarm", micronutrientes:["CoQ10 100mg/dia"], alerta:"SR9009 aumenta metabolismo basal. Garantir calorias suficientes." },
        yk11: { keywords:["yk-11","yk11"], fator_get:1.10, proteina_bonus_gkg:0.20, categoria:"sarm", hepatotoxico:true, micronutrientes:["TUDCA 500mg recomendado"], alerta:"YK-11 estrutura esteroidal — hepatotóxico possível. TUDCA recomendado." },
        cjc1295: { keywords:["cjc-1295","cjc1295","cjc","mod-grf","sermorelin","tesamorelin","cjc 1295"], fator_get:1.05, proteina_bonus_gkg:0.10, categoria:"peptideo_gh", micronutrientes:["Magnésio 300mg à noite","Zinco 15mg à noite"], timing:"Aplicar em jejum ou 2h+ pós-refeição. Não comer 30-40min após.", alerta:"GH secretagogo — janela de jejum obrigatória para pico de GH." },
        ipamorelin: { keywords:["ipamorelin","ipamorelim","ghrp-2","ghrp2","ghrp-6","ghrp6","hexarelin","pralmorelin"], fator_get:1.04, proteina_bonus_gkg:0.05, categoria:"peptideo_gh", micronutrientes:["Magnésio 200mg","Zinco 10mg"], timing:"Aplicar em jejum. Não comer 30min após.", alerta_ghrp6:"GHRP-6 aumenta fome agressivamente — planejar refeição pós-aplicação." },
        igf1: { keywords:["igf-1","igf1","igf-1 des","igf1des","igf1-des","igf-1 lr3","igf1lr3","igf des","des igf"], fator_get:1.03, proteina_bonus_gkg:0.40, categoria:"peptideo_gh", micronutrientes:["Dextrose disponível sempre (anti-hipoglicemia)"], timing:"IGF-1 Des — meia-vida 20-30min (ação local). Aplicar IMEDIATAMENTE PÓS-TREINO (janela 0-5min após o término, NUNCA pré-treino). Refeição 25-30min após injeção: 40-50g whey isolado + 30-40g carbo simples + ZERO gordura + ZERO fibra (não atrasar absorção de AA nem esvaziamento gástrico).", alerta:"⚠️ IGF-1 Des: aplicar PÓS-TREINO (não pré). Risco de hipoglicemia local — sempre ter dextrose disponível. Refeição pós-aplicação obrigatória em 25-30min." },
        bpc157: { keywords:["bpc-157","bpc157","bpc"], fator_get:1.00, categoria:"peptideo_recuperacao", micronutrientes:["Glutamina 10g/dia","Colágeno 10g/dia","Vitamina C 1g/dia"], alerta:"BPC-157 potencializa cicatrização intestinal. Glutamina + colágeno para sinergia." },
        tb500: { keywords:["tb-500","tb500","thymosin beta","tb 500"], fator_get:1.00, categoria:"peptideo_recuperacao", micronutrientes:["Colágeno 10g/dia","Proteína alta mínima 2g/kg"], alerta:"TB-500 — suporte tecidual. Colágeno + proteína alta para sinergia." },
        slupp332: { keywords:["slu-pp-332","slupp332","slu332","slu pp 332","slu-pp"], fator_get:1.08, carbo_delta_pct:5, categoria:"peptideo_mitocondrial", micronutrientes:["CoQ10 200mg/dia","PQQ 20mg/dia","Ômega 3 4g/dia"], alerta:"Exercício mimético mitocondrial. Aumentar carbo complexo. Aplicar pré-treino." },
        motsc: { keywords:["mots-c","motsc","mots c"], fator_get:1.06, categoria:"peptideo_mitocondrial", micronutrientes:["CoQ10 100mg/dia","PQQ 10mg/dia"], alerta:"MOTS-c ativa AMPK. Aplicar pré-cardio para maximizar oxidação de gordura." },
        epithalon: { keywords:["epithalon","epitalon","epithalamin"], fator_get:1.00, categoria:"peptideo_longevidade", micronutrientes:["Vitamina C 1g/dia","Resveratrol 200mg","NMN 250mg","Ômega 3 2g/dia"], alerta:"Epithalon longevidade — sinergia com antioxidantes e NMN." },
        glp1: { keywords:["semaglutida","semaglutide","ozempic","wegovy","retatrutida","retatrutide","tirzepatida","tirzepatide","mounjaro","liraglutida","liraglutide","victoza","rybelsus","glp-1","glp1"], fator_get:0.92, refeicoes_minimo:5, categoria:"glp1", micronutrientes:["Proteína em todas refeições (anti-sarcopenia)"], alerta:"GLP-1 — fracionar refeições. Priorizar proteína primeiro em cada refeição. Monitorar déficit proteico." },
        folistatina: { keywords:["folistatina","follistatin","fs-344","fs344"], fator_get:1.08, proteina_bonus_gkg:0.30, categoria:"peptideo_anabolico", micronutrientes:["Proteína a cada 3h (janela anabólica contínua)"], alerta:"Folistatina inibe miostatina — janela anabólica extrema. Proteína distribuída a cada 3h." },
        clenbuterol: { keywords:["clenbuterol","clen","clembuterol"], fator_get:1.07, proteina_bonus_gkg:0.30, carbo_delta_pct:-5, categoria:"estimulante", micronutrientes:["Taurina 3g/dia OBRIGATÓRIO","Potássio aumentado","Magnésio 400mg/dia"], alerta:"Clenbuterol catabólico após 2 semanas. Proteína mínima 2.5g/kg. Taurina obrigatória (previne cãibras)." },
        t3t4: { keywords:["t3","t4","citomed","cytomel","liotironina","liothyronine","levotiroxina","levothyroxine","synthroid"], fator_get:1.08, proteina_bonus_gkg:0.30, categoria:"hormonio_tireoide", micronutrientes:["Selênio 200mcg/dia","Iodo alimentar"], alerta:"T3 exógeno é catabólico em excesso. Proteína mínima 2.5g/kg obrigatório. Nunca em déficit sem base anabólica." },
        metformina: { keywords:["metformina","metformin","glifage","glucophage"], fator_get:1.00, carbo_delta_pct:-10, proteina_compensar_carbo:true, categoria:"sensibilizador", micronutrientes:["B12 sublingual 1000mcg/dia OBRIGATÓRIO","Folato 400mcg/dia","Magnésio 200mg/dia"], alerta:"⚠️ Metformina depleta B12. Suplementação sublingual obrigatória." },
        berberina: { keywords:["berberina","berberine"], fator_get:1.00, carbo_delta_pct:-7, categoria:"sensibilizador", micronutrientes:["B12 monitorar"], alerta:"Berberina — tomar 500mg antes das 3 maiores refeições." },
        insulina: { keywords:["insulina","insulin","humulin","novolog","humalog","nph","glargina","lantus","novorapid"], fator_get:1.20, carbo_delta_pct:20, proteina_bonus_gkg:0.20, categoria:"insulina", alerta_critico:true, micronutrientes:["Dextrose SEMPRE disponível"], alerta:"⛔ INSULINA EXÓGENA — RISCO DE VIDA. Nunca em jejum. Dextrose sempre disponível. Refeição com 60-80g carbo imediatamente após aplicação." },
        cafeina: { keywords:["cafeina","caffeine"], fator_get:1.03, categoria:"estimulante", micronutrientes:["Hidratação +500ml/dia","Magnésio 200mg"], alerta:"Cafeína depleta magnésio. Não usar após 14h (sono)." },
        cabergolina: { keywords:["cabergolina","cabergoline","dostinex","caber"], fator_get:1.00, categoria:"dopaminergico", micronutrientes:[], alerta:"Tomar com alimento para reduzir náusea." },
        ia_aromatase: { keywords:["anastrozol","anastrozole","arimidex","letrozol","letrozole","femara","exemestane","exemestano","aromasin"], fator_get:1.00, gordura_min_pct:25, categoria:"ia", micronutrientes:["Gorduras boas aumentadas (estrogênio baixo)"], alerta:"Manter gorduras saudáveis altas. Estradiol muito baixo prejudica anabolismo, libido e sono." },
        dnp: { keywords:["dnp","dinitrofenol","dinitrophenol"], fator_get:1.40, carbo_delta_pct:20, categoria:"desacoplador", alerta_critico:true, micronutrientes:["Eletrólitos a cada 2h","Vitamina C 2g","Vitamina E 400UI","Hidratação 6-8L/dia"], alerta:"⛔ DNP — RISCO DE VIDA. Hipertermia fatal possível. Hidratação extrema obrigatória." },
      };

      let multFarm = 1.0;
      let proteinaBonusGkg = 0;
      let carboDeltaPct = 0;
      let gorduraDeltaPct = 0;
      let gorduraMinPct = 20;
      let usaIgf1 = false;
      let usaGlp1 = false;
      let usaMetformina = false;
      let hepatotoxicoCount = 0;
      let refeicoesMinimoFarm = 0;
      let proteinaCompensarCarbo = false;
      const compostosDetectados: string[] = [];
      const compostosDetectadosSet = new Set<string>();
      const fatorFarmaDetalhado: { composto: string; fator: number }[] = [];
      const micronutrientesFarm: string[] = [];
      const alertasFarm: string[] = [];
      const alertasCriticosFarm: string[] = [];
      const timingsFarm: string[] = [];
      const flagsFarm: string[] = [];

      for (const [nome, c] of Object.entries(COMPOSTOS)) {
        const detectado = c.keywords.some(kw => protoStr.includes(kw));
        if (!detectado) continue;
        // EVITAR DUPLICIDADE — cada composto contado apenas UMA vez
        if (compostosDetectadosSet.has(nome)) continue;
        compostosDetectadosSet.add(nome);
        compostosDetectados.push(nome);
        fatorFarmaDetalhado.push({ composto: nome, fator: c.fator_get ?? 1.0 });
        if (c.fator_get) multFarm *= c.fator_get;
        if (c.proteina_bonus_gkg) proteinaBonusGkg += c.proteina_bonus_gkg;
        if (c.carbo_delta_pct) carboDeltaPct += c.carbo_delta_pct;
        if (c.gordura_delta_pct) gorduraDeltaPct += c.gordura_delta_pct;
        if (c.gordura_min_pct && c.gordura_min_pct > gorduraMinPct) gorduraMinPct = c.gordura_min_pct;
        if (c.micronutrientes) micronutrientesFarm.push(...c.micronutrientes);
        if (c.alerta) {
          if (c.alerta_critico) alertasCriticosFarm.push(c.alerta);
          else alertasFarm.push(c.alerta);
        }
        if (c.alerta_ghrp6 && /ghrp-?6/.test(protoStr)) alertasFarm.push(c.alerta_ghrp6);
        if (c.timing) timingsFarm.push(c.timing);
        if (c.hepatotoxico) hepatotoxicoCount++;
        if (c.refeicoes_minimo && c.refeicoes_minimo > refeicoesMinimoFarm) refeicoesMinimoFarm = c.refeicoes_minimo;
        if (c.proteina_compensar_carbo) proteinaCompensarCarbo = true;
        if (nome === "igf1") usaIgf1 = true;
        if (nome === "glp1") usaGlp1 = true;
        if (nome === "metformina") usaMetformina = true;
        flagsFarm.push(`${nome} ×${(c.fator_get ?? 1).toFixed(2)}${c.proteina_bonus_gkg ? ` +${c.proteina_bonus_gkg}g·kg` : ""}${c.carbo_delta_pct ? ` CHO${c.carbo_delta_pct > 0 ? "+" : ""}${c.carbo_delta_pct}%` : ""}`);
      }

      // ── DIMINISHING RETURNS + CAP ESCALONADO POR Nº DE COMPOSTOS ──
      // Mecanismos farmacológicos se sobrepõem na prática clínica.
      // Fator matemático puro (produtório) superestima o gasto real.
      const fatorFarmaBruto = multFarm; // produto matemático puro
      const numCompostos = compostosDetectados.length;
      // Reduz 3% por composto acima de 3 (sobreposição de mecanismos)
      if (numCompostos >= 4) {
        const reducao = (numCompostos - 3) * 0.03;
        multFarm = multFarm * (1 - reducao);
      }
      // Caps escalonados baseados em protocolos clínicos reais
      const CAPS_FARMA: Record<number, number> = {
        0: 1.00,
        1: 1.12,
        2: 1.20,
        3: 1.28,
        4: 1.35,
        5: 1.40,
        6: 1.45,
        7: 1.48,
        8: 1.50, // 8+ compostos — cap final
      };
      const capAplicado = CAPS_FARMA[Math.min(numCompostos, 8)] ?? 1.50;
      multFarm = Math.min(multFarm, capAplicado);
      multFarm = Math.round(multFarm * 1000) / 1000;
      const notaFatorFarma = numCompostos > 0
        ? `Fator farmacológico: ×${multFarm} (${numCompostos} composto${numCompostos > 1 ? "s" : ""} — cap escalonado ×${capAplicado} com diminishing returns aplicado). Fator matemático bruto seria ×${fatorFarmaBruto.toFixed(3)}, mas mecanismos se sobrepõem na prática clínica.`
        : null;

      if (hepatotoxicoCount >= 2) {
        alertasCriticosFarm.push(
          "⛔ MÚLTIPLOS COMPOSTOS HEPATOTÓXICOS DETECTADOS. " +
          "TUDCA 1000mg/dia + Cardo Mariano 600mg/dia + " +
          "ALT/AST quinzenais obrigatórios. " +
          "Consulta hepatologista recomendada."
        );
      }

      // Compatibilidade com BLOCO 6 antigo (gordura −3% por GH)
      let gorduraReducaoPct = 0;
      if (compostosDetectados.includes("cjc1295") || compostosDetectados.includes("ipamorelin")) {
        gorduraReducaoPct -= 0.03;
      }

      // ── ORDEM CORRETA DE APLICAÇÃO DOS FATORES ──
      // 1. TMB (Mifflin) → 2. atividade → 3. cardio (SOMA) → 4. farma (MULT)
      // 5. TEF: NÃO multiplicar (já embutido no fator atividade) → 6. NEAT só se NÃO atleta
      //
      // getBase neste ponto = TMB × atividade + kcal_cardio (cardio já somado no BLOCO 3)
      const getComCardio = getBase;

      // ── BLOCO 4: FARMACOLÓGICO (multiplicar sobre get_com_cardio) ──
      // multFarm já vem com diminishing returns + cap escalonado aplicado.
      const fatorFarmaCap = multFarm;
      const getFarmaCalc = getComCardio * fatorFarmaCap;

      // ── BLOCO 5: TEF — REMOVIDO como fator multiplicativo ──
      // TEF real (~10%) já está embutido no fator de atividade Mifflin-St Jeor.
      // Não aplicar multiplicação adicional para evitar acúmulo exponencial.
      const fatorTef = 1.0;

      // ── BLOCO 6: NEAT — só aplicar se NÃO for atleta ativo ──
      // Para nivelAtividade = ativo (1.725) ou muito_ativo (1.9), NEAT já está embutido.
      const isAtletaAtivo = ["ativo", "muito_ativo"].some(k => nivelRaw.includes(k));
      const NEAT_MULT: Record<string, number> = { baixo: 1.0, medio: 1.03, médio: 1.03, alto: 1.06 };
      const fatorNeat = isAtletaAtivo ? 1.0 : (NEAT_MULT[String(_neat).toLowerCase()] ?? 1.0);
      const getFinal = getFarmaCalc * fatorNeat;

      // Compatibilidade com nomes anteriores
      getBase = getComCardio; // mantém semântica para logs antigos (TMB×atividade+cardio)
      let getFarmaPreTef = getFinal; // TEF não mais multiplicativo

      // ── BLOCO 7: Macros por objetivo ──
      const objLower = String(objetivo || "").toLowerCase();
      const faseLower = String(fasePeriodizacao || "").toLowerCase();
      const protBaseGkg = 2.2;
      let protGkgFinal = Math.min(3.2, protBaseGkg + proteinaBonusGkg);

      let perfilObj = "manutencao";
      let multObj = 1.0;
      let pctGordura = 0.30;

      if (/peak[_ ]?week|peak/.test(faseLower)) {
        perfilObj = "peak_week"; multObj = 0.90; pctGordura = 0.15; protGkgFinal = Math.max(protGkgFinal, 2.5);
      } else if (/bulk_agressivo|bulk agressivo|bulk_pesado/.test(faseLower) || /bulk_agress/.test(objLower)) {
        perfilObj = "bulk_agressivo"; multObj = 1.20; pctGordura = 0.30; // ↑ 28→30 (precursor hormonal)
      } else if (/bulk|hipertrof|massa|ganho/.test(objLower) || /bulk/.test(faseLower)) {
        perfilObj = "bulk_limpo"; multObj = 1.10; pctGordura = 0.28; // ↑ 25→28 (precursor hormonal)
      } else if (/cut|emagrec|perda|defici|seca/.test(objLower) || /cut/.test(faseLower)) {
        perfilObj = "cutting"; multObj = 0.80; pctGordura = 0.25;
        protGkgFinal = Math.max(protGkgFinal, 2.4);
      } else if (/recomp/.test(objLower) || /recomp/.test(faseLower)) {
        perfilObj = "recomposicao"; multObj = 1.0; pctGordura = 0.28;
      } else {
        perfilObj = "manutencao"; multObj = 1.0; pctGordura = 0.30;
        protGkgFinal = 2.0; // override conforme spec
      }
      // CAP final de proteína g/kg (após eventuais Math.max acima)
      protGkgFinal = Math.min(protGkgFinal, 3.2);

      // ── BLOCO 4: TEF — DESATIVADO como multiplicador (já embutido no fator atividade) ──
      const aplicaTef = false;
      const getFarma = getFarmaPreTef; // sem TEF multiplicativo

      // Reduções farmacológicas em pctGordura (BLOCO 6 — GH)
      pctGordura = Math.max(0.10, pctGordura + gorduraReducaoPct);

      // Meta calórica
      let metaKcal = Math.round(getFarma * multObj);

      // ── BLOCO 10: Sono ruim → meta × 0.95 ──
      const sonoLower = String(_qualidadeSono).toLowerCase();
      const sonoRuim = /ruim|< ?5h|menos de 5|fragmentado/.test(sonoLower) ||
                       (/regular/.test(sonoLower) && /< ?6/.test(sonoLower));
      let carboNoturnoBonus = 0;
      if (sonoRuim) {
        metaKcal = Math.round(metaKcal * 0.95);
        carboNoturnoBonus = 30;
      }

      // Override: meta calórica do coach SEMPRE prevalece
      const metaCoach = calorias ? Number(calorias) : null;
      const metaSourceCoach = !!(metaCoach && metaCoach > 0);
      if (metaSourceCoach) metaKcal = Math.round(metaCoach as number);

      // Aplicar piso mínimo de gordura (ex: IA aromatase exige 25%) e delta % farma
      pctGordura = Math.max(pctGordura, gorduraMinPct / 100);
      pctGordura = Math.max(0.10, pctGordura + (gorduraDeltaPct / 100));

      // Macros
      let proteinaG = Math.round(pesoNum * protGkgFinal);
      let gorduraG = Math.round((metaKcal * pctGordura) / 9);
      let kcalRestante = metaKcal - (proteinaG * 4 + gorduraG * 9);
      let carboG = Math.max(0, Math.round(kcalRestante / 4));

      // Aplicar delta % de carbo farmacológico (somatório de todos os compostos detectados)
      if (carboDeltaPct !== 0 && carboG > 0) {
        const carboAntes = carboG;
        carboG = Math.max(0, Math.round(carboG * (1 + carboDeltaPct / 100)));
        // Compensar em proteína se algum composto pediu (ex: metformina)
        if (proteinaCompensarCarbo) {
          const carboRetiradoG = carboAntes - carboG;
          if (carboRetiradoG > 0) proteinaG += carboRetiradoG;
        }
      }

      // CARBOIDRATO MÍNIMO (4g/kg) — exceto cutting agressivo / peak week
      if (!/cutting|peak/.test(perfilObj)) {
        const carboMin = Math.round(pesoNum * 4);
        if (carboG < carboMin) carboG = carboMin;
      }

      // ── CAP DE CARBO (palatabilidade) — excesso vai para gordura ──
      const CARBO_CAP_G: Record<string, number> = {
        bulk_limpo: 900,
        bulk_agressivo: 1000,
        cutting: 400,
        emagrecimento: 350,
        recomposicao: 500,
        manutencao: 600,
        manutencao_offseason: 600,
        peak_week: 800,
      };
      let ajusteCarboCap: any = null;
      const capAtual = CARBO_CAP_G[perfilObj];
      if (capAtual && carboG > capAtual) {
        const carboOriginal = carboG;
        const excessoG = carboG - capAtual;
        const excessoKcal = excessoG * 4;
        const gorduraBonusG = Math.round(excessoKcal / 9);
        carboG = capAtual;
        gorduraG = gorduraG + gorduraBonusG;
        ajusteCarboCap = {
          carbo_original: carboOriginal,
          carbo_ajustado: carboG,
          gordura_bonus: gorduraBonusG,
          motivo: "Cap de palatabilidade aplicado — excesso transferido para gordura",
        };
      }

      // ── SANIDADE: total calórico não pode estourar GET farma × 1.20 ──
      // Se passar, recalcular forçando meta = getFarma × multObj e gordura = pct × meta.
      if (!metaSourceCoach) {
        const totalCalculado = (proteinaG * 4) + (gorduraG * 9) + (carboG * 4);
        if (totalCalculado > getFarma * 1.20) {
          console.error('[SANIDADE] Total calórico muito alto — recalculando:', {
            total_calculado: totalCalculado,
            get_farma: Math.round(getFarma),
            limite: Math.round(getFarma * 1.20),
          });
          metaKcal = Math.round(getFarma * multObj);
          gorduraG = Math.round((metaKcal * pctGordura) / 9);
          const carboKcalCorrigido = metaKcal - (proteinaG * 4) - (gorduraG * 9);
          carboG = Math.max(0, Math.round(carboKcalCorrigido / 4));
        }
      }

      // ── BLOCO 8: Cycling de carboidrato ──
      let cyclingPlan: any = null;
      if (_cyclingCarbo) {
        const choPesado = carboG;
        const choLeve = Math.round(carboG * 0.70);
        const choDescanso = Math.round(carboG * 0.60);
        const gAjLeve = Math.round(((choPesado - choLeve) * 4) / 9);
        const gAjDescanso = Math.round(((choPesado - choDescanso) * 4) / 9);
        cyclingPlan = {
          dia_treino_pesado: { carbo_g: choPesado, gordura_g: gorduraG, proteina_g: proteinaG, kcal: metaKcal },
          dia_treino_leve:    { carbo_g: choLeve,    gordura_g: gorduraG + gAjLeve,    proteina_g: proteinaG, kcal: metaKcal },
          dia_descanso:       { carbo_g: choDescanso, gordura_g: gorduraG + gAjDescanso, proteina_g: proteinaG, kcal: metaKcal },
        };
      }

      // ── BLOCO 9: Refeeding (cutting + ≥4 semanas em déficit) ──
      let refeedingPlan: any = null;
      if (perfilObj === "cutting" && _semanasDef >= 4) {
        const refCarbo = Math.round(carboG * 1.25);
        const refGord = gorduraG;
        const refProt = proteinaG;
        const refKcal = refCarbo * 4 + refGord * 9 + refProt * 4;
        refeedingPlan = {
          ativo: true,
          frequencia: "1×/semana",
          carbo_g: refCarbo, gordura_g: refGord, proteina_g: refProt, kcal: refKcal,
          objetivo_fisiologico: "Reset de leptina, T3 e mTOR",
        };
      }

      // GLP-1 e outros compostos com refeicoes_minimo (ex: GLP-1 = 5)
      const minRefFarm = Math.max(refeicoesMinimoFarm, usaGlp1 ? 5 : 0);
      const refeicoesRecomendadas = minRefFarm > 0
        ? Math.max(Number(refeicoes) || minRefFarm, minRefFarm)
        : (Number(refeicoes) || 5);

      // Recalcular meta_kcal real após ajustes de macros (carbo mínimo, deltas farma)
      const metaKcalReal = (proteinaG * 4) + (gorduraG * 9) + (carboG * 4);
      // Se a meta foi definida pelo coach, mantemos exibição alinhada à coach,
      // mas o valor "real" das somas é metaKcalReal (usado para validar refeições).
      const metaKcalExibida = metaSourceCoach ? metaKcal : metaKcalReal;

      const protPct = Math.round(((proteinaG * 4) / metaKcalExibida) * 100);
      const carbPct = Math.round(((carboG * 4) / metaKcalExibida) * 100);
      const fatPct  = Math.round(((gorduraG * 9) / metaKcalExibida) * 100);

      return {
        tmb: Math.round(tmb),
        fatorAtividade,
        nivelAtividadeNorm: nivelRaw,
        kcalCardio,
        flagsCardio,
        fatorNeat,
        neatNorm: String(_neat).toLowerCase(),
        getBase: Math.round(getBase),       // Já com cardio + NEAT
        multFarm,
        fatorFarmaBruto: Math.round(fatorFarmaBruto * 1000) / 1000,
        fatorFarmaCapAplicado: capAplicado,
        notaFatorFarma,
        flagsFarm,
        fatorTef,
        getFarma: Math.round(getFarma),
        perfilObj,
        multObj,
        protGkgFinal: Math.round(protGkgFinal * 100) / 100,
        proteinaBonusGkg,
        gorduraReducaoPct,
        usaMetformina, usaIgf1, usaGlp1,
        sonoRuim, carboNoturnoBonus,
        semanasEmDeficit: _semanasDef,
        metaKcal: metaKcalExibida,
        metaKcalReal,
        metaSourceCoach,
        proteinaG, carboG, gorduraG,
        protPct, carbPct, fatPct,
        pctGordura,
        cyclingPlan, refeedingPlan,
        refeicoesRecomendadas,
        // ── Novos campos do detector COMPOSTOS ──
        compostosDetectados,
        fatorFarmaDetalhado,
        carboDeltaPct,
        gorduraDeltaPct,
        gorduraMinPct,
        hepatotoxicoCount,
        micronutrientesFarm: [...new Set(micronutrientesFarm)],
        alertasFarm,
        alertasCriticosFarm,
        timingsFarm,
        ajusteCarboCap,
      };
    })();

    // ── AJUSTE BF VISUAL com retentores hídricos (testo, nandro, dianabol, oxime) ──
    // Aplicado APÓS o detector farmacológico para conhecer os compostos.
    {
      const compostosRetentores = ["testosterona", "nandrolona", "dianabol", "oximetolona"];
      const detectados = (calc?.compostosDetectados || []).map((c: string) => c.toLowerCase());
      const temRetentor = compostosRetentores.some((c) => detectados.includes(c));
      if (resultadoTMB.metodo_bf === "visual" && temRetentor && resultadoTMB.bf !== null) {
        const bfOriginal = resultadoTMB.bf;
        const bfAjustado = bfOriginal + 3;
        resultadoTMB.bf = bfAjustado;
        const pesoNumLocal = parseFloat(String(body?.peso || "0")) || 0;
        if (pesoNumLocal > 0) {
          resultadoTMB.massa_magra = Math.round(pesoNumLocal * (1 - bfAjustado / 100) * 10) / 10;
        }
        resultadoTMB.aviso_bf =
          `BF visual ${bfOriginal}% ajustado para ${bfAjustado}% (+3% por retenção hídrica de compostos anabólicos). ` +
          `Testosterona/Nandrolona causam retenção que infla o peso sem ser gordura real. ` +
          `Para BF real: medir em período off ou usar método Navy com fita métrica.`;
      }
    }

    const calcBlock = calc ? `
═══════════════════════════════════════════════════════════════
🔒 VALORES CALCULADOS DETERMINISTICAMENTE — NÃO ALTERE NENHUM DESTES
═══════════════════════════════════════════════════════════════
FÓRMULA TMB UTILIZADA: ${resultadoTMB.formula}
Justificativa: ${resultadoTMB.justificativa}
TMB: ${calc.tmb} kcal
BF: ${resultadoTMB.bf !== null ? resultadoTMB.bf + "%" : "não disponível"} (método: ${resultadoTMB.metodo_bf}, confiabilidade: ${resultadoTMB.confiabilidade_bf})
Massa magra: ${resultadoTMB.massa_magra !== null ? resultadoTMB.massa_magra + " kg" : "não calculada"}
${resultadoTMB.aviso_bf ? `Aviso BF: ${resultadoTMB.aviso_bf}` : ""}
⛔ NÃO recalcular TMB — usar exatamente ${calc.tmb} kcal.
⛔ NÃO trocar a fórmula — ${resultadoTMB.formula} foi selecionada automaticamente para este perfil.
Fator de atividade: ×${calc.fatorAtividade} (${calc.nivelAtividadeNorm})
NEAT: ×${calc.fatorNeat} (${calc.neatNorm})
Cardio: ${calc.kcalCardio} kcal/dia ${calc.flagsCardio.join(" | ")}
GET base (atividade+cardio+NEAT): ${calc.getBase} kcal
Mult. farmacológico: ×${calc.multFarm.toFixed(3)} ${calc.flagsFarm.length ? `[${calc.flagsFarm.join(" | ")}]` : "(nenhum)"}
${calc.compostosDetectados.length ? `🧪 COMPOSTOS DETECTADOS: ${calc.compostosDetectados.join(", ")}` : ""}
${calc.hepatotoxicoCount > 0 ? `🩺 Compostos hepatotóxicos: ${calc.hepatotoxicoCount}` : ""}
${calc.timingsFarm.length ? `⏰ TIMINGS OBRIGATÓRIOS:\n${calc.timingsFarm.map((t: string) => `• ${t}`).join("\n")}` : ""}
${calc.micronutrientesFarm.length ? `💊 MICRONUTRIENTES OBRIGATÓRIOS NO PLANO:\n${calc.micronutrientesFarm.map((m: string) => `• ${m}`).join("\n")}` : ""}
${calc.alertasCriticosFarm.length ? `⛔ ALERTAS CRÍTICOS:\n${calc.alertasCriticosFarm.map((a: string) => `• ${a}`).join("\n")}` : ""}
${calc.alertasFarm.length ? `⚠️ ALERTAS:\n${calc.alertasFarm.map((a: string) => `• ${a}`).join("\n")}` : ""}
TEF: ×${calc.fatorTef} ${calc.fatorTef > 1 ? "(proteína > 2g/kg)" : ""}
GET ajustado final: ${calc.getFarma} kcal
Perfil de objetivo: ${calc.perfilObj} (mult ${calc.multObj})
${calc.sonoRuim ? `⚠️ Sono ruim → meta × 0.95 + ${calc.carboNoturnoBonus}g CHO baixo IG na última refeição` : ""}
META CALÓRICA DIÁRIA: ${calc.metaKcal} kcal ${calc.metaSourceCoach ? "(definida pelo coach — prevalece)" : "(calculada deterministicamente)"}

🎯 MACROS TRAVADOS:
PROTEÍNA: ${calc.proteinaG}g (${calc.protPct}%) — ${calc.protGkgFinal}g/kg
CARBOIDRATO: ${calc.carboG}g (${calc.carbPct}%)
GORDURA: ${calc.gorduraG}g (${calc.fatPct}%)
${calc.usaMetformina ? "⚠️ Metformina ativa: CHO já reduzido em 10%, proteína compensada." : ""}
${calc.usaIgf1 ? "💉 IGF-1 Des ativo (meia-vida 20-30min): aplicar IMEDIATAMENTE PÓS-TREINO (janela 0-5min, NUNCA pré-treino). Refeição 25-30min após injeção: 40-50g whey isolado + 30-40g carbo simples + ZERO gordura + ZERO fibra. Dextrose disponível (risco hipoglicemia)." : ""}
${calc.usaGlp1 ? `💊 GLP-1 ativo: distribuir em ≥${calc.refeicoesRecomendadas} refeições para evitar náusea.` : ""}
${calc.sonoRuim ? `😴 Sono ruim: aumentar ${calc.carboNoturnoBonus}g de CHO de baixo IG (aveia/batata-doce/arroz integral) na última refeição para reduzir cortisol noturno.` : ""}

${calc.cyclingPlan ? `🔁 CYCLING DE CARBOIDRATO ATIVO — distribuir entre dias:
• Dia treino PESADO: CHO ${calc.cyclingPlan.dia_treino_pesado.carbo_g}g / GORD ${calc.cyclingPlan.dia_treino_pesado.gordura_g}g / PTN ${calc.cyclingPlan.dia_treino_pesado.proteina_g}g (~${calc.cyclingPlan.dia_treino_pesado.kcal} kcal)
• Dia treino LEVE: CHO ${calc.cyclingPlan.dia_treino_leve.carbo_g}g / GORD ${calc.cyclingPlan.dia_treino_leve.gordura_g}g / PTN ${calc.cyclingPlan.dia_treino_leve.proteina_g}g (~${calc.cyclingPlan.dia_treino_leve.kcal} kcal)
• Dia DESCANSO: CHO ${calc.cyclingPlan.dia_descanso.carbo_g}g / GORD ${calc.cyclingPlan.dia_descanso.gordura_g}g / PTN ${calc.cyclingPlan.dia_descanso.proteina_g}g (~${calc.cyclingPlan.dia_descanso.kcal} kcal)
Em dias low-carb, as kcal retiradas vão para gordura (azeite/castanhas/abacate).` : ""}

${calc.refeedingPlan ? `🍚 REFEEDING SEMANAL ATIVO (cutting + ${calc.semanasEmDeficit} semanas em déficit):
• Frequência: ${calc.refeedingPlan.frequencia}
• Macros do dia de refeeding: CHO ${calc.refeedingPlan.carbo_g}g / GORD ${calc.refeedingPlan.gordura_g}g / PTN ${calc.refeedingPlan.proteina_g}g (~${calc.refeedingPlan.kcal} kcal)
• Objetivo: ${calc.refeedingPlan.objetivo_fisiologico}.
Incluir explicitamente um "PLANO — DIA DE REFEEDING" no JSON.` : ""}

REGRA INVIOLÁVEL:
- O campo resumo.tmb DEVE = ${calc.tmb}
- O campo resumo.get DEVE = ${calc.getFarma}
- O campo resumo.calorias_totais DEVE = ${calc.metaKcal} (±3% nas refeições)
- A SOMA de proteína das refeições DEVE = ${calc.proteinaG}g (±5%)
- A SOMA de carboidrato das refeições DEVE = ${calc.carboG}g (±5%)
- A SOMA de gordura das refeições DEVE = ${calc.gorduraG}g (±5%)
A IA APENAS distribui esses macros entre as refeições e aplica as estratégias clínicas. NÃO recalcule TMB/GET/macros.

═══════════════════════════════════════════════════════════════
📝 TEMPLATE OBRIGATÓRIO PARA resumo.observacao_protocolo
═══════════════════════════════════════════════════════════════
Preencher resumo.observacao_protocolo EXATAMENTE neste formato (substituindo as variáveis pelos valores calculados acima). Use SEMPRE o nome da fórmula informado em "FÓRMULA TMB UTILIZADA":

"TDEE base calculado via ${resultadoTMB.formula} (TMB ${calc.tmb} kcal × fator atividade ${calc.fatorAtividade}${calc.kcalCardio > 0 ? ` + cardio ${calc.kcalCardio} kcal/dia` : ""}) × fator farmacológico ×${calc.multFarm.toFixed(2)}${calc.compostosDetectados.length ? ` (${calc.compostosDetectados.join(", ")})` : ""}. GET ajustado: ${calc.getFarma} kcal. ${calc.perfilObj === "bulk_limpo" ? `Superávit bulk limpo +10% FIXO: meta ${calc.metaKcal} kcal` : `Meta calórica: ${calc.metaKcal} kcal`}. Proteína ${calc.proteinaG}g (${calc.protGkgFinal}g/kg)${calc.compostosDetectados.length ? " para maximizar síntese com protocolo anabólico" : ""}.${calc.cyclingPlan ? ` Cycling de carboidratos ativo: dia treino pesado ${calc.cyclingPlan.dia_treino_pesado.carbo_g}g CHO, dia treino leve ${calc.cyclingPlan.dia_treino_leve.carbo_g}g CHO, dia descanso ${calc.cyclingPlan.dia_descanso.carbo_g}g CHO.` : ""}${calc.usaMetformina ? " Metformina: CHO reduzido 10% com compensação proteica." : ""}${calc.usaIgf1 ? " Refeição pós-IGF-1 Des: 25-30min pós-aplicação PÓS-TREINO — whey isolado 40g + carbo simples 35g + zero gordura + zero fibra." : ""}"

═══════════════════════════════════════════════════════════════
🚨 ORDEM FIXA DE ALERTAS — preencher resumo.alertas (array) NESTA ORDEM, incluindo apenas os que se aplicam ao protocolo detectado
═══════════════════════════════════════════════════════════════
1. ⚠️ HEMOGENIN HEPATOTÓXICO (17-alfa alquilado): TUDCA 500mg/dia OBRIGATÓRIO. ALT/AST a cada 4 semanas. Uso máximo 6 semanas. Crucíferas diárias + cúrcuma 500mg + beterraba.
2. ⚠️ METFORMINA ATIVA: B12 sublingual 1000mcg/dia OBRIGATÓRIO. Magnésio 200mg/dia (depleção por metformina). Folato 400mcg/dia. Manter dextrose disponível (risco hipoglicemia com treino intenso + metformina).
3. ⚠️ TESTOSTERONA — AROMATIZAÇÃO ELEVADA: Monitorar E2 regularmente. DIM natural (crucíferas) diariamente. AI (anastrozol/exemestano) conforme protocolo médico.
4. ⚠️ NANDROLONA — PROLACTINA: Monitorar prolactina. Vitamina B6 100mg/dia (suporte dopaminérgico leve). Cabergolina conforme protocolo médico se necessário.
5. ⚠️ GH SECRETAGOGOS (CJC-1295 + Ipamorelin): Aplicar em jejum ou 2h+ pós-refeição. NÃO comer 30-40min após aplicação. Magnésio 300mg + Zinco 15mg à noite para potencializar pico de GH noturno.
6. ⚠️ IGF-1 Des — TIMING CRÍTICO: Aplicar imediatamente PÓS-TREINO (NÃO pré-treino). Refeição 25-30min após: whey 40g + carbo simples 35g + ZERO gordura + ZERO fibra. Sempre ter dextrose disponível.
7. ℹ️ SLU-PP-332 — EXERCÍCIO MIMÉTICO: Agonista ERR — biogênese mitocondrial. NÃO é GLP-1, NÃO suprime apetite. CoQ10 200mg + PQQ 20mg + Ômega 3 4g/dia. Aplicar pré-treino ou pré-cardio.
8. ℹ️ PARTICIONAMENTO OTIMIZADO: Testosterona + Metformina + SLU-PP-332 melhoram sensibilidade insulínica. Oximetolona reduz levemente — compensado pelos demais. Net do protocolo: sensibilidade NORMAL a AUMENTADA. Estratégia: priorizar carboidratos nas janelas peri-workout (captação máxima). Canela de Ceylon 2g + Berberina opcional nas refeições com maior carga de CHO.

NÃO inventar alertas fora desta lista. NÃO reordenar. Omitir os que não se aplicam ao protocolo detectado (compostos_detectados acima).
═══════════════════════════════════════════════════════════════
` : "";

    // Detecta perfil treinado/atleta — nesses casos o IMC NÃO é parâmetro válido
    // (massa magra elevada infla o IMC sem refletir adiposidade real).
    const objetivoLower = String(objetivo || "").toLowerCase();
    const nivelLower = String(nivelAtividade || "").toLowerCase();
    const treinoLower = String(treino || "").toLowerCase();
    const bfNum = bfAtual ? parseFloat(bfAtual) : NaN;
    const isAtletaTreinado =
      atletaCompetitivo === true ||
      /atleta|bodybuild|bulking|cutting|recomp|hipertrofia|forç|power|crossfit|performance/i.test(
        `${objetivoLower} ${treinoLower}`,
      ) ||
      /muito ativo|atleta|alto volume|6.*x.*semana|7.*x.*semana/i.test(nivelLower) ||
      (!Number.isNaN(bfNum) && ((sexo === "masculino" && bfNum <= 18) || (sexo === "feminino" && bfNum <= 25)));

    const imcDisplay = isAtletaTreinado
      ? `${imc} ⚠️ NÃO USAR como parâmetro (paciente treinado: massa magra elevada distorce o IMC)`
      : imc;

    const cardioBlock = fazCardio
      ? `- Faz cardio: SIM
- Modalidades: ${(cardioModalidades || []).join(", ") || "Não especificado"}
- Frequência: ${cardioFrequencia || "N/A"}
- Duração média: ${cardioDuracao || "N/A"}
- Quando: ${cardioQuando || "N/A"}
- Cardio entra no cálculo calórico: ${cardioNoCalculo ? "SIM (somar gasto ao TDEE nos dias de cardio)" : "NÃO (manter TDEE base)"}`
      : `- Faz cardio: NÃO`;

    const userPrompt = `${calcBlock}DADOS DO PACIENTE:
- Nome: ${nome || "Paciente"}
- Idade: ${idade} anos | Sexo: ${sexo}
- Peso: ${peso}kg | Altura: ${altura}cm | IMC: ${imcDisplay}
${isAtletaTreinado ? `- ⚠️ PERFIL TREINADO/ATLETA: IGNORE classificações de IMC (sobrepeso/obesidade). Avalie composição corporal por % gordura, massa magra e contexto de treino. NUNCA recomende déficit baseado em IMC. NUNCA mencione "IMC indica sobrepeso" ou similar.\n` : ""}- % Gordura corporal atual: ${bfAtual ? `${bfAtual}%` : isAtletaTreinado ? "Não informado (estimar por massa magra e contexto de treino — NÃO usar IMC)" : "Não informado (estimar pelo IMC e contexto)"}
- % Gordura corporal meta: ${bfMeta ? `${bfMeta}%` : "Não informada"}
- Massa magra estimada: ${massaMagra ? `${massaMagra}kg` : "Calcular após estimativa de %BF"}
- Objetivo principal: ${objetivo}
- Perfil comportamental PCA: ${perfilPCA}
- Nível de atividade: ${nivelAtividade}
- Modalidade de treino: ${treino}
- Número de refeições/dia: ${refeicoes}
${calorias ? `- Meta calórica definida pelo coach: ${calorias} kcal  ⚠️ INVIOLÁVEL — o total do plano DEVE ficar entre ${Math.round(Number(calorias) * 0.97)} e ${Math.round(Number(calorias) * 1.03)} kcal (tolerância ±3%). NUNCA reduza a meta porque "parece muito" — o coach já calculou. Se o total bater abaixo, AUMENTE a gramatura proporcionalmente até atingir o alvo.

⚡ PROTOCOLO PARA PLANOS DE ALTA CALORIA (>4000 kcal):
   • Distribua o alvo igualmente: ${Math.round(Number(calorias) / Number(refeicoes || 5))} kcal por refeição em média.
   • Use porções ROBUSTAS de carbo: arroz 200-300g cozido, batata doce 300-400g, aveia 100-150g por refeição principal.
   • Proteína 50-80g por refeição (200-300g de carne/frango cozido).
   • Inclua gorduras densas: 30-50g de castanhas, 1-2 col sopa de azeite, abacate inteiro.
   • Antes de finalizar, SOME mentalmente: se total < ${Math.round(Number(calorias) * 0.97)}, DOBRE as porções de arroz/batata/aveia até bater. NÃO entregue plano abaixo do alvo.` : "- Meta calórica: usar valor pré-calculado em VALORES CALCULADOS DETERMINISTICAMENTE (Mifflin-St Jeor)"}

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
1) A refeição "Pós-Treino Imediato" DEVE ter "${glut4Config.carb_source_label}" como fonte principal de carboidrato — proibido whey, proteína animal e gordura adicionada.

   ⚠️ OBRIGATÓRIO COMBINAR 2+ ALIMENTOS (NUNCA deixar a refeição com 1 só ingrediente):

   ⛔ PROIBIDO ABSOLUTO no PÓS-TREINO IMEDIATO: dextrose, maltodextrina, malto, waxy maize, ciclodextrina, vitargo, palatinose, karbolyn ou QUALQUER carboidrato em pó tipo "shake esportivo de reposição". Esses compostos são EXCLUSIVAMENTE de uso INTRA-TREINO (durante o treino, dissolvidos em água). Se o paciente usa maltodextrina/dextrose, elas DEVEM aparecer em uma refeição separada chamada "Intra-Treino" (durante o treino), NUNCA dentro do "Pós-Treino Imediato". O pós-imediato usa SEMPRE alimentos sólidos/semi-sólidos reais (pão, tapioca, banana, mel, leite condensado, doce de leite, geleia, batata-doce, arroz branco, etc.).

   - Se a fonte principal for um AÇÚCAR/XAROPE PURO (leite condensado, doce de leite, mel cru, melado, rapadura, geleia, açúcar de coco, mucilon puro), VOCÊ É OBRIGADO a adicionar um CARBOIDRATO ESTRUTURAL/VEÍCULO junto na MESMA refeição: pão francês, pão de forma, tapioca, banana madura, batata-doce cozida, arroz branco, biscoito de arroz, ou cuscuz. NUNCA prescreva leite condensado/doce de leite/mel/geleia "puro" — sempre como recheio/cobertura de um veículo sólido.
   - Combos válidos e ENCORAJADOS para o PÓS-IMEDIATO (escolha um conforme preferência/disponibilidade do paciente — VARIE entre os dias do plano):
     • Pão francês + leite condensado desnatado
     • Pão francês + doce de leite
     • Pão francês + geleia de frutas (uva/morango/goiaba)
     • Pão francês + mel cru
     • Pão de forma + doce de leite + banana
     • Tapioca + doce de leite
     • Tapioca + leite condensado
     • Tapioca + mel cru + banana
     • Banana madura + mel cru + aveia instantânea (escaldada)
     • Batata-doce cozida + mel cru
     • Arroz branco + mel cru
     • Biscoito de arroz + geleia + banana
     • Mucilon escaldado + banana + mel
     • Cuscuz + mel + banana
     • Rapadura ralada + banana
   - Cada alimento deve aparecer como ITEM SEPARADO no array "alimentos" da refeição, com sua própria gramagem, kcal e macros individuais. NUNCA agrupar tudo num só item tipo "pão com leite condensado 165g".
   - Listar no campo de descrição/justificativa de cada item o papel fisiológico (ex: "pão francês = amido de absorção rápida → glicose muscular" / "leite condensado = sacarose → glicose+frutose para reposição hepática de glicogênio").

   O TOTAL de gramas de CHO deve bater o alvo (${glut4Config.carb_grams ?? "calculado pelo peso"}g), gordura ≤ 2g e proteína ≤ 3g (apenas residual do pão/tapioca, sem adicionar fonte proteica).

${glut4Config.uses_intra_malto ? `📍 REFEIÇÃO INTRA-TREINO OBRIGATÓRIA (separada do pós-imediato):
   - Nome: "Refeição X (HH:MM — Intra-Treino)" com horário = início do treino + 15-20min (no meio do treino).
   - Conteúdo: ${glut4Config.intra_malto_grams}g de maltodextrina (ou dextrose, ou 50/50 malto+dextrose) dissolvidos em 500-700ml de água. Opcionalmente: 5g de creatina + eletrólitos.
   - Macros: ${glut4Config.intra_malto_grams}g CHO | 0g proteína | 0g gordura | ~${(glut4Config.intra_malto_grams || 0) * 4} kcal.
   - PROIBIDO: aparecer maltodextrina/dextrose em qualquer outra refeição que não esta.
` : ""}
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
  • Pré-treino sólido: time − 60min (EXATAMENTE 1h antes — não use 30min, não use 90min)
  • (opcional) Pré-treino líquido/whey: time − 20min
  • Intra-treino: durante o treino
  • Pós-treino imediato: time + duration_min + 0–30min (APENAS UMA refeição com este nome — NUNCA crie "Pós-IGF-1", "Pós-Treino 2", "Janela Anabólica" ou variantes; tudo deve ser consolidado em UMA única "Pós-Treino Imediato")
  • Pós-treino sólido: time + duration_min + 60–90min
  • Demais refeições: distribuídas ao longo do dia respeitando intervalos MÍNIMOS de 2h30 entre refeições principais (3h é o ideal).
- ⚠️ ESPAÇAMENTO MÍNIMO ENTRE REFEIÇÕES: NUNCA coloque duas refeições com menos de 2h30 de diferença. Sempre insira um lanche intermediário ou redistribua horários.

🍽️ NOMENCLATURA OBRIGATÓRIA DAS REFEIÇÕES (use os nomes EXATOS — não invente "Almoço Cedo", "Refeição 1", etc.):
A nomenclatura é PADRÃO BRASILEIRO + função peri-workout. NUNCA use rótulos como "Almoço Cedo", "Refeição da Manhã", "Lanche Pré-Treino" como nome principal — o pré-treino sólido É o almoço quando ele cai 60min antes do treino.

📋 ESQUEMA POR HORÁRIO DE TREINO (siga RIGOROSAMENTE — apenas substitua HH:MM pelo "time" REAL do schedule):

▸ TREINO MANHÃ (06:00–10:00) — ex: treino 07:00
   1. Café da Manhã (Pré-Treino Sólido) — 06:00 (time − 60min)
   2. Intra-Treino — 07:20
   3. Pós-Treino Imediato (Janela GLUT-4) — 08:30
   4. Pós-Treino Sólido — 10:00
   5. Almoço — 12:30
   6. Lanche da Tarde — 16:00
   7. Jantar — 19:30
   8. Ceia — 22:00

▸ TREINO MEIO-DIA/INÍCIO TARDE (11:00–14:00) — ex: treino 13:30 ✅ (caso do usuário)
   1. Café da Manhã (Desjejum) — 07:00
   2. Lanche da Manhã — 10:00
   3. Almoço (Pré-Treino Sólido) — 12:30 (time − 60min) ← O ALMOÇO É O PRÉ-TREINO
   4. Intra-Treino — 13:45 (no meio do treino)
   5. Pós-Treino Imediato (Janela GLUT-4) — 14:45 (time + duration + 0–30min)
   6. Pós-Treino Sólido — 16:00 (60–90min após o imediato)
   7. Jantar — 19:30
   8. Ceia — 22:00

▸ TREINO TARDE (15:00–18:00) — ex: treino 17:00
   1. Café da Manhã — 07:00
   2. Lanche da Manhã — 10:00
   3. Almoço — 12:30
   4. Lanche da Tarde (Pré-Treino Sólido) — 16:00 (time − 60min)
   5. Intra-Treino — 17:20
   6. Pós-Treino Imediato (Janela GLUT-4) — 18:30
   7. Jantar (Pós-Treino Sólido) — 20:00 ← O JANTAR é o pós-sólido
   8. Ceia — 22:30

▸ TREINO NOITE (>= 19:00) — ex: treino 20:00
   1. Café da Manhã — 07:00
   2. Lanche da Manhã — 10:00
   3. Almoço — 12:30
   4. Lanche da Tarde — 16:00
   5. Jantar (Pré-Treino Sólido) — 19:00 (time − 60min) ← O JANTAR é o pré-sólido
   6. Intra-Treino — 20:20
   7. Pós-Treino Imediato (Janela GLUT-4) — 21:30
   8. Ceia (Pós-Treino Sólido) — 22:30 ← A CEIA é o pós-sólido

▸ DIA DE DESCANSO (sem treino):
   1. Café da Manhã — 07:00
   2. Lanche da Manhã — 10:00
   3. Almoço — 12:30
   4. Lanche da Tarde — 16:00
   5. Jantar — 19:30
   6. Ceia — 22:00
   (sem intra-treino, sem pós-imediato, sem pós-sólido — redistribuir CHO conforme regra de cycling)

REGRAS DE NOMENCLATURA:
- Formato do nome: "Refeição N — Nome (HH:MM)" — ex: "Refeição 3 — Almoço / Pré-Treino Sólido (12:30)".
- O nome PRINCIPAL deve ser SEMPRE um dos 6 nomes brasileiros: Café da Manhã, Lanche da Manhã, Almoço, Lanche da Tarde, Jantar, Ceia. As refeições peri-workout extras (Intra-Treino, Pós-Treino Imediato, Pós-Treino Sólido) só aparecem QUANDO houver treino e GLUT-4 ativo.
- ⚠️ CAFÉ DA MANHÃ É OBRIGATÓRIO EM TODOS OS PLANOS (treino ou descanso). NUNCA omita o Café da Manhã. Se o treino é à tarde/noite, ele aparece como primeira refeição (~07:00). Se o treino é manhã cedo, ele se funde com o pré-treino sólido ("Café da Manhã / Pré-Treino Sólido"). NUNCA chame a primeira refeição do dia de "Lanche da Manhã" — a primeira refeição SEMPRE é Café da Manhã.
- ⚠️ CEIA É OBRIGATÓRIA EM TODOS OS PLANOS (treino ou descanso). NUNCA omita a Ceia. Sempre inclua como ÚLTIMA refeição do dia (maior horário), entre 21:30 e 23:00, e SEMPRE depois do Jantar com gap mínimo de 2h30 (Ceia ≥ Jantar + 2h30). Proteína de absorção lenta (caseína, cottage, iogurte grego, ricota, ovo) ± fibra/gordura boa. Se o treino é à noite e o pós-sólido coincide, use "Ceia / Pós-Treino Sólido" — ainda assim, deve ser a última refeição. PROIBIDO posicionar a Ceia ANTES do Jantar ou no MESMO horário do Jantar.
- ⚠️ NÚMERO DE REFEIÇÕES: o plano pode ter ATÉ 8 refeições/dia. Se o paciente tem ${refeicoes} refeições no protocolo + treino com peri-workout (pré, intra, pós-imediato, pós-sólido), some TUDO (ex: 6 base + 2 peri = 8 refeições). NUNCA corte Ceia para caber em 6/7 — gere 8 se necessário.
- ⚠️ INTRA-TREINO: só inclua a refeição "Intra-Treino" se o coach habilitou maltodextrina intra-treino (uses_intra_malto=true). Caso contrário, NÃO crie essa refeição.
- Quando uma refeição padrão (almoço/jantar/ceia/lanche) COINCIDIR com função peri-workout, USE BARRA: "Almoço / Pré-Treino Sólido", "Jantar / Pós-Treino Sólido", "Ceia / Pós-Treino Sólido", "Café da Manhã / Pré-Treino Sólido".
- PROIBIDO: usar "Almoço Cedo", "Pré-Treino Sólido" sozinho como nome principal, "Refeição 1" sem nome funcional, ou criar "Almoço" + "Pré-Treino" como duas refeições separadas a menos de 2h30 — eles são A MESMA refeição com função dupla.
- PROIBIDO: usar 05:00, 05:30, 06:00, 07:00 se o "time" REAL do schedule for diferente.
- PROIBIDO: criar 2 refeições pós-treino imediato.
- PROIBIDO: deixar gap menor que 2h30 entre quaisquer duas refeições.

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

${perfilFisiologico?.variedade_funcional ? `
🌿 VARIEDADE FUNCIONAL — JSON ENXUTO (regras curtas para evitar timeout):
Meta semanal: ≥20 vegetais, ≥12 frutas, ≥12 proteínas, ≥6 carbos, ≥5 gorduras, ≥4 leguminosas, fermentados ≥5d/sem.
Frutas: 6 categorias (vermelhas, cítricas, enzimáticas, prebióticas, tropicais, secas). Use ≥2 categorias/dia, sem repetir fruta no mesmo dia.
Rotação: não repetir proteína nem combo proteína+CHO em dias seguidos.

SUBSTITUIÇÕES (compacto):
- Para cada alimento, EXATAMENTE 2 substitutos do mesmo grupo (proteína↔proteína, carbo↔carbo, fruta↔fruta, gordura↔gordura, vegetal↔vegetal, fermentado↔fermentado, tempero↔tempero). Nunca vazio.
- Cada substituto: { "alimento", "quantidade_g", "grupo" }. SEM "observacao", SEM "quantidade" textual quando idêntica a quantidade_g (ex.: "120g").
- Fermentados: rotacionar entre kefir, iogurte grego, kombucha, chucrute, kimchi, missô, kefir de água.
- Temperos: combos curtos (cúrcuma+pimenta, gengibre+limão, alecrim+alho, orégano+manjericão, curry+gengibre).

TEMPERO FUNCIONAL: 1 item por refeição salgada, nome curto ("Tempero: cúrcuma+pimenta"), quantidade "1 col chá".
MODO DE PREPARO: campo "modo_preparo" por refeição principal, MÁX 120 caracteres, sem listas — frase única com técnica+tempo. Ex.: "Grelhar frango 3min/lado, vegetais no vapor 4min, finalizar com limão."
FERMENTADOS: ≥1 item/dia quando viável; lactose-restrita → kefir de água, kombucha, chucrute, kimchi, missô.

METADADOS: "variedade_aplicada": { "frutas_distintas": N, "vegetais_distintos": N, "proteinas_distintas": N, "carbos_distintos": N, "temperos_funcionais": true, "fermentados_com_substitutos": true }.
` : ""}


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

Aplique TODAS as regras de cálculo (Mifflin-St Jeor — valores já pré-calculados no bloco determinístico, ajustes farmacológicos por composto, integração de cardio, fase de periodização). Use alimentos brasileiros acessíveis com gramagem precisa. Linguagem técnica de coach de competição.

🚨 REGRA CRÍTICA DE FORMATO 🚨
Responda APENAS com UM ÚNICO objeto JSON válido (root é um único "{...}"). NÃO retorne múltiplos objetos concatenados, NÃO retorne array no nível raiz, NÃO retorne "PLANO 1 / PLANO 2", NÃO repita o objeto para diferentes dias da semana. Gere UM plano único representativo. Estrutura exata:
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
      "modo_preparo": "string curto quando variedade_funcional estiver ativo; null nos demais casos",
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

    const buildFallbackMealPlan = (reason: string) => {
      const targetKcal = Math.round(calc?.metaKcal || Number(calorias) || 2200);
      const prot = Math.round(calc?.proteinaG || ((Number(peso) || 75) * 2));
      const carb = Math.round(calc?.carboG || Math.max(120, (targetKcal - prot * 4 - targetKcal * 0.25) / 4));
      const fat = Math.round(calc?.gorduraG || Math.max(45, (targetKcal - prot * 4 - carb * 4) / 9));
      const count = Math.max(3, Math.min(8, Number(refeicoes) || calc?.refeicoesRecomendadas || 5));
      const horarios = ["08:30", "10:30", "12:30", "15:30", "17:30", "20:30", "22:30"];
      const labels = ["R1 — Café da manhã", "R2 — Lanche da manhã", "R3 — Almoço", "R4 — Lanche / Pré-treino", "R5 — Pós-treino", "R6 — Jantar", "R7 — Ceia", "R8 — Ceia 2"];
      const ratiosBase = [0.18, 0.12, 0.24, 0.14, 0.16, 0.12, 0.04].slice(0, count);
      const ratioSum = ratiosBase.reduce((a, b) => a + b, 0) || 1;
      const templates = [
        ["Ovos inteiros", "Aveia", "Banana"],
        ["Iogurte natural", "Fruta", "Castanhas"],
        ["Frango grelhado", "Arroz", "Feijão", "Vegetais", "Tempero funcional: cúrcuma + pimenta-preta"],
        ["Whey protein", "Tapioca", "Banana"],
        ["Tilápia", "Batata-doce", "Legumes", "Tempero funcional: alho + limão"],
        ["Patinho moído", "Arroz ou mandioca", "Salada com azeite", "Tempero funcional: ervas + alho"],
        ["Cottage ou iogurte", "Chia"],
      ];
      return {
        resumo: {
          nome: nome || "Paciente",
          objetivo: objetivo || "Plano alimentar",
          calorias_totais: targetKcal,
          proteina_total: prot,
          carboidrato_total: carb,
          gordura_total: fat,
          tmb: calc?.tmb || 0,
          get: calc?.getFarma || targetKcal,
          imc,
          observacao_protocolo: "Plano seguro gerado com cálculo determinístico após indisponibilidade temporária da IA.",
        },
        refeicoes: ratiosBase.map((ratio, i) => {
          const r = ratio / ratioSum;
          return {
            refeicao: labels[i],
            horario: horarios[i],
            calorias: Math.round(targetKcal * r),
            macros: { proteina: Math.round(prot * r), carboidrato: Math.round(carb * r), gordura: Math.round(fat * r) },
            modo_preparo: perfilFisiologico?.variedade_funcional ? "Grelhar/refogar proteína, cozinhar carbo, inserir vegetais e finalizar com tempero funcional." : null,
            alimentos: templates[i].map((alimento) => ({
              alimento,
              quantidade: "ajustar pela meta da refeição",
              quantidade_g: null,
              observacao: "Base técnica ajustável pelo coach.",
              substituicoes: [
                { alimento: "Frango / tilápia / patinho", quantidade: "porção equivalente", quantidade_g: null, observacao: "troca proteica equivalente", grupo: "proteina" },
                { alimento: "Arroz / batata / mandioca", quantidade: "porção equivalente", quantidade_g: null, observacao: "troca de carboidrato equivalente", grupo: "carbo" },
                { alimento: "Azeite / castanhas / abacate", quantidade: "porção equivalente", quantidade_g: null, observacao: "troca de gordura equivalente", grupo: "gordura" },
              ],
            })),
          };
        }),
        suplementacao: [],
        dica_mce: {
          mindset: "Executar o plano por horários e revisar aderência diariamente.",
          comportamento: "Manter preparo simples e repetir bases alimentares seguras.",
          execucao: "Coach deve ajustar gramagens finas conforme resposta do paciente.",
        },
        alerta_coach: `Fallback ativado: ${reason.slice(0, 120)}`,
        fallback_gerado: true,
      };
    };

    // Retry enxuto + prompt compacto: evita timeout quando variedade funcional aumenta o JSON.
    // O SYSTEM_PROMPT completo contém um banco alimentar grande; com variedade ativa, o userPrompt
    // já carrega as regras necessárias, então usamos um sistema curto para reduzir latência.
    const COMPACT_SYSTEM_PROMPT = `Você é o NutriSync Elite, gerador técnico de plano alimentar para coach.
Responda APENAS com um único JSON válido, sem markdown.
Siga rigorosamente horários reais do treino, macros/calorias calculados, restrições, medidas caseiras e regras peri-workout do prompt do usuário.
AEJ não é refeição e nunca deve aparecer em refeicoes. Pós-Treino Imediato deve ser único.`;
    const activeSystemPrompt = perfilFisiologico?.variedade_funcional || perfilFisiologico?.protocolo_microbiota || perfilFisiologico?.medidas_caseiras
      ? COMPACT_SYSTEM_PROMPT
      : SYSTEM_PROMPT;
    const MODELS_FALLBACK = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash-lite"];
    let response: Response | null = null;
    let lastErrorStatus = 0;
    let lastErrorBody = "";

    outer: for (const model of MODELS_FALLBACK) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            signal: AbortSignal.timeout(28_000),
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: activeSystemPrompt },
                { role: "user", content: userPrompt },
              ],
              max_tokens: perfilFisiologico?.variedade_funcional ? 9000 : 14000,
              response_format: { type: "json_object" },
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
      const fallbackPlan = buildFallbackMealPlan("serviço de IA temporariamente indisponível");
      return new Response(JSON.stringify({ plan: fallbackPlan, adjustmentId: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    const finishReason = aiData.choices?.[0]?.finish_reason;
    let clean = raw.replace(/```json|```/g, "").trim();

    const convertSingleQuotedStrings = (src: string): string => {
      let out = "";
      let inDouble = false;
      let inSingle = false;
      let esc = false;

      const nextSignificant = (from: number) => {
        for (let j = from + 1; j < src.length; j++) {
          const c = src[j];
          if (!/\s/.test(c)) return c;
        }
        return "";
      };

      for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (inSingle) {
          if (esc) { out += ch === "'" ? "'" : `\\${ch}`; esc = false; continue; }
          if (ch === "\\") { esc = true; continue; }
          if (ch === "'") {
            const next = nextSignificant(i);
            if (!next || next === "," || next === "}" || next === "]" || next === ":") {
              out += '"';
              inSingle = false;
              continue;
            }
          }
          if (ch === '"') { out += '\\"'; continue; }
          if (ch === "\n") { out += "\\n"; continue; }
          if (ch === "\r") { out += "\\r"; continue; }
          if (ch === "\t") { out += "\\t"; continue; }
          out += ch;
          continue;
        }
        if (esc) { out += ch; esc = false; continue; }
        if (ch === "\\") { out += ch; esc = true; continue; }
        if (ch === '"') { inDouble = !inDouble; out += ch; continue; }
        if (!inDouble && ch === "'") { inSingle = true; out += '"'; continue; }
        out += ch;
      }
      if (inSingle) out += '"';
      return out;
    };

    const repairJsonLikeText = (src: string): string => convertSingleQuotedStrings(src)
      .replace(/\uFEFF|\u200B|\u200C|\u200D/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .replace(/,\s*([}\]])/g, "$1");

    // Extrai TODOS os objetos JSON balanceados de nível superior e escolhe aquele que CONTÉM "refeicoes".
    // Isso evita pegar um objeto explicativo inicial quando a IA retorna múltiplos blocos ({...}{plano real}).
    const extractTopLevelObjects = (src: string): string[] => {
      const objs: string[] = [];
      let depth = 0;
      let start = -1;
      let inStr = false;
      let esc = false;
      for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (esc) { esc = false; continue; }
        if (ch === "\\") { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === "{") {
          if (depth === 0) start = i;
          depth++;
        } else if (ch === "}") {
          depth--;
          if (depth === 0 && start !== -1) {
            objs.push(src.substring(start, i + 1));
            start = -1;
          }
        }
      }
      return objs;
    };
    const candidates = extractTopLevelObjects(clean);
    if (candidates.length > 0) {
      // Prefere o que contém "refeicoes"; caso contrário, o maior
      const withRefeicoes = candidates.filter((c) => /"refeicoes"\s*:/.test(c));
      const pool = withRefeicoes.length > 0 ? withRefeicoes : candidates;
      pool.sort((a, b) => b.length - a.length);
      clean = pool[0];
      if (candidates.length > 1) {
        console.warn(`[parser] múltiplos objetos JSON detectados (${candidates.length}); selecionado ${withRefeicoes.length > 0 ? "com refeicoes" : "o maior"} (${clean.length} chars)`);
      }
    }

    let parsed;
    let parseError: unknown = null;
    try {
      parsed = JSON.parse(clean);
    } catch (e1) {
      parseError = e1;
      // Tentativa 2: remover vírgulas pendentes antes de } ou ]
      try {
        const repaired = clean.replace(/,(\s*[}\]])/g, "$1");
        parsed = JSON.parse(repaired);
      } catch (e2) {
        parseError = e2;
        // Tentativa 3: reparo agressivo para saída "JSON-like" de LLM
        // - converte strings com aspas simples para aspas duplas sem mexer em apóstrofos internos
        // - normaliza quebras de linha literais dentro de strings
        // - remove caracteres de controle inválidos, vírgulas pendentes e BOM/zero-width
        try {
          let aggressive = repairJsonLikeText(clean);

          // Escapa quebras de linha cruas dentro de strings JSON
          // Walker simples: percorre e quando estiver dentro de "..." substitui \n \r \t por \\n \\r \\t
          let out = "";
          let inStr = false;
          let escape = false;
          for (let i = 0; i < aggressive.length; i++) {
            const ch = aggressive[i];
            if (escape) { out += ch; escape = false; continue; }
            if (ch === "\\") { out += ch; escape = true; continue; }
            if (ch === '"') { inStr = !inStr; out += ch; continue; }
            if (inStr) {
              if (ch === "\n") { out += "\\n"; continue; }
              if (ch === "\r") { out += "\\r"; continue; }
              if (ch === "\t") { out += "\\t"; continue; }
            }
            out += ch;
          }
          out = out.replace(/,(\s*[}\]])/g, "$1");
          parsed = JSON.parse(out);
        } catch (e3) {
          parseError = e3;
          const errMsg = e3 instanceof Error ? e3.message : String(e3);
          // tenta extrair posição do erro para log
          const posMatch = /position\s+(\d+)/i.exec(errMsg);
          let context = "";
          if (posMatch) {
            const pos = parseInt(posMatch[1], 10);
            context = clean.substring(Math.max(0, pos - 120), Math.min(clean.length, pos + 120));
          }
          console.error(
            "Failed to parse AI response. finish_reason:", finishReason,
            "len:", clean.length,
            "err:", errMsg,
            "context:", context,
            "head:", clean.substring(0, 200),
            "tail:", clean.substring(clean.length - 300),
          );
          const truncated = finishReason === "length" || !clean.trimEnd().endsWith("}");
          const msg = truncated
            ? "A IA gerou um plano grande demais e a resposta foi truncada. Tente novamente."
            : "Resposta da IA não é um JSON válido (" + errMsg.slice(0, 120) + "). Tente novamente.";
          console.warn("[parser-fallback] retornando plano determinístico em vez de erro 502:", msg);
          parsed = buildFallbackMealPlan(errMsg);
        }
      }
    }

    if (!Array.isArray(parsed?.refeicoes) || parsed.refeicoes.length === 0) {
      console.warn("[parser-fallback] resposta sem refeicoes válidas; usando plano determinístico mínimo");
      parsed = buildFallbackMealPlan("resposta sem array refeicoes válido");
    }

    // ── FILTRO ABSOLUTO: AEJ NÃO É REFEIÇÃO ──
    // Remove qualquer refeição com horário antes das 08:00 ou com "AEJ" no nome.
    if (Array.isArray(parsed?.refeicoes)) {
      const antes = parsed.refeicoes.length;
      parsed.refeicoes = parsed.refeicoes.filter((r: any) => {
        const horario: string = r?.horario || "00:00";
        const nome: string = (r?.refeicao || "").toString().toLowerCase();

        const [hStr] = horario.split(":");
        const h = Number(hStr);
        if (Number.isFinite(h) && h < 8) {
          console.warn("[FILTRO-AEJ] Refeição removida (horário <08:00):", r?.refeicao, horario);
          return false;
        }

        if (
          nome.includes("aej") ||
          nome.includes("aeróbico em jejum") ||
          nome.includes("aerobico em jejum") ||
          nome.includes("pré-aej") ||
          nome.includes("pre-aej")
        ) {
          console.warn("[FILTRO-AEJ] Refeição AEJ removida:", r?.refeicao);
          return false;
        }
        return true;
      });

      // Renumerar refeições após filtro
      parsed.refeicoes = parsed.refeicoes.map((r: any, i: number) => ({
        ...r,
        refeicao: typeof r?.refeicao === "string"
          ? r.refeicao.replace(/Refei[çc][ãa]o\s+\d+/i, `Refeição ${i + 1}`)
          : r?.refeicao,
      }));

      // Garantir que primeira refeição não comece antes das 08:30
      if (parsed.refeicoes.length > 0) {
        const primeira = parsed.refeicoes[0];
        const [hStr] = (primeira?.horario || "00:00").split(":");
        const h = Number(hStr);
        if (!Number.isFinite(h) || h < 8) {
          parsed.refeicoes[0].horario = "08:30";
          console.warn("[FILTRO-AEJ] Horário da primeira refeição forçado para 08:30");
        }
      }

      if (parsed.refeicoes.length !== antes) {
        console.warn(`[FILTRO-AEJ] Total filtrado: ${antes} → ${parsed.refeicoes.length}`);
      }
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
      // ⛔ EXCLUÍDOS: dextrose, maltodextrina, waxy maize, ciclodextrina, vitargo, palatinose,
      //    karbolyn — esses são EXCLUSIVAMENTE intra-treino (em pó dissolvido em água).
      const CARBS_COMPATIVEIS = [
        "tapioca", "mucilon", "mel", "rapadura",
        "doce de leite", "leite condensado", "geleia", "geléia", "açúcar", "acucar",
        "banana", "pão francês", "pao frances", "pão", "pao", "batata-doce", "batata doce",
        "arroz branco", "frutose",
        "polvilho", "biju", "beiju", "água de coco", "agua de coco", "suco de uva",
        "suco de laranja", "purê de batata", "pure de batata", "cuscuz", "cream of rice",
        "melado", "melaço", "açúcar de coco", "acucar de coco",
      ];
      // Carboidratos EXCLUSIVOS de intra-treino (NUNCA no pós-imediato — devem migrar para refeição "Intra-Treino")
      const CARBS_INTRA_TREINO = [
        "dextrose", "maltodextrina", "malto", "waxy maize", "ciclodextrina",
        "vitargo", "palatinose", "karbolyn", "glicose em pó", "glicose em po",
        "carb up", "carbup",
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
      const isIntraTreino = (nome: string) =>
        CARBS_INTRA_TREINO.some((c) => nome.toLowerCase().includes(c));

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

      // Acumulador de itens intra-treino extraídos do pós-imediato (serão movidos)
      const intraTreinoExtraidos: any[] = [];
      let posImediatoHorario: string | null = null;
      let posImediatoIdx = -1;

      parsed.refeicoes = parsed.refeicoes.map((m: any, idx: number) => {
        if (!isPosImediato(m?.refeicao || "")) return m;
        posImediatoHorario = m?.horario || null;
        posImediatoIdx = idx;

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

        // 1b) EXTRAI itens intra-treino (dextrose/maltodextrina/etc) — eles vão para refeição própria
        const intraItens = limpos.filter((a) => isIntraTreino(String(a?.alimento || "")));
        intraItens.forEach((a) => {
          intraTreinoExtraidos.push(a);
          validacao.push(`movido: "${a.alimento}" do pós-imediato → refeição "Intra-Treino" (uso correto)`);
        });
        limpos = limpos.filter((a) => !isIntraTreino(String(a?.alimento || "")));

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

      // ── Cria/garante refeição "Intra-Treino" se houver itens extraídos OU se uses_intra_malto ──
      const jaTemIntra = parsed.refeicoes.some((m: any) =>
        /intra[\s-]?treino|durante\s*o\s*treino/i.test(String(m?.refeicao || "")),
      );
      // Intra-Treino só quando coach habilitou explicitamente (uses_intra_malto = true).
      // Se a IA gerou itens de malto/dextrose por engano fora do pós-imediato e o coach NÃO
      // habilitou o intra, esses itens são removidos silenciosamente (não criamos refeição).
      const precisaIntra = !!glut4Config.uses_intra_malto;
      if (!precisaIntra && intraTreinoExtraidos.length > 0) {
        console.log(`[INTRA-TREINO] descartados ${intraTreinoExtraidos.length} itens (coach não habilitou intra-malto)`);
      }

      if (precisaIntra && !jaTemIntra) {
        // Calcula horário do intra: pós-imediato − (timing_minutes + ~25min) ≈ meio do treino
        let horarioIntra = "12:30";
        if (posImediatoHorario) {
          const [hh, mm] = String(posImediatoHorario).split(":").map(Number);
          if (Number.isFinite(hh) && Number.isFinite(mm)) {
            const totalMin = hh * 60 + mm - (Number(glut4Config.timing_minutes) || 30) - 25;
            const h2 = Math.floor(totalMin / 60);
            const m2 = totalMin % 60;
            if (h2 >= 0 && h2 < 24) {
              horarioIntra = `${String(h2).padStart(2, "0")}:${String(m2).padStart(2, "0")}`;
            }
          }
        }

        const gramasIntra =
          intraTreinoExtraidos.reduce((acc, a) => acc + extrairGramasCho(a), 0) ||
          Number(glut4Config.intra_malto_grams) || 40;

        const itensIntra = intraTreinoExtraidos.length > 0
          ? intraTreinoExtraidos.map((a) => ({
              ...a,
              observacao:
                (a.observacao || "") +
                " [movido automaticamente: dextrose/maltodextrina é uso INTRA-treino, não pós-imediato]",
            }))
          : [{
              alimento: "Maltodextrina (ou Dextrose)",
              quantidade: `${gramasIntra}g`,
              observacao: "Dissolver em 500-700ml de água. Consumir gole a gole DURANTE o treino para reposição contínua de glicogênio e manutenção da glicemia.",
              substituicoes: [
                { alimento: "Dextrose", quantidade: `${gramasIntra}g`, observacao: "Pico glicêmico mais rápido." },
                { alimento: "Maltodextrina + Dextrose 50/50", quantidade: `${gramasIntra}g`, observacao: "Combo clássico — absorção em duas fases." },
                { alimento: "Waxy Maize", quantidade: `${gramasIntra}g`, observacao: "Esvaziamento gástrico mais lento, menos pico insulínico." },
                { alimento: "Ciclodextrina (HBCD)", quantidade: `${gramasIntra}g`, observacao: "Premium — alta osmolaridade, zero desconforto gástrico." },
              ],
              cho: gramasIntra,
            }];

        const refeicaoIntra = {
          refeicao: `Intra-Treino (${horarioIntra} — Durante o Treino)`,
          horario: horarioIntra,
          alimentos: itensIntra,
          calorias: Math.round(gramasIntra * 4),
          macros: { proteina: 0, carboidrato: Math.round(gramasIntra), gordura: 0 },
          observacao_clinica: "Carboidrato líquido de absorção rápida durante o treino — repõe glicogênio em uso, mantém glicemia, atenua catabolismo. NÃO confundir com pós-treino imediato (que usa alimento sólido + sacarose/amido).",
        };

        // Insere imediatamente ANTES do pós-imediato (ordem cronológica natural)
        if (posImediatoIdx >= 0) {
          parsed.refeicoes.splice(posImediatoIdx, 0, refeicaoIntra);
        } else {
          parsed.refeicoes.push(refeicaoIntra);
        }
        console.log(`[INTRA-TREINO] Refeição criada: ${horarioIntra} | ${gramasIntra}g CHO`);
      } else if (precisaIntra && jaTemIntra && intraTreinoExtraidos.length > 0) {
        // Já existe refeição intra — adiciona os itens extraídos lá
        const idxIntra = parsed.refeicoes.findIndex((m: any) =>
          /intra[\s-]?treino|durante\s*o\s*treino/i.test(String(m?.refeicao || "")),
        );
        if (idxIntra >= 0) {
          const ref = parsed.refeicoes[idxIntra];
          ref.alimentos = [...(ref.alimentos || []), ...intraTreinoExtraidos];
          const novaSoma = ref.alimentos.reduce((acc: number, a: any) => acc + extrairGramasCho(a), 0);
          ref.macros = { proteina: 0, carboidrato: Math.round(novaSoma), gordura: 0 };
          ref.calorias = Math.round(novaSoma * 4);
        }
      }
    }

    // ── DEDUPE PÓS-TREINO IMEDIATO + AJUSTE TIMING PRÉ-TREINO ──
    // Garante apenas 1 refeição "Pós-Treino Imediato" e que o pré-treino sólido
    // fique exatamente 60min antes do horário real do treino (extraído do schedule).
    if (Array.isArray(parsed?.refeicoes)) {
      const isPosImediatoMeal = (nome: string) =>
        /p[óo]s[\s-]?treino\s*imediato|janela\s*glut|glut[\s-]?4|p[óo]s[\s-]?igf/i.test(nome || "");
      const isPreTreinoMeal = (nome: string) =>
        /pr[ée][\s-]?treino/i.test(nome || "") && !/p[óo]s/i.test(nome || "");

      // 1) Dedupe pós-imediato — mantém o PRIMEIRO, remove os demais
      const posIdxs: number[] = [];
      (parsed.refeicoes as any[]).forEach((m, i) => {
        if (isPosImediatoMeal(m?.refeicao || "")) posIdxs.push(i);
      });
      if (posIdxs.length > 1) {
        const keep = posIdxs[0];
        const remover = new Set(posIdxs.slice(1));
        const removidos = posIdxs.slice(1).map((i) => parsed.refeicoes[i]?.refeicao);
        parsed.refeicoes = (parsed.refeicoes as any[]).filter((_, i) => !remover.has(i));
        // Padroniza nome para evitar variantes ("Pós-IGF-1", etc)
        const m0 = parsed.refeicoes[keep > 0 ? keep : 0];
        if (m0 && isPosImediatoMeal(m0.refeicao || "")) {
          const horario = m0.horario || "";
          m0.refeicao = `Pós-Treino Imediato${horario ? ` (${horario})` : ""}`;
        }
        console.log(`[DEDUPE-POS] removidas ${removidos.length} refeições pós-imediato duplicadas: ${removidos.join(" | ")}`);
      }

      // 2) Extrai horário real do treino do trainingSchedulePrompt (time=HH:MM)
      let trainingTimeMin: number | null = null;
      let trainingDurationMin = 60;
      if (typeof trainingSchedulePrompt === "string" && trainingSchedulePrompt) {
        const mTime = trainingSchedulePrompt.match(/time=(\d{1,2}):(\d{2})/);
        const mDur = trainingSchedulePrompt.match(/duration_min=(\d{1,3})/);
        if (mTime) {
          const hh = Number(mTime[1]);
          const mm = Number(mTime[2]);
          if (Number.isFinite(hh) && Number.isFinite(mm)) {
            trainingTimeMin = hh * 60 + mm;
          }
        }
        if (mDur) {
          const d = Number(mDur[1]);
          if (Number.isFinite(d) && d > 0) trainingDurationMin = d;
        }
      }

      // 3) Ajusta horário do pré-treino sólido para EXATAMENTE treino − 60min
      if (trainingTimeMin !== null) {
        const preMin = trainingTimeMin - 60;
        if (preMin >= 0) {
          const novoHorario = `${String(Math.floor(preMin / 60)).padStart(2, "0")}:${String(preMin % 60).padStart(2, "0")}`;
          (parsed.refeicoes as any[]).forEach((m) => {
            if (isPreTreinoMeal(m?.refeicao || "")) {
              const antigo = m.horario;
              if (antigo !== novoHorario) {
                m.horario = novoHorario;
                // Atualiza horário entre parênteses no nome se houver
                if (typeof m.refeicao === "string") {
                  m.refeicao = m.refeicao.replace(/\d{1,2}:\d{2}/, novoHorario);
                }
                console.log(`[PRE-TREINO-FIX] horário ajustado: ${antigo} → ${novoHorario} (treino ${Math.floor(trainingTimeMin / 60)}:${String(trainingTimeMin % 60).padStart(2, "0")} − 60min)`);
              }
            }
          });
        }
      }

      // 4) Reordena refeições por horário ascendente para manter coerência cronológica
      const toMin = (h: string) => {
        const m = String(h || "").match(/(\d{1,2}):(\d{2})/);
        return m ? Number(m[1]) * 60 + Number(m[2]) : 9999;
      };
      const fromMin = (mm: number) =>
        `${String(Math.floor(mm / 60)).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`;
      parsed.refeicoes = (parsed.refeicoes as any[]).sort((a, b) => toMin(a?.horario) - toMin(b?.horario));

      // 5) Garante GAP MÍNIMO 2h30 entre pré-treino e refeição imediatamente anterior.
      //    Se gap < 150min, antecipa a anterior e injeta "Lanche da Manhã" se sobrar buraco.
      const MIN_GAP = 150;
      const isPre = (n: string) => /pr[ée][\s-]?treino/i.test(n || "") && !/p[óo]s/i.test(n || "");
      const isPeri = (n: string) =>
        /pr[ée][\s-]?treino|p[óo]s[\s-]?treino|intra[\s-]?treino|janela\s*glut|glut[\s-]?4/i.test(n || "");

      const preIdx = (parsed.refeicoes as any[]).findIndex((m) => isPre(m?.refeicao || ""));
      if (preIdx > 0) {
        const preMin = toMin((parsed.refeicoes as any[])[preIdx]?.horario);
        const anterior = (parsed.refeicoes as any[])[preIdx - 1];
        const antMin = toMin(anterior?.horario);
        const gap = preMin - antMin;
        if (gap < MIN_GAP && !isPeri(anterior?.refeicao || "")) {
          const novoAntMin = Math.max(0, preMin - MIN_GAP);
          const novoAntH = fromMin(novoAntMin);
          const antigoH = anterior.horario;
          anterior.horario = novoAntH;
          if (typeof anterior.refeicao === "string") {
            anterior.refeicao = anterior.refeicao.replace(/\d{1,2}:\d{2}/, novoAntH);
          }
          console.log(`[GAP-FIX] "${anterior.refeicao}" antecipada: ${antigoH} → ${novoAntH}`);

          if (preIdx - 2 >= 0) {
            const antAnt = (parsed.refeicoes as any[])[preIdx - 2];
            const novoGapTras = novoAntMin - toMin(antAnt?.horario);
            if (novoGapTras > MIN_GAP + 30) {
              const lancheMin = Math.round((toMin(antAnt?.horario) + novoAntMin) / 2 / 5) * 5;
              const lancheH = fromMin(lancheMin);
              const lanche = {
                refeicao: `Lanche da Manhã (${lancheH})`,
                horario: lancheH,
                alimentos: [
                  { alimento: "Iogurte natural integral", quantidade: "200g", observacao: "Proteína de digestão lenta + probióticos.", substituicoes: [] },
                  { alimento: "Banana madura", quantidade: "1 unidade média (100g)", observacao: "Carboidrato de absorção média + potássio.", substituicoes: [] },
                  { alimento: "Castanha-do-pará", quantidade: "2 unidades (10g)", observacao: "Selênio + gordura boa para saciedade.", substituicoes: [] },
                ],
                calorias: 320,
                macros: { proteina: 12, carboidrato: 35, gordura: 14 },
                observacao_clinica: "Lanche intermediário inserido automaticamente para manter espaçamento mínimo de 2h30 entre refeições principais.",
              };
              parsed.refeicoes.push(lanche);
              console.log(`[GAP-FIX] Lanche da Manhã injetado às ${lancheH} (gap ${novoGapTras}min).`);
            }
          }
        }
      }

      // 6) Reordena novamente após ajustes
      parsed.refeicoes = (parsed.refeicoes as any[]).sort((a, b) => toMin(a?.horario) - toMin(b?.horario));

      // 7) Renumera "Refeição N" para refletir ordem cronológica final
      let _n = 1;
      (parsed.refeicoes as any[]).forEach((m) => {
        if (typeof m?.refeicao === "string" && /Refei[çc][ãa]o\s*\d+/i.test(m.refeicao)) {
          m.refeicao = m.refeicao.replace(/Refei[çc][ãa]o\s*\d+/i, `Refeição ${_n}`);
        }
        _n++;
      });
    }

    // ── ENFORCEMENT DETERMINÍSTICO DO CAFÉ DA MANHÃ ──
    // Garante que TODO plano (treino ou descanso) tenha "Café da Manhã" — exceto se o
    // treino é de manhã cedo e o pré-treino sólido já cumpre essa função (já vem nomeado
    // "Café da Manhã / Pré-Treino Sólido"). Se ausente, renomeia o primeiro lanche/refeição
    // antes das 09:30 OU injeta um Café da Manhã ~07:00.
    if (Array.isArray(parsed?.refeicoes) && parsed.refeicoes.length > 0) {
      const toMin2 = (h: string) => {
        const m = String(h || "").match(/(\d{1,2}):(\d{2})/);
        return m ? Number(m[1]) * 60 + Number(m[2]) : 9999;
      };
      const temCafe = (parsed.refeicoes as any[]).some((m) =>
        /caf[ée]\s*da\s*manh[ãa]|desjejum/i.test(String(m?.refeicao || "")),
      );

      if (!temCafe) {
        // Tenta promover o primeiro item antes das 09:30 a "Café da Manhã"
        const sorted = [...(parsed.refeicoes as any[])].sort(
          (a, b) => toMin2(a?.horario) - toMin2(b?.horario),
        );
        const candidato = sorted.find((m) => {
          const min = toMin2(m?.horario);
          const nome = String(m?.refeicao || "");
          return (
            min < 9 * 60 + 30 &&
            !/intra[\s-]?treino|p[óo]s[\s-]?treino|pr[ée][\s-]?treino|janela\s*glut|glut[\s-]?4/i.test(nome)
          );
        });

        if (candidato) {
          const antigo = candidato.refeicao;
          const horario = candidato.horario || "07:00";
          candidato.refeicao = `Café da Manhã (${horario})`;
          console.log(`[CAFE-FIX] renomeado: "${antigo}" → "${candidato.refeicao}"`);
        } else {
          // Nenhuma refeição matinal → injeta Café da Manhã às 07:00 com macros padrão
          const cafeRef = {
            refeicao: "Café da Manhã (07:00)",
            horario: "07:00",
            alimentos: [
              {
                alimento: "Ovos inteiros",
                quantidade: "3 unidades (150g)",
                observacao: "Proteína de alto valor biológico + colina + colesterol bom (matriz hormonal).",
                substituicoes: [
                  { alimento: "Claras + 1 ovo inteiro", quantidade_g: 200, grupo: "proteina" },
                  { alimento: "Iogurte grego natural", quantidade_g: 200, grupo: "proteina" },
                ],
              },
              {
                alimento: "Pão francês",
                quantidade: "2 unidades (100g)",
                observacao: "Carboidrato matinal de absorção rápida — cortisol em pico aproveita glicose.",
                substituicoes: [
                  { alimento: "Tapioca", quantidade_g: 80, grupo: "carbo" },
                  { alimento: "Aveia em flocos", quantidade_g: 70, grupo: "carbo" },
                ],
              },
              {
                alimento: "Banana madura",
                quantidade: "1 unidade (100g)",
                observacao: "Frutose + potássio — recompõe glicogênio hepático após jejum noturno.",
                substituicoes: [
                  { alimento: "Mamão", quantidade_g: 150, grupo: "fruta" },
                  { alimento: "Maçã", quantidade_g: 150, grupo: "fruta" },
                ],
              },
            ],
            calorias: 600,
            macros: { proteina: 28, carboidrato: 75, gordura: 18 },
            observacao_clinica: "Café da Manhã obrigatório injetado pelo sistema (estava ausente no plano gerado).",
          };
          (parsed.refeicoes as any[]).push(cafeRef);
          (parsed.refeicoes as any[]).sort((a, b) => toMin2(a?.horario) - toMin2(b?.horario));
          // Renumera
          let _i = 1;
          (parsed.refeicoes as any[]).forEach((m) => {
            if (typeof m?.refeicao === "string" && /Refei[çc][ãa]o\s*\d+/i.test(m.refeicao)) {
              m.refeicao = m.refeicao.replace(/Refei[çc][ãa]o\s*\d+/i, `Refeição ${_i}`);
            }
            _i++;
          });
          console.log(`[CAFE-FIX] injetado Café da Manhã às 07:00 (estava ausente)`);
        }
      }
    }

    // ── ENFORCEMENT DETERMINÍSTICO DA CEIA ──
    // Garante que TODO plano (treino ou descanso) tenha "Ceia" como última refeição (21:30–23:00).
    // Se ausente, renomeia a última refeição após 21:00 OU injeta uma Ceia ~22:00.
    if (Array.isArray(parsed?.refeicoes) && parsed.refeicoes.length > 0) {
      const toMin3 = (h: string) => {
        const m = String(h || "").match(/(\d{1,2}):(\d{2})/);
        return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
      };
      const temCeia = (parsed.refeicoes as any[]).some((m) =>
        /\bceia\b/i.test(String(m?.refeicao || "")),
      );

      if (!temCeia) {
        // Tenta promover a última refeição após 21:00 a "Ceia"
        const sorted = [...(parsed.refeicoes as any[])].sort(
          (a, b) => toMin3(a?.horario) - toMin3(b?.horario),
        );
        const candidato = [...sorted].reverse().find((m) => {
          const min = toMin3(m?.horario);
          const nome = String(m?.refeicao || "");
          return (
            min >= 21 * 60 &&
            !/intra[\s-]?treino|p[óo]s[\s-]?treino\s*imediato|janela\s*glut|glut[\s-]?4|pr[ée][\s-]?treino/i.test(nome)
          );
        });

        if (candidato) {
          const antigo = candidato.refeicao;
          const horario = candidato.horario || "22:00";
          candidato.refeicao = `Ceia (${horario})`;
          console.log(`[CEIA-FIX] renomeado: "${antigo}" → "${candidato.refeicao}"`);
        } else {
          // Nenhuma refeição noturna → injeta Ceia às 22:00 com macros padrão
          const ceiaRef = {
            refeicao: "Ceia (22:00)",
            horario: "22:00",
            alimentos: [
              {
                alimento: "Iogurte grego natural integral",
                quantidade: "1 pote (200g)",
                observacao: "Caseína de absorção lenta — libera aminoácidos por 6–8h durante o sono.",
                substituicoes: [
                  { alimento: "Cottage", quantidade_g: 200, grupo: "proteina" },
                  { alimento: "Ricota fresca", quantidade_g: 200, grupo: "proteina" },
                ],
              },
              {
                alimento: "Castanha do Pará",
                quantidade: "3 unidades (15g)",
                observacao: "Selênio + gordura boa — anti-inflamatório noturno e hormonal.",
                substituicoes: [
                  { alimento: "Amêndoas", quantidade_g: 20, grupo: "gordura" },
                  { alimento: "Nozes", quantidade_g: 20, grupo: "gordura" },
                ],
              },
              {
                alimento: "Linhaça dourada moída",
                quantidade: "1 col sopa (10g)",
                observacao: "Fibra solúvel + ômega-3 vegetal — saciedade e digestão lenta.",
                substituicoes: [
                  { alimento: "Chia", quantidade_g: 10, grupo: "fibra" },
                  { alimento: "Aveia em flocos", quantidade_g: 20, grupo: "fibra" },
                ],
              },
            ],
            calorias: 320,
            macros: { proteina: 22, carboidrato: 14, gordura: 18 },
            observacao_clinica: "Ceia obrigatória injetada pelo sistema (estava ausente no plano gerado).",
          };
          (parsed.refeicoes as any[]).push(ceiaRef);
          (parsed.refeicoes as any[]).sort((a, b) => toMin3(a?.horario) - toMin3(b?.horario));
          let _i = 1;
          (parsed.refeicoes as any[]).forEach((m) => {
            if (typeof m?.refeicao === "string" && /Refei[çc][ãa]o\s*\d+/i.test(m.refeicao)) {
              m.refeicao = m.refeicao.replace(/Refei[çc][ãa]o\s*\d+/i, `Refeição ${_i}`);
            }
            _i++;
          });
          console.log(`[CEIA-FIX] injetada Ceia às 22:00 (estava ausente)`);
        }
      }

      // ── REPOSICIONAMENTO DA CEIA: deve ser SEMPRE a última refeição e vir APÓS o Jantar ──
      // Considera o horário REAL do treino do dia (já presente no plano via Pós-Treino Sólido / Jantar).
      // Regras:
      //  • Ceia >= Jantar + 2h30 (mínimo) e dentro de [21:30, 23:30].
      //  • Se Ceia for o "Pós-Treino Sólido" de treino noturno, mantém a tag "Ceia / Pós-Treino Sólido"
      //    e apenas garante que ela seja a ÚLTIMA refeição do dia.
      const refsArr = parsed.refeicoes as any[];
      const idxCeia = refsArr.findIndex((m) =>
        /\bceia\b/i.test(String(m?.refeicao || "")),
      );
      if (idxCeia >= 0) {
        const ceia = refsArr[idxCeia];
        const idxJantar = refsArr.findIndex(
          (m, i) => i !== idxCeia && /\bjantar\b/i.test(String(m?.refeicao || "")),
        );
        const jantarMin = idxJantar >= 0 ? toMin3(refsArr[idxJantar]?.horario) : -1;
        let ceiaMin = toMin3(ceia?.horario);

        // Garante mínimo Jantar + 150min (2h30)
        if (jantarMin > 0) {
          const minPermitido = jantarMin + 150;
          if (ceiaMin < minPermitido || ceiaMin <= jantarMin) {
            ceiaMin = Math.max(minPermitido, 21 * 60 + 30);
          }
        }
        // Janela alvo [21:30, 23:30]
        if (ceiaMin < 21 * 60 + 30) ceiaMin = 21 * 60 + 30;
        if (ceiaMin > 23 * 60 + 30) ceiaMin = 23 * 60 + 30;

        // Ceia precisa ser estritamente posterior à maior horário entre as DEMAIS refeições
        const maxOutro = Math.max(
          ...refsArr
            .map((m, i) => (i === idxCeia ? -1 : toMin3(m?.horario)))
            .filter((v) => v >= 0),
          -1,
        );
        if (maxOutro >= 0 && ceiaMin <= maxOutro) {
          ceiaMin = Math.min(maxOutro + 30, 23 * 60 + 30);
        }

        const novoHorario = `${String(Math.floor(ceiaMin / 60)).padStart(2, "0")}:${String(ceiaMin % 60).padStart(2, "0")}`;
        if (novoHorario !== ceia?.horario) {
          console.log(`[CEIA-FIX] horário ajustado: ${ceia?.horario} → ${novoHorario} (jantar=${idxJantar >= 0 ? refsArr[idxJantar]?.horario : "n/a"})`);
          ceia.horario = novoHorario;
          // Atualiza o sufixo "(HH:MM)" no nome se existir
          if (typeof ceia.refeicao === "string") {
            ceia.refeicao = ceia.refeicao.replace(/\(\d{1,2}:\d{2}\)/, `(${novoHorario})`);
          }
        }

        // Reordena por horário e renumera "Refeição N"
        refsArr.sort((a, b) => toMin3(a?.horario) - toMin3(b?.horario));
        let _i = 1;
        refsArr.forEach((m) => {
          if (typeof m?.refeicao === "string" && /Refei[çc][ãa]o\s*\d+/i.test(m.refeicao)) {
            m.refeicao = m.refeicao.replace(/Refei[çc][ãa]o\s*\d+/i, `Refeição ${_i}`);
          }
          _i++;
        });
      }
    }

    // ── AJUSTE PÓS-PROCESSAMENTO: escala gramaturas para bater alvo calórico ±3% ──
    // Se o coach definiu meta calórica e o total da IA ficou abaixo da banda inferior,
    // multiplica proporcionalmente todas as gramaturas (exceto pós-treino imediato, já validado)
    // até o total cair dentro de ±3% do alvo. Devolve o relatório do ajuste no JSON.
    const ajusteCalorico: any = { aplicado: false };
    if (calorias && Number(calorias) > 0 && Array.isArray(parsed?.refeicoes)) {
      const alvo = Number(calorias);
      const minBand = Math.round(alvo * 0.97);
      const maxBand = Math.round(alvo * 1.03);

      const isPosImediato = (nome: string) =>
        /p[óo]s[\s-]?treino\s*imediato|janela\s*glut|glut[\s-]?4/i.test(nome || "");

      const somaTotal = (): number =>
        (parsed.refeicoes as any[]).reduce(
          (acc, m) => acc + (Number(m?.calorias) || 0),
          0,
        );

      const totalAntes = Math.round(somaTotal());
      ajusteCalorico.alvo = alvo;
      ajusteCalorico.banda_min = minBand;
      ajusteCalorico.banda_max = maxBand;
      ajusteCalorico.total_antes = totalAntes;

      console.log(
        `[ajuste-calorico] alvo=${alvo} totalAntes=${totalAntes} banda=[${minBand},${maxBand}] refeicoes=${parsed.refeicoes.length}`,
      );

      const foraDaBanda = totalAntes > 0 && (totalAntes < minBand || totalAntes > maxBand);
      if (foraDaBanda) {
        // Calcula massa calórica ajustável (exclui pós-imediato que já foi travado pelo GLUT-4)
        const ajustaveis = (parsed.refeicoes as any[]).filter(
          (m) => !isPosImediato(m?.refeicao || ""),
        );
        const fixas = (parsed.refeicoes as any[]).filter((m) =>
          isPosImediato(m?.refeicao || ""),
        );
        const kcalFixas = fixas.reduce((a, m) => a + (Number(m?.calorias) || 0), 0);
        const kcalAjustaveis = ajustaveis.reduce(
          (a, m) => a + (Number(m?.calorias) || 0),
          0,
        );

        console.log(
          `[ajuste-calorico] ajustaveis=${ajustaveis.length} (${kcalAjustaveis}kcal) fixas=${fixas.length} (${kcalFixas}kcal)`,
        );

        if (kcalAjustaveis > 0) {
          // Fator que faz (kcalAjustaveis * fator + kcalFixas) === alvo
          const fator = (alvo - kcalFixas) / kcalAjustaveis;
          // Permite escalar PARA CIMA (até 2.5x) e PARA BAIXO (até 0.5x) para fechar o alvo
          const fatorClamp = Math.max(0.5, Math.min(2.5, fator));
          console.log(
            `[ajuste-calorico] fator=${fator.toFixed(3)} → clamp=${fatorClamp.toFixed(3)}`,
          );

          const escalarGramas = (q: any): any => {
            if (typeof q === "number") return Math.round(q * fatorClamp);
            const s = String(q ?? "");
            // Substitui o primeiro número seguido (ou não) de unidade g/ml
            return s.replace(
              /(\d+(?:[.,]\d+)?)(\s*(?:g|ml|gramas?|mililitros?)?)/i,
              (_m, num, unit) => {
                const n = parseFloat(num.replace(",", "."));
                if (!isFinite(n)) return _m;
                return `${Math.round(n * fatorClamp)}${unit || "g"}`;
              },
            );
          };

          parsed.refeicoes = (parsed.refeicoes as any[]).map((m) => {
            if (isPosImediato(m?.refeicao || "")) return m;
            const novosAlimentos = Array.isArray(m?.alimentos)
              ? m.alimentos.map((a: any) => {
                  const nova: any = { ...a, quantidade: escalarGramas(a?.quantidade) };
                  if (typeof a?.cho === "number") nova.cho = Math.round(a.cho * fatorClamp);
                  if (typeof a?.proteina === "number")
                    nova.proteina = Math.round(a.proteina * fatorClamp);
                  if (typeof a?.gordura === "number")
                    nova.gordura = Math.round(a.gordura * fatorClamp);
                  return nova;
                })
              : m?.alimentos;

            const novasMacros = m?.macros
              ? {
                  proteina: Math.round((Number(m.macros.proteina) || 0) * fatorClamp),
                  carboidrato: Math.round((Number(m.macros.carboidrato) || 0) * fatorClamp),
                  gordura: Math.round((Number(m.macros.gordura) || 0) * fatorClamp),
                }
              : m?.macros;

            return {
              ...m,
              alimentos: novosAlimentos,
              calorias: Math.round((Number(m?.calorias) || 0) * fatorClamp),
              macros: novasMacros,
              ajuste_proporcional: `gramaturas escaladas ×${fatorClamp.toFixed(3)} para bater alvo calórico`,
            };
          });

          const totalDepois = Math.round(somaTotal());

          // Atualiza totais de topo (calorias_totais e macros_totais se existirem)
          if (typeof parsed.calorias_totais === "number") {
            parsed.calorias_totais = totalDepois;
          }
          if (parsed.macros_totais && typeof parsed.macros_totais === "object") {
            parsed.macros_totais = {
              proteina: Math.round((Number(parsed.macros_totais.proteina) || 0) * fatorClamp),
              carboidrato: Math.round(
                (Number(parsed.macros_totais.carboidrato) || 0) * fatorClamp,
              ),
              gordura: Math.round((Number(parsed.macros_totais.gordura) || 0) * fatorClamp),
            };
          }

          ajusteCalorico.aplicado = true;
          ajusteCalorico.fator = Number(fatorClamp.toFixed(3));
          ajusteCalorico.fator_solicitado = Number(fator.toFixed(3));
          ajusteCalorico.fator_limitado = fator > 2.5 || fator < 0.5;
          ajusteCalorico.total_depois = totalDepois;
          ajusteCalorico.delta_kcal = totalDepois - totalAntes;
          ajusteCalorico.dentro_da_banda = totalDepois >= minBand && totalDepois <= maxBand;
          ajusteCalorico.refeicoes_fixas_ignoradas = fixas.map((f) => f?.refeicao);
          const direcao = fatorClamp >= 1 ? "abaixo do" : "acima do";
          ajusteCalorico.mensagem = ajusteCalorico.dentro_da_banda
            ? `Plano ${direcao} alvo (${totalAntes} kcal). Gramaturas escaladas ×${fatorClamp.toFixed(3)} → ${totalDepois} kcal (dentro de ±3% de ${alvo}).`
            : `Plano escalado ×${fatorClamp.toFixed(3)} (limite) → ${totalDepois} kcal. Ainda fora da banda ${minBand}-${maxBand}. Considere revisar manualmente.`;
          console.log(`[ajuste-calorico] aplicado: ${ajusteCalorico.mensagem}`);
        } else {
          ajusteCalorico.mensagem = `Sem refeições ajustáveis (todas peri-treino travadas).`;
        }
      } else if (totalAntes >= minBand && totalAntes <= maxBand) {
        ajusteCalorico.mensagem = `Plano já dentro de ±3% (${totalAntes} kcal vs alvo ${alvo}). Sem ajuste necessário.`;
        ajusteCalorico.dentro_da_banda = true;
      }

      // Sinaliza que o IMC foi desconsiderado (perfil treinado/atleta)
      ajusteCalorico.is_atleta_treinado = isAtletaTreinado;
      ajusteCalorico.imc_desconsiderado = isAtletaTreinado;

      parsed.ajuste_calorico = ajusteCalorico;

      // Marca o resumo do plano para a UI saber que IMC não deve ser usado como classificação
      if (parsed?.resumo && isAtletaTreinado) {
        parsed.resumo.imc_aplicavel = false;
        parsed.resumo.imc_observacao = "IMC não aplicável: paciente treinado (massa magra elevada).";
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SOBRESCRITA DETERMINÍSTICA DO RESUMO
    // TMB, GET, calorias_totais e macros_totais SÃO do código, não da IA.
    // ═══════════════════════════════════════════════════════════════
    if (calc && parsed && typeof parsed === "object") {
      parsed.resumo = parsed.resumo || {};
      parsed.resumo.nome = parsed.resumo.nome || nome || "Paciente";
      parsed.resumo.objetivo = parsed.resumo.objetivo || objetivo;
      parsed.resumo.tmb = calc.tmb;
      parsed.resumo.get = calc.getFarma;
      parsed.resumo.calorias_totais = calc.metaKcal;
      parsed.resumo.proteina_total = calc.proteinaG;
      parsed.resumo.carboidrato_total = calc.carboG;
      parsed.resumo.gordura_total = calc.gorduraG;
      parsed.resumo.imc = parsed.resumo.imc || imc;

      // ── Fórmula TMB selecionada automaticamente + dados de BF ──
      parsed.resumo.formula_tmb = resultadoTMB.formula;
      parsed.resumo.justificativa_formula = resultadoTMB.justificativa;
      parsed.resumo.bf_utilizado = resultadoTMB.bf;
      parsed.resumo.metodo_bf = resultadoTMB.metodo_bf;
      parsed.resumo.confiabilidade_bf = resultadoTMB.confiabilidade_bf;
      parsed.resumo.massa_magra = resultadoTMB.massa_magra;
      parsed.resumo.aviso_bf = resultadoTMB.aviso_bf;

      // Contexto farmacológico exposto no resumo (para a UI exibir badges/alertas)
      parsed.resumo.compostos_detectados = calc.compostosDetectados;
      parsed.resumo.fator_farmacologico = Math.round(calc.multFarm * 1000) / 1000;
      parsed.resumo.fator_farmacologico_bruto = calc.fatorFarmaBruto;
      parsed.resumo.fator_farmacologico_cap = calc.fatorFarmaCapAplicado;
      if (calc.notaFatorFarma) parsed.resumo.nota_fator_farma = calc.notaFatorFarma;
      parsed.resumo.micronutrientes_obrigatorios = calc.micronutrientesFarm;
      parsed.resumo.alertas_criticos = calc.alertasCriticosFarm;
      parsed.resumo.alertas_farmacologicos = calc.alertasFarm;
      parsed.resumo.timings_farmacologicos = calc.timingsFarm;
      parsed.resumo.hepatotoxico_count = calc.hepatotoxicoCount;

      // ── AUDITORIA DETERMINÍSTICA — ordem correta de aplicação dos fatores ──
      // 1.TMB → 2.atividade → 3.cardio(SOMA) → 4.farma(MULT, diminishing returns + cap escalonado)
      // 5.TEF=1.0 (já embutido em atividade) → 6.NEAT (só se não-atleta)
      const _getBaseAtiv = Math.round(calc.tmb * calc.fatorAtividade);
      const _getComCardio = _getBaseAtiv + calc.kcalCardio;
      const _fatorFarmaCap = calc.multFarm; // já vem capado
      const _getFarmaEtapa = Math.round(_getComCardio * _fatorFarmaCap);
      const _getFinalEtapa = Math.round(_getFarmaEtapa * calc.fatorNeat);
      parsed.resumo.auditoria_calculo = {
        formula_tmb: resultadoTMB.formula,
        tmb: calc.tmb,
        fator_atividade: calc.fatorAtividade,
        get_base: _getBaseAtiv,                     // TMB × atividade
        kcal_cardio_dia: calc.kcalCardio,
        get_com_cardio: _getComCardio,              // get_base + cardio (SOMA)
        fator_farma: Math.round(_fatorFarmaCap * 1000) / 1000,
        fator_farma_detalhado: calc.fatorFarmaDetalhado || [],
        get_farma: _getFarmaEtapa,                  // get_com_cardio × farma
        fator_tef: calc.fatorTef,                   // 1.0 — TEF não multiplicativo
        fator_neat: calc.fatorNeat,                 // 1.0 se atleta ativo/muito_ativo
        get_final: _getFinalEtapa,                  // get_farma × NEAT
        surplus: calc.multObj,
        meta_kcal: calc.metaKcal,
        meta_kcal_real: calc.metaKcalReal,
        proteina_gkg: calc.protGkgFinal,
        proteina_bonus_gkg: calc.proteinaBonusGkg,
        gordura_pct: calc.pctGordura,
        ajuste_carbo_cap: calc.ajusteCarboCap || null,
      };

      // Expor diretamente no resumo para a UI
      if (calc.ajusteCarboCap) parsed.resumo.ajuste_carbo_cap = calc.ajusteCarboCap;

      // Cycling e refeeding como blocos top-level (compatível com spec)
      if (calc.cyclingPlan) parsed.cycling_carboidratos = calc.cyclingPlan;
      if (calc.refeedingPlan) parsed.refeeding_semanal = calc.refeedingPlan;

      parsed.calculo_deterministico = {
        tmb: calc.tmb,
        formula_tmb: resultadoTMB.formula,
        fator_atividade: calc.fatorAtividade,
        nivel_atividade: calc.nivelAtividadeNorm,
        fator_neat: calc.fatorNeat,
        neat: calc.neatNorm,
        kcal_cardio_dia: calc.kcalCardio,
        flags_cardio: calc.flagsCardio,
        get_base: calc.getBase,
        multiplicador_farmacologico: calc.multFarm,
        flags_farmacologicas: calc.flagsFarm,
        compostos_detectados: calc.compostosDetectados,
        carbo_delta_pct_farma: calc.carboDeltaPct,
        gordura_delta_pct_farma: calc.gorduraDeltaPct,
        gordura_min_pct_farma: calc.gorduraMinPct,
        hepatotoxico_count: calc.hepatotoxicoCount,
        micronutrientes_obrigatorios: calc.micronutrientesFarm,
        timings_farmacologicos: calc.timingsFarm,
        alertas_farmacologicos: calc.alertasFarm,
        alertas_criticos: calc.alertasCriticosFarm,
        fator_tef: calc.fatorTef,
        get_final: calc.getFarma,
        meta_kcal: calc.metaKcal,
        meta_kcal_real: calc.metaKcalReal,
        meta_origem: calc.metaSourceCoach ? "coach" : "calculada",
        perfil_objetivo: calc.perfilObj,
        multiplicador_objetivo: calc.multObj,
        proteina_g: calc.proteinaG,
        carbo_g: calc.carboG,
        gordura_g: calc.gorduraG,
        proteina_pct: calc.protPct,
        carbo_pct: calc.carbPct,
        gordura_pct: calc.fatPct,
        proteina_por_kg: calc.protGkgFinal,
        proteina_bonus_gkg: calc.proteinaBonusGkg,
        usa_metformina: calc.usaMetformina,
        usa_igf1: calc.usaIgf1,
        usa_glp1: calc.usaGlp1,
        sono_ruim: calc.sonoRuim,
        carbo_noturno_bonus_g: calc.carboNoturnoBonus,
        semanas_em_deficit: calc.semanasEmDeficit,
        cycling_carbo: calc.cyclingPlan,
        refeeding: calc.refeedingPlan,
        refeicoes_recomendadas: calc.refeicoesRecomendadas,
      };
    }

    // ── PERSISTÊNCIA DO HISTÓRICO DE AJUSTES CALÓRICOS ──
    // Grava cada ajuste aplicado para que o coach possa comparar versões posteriormente.
    let adjustmentId: string | null = null;
    try {
      const coachProfileId = body?.coachProfileId || body?.coach_profile_id || null;
      const patientUserId = body?.patientUserId || body?.patient_user_id || null;
      const patientName = body?.nome || body?.patient_name || "Paciente";
      const aj: any = parsed?.ajuste_calorico;

      if (coachProfileId && aj) {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (SUPABASE_URL && SERVICE_KEY) {
          const insertResp = await fetch(
            `${SUPABASE_URL}/rest/v1/coach_plan_adjustments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SERVICE_KEY,
                Authorization: `Bearer ${SERVICE_KEY}`,
                Prefer: "return=representation",
              },
              body: JSON.stringify({
                coach_id: coachProfileId,
                patient_user_id: patientUserId,
                patient_name: patientName,
                objetivo: objetivo || null,
                target_kcal: aj?.alvo ?? (calorias ? Number(calorias) : null),
                total_antes: aj?.total_antes ?? null,
                total_depois: aj?.total_depois ?? aj?.total_antes ?? null,
                delta_kcal: aj?.delta_kcal ?? null,
                fator: aj?.fator ?? null,
                dentro_da_banda: aj?.dentro_da_banda ?? null,
                aplicado: aj?.aplicado ?? false,
                status_msg: aj?.mensagem ?? null,
                plano_snapshot: parsed,
                ajuste_meta: aj,
              }),
            },
          );
          if (insertResp.ok) {
            const rows = await insertResp.json();
            adjustmentId = Array.isArray(rows) && rows[0]?.id ? rows[0].id : null;
            (parsed as any).ajuste_calorico_id = adjustmentId;
          } else {
            console.error(
              "[adjust-history] insert failed",
              insertResp.status,
              await insertResp.text(),
            );
          }
        }
      }
    } catch (logErr) {
      console.error("[adjust-history] error:", logErr);
    }

    console.log(`[generate-coach-meal-plan] retornando plan: refeicoes=${Array.isArray((parsed as any)?.refeicoes) ? (parsed as any).refeicoes.length : "N/A"}, suplementacao=${Array.isArray((parsed as any)?.suplementacao) ? (parsed as any).suplementacao.length : 0}`);
    return new Response(JSON.stringify({ plan: parsed, adjustmentId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-coach-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
