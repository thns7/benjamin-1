import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { JetBrains_Mono, Literata, Public_Sans } from 'next/font/google';
import { Shell } from '@/components/shell';
import { TAGLINE } from '@/components/logo';
import './globals.css';

/*
  Public Sans: a voz do sistema (`IDENTIDADE.md`). Uma grotesca de serviço
  público, feita para formulário, tabela e número, sem a cara de "produto de
  startup" do Inter, que era o rosto padrão de toda interface gerada. Tem
  algarismos tabulares, e este é um produto de números.
*/
const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

/*
  A segunda voz da interface: o CLIENTE fala em Literata, uma serifa desenhada
  para leitura longa em tela. Toda citação literal de uma reunião (o motivo de
  um alerta, um sinal de churn) aparece nesta serifa, e só ela. Em pé, não em
  itálico: é transcrição, não epígrafe.
*/
const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `Benjamin | ${TAGLINE.toLowerCase()}`,
    template: '%s | Benjamin',
  },
  description:
    'Radar de churn para Customer Success: lê as reuniões com seus clientes e avisa quando uma conta está em risco, sempre com a citação que gerou o alerta.',
};

/**
 * Aplica o tema salvo antes da primeira pintura, para não piscar.
 * O padrão é o escuro; o claro é opcional, guardado no localStorage.
 */
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem('benjamin-tema');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * A tela de entrada não usa o Shell.
   *
   * Com a navegação em volta, todo item do menu levaria de volta para o login.
   *
   * O caminho chega por cabeçalho, posto pelo middleware: server component não
   * lê a URL.
   */
  const caminho = (await headers()).get('x-benjamin-caminho') ?? '';
  // Landing, login, cadastro e criação da empresa ficam sem a navegação do produto.
  const semShell = ['/login', '/cadastro', '/comecar', '/apresentacao'].some((p) => caminho.startsWith(p));

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
      <body className={`${publicSans.variable} ${literata.variable} ${jetbrains.variable} font-sans antialiased`}>
        {semShell ? children : <Shell motor={motor}>{children}</Shell>}
      </body>
    </html>
  );
}
