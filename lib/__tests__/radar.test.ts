import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ANEL_ALTO,
  ANEL_MEDIO,
  CORTE_ALTO,
  faixaRisco,
  montarRadar,
  motivosDaConta,
  posicionarNoPolar,
  raioDoRisco,
  type AnaliseRadar,
  type EntradaRadar,
} from '../radar';

/**
 * Radar de churn: ordem das contas, abstenção e motivo com citação.
 *
 * O que estes testes protegem é o que o Head de CS lê primeiro: quem está no
 * topo da lista, quanto dinheiro está em jogo e a fala que justifica o alerta.
 */

const HOJE = new Date('2026-10-28T00:00:00');

const sinal = (text: string, weight: number, quote: string) => ({
  text,
  weight,
  evidence: { quote, start: 0, end: quote.length, speaker: 'Carla' },
});

function analise(meeting_id: string, churn_risk: number | null, extra: Partial<AnaliseRadar> = {}): AnaliseRadar {
  return { meeting_id, churn_risk, churn_signals: [], competitors: [], created_at: '2026-10-01T10:00:00Z', ...extra };
}

function entrada(parcial: Partial<EntradaRadar>): EntradaRadar {
  return { clientes: [], reunioes: [], analises: [], alertas: [], hoje: HOJE, ...parcial };
}

describe('faixaRisco', () => {
  test('usa os mesmos cortes do resto do produto e trata null como sem leitura', () => {
    assert.equal(faixaRisco(67), 'alto');
    assert.equal(faixaRisco(66), 'medio');
    assert.equal(faixaRisco(34), 'medio');
    assert.equal(faixaRisco(33), 'baixo');
    assert.equal(faixaRisco(0), 'baixo');
    assert.equal(faixaRisco(null), 'sem_leitura');
  });
});

describe('montarRadar — ordem', () => {
  const clientes = [
    { id: 'pequena', name: 'Pequena', segment: null, contract_value: 10_000 },
    { id: 'grande', name: 'Grande', segment: null, contract_value: 200_000 },
    { id: 'sem-contrato', name: 'Sem contrato', segment: null, contract_value: null },
    { id: 'sem-leitura', name: 'Sem leitura', segment: null, contract_value: 500_000 },
  ];
  const reunioes = clientes.map((c, i) => ({
    id: `m-${c.id}`,
    customer_id: c.id,
    title: `Reunião ${i}`,
    meeting_date: '2026-10-20',
  }));
  const analises = [
    analise('m-pequena', 95),
    analise('m-grande', 50),
    analise('m-sem-contrato', 99),
    analise('m-sem-leitura', null),
  ];

  const { contas } = montarRadar(entrada({ clientes, reunioes, analises }));

  test('contrato × risco vem primeiro: conta grande com risco médio passa a pequena com risco alto', () => {
    assert.deepEqual(
      contas.map((c) => c.id),
      ['grande', 'pequena', 'sem-contrato', 'sem-leitura'],
    );
    assert.equal(contas[0]?.prioridade, 100_000);
  });

  test('sem contrato não some: vem depois das que têm valor, ordenada pelo risco', () => {
    assert.equal(contas[2]?.prioridade, null);
    assert.equal(contas[2]?.churn, 99);
  });

  test('abstenção do motor não vira risco zero', () => {
    const c = contas.find((x) => x.id === 'sem-leitura');
    assert.equal(c?.churn, null);
    assert.equal(c?.faixa, 'sem_leitura');
    assert.equal(c?.prioridade, null);
  });
});

