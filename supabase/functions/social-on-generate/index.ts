import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Regras da PLATAFORMA — válidas pra qualquer coach que usa o Social ON,
// não uma identidade pessoal. A identidade de quem está gerando o conteúdo
// (nome, nicho, diferenciais) é montada por request em coachIdentity(),
// com os dados reais que cada coach preencheu no próprio perfil — nunca
// cravada aqui, senão todo mundo que usa a plataforma geraria conteúdo
// assinado com a mesma pessoa.
const BRAND = `MARCA: nutriON (nutrion.app.br) — plataforma de coaching nutricional, sistema de conteúdo "Método MCE" (Mindset, Comportamento, Execução).
PALETA: #020205 / #00D4FF / #00FF88. Tipografia Rajdhani.
PILARES: mce_drop (educativo 30%), bastidor (pessoal 25%), transformacao (prova social 20%), entretenimento (15%), cta (venda suave 10%).
REGRAS OBRIGATÓRIAS DE LEGENDA (todas as legendas, sempre):
1. Nunca citar nome completo de journal. Prefira "a ciência já provou" ou "pesquisadores de Stanford mostraram".
2. Nunca usar citação acadêmica (Autor et al., ano). Prefira "Brad Schoenfeld, um dos maiores pesquisadores de hipertrofia".
3. Frases curtas: no máximo 15 palavras por frase.
4. Tom de conversa com autoridade, como falar com um amigo respeitado na academia.
5. Cada parágrafo tem no máximo 3 linhas.
6. Sempre uma linha em branco entre parágrafos.
7. Hook na primeira linha, isolado.
8. CTA no final, sempre (Salva / Manda pra quem precisa / Comenta / DM QUERO).
9. No máximo 3-4 emojis no post inteiro.
10. Hashtags nunca dentro do texto da legenda — só no campo hashtags.

TOM: direto, científico sem ser acadêmico, português do Brasil, frases curtas, zero clichê motivacional vazio. Nunca se apresente como IA.`;

/**
 * Identidade de quem está gerando o conteúdo NESTA chamada — construída a
 * partir do que o próprio coach preencheu no perfil (handle, nichos,
 * produtos, diferenciais). Sem esses dados, fica genérica de propósito:
 * nunca assume a identidade/credenciais de outro coach da plataforma.
 */
function coachIdentity(body: Record<string, unknown>): string {
  const handle = typeof body?.handle === "string" ? body.handle.replace("@", "").trim() : "";
  const niches = Array.isArray(body?.niches) ? (body.niches as string[]).filter(Boolean) : [];
  const products = Array.isArray(body?.products) ? (body.products as string[]).filter(Boolean) : [];
  const differentials = Array.isArray(body?.differentials) ? (body.differentials as string[]).filter(Boolean) : [];

  if (!handle && !niches.length && !products.length && !differentials.length) {
    return "COACH: perfil ainda não preenchido pelo coach nesta plataforma — escreva de forma profissional e genérica pro nicho fitness/nutrição, SEM inventar nome, credenciais, história pessoal ou conquistas específicas.";
  }

  return [
    handle ? `COACH: @${handle}` : "COACH: (sem @ informado)",
    niches.length ? `Nicho: ${niches.join(", ")}` : "",
    products.length ? `Produtos/serviços: ${products.join(", ")}` : "",
    differentials.length ? `Diferenciais únicos (use pra personalizar a voz, sem inventar além disso): ${differentials.join(", ")}` : "",
    "Escreva na voz desse coach específico, com os dados acima — nunca assuma nome, credencial ou história pessoal que não foi informada aqui.",
  ].filter(Boolean).join("\n");
}

type Mode = "caption" | "reel" | "calendar" | "hashtags" | "stories" | "audit" | "bio_audit" | "feed_audit" | "content_full"
  | "repurpose" | "dm_variation" | "objection_variation" | "viral_pattern" | "viral_ideas" | "ideas_now" | "proof_caption"
  | "reel_script" | "post_package" | "viral_lab" | "content_dna" | "controversy_post" | "science_post"
  | "share_score" | "hook_analyzer" | "save_triggers" | "instagram_seo"
  | "grid_architect" | "bio_optimizer" | "pinned_strategy" | "profile_audit"
  | "conversion_bridge" | "cta_intelligence" | "collab_finder"
  | "studio_subtitles" | "studio_versions" | "studio_vision"
  | "daily_brief" | "content_score" | "daily_signal";

