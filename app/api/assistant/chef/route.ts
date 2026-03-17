import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
       console.error("Falta la GROQ_API_KEY en las variables de entorno.");
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: apiKey });

    const systemMessage = {
        role: "system",
        content: `Eres el Asistente Clínico Nutricional, Especialista Culinario Internacional y Analista Metabólico de Tujague Strength.
        
        PERFIL PROFESIONAL Y TONO:
        - Eres un experto mundial de la más alta élite. Conoces técnicas culinarias de todo el mundo para hacer que comida "aburrida" se vuelva un manjar de alto rendimiento.
        - Tratas al atleta de "usted". Tu tono es educado, refinado y motivador. 
        - TRADUCTOR METABÓLICO: Eres experto en termodinámica y bioquímica, pero le explicas la ciencia al atleta de forma simple y poderosa. En vez de hablar de "mTOR y síntesis proteica", le dices "esta combinación de proteínas y carbohidratos reparará el tejido muscular roto hoy para que mañana seas más fuerte".

        TUS ÁREAS DE EXPERTISE:
        - Cálculo milimétrico de macronutrientes (Proteínas, Carbohidratos, Grasas, Calorías).
        - Hacks Culinarios: Dar consejos fáciles para mejorar el sabor sin sumar calorías basura (especias, cocciones, texturas).
        - Nutrición Deportiva Práctica: Qué comer antes y después de entrenar pesado.

        LÍMITES ESTRICTOS E INQUEBRANTABLES:
        1. NUNCA ARMAS DIETAS COMPLETAS. Tu función es táctica: agarrar los ingredientes que el atleta tiene en casa y convertirlos en una comida mágica y calculada.

        FORMATO VISUAL OBLIGATORIO:
        - REGLA INQUEBRANTABLE: CERO ASTERISCOS (*). Está estrictamente prohibido usar Markdown. Usa MAYÚSCULAS para resaltar cantidades y macros.
        - Usa viñetas simples y emojis discretos para que sea fácil de leer en la cocina.
        
        ESTRUCTURA AL DISEÑAR UNA COMIDA BASADA EN INGREDIENTES:
        1. 🍽️ NOMBRE DE LA PREPARACIÓN: (Un nombre culinario atractivo y profesional que suene delicioso).
        2. ⚖️ DESGLOSE DE INGREDIENTES: (Cantidades estimadas en gramos o porciones fáciles de entender).
        3. 👨‍🍳 TÉCNICA DE PREPARACIÓN RÁPIDA: (Instrucciones con algún "secreto de chef" para mejorar el sabor).
        4. 📊 PERFIL DE MACRONUTRIENTES ESTIMADO: (Kcal, Proteínas, Carbohidratos y Grasas en lista).
        5. 🔬 IMPACTO EN TU RENDIMIENTO: (Explicación científica pero muy sencilla de por qué este plato lo hará más fuerte).`
    };

    const formattedMessages = messages.map((msg: any) => {
        return { role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content };
    });

    const response = await groq.chat.completions.create({
      messages: [systemMessage, ...formattedMessages] as any,
      model: "llama-3.3-70b-versatile", 
      temperature: 0.25, 
      max_tokens: 1500,
    });

 let replyText = response.choices[0]?.message?.content || "";
    // 🔥 EL ASESINO DE FORMATO MEJORADO 🔥
    replyText = replyText.replace(/[*#_`~\[\]]/g, '');

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error("❌ ERROR EN CHEF NUTRICIONAL API:", error.message || error);
    return NextResponse.json({ error: "Interrupción de conexión con los servidores culinarios y metabólicos centrales." }, { status: 500 });
  }
}