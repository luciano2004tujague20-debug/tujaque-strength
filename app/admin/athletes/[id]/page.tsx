"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function EditAthlete() {
  const { id } = useParams();
  const router = useRouter();
  const [athlete, setAthlete] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthlete = async () => {
      const { data } = await supabase.from("athletes").select("*").eq("id", id).single();
      setAthlete(data);
      setLoading(false);
    };
    fetchAthlete();
  }, [id]);

  const updateRecords = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("athletes").update({
      squat_1rm: athlete.squat_1rm,
      bench_1rm: athlete.bench_1rm,
      deadlift_1rm: athlete.deadlift_1rm
    }).eq("id", id);

    if (error) alert("Error");
    else {
      alert("Marcas actualizadas");
      router.push("/admin/athletes");
    }
  };

  if (loading) return <div className="p-20 text-center">Cargando...</div>;

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-3xl font-black mb-8 italic uppercase">{athlete.full_name}</h1>
      
      <form onSubmit={updateRecords} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Squat (kg)</label>
            <input type="number" value={athlete.squat_1rm} onChange={e => setAthlete({...athlete, squat_1rm: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white font-black" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Bench (kg)</label>
            <input type="number" value={athlete.bench_1rm} onChange={e => setAthlete({...athlete, bench_1rm: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white font-black" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Deadlift (kg)</label>
            <input type="number" value={athlete.deadlift_1rm} onChange={e => setAthlete({...athlete, deadlift_1rm: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white font-black" />
          </div>
        </div>
        
        <button type="submit" className="w-full bg-emerald-500 py-5 rounded-2xl font-black text-black uppercase">Guardar Cambios</button>
      </form>
    </div>
  );
}