const SCHEMAS: Record<Mode, string> = {
  caption: `{"hook":"primeira linha que para o scroll","caption":"legenda completa com quebras de linha \\n","cta":"chamada final","hashtags":["#tag", "... 15 a 20 itens"]}` ,
  reel: `{"hook":"0-2s","tensao":"5-15s","desenvolvimento":"15-35s","cta":"últimos 5s","texto_na_tela":["4 a 6 frases curtas"],"audio_sugerido":"string","duracao":"30-60s"}`,
  calendar: `{"week":[{"weekday":"SEG","pillar":"mce_drop","format":"carrossel","topic":"tema","hook":"hook","note":"observação curta de produção"}, "... 7 dias SEG a DOM respeitando a distribuição dos pilares"]}` ,
  hashtags: `{"grandes":["5 hashtags de alto volume"],"medias":["10 hashtags de volume médio"],"nichadas":["5 hashtags de nicho"]}` ,
  stories: `{"manha":["4 stories"],"tarde":["4 stories"],"noite":["3 stories"],"enquete":"pergunta de enquete do dia"}` ,
  audit: `{"bio_score":0,"bio_issues":["..."],"bio_suggestion":"bio completa em até 150 caracteres com emojis e quebras de linha","content_mix":{"educativo":0,"pessoal":0,"prova_social":0,"entretenimento":0,"venda":0},"content_mix_ideal":{"educativo":35,"pessoal":25,"prova_social":20,"entretenimento":15,"venda":12},"frequency_current":0,"frequency_ideal":5,"issues":["..."],"quick_wins":["3 ações imediatas"],"content_pillars_suggested":["4 a 5 pilares"],"series_suggestions":["séries recorrentes"]}` ,
  bio_audit: `{"score":0,"criteria":[{"key":"nome_busca","label":"Nome otimizado pra busca","ok":false,"points":-10}, "... um item para cada critério enviado"],"options":[{"id":"A","style":"autoridade","bio":"bio completa com quebras de linha \\n (MÁXIMO 150 caracteres)","char_count":0},{"id":"B","style":"storytelling","bio":"...","char_count":0},{"id":"C","style":"direto ao ponto","bio":"...","char_count":0}]}` ,
  feed_audit: `{"current_mix":{"educativo":0,"pessoal":0,"prova_social":0,"entretenimento":0,"venda":0},"ideal_mix":{"educativo":30,"pessoal":25,"prova_social":15,"entretenimento":20,"venda":10},"problems":["3 a 4 problemas objetivos comparando os mixes"],"actions":["3 ações imediatas"]}` ,
  repurpose: `{"pieces":[{"key":"carrossel","title":"...","blocks":["Slide 1: ...","Slide 2: ...","Slide 3: ...","Slide 4: ...","Slide 5: CTA + @handle"],"note":"dica de produção"},{"key":"stories","title":"...","blocks":["Story 1: ...","Story 2: ...","Story 3: ...","Story 4: enquete ou CTA"]},{"key":"legenda","title":"...","content":"legenda longa com quebras de linha \\n"},{"key":"reel_curto","title":"...","content":"roteiro de 15s: hook + 1 ponto + CTA"},{"key":"thread","title":"...","blocks":["comentário 1","comentário 2","comentário 3"]},{"key":"live","title":"...","blocks":["bloco 1 (0-2min)","bloco 2","bloco 3","encerramento"]},{"key":"repost_30d","title":"novo hook, mesma essência","content":"versão reformulada"}]}` ,
  dm_variation: `{"conversation":"conversa completa de DM em 5 etapas (CONEXÃO, DIAGNÓSTICO, DEMONSTRAÇÃO, OFERTA, OBJEÇÃO) com falas do lead e respostas do coach, texto puro com quebras de linha \\n"}` ,
  objection_variation: `{"answer":"nova resposta para a objeção, texto puro com quebras de linha \\n","triggers":["gatilhos usados"]}` ,
  viral_pattern: `{"viral_patterns":["4 a 5 padrões dos posts que performaram"],"weak_patterns":["4 a 5 padrões dos posts fracos"],"recommendations":["4 recomendações práticas"],"best_times":"faixas de horário recomendadas"}` ,
  viral_ideas: `{"ideas":[{"titulo":"...","funil":"TOFU|MOFU|BOFU","hook":"...","roteiro":"roteiro completo com marcações de tempo"}, "exatamente 3 itens"]}` ,
  ideas_now: `{"ideas":[{"titulo":"...","funil":"TOFU|MOFU|BOFU","hook":"...","produto":"MindForce|nutriON|VEMP ou vazio","roteiro":"roteiro curto pronto pra gravar agora"}, "exatamente 5 itens"]}` ,
  proof_caption: `{"caption":"legenda de prova social respeitando privacidade do cliente, com quebras de linha \\n","hashtags":["#tag","... 8 a 12 itens"]}` ,
  reel_script: `{"hook":{"time":"0-2s","text_on_screen":"frase curta em caixa alta","action":"direção de câmera/ação"},"development":{"time":"2-20s","instructions":["3 a 4 instruções de edição concretas para o miolo do vídeo"]},"cta":{"time":"últimos 5-8s","text_on_screen":"CTA curto","alternative":"CTA alternativo"},"editing":{"cortes":"...","legendas":"...","font":"...","musica":"sugestão de tipo de trend em alta","velocidade":"...","filtro":"..."},"screen_texts":[{"frame":"Frame 1 (hook)","text":"TEXTO EM CAIXA ALTA"},"exatamente 4 itens, o último sendo o @ do coach"],"screen_text_tips":["5 dicas de tipografia e animação"],"caption":"legenda completa pronta pro Reel, quebras de linha \\n","hashtags":["#tag","... 15 itens"],"best_time":"ex: 19h00 (terça-feira)","self_comment":"comentário pronto para postar logo após publicar"}` ,
  post_package: `{"hook":"capa provocativa, máximo 8 palavras","caption":"legenda completa em tom de conversa, parágrafos de no máximo 3 linhas separados por \\n\\n, hook na primeira linha e CTA no final","hashtags":["#tag","... 15 itens misturando grandes, médias e nichadas"],"best_time":"ex: 12h30 (terça-feira)","reach_forecast":"alto|médio|baixo","self_comment":"comentário pronto para o coach postar logo após publicar","carousel":[{"type":"hook|problem|content|takeaway|cta","title":"frase direta","body":"apoio opcional; total do slide até 20 palavras","pillar":"mindset|comportamento|execucao","reference":"Autor, Universidade — apenas quando MCE","keywords":["até 3 palavras-chave"],"file_index":0},"6 a 8 itens: hook, problema, 3-5 conteúdos, takeaway e CTA"],"stories":[{"title":"texto grande do story","body":"linha de apoio ou CTA","sticker":"NENHUM|QUIZ|ENQUETE|LINK|CAIXA_DE_PERGUNTAS","sticker_content":"conteúdo pronto do sticker (pergunta do quiz com opções e resposta certa, opções da enquete, ou o link)"},"exatamente 4 itens: 1 hook sobre a foto (sticker NENHUM), 1 educativo (QUIZ), 1 CTA (ENQUETE), 1 final de produto nutriON (LINK nutrion.app.br)"]}` ,
  viral_lab: `{"trends":[{"trend_name":"...","format":"...","viral_potential":3,"why_fits_profile":"...","your_version":"roteiro completo adaptado ao perfil","music_suggestion":"...","text_on_screen":["frame 1: ...","frame 2: ..."],"caption":"legenda pronta"},"4 a 5 itens"]}` ,
  content_dna: `{"identidade_visual":["3 a 4 padrões visuais que funcionam"],"formato_vencedor":["3 padrões de formato"],"hook_pattern":["3 a 4 padrões de hook"],"audiencia":["3 a 4 leituras de audiência"],"formula":"frase única com a fórmula replicável do post perfeito","posts":[{"titulo":"...","hook":"...","roteiro":"roteiro completo"},"5 itens apenas quando generatePosts for true, caso contrário array vazio"]}` ,
  controversy_post: `{"hook":"abertura provocativa","caption":"post completo defendendo a tese com o dado científico citado, quebras de linha \\n","hashtags":["#tag","... 12 itens"],"self_comment":"comentário para puxar debate"}` ,
  science_post: `{"hook":"hook usando o dado","caption":"legenda completa citando o estudo e a aplicação prática, quebras de linha \\n","hashtags":["#tag","... 12 itens"],"self_comment":"comentário pronto"}` ,
  content_full: `{"titulo":"resumo curto","roteiro":[{"bloco":"HOOK (0-2s) ou SLIDE 1 ou FRAME 1 (0.0-0.5s) conforme o formato","direcao":"instrução de câmera/cena/visual","fala":"o que falar ou o texto que aparece"}, "quantos blocos o formato exigir"],"stories_sequence":[{"numero":1,"visual":"o que aparece na tela","texto":"texto do story","gatilho":"sticker ou gatilho usado"}],"caption":"legenda completa com quebras de linha \\n","hashtags":["#tag","... 15 itens"],"hashtags_grupos":{"grandes":["3 hashtags acima de 1M posts"],"medias":["7 hashtags entre 100K e 1M"],"nichadas":["5 hashtags abaixo de 100K"]},"production_tips":{"camera":"...","audio":"...","texto_na_tela":"...","duracao":"...","proporcao":"9:16 ou 4:5","melhor_horario":"...","edicao":["4 a 8 passos de edição concretos"]},"self_comment":"comentário para o coach postar no próprio post logo após publicar","strategy":{"porque_funciona":["4 a 5 razões numeradas"],"gatilhos":["Autoridade","Curiosidade"]}}` ,
  share_score: `{"share_score": número de 0 a 100,"dm_potential": "alto" | "médio" | "baixo","emotional_trigger": "string curta","target_action": "string curta","improvements": [{"type": "critical" | "tip", "icon": "emoji", "title": "string curta", "text": "sugestão específica em 1 frase"}],"rewrite_hook": "sugestão de reescrita do início"}` ,
  hook_analyzer: `{"hook_score": número 0-100,"retention_3s": "provável X% retém","hook_pattern": "qual padrão de hook","strengths": [{"icon": "emoji", "text": "ponto forte curto"}],"weaknesses": [{"icon": "emoji", "text": "ponto fraco curto"}],"rewrite_options": [{"style": "nome do estilo", "text": "reescrita do hook", "why": "por que funciona"}]}` ,
  save_triggers: `{"title": "título do post/carrossel","hook_slide": "texto da capa máx 10 palavras","slides": [{"number": 1, "heading": "título do slide", "content": "conteúdo em 2-3 linhas"}],"caption": "legenda otimizada com CTA de save máx 150 palavras","save_cta": "frase pedindo save","hashtags": ["5 hashtags"],"estimated_save_rate": "estimativa","why_saveable": "1 frase explicando por que vai ser salvo"}` ,
  instagram_seo: `{"seo_score": número 0-100,"keywords_found": ["palavras-chave detectadas"],"keywords_missing": ["palavras-chave que deveria ter"],"keyword_density": "adequada" | "baixa" | "excessiva","searchability": "alta" | "média" | "baixa","hashtag_analysis": {"current": ["hashtags atuais"],"recommended": ["5 hashtags otimizadas"],"remove": ["hashtags que não ajudam"]},"improvements": [{"priority": "alta" | "média", "icon": "emoji", "title": "string", "text": "melhoria específica"}],"rewritten_caption": "versão otimizada da caption","alt_text_suggestion": "texto alternativo sugerido"}` ,
  grid_architect: `{"grid_score": número 0-100,"first_impression": "o que um visitante entende em 0.4 segundos vendo esse grid","pillar_balance": {"score": número 0-100,"diagnosis": "avaliação do equilíbrio entre pilares","missing": ["pilares sub-representados"]},"visual_flow": {"score": número 0-100,"issues": ["problemas visuais detectados — ex: 2 posts de texto seguidos, sem variação"]},"row_analysis": [{"row": 1,"verdict": "como essa fileira funciona","suggestion": "melhoria"},{"row": 2,"verdict": "...","suggestion": "..."},{"row": 3,"verdict": "...","suggestion": "..."}],"reorder_suggestion": [1,2,3,4,5,6,7,8,9],"improvements": [{"icon": "emoji","title": "título curto","text": "sugestão específica","priority": "alta" | "média"}]}` ,
  bio_optimizer: `{"current_score": número 0-100 (0 se não tem bio atual),"diagnosis": {"who_you_help": "detectado" | "ausente" | "vago","what_you_deliver": "detectado" | "ausente" | "vago","next_step_cta": "detectado" | "ausente" | "vago","credibility_signal": "detectado" | "ausente"},"issues": [{"icon": "emoji","text": "problema específico"}],"versions": [{"style": "nome do estilo","bio": "bio otimizada (máx 150 chars)","char_count": número,"strengths": ["ponto forte"],"best_for": "quando usar essa versão"},"exatamente 3 versões: uma direta/profissional, uma com personalidade/diferencial, uma focada em conversão"],"name_line_suggestion": "sugestão pro campo Nome (não é o @, é o nome exibido — pode ter keywords)"}` ,
  conversion_bridge: `{"funnel_analysis":{"total_posts": número,"estimated_dms_generated": número,"estimated_leads": número,"estimated_clients": número,"estimated_monthly_revenue":"R$ X.XXX","conversion_rate_content_to_dm":"X%","conversion_rate_dm_to_client":"X%"},"content_roi_ranking":[{"content_type":"tipo de conteúdo","format":"Reel|Carrossel|Feed|Stories","dm_generation":"alto|médio|baixo","client_conversion":"alto|médio|baixo","roi_score": número 0-100,"why":"por que esse tipo converte (1 frase)"}],"funnel_gaps":[{"stage":"conteúdo|dm|lead|cliente","icon":"emoji","problem":"gap detectado","fix":"solução"}],"revenue_multiplier":{"current_estimate":"R$ X.XXX/mês","optimized_estimate":"R$ X.XXX/mês","multiplier":"Xx","key_changes":["mudança 1","mudança 2","mudança 3"]},"content_prescription":[{"frequency":"X/semana","format":"formato","type":"tipo","goal":"objetivo de conversão"}]}`,
  cta_intelligence: `{"cta_strategy":"estratégia geral pra esse formato + estágio (1-2 frases)","trigger_word_system":{"trigger":"PALAVRA","flow":["Passo 1: pessoa comenta a palavra","Passo 2: DM automática com...","Passo 3: lead magnet entregue","Passo 4: follow-up em 24h"],"dm_template":"mensagem automática exata enviada quando comentam a palavra"},"cta_variations":[{"style":"direto|curioso|urgente|social proof|desafio","cta_text":"texto exato do CTA pra colocar no post","placement":"onde colocar","expected_trigger_rate":"X% dos viewers","best_for":"quando usar"},"4 a 5 variações"],"caption_closers":["3 a 4 fechamentos de caption que direcionam pra ação"],"mistakes":[{"icon":"emoji","text":"erro que mata conversão"}]}`,
  collab_finder: `{"collab_strategy":"estratégia geral (1-2 frases)","ideal_partners":[{"type":"tipo de conta/profissional","why_complementary":"por que faz sentido (1 frase)","audience_overlap":"baixo|médio|alto","growth_potential":"alto|médio|baixo","collab_formats":[{"format":"Live|Reel collab|Takeover|Carrossel conjunto|Desafio","description":"como executar"}],"content_ideas":["2-3 ideias concretas de conteúdo juntos"],"search_terms":["termos pra buscar esse tipo de conta no Instagram"]},"4 a 5 tipos complementares"],"outreach_templates":[{"style":"direto|valor primeiro|proposta","message":"DM de abordagem (máx 100 palavras)","best_for":"quando usar"}],"collab_rules":[{"icon":"emoji","title":"regra","text":"explicação"}]}`,
  studio_subtitles: `{"subtitles":[{"start":"00:00","end":"00:03","text":"texto da legenda, máx 8-10 palavras por linha"}, "5 a 8 linhas"],"detected_language":"pt-BR","total_duration":"00:XX"}`,
  studio_versions: `{"versions":[{"name":"nome da versão","format":"Feed 1:1|Reels 9:16|Stories 9:16|Carrossel 1:1","objective":"descoberta|engajamento|autoridade|conversão","caption":"legenda otimizada máx 100 palavras seguindo as regras de legenda da marca","hashtags":["5 hashtags"],"text_overlays":[{"text":"texto curto","position":"top|center|bottom","style":"bold|clean|impact"}],"cta":"CTA específico","tone":"educativo|viral|vendas|autoridade","predicted_performance":{"views":"Xk","saves":"X","shares":"X"}}, "exatamente 4 itens, um de cada formato"]}`,
  daily_brief: `{"greeting":"saudação curta e motivacional, direta","actions":[{"type":"postar|responder|reciclar|engajar|analisar|criar","title":"ação curta","detail":"detalhe em 1 frase","urgency":"alta|média|baixa","time":"horário sugerido ou vazio"}, "4 a 5 ações concretas e específicas pro dia"],"insight":"1 insight estratégico do dia baseado em tendências fitness","alerts":[{"icon":"emoji","text":"oportunidade ou alerta acionável em 1 frase","color_hint":"green|cyan|orange"}, "3 itens"]}`,
  content_score: `{"total_score": número 0-100 combinando shareability (peso 30%), hook (25%), SEO (25%) e save potential (20%),"breakdown":{"share":0-100,"hook":0-100,"seo":0-100,"save":0-100},"verdict":"PUBLICAR"|"OTIMIZAR"|"REFAZER","top_fix":"a melhoria mais impactante em 1 frase","optimized_hook":"hook reescrito pra máximo impacto"}`,
  daily_signal: `{"signal_message":"mensagem motivacional curta e direta (máx 15 palavras, tom de comando)","yesterday_review":{"summary":"o que aconteceu ontem em 1-2 frases (simule baseado no dia da semana)","top_post":"qual tipo de post performou melhor","metric_highlight":"1 métrica que se destacou","lesson":"1 lição de ontem pra aplicar hoje"},"today_actions":[{"type":"postar|responder|reciclar|engajar|criar|stories|comentar|agendar|otimizar|colaborar","title":"ação específica","detail":"o que fazer exatamente (1-2 frases)","urgency":"alta|média|baixa","time":"horário sugerido (ex: 07:30)","content_idea":"ideia de conteúdo ou null"}, "6 a 8 ações específicas, distribuídas em horários realistas"],"recycle_opportunity":{"original":"post antigo que pode ser reciclado","new_format":"formato sugerido","new_angle":"como abordar diferente","urgency":"por que reciclar isso agora"},"trend_alert":{"trend":"tendência do momento no nicho fitness","heat": número 1-5,"lifespan":"curta|média|longa","content_suggestion":"como surfar essa onda com conteúdo"},"best_posting_times":["horário 1","horário 2","horário 3"],"week_overview":{"posts_done": número,"posts_goal":7,"day_of_week": número 0-6,"on_track": true ou false,"adjustment":"ajuste de rota se necessário"},"mce_daily":"1 frase do MCE pra guiar o dia (conecte Mindset, Comportamento ou Execução com a agenda de hoje)","closing":"frase de fechamento curta e impactante"}`,
  studio_vision: `{"viral_score": número 0-100,"predicted_views":"Xk-Yk","predicted_saves":"X-Y","predicted_shares":"X-Y","detected_elements":[{"icon":"emoji","label":"elemento detectado","detail":"detalhe curto"}, "3 a 5 itens"],"optimizations":[{"text":"otimização específica e aplicável","priority":"alta"|"média"}, "3 a 5 itens"],"best_time":"melhor horário pra postar (ex: Ter 19h-21h)","hook_suggestion":"hook sugerido pra máxima retenção","content_pillars_match":["pilares que o conteúdo toca"]}`,
  profile_audit: `{"overall_score": número 0-100 (média ponderada: bio 30%, nome_seo 20%, categoria 10%, cta_link 20%, consistencia 20%),"summary":"diagnóstico geral em 2 frases diretas","scores":[{"key":"bio","label":"Bio","score":0,"verdict":"frase curta de veredito","findings":["2 a 3 observações objetivas"],"fix":"a correção mais importante em 1 frase"},{"key":"nome_seo","label":"Nome (SEO)","score":0,"verdict":"...","findings":["..."],"fix":"..."},{"key":"categoria","label":"Categoria do perfil","score":0,"verdict":"...","findings":["..."],"fix":"..."},{"key":"cta_link","label":"CTA e link","score":0,"verdict":"...","findings":["..."],"fix":"..."},{"key":"consistencia","label":"Consistência de nicho","score":0,"verdict":"...","findings":["..."],"fix":"..."}],"bio_versions":[{"id":"1","style":"Autoridade + CTA","bio":"bio pronta com quebras de linha \\n","char_count": número exato de caracteres da bio,"why":"por que essa versão funciona"},{"id":"2","style":"Impacto + benefício","bio":"...","char_count":0,"why":"..."},{"id":"3","style":"Minimalista + direto","bio":"...","char_count":0,"why":"..."}],"name_analysis":{"current":"nome atual ou vazio","score":0,"keyword_found": true ou false,"issues":["..."],"suggestions":[{"name":"Nome real | Palavra-chave","char_count":0,"why":"palavra-chave pesquisável usada"},"exatamente 3 sugestões, cada uma com no máximo 30 caracteres"]},"category_suggestion":{"recommended":"ex: Coach Pessoal","alternatives":["2 alternativas"],"why":"por que essa categoria"},"link_strategy":{"verdict":"avaliação do link atual","recommended":"o que colocar no link","why":"1 frase"},"highlights":{"current_estimate": número de destaques detectados ou 0,"essentials":[{"name":"Resultados","purpose":"para que serve","capa":"sugestão de capa","first_stories":["2 stories iniciais"]},{"name":"Método"},{"name":"Sobre mim"},{"name":"Depoimentos"},{"name":"Consultoria"},"exatamente 5 itens, todos com purpose, capa e first_stories"],"missing":["destaques essenciais que o perfil ainda não tem"]},"pinned":[{"slot":1,"role":"Maior conversão","why":"por que esse pin importa","what_to_pin":"o que exatamente fixar","hook":"título/hook sugerido"},{"slot":2,"role":"Maior autoridade","why":"...","what_to_pin":"...","hook":"..."},{"slot":3,"role":"Maior prova social","why":"...","what_to_pin":"...","hook":"..."}],"quick_wins":["4 ações imediatas e específicas"]}` ,
  pinned_strategy: `{"strategy_score": número 0-100,"overall_verdict": "avaliação geral em 1-2 frases","pins": [{"slot": 1,"role": "identidade" | "resultado" | "oferta","current_fit": "forte" | "adequado" | "fraco" | "ausente","recommendation": "o que esse pin deveria ser/conter especificamente","format_suggestion": "Reel" | "Carrossel" | "Imagem estática" | "Vídeo","hook_suggestion": "sugestão de título/hook pra esse pin","rotation": "fixo" | "mensal" | "por campanha"}, "exatamente 3 itens, slots 1 a 3"],"content_ideas": [{"slot": 1,"idea": "ideia concreta de conteúdo pra esse pin"}],"mistakes_to_avoid": [{"icon": "emoji","text": "erro comum"}]}` ,
};


