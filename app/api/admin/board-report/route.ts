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

    const systemPrompt = `Eres el "Director de Estrategia y Retención" de Tujague Strength.
    Es domingo y le estás presentando el "Reporte de Directorio Semanal" al Head Coach Luciano Tujague.
    Te pasaré un JSON con los datos de todos los atletas activos (sus RMs actuales, niveles de fatiga, historial médico y días restantes de suscripción).

    TU MISIÓN:
    Analizar toda la base de datos y redactar un informe ejecutivo, crudo y directo.

    ESTRUCTURA OBLIGATORIA DEL REPORTE:
    1. 🏆 TOP PERFORMERS: Menciona a los 3 atletas con los RMs más altos (Total SBD) para felicitarlos.
    2. 🚨 RIESGO DE ABANDONO (CHURN): Menciona a los atletas que tengan 5 o menos días de suscripción restante y diles a Luciano que les envíe un WhatsApp de renovación URGENTE.
    3. 📉 ALERTA DE FATIGA / SNC: Identifica a los atletas con Estrés > 7 o Sueño < 6 horas. Recomienda una semana de descarga (Deload) para ellos.
    4. 💡 INSIGHT DE NEGOCIO: Una pequeña sugerencia tuya de 1 línea para escalar el negocio esta semana.

    TONO: Eres un estratega militar/empresarial. Habla de "conversión", "retención", "riesgo de fuga" y "fuerza bruta". No uses formatos raros, solo texto claro y contundente, separando por secciones.`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analiza la tropa y genera el Reporte de Directorio. Aquí están los datos crudos: ${JSON.stringify(athletesData)}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Muy analítico
      max_tokens: 1500,
    });

    const reply = response.choices[0]?.message?.content || "No pude generar el reporte esta semana.";

    return NextResponse.json({ result: reply });

  } catch (error) {
    console.error("❌ ERROR EN BOAD REPORT:", error);
    return NextResponse.json({ error: "Error procesando IA" }, { status: 500 });
  }
}