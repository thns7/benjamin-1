import type { Catalogo, ItemCatalogo } from '../types';
import { CONCORRENTES, PRODUTOS, SINAIS_CROSS_BU, type EntradaProduto } from './lexicons';
import { dobrar } from './segment';

/**
 * Catálogo da empresa → listas que os extratores usam.
 *
 * O motor nasceu com a carteira da TOTVS cravada em lexicons.ts. Com o cadastro
 * aberto, cada empresa traz os próprios produtos e concorrentes, digitados em
 * texto simples na tela de catálogo. Este módulo é a ponte: converte texto em
 * padrão de busca seguro e decide quando a lista da TOTVS entra.
 */

export type Lexico = {
  produtos: EntradaProduto[];
  concorrentes: { nome: string; padrao: string }[];
  crossBu: typeof SINAIS_CROSS_BU;
};

/** O comportamento histórico: a carteira da TOTVS. */
const LEXICO_TOTVS: Lexico = { produtos: PRODUTOS, concorrentes: CONCORRENTES, crossBu: SINAIS_CROSS_BU };

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * Texto digitado → padrão de busca. Na mesma forma do textoBusca (minúsculo,
 * sem acento), com caracteres especiais escapados e qualquer espaço casando
 * com um ou mais espaços. As fronteiras de palavra quem põe é `casar`.
 * Devolve null para termo vazio ou curto demais para não casar com tudo.
 */
export function termoParaPadrao(termo: string): string | null {
  const limpo = dobrar(termo.normalize('NFC')).trim().replace(/\s+/g, ' ');
  if (limpo.length < 2) return null;
  return limpo.split(' ').map(escapar).join('\\s+');
}

/** Nome e sinônimos de um item, sem repetição, numa alternância só. */
function padraoDoItem(item: ItemCatalogo): string | null {
  const padroes = [...new Set([item.nome, ...(item.sinonimos ?? [])].map(termoParaPadrao).filter((p): p is string => !!p))];
  if (padroes.length === 0) return null;
  // Termos mais longos primeiro: "rd station crm" antes de "rd station".
  padroes.sort((a, b) => b.length - a.length);
  return padroes.join('|');
}

export function montarLexico(catalogo?: Catalogo): Lexico {
  if (!catalogo) return LEXICO_TOTVS;

  const produtos: EntradaProduto[] = catalogo.produtos.flatMap((p) => {
    const padrao = padraoDoItem(p);
    return padrao ? [{ nome: p.nome.trim(), unidade: 'indefinido' as const, padrao }] : [];
  });
  const concorrentes = catalogo.concorrentes.flatMap((c) => {
    const padrao = padraoDoItem(c);
    return padrao ? [{ nome: c.nome.trim(), padrao }] : [];
  });

  if (!catalogo.baseTotvs) return { produtos, concorrentes, crossBu: [] };
  return {
    produtos: [...PRODUTOS, ...produtos],
    concorrentes: [...CONCORRENTES, ...concorrentes],
    crossBu: SINAIS_CROSS_BU,
  };
}
