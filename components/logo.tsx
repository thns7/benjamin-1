/**
 * Marca do Benjamin.
 *
 * Um "B" geométrico em três peças: a haste é uma pílula e as duas barrigas são
 * blocos soltos, a de baixo maior. O vão entre as peças é o que faz a letra —
 * sem ele seria só um B grosso.
 *
 * Haste e barriga de cima leem `--ink` e invertem com o tema; a barriga de
 * baixo é a tinta da marca: faixas de marinho, azul escuro e azul claro. Não há
 * ficha atrás: o B é a marca inteira, e precisa funcionar sozinho no papel, no
 * cartão e gravado em relevo (ver a identidade em `IDENTIDADE.md`).
 *
 * O degradê precisa de um `id` de SVG. A barra lateral e o cabeçalho do
 * mobile coexistem no DOM, com um deles escondido, e um degradê definido num
 * SVG escondido não pinta no outro; por isso o `id` vem do tamanho, que nunca
 * se repete na mesma tela.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Benjamin"
      className="shrink-0"
    >
      <defs>
        <Tinta id={`tinta-${size}`} />
      </defs>
      <MarcaFormas cor="var(--ink)" destaque={`url(#tinta-${size})`} />
    </svg>
  );
}

/** A tinta da marca no SVG: as mesmas três faixas do `--tinta` do CSS, com a divisão seca. */
export function Tinta({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#07103f" />
      <stop offset="0.33" stopColor="#0c1d6b" />
      <stop offset="0.33" stopColor="#1336d9" />
      <stop offset="0.66" stopColor="#1f57f5" />
      <stop offset="0.66" stopColor="#18b4ff" />
      <stop offset="1" stopColor="#5fd0ff" />
    </linearGradient>
  );
}

/**
 * As três formas do B, separadas do `<svg>` para o ícone de tela inicial
 * (`app/apple-icon.tsx`) desenhar a mesma marca com cor fixa.
 */
export function MarcaFormas({ cor, destaque = cor }: { cor: string; destaque?: string }) {
  return (
    <g fill={cor}>
      <rect x="4.5" y="4" width="5.75" height="24" rx="2.875" />
      <path d="M14 4H19.5A5.5 5.5 0 0 1 19.5 15H14Q13 15 13 14V5Q13 4 14 4Z" />
      {/* A barriga de baixo é a assinatura: na tinta da marca, a mesma forma das aspas das falas. */}
      <path d="M13 25C13 20.2 16.8 16 21.5 16A6 6 0 0 1 21.5 28H14Q13 28 13 27Z" fill={destaque} />
    </g>
  );
}

/**
 * O nome espaçado é a identidade. Caixa alta e tracking largo transformam oito
 * letras em uma régua horizontal, por isso o wordmark nunca aparece em corpo
 * grande: ele ocupa largura, não altura.
 *
 * `aria-label` devolve a palavra inteira ao leitor de tela, que de outro modo
 * soletraria as letras uma a uma por causa do espaçamento.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-label="Benjamin"
      className={`block text-[12.5px] font-medium uppercase leading-none tracking-[0.42em] text-ink ${className}`}
    >
      Benjamin
    </span>
  );
}

/** A frase da marca. Um só lugar, para a barra lateral, o login e os metadados. */
export const TAGLINE = 'Conversas que viram retenção';
