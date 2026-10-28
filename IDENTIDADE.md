# Identidade visual

Referência da marca do Benjamin. O código é a fonte da verdade: `components/logo.tsx` (marca e wordmark), `app/globals.css` (cores) e `app/layout.tsx` (fontes).

## Posicionamento

**Radar de churn para Customer Success.** O Benjamin lê as reuniões com os clientes e avisa quando uma conta está em risco, sempre com a citação que gerou o alerta.

- **Frase da marca:** *Conversas que viram retenção.* (`TAGLINE` em `components/logo.tsx`)
- **Tom:** calmo, preciso, sem exagero. Nunca prometer o que o motor não mostra com evidência.

## Marca

Um **B geométrico em três peças**: a haste é uma pílula e as duas barrigas são blocos separados, a de baixo maior. O vão entre as peças faz parte do desenho e não pode ser preenchido.

- **Uso:** tinta sobre papel ou papel sobre tinta. Sem gradiente, sombra, contorno ou outra cor.
- **Ícone de app:** o B em tinta sobre fundo `#FAFAFA` (`app/apple-icon.tsx`).
- **Favicon:** o B sem fundo, que inverte no tema escuro do sistema (`app/icon.svg`).
- **Área de proteção:** pelo menos a largura da haste em volta da marca.

## Wordmark

`B E N J A M I N`: caixa alta, peso leve (300) e tracking largo (0,42em a 0,5em). Ocupa largura, não altura, e nunca aparece em corpo grande. O componente é `<Wordmark />`.

## Cores

Todos os cinzas são **neutros** (sem fundo azulado): o preto da marca é carbono, `#161616`.

| Token | Hex | Uso |
| --- | --- | --- |
| Papel (`canvas`) | `#FAFAFA` | Fundo |
| Linha (`line`, `surface-3`) | `#E5E5E5` | Bordas e divisórias |
| Cinza médio | `#A3A3A3` | Traço, ícone decorativo e texto secundário no tema escuro. **Nunca texto sobre o papel** (contraste 2,4:1). |
| Carbono (`ink`, `accent`) | `#161616` | Texto, marca e ação primária |

Cores **funcionais**, fora da paleta da marca, que só aparecem quando carregam decisão:

| Token | Hex (claro) | Uso |
| --- | --- | --- |
| `health` | `#2E7D5B` | Conta saudável |
| `risk` | `#BE3F32` | Risco de churn e receita em risco |

O cinza de texto mais claro é `ink-faint` (`#6F6F6F`, 4,8:1 sobre o papel, passa no WCAG AA).

## Tipografia

- **Inter** para toda a interface.
- **JetBrains Mono** para números que mudam (com `tabular-nums`).

## Material

Plano, como papel: painel branco, linha fina e sombra curta e neutra. Grão quase invisível no fundo. A identidade anterior (vidro sobre atmosfera azul e lilás) foi substituída em 2026-10.
