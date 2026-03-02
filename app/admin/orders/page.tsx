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
         d5: "🚶‍♂️ DESCANSO ACTIVO", d6: "💤 DESCANSO TOTAL (SNC)", d7: "💤 DESCANSO TOTAL (SNC)" 
       }
  }
};
// ============================================================================

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
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

  // 🔥 ESTADO DE APROBACIÓN MANUAL 🔥
  const [approvingId, setApprovingId] = useState<string | null>(null);

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
        runRadarAnalysis(ordersData);
    }
    
    if (plansData) {
        setPlans(plansData);
        if (plansData.length > 0) {
            setNewAthlete(prev => ({ ...prev, planCode: plansData[0].code }));
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
          if (data.result) setRadarReport(data.result);
      } catch (error) {
          setRadarReport("Fallo de conexión satelital con el Radar IA.");
      } finally {
          setLoadingRadar(false);
      }
  };

  // ✅ FUNCION ORIGINAL RESTAURADA: REPORTE DOMINICAL
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

  // 🔥 NUEVA FUNCION MAESTRA DE APROBACIÓN CON INYECCIÓN DE RUTINA 🔥
  const handleApproveOrder = async (order: any) => {
      if (!confirm(`¿Confirmas que recibiste el pago de $${Number(order.amount_ars).toLocaleString()} y deseas activar al atleta?`)) return;
      
      setApprovingId(order.order_id);
      try {
          let updatePayload: any = {
              status: 'paid',
              updated_at: new Date().toISOString()
          };

          // INYECTAMOS LA RUTINA SI ES UN PLAN ESTÁTICO
          if (order.plan_id === 'static-fuerza') {
              updatePayload = {
                  ...updatePayload,
                  macrocycle: templateFuerza.macrocycle, mesocycle: templateFuerza.mesocycle, microcycle: templateFuerza.microcycle,
                  annual_plan: templateFuerza.annual_plan,
                  routine_d1: templateFuerza.annual_plan[1].d1, routine_d2: templateFuerza.annual_plan[1].d2,
                  routine_d3: templateFuerza.annual_plan[1].d3, routine_d4: templateFuerza.annual_plan[1].d4,
                  routine_d5: templateFuerza.annual_plan[1].d5, routine_d6: templateFuerza.annual_plan[1].d6, routine_d7: templateFuerza.annual_plan[1].d7,
              };
          } else if (order.plan_id === 'static-hipertrofia') {
              updatePayload = {
                  ...updatePayload,
                  macrocycle: templateHipertrofia.macrocycle, mesocycle: templateHipertrofia.mesocycle, microcycle: templateHipertrofia.microcycle,
                  annual_plan: templateHipertrofia.annual_plan,
                  routine_d1: templateHipertrofia.annual_plan[1].d1, routine_d2: templateHipertrofia.annual_plan[1].d2,
                  routine_d3: templateHipertrofia.annual_plan[1].d3, routine_d4: templateHipertrofia.annual_plan[1].d4,
                  routine_d5: templateHipertrofia.annual_plan[1].d5, routine_d6: templateHipertrofia.annual_plan[1].d6, routine_d7: templateHipertrofia.annual_plan[1].d7,
              };
          }

          const { error } = await supabase.from('orders').update(updatePayload).eq('order_id', order.order_id);
          if (error) throw error;

          // PAGAR AFILIADO SI EXISTE (MODELO VIRAL)
          if (order.referred_by) {
              const { data: ambassador } = await supabase.from('orders').select('id, wallet_balance').eq('referral_code', order.referred_by).single();
              if (ambassador) {
                  const comision = Math.round(Number(order.amount_ars) * 0.20); // 20%
                  const nuevoSaldo = Number(ambassador.wallet_balance || 0) + comision;
                  await supabase.from('orders').update({ wallet_balance: nuevoSaldo }).eq('id', ambassador.id);
              }
          }

          alert("✅ Pago aprobado. Atleta activado y rutina inyectada (si corresponde).");
          fetchData(); // Recargamos para reflejar el cambio visualmente
      } catch (err: any) {
          alert("Error al aprobar: " + err.message);
      } finally {
          setApprovingId(null);
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

  const totalRecaudado = orders.filter((o) => o.status === "paid").reduce((acc, curr) => acc + Number(curr.amount_ars), 0);

  // ✅ FUNCION ORIGINAL RESTAURADA: SEMÁFORO DE FATIGA
  const getFatigueStatus = (order: any) => {
     if (!order.checkin_history || order.checkin_history.length === 0) return { color: "bg-zinc-800", text: "Sin datos", pulse: false };
     const lastCheckin = order.checkin_history[order.checkin_history.length - 1];
     const sleep = Number(lastCheckin.sleep); const stress = Number(lastCheckin.stress);
     if (sleep < 6 || stress >= 8) return { color: "bg-red-500", text: "Crítico", pulse: true };
     if (sleep < 7 || stress >= 6) return { color: "bg-yellow-500", text: "Alerta", pulse: false };
     return { color: "bg-emerald-500", text: "Óptimo", pulse: false };
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans pb-20 selection:bg-emerald-500 selection:text-black">
      
      {/* 🔥 NAVBAR SUPERIOR DE NAVEGACIÓN RÁPIDA (NUEVO) 🔥 */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest uppercase transition-all border border-emerald-500/20 active:scale-95">
                  ← Volver a la Web
              </Link>
          </div>
          <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest hidden md:block border-r border-zinc-800 pr-6">Panel de Comando Central</span>
              <button onClick={handleLogout} className="text-[10px] md:text-xs font-black tracking-widest uppercase text-zinc-500 hover:text-red-400 transition-colors">
                  Cerrar Sesión
              </button>
          </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-10">
        
        {/* HEADER PRINCIPAL RESTAURADO Y ADAPTADO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-12 gap-6 bg-[#0a0a0c] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-full lg:w-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter drop-shadow-md mt-2">
              Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 block sm:inline">Órdenes</span>
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm mt-3 font-medium tracking-wide">Radar de ingresos y control biomecánico</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center w-full lg:w-auto relative z-10">
            <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 w-full sm:w-auto">
                <button 
                    onClick={generateBoardReport}
                    className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white font-black px-4 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] md:text-xs transition-all shadow-lg flex flex-col sm:flex-row items-center justify-center gap-2 active:scale-95"
                >
                    <span className="text-xl md:text-lg mb-1 sm:mb-0">🚁</span> 
                    <span>Reporte<br className="sm:hidden"/> Dominical</span>
                </button>

                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] md:text-xs transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-95 flex flex-col sm:flex-row items-center justify-center gap-2"
                >
                    <span className="text-xl md:text-lg mb-1 sm:mb-0">+</span> 
                    <span>Nuevo<br className="sm:hidden"/> Atleta</span>
                </button>
            </div>

            <div className="w-full sm:w-auto bg-gradient-to-br from-emerald-950/60 to-[#0a0a0c] border border-emerald-500/30 p-5 md:p-6 rounded-xl md:rounded-2xl text-center sm:text-right min-w-[200px] shadow-lg shadow-emerald-500/10">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-500 mb-2 flex items-center justify-center sm:justify-end gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Total Recaudado
                </p>
                <p className="text-3xl md:text-4xl font-black italic text-white tracking-tight">${totalRecaudado.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ✅ DASHBOARD CRM: MATRIZ DE ALERTAS Y PERSECUCIÓN */}
        <div className="mb-10 md:mb-14 space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-300 px-2">Radar CRM de <span className="text-emerald-500">Conversión</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* PANEL 1: CARRITOS ABANDONADOS */}
                <div className="bg-gradient-to-r from-orange-950/40 to-[#0a0a0c] border border-orange-900/50 p-6 md:p-8 rounded-[2rem] shadow-xl hover:border-orange-500/30 transition-colors">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-orange-500 mb-6 flex items-center gap-3">
                        <span className="text-xl md:text-2xl bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">🛒</span> 
                        Carritos Abandonados ({abandonedCarts.length})
                    </h3>
                    {abandonedCarts.length > 0 ? (
                        <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                            {abandonedCarts.map((cart, idx) => {
                                const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://tu-pagina.com";
                                const wppText = `Hola ${cart.customer_name.split(' ')[0]}, el sistema de Tujague Strength me indicó que tu inscripción al protocolo quedó pausada. ¿Tuviste algún inconveniente con el medio de pago? Te dejo tu acceso directo para finalizar el alta: ${domain}/login`;
                                let cleanPhone = cart.customer_instagram?.replace(/[^0-9]/g, '') || ""; 
                                
                                return (
                                    <div key={idx} className="bg-black/60 border border-orange-500/20 p-4 rounded-xl flex flex-col gap-3 shadow-inner">
                                        <div className="flex justify-between items-center">
                                           <p className="text-xs md:text-sm font-black text-white uppercase truncate pr-2">{cart.customer_name}</p>
                                           <span className="text-[9px] font-bold bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded border border-orange-500/30">Pendiente</span>
                                        </div>
                                        <div className="flex gap-2">
                                           <Link href={`/admin/orders/${cart.order_id}`} className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border border-zinc-700">Pago</Link>
                                           <a href={cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wppText)}` : '#'} target={cleanPhone ? "_blank" : "_self"} className={`flex-1 py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center ${cleanPhone ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-md' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                                               {cleanPhone ? '📲 Recuperar' : 'Sin Cel'}
                                           </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-black/30">No hay pagos pendientes.</p>
                    )}
                </div>

                {/* PANEL 2: PRÓXIMOS A VENCER */}
                <div className="bg-gradient-to-r from-red-950/30 to-[#0a0a0c] border border-red-900/40 p-6 md:p-8 rounded-[2rem] shadow-xl hover:border-red-500/30 transition-colors">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-red-500 mb-6 flex items-center gap-3">
                        <span className="text-xl md:text-2xl bg-red-500/10 p-2 rounded-xl border border-red-500/20">⏳</span>
                        Vencimientos ({expiringSoon.length})
                    </h3>
                    {expiringSoon.length > 0 ? (
                        <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                            {expiringSoon.map((athlete, idx) => {
                                const domain = process.env.NEXT_PUBLIC_SITE_URL || "https://tu-pagina.com";
                                const wppText = `Saludos. Te notifico que tu plan de entrenamiento caduca en ${athlete.daysLeft} días. Para no interrumpir la progresión del mesociclo, ingresa a tu panel y gestiona la renovación automática: ${domain}/login`;
                                let cleanPhone = athlete.customer_phone?.replace(/[^0-9]/g, '') || athlete.customer_instagram?.replace(/[^0-9]/g, '') || "";
                                
                                return (
                                    <div key={idx} className="bg-black/60 border border-red-500/20 p-4 rounded-xl flex flex-col gap-3 shadow-inner">
                                        <div className="flex justify-between items-center">
                                           <p className="text-xs md:text-sm font-black text-white uppercase truncate pr-2">{athlete.customer_name}</p>
                                           <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-2.5 py-1 rounded border border-red-500/30">{athlete.daysLeft === 0 ? "HOY" : `${athlete.daysLeft} Días`}</span>
                                        </div>
                                        <div className="flex gap-2">
                                           <Link href={`/admin/orders/${athlete.order_id}`} className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center border border-zinc-700">Ficha</Link>
                                           <a href={cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wppText)}` : '#'} target={cleanPhone ? "_blank" : "_self"} className={`flex-1 py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center ${cleanPhone ? 'bg-red-600 hover:bg-red-500 text-white shadow-md' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                                               {cleanPhone ? '📲 Cobrar' : 'Sin Cel'}
                                           </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-black/30">Sin vencimientos cercanos.</p>
                    )}
                </div>

                {/* PANEL 3: ALERTAS DE FATIGA / SNC */}
                <div className="bg-gradient-to-r from-yellow-950/30 to-[#0a0a0c] border border-yellow-900/40 p-6 md:p-8 rounded-[2rem] shadow-xl hover:border-yellow-500/30 transition-colors md:col-span-2 lg:col-span-1">
                    <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-yellow-500 mb-6 flex items-center gap-3">
                        <span className="text-xl md:text-2xl bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">⚠️</span> 
                        Alertas SNC ({fatigueAlerts.length})
                    </h3>
                    {fatigueAlerts.length > 0 ? (
                        <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                            {fatigueAlerts.map((athlete, idx) => {
                                const wppText = `Atleta, el radar del sistema detectó niveles críticos de estrés/fatiga en tu último registro. ¿Cómo te venís sintiendo? Vamos a regular las cargas esta semana por precaución.`;
                                let cleanPhone = athlete.customer_phone?.replace(/[^0-9]/g, '') || athlete.customer_instagram?.replace(/[^0-9]/g, '') || "";
                                
                                return (
                                    <div key={idx} className="bg-black/60 border border-yellow-500/20 p-4 rounded-xl flex flex-col gap-3 shadow-inner">
                                        <div className="flex justify-between items-center">
                                           <p className="text-xs md:text-sm font-black text-white uppercase truncate pr-2">{athlete.customer_name}</p>
                                           <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                                        </div>
                                        <a href={cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wppText)}` : '#'} target={cleanPhone ? "_blank" : "_self"} className={`w-full py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-center ${cleanPhone ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-md' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                                            {cleanPhone ? '💬 Ajustar Cargas' : 'Sin Celular'}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-black/30">Tropa en estado óptimo.</p>
                    )}
                </div>
            </div>
        </div>

        {/* 🤖 CUADRO DEL RADAR IA (SNC) */}
        <div className="mb-10 md:mb-14 bg-indigo-950/30 border border-indigo-500/40 p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-10 items-center shadow-xl">
           <div className="absolute top-0 left-0 w-48 h-full bg-gradient-to-r from-indigo-500/20 to-transparent pointer-events-none"></div>
           
           <div className="shrink-0 flex flex-col items-center justify-center bg-black/60 p-5 md:p-6 rounded-3xl border border-indigo-500/30 w-32 h-32 md:w-40 md:h-40 relative z-10 shadow-inner">
              <span className="text-4xl md:text-5xl mb-3">📡</span>
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-indigo-400 text-center leading-tight">Radar<br/>Tujague AI</span>
           </div>
           
           <div className="flex-1 relative z-10 w-full text-center md:text-left">
              <h3 className="text-sm md:text-base font-black text-white uppercase tracking-widest mb-3 md:mb-4 border-b border-indigo-500/30 pb-3 md:pb-4 inline-block md:block">
                 Flash de Fatiga Global
              </h3>
              {loadingRadar ? (
                 <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                    <span className="flex gap-1.5">
                       <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-indigo-500 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                       <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                    </span>
                    <span className="text-xs md:text-sm font-bold text-indigo-400 italic">Analizando niveles de fatiga y SNC...</span>
                 </div>
              ) : (
                 <p className="text-xs md:text-sm text-indigo-100 font-medium leading-relaxed whitespace-pre-wrap mt-2">
                    {radarReport}
                 </p>
              )}
           </div>
        </div>

        {/* LISTA GENERAL DE ÓRDENES */}
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-zinc-300 mb-6 px-2">Base de <span className="text-emerald-500">Atletas</span></h2>
        
        {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 bg-[#0a0a0c] rounded-[3rem] border border-zinc-800">
               <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
               <p className="text-xs md:text-sm font-bold text-zinc-500 tracking-widest uppercase">Escaneando base de datos...</p>
            </div>
        ) : (
            <div className="w-full overflow-x-auto custom-scrollbar pb-6">
                <div className="min-w-[800px] md:min-w-0 grid gap-4 md:gap-5">
                    {orders.map((order) => {
                      const status = getFatigueStatus(order);

                      return (
                        <div key={order.id} className="group bg-[#0a0a0c] backdrop-blur-xl border border-zinc-800/80 p-5 md:p-8 rounded-[2rem] hover:border-emerald-500/50 hover:bg-zinc-900/60 transition-all duration-300 flex flex-row justify-between items-center gap-6 shadow-xl">
                          
                          <div className="flex flex-row items-center gap-5 w-auto">
                            <div className={`relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 shrink-0 ${
                              order.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_#10b981]' : 
                              order.status === 'under_review' ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_#3b82f6]' : 'bg-zinc-900 border-zinc-700'
                            }`}>
                                <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                                  order.status === 'paid' ? 'bg-emerald-500' : 
                                  order.status === 'under_review' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-500'
                                }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="text-base md:text-xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate max-w-[200px] md:max-w-xs">{order.customer_name}</p>
                                
                                <span className="flex items-center gap-1.5 bg-black px-2.5 py-1 md:py-1.5 rounded-lg border border-zinc-800 shrink-0" title={`Estado SNC: ${status.text}`}>
                                    <span className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`}></span>
                                    <span className="text-[8px] md:text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{status.text}</span>
                                </span>
                              </div>
                              
                              <p className="text-[10px] md:text-xs text-zinc-500 font-mono mt-1.5 md:mt-2 bg-black/50 inline-block px-3 py-1 rounded-md border border-zinc-800/80">
                                ID: {order.order_id.slice(0,8)}... | {order.customer_email}
                              </p>
                            </div>
                          </div>

                          <div className="text-center w-auto bg-black/40 px-5 py-3 md:px-6 md:py-4 rounded-2xl border border-white/5 shadow-inner">
                            <p className="text-[9px] md:text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Plan Contratado</p>
                            <p className="text-xs md:text-sm font-bold text-zinc-200 uppercase">{order.plans?.name || 'Plan Eliminado'}</p>
                          </div>

                          <div className="text-right w-auto flex flex-col items-end">
                            <p className="text-2xl md:text-4xl font-black text-white italic tracking-tighter">${Number(order.amount_ars).toLocaleString()}</p>
                            
                            <div className="flex gap-2 mt-2">
                               {order.status !== 'paid' && (
                                   <button 
                                      onClick={() => handleApproveOrder(order)} 
                                      disabled={approvingId === order.order_id}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
                                   >
                                      {approvingId === order.order_id ? "Procesando..." : "✅ Aprobar Pago"}
                                   </button>
                               )}
                               {order.is_onboarded && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest">Perfil OK</span>}
                               <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${
                                 order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                                 order.status === 'under_review' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                               }`}>
                                 {order.status.replace('_', ' ')}
                               </span>
                               <Link href={`/admin/orders/${order.order_id}`} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-zinc-700 transition-colors ml-2">Ver Ficha</Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
            </div>
        )}
      </div>

      {/* --- MODAL REPORTE DE DIRECTORIO --- */}
      {showBoardReport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="bg-[#0a0a0c] border border-indigo-500/40 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] w-full max-w-4xl shadow-[0_0_80px_rgba(79,70,229,0.2)] relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in zoom-in duration-300">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>

                <div className="flex justify-between items-center mb-6 md:mb-8 relative z-10 border-b border-zinc-800/80 pb-4 md:pb-6">
                   <div>
                      <h2 className="text-2xl md:text-4xl font-black italic uppercase text-white flex items-center gap-3 tracking-tighter">
                         <span className="text-3xl md:text-5xl">🚁</span> Reporte de <span className="text-indigo-500">Directorio</span>
                      </h2>
                      <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">Análisis Global de la Tropa (SNC & Ventas)</p>
                   </div>
                   <button onClick={() => setShowBoardReport(false)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800 text-lg md:text-xl shrink-0">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2 md:pr-4">
                   {generatingBoardReport ? (
                      <div className="flex flex-col items-center justify-center py-20 md:py-32 gap-6 md:gap-8">
                         <span className="text-6xl md:text-8xl animate-bounce drop-shadow-[0_0_20px_rgba(79,70,229,0.5)]">📡</span>
                         <p className="text-indigo-400 font-black tracking-widest uppercase text-xs md:text-sm animate-pulse text-center px-4">Escaneando RMs y Fatiga de todos los atletas...</p>
                      </div>
                   ) : (
                      <div className="text-xs md:text-sm text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap bg-black/60 p-6 md:p-10 rounded-2xl md:rounded-[2rem] border border-indigo-900/30 shadow-inner">
                         {boardReportContent}
                      </div>
                   )}
                </div>
                
                <div className="pt-6 md:pt-8 border-t border-zinc-800/80 mt-4 md:mt-6 relative z-10">
                   <button onClick={() => setShowBoardReport(false)} className="w-full bg-zinc-900 hover:bg-indigo-600 hover:text-white text-zinc-400 py-4 md:py-5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border border-zinc-800 transition-all shadow-lg active:scale-95">
                      CERRAR INFORME DE DIRECTORIO
                   </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL NUEVO ATLETA --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0c] border border-emerald-900/40 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] w-full max-w-md shadow-[0_0_80px_rgba(16,185,129,0.2)] relative overflow-hidden animate-in zoom-in duration-300">
                <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -mr-10 -mt-10"></div>
                <button onClick={() => setShowModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 w-10 h-10 flex items-center justify-center bg-zinc-900 hover:bg-red-500 hover:text-white text-zinc-500 rounded-full transition-colors font-bold border border-zinc-800">✕</button>

                <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white mb-2 tracking-tighter">Nuevo <span className="text-emerald-500">Atleta</span></h2>
                <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8 md:mb-10">Creación de ficha y acceso</p>
                
                <form onSubmit={handleCreateAthlete} className="space-y-5 md:space-y-6 relative z-10">
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Nombre Completo</label>
                        <input required type="text" className="w-full bg-black/60 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner" placeholder="Ej: Juan Perez" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Email (Acceso Atleta)</label>
                        <input required type="email" className="w-full bg-black/60 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner" placeholder="usuario@email.com" value={newAthlete.email} onChange={e => setNewAthlete({...newAthlete, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Contraseña</label>
                        <input required type="text" className="w-full bg-black/60 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner" placeholder="Clave para el atleta" value={newAthlete.password} onChange={e => setNewAthlete({...newAthlete, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[9px] md:text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2 block ml-1">Plan a Asignar</label>
                        <div className="relative">
                          <select className="w-full bg-black/60 border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all shadow-inner" value={newAthlete.planCode} onChange={e => setNewAthlete({...newAthlete, planCode: e.target.value})}>
                              {plans.map(plan => (<option key={plan.id} value={plan.code} className="bg-zinc-900">{plan.name} - ${plan.price.toLocaleString()}</option>))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={creating} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 active:scale-95">
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.8); }
      `}} />
    </div>
  );
}