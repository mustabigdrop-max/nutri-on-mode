import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";
import {
  aplicarConfigPosSlides,
  promptPosSlides,
  type TipoCarrossel,
} from "../_shared/carouselConfigs.ts";

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
11. NUNCA usar markdown na legenda: nada de **negrito**, ##títulos, listas com - ou *. Apenas texto limpo, quebras de linha, emojis e hashtags no campo próprio.

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
  | "studio_subtitles" | "studio_versions" | "studio_vision" | "video_content" | "video_overlay" | "video_breakdown"
  | "breakdown_caption" | "mce_carousel" | "nexus_carousel" | "nexus_reels" | "nexus_stories" | "nexus_como_obter" | "photo_story" | "photo_all" | "mito_metodo" | "viral_kit" | "interaction_pack" | "story_frames" | "dm_scripts"
  | "daily_brief" | "content_score" | "daily_signal" | "resultado_protocolo" | "resultado_stories" | "resultado_reels"
  | "refeicao_carrossel" | "refeicao_stories" | "refeicao_reels" | "pos_slides" | "print_nutrion"
  | "biomech_content" | "biomech_reels" | "biomech_stories" | "biomech_ideias" | "module_content"
  | "reciclar_10";

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
  post_package: `{"hook":"capa provocativa, máximo 8 palavras","caption":"legenda completa em tom de conversa, parágrafos de no máximo 3 linhas separados por \\n\\n, hook na primeira linha e CTA no final","hashtags":["#tag","... 15 itens misturando grandes, médias e nichadas"],"best_time":"ex: 12h30 (terça-feira)","reach_forecast":"alto|médio|baixo","self_comment":"comentário pronto para o coach postar logo após publicar","carousel":[{"type":"hook|problem|content|takeaway|cta","title":"frase direta","body":"vazio no hook/CTA; nos demais, 35 a 55 palavras explicando o dado — achado + mecanismo + aplicação prática","pillar":"mindset|comportamento|execucao","reference":"Autor, Universidade — apenas quando MCE","keywords":["até 3 palavras-chave"],"file_index":0},"6 a 8 itens: hook, problema, 3-5 conteúdos, takeaway e CTA"],"stories":[{"title":"texto grande do story","body":"linha de apoio ou CTA","sticker":"NENHUM|QUIZ|ENQUETE|LINK|CAIXA_DE_PERGUNTAS","sticker_content":"conteúdo pronto do sticker (pergunta do quiz com opções e resposta certa, opções da enquete, ou o link)"},"exatamente 4 itens: 1 hook sobre a foto (sticker NENHUM), 1 educativo (QUIZ), 1 CTA (ENQUETE), 1 final de produto nutriON (LINK nutrion.app.br)"]}` ,
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
  video_overlay: `{"exercicio":"Nome do exercício","padrao":"Squat|Push|Pull|Hinge|Carry|Rotation","musculos_primarios":["max 3"],"musculos_secundarios":["max 3"],"cue_principal":"Dica técnica #1 curta","cues":["dica 2","dica 3"],"angulos":["Joelho 90°","Quadril neutro"],"alerta":"Principal risco sem avaliação prévia — 1 frase curta","frase":"Frase de impacto compartilhável","musculos":{"deltoide_e":0,"deltoide_d":0,"peitoral_e":0,"peitoral_d":0,"biceps_e":0,"biceps_d":0,"triceps_e":0,"triceps_d":0,"antebraco_e":0,"antebraco_d":0,"trapezio":0,"dorsal_e":0,"dorsal_d":0,"lombar":0,"abdomen":0,"obliquo_e":0,"obliquo_d":0,"gluteo_e":0,"gluteo_d":0,"quadriceps_e":0,"quadriceps_d":0,"isquiotibial_e":0,"isquiotibial_d":0,"panturrilha_e":0,"panturrilha_d":0,"adutor_e":0,"adutor_d":0},"fases":[{"nome":"Excêntrica","inicio":0,"fim":0.4,"cue":"dica curta desta fase","musculos_ativos":["quadriceps_e","quadriceps_d"]},{"nome":"Transição","inicio":0.4,"fim":0.55,"cue":"dica","musculos_ativos":["abdomen"]},{"nome":"Concêntrica","inicio":0.55,"fim":1,"cue":"dica","musculos_ativos":["gluteo_e","gluteo_d"]}]}`,
  video_breakdown: `{"exercicio":"Nome do exercício","padrao":"Squat|Push|Pull|Hinge|Carry|Rotation","musculos_primarios":["max 3"],"musculos_secundarios":["max 3"],"execucao":{"titulo":"Ponto-chave desta fase em 4-6 palavras","descricao":"2 frases técnicas: ângulos articulares, ativação e o que observar","cue":"Dica técnica mais importante em 1 frase curta","erro_comum":"Erro mais comum nesta fase em 1 frase"},"musculos_ativos":{"trapezio":0,"deltoide_e":0,"deltoide_d":0,"peitoral_e":0,"peitoral_d":0,"biceps_e":0,"biceps_d":0,"triceps_e":0,"triceps_d":0,"dorsal_e":0,"dorsal_d":0,"lombar":0,"abdomen":0,"obliquo_e":0,"obliquo_d":0,"gluteo_e":0,"gluteo_d":0,"quadriceps_e":0,"quadriceps_d":0,"isquio_e":0,"isquio_d":0,"panturrilha_e":0,"panturrilha_d":0},"mce":{"mentalidade":"como pensar durante a execução — 1 frase forte","comportamento":"o hábito que sustenta a qualidade — 1 frase","execucao_mce":"o dado/registro que importa — 1 frase"},"alerta_apex":"Por que este exercício exige avaliação postural prévia — 1 frase de urgência","frase_impacto":"Bordão curto e compartilhável sobre este exercício"}`,
  photo_story: `{"frase":"frase de impacto sobre o tema, MÁXIMO 80 caracteres, tom de verdade dura, sem clichê","dado":{"numero":"dado numérico curto, ex: -15%","descricao":"o que esse número significa, até 90 caracteres","fonte":"autor, ano"},"rotina":{"nome":"nome do treino/rotina do dia, até 4 palavras","detalhes":"detalhe curto, ex: 5x5 · 40min","frase":"frase de 1 linha sobre consistência, MÁXIMO 60 caracteres"},"cta":{"pergunta":"pergunta curta que provoca reflexão sobre qual pilar trava a pessoa, até 40 caracteres"},"minimo":"frase curta pós-treino, MÁXIMO 40 caracteres, tom cansado mas satisfeito"}`,
  photo_all: `{"analise":{"cenario":"academia|refeicao|bastidor|com_filha|lifestyle|espelho|pos_treino","elementos":["3 a 5 elementos que você REALMENTE vê na foto"],"energia":"motivacional|reflexivo|bastidor|divertido|serio","dica_foto":"dica rápida de melhoria ou 'foto boa, posta assim'"},"stories":{"sugestoes":[{"angulo":"representatividade|paternidade|disciplina|ciencia|lifestyle|metodo","texto_overlay":"texto sobre a foto, MÁXIMO 80 caracteres","subtexto":"complemento, MÁXIMO 50 caracteres","potencial_viral":8,"motivo":"por que funciona em 1 frase"},"exatamente 3 itens com ÂNGULOS DIFERENTES, ordenados do maior potencial_viral pro menor"],"enquete":{"pergunta":"pergunta de enquete, máx 60 caracteres","opcao1":"SIM + emoji","opcao2":"NÃO + emoji"},"story_cta":{"texto":"chamada pro diagnóstico, máx 60 caracteres","cta":"Diagnóstico gratuito — link na bio"}},"carrossel":{"usar_foto_capa":true,"texto_capa":"frase de impacto do slide 1, máx 60 caracteres","subtexto_capa":"complemento, máx 40 caracteres","tema_sugerido":"tema educativo dos slides 2 a 8","tipo":"MCE|NEXUS_PEPTIDEO|NEXUS_MICROBIOTA","potencial_viral":8,"motivo":"por que esse tema combina com essa foto"},"feed_solo":{"legenda":"legenda completa, máx 600 caracteres, com emojis e CTA do diagnóstico no final, SEM markdown","legenda_curta":"versão curta pro story, máx 200 caracteres"},"hashtags":{"alcance":["5 hashtags de 500k a 5M posts"],"nicho":["5 hashtags de 50k a 500k posts"],"micro":["5 hashtags abaixo de 50k, incluindo #nutrion #metodomce #coachdiogomello"]},"timing":{"story_agora":true,"feed_horario":"ex: 12:30","motivo_horario":"por que esse horário hoje"}}`,
  mce_carousel: `{"capa":{"tag":"tag curta de categoria, até 3 palavras","titulo":"título forte de até 9 palavras, com **palavras-chave** entre asteriscos duplos","subtitulo":"complemento de até 14 palavras"},"dor":{"tag":"tag curta","titulo":"frase de contexto de até 12 palavras","impacto":"frase de impacto curta, até 8 palavras","corpo":"explicação de 35 a 55 palavras com **palavras-chave** destacadas"},"pilares":{"M":{"frase":"frase-espelho de até 14 palavras com **destaque**","corpo":"explicação de 30 a 45 palavras com **destaques**"},"C":{"frase":"...","corpo":"...","lista":["2 a 3 ações práticas curtas"]},"E":{"frase":"...","corpo":"..."}},"integracao":{"tag":"tag curta","titulo":"título de até 10 palavras com **destaque**","verbos":{"M":"1 verbo/2 palavras","C":"1 verbo/2 palavras","E":"1 verbo/2 palavras"},"conexao":"frase de conexão de até 30 palavras com **destaques**"}}`,
  nexus_carousel: `{"slide1_gancho":"frase provocativa de capa, MÁXIMO 80 caracteres","slide1_classe":"classe farmacológica ou categoria, até 4 palavras","slide1_status":"APROVADO|PESQUISA|EXPERIMENTAL","slide2_ficha":{"composto":"nome","classe":"classe","meia_vida":"ex: ~7 dias, ou traço se não se aplica","via":"subcutânea/oral/alimentar/etc","aprovacao_fda":"ano e indicação, ou Não aprovado","anvisa":"Aprovado/Não aprovado/Em análise","fabricante":"fabricante, ou principal fonte alimentar quando for microbiota","dose_estudada":"dose usada nos estudos, obrigatória, ex: 2,4 mg/semana","nivel_evidencia":"FORTE|MODERADA|PRELIMINAR","num_estudos":"ex: 50+ ensaios, 30.000+ pacientes"},"slide3_mecanismo":{"passos":["EXATAMENTE 3 passos do mecanismo, em ordem, cada um com no MÁXIMO 15 palavras"],"traducao_leiga":"Em resumo: ... máximo 110 caracteres"},"slide4_beneficios":[{"numero":"dado numérico curto, ex: -15.8%","desc":"o que esse número significa, até 60 caracteres","estudo":"nome do estudo, autor e ano","n":"tamanho da amostra, ex: 1.961 pacientes"}],"slide5_riscos":[{"risco":"risco ou limitação documentada, até 70 caracteres","contexto":"explicação prática, até 80 caracteres"}],"slide5_nao_indicado":"para quem NÃO é indicado, máximo 110 caracteres","slide6_comparativo_nome":"nome do composto comparado, ou string vazia se não houver comparação honesta","slide6_tabela":[{"criterio":"label curto","composto1":"valor curto","composto2":"valor curto"}],"slide7_faz_sentido":["3 a 4 critérios de quando pode fazer sentido considerar"],"slide7_nao_faz_sentido":["3 a 4 critérios de quando não faz sentido"],"slide8_perguntas_medico":["3 a 6 perguntas prontas para levar ao médico, na primeira pessoa — serão exibidas 3 por slide"],"slide9_resumo":{"oque":"1 frase curta","beneficio":"1 frase curta com dado","risco":"1 frase curta","evidencia":"FORTE|MODERADA|PRELIMINAR","custo":"faixa de custo mensal, ou string vazia","veredicto":"1 frase final impactante"},"legenda":"legenda pro Instagram, máximo 800 caracteres, com dados citados, emojis 🧬🔬📊, hashtags científicas e fitness, CTA do diagnóstico e disclaimer no final"}`,
  nexus_reels: `{"hook":"frase dos primeiros 3 segundos, até 12 palavras","duracao_total":"30-60s","cortes":[{"segundo":"0-3s","texto_tela":"TEXTO GRANDE NA TELA, CAIXA ALTA, até 6 palavras","fala":"o que falar nesse corte, 1 a 2 frases curtas","acao":"direção de câmera/expressão/gesto"},"exatamente 5 cortes: hook, mecanismo, risco ou o que ninguém fala, prática, CTA"],"musica_sugerida":"tipo de áudio em alta ou som original","hashtags":["#tag","... 10 a 15 itens"],"legenda":"legenda completa pro Reels com quebras de linha \\n, CTA e disclaimer curto"}`,
  nexus_stories: `{"frames":[{"tipo":"GANCHO|CONTEUDO|ENQUETE|CTA","texto":"frase principal do frame","subtexto":"linha de apoio curta","bullets":["2 a 4 bullets curtos, apenas no frame CONTEUDO"],"pergunta":"pergunta da enquete, apenas no frame ENQUETE","opcao1":"opção 1 curta","opcao2":"opção 2 curta","cta":"chamada final, apenas no frame CTA","instrucao":"instrução visual de como montar o frame"},"exatamente 4 frames na ordem GANCHO, CONTEUDO, ENQUETE, CTA"]}`,
  nexus_como_obter: `{"suplementos":[{"nome":"marca/produto","fabricante":"fabricante","dose":"dose por porção","via":"via e frequência","custo_estimado":"faixa de custo com moeda","disponivel_brasil":true,"status_regulatorio":"ex: GRAS FDA 2021 / Novel Food EFSA 2023 / ANVISA aprovado","onde_comprar":"importação, farmácia de manipulação, farmácia comum"}],"nomes_comerciais":[{"marca":"ex: Ozempic®","fabricante":"ex: Novo Nordisk","indicacao":"indicação aprovada","doses":"apresentações e doses","via":"via e frequência","anvisa":true,"custo_brasil":"faixa em R$/mês"}],"farmacos_moduladores":[{"nome":"fármaco ou composto","mecanismo":"como aumenta/modula, com magnitude quando houver","estudo":"Autor et al., ano","dose_estudada":"dose usada nos estudos","prescricao":true,"disponivel_brasil":true}],"prebioticos_estimulantes":[{"nome":"nome","fonte_alimentar":"alimento ou extrato","estudo":"Autor et al., ano","dose":"dose estudada"}],"estilo_vida":[{"fator":"comportamento","mecanismo":"por que funciona","estudo":"Autor et al., ano","dose":"ex: 150 min/semana"}],"fatores_reducao":["3 a 6 fatores que reduzem/prejudicam"],"escalonamento":[{"semana":"ex: Semana 1-4","dose":"dose","nota":"observação curta"}],"exames_recomendados":["exames de check-up antes de iniciar"],"combinacoes":[{"combinacao":"ex: Semaglutide + treino de força","motivo":"por quê","evidencia":"estudo ou diretriz","protocolo":"como é feito"}],"protocolos_referencia":[{"centro":"centro/instituição","pais":"país","protocolo":"o que usam","pesquisador":"pesquisador de referência, ou string vazia"}]}`,
  mito_metodo: `{"crenca":"a crença popular reescrita em até 10 palavras","veredito":"MITO|MÉTODO|DEPENDE","evidencias":[{"titulo":"título direto de até 8 palavras","corpo":"explicação de 35 a 55 palavras com dado ou mecanismo real"},"exatamente 4 itens diferentes entre si"],"explicacao":"veredito explicado em 30 a 45 palavras","alternativa":["3 a 4 ações práticas curtas para fazer no lugar"],"caption":"legenda completa pronta pro Instagram com quebras de linha \\n e CTA no final","hashtags":["#tag","... 15 itens"]}`,
  viral_kit: `{"hooks":[{"tipo":"POLÊMICA|IDENTIFICAÇÃO|CURIOSIDADE|AUTORIDADE|RESULTADO","texto":"hook de até 14 palavras, pronto pra virar slide 1 ou os 3 primeiros segundos"},"exatamente 3 itens, com tipos diferentes"],"cortes":[{"segundo":"0-3s","texto_tela":"TEXTO EM CAIXA ALTA, até 6 palavras","posicao":"centro|topo|centro-esquerda","estilo":"grande, bold, branco com sombra"},"exatamente 5 cortes cobrindo 0s até ~30s, o último sendo o CTA"],"self_comment":"comentário que o coach posta no próprio post nos primeiros 30 segundos","cta_post":"CTA curto que aparece no último slide ou nos segundos finais","cta_caption":"CTA da legenda","hashtags":{"alcance":["5 hashtags grandes"],"nicho":["5 hashtags de nicho"],"micro":["5 hashtags micro onde dá pra ser top post"]}}`,
  interaction_pack: `{"contexto":"tema do post ao qual estas respostas se referem","respostas_elogio":["3 respostas curtas e humanas para quem elogiou"],"respostas_duvida":["3 respostas para perguntas tecnicas, com conteudo real e convite sutil"],"respostas_marcou_amigo":["2 respostas para quem marcou alguem"],"respostas_critica":["2 respostas educadas e firmes para discordancia"],"self_comment":"comentario que o coach posta no proprio post pra puxar engajamento","dica":"dica operacional curta de tempo de resposta"}`,
  story_frames: `{"tema":"tema da sequencia","frames":[{"tipo":"VIDEO_COM_TEXTO|TEXTO_SOBRE_FUNDO|ENQUETE|CTA|GANCHO|VALOR|CTA_DIRETO","instrucao":"o que gravar (apenas em VIDEO_COM_TEXTO)","texto_tela":"texto curto sobre o video","texto_principal":"frase principal do frame, ate 14 palavras","texto_secundario":"linha de apoio curta","destaque":"frase curta de destaque, opcional","duracao":"5-8s","sticker_sugerido":null,"pergunta":"pergunta da enquete (apenas ENQUETE)","opcao_1":"opcao 1","opcao_2":"opcao 2","texto_acima":"linha acima da enquete","cta":"chamada de acao curta","subtexto":"linha final curta","link_bio":true},"3 a 4 frames na ordem certa"],"dica_gravacao":"1 frase de direcao de gravacao"}`,
  dm_scripts: `{"categoria_leads":{"titulo":"Leads quentes","script":"script principal com [nome]","followup_24h":"follow-up de 24h","followup_48h":"ultima mensagem"},"categoria_duvidas":{"titulo":"Duvidas tecnicas","script":"script com [nome]","cta_final":"CTA final"},"categoria_elogios":{"titulo":"Elogios e apoio","script":"script com [nome]","cta_sutil":"CTA sutil"},"categoria_spam":{"titulo":"Spam / parcerias aleatorias","acao":"o que fazer"},"prioridade_ordem":["leads","duvidas","elogios","spam"],"meta":"meta de tempo de resposta"}`,
  breakdown_caption: `{"exercicio":"nome do exercício","hooks":["3 hooks curtos de até 12 palavras"],"legenda_reels":"legenda pronta pro Reels, 120-180 palavras, primeira linha = gancho, quebras de linha a cada 2-3 frases, provocação sutil contra treino sem avaliação, fechando com CTA","legenda_feed":"legenda educativa pro feed, 200-250 palavras, mesma estrutura","texto_na_tela":["5 a 6 frases curtas de 3-5 palavras que aparecem sobre o vídeo, uma por momento analisado"],"cta":"chamada final direta (diagnóstico no link da bio, DM ou WhatsApp)","hashtags":["18 a 22 hashtags sem acento"],"stories":["3 a 4 stories de apoio"],"frase_impacto":"bordão curto e compartilhável"}`,
  video_content: `{"exercicio":"nome do exercício identificado no frame","padrao_movimento":"Push|Pull|Hinge|Squat|Carry|Rotation","musculos_primarios":["lista"],"musculos_secundarios":["lista"],"zonas_corporais_ativas":["somente itens desta lista fixa: upper_chest, lower_chest, front_delt, side_delt, rear_delt, biceps, triceps, forearms, upper_back, lats, lower_back, core, glutes, quads, hamstrings, calves"],"metricas":{"complexidade":0,"risco_sem_avaliacao":0,"impacto_assimetria":0,"necessidade_correcao":0},"analise_execucao":{"pontos_positivos":["2 a 3 pontos bons observados no frame"],"pontos_atencao":["2 a 3 pontos a corrigir ou observar"],"cue_principal":"a dica de execução mais importante em 1 frase","angulacoes_chave":["ângulos articulares importantes no exercício, ex: joelho 90°, quadril neutro"]},"growth":{"share_score":0,"save_score":0,"comment_score":0,"viral_potential":0,"angulo_polemico":"a provocação ou insight contraintuitivo deste exercício que faz parar o scroll (contra fichas prontas, treino sem avaliação, mercado genérico)","por_que_compartilham":"motivo real pra alguém mandar este conteúdo por DM pra um amigo (ex: mostra pro seu personal)","gatilho_salvamento":"o que faz a pessoa salvar (ex: dica técnica pra revisar antes do treino)","pergunta_comentarios":"pergunta específica pra gerar comentários","cta_bio":"CTA natural levando pro link na bio (diagnóstico MCE gratuito)","cta_dm":"CTA levando pra DM com palavra-chave (ex: manda DM com AVALIAR)","cta_whatsapp":"CTA levando pro WhatsApp (acompanhamento individual)","estrategia_post":"3-4 frases: QUANDO postar (melhor horário), COMO postar (reels vs carrossel) e o que fazer nos comentários pra maximizar alcance"},"conteudo":{"hook_reels_3_opcoes":["Hook 1 — polêmico/provocativo","Hook 2 — educativo/revelador","Hook 3 — pessoal/vulnerável"],"hook_reels":"o melhor dos 3 hooks, máximo 12 palavras","roteiro_reels":"roteiro completo de Reels 30-45s no formato GANCHO polêmico (3s) → PROBLEMA que ninguém fala (5s) → ANÁLISE técnica com autoridade (10s) → COMO DEVERIA SER mostrando o processo (10s) → CTA pro diagnóstico ou DM (5s). Cortes rápidos, texto na tela em cada transição, tom de quem sabe do que fala","texto_tela_reels":["5 a 6 frases curtas de 3-5 palavras que aparecem como texto overlay em cada corte do Reels — fortes, diretas, impactantes"],"caption_educativa":"legenda pro feed 200-250 palavras. ESTRUTURA: 1ª linha = gancho forte separada por quebra. Corpo educativo com dados e técnica. Provocação sutil contra o mercado genérico. Fechar com CTA pro link na bio OU DM. Emojis estratégicos (🎯⚡🧠). Quebras de linha a cada 2-3 frases","caption_profissional":"legenda B2B 200-250 palavras, mesma estrutura, foco em como profissionais que usam nutriON entregam resultado superior (APEX + STRATUM + MCE como diferenciais competitivos). CTA: DM ou WhatsApp","carrossel_slides":["Slide 1: pergunta provocativa ou dado chocante","Slide 2: o erro que todo mundo comete","Slide 3: por que isso acontece","Slide 4: como deveria ser (mostra o processo)","Slide 5: a dica técnica de ouro","Slide 6: antes vs depois do processo correto","Slide 7: CTA — diagnóstico gratuito no link da bio"],"stories_sequencia":["Story 1: enquete sim/não sobre o exercício","Story 2: revelação do erro","Story 3: dica com caixa de perguntas","Story 4: CTA pro link na bio"],"hashtags":["20 a 25 hashtags organizadas: 5 de alto volume, 10 de nicho, 5-10 de baixo volume/específicas, sem acento"]},"apex_insight":"2-3 frases: como assimetrias e desvios posturais detectados na avaliação APEX mudam completamente a prescrição deste exercício — e como 99% dos profissionais ignoram isso","mce_insight":"2-3 frases: MCE aplicado aqui — como mentalidade afeta escolha de carga, como comportamento de registro muda resultado, como execução consciente supera volume bruto","frase_impacto":"1 frase poderosa e compartilhável, tipo bordão que a pessoa cola no story. Ex: 'Treino sem avaliação é exercício, não prescrição.'"}`,
  profile_audit: `{"overall_score": número 0-100 (média ponderada: bio 30%, nome_seo 20%, categoria 10%, cta_link 20%, consistencia 20%),"summary":"diagnóstico geral em 2 frases diretas","scores":[{"key":"bio","label":"Bio","score":0,"verdict":"frase curta de veredito","findings":["2 a 3 observações objetivas"],"fix":"a correção mais importante em 1 frase"},{"key":"nome_seo","label":"Nome (SEO)","score":0,"verdict":"...","findings":["..."],"fix":"..."},{"key":"categoria","label":"Categoria do perfil","score":0,"verdict":"...","findings":["..."],"fix":"..."},{"key":"cta_link","label":"CTA e link","score":0,"verdict":"...","findings":["..."],"fix":"..."},{"key":"consistencia","label":"Consistência de nicho","score":0,"verdict":"...","findings":["..."],"fix":"..."}],"bio_versions":[{"id":"1","style":"Autoridade + CTA","bio":"bio pronta com quebras de linha \\n","char_count": número exato de caracteres da bio,"why":"por que essa versão funciona","recommended": true ou false},{"id":"2","style":"Impacto + benefício","bio":"...","char_count":0,"why":"...","recommended": true ou false},{"id":"3","style":"Minimalista + direto","bio":"...","char_count":0,"why":"...","recommended": true ou false},"exatamente UMA das 3 com recommended:true — a que você recomendaria de verdade pro perfil analisado, considerando nicho e objetivo"],"name_analysis":{"current":"nome atual ou vazio","score":0,"keyword_found": true ou false,"issues":["..."],"suggestions":[{"name":"Nome real | Palavra-chave","char_count":0,"why":"palavra-chave pesquisável usada"},"exatamente 3 sugestões, cada uma com no máximo 30 caracteres"]},"category_suggestion":{"recommended":"ex: Coach Pessoal","alternatives":["2 alternativas"],"why":"por que essa categoria"},"link_strategy":{"verdict":"avaliação do link atual","recommended":"o que colocar no link","why":"1 frase"},"highlights":{"current_estimate": número de destaques detectados ou 0,"essentials":[{"name":"Resultados","purpose":"para que serve","capa":"sugestão de capa","first_stories":["2 stories iniciais"]},{"name":"Método"},{"name":"Sobre mim"},{"name":"Depoimentos"},{"name":"Consultoria"},"exatamente 5 itens, todos com purpose, capa e first_stories"],"missing":["destaques essenciais que o perfil ainda não tem"]},"pinned":[{"slot":1,"role":"Maior conversão","why":"por que esse pin importa","what_to_pin":"o que exatamente fixar","hook":"título/hook sugerido"},{"slot":2,"role":"Maior autoridade","why":"...","what_to_pin":"...","hook":"..."},{"slot":3,"role":"Maior prova social","why":"...","what_to_pin":"...","hook":"..."}],"quick_wins":["4 ações imediatas e específicas"]}` ,
  resultado_protocolo: `{"capa":{"tag":"tag curta de categoria, até 3 palavras, ex: RESULTADO REAL","titulo":"título de impacto conectando o foco ao resultado, até 8 palavras, com **palavras-chave** entre asteriscos duplos","subtitulo":"complemento de até 12 palavras"},"resultado":{"titulo":"frase de impacto sobre a evolução, até 10 palavras","corpo":"explicação de 30 a 45 palavras conectando esforço real + método, SEM inventar números que não foram informados nos dados reais","numero":"um dado numérico SÓ se realmente foi informado nos dados reais; caso contrário string vazia","numero_label":"o que esse número representa, até 6 palavras, ou string vazia se numero estiver vazio"},"nutricao":{"titulo":"título curto sobre o que sustenta o resultado, até 8 palavras","corpo":"se meta_dia_kcal foi informada nos dados reais, cite esse número; senão dê 1 dica geral de nutrição pós-treino sem inventar dado específico — 30 a 45 palavras"},"resumo_frase":"frase final de fechamento conectando disciplina + sistema ao foco, até 14 palavras, pode usar **destaque**","legenda":"legenda completa pro Instagram, até 700 caracteres, contando a história de como o protocolo real levou ao resultado, citando o nome do treino e ao menos um princípio do método, terminando com CTA do diagnóstico gratuito, SEM markdown","hashtags":["#tag","... 12 a 15 itens misturando fitness, nicho e resultado"]}`,
  resultado_stories: `{"frames":[{"tipo":"FOTO_RESULTADO","texto":"frase de impacto sobre o resultado, MÁXIMO 70 caracteres","subtexto":"complemento curto terminando com 'Arrasta ▸', até 40 caracteres"},{"tipo":"PROTOCOLO_RESUMO","texto":"título do treino em caixa alta, até 4 palavras","bullets":["EXATAMENTE 4 bullets curtos (até 50 caracteres) com dados REAIS do treino: aquecimento, número de exercícios e estrutura, duração e RPE, tempo sob tensão"]},{"tipo":"EXERCICIO_DESTAQUE","texto":"EXERCÍCIO PRINCIPAL","exercicio":"nome real do exercício que está nos dados","detalhe":"a progressão real de séries desse exercício, até 90 caracteres","dica":"o que significa o RPE ou a técnica usada, até 90 caracteres"},{"tipo":"NUTRICAO","texto":"título curto sobre a nutrição do dia, até 6 palavras","detalhe":"o ajuste calórico REAL do dia se estiver nos dados; senão um princípio de nutrição do treino, até 90 caracteres","pos_treino":"sugestão de refeição pós-treino coerente com a meta, até 70 caracteres"},{"tipo":"ENQUETE","pergunta":"pergunta curta sobre o método, até 45 caracteres","opcao1":"opção 1 curta com emoji","opcao2":"opção 2 curta com emoji"},{"tipo":"CTA","texto":"frase de fechamento conectando o treino ao nutriON, até 60 caracteres","cta":"chamada final, ex: Quer o mesmo protocolo? DM 'TREINO'"}],"legenda":"legenda curta pro story em texto puro, até 300 caracteres, SEM markdown","hashtags":["#tag","... 10 a 12 itens"]}`,
  resultado_reels: `{"hook":"frase dos primeiros 3 segundos, até 12 palavras","duracao_total":"30s","cortes":[{"segundo":"0-3s","texto_tela":"TEXTO GRANDE EM CAIXA ALTA, até 6 palavras","acao":"direção de câmera/gesto","fala":"o que falar, 1 frase curta (pode ser vazio no primeiro corte)"},"exatamente 6 cortes cobrindo 0-3s, 3-8s, 8-15s, 15-22s, 22-27s e 27-30s: gancho, aquecimento, top set, back-off, nutrição do dia e CTA"],"musica":"tipo de áudio sugerido, sem vocal","legenda":"legenda completa pro Reels em texto puro, até 700 caracteres, terminando com CTA, SEM markdown","hashtags":["#tag","... 12 a 15 itens"]}`,
  biomech_content: `{"capa":{"tag":"tag curta de categoria, até 3 palavras, ex: BIOMECÂNICA REAL","titulo":"título de impacto sobre o exercício e o foco, até 9 palavras, com **palavras-chave** entre asteriscos duplos","subtitulo":"complemento de até 12 palavras"},"dado":{"numero":"o dado numérico mais forte do conteúdo de pesquisa (ex: -15%, 92% MVIC, 3x mais ativação) — SÓ se realmente aparece no conteúdo de pesquisa fornecido, senão string vazia","titulo":"frase de impacto sobre esse dado, até 10 palavras","corpo":"explicação de 30 a 50 palavras do achado citando o mecanismo, baseada SOMENTE no conteúdo de pesquisa fornecido"},"pontos":[{"titulo":"título curto de até 8 palavras","corpo":"explicação de 25 a 40 palavras baseada no conteúdo de pesquisa fornecido"},"exatamente 4 itens, cada um cobrindo um aspecto DIFERENTE do conteúdo (nunca repita a mesma ideia)"],"aplicacao":{"titulo":"título curto sobre como aplicar isso no treino, até 8 palavras","corpo":"1 a 2 cues práticos baseados no conteúdo de pesquisa fornecido, 30 a 45 palavras"},"resumo_frase":"frase final curta e compartilhável sobre o exercício, até 14 palavras, pode usar **destaque**","legenda":"legenda completa pro Instagram, até 700 caracteres, contando o achado real de forma acessível (nunca cite nome de journal nem 'Autor et al.' — prefira 'a ciência já mostrou' ou nomeie o pesquisador por extenso), terminando com CTA, SEM markdown"}`,
  biomech_reels: `{"hook":"frase dos primeiros 3 segundos sobre o exercício, até 12 palavras","duracao_total":"30s","cortes":[{"segundo":"faixa de tempo","texto_tela":"TEXTO EM CAIXA ALTA, até 6 palavras","acao":"direção de câmera/execução do exercício","fala":"o que falar, 1 frase curta baseada no conteúdo de pesquisa fornecido"},"exatamente 5 cortes: hook, o dado/achado, o mecanismo, a aplicação prática, CTA"],"legenda":"legenda completa pro Reels em texto puro, até 500 caracteres, terminando com CTA, SEM markdown"}`,
  biomech_stories: `{"tema":"tema da sequência sobre o exercício","frames":[{"tipo":"GANCHO|VALOR|ENQUETE|CTA_DIRETO","texto_principal":"frase principal do frame, até 14 palavras","texto_secundario":"linha de apoio curta","destaque":"frase curta de destaque, opcional","duracao":"5-8s","pergunta":"pergunta da enquete (apenas ENQUETE)","opcao_1":"opção 1 curta","opcao_2":"opção 2 curta","texto_acima":"linha acima da enquete","cta":"chamada de ação curta (apenas CTA_DIRETO)","subtexto":"linha final curta","link_bio":true},"exatamente 4 frames na ordem gancho, dado da pesquisa, enquete e CTA"],"dica_gravacao":"1 frase de direção","legenda":"legenda curta em texto puro, até 300 caracteres, SEM markdown"}`,
  biomech_ideias: `{"sugestao_viral":{"titulo":"título do conteúdo mais viral possível sobre este exercício","descricao":"por que viraliza, até 100 caracteres","formato":"reels","angulo":"react_coach|erro_comum","score":10,"texto_tela_hook":"texto dos 3 primeiros segundos do reels, caixa alta"},"sugestao_saves":{"titulo":"título do conteúdo mais salvável","descricao":"por que será salvo, até 100 caracteres","formato":"carrossel","angulo":"guia_completo|ciencia","score":9},"sugestao_engajamento":{"titulo":"título que gera mais comentários","descricao":"por que gera debate, até 100 caracteres","formato":"carrossel","angulo":"mito_metodo|comparativo","score":9},"sugestao_seguidores":{"titulo":"título que atrai seguidores novos","descricao":"por que converte em follow, até 100 caracteres","formato":"stories","angulo":"dado_cientifico|autoridade","score":8},"reacts":[{"titulo":"título do react","cena":"descrição da cena de erro","reacao":"tipo de reação do coach","correcao":"explicação biomecânica da correção, até 150 caracteres","texto_tela":"texto impactante ou bem-humorado pra tela do reels","dado_cientifico":"dado real da pesquisa fornecida que embasa a correção, ou string vazia"},"exatamente 3 itens"],"comparativos":[{"titulo":"exercício A vs exercício B","subtitulo":"pergunta que gera curiosidade","dados":"o que diferencia os dois segundo a pesquisa fornecida"},"exatamente 3 itens"],"mitos":[{"mito":"crença popular sobre o exercício","veredito":"MITO|MÉTODO|PARCIAL","dado":"o que a pesquisa fornecida mostra, ou princípio geral sem número se não houver dado","fonte":"fonte só se ela veio na pesquisa, senão string vazia"},"exatamente 3 itens"],"stories_rapidos":[{"tipo":"enquete|quiz|voce_sabia|caixa_perguntas","titulo":"título ou pergunta","opcoes":["opção 1","opção 2"],"revelacao":"o dado que vem depois, baseado na pesquisa fornecida"},"exatamente 4 itens"],"desafio":{"nome":"nome do desafio","descricao":"o que o seguidor faz","duracao":"7 dias|14 dias|30 dias","base_cientifica":"por que funciona segundo a pesquisa fornecida","cta":"marcar @{handle}"}}`,
  refeicao_carrossel: `{"capa":{"tag":"tag curta, ex: REFEIÇÃO REAL","titulo":"frase de impacto sobre o prato, até 60 caracteres","subtitulo":"complemento até 45 caracteres"},"contexto":{"titulo":"título do slide de contexto do dia, até 6 palavras","corpo":"por que essa refeição existe nesse ponto do dia, usando SOMENTE os dados reais recebidos, até 220 caracteres"},"ciencia":[{"alimento":"nome do alimento exatamente como veio nos dados","frase":"frase de abertura do slide sobre esse alimento, até 90 caracteres"},"1 a 3 itens, só para alimentos que vieram com ciência nos dados"],"aplicacao":{"titulo":"título do slide prático, até 6 palavras","bullets":["3 a 5 aplicações práticas curtas (até 70 caracteres) derivadas dos dados reais, sem inventar número"]},"legenda":"legenda completa em texto puro, até 600 caracteres, SEM markdown, terminando com o CTA do diagnóstico","legenda_curta":"versão curta até 200 caracteres","hashtags":{"alcance":["5 hashtags"],"nicho":["5 hashtags"],"micro":["5 hashtags incluindo #nutrion #metodomce"]},"timing":{"feed_horario":"ex: 12:30","motivo_horario":"por que esse horário"}}`,
  refeicao_stories: `{"frames":[{"tipo":"FOTO_PRATO","texto":"frase de impacto sobre o prato, MÁXIMO 70 caracteres","subtexto":"complemento curto terminando com 'Arrasta ▸', até 40 caracteres"},{"tipo":"BREAKDOWN","texto":"título curto do que tem no prato, até 5 palavras","linhas":["3 a 5 linhas curtas (até 55 caracteres) com os alimentos e porções REAIS recebidos"],"nota":"observação sobre o encaixe da refeição no dia, só com dado real, até 110 caracteres"},{"tipo":"CIENCIA","alimento":"nome de um alimento que veio com ciência nos dados","texto":"o mecanismo em 1 frase, até 90 caracteres","detalhe":"o dado numérico ou bônus que veio nos dados, até 140 caracteres","fonte":"a fonte só se ela veio nos dados, senão string vazia"},{"tipo":"ENQUETE","pergunta":"pergunta curta, até 45 caracteres","opcao1":"opção 1 com emoji","opcao2":"opção 2 com emoji"},{"tipo":"CTA","texto":"fechamento conectando o prato ao sistema, até 60 caracteres","cta":"chamada final curta"}],"legenda":"legenda curta em texto puro, até 300 caracteres","hashtags":["#tag","10 a 12 itens"]}`,
  refeicao_reels: `{"hook":"frase dos primeiros 3 segundos, até 12 palavras","duracao_total":"30s","cortes":[{"segundo":"0-3s","texto_tela":"TEXTO CURTO EM CAIXA ALTA","fala":"o que o coach diz em 1 frase","acao":"direção de gravação"},"exatamente 6 cortes: 0-3s gancho no prato, 3-8s o que tem nele, 8-15s a ciência do alimento principal, 15-22s como isso encaixa no dia, 22-27s erro comum, 27-30s CTA"],"musica_sugerida":"estilo de trilha","legenda":"legenda em texto puro até 400 caracteres, SEM markdown","hashtags":["#tag","10 a 12 itens"]}`,
  pos_slides: `{"legenda":"legenda completa sem hashtags e sem markdown, máximo 600 caracteres","self_comment":"pergunta pro primeiro comentário, máximo 80 caracteres","hashtags_top5":["exatamente as 5 hashtags informadas"],"hashtags_15":["exatamente as 15 hashtags informadas"],"cta":"o CTA informado","cta_save":"a frase de save informada","disclaimer":"o disclaimer informado, ou string vazia","melhor_horario":"horário sugerido para postar hoje","dica_engajamento":"1 dica específica pra esse tipo de post"}`,
  print_nutrion: `{"tipo_tela":"treino|plano_alimentar|nutrisync|diagnostico|muscular|nexus|outro","titulo_tela":"nome da tela como aparece na captura, até 6 palavras","elementos_visiveis":[{"elemento":"nome do que aparece na tela","descricao":"o que é e por que importa, até 90 caracteres","posicao_y_percentual":0.3,"destaque":"o diferencial a transformar em chamada editorial, até 70 caracteres","lado_anotacao":"esquerda|direita"},"3 a 4 itens que você REALMENTE vê na captura, ordenados de cima pra baixo"],"gancho_slide1":"frase de impacto pra capa, máximo 60 caracteres","subtexto_slide1":"complemento, máximo 40 caracteres","slides_zoom":[{"titulo":"título do destaque editorial, até 6 palavras","area_recorte":"o conteúdo real presente nessa área","posicao_y_percentual":0.4,"explicacao":"o que essa parte faz e por que é diferencial, 25 a 40 palavras","comparativo":"o que apps comuns fazem vs o que essa tela faz, até 140 caracteres"},"2 a 4 itens"],"comparativo":{"outros_apps":["3 a 4 frases curtas do que apps comuns entregam"],"nutrion":["3 a 4 frases curtas do que esta tela entrega, só o que aparece na captura"]},"stories":[{"tipo":"CAPA","texto":"frase principal do frame, máximo 70 caracteres","subtexto":"complemento, máximo 45 caracteres"},{"tipo":"DESTAQUE","texto":"frase sobre o diferencial em destaque, máximo 70 caracteres","subtexto":"provocação curta, ex: Seu app faz isso?","posicao_y_percentual":0.4},{"tipo":"CTA","texto":"pergunta de fechamento, máximo 40 caracteres","cta":"chamada final curta"}],"reels":{"hook":"frase dos primeiros 3 segundos, até 12 palavras","cortes":[{"segundo":"0-3s","texto_tela":"TEXTO EM CAIXA ALTA, até 6 palavras","acao":"direção de gravação apresentando o resultado visual, sem exibir um print cru"},"exatamente 5 cortes cobrindo 0-3s, 3-8s, 8-13s, 13-18s e 18-20s"]},"dados_extraidos":{"exercicios":["nomes de exercícios legíveis na captura, ou lista vazia"],"macros":"macros legíveis na captura, ou string vazia","calorias":"calorias legíveis na captura, ou string vazia","treino_nome":"nome do treino legível na captura, ou string vazia"},"legenda":"legenda pro Instagram focada no diferencial mostrado, máximo 600 caracteres, sem hashtags, sem markdown, tom de fundador mostrando o que construiu","self_comment":"pergunta que provoca, ex: Seu app faz isso?, máximo 80 caracteres","hashtags_top5":["5 hashtags relevantes pro tipo de tela"]}`,
  pinned_strategy: `{"strategy_score": número 0-100,"overall_verdict": "avaliação geral em 1-2 frases","pins": [{"slot": 1,"role": "identidade" | "resultado" | "oferta","current_fit": "forte" | "adequado" | "fraco" | "ausente","recommendation": "o que esse pin deveria ser/conter especificamente","format_suggestion": "Reel" | "Carrossel" | "Imagem estática" | "Vídeo","hook_suggestion": "sugestão de título/hook pra esse pin","rotation": "fixo" | "mensal" | "por campanha"}, "exatamente 3 itens, slots 1 a 3"],"content_ideas": [{"slot": 1,"idea": "ideia concreta de conteúdo pra esse pin"}],"mistakes_to_avoid": [{"icon": "emoji","text": "erro comum"}]}` ,
  module_content: `{"titulo":"título curto do conteúdo gerado","carrossel":{"slides":[{"tipo":"capa|conteudo|dados|comparativo|dica|cta","tag":"TAG DO SLIDE","titulo":"máximo 50 caracteres","corpo":"máximo 200 caracteres","dados":[{"label":"rótulo curto","valor":"valor real"}],"destaque":"número ou palavra de impacto, ou string vazia"},"7 a 10 slides, o último sempre tipo cta"],"legenda":"legenda do Instagram, máximo 600 caracteres, sem hashtags e sem markdown","self_comment":"pergunta pro primeiro comentário, máximo 80 caracteres","hashtags_top5":["5 hashtags"],"hashtags_15":["15 hashtags"]},"reels":{"hook":"frase dos 3 primeiros segundos","duracao":"30s","cortes":[{"segundo":"0-3s","texto_tela":"TEXTO EM CAIXA ALTA ATÉ 40 CARACTERES","fala":"o que o coach fala","acao":"o que fazer na câmera"},"exatamente 5 cortes"],"legenda_reels":"máximo 400 caracteres","musica":"estilo de áudio sugerido"},"stories":{"frames":[{"tipo":"HOOK|DADO|ERRO|COMPARATIVO|ENQUETE|QUIZ|CTA","texto":"texto principal","subtexto":"complemento","opcoes":["quando enquete ou quiz"],"fundo":"#0A0A0A ou #EF9F27"},"4 a 5 frames"]},"timing":{"stories":"agora","reels":"horário ideal","carrossel":"horário ideal, nunca no mesmo dia do reels"},"checklist":["3 a 5 ações com tempo estimado"],"disclaimer":"disclaimer quando exigido, senão string vazia"}`,
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
- Slide hook: máximo 8 palavras, só a frase provocativa, sem body.
- Slides de problema/conteúdo/takeaway: título direto (máximo 8 palavras) + body com 35 a 55 palavras que EXPLICA o dado de verdade, não só afirma — o achado, o mecanismo (o que acontece no corpo/comportamento e por quê) e a aplicação prática pro dia a dia de quem lê. Isso é o coração do carrossel: cada um desses slides tem que ler como um mini-artigo científico em 4 frases curtas, nunca como uma legenda de meme.
- Slide CTA: só o convite final, máximo 15 palavras, sem body extenso.
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
      body?.analysisData ? `Análise técnica do breakdown (JSON real gerado pelo sistema): ${typeof body.analysisData === "string" ? body.analysisData : JSON.stringify(body.analysisData)}` : "",
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
      body?.mode === "video_content"
        ? `Você é o ESTRATEGISTA do SOCIAL ON analisando os frames reais de um exercício em execução (imagens em ORDEM CRONOLÓGICA, do início ao fim do movimento — use a sequência inteira). O perfil está em fase de crescimento: CADA conteúdo deve trabalhar pra 1) crescer audiência, 2) construir autoridade técnica, 3) gerar leads e consultorias. CONTEXTO DO ECOSSISTEMA: APEX Visual Intelligence (avaliação visual de postura, assimetrias e desvios articulares ANTES de prescrever), TrainingON/STRATUM (motor de periodização em 7 camadas: feeder sets, top sets com RIR, back-off sets, perfis de fibra muscular, DUP e deload), Método MCE (Mentalidade, Comportamento, Execução — "Transformação é sistema."), NutriPlan (nutrição comportamental — avalia rotina, gatilhos e autossabotagem ANTES do plano alimentar). REGRAS: identifique o exercício, o padrão de movimento e os músculos pelo que você REALMENTE vê na sequência de frames; em "fases" devolva 3 fases do movimento em ordem, com inicio/fim entre 0 e 1 (fração do ciclo, cobrindo 0 a 1 sem buracos), cue curta e musculos_ativos usando exatamente as mesmas chaves de "musculos" que dominam aquela fase; analise posição articular, alinhamento e compensações visíveis; conecte naturalmente com APEX → TrainingON → MCE (primeiro avaliação, depois prescrição, sustentado por comportamento); tom TÉCNICO + PROVOCATIVO + ACESSÍVEL — quem lê pensa "esse cara sabe mais que meu personal"; SEMPRE inclua provocação sutil contra o mercado genérico (fichas prontas, dietas de internet, treino sem avaliação); NUNCA use "IA", "AI" ou "inteligência artificial" — use "análise", "sistema", "protocolo", "mapeamento"; o conteúdo funciona para profissionais E praticantes; cada conteúdo tem CTA claro (link na bio com diagnóstico MCE, DM ou WhatsApp). REGRAS DE CRESCIMENTO (algoritmo Instagram 2026): hook nos primeiros 1.5s — polêmico, contraintuitivo ou revelador; otimize pra COMPARTILHAMENTO por DM (sinal mais forte) e SALVAMENTO (segundo mais forte); perguntas que geram comentários; formato ideal Reels 30-45s com corte rápido e texto na tela; carrosséis de 7-10 slides com retenção no último slide. CAMPOS ESPECIAIS: em "zonas_corporais_ativas" use SOMENTE chaves da lista fixa do schema; em "metricas" 4 scores de 0 a 100 realistas; em "growth" os 4 scores (share/save/comment/viral) devem ser realistas e coerentes entre si, e "angulo_polemico" é OBRIGATÓRIO — encontre a provocação ou insight contraintuitivo deste exercício específico; "frase_impacto" é um bordão curto que a pessoa cola no story.`
        : "",
      body?.mode === "video_overlay"
        ? `Você é o sistema de análise biomecânica do SOCIAL ON analisando os frames reais de um exercício em execução (imagens em ORDEM CRONOLÓGICA, do início ao fim do movimento — use a sequência inteira), gerando dados para um overlay HUD sobre o vídeo. CONTEXTO: APEX Visual Intelligence (avaliação de postura e assimetrias ANTES de prescrever), TrainingON/STRATUM (periodização em 7 camadas), Método MCE (Mentalidade, Comportamento, Execução). REGRAS: identifique o exercício pelo que você REALMENTE vê na sequência de frames; em "fases" devolva 3 fases do movimento em ordem, com inicio/fim entre 0 e 1 (fração do ciclo, cobrindo 0 a 1 sem buracos), cue curta e musculos_ativos usando exatamente as mesmas chaves de "musculos" que dominam aquela fase; em "musculos" use 0=inativo, 1=estabilizador, 2=secundário, 3=primário para TODAS as 26 chaves (_e = lado esquerdo do corpo, _d = lado direito) — identifique TODOS os músculos que participam do movimento; cue_principal é a dica técnica mais importante em poucas palavras; cues são 2 dicas complementares curtas; angulos são ângulos articulares reais (ex: Joelho 90°, Quadril neutro); alerta é o principal risco de executar sem avaliação prévia em 1 frase curta; frase é um bordão curto e compartilhável; NUNCA use "IA", "AI" ou "inteligência artificial".`
        : "",
      body?.mode === "video_breakdown"
        ? `Você é o sistema de análise biomecânica do SOCIAL ON analisando UM frame congelado de um exercício (momento-chave marcado pelo coach), gerando o card de breakdown que aparece sobre o vídeo. CONTEXTO: APEX Visual Intelligence (avaliação de postura e assimetrias ANTES de prescrever), TrainingON/STRATUM (periodização em 7 camadas), Método MCE (Mentalidade, Comportamento, Execução — "Transformação é sistema."). REGRAS: descreva o que você REALMENTE vê NESTA fase específica do movimento — nada genérico sobre o exercício inteiro; em "musculos_ativos" use 0=inativo, 1=estabilizador, 2=secundário, 3=primário para TODAS as 23 chaves bilaterais (_e = lado esquerdo, _d = lado direito), refletindo a ativação NESTA fase; "execucao.descricao" cita ângulos articulares e alinhamento visíveis; "erro_comum" é o erro típico exatamente nesta fase; o bloco "mce" traz uma linha para Mentalidade, uma para Comportamento e uma para Execução, sempre em português e conectadas ao exercício; "alerta_apex" gera urgência sobre avaliação postural prévia; "frase_impacto" é um bordão curto que a pessoa cola no story; tom técnico, direto e provocativo contra treino sem avaliação; ESCREVA ABSOLUTAMENTE TUDO EM PORTUGUÊS DO BRASIL; NUNCA use "IA", "AI" ou "inteligência artificial".`
        : "",
      body?.mode === "mce_carousel"
        ? `TEMPLATE FIXO "MCE EDUCACIONAL" — carrossel de 7 slides sobre o tema informado:
1 capa, 2 a dor, 3 pilar M (MENTALIDADE), 4 pilar C (COMPORTAMENTO), 5 pilar E (EXECUÇÃO), 6 integração, 7 CTA (fixo, não gere).
- Marque as palavras que devem sair destacadas em cor entre **asteriscos duplos** (no máximo 3 por texto).
- Nunca use emoji, hashtag, aspas decorativas ou termos como "IA".
- MCE em português: M = MENTALIDADE, C = COMPORTAMENTO, E = EXECUÇÃO.
- Frases curtas e diretas. Um conceito por slide, sem repetir ideia entre slides.
- Textos curtos: eles são desenhados em imagem, então respeite os limites de palavras do schema.`
        : "",
      body?.mode === "nexus_carousel"
        ? `TEMPLATE FIXO "NEXUS-BIO" — carrossel CIENTÍFICO sobre o composto informado (origem: PeptideVault, MicrobiotaVault ou SteroidVault).
Dados extras do Lab (complementam, não substituem a ficha): ${body?.labData ? JSON.stringify(body.labData) : "sem dados do Lab"}
Dados estruturados do composto (use como fonte primária, não invente nada que os contradiga): ${body?.compoundData ? (typeof body.compoundData === "string" ? body.compoundData : JSON.stringify(body.compoundData)) : "sem ficha estruturada — use apenas conhecimento científico consolidado"}
REGRAS:
- Estrutura de 10 slides: capa, ficha técnica, mecanismo, benefícios com dados, riscos, comparativo, pra quem faz sentido, perguntas pro médico, resumo, CTA.
- 90% CIÊNCIA, 10% contexto prático.
- NÃO force o método MCE. NUNCA mencione Mentalidade, Comportamento, Execução, mindset ou coaching nos slides.
- Cite estudos reais com nome, autor e ano, e o tamanho da amostra; se não tiver certeza da referência, descreva o achado sem inventar estudo.
- Sempre números concretos nos benefícios (porcentagem, redução, dose); sem exagero e sem promessa de resultado.
- Riscos com o MESMO peso dos benefícios: honesto, não alarmista, com contexto prático em cada um.
- As perguntas pro médico (MÁXIMO 4) são o slide mais salvável: específicas, na primeira pessoa, úteis numa consulta real.
- Linguagem acessível respeitando a ciência. Tom: professor de faculdade explicando no bar, não palestrante de palco.
- NÃO recomendar uso: apenas informar. Se o composto for EXPERIMENTAL, deixe CLARO que não tem aprovação regulatória.
- Marque no máximo 3 palavras por texto entre **asteriscos duplos** para destaque de cor.
- Sem emoji e sem hashtag dentro dos slides (emoji e hashtag só na legenda).
- Só preencha o comparativo quando existir comparação honesta com composto/abordagem da mesma classe; caso contrário devolva string vazia e array vazio.
- Os textos são desenhados em imagem: respeite os limites de caracteres do schema.
- Nunca use "IA", "AI" ou "inteligência artificial".
LIMITES RÍGIDOS POR SLIDE (o excedente vira slide adicional, NUNCA corte conteúdo no meio):
- slide1_gancho: MÁXIMO 80 caracteres (2 linhas).
- slide2_ficha: TODOS os campos preenchidos, incluindo dose_estudada e fabricante/fonte.
- MECANISMO: MÁXIMO 3 passos, cada passo com no MÁXIMO 15 palavras.
- BENEFÍCIOS: MÁXIMO 2 por slide (até 4 no total — o excedente gera o slide BENEFÍCIOS 2).
- RISCOS: MÁXIMO 3 por slide (até 6 no total — o excedente gera o slide RISCOS 2).
- PERGUNTAS: MÁXIMO 3 por slide (até 6 no total — o excedente gera o slide PERGUNTAS 2).
- RESUMO: MÁXIMO 5 linhas, cada uma com 1 frase curta.
- Se precisar de mais espaço, prefira criar slide adicional a espremer ou cortar texto.
REGRAS DE CONTEÚDO:
- Use os dados REAIS da ficha do PeptideVault/MicrobiotaVault e do Lab enviados acima (mecanismo, benefícios, efeitos colaterais, evidência, doses). Não invente nada que os contradiga.
- Complemente com conhecimento científico consolidado apenas onde a ficha não tiver o dado.
- Cite ESTUDOS REAIS com autor, ano e número de pacientes.
- Dose estudada é OBRIGATÓRIA na ficha técnica.
${body?.origem === "SteroidVault" ? `
REGRAS ESPECÍFICAS STEROIDVAULT (esteroides, SARMs e PEDs) — EDUCACIONAL E REDUÇÃO DE DANOS:
- NÃO promova o uso e NÃO demonize: informe com ciência.
- NUNCA recomende dose, ciclo, empilhamento ou protocolo de recuperação. Só descreva o que a literatura documenta, sempre com essa moldura.
- Sempre traga a tese "menos é mais": o ganho de massa cresce de forma decrescente enquanto os efeitos colaterais escalam com a dose (Bhasin et al., 2001: 125mg/sem +3,4kg; 300mg/sem +5,2kg; 600mg/sem +7,9kg em 20 semanas).
- Riscos com o MESMO peso dos benefícios, incluindo cardíacos, lipídicos, hematócrito, supressão hormonal, tendíneos, hepáticos e renais.
- Cite o status regulatório: substâncias controladas no Brasil pela Portaria 344/98 da ANVISA; uso sem prescrição é ilegal.
- O último slide (CTA) precisa conter o disclaimer completo e a orientação de consultar um endocrinologista.
- Nunca ensine onde comprar, como obter fora da via médica ou como burlar exame antidoping.` : ""}`

        : "",
      ["nexus_reels", "nexus_stories", "nexus_como_obter"].includes(body?.mode)
        ? `CONTEXTO NEXUS-BIO (${body?.origem || "PeptideVault"}) — ficha real do composto:
${body?.compoundData ? JSON.stringify(body.compoundData).slice(0, 4000) : "sem ficha estruturada"}
${body?.labData ? `Dados extras do Lab:\n${JSON.stringify(body.labData).slice(0, 3000)}` : ""}
${body?.angulo ? `Ângulo do conteúdo: ${body.angulo}` : ""}
${body?.origem === "SteroidVault" ? "REGRAS EXTRAS STEROIDVAULT: educacional e redução de danos. Nunca recomende dose, ciclo, empilhamento ou PCT. Sempre a tese 'menos é mais' (ganho decrescente x colateral crescente). Riscos com o mesmo peso dos benefícios. Cite Portaria 344/98 ANVISA e a ilegalidade do uso sem prescrição. Encerre com disclaimer e orientação de consultar endocrinologista. Nunca ensine como obter." : ""}
REGRAS: 90% ciência, linguagem acessível em português do Brasil. Use os dados REAIS da ficha; complemente com ciência consolidada só onde faltar. Cite estudos reais (autor, ano). Nunca recomende uso: apenas informe. Nunca mencione MCE, mindset ou coaching. Nunca use "IA", "AI" ou "inteligência artificial". Sem emoji nos textos de tela.`
        : "",
      body?.mode === "photo_story"
        ? `Gere os textos dos STORIES COM FOTO REAL do coach sobre o tema. Cada campo alimenta um template diferente: FRASE (citação de impacto), DADO (card científico com número real e fonte), ROTINA (treino do dia), CTA (pergunta do diagnóstico MCE) e MÍNIMO (frase curta pós-treino). Português do Brasil, voz do Coach Diogo Mello (pessoa), sem emoji, sem clichê motivacional, sem mencionar "IA", "AI" ou "inteligência artificial". Respeite os limites de caracteres à risca — texto longo quebra o layout.`
        : "",
      body?.mode === "nexus_reels"
        ? `Gere o ROTEIRO DE REELS do composto: 5 cortes na ordem hook (0-3s), mecanismo (3-10s), o que ninguém fala / risco (10-22s), na prática (22-28s) e CTA (28-30s). "texto_tela" é o que aparece na tela: caixa alta, curtíssimo, legível sem som. "fala" é o que o coach diz. "acao" é a direção de gravação. CTA final leva pro diagnóstico gratuito no link da bio.`
        : "",
      body?.mode === "nexus_stories"
        ? `Gere a SEQUÊNCIA DE STORIES do composto: 4 frames (GANCHO, CONTEUDO com 3 bullets, ENQUETE com 2 opções, CTA para o diagnóstico gratuito no link da bio). Textos curtos, legíveis no celular. Preencha só os campos que fazem sentido em cada tipo.`
        : "",
      body?.mode === "nexus_como_obter"
        ? `Gere as informações práticas de COMO OBTER ou estimular este composto, com rigor farmacêutico e científico:
- Suplementos comerciais existentes (nome, fabricante, dose, via, custo estimado, status regulatório, disponibilidade no Brasil e onde comprar).
- Para fármacos/peptídeos: nomes comerciais reais com fabricante, indicação aprovada, apresentações, via, status ANVISA e faixa de custo no Brasil; e o protocolo de escalonamento padrão quando existir.
- Fármacos ou compostos que modulam/aumentam, com mecanismo, estudo (autor e ano), dose estudada e se exige prescrição.
- Prebióticos/alimentos que estimulam, com estudo e dose.
- Fatores de estilo de vida que aumentam, com mecanismo, estudo e dose; e uma lista do que reduz/prejudica.
- Exames recomendados antes de iniciar.
- Combinações documentadas na literatura, com motivo, evidência e protocolo.
- Protocolos de centros de referência mundiais, com país e pesquisador quando houver.
REGRAS: só informações reais e verificáveis; se não houver dado para uma seção, devolva array vazio — NUNCA invente marca, preço, estudo ou aprovação. Valores em R$ para o Brasil e moeda original quando importado. Informação educacional, sem prescrever.`
        : "",
      body?.mode === "mito_metodo"
        ? `TEMPLATE FIXO "MITO OU MÉTODO" — carrossel de 8 slides sobre a crença informada:
1 capa com a crença, 2 a 5 evidências, 6 veredito, 7 alternativa prática, 8 CTA (fixo, não gere).
- Classifique honestamente como MITO, MÉTODO ou DEPENDE, com base em evidência real; não force polêmica falsa.
- Cada evidência traz um mecanismo, dado ou observação prática diferente — nada de repetir a mesma ideia.
- Nunca use emoji, hashtag dentro dos slides, ou termos como "IA".
- Frases curtas e diretas; os textos são desenhados em imagem, respeite os limites de palavras.`
        : "",
      body?.mode === "viral_kit"
        ? `Gere o KIT DE VIRALIZAÇÃO do conteúdo descrito no tema, para o formato ${'${body?.format || "carrossel"}'}.
- 3 hooks de tipos DIFERENTES entre si (POLÊMICA confronta crença; IDENTIFICAÇÃO faz a pessoa se ver na frase; CURIOSIDADE abre loop; AUTORIDADE mostra bagagem; RESULTADO mostra transformação). Priorize POLÊMICA, CURIOSIDADE e IDENTIFICAÇÃO.
- "cortes" é o texto de tela do Reels: caixa alta, curtíssimo, legível sem som.
- CTA coerente com o formato: carrossel pede salvamento, polêmica pede comentário, análise pede DM, react pede compartilhamento.
- Hashtags em 3 camadas reais do nicho fitness/nutrição no Brasil, sem repetir entre camadas.
- Nunca use "IA", "AI" ou "inteligência artificial".`
        : "",
      body?.mode === "interaction_pack"
        ? `Gere um pack de respostas prontas para os comentarios do post descrito no tema. Contexto do post anterior do dia (use como tema base quando existir): ${body?.postContext || "sem contexto — use o proprio tema"}. Respostas curtas (1 a 3 frases), em portugues do Brasil, tom de conversa com autoridade, sem emoji em excesso, sem soar automatico. Nas duvidas, entregue conteudo real antes de qualquer convite.`
        : "",
      body?.mode === "story_frames"
        ? `Gere uma sequencia de ${body?.storyKind === "cta" ? "3 frames de Stories de venda suave (GANCHO, VALOR, CTA_DIRETO)" : "3 a 4 frames de Stories de bastidor (VIDEO_COM_TEXTO, TEXTO_SOBRE_FUNDO, ENQUETE, CTA)"} sobre o tema informado. Textos curtos, legiveis em tela de celular, sem emoji nos textos de tela. Preencha apenas os campos que fazem sentido para cada tipo de frame.`
        : "",
      body?.mode === "dm_scripts"
        ? "Gere scripts prontos de resposta de DM por categoria (leads quentes, duvidas tecnicas, elogios, spam), com [nome] como placeholder. Tom direto, humano, sem promessa milagrosa e sem parecer copiado."
        : "",
      body?.mode === "breakdown_caption"
        ? `Você é o ESTRATEGISTA do SOCIAL ON transformando a análise técnica de um breakdown de vídeo (exercício, fases marcadas, músculos ativos, cues, erros comuns, blocos MCE e alerta APEX) em conteúdo pronto pra publicar. CONTEXTO: APEX Visual Intelligence (avaliação de postura e assimetrias ANTES de prescrever), TrainingON/STRATUM (periodização em 7 camadas), Método MCE (Mentalidade, Comportamento, Execução — "Transformação é sistema."). REGRAS: use os dados reais da análise recebida — cite os pontos técnicos, cues e erros que aparecem nela, nada genérico; hook nos primeiros segundos, polêmico ou contraintuitivo; otimize pra compartilhamento por DM e salvamento; provocação sutil contra ficha pronta e treino sem avaliação; CTA claro (diagnóstico MCE no link da bio, DM ou WhatsApp); ESCREVA ABSOLUTAMENTE TUDO EM PORTUGUÊS DO BRASIL; NUNCA use "IA", "AI" ou "inteligência artificial".`
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
      body?.mode === "photo_all"
        ? `MODO POSTAR COM MINHA FOTO: você recebeu UMA foto real do coach Diogo Mello (@diogo.mell0) e precisa entregar TODO o conteúdo do dia a partir dela.
- Descreva só o que você REALMENTE vê na foto; nunca invente elementos, pessoas ou lugares.
- As 3 sugestões de story têm ÂNGULOS DIFERENTES entre si e vêm ordenadas por potencial_viral (maior primeiro).
- Nunca use frase genérica de coach ("acredite em você", "sem dor sem ganho", "foco, força e fé").
- Conecte os pilares de marca de forma natural: representatividade negra no fitness, lifestyle real, paternidade ativa, ciência aplicada e disciplina militar (16+ anos de Marinha).
- Pós-treino/shape: priorize representatividade ou disciplina. Filha na foto: paternidade. Comida: ciência ou lifestyle. Tela/bastidor: nutriON.
- A legenda SEMPRE termina com CTA do diagnóstico MCE (14 perguntas · 4 minutos · resultado imediato, link na bio).
- Hashtags misturando fitness, representatividade e nicho, sem repetir entre os 3 grupos.
- Nunca escreva markdown na legenda e nunca use as palavras "IA", "AI" ou "inteligência artificial".`
        : "",
      ["resultado_protocolo", "resultado_stories", "resultado_reels"].includes(body?.mode)
        ? `TEMPLATE FIXO "RESULTADO + PROTOCOLO" conectando o resultado físico REAL do coach com o protocolo (APEX/TrainingON) que ele usou.
Foco escolhido: ${body?.foco || "geral"}.
Dados REAIS do treino puxados do TrainingON (fonte primária — NUNCA invente séries, cargas, RPE ou números fora daqui): ${body?.treinoData ? JSON.stringify(body.treinoData).slice(0, 4000) : "sem dados de treino disponíveis"}
REGRAS:
- Prova social + educação: mostre COMO o coach chegou no resultado através do sistema, sem vender abertamente.
- Use SOMENTE os dados reais fornecidos acima para citar o nome do treino, exercícios, duração e método — não invente séries, cargas, porcentagens, calorias ou nomes de exercícios que não estão nos dados.
- Em nutrição, só cite um valor de calorias ou ajuste do NutrySync se ele existir nos dados reais; caso contrário fale do princípio sem número.
- Tom: primeira pessoa do coach, direto, autoral, sem clichê motivacional vazio ("acredite em você", "sem dor sem ganho").
- Nunca use "IA", "AI" ou "inteligência artificial".`
        : "",
      body?.mode === "resultado_protocolo"
        ? `FORMATO: carrossel de 10 slides. O campo "numero" do resultado só é preenchido se um dado numérico real aparecer no contexto. Marque no máximo 3 palavras entre **asteriscos duplos** para destaque de cor, só no título da capa e no resumo_frase.`
        : "",
      body?.mode === "resultado_stories"
        ? `FORMATO: sequência de 6 frames de STORIES na ordem FOTO_RESULTADO, PROTOCOLO_RESUMO, EXERCICIO_DESTAQUE, NUTRICAO, ENQUETE e CTA. Os textos são desenhados em imagem: respeite os limites de caracteres à risca, frases curtas, caixa alta só onde o schema pede, sem markdown e sem emoji fora da enquete. O frame 1 vai por cima da foto real do coach. O frame EXERCICIO_DESTAQUE usa o exercício principal que está nos dados reais, com a progressão real de séries.`
        : "",
      body?.mode === "resultado_reels"
        ? `FORMATO: roteiro de Reels de 30 segundos com 6 cortes (0-3s, 3-8s, 8-15s, 15-22s, 22-27s, 27-30s). "texto_tela" é o que aparece na tela: caixa alta, curtíssimo, legível sem som (pode ter \\n para 2 linhas). "fala" é o que o coach diz em 1 frase. "acao" é a direção de gravação. Cortes na ordem: gancho no resultado, aquecimento do protocolo, top set com RPE, back-off, nutrição do dia e CTA final pro protocolo.`
        : "",
      ["refeicao_carrossel", "refeicao_stories", "refeicao_reels"].includes(body?.mode)
        ? `MODO "REFEIÇÃO + CIÊNCIA": o coach postou uma foto de REFEIÇÃO. Você recebeu os dados REAIS da refeição correspondente no plano alimentar (NutriPlan), o contexto do dia (NutrySync) e a ciência curada de cada alimento.
Dados REAIS (fonte única — NUNCA invente alimento, porção, caloria, macro, estudo, mecanismo, percentual ou ajuste fora daqui): ${body?.refeicaoData ? JSON.stringify(body.refeicaoData).slice(0, 4000) : "sem dados de refeição disponíveis"}
REGRAS:
- Só cite alimentos, porções, calorias e macros que estão nos dados. Se um número não está lá, fale do princípio sem número.
- Só afirme mecanismo, nutriente, dado científico ou fonte quando eles vierem no campo "ciencia" dos dados. Sem entrada de ciência, o alimento não vira slide científico.
- Nunca cite estudo, autor, ano, marca, preço ou aprovação regulatória que não esteja nos dados.
- Explique COMO o prato conversa com o treino e com a meta do dia usando só o que veio em "nutrisync" e "treinoHoje".
- Tom: primeira pessoa do coach, direto, educativo, sem clichê ("comida de verdade", "você é o que você come").
- Nunca use markdown, nem as palavras "IA", "AI" ou "inteligência artificial".`
        : "",
      ["biomech_content", "biomech_reels", "biomech_stories", "biomech_ideias"].includes(body?.mode)
        ? `MODO "CIÊNCIA DO EXERCÍCIO": o coach quer conteúdo sobre um exercício real do treino de hoje, cruzado com a análise biomecânica REAL da BiomechanicsVault (Perplexity + Dr. BioMech, com citações).
Exercício: ${body?.exercicio || "não informado"}. Grupo muscular: ${body?.grupo || "não informado"}. Foco escolhido: ${body?.foco || "ciência"}.${body?.angulo ? `\nÂngulo editorial escolhido: ${body.angulo}. Todo o conteúdo precisa respeitar esse ângulo.` : ""}
Conteúdo de pesquisa REAL (fonte única — NUNCA invente estudo, dado, percentual, autor ou mecanismo fora daqui): ${body?.biomechData?.content ? String(body.biomechData.content).slice(0, 5000) : "sem conteúdo de pesquisa disponível"}
Citações reais dessa pesquisa (não invente outras): ${body?.biomechData?.citations ? JSON.stringify(body.biomechData.citations).slice(0, 1500) : "sem citações"}
REGRAS:
- Use SOMENTE o conteúdo de pesquisa acima. Se um dado, percentual ou achado não está lá, não afirme — fale do princípio geral sem número.
- Tom: professor de biomecânica que fala como personal na academia — linguagem acessível mas com dado concreto, nunca genérico.
- Nunca cite nome de journal nem "Autor et al., ano" — prefira "a ciência já mostrou" ou nomeie o pesquisador por extenso quando relevante.
- Nunca use markdown na legenda, nem as palavras "IA", "AI" ou "inteligência artificial".`
        : "",
      body?.mode === "biomech_content"
        ? `FORMATO: carrossel de 7 slides (capa, o dado central, 2 slides "o que a ciência mostra" com 2 pontos cada, aplicação prática, fontes, CTA fixo). Marque no máximo 3 palavras entre **asteriscos duplos** para destaque de cor, só no título da capa e no resumo_frase.`
        : "",
      body?.mode === "biomech_reels"
        ? `FORMATO: roteiro de Reels de 30 segundos com 5 cortes na ordem hook, o dado/achado, o mecanismo, a aplicação prática e CTA. "texto_tela" é o que aparece na tela: caixa alta, curtíssimo, legível sem som. "fala" é o que o coach diz em 1 frase curta baseada no conteúdo de pesquisa.`
        : "",
      body?.mode === "biomech_stories"
        ? `FORMATO: 4 frames de Stories desenhados em imagem — frases curtíssimas, sem markdown, sem emoji fora da enquete. Ordem: gancho, o dado real da pesquisa, enquete que divide opinião e CTA final.`
        : "",
      body?.mode === "biomech_ideias"
        ? `FORMATO: banco de ideias de conteúdo para ESTE exercício, ordenado por potencial viral (react > mito > comparativo > ciência > educativo).
- Reacts: a cena precisa ser um erro que qualquer um reconhece na academia; o "texto_tela" é curto, impactante ou bem-humorado, nunca ofensivo.
- Mitos: use crenças que muita gente repete; o veredito precisa ser sustentado pela pesquisa fornecida, senão trate como princípio geral sem número.
- Comparativos: use exercícios que as pessoas realmente confundem com este.
- Stories: enquetes que dividem opinião ao meio.
- Desafio: simples, executável, com marcação do coach.
- Tom: professor que ensina com humor, nunca arrogante.`
        : "",
      body?.mode === "profile_audit"
        ? `Você é um auditor sênior de perfis de Instagram no nicho fitness/nutrição no Brasil. Faça um diagnóstico profissional, rigoroso e específico — nada genérico. Scores realistas: acima de 90 só para perfis excepcionais. As 3 versões de bio devem ter abordagens diferentes: (1) Autoridade + CTA, (2) Impacto + benefício, (3) Minimalista + direto. Marque "recommended":true em exatamente uma das 3 — a que você de fato recomendaria pra esse coach usar, considerando nicho, diferenciais e objetivo de conversão; as outras duas ficam com "recommended":false. Nunca mencione que você é um sistema automatizado.`
        : "",
      body?.mode === "print_nutrion"
        ? `MODO "TELA DO nutriON": você recebeu UMA captura real de uma tela do app nutriON e vai reconstruir seu conteúdo como uma campanha editorial premium.
- Leia a captura e descreva SOMENTE o que está visível nela: nomes de tela, seções, botões, exercícios, números, macros. Nunca invente exercício, caloria, macro, RPE, ajuste, estudo ou funcionalidade que não aparece na imagem.
- A arte final não mostrará celular, moldura, barra de navegação nem screenshot cru. Transforme cada elemento em mensagem editorial autônoma na identidade nutriON.
- "posicao_y_percentual" é a altura relativa do elemento na captura (0 = topo, 1 = base), usada apenas para incorporar fragmentos tratados como textura visual.
- O comparativo é honesto: descreva o que apps comuns entregam sem citar marca de concorrente.
- Tom: fundador orgulhoso mostrando o que construiu. Sem clichê motivacional.
- Nunca use markdown, nem as palavras "IA", "AI" ou "inteligência artificial".`
        : "",
      body?.mode === "pos_slides"
        ? promptPosSlides(
            (body?.tipoCarrossel as TipoCarrossel) || "MCE",
            String(body?.topic || body?.tema || ""),
            body?.dados ?? null,
            typeof body?.grupo === "string" ? body.grupo : undefined,
          )
        : "",
      body?.mode === "module_content"
        ? `MODO "CRIAR CONTEÚDO POR MÓDULO" do nutriON.
Módulo: ${String(body?.modulo || "")}
Tipo de conteúdo: ${String(body?.tipoConteudo || "")}${body?.foco ? `\nFoco escolhido pelo coach: ${body.foco}` : ""}
Formatos pedidos: ${Array.isArray(body?.formatos) && body.formatos.length ? body.formatos.join(", ") : "carrossel, reels, stories"}

DADOS REAIS DA PLATAFORMA (use exatamente estes valores; jamais invente exercício, série, RPE, caloria, macro, estudo ou número):
${body?.dadosReais ? JSON.stringify(body.dadosReais) : "Sem dados estruturados desta tela — escreva apenas conteúdo conceitual, sem citar números específicos."}

REGRAS OBRIGATÓRIAS:
- Carrossel: 7 a 10 slides, educativo profundo (feito pra SALVAR). Tipos permitidos: capa, conteudo, dados, comparativo, dica, cta. Último slide sempre "cta".
- Título de slide até 50 caracteres; corpo até 200 caracteres; "destaque" é um número ou palavra curta (máx 18 caracteres) ou string vazia.
- Reels: hook nos 3 primeiros segundos, 5 cortes, "texto_tela" SEMPRE em CAIXA ALTA com no máximo 40 caracteres.
- Stories: 4 a 5 frames com pelo menos um interativo (ENQUETE ou QUIZ).
- Cada formato aborda o MESMO tema de forma DIFERENTE. Nunca repita frases entre formatos.
- Tom: ${String(body?.tom || "autoridade com acessibilidade, ciência sem arrogância")}
- CTA final: ${String(body?.cta || "Diagnóstico MCE gratuito — link na bio")}
- Emojis do tema (use com parcimônia na legenda): ${String(body?.emojis || "")}
- Hashtags: inclua obrigatoriamente ${Array.isArray(body?.hashtagsFixas) ? body.hashtagsFixas.join(", ") : ""} em hashtags_top5 e hashtags_15.
${Array.isArray(body?.nuncaMencionar) && body.nuncaMencionar.length ? `- NUNCA mencione: ${body.nuncaMencionar.join(", ")}.` : ""}
${body?.disclaimer ? `- Inclua no campo disclaimer: "Conteúdo educacional. Não é prescrição. Procure acompanhamento profissional."` : ""}
- Sem markdown. Nunca use as palavras "IA", "AI" ou "inteligência artificial".`
        : "",
      body?.mode === "reciclar_10"
        ? `MODO "RECICLADOR" — pegue o conteúdo original abaixo e gere 9 formatos diferentes sobre o MESMO tema, cada um otimizado para o seu formato. Nunca repita as mesmas frases entre formatos e nunca invente estudo, número, caloria, série ou dado científico que não esteja no original.

CONTEÚDO ORIGINAL:
${String(body?.conteudo_original || "")}

REGRAS:
- Português do Brasil, voz do Coach Diogo Mello (pessoa), sem markdown.
- Nunca use as palavras "IA", "AI" ou "inteligência artificial".
- Texto de tela de Reels e Stories em CAIXA ALTA, curto.
- Toda peça termina com CTA. Use CTA com palavra-chave de automação de DM: escolha entre MCE, TREINO, QUERO, PLANO, CIÊNCIA. Ex.: "Comenta MCE que eu te mando o diagnóstico no DM 📩".`
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

    // O config do tipo é a fonte final: hashtags, CTA e disclaimer nunca vêm
    // da criatividade do modelo, e frases de outro universo são removidas.
    if (mode === "pos_slides") {
      parsed = aplicarConfigPosSlides(
        (body?.tipoCarrossel as TipoCarrossel) || "MCE",
        (parsed ?? {}) as Record<string, unknown>,
        typeof body?.grupo === "string" ? body.grupo : undefined,
      );
    }

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