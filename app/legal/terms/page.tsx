import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones | Tujaque Strength",
  description: "Términos y condiciones del servicio de coaching de fuerza Tujaque Strength"
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950 to-zinc-950" />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl font-black mb-3 tracking-tight">Términos y Condiciones</h1>
          <p className="text-zinc-400 text-sm mb-8">Última actualización: Febrero 2026</p>

          <div className="space-y-8 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Aceptación de los Términos</h2>
              <p>
                Al contratar cualquier servicio de coaching de fuerza ofrecido por Tujaque Strength,
                el cliente acepta de manera integral y sin reservas los presentes términos y condiciones.
                Si no está de acuerdo con alguno de estos términos, no debe proceder con la contratación del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Requisitos del Cliente</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-emerald-400">2.1 Mayoría de Edad</h3>
                <p>
                  El cliente debe ser hombre mayor de 18 años. Este servicio está diseñado exclusivamente
                  para hombres adultos con capacidad legal para contratar.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">2.2 Responsabilidad sobre la Salud</h3>
                <p>
                  El cliente declara estar en condiciones de salud adecuadas para realizar entrenamiento de fuerza.
                  Es responsabilidad exclusiva del cliente consultar con un médico antes de iniciar cualquier programa
                  de entrenamiento. Tujaque Strength no se hace responsable por lesiones, enfermedades o condiciones
                  médicas preexistentes o resultantes del entrenamiento.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">2.3 Compromiso y Reporte Honesto</h3>
                <p>
                  El cliente se compromete a:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>Seguir el programa de entrenamiento con constancia</li>
                  <li>Reportar de manera honesta su progreso, sensaciones y adherencia</li>
                  <li>Registrar sus cargas de entrenamiento de forma precisa</li>
                  <li>Mantener hábitos de sueño y recuperación adecuados</li>
                  <li>Comunicar cualquier molestia o lesión de inmediato</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Descripción del Servicio</h2>
              <p>
                Tujaque Strength ofrece servicios de coaching online de entrenamiento de fuerza especializado
                en Powerlifting (Sentadilla, Banca y Peso Muerto). Los servicios incluyen:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400 mt-3">
                <li>Programación personalizada de entrenamiento</li>
                <li>Seguimiento de progreso según el plan contratado</li>
                <li>Soporte vía WhatsApp en horarios establecidos</li>
                <li>Ajustes de programa según feedback y rendimiento</li>
                <li>Revisión técnica por video (servicio extra opcional)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Política de Pagos</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-emerald-400">4.1 Métodos de Pago</h3>
                <p>
                  Se aceptan pagos mediante Mercado Pago, transferencias bancarias en ARS,
                  transferencias internacionales en USD y criptomonedas (USDT).
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">4.2 Confirmación de Pago</h3>
                <p>
                  El servicio se activa una vez confirmado el pago. El cliente debe subir el comprobante
                  de pago para agilizar la validación. Los pagos mediante Mercado Pago se validan automáticamente.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">4.3 Política de No Reembolso</h3>
                <p className="text-yellow-400 font-semibold">
                  Una vez entregado el programa de entrenamiento y/o iniciado el servicio de coaching,
                  NO SE REALIZAN REEMBOLSOS bajo ninguna circunstancia. El cliente acepta esta política
                  al momento de realizar el pago.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Entrega del Servicio</h2>
              <p>
                El programa de entrenamiento se entrega vía email o plataforma digital dentro de las 48 horas
                hábiles posteriores a la confirmación del pago. El seguimiento se realiza según la cadencia
                del plan contratado (semanal o mensual).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Propiedad Intelectual</h2>
              <p>
                Todos los programas, rutinas, materiales y contenidos entregados son propiedad exclusiva de
                Tujaque Strength. El cliente tiene derecho de uso personal no comercial. Está prohibida la
                reproducción, distribución o comercialización de los materiales sin autorización expresa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitación de Responsabilidad</h2>
              <p>
                Tujaque Strength actúa como servicio de coaching y programación de entrenamiento. No somos
                responsables por:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400 mt-3">
                <li>Lesiones derivadas de la ejecución incorrecta de los ejercicios</li>
                <li>Condiciones médicas preexistentes no declaradas</li>
                <li>Falta de adherencia al programa por parte del cliente</li>
                <li>Resultados individuales que pueden variar según múltiples factores</li>
                <li>Decisiones de entrenamiento tomadas sin consulta previa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Modificaciones del Servicio</h2>
              <p>
                Tujaque Strength se reserva el derecho de modificar, suspender o descontinuar cualquier aspecto
                del servicio en cualquier momento. Los cambios en planes y precios no afectan servicios ya
                contratados y pagados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Jurisdicción</h2>
              <p>
                Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta
                en los tribunales competentes de Buenos Aires, Argentina.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contacto</h2>
              <p>
                Para consultas sobre estos términos, contactar a través de los canales oficiales de Tujaque Strength.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500 text-center">
              Al contratar nuestros servicios, confirmas haber leído y aceptado estos términos y condiciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
