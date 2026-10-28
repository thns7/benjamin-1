import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { CORTE_ALTO, CORTE_MEDIO, type FaixaRisco, type MotivoRisco, type PontoMapa } from '@/lib/radar';
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
      <span className="inline-flex items-center gap-0.5 text-[11.5px] font-medium tabular-nums text-ink-faint" title="Igual à leitura anterior">
        <Minus size={11} />0
      </span>
    );
  }
  const subiu = valor > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11.5px] font-medium tabular-nums ${subiu ? 'text-risk' : 'text-health'}`}
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
 * A fala literal do cliente. Sempre em Newsreader itálico — a voz humana da
 * interface — e sempre com quem disse e onde.
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
  const corpo = { pequeno: 'text-[15px]', normal: 'text-[16.5px]', grande: 'text-[21px]' }[tamanho];
  const marca = { pequeno: 'mt-[5px] size-2.5', normal: 'mt-[6px] size-3', grande: 'mt-[8px] size-3.5' }[tamanho];
  const cor = tom === 'risk' ? 'text-risk' : 'text-ink-faint';
  return (
    <blockquote className={`flex gap-2 ${className}`}>
      <Aspas className={`${marca} ${cor}`} />
      <p className={`font-fala italic leading-[1.35] tracking-[-0.005em] text-ink ${corpo}`}>{texto}</p>
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

/**
 * Mapa de risco: a carteira inteira numa régua de 0 a 100. Cada ponto é uma
 * conta, posta no próprio risco de churn; a área do ponto é o contrato. A
 * zona de risco alto é a única com cor de fundo — é para lá que o olho vai.
 *
 * HTML posicionado em vez de SVG: os pontos ficam em porcentagem da largura e
 * o texto não encolhe junto no celular.
 */
export function MapaDeRisco({ pontos, semLeitura }: { pontos: PontoMapa[]; semLeitura: number }) {
  const ALTURA_FAIXA = 30;
  const faixas = Math.max(1, ...pontos.map((p) => p.faixaVertical + 1));
  const altura = faixas * ALTURA_FAIXA + 24;
  const diametro = (p: PontoMapa) => (p.tamanho == null ? 9 : Math.round(10 + p.tamanho * 18));
  const cor: Record<FaixaRisco, string> = {
    alto: 'bg-risk',
    medio: 'bg-ink',
    baixo: 'bg-ink-faint',
    sem_leitura: 'bg-ink-faint',
  };

  return (
    <figure aria-label="Mapa de risco das contas" className="select-none">
      <div className="relative" style={{ height: altura }}>
        {/* Zonas: só a de risco alto tem fundo. */}
        <div className="absolute inset-y-0 rounded-r-lg bg-risk-soft" style={{ left: `${CORTE_ALTO}%`, right: 0 }} />
        <div className="absolute inset-y-0 border-l border-dashed border-line-strong" style={{ left: `${CORTE_MEDIO}%` }} />
        <div className="absolute bottom-0 left-0 right-0 border-t border-ink/70" />

        {pontos.map((p) => {
          const d = diametro(p);
          const aDireita = p.x < 78;
          return (
            <Link
              key={p.id}
              href={`/clientes/${p.id}`}
              title={`${p.nome}: risco ${p.x}`}
              className="group absolute flex items-center"
              style={{
                left: `${p.x}%`,
                bottom: 12 + p.faixaVertical * ALTURA_FAIXA,
                transform: 'translate(-50%, 50%)',
              }}
            >
              <span
                className={`block rounded-full ring-2 ring-surface transition-transform group-hover:scale-110 ${
                  p.tamanho == null ? 'border-2 border-current bg-transparent text-ink-faint' : cor[p.faixa]
                }`}
                style={{ width: d, height: d }}
              />
              {p.rotulado ? (
                <span
                  className={`absolute hidden whitespace-nowrap text-[12px] font-medium sm:block ${p.faixa === 'alto' ? 'text-risk' : 'text-ink'} ${
                    aDireita ? 'left-full ml-2' : 'right-full mr-2'
                  }`}
                >
                  {p.nome}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
      <figcaption className="relative mt-2 h-4 text-[11.5px] text-ink-faint">
        <span className="absolute left-0">risco baixo</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${(CORTE_MEDIO + CORTE_ALTO) / 2}%` }}>
          médio
        </span>
        <span className="absolute right-0 font-medium text-risk">alto</span>
      </figcaption>
      <p className="mt-4 text-[12px] text-ink-faint">
        Cada ponto é uma conta; o tamanho é o contrato. Ponto vazado: sem contrato cadastrado.
        {semLeitura > 0 ? ` ${semLeitura} conta${semLeitura > 1 ? 's' : ''} sem leitura de risco ficou fora do mapa.` : ''}
      </p>
    </figure>
  );
}
