create table refeicoes_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  tipo_input text not null default 'texto',
  descricao_usuario text,
  imagem_url text,
  analise_completa jsonb not null default '{}'::jsonb,
  calorias_total integer default 0,
  proteinas_g numeric default 0,
  carboidratos_g numeric default 0,
  gorduras_g numeric default 0,
  score integer default 0,
  classificacao text,
  created_at timestamp with time zone default now()
);

alter table refeicoes_log enable row level security;

create policy "Users manage own meal snaps"
  on refeicoes_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index refeicoes_user_date on refeicoes_log(user_id, created_at desc);