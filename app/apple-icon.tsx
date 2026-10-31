import { ImageResponse } from 'next/og';
import { MarcaFormas } from '@/components/logo';

/**
 * Ícone de tela inicial do iPhone. O iOS não aceita SVG aqui, então a marca é
 * desenhada em PNG: B de tinta sobre o papel, com a barriga de baixo verde-petróleo.
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
          background: '#f4f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="104" height="104" viewBox="0 0 32 32" fill="none">
          {MarcaFormas({ cor: '#15191a', destaque: '#0e5a63' })}
        </svg>
      </div>
    ),
    size,
  );
}
