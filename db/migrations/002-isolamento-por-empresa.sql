-- Benjamin — migration 002
-- Isolamento por empresa: o banco garante que cada empresa só vê o que é dela.
--
-- COMO RODAR
--   Supabase → SQL Editor → cole este arquivo inteiro → Run.
--   https://supabase.com/dashboard/project/xnesguzipbxbpbfgiyzj/sql/new
--
-- É seguro rodar mais de uma vez: a função é `create or replace` e cada
-- política é apagada antes de ser criada.
--
-- NÃO QUEBRA O QUE ESTÁ NO AR. A versão atual da aplicação lê com a
-- service_role, que ignora RLS; estas políticas só passam a valer quando o
-- código ler com o login do usuário (supabaseServer() a partir desta mesma
-- mudança). Por isso a ordem é: rodar esta migration, depois publicar o código.
--
-- MODELO
--   Uma pessoa pertence a UMA empresa. A empresa vem do convite: a linha em
--   app_users com o mesmo e-mail do login. Sem convite, `org_do_usuario()` é
--   null e nenhuma política deixa passar nada.

begin;

-- ------------------------------------------------------------------
-- 1. Um e-mail, uma empresa
-- ------------------------------------------------------------------
--
-- Sem isto, o mesmo e-mail convidado em duas empresas faria o sistema escolher
-- uma ao acaso. Falha (de propósito) se já houver e-mail repetido: resolva os
-- duplicados antes de rodar de novo.

create unique index if not exists app_users_email_unico on public.app_users (lower(email));

-- ------------------------------------------------------------------
-- 2. A empresa de quem está logado
-- ------------------------------------------------------------------
--
-- security definer: precisa ler app_users ignorando o RLS dela mesma, senão
-- toda política que chama esta função faria uma consulta que também passa por
-- política. `stable` deixa o Postgres calcular uma vez por consulta.

create or replace function public.org_do_usuario()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id
  from public.app_users
  where lower(email) = lower(auth.jwt() ->> 'email')
  limit 1
$$;

revoke all on function public.org_do_usuario() from public;
grant execute on function public.org_do_usuario() to authenticated;

-- ------------------------------------------------------------------
-- 3. Tabelas com org_id: tudo dentro da própria empresa
-- ------------------------------------------------------------------

do $$
declare
  tabela text;
begin
  foreach tabela in array array['customers', 'meetings', 'action_items', 'alerts', 'pain_signals'] loop
    execute format('drop policy if exists %I on public.%I', tabela || '_da_empresa', tabela);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (org_id = public.org_do_usuario())
         with check (org_id = public.org_do_usuario())',
      tabela || '_da_empresa', tabela
    );
  end loop;
end $$;

-- ------------------------------------------------------------------
-- 4. Tabelas sem org_id: herdam a empresa da reunião
-- ------------------------------------------------------------------

drop policy if exists transcripts_da_empresa on public.transcripts;
create policy transcripts_da_empresa on public.transcripts for all to authenticated
  using (exists (select 1 from public.meetings m where m.id = meeting_id and m.org_id = public.org_do_usuario()))
  with check (exists (select 1 from public.meetings m where m.id = meeting_id and m.org_id = public.org_do_usuario()));

drop policy if exists analyses_da_empresa on public.analyses;
create policy analyses_da_empresa on public.analyses for all to authenticated
  using (exists (select 1 from public.meetings m where m.id = meeting_id and m.org_id = public.org_do_usuario()))
  with check (exists (select 1 from public.meetings m where m.id = meeting_id and m.org_id = public.org_do_usuario()));

drop policy if exists corrections_da_empresa on public.corrections;
create policy corrections_da_empresa on public.corrections for all to authenticated
  using (exists (
    select 1 from public.analyses a join public.meetings m on m.id = a.meeting_id
    where a.id = analysis_id and m.org_id = public.org_do_usuario()))
  with check (exists (
    select 1 from public.analyses a join public.meetings m on m.id = a.meeting_id
    where a.id = analysis_id and m.org_id = public.org_do_usuario()));

-- ------------------------------------------------------------------
-- 5. A própria empresa e os colegas
-- ------------------------------------------------------------------
--
-- Só leitura: criar empresa e convidar pessoa continua sendo tarefa de quem
-- administra o Supabase. A política antiga (cada um lê só a própria linha)
-- continua valendo e é o que o middleware usa para conferir o convite.

drop policy if exists organizations_propria on public.organizations;
create policy organizations_propria on public.organizations for select to authenticated
  using (id = public.org_do_usuario());

drop policy if exists app_users_colegas on public.app_users;
create policy app_users_colegas on public.app_users for select to authenticated
  using (org_id = public.org_do_usuario());

-- corpus_samples e validation_runs ficam sem política: são o corpus de
-- validação do motor, global, lido só pela service_role.

commit;
