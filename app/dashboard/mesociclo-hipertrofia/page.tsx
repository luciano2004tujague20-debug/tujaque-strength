import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MesocicloHipertrofiaPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("commerce_entitlements")
    .select("id, code, name")
    .eq("code", "STATIC_HYPERTROPHY_MESO_ACCESS")
    .maybeSingle();

  if (entitlementError) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Error interno</h1>
        <p>No se pudo consultar el entitlement de hipertrofia.</p>
        <pre className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-sm overflow-x-auto">
          {entitlementError.message}
        </pre>
      </main>
    );
  }

  if (!entitlement) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Entitlement no encontrado</h1>
        <p>No existe el código <strong>STATIC_HYPERTROPHY_MESO_ACCESS</strong>.</p>
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
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Error interno</h1>
        <p>No se pudo consultar el acceso del usuario.</p>
        <pre className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-sm overflow-x-auto">
          {userEntitlementError.message}
        </pre>
      </main>
    );
  }

  const isExpired =
    !!userEntitlement?.expires_at &&
    new Date(userEntitlement.expires_at).getTime() < Date.now();

  const hasAccess = !!userEntitlement && !isExpired;

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-[#050505] text-white p-8 md:p-12">
        <div className="max-w-4xl mx-auto border border-zinc-800 bg-zinc-900/50 rounded-[2rem] p-8 md:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">
            Acceso bloqueado
          </p>

          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">
            Mesociclo Hipertrofia no habilitado
          </h1>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Tu usuario todavía no tiene acceso activo al producto{" "}
            <span className="text-emerald-400 font-bold">Mesociclo Hipertrofia 4 Semanas</span>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 md:p-12">
      <div className="max-w-5xl mx-auto border border-emerald-500/20 bg-zinc-900/50 rounded-[2rem] p-8 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-black mb-3">
          Acceso desbloqueado
        </p>

        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">
          Mesociclo Hipertrofia 4 Semanas
        </h1>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-8">
          Perfecto. Tu sistema leyó el entitlement real y desbloqueó este producto.
        </p>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Usuario
            </p>
            <p className="text-sm text-white">{user.email}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Entitlement
            </p>
            <p className="text-sm text-emerald-400 font-bold">{entitlement.code}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black mb-2">
              Estado
            </p>
            <p className="text-sm text-white">{userEntitlement.status}</p>
          </div>
        </div>
      </div>
    </main>
  );
}