import { NextResponse } from 'next/server';
import { supabaseConfigurado, supabaseServer } from '@/lib/supabase/server';

/** Tira um item do catálogo. O RLS só deixa apagar item da própria empresa. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseConfigurado()) return NextResponse.json({ erro: 'Banco não configurado.' }, { status: 503 });
  const { id } = await params;
  const sb = await supabaseServer();
  const { data, error } = await sb.from('catalogo_itens').delete().eq('id', id).select('id');
  if (error) return NextResponse.json({ erro: `Falha ao remover: ${error.message}` }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ erro: 'Item não encontrado.' }, { status: 404 });
  return NextResponse.json({ removido: id });
}
