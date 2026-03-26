"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MegafonoGlobal() {
    const supabase = createClient();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        const { data } = await supabase.from('notifications').select('*').eq('is_global', true).order('created_at', { ascending: false }).limit(20);
        if (data) setHistory(data);
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!window.confirm("ATENCIÓN: Esta alerta sonará en el celular de TODOS los atletas. ¿Proceder?")) return;
        setSending(true);

        const { error } = await supabase.from('notifications').insert([{ title, message, is_global: true, user_id: null }]);
        setSending(false);

        if (error) {
            alert("❌ Error: " + error.message);
        } else {
            alert("📢 ¡MEGÁFONO GLOBAL DISPARADO!");
            setTitle(""); setMessage(""); fetchHistory();
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Retirar alerta del sistema?")) return;
        await supabase.from('notifications').delete().eq('id', id);
        fetchHistory();
    };

    return (
        <div className="bg-transparent min-h-screen text-white font-sans p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-md">Centro de <span className="text-red-500">Comunicaciones</span></h1>
                    <p className="text-zinc-400 font-medium mt-2">Transmisión Global. Impacta a todos los usuarios activos del sistema.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* FORMULARIO */}
                    <div className="lg:col-span-3 bg-[#0a0a0c] border border-red-900/30 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.05)]">
                        <form onSubmit={handleSend} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2  flex items-center gap-2"><span className="text-lg">📢</span> Título del Comunicado</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Actualización del Sistema BII..." className="w-full bg-[#050505] border border-zinc-800 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-red-500 transition-colors shadow-inner" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2  flex items-center gap-2"><span className="text-lg">📝</span> Cuerpo del Mensaje</label>
                                <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Desarrolle la información aquí..." className="w-full bg-[#050505] border border-zinc-800 p-4 rounded-xl text-sm text-zinc-300 outline-none h-40 resize-none focus:border-red-500 transition-colors custom-scrollbar shadow-inner" />
                            </div>
                            <button type="submit" disabled={sending} className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:opacity-50 active:scale-95">
                                {sending ? 'TRANSMITIENDO SEÑAL...' : '🚀 DISPARAR A TODO EL PLANTEL'}
                            </button>
                        </form>
                    </div>

                    {/* HISTORIAL */}
                    <div className="lg:col-span-2 bg-[#0a0a0c] border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl h-full max-h-[600px] flex flex-col">
                        <h3 className="font-black italic text-xl uppercase tracking-tighter text-white mb-6 border-b border-zinc-800 pb-4">Últimas <span className="text-red-500">Transmisiones</span></h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                            {history.length === 0 ? (
                                <p className="text-xs text-zinc-500 italic text-center mt-10">No hay transmisiones globales recientes.</p>
                            ) : (
                                history.map(notif => (
                                    <div key={notif.id} className="bg-[#050505] border border-zinc-800 p-4 rounded-2xl group hover:border-red-500/50 transition-colors relative">
                                        <button onClick={() => handleDelete(notif.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                        <p className="text-[8px] text-red-500 font-black uppercase tracking-widest mb-1.5">{new Date(notif.created_at).toLocaleDateString('es-AR')}</p>
                                        <h4 className="text-sm font-bold text-white mb-1 pr-6">{notif.title}</h4>
                                        <p className="text-[10px] md:text-xs text-zinc-400 font-medium leading-relaxed line-clamp-3">{notif.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}