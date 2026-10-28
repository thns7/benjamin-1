import Link from 'next/link';
import { Bell, Building2, Clock, MessagesSquare, Swords } from 'lucide-react';
import { Badge, BotaoLink, EmptyState, FaixaDeMetricas, Mono, PageHeader, StatTile } from '@/components/ui';
import { tomChurn } from '@/components/cliente-ui';
import { Motivo, ROTULO_FAIXA, Tendencia } from '@/components/radar-ui';
import { supabaseConfigurado } from '@/lib/supabase/server';
import { SemBanco } from '@/components/sem-banco';
import { carregarRadar } from '@/lib/radar-dados';
import { DIAS_SEM_CONTATO, type ContaRadar, type FaixaRisco } from '@/lib/radar';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Radar de churn' };

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const fmtBRL = (n: number | null) => (n == null ? '—' : BRL.format(n));

const DESCRICAO =
  'Quais contas podem cancelar, quanto isso custa e por quê. Ordenado por receita em risco: contrato × risco de churn.';

const FILTROS: { valor: 'todas' | FaixaRisco; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'alto', rotulo: 'Risco alto' },
  { valor: 'medio', rotulo: 'Risco médio' },
  { valor: 'baixo', rotulo: 'Risco baixo' },
  { valor: 'sem_leitura', rotulo: 'Sem leitura' },
];

function Chip({ ativo, href, children }: { ativo: boolean; href: string; children: React.ReactNode }) {
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

/** Uma conta no radar: quem, quanto, quão grave e a fala que explica. */
function LinhaConta({ c }: { c: ContaRadar }) {
  return (
    <li className="grid gap-x-6 gap-y-3 py-4 md:grid-cols-[minmax(150px,200px)_1fr_auto] md:items-start">
      <div className="min-w-0">
        <Link href={`/clientes/${c.id}`} className="text-[13px] font-semibold text-ink hover:underline">
          {c.nome}
        </Link>
        {c.segmento ? <p className="mt-0.5 text-[11px] text-ink-faint">{c.segmento}</p> : null}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {c.alertasAbertos > 0 ? (
            <Badge tom="risk">
              <Bell size={10} />
              {c.alertasAbertos} alerta{c.alertasAbertos > 1 ? 's' : ''}
            </Badge>
          ) : null}
          {c.concorrentes.map((k) => (
            <Badge key={k} tom="warn">
              <Swords size={10} />
              {k}
            </Badge>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        {c.motivo ? (
          <Motivo motivo={c.motivo} compacto />
        ) : (
          <p className="text-[12px] text-ink-faint">
            {c.faixa === 'sem_leitura'
              ? 'Nenhuma leitura de risco ainda: falta reunião analisada ou o motor não conseguiu separar quem falou.'
              : 'Nenhum sinal de risco com citação na última reunião.'}
          </p>
        )}
      </div>

      <div className="flex items-start gap-5 md:flex-col md:items-end md:gap-1.5 md:text-right">
        <div className="flex items-baseline gap-1.5">
          {c.churn == null ? (
            <Badge tom="neutro">{ROTULO_FAIXA[c.faixa]}</Badge>
          ) : (
            <>
              <Mono tom={tomChurn(c.churn)} className="text-[22px] leading-none">
                {c.churn}
              </Mono>
              <Tendencia valor={c.tendencia} />
            </>
          )}
        </div>
        <div className="text-[11px] text-ink-faint">
          <span className="font-mono tabular-nums text-ink-dim">{fmtBRL(c.contrato)}</span>
          {c.contrato == null ? ' sem contrato' : ' contrato'}
        </div>
        {c.diasSemContato != null ? (
          <div
            className={`inline-flex items-center gap-1 text-[11px] ${c.diasSemContato > DIAS_SEM_CONTATO ? 'text-warn' : 'text-ink-faint'}`}
          >
            <Clock size={10} />
            {c.diasSemContato === 0 ? 'contato hoje' : `${c.diasSemContato} dias sem contato`}
          </div>
        ) : null}
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

  return (
    <>
      <PageHeader titulo="Radar de churn" descricao={DESCRICAO} acoes={acoes} />

      <FaixaDeMetricas>
        <StatTile
          rotulo="Receita em risco"
          valor={fmtBRL(resumo.receitaEmRisco)}
          tom={resumo.receitaEmRisco > 0 ? 'risk' : 'neutro'}
          detalhe={
            resumo.emRiscoSemContrato > 0
              ? `Contratos das contas em risco alto. ${resumo.emRiscoSemContrato} sem contrato cadastrado ficaram fora.`
              : 'Soma dos contratos das contas em risco alto.'
          }
        />
        <StatTile
          rotulo="Contas em risco alto"
          valor={String(resumo.contasEmRiscoAlto)}
          tom={resumo.contasEmRiscoAlto > 0 ? 'risk' : 'neutro'}
          detalhe={`de ${contas.length} conta${contas.length > 1 ? 's' : ''} monitorada${contas.length > 1 ? 's' : ''}`}
        />
        <StatTile
          rotulo="Alertas não tratados"
          valor={String(resumo.alertasAbertos)}
          tom={resumo.alertasAbertos > 0 ? 'warn' : 'neutro'}
          detalhe="Abra Alertas para tratar um por um."
        />
        <StatTile
          rotulo={`Sem contato há +${DIAS_SEM_CONTATO} dias`}
          valor={String(resumo.contasSemContato)}
          tom={resumo.contasSemContato > 0 ? 'warn' : 'neutro'}
          detalhe="Conta que não conversa não dá sinal, nem de risco."
        />
      </FaixaDeMetricas>

      <div className="mb-3 mt-8 flex flex-wrap items-center gap-1.5">
        {FILTROS.map((f) => (
          <Chip key={f.valor} ativo={faixa === f.valor} href={f.valor === 'todas' ? '/' : `/?faixa=${f.valor}`}>
            {f.rotulo} ({f.valor === 'todas' ? contas.length : contagem(f.valor)})
          </Chip>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="vidro-sutil rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
          <p className="text-[13px] font-semibold text-ink">Nenhuma conta nesta faixa</p>
          <p className="mt-1 text-[12px] text-ink-dim">
            <Link href="/" className="text-accent hover:underline">
              Ver todas as contas
            </Link>
          </p>
        </div>
      ) : (
        <section className="vidro rounded-xl px-5">
          <ul className="divide-y divide-line">
            {visiveis.map((c) => (
              <LinhaConta key={c.id} c={c} />
            ))}
          </ul>
        </section>
      )}

      <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-ink-faint">
        <Building2 size={11} />
        Risco de churn da reunião analisada mais recente. A seta compara com a leitura anterior.
      </p>
    </>
  );
}
