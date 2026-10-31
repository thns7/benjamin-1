# Identidade visual

Referência da marca do Benjamin, conceito **"Grafite e ciano"** (2026-10-31). O código é a fonte da verdade: `components/logo.tsx` (marca), `components/radar-ui.tsx` (radar e citação), `app/globals.css` (cores, material e movimento), `app/apresentacao/landing.css` (movimento da landing) e `app/layout.tsx` (fontes).

## Posicionamento

**Radar de churn para Customer Success.** O Benjamin lê as reuniões com os clientes e põe no radar as contas em risco, sempre com a fala do cliente que gerou o alerta.

- **Frase da marca:** *Conversas que viram retenção.* (`TAGLINE` em `components/logo.tsx`)
- **Tom:** calmo, preciso, sem exagero. Nunca prometer o que o motor não mostra com evidência.

## Princípio visual

Grafite escuro, tinta clara, linhas finas e a cor só onde ela quer dizer alguma coisa: o verde ciano é a marca, e vermelho, âmbar e verde são risco. O movimento existe e é da marca (a varredura do radar, a faixa de falas), mas nada brilha.

O que fica de fora, de propósito, porque é o figurino de interface gerada em série:

- violeta ou neon com brilho, halo e degradê de fundo;
- vidro, desfoque e granulado;
- etiqueta em pílula acima do título, botão em pílula, ícone dentro de quadradinho colorido;
- ícone de "brilhinho" para tudo que envolve IA (o que vem de modelo se distingue pelo rótulo).

## A peça central: o radar

Um radar circular de verdade. Cada conta é um ponto; **quanto mais perto do centro, maior o risco**. Os anéis ficam nos cortes de faixa (67 e 34), o tamanho do ponto é o contrato e o anel de risco alto tem um fundo vermelho muito leve. Uma **varredura ciano gira sem parar** (parada para quem pede menos movimento); os pontos não brilham. Componente: `<RadarPolar>`; posições: `posicionarNoPolar()` em `lib/radar.ts`, estáveis por conta.

## Marca

Um **B geométrico em três peças**: a haste é uma pílula e as duas barrigas são blocos separados. **A barriga de baixo é verde ciano** e é a assinatura: a mesma forma das aspas que abrem cada fala do cliente.

- **Favicon:** `app/icon.svg` (claro e escuro conforme o sistema).
- **Ícone de app:** `app/apple-icon.tsx`, B claro sobre o grafite.

## Wordmark

`B E N J A M I N`: caixa alta, tracking largo, corpo pequeno. Ocupa largura, não altura. Componente `<Wordmark />`.

## Cores

Três camadas, cada uma com um papel. **A marca nunca indica risco, e o risco nunca decora.**

| Camada | Escuro (padrão) | Claro (opcional) | Onde |
| --- | --- | --- | --- |
| Base: fundo | `#121316` | `#F5F5F6` | página |
| Base: painel | `#1A1B1F` | `#FFFFFF` | cartões, radar |
| Base: texto | `#EAEBEE` | `#15171B` | texto |
| Marca: forte (`acao`) | `#1FD4B6` + texto `#04221E` | `#00C9AB` + texto `#04221E` | um botão principal por tela, barriga do B, varredura |
| Marca: texto, link, foco (`accent`) | `#3FE0C5` | `#00806E` | links, menu ativo, foco |
| Risco: saudável (`health`) | `#7CC35A` | `#3E7B1F` | contas saudáveis |
| Risco: atenção (`warn`) | `#DFA043` | `#8F5C0B` | contas em atenção |
| Risco: alto (`risk`) | `#EF6A5E` | `#B3362B` | contas em risco alto |

- A marca é o **verde ciano forte**. Saturado demais para segurar texto branco, por isso o botão leva texto escuro; no tema claro, onde a marca é texto sobre o papel, vale o mesmo tom mais fundo (`accent`).
- O verde de "saudável" puxa para o amarelo, para nunca ser lido como a marca.
- O grafite é neutro, sem fundo azulado; o claro é papel neutro, sem tom de creme.
- Todas as cores de risco passam no WCAG AA como texto sobre o painel.
- A landing é **sempre escura** (`data-theme="dark"`), independente do tema escolhido no app.

## Material

Painel liso, linha fina de 1 px e uma sombra curta com deslocamento. Cantos de 6 a 12 px. Card clicável sobe 2 px no hover e ganha sombra; nada brilha.

## Tipografia

- **Public Sans** é a voz do sistema: navegação, títulos, números (`tabular-nums`). Uma grotesca de serviço público, feita para formulário e tabela.
- **Literata, em pé,** é a voz do cliente: **só** as citações literais das reuniões (`<Citacao>`). É transcrição, não epígrafe, por isso não vai em itálico.
- JetBrains Mono só para identificador técnico e para o campo onde se cola a transcrição.
- Menor corpo de texto: 11,5 px.

Rótulos em frase normal, sem caixa alta espaçada; o wordmark é a única palavra em caixa alta.

Sem travessão (— ou –) em texto da interface. Em **título** (reunião, alerta, aba do navegador), o separador é a barra reta: "Follow-up | integração de entregas". Em **frase**, use a pontuação que a frase pede: dois-pontos para explicação, ponto para uma segunda ideia, vírgula ou parênteses para um aposto. Valor ausente é "n/d". Intervalo numérico é "0 a 100". Transcrições e citações ficam como o cliente falou, porque a citação precisa bater letra por letra com a transcrição.

## Movimento

- **App:** a tela entra subindo de leve no carregamento, card clicável sobe no hover, o `+` do botão principal gira no hover e a varredura do radar gira sem parar.
- **Landing:** a varredura do radar, a faixa de falas passando (pausa no hover), a onda de áudio das duas vozes, o grifo passando sobre a frase de risco, e revelações ao rolar, incluindo o trecho de risco da linha do tempo, que se desenha. As de rolagem são melhoria progressiva: sem suporte do navegador, o conteúdo aparece parado.
- Com `prefers-reduced-motion`, tudo para no estado final.

## Histórico

1. 2026-10: papel e tinta (preto e branco), depois carbono no lugar do azul.
2. 2026-10-29: conceito "Radar de verdade": escuro, violeta como marca, escala de risco viva, radar circular com varredura.
3. 2026-10-31: tirada a cara de SaaS gerado por IA (violeta, brilho, halo, vidro, granulado, pílulas, ícone de brilhinho). Public Sans e Literata. A marca passou por verde-petróleo (sem vida) e azul de caneta, e ficou no verde ciano forte; o wordmark espaçado foi mantido. Um teste em claro como padrão e sem animação foi revertido no mesmo dia: o escuro voltou a ser o padrão e as animações voltaram, sem brilho.
