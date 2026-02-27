// app/api/admin/generate-routine/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { athleteData, context } = body;

        // Validamos que se haya enviado la información necesaria
        if (!athleteData || !context) {
            return NextResponse.json({ error: "Faltan datos del atleta o contexto clínico." }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key de Groq no configurada en las variables de entorno." }, { status: 500 });
        }

        // Inicializamos el SDK de Groq
        const groq = new Groq({ apiKey: apiKey });

        // Estructuramos la información clínica del atleta para la IA
        const clinicalProfile = `
            RMs Actuales:
            - Sentadilla: ${athleteData.rm_squat || 0} kg
            - Press de Banca: ${athleteData.rm_bench || 0} kg
            - Peso Muerto: ${athleteData.rm_deadlift || 0} kg
            - Fondos Lastrados: ${athleteData.rm_dips || 0} kg
            - Press Militar: ${athleteData.rm_military || 0} kg
            
            Historial Médico/Lesiones: ${athleteData.medical_history || 'Ninguna reportada.'}
            Días Disponibles: ${athleteData.training_days || 'No especificado'}
            Reporte de Fatiga/SNC reciente: ${athleteData.recent_fatigue || 'Sin datos recientes.'}
        `;

        const isWeek = context.daysCount === 7;

        // ✅ PROMPT MAESTRO BII-VINTAGE CON ESTRUCTURA VISUAL OBLIGATORIA
        const systemPrompt = `
            Eres el Asistente Clínico de Programación del Coach Luciano Tujague.
            Tu función es generar la estructura de un entrenamiento basado en la metodología BII-Vintage.
            
            DIRECTRICES ESTRICTAS DE PROGRAMACIÓN:
            1. Tono: Clínico, profesional, directo. Usa terminología de fisiología y biomecánica (RPE, RIR, Tensión Mecánica, Volumen Efectivo).
            2. Fase seleccionada: ${context.phase}. Adapta el volumen y la intensidad (rangos de reps y % de RM) según esta fase.
            3. Enfoque Biomecánico: ${context.focus}. Selecciona los ejercicios accesorios acordes a este enfoque.
            4. Duración: ${isWeek ? 'Genera un MICROCICLO COMPLETO de una semana (Día 1 a Día 7)' : 'Genera UN SOLO DÍA de entrenamiento'}.
            5. Restricciones Médicas: Analiza el historial médico. Si hay lesiones (ej: hernia, dolor de hombro), OMITIR ejercicios contraindicados y sugerir variantes seguras.
            6. Estructura BII: 
               - Ejercicio Principal: Aplicar series de calentamiento, Top Set (serie pesada) y Back-off Set (serie de retroceso). Indicar porcentajes sugeridos si hay RMs registrados.
               - Ejercicios Accesorios: Programar por RPE/RIR (Ej: 2x8-10 @ RPE 8).
            7. Control SNC: Ajusta el volumen si el reporte de fatiga indica estrés alto o falta de sueño.

            🚨 REGLA DE ORO DE ESTRUCTURA VISUAL (OBLIGATORIA):
            NUNCA uses párrafos largos ni texto de corrido. Usa saltos de línea reales (\\n).
            Cada día debe tener ESTE formato exacto:

            [TÍTULO DEL DÍA EN MAYÚSCULAS]
            🎯 Objetivo: (Breve descripción)

            🏋️ EJERCICIO PRINCIPAL:
            1. [Nombre del Ejercicio]
               • Calentamiento: [Series y Reps]
               • Top Set: [1 serie x Reps @ % RM]
               • Back-offs: [Series x Reps @ % RM]
               • Descanso: [Minutos]
               • Foco Técnico: [Indicación breve]

            ⚙️ ACCESORIOS:
            2. [Nombre del Ejercicio]
               • Series/Reps: [Ej: 2x10]
               • Intensidad: [Ej: RPE 8]
               • Descanso: [Minutos]

            (Repite la estructura de accesorios según el volumen necesario).

            ${isWeek ? 
                `DEBES DEVOLVER ESTRICTAMENTE UN OBJETO JSON con el siguiente formato exacto para que el sistema distribuya los días:
                {
                  "d1": "contenido del día 1 formateado con saltos de línea",
                  "d2": "contenido del día 2 formateado con saltos de línea",
                  "d3": "...",
                  "d4": "...",
                  "d5": "...",
                  "d6": "...",
                  "d7": "..."
                }
                IMPORTANTE: Si un día es de descanso, el contenido debe ser simplemente: "DÍA DE DESCANSO / RECUPERACIÓN NEURAL". No incluyas markdown, solo el JSON puro.` : 
                `FORMATO DE SALIDA: Texto plano con la rutina del día formateada estrictamente como se indicó.`
            }
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Perfil del Atleta:\n${clinicalProfile}\n\nGenera la programación solicitada respetando estrictamente los saltos de línea.` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 2500,
            response_format: isWeek ? { type: "json_object" } : undefined, // Eliminado el { type: "text" } que causaba conflicto en la API nueva de Groq
        });

        const generatedRoutine = chatCompletion.choices[0]?.message?.content;

        if (!generatedRoutine) throw new Error("Respuesta vacía de la IA.");

        if (isWeek) {
            return NextResponse.json({ isWeek: true, routine: JSON.parse(generatedRoutine) });
        }

        return NextResponse.json({ isWeek: false, routine: generatedRoutine });

    } catch (error: any) {
        const errorMessage = error?.error?.message || error.message || "Error desconocido en Groq";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}