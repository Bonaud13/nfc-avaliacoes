-- PPRT.IA Admin Dashboard
-- Execute este arquivo no SQL Editor do Supabase.
-- Ele NÃO altera a rota pública /r/[codigo] e mantém os dados privados fora da tabela placas.

create extension if not exists pgcrypto;

-- =========================================================
-- ADMINISTRADORES
-- =========================================================
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null default 'admin' check (role in ('admin', 'manager')),
  criado_em timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

drop policy if exists "Admin le proprio cadastro" on public.admin_users;
create policy "Admin le proprio cadastro"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admin gerencia administradores" on public.admin_users;
create policy "Admin gerencia administradores"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- CLIENTES
-- =========================================================
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  empresa text,
  telefone text,
  whatsapp text,
  email text,
  documento text,
  endereco text,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.clientes enable row level security;

drop policy if exists "Admin gerencia clientes" on public.clientes;
create policy "Admin gerencia clientes"
on public.clientes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- METADADOS PRIVADOS DE CADA PLACA
-- Não coloque custo/contato dentro de placas, pois placas possui leitura pública.
-- =========================================================
create table if not exists public.placa_admin (
  id uuid primary key default gen_random_uuid(),
  placa_id bigint not null unique references public.placas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,

  status text not null default 'estoque'
    check (status in ('estoque', 'reservada', 'vendida', 'instalada', 'manutencao', 'inativa')),

  data_compra date,
  custo_compra numeric(12,2) not null default 0,

  data_venda date,
  preco_venda numeric(12,2) not null default 0,

  data_instalacao date,
  local_instalacao text,

  contato_nome text,
  contato_telefone text,
  contato_email text,

  forma_pagamento text,
  parcelas integer not null default 1 check (parcelas >= 1),
  observacoes text,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists placa_admin_status_idx on public.placa_admin(status);
create index if not exists placa_admin_cliente_idx on public.placa_admin(cliente_id);
create index if not exists placa_admin_instalacao_idx on public.placa_admin(data_instalacao);

alter table public.placa_admin enable row level security;

drop policy if exists "Admin gerencia placa_admin" on public.placa_admin;
create policy "Admin gerencia placa_admin"
on public.placa_admin
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- VENDAS
-- =========================================================
create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  data_venda date not null default current_date,
  subtotal numeric(12,2) not null default 0,
  desconto numeric(12,2) not null default 0,
  valor_total numeric(12,2) not null default 0,
  forma_pagamento text,
  status text not null default 'pago'
    check (status in ('orcamento', 'pendente', 'parcial', 'pago', 'cancelado')),
  observacoes text,
  criado_em timestamptz not null default now()
);

create table if not exists public.venda_itens (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas(id) on delete cascade,
  placa_id bigint references public.placas(id) on delete set null,
  descricao text,
  quantidade integer not null default 1 check (quantidade > 0),
  custo_unitario numeric(12,2) not null default 0,
  preco_unitario numeric(12,2) not null default 0,
  criado_em timestamptz not null default now()
);

create index if not exists vendas_data_idx on public.vendas(data_venda);
create index if not exists venda_itens_venda_idx on public.venda_itens(venda_id);

alter table public.vendas enable row level security;
alter table public.venda_itens enable row level security;

drop policy if exists "Admin gerencia vendas" on public.vendas;
create policy "Admin gerencia vendas"
on public.vendas
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin gerencia itens venda" on public.venda_itens;
create policy "Admin gerencia itens venda"
on public.venda_itens
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- PAGAMENTOS / CONTAS A RECEBER
-- =========================================================
create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid references public.vendas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  descricao text,
  valor numeric(12,2) not null default 0,
  forma_pagamento text,
  status text not null default 'pendente'
    check (status in ('pendente', 'pago', 'atrasado', 'cancelado')),
  vencimento date,
  pago_em date,
  criado_em timestamptz not null default now()
);

create index if not exists pagamentos_status_idx on public.pagamentos(status);
create index if not exists pagamentos_vencimento_idx on public.pagamentos(vencimento);

alter table public.pagamentos enable row level security;

drop policy if exists "Admin gerencia pagamentos" on public.pagamentos;
create policy "Admin gerencia pagamentos"
on public.pagamentos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- DESPESAS
-- =========================================================
create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  categoria text not null default 'Outros',
  descricao text not null,
  valor numeric(12,2) not null default 0,
  forma_pagamento text,
  recorrente boolean not null default false,
  observacoes text,
  criado_em timestamptz not null default now()
);

create index if not exists despesas_data_idx on public.despesas(data);
create index if not exists despesas_categoria_idx on public.despesas(categoria);

alter table public.despesas enable row level security;

drop policy if exists "Admin gerencia despesas" on public.despesas;
create policy "Admin gerencia despesas"
on public.despesas
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- CONFIGURAÇÕES
-- =========================================================
create table if not exists public.configuracoes (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.configuracoes enable row level security;

drop policy if exists "Admin gerencia configuracoes" on public.configuracoes;
create policy "Admin gerencia configuracoes"
on public.configuracoes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.configuracoes (chave, valor)
values
  ('empresa', '{"nome":"PPRT.IA","moeda":"BRL"}'::jsonb),
  ('estoque', '{"alerta_minimo":5}'::jsonb),
  ('venda', '{"preco_padrao":100,"custo_padrao":19.90}'::jsonb)
on conflict (chave) do nothing;

-- =========================================================
-- ACESSOS: o público continua podendo INSERIR.
-- Somente admin pode CONSULTAR as métricas.
-- =========================================================
drop policy if exists "Admin le acessos" on public.acessos;
create policy "Admin le acessos"
on public.acessos
for select
to authenticated
using (public.is_admin());

-- =========================================================
-- PLACAS: mantém leitura pública existente e adiciona CRUD admin.
-- =========================================================
drop policy if exists "Admin gerencia placas" on public.placas;
create policy "Admin gerencia placas"
on public.placas
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- FUNÇÃO DE ATUALIZAÇÃO DE updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
before update on public.clientes
for each row execute function public.set_updated_at();

drop trigger if exists placa_admin_set_updated_at on public.placa_admin;
create trigger placa_admin_set_updated_at
before update on public.placa_admin
for each row execute function public.set_updated_at();

-- =========================================================
-- PASSO FINAL MANUAL
-- 1) Supabase > Authentication > Users > Add user
-- 2) Depois troque o email abaixo e execute SOMENTE este INSERT:
--
-- insert into public.admin_users (user_id, nome)
-- select id, 'Geison'
-- from auth.users
-- where email = 'SEU_EMAIL_AQUI';
--
-- 3) Desative "Allow new users to sign up" se apenas você usará o painel.
-- =========================================================
