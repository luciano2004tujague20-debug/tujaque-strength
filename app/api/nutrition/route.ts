import { NextResponse } from 'next/server';

// ============================================================================
// 🚀 ENDPOINT DE NUTRICIÓN: CONEXIÓN A EDAMAM FOOD DATABASE API
// ============================================================================

export async function POST(request: Request) {
  try {
    // 1. Extraemos el alimento que el cliente quiere buscar desde la web
    const body = await request.json();
    const { foodName } = body;

    // Si el usuario no escribió nada, le devolvemos un error de código 400 (Bad Request)
    if (!foodName) {
      return NextResponse.json(
        { error: "Debes proporcionar el nombre de un alimento." },
        { status: 400 }
      );
    }

    // 2. Leemos nuestras llaves secretas desde la caja fuerte (.env.local)
    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;

    // Validamos que las llaves existan para no romper el sistema
    if (!appId || !appKey) {
      console.error("Faltan las credenciales de Edamam en el archivo .env.local");
      return NextResponse.json(
        { error: "Error interno de configuración del servidor." },
        { status: 500 }
      );
    }

    // 3. Armamos la URL exacta que Edamam nos pide para buscar alimentos
    // Usamos encodeURIComponent para convertir espacios en formato web (ej: "pechuga de pollo" -> "pechuga%20de%20pollo")
    const edamamUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(foodName)}&nutrition-type=cooking`;

    // 4. Hacemos la petición a los servidores de Edamam
    const response = await fetch(edamamUrl);

    // Si Edamam nos rechaza (por ejemplo, si nos pasamos del límite gratis), capturamos el error
    if (!response.ok) {
      throw new Error(`Error en la API de Edamam: ${response.status}`);
    }

    // 5. Transformamos la respuesta en un formato JSON (texto estructurado)
    const data = await response.json();

    // Verificamos si Edamam encontró el alimento
    if (!data.parsed || data.parsed.length === 0) {
       return NextResponse.json(
         { message: "No se encontró información para este alimento." },
         { status: 404 }
       );
    }

    // 6. Filtramos la data gigante y nos quedamos solo con los macros Élite que nos importan
    // Extraemos el primer resultado (el más exacto)
    // Agregamos el para que tome el primer resultado exacto de la lista
    const foodItem = data.parsed.food;
    const nutrientes = foodItem.nutrients;

    const macrosLimpios = {
      nombre: foodItem.label,
      imagen: foodItem.image || null,
      calorias: nutrientes.ENERC_KCAL ? Math.round(nutrientes.ENERC_KCAL) : 0, // Kcal
      proteinas: nutrientes.PROCNT ? Math.round(nutrientes.PROCNT) : 0,       // Gramos
      carbohidratos: nutrientes.CHOCDF ? Math.round(nutrientes.CHOCDF) : 0,   // Gramos
      grasas: nutrientes.FAT ? Math.round(nutrientes.FAT) : 0,                // Gramos
      medidaBase: "100 gramos" // Edamam devuelve los valores por 100g por defecto en esta ruta
    };

    // 7. Le enviamos los macros limpios de vuelta a tu interfaz visual
    return NextResponse.json({ success: true, data: macrosLimpios });

  } catch (error) {
    // Si la conexión falla, evitamos que la pantalla del usuario se ponga blanca (Error Crash)
    console.error("Error en el endpoint de nutrición:", error);
    return NextResponse.json(
      { error: "Error al comunicarse con la base de datos nutricional." },
      { status: 500 }
    );
  }
}