-- Benjamin — migration 003
-- Cadastro aberto: qualquer pessoa cria a própria conta e a própria empresa.
--
-- COMO RODAR
--   Supabase → SQL Editor → cole este arquivo inteiro → Run.
--   Depende da migration 002 (isolamento por empresa).
--
-- POR QUE UMA FUNÇÃO
--   O RLS da 002 não deixa ninguém inserir em organizations nem app_users: se
--   deixasse, uma pessoa poderia se colocar na empresa de outra. Esta função
--   roda com privilégio próprio (security definer) e faz só uma coisa segura:
--   cria uma empresa NOVA e põe nela a pessoa do login, como admin. Nunca
--   associa ninguém a uma empresa que já existe.
--
-- REGRAS
--   - precisa estar logado (o e-mail vem do token, não de parâmetro);
--   - um e-mail pertence a uma empresa só: quem já tem empresa recebe erro;
--   - o slug é gerado aqui, com sufixo aleatório, para nunca colidir.

begin;

create or replace function public.criar_empresa(nome_empresa text, nome_pessoa text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(auth.jwt() ->> 'email');
  v_empresa text := btrim(coalesce(nome_empresa, ''));
  v_pessoa text := btrim(coalesce(nome_pessoa, ''));
  v_slug text;
  v_org uuid;
begin
  if v_email is null or v_email = '' then
    raise exception 'Sessão ausente: entre de novo.' using errcode = '28000';
  end if;
  if exists (select 1 from public.app_users where lower(email) = v_email) then
    raise exception 'Este e-mail já pertence a uma empresa.' using errcode = '23505';
  end if;
  if length(v_empresa) < 2 or length(v_empresa) > 120 then
    raise exception 'Informe o nome da empresa (2 a 120 caracteres).' using errcode = '22023';
  end if;
  if v_pessoa = '' then
    v_pessoa := split_part(v_email, '@', 1);
  end if;

  v_slug := trim(both '-' from regexp_replace(lower(v_empresa), '[^a-z0-9]+', '-', 'g'));
  v_slug := left(coalesce(nullif(v_slug, ''), 'empresa'), 48) || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);

  insert into public.organizations (name, slug) values (v_empresa, v_slug) returning id into v_org;
  insert into public.app_users (org_id, name, email, role) values (v_org, left(v_pessoa, 120), v_email, 'admin');

  return v_org;
end;
$$;

revoke all on function public.criar_empresa(text, text) from public;
revoke all on function public.criar_empresa(text, text) from anon;
grant execute on function public.criar_empresa(text, text) to authenticated;

commit;
