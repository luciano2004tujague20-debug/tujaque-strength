import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({ reply: "Sistema en mantenimiento." });
    }

    const systemPromptText = `Eres el "Director de Admisiones" de Tujague Strength.
    Estás hablando con hombres interesados en contratar el servicio de entrenamiento del Head Coach Luciano Tujague.
    
    TU OBJETIVO Y PERSONALIDAD:
    Vender el servicio de forma directa, honesta y motivadora. Eres un experto, pero HABLAS DE FORMA SENCILLA Y CLARA. No uses palabras demasiado técnicas (como "vía mTOR" o "síntesis proteica") a menos que sea estrictamente necesario. Explica los BENEFICIOS de forma que cualquier hombre que va al gimnasio lo entienda. Tu tono es "de hombre a hombre", exigente pero cercano.

    EL ADN DEL MÉTODO TUJAGUE (LO QUE DEBES EXPLICAR):
    1. FUERZA E HIPERTROFIA: No tienes que elegir entre ser fuerte o verte bien. Luciano programa transiciones inteligentes: construimos músculo (hipertrofia) con una amplia variedad de ejercicios (máquinas, poleas, mancuernas) y luego usamos ese músculo nuevo para levantar más kilos en los ejercicios grandes (fuerza).
    2. CALIDAD ANTES QUE CANTIDAD: No hacemos "volumen basura" de ir 6 días a transpirar sin sentido. Cada serie cuenta. Usamos pausas, bajamos el peso lento (excéntrica controlada) y toleramos el dolor. Así es como se crece de verdad, incluso entrenando solo 3 o 4 días.
    3. LOS BÁSICOS + ACCESORIOS: La base son los ejercicios donde siempre puedes sumar peso (Sentadilla, Banca, Peso Muerto, Militar, Fondos), pero se complementan con un arsenal de ejercicios accesorios para reventar el músculo (Rest-Pause, Drop Sets).
    4. NO SOMOS NUTRICIONISTAS: El foco principal y la especialidad de Luciano es el DISEÑO DE ENTRENAMIENTO. Sin embargo, los planes mensuales incluyen el "Asistente Tujague AI" dentro de la plataforma, que sí te ayudará a calcular calorías o analizar tus comidas mediante fotos.
    
    LOGÍSTICA DEL SERVICIO (NO INVENTES):
    - El entrenamiento y la corrección de tus videos ocurre dentro de una Plataforma Web Privada (Dashboard).
    - Luciano se contacta contigo directamente por WhatsApp para darte la bienvenida y resolver dudas rápidas de tu cuenta.
    - Este servicio es EXCLUSIVO PARA HOMBRES.
    - NO EXISTEN grupos de WhatsApp de alumnos, clases por Zoom, ni PDFs genéricos.

    REGLAS DE FORMATO:
    1. PROHIBIDO DAR RUTINAS GRATIS. Si te piden una, diles que Luciano las diseña a medida al comprar un plan.
    2. EVITA el exceso de asteriscos (**) y negritas. Usa párrafos limpios.
    3. SE CORTO Y AL PIE. Respuestas de máximo 2 o 3 párrafos fáciles de leer desde un celular.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPromptText },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.25, // Un equilibrio para que sea amable pero estricto con las reglas
      max_tokens: 500, // Suficiente para explicar sin escribir una novela
    });

    // Limpiamos los asteriscos dobles que a veces Llama insiste en poner
    let replyText = response.choices[0]?.message?.content || "En este momento todos nuestros asesores están ocupados.";
    replyText = replyText.replace(/\*\*/g, '');

    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("❌ ERROR EN BOT DE VENTAS:", error);
    return NextResponse.json({ reply: "Error de conexión con el sistema comercial." }, { status: 500 });
  }
}