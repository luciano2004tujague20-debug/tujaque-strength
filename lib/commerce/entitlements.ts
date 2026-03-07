// lib/commerce/entitlements.ts

type SupabaseAdmin = any;

export async function grantEntitlementsFromOrder(order: any, supabase: SupabaseAdmin) {
  if (!order?.items || !Array.isArray(order.items)) {
    throw new Error("La orden no tiene items válidos para otorgar permisos.");
  }

  for (const item of order.items) {
    const { data: rules, error: rulesError } = await supabase
      .from("commerce_product_entitlements")
      .select("*")
      .eq("product_id", item.product_id);

    if (rulesError) {
      throw new Error(`No se pudieron leer las reglas del producto ${item.product_id}: ${rulesError.message}`);
    }

    if (!rules || rules.length === 0) continue;

    for (const rule of rules) {
      let expiresAt: string | null = null;
      let grantedLimit: number | null = null;

      if (rule.grant_mode === "fixed_days") {
        const date = new Date();
        date.setDate(date.getDate() + Number(rule.duration_days));
        expiresAt = date.toISOString();
      }

      if (rule.grant_mode === "one_shot" || rule.grant_mode === "metered") {
        grantedLimit = rule.grant_limit ? Number(rule.grant_limit) : null;
      }

      const newEntitlement = {
        user_id: order.user_id,
        entitlement_id: rule.entitlement_id,
        source_type: "order_item",
        source_order_item_id: item.id,
        status: "active",
        starts_at: new Date().toISOString(),
        expires_at: expiresAt,
        granted_limit: grantedLimit,
        consumed_count: 0,
      };

      const { error: insertError } = await supabase
        .from("commerce_user_entitlements")
        .insert(newEntitlement);

      if (insertError) {
        // 23505 = duplicado esperado por índice único parcial
        if (insertError.code === "23505") {
          continue;
        }

        throw new Error(
          `No se pudo otorgar el permiso ${rule.entitlement_id} para el item ${item.id}: ${insertError.message}`
        );
      }
    }
  }
}