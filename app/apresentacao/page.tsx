import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Check, FileAudio, FolderUp, Mic, ShieldCheck } from 'lucide-react';
import { Logo, TAGLINE, Wordmark } from '@/components/logo';
import { Citacao } from '@/components/radar-ui';

/*
 * Landing pública do Benjamin — o que um visitante sem login vê em "/".
 *
 * O middleware reescreve "/" para cá quando não há sessão; quem está logado
 * vai direto ao Radar. Esta página não usa o Shell (ver app/layout.tsx).
 *
 * Regra de conteúdo: nada inventado. Sem depoimento, logo de cliente ou
 * número de uso que não exista. A confiança vem do que é verdade no produto:
 * evidência literal, abstenção, anonimização e dados no Brasil.
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
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-[14px] font-semibold transition-shadow ${
        invertido ? 'bg-canvas text-ink hover:shadow-[0_6px_20px_-6px_rgb(255_255_255/0.35)]' : 'bg-ink text-canvas hover:shadow-glow'
      }`}
    >
      Pedir uma demonstração
      <ArrowUpRight size={15} aria-hidden />
    </a>
  );
}

/**
 * O cartão do topo: uma conta, a fala que a pôs em risco e o ponto deslizando
 * para a zona vermelha. É o produto inteiro em um quadro, e a única animação
 * da página (desligada para quem pede menos movimento).
 */
function CartaoConta() {
  return (
    <figure
      aria-label="Exemplo: uma conta em risco no Benjamin"
      className="relative rounded-2xl border border-line bg-surface p-6 shadow-lift sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Logística Ventura</p>
          <p className="mt-0.5 text-[12.5px] text-ink-faint">Contrato de R$ 240.000, renova em janeiro</p>
        </div>
        <div className="text-right">
          <p className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-risk tabular-nums">81</p>
          <p className="mt-1 text-[11.5px] font-medium text-risk">subiu 39 desde o último QBR</p>
        </div>
      </div>

      <Citacao
        texto="a diretoria pediu para a gente olhar outras opções antes de renovar"
        tamanho="grande"
        tom="risk"
        className="mt-6"
      />
      <p className="mt-2 pl-[22px] text-[12px] text-ink-faint">
        <span className="text-ink-dim">Renata, gerente de operações</span>, na reunião de renovação
      </p>

      {/* Régua de risco: o ponto sai do médio e entra na zona alta. */}
      <div className="mt-7" aria-hidden>
        <div className="relative h-7">
          <div className="absolute inset-y-0 left-[67%] right-0 rounded-r-md bg-risk-soft" />
          <div className="absolute inset-y-0 left-[34%] border-l border-dashed border-line-strong" />
          <div className="absolute bottom-0 left-0 right-0 border-t border-ink/60" />
          <span className="landing-ponto absolute bottom-0 block size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-risk ring-4 ring-surface" />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink-faint">
          <span>risco baixo</span>
          <span className="font-medium text-risk">alto</span>
        </div>
      </div>

      <figcaption className="mt-5 border-t border-line pt-3 text-[11.5px] text-ink-faint">
        Exemplo ilustrativo com dados fictícios.
      </figcaption>
    </figure>
  );
}

