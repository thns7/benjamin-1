import Link from 'next/link';
import { Bell, MessagesSquare, Swords } from 'lucide-react';
import { Badge, BotaoLink, EmptyState, PageHeader } from '@/components/ui';
import { Motivo, RadarPolar, ROTULO_FAIXA, Tendencia } from '@/components/radar-ui';
import { supabaseConfigurado } from '@/lib/supabase/server';
import { SemBanco } from '@/components/sem-banco';
import { carregarRadar } from '@/lib/radar-dados';
import { DIAS_SEM_CONTATO, posicionarNoPolar, type ContaRadar, type FaixaRisco } from '@/lib/radar';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Radar de churn' };

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const BRL_CURTO = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumSignificantDigits: 3,
});

const DESCRICAO = 'Quais contas podem cancelar, quanto isso custa e a fala do cliente que mostra por quê.';

const FILTROS: { valor: 'todas' | FaixaRisco; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'alto', rotulo: 'Risco alto' },
  { valor: 'medio', rotulo: 'Risco médio' },
  { valor: 'baixo', rotulo: 'Risco baixo' },
  { valor: 'sem_leitura', rotulo: 'Sem leitura' },
];

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

function Chip({ ativo, href, children }: { ativo: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
        ativo ? 'bg-accent-soft text-accent' : 'text-ink-dim hover:bg-surface-3 hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}

const COR_FAIXA: Record<FaixaRisco, string> = {
  alto: 'text-risk',
  medio: 'text-warn',
  baixo: 'text-health',
  sem_leitura: 'text-ink-faint',
};

/** Uma conta: nome, contrato e a fala do cliente; o risco à direita. */
function LinhaConta({ c }: { c: ContaRadar }) {
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-6 px-5 py-4 transition-colors hover:bg-surface-2/60">
      <div className="min-w-0">
        <Link href={`/clientes/${c.id}`} className="text-[15px] font-semibold tracking-[-0.01em] text-ink hover:underline">
          {c.nome}
        </Link>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-faint">
          {c.contrato == null ? 'Sem contrato cadastrado' : `Contrato de ${BRL.format(c.contrato)}`}
          {c.diasSemContato != null ? (
            <>
              {', '}
              <span className={c.diasSemContato > DIAS_SEM_CONTATO ? 'font-medium text-warn' : ''}>
                {c.diasSemContato === 0 ? 'conversou hoje' : `${plural(c.diasSemContato, 'dia', 'dias')} sem conversa`}
              </span>
            </>
          ) : null}
        </p>
        {c.alertasAbertos > 0 || c.concorrentes.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.alertasAbertos > 0 ? (
              <Badge tom="risk">
                <Bell size={10} />
                {plural(c.alertasAbertos, 'alerta', 'alertas')}
              </Badge>
            ) : null}
            {c.concorrentes.map((k) => (
              <Badge key={k} tom="neutro">
                <Swords size={10} />
                {k}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="mt-3">
          {c.motivo ? (
            <Motivo motivo={c.motivo} compacto />
          ) : (
            <p className="text-[12.5px] leading-relaxed text-ink-faint">
              {c.faixa === 'sem_leitura'
                ? 'Ainda sem leitura de risco: falta uma reunião analisada em que dê para saber quem falou.'
                : 'Nenhuma fala de risco na última reunião.'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        {c.churn == null ? (
          <span className="text-[12px] text-ink-faint">{ROTULO_FAIXA[c.faixa]}</span>
        ) : (
          <>
            <span className={`text-[34px] font-semibold leading-none tracking-[-0.04em] tabular-nums ${COR_FAIXA[c.faixa]}`}>
              {c.churn}
            </span>
            <Tendencia valor={c.tendencia} faixa={c.faixa} />
          </>
        )}
      </div>
    </li>
  );
}

export default async function RadarPage({ searchParams }: { searchParams: Promise<{ faixa?: string }> }) {
  if (!supabaseConfigurado()) {
    return (
      <>
        <PageHeader titulo="Radar de churn" descricao={DESCRICAO} />
        <SemBanco oQueApareceAqui="Aqui fica o radar: as contas que podem cancelar, ordenadas pela receita em risco, cada uma com a fala do cliente que gerou o alerta." />
      </>
    );
  }

  const { faixa = 'todas' } = await searchParams;
  const { contas, resumo } = await carregarRadar();

  const acoes = (
    <BotaoLink href="/reunioes/nova" variante="primario">
      Analisar reunião
    </BotaoLink>
  );

  if (contas.length === 0) {
    return (
      <>
        <PageHeader titulo="Radar de churn" descricao={DESCRICAO} acoes={acoes} />
        <EmptyState
          icone={<MessagesSquare size={18} />}
          titulo="Nenhuma conta ainda"
          descricao="O radar se forma a partir das reuniões com seus clientes. Analise a primeira transcrição informando o cliente, e a conta aparece aqui com o risco de churn e a fala que o explica."
          acao={acoes}
        />
      </>
    );
  }

  const contagem = (f: FaixaRisco) => contas.filter((c) => c.faixa === f).length;
  const visiveis = faixa === 'todas' ? contas : contas.filter((c) => c.faixa === faixa);

  // A abertura é uma frase, não uma fileira de indicadores: quem abre o radar
  // quer saber se hoje é um dia tranquilo ou não.
  const manchete =
    resumo.contasEmRiscoAlto === 0
      ? 'Nenhuma conta em risco alto agora.'
      : resumo.receitaEmRisco > 0
        ? `${BRL_CURTO.format(resumo.receitaEmRisco)} em contratos podem cancelar.`
        : `${plural(resumo.contasEmRiscoAlto, 'conta pode', 'contas podem')} cancelar.`;

  const contexto: React.ReactNode[] = [];
  if (resumo.contasEmRiscoAlto > 0) {
    contexto.push(
      <span key="risco">
        {resumo.contasEmRiscoAlto === 1 ? 'É ' : 'São '}
        <strong className="font-semibold text-ink">{plural(resumo.contasEmRiscoAlto, 'conta', 'contas')} em risco alto</strong>
        {resumo.emRiscoSemContrato > 0
          ? `, ${resumo.emRiscoSemContrato} delas sem contrato cadastrado e fora da soma`
          : ''}
        .
      </span>,
    );
  }
  if (resumo.alertasAbertos > 0) {
    contexto.push(
      <span key="alertas">
        {' '}
        <Link href="/alertas" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          {plural(resumo.alertasAbertos, 'alerta espera', 'alertas esperam')} tratamento
        </Link>
        .
      </span>,
    );
  }
  if (resumo.contasSemContato > 0) {
    contexto.push(
      <span key="contato">
        {' '}
        {plural(resumo.contasSemContato, 'conta está', 'contas estão')} há mais de {DIAS_SEM_CONTATO} dias sem conversa, e conta
        que não conversa não dá sinal.
      </span>,
    );
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-faint">Radar de churn, hoje</p>
        {acoes}
      </div>

      {/* A abertura é uma frase: quem abre o radar quer saber se hoje é um dia tranquilo. */}
      <h1 className="max-w-[24ch] text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[46px]">
        {resumo.contasEmRiscoAlto > 0 && resumo.receitaEmRisco > 0 ? (
          <>
            <span className="text-risk">{BRL_CURTO.format(resumo.receitaEmRisco)}</span> em contratos podem cancelar.
          </>
        ) : (
          manchete
        )}
      </h1>
      {contexto.length > 0 ? <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-ink-dim">{contexto}</p> : null}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(320px,440px)_1fr]">
        <RadarPolar
          pontos={posicionarNoPolar(contas)}
          semLeitura={resumo.contasSemLeitura}
          className="lg:sticky lg:top-8"
        />

        <section className="vidro overflow-hidden rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Contas por receita em risco</h2>
              <p className="mt-0.5 text-[12.5px] text-ink-faint">Contrato vezes risco: a maior perda possível vem primeiro.</p>
            </div>
            <nav aria-label="Filtrar por faixa de risco" className="flex flex-wrap gap-1">
              {FILTROS.map((f) => (
                <Chip key={f.valor} ativo={faixa === f.valor} href={f.valor === 'todas' ? '/' : `/?faixa=${f.valor}`}>
                  {f.rotulo} {f.valor === 'todas' ? contas.length : contagem(f.valor)}
                </Chip>
              ))}
            </nav>
          </div>

          {visiveis.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-ink-dim">
              Nenhuma conta nesta faixa.{' '}
              <Link href="/" className="font-medium text-accent underline underline-offset-2">
                Ver todas
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {visiveis.map((c) => (
                <LinhaConta key={c.id} c={c} />
              ))}
            </ul>
          )}
          <p className="border-t border-line px-5 py-3 text-[12px] text-ink-faint">
            O número é o risco de churn da reunião analisada mais recente; a seta compara com a anterior.
          </p>
        </section>
      </div>
    </>
  );
}
