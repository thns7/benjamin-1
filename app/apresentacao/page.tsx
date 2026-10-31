import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Logo, TAGLINE, Wordmark } from '@/components/logo';
import {
  Citacao,
  CartaoFala,
  LinhaDoTempo,
  RadarDeExemplo,
  TabelaDeFalas,
  TelaCanais,
  TelaLeitura,
  TelaRadar,
} from './pecas';
import './landing.css';

/*
 * Landing pública do Benjamin — o que um visitante sem login vê em "/".
 *
 * O middleware reescreve "/" para cá quando não há sessão; quem está logado
 * vai direto ao Radar. Esta página não usa o Shell (ver app/layout.tsx).
 *
 * Regra de conteúdo: nada inventado. Sem depoimento, logo de cliente ou
 * número de uso que não exista. As ilustrações usam dados fictícios e dizem
 * isso na tela. A confiança vem do que é verdade no produto: evidência
 * literal, abstenção, anonimização e dados no Brasil.
 *
 * Cor: papel e tinta, o verde-petróleo da marca só nos botões, e a escala de
 * risco (verde, âmbar, vermelho) só onde há risco. Sem animação.
 */

const TITULO = 'Saiba quais clientes vão cancelar antes da renovação';
const DESCRICAO =
  'O Benjamin lê as reuniões do seu time de Customer Success e avisa quando uma conta está em risco, sempre com a fala do cliente que mostra por quê.';

export const metadata: Metadata = {
  title: { absolute: 'Benjamin | radar de churn para Customer Success' },
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, type: 'website', locale: 'pt_BR', siteName: 'Benjamin' },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRICAO },
};

/** Contato comercial: o Benjamin é vendido pela IDEON. Um lugar só para trocar. */
const CONTATO = `https://wa.me/5511991926994?text=${encodeURIComponent(
  'Olá! Quero ver uma demonstração do Benjamin, o radar de churn para Customer Success.',
)}`;

function BotaoDemo() {
  return (
    <a
      href={CONTATO}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-5 text-[14.5px] font-semibold text-ink transition-colors hover:border-ink"
    >
      Pedir uma demonstração
      <ArrowUpRight size={16} aria-hidden />
    </a>
  );
}

/** Ação principal: o cadastro é aberto (migration 003). */
function BotaoCriarConta({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link
      href="/cadastro"
      className={`inline-flex items-center rounded-md bg-acao font-semibold text-on-acao transition-opacity hover:opacity-90 ${
        compacto ? 'min-h-9 px-3.5 text-[13.5px]' : 'min-h-11 px-5 text-[14.5px]'
      }`}
    >
      Criar conta
    </Link>
  );
}

const PASSOS = [
  {
    titulo: 'Traga as reuniões',
    texto:
      'Cole a transcrição que o Meet, o Teams ou o Zoom já geram, envie o áudio ou grave a call pelo navegador: o microfone vira a fala do seu time e o som da aba vira a fala do cliente.',
    tela: <TelaCanais />,
  },
  {
    titulo: 'O Benjamin lê cada conversa',
    texto:
      'Mede o risco de churn de 0 a 100 e marca sinais como insatisfação, troca de patrocinador e concorrente citado, sempre com a frase que gerou cada um.',
    tela: <TelaLeitura />,
  },
  {
    titulo: 'Seu time age na conta certa',
    texto:
      'O radar ordena a carteira pela receita em risco. Cada alerta chega com a fala do cliente e uma sugestão do que fazer; tratou, ele sai da lista.',
    tela: <TelaRadar />,
  },
];

const PERGUNTAS = [
  {
    p: 'Funciona com Google Meet, Microsoft Teams e Zoom?',
    r: 'Sim. Você pode colar a transcrição que essas ferramentas exportam, enviar o arquivo de áudio ou gravar a reunião pelo Chrome ou Edge: o microfone vira a fala do seu time e o som da aba da call vira a fala do cliente.',
  },
  {
    p: 'Preciso instalar alguma coisa?',
    r: 'Não. O Benjamin roda no navegador.',
  },
  {
    p: 'Onde ficam os dados das minhas reuniões?',
    r: 'Num banco de dados em São Paulo. CPF, CNPJ, e-mail, telefone e cartão são anonimizados antes da análise, e o que fica guardado é o texto já anonimizado. Cada empresa só enxerga as próprias contas.',
  },
  {
    p: 'O Benjamin usa inteligência artificial?',
    r: 'O áudio é transcrito por um serviço de transcrição (Whisper, da OpenAI). A leitura do risco segue regras que você pode auditar: por isso cada alerta mostra a fala exata que o gerou. Um resumo por IA é opcional, reunião a reunião.',
  },
  {
    p: 'E quando a reunião não deixa claro quem falou?',
    r: 'O Benjamin não chuta. Sem saber quem disse o quê, ele deixa de dar o risco daquela reunião em vez de inventar um número. Conta sem leitura aparece separada, nunca como risco zero.',
  },
];

