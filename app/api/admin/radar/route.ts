import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { athletesData } = await req.json();

    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({ error: "Falta API Key" }, { status: 500 });
    }

    const systemPrompt = `Eres el "Analista en Jefe de Rendimiento y Retención" del Head Coach Luciano Tujague.
    El Coach te acaba de pasar la lista de todos sus atletas activos con sus últimos datos de fatiga (SNC) y los días restantes de su plan.
    
    TU MISIÓN:
    Armar un "Reporte de Situación (SitRep)" cortísimo, rudo y al pie.
    
    INSTRUCCIONES DE ANÁLISIS:
    1. Si ves a alguien durmiendo menos de 6 horas o con estrés de 8 para arriba, noméntalo y dile a Luciano que le baje el volumen a ese atleta hoy.
    2. Si ves a alguien que le quedan 3 días o menos de suscripción, avísale a Luciano para que le mande un WhatsApp de renovación.
    3. Si todos están bien (durmiendo +7hs, estrés bajo), felicita al equipo y diles que hoy se tira pesado.
    4. TONO: Habla como un estratega militar argentino o un segundo entrenador. Directo, sin vueltas, usando jerga (SNC, RPE, volumen basura).
    5. OBLIGATORIO: Máximo 2 o 3 párrafos cortos. Es un resumen rápido para que el Coach lo lea en 10 segundos al tomar su café.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiza esta data de mis atletas hoy: ${JSON.stringify(athletesData)}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 350,
    });

    const reply = response.choices[0]?.message?.content || "No pude analizar la tropa hoy, Coach.";

    return NextResponse.json({ result: reply });

  } catch (error) {
    console.error("❌ ERROR EN RADAR:", error);
    return NextResponse.json({ error: "Error procesando IA" }, { status: 500 });
  }
}