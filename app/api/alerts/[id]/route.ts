import { NextResponse } from 'next/server';
import { supabaseConfigurado, supabaseServer } from '@/lib/supabase/server';

/**
 * Marca um alerta como tratado (ou o reabre).
 *
 * Usa a coluna `read` que já existe em `alerts`: tratado é lido e
 * encaminhado. Não precisou de migration.
 *
 * ⚠ Como as outras escritas, passa pela service_role e ainda não confere se o
 * alerta é da organização de quem pede (problema "Multiempresa" no cofre).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseConfigurado()) {
    return NextResponse.json({ erro: 'Banco não configurado.' }, { status: 503 });
  }

  const { id } = await params;
  const corpo = (await req.json().catch(() => null)) as { tratado?: unknown } | null;
  if (typeof corpo?.tratado !== 'boolean') {
    return NextResponse.json({ erro: 'Envie { "tratado": true } ou { "tratado": false }.' }, { status: 400 });
  }

  const { data, error } = await supabaseServer()
    .from('alerts')
    .update({ read: corpo.tratado })
    .eq('id', id)
    .select('id, read')
    .maybeSingle();

  if (error) return NextResponse.json({ erro: `Falha ao atualizar o alerta: ${error.message}` }, { status: 500 });
  if (!data) return NextResponse.json({ erro: 'Alerta não encontrado.' }, { status: 404 });
  return NextResponse.json({ id: data.id, tratado: data.read });
}
