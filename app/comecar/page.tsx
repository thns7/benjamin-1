import { redirect } from 'next/navigation';
import { Logo } from '@/components/logo';
import { BotaoSair } from '@/components/sair';
import { supabaseServer } from '@/lib/supabase/server';
import { CriarEmpresa } from './criar-empresa';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Crie sua empresa' };

/**
 * Quem tem conta mas ainda não tem empresa cai aqui (o middleware manda).
 * Quem já tem empresa volta para o Radar.
 */
export default async function ComecarPage() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const { data: membro } = await sb.from('app_users').select('id').limit(1).maybeSingle();
  if (membro) redirect('/');

  const meta = (user.user_metadata ?? {}) as { nome?: string; empresa?: string };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <Logo size={40} />
          <h1 className="mt-6 text-[22px] font-semibold tracking-[-0.02em]">Falta um passo: sua empresa</h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">
            Conta criada para <strong className="font-semibold text-ink">{user.email}</strong>. A empresa é onde ficam
            suas contas e reuniões; só quem for dela enxerga.
          </p>
        </div>
        <CriarEmpresa nomeInicial={meta.nome ?? ''} empresaInicial={meta.empresa ?? ''} />
        <div className="mt-6 flex justify-center">
          <BotaoSair />
        </div>
      </div>
    </div>
  );
}