describe('montarRadar — leitura da conta', () => {
  const clientes = [{ id: 'acme', name: 'Acme', segment: 'Indústria', contract_value: 120_000 }];
  const reunioes = [
    { id: 'r1', customer_id: 'acme', title: 'Kickoff', meeting_date: '2026-08-01' },
    { id: 'r2', customer_id: 'acme', title: 'QBR', meeting_date: '2026-09-01' },
    { id: 'r3', customer_id: 'acme', title: 'Renovação', meeting_date: '2026-09-20' },
  ];

  test('tendência compara as duas últimas leituras e ignora a abstenção no meio', () => {
    const { contas } = montarRadar(
      entrada({
        clientes,
        reunioes,
        analises: [analise('r1', 30), analise('r2', null), analise('r3', 75)],
      }),
    );
    assert.equal(contas[0]?.churn, 75);
    assert.equal(contas[0]?.tendencia, 45);
  });

  test('reunião reprocessada: a análise mais recente vence', () => {
    const { contas } = montarRadar(
      entrada({
        clientes,
        reunioes: [reunioes[0]!],
        analises: [
          analise('r1', 90, { created_at: '2026-10-02T00:00:00Z' }),
          analise('r1', 20, { created_at: '2026-10-01T00:00:00Z' }),
        ],
      }),
    );
    assert.equal(contas[0]?.churn, 90);
  });

  test('o motivo principal é o sinal de maior peso da última leitura, com a citação', () => {
    const { contas } = montarRadar(
      entrada({
        clientes,
        reunioes,
        analises: [
          analise('r1', 40, { churn_signals: [sinal('Insatisfação antiga', 50, 'isso já foi resolvido')] }),
          analise('r3', 80, {
            churn_signals: [
              sinal('Reclamação de suporte', 15, 'o suporte demora uma semana'),
              sinal('Avaliando trocar de fornecedor', 35, 'estamos olhando outras opções para 2027'),
            ],
          }),
        ],
      }),
    );
    const m = contas[0]?.motivo;
    assert.equal(m?.texto, 'Avaliando trocar de fornecedor');
    assert.equal(m?.citacao, 'estamos olhando outras opções para 2027');
    assert.equal(m?.reuniaoId, 'r3');
    assert.equal(m?.falante, 'Carla');
  });

  test('sinal sem citação não vira motivo: o produto não afirma sem evidência', () => {
    const { contas } = montarRadar(
      entrada({
        clientes,
        reunioes: [reunioes[0]!],
        analises: [
          analise('r1', 80, {
            churn_signals: [{ text: 'Sem fala', weight: 90, evidence: { quote: '  ', start: 0, end: 0 } }],
          }),
        ],
      }),
    );
    assert.equal(contas[0]?.motivo, null);
  });

  test('concorrente ativo com citação vira motivo; concorrente histórico, não', () => {
    const { contas } = montarRadar(
      entrada({
        clientes,
        reunioes: [reunioes[0]!],
        analises: [
          analise('r1', 70, {
            competitors: [
              { name: 'Antigo', context: '', threat: 'alta', active: false, evidence: { quote: 'usávamos', start: 0, end: 8 } },
              { name: 'Rival', context: '', threat: 'alta', active: true, evidence: { quote: 'a Rival ofereceu', start: 0, end: 16 } },
            ],
          }),
        ],
      }),
    );
    assert.equal(contas[0]?.motivo?.texto, 'Concorrente citado: Rival');
    assert.deepEqual(contas[0]?.concorrentes, ['Rival']);
  });

  test('dias sem contato contam a partir da reunião mais recente, analisada ou não', () => {
    const { contas } = montarRadar(entrada({ clientes, reunioes, analises: [] }));
    assert.equal(contas[0]?.diasSemContato, 38);
  });
});

