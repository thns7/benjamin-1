'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, LogOut } from 'lucide-react';
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/auth/supabase-publico';

/**
 * Encerra a sessão e volta para a página inicial (a landing, para quem está
 * sem login). `replace` para o Radar não ficar no "voltar" do navegador.
 *
 * Sai mesmo se o Supabase falhar: signOut apaga os cookies locais antes de
 * avisar o servidor, e o middleware barra a próxima requisição sem sessão.
 */
export function BotaoSair({ compacto = false }: { compacto?: boolean }) {
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await createBrowserClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA).auth.signOut();
    } finally {
      window.location.replace('/');
    }
  }

  const Icone = saindo ? Loader2 : LogOut;
  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      aria-label="Sair da conta"
      title="Sair da conta"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-line text-ink-dim transition-colors hover:border-line-strong hover:text-ink disabled:opacity-60 ${
        compacto ? 'size-7' : 'h-7 px-2.5 text-[12px] font-medium'
      }`}
    >
      <Icone size={14} className={saindo ? 'animate-spin' : ''} aria-hidden />
      {compacto ? null : saindo ? 'Saindo' : 'Sair'}
    </button>
  );
}
