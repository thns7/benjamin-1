/**
 * Popula uma conta de demonstração com a empresa fictícia de
 * `scripts/demo/conversas.ts`.
 *
 *   DEMO_EMAIL=... DEMO_SENHA=... npx tsx scripts/semear-demo.ts
 *
 * Pré-requisitos:
 *   - o usuário já existe no Supabase Auth, com e-mail confirmado;
 *   - o app está rodando (APP_URL, padrão http://localhost:3000) apontando para
 *     o mesmo banco.
 *
 * Por que pelo app e não direto no banco: as reuniões entram por POST
 * /api/meetings, com o login da conta de demonstração. É o mesmo caminho de uma
 * reunião colada na tela — motor, memória do cliente, alertas e RLS — então o
 * que a demonstração mostra é o que o produto faz.
 *
 * Idempotente: empresa, catálogo e reuniões que já existem não são duplicados.
 */
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '../lib/auth/supabase-publico';
import { CATALOGO, CONTAS, EMPRESA, PESSOA } from './demo/conversas';

const email = process.env.DEMO_EMAIL;
const senha = process.env.DEMO_SENHA;
const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
if (!email || !senha) {
  console.error('Defina DEMO_EMAIL e DEMO_SENHA.');
  process.exit(1);
}

// Os cookies que o @supabase/ssr grava no login são os mesmos que o navegador
// mandaria ao app; guardá-los aqui é o que autentica as chamadas à API.
const pote = new Map<string, string>();
const sb = createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
  cookies: {
    getAll: () => [...pote].map(([name, value]) => ({ name, value })),
    setAll: (lista) => {
      for (const { name, value } of lista) {
        if (value) pote.set(name, value);
        else pote.delete(name);
      }
    },
  },
});
const cookie = () => [...pote].map(([n, v]) => `${n}=${v}`).join('; ');

async function main() {
  const login = await sb.auth.signInWithPassword({ email: email!, password: senha! });
  if (login.error) throw new Error(`Login falhou: ${login.error.message}`);

  // Empresa: só cria se o e-mail ainda não tem uma.
  const eu = await sb.from('app_users').select('org_id').ilike('email', email!).maybeSingle();
  if (eu.error) throw new Error(eu.error.message);
  let orgId = eu.data?.org_id;
  if (!orgId) {
    const criada = await sb.rpc('criar_empresa', { nome_empresa: EMPRESA, nome_pessoa: PESSOA });
    if (criada.error) throw new Error(`criar_empresa: ${criada.error.message}`);
    orgId = criada.data as string;
    console.log(`Empresa ${EMPRESA} criada.`);
  }

  // Catálogo: 23505 é nome repetido, que aqui significa "já cadastrado".
  for (const tipo of ['produto', 'concorrente'] as const) {
    const itens = tipo === 'produto' ? CATALOGO.produtos : CATALOGO.concorrentes;
    for (const item of itens) {
      const ins = await sb.from('catalogo_itens').insert({ org_id: orgId, tipo, ...item });
      if (ins.error && ins.error.code !== '23505') throw new Error(`catálogo: ${ins.error.message}`);
    }
  }

  for (const conta of CONTAS) {
    for (const r of conta.reunioes) {
      const resp = await fetch(`${appUrl}/api/meetings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: cookie() },
        body: JSON.stringify({
          titulo: r.titulo,
          tipo: r.tipo,
          data: r.data,
          clienteNome: conta.nome,
          texto: r.texto,
          idempotente: true,
        }),
      });
      const corpo = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(`${conta.nome} · ${r.titulo}: ${resp.status} ${JSON.stringify(corpo)}`);
      console.log(`${resp.status === 200 ? 'já existia' : 'analisada '}  ${conta.nome} · ${r.titulo}`);
    }

    // Segmento, porte e valor de contrato são a base da receita em risco.
    const up = await sb
      .from('customers')
      .update({ segment: conta.segmento, size: conta.porte, contract_value: conta.valorContrato })
      .eq('org_id', orgId)
      .eq('name', conta.nome);
    if (up.error) throw new Error(`${conta.nome}: ${up.error.message}`);
  }

  console.log('Pronto.');
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
