import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { athlete, cycles, parameters, mode } = await req.json();

    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const systemMessage = `Eres el Head Coach de Élite de Tujague Strength, un experto mundial en biomecánica, periodización ondulante, hipertrofia clínica, fuerza máxima, recomposición corporal y acondicionamiento metabólico (HIIT).
    Tu misión es diseñar un MICROCICLO COMPLETO (1 semana entera) con el más alto rigor científico y profesionalismo.
    
    DATOS DEL ATLETA:
    - Días que entrena: ${athlete.training_days || '3 a 4 días por semana'}
    - Marcas (1RM): Sentadilla ${athlete.rm_squat}kg, Banca ${athlete.rm_bench}kg, Peso Muerto ${athlete.rm_deadlift}kg, Fondos ${athlete.rm_dips}kg.
    - Lesiones/Limitaciones: ${athlete.medical_history || 'Ninguna'}
    - Ciclo Actual: Macro: ${cycles.macro}, Meso: ${cycles.meso}, Micro: ${cycles.micro}
    - Parámetros Técnicos del Coach: ${mode === 'manual' ? JSON.stringify(parameters) : 'Sistema auto-regulado óptimo para fuerza e hipertrofia'}
    
    INSTRUCCIONES DE DISEÑO PARA CADA DÍA DE ENTRENAMIENTO:
    Debes estructurar el texto de cada día usando este formato profesional:
    🔥 WARM-UP & MOVILIDAD: Especifica ejercicios de activación articular y aproximación al SNC.
    🦍 BLOQUE PRINCIPAL (CORE): Ejercicios multiarticulares con RPE/RIR, % de RM calculado, Series x Reps, Tempo y tiempos de Descanso (ej. 3-5 min). Adapta el peso a los RM del atleta.
    🦾 ACCESORIOS & HIPERTROFIA: Trabajo analítico para debilidades. Usa técnicas avanzadas (Drop sets, Myo-reps) si el parámetro lo exige.
    ⚡ ACONDICIONAMIENTO (Opcional): Si el foco es recomposición o pérdida de peso, incluye un protocolo HIIT (Ej: EMOM, Tabata en Assault Bike).
    🧘‍♂️ COOL-DOWN & FLEXIBILIDAD: Estiramientos estáticos específicos para los músculos trabajados.

    ESTRUCTURA OBLIGATORIA (JSON VÁLIDO):
    Las claves del JSON deben ser obligatoriamente: "d1", "d2", "d3", "d4", "d5", "d6", "d7".
    Si el atleta NO entrena un día específico (según sus días disponibles), no pongas "Descanso" a secas. Escribe un protocolo de "🧬 RECUPERACIÓN ACTIVA: Caminata ligera 10k pasos, hidratación y estiramientos suaves".
    `;

    const response = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemMessage }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" } 
    });

    const resultStr = response.choices[0]?.message?.content || "{}";
    const resultJson = JSON.parse(resultStr);

    return NextResponse.json({ result: resultJson });

  } catch (error) {
    console.error("❌ ERROR EN COPILOTO SEMANAL:", error);
    return NextResponse.json({ error: "Error de servidor al generar el microciclo." }, { status: 500 });
  }
}