import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Logo, TAGLINE, Wordmark } from '@/components/logo';
import {
  Citacao,
  CartaoFala,
  FaixaDeFalas,
  ItemGarantia,
  LinhaDoTempo,
  RadarDeExemplo,
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
 * Cor: a escala de risco (verde, âmbar, vermelho) é a paleta da landing.
 * Animações e as regras de movimento reduzido estão em landing.css.
 */

const TITULO = 'Saiba quais clientes vão cancelar antes da renovação';
const DESCRICAO =
  'O Benjamin lê as reuniões do seu time de Customer Success e avisa quando uma conta está em risco, sempre com a fala do cliente que mostra por quê.';

export const metadata: Metadata = {
  title: { absolute: 'Benjamin — radar de churn para Customer Success' },
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, type: 'website', locale: 'pt_BR', siteName: 'Benjamin' },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRICAO },
};

/** Contato comercial: o Benjamin é vendido pela IDEON. Um lugar só para trocar. */
const CONTATO = `https://wa.me/5511991926994?text=${encodeURIComponent(
  'Olá! Quero ver uma demonstração do Benjamin, o radar de churn para Customer Success.',
)}`;

function BotaoDemo({ invertido = false }: { invertido?: boolean }) {
  return (
    <a
      href={CONTATO}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-[14.5px] font-semibold transition-all ${
        invertido ? 'bg-ink text-canvas hover:shadow-[0_8px_28px_-6px_rgb(255_255_255/0.35)]' : 'border border-line-strong text-ink hover:border-ink'
      }`}
    >
      Pedir uma demonstração
      <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

/** Ação principal: o cadastro é aberto (migration 003). */
function BotaoCriarConta({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link
      href="/cadastro"
      className={`inline-flex items-center rounded-full bg-acao font-semibold text-on-acao shadow-glow transition-all hover:brightness-110 ${
        compacto ? 'min-h-10 px-4 text-[13px]' : 'min-h-12 px-6 text-[14.5px]'
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

export default function ApresentacaoPage() {
  return (
    // A landing é sempre escura: é onde o radar e a escala de risco brilham,
    // e não muda se o visitante deixou o app no tema claro.
    <div data-theme="dark" className="landing min-h-dvh overflow-x-clip bg-canvas text-ink">
      <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/apresentacao" className="flex items-center gap-2.5" aria-label="Benjamin, página inicial">
            <Logo size={28} />
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href={CONTATO}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center rounded-full px-4 text-[13px] font-medium text-ink-dim transition-colors hover:text-ink sm:inline-flex"
            >
              Falar com a gente
            </a>
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center rounded-full px-4 text-[13px] font-semibold text-ink transition-colors hover:text-accent"
            >
              Entrar
            </Link>
            <BotaoCriarConta compacto />
          </nav>
        </div>
      </header>

      <main>
        {/* Topo — o fundo tem um halo da escala de risco atrás da reunião. */}
        <section className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-12%] top-[-20%] h-[820px] w-[900px] rounded-full bg-[radial-gradient(circle,rgb(110_91_255/0.28),transparent_62%)]"
          />
          <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-20 lg:pt-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] font-medium text-ink-dim">
                <span className="h-1.5 w-6 rounded-full escala-gradiente" aria-hidden />
                Radar de churn para Customer Success
              </p>
              <h1 className="mt-5 max-w-[15ch] text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[60px] lg:text-[68px]">
                {TITULO}.
              </h1>
              <p className="mt-6 max-w-[46ch] text-[17.5px] leading-relaxed text-ink-dim">{DESCRICAO}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <BotaoCriarConta />
                <BotaoDemo />
              </div>
              <ul className="mt-10 flex max-w-[58ch] flex-wrap gap-x-6 gap-y-2.5 text-[13px] text-ink-dim">
                <ItemGarantia>Dados guardados no Brasil</ItemGarantia>
                <ItemGarantia>CPF, CNPJ e telefone anonimizados</ItemGarantia>
                <ItemGarantia>Todo alerta com a fala do cliente</ItemGarantia>
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-[540px] lg:pl-8">
              <RadarDeExemplo />
              <CartaoFala className="relative z-20 mt-5 sm:absolute sm:mt-0 sm:bottom-28 sm:left-[-1.5rem] sm:w-[330px] lg:left-[-3rem]" />
            </div>
          </div>
        </section>

        {/* Faixa de falas */}
        <section aria-label="Sinais que o Benjamin marca" className="pb-16">
          <FaixaDeFalas />
          <p className="mx-auto mt-3 max-w-[1180px] px-5 text-[12px] text-ink-faint sm:px-8">
            Exemplos de falas e do sinal que o Benjamin marca em cada uma. A cor é o nível de risco.
          </p>
        </section>

        {/* Problema */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-28">
            <div className="revela grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
              <h2 className="max-w-[16ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px]">
                O cliente avisa antes de cancelar. O aviso fica na gravação.
              </h2>
              <div className="space-y-5 text-[16.5px] leading-relaxed text-ink-dim">
                <p>
                  Insatisfação com o suporte, um patrocinador que saiu da empresa, um concorrente que mandou proposta.
                  Quase sempre isso aparece numa reunião semanas antes do cancelamento.
                </p>
                <p>
                  Ninguém relê dezenas de reuniões por semana. O health score olha uso e NPS, não o que foi dito. E o
                  time descobre o risco quando o pedido de cancelamento chega.
                </p>
              </div>
            </div>
            <div className="revela mt-16">
              <LinhaDoTempo />
            </div>
          </div>
        </section>

        {/* Como funciona — é uma sequência de verdade, por isso numerada. */}
        <section className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-28">
          <h2 className="revela text-[34px] font-semibold tracking-[-0.03em] sm:text-[44px]">Como funciona</h2>
          <ol className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="revela flex flex-col">
                <div className="min-h-[150px]">{passo.tela}</div>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-acao text-[12.5px] font-semibold text-on-acao">
                    {i + 1}
                  </span>
                  <h3 className="text-[19px] font-semibold tracking-[-0.015em]">{passo.titulo}</h3>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* A carteira num olhar */}
        <section className="border-y border-line bg-canvas-deep">
          <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-28">
            <div className="revela">
              <h2 className="max-w-[14ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px]">
                Do ponto no radar para a fala do cliente.
              </h2>
              <p className="mt-5 max-w-[44ch] text-[16.5px] leading-relaxed text-ink-dim">
                Ao lado do radar, as contas vêm na ordem certa: da maior receita em risco para a menor. Cada uma com a
                frase que explica o número, quem disse e em qual reunião.
              </p>
              <ul className="mt-8 space-y-3 text-[14.5px] text-ink-dim">
                <li className="flex items-center gap-3">
                  <span className="size-3 rounded-full bg-[var(--risco)]" aria-hidden />
                  Risco alto: trate primeiro
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-3 rounded-full bg-[var(--atencao)]" aria-hidden />
                  Atenção: acompanhe de perto
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-3 rounded-full bg-[var(--saude)]" aria-hidden />
                  Saudável: espaço para expandir
                </li>
              </ul>
            </div>
            <div className="revela">
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {[
                  { nome: 'Logística Ventura', meta: 'Contrato de R$ 240.000, 20 dias sem conversa', fala: 'a diretoria pediu para a gente olhar outras opções antes de renovar', risco: 81, cor: 'var(--risco)', tom: 'risk' as const },
                  { nome: 'Grupo Tavares Varejo', meta: 'Contrato de R$ 510.000, 28 dias sem conversa', fala: 'o Marcos saiu e quem assume agora é a área financeira', risco: 58, cor: 'var(--atencao)', tom: 'neutro' as const },
                  { nome: 'Escola Horizonte', meta: 'Contrato de R$ 48.000, 8 dias sem conversa', fala: 'o relatório novo virou rotina aqui', risco: 18, cor: 'var(--saude)', tom: 'neutro' as const },
                ].map((c) => (
                  <li key={c.nome} className="grid grid-cols-[1fr_auto] gap-5 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold">{c.nome}</p>
                      <p className="mt-0.5 text-[12.5px] text-ink-faint">{c.meta}</p>
                      <Citacao texto={c.fala} tamanho="pequeno" tom={c.tom} className="mt-3" />
                    </div>
                    <p className="text-[34px] font-semibold leading-none tracking-[-0.04em] tabular-nums" style={{ color: c.cor }}>
                      {c.risco}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11.5px] text-ink-faint">Exemplo ilustrativo com dados fictícios.</p>
            </div>
          </div>
        </section>

        {/* As duas regras */}
        <section className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-28">
          <h2 className="revela max-w-[20ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px]">
            Duas regras que o Benjamin não quebra
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="revela relative overflow-hidden rounded-3xl border border-line bg-surface p-7">
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--risco)]" aria-hidden />
              <h3 className="text-[19px] font-semibold tracking-[-0.015em]">Nenhum alerta sem a fala que o sustenta</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
                Todo sinal de risco vem com a frase exata, quem disse e em qual reunião. Seu time confere em segundos,
                e ninguém precisa confiar numa caixa-preta.
              </p>
              <div className="mt-6 rounded-2xl bg-[var(--risco-suave)] p-4">
                <Citacao texto="se não resolver a integração até dezembro a gente vai cancelar" tom="risk" />
                <p className="mt-2 pl-[18px] text-[12px] font-medium text-[var(--risco)]">Sinal marcado: intenção de cancelar</p>
              </div>
            </article>
            <article className="revela relative overflow-hidden rounded-3xl border border-line bg-surface p-7">
              <div className="absolute inset-x-0 top-0 h-1 bg-ink-faint" aria-hidden />
              <h3 className="text-[19px] font-semibold tracking-[-0.015em]">Quando não dá para saber, ele não chuta</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
                Se a gravação não deixa claro quem falou, a mesma frase pode ser uma ameaça ou o cliente defendendo o
                seu produto. Nesse caso o Benjamin não dá número, e a conta aparece como sem leitura. Risco inventado
                custa mais caro que risco nenhum.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-line-strong px-4 py-4">
                <span className="size-3 rounded-full border-2 border-ink-faint" aria-hidden />
                <span className="text-[13.5px] font-semibold text-ink-dim">Agro Pampa</span>
                <span className="ml-auto text-[12.5px] text-ink-faint">Sem leitura de risco</span>
              </div>
            </article>
          </div>
        </section>

        {/* Privacidade */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex items-center gap-3 lg:w-[34%]">
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--saude-suave)]">
                <ShieldCheck size={20} className="text-[var(--saude)]" aria-hidden />
              </span>
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">Feito para conversa de cliente</h2>
            </div>
            <ul className="grid flex-1 gap-6 text-[15px] leading-relaxed text-ink-dim sm:grid-cols-3">
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
          </div>
        </section>

        {/* Perguntas */}
        <section className="mx-auto max-w-[820px] px-5 py-20 sm:px-8 lg:py-28">
          <h2 className="text-[34px] font-semibold tracking-[-0.03em] sm:text-[44px]">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {PERGUNTAS.map((item) => (
              <details key={item.p} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16.5px] font-semibold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                  {item.p}
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[18px] font-normal leading-none text-ink-dim transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-ink-dim">{item.r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Chamado final */}
        <section className="px-5 pb-16 sm:px-8">
          <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[32px] border border-line bg-surface">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-48 -right-24 h-[520px] w-[720px] rounded-full bg-[radial-gradient(circle,rgb(110_91_255/0.35),transparent_62%)]"
            />
            <div className="relative flex flex-col items-start gap-8 px-7 py-16 sm:px-12 lg:flex-row lg:items-end lg:justify-between lg:py-20">
              <div>
                <div aria-hidden className="mb-8 h-1.5 w-24 rounded-full escala-gradiente" />
                <h2 className="max-w-[18ch] text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">
                  Veja o radar com as reuniões da sua empresa.
                </h2>
                <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-ink-dim">
                  Crie a conta e analise a primeira reunião agora. Se preferir, na demonstração o Benjamin lê reuniões
                  de contas que você já perdeu e mostra o que teria avisado antes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <BotaoCriarConta />
                <BotaoDemo />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 pb-10 text-[12.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
      </footer>
    </div>
  );
}
