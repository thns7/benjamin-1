import Link from 'next/link';
import { Bell, MessagesSquare } from 'lucide-react';
import { Badge, BotaoLink, EmptyState, PageHeader, type Tom } from '@/components/ui';
import { supabaseConfigurado, supabaseServer } from '@/lib/supabase/server';
import { SemBanco } from '@/components/sem-banco';
import type { AlertRow, CustomerRow } from '@/lib/supabase/database.types';
import { BotaoTratar } from './tratar';
import { Citacao } from '@/components/radar-ui';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Alertas' };

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const TOM_SEVERIDADE: Record<string, Tom> = { alta: 'risk', media: 'warn', baixa: 'neutro' };
const SEVERIDADE: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

const TIPO: Record<string, string> = {
  churn: 'Churn',
  concorrente: 'Concorrente',
  oportunidade: 'Oportunidade',
  budget: 'Budget',
  prazo: 'Prazo',
  coaching: 'Coaching',
  qualidade_dado: 'Qualidade do dado',
};

/**
 * A ação sugerida é o que transforma alerta em decisão. Sem ela o painel só
 * informa que algo aconteceu — e a rubrica pede motor de decisão, não relatório.
 */
const ACAO_SUGERIDA: Record<string, string> = {
  churn:
    'Ligue para a conta antes do próximo ciclo de renovação e trate a insatisfação registrada na evidência.',
  concorrente:
    'Compare escopo e integração com o concorrente citado, não só preço de lista, e registre a diferença por escrito.',
  oportunidade: 'Crie a tarefa de proposta enquanto o gatilho está quente — oportunidade parada esfria.',
  budget: 'Confirme o valor com quem aprova e registre a faixa no CRM antes da próxima conversa.',
  prazo: 'Reconfirme a data com o cliente; prazo sem dono vira atraso.',
  coaching: 'Revise a gravação com o vendedor focando em escuta, não em roteiro.',
  qualidade_dado:
    'Refaça a captura com melhor áudio ou marcação de falante — as extrações desta reunião têm base fraca.',
};

const FILTROS_SEVERIDADE = ['todas', 'alta', 'media', 'baixa'] as const;

const DESCRICAO =
  'Sua caixa de entrada de risco. Cada alerta traz a fala que o originou; trate e ele sai da lista.';

