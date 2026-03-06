import { NextResponse } from 'next/server';
import { mpPayment } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// ============================================================================
// 📁 TEMPLATES MAESTROS DE ESTRUCTURAS ESTÁTICAS (4 SEMANAS)
// ============================================================================
const templateFuerza = {
  macrocycle: "Estructura BII-Vintage", 
  mesocycle: "Fuerza Base (Heavy Duty Medible)", 
  microcycle: "Semana 1 - Control Total",
  annual_plan: {
    1: { 
         phase: "Intensificación", 
         focus: "Adaptación Neural & Control Total", 
         d1: "📖 CÓMO LEER EL PLAN Y REGLAS:\n- Tempo: Bajada - Pausa Abajo - Subida - Pausa Arriba\n- RPE 8: 2 reps en recámara.\n- Protocolo Día Malo: Si estás fatigado, bajá 5-10% la carga o hacé solo el Top Set.\n- REGLA DE ORO: Si el tempo se rompe, la serie termina.\n\n===================================\n\n📆 Fecha: ___/___/___ | 💤 Sueño (0-10): ___ | ⚡ Energía (0-10): ___ | 🤕 Dolor (0-10): ___\n\n🔥 DÍA 1 (LOWER A) | Tempo: 5-1-2-1\n\nA. Sentadilla\n🎯 1x5 @ RPE 8 (Top Set) | 2x5 @ RPE 7 (Back-off: -6 a -10%)\n⏳ Descanso: 4-6 min\n📊 [ ] Top Set: Plan ___kg | Real ___kg x ___reps | RPE Real: ___\n📊 [ ] Back-off: Plan ___kg | Real ___kg x ___reps | RPE Real: ___\n📝 Notas: ____________________\n\nB. Press Militar\n🎯 3x6 @ RPE 7\n⏱️ Tempo: 4-0-2-1 | ⏳ Descanso: 2-3 min\n📊 [ ] Set 1: Real ___kg x ___reps | RPE: ___\n📊 [ ] Set 2: Real ___kg x ___reps | RPE: ___\n📊 [ ] Set 3: Real ___kg x ___reps | RPE: ___\n📝 Notas: ____________________", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño (0-10): ___ | ⚡ Energía (0-10): ___ | 🤕 Dolor (0-10): ___\n\n🔥 DÍA 2 (UPPER A) | Tempo: 5-1-2-1\n\nA. Press Banca (Pausa real en pecho)\n🎯 1x5 @ RPE 8 (Top Set) | 2x5 @ RPE 7 (Back-off)\n⏳ Descanso: 3-5 min\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n📊 [ ] Back-off: Real ___kg x ___reps | RPE: ___\n📝 Notas: ____________________\n\nB. Fondos en Paralelas\n🎯 3x6 @ RPE 8\n⏱️ Tempo: 4-1-2-1 | ⏳ Descanso: 2-3 min\n📊 [ ] Sets: Real ___kg | Reps: ___, ___, ___ | RPE: ___\n📝 Notas: ____________________", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño (0-10): ___ | ⚡ Energía (0-10): ___ | 🤕 Dolor (0-10): ___\n\n🔥 DÍA 3 (LOWER B)\n\nA. Peso Muerto Convencional (Reset en piso)\n🎯 1x4 @ RPE 8 | 2x4 @ RPE 7 (Back-off)\n⏱️ Tempo: 2-1-X-1 | ⏳ Descanso: 3.5-5 min\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n📊 [ ] Back-off: Real ___kg x ___reps | RPE: ___\n📝 Notas: ____________________\n\nB. Sentadilla Frontal / Técnica\n🎯 3x10 @ RPE 8\n⏱️ Tempo: 4-1-2-1 | ⏳ Descanso: 2-3 min\n📊 [ ] Sets: Real ___kg | Reps: ___, ___, ___ | RPE: ___\n📝 Notas: ____________________", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño (0-10): ___ | ⚡ Energía (0-10): ___ | 🤕 Dolor (0-10): ___\n\n🔥 DÍA 4 (UPPER B) | Tempo: 5-1-2-1\n\nA. Press Banca\n🎯 3x4 @ RPE 8\n⏳ Descanso: 3-5 min\n📊 [ ] Sets: Real ___kg | Reps: ___, ___, ___ | RPE: ___\n\nB. Press Militar\n🎯 2x6 @ RPE 7-8\n⏱️ Tempo: 4-0-2-1 | ⏳ Descanso: 2-3 min\n📊 [ ] Sets: Real ___kg | Reps: ___, ___ | RPE: ___\n\nC. Fondos Técnicos\n🎯 2x8 @ RPE 7-8\n⏱️ Tempo: 4-1-2-1 | ⏳ Descanso: 2-3 min\n📊 [ ] Sets: Real ___kg | Reps: ___, ___ | RPE: ___\n📝 Notas Semanales: ____________________", 
         d5: "🚶‍♂️ DESCANSO ACTIVO (RECUPERACIÓN)\n- Caminar 25-45 min suave (Zona 2 conversable).\n- Movilidad 10-15 min: tobillo/cadera + hombro/escápulas.", 
         d6: "💤 DESCANSO TOTAL (SNC)", 
         d7: "💤 DESCANSO TOTAL (SNC)" 
       },
    2: { 
         phase: "Intensificación", 
         focus: "Overload + Rest-Pause", 
         d1: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 1 (LOWER A) | Tempo: 5-1-X-1\n\nA. Sentadilla\n🎯 1x4 @ RPE 8.5 | 2x4 @ RPE 7.5\n⏳ Descanso: 4-6 min\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Press Militar\n🎯 3x5 @ RPE 7-8\n⏱️ Tempo: 4-0-2-1\n📊 [ ] Sets: Real ___kg | Reps: ___, ___, ___", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A) | Tempo: 5-1-X-1\n\nA. Press Banca [TÉCNICA: REST-PAUSE]\n🎯 1x4 @ RPE 9 | 1x4 @ RPE 8\n🚨 Rest-Pause: 1x4 @ RPE 8 -> 20s desc. -> +2 reps (Tope RPE 9.5)\n📊 [ ] Top Set: ___kg x ___reps | [ ] Rest-Pause: ___reps extra\n\nB. Fondos\n🎯 2x6 @ RPE 9\n⏱️ Tempo: 4-1-X-1\n📊 [ ] Sets: Real ___kg | Reps: ___, ___", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B) | Tempo: 2-1-X-1\n\nA. Peso Muerto\n🎯 1x3 @ RPE 8.5 | 2x3 @ RPE 7.5\n⏳ Descanso: 4-6 min\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Sentadilla Técnica\n🎯 2x4 @ RPE 6-7\n⏱️ Tempo: 5-1-X-1\n📊 [ ] Sets: Real ___kg | Reps: ___, ___", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B) | Tempo: 5-1-X-1\n\nA. Press Banca: 4x3 @ RPE 8-8.5\n📊 [ ] Real ___kg | Reps: ___, ___, ___, ___\n\nB. Press Militar: 3x4 @ RPE 8\n📊 [ ] Real ___kg | Reps: ___, ___, ___\n\nC. Fondos [REST-PAUSE]\n🎯 1x6 @ RPE 8 -> 20s desc. -> +2-3 reps\n📊 [ ] Real ___kg | Reps base: ___ | Extra: ___", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL (SNC)", d7: "💤 DESCANSO TOTAL (SNC)" 
       },
    3: { 
         phase: "Pico de Rendimiento", 
         focus: "Intensificación + Cluster/Drop", 
         d1: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 1 (LOWER A) | Tempo: 4-1-X-1\n\nA. Sentadilla\n🎯 1x3 @ RPE 9 | 2x3 @ RPE 8\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Press Militar\n🎯 3x4 @ RPE 8-9\n📊 [ ] Sets: Real ___kg | Reps: ___, ___, ___", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A) | Tempo: 4-1-X-1\n\nA. Press Banca\n🎯 1x3 @ RPE 9 | 2x3 @ RPE 8\n📊 [ ] Top Set: Real ___kg x ___reps\n\nB. Fondos [DROP SET]\n🎯 1x6 @ RPE 9 -> Bajar 10-15% -> 1x6-8 @ RPE 9\n📊 [ ] Base: ___kg x ___reps | Drop: ___kg x ___reps", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B) | Tempo: 2-1-X-1\n\nA. Peso Muerto\n🎯 1x2 @ RPE 9 | 2x2 @ RPE 8\n📊 [ ] Top Set: Real ___kg x ___reps\n\nB. Sentadilla Velocidad\n🎯 3x2 @ RPE 7 (Explosivas)\n📊 [ ] Real ___kg | Reps: ___, ___, ___", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B) | Tempo: 4-1-X-1\n\nA. Press Banca [CLUSTER 2+2]\n🎯 3 bloques de (2+2) con 20s descanso.\n📊 [ ] Bloque 1: ___ | Bloque 2: ___ | Bloque 3: ___\n\nB. Press Militar: 4x3 @ RPE 8.5\n📊 [ ] Real ___kg\n\nC. Fondos: 3x5 @ RPE 8-9\n📊 [ ] Real ___kg", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL (SNC)", d7: "💤 DESCANSO TOTAL (SNC)" 
       },
    4: { 
         phase: "Descarga (Deload)", 
         focus: "Disipación de Fatiga & Resensibilización", 
         d1: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 1 (LOWER A) | Tempo: 3-1-2-1\n(Sin técnicas de intensidad, bajar cargas)\n\nA. Sentadilla: 3x3 @ RPE 6-7\n📊 [ ] Real ___kg\n\nB. Press Militar: 2x5 @ RPE 6-7\n📊 [ ] Real ___kg", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A) | Tempo: 3-1-2-1\n\nA. Press Banca: 3x3 @ RPE 6-7\n📊 [ ] Real ___kg\n\nB. Fondos: 2x6 @ RPE 6-7\n📊 [ ] Real ___kg", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B)\n\nA. Peso Muerto (2-1-X-1): 3x2 @ RPE 6-7\n📊 [ ] Real ___kg\n\nB. Sentadilla (3-1-2-1): 2x3 @ RPE 6-7\n📊 [ ] Real ___kg", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B) | Tempo: 3-1-2-1\n\nA. Press Banca: 2x3 @ RPE 6-7\n📊 [ ] Real ___kg\n\nB. Press Militar: 2x5 @ RPE 6-7\n📊 [ ] Real ___kg\n\nC. Fondos: 2x6 @ RPE 6-7\n📊 [ ] Real ___kg\n\n🏆 PROTOCOLO COMPLETADO. El SNC se ha reseteado. Estás listo para testear tus 1RMs.", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL (SNC)", d7: "💤 DESCANSO TOTAL (SNC)" 
       }
  }
};

