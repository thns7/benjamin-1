import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/auth/supabase-publico';

/**
 * A porta da aplicação — login por usuário, cadastro aberto.
 *
 * O produto guarda transcrição de conversa comercial com cliente identificado.
 * Toda rota do produto exige sessão válida do Supabase Auth E uma empresa: a
 * linha em `app_users` com o mesmo e-mail. Quem acabou de criar a conta e ainda
 * não tem empresa vai para /comecar, que a cria (função criar_empresa, migration
 * 003). O isolamento entre empresas é do banco (RLS, migration 002).
 *
 * Sem login: "/" mostra a landing; as outras rotas levam ao login.
 */

const LIVRE = [
  '/login',
  '/cadastro',
  '/auth',
  '/apresentacao',
  '/_next',
  '/favicon',
  '/icon',
  '/apple-icon',
  '/opengraph-image',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * O layout raiz precisa saber o caminho para não envolver a tela de entrada na
 * navegação do produto. Server component não lê a URL, então ela viaja por
 * cabeçalho.
 */
const CABECALHO_CAMINHO = 'x-benjamin-caminho';

function seguir(req: NextRequest) {
  const h = new Headers(req.headers);
  h.set(CABECALHO_CAMINHO, req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: h } });
}

function barrar(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API responde 401: um fetch que recebe o HTML do login quebra num JSON.parse.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { erro: 'Sessão ausente ou expirada.' },
      { status: 401 },
    );
  }

  const destino = req.nextUrl.clone();
  destino.pathname = '/login';
  const params = new URLSearchParams();
  if (pathname !== '/') params.set('de', pathname);
  destino.search = params.toString() ? `?${params}` : '';
  return NextResponse.redirect(destino);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LIVRE.some((p) => pathname.startsWith(p))) return seguir(req);

  let resposta = seguir(req);

  // O Supabase renova o token de acesso pelo cookie; a resposta precisa
  // devolver o cookie renovado, senão a sessão expira no meio do uso.
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => req.cookies.set(name, value));
        resposta = seguir(req);
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });

  // getUser valida o token no servidor do Auth; getSession só leria o cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    // Visitante sem login em "/" vê a landing, não a tela de entrada. A URL
    // continua "/"; o cabeçalho de caminho diz ao layout para não pôr o Shell.
    if (pathname === '/') {
      const destino = req.nextUrl.clone();
      destino.pathname = '/apresentacao';
      const h = new Headers(req.headers);
      h.set(CABECALHO_CAMINHO, '/apresentacao');
      return NextResponse.rewrite(destino, { request: { headers: h } });
    }
    return barrar(req);
  }

  // Logado mas sem empresa: acabou de criar a conta. Em vez de barrar, leva
  // para o passo que cria a empresa (o cadastro é aberto desde a migration 003).
  // O RLS só devolve linhas de app_users da empresa de quem pergunta.
  const { data: membro } = await supabase.from('app_users').select('id').limit(1).maybeSingle();
  if (!membro) {
    if (pathname.startsWith('/comecar')) return resposta;
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ erro: 'Crie sua empresa antes de continuar.' }, { status: 403 });
    }
    const destino = req.nextUrl.clone();
    destino.pathname = '/comecar';
    destino.search = '';
    return NextResponse.redirect(destino);
  }

  return resposta;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
