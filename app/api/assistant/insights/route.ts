import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json();

    // 🔴 INICIALIZACIÓN SEGURA DE LA API KEY ADENTRO DE LA FUNCIÓN
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
       console.error("Falta la GROQ_API_KEY en las variables de entorno.");
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }
    const groq = new Groq({ apiKey: apiKey });

    let systemPrompt = "";
    let userMessage = "";

    // LÓGICA 1: OJO DE HALCÓN (FATIGA DIARIA DEL ATLETA)
    if (action === "analyze_fatigue") {
      systemPrompt = `Eres un sistema experto en neurofisiología y recuperación. Analiza los siguientes datos de check-in de un atleta (sueño y estrés) y devuelve ÚNICAMENTE un JSON con este formato exacto:
      {"status": "verde|amarillo|rojo", "message": "un consejo corto y muy técnico de 2 líneas sobre cómo entrenar hoy basándose en su SNC"}`;
      userMessage = `Últimos check-ins: ${JSON.stringify(data)}. Genera el JSON.`;
    } 
    
    // LÓGICA 2: WARM-UP INTELIGENTE
    else if (action === "generate_warmup") {
      systemPrompt = `Eres un coach de powerlifting. El atleta te dará un ejercicio y un peso objetivo (serie efectiva). Genera un protocolo de aproximación (calentamiento) eficiente y minimalista. Responde en texto plano, directo y formal, sin formato markdown. Usa saltos de línea. MÁXIMO 5 series de aproximación.`;
      userMessage = `Ejercicio: ${data.lift}. Peso objetivo: ${data.weight}kg. Dame las series de aproximación.`;
    }

    // LÓGICA 3: EVALUADOR DE BITÁCORA DIARIA DEL ATLETA
    else if (action === "evaluate_log") {
      systemPrompt = `Eres el guardián del método BII (Baja Frecuencia, Alta Intensidad). Lee la bitácora del atleta. Si detectas un volumen excesivo (más de 4 ejercicios distintos por grupo muscular, o demasiadas series inútiles), devuelve una crítica constructiva pero severa. Si el volumen es adecuado e intenso, felicítalo formalmente. Responde en 2 líneas.`;
      userMessage = `Bitácora del día: "${data.log}"`;
    }

    // ✅ LÓGICA 4 (NUEVA): EL COACH COPILOT (RESUMEN SEMANAL PARA TI)
    else if (action === "coach_copilot") {
        systemPrompt = `Eres el Asistente Clínico de Élite de Luciano Tujague (Head Coach). 
        Tu trabajo es leer TODA la semana de un atleta (sus 7 días de bitácora, horas de sueño, estrés, lesiones y RMs) y darle un resumen GERENCIAL a Luciano para que él pueda armar la rutina de la próxima semana en 2 minutos.
        
        TONO: Clínico, directo, sin saludos ni despedidas. Como un reporte médico.
        
        FORMATO ESTRICTO (USA NEGRITAS Y VIÑETAS):
        🔴 ESTADO NEUROLÓGICO (SNC): (Resume cómo durmió y su estrés en 1 línea).
        🟠 RESPUESTA MECÁNICA: (Qué ejercicios falló, cuáles sintió fáciles o si hubo dolores, resumiendo los 7 días).
        🟢 DIAGNÓSTICO PARA PRÓXIMO MICROCICLO: (Tu recomendación técnica sobre si Luciano debería subir volumen, bajar intensidad, o cambiar ejercicios).`;
        
        userMessage = `Aquí tienes los datos crudos del microciclo de este atleta:
        ${data.log}`;
    }

    // CONFIGURACIÓN DINÁMICA DE LA IA
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Baja temperatura para análisis lógico y matemático
      max_tokens: action === "coach_copilot" ? 800 : 250, // Le damos más memoria al Copilot
      response_format: action === "analyze_fatigue" ? { type: "json_object" } : undefined
    });

    const reply = response.choices[0]?.message?.content || "";
    
    if (action === "analyze_fatigue") {
        return NextResponse.json({ result: JSON.parse(reply) });
    }

    return NextResponse.json({ result: reply });

  } catch (error: any) {
    console.error("❌ ERROR EN INSIGHTS GROQ:", error.message || error);
    return NextResponse.json({ error: "Error procesando IA" }, { status: 500 });
  }
}