describe('montarRadar — resumo', () => {
  test('receita em risco soma só as contas em risco alto e conta as que ficaram fora', () => {
    const clientes = [
      { id: 'a', name: 'A', segment: null, contract_value: 100_000 },
      { id: 'b', name: 'B', segment: null, contract_value: 50_000 },
      { id: 'c', name: 'C', segment: null, contract_value: null },
    ];
    const reunioes = clientes.map((c) => ({ id: `m-${c.id}`, customer_id: c.id, title: 'x', meeting_date: '2026-10-27' }));
    const { resumo } = montarRadar(
      entrada({
        clientes,
        reunioes,
        analises: [analise('m-a', 80), analise('m-b', 40), analise('m-c', 90)],
        alertas: [
          { customer_id: 'a', read: false },
          { customer_id: 'a', read: true },
          { customer_id: 'b', read: false },
        ],
      }),
    );
    assert.equal(resumo.contasEmRiscoAlto, 2);
    assert.equal(resumo.receitaEmRisco, 100_000);
    assert.equal(resumo.emRiscoSemContrato, 1);
    assert.equal(resumo.alertasAbertos, 2);
  });
});

describe('motivosDaConta', () => {
  test('agrupa o mesmo motivo de várias reuniões e mantém a ocorrência mais recente', () => {
    const r = (id: string, data: string) => ({ id, title: id, meeting_date: data });
    const motivos = motivosDaConta([
      { reuniao: r('antiga', '2026-08-01'), analise: analise('antiga', 60, { churn_signals: [sinal('Preço alto', 20, 'está caro')] }) },
      { reuniao: r('nova', '2026-10-01'), analise: analise('nova', 70, { churn_signals: [sinal('Preço alto', 20, 'continua caro')] }) },
    ]);
    assert.equal(motivos.length, 1);
    assert.equal(motivos[0]?.vezes, 2);
    assert.equal(motivos[0]?.citacao, 'continua caro');
    assert.equal(motivos[0]?.reuniaoId, 'nova');
  });
});

describe('posicionarNoPolar', () => {
  const conta = (id: string, churn: number | null, contrato: number | null = 10) => ({
    id,
    nome: id,
    segmento: null,
    contrato,
    churn,
    tendencia: null,
    faixa: faixaRisco(churn),
    prioridade: churn != null && contrato != null ? (contrato * churn) / 100 : null,
    diasSemContato: null,
    motivo: null,
    concorrentes: [],
    alertasAbertos: 0,
  });
  const dist = (p: { x: number; y: number }) => Math.hypot(p.x - 50, p.y - 50);

  test('quanto maior o risco, mais perto do centro', () => {
    const pontos = posicionarNoPolar([conta('baixo', 10), conta('alto', 90), conta('medio', 50)]);
    const d = Object.fromEntries(pontos.map((p) => [p.id, dist(p)]));
    assert.ok(d.alto! < d.medio! && d.medio! < d.baixo!);
  });

  test('os anéis ficam nos cortes de faixa', () => {
    assert.ok(Math.abs(raioDoRisco(CORTE_ALTO) - ANEL_ALTO) < 1e-9);
    assert.ok(ANEL_ALTO < ANEL_MEDIO);
  });

  test('a mesma conta cai no mesmo lugar a cada carga', () => {
    const a = posicionarNoPolar([conta('x', 70), conta('y', 40)]);
    const b = posicionarNoPolar([conta('y', 40), conta('x', 70)]);
    assert.deepEqual(
      a.find((p) => p.id === 'x'),
      b.find((p) => p.id === 'x'),
    );
  });

  test('conta sem leitura fica fora do radar', () => {
    assert.deepEqual(posicionarNoPolar([conta('a', 50), conta('b', null)]).map((p) => p.id), ['a']);
  });

  test('pontos não se cobrem enquanto o anel tem espaço', () => {
    // 8 contas no mesmo risco cabem no anel; com muito mais, o perímetro acaba
    // e o radar aceita sobreposição (a lista ao lado continua completa).
    const muitas = Array.from({ length: 8 }, (_, i) => conta(`c${i}`, 80));
    const pontos = posicionarNoPolar(muitas);
    for (let i = 0; i < pontos.length; i++)
      for (let j = i + 1; j < pontos.length; j++)
        assert.ok(Math.hypot(pontos[i]!.x - pontos[j]!.x, pontos[i]!.y - pontos[j]!.y) >= 6.9);
  });
});
