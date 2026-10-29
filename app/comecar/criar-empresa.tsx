'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Building2, Loader2, TriangleAlert, User } from 'lucide-react';
import { Campo, classeBotao, classeInput } from '@/components/campos-auth';
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/auth/supabase-publico';

/** Último passo do cadastro: a empresa nasce com a pessoa como admin. */
export function CriarEmpresa({ nomeInicial, empresaInicial }: { nomeInicial: string; empresaInicial: string }) {
  const [nome, setNome] = useState(nomeInicial);
  const [empresa, setEmpresa] = useState(empresaInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErro(null);
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA);
    const { error } = await supabase.rpc('criar_empresa', { nome_empresa: empresa.trim(), nome_pessoa: nome.trim() });
    if (error) {
      setErro(error.message || 'Não foi possível criar a empresa. Tente de novo.');
      setEnviando(false);
      return;
    }
    window.location.replace('/catalogo?novo=1');
  }

  return (
    <form onSubmit={criar} className="vidro rounded-2xl p-6">
      <Campo id="empresa" rotulo="Empresa" icone={<Building2 size={14} />}>
        <input id="empresa" autoFocus required minLength={2} maxLength={120} value={empresa} onChange={(e) => setEmpresa(e.target.value)} disabled={enviando} className={classeInput} placeholder="Nome da sua empresa" />
      </Campo>
      <Campo id="nome" rotulo="Seu nome" icone={<User size={14} />} className="mt-4">
        <input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeInput} placeholder="Ana Souza" />
      </Campo>
      <button type="submit" disabled={enviando || !empresa || !nome} className={classeBotao}>
        {enviando ? <Loader2 size={14} className="animate-spin" /> : null}
        {enviando ? 'Criando…' : 'Criar empresa e abrir o radar'}
      </button>
      {erro ? (
        <p role="alert" className="mt-3 flex items-start gap-1.5 text-[12.5px] leading-snug text-risk">
          <TriangleAlert size={13} className="mt-0.5 shrink-0" />
          {erro}
        </p>
      ) : null}
    </form>
  );
}
