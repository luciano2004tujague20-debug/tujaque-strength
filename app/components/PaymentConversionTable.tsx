// app/components/PaymentConversionTable.tsx

import { getConversions } from "@/lib/pricing";

export function PaymentConversionTable({ priceArs }: { priceArs: number }) {
  const conversions = getConversions(priceArs);

  return (
    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 my-4">
      <h3 className="text-white font-bold mb-3 text-center">Resumen de Pago y Conversión</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-2 bg-zinc-800 rounded">
          <p className="text-zinc-400">Pesos Argentinos</p>
          <p className="text-green-400 font-mono text-lg">${conversions.ars.toLocaleString()}</p>
        </div>
        <div className="p-2 bg-zinc-800 rounded">
          <p className="text-zinc-400">Dólares (USD/USDT)</p>
          <p className="text-blue-400 font-mono text-lg">U$D {conversions.usd}</p>
        </div>
        <div className="p-2 bg-zinc-800 rounded col-span-2">
          <p className="text-zinc-400">Bitcoin (BTC)</p>
          <p className="text-orange-400 font-mono text-lg">₿ {conversions.btc}</p>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 mt-2 italic">* Cotización tomada a 1 USD = $1.250 ARS</p>
    </div>
  );
}