/** Garante o teto de 150 caracteres do Instagram em qualquer bio sugerida. */
const trimBio = (bio: string) => {
  const text = String(bio ?? "");
  if (text.length <= 150) return text;
  const cut = text.slice(0, 150);
  const stop = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
  return (stop > 110 ? cut.slice(0, stop) : cut).trimEnd();
};

const enforceBioLimit = (result: unknown) => {
  const r = result as Record<string, any>;
  if (!r || typeof r !== "object") return;
  for (const key of ["versions", "options", "bio_versions"]) {
    if (Array.isArray(r[key])) {
      r[key] = r[key].map((v: any) => {
        if (!v || typeof v !== "object" || typeof v.bio !== "string") return v;
        const bio = trimBio(v.bio);
        return { ...v, bio, char_count: bio.length };
      });
    }
  }
  if (typeof r.bio_suggestion === "string") r.bio_suggestion = trimBio(r.bio_suggestion);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode: Mode = body?.mode;
    if (!mode || !SCHEMAS[mode]) {
      return new Response(JSON.stringify({ error: "mode inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

    // Frames reais da foto/vídeo enviado (data URLs), quando o modo precisa
    // de análise visual de verdade (ex: studio_vision) — sem isso a IA só
    // recebia nome/tipo do arquivo em texto e "analisava" sem nunca ver a mídia.
    const images: string[] = Array.isArray(body?.images) ? body.images.slice(0, 6) : [];

    const ctx = [
      body?.pillar ? `Pilar: ${body.pillar}` : "",
      body?.format ? `Formato: ${body.format}` : "",
      body?.formatBrief ? `Regras obrigatórias do formato: ${body.formatBrief}` : "",
      body?.tone ? `Tom de voz: ${body.tone}` : "",
      body?.toneBrief ? `Regras do tom: ${body.toneBrief}` : "",
      body?.bestTime ? `Melhor horário para este objetivo: ${body.bestTime}` : "",
      body?.topic ? `Tema: ${body.topic}` : "",
      body?.style ? `Estilo: ${body.style}` : "",
      body?.duration ? `Duração: ${body.duration}` : "",
      body?.handle ? `Handle: @${String(body.handle).replace("@", "")}` : "",
      body?.bio ? `Bio atual: ${body.bio}` : "",
      body?.notes ? `Contexto extra: ${body.notes}` : "",
      body?.weekStart ? `Semana começando em: ${body.weekStart}` : "",
      body?.funnel ? `Etapa do funil: ${body.funnel} (tofu=audiência, mofu=confiança, bofu=venda)` : "",
      body?.objective ? `Objetivo específico: ${body.objective}` : "",
      body?.product ? `Produto em foco: ${body.product}` : "",
      Array.isArray(body?.niches) && body.niches.length ? `Nichos: ${body.niches.join(", ")}` : "",
      Array.isArray(body?.products) && body.products.length ? `Produtos do coach: ${body.products.join(", ")}` : "",
      Array.isArray(body?.differentials) && body.differentials.length ? `Diferenciais únicos: ${body.differentials.join(", ")}` : "",
      Array.isArray(body?.criteria) && body.criteria.length
        ? `Critérios de avaliação da bio (key|label|peso): ${body.criteria.map((c: any) => `${c.key}|${c.label}|${c.weight}`).join(" ; ")}`
        : "",
      body?.source ? `Conteúdo original para repurposar:\n${body.source}` : "",
      body?.originFormat ? `Formato original: ${body.originFormat}` : "",
      body?.scenario ? `Cenário do DM: ${body.scenario}` : "",
      body?.baseline ? `Versão base (gere uma variação diferente, mesma estratégia):\n${body.baseline}` : "",
      body?.objection ? `Objeção do lead: ${body.objection}` : "",
      body?.bestPosts ? `Posts com melhor performance:\n${body.bestPosts}` : "",
      body?.worstPosts ? `Posts com pior performance:\n${body.worstPosts}` : "",
      body?.formula ? `Fórmula viral identificada: ${body.formula}` : "",
      body?.situation ? `Situação atual do coach agora: ${body.situation}` : "",
      body?.exclude ? `Não repita estas ideias: ${body.exclude}` : "",
      body?.proof ? `Dados reais do cliente (não invente números): ${body.proof}` : "",
      body?.posts ? `Últimos posts descritos pelo coach:\n${body.posts}` : "",
      body?.ig_profile
        ? `Perfil real do Instagram conectado (use nome, bio e temas dos posts para personalizar; não invente dados):\n${JSON.stringify(body.ig_profile)}`
        : "",
      body?.subject ? `O que aparece na foto enviada: ${body.subject}` : "",
      body?.quickGoal ? `Objetivo rápido do post: ${body.quickGoal}` : "",
      body?.captionTone ? `Tom obrigatório desta legenda: ${body.captionTone}` : "",
      body?.captionToneBrief ? `Como aplicar o tom: ${body.captionToneBrief}` : "",
      body?.realData ? `Dados reais da operação do coach (use números exatos, nunca invente): ${body.realData}` : "",
      body?.extraPhotos ? `O coach enviou ${body.extraPhotos} fotos extras que serão usadas como fundo dos slides e stories — escreva textos curtos que funcionem sobre imagem.` : "",
      body?.mode === "post_package"
        ? `REGRAS OBRIGATÓRIAS DO CARROSSEL:
- Gere 6 a 8 slides nesta ordem: hook, problema, 3 a 5 conteúdos, takeaway, CTA.
- Slide hook: máximo 8 palavras, só a frase provocativa. Cada slide: máximo 20 palavras somando título, body e reference.
- Um conceito por slide. Nunca repita a mesma frase ou ideia em dois slides.
- Quando o tema for MCE, atribua pillar (mindset, comportamento ou execucao) e cite autoridade como "Kahneman, Princeton" no campo reference.
- CTA final: "Manda pra alguém que precisa ouvir isso" ou "Salva pra consultar antes do treino".
- Nunca use: "Você sabia que", "Neste post vamos falar sobre", "Fique até o final" ou "Curta e compartilhe".
- Tom direto, científico e autoral. Keywords contém somente termos realmente presentes no slide.`
        : "",
      body?.lightning ? "MODO RELÂMPAGO: seja rápido e direto, legenda de no máximo 6 linhas, carrossel e stories enxutos." : "",
      body?.videoDuration ? `O coach enviou um VÍDEO de ${body.videoDuration} segundos — o roteiro precisa caber exatamente nessa duração e os tempos devem ser coerentes com ela.` : "",
      body?.videoType ? `Tipo de vídeo: ${body.videoType}` : "",
      body?.videoTypeTips ? `Dicas obrigatórias deste tipo de vídeo (incorpore no bloco editing): ${body.videoTypeTips}` : "",
      body?.thesis ? `Tese polêmica a defender: ${body.thesis}` : "",
      body?.evidence ? `Base científica obrigatória (cite corretamente): ${body.evidence}` : "",
      body?.fact ? `Dado científico central do post: ${body.fact}` : "",
      body?.source ? `Fonte do dado (cite exatamente): ${body.source}` : "",
      body?.generatePosts ? "Preencha também o array posts com 5 posts aplicando o DNA identificado." : "",
      body?.mode === "content_dna" && !body?.generatePosts ? "Deixe o array posts vazio." : "",
      body?.mode === "viral_lab"
        ? "Liste as trends mais prováveis do Instagram fitness brasileiro nesta temporada e adapte cada uma ao perfil do coach (atleta IFBB Classic Physique, pai de menina, ex-Marinha, criador do Método MCE). Não invente métricas."
        : "",
      body?.format === "stories" ? "Para formato stories, preencha stories_sequence com 6 stories e deixe roteiro como array vazio." : "",
      ["share_score", "hook_analyzer", "save_triggers", "instagram_seo", "grid_architect", "bio_optimizer", "pinned_strategy", "conversion_bridge", "cta_intelligence", "collab_finder", "studio_subtitles", "studio_versions", "studio_vision", "daily_brief", "content_score", "daily_signal"].includes(body?.mode)
        ? `INSTRUÇÃO ESPECÍFICA DO MODO ${body.mode}: analise o conteúdo fornecido no Tema/Contexto e responda estritamente no schema JSON pedido, sem markdown. Seja direto, objetivo e aplicável ao nicho fitness/nutrição.`
        : "",
      body?.mode === "conversion_bridge"
        ? "Você é especialista em funil de conversão Instagram → cliente para coaches fitness 2026. Mapeie o pipeline Conteúdo → DM → Lead → Cliente. O Instagram não é o caixa — é a porta da frente. Mostre QUAL tipo de conteúdo gera mais clientes, não apenas mais likes. Use o ticket médio informado nas estimativas de receita."
        : "",
      body?.mode === "cta_intelligence"
        ? "Você é especialista em CTAs para Instagram 2026 no nicho fitness. CTAs com palavra-gatilho nos comentários geram conversão de dois dígitos quando o trigger é claro e o lead magnet combina com o post."
        : "",
      body?.mode === "collab_finder"
        ? "Você é especialista em parcerias e collabs no Instagram 2026 para o nicho fitness no Brasil. Instagram favorece collabs nativas e conteúdo co-criado."
        : "",
      body?.mediaInfo ? `Arquivo enviado pelo coach (nome/tipo): ${body.mediaInfo}` : "",
      images.length
        ? `Você está recebendo ${images.length} imagem(ns) real(is) do arquivo enviado — ${images.length > 1 ? "frames em ordem cronológica do vídeo (abertura → fechamento)" : "a foto enviada"}. Baseie a análise no que você REALMENTE vê nas imagens, não invente elementos que não estão lá.`
        : "",
      body?.mode === "studio_subtitles"
        ? "Você é um sistema de transcrição e legendagem para Reels fitness 2026. Gere legendas com timestamps realistas para o contexto informado. Cada linha com no máximo 8-10 palavras pra caber na tela 9:16. Frases curtas e faladas, tom de conversa."
        : "",
      body?.mode === "studio_versions"
        ? "Você é especialista em conteúdo fitness para Instagram 2026. Dado o texto/legendas de um vídeo, gere 4 versões de post prontas pra postar, uma pra cada formato. Varie os tons e objetivos entre as versões e estime performance de forma realista (nada de números inflados)."
        : "",
      body?.mode === "studio_vision"
        ? "Você é um sistema de análise visual de conteúdo para Instagram 2026 no nicho fitness. Com base no arquivo e no contexto informados, gere previsões de performance realistas, elementos detectados, otimizações aplicáveis e melhor horário de publicação. Nada de números inflados nem promessas."
        : "",
      body?.overlays ? `Textos overlay planejados na tela: ${body.overlays}` : "",
      body?.mode === "daily_brief"
        ? "Você é o Coach IA do Social ON. Gere o briefing diário do coach com ações concretas e específicas pro dia informado. Considere a data, o dia da semana, os pilares da marca e as tendências fitness atuais. Seja direto, zero clichê motivacional vazio."
        : "",
      body?.today ? `Hoje é: ${body.today}` : "",
      body?.mode === "content_score"
        ? "Você é um avaliador de conteúdo para Instagram 2026 no nicho fitness. Analise o conteúdo fornecido e dê o CONTENT SCORE unificado: shareability (peso 30%), hook (peso 25%), SEO (peso 25%), save potential (peso 20%). Seja rigoroso e realista — score acima de 90 só pra conteúdo excepcional."
        : "",
      body?.content ? `Conteúdo a avaliar:\n${body.content}` : "",
      body?.mode === "daily_signal"
        ? "Você é o SIGNAL — o sistema de briefing diário do Social ON, pro coach identificado acima (fitness/nutrição, sistema Método MCE). Gere o briefing COMPLETO do dia informado: específico, tático e acionável. Nada genérico."
        : "",
      body?.ticket ? `Ticket médio do coach: R$${body.ticket}/mês` : "",
      body?.funnelStage ? `Estágio do funil do post: ${body.funnelStage} (topo=descoberta, meio=consideração, fundo=decisão)` : "",
      body?.offer ? `Oferta / lead magnet: ${body.offer}` : "",
      body?.audienceSize ? `Tamanho da audiência do perfil: ${body.audienceSize}` : "",
      body?.collabGoal ? `Objetivo da collab: ${body.collabGoal}` : "",
      body?.profile_name ? `Campo NOME do perfil (não é o @): ${body.profile_name}` : "",
      body?.category ? `Categoria atual do perfil: ${body.category}` : "",
      body?.link ? `Link atual na bio: ${body.link}` : "",
      body?.highlights ? `Destaques atuais informados pelo coach: ${body.highlights}` : "",
      body?.pinnedPosts ? `Posts fixados atuais: ${body.pinnedPosts}` : "",
      ["bio_audit", "bio_optimizer", "profile_audit", "audit"].includes(body?.mode)
        ? `REGRA OBRIGATÓRIA DE BIO: cada sugestão de bio DEVE ter no MÁXIMO 150 caracteres, incluindo espaços, emojis e quebras de linha. CONTE os caracteres antes de retornar. Se ultrapassar 150, ENCURTE até caber. Preencha char_count com a contagem exata e real da string. Bios acima de 150 caracteres são inválidas.`
        : "",
      body?.mode === "profile_audit"
        ? `Você é um auditor sênior de perfis de Instagram no nicho fitness/nutrição no Brasil. Faça um diagnóstico profissional, rigoroso e específico — nada genérico. Scores realistas: acima de 90 só para perfis excepcionais. As 3 versões de bio devem ter abordagens diferentes: (1) Autoridade + CTA, (2) Impacto + benefício, (3) Minimalista + direto. Nunca mencione que você é um sistema automatizado.`
        : "",
    ].filter(Boolean).join("\n");


    const userText = `${ctx}\n\nGere no schema:\n${SCHEMAS[mode]}`;
    const userContent = images.length
      ? [...images.map((img) => ({ type: "image_url", image_url: { url: img } })), { type: "text", text: userText }]
      : userText;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `${BRAND}\n\n${coachIdentity(body)}\n\nVocê é o motor SOCIAL ON. Responda SEMPRE apenas JSON válido no schema pedido, sem markdown.` },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados no workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) throw new Error(`Gateway ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    }

    enforceBioLimit(parsed);

    return new Response(JSON.stringify({ mode, result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});