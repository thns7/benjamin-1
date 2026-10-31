/**
 * Marca do Benjamin.
 *
 * Um "B" geométrico em três peças: a haste é uma pílula e as duas barrigas são
 * blocos soltos, a de baixo maior. O vão entre as peças é o que faz a letra —
 * sem ele seria só um B grosso.
 *
 * Haste e barriga de cima leem `--ink` e invertem com o tema; a barriga de
 * baixo lê `--accent`, o verde-petróleo da marca. Não há
 * ficha atrás: o B é a marca inteira, e precisa funcionar sozinho no papel, no
 * cartão e gravado em relevo (ver a identidade em `IDENTIDADE.md`).
 *
 * Formas chapadas, sem gradiente nem `id` de SVG: a barra lateral e o
 * cabeçalho do mobile coexistem no DOM e não há nada para colidir.
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
      <MarcaFormas cor="var(--ink)" destaque="var(--accent)" />
    </svg>
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
      {/* A barriga de baixo é a assinatura: na cor da marca, a mesma forma das aspas das falas. */}
      <path d="M13 25C13 20.2 16.8 16 21.5 16A6 6 0 0 1 21.5 28H14Q13 28 13 27Z" fill={destaque} />
    </g>
  );
}

/**
 * O nome, escrito como nome: caixa normal, peso firme, sem espaçamento de
 * letreiro. Caixa alta fina e espaçada era o figurino de marca gerada; o B já
 * faz o trabalho de símbolo, a palavra só precisa ser lida.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`block text-[15px] font-bold leading-none tracking-[-0.01em] text-ink ${className}`}>
      Benjamin
    </span>
  );
}

/** A frase da marca. Um só lugar, para a barra lateral, o login e os metadados. */
export const TAGLINE = 'Conversas que viram retenção';
