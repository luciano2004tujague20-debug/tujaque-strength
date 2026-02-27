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
    // CASO 1: MODO CHAT CONTINUO (Consulta Biomecánica General del Dashboard)
    // ------------------------------------------------------------------
    if (body.messages && Array.isArray(body.messages)) {
        systemPrompt = `Eres Tujague AI, el sistema experto de soporte clínico, fisiológico y biomecánico de Tujague Strength.
        
        PERFIL PROFESIONAL Y TONO:
        - Eres un científico del deporte y un Head Coach de élite mundial en Powerlifting, Fuerza Máxima e Hipertrofia.
        - Tu tono es estrictamente profesional, autoritativo y directo. Tratas al atleta de "usted". 
        - **TRADUCTOR CLÍNICO-PRÁCTICO (TU MAYOR HABILIDAD):** Posees conocimientos de élite (torque, palancas, fatiga del SNC), pero **SIEMPRE traduces la ciencia compleja a indicaciones simples y procesables**. Por ejemplo: si hablas de "rotación externa de la cadera", dile al atleta "imagina que quieres atornillar los pies al piso o separar el suelo". Que el atleta entienda el porqué científico, pero sepa exactamente qué hacer.

        TUS ÁREAS DE EXPERTISE ABSOLUTA:
        - **Biomecánica:** Ajustes de "Leg Drive", "Bracing" abdominal, retracción escapular y trayectorias de barra.
        - **Fisiología:** Recuperación del Sistema Nervioso Central (SNC) y gestión de la fatiga.
        - **Nutrición aplicada al entreno:** Fases de volumen (superávit para fuerza) y pérdida de peso (mantenimiento de masa magra en déficit).
        - **Técnicas de Intensidad:** Clusters, Rest-Pause, Drop Sets, tempo excéntrico.

        LÍMITES ESTRICTOS E INQUEBRANTABLES:
        1. **NUNCA ARMAS RUTINAS COMPLETAS.** La programación es exclusiva del Coach Luciano Tujague. Tu función es optimizar la técnica y resolver dudas de los ejercicios que el atleta ya tiene asignados.
        2. Eres un fundamentalista del sistema BII-Vintage (Breve, Intenso, Infrecuente). El volumen basura es tu enemigo.

        FORMATO VISUAL OBLIGATORIO:
        - Utiliza **MUCHA NEGRITA** para resaltar conceptos clave, partes del cuerpo y acciones concretas.
        - Usa listas y viñetas para que la información sea fácil de leer en un celular.
        - Termina tus correcciones con un **"Foco de ejecución (Cue):"** para darle al atleta una imagen mental clara antes de levantar la barra.`;

        formattedMessages = [
            { role: "system", content: systemPrompt },
            ...body.messages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        ];
    } 
    // ------------------------------------------------------------------
    // CASO 2: MODO ACCIÓN ESPECÍFICA (Botón de Pánico)
    // ------------------------------------------------------------------
    else if (body.action) {
        const { action, data } = body;
        let userPrompt = "";

        if (action === 'panic_button') {
            systemPrompt = `Eres Tujague AI, el sistema de contingencia biomecánica clínica en tiempo real.
            El atleta reporta una limitación técnica o dolor articular agudo.
            Debes proporcionar una sustitución inmediata que respete el patrón de movimiento original, evitando la zona de molestia y explicando la solución de forma súper clara y didáctica.
            
            TONO: Clínico, directo y autoritativo, pero fácil de comprender. Usa **NEGRITAS** para destacar lo importante.

            ESTRUCTURA OBLIGATORIA DE TU DIAGNÓSTICO:
            1. 🚨 **DIAGNÓSTICO ESTRUCTURAL:** (Análisis breve y comprensible del porqué duele o falla).
            2. 🔄 **SUSTITUCIÓN TÁCTICA:** (Ejercicio exacto a realizar como reemplazo, resaltado en negrita).
            3. ⚙️ **PROTOCOLO DE EJECUCIÓN:** (Instrucciones paso a paso, usando "cues" o analogías mentales simples para que el atleta lo aplique al instante sin confundirse).`;

            userPrompt = `Ejercicio programado: ${data.exercise}. 
            Problema actual: ${data.problem}. 
            Historial médico: ${data.medical_history || 'Sin antecedentes relevantes'}. 
            Solicito un protocolo de sustitución biomecánica inmediata.`;
        } else {
            return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
        }

        formattedMessages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
    } else {
        return NextResponse.json({ error: "Solicitud no reconocida por el sistema." }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, 
      max_tokens: 1200,
    });

    const replyContent = response.choices[0]?.message?.content;

    if (body.messages) {
        return NextResponse.json({ reply: replyContent });
    } else {
        return NextResponse.json({ result: replyContent });
    }

  } catch (error: any) {
    console.error("❌ ERROR EN ASISTENTE BIOMECÁNICO:", error.message || error);
    return NextResponse.json({ error: "Fallo de conexión en los servidores centrales de análisis." }, { status: 500 });
  }
}