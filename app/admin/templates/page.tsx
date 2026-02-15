"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setTemplates(data || []);
    setLoading(false);
  }

  async function saveTemplate() {
    if (!newTitle || !newContent) return alert("Completá título y contenido");

    const { error } = await supabase
      .from("templates")
      .insert([{ title: newTitle, content: newContent }]);

    if (error) {
      alert("Error al guardar plantilla");
    } else {
      setNewTitle("");
      setNewContent("");
      fetchTemplates();
    }
  }

  // FUNCIÓN CLAVE: COPIAR AL PORTAPAPELES
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000); // El aviso dura 2 segundos
  };

  async function deleteTemplate(id: string) {
    if (!confirm("¿Borrar esta plantilla?")) return;
    await supabase.from("templates").delete().eq("id", id);
    fetchTemplates();
  }

  if (loading) return <div className="p-20 text-center text-emerald-500 font-black  italic animate-pulse">Abriendo el archivo maestro...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 animate-fade-in">
      <header className="mb-12">
        <h1 className="text-5xl font-black text-white italic tracking-tighter  leading-none">
          Plantillas <span className="text-emerald-400 text-3xl block mt-2 not-italic tracking-[0.3em]">BII-VINTAGE</span>
        </h1>
      </header>

      {/* CREADOR DE PLANTILLAS */}
      <section className="bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] p-10 mb-16 shadow-2xl">
        <h2 className="text-xs font-black text-emerald-500  tracking-[0.4em] mb-8 italic">Crear Nuevo Bloque Maestro</h2>
        <div className="space-y-6">
          <input 
            type="text" 
            placeholder="TÍTULO (EJ: BLOQUE A - EMPUJE PIERNAS)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-black  tracking-widest text-white outline-none focus:border-emerald-500/50 transition-all"
          />
          <textarea 
            placeholder="ESCRIBÍ LA ESTRUCTURA DE LA RUTINA ACÁ..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-zinc-300 outline-none focus:border-emerald-500/50 transition-all h-48 font-mono leading-relaxed"
          />
          <button 
            onClick={saveTemplate}
            className="w-full bg-emerald-500 text-black font-black  text-xs py-4 rounded-2xl hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
          >
            Guardar en la Librería 💾
          </button>
        </div>
      </section>

      {/* LISTADO DE PLANTILLAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {templates.map((t) => (
          <article key={t.id} className="bg-[#111113] border border-white/5 rounded-[2rem] p-8 flex flex-col group hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-black  italic text-white tracking-tight">{t.title}</h3>
              <button 
                onClick={() => deleteTemplate(t.id)}
                className="opacity-0 group-hover:opacity-100 text-[8px] font-black text-red-500/50 hover:text-red-500  transition-all"
              >
                Eliminar
              </button>
            </div>
            
            <div className="bg-black/40 rounded-xl p-6 text-[11px] text-zinc-500 font-mono mb-6 flex-1 line-clamp-6 leading-relaxed">
              {t.content}
            </div>

            <button 
              onClick={() => copyToClipboard(t.content, t.id)}
              className={`w-full py-4 rounded-xl font-black  text-[10px] tracking-widest transition-all border ${
                copyStatus === t.id 
                ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                : "bg-white/5 text-white border-white/10 hover:bg-white/10"
              }`}
            >
              {copyStatus === t.id ? "¡COPIADO! 🦍" : "Copiar Bloque 📋"}
            </button>
          </article>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
          <p className="text-zinc-700 font-black  italic text-sm tracking-[0.2em]">Tu librería de plantillas está vacía</p>
        </div>
      )}
    </div>
  );
}
