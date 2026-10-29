import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseConfigurado, supabaseServer } from '@/lib/supabase/server';
import { contextoDoUsuario } from '@/lib/supabase/persistencia';

/**
 * Cadastra um produto ou concorrente no catálogo da empresa de quem pede.
 * O org_id vem do login, nunca do corpo; o RLS (migration 004) confere de novo.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Entrada = z.object({
  tipo: z.enum(['produto', 'concorrente']),
  nome: z.string().trim().min(2, 'Nome muito curto.').max(80, 'Nome muito longo.'),
  sinonimos: z
    .array(z.string().trim().min(2).max(80))
    .max(12, 'No máximo 12 sinônimos.')
    .default([]),
});

export async function POST(req: Request) {
  if (!supabaseConfigurado()) return NextResponse.json({ erro: 'Banco não configurado.' }, { status: 503 });

  const corpo = Entrada.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: corpo.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 422 });
  }
  const { tipo, nome } = corpo.data;
  // Sinônimo igual ao nome ou repetido não acrescenta nada.
  const sinonimos = [...new Set(corpo.data.sinonimos.filter((s) => s.toLowerCase() !== nome.toLowerCase()))];

  try {
    const ctx = await contextoDoUsuario();
    const sb = await supabaseServer();
    const { data, error } = await sb
      .from('catalogo_itens')
      .insert({ org_id: ctx.orgId, tipo, nome, sinonimos })
      .select('id')
      .single();
    if (error) {
      const duplicado = error.code === '23505';
      return NextResponse.json(
        { erro: duplicado ? `"${nome}" já está no catálogo.` : `Falha ao salvar: ${error.message}` },
        { status: duplicado ? 409 : 500 },
      );
    }
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : 'Erro ao salvar.' }, { status: 500 });
  }
}
