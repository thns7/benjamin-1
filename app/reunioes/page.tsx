import { MessagesSquare } from 'lucide-react';
import { BotaoLink, EmptyState, PageHeader } from '@/components/ui';
import { supabaseConfigurado, supabaseServer } from '@/lib/supabase/server';
import { SemBanco } from '@/components/sem-banco';
import { ROTULO_TIPO } from '@/lib/lote/tipos';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Reuniões' };

type LinhaReuniao = {
  id: string;
  title: string;
  meeting_date: string;
  meeting_type: string;
  status: string;
};

const ROTULO_STATUS: Record<string, string> = {
  analyzed: 'Analisada',
  analyzing: 'Analisando',
  error: 'Erro',
};

const fmtData = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR');

export default async function ReunioesPage() {
  if (!supabaseConfigurado()) {
    return (
      <>
        <PageHeader
          titulo="Reuniões"
          descricao="Todas as transcrições analisadas, com sentimento, interesse, talk ratio e confiabilidade do dado."
          acoes={
            <>
              <BotaoLink href="/reunioes/lote">Importar em lote</BotaoLink>
              <BotaoLink href="/reunioes/nova">Nova reunião</BotaoLink>
            </>
          }
        />
        <SemBanco oQueApareceAqui="Aqui fica a lista das transcrições analisadas, com título, cliente, data, tipo, sentimento, interesse, talk ratio e índice de confiabilidade." />
      </>
    );
  }

  const sb = await supabaseServer();
  const { data, error } = await sb
    .from('meetings')
    .select('id, title, meeting_date, meeting_type, status')
    .order('meeting_date', { ascending: false })
    .limit(100);

  if (error) throw new Error(`Falha ao carregar reuniões: ${error.message}`);

  const reunioes = (data ?? []) as LinhaReuniao[];

  return (
    <>
      <PageHeader
        titulo="Reuniões"
        descricao="Todas as transcrições analisadas, com sentimento, interesse, talk ratio e confiabilidade do dado."
        acoes={
          <>
            <BotaoLink href="/reunioes/lote">Importar em lote</BotaoLink>
            <BotaoLink href="/reunioes/nova">Nova reunião</BotaoLink>
          </>
        }
      />

      {reunioes.length === 0 ? (
        <EmptyState
          icone={<MessagesSquare size={18} />}
          titulo="Nenhuma reunião na base"
          descricao="Cole a transcrição de uma reunião para o motor analisar. A lista mostra título, cliente, data, tipo, sentimento, interesse, talk ratio e índice de confiabilidade, com filtros e busca dentro do texto das transcrições."
          acao={
            <BotaoLink href="/reunioes/nova" variante="primario">
              Analisar uma transcrição
            </BotaoLink>
          }
        />
      ) : (
        <div className="overflow-x-auto vidro rounded-xl">
          <table className="w-full text-[12.5px]">
            <thead className="border-b border-line text-left text-[11.5px] text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-medium">Reunião</th>
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Tipo</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reunioes.map((r) => (
                <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-2.5">
                    <a href={`/reunioes/${r.id}`} className="text-ink hover:text-accent">
                      {r.title}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-ink-dim">
                    {r.meeting_date ? fmtData(r.meeting_date) : 'n/d'}
                  </td>
                  <td className="px-4 py-2.5 text-ink-dim">
                    {ROTULO_TIPO[r.meeting_type as keyof typeof ROTULO_TIPO] ?? r.meeting_type}
                  </td>
                  <td className={`px-4 py-2.5 ${r.status === 'error' ? 'text-risk' : 'text-ink-dim'}`}>
                    {ROTULO_STATUS[r.status] ?? r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
