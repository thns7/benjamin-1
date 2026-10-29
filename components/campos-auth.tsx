import type { ReactNode } from 'react';

/*
 * Peças das telas de entrada (login, cadastro, criar empresa): o mesmo campo,
 * o mesmo rótulo e o mesmo botão nas três.
 */

export const classeRotulo = 'block text-[12px] font-semibold text-ink-dim';
export const classeCampo =
  'mt-2 flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20';
// O foco aparece no contorno do campo inteiro (focus-within), não no input.
export const classeInput =
  'foco-no-campo w-full bg-transparent py-2.5 text-[13.5px] text-ink outline-none placeholder:text-ink-faint disabled:cursor-not-allowed';
export const classeBotao =
  'mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-acao text-[13.5px] font-semibold text-on-acao transition-all duration-300 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none';

export function Campo({
  id,
  rotulo,
  icone,
  children,
  className = '',
}: {
  id: string;
  rotulo: string;
  icone: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={classeRotulo}>
        {rotulo}
      </label>
      <div className={classeCampo}>
        <span className="shrink-0 text-ink-faint">{icone}</span>
        {children}
      </div>
    </div>
  );
}
