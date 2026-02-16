import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usamos createClient explícito para asegurar privilegios de ADMIN
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    let { orderId } = params;

    // 1. LIMPIEZA DE BASURA: Si el navegador manda "TS-123.png", le quitamos el ".png"
    // Esto soluciona el error 404 que ves en la consola
    if (orderId.includes(".png") || orderId.includes(".jpg")) {
        orderId = orderId.split(".")[0];
    }

    console.log("🔍 API buscando ID limpio:", orderId);

    // 2. CONSULTA SEGURA (maybeSingle)
    // Usamos maybeSingle() en lugar de single(). 
    // single() da error si no encuentra nada. maybeSingle() devuelve null (más seguro).
    let query = supabaseAdmin.from("orders").select("*, plans(name)");

    // Detectamos si buscar por UUID o Texto
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    if (isUUID) {
      query = query.eq("id", orderId);
    } else {
      query = query.eq("order_id", orderId);
    }

    const { data, error } = await query.maybeSingle(); // <--- CAMBIO CLAVE

    // 3. DIAGNÓSTICO
    if (error) {
        console.error("🔥 Error Base de Datos:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        console.warn("⚠️ No se encontró la orden. Verificando contenido de la tabla...");
        // Hacemos una consulta rápida para ver qué hay realmente en la base de datos
        const check = await supabaseAdmin.from("orders").select("order_id, id").limit(3);
        console.log("👀 Muestra de IDs en la DB:", check.data);
        
        return NextResponse.json({ 
            error: "Orden no encontrada", 
            searched_for: orderId,
            db_sample: check.data 
        }, { status: 404 });
    }

    return NextResponse.json({ order: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- PATCH y DELETE (Optimizados con maybeSingle también) ---

export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const { status } = await req.json();
  
  let query = supabaseAdmin.from("orders").update({ status });

  if (orderId.startsWith("TS-")) query = query.eq("order_id", orderId);
  else query = query.eq("id", orderId);

  const { data, error } = await query.select().maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, order: data });
}

export async function DELETE(req: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  let query = supabaseAdmin.from("orders").delete();

  if (orderId.startsWith("TS-")) query = query.eq("order_id", orderId);
  else query = query.eq("id", orderId);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}