import { Check, Mic, MonitorUp } from 'lucide-react';
import { Citacao } from '@/components/radar-ui';

/*
 * Peças visuais da landing. Todas são ilustrações com dados fictícios e dizem
 * isso na tela: a landing não inventa cliente, número de uso nem depoimento.
 * Sem JavaScript no navegador: as animações são CSS (landing.css).
 */

/* ------------------------------------------------------------------ *
 * Topo: uma reunião sendo lida
 * ------------------------------------------------------------------ */

const CONVERSA = [
  { quem: 'Carla, CS', lado: 'time', texto: 'Como foi o primeiro trimestre com o painel novo?' },
  { quem: 'Renata, cliente', lado: 'cliente', texto: 'O painel ficou bom. O suporte é que demorou de novo.' },
  { quem: 'Carla, CS', lado: 'time', texto: 'Entendi. E para a renovação de janeiro, como vocês estão?' },
  { quem: 'Renata, cliente', lado: 'cliente', texto: '', risco: 'a diretoria pediu para a gente olhar outras opções antes de renovar' },
] as const;

export function ReuniaoSendoLida() {
  return (
    <figure
      aria-label="Exemplo: o Benjamin lendo uma reunião e marcando o risco de churn"
      className="relative rounded-[22px] border border-line bg-surface p-5 shadow-lift sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--risco)] opacity-50 motion-reduce:hidden" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[var(--risco)]" />
          </span>
          <p className="text-[12.5px] font-semibold">Renovação 2027, Logística Ventura</p>
        </div>
        <p className="text-[11.5px] text-ink-faint">lendo a reunião</p>
      </div>

      <ol className="mt-4 space-y-3">
        {CONVERSA.map((f, i) => (
          <li key={i} className={`fala flex flex-col ${f.lado === 'cliente' ? 'items-start' : 'items-end'}`}>
            <span className="mb-1 text-[11px] text-ink-faint">{f.quem}</span>
            {'risco' in f && f.risco ? (
              <p className="max-w-[90%] rounded-2xl rounded-tl-sm border border-[var(--risco)]/25 bg-surface px-3.5 py-2.5 font-fala text-[17px] italic leading-snug text-ink">
                <span className="marca-risco">{f.risco}</span>
              </p>
            ) : (
              <p
                className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug ${
                  f.lado === 'cliente' ? 'rounded-tl-sm bg-surface-2 text-ink' : 'rounded-tr-sm bg-ink text-canvas'
                }`}
              >
                {f.texto}
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="selo-sinal mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--risco-suave)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--risco)]">
          Sinal de churn: avaliando trocar de fornecedor
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--atencao-suave)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--atencao)]">
          Suporte lento, 2ª vez
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-canvas p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[12px] font-medium text-ink-dim">Risco de churn</p>
            <p className="mt-0.5 text-[11.5px] text-ink-faint">Contrato de R$ 240.000</p>
          </div>
          <p aria-label="Risco 81 de 100" className="text-[44px] font-semibold leading-none tracking-[-0.04em] text-[var(--risco)] tabular-nums">
            <span className="contador" aria-hidden />
          </p>
        </div>
        <div className="relative mt-4 h-2.5 rounded-full escala-gradiente" aria-hidden>
          <span className="medidor-ponto absolute top-1/2 block size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-ink shadow-md" />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-faint" aria-hidden>
          <span>saudável</span>
          <span>atenção</span>
          <span className="font-medium text-[var(--risco)]">risco alto</span>
        </div>
      </div>

      <figcaption className="mt-4 text-[11px] text-ink-faint">Exemplo ilustrativo com dados fictícios.</figcaption>
    </figure>
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

/* ------------------------------------------------------------------ *
 * Constelação: a carteira num só olhar
 * ------------------------------------------------------------------ */

/** Gerador determinístico: a mesma constelação em todo carregamento e no servidor. */
function semente(n: number) {
  let s = n;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Constelacao() {
  const r = semente(42);
  const contas = Array.from({ length: 46 }, (_, i) => {
    // Mais contas saudáveis que em risco, como numa carteira real.
    const risco = Math.round(Math.pow(r(), 1.6) * 100);
    return { i, risco, y: 8 + r() * 80, tamanho: 6 + Math.round(r() * 16) };
  });
  const cor = (v: number) => (v >= 67 ? 'var(--risco)' : v >= 34 ? 'var(--atencao)' : 'var(--saude)');

  return (
    <figure aria-label="Exemplo: dezenas de contas espalhadas pela escala de risco" className="relative">
      <div className="relative h-[300px] rounded-3xl border border-white/10 bg-white/[0.03] sm:h-[340px]">
        <div className="absolute inset-y-0 left-[67%] right-0 rounded-r-3xl bg-[var(--risco)]/10" />
        <div className="absolute inset-y-0 left-[34%] border-l border-dashed border-white/15" />
        <div className="absolute inset-y-0 left-[67%] border-l border-dashed border-white/15" />
        {contas.map((c) => (
          <span
            key={c.i}
            className={`absolute block -translate-x-1/2 -translate-y-1/2 rounded-full ${c.risco >= 67 ? 'estrela-risco' : ''}`}
            style={{
              left: `${3 + c.risco * 0.94}%`,
              top: `${c.y}%`,
              width: c.tamanho,
              height: c.tamanho,
              background: cor(c.risco),
              opacity: c.risco >= 67 ? 1 : 0.75,
              animationDelay: `${(c.i % 7) * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[12px] text-white/55">
        <span className="text-[var(--saude)]">saudáveis</span>
        <span className="text-[var(--atencao)]">atenção</span>
        <span className="font-semibold text-[#f0736a]">em risco: comece por aqui</span>
      </div>
    </figure>
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