const templateHipertrofia = {
  macrocycle: "Estructura BII-Vintage",
  mesocycle: "Bloque 1: Mutación Hipertrófica",
  microcycle: "Semana 1 - Acumulación Base",
  annual_plan: {
    1: { 
         phase: "Hipertrofia", 
         focus: "Tensión Mecánica Controlada", 
         d1: "📖 REGLAS HIPERTROFIA BII:\n- Tempo: Bajada - Pausa Abajo - Subida - Pausa Arriba\n- Rest-Pause: Al límite, descansas 20-25s y sacas más reps.\n- Myo-reps: Activación límite + descansos de 15s + mini-series.\n- REGLA DE ORO: Máximo 1 técnica grande por sesión.\n\n===================================\n\n📆 Fecha: ___/___/___ | 💤 Sueño (0-10): ___ | ⚡ Energía (0-10): ___ | 🤕 Dolor (0-10): ___\n\n🔥 DÍA 1 (LOWER A - Sentadilla) | Tempo: 4-1-2-1\n\nA. Sentadilla Trasera\n🎯 1x8 @ RPE 8 (Top Set) | 2x8 @ RPE 7 (Back-off: -6 a -10%)\n⏳ Desc: 3-4 min\n📊 [ ] Top: Plan ___kg | Real ___kg x ___reps | RPE: ___\n📊 [ ] Back: Plan ___kg | Real ___kg x ___reps | RPE: ___\n📝 Notas: ____________________\n\nB. Peso Muerto Rumano (RDL)\n🎯 3x8 @ RPE 8\n⏳ Desc: 2-3 min\n📊 [ ] Sets: Real ___kg | Reps: ___, ___, ___\n\nC. Split Squat Búlgaro\n🎯 2x10 x pierna @ RPE 8\n⏳ Desc: 90-120 s\n📊 [ ] Real ___kg\n\nD. Curl Femoral\n🎯 2x12 @ RPE 8-9\n📊 [ ] Real ___kg\n\nE. Gemelos de pie (3-1-2-2)\n🎯 3x12 @ RPE 8\n📊 [ ] Real ___kg\n\nF. Core (Elevaciones piernas / Crunch cable)\n🎯 2x10-15 @ RPE 8", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A - Banca) | Tempo: 4-1-2-1\n\nA. Press Banca con Barra (Pausa real en pecho)\n🎯 1x8 @ RPE 8 | 2x8 @ RPE 7\n⏳ Desc: 3-4 min\n📊 [ ] Top: Real ___kg x ___reps | RPE: ___\n📊 [ ] Back: Real ___kg x ___reps | RPE: ___\n\nB. Fondos en Paralelas\n🎯 3x8 @ RPE 8\n⏳ Desc: 2-3 min\n📊 [ ] Real ___kg | Reps: ___, ___, ___\n\nC. Remo con Barra (3-1-2-1)\n🎯 4x8 @ RPE 8\n📊 [ ] Real ___kg\n\nD. Dominadas Supinas o Jalón (3-1-2-1)\n🎯 3x8-10 @ RPE 8\n📊 [ ] Real ___kg\n\nE. Elevaciones Laterales (3-1-2-1)\n🎯 3x12 @ RPE 8-9\n📊 [ ] Real ___kg\n\nF. Curl Bíceps (3-1-2-1)\n🎯 2x12 @ RPE 8-9\n📊 [ ] Real ___kg", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B - PM)\n\nA. Peso Muerto Convencional (2-1-X-1, Reset)\n🎯 1x6 @ RPE 8 | 2x6 @ RPE 7\n⏳ Desc: 3.5-5 min\n📊 [ ] Top: Real ___kg x ___reps | RPE: ___\n\nB. Sentadilla Frontal o Goblet pesada (4-1-2-1)\n🎯 3x10 @ RPE 8\n⏳ Desc: 2-3 min\n📊 [ ] Real ___kg\n\nC. Hip Thrust (3-1-2-2)\n🎯 3x10 @ RPE 8\n📊 [ ] Real ___kg\n\nD. Extensión de Cuádriceps (3-1-2-1)\n🎯 2x12-15 @ RPE 8-9\n📊 [ ] Real ___kg\n\nE. Core: Plancha\n🎯 2x45-75 s @ RPE 8", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B - Militar)\n\nA. Press Militar (4-0-2-1)\n🎯 1x8 @ RPE 8 | 2x8 @ RPE 7\n⏳ Desc: 2.5-4 min\n📊 [ ] Top: Real ___kg x ___reps | RPE: ___\n\nB. Press Inclinado Barra/Mancuernas (4-1-2-1)\n🎯 3x10 @ RPE 8\n⏳ Desc: 2-3 min\n📊 [ ] Real ___kg\n\nC. Remo pecho apoyado (3-1-2-1)\n🎯 3x10 @ RPE 8\n📊 [ ] Real ___kg\n\nD. Face pull / Pájaros (3-1-2-1)\n🎯 3x12-15 @ RPE 8-9\n📊 [ ] Real ___kg\n\nE. Fondos Técnicos (4-1-2-1)\n🎯 2x10 @ RPE 8\n📊 [ ] Real ___kg\n📝 Notas Semanales: ____________________", 
         d5: "🚶‍♂️ DESCANSO ACTIVO (RECUPERACIÓN)\n- Caminar 25-45 min suave (Zona 2 conversable).\n- Movilidad 10-15 min: tobillo/cadera + hombro/escápulas.", 
         d6: "💤 DESCANSO TOTAL (SNC)", 
         d7: "💤 DESCANSO TOTAL (SNC)" 
       },
    2: { 
         phase: "Hipertrofia", 
         focus: "Overload + 1 Técnica por sesión", 
         d1: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 1 (LOWER A) | Tempo: 4-1-X-1\n\nA. Sentadilla Trasera\n🎯 1x8 @ RPE 8.5 | 2x8 @ RPE 7.5\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. RDL\n🎯 3x8 @ RPE 8.5\n📊 [ ] Real ___kg\n\nC. Búlgaro\n🎯 3x10 por pierna @ RPE 8\n\nD. Curl Femoral [TÉCNICA: MYO-REPS]\n🎯 1x12 @ RPE 9 -> 15-20s desc -> +4 reps -> 15-20s desc -> +4 reps (tope RPE 9.5)\n📊 [ ] Base ___kg x ___reps | Myo 1: ___ | Myo 2: ___\n\nE. Gemelos 3x12 + Core 2x10-15", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A) | Tempo: 4-1-X-1\n\nA. Press Banca\n🎯 1x8 @ RPE 9 | 1x8 @ RPE 8 (Back-off)\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Fondos\n🎯 3x8 @ RPE 8.5-9\n\nC. Remo con Barra (3-1-X-1)\n🎯 4x8 @ RPE 8-9\n\nD. Dominadas/Jalón (3-1-X-1)\n🎯 3x8-10 @ RPE 8-9\n\nE. Elevaciones Laterales [TÉCNICA: REST-PAUSE]\n🎯 1x12 @ RPE 9 -> 20s descanso -> +5-6 reps (tope RPE 9.5)\n📊 [ ] Base ___kg x ___reps | Rest-Pause: ___ reps\n\nF. Curl Bíceps 2x12 @ RPE 9", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B) | Tempo: 2-1-X-1\n\nA. Peso Muerto\n🎯 1x6 @ RPE 8.5 | 2x6 @ RPE 7.5\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Sentadilla Frontal (4-1-X-1)\n🎯 3x10 @ RPE 8.5\n\nC. Hip Thrust (3-1-X-2)\n🎯 3x10 @ RPE 8.5\n\nD. Extensión de Cuádriceps [TÉCNICA: DROP SET]\n🎯 1x12 @ RPE 9 -> Bajar 15% peso -> 1x10-12 @ RPE 9 (sin llegar al fallo)\n📊 [ ] Base: ___kg x ___reps | Drop: ___kg x ___reps\n\nE. Core Plancha 2 sets", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B) | Tempo: 4-1-X-1\n\nA. Press Militar (4-0-X-1)\n🎯 1x8 @ RPE 8.5 | 2x8 @ RPE 7.5\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Press Inclinado\n🎯 3x10 @ RPE 8.5\n\nC. Remo pecho apoyado (3-1-X-1)\n🎯 3x10 @ RPE 8-9\n\nD. Face pull / Pájaros [TÉCNICA: MYO-REPS]\n🎯 1x15 @ RPE 9 -> 15-20s -> +5 reps -> 15-20s -> +5 reps\n📊 [ ] Base ___kg x ___reps | Myo 1: ___ | Myo 2: ___\n\nE. Fondos 2x10 @ RPE 8-9", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL (SNC)", d7: "💤 DESCANSO TOTAL (SNC)" 
       },
    3: { 
         phase: "Pico de Hipertrofia", 
         focus: "Intensificación al límite (Series que cuentan)", 
         d1: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 1 (LOWER A) | Tempo: 3-1-X-1\n\nA. Sentadilla Trasera\n🎯 1x6 @ RPE 9 | 2x8 @ RPE 8\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. RDL\n🎯 3x8 @ RPE 9\n\nC. Búlgaro [TÉCNICA: REST-PAUSE]\n🎯 1x10 @ RPE 9 -> 20s -> +4-5 reps (tope RPE 9.5)\n📊 [ ] Base ___kg x ___reps | RP: ___ reps\n\nD. Curl Femoral 2x10-12 @ RPE 9\nE. Gemelos 3x10-12 @ RPE 9 + Core 2 sets", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A) | Tempo: 3-1-X-1\n\nA. Press Banca [TÉCNICA: CLUSTER 3+3]\n🎯 3 bloques de: (3 + 3) con 20-25 s entre mini-bloques\n📊 [ ] Bloque 1: ___ | Bloque 2: ___ | Bloque 3: ___\n\nB. Fondos\n🎯 3x8 @ RPE 9\n\nC. Remo con Barra (3-1-X-1)\n🎯 4x8 @ RPE 9\n\nD. Dominadas/Jalón (3-1-X-1)\n🎯 3x8-10 @ RPE 9\n\nE. Elevaciones Laterales [TÉCNICA: DROP SET]\n🎯 1x12 @ RPE 9 -> Bajar 20% -> 1x10-12 @ RPE 9\n\nF. Curl Bíceps 2x10-12 @ RPE 9-9.5", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B) | Tempo: 3-1-X-1\n\nA. Peso Muerto (2-1-X-1)\n🎯 1x5 @ RPE 9 | 2x6 @ RPE 8\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Sentadilla Frontal\n🎯 3x8-10 @ RPE 9\n\nC. Hip Thrust (3-1-X-2)\n🎯 3x8-10 @ RPE 9\n\nD. Extensión de Cuádriceps [TÉCNICA: MYO-REPS]\n🎯 1x15 @ RPE 9 -> 15-20s -> +5 reps -> 15-20s -> +5 reps\n\nE. Core 2 sets", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B) | Tempo: 3-1-X-1\n\nA. Press Militar (3-0-X-1)\n🎯 1x6 @ RPE 9 | 2x8 @ RPE 8\n📊 [ ] Top Set: Real ___kg x ___reps | RPE: ___\n\nB. Press Inclinado\n🎯 3x8-10 @ RPE 9\n\nC. Remo pecho apoyado\n🎯 3x10 @ RPE 9\n\nD. Face pull / Pájaros (3-1-X-1)\n🎯 3x12-15 @ RPE 9\n\nE. Fondos [TÉCNICA: REST-PAUSE]\n🎯 1x8 @ RPE 9 -> 20-25s -> +3-4 reps (tope RPE 9.5)", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL (SNC)", d7: "💤 DESCANSO TOTAL (SNC)" 
       },
    4: { 
         phase: "Descarga", 
         focus: "Resensibilización al Volumen (Deload)", 
         d1: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 1 (LOWER A) | Tempo: 3-1-2-1\n(Bajar volumen 50%, RPE 6-7)\n\nA. Sentadilla: 2x8 @ RPE 6-7\nB. RDL: 2x8 @ RPE 6-7\nC. Gemelos: 2x12 @ RPE 7\nD. Core: 1-2 sets\n(Técnicas de intensidad deshabilitadas)", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A) | Tempo: 3-1-2-1\n\nA. Press Banca: 2x8 @ RPE 6-7\nB. Fondos: 2x8 @ RPE 6-7\nC. Remo: 2x10 @ RPE 6-7\nD. Laterales: 2x12 @ RPE 7", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B)\n\nA. Peso Muerto (2-1-X-1): 2x6 @ RPE 6-7\nB. Sentadilla Frontal: 2x10 @ RPE 6-7\nC. Hip Thrust: 2x10 @ RPE 6-7", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B) | Tempo: 3-1-2-1\n\nA. Press Militar: 2x8 @ RPE 6-7\nB. Press Inclinado: 2x10 @ RPE 6-7\nC. Deltoide posterior: 2x12-15 @ RPE 7\n\n🏆 PROTOCOLO COMPLETADO. Fibras reconstruidas. Estás listo para testear o iniciar un nuevo bloque.", 
         d5: "🚶‍♂️ DESCANSO ACTIVO (RECUPERACIÓN)\n- Caminar 25-45 min suave (Zona 2 conversable).\n- Movilidad 10-15 min: tobillo/cadera + hombro/escápulas.\n- Opcional: 'Pump' de 10 min muy liviano de brazos si no interfiere en recuperación.", 
         d6: "💤 DESCANSO TOTAL (SNC)", 
         d7: "💤 DESCANSO TOTAL (SNC)" 
       }
  }
};
// ============================================================================

