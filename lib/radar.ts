import type { Concorrente, Evidence, SinalPontuado } from './analysis';

/**
 * Radar de churn — a pergunta que o produto responde: quais contas podem
 * cancelar, quanto isso custa e por quê.
 *
 * TypeScript puro, sem I/O, como `health.ts`: recebe as linhas já carregadas e
 * devolve a lista ordenada. O carregamento do banco fica em `radar-dados.ts`,
 * para esta parte ser testável sem Supabase.
 *
 * Duas regras do projeto valem aqui também:
 *  - todo motivo exibido carrega a citação literal que o originou;
 *  - risco `null` é abstenção do motor, não risco zero. Conta sem leitura não
 *    pode parecer conta saudável, então ela vai para um grupo próprio.
 */

/** Mesmo corte de `tomChurn` e de `receitaEmRisco`: ≥ 67 é risco alto. */
export const CORTE_ALTO = 67;
export const CORTE_MEDIO = 34;
/** A partir de quantos dias sem conversa a conta conta como "sem contato". */
export const DIAS_SEM_CONTATO = 30;

export type FaixaRisco = 'alto' | 'medio' | 'baixo' | 'sem_leitura';

export function faixaRisco(churn: number | null): FaixaRisco {
  if (churn == null) return 'sem_leitura';
  if (churn >= CORTE_ALTO) return 'alto';
  if (churn >= CORTE_MEDIO) return 'medio';
  return 'baixo';
}

/* ------------------------------------------------------------------ *
 * Entrada
 * ------------------------------------------------------------------ */

export type ClienteRadar = {
  id: string;
  name: string;
  segment: string | null;
  contract_value: number | null;
};

export type ReuniaoRadar = {
  id: string;
  customer_id: string | null;
  title: string;
  meeting_date: string;
};

/** O mínimo de uma reunião para citar de onde veio um motivo. */
export type ReuniaoCitavel = Pick<ReuniaoRadar, 'id' | 'title' | 'meeting_date'>;

export type AnaliseRadar = {
  meeting_id: string;
  churn_risk: number | null;
  churn_signals: unknown;
  competitors: unknown;
  created_at: string;
};

export type AlertaRadar = {
  customer_id: string | null;
  read: boolean;
};

export type EntradaRadar = {
  clientes: ClienteRadar[];
  reunioes: ReuniaoRadar[];
  analises: AnaliseRadar[];
  alertas: AlertaRadar[];
  /** Data de referência para "dias sem contato". Padrão: hoje. */
  hoje?: Date;
};

/* ------------------------------------------------------------------ *
 * Saída
 * ------------------------------------------------------------------ */

/** Um motivo de risco, sempre com a fala que o sustenta. */
export type MotivoRisco = {
  texto: string;
  citacao: string;
  falante: string | null;
  peso: number;
  reuniaoId: string;
  reuniaoTitulo: string;
  data: string;
  origem: 'sinal' | 'concorrente';
};

export type ContaRadar = {
  id: string;
  nome: string;
  segmento: string | null;
  contrato: number | null;
  /** Risco da reunião analisada mais recente que não se absteve. */
  churn: number | null;
  /** Variação em relação à leitura anterior. null sem duas leituras. */
  tendencia: number | null;
  faixa: FaixaRisco;
  /** contrato × risco. É a chave de ordenação. null sem contrato ou sem leitura. */
  prioridade: number | null;
  diasSemContato: number | null;
  motivo: MotivoRisco | null;
  concorrentes: string[];
  alertasAbertos: number;
};

export type ResumoRadar = {
  contasEmRiscoAlto: number;
  /** Soma dos contratos das contas em risco alto. */
  receitaEmRisco: number;
  /** Contas em risco alto sem contrato cadastrado — ficaram fora da soma. */
  emRiscoSemContrato: number;
  alertasAbertos: number;
  contasSemContato: number;
  contasSemLeitura: number;
};

export type Radar = { contas: ContaRadar[]; resumo: ResumoRadar };

/* ------------------------------------------------------------------ *
 * Montagem
 * ------------------------------------------------------------------ */

const lista = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/**
 * Mesma conta de `diasEntre` (memory.ts). Não é importada de lá porque
 * `memory.ts` usa este módulo para montar a página da conta, e a importação
 * de volta criaria um ciclo.
 */
const diasEntre = (dataISO: string, referencia: Date): number =>
  Math.round((referencia.getTime() - new Date(`${dataISO.slice(0, 10)}T00:00:00`).getTime()) / 86_400_000);

const temCitacao = (e: Evidence | undefined): e is Evidence =>
  !!e && typeof e.quote === 'string' && e.quote.trim().length > 0;

/**
 * Leituras de uma conta em ordem cronológica: uma por reunião, ficando com a
 * análise mais recente quando a reunião foi reprocessada.
 */
