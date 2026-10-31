# Identidade visual

Referência da marca do Benjamin, conceito **"Papel e tinta"** (2026-10-31). O código é a fonte da verdade: `components/logo.tsx` (marca), `components/radar-ui.tsx` (radar e citação), `app/globals.css` (cores e material) e `app/layout.tsx` (fontes).

## Posicionamento

**Radar de churn para Customer Success.** O Benjamin lê as reuniões com os clientes e põe no radar as contas em risco, sempre com a fala do cliente que gerou o alerta.

- **Frase da marca:** *Conversas que viram retenção.* (`TAGLINE` em `components/logo.tsx`)
- **Tom:** calmo, preciso, sem exagero. Nunca prometer o que o motor não mostra com evidência.

## Princípio visual

O Benjamin é uma ferramenta de trabalho lida durante o expediente, não uma vitrine. A interface se parece com um relatório bem diagramado: papel, tinta, linhas finas e a cor só onde ela quer dizer alguma coisa.

O que fica de fora, de propósito, porque é o figurino de interface gerada em série:

- violeta ou neon sobre fundo preto, brilho em botão, halo e degradê de fundo;
- vidro, desfoque e granulado;
- etiqueta em pílula acima do título, botão em pílula, ícone dentro de quadradinho colorido;
- ícone de "brilhinho" para tudo que envolve IA (o que vem de modelo se distingue pelo rótulo);
- entrada em cascata, revelação ao rolar, faixa que passa sem parar, varredura girando;
- caixa alta fina e espaçada no nome da marca.

## A peça central: o radar

Um radar circular, lido como gráfico. Cada conta é um ponto; **quanto mais perto do centro, maior o risco**. Os anéis ficam nos cortes de faixa (67 e 34), o tamanho do ponto é o contrato e o anel de risco alto tem um fundo vermelho muito leve. **Parado**: sem varredura e sem halo. Componente: `<RadarPolar>`; posições: `posicionarNoPolar()` em `lib/radar.ts`, estáveis por conta.

## Marca

Um **B geométrico em três peças**: a haste é uma pílula e as duas barrigas são blocos separados. **A barriga de baixo é verde-petróleo** e é a assinatura: a mesma forma das aspas que abrem cada fala do cliente.

- **Favicon:** `app/icon.svg` (claro e escuro conforme o sistema).
- **Ícone de app:** `app/apple-icon.tsx`, B de tinta sobre o papel.

## Nome

`Benjamin`: caixa normal, negrito, sem espaçamento de letreiro. Componente `<Wordmark />`.

## Cores

Três camadas, cada uma com um papel. **A marca nunca indica risco, e o risco nunca decora.**

| Camada | Claro (padrão) | Escuro (opcional) | Onde |
| --- | --- | --- | --- |
| Base: fundo | `#F4F5F5` | `#111415` | página |
| Base: painel | `#FFFFFF` | `#181C1D` | cartões, radar |
| Base: texto | `#15191A` | `#E9ECEC` | texto |
| Marca: texto, link, foco (`accent`) | `#0E5A63` | `#74BCC3` | links, menu ativo, foco |
| Marca: botão (`acao`) | `#0E5A63` + texto branco | `#2A7880` + texto branco | um botão principal por tela |
| Risco: saudável (`health`) | `#2B7544` | `#57B47C` | contas saudáveis |
| Risco: atenção (`warn`) | `#8F5C0B` | `#DFA043` | contas em atenção |
| Risco: alto (`risk`) | `#B3362B` | `#EF6A5E` | contas em risco alto |

- O papel é neutro, sem tom de creme.
- Todas as cores de risco passam no WCAG AA como texto sobre o painel.
- A landing é **sempre clara** (`data-theme="light"`), independente do tema escolhido no app.

## Material

Painel branco, linha fina de 1 px e, quando algo sobe de verdade, uma sombra curta com deslocamento. Cantos de 6 a 12 px. Card clicável só escurece a borda no hover; nada sobe e nada brilha.

## Tipografia

- **Public Sans** é a voz do sistema: navegação, títulos, números (`tabular-nums`). Uma grotesca de serviço público, feita para formulário e tabela.
- **Literata, em pé,** é a voz do cliente: **só** as citações literais das reuniões (`<Citacao>`). É transcrição, não epígrafe, por isso não vai em itálico.
- JetBrains Mono só para identificador técnico e para o campo onde se cola a transcrição.
- Menor corpo de texto: 11,5 px.

Rótulos em frase normal, sem caixa alta espaçada.

Sem travessão (— ou –) em texto da interface. Em **título** (reunião, alerta, aba do navegador), o separador é a barra reta: "Follow-up | integração de entregas". Em **frase**, use a pontuação que a frase pede: dois-pontos para explicação, ponto para uma segunda ideia, vírgula ou parênteses para um aposto. Valor ausente é "n/d". Intervalo numérico é "0 a 100". Transcrições e citações ficam como o cliente falou, porque a citação precisa bater letra por letra com a transcrição.

## Movimento

Só o que comunica estado: hover, foco, carregamento e progresso, entre 150 e 250 ms. Nenhuma animação de entrada, de rolagem ou em laço.

## Histórico

1. 2026-10: papel e tinta (preto e branco), depois carbono no lugar do azul.
2. 2026-10-29: conceito "Radar de verdade": escuro, violeta como marca, escala de risco viva, radar circular com varredura.
3. 2026-10-31: conceito "Papel e tinta": claro por padrão, verde-petróleo no lugar do violeta, radar parado, Public Sans e Literata, sem brilho, vidro nem animação decorativa. O motivo foi tirar a cara de SaaS gerado por IA.
