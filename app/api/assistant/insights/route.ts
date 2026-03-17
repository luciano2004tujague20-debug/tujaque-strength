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
      systemPrompt = `Actúa como el Analista Jefe de Neurofisiología de Tujague Strength. 
      Tu función es auditar los marcadores de estrés sistémico y la calidad del sueño del atleta para determinar la viabilidad de aplicar sobrecarga progresiva en la sesión de hoy.
      
      Devuelve ÚNICAMENTE un objeto JSON con este formato exacto, sin texto adicional:
      {"status": "verde|amarillo|rojo", "message": "Directiva clínica y quirúrgica de 2 líneas sobre la autorregulación del RPE o gestión del volumen para hoy, basándose estrictamente en la recuperación de su Sistema Nervioso Central (SNC)."}`;
      
      userMessage = `Últimos reportes fisiológicos del atleta: ${JSON.stringify(data)}. Genera el diagnóstico JSON.`;
    } 
    
    // LÓGICA 2: WARM-UP INTELIGENTE
    else if (action === "generate_warmup") {
      systemPrompt = `Eres el Especialista Biomecánico de Tujague Strength. 
      Genera un protocolo de aproximación (warm-up) de élite para el atleta. El objetivo es potenciar el Sistema Nervioso Central (SNC) y lubricar el tejido conectivo SIN generar fatiga residual antes de la serie efectiva.
      
      REGLAS CLÍNICAS:
      - CERO ASTERISCOS (*). Usa texto plano.
      - Utiliza porcentajes matemáticos exactos (Ej: 50% x 5, 70% x 3, 85% x 1).
      - Las repeticiones deben ser decrecientes a medida que sube el peso.
      - MÁXIMO 4 a 5 series de aproximación.
      - Tono: Estrictamente clínico, directo, sin saludos ni despedidas.
      - Usa guiones simples (-) para que sea visualmente impecable.`;
      
      userMessage = `Ejercicio programado: ${data.lift}. 
      Carga de la serie efectiva (Objetivo): ${data.weight}kg. 
      Diseña el protocolo de aproximación ahora.`;
    }

    // LÓGICA 3: EVALUADOR DE BITÁCORA DIARIA DEL ATLETA
    else if (action === "evaluate_log") {
      systemPrompt = `Eres el Auditor Jefe del Método BII-Vintage (Breve, Intenso, Infrecuente) en Tujague Strength. 
      Analiza la bitácora de la sesión que acaba de cargar el atleta. Tu evaluación debe ser quirúrgica y estricta.
      
      DIRECTRICES:
      1. CERO ASTERISCOS (*). Usa texto plano y limpio.
      2. Si detectas "volumen basura" (ejercicios analíticos irrelevantes, más de 3-4 ejercicios por grupo muscular, o falta de mención de proximidad al fallo), emite una corrección disciplinaria formal.
      3. Si el entrenamiento refleja intensidad extrema (RIR 0 / Fallo) y bajo volumen, valida su ejecución y felicítalo formalmente por respetar la metodología.
      4. Responde en 2-3 líneas con tono de Head Coach. Severo, profesional y al grano.`;
      
      userMessage = `Registro fisiológico de la sesión: "${data.log}". Emite tu dictamen técnico.`;
    }

    // LÓGICA 4: EL COACH COPILOT (RESUMEN SEMANAL PARA TI)
    else if (action === "coach_copilot") {
        systemPrompt = `Eres el Asistente de Inteligencia de Datos del Head Coach Luciano Tujague. 
        Tu tarea es condensar la información de la bitácora semanal del atleta (sueño, estrés, molestias articulares y RMs) en un reporte gerencial para la toma de decisiones tácticas.
        
        TONO: Clínico, militar, 100% objetivo. 
        
        FORMATO OBLIGATORIO (PROHIBIDO EL USO DE ASTERISCOS, USA MAYÚSCULAS Y EMOJIS):
        🔴 ESTADO DEL SNC: (Resumen preciso de su recuperación sistémica y estrés).
        🟠 TOLERANCIA MECÁNICA: (Análisis de fallos técnicos, estancamientos o dolores reportados en la semana).
        🟢 DIRECTIVA ESTRATÉGICA: (Recomendación algorítmica para Luciano: subir/bajar RPE, cambiar variantes, o mantener el curso en el próximo microciclo).`;
        
        userMessage = `Base de datos del microciclo de este atleta:
        ${data.log}`;
    }

    // 🔥 LÓGICA 5: ANÁLISIS ESTRUCTURAL DE RMs 🔥
    else if (action === "analyze_rms") {
        systemPrompt = `Eres el Sistema de Análisis Biomecánico Estructural de Tujague Strength.
        Tu objetivo es auditar las marcas de 1RM del atleta, cruzarlas con su peso corporal y nivel de experiencia, y detectar desbalances estructurales.
        
        ESTÁNDARES DE FUERZA TEÓRICA (BII-Vintage):
        - La Banca debe representar aprox. el 70-75% de la Sentadilla.
        - El Peso Muerto debe representar aprox. el 110-120% de la Sentadilla.
        - El Press Militar debe representar aprox. el 60-65% de la Banca.
        
        DIRECTRICES DE DIAGNÓSTICO:
        - PROHIBIDO EL USO DE ASTERISCOS (*). Usa texto plano.
        - Tono: Clínico, directo, frío y de máxima autoridad (en español argentino, usando vos). No saludes ni te despidas.
        - Indica en qué "percentil" de fuerza se encuentra considerando su peso corporal.
        - Identifica el "eslabón débil" o desbalance biomecánico de forma severa y técnica.
        - Si las proporciones son óptimas, reconócelo brevemente.
        - Formato estricto: 1 párrafo de análisis de proporciones. 1 párrafo de prescripción técnica/programación para corregir el déficit.`;
        
        userMessage = `Datos Estructurales del Atleta:
        - Peso Corporal: ${data.body_weight}
        - Experiencia Declarada: ${data.experience}
        - Sentadilla: ${data.rms.squat || 0} kg
        - Press Banca: ${data.rms.bench || 0} kg
        - Peso Muerto: ${data.rms.deadlift || 0} kg
        - Press Militar: ${data.rms.military || 0} kg
        - Fondos Lastrados: +${data.rms.dips || 0} kg
        - Total de Fuerza Absoluta: ${data.total} kg
        
        Ejecuta la auditoría de proporciones y emite el dictamen clínico.`;
    }

// CONFIGURACIÓN DINÁMICA DE LA IA
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Baja temperatura para mantener el perfil clínico y exacto
      max_tokens: action === "coach_copilot" || action === "analyze_rms" ? 1000 : 500,
      response_format: action === "analyze_fatigue" ? { type: "json_object" } : undefined
    });

    let reply = response.choices[0]?.message?.content || "";
    
    // 🔥 SEPARACIÓN LÓGICA DE RESPUESTAS 🔥
    if (action === "analyze_fatigue") {
        // 1. Si es JSON, lo devolvemos intacto para no romper la estructura de datos
        return NextResponse.json({ result: JSON.parse(reply) });
    } else {
        // 2. Si es texto para el atleta, usamos el ASESINO DE FORMATO MEJORADO
        reply = reply.replace(/[*#_`~\[\]]/g, '');
        return NextResponse.json({ result: reply });
    }

  } catch (error: any) {
    console.error("❌ ERROR EN INSIGHTS GROQ:", error.message || error);
    return NextResponse.json({ error: "Error procesando IA" }, { status: 500 });
  }
}