function leiturasDaConta(
  reunioes: ReuniaoRadar[],
  analisePorReuniao: Map<string, AnaliseRadar>,
): { reuniao: ReuniaoRadar; analise: AnaliseRadar }[] {
  return reunioes
    .map((reuniao) => ({ reuniao, analise: analisePorReuniao.get(reuniao.id) }))
    .filter((l): l is { reuniao: ReuniaoRadar; analise: AnaliseRadar } => !!l.analise)
    .sort((a, b) => a.reuniao.meeting_date.localeCompare(b.reuniao.meeting_date));
}

/** Os motivos de risco de uma reunião: sinais de churn e concorrentes ativos. */
export function motivosDaReuniao(reuniao: ReuniaoCitavel, analise: AnaliseRadar): MotivoRisco[] {
  const base = { reuniaoId: reuniao.id, reuniaoTitulo: reuniao.title, data: reuniao.meeting_date };

  const sinais = lista<SinalPontuado>(analise.churn_signals)
    .filter((s) => temCitacao(s.evidence))
    .map((s) => ({
      ...base,
      texto: s.text,
      citacao: s.evidence.quote,
      falante: s.evidence.speaker ?? null,
      peso: s.weight,
      origem: 'sinal' as const,
    }));

  const concorrentes = lista<Concorrente>(analise.competitors)
    .filter((k) => k.active && temCitacao(k.evidence))
    .map((k) => ({
      ...base,
      texto: `Concorrente citado: ${k.name}`,
      citacao: k.evidence.quote,
      falante: k.evidence.speaker ?? null,
      // Ameaça alta pesa como um sinal forte; o resto fica abaixo dos sinais.
      peso: k.threat === 'alta' ? 25 : 10,
      origem: 'concorrente' as const,
    }));

  return [...sinais, ...concorrentes].sort((a, b) => b.peso - a.peso);
}

export function montarRadar(e: EntradaRadar): Radar {
  const hoje = e.hoje ?? new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');

  // Reprocessar cria outra análise para a mesma reunião: a mais recente vence.
  const analisePorReuniao = new Map<string, AnaliseRadar>();
  for (const a of [...e.analises].sort((x, y) => x.created_at.localeCompare(y.created_at))) {
    analisePorReuniao.set(a.meeting_id, a);
  }

  const reunioesPorConta = new Map<string, ReuniaoRadar[]>();
  for (const r of e.reunioes) {
    if (!r.customer_id) continue;
    const l = reunioesPorConta.get(r.customer_id) ?? [];
    l.push(r);
    reunioesPorConta.set(r.customer_id, l);
  }

  const alertasPorConta = new Map<string, number>();
  for (const a of e.alertas) {
    if (!a.customer_id || a.read) continue;
    alertasPorConta.set(a.customer_id, (alertasPorConta.get(a.customer_id) ?? 0) + 1);
  }

  const contas: ContaRadar[] = e.clientes.map((c) => {
    const reunioes = reunioesPorConta.get(c.id) ?? [];
    const leituras = leiturasDaConta(reunioes, analisePorReuniao);
    // Abstenção não entra na série: null não é zero.
    const comRisco = leituras.filter((l) => l.analise.churn_risk != null);

    const atual = comRisco.at(-1) ?? null;
    const anterior = comRisco.at(-2) ?? null;
    const churn = atual?.analise.churn_risk ?? null;
    const tendencia =
      atual && anterior ? (atual.analise.churn_risk as number) - (anterior.analise.churn_risk as number) : null;

    const ultimaData = reunioes.reduce<string | null>(
      (max, r) => (max == null || r.meeting_date > max ? r.meeting_date : max),
      null,
    );

    const concorrentes = new Set<string>();
    for (const l of leituras) {
      for (const k of lista<Concorrente>(l.analise.competitors)) if (k.active) concorrentes.add(k.name);
    }

    return {
      id: c.id,
      nome: c.name,
      segmento: c.segment,
      contrato: c.contract_value,
      churn,
      tendencia,
      faixa: faixaRisco(churn),
      prioridade: churn != null && c.contract_value != null ? (c.contract_value * churn) / 100 : null,
      diasSemContato: ultimaData ? diasEntre(ultimaData, hoje) : null,
      motivo: atual ? (motivosDaReuniao(atual.reuniao, atual.analise)[0] ?? null) : null,
      concorrentes: [...concorrentes],
      alertasAbertos: alertasPorConta.get(c.id) ?? 0,
    };
  });

  contas.sort(compararContas);

  const emRiscoAlto = contas.filter((c) => c.faixa === 'alto');
  return {
    contas,
    resumo: {
      contasEmRiscoAlto: emRiscoAlto.length,
      receitaEmRisco: emRiscoAlto.reduce((s, c) => s + (c.contrato ?? 0), 0),
      emRiscoSemContrato: emRiscoAlto.filter((c) => c.contrato == null).length,
      alertasAbertos: contas.reduce((s, c) => s + c.alertasAbertos, 0),
      contasSemContato: contas.filter((c) => c.diasSemContato != null && c.diasSemContato > DIAS_SEM_CONTATO)
        .length,
      contasSemLeitura: contas.filter((c) => c.faixa === 'sem_leitura').length,
    },
  };
}

