import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Tujaque Strength",
  description: "Política de privacidad y protección de datos de Tujaque Strength"
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-black mb-3 tracking-tight">Política de Privacidad</h1>
          <p className="text-zinc-400 text-sm mb-8">Última actualización: Febrero 2026</p>

          <div className="space-y-8 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introducción</h2>
              <p>
                En Tujaque Strength respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
                Esta política describe cómo recopilamos, usamos y protegemos tu información cuando utilizas
                nuestros servicios de coaching de fuerza.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Información que Recopilamos</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-emerald-400">2.1 Información de Registro</h3>
                <p>
                  Al contratar nuestros servicios, recopilamos:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>Nombre completo</li>
                  <li>Dirección de email</li>
                  <li>Referencia de contacto (Instagram, WhatsApp, DNI - opcional)</li>
                  <li>Información del plan contratado</li>
                </ul>

                <h3 className="text-lg font-semibold text-emerald-400">2.2 Información de Entrenamiento</h3>
                <p>
                  Durante el servicio de coaching recopilamos:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>Datos de rendimiento (cargas, series, repeticiones)</li>
                  <li>Feedback sobre sensaciones de entrenamiento</li>
                  <li>Videos de técnica (si contrataste el servicio extra)</li>
                  <li>Progreso y evolución de marcas personales</li>
                </ul>

                <h3 className="text-lg font-semibold text-emerald-400">2.3 Información de Pago</h3>
                <p>
                  Los pagos son procesados por terceros:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400">
                  <li>Mercado Pago: procesa pagos con tarjeta de crédito/débito</li>
                  <li>Comprobantes de transferencia: almacenados de forma segura en Supabase</li>
                  <li>No almacenamos datos de tarjetas de crédito</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Cómo Usamos tu Información</h2>
              <p>
                Utilizamos tu información personal para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400 mt-3">
                <li>Entregar y gestionar el servicio de coaching contratado</li>
                <li>Programar y ajustar tu entrenamiento de manera personalizada</li>
                <li>Comunicarnos contigo sobre tu progreso y modificaciones</li>
                <li>Procesar pagos y validar comprobantes</li>
                <li>Enviar actualizaciones importantes sobre el servicio</li>
                <li>Mejorar la calidad de nuestros programas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Protección de Datos</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-emerald-400">4.1 Infraestructura Segura</h3>
                <p>
                  Todos los datos personales se almacenan en Supabase, una plataforma de base de datos
                  con cifrado de nivel empresarial y certificaciones de seguridad internacionales.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">4.2 Videos de Técnica</h3>
                <p className="text-emerald-400 font-semibold">
                  Los videos que nos envíes para análisis técnico son tratados con máxima confidencialidad.
                  Se almacenan en un storage privado y solo son accesibles por el coach asignado. No se
                  comparten públicamente ni con terceros sin tu consentimiento expreso.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">4.3 Acceso Restringido</h3>
                <p>
                  Solo el personal autorizado de Tujaque Strength tiene acceso a tu información personal.
                  Implementamos controles de acceso estrictos y auditorías regulares.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Compartir Información con Terceros</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-emerald-400">5.1 Procesadores de Pago</h3>
                <p>
                  Mercado Pago gestiona los pagos de forma externa y segura. Consulta la política de
                  privacidad de Mercado Pago para más información sobre cómo procesan tus datos financieros.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">5.2 No Vendemos tus Datos</h3>
                <p className="text-emerald-400 font-semibold">
                  Nunca vendemos, alquilamos ni compartimos tu información personal con terceros con
                  fines comerciales o de marketing.
                </p>

                <h3 className="text-lg font-semibold text-emerald-400">5.3 Requisitos Legales</h3>
                <p>
                  Podemos divulgar información personal si es requerido por ley, orden judicial o
                  proceso legal aplicable.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Retención de Datos</h2>
              <p>
                Conservamos tu información personal durante el tiempo necesario para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400 mt-3">
                <li>Proveer el servicio contratado</li>
                <li>Cumplir con obligaciones legales y fiscales</li>
                <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
              </ul>
              <p className="mt-3">
                Puedes solicitar la eliminación de tus datos en cualquier momento (sujeto a requisitos legales).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Tus Derechos</h2>
              <p>
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-zinc-400 mt-3">
                <li>Acceder a tu información personal</li>
                <li>Corregir datos inexactos o incompletos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
                <li>Recibir una copia de tus datos en formato portable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies y Tecnologías de Seguimiento</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento del sitio web (gestión de sesiones).
                No utilizamos cookies de terceros para publicidad o tracking externo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Menores de Edad</h2>
              <p className="text-yellow-400 font-semibold">
                Nuestros servicios están dirigidos exclusivamente a hombres mayores de 18 años.
                No recopilamos intencionalmente información de menores de edad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Cambios a esta Política</h2>
              <p>
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre
                cambios significativos por email o mediante aviso destacado en nuestra plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Contacto</h2>
              <p>
                Para consultas sobre privacidad, solicitudes de acceso a datos o ejercicio de tus derechos,
                contacta a través de los canales oficiales de Tujaque Strength.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500 text-center">
              Tu confianza es nuestra prioridad. Protegemos tu información con los más altos estándares de seguridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
