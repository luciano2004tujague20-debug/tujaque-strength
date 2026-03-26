import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProductMetadata = {
  headline?: string;
  goal?: string;
  duration?: string;
  delivery_type?: string;
  includes?: string[];
  important_notes?: string[];
  pdf_url?: string | null; 
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// 👇 LINKS DE DESCARGA DE LOS PRODUCTOS ESTÁTICOS 👇
const LINK_DEL_KIT_ACELERADOR = "https://tiziowezshcdkzxabjso.supabase.co/storage/v1/object/public/material-vip/kit_acelerador_bii_vintage.pdf";
const LINK_BRAZOS_MUTANTES = "https://tiziowezshcdkzxabjso.supabase.co/storage/v1/object/public/material-vip/especializacion-brazos-mutantes.pdf"; // LINK AGREGADO

// 2. MAPA DE ENTITLEMENTS (Seguridad)
function getEntitlementCodeFromSlug(slug: string) {
  const map: Record<string, string> = {
    "mesociclo-fuerza-4-semanas": "STATIC_STRENGTH_MESO_ACCESS",
    "mesociclo-hipertrofia-4-semanas": "STATIC_HYPERTROPHY_MESO_ACCESS",
    "mesociclo-definicion-4-semanas": "STATIC_CUT_MESO_ACCESS", 
    "especializacion-brazos-mutantes": "STATIC_ARMS_ACCESS", // LLAVE AGREGADA AL MAPA
  };

  return map[slug] ?? null;
}

// 3. MAPA: TRADUCTOR PARA EL MOTOR DE PDF
function getPlanTypeFromSlug(slug: string) {
  if (slug.includes("fuerza")) return "fuerza";
  if (slug.includes("hipertrofia")) return "hipertrofia";
  if (slug.includes("definicion")) return "definicion";
  return "definicion"; // Por defecto
}

export default async function ProductoDinamicoPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const entitlementCode = getEntitlementCodeFromSlug(slug);

  if (!entitlementCode) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] text-black p-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-black mb-2">Producto no configurado</h1>
        <p className="text-gray-500 font-medium">No existe un entitlement asociado al slug <strong>{slug}</strong>.</p>
      </main>
    );
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("commerce_entitlements")
    .select("id, code, name")
    .eq("code", entitlementCode)
    .maybeSingle();

  if (entitlementError || !entitlement) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] text-black p-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-black mb-2">Error interno</h1>
        <p className="text-gray-500 font-medium">No se pudo consultar el entitlement.</p>
      </main>
    );
  }

  const { data: userEntitlement, error: userEntitlementError } = await supabase
    .from("commerce_user_entitlements")
    .select("id, status, expires_at, created_at")
    .eq("user_id", user.id)
    .eq("entitlement_id", entitlement.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (userEntitlementError) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] text-black p-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-black mb-2">Error interno</h1>
        <p className="text-gray-500 font-medium">No se pudo consultar el acceso del usuario.</p>
      </main>
    );
  }

  const isExpired =
    !!userEntitlement?.expires_at &&
    new Date(userEntitlement.expires_at).getTime() < Date.now();

  const hasAccess = !!userEntitlement && !isExpired;

  // 🔥 MAGIA NUEVA: VERIFICAMOS SI COMPRÓ EL ORDER BUMP 🔥
  const { data: orderData } = await supabase
    .from("commerce_orders")
    .select("metadata")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  // Busca en sus órdenes pagas si alguna tiene la etiqueta secreta del Order Bump
  const boughtOrderBump = orderData?.some(order => order.metadata?.has_order_bump === true) || false;

  const { data: product, error: productError } = await supabase
    .from("commerce_products")
    .select("name, slug, price, currency, metadata")
    .eq("slug", slug)
    .maybeSingle();

  if (productError || !product) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] text-black p-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-black mb-2">Producto no encontrado</h1>
        <p className="text-gray-500 font-medium">La URL no es válida.</p>
      </main>
    );
  }

  const metadata = (product.metadata || {}) as ProductMetadata;
  const includes = Array.isArray(metadata.includes) ? metadata.includes : [];
  const importantNotes = Array.isArray(metadata.important_notes)
    ? metadata.important_notes
    : [];

  // PANTALLA BLOQUEADA
  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-4 pt-10 pb-20 md:p-12 font-sans selection:bg-red-500 selection:text-white">
        <div className="max-w-3xl mx-auto border border-gray-200 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm opacity-50">
             🔒
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-black mb-3">
            Acceso bloqueado
          </p>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 text-black">
            {metadata.headline || product.name} no habilitado
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto">
            Tu usuario todavía no tiene acceso activo a este producto.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 text-left">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Producto</p>
              <p className="text-sm font-bold text-black">{product.name}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Precio Oficial</p>
              <p className="text-sm font-bold text-black">${Number(product.price).toLocaleString()} {product.currency}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Obtenemos qué plan tiene que abrir el PDF
  const planType = getPlanTypeFromSlug(slug);

  // PANTALLA DESBLOQUEADA
  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-4 pt-8 pb-20 md:p-12 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Botón de volver */}
      <div className="max-w-3xl mx-auto mb-6">
        <a href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm active:scale-95">
          <span>←</span> Volver a la Bóveda
        </a>
      </div>

      <div className="max-w-3xl mx-auto border border-gray-200 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
        
        {/* Etiqueta de Acceso */}
        <div className="inline-block bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full mb-6">
          <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-600 font-black flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Acceso Desbloqueado
          </p>
        </div>

        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 text-black">
          {metadata.headline || product.name}
        </h1>

        <p className="text-gray-500 font-medium text-sm md:text-base leading-relaxed mb-10 max-w-xl">
          {metadata.goal || "Producto desbloqueado correctamente. Ya podés descargar tu material oficial."}
        </p>

        {/* Info del usuario */}
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm shrink-0">👤</div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-0.5">Usuario Vinculado</p>
              <p className="text-xs md:text-sm font-bold text-black truncate">{user.email}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm shrink-0">⏱️</div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-0.5">Duración del Plan</p>
              <p className="text-xs md:text-sm font-bold text-black">{metadata.duration || "Vitalicio"}</p>
            </div>
          </div>
        </div>

        {/* Listas de Detalles */}
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-4">Qué incluye</p>
            <div className="space-y-2.5">
              {includes.length > 0 ? (
                includes.map((item, index) => (
                  <div key={index} className="text-xs font-medium text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> {item}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium">Contenido base desbloqueado.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-4">Notas importantes</p>
            <div className="space-y-2.5">
              {importantNotes.length > 0 ? (
                importantNotes.map((item, index) => (
                  <div key={index} className="text-xs font-medium text-gray-700 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span> {item}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-medium">Ninguna nota adicional.</p>
              )}
            </div>
          </div>
        </div>

        {/* ACÁ ESTÁ LA MAGIA DE LOS BOTONES DE DESCARGA */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          
          {/* LÓGICA DE BOTÓN DIFERENCIADA */}
          {slug === "especializacion-brazos-mutantes" ? (
            <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50/50 p-6 flex flex-col items-center sm:items-start justify-between">
              <div className="w-full mb-4">
                <p className="text-[10px] text-blue-600 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                  <span className="text-base">💪</span> Material Descargable
                </p>
              </div>
              <a
                href={LINK_BRAZOS_MUTANTES}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
              >
                📥 Descargar Especialización
              </a>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/50 p-6 flex flex-col items-center sm:items-start justify-between">
              <div className="w-full mb-4">
                <p className="text-[10px] text-emerald-600 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                  <span className="text-base">📄</span> Tu Material Principal
                </p>
              </div>
              <a
                href={`/pdf?plan=${planType}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-emerald-600 active:scale-95 transition-all shadow-sm"
              >
                🖨️ Generar Rutina (PDF)
              </a>
              <p className="text-[9px] text-emerald-700/60 mt-3 font-bold uppercase text-center sm:text-left w-full">
                * Licencia vinculada a tu email.
              </p>
            </div>
          )}

          {/* BOTÓN 2: KIT ACELERADOR (Solo visible si compró el Order Bump) */}
          {boughtOrderBump && (
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/50 p-6 flex flex-col items-center sm:items-start justify-between">
              <div className="w-full mb-4">
                <p className="text-[10px] text-amber-600 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                  <span className="text-base">🎁</span> Bonus Exclusivo Adquirido
                </p>
              </div>
              <a
                href={LINK_DEL_KIT_ACELERADOR}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-4 rounded-xl bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-amber-600 active:scale-95 transition-all shadow-sm"
              >
                ⚡ Descargar Kit BII
              </a>
              <p className="text-[9px] text-amber-700/60 mt-3 font-bold uppercase text-center sm:text-left w-full">
                * Protocolo articular y suplementación.
              </p>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}