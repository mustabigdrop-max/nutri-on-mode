# Integrar calibração visual de BF% ao APEX

## Resultado
Adicionar ao APEX Visual uma área de calibração anatômica responsiva, baseada no material enviado, sem substituir o fluxo atual de análise.

## Implementação
- Criar um painel próprio com alternância feminino/masculino e quatro seções: marcadores, fotos, calibração por categoria e protocolo de análise.
- Exibir pesos, faixas e descrições em blocos recolhíveis, com mapa de score e requisitos de fotos.
- Integrar o painel ao seletor principal do APEX como modo “Calibração BF%”.
- Adaptar o texto para deixar claro que o resultado é uma estimativa visual em faixa, não diagnóstico clínico, e que iluminação, pose e pump reduzem a confiança.
- Manter o visual técnico do APEX e garantir leitura adequada no celular.

## Detalhes técnicos
- Usar um componente isolado e os controles já padronizados do projeto.
- Não alterar banco de dados nem o fluxo atual de geração nesta etapa.
- Validar compilação e renderização do novo modo.
