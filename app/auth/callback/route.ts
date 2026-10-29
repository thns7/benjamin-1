import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Destino do link de confirmação de e-mail do cadastro.
 *
 * O Supabase manda um `code` (fluxo PKCE); trocá-lo por sessão grava os
 * cookies, e a pessoa segue para /comecar, que cria a empresa. Quem já tem
 * empresa é mandado de lá para o Radar.
 *
 * ⚠ No painel do Supabase (Authentication → URL Configuration), o endereço
 * `https://<seu-domínio>/auth/callback` precisa estar em Redirect URLs.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL('/comecar', url.origin));
  }

  const destino = new URL('/login', url.origin);
  destino.searchParams.set('motivo', 'link');
  return NextResponse.redirect(destino);
}
