# Plano — Weak Point Intelligence no TrainingON

## Objetivo
Integrar ao TrainingON um painel de ciclo completo para pontos fracos, conectando avaliações APEX, dados de treino, ajustes do coach e contexto NutriPlan sem usar os valores fictícios do exemplo.

## Implementação
- Mapear os dados reais já disponíveis no TrainingON, APEX e NutriPlan para um modelo seguro de ponto fraco.
- Criar a interface com seleção do ponto, diagnóstico, treino, nutrição e evolução.
- Mostrar apenas evidências e ajustes persistidos; quando não houver informação, exibir ausência de dados em vez de estimativas.
- Inserir o painel no fluxo do coach para o atleta selecionado, preservando as regras atuais de acesso.
- Manter recomendações clínicas e nutricionais fora da geração automática; calibração visual será contexto secundário sujeito à validação do coach.

## Validação
- Verificar tipagem e testes relevantes.
- Conferir a tela autenticada quando houver sessão disponível.
