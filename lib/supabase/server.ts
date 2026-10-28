import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/auth/supabase-publico';
import type { Database } from './database.types';

/**
 * Clientes Supabase de servidor.
 *
 * Regra inegociável do projeto (spec 5.2): o banco só é acessado pelo servidor.
 * A service_role key nunca vai para o bundle do cliente — por isso a variável
 * NÃO tem o prefixo NEXT_PUBLIC_ e este módulo carrega uma guarda em runtime.
 *
 * Isolamento por empresa (migration 002): toda leitura e escrita de dado de
 * cliente passa por `supabaseServer()`, que fala com o banco COMO o usuário
 * logado. O RLS então só deixa passar o que é da empresa dele. Ninguém precisa
 * lembrar de filtrar por org_id: esquecer o filtro não vaza nada.
 *
 * `supabaseAdmin()` usa a service_role e ignora o RLS. Fica restrito ao que é
 * global de propósito — o corpus e as execuções de validação do motor.
 */

function guardaServidor(nome: string) {
  if (typeof window !== 'undefined') {
    throw new Error(`${nome}() foi chamado no cliente. O acesso ao banco é exclusivo do servidor.`);
  }
}

/** Cliente com o login de quem fez a requisição. Use este para todo dado de empresa. */
export async function supabaseServer(): Promise<SupabaseClient<Database>> {
  guardaServidor('supabaseServer');
  const loja = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        // Server Component não pode gravar cookie; quem renova o token é o
        // middleware, a cada requisição. Em Route Handler a gravação funciona.
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options));
        } catch {
          /* renovado no middleware */
        }
      },
    },
  });
}

let admin: SupabaseClient<Database> | null = null;

/**
 * Cliente com a service_role: ignora o RLS e vê todas as empresas.
 * Só para o que é global — corpus_samples e validation_runs.
 */
export function supabaseAdmin(): SupabaseClient<Database> {
  guardaServidor('supabaseAdmin');
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente. ' +
        'Configure o .env.local antes de subir a aplicação.',
    );
  }

  admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  });
  return admin;
}

/** Diz se o ambiente está configurado, sem lançar — usado pelos estados vazios da UI. */
export function supabaseConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
