import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function safeName(name: string) {
  return name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120);
}

export async function POST(req: Request, ctx: { params: any }) {
  const params = await Promise.resolve(ctx.params);
  const orderId = String(params?.orderId || "").trim();
  if (!orderId) return Response.json({ error: "Falta orderId" }, { status: 400 });

  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const reference = String(form.get("reference") || "").trim();
  const file = form.get("file");

  if (!email) return Response.json({ error: "Falta email" }, { status: 400 });
  if (!(file instanceof File)) return Response.json({ error: "Falta archivo" }, { status: 400 });
  if (!supabaseAdmin) return Response.json({ error: "Database not configured" }, { status: 503 });

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Archivo demasiado grande (max 8MB)" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return Response.json({ error: "Tipo no permitido (PNG/JPG/WEBP/PDF)" }, { status: 400 });
  }

  // 1) buscar orden por order_id + email (seguridad)
  const { data: order, error: e1 } = await supabaseAdmin
    .from("orders")
    .select("id, order_id, customer_email, status")
    .eq("order_id", orderId)
    .single();

  if (e1 || !order) return Response.json({ error: "Orden no encontrada" }, { status: 404 });
  if (String(order.customer_email || "").toLowerCase() !== email) {
    return Response.json({ error: "Email no coincide con la orden" }, { status: 403 });
  }

  // 2) subir a storage
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const original = safeName(file.name || "comprobante");
  const path = `${order.order_id}/${ts}_${original}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  const up = await supabaseAdmin.storage
    .from("receipts")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (up.error) return Response.json({ error: up.error.message }, { status: 500 });

  // 3) insertar en receipts
  const ins = await supabaseAdmin.from("receipts").insert({
    order_uuid: order.id,
    file_path: path,
    file_mime: file.type,
    file_size: file.size,
    original_name: file.name || original,
    reference_text: reference || null,
  });

  if (ins.error) {
    // si falla insert, borramos el archivo para no dejar basura
    await supabaseAdmin.storage.from("receipts").remove([path]);
    return Response.json({ error: ins.error.message }, { status: 500 });
  }

  // 4) automatización: si aún no está aprobada/rechazada => under_review
  if (order.status !== "paid" && order.status !== "rejected") {
    await supabaseAdmin
      .from("orders")
      .update({ status: "under_review" })
      .eq("id", order.id);
  }

  return Response.json({ ok: true });
}