/** Título da seção à esquerda, conteúdo à direita: a página é lida como um relatório. */
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto grid max-w-[1180px] gap-8 px-5 py-20 sm:px-8 lg:grid-cols-[280px_1fr] lg:gap-16 lg:py-24">
      <h2 className="max-w-[18ch] text-[28px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[32px]">{titulo}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function ApresentacaoPage() {
  return (
    // A landing é sempre clara, como o padrão do app: é lida como um documento.
    <div data-theme="light" className="landing min-h-dvh overflow-x-clip bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/apresentacao" className="flex items-center gap-2.5" aria-label="Benjamin, página inicial">
            <Logo size={26} />
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-1">
            <a
              href={CONTATO}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-9 items-center px-3 text-[13.5px] font-medium text-ink-dim transition-colors hover:text-ink sm:inline-flex"
            >
              Falar com a gente
            </a>
            <Link
              href="/login"
              className="inline-flex min-h-9 items-center px-3 text-[13.5px] font-semibold text-ink transition-colors hover:text-accent"
            >
              Entrar
            </Link>
            <span className="ml-2">
              <BotaoCriarConta compacto />
            </span>
          </nav>
        </div>
      </header>

      <main>
        {/* Topo: a promessa à esquerda, o produto funcionando à direita. */}
        <section className="mx-auto grid max-w-[1180px] items-start gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20">
          <div className="lg:pt-6">
            <h1 className="max-w-[16ch] text-[40px] font-bold leading-[1.06] tracking-[-0.03em] sm:text-[52px] lg:text-[56px]">
              {TITULO}.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[18px] leading-relaxed text-ink-dim">{DESCRICAO}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BotaoCriarConta />
              <BotaoDemo />
            </div>
            <p className="mt-10 max-w-[52ch] border-t border-line pt-4 text-[13.5px] leading-relaxed text-ink-faint">
              Dados guardados no Brasil. CPF, CNPJ e telefone anonimizados antes da análise. Todo alerta vem com a fala
              do cliente que o gerou.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[520px]">
            <RadarDeExemplo />
            <CartaoFala className="mt-6" />
            <p className="mt-2 text-[12px] text-ink-faint">Carteira de exemplo, com dados fictícios.</p>
          </div>
        </section>

        {/* Problema */}
        <div className="border-t border-line bg-surface">
          <Secao titulo="O cliente avisa antes de cancelar. O aviso fica na gravação.">
            <div className="grid max-w-[68ch] gap-5 text-[16.5px] leading-relaxed text-ink-dim">
              <p>
                Insatisfação com o suporte, um patrocinador que saiu da empresa, um concorrente que mandou proposta.
                Quase sempre isso aparece numa reunião semanas antes do cancelamento.
              </p>
              <p>
                Ninguém relê dezenas de reuniões por semana. O health score olha uso e NPS, não o que foi dito. E o
                time descobre o risco quando o pedido de cancelamento chega.
              </p>
            </div>
            <div className="mt-14">
              <LinhaDoTempo />
            </div>
          </Secao>
        </div>

        {/* O que o Benjamin marca */}
        <div className="border-t border-line">
          <Secao titulo="O que ele ouve nas reuniões">
            <p className="mb-8 max-w-[60ch] text-[16.5px] leading-relaxed text-ink-dim">
              Cada fala que muda o risco de uma conta ganha um nome. A cor é o nível de risco: vermelho, âmbar ou verde.
            </p>
            <TabelaDeFalas />
            <p className="mt-3 text-[12px] text-ink-faint">Exemplos de falas e do sinal que o Benjamin marca em cada uma.</p>
          </Secao>
        </div>

        {/* Como funciona: é uma sequência de verdade, por isso numerada. */}
        <div className="border-t border-line bg-surface">
          <Secao titulo="Como funciona">
            <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
              {PASSOS.map((passo, i) => (
                <li key={passo.titulo} className="flex flex-col">
                  <div className="min-h-[140px]">{passo.tela}</div>
                  <h3 className="mt-6 text-[17px] font-bold tracking-[-0.01em]">
                    <span className="mr-2 tabular-nums text-ink-faint">{i + 1}.</span>
                    {passo.titulo}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{passo.texto}</p>
                </li>
              ))}
            </ol>
          </Secao>
        </div>

        {/* A carteira num olhar */}
        <div className="border-t border-line">
          <Secao titulo="Do ponto no radar para a fala do cliente.">
            <p className="max-w-[60ch] text-[16.5px] leading-relaxed text-ink-dim">
              Ao lado do radar, as contas vêm na ordem certa: da maior receita em risco para a menor. Cada uma com a
              frase que explica o número, quem disse e em qual reunião.
            </p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {[
                { nome: 'Logística Ventura', meta: 'Contrato de R$ 240.000, 20 dias sem conversa', fala: 'a diretoria pediu para a gente olhar outras opções antes de renovar', risco: 81, cor: 'var(--risco)', tom: 'risk' as const },
                { nome: 'Grupo Tavares Varejo', meta: 'Contrato de R$ 510.000, 28 dias sem conversa', fala: 'o Marcos saiu e quem assume agora é a área financeira', risco: 58, cor: 'var(--atencao)', tom: 'neutro' as const },
                { nome: 'Escola Horizonte', meta: 'Contrato de R$ 48.000, 8 dias sem conversa', fala: 'o relatório novo virou rotina aqui', risco: 18, cor: 'var(--saude)', tom: 'neutro' as const },
              ].map((c) => (
                <li key={c.nome} className="grid grid-cols-[1fr_auto] gap-6 py-5">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{c.nome}</p>
                    <p className="mt-0.5 text-[13px] text-ink-faint">{c.meta}</p>
                    <Citacao texto={c.fala} tamanho="pequeno" tom={c.tom} className="mt-3" />
                  </div>
                  <p className="text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: c.cor }}>
                    {c.risco}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] text-ink-faint">Exemplo ilustrativo com dados fictícios.</p>
          </Secao>
        </div>

        {/* As duas regras */}
        <div className="border-t border-line bg-surface">
          <Secao titulo="Duas regras que o Benjamin não quebra">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
              <article>
                <h3 className="text-[17px] font-bold tracking-[-0.01em]">Nenhum alerta sem a fala que o sustenta</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
                  Todo sinal de risco vem com a frase exata, quem disse e em qual reunião. Seu time confere em segundos,
                  e ninguém precisa confiar numa caixa-preta.
                </p>
                <div className="mt-5 rounded-md bg-[var(--risco-suave)] p-4">
                  <Citacao texto="se não resolver a integração até dezembro a gente vai cancelar" tom="risk" />
                  <p className="mt-2 pl-5 text-[12.5px] font-semibold text-[var(--risco)]">Sinal marcado: intenção de cancelar</p>
                </div>
              </article>
              <article>
                <h3 className="text-[17px] font-bold tracking-[-0.01em]">Quando não dá para saber, ele não chuta</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
                  Se a gravação não deixa claro quem falou, a mesma frase pode ser uma ameaça ou o cliente defendendo o
                  seu produto. Nesse caso o Benjamin não dá número, e a conta aparece como sem leitura. Risco inventado
                  custa mais caro que risco nenhum.
                </p>
                <div className="mt-5 flex items-center gap-3 rounded-md border border-line px-4 py-4">
                  <span className="size-3 rounded-full border-2 border-ink-faint" aria-hidden />
                  <span className="text-[14px] font-semibold text-ink-dim">Agro Pampa</span>
                  <span className="ml-auto text-[13px] text-ink-faint">Sem leitura de risco</span>
                </div>
              </article>
            </div>
          </Secao>
        </div>

        {/* Privacidade */}
        <div className="border-t border-line">
          <Secao titulo="Feito para conversa de cliente">
            <ul className="grid gap-8 text-[15px] leading-relaxed text-ink-dim sm:grid-cols-3">
              <li>
                <strong className="block font-semibold text-ink">Dados no Brasil</strong>
                Banco de dados em São Paulo.
              </li>
              <li>
                <strong className="block font-semibold text-ink">Anonimização antes da análise</strong>
                CPF, CNPJ, e-mail, telefone e cartão nunca são guardados.
              </li>
              <li>
                <strong className="block font-semibold text-ink">Cada empresa no seu espaço</strong>
                Uma empresa nunca enxerga as contas de outra, e quem garante é o banco de dados.
              </li>
            </ul>
          </Secao>
        </div>

        {/* Perguntas */}
        <div className="border-t border-line bg-surface">
          <Secao titulo="Perguntas frequentes">
            <div className="max-w-[72ch] divide-y divide-line border-y border-line">
              {PERGUNTAS.map((item) => (
                <details key={item.p} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                    {item.p}
                    <span aria-hidden className="shrink-0 text-[20px] font-normal leading-none text-ink-faint group-open:hidden">
                      +
                    </span>
                    <span aria-hidden className="hidden shrink-0 text-[20px] font-normal leading-none text-ink-faint group-open:inline">
                      −
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-ink-dim">{item.r}</p>
                </details>
              ))}
            </div>
          </Secao>
        </div>

        {/* Chamado final */}
        <section className="border-t border-line">
          <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-24">
            <div>
              <h2 className="max-w-[20ch] text-[32px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[40px]">
                Veja o radar com as reuniões da sua empresa.
              </h2>
              <p className="mt-4 max-w-[56ch] text-[16.5px] leading-relaxed text-ink-dim">
                Crie a conta e analise a primeira reunião agora. Se preferir, na demonstração o Benjamin lê reuniões
                de contas que você já perdeu e mostra o que teria avisado antes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BotaoCriarConta />
              <BotaoDemo />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-8 text-[13px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            Benjamin, {TAGLINE.toLowerCase()}. Um produto{' '}
            <a href="https://ideonwork.com" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
              IDEON
            </a>
            .
          </p>
          <Link href="/login" className="hover:text-ink">
            Entrar
          </Link>
        </div>
      </footer>
    </div>
  );
}
