import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { FaixaRisco, MotivoRisco } from '@/lib/radar';
import { Badge, type Tom } from './ui';

/* ------------------------------------------------------------------ *
 * Peças do radar de churn, usadas no Radar e na página da conta.
 * Renderizadas no servidor, sem estado.
 * ------------------------------------------------------------------ */

export const TOM_FAIXA: Record<FaixaRisco, Tom> = {
  alto: 'risk',
  medio: 'warn',
  baixo: 'health',
  sem_leitura: 'neutro',
};

export const ROTULO_FAIXA: Record<FaixaRisco, string> = {
  alto: 'Risco alto',
  medio: 'Risco médio',
  baixo: 'Risco baixo',
  sem_leitura: 'Sem leitura',
};

const fmtData = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR');

/**
 * Variação do risco desde a leitura anterior. Subir é ruim, então a seta para
 * cima é vermelha — o contrário do que um gráfico de receita faria.
 */
export function Tendencia({ valor }: { valor: number | null }) {
  if (valor == null) return null;
  if (valor === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-ink-faint" title="Igual à leitura anterior">
        <Minus size={11} />0
      </span>
    );
  }
  const subiu = valor > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums ${subiu ? 'text-risk' : 'text-health'}`}
      title={subiu ? 'Risco subiu desde a leitura anterior' : 'Risco caiu desde a leitura anterior'}
    >
      {subiu ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {subiu ? '+' : '−'}
      {Math.abs(valor)}
    </span>
  );
}

/**
 * Um motivo de risco com a fala que o sustenta. A citação é o produto: sem
 * ela o alerta é opinião do sistema, com ela é fato que o CS pode conferir.
 */
export function Motivo({
  motivo,
  vezes,
  compacto = false,
}: {
  motivo: MotivoRisco;
  vezes?: number;
  compacto?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`${compacto ? 'text-[12px]' : 'text-[12.5px]'} font-medium text-ink`}>{motivo.texto}</span>
        {vezes && vezes > 1 ? <Badge tom="neutro">em {vezes} reuniões</Badge> : null}
      </div>
      <blockquote
        className={`mt-1 border-l-2 border-line-strong pl-2.5 font-mono ${compacto ? 'text-[11px]' : 'text-[11.5px]'} italic leading-relaxed text-ink-dim ${compacto ? 'line-clamp-2' : ''}`}
      >
        “{motivo.citacao}”
      </blockquote>
      <p className="mt-1 text-[10.5px] text-ink-faint">
        {motivo.falante ? `${motivo.falante} · ` : ''}
        <Link href={`/reunioes/${motivo.reuniaoId}`} className="underline-offset-2 hover:text-ink hover:underline">
          {motivo.reuniaoTitulo}
        </Link>
        {' · '}
        {fmtData(motivo.data)}
      </p>
    </div>
  );
}
