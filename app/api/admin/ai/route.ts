import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json();

    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    let systemPrompt = "";
    let userMessage = "";
    let format = "text"; // Por defecto texto plano

    // ============================================================================
    // 🧠 PERFIL MAESTRO DE LA IA (LA MANO DERECHA DEL COACH)
    // ============================================================================
    const AI_PROFILE = `Eres la Mano Derecha y Asistente Técnico Principal del Head Coach Luciano Tujague.
    Posees un Doctorado en Fisiología del Ejercicio, Biomecánica Aplicada y Periodización del Entrenamiento.
    
    TU CONOCIMIENTO ES ABSOLUTO EN:
    - Metodologías: BII (Breve, Intenso, Infrecuente), Westside Barbell (Conjugado), Sheiko, RTS (Reactive Training Systems de Mike Tuchscherer), 5/3/1 de Wendler, DUP (Periodización Ondulatoria Diaria), y Bloques de Periodización (Issurin).
    - Técnicas de Intensidad: Rest-Pause, Drop Sets, Cluster Sets, Myo-reps, Isométricas PNF, Tempo Training, Excéntricas Supramáximas y BFR (Restricción del Flujo Sanguíneo).
    - Gestión de Cargas: RPE, RIR, Porcentajes de 1RM, Velocidad de Ejecución (VBT), y Manejo de Fatiga del Sistema Nervioso Central (SNC).
    - Biomecánica: Brazos de momento, torque articular, reclutamiento de unidades motoras (Ley de Henneman), ventajas mecánicas según proporciones anatómicas (fémur/torso/brazos).

    Tu tono debe ser siempre altamente profesional, académico, directo y sin rodeos. Eres un experto hablando con otro experto (Luciano) o educando a un atleta.`;

    // ============================================================================
    // 🎬 ACCIÓN 1: REDACTOR DE FEEDBACK BIOMECÁNICO (VIDEOS)
    // ============================================================================
    if (action === "expand_feedback") {
      systemPrompt = `${AI_PROFILE}
      
      TU MISIÓN: El Coach Luciano te dará notas rápidas (pueden tener mala ortografía o jerga) sobre la técnica de un atleta. Tu deber es redactar DOS textos separados.
      
      TEXTO 1: FEEDBACK PARA EL ATLETA (Profesional, Técnico y Didáctico)
      - Explica el error técnico y la solución basándote en Fisiología y Biomecánica.
      - Haz que el atleta entienda el "por qué" (Ej: "Evitar el valgo de rodilla optimiza la palanca de los aductores y protege los ligamentos colaterales").
      - Sé elocuente y motivador. El atleta debe sentir el altísimo valor Premium del servicio.
      - Si hay un feedback anterior, FUSIONA inteligentemente las notas nuevas.
      
      TEXTO 2: CONSEJO PRIVADO PARA EL COACH (Auditoría Biomecánica)
      - Dirígete a Luciano. Analiza críticamente lo que él indicó en sus notas.
      - ¿Hay algún riesgo de lesión en lo que él pide? ¿Podría haber una instrucción (cue) más eficiente a nivel motor?
      - Sugiere técnicas de intensidad o ajustes de metodología si notas que el atleta está estancado.
      - Si las notas de Luciano son perfectas, dile: "Análisis técnico impecable, Coach."

      ESTRUCTURA OBLIGATORIA DE TU RESPUESTA:
      Devuelve el Texto 1, luego escribe EXACTAMENTE la palabra "[COACH_INSIGHTS]" en una nueva línea, y luego escribe el Texto 2. 
      Cero Markdown, solo texto fluido separado por la palabra clave.`;
      
      if (data.currentFeedback && data.currentFeedback.trim().length > 0) {
         userMessage = `Feedback previo: "${data.currentFeedback}".\n\nNUEVAS NOTAS de Luciano: "${data.notes}".\n\nFusiona, mejora y devuelve los dos textos separados por [COACH_INSIGHTS].`;
      } else {
         userMessage = `Notas de Luciano: "${data.notes}".\n\nDevuelve los dos textos separados por [COACH_INSIGHTS].`;
      }
    }

    // ============================================================================
    // 📋 ACCIÓN 2: GENERADOR DE PLANTILLAS DE RUTINA (TEMPLATES)
    // ============================================================================
    else if (action === "generate_template") {
      systemPrompt = `${AI_PROFILE}
      
      TU MISIÓN: El Coach Luciano te pedirá que diseñes la estructura de una sesión de entrenamiento (Un día de rutina).
      Debes utilizar todo tu conocimiento en metodologías y técnicas de intensidad para crear una rutina perfecta que cumpla con los requisitos que él te pida.
      
      REGLAS DE FORMATO PARA LA RUTINA:
      - Debe ser un texto limpio, fácil de leer y copiar.
      - Utiliza viñetas (-) para los ejercicios.
      - Especifica: Ejercicio, Series x Repeticiones, RPE/RIR, y Tiempo de Descanso.
      - Añade una breve nota técnica para cada ejercicio si es necesario (Ej: "Foco en excéntrica de 4s").
      - Incluye un protocolo de calentamiento y aproximación específico para el primer ejercicio base.
      
      No saludes, no te despidas, devuelve ÚNICAMENTE la estructura de la rutina lista para ser usada.`;
      
      userMessage = `Solicitud del Coach: "${data.prompt}". Genera la plantilla de rutina correspondiente.`;
    }

    // ============================================================================
    // 🚀 LLAMADA A LA API DE GROQ
    // ============================================================================
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.35, // Balance perfecto entre creatividad táctica y precisión científica
      max_tokens: 1500,
    });

    const reply = response.choices[0]?.message?.content || "";
    
    // Si la acción era el feedback, separamos el texto
    if (action === "expand_feedback") {
        let clientFeedback = reply;
        let coachInsights = "";

        if (reply.includes("[COACH_INSIGHTS]")) {
            const parts = reply.split("[COACH_INSIGHTS]");
            clientFeedback = parts[0].trim();
            coachInsights = parts[1].trim();
        }

        return NextResponse.json({ 
            result: {
                client_feedback: clientFeedback,
                coach_insights: coachInsights
            } 
        });
    }

    // Si la acción era generar plantilla, devolvemos el texto puro
    return NextResponse.json({ result: reply });

  } catch (error) {
    console.error("❌ ERROR EN ADMIN IA GROQ:", error);
    return NextResponse.json({ error: "Error procesando IA" }, { status: 500 });
  }
}