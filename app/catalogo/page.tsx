import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { SemBanco } from '@/components/sem-banco';
import { supabaseConfigurado, supabaseServer } from '@/lib/supabase/server';
import { contextoDoUsuario } from '@/lib/supabase/persistencia';
import { ColunaCatalogo, type ItemTela } from './editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Produtos e concorrentes' };

const DESCRICAO =
  'O que o Benjamin procura nas reuniões da sua empresa. Cadastre os nomes como os clientes falam: o motor ignora acento e maiúsculas.';

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
  if (!supabaseConfigurado()) {
    return (
      <>
        <PageHeader titulo="Produtos e concorrentes" descricao={DESCRICAO} />
        <SemBanco oQueApareceAqui="Aqui você cadastra os produtos da sua empresa e os concorrentes que o Benjamin deve reconhecer nas reuniões." />
      </>
    );
  }

  const { novo } = await searchParams;
  const ctx = await contextoDoUsuario();
  const sb = await supabaseServer();
  const [itensRes, orgRes] = await Promise.all([
    sb.from('catalogo_itens').select('id, tipo, nome, sinonimos').eq('org_id', ctx.orgId).order('nome'),
    sb.from('organizations').select('name, catalogo_base').eq('id', ctx.orgId).maybeSingle(),
  ]);
  if (itensRes.error) throw new Error(`Falha ao carregar o catálogo: ${itensRes.error.message}`);

  const itens = itensRes.data ?? [];
  const tela = (tipo: string): ItemTela[] =>
    itens.filter((i) => i.tipo === tipo).map((i) => ({ id: i.id, nome: i.nome, sinonimos: i.sinonimos ?? [] }));
  const baseTotvs = orgRes.data?.catalogo_base === 'totvs';

  return (
    <>
      {novo ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-accent-soft px-5 py-4">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <div>
              <p className="text-[14.5px] font-semibold">Empresa {orgRes.data?.name ? `${orgRes.data.name} ` : ''}criada.</p>
              <p className="mt-0.5 text-[13px] text-ink-dim">
                Cadastre seus produtos e concorrentes para o Benjamin reconhecê-los nas reuniões. Leva um minuto, e dá
                para voltar aqui quando quiser.
              </p>
            </div>
          </div>
          <Link href="/" className="text-[13px] font-semibold text-accent underline underline-offset-4">
            Pular e abrir o radar
          </Link>
        </div>
      ) : null}

      <PageHeader titulo="Produtos e concorrentes" descricao={DESCRICAO} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ColunaCatalogo
          tipo="produto"
          titulo="Seus produtos"
          descricao="Quando o cliente cita um deles, o Benjamin registra se ele usa, avalia ou só mencionou."
          exemploNome="Ex.: Painel Pulse"
          exemploSinonimos="Ex.: Pulse, painel"
          itens={tela('produto')}
        />
        <ColunaCatalogo
          tipo="concorrente"
          titulo="Concorrentes"
          descricao="Concorrente citado numa reunião vira sinal de risco, com a fala que mostra se é avaliação ativa ou só histórico."
          exemploNome="Ex.: Zenith Analytics"
          exemploSinonimos="Ex.: Zenith"
          itens={tela('concorrente')}
        />
      </div>

      <p className="mt-6 max-w-[70ch] text-[12.5px] leading-relaxed text-ink-faint">
        O catálogo vale para as próximas análises. Para aplicar numa reunião que já foi analisada, abra a reunião e use
        Reprocessar.
        {baseTotvs ? ' Esta empresa também usa a lista padrão da TOTVS, além do que está cadastrado aqui.' : ''}
      </p>
    </>
  );
}
