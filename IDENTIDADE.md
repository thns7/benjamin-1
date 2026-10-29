# Identidade visual

Referência da marca do Benjamin, conceito **"Radar de verdade"** (2026-10-29). O código é a fonte da verdade: `components/logo.tsx` (marca), `components/radar-ui.tsx` (radar e citação), `app/globals.css` (cores) e `app/layout.tsx` (fontes).

## Posicionamento

**Radar de churn para Customer Success.** O Benjamin lê as reuniões com os clientes e põe no radar as contas em risco, sempre com a fala do cliente que gerou o alerta.

- **Frase da marca:** *Conversas que viram retenção.* (`TAGLINE` em `components/logo.tsx`)
- **Tom:** calmo, preciso, sem exagero. Nunca prometer o que o motor não mostra com evidência.

## A peça central: o radar

Um radar circular de verdade. Cada conta é um ponto; **quanto mais perto do centro, maior o risco**. Os anéis ficam nos cortes de faixa (67 e 34), o tamanho do ponto é o contrato e uma varredura violeta gira sem parar (parada para quem pede menos movimento). Componente: `<RadarPolar>`; posições: `posicionarNoPolar()` em `lib/radar.ts`, estáveis por conta.

## Marca

Um **B geométrico em três peças**: a haste é uma pílula e as duas barrigas são blocos separados. **A barriga de baixo é violeta** e é a assinatura: a mesma forma das aspas que abrem cada fala do cliente.

- **Favicon:** `app/icon.svg` (claro e escuro conforme o sistema).
- **Ícone de app:** `app/apple-icon.tsx`, B claro sobre o fundo escuro.

## Wordmark

`B E N J A M I N`: caixa alta, peso leve (300), tracking largo. Componente `<Wordmark />`.

## Cores

Três camadas, cada uma com um papel. **A marca nunca indica risco, e o risco nunca decora.**

| Camada | Escuro (padrão) | Claro (opcional) | Onde |
| --- | --- | --- | --- |
| Base: fundo | `#0B0A10` | `#FAFAFA` | página |
| Base: painel | `#14121C` | `#FFFFFF` | cartões, radar |
| Base: texto | `#F4F3F7` | `#161616` | texto |
| Marca: texto, link, foco (`accent`) | `#8B7BFF` | `#5B3FD9` | links, menu ativo, foco |
| Marca: botão (`acao`) | `#6A55F5` + texto branco | `#5B3FD9` | um botão principal por tela |
| Risco: saudável (`health`) | `#3FB67F` | `#2E7D5B` | contas saudáveis |
| Risco: atenção (`warn`) | `#E9A23B` | `#9A6410` | contas em atenção |
| Risco: alto (`risk`) | `#FF5A4E` | `#BE3F32` | contas em risco alto |

- No claro, âmbar e vermelho escurecem para passar no WCAG AA como texto.
- `acao` existe porque o violeta claro (bom como texto sobre o escuro) não segura texto branco em cima.
- A landing é **sempre escura** (`data-theme="dark"`), independente do tema escolhido no app.

## Tipografia

- **Inter** é a voz do sistema: navegação, títulos, números (`tabular-nums`).
- **Newsreader itálico** é a voz do cliente: **só** as citações literais das reuniões (`<Citacao>`).
- JetBrains Mono só para identificador técnico.

Rótulos em frase normal, sem caixa alta espaçada; o wordmark é a única palavra em caixa alta.

Sem travessão (— ou –) em texto da interface. Em **título** (reunião, alerta, aba do navegador), o separador é a barra reta: "Follow-up | integração de entregas". Em **frase**, use a pontuação que a frase pede: dois-pontos para explicação, ponto para uma segunda ideia, vírgula ou parênteses para um aposto. Valor ausente é "n/d". Intervalo numérico é "0 a 100". Transcrições e citações ficam como o cliente falou, porque a citação precisa bater letra por letra com a transcrição.

## Movimento

A varredura do radar e as revelações ao rolar da landing (melhoria progressiva). Com `prefers-reduced-motion`, tudo para no estado final.

## Histórico

1. 2026-10: papel e tinta (preto e branco), depois carbono no lugar do azul.
2. 2026-10-29: conceito "Radar de verdade" — escuro, violeta como marca, escala de risco viva, radar circular.
