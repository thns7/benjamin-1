import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import {
  ANEL_ALTO,
  ANEL_MEDIO,
  type FaixaRisco,
  type MotivoRisco,
  type PontoPolar,
} from '@/lib/radar';
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
 * cima é âmbar ou vermelha (conforme a faixa em que o risco chegou) — o
 * contrário do que um gráfico de receita faria.
 */
export function Tendencia({ valor, faixa }: { valor: number | null; faixa?: FaixaRisco }) {
  if (valor == null) return null;
  if (valor === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11.5px] font-medium tabular-nums text-ink-faint" title="Igual à leitura anterior">
        <Minus size={11} />0
      </span>
    );
  }
  const subiu = valor > 0;
  // A cor segue onde o risco chegou: subir para "médio" é atenção, não alarme.
  const cor = !subiu ? 'text-health' : faixa === 'medio' || faixa === 'baixo' ? 'text-warn' : 'text-risk';
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11.5px] font-medium tabular-nums ${cor}`}
      title={subiu ? 'Risco subiu desde a leitura anterior' : 'Risco caiu desde a leitura anterior'}
    >
      {subiu ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {subiu ? '+' : '−'}
      {Math.abs(valor)}
    </span>
  );
}

/**
 * Aspas do Benjamin: a barriga de baixo do B, a mesma forma da marca. A fala
 * do cliente é o que o produto existe para mostrar, então ela ganha o desenho
 * da marca em vez de aspas tipográficas genéricas.
 */
function Aspas({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="12 15 16 14" aria-hidden className={`shrink-0 fill-current ${className}`}>
      <path d="M13 25C13 20.2 16.8 16 21.5 16A6 6 0 0 1 21.5 28H14Q13 28 13 27Z" />
    </svg>
  );
}

/**
 * A fala literal do cliente. Sempre na serifa Literata, em pé (a voz humana da
 * interface), e sempre com quem disse e onde.
 */
export function Citacao({
  texto,
  tamanho = 'normal',
  tom = 'neutro',
  className = '',
}: {
  texto: string;
  tamanho?: 'pequeno' | 'normal' | 'grande';
  tom?: Tom;
  className?: string;
}) {
  const corpo = { pequeno: 'text-[14.5px]', normal: 'text-[16px]', grande: 'text-[20px]' }[tamanho];
  const marca = { pequeno: 'mt-[5px] size-2.5', normal: 'mt-[6px] size-3', grande: 'mt-[8px] size-3.5' }[tamanho];
  const cor = tom === 'risk' ? 'text-risk' : 'text-ink-faint';
  return (
    <blockquote className={`flex gap-2 ${className}`}>
      <Aspas className={`${marca} ${cor}`} />
      <p className={`font-fala leading-[1.45] text-ink ${corpo}`}>{texto}</p>
    </blockquote>
  );
}

/** Quem disse, em qual reunião e quando — sem separador decorativo. */
export function Origem({ motivo }: { motivo: MotivoRisco }) {
  return (
    <p className="text-[11.5px] text-ink-faint">
      {motivo.falante ? <span className="text-ink-dim">{motivo.falante}</span> : null}
      {motivo.falante ? ', em ' : 'Em '}
      <Link href={`/reunioes/${motivo.reuniaoId}`} className="underline decoration-line-strong underline-offset-2 hover:text-ink">
        {motivo.reuniaoTitulo}
      </Link>
      , {fmtData(motivo.data)}
    </p>
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
      <Citacao texto={motivo.citacao} tamanho={compacto ? 'pequeno' : 'normal'} />
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-[18px]">
        <span className="text-[12px] font-medium text-ink-dim">{motivo.texto}</span>
        {vezes && vezes > 1 ? <Badge tom="neutro">em {vezes} reuniões</Badge> : null}
      </div>
      <div className="mt-0.5 pl-[18px]">
        <Origem motivo={motivo} />
      </div>
    </div>
  );
}

const COR_PONTO: Record<FaixaRisco, string> = {
  alto: 'var(--risk)',
  medio: 'var(--warn)',
  baixo: 'var(--health)',
  sem_leitura: 'var(--ink-faint)',
};

/**
 * Radar circular: a peça central do Benjamin. Cada conta é um ponto; quanto
 * mais perto do centro, maior o risco de churn. Os anéis ficam nos cortes de
 * faixa (67 e 34), o tamanho do ponto é o contrato e uma varredura ciano gira
 * sem parar (parada para quem pede menos movimento).
 *
 * `comLinks` liga cada ponto à página da conta; a landing usa o mesmo
 * desenho com dados fictícios, sem link.
 */
export function RadarPolar({
  pontos,
  semLeitura = 0,
  comLinks = true,
  className = '',
}: {
  pontos: PontoPolar[];
  semLeitura?: number;
  comLinks?: boolean;
  className?: string;
}) {
  const diametro = (p: PontoPolar) => (p.tamanho == null ? 9 : Math.round(8 + p.tamanho * 18));
  const anel = (fracao: number) => ({ width: `${fracao * 100}%`, height: `${fracao * 100}%` });
  const posicao = (p: PontoPolar) => ({ left: `${p.x}%`, top: `${p.y}%` }) as const;

  return (
    <figure aria-label="Radar de churn: contas mais perto do centro têm mais risco" className={className}>
      {/* Três camadas: o disco (recortado no círculo), os pontos e, por cima de
          todos, os nomes. Nome nunca fica embaixo de ponto, e um nome perto da
          borda não é cortado pelo círculo. */}
      <div className="relative aspect-square w-full select-none">
        <div className="radar-polar absolute inset-0 overflow-hidden rounded-full border border-line" aria-hidden>
          <div className="radar-anel" style={anel(0.94)} />
          <div className="radar-anel radar-anel-medio" style={anel(ANEL_MEDIO)} />
          <div className="radar-anel radar-anel-alto" style={anel(ANEL_ALTO)} />
          <div className="absolute inset-x-[3%] top-1/2 h-px bg-line" />
          <div className="absolute inset-y-[3%] left-1/2 w-px bg-line" />
          <div className="radar-varredura" />
        </div>

        {pontos.map((p) => {
          const d = diametro(p);
          const ponto = (
            <span
              className={`block rounded-full ${p.tamanho == null ? 'border-2' : 'ring-2 ring-surface'}`}
              style={{
                width: d,
                height: d,
                background: p.tamanho == null ? 'transparent' : COR_PONTO[p.faixa],
                borderColor: COR_PONTO[p.faixa],
              }}
            />
          );
          return comLinks ? (
            <Link
              key={p.id}
              href={`/clientes/${p.id}`}
              title={`${p.nome}: risco ${p.risco}`}
              aria-label={`${p.nome}: risco ${p.risco}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-125"
              style={posicao(p)}
            >
              {ponto}
            </Link>
          ) : (
            <span key={p.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={posicao(p)}>
              {ponto}
            </span>
          );
        })}

        {pontos
          .filter((p) => p.rotulado)
          .map((p) => {
            // O nome vai para dentro do disco: à direita do ponto, salvo perto
            // da borda direita. Assim ele não invade a margem da página.
            const aDireita = p.x < 68;
            const folga = diametro(p) / 2 + 6;
            return (
              <span
                key={`nome-${p.id}`}
                aria-hidden
                className="pointer-events-none absolute z-20 hidden -translate-y-1/2 whitespace-nowrap rounded-sm bg-surface px-1.5 py-0.5 text-[12px] font-semibold text-ink sm:block"
                style={
                  aDireita
                    ? { left: `calc(${p.x}% + ${folga}px)`, top: `${p.y}%` }
                    : { right: `calc(${100 - p.x}% + ${folga}px)`, top: `${p.y}%` }
                }
              >
                {p.nome} <span className="tabular-nums" style={{ color: COR_PONTO[p.faixa] }}>{p.risco}</span>
              </span>
            );
          })}
      </div>
      <figcaption className="mt-3">
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] font-medium">
          <span className="inline-flex items-center gap-1.5 text-risk"><span className="size-2 rounded-full bg-risk" />risco alto, no centro</span>
          <span className="inline-flex items-center gap-1.5 text-warn"><span className="size-2 rounded-full bg-warn" />atenção</span>
          <span className="inline-flex items-center gap-1.5 text-health"><span className="size-2 rounded-full bg-health" />saudável, na borda</span>
        </span>
        <span className="mt-1.5 block text-[12.5px] leading-relaxed text-ink-faint">
          O tamanho do ponto é o contrato; ponto vazado é conta sem contrato cadastrado.
          {semLeitura > 0 ? ` ${semLeitura} conta${semLeitura > 1 ? 's' : ''} sem leitura de risco não aparece${semLeitura > 1 ? 'm' : ''} no radar.` : ''}
        </span>
      </figcaption>
    </figure>
  );
}
