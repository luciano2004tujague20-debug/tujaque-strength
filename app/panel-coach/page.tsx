"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
// 🔥 PASO 2.1: IMPORTAR EL NUEVO COMPONENTE 🔥
import FichaTactica from './FichaTactica';

export default function PanelCoach() {
    const supabase = createClient();
    
    const [activeTab, setActiveTab] = useState("atletas"); // 'atletas' o 'notificaciones'

    // Estados del Megáfono
    const [clients, setClients] = useState<any[]>([]);
    const [targetUser, setTargetUser] = useState("global");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [historyFilterUser, setHistoryFilterUser] = useState("all");

    // 🔥 PASO 2.2: ESTADOS PARA CONTROLAR LA FICHA TÁCTICA 🔥
    const [isFichaOpen, setIsFichaOpen] = useState(false);
    const [selectedClientForFicha, setSelectedClientForFicha] = useState<any>(null);

    useEffect(() => {
        fetchClients();
        fetchHistory();
    }, []);

    async function fetchClients() {
        const { data, error } = await supabase
            .from('orders')
            .select('user_id, customer_name, customer_email')
            .not('user_id', 'is', null);

        if (data) {
            const uniqueClients = Array.from(new Set(data.map(a => a.user_id)))
                .map(id => data.find(a => a.user_id === id))
                .filter(Boolean);
            setClients(uniqueClients);
        }
    }

    async function fetchHistory(userId?: string) {
        let query = supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        const filterToUse = userId !== undefined ? userId : historyFilterUser;

        if (filterToUse && filterToUse !== "all") {
            query = query.eq('user_id', filterToUse).eq('is_global', false);
        }

        const { data } = await query;
        if (data) setHistory(data);
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        const isGlobal = targetUser === "global";
        const userId = isGlobal ? null : targetUser;

        const { error } = await supabase
            .from('notifications')
            .insert([{ title, message, is_global: isGlobal, user_id: userId }]);

        setSending(false);

        if (error) {
            alert("❌ Error al enviar: " + error.message);
        } else {
            alert("✅ ¡Megáfono disparado con éxito!");
            setTitle("");
            setMessage("");
            fetchHistory();
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Seguro que querés eliminar esta alerta?")) return;
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (!error) fetchHistory();
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12 font-sans text-black overflow-x-hidden">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <span className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-sm">Centro de Comando Élite</span>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Panel <span className="text-amber-500">Coach</span></h1>
                    </div>
                    <Link href="/dashboard" className="text-xs font-bold text-gray-500 hover:text-black transition-colors bg-white px-5 py-3 rounded-full border border-gray-200 shadow-sm">← Volver al Dashboard</Link>
                </div>

                {/* SISTEMA DE PESTAÑAS (TABS) */}
                <div className="flex gap-2 p-1 bg-gray-200/50 rounded-2xl w-fit shadow-inner">
                    <button 
                        onClick={() => setActiveTab("atletas")}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "atletas" ? "bg-white text-black shadow-md" : "text-gray-500 hover:text-black"}`}
                    >
                        👥 Mis Atletas
                    </button>
                    <button 
                        onClick={() => setActiveTab("notificaciones")}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "notificaciones" ? "bg-white text-black shadow-md" : "text-gray-500 hover:text-black"}`}
                    >
                        📢 Megáfono
                    </button>
                </div>

                {/* =========================================
                    PESTAÑA 1: MIS ATLETAS (CRM)
                ========================================= */}
                {activeTab === "atletas" && (
                    <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] md:rounded-[4rem] shadow-sm animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                            <h3 className="font-black italic text-2xl uppercase tracking-tighter text-black">Tropa <span className="text-amber-500">Activa</span></h3>
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest border border-amber-200">{clients.length} Atletas</span>
                        </div>

                        {/* LISTA DE ATLETAS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {clients.length === 0 ? (
                                <p className="text-sm font-medium text-gray-400 italic col-span-full text-center mt-10">Cargando radar de clientes...</p>
                            ) : (
                                clients.map((client: any) => (
                                    <div key={client.user_id} className="bg-gray-50 border border-gray-100 p-7 rounded-3xl hover:border-amber-200 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-black text-xl shadow-inner border border-amber-200">
                                                    {(client.customer_name || client.customer_email).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-black text-base truncate">{client.customer_name || 'Atleta Sin Nombre'}</h4>
                                                    <p className="text-[10px] text-gray-400 truncate tracking-wide font-medium">{client.customer_email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* 🔥 PASO 2.3: CONECTAR BOTÓN CON LA FICHA 🔥 */}
                                        <button 
                                            onClick={() => {
                                                setSelectedClientForFicha(client); // Seteamos el cliente
                                                setIsFichaOpen(true); // Abrimos la ficha
                                            }}
                                            className="w-full mt-5 bg-white border border-gray-200 hover:border-black hover:bg-black hover:text-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                        >
                                            Ver Ficha Táctica →
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* =========================================
                    PESTAÑA 2: MEGÁFONO (NOTIFICACIONES)
                ========================================= */}
                {activeTab === "notificaciones" && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-300">
                        {/* FORMULARIO DE ENVÍO */}
                        <div className="lg:col-span-3 bg-white border border-gray-200 p-8 md:p-10 rounded-[2.5rem] shadow-sm">
                            <form onSubmit={handleSend} className="space-y-8">
                                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl shadow-inner">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 flex items-center gap-2"><span>🎯</span> Destino de la alerta</label>
                                    <select value={targetUser} onChange={(e) => setTargetUser(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-amber-500 transition-colors shadow-sm cursor-pointer">
                                        <option value="global">📢 ENVIAR A TODOS LOS ATLETAS (GLOBAL)</option>
                                        <optgroup label="Mensajes Privados (Individuales):">
                                            {clients.map((client: any) => (
                                                <option key={`notif-${client.user_id}`} value={client.user_id}>👤 {client.customer_name || client.customer_email}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">📝 Título</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Nueva Actualización de Rutina" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-base font-black outline-none focus:bg-white focus:border-amber-500 transition-colors shadow-inner placeholder:text-gray-300" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3 block">💬 Mensaje</label>
                                    <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribí el comunicado detallado acá..." className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none h-32 resize-none focus:bg-white focus:border-amber-500 transition-colors shadow-inner placeholder:text-gray-300 custom-scrollbar" />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={sending} className="w-full bg-black hover:bg-zinc-800 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                                        {sending ? 'TRANSMITIENDO...' : '🚀 DISPARAR NOTIFICACIÓN'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* HISTORIAL DE NOTIFICACIONES */}
                        <div className="lg:col-span-2 bg-white border border-gray-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full max-h-[700px]">
                            <h3 className="font-black italic text-xl uppercase tracking-tighter text-black mb-6">Historial de <span className="text-amber-500">Envíos</span></h3>
                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl mb-6 shadow-inner">
                                <label className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2"><span>🔍</span> Filtrar vista</label>
                                <select value={historyFilterUser} onChange={(e) => { setHistoryFilterUser(e.target.value); fetchHistory(e.target.value); }} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-amber-500 transition-colors shadow-sm cursor-pointer">
                                    <option value="all">📋 TODAS LAS NOTIFICACIONES</option>
                                    <optgroup label="Ver por Atleta Individual:">
                                        {clients.map((client: any) => (
                                            <option key={`hist-${client.user_id}`} value={client.user_id}>👤 {client.customer_name || client.customer_email}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 text-black">
                                {history.length === 0 ? (
                                    <p className="text-xs font-medium text-gray-400 text-center mt-10 italic">No hay alertas enviadas.</p>
                                ) : (
                                    history.map(notif => (
                                        <div key={notif.id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl relative group hover:border-red-200 transition-colors duration-300 shadow-sm">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{notif.is_global ? '📢' : '💬'}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{notif.is_global ? 'Global' : 'Privado'}</span>
                                                </div>
                                                <button onClick={() => handleDelete(notif.id)} className="text-gray-300 group-hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300" title="Retirar del sistema">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" /></svg>
                                                </button>
                                            </div>
                                            <h4 className="text-sm font-bold text-black leading-tight mb-1">{notif.title}</h4>
                                            <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed whitespace-pre-wrap line-clamp-2">{notif.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* 🔥 PASO 2.4: RENDERIZAR EL COMPONENTE AL FINAL (iOS slide-over style) 🔥 */}
            <FichaTactica 
                isOpen={isFichaOpen} 
                onClose={() => setIsFichaOpen(false)} 
                client={selectedClientForFicha} 
            />

        </div>
    );
}