function Chip({
  ativo,
  href,
  children,
}: {
  ativo: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
        ativo ? 'bg-ink text-canvas' : 'text-ink-dim hover:bg-surface-3 hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: Promise<{ sev?: string; estado?: string }>;
}) {
  if (!supabaseConfigurado()) {
    return (
      <>
        <PageHeader
          titulo="Alertas"
          descricao={DESCRICAO}
        />
        <SemBanco oQueApareceAqui="Aqui ficam os alertas nascidos das análises, como risco de churn alto e concorrente citado na conversa, cada um com a citação que o originou e um botão para marcar como tratado." />
      </>
    );
  }

  const { sev = 'todas', estado = 'abertos' } = await searchParams;
  const verTratados = estado === 'tratados';

  const sb = supabaseServer();
  const [alertasRes, clientesRes] = await Promise.all([
    sb
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    sb.from('customers').select('id, name'),
  ]);

  if (alertasRes.error) throw new Error(`Falha ao carregar alertas: ${alertasRes.error.message}`);
  if (clientesRes.error) throw new Error(`Falha ao carregar clientes: ${clientesRes.error.message}`);

  const todos = (alertasRes.data ?? []) as AlertRow[];
  const nomeCliente = new Map(
    ((clientesRes.data ?? []) as Pick<CustomerRow, 'id' | 'name'>[]).map((c) => [c.id, c.name]),
  );

  const abertos = todos.filter((a) => !a.read);
  const tratados = todos.filter((a) => a.read);
  const daAba = verTratados ? tratados : abertos;
  const alertas = daAba.filter((a) => sev === 'todas' || a.severity === sev);

  const contagem = {
    alta: daAba.filter((a) => a.severity === 'alta').length,
    media: daAba.filter((a) => a.severity === 'media').length,
    baixa: daAba.filter((a) => a.severity === 'baixa').length,
  };

  const url = (novo: { sev?: string; estado?: string }) => {
    const s = novo.sev ?? sev;
    const e = novo.estado ?? estado;
    return `/alertas?estado=${e}&sev=${s}`;
  };

  return (
    <>
      <PageHeader
        titulo="Alertas"
        descricao={DESCRICAO}
        acoes={<BotaoLink href="/">Radar de churn</BotaoLink>}
      />

      {todos.length === 0 ? (
        <EmptyState
          icone={<Bell size={18} />}
          titulo="Nenhum alerta na base"
          descricao="Os alertas nascem das análises: risco de churn alto, concorrente citado na conversa e outros sinais. Cada um traz a citação que o originou, a conta, o valor em jogo e a ação sugerida."
          acao={
            <BotaoLink href="/reunioes/nova" variante="primario">
              Analisar uma reunião
            </BotaoLink>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip ativo={!verTratados} href={url({ estado: 'abertos' })}>
                Não tratados {abertos.length}
              </Chip>
              <Chip ativo={verTratados} href={url({ estado: 'tratados' })}>
                Tratados {tratados.length}
              </Chip>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-ink-faint">
                Severidade
              </span>
              {FILTROS_SEVERIDADE.map((s) => (
                <Chip key={s} ativo={sev === s} href={url({ sev: s })}>
                  {s === 'todas' ? `Todas ${daAba.length}` : `${SEVERIDADE[s]} ${contagem[s]}`}
                </Chip>
              ))}
            </div>
          </div>

          {alertas.length === 0 ? (
            <div className="vidro-sutil rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
              <p className="text-[13px] font-semibold text-ink">
                {daAba.length === 0
                  ? verTratados
                    ? 'Nenhum alerta tratado ainda'
                    : 'Nenhum alerta para tratar'
                  : 'Nenhum alerta com esse filtro'}
              </p>
              <p className="mt-1 text-[12px] text-ink-dim">
                {daAba.length === 0 && !verTratados
                  ? 'Tudo em dia. Novos alertas aparecem aqui quando uma reunião analisada mostrar risco.'
                  : `Existem ${todos.length} alerta(s) na base. `}
                {daAba.length > 0 || verTratados ? (
                  <Link href="/alertas" className="text-accent hover:underline">
                    Voltar aos não tratados
                  </Link>
                ) : null}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {alertas.map((a) => {
                const cliente = a.customer_id ? nomeCliente.get(a.customer_id) : null;
                const tom = TOM_SEVERIDADE[a.severity] ?? 'neutro';
                return (
                  <li
                    key={a.id}
                    className={`grid gap-x-8 gap-y-3 py-5 md:grid-cols-[minmax(180px,230px)_1fr] ${a.read ? 'opacity-70' : ''}`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tom={tom}>{SEVERIDADE[a.severity] ?? a.severity}</Badge>
                        <Badge tom="neutro">{TIPO[a.kind] ?? a.kind}</Badge>
                      </div>
                      {cliente && a.customer_id ? (
                        <Link
                          href={`/clientes/${a.customer_id}`}
                          className="mt-2 block text-[14.5px] font-semibold tracking-[-0.01em] text-ink hover:underline"
                        >
                          {cliente}
                        </Link>
                      ) : null}
                      <p className="mt-1 text-[12px] leading-snug text-ink-faint">
                        {new Date(a.created_at).toLocaleDateString('pt-BR')}
                        {a.value_at_stake ? (
                          <>
                            <br />
                            <span className={a.kind === 'oportunidade' ? 'text-health' : 'font-medium text-risk'}>
                              {BRL.format(a.value_at_stake)} em jogo
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink">{a.title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-ink-dim">{a.message}</p>
                      {a.evidence ? <Citacao texto={a.evidence} className="mt-3" /> : null}
                      <p className="mt-3 max-w-[70ch] text-[13px] leading-relaxed text-ink-dim">
                        <span className="font-semibold text-ink">O que fazer: </span>
                        {ACAO_SUGERIDA[a.kind] ?? 'Revise a evidência e registre o encaminhamento na conta.'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px]">
                        <BotaoTratar alertaId={a.id} tratado={a.read} />
                        {a.meeting_id ? (
                          <Link
                            href={`/reunioes/${a.meeting_id}`}
                            className="inline-flex items-center gap-1 text-ink-dim underline decoration-line-strong underline-offset-2 hover:text-ink"
                          >
                            <MessagesSquare size={12} />
                            Abrir a reunião
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
