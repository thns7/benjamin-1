import { Check, Mic, MonitorUp } from 'lucide-react';
import { Citacao, RadarPolar } from '@/components/radar-ui';
import { faixaRisco, posicionarNoPolar, type ContaRadar } from '@/lib/radar';

/*
 * Peças visuais da landing. Todas são ilustrações com dados fictícios e dizem
 * isso na tela: a landing não inventa cliente, número de uso nem depoimento.
 * Sem JavaScript no navegador: as animações são CSS (landing.css).
 */

/* ------------------------------------------------------------------ *
 * Topo: o radar com uma carteira de exemplo
 * ------------------------------------------------------------------ */

/** Carteira fictícia: poucas contas em risco, muitas saudáveis, como na vida real. */
function carteiraDeExemplo(): ContaRadar[] {
  const nomeadas: [string, number, number | null][] = [
    ['Logística Ventura', 81, 240_000],
    ['Clínica Aurora', 88, 36_000],
    ['Ótica Lumen', 72, null],
    ['Grupo Tavares', 58, 510_000],
    ['Escola Horizonte', 18, 48_000],
  ];
  // Gerador determinístico: o mesmo desenho no servidor e em todo carregamento.
  let semente = 42;
  const aleatorio = () => {
    semente = (semente * 16807) % 2147483647;
    return (semente - 1) / 2147483646;
  };
  const anonimas: [string, number, number][] = Array.from({ length: 22 }, (_, i) => {
    const sorte = aleatorio();
    const risco = sorte < 0.6 ? 5 + aleatorio() * 28 : sorte < 0.9 ? 36 + aleatorio() * 28 : 68 + aleatorio() * 10;
    return [`conta-${i}`, Math.round(risco), [20, 40, 60, 90, 150, 300][Math.floor(aleatorio() * 6)]! * 1000];
  });
  return [...nomeadas, ...anonimas].map(([nome, churn, contrato]) => ({
    id: nome,
    // Só as nomeadas ganham rótulo: o resto é o fundo da carteira.
    nome: nome.startsWith('conta-') ? '' : nome,
    segmento: null,
    contrato,
    churn,
    tendencia: null,
    faixa: faixaRisco(churn),
    prioridade: contrato == null ? null : (contrato * churn) / 100,
    diasSemContato: null,
    motivo: null,
    concorrentes: [],
    alertasAbertos: 0,
  }));
}

export function RadarDeExemplo({ className = '' }: { className?: string }) {
  const pontos = posicionarNoPolar(carteiraDeExemplo(), 9).map((p) => ({ ...p, rotulado: p.rotulado && p.nome !== '' }));
  return <RadarPolar pontos={pontos} comLinks={false} className={className} />;
}

