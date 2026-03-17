"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// 📁 RUTINAS MAESTRAS PARA PLANES ESTÁTICOS (INYECTADAS AL APROBAR)
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

const templateDefinicion = {
  macrocycle: "Estructura BII-Vintage",
  mesocycle: "Definición Estricta (Cut)",
  microcycle: "Semana 1 - Adaptación al Déficit",
  annual_plan: {
    1: { 
         phase: "Déficit Calórico", 
         focus: "Adaptación al Déficit", 
         d1: "📖 REGLAS DEFINICIÓN BII:\n- Tempo: 4-1-X-1 (Control excéntrico).\n- RPE 8: 2 reps en recámara.\n- Regla NO GRIND: Si la repetición es muy lenta, terminar serie.\n- Checklist: Subir carga solo si cumple tempo + técnica + reps.\n\n===================================\n\n📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 1 (LOWER A - Sentadilla)\n\nA. Sentadilla Libre\n🎯 1x4 @ RPE 8 | 2x4 @ RPE 7\n⏳ Descanso: 4-5 min\n📊 [ ] Top Set: Real ___kg x ___reps\n📊 [ ] Back-off: Real ___kg x ___reps\n\nB. Peso Muerto Rumano\n🎯 3x6 @ RPE 8\n\nC. Curl Femoral\n🎯 2x10 @ RPE 8", 
         d2: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 2 (UPPER A - Banca)\n\nA. Press Banca\n🎯 1x4 @ RPE 8 | 2x4 @ RPE 7\n📊 [ ] Top Set: Real ___kg x ___reps\n\nB. Fondos Lastrados\n🎯 3x6 @ RPE 8\n\nC. Remo con Barra\n🎯 3x6-8 @ RPE 8\n\nD. Elevaciones Laterales\n🎯 2x12 @ RPE 8", 
         d3: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 3 (LOWER B - Deadlift)\n\nA. Peso Muerto\n🎯 1x3 @ RPE 8 | 2x3 @ RPE 7\n📊 [ ] Top Set: Real ___kg x ___reps\n\nB. Sentadilla Frontal\n🎯 3x6 @ RPE 8\n\nC. Hip Thrust\n🎯 2x8 @ RPE 8", 
         d4: "📆 Fecha: ___/___/___ | 💤 Sueño: ___ | ⚡ Energía: ___ | 🤕 Dolor: ___\n\n🔥 DÍA 4 (UPPER B - Militar)\n\nA. Press Militar\n🎯 1x5 @ RPE 8 | 2x5 @ RPE 7\n📊 [ ] Top Set: Real ___kg x ___reps\n\nB. Press Inclinado\n🎯 3x8 @ RPE 8\n\nC. Remo Pecho Apoyado\n🎯 3x8 @ RPE 8\n\nD. Curl Bíceps\n🎯 2x10 @ RPE 8", 
         d5: "🚶‍♂️ DESCANSO ACTIVO (Pasos diarios: 6k-10k)", 
         d6: "💤 DESCANSO TOTAL (SNC)", 
         d7: "💤 DESCANSO TOTAL (SNC)" 
       },
    2: { 
         phase: "Déficit Calórico", 
         focus: "Mantener Intensidad", 
         d1: "🔥 DÍA 1 (LOWER A)\nA. Sentadilla: 1x4 @ RPE 8.5 | 2x4 @ RPE 7.5\nB. P. Muerto Rumano: 3x6 @ RPE 8.5\nC. Curl Femoral: 2x10 @ RPE 8.5", 
         d2: "🔥 DÍA 2 (UPPER A)\nA. Press Banca: 1x4 @ RPE 8.5 | 2x4 @ RPE 7.5\nB. Fondos Lastrados: 3x6 @ RPE 8.5\nC. Remo Barra: 3x6-8 @ RPE 8.5\nD. Laterales: 2x12 @ RPE 8.5", 
         d3: "🔥 DÍA 3 (LOWER B)\nA. Peso Muerto: 1x3 @ RPE 8.5 | 2x3 @ RPE 7.5\nB. Sentadilla Frontal: 3x6 @ RPE 8.5\nC. Hip Thrust: 2x8 @ RPE 8.5", 
         d4: "🔥 DÍA 4 (UPPER B)\nA. Press Militar: 1x5 @ RPE 8.5 | 2x5 @ RPE 7.5\nB. Press Inclinado: 3x8 @ RPE 8.5\nC. Remo Pecho Apoyado: 3x8 @ RPE 8.5\nD. Curl Bíceps: 2x10 @ RPE 8.5", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL", d7: "💤 DESCANSO TOTAL" 
       },
    3: { 
         phase: "Déficit Calórico", 
         focus: "Semana Pesada (Peak Intensidad)", 
         d1: "🔥 DÍA 1 (LOWER A)\nA. Sentadilla: 1x3 @ RPE 9 | 2x3 @ RPE 8\nB. P. Muerto Rumano: 3x5 @ RPE 9\nC. Curl Femoral: 2x8 @ RPE 9", 
         d2: "🔥 DÍA 2 (UPPER A)\nA. Press Banca: 1x3 @ RPE 9 | 2x3 @ RPE 8\nB. Fondos Lastrados: 3x5 @ RPE 9\nC. Remo Barra: 3x6 @ RPE 9\nD. Laterales: 2x10 @ RPE 9", 
         d3: "🔥 DÍA 3 (LOWER B)\nA. Peso Muerto: 1x2 @ RPE 9 | 2x2 @ RPE 8\nB. Sentadilla Frontal: 3x5 @ RPE 9\nC. Hip Thrust: 2x6 @ RPE 9", 
         d4: "🔥 DÍA 4 (UPPER B)\nA. Press Militar: 1x4 @ RPE 9 | 2x4 @ RPE 8\nB. Press Inclinado: 3x6 @ RPE 9\nC. Remo Pecho Apoyado: 3x6 @ RPE 9\nD. Curl Bíceps: 2x8 @ RPE 9", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL", d7: "💤 DESCANSO TOTAL" 
       },
    4: { 
         phase: "Descarga", 
         focus: "Deload (Bajar volumen)", 
         d1: "🔥 DÍA 1 (LOWER A)\nA. Sentadilla: 2x4 @ RPE 6-7\nB. P. Muerto Rumano: 2x6 @ RPE 6-7", 
         d2: "🔥 DÍA 2 (UPPER A)\nA. Press Banca: 2x4 @ RPE 6-7\nB. Remo Barra: 2x6 @ RPE 6-7", 
         d3: "🔥 DÍA 3 (LOWER B)\nA. Peso Muerto: 2x3 @ RPE 6-7\nB. Sentadilla Frontal: 2x5 @ RPE 6-7", 
         d4: "🔥 DÍA 4 (UPPER B)\nA. Press Militar: 2x5 @ RPE 6-7\nB. Press Inclinado: 2x6 @ RPE 6-7\n🏆 BLOQUE COMPLETADO. SNC reseteado.", 
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL", d7: "💤 DESCANSO TOTAL" 
       }
  }
};
// ============================================================================

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Pestañas (Filtros)
  const [filterTab, setFilterTab] = useState('todos');

  // MÉTRICAS CRM
  const [activeCount, setActiveCount] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [fatigueAlerts, setFatigueAlerts] = useState<any[]>([]);
  
  // ESTADOS DEL MODAL NUEVO ATLETA
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: "", email: "", password: "", planCode: ""
  });

  // 🤖 ESTADO DEL RADAR IA (RÁPIDO)
  const [radarReport, setRadarReport] = useState<string | null>(null);
  const [loadingRadar, setLoadingRadar] = useState(false);

  // 🚁 ESTADOS DEL REPORTE DOMINICAL (PROFUNDO)
  const [showBoardReport, setShowBoardReport] = useState(false);
  const [boardReportContent, setBoardReportContent] = useState<string | null>(null);
  const [generatingBoardReport, setGeneratingBoardReport] = useState(false);

  // 🔥 ESTADOS DE APROBACIÓN MANUAL Y KIT 🔥
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [enablingKitId, setEnablingKitId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });

    const { data: plansData } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (ordersData) {
        setOrders(ordersData);
        calculateCRM(ordersData);
        runRadarAnalysis(ordersData); // Ejecutamos la IA rápida al cargar
    }
    
