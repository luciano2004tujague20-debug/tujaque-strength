// app/components/PaymentConversionTable.tsx

import { getConversions } from "@/lib/pricing";

export function PaymentConversionTable({ priceArs }: { priceArs: number }) {
  const conversions = getConversions(priceArs);

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 my-6 shadow-xl relative overflow-hidden">
      {/* Luz ambiental de fondo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] pointer-events-none"></div>

      <h3 className="text-white font-black italic mb-5 tracking-tight flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        TIPO DE <span className="text-emerald-500">CAMBIO REFERENCIAL</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
        
        {/* ARS */}
        <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Pesos Argentinos</p>
          <p className="text-emerald-400 font-black text-xl tracking-tight">${conversions.ars.toLocaleString()}</p>
        </div>
        
        {/* USD */}
        <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Dólares (USD/USDT)</p>
          <p className="text-blue-400 font-black text-xl tracking-tight">U$D {conversions.usd}</p>
        </div>
        
        {/* BTC */}
        <div className="p-4 bg-black/50 border border-zinc-800 rounded-xl col-span-2 flex justify-between items-center hover:border-zinc-600 transition-colors group">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Bitcoin (BTC)</p>
            <p className="text-[#F7931A] font-black text-xl tracking-tight">₿ {conversions.btc}</p>
          </div>
          <svg className="w-8 h-8 text-[#F7931A] opacity-20 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M14.653 10.999c1.077-.32 1.831-.968 1.831-2.146 0-1.782-1.554-2.132-3.111-2.132H10.15V3h-1.63v3.721H7.234V3H5.603v3.721H3v1.611h1.564v9.336H3v1.611h1.603V23h1.63v-3.721h1.287V23h1.63v-3.721h3.766c2.043 0 3.518-.755 3.518-2.614 0-1.572-1.157-2.188-2.315-2.454zM10.15 8.331h2.903c.85 0 1.571.21 1.571 1.05 0 .841-.72 1.05-1.571 1.05H10.15V8.331zm3.267 9.336H10.15v-2.312h3.267c1.111 0 1.831.242 1.831 1.156 0 .914-.72 1.156-1.831 1.156z"/></svg>
        </div>
        
      </div>
      
      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">* Cotización tomada a 1 USD = $1.250 ARS</p>
      </div>
    </div>
  );
}