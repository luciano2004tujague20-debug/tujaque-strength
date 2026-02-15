import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Traemos las órdenes con TODOS los campos
    // 2. Hacemos JOIN con 'plans' para tener el nombre real del plan
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        plans (
          name,
          cadence,
          days
        )
      `)
      .order('created_at', { ascending: false }); // Las más nuevas arriba

    if (error) throw error;

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}