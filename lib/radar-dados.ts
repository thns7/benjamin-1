import { supabaseServer } from './supabase/server';
import { montarRadar, type Radar } from './radar';

/**
 * Carrega do banco o que o radar precisa, numa ida só por tabela — nada de N+1
 * por conta. A montagem fica em `radar.ts`, que não conhece o Supabase.
 *
 * Sem filtro por empresa aqui de propósito: `supabaseServer()` lê com o login
 * do usuário, e o RLS (migration 002) só devolve o que é da empresa dele.
 */
export async function carregarRadar(): Promise<Radar> {
  const sb = await supabaseServer();

  const [clientesRes, reunioesRes, analisesRes, alertasRes] = await Promise.all([
    sb.from('customers').select('id, name, segment, contract_value'),
    sb.from('meetings').select('id, customer_id, title, meeting_date').limit(5000),
    sb
      .from('analyses')
      .select('meeting_id, churn_risk, churn_signals, competitors, created_at')
      .order('created_at', { ascending: true })
      .limit(5000),
    sb.from('alerts').select('customer_id, read').limit(5000),
  ]);

  for (const [nome, r] of [
    ['clientes', clientesRes],
    ['reuniões', reunioesRes],
    ['análises', analisesRes],
    ['alertas', alertasRes],
  ] as const) {
    if (r.error) throw new Error(`Falha ao carregar ${nome}: ${r.error.message}`);
  }

  return montarRadar({
    clientes: clientesRes.data ?? [],
    reunioes: reunioesRes.data ?? [],
    analises: analisesRes.data ?? [],
    alertas: alertasRes.data ?? [],
  });
}
