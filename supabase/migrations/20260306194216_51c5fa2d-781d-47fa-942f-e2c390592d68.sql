
-- FAQ articles
CREATE TABLE public.faq_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read FAQ"
  ON public.faq_articles FOR SELECT TO authenticated
  USING (true);

-- Community groups
CREATE TABLE public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'general',
  emoji TEXT DEFAULT '💬',
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read groups"
  ON public.community_groups FOR SELECT TO authenticated
  USING (true);

-- Group memberships
CREATE TABLE public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own memberships"
  ON public.community_memberships FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Community messages
CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read group messages"
  ON public.community_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.community_memberships
    WHERE community_memberships.user_id = auth.uid()
    AND community_memberships.group_id = community_messages.group_id
  ));

CREATE POLICY "Members can post in groups"
  ON public.community_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.community_memberships
    WHERE community_memberships.user_id = auth.uid()
    AND community_memberships.group_id = community_messages.group_id
  ));

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tickets"
  ON public.support_tickets FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Support messages (ticket thread)
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user' CHECK (sender_type IN ('user', 'agent', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ticket messages"
  ON public.support_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = support_messages.ticket_id
    AND support_tickets.user_id = auth.uid()
  ));

CREATE POLICY "Users can post to own tickets"
  ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = support_messages.ticket_id
    AND support_tickets.user_id = auth.uid()
  ));

-- Enable realtime for community messages and support
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Seed default community groups
INSERT INTO public.community_groups (name, description, goal_type, emoji) VALUES
  ('Emagrecimento', 'Grupo para quem busca perder peso com saúde e consistência', 'weight_loss', '🔥'),
  ('Hipertrofia', 'Foco em ganho de massa muscular e performance', 'muscle_gain', '💪'),
  ('Saúde Geral', 'Alimentação equilibrada e bem-estar no dia a dia', 'health', '🌿'),
  ('GLP-1 & Ozempic', 'Suporte para quem usa medicação GLP-1', 'glp1', '💊'),
  ('Família Saudável', 'Dicas e receitas para toda a família', 'family', '👨‍👩‍👧‍👦');

-- Seed FAQ articles
INSERT INTO public.faq_articles (category, question, answer, tags, sort_order) VALUES
  ('geral', 'Como funciona o plano alimentar gerado por IA?', 'Nosso plano é gerado com base no seu perfil completo: objetivo, restrições, preferências e orçamento. A IA cria 7 dias de refeições com macros calculados. Você pode trocar qualquer refeição arrastando e a lista de compras se atualiza automaticamente.', ARRAY['plano','ia','refeições'], 1),
  ('geral', 'O que é o Score de Qualidade Nutricional?', 'É uma pontuação de 0 a 100 calculada pela IA após analisar cada refeição. Leva em conta diversidade, equilíbrio de macros, presença de ultraprocessados e adequação ao seu objetivo.', ARRAY['score','qualidade','nutrição'], 2),
  ('conta', 'Como altero meus dados de perfil?', 'Acesse Perfil no menu inferior. Lá você pode editar peso, altura, objetivo, restrições alimentares e preferências. As mudanças recalculam automaticamente suas metas.', ARRAY['perfil','dados','editar'], 3),
  ('conta', 'O Modo Família é gratuito?', 'Sim! Você pode adicionar perfis de Adulto, Criança e Idoso na mesma conta sem custo adicional. Cada perfil tem interface adaptada.', ARRAY['família','perfis','gratuito'], 4),
  ('nutrição', 'Como funciona o rastreamento de micronutrientes?', 'Quando você registra uma refeição por foto ou texto, a IA identifica os alimentos e estima vitaminas e minerais. O painel mostra barras de progresso com alertas para deficiências.', ARRAY['micronutrientes','vitaminas','minerais'], 5),
  ('nutrição', 'Posso usar o app com dieta vegana/vegetariana?', 'Sim! Informe suas restrições no onboarding e a IA adaptará todas as sugestões. Planos veganos focam em combinações proteicas completas e monitoram B12, ferro e zinco.', ARRAY['vegano','vegetariano','restrição'], 6),
  ('técnico', 'Meus dados estão seguros?', 'Sim. Todos os dados são armazenados com criptografia, fotos ficam em storage privado e suas informações nunca são compartilhadas com terceiros. Você pode excluir sua conta a qualquer momento.', ARRAY['segurança','privacidade','dados'], 7),
  ('técnico', 'Por que a análise de foto não reconheceu minha refeição?', 'A IA funciona melhor com fotos bem iluminadas de cima para baixo. Evite fotos escuras ou muito próximas. Se o resultado não for preciso, você pode editar manualmente os alimentos detectados.', ARRAY['foto','análise','erro'], 8);
