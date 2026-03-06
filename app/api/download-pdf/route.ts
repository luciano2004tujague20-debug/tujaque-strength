import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

// 1. LISTA BLANCA EXACTA: Solo estos productos pueden descargarse
const ALLOWED_PRODUCTS: Record<string, { file: string; title: string }> = {
  'static-fuerza': { file: 'mesociclo-fuerza.pdf', title: 'FUERZA' },
  'static-hipertrofia': { file: 'mesociclo-hipertrofia.pdf', title: 'HIPERTROFIA' },
};

// Respaldo por si alguna orden vieja solo tiene el título
const FALLBACK_TITLES: Record<string, string> = {
  'protocolo fuerza base': 'static-fuerza',
  'mutación hipertrófica': 'static-hipertrofia',
  'mutacion hipertrofica': 'static-hipertrofia', 
};

export async function POST(request: Request) {
  try {
    // Recibimos solo el ID de la orden desde el frontend
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Falta el identificador de la orden' }, { status: 400 });
    }

    // 2. VERIFICAR QUIÉN ES EL USUARIO REAL (Cookies o Token explícito)
    const supabaseAuth = await createClient();
    
    // Leemos el token que nos va a mandar el frontend por las dudas
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    // Si hay token explícito lo usamos, si no, intentamos con las cookies
    const { data: { user }, error: authError } = token 
      ? await supabaseAuth.auth.getUser(token)
      : await supabaseAuth.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'No autorizado. Sesión inválida.' }, { status: 401 });
    }

    // 3. BUSCAR LA ORDEN EN LA BASE DE DATOS Y VERIFICAR QUE LE PERTENECE
    const { data: orderData, error: orderError } = await supabaseAuth
      .from('orders')
      .select('id, customer_name, customer_email, plan_title, plan_id, status')
      .eq('id', orderId)
      .eq('customer_email', user.email) // Protege que no descargue la orden de otro
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: 'Orden no encontrada o acceso denegado' }, { status: 403 });
    }

    if (orderData.status !== 'paid') {
      return NextResponse.json({ error: 'La orden no registra pago verificado' }, { status: 402 });
    }

    // 4. ELEGIR EL ARCHIVO CORRECTO (Lista Blanca)
    const planId = (orderData.plan_id || "").trim().toLowerCase();
    let productKey = planId;

    if (!ALLOWED_PRODUCTS[productKey]) {
      const planTitle = (orderData.plan_title || "").trim().toLowerCase();
      productKey = FALLBACK_TITLES[planTitle];
    }

    if (!productKey || !ALLOWED_PRODUCTS[productKey]) {
      return NextResponse.json({ error: 'Este producto no es un PDF descargable.' }, { status: 403 });
    }

    const { file: fileName, title: planNameClean } = ALLOWED_PRODUCTS[productKey];

    // 5. ENTRAR AL BUCKET PRIVADO (Usando la llave maestra)
    const supabaseAdmin = createAdminClient();

    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('private-pdfs')
      .download(fileName);

    if (fileError || !fileData) {
      console.error("Error buscando archivo en Supabase:", fileError);
      return NextResponse.json({ error: 'Archivo original no disponible' }, { status: 500 });
    }

    // 6. CREAR LA MARCA DE AGUA INVISIBLE
    const arrayBuffer = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    const today = new Date().toLocaleDateString('es-AR');
    const cleanName = orderData.customer_name || 'Atleta';
    
    const watermarkText = `LICENCIA EXCLUSIVA Y PERSONAL\nAtleta: ${cleanName}\nEmail: ${orderData.customer_email}\nOrden ID: ${orderData.id}\nFecha: ${today}\nProhibida su reventa - Tujague Strength`;

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - 150,
        y: height / 2 + 100,
        size: 14,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.35,
        rotate: degrees(45),
        lineHeight: 18,
      });
    });

    const pdfBytes = await pdfDoc.save();

    // 7. ENVIAR EL ARCHIVO AL NAVEGADOR DEL CLIENTE
    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Tujague_Protocolo_${planNameClean}_${cleanName.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error procesando descarga:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}