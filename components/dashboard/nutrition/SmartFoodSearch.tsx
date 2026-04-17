'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";

interface FoodItem {
  id: string;
  name: string;
  calories: number; // Por cada 100g
  protein: number;
  carbs: number;
  fats: number;
  source: 'database' | 'api' | 'local';
}

// 🔥 EL DICCIONARIO ÉLITE EXPANDIDO DEL HEAD COACH 🔥
// Macros exactos por 100g verificados para culturismo. Carga instantánea sin internet.
const ELITE_FOODS: FoodItem[] = [
  // --- PROTEÍNAS ANIMALES ---
  { id: 'l-1', name: 'Pechuga de Pollo (Cruda)', calories: 120, protein: 22, carbs: 0, fats: 3, source: 'local' },
  { id: 'l-2', name: 'Pechuga de Pollo (Cocida)', calories: 165, protein: 31, carbs: 0, fats: 3.5, source: 'local' },
  { id: 'l-3', name: 'Pata Muslo de Pollo (Sin piel)', calories: 180, protein: 24, carbs: 0, fats: 9, source: 'local' },
  { id: 'l-4', name: 'Carne Magra Vacuna (Peceto/Nalga)', calories: 135, protein: 23, carbs: 0, fats: 4, source: 'local' },
  { id: 'l-5', name: 'Carne Vacuna Picada (Magra 90/10)', calories: 176, protein: 20, carbs: 0, fats: 10, source: 'local' },
  { id: 'l-6', name: 'Lomo de Vaca (Asado)', calories: 250, protein: 26, carbs: 0, fats: 15, source: 'local' },
  { id: 'l-7', name: 'Bife de Chorizo / Entrecot', calories: 211, protein: 24, carbs: 0, fats: 12, source: 'local' },
  { id: 'l-8', name: 'Cerdo Magro (Carré/Solomillo)', calories: 143, protein: 21, carbs: 0, fats: 6, source: 'local' },
  { id: 'l-9', name: 'Atún al Natural (Lata escurrida)', calories: 116, protein: 26, carbs: 0, fats: 1, source: 'local' },
  { id: 'l-10', name: 'Atún en Aceite (Lata escurrida)', calories: 198, protein: 29, carbs: 0, fats: 8, source: 'local' },
  { id: 'l-11', name: 'Filet de Merluza (Crudo)', calories: 90, protein: 19, carbs: 0, fats: 1.5, source: 'local' },
  { id: 'l-12', name: 'Salmón Rosado (Crudo)', calories: 208, protein: 20, carbs: 0, fats: 13, source: 'local' },
  { id: 'l-13', name: 'Sardinas (En lata, con salsa de tomate)', calories: 185, protein: 20, carbs: 1, fats: 10, source: 'local' },
  
  // --- HUEVOS Y LÁCTEOS ---
  { id: 'l-14', name: 'Huevo Entero (Cocido/Duro)', calories: 155, protein: 13, carbs: 1, fats: 11, source: 'local' },
  { id: 'l-15', name: 'Claras de Huevo (Líquidas/Cocidas)', calories: 52, protein: 11, carbs: 1, fats: 0, source: 'local' },
  { id: 'l-16', name: 'Yema de Huevo', calories: 322, protein: 16, carbs: 3.6, fats: 27, source: 'local' },
  { id: 'l-17', name: 'Queso Magro / Por Salut', calories: 250, protein: 25, carbs: 2, fats: 15, source: 'local' },
  { id: 'l-18', name: 'Queso Cottage', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, source: 'local' },
  { id: 'l-19', name: 'Leche Entera (Fluida)', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, source: 'local' },
  { id: 'l-20', name: 'Leche Descremada (Fluida)', calories: 35, protein: 3.3, carbs: 5, fats: 0.1, source: 'local' },
  { id: 'l-21', name: 'Yogur Griego (Natural sin azúcar)', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, source: 'local' },
  { id: 'l-22', name: 'Whey Protein (Suplemento Promedio)', calories: 380, protein: 78, carbs: 6, fats: 5, source: 'local' },
  
  // --- CARBOHIDRATOS ALMIDONADOS ---
  { id: 'l-23', name: 'Arroz Blanco (Crudo)', calories: 360, protein: 7, carbs: 80, fats: 1, source: 'local' },
  { id: 'l-24', name: 'Arroz Blanco (Cocido)', calories: 130, protein: 3, carbs: 28, fats: 0, source: 'local' },
  { id: 'l-25', name: 'Arroz Integral (Crudo)', calories: 367, protein: 7.5, carbs: 76, fats: 2.8, source: 'local' },
  { id: 'l-26', name: 'Arroz Integral (Cocido)', calories: 112, protein: 2.6, carbs: 23, fats: 0.9, source: 'local' },
  { id: 'l-27', name: 'Avena (Copos Tradicionales)', calories: 389, protein: 17, carbs: 66, fats: 7, source: 'local' },
  { id: 'l-28', name: 'Papa Blanca (Cruda)', calories: 77, protein: 2, carbs: 17, fats: 0, source: 'local' },
  { id: 'l-29', name: 'Papa Blanca (Hervida/Horno)', calories: 87, protein: 1.9, carbs: 20, fats: 0.1, source: 'local' },
  { id: 'l-30', name: 'Batata / Boniato (Cruda)', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, source: 'local' },
  { id: 'l-31', name: 'Batata / Boniato (Cocida)', calories: 90, protein: 2, carbs: 21, fats: 0.2, source: 'local' },
  { id: 'l-32', name: 'Fideos / Pasta de Trigo (Crudos)', calories: 350, protein: 12, carbs: 71, fats: 1.5, source: 'local' },
  { id: 'l-33', name: 'Fideos / Pasta de Trigo (Cocidos)', calories: 158, protein: 5.8, carbs: 31, fats: 0.9, source: 'local' },
  { id: 'l-34', name: 'Lentejas (Crudas)', calories: 353, protein: 25, carbs: 60, fats: 1, source: 'local' },
  { id: 'l-35', name: 'Lentejas (Cocidas)', calories: 116, protein: 9, carbs: 20, fats: 0.4, source: 'local' },
  { id: 'l-36', name: 'Garbanzos (Crudos)', calories: 364, protein: 19, carbs: 61, fats: 6, source: 'local' },
  { id: 'l-37', name: 'Pan de Molde Blanco', calories: 266, protein: 8.8, carbs: 50, fats: 3.3, source: 'local' },
  { id: 'l-38', name: 'Pan Integral', calories: 252, protein: 12, carbs: 43, fats: 3.5, source: 'local' },
  { id: 'l-39', name: 'Galletas de Arroz (Inflado)', calories: 387, protein: 8, carbs: 81, fats: 2.8, source: 'local' },
  { id: 'l-40', name: 'Quinoa (Cruda)', calories: 368, protein: 14, carbs: 64, fats: 6, source: 'local' },
  
  // --- FRUTAS (CARBOS SIMPLES) ---
  { id: 'l-41', name: 'Banana / Plátano', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, source: 'local' },
  { id: 'l-42', name: 'Manzana (con piel)', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, source: 'local' },
  { id: 'l-43', name: 'Naranja', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, source: 'local' },
  { id: 'l-44', name: 'Frutillas / Fresas', calories: 32, protein: 0.7, carbs: 8, fats: 0.3, source: 'local' },
  { id: 'l-45', name: 'Arándanos', calories: 57, protein: 0.7, carbs: 14, fats: 0.3, source: 'local' },
  { id: 'l-46', name: 'Kiwi', calories: 61, protein: 1.1, carbs: 15, fats: 0.5, source: 'local' },
  { id: 'l-47', name: 'Pera', calories: 57, protein: 0.4, carbs: 15, fats: 0.1, source: 'local' },
  { id: 'l-48', name: 'Sandía', calories: 30, protein: 0.6, carbs: 8, fats: 0.2, source: 'local' },
  
  // --- GRASAS SALUDABLES ---
  { id: 'l-49', name: 'Palta / Aguacate', calories: 160, protein: 2, carbs: 8, fats: 15, source: 'local' },
  { id: 'l-50', name: 'Almendras (Tostadas sin sal)', calories: 579, protein: 21, carbs: 22, fats: 50, source: 'local' },
  { id: 'l-51', name: 'Nueces', calories: 654, protein: 15, carbs: 14, fats: 65, source: 'local' },
  { id: 'l-52', name: 'Maní / Cacahuete (Tostado sin sal)', calories: 567, protein: 26, carbs: 16, fats: 49, source: 'local' },
  { id: 'l-53', name: 'Mantequilla de Maní (100% natural)', calories: 588, protein: 25, carbs: 20, fats: 50, source: 'local' },
  { id: 'l-54', name: 'Aceite de Oliva Extra Virgen', calories: 884, protein: 0, carbs: 0, fats: 100, source: 'local' },
  { id: 'l-55', name: 'Aceite de Coco', calories: 862, protein: 0, carbs: 0, fats: 100, source: 'local' },
  { id: 'l-56', name: 'Semillas de Chía', calories: 486, protein: 17, carbs: 42, fats: 31, source: 'local' },
  { id: 'l-57', name: 'Semillas de Girasol', calories: 534, protein: 21, carbs: 20, fats: 51, source: 'local' },
  
  // --- VEGETALES (Bajo en Kcal / Alta Fibra) ---
  { id: 'l-58', name: 'Brócoli (Cocido)', calories: 35, protein: 2.4, carbs: 7, fats: 0.4, source: 'local' },
  { id: 'l-59', name: 'Espinaca (Cruda)', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, source: 'local' },
  { id: 'l-60', name: 'Lechuga Capuchina / Repollada', calories: 14, protein: 0.9, carbs: 3, fats: 0.1, source: 'local' },
  { id: 'l-61', name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, source: 'local' },
  { id: 'l-62', name: 'Cebolla', calories: 40, protein: 1.1, carbs: 9, fats: 0.1, source: 'local' },
  { id: 'l-63', name: 'Zanahoria (Cruda)', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, source: 'local' },
  { id: 'l-64', name: 'Zanahoria (Hervida)', calories: 35, protein: 0.8, carbs: 8, fats: 0.2, source: 'local' },
  { id: 'l-65', name: 'Morrón / Pimiento Rojo', calories: 31, protein: 1, carbs: 6, fats: 0.3, source: 'local' },
  { id: 'l-66', name: 'Pepino (con piel)', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, source: 'local' },
  { id: 'l-67', name: 'Zapallo Calabaza', calories: 26, protein: 1, carbs: 6, fats: 0.1, source: 'local' }
];

