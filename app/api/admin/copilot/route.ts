import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { athlete, logs, currentRoutine, activeDay, parameters, mode } = await req.json();

    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const systemPrompt = `Eres el "Head de Ciencias del Deporte y Fisiología" de Tujague Strength, trabajando directamente para el Coach Luciano Tujague.
    Tu misión es programar un día de entrenamiento (microciclo) para un atleta de élite, justificando tus decisiones bajo estricta evidencia científica (biomecánica, fisiología hipertrófica y neuromuscular).

    DATOS CLÍNICOS Y DE RENDIMIENTO DEL ATLETA:
    - RMs Actuales: Sentadilla ${athlete.rm_squat}kg | Banca ${athlete.rm_bench}kg | Muerto ${athlete.rm_deadlift}kg | Fondos ${athlete.rm_dips}kg
    - Historial Médico / Lesiones: ${athlete.medical_history || "Atleta sano. Sin restricciones."}
    - Feedback del atleta (Sesión anterior): "${logs[activeDay] || "No hay registros recientes."}"
    - Rutina ejecutada en la sesión anterior: "${currentRoutine[activeDay] || "No hay rutina previa."}"

    CONFIGURACIÓN DE LA PROGRAMACIÓN:
    ${mode === 'auto' 
      ? `MODO AUTOPILOTO ACTIVADO: Como experto, debes analizar el feedback del atleta y sus RMs para DECIDIR tú mismo cuál es la mejor metodología, técnicas de intensidad y RPE para esta sesión. Si reportó fatiga, prioriza descarga o trabajo técnico. Si reportó facilidad, aplica sobrecarga progresiva agresiva.` 
      : `MODO LABORATORIO ACTIVADO. El Coach Luciano ha ordenado estos parámetros estrictos para la sesión:
         - Metodología Principal: ${parameters.methodology}
         - Enfoque Fisiológico: ${parameters.focus}
         - Técnica de Intensidad: ${parameters.intensity}
         - Control de Tempo / Cadencia: ${parameters.tempo}
         - Esfuerzo (RPE/RIR Target): ${parameters.rpe}
         Aplica EXACTAMENTE estos parámetros en la estructura de la rutina.`}

    BASE DE CONOCIMIENTO (TUJAGUE STRENGTH):
    - BIOMECÁNICA: Conoces sobre brazos de momento, perfiles de resistencia, y selección de ejercicios para máxima elongación bajo carga (estimulación mediada por estiramiento).
    - FISIOLOGÍA: Dominas la vía mTOR, tensión mecánica (umbral de reclutamiento de Henneman para fibras tipo II), estrés metabólico y gestión de la fatiga del Sistema Nervioso Central (SNC).
    - METODOLOGÍAS: Periodización Lineal, DUP (Ondulante), Conjugado (Westside), Heavy Duty (Mentzer), Top Set + Backoffs, Escalera de Fuerza.
    - TÉCNICAS: Rest-Pause (Myo-reps), Drop Sets Mecánicos, Cluster Sets, Isométricas en estiramiento.

    INSTRUCCIONES DE FORMATO (IMPERATIVO):
    1. Escribe la rutina estructurada y lista para que el atleta la lea y entienda.
    2. Usa el formato de Ejercicio -> Series x Repeticiones -> RPE/RIR -> Tiempo de descanso.
    3. AL FINAL DE LA RUTINA, agrega una sección obligatoria llamada "🧠 Nota Biomecánica del Coach:" donde explicas brevemente (2 a 3 líneas) por qué se estructuró así la sesión, hablando de fisiología, fibras o fatiga, para que el cliente sienta el valor premium del servicio.
    4. NO uses saludos iniciales. Escribe el texto de la rutina directamente.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Genera la sesión de entrenamiento aplicando tus conocimientos avanzados y la configuración recibida." }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.35, // Balance entre rigidez científica y creatividad
      max_tokens: 1200, 
    });

    const reply = response.choices[0]?.message?.content || "";

    return NextResponse.json({ result: reply });

  } catch (error) {
    console.error("❌ ERROR EN COPILOTO EXPERTO:", error);
    return NextResponse.json({ error: "Error procesando IA" }, { status: 500 });
  }
}