/** O cartão que flutua sobre o radar: a fala que pôs a conta em risco. */
export function CartaoFala({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--risco)]/35 bg-surface/90 p-4 shadow-lift backdrop-blur-md sm:p-5 ${className}`}
    >
      <Citacao texto="a diretoria pediu para a gente olhar outras opções antes de renovar" tom="risk" />
      <span className="mt-3 inline-flex rounded-full bg-[var(--risco-suave)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--risco)]">
        Avaliando trocar de fornecedor
      </span>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-[12px] text-ink-faint">Logística Ventura, R$ 240 mil</p>
        <p className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-[var(--risco)] tabular-nums">81</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Faixa de falas
 * ------------------------------------------------------------------ */

const FALAS: { texto: string; nivel: 'risco' | 'atencao' | 'saude'; sinal: string }[] = [
  { texto: 'a diretoria pediu para olhar outras opções', nivel: 'risco', sinal: 'Avaliando trocar' },
  { texto: 'o time voltou para a planilha', nivel: 'atencao', sinal: 'Baixa adoção' },
  { texto: 'a gente quer levar isso para a filial do sul', nivel: 'saude', sinal: 'Expansão' },
  { texto: 'o Marcos saiu e quem assume é o financeiro', nivel: 'atencao', sinal: 'Troca de patrocinador' },
  { texto: 'se não resolver até dezembro a gente cancela', nivel: 'risco', sinal: 'Intenção de cancelar' },
  { texto: 'o suporte demorou uma semana de novo', nivel: 'atencao', sinal: 'Suporte lento' },
  { texto: 'a Rival mandou proposta com metade do preço', nivel: 'risco', sinal: 'Concorrente' },
  { texto: 'o relatório novo virou rotina aqui', nivel: 'saude', sinal: 'Uso consolidado' },
];

const COR_NIVEL = {
  risco: 'bg-[var(--risco)]',
  atencao: 'bg-[var(--atencao)]',
  saude: 'bg-[var(--saude)]',
};

export function FaixaDeFalas() {
  const item = (f: (typeof FALAS)[number], k: string, copia: boolean) => (
    <li
      key={k}
      aria-hidden={copia || undefined}
      className="flex shrink-0 items-center gap-3 rounded-full border border-line bg-surface py-2 pl-3 pr-5"
    >
      <span className={`size-2.5 shrink-0 rounded-full ${COR_NIVEL[f.nivel]}`} aria-hidden />
      <span className="font-fala text-[17px] italic text-ink">{f.texto}</span>
      <span className="text-[11.5px] font-medium text-ink-faint">{f.sinal}</span>
    </li>
  );
  return (
    <div className="faixa overflow-hidden py-2" aria-label="Exemplos de falas que o Benjamin marca">
      {/* Duas cópias: quando a primeira sai pela esquerda, a segunda está no lugar dela. */}
      <ul className="faixa-trilha flex w-max gap-3 pr-3">
        {FALAS.map((f, i) => item(f, `a${i}`, false))}
        {FALAS.map((f, i) => item(f, `b${i}`, true))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Linha do tempo do problema
 * ------------------------------------------------------------------ */

export function LinhaDoTempo() {
  const semanas = [1, 2, 3, 4, 5, 6, 7, 8];
  // Centro de cada coluna da grade de 8: é onde fica o ponto de cada semana.
  const centro = (s: number) => `${((s - 0.5) / semanas.length) * 100}%`;
  return (
    <figure aria-label="Exemplo: o aviso aparece na semana 3 e o cancelamento chega na semana 8" className="linha-tempo">
      <div className="relative pt-32 sm:pt-28">
        {/* Fio do aviso: sai do ponto da semana 3 e some atrás do balão. */}
        <div className="absolute w-px bg-[var(--risco)]/50" style={{ left: centro(3), top: 40, bottom: 31 }} aria-hidden />
        <div className="absolute top-0 z-10" style={{ left: centro(3) }}>
          <div className="w-[min(300px,62vw)] -translate-x-6 rounded-2xl border border-[var(--risco)]/25 bg-surface px-3.5 py-2.5 shadow-panel">
            <p className="font-fala text-[16px] italic leading-snug text-ink">
              “o suporte demorou de novo, a gente está avaliando”
            </p>
            <p className="mt-1 text-[11px] font-semibold text-[var(--risco)]">Semana 3: o aviso</p>
          </div>
        </div>

        <div className="relative h-1.5 rounded-full bg-surface-3">
          <div className="traco-tempo absolute inset-0 rounded-full escala-gradiente" />
          {semanas.map((s) => (
            <span
              key={s}
              aria-hidden
              className={`absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface ${
                s === 3 ? 'size-4 bg-[var(--risco)]' : s === 8 ? 'size-4 bg-ink' : 'size-3 bg-ink-faint'
              }`}
              style={{ left: centro(s) }}
            />
          ))}
        </div>

        <ol className="mt-3 grid grid-cols-8 text-center">
          {semanas.map((s) => (
            <li key={s} className={`text-[11px] ${s === 8 ? 'font-semibold text-ink' : s === 3 ? 'font-semibold text-[var(--risco)]' : 'text-ink-faint'}`}>
              {s === 8 ? 'cancelou' : `sem. ${s}`}
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-5 text-[12px] text-ink-faint">
        Exemplo ilustrativo. Entre o aviso e o cancelamento houve cinco semanas para agir.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 * Mini-telas dos três passos
 * ------------------------------------------------------------------ */

const ALTURAS = [0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.35, 0.95, 0.55, 0.75, 0.45, 0.85];

function Onda({ cor, atraso }: { cor: string; atraso: number }) {
  return (
    <div className="flex h-8 items-center gap-[3px]" aria-hidden>
      {ALTURAS.map((h, i) => (
        <span
          key={i}
          className={`onda-barra block w-[3px] rounded-full ${cor}`}
          style={{ height: `${h * 100}%`, animationDelay: `${atraso + i * 0.09}s` }}
        />
      ))}
    </div>
  );
}

export function TelaCanais() {
  return (
    <div className="space-y-2.5 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Mic size={14} className="shrink-0 text-ink-dim" aria-hidden />
        <span className="w-16 text-[11.5px] text-ink-dim">Seu time</span>
        <Onda cor="bg-ink" atraso={0} />
      </div>
      <div className="flex items-center gap-3">
        <MonitorUp size={14} className="shrink-0 text-[var(--saude)]" aria-hidden />
        <span className="w-16 text-[11.5px] text-ink-dim">Cliente</span>
        <Onda cor="bg-[var(--saude)]" atraso={0.4} />
      </div>
    </div>
  );
}

export function TelaLeitura() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-[11px] text-ink-faint">Renata, cliente</p>
      <p className="mt-1 font-fala text-[16px] italic leading-snug">
        o painel ficou bom, mas <span className="marca-loop">se não resolver a integração a gente cancela</span>
      </p>
      <span className="mt-3 inline-flex rounded-full bg-[var(--risco-suave)] px-2 py-0.5 text-[11px] font-semibold text-[var(--risco)]">
        Intenção de cancelar
      </span>
    </div>
  );
}

export function TelaRadar() {
  const linhas = [
    { nome: 'Logística Ventura', valor: 'R$ 240 mil', risco: 81, cor: 'text-[var(--risco)]' },
    { nome: 'Clínica Aurora', valor: 'R$ 36 mil', risco: 64, cor: 'text-[var(--atencao)]' },
    { nome: 'Escola Horizonte', valor: 'R$ 48 mil', risco: 18, cor: 'text-[var(--saude)]' },
  ];
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-surface px-4">
      {linhas.map((l) => (
        <li key={l.nome} className="flex items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-[12.5px] font-semibold">{l.nome}</p>
            <p className="text-[11px] text-ink-faint">{l.valor}</p>
          </div>
          <span className={`text-[20px] font-semibold tabular-nums ${l.cor}`}>{l.risco}</span>
        </li>
      ))}
    </ul>
  );
}

export function ItemGarantia({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span className="flex size-4 items-center justify-center rounded-full bg-[var(--saude-suave)]">
        <Check size={11} className="text-[var(--saude)]" aria-hidden />
      </span>
      {children}
    </li>
  );
}

export { Citacao };