if (plansData) {
        // 🔥 FILTRO HIGH-TICKET: Mostramos los planes oficiales 3.0
        const activePlanCodes = [
            'elite-90-dias', 
            'elite-180-dias', 
            'leyenda-365-dias',
            'static-fuerza', 
            'static-hipertrofia', 
            'mesociclo-definicion-4-semanas'
        ];
        
        const filteredPlans = plansData.filter(p => activePlanCodes.includes(p.code));
        
        setPlans(filteredPlans);
        if (filteredPlans.length > 0) {
            setNewAthlete(prev => ({ ...prev, planCode: filteredPlans[0].code }));
        }
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // ✅ LÓGICA CRM EXTREMA: Retención, Carritos y Fatiga
  const calculateCRM = (allOrders: any[]) => {
      let actives = 0;
      let expiring: any[] = [];
      let abandoned: any[] = [];
      let fatigued: any[] = [];
      const today = new Date();

      allOrders.forEach(o => {
          if (o.status === 'paid' && o.sub_status === 'active') {
              actives++;
              if (o.expires_at) {
                  const expDate = new Date(o.expires_at);
                  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  if (diffDays <= 5 && diffDays >= 0) {
                      expiring.push({ ...o, daysLeft: diffDays });
                  }
              }
              
              if (o.checkin_history && o.checkin_history.length > 0) {
                  const lastCheckin = o.checkin_history[o.checkin_history.length - 1];
                  if (Number(lastCheckin.stress) >= 8 || Number(lastCheckin.sleep) <= 5) {
                      fatigued.push(o);
                  }
              }
          }

          if (o.status === 'awaiting_payment' || o.status === 'pending') {
              abandoned.push(o);
          }
      });
      
      expiring.sort((a, b) => a.daysLeft - b.daysLeft);
      setActiveCount(actives);
      setExpiringSoon(expiring);
      setAbandonedCarts(abandoned);
      setFatigueAlerts(fatigued);
  };

  const runRadarAnalysis = async (allOrders: any[]) => {
      setLoadingRadar(true);
      const activeAthletesSummary = allOrders
        .filter(o => o.status === 'paid' && o.sub_status === 'active')
        .map(o => {
           let sleep = 0, stress = 0, daysLeft = 999;
           if (o.checkin_history && o.checkin_history.length > 0) {
               const lastCheckin = o.checkin_history[o.checkin_history.length - 1];
               sleep = Number(lastCheckin.sleep); stress = Number(lastCheckin.stress);
           }
           if (o.expires_at) {
               const expDate = new Date(o.expires_at); const today = new Date();
               daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
           }
           return { nombre: o.customer_name, sueno: sleep, estres: stress, diasRestantesPlan: daysLeft };
        });

      if (activeAthletesSummary.length === 0) {
          setRadarReport("No hay atletas activos para analizar hoy.");
          setLoadingRadar(false);
          return;
      }

      try {
          const res = await fetch('/api/admin/radar', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ athletesData: activeAthletesSummary })
          });
          const data = await res.json();
          if (data.result) setRadarReport(data.result.replace(/\*\*/g, ''));
      } catch (error) {
          setRadarReport("Fallo de conexión satelital con el Radar IA.");
      } finally {
          setLoadingRadar(false);
      }
  };

  // ✅ REPORTE DOMINICAL
  const generateBoardReport = async () => {
      setGeneratingBoardReport(true);
      setShowBoardReport(true);
      
      const detailedAthletes = orders
        .filter(o => o.status === 'paid')
        .map(o => {
           let sleep = 0, stress = 0, daysLeft = 999;
           if (o.checkin_history && o.checkin_history.length > 0) {
               const lastCheckin = o.checkin_history[o.checkin_history.length - 1];
               sleep = Number(lastCheckin.sleep); stress = Number(lastCheckin.stress);
           }
           if (o.expires_at) {
               const expDate = new Date(o.expires_at); const today = new Date();
               daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
           }
           return { 
               nombre: o.customer_name, 
               RMs: { squat: o.rm_squat, bench: o.rm_bench, deadlift: o.rm_deadlift },
               fatiga: { sueno: sleep, estres: stress },
               estado: o.sub_status,
               diasRestantes: daysLeft,
               lesiones: o.medical_history
           };
        });

      try {
          const res = await fetch('/api/admin/board-report', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ athletesData: detailedAthletes })
          });
          const data = await res.json();
          if (data.result) setBoardReportContent(data.result);
      } catch (error) {
          setBoardReportContent("Error generando el informe ejecutivo.");
      } finally {
          setGeneratingBoardReport(false);
      }
  };

  // 🔥 NUEVA FUNCION MAESTRA DE APROBACIÓN CON BYPASS DE FICHA TÉCNICA 🔥
  const handleApproveOrder = async (order: any) => {
      if (!confirm(`¿Confirmas que recibiste el pago y deseas activar al atleta ${order.customer_name}?`)) return;
      
      setApprovingId(order.order_id);
      try {
          let updatePayload: any = {
              status: 'paid',
              sub_status: 'active' 
          };

          // INYECTAMOS LA RUTINA SI ES UN PLAN ESTÁTICO (Uniendo las 4 semanas)
          if (order.plan_id === 'static-fuerza') {
              updatePayload = {
                  ...updatePayload,
                  is_onboarded: true, // BYPASS DE FICHA TÉCNICA
                  macrocycle: templateFuerza.macrocycle, mesocycle: templateFuerza.mesocycle, microcycle: templateFuerza.microcycle,
                  annual_plan: templateFuerza.annual_plan,
                  routine_d1: `SEMANA 1\n${templateFuerza.annual_plan[1].d1}\n\nSEMANA 2\n${templateFuerza.annual_plan[2].d1}\n\nSEMANA 3\n${templateFuerza.annual_plan[3].d1}\n\nSEMANA 4\n${templateFuerza.annual_plan[4].d1}`,
                  routine_d2: `SEMANA 1\n${templateFuerza.annual_plan[1].d2}\n\nSEMANA 2\n${templateFuerza.annual_plan[2].d2}\n\nSEMANA 3\n${templateFuerza.annual_plan[3].d2}\n\nSEMANA 4\n${templateFuerza.annual_plan[4].d2}`,
                  routine_d3: `SEMANA 1\n${templateFuerza.annual_plan[1].d3}\n\nSEMANA 2\n${templateFuerza.annual_plan[2].d3}\n\nSEMANA 3\n${templateFuerza.annual_plan[3].d3}\n\nSEMANA 4\n${templateFuerza.annual_plan[4].d3}`,
                  routine_d4: `SEMANA 1\n${templateFuerza.annual_plan[1].d4}\n\nSEMANA 2\n${templateFuerza.annual_plan[2].d4}\n\nSEMANA 3\n${templateFuerza.annual_plan[3].d4}\n\nSEMANA 4\n${templateFuerza.annual_plan[4].d4}`,
                  routine_d5: templateFuerza.annual_plan[1].d5,
                  routine_d6: templateFuerza.annual_plan[1].d6,
                  routine_d7: templateFuerza.annual_plan[1].d7,
              };
          } else if (order.plan_id === 'static-hipertrofia') {
              updatePayload = {
                  ...updatePayload,
                  is_onboarded: true, 
                  macrocycle: templateHipertrofia.macrocycle, mesocycle: templateHipertrofia.mesocycle, microcycle: templateHipertrofia.microcycle,
                  annual_plan: templateHipertrofia.annual_plan,
                  routine_d1: `SEMANA 1\n${templateHipertrofia.annual_plan[1].d1}\n\nSEMANA 2\n${templateHipertrofia.annual_plan[2].d1}\n\nSEMANA 3\n${templateHipertrofia.annual_plan[3].d1}\n\nSEMANA 4\n${templateHipertrofia.annual_plan[4].d1}`,
                  routine_d2: `SEMANA 1\n${templateHipertrofia.annual_plan[1].d2}\n\nSEMANA 2\n${templateHipertrofia.annual_plan[2].d2}\n\nSEMANA 3\n${templateHipertrofia.annual_plan[3].d2}\n\nSEMANA 4\n${templateHipertrofia.annual_plan[4].d2}`,
                  routine_d3: `SEMANA 1\n${templateHipertrofia.annual_plan[1].d3}\n\nSEMANA 2\n${templateHipertrofia.annual_plan[2].d3}\n\nSEMANA 3\n${templateHipertrofia.annual_plan[3].d3}\n\nSEMANA 4\n${templateHipertrofia.annual_plan[4].d3}`,
                  routine_d4: `SEMANA 1\n${templateHipertrofia.annual_plan[1].d4}\n\nSEMANA 2\n${templateHipertrofia.annual_plan[2].d4}\n\nSEMANA 3\n${templateHipertrofia.annual_plan[3].d4}\n\nSEMANA 4\n${templateHipertrofia.annual_plan[4].d4}`,
                  routine_d5: templateHipertrofia.annual_plan[1].d5,
                  routine_d6: templateHipertrofia.annual_plan[1].d6,
                  routine_d7: templateHipertrofia.annual_plan[1].d7,
              };
          } else if (order.plan_id === 'mesociclo-definicion-4-semanas') {
              updatePayload = {
                  ...updatePayload,
                  is_onboarded: true, 
                  macrocycle: templateDefinicion.macrocycle, mesocycle: templateDefinicion.mesocycle, microcycle: templateDefinicion.microcycle,
                  annual_plan: templateDefinicion.annual_plan,
                  routine_d1: `SEMANA 1\n${templateDefinicion.annual_plan[1].d1}\n\nSEMANA 2\n${templateDefinicion.annual_plan[2].d1}\n\nSEMANA 3\n${templateDefinicion.annual_plan[3].d1}\n\nSEMANA 4\n${templateDefinicion.annual_plan[4].d1}`,
                  routine_d2: `SEMANA 1\n${templateDefinicion.annual_plan[1].d2}\n\nSEMANA 2\n${templateDefinicion.annual_plan[2].d2}\n\nSEMANA 3\n${templateDefinicion.annual_plan[3].d2}\n\nSEMANA 4\n${templateDefinicion.annual_plan[4].d2}`,
                  routine_d3: `SEMANA 1\n${templateDefinicion.annual_plan[1].d3}\n\nSEMANA 2\n${templateDefinicion.annual_plan[2].d3}\n\nSEMANA 3\n${templateDefinicion.annual_plan[3].d3}\n\nSEMANA 4\n${templateDefinicion.annual_plan[4].d3}`,
                  routine_d4: `SEMANA 1\n${templateDefinicion.annual_plan[1].d4}\n\nSEMANA 2\n${templateDefinicion.annual_plan[2].d4}\n\nSEMANA 3\n${templateDefinicion.annual_plan[3].d4}\n\nSEMANA 4\n${templateDefinicion.annual_plan[4].d4}`,
                  routine_d5: templateDefinicion.annual_plan[1].d5,
                  routine_d6: templateDefinicion.annual_plan[1].d6,
                  routine_d7: templateDefinicion.annual_plan[1].d7,
              };
          }

          const { error } = await supabase.from('orders').update(updatePayload).eq('order_id', order.order_id);
          if (error) throw error;

          fetchData(); 
          
// 📲 MAGIA HIGH-TICKET: Abrir WhatsApp automático al aprobar
          const isElite = order.plan_id?.includes('elite') || order.plan_id?.includes('leyenda');
          const phone = order.onboarding_data?.phone ? order.onboarding_data.phone.replace(/[^0-9]/g, '') : '';
          const waMsg = encodeURIComponent(`¡Fiera! Acabo de procesar tu pago por el ${isElite ? 'Programa Élite' : 'Plan Estático'}. Tu panel VIP ya está 100% activo en la web. ¡Arrancamos con todo! 🚀`);
          const waUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${waMsg}` : `https://api.whatsapp.com/send?text=${waMsg}`;
          
          alert("✅ Pago aprobado y rutina inyectada. Abriendo WhatsApp para saludar al atleta...");
          window.open(waUrl, '_blank');
      } catch (err: any) {
          alert("Error al aprobar: " + err.message);
      } finally {
          setApprovingId(null);
      }
  };

  // 🔥 NUEVA FUNCIÓN PARA HABILITAR EL KIT ACELERADOR 🔥
  const handleEnableKit = async (order: any) => {
      const isEnabling = !order.has_kit;
      if (!confirm(`¿Deseas ${isEnabling ? 'HABILITAR' : 'DESHABILITAR'} el Kit Acelerador (PDF) en el panel de ${order.customer_name}?`)) return;
      
      setEnablingKitId(order.order_id);
      try {
          const { error } = await supabase
              .from('orders')
              .update({ has_kit: isEnabling })
              .eq('order_id', order.order_id);

          if (error) throw error;
          
          alert(`✅ Kit Acelerador ${isEnabling ? 'habilitado' : 'removido'} con éxito.`);
          fetchData(); // Recargamos para ver el cambio visual
      } catch (err: any) {
          alert("Error al actualizar el Kit: " + err.message);
      } finally {
          setEnablingKitId(null);
      }
  };

  async function handleCreateAthlete(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const selectedPlan = plans.find(p => p.code === newAthlete.planCode);
      const price = selectedPlan ? selectedPlan.price : 0;
      const res = await fetch("/api/admin/create-athlete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAthlete, price })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      alert("✅ Atleta creado correctamente");
      setShowModal(false);
      setNewAthlete({ name: "", email: "", password: "", planCode: plans[0]?.code || "" });
      fetchData(); 
    } catch (error: any) { alert("❌ Error: " + error.message); } finally { setCreating(false); }
  }

  // ✅ SEPARACIÓN DE DIVISAS INTELIGENTE (Pesos y Dólares)
  const totalARS = orders
      .filter((o) => o.status === "paid" && Number(o.amount_ars) > 1000) 
      .reduce((acc, curr) => acc + Number(curr.amount_ars), 0);

  const totalUSD = orders
      .filter((o) => {
// Es USD si el monto numérico exacto es bajo (USD), o si el plan incluye la palabra Elite o Leyenda.
          const isElitePlan = o.plan_id?.includes('elite') || o.plan_id?.includes('leyenda');
          const isLowAmount = Number(o.amount_ars) <= 1000;
          return o.status === "paid" && (isElitePlan || isLowAmount);
      })
      .reduce((acc, curr) => {
          // Si el plan es elite pero por algún error guardó "725000", forzamos a sumar "500" a la bolsa USD
          if (curr.plan_id === 'programa-elite-12-semanas' && Number(curr.amount_ars) > 1000) {
              return acc + 500;
          }
          return acc + Number(curr.amount_ars);
      }, 0);

  // ✅ SEMÁFORO DE FATIGA
  const getFatigueStatus = (order: any) => {
     if (!order.checkin_history || order.checkin_history.length === 0) return { color: "bg-zinc-800", text: "Sin datos", pulse: false };
     const lastCheckin = order.checkin_history[order.checkin_history.length - 1];
     const sleep = Number(lastCheckin.sleep); const stress = Number(lastCheckin.stress);
     if (sleep < 6 || stress >= 8) return { color: "bg-red-500", text: "Crítico", pulse: true };
     if (sleep < 7 || stress >= 6) return { color: "bg-yellow-500", text: "Alerta", pulse: false };
     return { color: "bg-emerald-500", text: "Óptimo", pulse: false };
  };

