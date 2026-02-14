import { Video } from "lucide-react";

export function VideoReview() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="container-pad max-w-4xl mx-auto">
        <div className="glass-card-elevated p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 mb-6 shadow-xl shadow-emerald-900/30">
            <Video className="w-7 h-7 text-zinc-950" />
          </div>

          <h3 className="text-2xl md:text-3xl font-black font-display mb-4 text-foreground">
            Revision Tecnica por Video
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Servicio extra opcional. Envias tu video de Sentadilla, Banca o
            Peso Muerto y recibis un analisis detallado con correcciones
            especificas.
          </p>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400 font-bold text-sm">
              Costo adicional:
            </span>
            <span className="text-2xl font-black text-foreground font-display">
              $15.000
            </span>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Podes agregar este servicio al momento de contratar cualquier plan.
          </p>
        </div>
      </div>
    </section>
  );
}
