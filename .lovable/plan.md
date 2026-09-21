# Plano — Orquestrador Master pós-fotos APEX

## Objetivo
Criar o fluxo unificado que começa no upload das 3 fotos do APEX ou em uma reavaliação e conduz o coach por uma única cadeia: visual → checklist funcional → diagnóstico → KINESIS → STRATUM → NutriPlan → APEX Evolution → gamificação → PRAXIS → relatório do coach.

## O que será entregue
- **Pipeline único no APEX Visual**: ao salvar a avaliação visual, criar uma execução do orquestrador com status, etapas, logs e próximos passos.
- **Checklist funcional filtrado**: mostrar ao coach apenas os grupos sinalizados pelo visual; se houver checklist recente, oferecer manter respostas anteriores ou reavaliar.
- **Diagnóstico cruzado obrigatório**: STRATUM e KINESIS só rodam depois do diagnóstico visual × funcional; se o checklist for pulado, marcar como avaliação parcial.
- **Seleção KINESIS**: gerar protocolos CORRECT/ACTIVATE/VOLUME, variações por deficit, cues obrigatórios e fallback quando não houver exercício compatível.
- **Prévia STRATUM**: gerar plano sugerido com aquecimento, sessões, volume, técnicas, feeders/homework, flags NutriPlan e resumo de mudanças; nada é publicado automaticamente.
- **Sincronização NutriPlan**: registrar flags de ajuste para revisão profissional, sem alterar calorias ou dieta automaticamente.
- **APEX Evolution**: registrar snapshot, deltas vs avaliação anterior, mapa muscular e próxima reavaliação.
- **Gamificação**: recalcular score/rank MCE, detectar promoção e conquistas, e preparar Physique Card atualizado.
- **PRAXIS após aprovação**: preparar mensagens do aluno, mas enviar somente quando o coach aprovar o treino.
- **Relatório do coach**: nova tela/aba com mapa de deficits, ajustes STRATUM, flags NutriPlan, gamificação, mensagens PRAXIS, log de execução e botões Aprovar, Editar e PDF.

## Backend e segurança
- Criar tabela de execuções/logs do orquestrador com RLS e GRANTs.
- Criar tabela de aprovações/overrides quando necessário para manter a versão editada pelo coach como fonte publicada.
- Usar dados reais já salvos; quando faltar dado, a etapa fica parcial ou usa fallback declarado.
- Notificações ao aluno e publicação do treino só acontecem após aprovação do coach.
- Erros de módulos não interrompem o relatório: cada etapa registra sucesso, pendência, fallback ou erro.

## Integração técnica
- Reutilizar os módulos existentes: APEX Visual, `apex_functional_checklists`, `apex_deficit_diagnoses`, KINESIS, STRATUM, NutriPlan flags, ranks/conquistas e notificações.
- Adicionar uma biblioteca de orquestração determinística para montar o estado do pipeline no frontend e persistir logs.
- Integrar o salvamento do APEX Visual ao início do pipeline.
- Integrar o salvamento do checklist funcional à continuação automática das etapas 3–9.
- Adicionar rota/tela de relatório do orquestrador para o coach revisar antes de aprovar.

## Validação
- Rodar verificação de tipos e testes focados nos módulos APEX/STRATUM/Arsenal.
- Verificar no preview o fluxo principal: upload/salvar visual, checklist filtrado, relatório, aprovação e log.

## Fora do escopo agora
- Trocar provedores de visão ou alterar o modelo de análise visual existente.
- Publicar automaticamente sem revisão do coach.
- Criar valores nutricionais fechados ou prescrições clínicas fora da revisão profissional.
