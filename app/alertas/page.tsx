import Link from 'next/link';
import { Bell, Building2, MessagesSquare } from 'lucide-react';
import { Badge, BotaoLink, EmptyState, Mono, PageHeader, type Tom } from '@/components/ui';
import { supabaseConfigurado, supabaseServer } from '@/lib/supabase/server';
import { SemBanco } from '@/components/sem-banco';
import type { AlertRow, CustomerRow } from '@/lib/supabase/database.types';
import { BotaoTratar } from './tratar';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Alertas' };

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const TOM_SEVERIDADE: Record<string, Tom> = { alta: 'risk', media: 'warn', baixa: 'neutro' };

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
      className={`rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
        ativo
          ? 'border-accent/40 bg-accent-soft text-accent'
          : 'border-line bg-surface-2 text-ink-dim hover:border-line-strong hover:text-ink'
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
                Não tratados ({abertos.length})
              </Chip>
              <Chip ativo={verTratados} href={url({ estado: 'tratados' })}>
                Tratados ({tratados.length})
              </Chip>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                Severidade
              </span>
              {FILTROS_SEVERIDADE.map((s) => (
                <Chip key={s} ativo={sev === s} href={url({ sev: s })}>
                  {s === 'todas' ? `todas (${daAba.length})` : `${s} (${contagem[s]})`}
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
            <ul className="space-y-2">
              {alertas.map((a) => {
                const cliente = a.customer_id ? nomeCliente.get(a.customer_id) : null;
                const tom = TOM_SEVERIDADE[a.severity] ?? 'neutro';
                return (
                  <li
                    key={a.id}
                    className={`vidro rounded-xl p-4 ${a.severity === 'alta' && !a.read ? '!border-risk/40' : ''} ${
                      a.read ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tom={tom}>{a.severity}</Badge>
                      <Badge tom="neutro">{TIPO[a.kind] ?? a.kind}</Badge>
                      <span className="text-[12.5px] font-semibold text-ink">{a.title}</span>
                      <span className="ml-auto text-[10.5px] text-ink-faint">
                        {new Date(a.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">{a.message}</p>

                    {a.evidence ? (
                      <p className="mt-2 border-l-2 border-line pl-2.5 font-mono text-[11.5px] italic leading-relaxed text-ink-faint">
                        “{a.evidence}”
                      </p>
                    ) : null}

                    <div className="mt-2.5 rounded-md border border-accent/25 bg-accent-soft/25 px-3 py-2">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-accent">
                        Ação sugerida
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-ink-dim">
                        {ACAO_SUGERIDA[a.kind] ?? 'Revise a evidência e registre o encaminhamento na conta.'}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px]">
                      <BotaoTratar alertaId={a.id} tratado={a.read} />
                      {cliente && a.customer_id ? (
                        <Link
                          href={`/clientes/${a.customer_id}`}
                          className="inline-flex items-center gap-1 text-ink-dim hover:text-accent"
                        >
                          <Building2 size={11} />
                          {cliente}
                        </Link>
                      ) : null}
                      {a.meeting_id ? (
                        <Link
                          href={`/reunioes/${a.meeting_id}`}
                          className="inline-flex items-center gap-1 text-ink-dim hover:text-accent"
                        >
                          <MessagesSquare size={11} />
                          abrir briefing
                        </Link>
                      ) : null}
                      {a.value_at_stake ? (
                        <span className="ml-auto inline-flex items-center gap-1">
                          <span className="text-ink-faint">valor em jogo</span>
                          <Mono tom={a.kind === 'oportunidade' ? 'health' : 'risk'}>
                            {BRL.format(a.value_at_stake)}
                          </Mono>
                        </span>
                      ) : null}
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
