# Plano — STRATUM Engine: regras de decisão

## Objetivo
Transformar as 17 regras fornecidas em decisões determinísticas do TrainingON, mantendo o coach como autoridade final e usando somente dados reais disponíveis.

## Implementação
- Consolidar zonas de repetição, RIR/RPE, falha, técnicas, BFR, divisão, volume, progressão, recuperação, multimodalidade e frequência APEX em um motor testável.
- Integrar os resultados à geração do protocolo e aos alertas visíveis do coach.
- Cruzar pontos fracos, progresso, fase e NutriPlan sem criar macros, doses, cargas ou evidências ausentes.
- Preservar overrides manuais do coach como prioridade máxima.

## Segurança
- Bloquear BFR quando houver contraindicação ou falta de supervisão.
- Não prescrever falha para iniciantes, compostos pesados ou deload.
- Tratar ajustes nutricionais detalhados como sugestão para revisão profissional, nunca aplicação automática.

## Validação
- Cobrir regras críticas com testes unitários e executar verificação de tipos.
