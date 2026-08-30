# Reformulação do gerador de carrosséis do Social ON

## Objetivo
Substituir os slides genéricos por um sistema visual proprietário, mantendo intactos os demais recursos do Social ON.

## Implementação
1. **Modelo de conteúdo estruturado**
   - Gerar 6–8 slides com papéis fixos: Hook, Problema, 3–5 blocos de Conteúdo, Takeaway e CTA.
   - Incluir pilar MCE, autor/universidade quando pertinente, palavras-chave destacadas e tipo de slide no JSON.
   - Aplicar validação pós-geração: máximo de 20 palavras por slide, hook com até 8 palavras, remoção de frases repetidas e bloqueio das expressões genéricas proibidas.
   - Atualizar também a regeneração de slides do PRISM para obedecer às mesmas regras.

2. **Renderer proprietário 1080 × 1350**
   - Evoluir o renderer Canvas para os presets **Dark Authority**, **Bold Impact** e **Minimal Clean**.
   - Usar fundo em gradiente escuro, linha fina de acento, hierarquia tipográfica forte, respiro e assinatura discreta.
   - Mapear Mindset para roxo, Comportamento para cyan e Execução para dourado.
   - Criar tratamento específico por tipo de slide: capa sem marca extra; conteúdo com destaque de palavras-chave; conclusão; CTA com MCE, `@diogo.mell0` e nutriON.
   - Preservar PNG individual em proporção Instagram 4:5.

3. **Foto do coach**
   - Reaproveitar o upload já existente e oferecer uso visual em três modos: sem foto, fundo sutil na capa/final com overlay forte, ou recorte circular no CTA.
   - Garantir que a foto não comprometa contraste nem legibilidade.

4. **Editor e preview**
   - Trocar os presets antigos pelos três novos presets.
   - Adicionar escolha do pilar MCE e do modo da foto.
   - Exibir um mini-carrossel navegável com setas, contador e miniaturas, mantendo edição, reordenação e download de todos os PNGs.
   - Manter compatibilidade com pacotes já salvos.

5. **Validação**
   - Executar os testes relevantes e validar no navegador: geração, troca de preset, navegação, edição, foto, dimensões 1080 × 1350 e download.
   - Conferir que não há repetição de frases, textos acima do limite ou expressões proibidas.

## Arquivos principais
- `src/data/socialOnSurreal.ts`
- `src/lib/socialImageKit.ts`
- `src/components/social/PostProntoPanel.tsx`
- `src/components/social/PrismPanel.tsx`
- `supabase/functions/social-on-generate/index.ts`
- `supabase/functions/prism-analyze/index.ts`