/**
 * Ordem do radar, decidida com o Thiago em 2026-10-28: receita em risco
 * (contrato × risco) primeiro, porque é como o Head de CS prioriza.
 *
 *  1. contas com contrato e leitura, por contrato × risco;
 *  2. contas com leitura e sem contrato, por risco;
 *  3. contas sem leitura, por nome.
 */
function compararContas(a: ContaRadar, b: ContaRadar): number {
  const grupo = (c: ContaRadar) => (c.prioridade != null ? 0 : c.churn != null ? 1 : 2);
  const ga = grupo(a);
  const gb = grupo(b);
  if (ga !== gb) return ga - gb;
  if (ga === 0) return (b.prioridade as number) - (a.prioridade as number) || a.nome.localeCompare(b.nome);
  if (ga === 1) return (b.churn as number) - (a.churn as number) || a.nome.localeCompare(b.nome);
  return a.nome.localeCompare(b.nome, 'pt-BR');
}

/**
 * "Por que esta conta está em risco": os motivos de todas as reuniões da
 * conta, da mais recente para a mais antiga. O mesmo motivo repetido em várias
 * reuniões aparece uma vez, com a ocorrência mais recente e o total de vezes.
 */
export function motivosDaConta(
  leituras: { reuniao: ReuniaoCitavel; analise: AnaliseRadar }[],
): (MotivoRisco & { vezes: number })[] {
  const porChave = new Map<string, MotivoRisco & { vezes: number }>();
  const ordenadas = [...leituras].sort((a, b) => b.reuniao.meeting_date.localeCompare(a.reuniao.meeting_date));
  for (const l of ordenadas) {
    for (const m of motivosDaReuniao(l.reuniao, l.analise)) {
      const k = m.texto.toLowerCase();
      const existente = porChave.get(k);
      if (existente) existente.vezes++;
      else porChave.set(k, { ...m, vezes: 1 });
    }
  }
  return [...porChave.values()];
}

/* ------------------------------------------------------------------ *
 * Radar circular
 * ------------------------------------------------------------------ */

/**
 * Distância do centro, em fração do raio: quanto maior o risco, mais perto do
 * centro (o "alvo"). Risco 100 fica em 0,08 do raio, risco 0 na borda (0,94).
 */
export function raioDoRisco(risco: number): number {
  const r = Math.max(0, Math.min(100, risco));
  return 0.08 + 0.86 * (1 - r / 100);
}

/** Os anéis do radar ficam exatamente nos cortes de faixa. */
export const ANEL_ALTO = raioDoRisco(CORTE_ALTO);
export const ANEL_MEDIO = raioDoRisco(CORTE_MEDIO);

export type PontoPolar = {
  id: string;
  nome: string;
  risco: number;
  faixa: FaixaRisco;
  /** Posição em % da caixa quadrada do radar (0–100). */
  x: number;
  y: number;
  /** 0–1, proporcional à raiz do contrato. null sem contrato. */
  tamanho: number | null;
  rotulado: boolean;
};

/** Ângulo estável por conta: a mesma conta cai no mesmo lugar a cada carga. */
function anguloDoId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 3600) / 10;
}

/**
 * Posiciona as contas no radar circular. Sem leitura fica fora (no radar não
 * há lugar para "não sei"). Pontos que se cobririam giram até achar espaço.
 * Recebem nome as contas em risco alto e as cinco de maior prioridade.
 */
export function posicionarNoPolar(contas: ContaRadar[], distanciaMinima = 7): PontoPolar[] {
  const comLeitura = contas.filter((c) => c.churn != null);
  const maiorContrato = Math.max(0, ...comLeitura.map((c) => c.contrato ?? 0));
  const prioritarias = new Set(
    [...comLeitura]
      .filter((c) => c.prioridade != null)
      .sort((a, b) => (b.prioridade as number) - (a.prioridade as number))
      .slice(0, 5)
      .map((c) => c.id),
  );

  const colocados: { x: number; y: number }[] = [];
  // Os mais arriscados primeiro: são os que não podem ser empurrados.
  return [...comLeitura]
    .sort((a, b) => (b.churn as number) - (a.churn as number) || a.id.localeCompare(b.id))
    .map((c) => {
      const risco = c.churn as number;
      const raio = raioDoRisco(risco) * 50;
      let angulo = anguloDoId(c.id);
      let x = 0;
      let y = 0;
      for (let tentativa = 0; tentativa < 24; tentativa++) {
        x = 50 + raio * Math.cos((angulo * Math.PI) / 180);
        y = 50 + raio * Math.sin((angulo * Math.PI) / 180);
        if (colocados.every((p) => Math.hypot(p.x - x, p.y - y) >= distanciaMinima)) break;
        angulo = (angulo + 23) % 360;
      }
      colocados.push({ x, y });
      return {
        id: c.id,
        nome: c.nome,
        risco,
        faixa: c.faixa,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        tamanho: c.contrato != null && maiorContrato > 0 ? Math.sqrt(c.contrato / maiorContrato) : null,
        rotulado: c.faixa === 'alto' || prioritarias.has(c.id),
      };
    });
}
