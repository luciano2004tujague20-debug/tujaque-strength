import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // 1. Verificación de seguridad
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) redirect("/admin/login");

  // 2. Recuperar datos de Supabase
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`*, plans(name)`)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-10 font-mono">
        Error cargando datos: {error.message}
      </div>
    );
  }

  // 3. Cálculos para las tarjetas de estadísticas
  const totalMoney = orders?.filter(o => o.status === 'paid').reduce((acc, curr) => acc + (curr.amount_ars || 0), 0) || 0;
  const pendingCount = orders?.filter(o => o.status !== 'paid' && o.status !== 'rejected').length || 0;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 flex justify-between items-end mb-2">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-emerald-500">TUJAQUE STRENGTH</h1>
              <p className="text-gray-500 text-sm">Gestión de órdenes y pagos</p>
            </div>
            <div className="text-xs text-gray-600 font-mono">Actualizado: {new Date().toLocaleTimeString()}</div>
          </div>
          
          <div className="bg-[#0a0a0a] border border-emerald-500/20 p-6 rounded-3xl shadow-2xl">
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Ingresos Aprobados</p>
            <p className="text-4xl font-black text-emerald-400 mt-2">${totalMoney.toLocaleString('es-AR')}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-yellow-500/20 p-6 rounded-3xl shadow-2xl">
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Pendientes</p>
            <p className="text-4xl font-black text-yellow-500 mt-2">{pendingCount}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl shadow-2xl">
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">Total Órdenes</p>
            <p className="text-4xl font-black text-white mt-2">{orders?.length || 0}</p>
          </div>
        </div>

        {/* TABLA DE ÓRDENES */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="p-5">Cliente</th>
                  <th className="p-5">Plan / Servicio</th>
                  <th className="p-5 text-center">Video</th>
                  <th className="p-5">Monto</th>
                  <th className="p-5 text-center">Estado</th>
                  <th className="p-5 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-5">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase text-sm tracking-tight">
                          {order.customer_name}
                        </div>
                        <div className="text-xs text-gray-500 lowercase">{order.customer_email}</div>
                      </Link>
                    </td>
                    <td className="p-5">
                      <span className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        {order.plans?.name || 'Plan Desconocido'}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      {order.extra_video ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">SÍ</span>
                      ) : <span className="text-gray-700 text-xs">-</span>}
                    </td>
                    <td className="p-5 font-mono font-bold text-emerald-400">
                      ${order.amount_ars?.toLocaleString('es-AR')}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase border ${
                        order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        order.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {order.status === 'paid' ? 'Aprobado' : order.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-5 text-right text-gray-500 text-[10px] font-mono">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}