export async function POST(req: Request) {
  try {
    // 1. Obtener parámetros de la URL (MercadoPago manda ?topic=payment&id=12345)
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    const paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');

    console.log(`Webhook recibido: Topic: ${topic}, ID: ${paymentId}`);

    if (topic === 'payment' && paymentId) {
      // 2. Consultar a Mercado Pago el estado real del pago
      const payment = await mpPayment.get({ id: paymentId });
      
      const { status, external_reference } = payment;

      // 3. Si el pago está aprobado, actualizamos la orden
     if (status === 'approved' && external_reference) {
        console.log(`Pago aprobado para referencia: ${external_reference}`);

        // 🌟 BIFURCACIÓN INTELIGENTE: ¿Qué estamos cobrando?
        
        if (external_reference.startsWith('upsell_')) {
            // 🎬 ES UNA COMPRA DEL MÓDULO DE VIDEOS
            const realOrderId = external_reference.replace('upsell_', '');
            
            const { error } = await supabaseAdmin
              .from('orders')
              .update({ 
                has_video_review: true, // ✅ ABRIMOS EL CANDADO EN EL DASHBOARD
                updated_at: new Date().toISOString()
              })
              .eq('id', realOrderId); 

            if (error) {
              console.error('Error abriendo candado de video:', error);
              return NextResponse.json({ error: 'Error DB Upsell' }, { status: 500 });
            }
            console.log(`¡Módulo de video desbloqueado para la orden ID: ${realOrderId}!`);

} else if (
  external_reference.startsWith('renew_') ||
  external_reference.startsWith('renewal_') ||
  external_reference.startsWith('upgrade_')
) {
  // 🔄 RENOVACIÓN / UPGRADE (AUTOMÁTICO + IDEMPOTENTE)
const isRenew =
  external_reference.startsWith('renew_') ||
  external_reference.startsWith('renewal_');

const isUpgrade = external_reference.startsWith('upgrade_');

const rawRef = external_reference
  .replace('renew_', '')
  .replace('renewal_', '')
  .replace('upgrade_', '')
  .trim();

  console.log('🔁 Renew/Upgrade detectado:', { external_reference, rawRef, paymentId });

  // 1) Buscar la orden objetivo (soporta que rawRef sea id O order_id)
  const { data: targetOrder, error: findErr } = await supabaseAdmin
    .from('orders')
    .select('id, order_id, plan_id, plan_title, expires_at, payment_id, status, sub_status')
    .or(`id.eq.${rawRef},order_id.eq.${rawRef}`)
    .maybeSingle();

  if (findErr) {
    console.error('❌ Error buscando orden para renew/upgrade:', findErr);
    return NextResponse.json({ error: 'Error DB Renew/Upgrade' }, { status: 500 });
  }

  if (!targetOrder) {
    console.warn('⚠️ No se encontró orden para renew/upgrade con ref:', rawRef);
    // Le devolvemos OK igual para que MP no reintente infinito
    return NextResponse.json({ status: 'ok' });
  }

  // 2) Idempotencia: si ya procesamos ESTE MISMO paymentId, no repetimos
  if (targetOrder.payment_id && String(targetOrder.payment_id) === String(paymentId)) {
    console.log('🛡️ Webhook duplicado: payment_id ya aplicado. No se extiende nada.');
    return NextResponse.json({ status: 'ok' });
  }

  const normalize = (v?: string | null) => (v || '').toLowerCase().trim();
  const currentPlanId = normalize(targetOrder.plan_id);

  // 3) Determinar días a agregar según plan actual (si es upgrade, será mensual)
  const sprintIds = ['semanal-3-4', 'semanal-5-6', 'semanal-7'];
  const monthlyIds = [
    'mensual-3-4', 'mensual-5-6', 'mensual-7',
    'mesociclo_base', 'pro_performance', 'elite_total', 'mesociclo_mensual'
  ];

  // helper: convertir semanal -> mensual manteniendo la frecuencia
  const toMonthlyEquivalent = (pid: string) => {
    if (pid.startsWith('semanal-3-4')) return 'mensual-3-4';
    if (pid.startsWith('semanal-5-6')) return 'mensual-5-6';
    if (pid.startsWith('semanal-7')) return 'mensual-7';
    // si ya es mensual o legacy mensual, lo dejamos igual
    if (monthlyIds.includes(pid)) return pid;
    return pid; // fallback: no inventamos
  };

  // Si es upgrade, forzamos plan mensual equivalente
  const newPlanId = isUpgrade ? toMonthlyEquivalent(currentPlanId) : currentPlanId;

  // Elegimos días: Sprint=7, Mensual=30 (incluye legacy mensual)
  let daysToAdd = 0;
  if (sprintIds.includes(newPlanId) && isRenew) {
    // Renovación de sprint: +7
    daysToAdd = 7;
  } else if (monthlyIds.includes(newPlanId) || newPlanId.startsWith('mensual')) {
    // Renovación mensual o upgrade a mensual: +30
    daysToAdd = 30;
  } else if (sprintIds.includes(newPlanId) && isUpgrade) {
    // Si por algún motivo no pudo mapear, igual tratamos upgrade como mensual
    daysToAdd = 30;
  }

  if (daysToAdd <= 0) {
    console.warn('⚠️ Renew/Upgrade: plan no elegible para extender. plan_id:', currentPlanId);
    // Igual marcamos payment_id para que no reintente extender “raramente”
    await supabaseAdmin.from('orders')
      .update({ payment_id: paymentId, updated_at: new Date().toISOString() })
      .eq('id', targetOrder.id);

    return NextResponse.json({ status: 'ok' });
  }

  // 4) Calcular nueva expiración: extendemos desde MAX(hoy, expires_at actual)
  const now = new Date();
  const base = targetOrder.expires_at ? new Date(targetOrder.expires_at) : now;
  const start = base > now ? base : now;

  const newExpiry = new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  // 5) Update final (upgrade: cambia plan_id si aplica)
  const updatePayload: any = {
    status: 'paid',
    payment_id: paymentId,
    expires_at: newExpiry.toISOString(),
    sub_status: 'activo',
    updated_at: new Date().toISOString(),
  };

  if (isUpgrade && newPlanId !== currentPlanId) {
    updatePayload.plan_id = newPlanId;
    // opcional: si querés que quede “coaching con video” abierto por default
    updatePayload.has_video_review = true;
  }

  const { error: updErr } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', targetOrder.id);

  if (updErr) {
    console.error('❌ Error aplicando renew/upgrade:', updErr);
    return NextResponse.json({ error: 'Error DB Renew/Upgrade Update' }, { status: 500 });
  }

  console.log('✅ Renew/Upgrade aplicado:', {
    orderId: targetOrder.id,
    fromPlan: currentPlanId,
    toPlan: isUpgrade ? newPlanId : currentPlanId,
    daysToAdd,
    newExpires_at: newExpiry.toISOString(),
  });

} else {
            // 🛒 ES LA COMPRA NORMAL DE UN PLAN NUEVO
            
            // a) Cambiamos el estado a PAGADO
            const { data: orderData, error } = await supabaseAdmin
              .from('orders')
              .update({ 
                status: 'paid', // ✅ CAMBIO A PAGADO AUTOMÁTICAMENTE
                payment_id: paymentId,
                updated_at: new Date().toISOString()
              })
              .eq('order_id', external_reference)
              .select('*') 
              .single();

            if (error) {
              console.error('Error actualizando orden de plan nuevo:', error);
              return NextResponse.json({ error: 'Error DB' }, { status: 500 });
            }

// 🔥 CÁLCULO DE CADUCIDAD AUTOMÁTICA (IDEMPOTENTE Y SEGURO) 🔥
if (orderData && orderData.plan_id && !orderData.expires_at) {
  const planId = orderData.plan_id.toLowerCase().trim();
  console.log('🧾 plan_id real:', JSON.stringify(orderData.plan_id), '=> normalized:', planId);

  let daysToAdd = 0;

  const sprintIds = ['semanal-3-4', 'semanal-5-6', 'semanal-7'];
  const monthlyIds = [
    'mensual-3-4', 'mensual-5-6', 'mensual-7',
    'mesociclo_base', 'pro_performance', 'elite_total', 'mesociclo_mensual'
  ];

  if (sprintIds.includes(planId)) daysToAdd = 7;
  else if (monthlyIds.includes(planId)) daysToAdd = 30;

  console.log('⏱️ daysToAdd:', daysToAdd, 'for planId:', planId);

  if (daysToAdd > 0) {
    const expiryDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    const { error: expiryError } = await supabaseAdmin
      .from('orders')
      .update({
        expires_at: expiryDate.toISOString(),
        sub_status: 'activo'
      })
      .eq('id', orderData.id);

    if (expiryError) {
      console.error('❌ Error seteando expires_at:', expiryError);
    } else {
      console.log('✅ expires_at seteado OK:', expiryDate.toISOString());
    }
  }
}
// 🔥 FIN CÁLCULO CADUCIDAD 🔥

            // 🔥 INYECCIÓN DE RUTINA ESTÁTICA AQUÍ 🔥
            // Si el plan que acaba de pagar es estático, le inyectamos la rutina
            if (orderData && orderData.plan_id === 'static-fuerza') {
                 await supabaseAdmin.from('orders').update({
                     macrocycle: templateFuerza.macrocycle, mesocycle: templateFuerza.mesocycle, microcycle: templateFuerza.microcycle,
                     annual_plan: templateFuerza.annual_plan,
                     routine_d1: templateFuerza.annual_plan[1].d1, routine_d2: templateFuerza.annual_plan[1].d2,
                     routine_d3: templateFuerza.annual_plan[1].d3, routine_d4: templateFuerza.annual_plan[1].d4,
                     routine_d5: templateFuerza.annual_plan[1].d5, routine_d6: templateFuerza.annual_plan[1].d6, routine_d7: templateFuerza.annual_plan[1].d7,
                 }).eq('order_id', external_reference);
                 console.log("🤖 Inyectando plantilla automática de Fuerza Base.");
            } else if (orderData && orderData.plan_id === 'static-hipertrofia') {
                 await supabaseAdmin.from('orders').update({
                     macrocycle: templateHipertrofia.macrocycle, mesocycle: templateHipertrofia.mesocycle, microcycle: templateHipertrofia.microcycle,
                     annual_plan: templateHipertrofia.annual_plan,
                     routine_d1: templateHipertrofia.annual_plan[1].d1, routine_d2: templateHipertrofia.annual_plan[1].d2,
                     routine_d3: templateHipertrofia.annual_plan[1].d3, routine_d4: templateHipertrofia.annual_plan[1].d4,
                     routine_d5: templateHipertrofia.annual_plan[1].d5, routine_d6: templateHipertrofia.annual_plan[1].d6, routine_d7: templateHipertrofia.annual_plan[1].d7,
                 }).eq('order_id', external_reference);
                 console.log("🤖 Inyectando plantilla automática de Hipertrofia.");
            }


            // b) 💰 SISTEMA DE AFILIADOS AUTOMÁTICO (MODELO VIRAL: 20% GANANCIA) 💰
            // Si el cliente entró referido por alguien, le pagamos al embajador
            if (orderData && orderData.referred_by) {
                console.log(`Ejecutando pago de comisión al embajador: ${orderData.referred_by}`);
                
                const { data: ambassadorData } = await supabaseAdmin
                    .from('orders')
                    .select('id, wallet_balance')
                    .eq('referral_code', orderData.referred_by)
                    .single();

                if (ambassadorData) {
                    // 🔥 LÓGICA DE ALTO VALOR: Calculamos el 20% exacto de lo que pagó el cliente (amount_ars)
                    const porcentajeGanancia = 0.20; // 20%
                    const comisionCalculada = Math.round(Number(orderData.amount_ars) * porcentajeGanancia); 
                    
                    const nuevoSaldo = Number(ambassadorData.wallet_balance || 0) + comisionCalculada;

                    await supabaseAdmin
                        .from('orders')
                        .update({ wallet_balance: nuevoSaldo })
                        .eq('id', ambassadorData.id);
                    
                    console.log(`✅ Saldo sumado a ${orderData.referred_by}: Se inyectaron $${comisionCalculada}. Nuevo total: $${nuevoSaldo}`);
                }
            }

            console.log(`✅ Orden ${external_reference} lista. Esperando flujo de WhatsApp.`);
        }
      }
    }

    // Devolvemos 200 OK a Mercado Pago rápido
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}