// Filtrado visual de la tabla (NUEVO MODELO HIGH-TICKET 3.0)
  const filteredOrders = orders.filter(o => {
      const isElite = o.plan_id?.includes('elite') || o.plan_id?.includes('leyenda');
      if (filterTab === 'todos') return true;
      if (filterTab === 'elite') return isElite && o.status === 'paid';
      if (filterTab === 'estaticos') return !isElite && o.status === 'paid';
      if (filterTab === 'pendientes') return (o.status === 'awaiting_payment' || o.status === 'pending');
      return true;
  });

  return (
    <div className="bg-transparent min-h-screen text-white font-sans pb-20 selection:bg-amber-500 selection:text-black relative">      
      {/* Fondo VIP Global */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto mt-6 relative z-10">
        
        {/* HEADER PRINCIPAL */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-12 gap-6 bg-[#0a0a0c] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-full lg:w-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter drop-shadow-md mt-2">
              Gestión de <span className="text-amber-500 block sm:inline">Ventas</span>
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm mt-3 font-medium tracking-wide">Comando central financiero y acceso de atletas</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center w-full lg:w-auto relative z-10">
            <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 w-full sm:w-auto">
                <button 
                    onClick={generateBoardReport}
                    className="w-full sm:w-auto bg-[#050505] hover:bg-zinc-900 border border-zinc-800 text-white font-black px-4 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] md:text-xs transition-all shadow-lg flex flex-col sm:flex-row items-center justify-center gap-2 active:scale-95"
                >
                    <span className="text-xl md:text-lg mb-1 sm:mb-0">🚁</span> 
                    <span>Reporte<br className="sm:hidden"/> Dominical</span>
                </button>

                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-black px-4 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] md:text-xs transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95 flex flex-col sm:flex-row items-center justify-center gap-2 border border-amber-200"
                >
                    <span className="text-xl md:text-lg mb-1 sm:mb-0">+</span> 
                    <span>Nuevo<br className="sm:hidden"/> Atleta</span>
                </button>
            </div>

            <div className="w-full sm:w-auto bg-[#050505] border border-zinc-800 p-4 md:p-5 rounded-xl md:rounded-2xl text-center sm:text-right min-w-[200px] shadow-inner">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center justify-center sm:justify-end gap-2 border-b border-zinc-800/80 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                  Capital Recaudado
                </p>
                <div className="flex flex-col items-center sm:items-end gap-1">
                    <p className="text-2xl md:text-3xl font-black italic text-emerald-400 tracking-tight">
                       ${totalARS.toLocaleString('es-AR')} <span className="text-[9px] md:text-[10px] text-zinc-500 not-italic font-bold">ARS</span>
                    </p>
                    <p className="text-xl md:text-2xl font-black italic text-emerald-500 tracking-tight">
                       ${totalUSD.toLocaleString('en-US')} <span className="text-[9px] md:text-[10px] text-zinc-500 not-italic font-bold">USD</span>
                    </p>
                </div>
            </div>
          </div>
        </div>

        {/* ✅ DASHBOARD CRM: TARJETAS SUPERIORES VIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            
            {/* TARJETA: ATLETAS ACTIVOS */}
            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">🦍</div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter mb-1">{activeCount}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Atletas Activos (Pagan Hoy)</p>
            </div>

            {/* TARJETA: CARRITOS ABANDONADOS */}
            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-orange-500/30 transition-all">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-orange-500/20 shadow-inner group-hover:scale-110 transition-transform">🛒</div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter mb-1">{abandonedCarts.length}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pagos Pendientes (Transferencias/Caídas)</p>
                {abandonedCarts.length > 0 && <div className="absolute top-6 right-6 w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]"></div>}
            </div>

            {/* TARJETA: ALERTAS SNC */}
            <div className="bg-[#0a0a0c] border border-zinc-800/80 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-red-500/30 transition-all md:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">⚠️</div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter mb-1">{fatigueAlerts.length}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Alertas Clínicas (Fallo SNC)</p>
                {fatigueAlerts.length > 0 && <div className="absolute top-6 right-6 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>}
            </div>
        </div>

        {/* 🤖 CUADRO DEL RADAR IA (SNC) Mantenemos estilo Azul Tecnológico para que resalte */}
        <div className="mb-10 md:mb-14 bg-[#0a0a0c] border border-blue-900/50 p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-10 items-center shadow-xl">
           <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"></div>
           
           <div className="shrink-0 flex flex-col items-center justify-center bg-[#050505] p-5 md:p-6 rounded-3xl border border-blue-500/30 w-32 h-32 md:w-40 md:h-40 relative z-10 shadow-inner">
              <span className="text-4xl md:text-5xl mb-3">📡</span>
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-blue-400 text-center leading-tight">Radar<br/>Tujague AI</span>
           </div>
           
           <div className="flex-1 relative z-10 w-full text-center md:text-left">
              <h3 className="text-sm md:text-base font-black text-white uppercase tracking-widest mb-3 md:mb-4 border-b border-blue-500/30 pb-3 md:pb-4 inline-block md:block">
                 Flash de Fatiga Global
              </h3>
              {loadingRadar ? (
                 <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                    <span className="flex gap-1.5">
                       <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                       <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                    </span>
                    <span className="text-xs md:text-sm font-bold text-blue-400 italic">Analizando niveles de fatiga y SNC...</span>
                 </div>
              ) : (
                 <p className="text-xs md:text-sm text-blue-100 font-medium leading-relaxed whitespace-pre-wrap mt-2">
                    {radarReport}
                 </p>
              )}
           </div>
        </div>

        {/* CONTROLES DE LA TABLA (FILTROS) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Directorio <span className="text-amber-500">Financiero</span></h2>
            
            <div className="flex bg-[#0a0a0c] p-1 rounded-xl border border-zinc-800 shadow-inner w-full sm:w-auto overflow-x-auto">
                <button onClick={() => setFilterTab('todos')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterTab === 'todos' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>Todos</button>
                <button onClick={() => setFilterTab('elite')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterTab === 'elite' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>💎 Élite VIP</button>
                <button onClick={() => setFilterTab('estaticos')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterTab === 'estaticos' ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-600 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>📄 Estáticos</button>
                <button onClick={() => setFilterTab('pendientes')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterTab === 'pendientes' ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>Pendientes</button>
            </div>
        </div>
        
        {/* TABLA DATA-GRID MODERNA */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 bg-[#0a0a0c] rounded-[2rem] border border-zinc-800">
               <div className="w-12 h-12 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin"></div>
               <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Leyendo Blockchain de pagos...</p>
            </div>
        ) : (
            <div className="bg-[#0a0a0c] border border-zinc-800/80 rounded-[2rem] shadow-xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#050505] border-b border-zinc-800 text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                                <th className="p-5 font-bold">Atleta</th>
                                <th className="p-5 font-bold">Producto Contratado</th>
                                <th className="p-5 font-bold">Estado del Pago</th>
                                <th className="p-5 font-bold text-right">Recaudación</th>
                                <th className="p-5 font-bold text-right">Acciones (Admin)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">No hay registros para este filtro</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const isPaid = order.status === 'paid';
                                    const initial = order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '?';
                                    const statusSNC = getFatigueStatus(order);
                                    
                                    return (
                                        <tr key={order.id} className="hover:bg-zinc-900/40 transition-colors group">
                                            
                                            {/* Columna: Nombre y Avatar */}
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${isPaid ? 'bg-zinc-800 text-white' : 'bg-[#050505] text-zinc-600 border border-zinc-800'}`}>
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                           <p className="text-sm font-black text-white truncate max-w-[150px] sm:max-w-[200px]">{order.customer_name}</p>
                                                           {/* Semáforo SNC chiquito al lado del nombre */}
                                                           <span className="flex items-center gap-1.5 bg-black px-2 py-0.5 rounded-lg border border-zinc-800 shrink-0" title={`SNC: ${statusSNC.text}`}>
                                                              <span className={`w-1.5 h-1.5 rounded-full ${statusSNC.color} ${statusSNC.pulse ? 'animate-pulse' : ''}`}></span>
                                                           </span>
                                                        </div>
                                                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{order.customer_email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Columna: Plan Contratado (Jerarquía Visual) */}
<td className="p-5 flex flex-col items-start gap-1 mt-2">
                                                {(order.plan_id?.includes('elite') || order.plan_id?.includes('leyenda')) ? (
                                                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                                        💎 High-Ticket
                                                    </span>
                                                ) : (
                                                    <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                                        📄 Bóveda
                                                    </span>
                                                )}
                                                <p className="text-xs font-bold text-zinc-200 uppercase mt-1">{order.plans?.name || order.plan_id}</p>
                                                {order.has_kit && <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">+ Kit Acelerador</span>}
                                            </td>

                                            {/* Columna: Estado (Badges) */}
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    {isPaid ? (
                                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aprobado
                                                        </span>
                                                    ) : (
                                                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Pendiente
                                                        </span>
                                                    )}
                                                    {order.sub_status === 'vencido' && (
                                                        <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
                                                            Vencido
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Columna: Monto */}
                                            <td className="p-5 text-right">
                                                <p className={`text-base font-black italic tracking-tighter ${isPaid ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                                    ${Number(order.amount_ars).toLocaleString()}
                                                </p>
                                            </td>

                                            {/* Columna: Acciones Rápidas (Aprobar, Ficha, Kit) */}
                                            <td className="p-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    
                                                    {/* Botón: Aprobar Pago */}
                                                    {!isPaid && (
                                                        <button 
                                                            onClick={() => handleApproveOrder(order)} 
                                                            disabled={approvingId === order.order_id}
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50"
                                                            title="Aprobar pago manualmente (Transferencia)"
                                                        >
                                                            {approvingId === order.order_id ? "..." : "Aprobar Pago"}
                                                        </button>
                                                    )}

                                                    {/* 🔥 BOTÓN DE HABILITAR KIT ACELERADOR 🔥 */}
                                                    <button 
                                                        onClick={() => handleEnableKit(order)}
                                                        disabled={enablingKitId === order.order_id}
                                                        className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50 border ${
                                                            order.has_kit 
                                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30' 
                                                            : 'bg-[#050505] text-zinc-400 border-zinc-700 hover:bg-amber-500 hover:text-black hover:border-amber-500'
                                                        }`}
                                                        title={order.has_kit ? "Quitar Kit Acelerador" : "Regalar / Habilitar Kit Acelerador"}
                                                    >
                                                        {enablingKitId === order.order_id ? "..." : (order.has_kit ? "❌ Quitar Kit" : "🎁 Dar Kit")}
                                                    </button>

{/* Botón: Ver Ficha Clínica */}
                                                    <Link 
                                                        href={`/admin/orders/${order.id}`} 
                                                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-700 transition-colors"
                                                    >
                                                        Ver Ficha
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>

      {/* --- MODAL REPORTE DE DIRECTORIO --- */}
      {showBoardReport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="bg-[#0a0a0c] border border-amber-500/40 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] w-full max-w-4xl shadow-[0_0_80px_rgba(245,158,11,0.2)] relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in zoom-in duration-300">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>

                <div className="flex justify-between items-center mb-6 md:mb-8 relative z-10 border-b border-zinc-800/80 pb-4 md:pb-6">
                   <div>
                      <h2 className="text-2xl md:text-4xl font-black italic uppercase text-white flex items-center gap-3 tracking-tighter">
                         <span className="text-3xl md:text-5xl drop-shadow-md">🚁</span> Reporte de <span className="text-amber-500">Directorio</span>
                      </h2>
                      <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Análisis Global de la Tropa (SNC & Ventas)</p>
                   </div>
                   <button onClick={() => setShowBoardReport(false)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#050505] hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800 text-lg md:text-xl shrink-0 shadow-inner">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2 md:pr-4">
                   {generatingBoardReport ? (
                      <div className="flex flex-col items-center justify-center py-20 md:py-32 gap-6 md:gap-8">
                         <span className="text-6xl md:text-8xl animate-bounce drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">📡</span>
                         <p className="text-amber-500 font-black tracking-widest uppercase text-xs md:text-sm animate-pulse text-center px-4">Escaneando RMs y Fatiga de todos los atletas...</p>
                      </div>
                   ) : (
                      <div className="text-xs md:text-sm text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap bg-[#050505] p-6 md:p-10 rounded-2xl md:rounded-[2rem] border border-amber-900/30 shadow-inner">
                         {boardReportContent}
                      </div>
                   )}
                </div>
                
                <div className="pt-6 md:pt-8 border-t border-zinc-800/80 mt-4 md:mt-6 relative z-10">
                   <button onClick={() => setShowBoardReport(false)} className="w-full bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border border-zinc-800 transition-all shadow-inner active:scale-95">
                      CERRAR INFORME DE DIRECTORIO
                   </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL NUEVO ATLETA --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0c] border border-amber-900/40 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] w-full max-w-md shadow-[0_0_80px_rgba(245,158,11,0.2)] relative overflow-hidden animate-in zoom-in duration-300">
                <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -mr-10 -mt-10"></div>
                <button onClick={() => setShowModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 w-10 h-10 flex items-center justify-center bg-[#050505] hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800 shadow-inner">✕</button>

                <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white mb-2 tracking-tighter">Nuevo <span className="text-amber-500">Atleta</span></h2>
                <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8 md:mb-10">Creación de ficha y acceso</p>
                
                <form onSubmit={handleCreateAthlete} className="space-y-5 md:space-y-6 relative z-10">
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2 block ml-1">Nombre Completo</label>
                        <input required type="text" className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner" placeholder="Ej: Juan Perez" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2 block ml-1">Email (Acceso Atleta)</label>
                        <input required type="email" className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner" placeholder="usuario@email.com" value={newAthlete.email} onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2 block ml-1">Contraseña</label>
                        <input required type="text" className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner" placeholder="Clave para el atleta" value={newAthlete.password} onChange={e => setNewAthlete({...newAthlete, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2 block ml-1">Plan a Asignar</label>
                        <div className="relative">
                          <select className="w-full bg-[#050505] border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-amber-500 outline-none appearance-none cursor-pointer transition-all shadow-inner" value={newAthlete.planCode} onChange={e => setNewAthlete({...newAthlete, planCode: e.target.value})}>
                              {plans.map(plan => (<option key={plan.id} value={plan.code} className="bg-zinc-900">{plan.name} - ${plan.price.toLocaleString()}</option>))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={creating} className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black py-5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 active:scale-95 border border-amber-200">
                            {creating ? "AUTORIZANDO..." : "CREAR FICHA Y ACCESO"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.8); }
      `}} />
    </div>
  );
}