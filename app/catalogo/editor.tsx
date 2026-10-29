'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, TriangleAlert, X } from 'lucide-react';

export type ItemTela = { id: string; nome: string; sinonimos: string[] };

const separar = (texto: string) =>
  texto
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);

/**
 * Uma coluna do catálogo: a lista e o formulário para acrescentar.
 * Depois de cada mudança a página recarrega no servidor.
 */
export function ColunaCatalogo({
  tipo,
  titulo,
  descricao,
  exemploNome,
  exemploSinonimos,
  itens,
}: {
  tipo: 'produto' | 'concorrente';
  titulo: string;
  descricao: string;
  exemploNome: string;
  exemploSinonimos: string;
  itens: ItemTela[];
}) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [sinonimos, setSinonimos] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErro(null);
    const r = await fetch('/api/catalogo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, nome: nome.trim(), sinonimos: separar(sinonimos) }),
    }).catch(() => null);
    const j = (await r?.json().catch(() => ({}))) as { erro?: string } | undefined;
    if (!r || !r.ok) {
      setErro(j?.erro ?? 'Não foi possível salvar. Tente de novo.');
      setEnviando(false);
      return;
    }
    setNome('');
    setSinonimos('');
    setEnviando(false);
    router.refresh();
  }

  async function remover(id: string) {
    setRemovendo(id);
    setErro(null);
    const r = await fetch(`/api/catalogo/${id}`, { method: 'DELETE' }).catch(() => null);
    if (!r || !r.ok) setErro('Não foi possível remover. Tente de novo.');
    setRemovendo(null);
    router.refresh();
  }

  const campo =
    'foco-no-campo mt-1.5 w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/20';

  return (
    <section className="vidro flex flex-col rounded-2xl">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em]">{titulo}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-dim">{descricao}</p>
      </div>

      {itens.length === 0 ? (
        <p className="px-5 py-6 text-[13px] text-ink-faint">Nada cadastrado ainda.</p>
      ) : (
        <ul className="divide-y divide-line">
          {itens.map((i) => (
            <li key={i.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{i.nome}</p>
                {i.sinonimos.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {i.sinonimos.map((s) => (
                      <span key={s} className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11.5px] text-ink-dim">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remover(i.id)}
                disabled={removendo === i.id}
                aria-label={`Remover ${i.nome}`}
                title="Remover"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-3 hover:text-risk disabled:opacity-50"
              >
                {removendo === i.id ? <Loader2 size={14} className="animate-spin" /> : <X size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={adicionar} className="mt-auto border-t border-line px-5 py-4">
        <label className="block text-[12px] font-semibold text-ink-dim" htmlFor={`${tipo}-nome`}>
          Nome
        </label>
        <input
          id={`${tipo}-nome`}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          minLength={2}
          maxLength={80}
          disabled={enviando}
          placeholder={exemploNome}
          className={campo}
        />
        <label className="mt-3 block text-[12px] font-semibold text-ink-dim" htmlFor={`${tipo}-sinonimos`}>
          Outros nomes que aparecem nas reuniões <span className="font-normal text-ink-faint">(opcional, separe por vírgula)</span>
        </label>
        <input
          id={`${tipo}-sinonimos`}
          value={sinonimos}
          onChange={(e) => setSinonimos(e.target.value)}
          disabled={enviando}
          placeholder={exemploSinonimos}
          className={campo}
        />
        <button
          type="submit"
          disabled={enviando || nome.trim().length < 2}
          className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-acao px-4 text-[13px] font-semibold text-on-acao transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enviando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Adicionar
        </button>
        {erro ? (
          <p role="alert" className="mt-3 flex items-start gap-1.5 text-[12.5px] text-risk">
            <TriangleAlert size={13} className="mt-0.5 shrink-0" />
            {erro}
          </p>
        ) : null}
      </form>
    </section>
  );
}
