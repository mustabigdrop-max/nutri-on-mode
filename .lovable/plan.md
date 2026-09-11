# CAROUSEL ENGINE no SOCIAL ON

## Objetivo
Adicionar ao Studio o formato **Carrossel Científico**, capaz de transformar um tema em cinco slides editáveis, visualmente densos e exportáveis em PNG/ZIP, preservando as regras científicas e de segurança do nutriON.

## Experiência
1. **Entrada no Studio**
   - Adicionar “Carrossel Científico” como formato próprio dentro do Studio.
   - Formulário angular, sem bordas arredondadas, com tema, nicho e tom.
   - Campo livre obrigatório para o tema e opção de voltar ao editor de mídia atual.

2. **Geração científica**
   - Criar um modo `carousel_engine` no gerador existente, com resposta estruturada para exatamente 5 slides: capa, três conteúdos nas variações A/B/C e CTA.
   - Usar a pesquisa científica Dual já adotada no projeto como fonte dos mecanismos, estudos e conceitos; nenhum número, estudo, dose ou afirmação poderá ser inventado.
   - Solicitar conteúdo denso e didático, mas ajustar automaticamente o volume ao espaço seguro do slide; quando um bloco não couber, a geração será rejeitada/regenerada em vez de cortar texto.
   - Aplicar segurança por domínio: conteúdos sobre esteroides/PEDs permanecem 18+, educativos e de redução de danos, sem prescrição de dose, ciclo, empilhamento, horário de uso ou aquisição.
   - Não exibir “IA” ou “AI”. Em MCE, usar MENTALIDADE, COMPORTAMENTO e EXECUÇÃO.

3. **Sistema visual 1080 × 1350**
   - Criar os componentes do CAROUSEL ENGINE e uma biblioteca de ilustrações SVG programáticas por categoria: muscular, nutrição/metabolismo, hormonal e comportamento/MCE.
   - Implementar capa com grid, partículas, órbitas, cantoneiras e scanline; slides A/B/C com diagramas e blocos distintos; fechamento com frase, ações e CTA.
   - Usar Rajdhani e Space Mono, fundo `#020205`, cyan `#00D4FF` e gold `#B8922A`, sem arredondamento.
   - Reservar uma faixa fixa para o rodapé gold em todos os cinco slides e desenhá-lo por último, evitando sobreposição e barras pretas.
   - Usar o handle conectado do profissional, com fallback configurado do nutriON, sem fixar dados de outro usuário.

4. **Preview e edição**
   - Preview navegável com abas 1–5 e escala responsiva, mantendo a arte real em 1080 × 1350.
   - Edição inline dos campos textuais do slide ativo, com validação de encaixe.
   - Regeneração individual preservando tema, nicho, tom, pesquisa e o restante do carrossel.
   - Efeitos animados somente na preview; exportação força estado estático.

5. **Exportação e histórico**
   - Exportar PNG individual com `html2canvas` em alta resolução e ZIP com os cinco arquivos via JSZip.
   - Nomear arquivos por tema e número do slide.
   - Salvar o conteúdo estruturado e os metadados do carrossel no histórico autenticado do Studio, com RLS e permissões explícitas.

6. **Integrações do SOCIAL ON**
   - Enviar o carrossel ao Content Score e exibir o resultado consolidado, incluindo Share Score e Save Triggers.
   - Oferecer “Enviar ao Planner”, gravando o conteúdo no calendário existente sem inventar data ou horário.
   - Exibir o histórico no próprio CAROUSEL ENGINE, com reabertura dos cinco slides para edição/exportação.

## Detalhes técnicos
- Reutilizar `social-on-generate`, a pesquisa Dual, o tratamento de erros existente e os utilitários atuais de compartilhamento/download.
- A geração ficará atrás da função segura do backend; nenhuma chave será exposta no navegador.
- O modelo será ligado pelo provedor já disponível no projeto. Se Claude estiver disponível no gateway/segredo atual, será usado neste modo; caso contrário, o mesmo contrato estruturado funcionará com o motor científico atual sem criar comportamento simulado.
- Criar tipos estritos para slides A/B/C e sanitização pós-resposta: exatamente cinco slides, CTA final, termos proibidos, conteúdo mínimo, referências válidas e campos obrigatórios.
- Criar migração apenas para o histórico, com `GRANT`, RLS e políticas por usuário na mesma migração.

## Validação
- Testar normalização, cinco slides, CTA final, regras MCE/PED e encaixe de texto.
- Testar no navegador geração, edição, troca de slides, regeneração individual, histórico, Content Score, Planner, PNG e ZIP.
- Conferir dimensões 1080 × 1350, rodapé em todos os slides, ausência de texto cortado/sobreposto e ausência dos termos proibidos.