export default function SmartFoodSearch({ onAddFood }: { onAddFood: (food: any) => void }) {
  const supabase = createClient();
  
  // 🔥 ESTADOS CORREGIDOS Y COMPLETOS 🔥
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false); 
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingSize, setServingSize] = useState<number>(100);

  useEffect(() => {
    fetchRecentFoods();
  }, []);

  async function fetchRecentFoods() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_saved_foods')
      .select('*')
      .eq('user_id', user.id)
      .order('last_logged_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentFoods(data.map(item => ({
        id: item.id,
        name: item.food_name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        source: 'database'
      })));
    }
  }

  // Buscador Inteligente HÍBRIDO (Diccionario Élite + API EDAMAM)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        searchCombined(query);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 🔥 EL MOTOR DE BÚSQUEDA OPTIMIZADO (CONEXIÓN A TU SERVIDOR) 🔥
  async function searchCombined(searchTerm: string) {
    setIsSearching(true);
    
    // Normalizamos el texto (quitamos tildes para que atun = atún)
    const normalizedTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // PASO 1: Buscar en nuestra base de datos local (Súper rápido y sin internet)
    const localMatches = ELITE_FOODS.filter(food => 
      food.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedTerm)
    );

    // PASO 2: Buscar en la API comercial (Edamam vía nuestro Backend seguro)
    let apiMatches: FoodItem[] = [];
    
    try {
      // Hacemos la petición a nuestra propia ruta /api/nutrition
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName: searchTerm })
      });

      const json = await res.json();

      // Si la API encontró el alimento y nos devuelve el JSON limpio
      if (res.ok && json.success && json.data) {
        apiMatches = [{
          id: Math.random().toString(),
          name: json.data.nombre,
          calories: json.data.calorias,
          protein: json.data.proteinas,
          carbs: json.data.carbohidratos,
          fats: json.data.grasas,
          source: 'api'
        }];
      }
    } catch (error) {
      console.error("Error conectando con Edamam Backend:", error);
    }

    // PASO 3: Unimos resultados (Primero los naturales del Coach, después el de la API)
    const finalResults = [...localMatches, ...apiMatches];
    setResults(finalResults);
    setIsSearching(false);
  }

  // Lógica para guardar la comida
  async function handleConfirmFood() {
    if (!selectedFood) return;

    // Calculamos los macros en base a los gramos ingresados (Regla de 3 simple)
    const multiplier = servingSize / 100;
    const finalFood = {
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier),
      carbs: Math.round(selectedFood.carbs * multiplier),
      fats: Math.round(selectedFood.fats * multiplier),
    };

    // 1. Lo mandamos al panel principal para que actualice la vista
    onAddFood(finalFood);

    // 2. Lo guardamos/actualizamos en los "Recientes" del usuario silenciosamente
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Chequeamos si ya existe para actualizar la fecha
        const { data: existing } = await supabase.from('user_saved_foods').select('id').eq('user_id', user.id).eq('food_name', selectedFood.name).maybeSingle();
        
        if (existing) {
            await supabase.from('user_saved_foods').update({ last_logged_at: new Date().toISOString() }).eq('id', existing.id);
        } else {
            await supabase.from('user_saved_foods').insert({
                user_id: user.id,
                food_name: selectedFood.name,
                calories: selectedFood.calories,
                protein: selectedFood.protein,
                carbs: selectedFood.carbs,
                fats: selectedFood.fats,
                serving_qty: 100,
                serving_unit: 'g'
            });
        }
        fetchRecentFoods(); // Refrescamos la lista de recientes
    }

    // Cerramos todo
    setSelectedFood(null);
    setQuery('');
    setServingSize(100);
    setIsFocused(false); 
  }

  return (
    <div className="relative w-full">
      
      {/* BARRA DE BÚSQUEDA */}
      <div className="relative z-20">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)} 
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} 
          placeholder="Buscar alimento o escanear (Ej: Yogur Ser, Pollo, Oreo)..." 
          className="w-full bg-gray-50 border border-gray-200 py-3 pl-12 pr-4 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-amber-400 focus:bg-white transition-all placeholder:text-gray-400 shadow-inner relative z-20"
        />
        {isSearching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin z-20"></span>
        )}
      </div>

      {/* RESULTADOS O RECIENTES */}
      {isFocused && (query.length > 0 || recentFoods.length > 0) && !selectedFood && (
        <div className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar p-2">
            
            {/* Si está buscando, mostramos resultados HÍBRIDOS */}
            {query.length >= 2 ? (
                <>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-3 py-2 border-b border-gray-50 mb-1">Resultados Globales</p>
                    {results.length > 0 ? results.map((food, idx) => (
                        <button key={`${food.id}-${idx}`} onClick={() => setSelectedFood(food)} className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex justify-between items-center group cursor-pointer border border-transparent hover:border-gray-200">
                            <div className="flex flex-col truncate pr-2">
                                <span className="text-xs font-bold text-gray-800 truncate">{food.name}</span>
                                {/* 🔥 BADGES DE ORIGEN 🔥 */}
                                {food.source === 'local' ? (
                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mt-1 w-max">🌿 Natural / Base</span>
                                ) : (
                                    <span className="text-[8px] font-black text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded mt-1 w-max">📦 Base de Datos Global</span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold group-hover:text-amber-500 whitespace-nowrap shrink-0">
                                {food.calories} kcal / 100g
                            </span>
                        </button>
                    )) : (
                        !isSearching && <p className="text-xs text-gray-500 p-3 text-center italic">No se encontraron resultados para "{query}"</p>
                    )}
                </>
            ) : (
                /* Si no está buscando, mostramos el historial de 1 click */
                <>
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 px-3 py-2 flex items-center gap-1">
                        <span>⚡</span> Comidas Recientes (1 Click)
                    </p>
                    {recentFoods.map((food) => (
                        <button key={food.id} onClick={() => setSelectedFood(food)} className="w-full text-left p-3 hover:bg-amber-50 rounded-lg transition-colors flex justify-between items-center group border border-transparent hover:border-amber-100 cursor-pointer">
                            <span className="text-xs font-bold text-gray-800 truncate pr-2">{food.name}</span>
                            <span className="text-[10px] text-amber-600 font-black bg-amber-100/50 px-2 py-1 rounded shrink-0">
                                {food.calories} kcal / 100g
                            </span>
                        </button>
                    ))}
                </>
            )}
        </div>
      )}

      {/* 🔥 MODAL DE CANTIDAD 🔥 */}
      {selectedFood && (
        <div className="absolute z-40 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                <div>
                    <h4 className="text-sm font-black text-black flex items-center gap-2">
                        {selectedFood.name}
                        {selectedFood.source === 'local' && <span className="text-lg" title="Alimento natural verificado">🌿</span>}
                    </h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Cálculo de Macros Dinámico</p>
                </div>
                <button onClick={() => setSelectedFood(null)} className="text-gray-400 hover:text-black font-bold text-xl cursor-pointer">×</button>
            </div>

            <div className="flex gap-4 items-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">¿Cuántos gramos vas a ingerir?</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            autoFocus
                            value={servingSize}
                            onChange={(e) => setServingSize(Number(e.target.value))}
                            className="w-24 bg-white border border-gray-200 p-2 rounded-lg text-lg font-black text-amber-600 outline-none focus:border-amber-400 text-center shadow-inner"
                        />
                        <span className="text-xs font-bold text-gray-400">gramos (g)</span>
                    </div>
                </div>
            </div>

            {/* Resultado de Macros Calculados */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[9px] font-black text-amber-500 uppercase">Kcal</p>
                    <p className="text-sm font-black text-amber-700">{Math.round(selectedFood.calories * (servingSize/100))}</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-[9px] font-black text-blue-500 uppercase">Prot</p>
                    <p className="text-sm font-black text-blue-700">{Math.round(selectedFood.protein * (servingSize/100))}g</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-500 uppercase">Carb</p>
                    <p className="text-sm font-black text-emerald-700">{Math.round(selectedFood.carbs * (servingSize/100))}g</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-[9px] font-black text-red-500 uppercase">Grasa</p>
                    <p className="text-sm font-black text-red-700">{Math.round(selectedFood.fats * (servingSize/100))}g</p>
                </div>
            </div>

            <button 
                onClick={handleConfirmFood}
                className="w-full bg-black hover:bg-zinc-800 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
                ➕ AGREGAR A MI DÍA
            </button>
        </div>
      )}
    </div>
  );
}