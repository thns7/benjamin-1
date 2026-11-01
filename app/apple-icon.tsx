import { ImageResponse } from 'next/og';
import { MarcaFormas, Tinta } from '@/components/logo';

/**
 * Ícone de tela inicial do iPhone. O iOS não aceita SVG aqui, então a marca é
 * desenhada em PNG: B claro sobre o grafite, com a barriga de baixo na tinta azul.
 * Fundo sólido e cheio, porque o iOS arredonda o canto sozinho.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#121316',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="104" height="104" viewBox="0 0 32 32" fill="none">
          <defs>
            {Tinta({ id: 'tinta' })}
          </defs>
          {MarcaFormas({ cor: '#eaebee', destaque: 'url(#tinta)' })}
        </svg>
      </div>
    ),
    size,
  );
}
