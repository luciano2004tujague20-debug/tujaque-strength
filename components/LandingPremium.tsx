"use client";

import React from 'react';

export default function LandingPremium() {
  return (
    // Contenedor principal de la página: Fondo negro, texto blanco
    <div className="bg-[#050505] text-zinc-100 min-h-screen font-sans selection:bg-red-600 selection:text-white">
      
      {/* =========================================
          FASE 1: HERO, AUDIENCIA Y VSL
      ========================================= */}

      {/* 1. HERO SECTION (Promesa y Diferenciador) */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 flex flex-col items-center justify-center text-center overflow-hidden border-b border-zinc-900/50">
        {/* Efecto de luz futurista de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-[#050505] to-[#050505] -z-10"></div>
        
        <span className="text-orange-500 font-black tracking-[0.2em] text-[10px] sm:text-xs uppercase mb-6 border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.1)]">
          Tecnología Clínica Tujague BII
        </span>
        
        {/* Título principal combinando Serif cursiva (estilo Times) y gradientes */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter mb-6 max-w-5xl leading-none drop-shadow-2xl">
          DESATA TU <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">POTENCIAL GENÉTICO</span> EN 12 SEMANAS
        </h1>
        
        <p className="text-zinc-400 text-sm md:text-lg max-w-2xl mb-10 font-medium leading-relaxed">
          El único ecosistema de entrenamiento que fusiona la brutalidad de la vieja escuela con Inteligencia Artificial biomecánica para que no pierdas ni un solo día de progreso.
        </p>
        
        <button className="bg-gradient-to-r from-red-700 to-red-500 text-white font-black uppercase tracking-widest px-10 py-5 rounded-full text-sm md:text-base shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all duration-300">
          QUIERO MUTAR AHORA
        </button>
        <p className="mt-5 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
          Dirigido por el Coach Tujague
        </p>
      </section>

      {/* 2. PARA QUIÉN ES + QUÉ VAN A LOGRAR */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Columna Izquierda: Dolor */}
          <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group hover:border-red-900/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-full -z-10 group-hover:bg-red-600/10 transition-colors"></div>
            <h3 className="text-sm font-black text-red-500 mb-6 uppercase tracking-widest border-b border-zinc-800 pb-4">Esta transmisión es para ti si:</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-red-600 shrink-0">■</span> Estás estancado en tus levantamientos hace meses sin ver cambios visuales.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-red-600 shrink-0">■</span> Te sientes fatigado crónicamente y tu sistema nervioso central está frito.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-red-600 shrink-0">■</span> Quieres una estructura militar: saber exactamente qué hacer y cuándo hacerlo.</li>
            </ul>
          </div>

          {/* Columna Derecha: Solución/Video */}
          <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group hover:border-orange-900/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-10 group-hover:bg-orange-500/10 transition-colors"></div>
            <h3 className="text-sm font-black text-orange-500 mb-6 uppercase tracking-widest border-b border-zinc-800 pb-4">En el video descubrirás:</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-orange-500 shrink-0">▶</span> El error letal del "volumen basura" que está destruyendo tus ganancias.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-orange-500 shrink-0">▶</span> Cómo la auto-regulación (RPE/RIR) hackea tu recuperación instantáneamente.</li>
              <li className="flex items-start gap-3 text-zinc-400"><span className="text-orange-500 shrink-0">▶</span> El sistema algorítmico exacto para sumar kilos a la barra cada microciclo.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. VSL — VIDEO DE VENTAS */}
      <section className="py-12 px-4 max-w-5xl mx-auto flex flex-col items-center border-b border-zinc-900/80 pb-24">
        <h2 className="text-3xl md:text-5xl font-black italic text-center mb-10 font-serif uppercase tracking-tight leading-tight">
          MIRA LA AUDITORÍA ANTES DE QUE <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">CIERREN LOS CUPOS</span>
        </h2>
        
        {/* Contenedor del Player de Video Falso */}
        <div className="w-full aspect-video bg-[#0a0a0a] border-2 border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex items-center justify-center overflow-hidden group cursor-pointer mb-10">
          {/* Reflejos y estéticas del video */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-red-900/10 opacity-80"></div>
          
          {/* Botón de Play Central */}
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center z-10 shadow-[0_0_40px_rgba(220,38,38,0.5)] group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Tujague_Protocolo_Mutacion.mp4</p>
          </div>
        </div>

        <button className="bg-transparent border border-orange-500/50 text-orange-500 font-black uppercase tracking-widest px-8 py-4 rounded-xl text-xs shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-300">
          YA VI EL VIDEO, QUIERO APLICAR
        </button>
      </section>

      {/* =========================================
          FASE 2: PRUEBA SOCIAL Y TRANSFORMACIÓN
      ========================================= */}

      {/* 4. CASOS DE ÉXITO — BLOQUE 1 (Resultados Rápidos) */}
      <section className="py-20 px-4 max-w-6xl mx-auto border-b border-zinc-900/50">
        <h2 className="text-2xl md:text-4xl font-black italic text-center mb-12 uppercase tracking-tighter text-zinc-100">
          Resultados <span className="text-red-600">Reales</span>. Cero Excusas.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonio 1 */}
          <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
              <div>
                <p className="font-bold text-white uppercase text-sm">Marcos R.</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Atleta Intermedio</p>
              </div>
              <span className="bg-red-900/20 text-red-500 font-black text-xs px-2 py-1 rounded border border-red-900/30">
                +15kg Press Banca
              </span>
            </div>
            <p className="text-zinc-400 text-sm italic">
              "Estuve estancado en 80kg durante 8 meses. Apliqué la estructura de RPE que enseña Tujague y en 4 semanas mi SNC se reseteó. Hoy tiro 95kg a 4 repeticiones como si nada. Brutal."
            </p>
          </div>

          {/* Testimonio 2 */}
          <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
              <div>
                <p className="font-bold text-white uppercase text-sm">Tomás L.</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Powerbuilder</p>
              </div>
              <span className="bg-orange-900/20 text-orange-500 font-black text-xs px-2 py-1 rounded border border-orange-900/30">
                -4% Grasa Corporal
              </span>
            </div>
            <p className="text-zinc-400 text-sm italic">
              "Pensé que para definir tenía que perder fuerza. Hice la Fase Cut del programa y no solo mantuve mis RMs en Sentadilla y Peso Muerto, sino que las venas en los hombros son permanentes ahora."
            </p>
          </div>

          {/* Testimonio 3 */}
          <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
              <div>
                <p className="font-bold text-white uppercase text-sm">Javier F.</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Principiante Avanzado</p>
              </div>
              <span className="bg-red-900/20 text-red-500 font-black text-xs px-2 py-1 rounded border border-red-900/30">
                Estructura Total
              </span>
            </div>
            <p className="text-zinc-400 text-sm italic">
              "El mayor beneficio no es solo físico, es mental. Entrar al gimnasio sabiendo exactamente qué ejercicio, cuántas series y qué carga usar gracias a la IA y los PDFs te quita toda la ansiedad."
            </p>
          </div>
        </div>
      </section>

      {/* 5. QUÉ VAS A LOGRAR EN EL PROGRAMA */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-orange-500 font-black tracking-widest text-xs uppercase mb-3">La Mutación Esperada</p>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            Tu Fisiología <span className="text-red-600">Hackeada</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "SOBRECARGA PROGRESIVA AUTOMATIZADA", desc: "Se acabó el adivinar los pesos. Las calculadoras del programa dictan tu tonelaje exacto para forzar el crecimiento.", icon: "📈" },
            { title: "DOMINIO ABSOLUTO DEL RPE/RIR", desc: "Aprenderás a leer tu sistema nervioso para saber cuándo ir al fallo y cuándo guardar repeticiones en el tanque.", icon: "🧠" },
            { title: "SÍNTESIS PROTEICA MAXIMIZADA", desc: "Frecuencia de entrenamiento optimizada para mantener tu cuerpo en estado anabólico constante sin llegar al sobreentrenamiento.", icon: "🥩" },
            { title: "BLINDAJE ARTICULAR", desc: "Protocolos de calentamiento y selección biomecánica de accesorios BII para que entrenes pesado sin destrozarte las rodillas o la espalda.", icon: "🛡️" },
            { title: "HIPERTROFIA DENSA Y FUNCIONAL", desc: "Músculo que no solo se ve bien frente al espejo, sino que mueve cargas reales. Adiós a la hipertrofia vacía de bombeo.", icon: "🧱" },
            { title: "LIBERTAD DIETÉTICA ESTRATÉGICA", desc: "El Chef IA te arma los macros, permitiéndote encajar los alimentos que te gustan mientras destruyes grasa o creas músculo.", icon: "⚖️" }
          ].map((item, index) => (
            <div key={index} className="bg-gradient-to-b from-[#0f0f0f] to-[#050505] p-6 rounded-2xl border border-zinc-800/80 hover:border-red-900/50 transition-all duration-300">
              <div className="text-3xl mb-4 bg-zinc-900 w-12 h-12 flex items-center justify-center rounded-lg border border-zinc-800">{item.icon}</div>
              <h3 className="text-white font-black uppercase tracking-wide text-sm mb-2">{item.title}</h3>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CASOS DE ÉXITO — BLOQUE 2 (Cambios de Vida / Visuales) */}
      <section className="py-20 px-4 bg-[#080808] border-y border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black italic text-center mb-12 uppercase tracking-tighter text-zinc-100">
            Evidencia <span className="text-orange-500">Biomecánica</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Simulación de Screenshot/Foto 1 */}
            <div className="bg-[#111] p-4 rounded-3xl border border-zinc-800 group">
              {/* Contenedor de "Imagen" */}
              <div className="w-full aspect-[4/3] bg-zinc-900 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-zinc-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(220,38,38,0.1)_0%,_transparent_70%)]"></div>
                <p className="text-zinc-700 font-black uppercase text-xs tracking-widest text-center px-4">
                  [Espacio para foto del Atleta Antes / Después]
                </p>
              </div>
              <div className="px-2">
                <h4 className="text-white font-black uppercase text-lg mb-1">Lucas M. <span className="text-red-500 text-sm">- Transformación a 12 semanas</span></h4>
                <p className="text-zinc-400 text-sm font-medium">"Mi composición corporal cambió por completo. La estructura BII me permitió bajar de 22% a 14% de grasa mientras seguía rompiendo RMs en Peso Muerto."</p>
              </div>
            </div>

            {/* Simulación de Video Review 2 */}
            <div className="bg-[#111] p-4 rounded-3xl border border-zinc-800 group">
              {/* Contenedor de "Video Thumbnail" */}
              <div className="w-full aspect-[4/3] bg-zinc-900 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-zinc-800 cursor-pointer group-hover:border-orange-500/50 transition-colors">
                <div className="w-16 h-16 bg-black/50 border border-zinc-700 rounded-full flex items-center justify-center z-10 backdrop-blur-sm group-hover:bg-orange-600 group-hover:border-orange-500 transition-all duration-300">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <p className="absolute bottom-4 left-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">▶ Video Testimonio</p>
              </div>
              <div className="px-2">
                <h4 className="text-white font-black uppercase text-lg mb-1">Santiago P. <span className="text-orange-500 text-sm">- Mentoría Élite</span></h4>
                <p className="text-zinc-400 text-sm font-medium">"Tener a Tujague corrigiendo mis videos en la plataforma cambió mi reclutamiento muscular. Sentir la espalda trabajar de verdad no tiene precio."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FASE 3: LA OFERTA Y EL CAMINO
      ========================================= */}

      {/* 7. QUÉ OBTIENES AL ENTRAR AL PROGRAMA */}
      <section className="py-24 px-4 max-w-6xl mx-auto border-b border-zinc-900/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            El Arsenal <span className="text-red-600">Completo</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto text-sm">
            No es solo un PDF. Es un ecosistema de software y programación diseñado para no dejar nada al azar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Columna Izquierda: Entregables Principales */}
          <div className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl">
            <h3 className="text-orange-500 font-black tracking-widest text-xs uppercase mb-6 border-b border-zinc-800 pb-4">El Núcleo del Programa</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-red-900/20 text-red-500 flex items-center justify-center shrink-0 font-black border border-red-900/30">✓</div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm mb-1">Plan Maestro de 12 Semanas</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Las 3 fases exactas (Fuerza, Mutación, Cut) con selección de ejercicios, series y repeticiones.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-red-900/20 text-red-500 flex items-center justify-center shrink-0 font-black border border-red-900/30">✓</div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm mb-1">Calculadoras de Sobrecarga</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Algoritmos en Excel/Sheets para calcular tus pesos en cada microciclo sin adivinar.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-red-900/20 text-red-500 flex items-center justify-center shrink-0 font-black border border-red-900/30">✓</div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm mb-1">Bóveda Técnica (Videos)</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Librería privada con la ejecución biomecánica perfecta de cada movimiento BII.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Columna Derecha: Bonos / Valor Adicional */}
          <div className="bg-[#111] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <h3 className="text-red-500 font-black tracking-widest text-xs uppercase mb-6 border-b border-zinc-800 pb-4">Tecnología Adicional</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-orange-900/20 text-orange-500 flex items-center justify-center shrink-0 font-black border border-orange-900/30">✦</div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm mb-1">Guía RPE / RIR Definitiva</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">El manual para calibrar tu esfuerzo y saber cuándo ir al fallo de forma segura.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-orange-900/20 text-orange-500 flex items-center justify-center shrink-0 font-black border border-orange-900/30">✦</div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm mb-1">Kit de Suplementación Clínica</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Lo que realmente funciona (Creatina, Cafeína, Proteína) y cómo dosificarlo.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded bg-orange-900/20 text-orange-500 flex items-center justify-center shrink-0 font-black border border-orange-900/30">✦</div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm mb-1">Botón de Pánico (Lesiones)</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">Protocolos de reemplazo de ejercicios si tienes dolores articulares previos.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. TU PASO A PASO (Roadmap / Timeline) */}
      <section className="py-24 px-4 bg-[#080808] border-b border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              Tu Línea de <span className="text-orange-500">Tiempo</span>
            </h2>
          </div>

          {/* Contenedor del Timeline */}
          <div className="relative border-l-2 border-zinc-800 ml-4 md:ml-12 space-y-12 pb-8">
            
            {/* Paso 1 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute w-6 h-6 bg-red-600 rounded-full -left-[13px] top-1 border-4 border-[#080808] shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
              <h3 className="text-xs font-black text-red-500 tracking-widest uppercase mb-1">Semanas 1 a 4</h3>
              <h4 className="text-xl md:text-2xl font-black text-white uppercase mb-2">Fuerza Base & Calibración</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                Adaptamos tu sistema nervioso a las cargas pesadas. Aprenderás a dominar la técnica BII-Vintage y estableceremos tus marcas iniciales. El objetivo aquí es construir los cimientos de la mutación.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute w-6 h-6 bg-orange-500 rounded-full -left-[13px] top-1 border-4 border-[#080808] shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
              <h3 className="text-xs font-black text-orange-500 tracking-widest uppercase mb-1">Semanas 5 a 8</h3>
              <h4 className="text-xl md:text-2xl font-black text-white uppercase mb-2">Mutación Hipertrófica</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                Con la fuerza base establecida, aumentamos el volumen de entrenamiento inteligente. Usamos técnicas de intensidad controladas para forzar el crecimiento muscular masivo sin quemar tu SNC.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute w-6 h-6 bg-zinc-300 rounded-full -left-[13px] top-1 border-4 border-[#080808] shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
              <h3 className="text-xs font-black text-zinc-400 tracking-widest uppercase mb-1">Semanas 9 a 12</h3>
              <h4 className="text-xl md:text-2xl font-black text-white uppercase mb-2">Definición Estética (Cut)</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                Mantenemos las cargas altas para retener el 100% del músculo ganado, pero ajustamos los protocolos para destruir la grasa corporal. Terminas el programa con un físico rocoso y venoso.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. CASOS DE ÉXITO — BLOQUE 3 (Muro de Resultados / Grid Denso) */}
      <section className="py-24 px-4 max-w-7xl mx-auto border-b border-zinc-900/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-zinc-100">
            El Ejército <span className="text-red-600">Tujague</span>
          </h2>
          <p className="text-zinc-500 mt-4 text-sm font-bold uppercase tracking-widest">Nadie puede debatir contra el volumen de evidencia</p>
        </div>

        {/* Grid Estilo Collage / Wall of Love */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 flex flex-col justify-between aspect-square group hover:border-zinc-500 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-zinc-800 rounded-full flex-shrink-0"></div>
                <div className="w-16 h-2 bg-zinc-800 rounded"></div>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-medium line-clamp-4">
                "Simulación de un mensaje de Discord o WhatsApp de un cliente celebrando un nuevo récord personal o enviando una foto de su progreso. La estructura BII funciona."
              </p>
              <div className="mt-4 pt-2 border-t border-zinc-900 flex justify-between items-center">
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">+ PR Roto</span>
                <span className="text-zinc-600 text-xs">★★★★★</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          FASE 4: CIERRE, AUTORIDAD Y PREGUNTAS FRECUENTES
      ========================================= */}

      {/* 10. POR QUÉ ERES DIFERENTE (Comparativa) */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black italic text-center mb-12 uppercase tracking-tighter text-white">
          La Verdad sobre el <span className="text-red-600">Estancamiento</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Método Tradicional (Negativo) */}
          <div className="bg-[#111] border border-zinc-800 p-8 rounded-3xl opacity-80">
            <h3 className="text-zinc-500 font-black tracking-widest text-sm uppercase mb-6 text-center">Método Tradicional (Gimnasio)</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-zinc-500 text-sm font-medium">
                <span className="text-red-900 font-black">✕</span> Entrenar al fallo todos los días friendo tu sistema nervioso.
              </li>
              <li className="flex items-start gap-3 text-zinc-500 text-sm font-medium">
                <span className="text-red-900 font-black">✕</span> Volumen "basura" de 20 series por músculo sin intensidad real.
              </li>
              <li className="flex items-start gap-3 text-zinc-500 text-sm font-medium">
                <span className="text-red-900 font-black">✕</span> Cambiar la rutina cada semana "para confundir al músculo".
              </li>
            </ul>
          </div>

          {/* Método Tujague (Positivo) */}
          <div className="bg-gradient-to-b from-[#1a0505] to-[#0a0a0a] border border-red-900/50 p-8 rounded-3xl relative shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-2xl rounded-full"></div>
            <h3 className="text-red-500 font-black tracking-widest text-sm uppercase mb-6 text-center">Tecnología Clínica Tujague</h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3 text-zinc-300 text-sm font-medium">
                <span className="text-red-500 font-black">✓</span> Gestión de fatiga mediante RPE para crecer mientras descansas.
              </li>
              <li className="flex items-start gap-3 text-zinc-300 text-sm font-medium">
                <span className="text-red-500 font-black">✓</span> Selección de ejercicios BII y progresión matemática de cargas.
              </li>
              <li className="flex items-start gap-3 text-zinc-300 text-sm font-medium">
                <span className="text-red-500 font-black">✓</span> Estructura repetitiva y predecible que garantiza adaptaciones reales.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 11. PARA QUIÉN ES DETALLADO (Filtro) */}
      <section className="py-16 px-4 bg-[#080808] border-y border-zinc-900">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-white font-black uppercase tracking-tight text-xl mb-6 border-b border-zinc-800 pb-4">
              Aplica si cumples esto:
            </h3>
            <ul className="space-y-4 text-sm text-zinc-400 font-medium">
              <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Tienes al menos 6 meses entrenando.</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Estás dispuesto a grabar tus series.</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Buscas un cambio estético radical y duradero.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-zinc-600 font-black uppercase tracking-tight text-xl mb-6 border-b border-zinc-800 pb-4">
              Cierra esta página si:
            </h3>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li className="flex items-center gap-2"><span className="text-red-900">✕</span> Buscas atajos o "rutinas milagrosas" de 10 minutos.</li>
              <li className="flex items-center gap-2"><span className="text-red-900">✕</span> No estás dispuesto a registrar tus pesos.</li>
              <li className="flex items-center gap-2"><span className="text-red-900">✕</span> Pones excusas en lugar de seguir instrucciones.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 12. CALENDARIO — AGENDAR LLAMADA */}
      <section className="py-24 px-4 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
          Agenda Tu <span className="text-orange-500">Auditoría Clínica</span>
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm mb-12">
          En esta llamada gratuita de 15 minutos analizaremos tu punto de partida, tus RMs actuales y determinaremos si mi tecnología BII es exactamente lo que necesitas para tu mutación.
        </p>
        
        {/* Contenedor del Iframe de Calendly */}
        <div className="w-full max-w-3xl mx-auto h-[600px] bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative">
          <iframe 
            src="https://calendly.com/alejandroramirezokk/auditoria?hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=ff4500" 
            width="100%" 
            height="100%" 
            frameBorder="0"
            title="Agenda tu llamada en Calendly"
            className="absolute inset-0"
          ></iframe>
        </div>
      </section>

      {/* 13. PREGUNTAS FRECUENTES (FAQ) */}
      <section className="py-20 px-4 max-w-3xl mx-auto border-t border-zinc-900/50">
        <h2 className="text-3xl font-black italic text-center mb-10 uppercase tracking-tighter text-zinc-100">
          Preguntas <span className="text-red-600">Frecuentes</span>
        </h2>
        
        <div className="space-y-4">
          {[
            { q: "¿Cuánto dura el programa?", a: "El ciclo maestro está diseñado para durar exactamente 12 semanas (90 días), dividido en bloques de Fuerza, Hipertrofia y Cut." },
            { q: "¿Necesito equipo especial?", a: "Necesitas acceso a un gimnasio comercial estándar con barras libres, discos, rack de sentadillas y mancuernas." },
            { q: "¿Cómo funciona la IA de Nutrición?", a: "El Chef Inteligente calculará tus macronutrientes exactos basados en tu peso y objetivo, permitiéndote encajar los alimentos que prefieras en tu día a día." },
            { q: "¿Hay garantía de resultados?", a: "Si aplicas el 100% de la estructura, grabas tus videos y no fallas en tus RPE, la mutación es biológicamente inevitable." }
          ].map((faq, index) => (
            <details key={index} className="bg-[#111] border border-zinc-800 rounded-xl group cursor-pointer">
              <summary className="font-bold text-white uppercase text-xs md:text-sm p-6 list-none flex justify-between items-center outline-none">
                {faq.q}
                <span className="text-red-500 group-open:rotate-45 transition-transform duration-300 text-xl font-black">+</span>
              </summary>
              <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800/50 pt-4 mt-2">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="py-10 text-center border-t border-zinc-900 bg-[#050505]">
        <p className="text-white font-black italic uppercase tracking-widest text-lg mb-2">Tujague Strength</p>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-6">Mutación Biomecánica Garantizada</p>
        <div className="flex justify-center gap-6 text-zinc-600 text-xs font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-red-500 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-red-500 transition-colors">Términos</a>
        </div>
        <p className="text-zinc-800 text-[9px] mt-8 uppercase tracking-widest">&copy; 2024 Alecor Consulting / Tujague Strength. Todos los derechos reservados.</p>
      </footer>
      
    </div>
  );
}