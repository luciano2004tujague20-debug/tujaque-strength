import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. Verificar si las claves existen (sin mostrarlas por seguridad)
  const checks = {
    URL_Supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    Clave_Service_Role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    Token_MercadoPago: !!process.env.MP_ACCESS_TOKEN,
  };

  // 2. Intentar hablar con la Base de Datos
  let dbStatus = "Probando conexión...";
  let dbError = null;
  let columnsCheck = null;

  if (!supabaseAdmin) {
    return NextResponse.json({
      diagnostico: checks,
      base_de_datos: "No configurado - faltan variables de entorno",
      error_detalle: "NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY no están definidos",
      columnas: null
    }, { status: 200 });
  }

  try {
    // Intentamos leer 1 orden para ver si tenemos permiso
    const { data, error } = await supabaseAdmin.from("orders").select("*").limit(1);
    
    if (error) {
      throw error;
    }
    
    dbStatus = "Conexión EXITOSA 🟢";
    
    // Verificamos si existen las columnas nuevas intentando seleccionarlas
    const { error: colError } = await supabaseAdmin
      .from("orders")
      .select("extra_video, payment_id")
      .limit(1);

    if (colError) {
      columnsCheck = "❌ Faltan columnas (extra_video o payment_id)";
    } else {
      columnsCheck = "✅ Las columnas existen";
    }

  } catch (e: any) {
    dbStatus = "FALLÓ la conexión 🔴";
    dbError = e.message || JSON.stringify(e);
  }

  return NextResponse.json({
    diagnostico: checks,
    base_de_datos: dbStatus,
    error_detalle: dbError,
    columnas: columnsCheck
  }, { status: 200 });
}