const PASSOS = [
  {
    titulo: 'Traga as reuniões',
    texto:
      'Cole a transcrição que o Meet, o Teams ou o Zoom já geram, envie o áudio ou grave a call pelo navegador. Dá para importar dezenas de uma vez.',
    icones: [FolderUp, FileAudio, Mic],
  },
  {
    titulo: 'O Benjamin lê cada conversa',
    texto:
      'Separa o que o cliente disse do que o seu time disse, mede o risco de churn de 0 a 100 e marca sinais como insatisfação, troca de patrocinador e concorrente citado.',
    icones: [],
  },
  {
    titulo: 'Seu time age na conta certa',
    texto:
      'O radar ordena a carteira pela receita em risco. Cada alerta chega com a fala do cliente e uma sugestão do que fazer; tratou, ele sai da lista.',
    icones: [],
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
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/apresentacao" className="flex items-center gap-2.5" aria-label="Benjamin, página inicial">
          <Logo size={28} />
          <Wordmark />
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
        >
          Entrar
        </Link>
      </header>

      <main>
        {/* Topo */}
        <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-16">
          <div>
            <p className="text-[13px] font-medium text-ink-dim">Radar de churn para times de Customer Success</p>
            <h1 className="mt-4 max-w-[15ch] text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[60px] lg:text-[68px]">
              {TITULO}.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-ink-dim">{DESCRICAO}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <BotaoDemo />
              <Link href="/login" className="text-[14px] font-medium text-ink-dim underline decoration-line-strong underline-offset-4 hover:text-ink">
                Já uso o Benjamin
              </Link>
            </div>
            <ul className="mt-10 flex max-w-[58ch] flex-wrap gap-x-6 gap-y-2.5 text-[13px] text-ink-dim">
              {['Dados guardados no Brasil', 'CPF, CNPJ e telefone anonimizados', 'Todo alerta com a fala do cliente'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-ink" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <CartaoConta />
        </section>

        {/* Problema */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-28">
            <h2 className="max-w-[16ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[42px]">
              O cliente avisa antes de cancelar. O aviso fica na gravação.
            </h2>
            <div className="space-y-5 text-[16px] leading-relaxed text-ink-dim">
              <p>
                Insatisfação com o suporte, um patrocinador que saiu da empresa, um concorrente que mandou proposta.
                Quase sempre isso aparece numa reunião semanas antes do cancelamento.
              </p>
              <p>
                O problema é que ninguém relê dezenas de reuniões por semana. O health score olha uso e NPS, não o que
                foi dito. E o time descobre o risco quando o pedido de cancelamento chega.
              </p>
              <p className="font-medium text-ink">
                O Benjamin lê todas as conversas e põe o que importa na frente de quem pode agir.
              </p>
            </div>
          </div>
        </section>

        {/* Como funciona — é uma sequência de verdade, por isso numerada. */}
        <section className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-28">
          <h2 className="text-[34px] font-semibold tracking-[-0.03em] sm:text-[42px]">Como funciona</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="border-t border-ink pt-5">
                <span className="text-[13px] font-semibold tabular-nums text-ink-faint">{i + 1}</span>
                <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.015em]">{passo.titulo}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">{passo.texto}</p>
                {passo.icones.length > 0 ? (
                  <div className="mt-4 flex gap-2 text-ink-faint" aria-hidden>
                    {passo.icones.map((Icone, k) => (
                      <Icone key={k} size={17} />
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* As duas regras */}
        <section className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-8 lg:pb-28">
          <h2 className="max-w-[20ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[42px]">
            Duas regras que o Benjamin não quebra
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-line bg-surface p-7">
              <h3 className="text-[19px] font-semibold tracking-[-0.015em]">Nenhum alerta sem a fala que o sustenta</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
                Todo sinal de risco vem com a frase exata, quem disse e em qual reunião. Seu time confere em segundos,
                e ninguém precisa confiar numa caixa-preta.
              </p>
              <Citacao texto="se não resolver a integração até dezembro a gente vai cancelar" className="mt-6" />
              <p className="mt-2 pl-[18px] text-[12px] text-ink-faint">Sinal marcado: intenção de cancelar</p>
            </article>
            <article className="rounded-2xl border border-line bg-surface p-7">
              <h3 className="text-[19px] font-semibold tracking-[-0.015em]">Quando não dá para saber, ele não chuta</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-dim">
                Se a gravação não deixa claro quem falou, a mesma frase pode ser uma ameaça ou o cliente defendendo
                o seu produto. Nesse caso o Benjamin não dá número, e a conta aparece como sem leitura. Risco
                inventado custa mais caro que risco nenhum.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-line-strong px-4 py-3">
                <span className="text-[13px] font-semibold text-ink-dim">Agro Pampa</span>
                <span className="ml-auto text-[12.5px] text-ink-faint">Sem leitura de risco</span>
              </div>
            </article>
          </div>
        </section>

        {/* Privacidade */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="flex items-center gap-3 lg:w-[34%]">
              <ShieldCheck size={22} className="shrink-0" aria-hidden />
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">Feito para conversa de cliente</h2>
            </div>
            <ul className="grid flex-1 gap-5 text-[15px] leading-relaxed text-ink-dim sm:grid-cols-3">
              <li>
                <strong className="block font-semibold text-ink">Dados no Brasil</strong>
                Banco de dados em São Paulo.
              </li>
              <li>
                <strong className="block font-semibold text-ink">Anonimização antes da análise</strong>
                CPF, CNPJ, e-mail, telefone e cartão nunca são guardados.
              </li>
              <li>
                <strong className="block font-semibold text-ink">Acesso por convite</strong>
                Cada empresa só enxerga as próprias contas.
              </li>
            </ul>
          </div>
        </section>

        {/* Perguntas */}
        <section className="mx-auto max-w-[820px] px-5 py-20 sm:px-8 lg:py-28">
          <h2 className="text-[34px] font-semibold tracking-[-0.03em] sm:text-[42px]">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {PERGUNTAS.map((item) => (
              <details key={item.p} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16.5px] font-semibold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                  {item.p}
                  <span
                    aria-hidden
                    className="text-[22px] font-normal leading-none text-ink-faint transition-transform group-open:rotate-45"
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
        <section className="bg-ink text-canvas">
          <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-24">
            <div>
              <h2 className="max-w-[18ch] text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[46px]">
                Veja o radar com as reuniões da sua empresa.
              </h2>
              <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-canvas/70">
                Na demonstração, o Benjamin lê reuniões de contas que você já perdeu e mostra o que teria avisado
                antes.
              </p>
            </div>
            <BotaoDemo invertido />
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-8 text-[12.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
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
