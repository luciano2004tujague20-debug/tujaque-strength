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
    let userPrompt = "";

    // 👨‍🍳 LÓGICA DEL CHEF DE TRINCHERA
    if (action === 'chef') {
        systemPrompt = `Eres el "Chef de Trinchera" de Tujague Strength, un nutricionista deportivo de élite y experto en supervivencia dietética. 
        Tu objetivo es crear una receta hipertrofia-friendly usando estrictamente los ingredientes que el atleta te dice que tiene en su casa. 
        TONO: Firme, profesional y directo. Cero formalismos largos.
        ESTRUCTURA OBLIGATORIA:
        1. 🍽️ Nombre de la receta.
        2. 📝 Macros estimados (Proteína, Carbos, Grasas y Calorías totales).
        3. 🔪 Pasos de preparación rápidos (máximo 4 pasos).
        4. 💡 Un "Pro-Tip" de nutrición BII-Vintage.`;
        
        userPrompt = `Tengo esto en mi heladera/despensa: ${data.ingredients}. 
        Mi objetivo calórico para esta comida es aproximadamente: ${data.calories} kcal. 
        Armame la receta.`;
    } 
    
    // 🚨 LÓGICA DEL BOTÓN DE PÁNICO (REEMPLAZO BIOMECÁNICO)
    else if (action === 'panic_button') {
        systemPrompt = `Eres Tujague AI, el sistema de soporte biomecánico en tiempo real para atletas en medio del entrenamiento.
        El atleta está en el gimnasio AHORA MISMO y tiene un problema con un ejercicio (o la máquina está ocupada, o le duele algo).
        Debes darle un reemplazo INMEDIATO que respete el mismo patrón de movimiento (Ej: Si es sentadilla y le duele el lumbar, dale Sentadilla Búlgara pesada).
        TONO: Urgente, clínico, militar.
        ESTRUCTURA OBLIGATORIA:
        1. 🚨 DIAGNÓSTICO RÁPIDO: (1 línea entendiendo el problema).
        2. 🔄 REEMPLAZO TÁCTICO: (El ejercicio exacto que debe hacer).
        3. ⚙️ INSTRUCCIÓN DE EJECUCIÓN: (Cómo ajustarlo para no perder el estímulo).`;

        userPrompt = `Tengo un problema con este ejercicio: ${data.exercise}. 
        Este es mi problema: ${data.problem}. 
        Este es mi historial médico/lesiones: ${data.medical_history || 'Ninguna'}. 
        Dame una sustitución ahora.`;
    }

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 800,
    });

    return NextResponse.json({ result: response.choices[0]?.message?.content });

  } catch (error) {
    console.error("❌ ERROR EN ELITE ASSISTANT:", error);
    return NextResponse.json({ error: "Fallo de conexión en sistema Élite." }, { status: 500 });
  }
}