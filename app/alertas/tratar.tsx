'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, RotateCcw, TriangleAlert } from 'lucide-react';

/**
 * Marca o alerta como tratado ou o reabre. Depois do sucesso a página é
 * recarregada no servidor, e o alerta muda de aba.
 */
export function BotaoTratar({ alertaId, tratado }: { alertaId: string; tratado: boolean }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar() {
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch(`/api/alerts/${alertaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tratado: !tratado }),
      });
      const j = (await r.json().catch(() => ({}))) as { erro?: string };
      if (!r.ok) {
        setErro(j.erro ?? `Falha ao atualizar (HTTP ${r.status}).`);
        setEnviando(false);
        return;
      }
      router.refresh();
      // O refresh é assíncrono; soltar o botão só depois evita duplo clique.
      setTimeout(() => setEnviando(false), 600);
    } catch {
      setErro('Não foi possível falar com o servidor.');
      setEnviando(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={alternar}
        disabled={enviando}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors disabled:opacity-60 ${
          tratado
            ? 'border border-line bg-surface-2 text-ink-dim hover:border-line-strong hover:text-ink'
            : 'bg-acao text-on-acao hover:shadow-glow'
        }`}
      >
        {enviando ? <Loader2 size={12} className="animate-spin" /> : tratado ? <RotateCcw size={12} /> : <Check size={12} />}
        {tratado ? 'Reabrir' : 'Marcar como tratado'}
      </button>
      {erro ? (
        <span className="inline-flex items-center gap-1 text-[11px] text-risk">
          <TriangleAlert size={11} />
          {erro}
        </span>
      ) : null}
    </span>
  );
}
