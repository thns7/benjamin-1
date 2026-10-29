import { ImageResponse } from 'next/og';
import { MarcaFormas } from '@/components/logo';

/**
 * Ícone de tela inicial do iPhone. O iOS não aceita SVG aqui, então a marca é
 * desenhada em PNG: B claro sobre o fundo escuro, com a barriga de baixo violeta.
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
          background: '#0b0a10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="104" height="104" viewBox="0 0 32 32" fill="none">
          {MarcaFormas({ cor: '#f4f3f7', destaque: '#8b7bff' })}
        </svg>
      </div>
    ),
    size,
  );
}
