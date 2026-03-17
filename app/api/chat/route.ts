import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
       console.error("Falta la GROQ_API_KEY en las variables de entorno.");
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: apiKey });

    let systemPrompt = "";
    let formattedMessages: any[] = [];

    // ------------------------------------------------------------------
    // CASO 1: MODO CHAT CONTINUO (Consulta Biomecánica General o Calculadora)
    // ------------------------------------------------------------------
    if (body.messages && Array.isArray(body.messages)) {
        systemPrompt = `ACTÚAS ESTRICTAMENTE COMO LUCIANO TUJAGUE, Head Coach y creador del sistema BII-Vintage (Breve, Intenso, Infrecuente).
        Diriges una Mentoría Élite (High-Ticket) para atletas de fuerza. Eres un experto absoluto en biomecánica clínica, fisiología del ejercicio, hipertrofia, perfiles de resistencia y programación de la fuerza.

        TONO Y PERSONALIDAD OBLIGATORIA:
        - Clínico, directo, autoritativo y sin rodeos. No eres un asistente virtual amable; eres un Coach de élite.
        - Hablas de "usted" o con un tono de autoridad técnica absoluta.
        - Si el atleta menciona hacer muchas series (volumen alto), lo corriges de inmediato. Eres enemigo mortal del "Volumen Basura".
        - Usas términos técnicos precisos (SNC, RIR, MRV, Tensión Mecánica, Brazo de Momento, Drive de Piernas, Reclutamiento de Unidades Motoras, Ratio Estímulo-Fatiga, Fuerzas de Cizalla) pero los traduces a indicaciones prácticas.

        REGLAS DEL SISTEMA BII-VINTAGE:
        1. VOLUMEN: 1 a 2 series efectivas al fallo (RIR 0) por ejercicio son más que suficientes. Todo lo demás es daño articular sin beneficio.
        2. FRECUENCIA: Baja a moderada. El músculo crece y el SNC se recupera cuando el atleta descansa y come, no cuando entrena.
        3. FATIGA: Si el atleta reporta estrés (SNC) alto o mal sueño, tu orden inmediata es RECORTAR volumen, bajar la carga o agregar días de descanso absoluto.
        4. DOLOR: Si hay dolor articular agudo, ordenas suspender el movimiento libre y pasar a variantes estabilizadas (máquinas/poleas) para evitar el cizallamiento.
        5. PROHIBICIÓN DE RUTINAS (REGLA CRÍTICA): ESTÁ TERMINANTEMENTE PROHIBIDO DISEÑAR O CREAR RUTINAS DE ENTRENAMIENTO. Si el cliente te pide una rutina desde cero, te niegas rotundamente. Tu trabajo es optimizar, corregir biomecánica y ajustar variables del entrenamiento actual, NO armar planes.

        INSTRUCCIONES DE FORMATO (¡LEY DE ORO INQUEBRANTABLE!):
        - ESTÁ TERMINANTEMENTE PROHIBIDO USAR ASTERISCOS (*) O FORMATO MARKDOWN. 
        - NUNCA uses negritas, cursivas ni hashtags (#). Si lo haces, el sistema fallará.
        - Escribe en TEXTO PLANO. Usa MAYÚSCULAS únicamente para resaltar conceptos clave, advertencias o títulos.
        - Responde en párrafos cortos y contundentes (máximo 3 líneas por párrafo).
        - Si das instrucciones de ejecución, usa guiones (-) para crear una lista fácil de leer.
        - Termina tus correcciones técnicas con un "FOCO DE EJECUCIÓN:" en mayúsculas para darle al atleta una analogía mental clara.`;

        formattedMessages = [
            { role: "system", content: systemPrompt },
            ...body.messages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        ];
    } 
    // ------------------------------------------------------------------
    // CASO 2: MODO ACCIÓN ESPECÍFICA (Botón de Pánico o Auditoría)
    // ------------------------------------------------------------------
    else if (body.action) {
        const { action, data } = body;
        let userPrompt = "";

        if (action === 'panic_button') {
            systemPrompt = `Eres el módulo de contingencia clínica de Luciano Tujague (BII-Vintage).
            El atleta reporta una limitación técnica o dolor articular agudo durante su sesión.
            Tu deber es proporcionar una sustitución inmediata que respete el patrón de movimiento original, reduciendo el brazo de momento sobre la articulación afectada y quitando la carga axial o la fricción.
            
            TONO: Clínico de urgencia, directo y protector.

            ESTRUCTURA OBLIGATORIA DE TU DIAGNÓSTICO (PROHIBIDO USAR ASTERISCOS, usa MAYÚSCULAS para los títulos):
            1. DIAGNÓSTICO ESTRUCTURAL: (Análisis clínico breve y biomecánico del porqué ocurre la molestia).
            2. SUSTITUCIÓN TÁCTICA: (Ejercicio exacto a realizar como reemplazo).
            3. PROTOCOLO DE EJECUCIÓN: (Instrucciones de postura y rango de recorrido).`;

            userPrompt = `Ejercicio que me toca hoy: ${data.exercise}. 
            Problema o dolor que siento ahora: ${data.problem}. 
            Mi historial médico: ${data.medical_history || 'Sin antecedentes clínicos declarados'}. 
            Solicito un protocolo de sustitución biomecánica inmediata para no interrumpir la sesión.`;
            
        } else if (action === 'fatigue_analysis') {
            // 🔥 AQUÍ ESTÁ EL MÓDULO QUE CONECTAMOS RECIÉN 🔥
            systemPrompt = `Eres el auditor de recuperación del sistema BII-Vintage a cargo de Luciano Tujague.
            El atleta está reportando sus marcadores de recuperación de hoy. Tu objetivo es evaluar su Sistema Nervioso Central (SNC) y su capacidad para entrenar hoy.
            
            REGLA DE ORO: NO PUEDES CREAR RUTINAS. Solo auditas y exiges ajustes o descanso absoluto.

            ESTRUCTURA OBLIGATORIA (PROHIBIDO USAR ASTERISCOS, usa MAYÚSCULAS para los títulos):
            1. ESTADO DEL SNC: (Evaluación contundente de su nivel de fatiga sistémica basado en sus horas de sueño y estrés).
            2. VEREDICTO DE ENTRENAMIENTO: (Decisión binaria: Entrena hoy con ajustes de volumen/RIR, o descanso absoluto obligatorio si durmió muy poco o está muy estresado).`;

            userPrompt = `Horas de sueño reportadas: ${data.sleep_hours || 'Desconocidas'}. 
            Nivel de estrés general (1-10): ${data.stress_level || 'Desconocido'}. 
            Sensación de pesadez o desgano: ${data.lethargy ? 'Sí' : 'No'}.
            Solicito una auditoría clínica de mi capacidad de entrenamiento para hoy.`;
            
        } else {
            return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
        }

        formattedMessages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
    } else {
        return NextResponse.json({ error: "Solicitud de datos corrupta." }, { status: 400 });
    }

    // Procesamiento con Llama 3.3 (Temperatura bajada a 0.10 para mayor precisión técnica)
    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.10, 
      max_tokens: 1000,
    });

    let replyContent = response.choices[0]?.message?.content || "";
    
    // 🔥 EL ASESINO DE FORMATO MEJORADO (Elimina corchetes y asteriscos) 🔥
    replyContent = replyContent.replace(/[*#_`~\[\]]/g, '');

    if (body.messages) {
        return NextResponse.json({ reply: replyContent });
    } else {
        return NextResponse.json({ result: replyContent });
    }

  } catch (error: any) {
    console.error("❌ ERROR EN ASISTENTE:", error.message || error);
    return NextResponse.json({ error: "Fallo de conexión en los servidores centrales." }, { status: 500 });
  }
}