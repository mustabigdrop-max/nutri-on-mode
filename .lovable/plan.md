# Upgrade MCE para apresentações

## Objetivo
Transformar `/mce` e a aba Audio Academy em uma experiência Premium HUD de impacto imediato, preservando dados, navegação e identidade visual existentes.

## Implementação
1. **Hero e radar vivo**
   - Substituir o triângulo estático por um radar M/C/E com referências de 25–100%, preenchimento radial, desenho sequencial, vértices pulsantes e tooltips.
   - Animar os scores em count-up e coordenar a entrada de radar, quote e tabs.
   - Elevar a quote rotativa e incluir a prova científica horizontal dos 12 autores.

2. **Pilares e navegação**
   - Diferenciar tabs M/C/E por cor, ícone e score, com transição horizontal do conteúdo.
   - Transformar subtítulo em badge, destacar termos-chave e adicionar métricas do pilar e chips de autores.
   - Agrupar subtabs em Conteúdo e Ação, com microícones e badges 24H outline.

3. **Audio Academy showstopper**
   - Criar header animado, tagline digitada, quatro stats glass e briefing como feature principal.
   - Reforçar SOS e redesenhar séries com borda por identidade, ring de progresso, preview e episódios mais legíveis.
   - Manter intactos player, offline, playlists, briefing e persistência.

4. **Presentation Mode e acabamento**
   - Adicionar modo de apresentação no topo com tipografia ampliada, contador fixo, ocultação de controles pessoais e auto-scroll suave controlável.
   - Adicionar QR code para `https://nutrion.app.br/demo`, assinatura final e estados skeleton.
   - Respeitar reduced motion, touch targets e formatação pt-BR.

## Detalhes técnicos
- Reutilizar `framer-motion`, `qrcode.react`, Lucide e dados existentes.
- Concentrar animações e tokens específicos em `src/index.css`; não alterar banco nem regras de negócio.
- Validar visualmente em sessão autenticada nos layouts desktop e mobile, além dos testes automáticos do ambiente.
