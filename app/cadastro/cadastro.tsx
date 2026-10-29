'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Building2, Loader2, Lock, Mail, MailCheck, TriangleAlert, User } from 'lucide-react';
import { Logo, Wordmark } from '@/components/logo';
import { Campo, classeBotao, classeInput } from '@/components/campos-auth';
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/auth/supabase-publico';

/**
 * Cria a conta e a empresa de uma vez.
 *
 * Se o projeto não exige confirmação de e-mail, o Supabase devolve a sessão na
 * hora e a empresa é criada aqui mesmo (função criar_empresa). Se exige, a
 * pessoa confirma pelo link, cai em /auth/callback e cria a empresa em
 * /comecar, com os nomes já preenchidos (guardados nos metadados da conta).
 */
export function Cadastro() {
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (senha.length < 8) {
      setErro('Use uma senha com pelo menos 8 caracteres.');
      return;
    }
    setEnviando(true);
    setErro(null);

    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { nome: nome.trim(), empresa: empresa.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErro(
        error.message.toLowerCase().includes('registered')
          ? 'Já existe uma conta com este e-mail. Entre pela tela de login.'
          : 'Não foi possível criar a conta. Confira os dados e tente de novo.',
      );
      setEnviando(false);
      return;
    }

    if (!data.session) {
      // O projeto exige confirmação de e-mail: a empresa nasce depois do link.
      setConfirmar(true);
      setEnviando(false);
      return;
    }

    const { error: erroEmpresa } = await supabase.rpc('criar_empresa', {
      nome_empresa: empresa.trim(),
      nome_pessoa: nome.trim(),
    });
    if (erroEmpresa) {
      // A conta existe; a empresa pode ser criada em /comecar.
      window.location.replace('/comecar');
      return;
    }
    window.location.replace('/catalogo?novo=1');
  }

  if (confirmar) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <MailCheck size={22} aria-hidden />
        </div>
        <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">Confirme seu e-mail</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">
          Mandamos um link para <strong className="font-semibold text-ink">{email}</strong>. Abra o link para ativar a
          conta; depois disso, o Benjamin cria a empresa {empresa ? <strong className="font-semibold text-ink">{empresa}</strong> : null} e
          abre o radar.
        </p>
        <p className="mt-6 text-[12.5px] text-ink-faint">Não chegou? Confira o spam ou tente de novo em alguns minutos.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-7 flex flex-col items-center text-center">
        <a href="/apresentacao" aria-label="Benjamin, página inicial">
          <Logo size={40} />
        </a>
        <Wordmark className="mt-4 !text-[14px] !tracking-[0.5em] pl-[0.5em]" />
        <h1 className="mt-6 text-[22px] font-semibold tracking-[-0.02em]">Crie a conta da sua empresa</h1>
        <p className="mt-1.5 text-[13.5px] text-ink-dim">Seu radar de churn fica pronto em um minuto.</p>
      </div>

      <form onSubmit={criar} className="vidro rounded-2xl p-6">
        <Campo id="nome" rotulo="Seu nome" icone={<User size={14} />}>
          <input id="nome" autoComplete="name" required value={nome} onChange={(e) => setNome(e.target.value)} disabled={enviando} className={classeInput} placeholder="Ana Souza" />
        </Campo>
        <Campo id="empresa" rotulo="Empresa" icone={<Building2 size={14} />} className="mt-4">
          <input id="empresa" autoComplete="organization" required minLength={2} maxLength={120} value={empresa} onChange={(e) => setEmpresa(e.target.value)} disabled={enviando} className={classeInput} placeholder="Nome da sua empresa" />
        </Campo>
        <Campo id="email" rotulo="E-mail de trabalho" icone={<Mail size={14} />} className="mt-4">
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={enviando} className={classeInput} placeholder="voce@empresa.com.br" />
        </Campo>
        <Campo id="senha" rotulo="Senha" icone={<Lock size={14} />} className="mt-4">
          <input id="senha" type="password" autoComplete="new-password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} disabled={enviando} className={classeInput} placeholder="Pelo menos 8 caracteres" />
        </Campo>

        <button type="submit" disabled={enviando || !nome || !empresa || !email || !senha} className={classeBotao}>
          {enviando ? <Loader2 size={14} className="animate-spin" /> : null}
          {enviando ? 'Criando a conta…' : 'Criar conta'}
        </button>

        {erro ? (
          <p role="alert" className="mt-3 flex items-start gap-1.5 text-[12.5px] leading-snug text-risk">
            <TriangleAlert size={13} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        ) : null}

        <p className="mt-4 text-[11.5px] leading-relaxed text-ink-faint">
          As conversas que você analisar ficam num banco no Brasil, anonimizadas, e só a sua empresa enxerga.
        </p>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-dim">
        Já tem conta?{' '}
        <a href="/login" className="font-medium text-accent underline underline-offset-4">
          Entrar
        </a>
      </p>
    </div>
  );
}
