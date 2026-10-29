import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analisar } from '../index';
import { montarLexico, termoParaPadrao } from '../rules/catalogo';
import type { Catalogo } from '../types';

/**
 * Catálogo por empresa: o motor procura os produtos e concorrentes de QUEM
 * está analisando, não os da TOTVS.
 *
 * O que estes testes protegem: uma empresa nova não vê "Protheus" nem "SAP"
 * nas reuniões dela; o que ela cadastrou é achado com evidência; e a TOTVS
 * continua com a lista histórica.
 */

const DATA = '2026-10-29';

const REUNIAO = `Carla (Vendedora): Como está o uso do Painel Pulse no time de vocês?
Marcos (Cliente): A gente usa o Pulse todo dia, mas o suporte demora.
Marcos (Cliente): Também estamos avaliando a Zenith Analytics para o ano que vem.
Marcos (Cliente): Antes a gente usava o Protheus e o SAP, mas isso já faz tempo.`;

const VAZIO: Catalogo = { baseTotvs: false, produtos: [], concorrentes: [] };

describe('termoParaPadrao', () => {
  test('ignora caixa e acento, escapa símbolos e aceita espaço variável', () => {
    const re = new RegExp(termoParaPadrao('Saúde  C++')!, 'u');
    assert.ok(re.test('saude c++'));
    assert.ok(re.test('saude    c++'));
    assert.ok(!re.test('saude cxx'));
  });

  test('termo vazio ou de uma letra não vira padrão', () => {
    assert.equal(termoParaPadrao('  '), null);
    assert.equal(termoParaPadrao('a'), null);
  });
});

describe('montarLexico', () => {
  test('sem catálogo é a lista da TOTVS (comportamento histórico)', () => {
    const lex = montarLexico();
    assert.ok(lex.produtos.some((p) => p.nome === 'TOTVS Protheus'));
    assert.ok(lex.concorrentes.some((c) => c.nome === 'SAP'));
  });

  test('empresa nova começa vazia: nada da TOTVS', () => {
    const lex = montarLexico(VAZIO);
    assert.equal(lex.produtos.length, 0);
    assert.equal(lex.concorrentes.length, 0);
    assert.equal(lex.crossBu.length, 0);
  });

  test('com baseTotvs, soma o cadastro à lista da TOTVS', () => {
    const lex = montarLexico({ baseTotvs: true, produtos: [{ nome: 'Produto X' }], concorrentes: [] });
    assert.ok(lex.produtos.some((p) => p.nome === 'TOTVS Protheus'));
    assert.ok(lex.produtos.some((p) => p.nome === 'Produto X'));
  });
});

describe('analisar com catálogo', () => {
  const catalogo: Catalogo = {
    baseTotvs: false,
    produtos: [{ nome: 'Painel Pulse', sinonimos: ['Pulse'] }],
    concorrentes: [{ nome: 'Zenith Analytics', sinonimos: ['Zenith'] }],
  };
  const r = analisar({ texto: REUNIAO, dataReuniao: DATA, catalogo });

  test('acha o produto cadastrado pelo sinônimo, com a citação', () => {
    const pulse = r.totvs_products.find((p) => p.name === 'Painel Pulse');
    assert.ok(pulse, 'Painel Pulse deveria ser encontrado');
    assert.ok(/pulse/i.test(pulse.evidence.quote));
  });

  test('acha o concorrente cadastrado como avaliação ativa', () => {
    const zenith = r.competitors.find((c) => c.name === 'Zenith Analytics');
    assert.ok(zenith, 'Zenith Analytics deveria ser encontrado');
    assert.equal(zenith.active, true);
  });

  test('não acha Protheus nem SAP numa empresa que não os cadastrou', () => {
    assert.ok(!r.totvs_products.some((p) => /protheus/i.test(p.name)));
    assert.ok(!r.competitors.some((c) => c.name === 'SAP'));
  });

  test('sem catálogo, a mesma reunião ainda acha os da TOTVS', () => {
    const totvs = analisar({ texto: REUNIAO, dataReuniao: DATA });
    assert.ok(totvs.totvs_products.some((p) => p.name === 'TOTVS Protheus'));
    assert.ok(totvs.competitors.some((c) => c.name === 'SAP'));
  });
});
