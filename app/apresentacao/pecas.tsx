import { Mic, MonitorUp } from 'lucide-react';
import { Citacao, RadarPolar } from '@/components/radar-ui';
import { faixaRisco, posicionarNoPolar, type ContaRadar } from '@/lib/radar';

/*
 * Peças visuais da landing. Todas são ilustrações com dados fictícios e dizem
 * isso na tela: a landing não inventa cliente, número de uso nem depoimento.
 * Sem JavaScript no navegador e sem animação.
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

/** A conta de maior risco do radar, aberta: o número e a fala que o explica. */
export function CartaoFala({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-surface p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold">Logística Ventura</p>
          <p className="mt-0.5 text-[12.5px] text-ink-faint">Contrato de R$ 240 mil</p>
        </div>
        <p className="text-[30px] font-bold leading-none tracking-[-0.03em] text-[var(--risco)] tabular-nums">81</p>
      </div>
      <Citacao texto="a diretoria pediu para a gente olhar outras opções antes de renovar" tom="risk" className="mt-4" />
      <p className="mt-2 pl-5 text-[12.5px] font-semibold text-[var(--risco)]">Avaliando trocar de fornecedor</p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Falas e sinais
 * ------------------------------------------------------------------ */

const FALAS: { texto: string; nivel: 'risco' | 'atencao' | 'saude'; sinal: string }[] = [
  { texto: 'a diretoria pediu para olhar outras opções', nivel: 'risco', sinal: 'Avaliando trocar' },
  { texto: 'se não resolver até dezembro a gente cancela', nivel: 'risco', sinal: 'Intenção de cancelar' },
  { texto: 'a Rival mandou proposta com metade do preço', nivel: 'risco', sinal: 'Concorrente' },
  { texto: 'o Marcos saiu e quem assume é o financeiro', nivel: 'atencao', sinal: 'Troca de patrocinador' },
  { texto: 'o time voltou para a planilha', nivel: 'atencao', sinal: 'Baixa adoção' },
  { texto: 'o suporte demorou uma semana de novo', nivel: 'atencao', sinal: 'Suporte lento' },
  { texto: 'a gente quer levar isso para a filial do sul', nivel: 'saude', sinal: 'Expansão' },
  { texto: 'o relatório novo virou rotina aqui', nivel: 'saude', sinal: 'Uso consolidado' },
];

const COR_NIVEL = {
  risco: 'bg-[var(--risco)]',
  atencao: 'bg-[var(--atencao)]',
  saude: 'bg-[var(--saude)]',
};

/** O que o cliente diz, e o nome que o Benjamin dá para isso. Lido como tabela. */
export function TabelaDeFalas() {
  return (
    <ul className="grid border-t border-line md:grid-cols-2 md:gap-x-12" aria-label="Exemplos de falas que o Benjamin marca">
      {FALAS.map((f) => (
        <li key={f.texto} className="flex items-baseline gap-3 border-b border-line py-3.5">
          <span className={`size-2 shrink-0 translate-y-[-2px] rounded-full ${COR_NIVEL[f.nivel]}`} aria-hidden />
          <span className="min-w-0 flex-1 font-fala text-[16px] leading-snug text-ink">{f.texto}</span>
          <span className="shrink-0 text-[12.5px] font-medium text-ink-dim">{f.sinal}</span>
        </li>
      ))}
    </ul>
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
    <figure aria-label="Exemplo: o aviso aparece na semana 3 e o cancelamento chega na semana 8">
      <div className="relative pt-32 sm:pt-28">
        {/* Fio do aviso: sai do ponto da semana 3 e some atrás do balão. */}
        <div className="absolute w-px bg-[var(--risco)]" style={{ left: centro(3), top: 40, bottom: 31 }} aria-hidden />
        <div className="absolute top-0 z-10" style={{ left: centro(3) }}>
          <div className="w-[min(300px,62vw)] -translate-x-6 rounded-md border border-line bg-surface px-3.5 py-2.5">
            <p className="font-fala text-[15.5px] leading-snug text-ink">“o suporte demorou de novo, a gente está avaliando”</p>
            <p className="mt-1 text-[12px] font-semibold text-[var(--risco)]">Semana 3: o aviso</p>
          </div>
        </div>

        {/* Antes do aviso a linha é neutra; do aviso ao cancelamento, é risco. */}
        <div className="relative h-[3px] bg-line-strong">
          <div
            className="absolute inset-y-0 right-[6.25%] bg-[var(--risco)]"
            style={{ left: centro(3) }}
            aria-hidden
          />
          {semanas.map((s) => (
            <span
              key={s}
              aria-hidden
              className={`absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-surface ${
                s === 3 ? 'size-3.5 bg-[var(--risco)]' : s === 8 ? 'size-3.5 bg-ink' : 'size-2.5 bg-ink-faint'
              }`}
              style={{ left: centro(s) }}
            />
          ))}
        </div>

        <ol className="mt-3 grid grid-cols-8 text-center">
          {semanas.map((s) => (
            <li key={s} className={`text-[12px] ${s === 8 ? 'font-semibold text-ink' : s === 3 ? 'font-semibold text-[var(--risco)]' : 'text-ink-faint'}`}>
              {s === 8 ? (
                'cancelou'
              ) : (
                <>
                  <span className="hidden sm:inline">sem. </span>
                  {s}
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-5 text-[12.5px] text-ink-faint">
        Exemplo ilustrativo. Entre o aviso e o cancelamento houve cinco semanas para agir.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 * Mini-telas dos três passos
 * ------------------------------------------------------------------ */

const ALTURAS = [0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.35, 0.95, 0.55, 0.75, 0.45, 0.85, 0.3, 0.7];

/** Forma de onda parada: diz "áudio" sem precisar se mexer. */
function Onda({ cor }: { cor: string }) {
  return (
    <div className="flex h-7 items-center gap-[3px]" aria-hidden>
      {ALTURAS.map((h, i) => (
        <span key={i} className={`block w-[3px] rounded-[1px] ${cor}`} style={{ height: `${h * 100}%` }} />
      ))}
    </div>
  );
}

export function TelaCanais() {
  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Mic size={14} className="shrink-0 text-ink-dim" aria-hidden />
        <span className="w-16 text-[12px] text-ink-dim">Seu time</span>
        <Onda cor="bg-ink-dim" />
      </div>
      <div className="flex items-center gap-3">
        <MonitorUp size={14} className="shrink-0 text-ink-dim" aria-hidden />
        <span className="w-16 text-[12px] text-ink-dim">Cliente</span>
        <Onda cor="bg-accent" />
      </div>
    </div>
  );
}

export function TelaLeitura() {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-[12px] text-ink-faint">Renata, cliente</p>
      <p className="mt-1 font-fala text-[15.5px] leading-snug">
        o painel ficou bom, mas{' '}
        <span className="bg-[var(--risco-suave)] text-[var(--risco)]">se não resolver a integração a gente cancela</span>
      </p>
      <p className="mt-3 text-[12px] font-semibold text-[var(--risco)]">Intenção de cancelar</p>
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
    <ul className="divide-y divide-line rounded-lg border border-line bg-surface px-4">
      {linhas.map((l) => (
        <li key={l.nome} className="flex items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-[13px] font-semibold">{l.nome}</p>
            <p className="text-[12px] text-ink-faint">{l.valor}</p>
          </div>
          <span className={`text-[20px] font-bold tabular-nums ${l.cor}`}>{l.risco}</span>
        </li>
      ))}
    </ul>
  );
}

export { Citacao };
