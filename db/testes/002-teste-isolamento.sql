-- Benjamin — teste da migration 002 (isolamento por empresa), SEM GRAVAR NADA.
--
-- COMO RODAR
--   Supabase → SQL Editor → cole este arquivo inteiro → Run.
--   https://supabase.com/dashboard/project/xnesguzipbxbpbfgiyzj/sql/new
--
-- O QUE ESPERAR
--   Um erro "RESULTADO (nada foi gravado): ..." com as contagens. Esperado:
--     A vê os próprios dados (clientes = total atual, empresas = 1);
--     B vê 0 clientes, 0 reuniões, 0 análises, 0 alertas e 1 usuário (ela mesma);
--     B altera alertas de A = 0; B grava em A = bloqueado; B grava na própria = ok;
--     sem convite vê 0 clientes.
--   Qualquer número diferente disso é falha de isolamento.
--
-- O corpo abaixo repete a migration 002 para testar exatamente o que será aplicado.

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


-- ------------------------------------------------------------------
-- Teste: cria uma "Empresa Teste B" e confere o que cada login enxerga.
-- O resultado aparece como ERRO de propósito: o erro desfaz a transação
-- inteira, então nada deste arquivo fica gravado (nem a migration).
-- ------------------------------------------------------------------
do $t$
declare
  org_a uuid; email_a text; org_b uuid;
  r text := '';
  n int;
begin
  select a.org_id, a.email into org_a, email_a
  from public.app_users a join auth.users u on lower(u.email) = lower(a.email) limit 1;
  insert into public.organizations (name, slug) values ('Empresa Teste B', 'teste-b-isolamento') returning id into org_b;
  insert into public.app_users (org_id, name, email, role) values (org_b, 'Pessoa B', 'pessoa.b@teste-isolamento.example', 'vendedor');

  perform set_config('request.jwt.claims', json_build_object('email', email_a, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into n from public.customers; r := r || 'A ve clientes=' || n;
  select count(*) into n from public.meetings; r := r || ', reunioes=' || n;
  select count(*) into n from public.analyses; r := r || ', analises=' || n;
  select count(*) into n from public.alerts; r := r || ', alertas=' || n;
  select count(*) into n from public.organizations; r := r || ', empresas=' || n;
  execute 'reset role';

  perform set_config('request.jwt.claims', json_build_object('email', 'pessoa.b@teste-isolamento.example', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into n from public.customers; r := r || ' | B ve clientes=' || n;
  select count(*) into n from public.meetings; r := r || ', reunioes=' || n;
  select count(*) into n from public.analyses; r := r || ', analises=' || n;
  select count(*) into n from public.alerts; r := r || ', alertas=' || n;
  select count(*) into n from public.app_users; r := r || ', usuarios=' || n;
  update public.alerts set read = true where org_id = org_a; get diagnostics n = row_count; r := r || ', B altera alertas de A=' || n;
  begin
    insert into public.customers (org_id, name) values (org_a, 'Invasora');
    r := r || ', B grava em A=SIM';
  exception when others then r := r || ', B grava em A=bloqueado';
  end;
  begin
    insert into public.customers (org_id, name) values (org_b, 'Cliente proprio de B');
    r := r || ', B grava na propria=ok';
  exception when others then r := r || ', B grava na propria=FALHOU(' || sqlerrm || ')';
  end;
  execute 'reset role';

  perform set_config('request.jwt.claims', json_build_object('email', 'ninguem@x.example', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into n from public.customers; r := r || ' | sem convite ve clientes=' || n;
  execute 'reset role';

  raise exception 'RESULTADO (nada foi gravado): %', r;
end $t$;

rollback;
