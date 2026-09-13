# Plano: integrar APEX ao TrainingON

## Objetivo
Usar avaliações corporais reais já salvas no APEX como contexto adicional na geração do TrainingON, sem transformar estimativas visuais em diagnóstico ou inventar valores ausentes.

## Implementação
- Localizar o fluxo atual de geração de protocolos e a fonte persistida das análises APEX.
- Criar uma ponte de contexto tipada entre APEX e TrainingON, com estados explícitos para dados ausentes.
- Incluir somente sinais úteis e seguros na geração: data da avaliação, faixa estimada, confiança/qualidade e observações estruturadas existentes.
- Exibir no TrainingON a origem e a data do contexto usado, permitindo gerar normalmente quando não houver APEX salvo.
- Manter decisões de treino subordinadas ao objetivo, histórico, recuperação e registros reais; BF% visual será apenas contexto secundário.
- Validar o fluxo de geração e a apresentação em desktop e celular.

## Regras de segurança
- Não converter imagem em diagnóstico clínico.
- Não inventar BF%, medidas, calorias, volume ou intensidade.
- Não recomendar medicamentos, esteroides ou condutas clínicas.
- Não persistir novos dados de saúde sem necessidade; reutilizar os registros existentes.

## Detalhes técnicos
- Preferir funções compartilhadas de contexto em vez de duplicar consultas.
- Sanitizar e limitar o contexto enviado ao gerador.
- Preservar compatibilidade com protocolos existentes e com dados APEX ausentes.
