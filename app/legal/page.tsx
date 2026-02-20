import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* NAVBAR SIMPLE */}
      <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-black italic tracking-tighter text-white">
            TUJAGUE <span className="text-emerald-500">STRENGTH</span>
          </Link>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white">
            ← Volver al Inicio
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 space-y-20">
        
        {/* ENCABEZADO */}
        <div className="text-center border-b border-white/5 pb-12">
          <h1 className="text-4xl md:text-5xl font-black italic text-white mb-4 tracking-tighter">
            MARCO <span className="text-emerald-500">LEGAL</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* 1. TÉRMINOS Y CONDICIONES */}
        <section id="terminos" className="space-y-6">
          <h2 className="text-2xl font-black italic text-white flex items-center gap-3">
            <span className="text-emerald-500">01.</span> TÉRMINOS Y CONDICIONES
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-400 text-justify">
            <p>
              Al contratar los servicios de <strong>Luciano Tujague (Tujague Strength)</strong>, usted acepta adherirse a los siguientes términos. Estos servicios están destinados exclusivamente a la mejora del rendimiento físico y la fuerza bajo una metodología específica.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Pagos:</strong> Todos los pagos realizados a través de la plataforma son definitivos. No se realizan reembolsos parciales ni totales una vez enviada la planificación, debido a la naturaleza intelectual y personalizada del servicio digital.</li>
              <li><strong>Vigencia:</strong> Los planes mensuales tienen una duración de 30 días calendario desde la fecha de alta. Los planes semanales duran 7 días. Es responsabilidad del atleta renovar a tiempo para evitar la interrupción del acceso al Dashboard.</li>
              <li><strong>Propiedad Intelectual:</strong> Las rutinas, videos de corrección y metodologías compartidas son propiedad intelectual de Luciano Tujague. Está prohibida su distribución, venta o reproducción sin consentimiento.</li>
              <li><strong>Conducta:</strong> Se espera un trato respetuoso. Nos reservamos el derecho de admisión y permanencia ante conductas inapropiadas, falta de pago o incumplimiento de las pautas de entrenamiento.</li>
            </ul>
          </div>
        </section>

        {/* 2. DESCARGO DE RESPONSABILIDAD (DISCLAIMER) */}
        <section id="disclaimer" className="space-y-6">
          <h2 className="text-2xl font-black italic text-white flex items-center gap-3">
            <span className="text-emerald-500">02.</span> DISCLAIMER MÉDICO Y DE RIESGO
          </h2>
          <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-2xl space-y-4 text-sm leading-relaxed text-zinc-300">
            <p className="font-bold text-red-400 uppercase tracking-widest text-xs">⚠️ Lectura Obligatoria</p>
            <p>
              El entrenamiento de fuerza y alta intensidad conlleva riesgos inherentes de lesión física. Al participar en nuestros programas, usted reconoce y acepta estos riesgos voluntariamente.
            </p>
            <p>
              <strong>Luciano Tujague NO es médico ni nutricionista.</strong> La información proporcionada tiene fines puramente educativos y de coaching deportivo. Nada en este sitio web o en la programación debe interpretarse como consejo médico.
            </p>
            <p>
              Recomendamos encarecidamente consultar a un médico antes de comenzar este o cualquier otro programa de ejercicio, especialmente si tiene antecedentes de lesiones, problemas cardíacos o condiciones preexistentes. Usted asume total responsabilidad por su salud y bienestar durante la ejecución de los ejercicios.
            </p>
          </div>
        </section>

        {/* 3. POLÍTICA DE PRIVACIDAD */}
        <section id="privacidad" className="space-y-6">
          <h2 className="text-2xl font-black italic text-white flex items-center gap-3">
            <span className="text-emerald-500">03.</span> POLÍTICA DE PRIVACIDAD
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-400 text-justify">
            <p>
              Respetamos su privacidad y protegemos sus datos personales. Esta sección detalla cómo manejamos su información:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Datos Recopilados:</strong> Recopilamos su nombre, correo electrónico, registros de entrenamiento (RMs) y videos técnicos subidos a la plataforma.</li>
              <li><strong>Uso de la Información:</strong> Los videos y datos se utilizan exclusivamente para el análisis biomecánico y la personalización de su rutina. No vendemos ni compartimos sus datos con terceros.</li>
              <li><strong>Videos:</strong> Los videos subidos a través de YouTube (enlaces no listados) o Drive están sujetos a las políticas de privacidad de dichas plataformas. Los videos subidos directamente a nuestros servidores son privados y solo accesibles por el Coach y el Atleta.</li>
            </ul>
          </div>
        </section>

        {/* 4. CONSENTIMIENTO Y BAJA */}
        <section id="baja" className="space-y-6">
          <h2 className="text-2xl font-black italic text-white flex items-center gap-3">
            <span className="text-emerald-500">04.</span> CONSENTIMIENTO Y BAJA
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-400 text-justify">
            <p>
              Al realizar el pago y comenzar el entrenamiento, usted otorga su <strong>consentimiento expreso</strong> para el almacenamiento de sus datos deportivos y acepta las condiciones aquí descritas.
            </p>
            
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mt-4">
              <h3 className="text-white font-bold mb-2 uppercase tracking-wide">¿Cómo darse de baja?</h3>
              <p className="mb-4">
                Usted tiene derecho a cancelar el servicio en cualquier momento. Dado que nuestros planes no son suscripciones automáticas (a menos que se especifique lo contrario en Mercado Pago), la baja se produce naturalmente al no renovar el pago del siguiente ciclo.
              </p>
              <p className="mb-4">
                Si desea eliminar su cuenta y todos sus datos (historial, videos, usuario) de nuestra base de datos permanentemente:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-emerald-400 font-medium">
                <li>Envíe un correo a: <a href="mailto:luciano2004tujague20@gmail.com" className="underline">luciano2004tujague20@gmail.com</a></li>
                <li>Asunto: "SOLICITUD DE BAJA Y BORRADO DE DATOS"</li>
              </ul>
              <p className="mt-4 text-xs text-zinc-500">
                Su solicitud será procesada en un plazo máximo de 48 horas hábiles.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-10 border-t border-white/5 text-center bg-black">
        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
          © {new Date().getFullYear()} Tujague Strength System.
        </p>
      </footer>
    </div>
  );
}