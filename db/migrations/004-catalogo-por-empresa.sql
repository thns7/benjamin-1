-- Benjamin — migration 004
-- Catálogo por empresa: cada empresa cadastra os próprios produtos e
-- concorrentes, e o motor procura esses nomes nas reuniões dela.
--
-- COMO RODAR
--   Supabase → SQL Editor → cole este arquivo inteiro → Run.
--   Depende da migration 002 (org_do_usuario e isolamento por empresa).
--
-- O QUE MUDA
--   1. organizations.catalogo_base: 'totvs' liga a lista histórica da TOTVS
--      (lib/analysis/rules/lexicons.ts). A organização do Challenge fica com
--      ela; empresas novas começam sem lista nenhuma, para o motor não achar
--      "Protheus" ou "SAP" na reunião de quem não é cliente TOTVS.
--   2. catalogo_itens: produtos e concorrentes de cada empresa, com sinônimos
--      em texto simples. RLS: cada empresa lê e altera só os seus.

begin;

alter table public.organizations
  add column if not exists catalogo_base text;

alter table public.organizations
  drop constraint if exists organizations_catalogo_base_check;
alter table public.organizations
  add constraint organizations_catalogo_base_check check (catalogo_base is null or catalogo_base = 'totvs');

update public.organizations set catalogo_base = 'totvs' where slug = 'totvs' and catalogo_base is null;

create table if not exists public.catalogo_itens (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  tipo text not null check (tipo in ('produto', 'concorrente')),
  nome text not null check (length(btrim(nome)) between 2 and 80),
  sinonimos text[] not null default '{}' check (cardinality(sinonimos) <= 12),
  created_at timestamptz not null default now()
);

create unique index if not exists catalogo_itens_nome_unico
  on public.catalogo_itens (org_id, tipo, lower(btrim(nome)));

alter table public.catalogo_itens enable row level security;

drop policy if exists catalogo_itens_da_empresa on public.catalogo_itens;
create policy catalogo_itens_da_empresa on public.catalogo_itens for all to authenticated
  using (org_id = public.org_do_usuario())
  with check (org_id = public.org_do_usuario());

commit;
