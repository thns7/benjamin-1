import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import { Shell } from '@/components/shell';
import { TAGLINE } from '@/components/logo';
import './globals.css';

/*
  Inter, como pede a identidade (`IDENTIDADE.md`). A versão anterior usava a
  Instrument Sans justamente para fugir do Inter; a identidade nova troca
  personalidade tipográfica por calma: o rosto da marca fica no B e no
  wordmark espaçado em peso leve, e o texto corrido só precisa ser legível em
  corpo pequeno, onde o Inter é dos melhores. O mono continua: este é um
  produto de números, e número fora de tabular-nums dança na tela.
*/
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/*
  A segunda voz da interface. O sistema fala em Inter; o CLIENTE fala em
  Newsreader itálico. Toda citação literal de uma reunião — o motivo de um
  alerta, um sinal de churn — aparece nesta serifa, e só ela. É o princípio do
  produto (nenhuma afirmação sem a fala que a sustenta) virando tipografia:
  dá para ver de longe o que é leitura do sistema e o que é fala de gente.
*/
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `Benjamin — ${TAGLINE.toLowerCase()}`,
    template: '%s · Benjamin',
  },
  description:
    'Radar de churn para Customer Success: lê as reuniões com seus clientes e avisa quando uma conta está em risco, sempre com a citação que gerou o alerta.',
};

/**
 * Aplica o tema salvo antes da primeira pintura, para não piscar.
 * O padrão é o escuro (conceito "Radar de verdade"); o claro é opcional,
 * guardado no localStorage.
 */
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem('benjamin-tema');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * A tela de entrada não usa o Shell.
   *
   * Com a navegação em volta, todo item do menu levaria de volta para o login —
   * e o `<div class="subir">` do Shell anima `transform`, o que cria contexto
   * de posicionamento e faz qualquer `position: fixed` dentro dele se ancorar
   * no main em vez da janela. O cartão de login saía recortado por causa disso.
   *
   * O caminho chega por cabeçalho, posto pelo middleware: server component não
   * lê a URL.
   */
  const caminho = (await headers()).get('x-benjamin-caminho') ?? '';
  // A landing (/apresentacao) também fica sem a navegação do produto.
  const semShell = caminho.startsWith('/login') || caminho.startsWith('/apresentacao');

  // O motor de ANÁLISE é sempre determinístico — toda extração que carrega
  // evidência sai de regras, com ou sem chave de LLM. O que a chave liga é o
  // enriquecimento opcional, sob demanda, por reunião.
  //
  // Antes esta linha exibia "híbrido" só por existir uma chave no ambiente,
  // enquanto nada de LLM rodava. Rótulo que não corresponde ao que executou é
  // exatamente o tipo de coisa que este produto se propõe a não fazer.
  const motor = 'regras';

  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className={`${inter.variable} ${newsreader.variable} ${jetbrains.variable} font-sans antialiased`}>
        {semShell ? children : <Shell motor={motor}>{children}</Shell>}
      </body>
    </html>
  );
}
