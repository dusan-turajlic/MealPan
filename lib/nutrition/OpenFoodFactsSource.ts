import type { NutritionSource } from "./NutritionSource";
import type { ResolvedNutrition, ProductDetail, MacroValues } from "../types";

interface OFFNutriments {
  "energy-kcal_100g"?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  sugars_100g?: number;
  "saturated-fat_100g"?: number;
  fiber_100g?: number;
  salt_100g?: number;
}

interface OFFProduct {
  product_name?: string;
  brands?: string;
  quantity?: string;
  image_front_url?: string;
  image_url?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  ingredients_text?: string;
  allergens?: string;
  nutriments?: OFFNutriments;
}

interface OFFApiResponse {
  status: 0 | 1;
  product?: OFFProduct;
}

// PATTERN: Adapter — maps raw OFF API shape to our internal types.
class OFFAdapter {
  adaptNutrition(barcode: string, fallbackName: string, raw: OFFApiResponse): ResolvedNutrition {
    if (raw.status === 0 || !raw.product) {
      return this.nullNutrition(barcode, fallbackName);
    }

    const p = raw.product;
    const n = p.nutriments ?? {};

    const per100g: MacroValues = {
      kcal: n["energy-kcal_100g"] ?? 0,
      protein: n["proteins_100g"] ?? 0,
      carbs: n["carbohydrates_100g"] ?? 0,
      fat: n["fat_100g"] ?? 0,
    };

    return {
      barcode,
      productName: p.product_name ?? fallbackName,
      per100g,
      available: true,
      nutritionSource: "openfoodfacts",
      imageUrl: p.image_front_url ?? p.image_url ?? null,
    };
  }

  adaptDetail(barcode: string, raw: OFFApiResponse): ProductDetail {
    if (raw.status === 0 || !raw.product) {
      return this.nullDetail();
    }

    const p = raw.product;
    const n = p.nutriments ?? {};

    return {
      available: true,
      productName: p.product_name ?? "",
      brands: p.brands ?? "",
      quantity: p.quantity ?? "",
      imageUrl: p.image_front_url ?? p.image_url ?? null,
      nutriscoreGrade: (p.nutriscore_grade as ProductDetail["nutriscoreGrade"]) ?? null,
      novaGroup: (p.nova_group as ProductDetail["novaGroup"]) ?? null,
      ingredientsText: p.ingredients_text ?? null,
      allergens: p.allergens ?? "",
      sourceUrl: `https://world.openfoodfacts.org/product/${barcode}`,
      per100g: {
        kcal: n["energy-kcal_100g"] ?? 0,
        protein: n["proteins_100g"] ?? 0,
        carbs: n["carbohydrates_100g"] ?? 0,
        sugars: n["sugars_100g"] ?? 0,
        fat: n["fat_100g"] ?? 0,
        saturatedFat: n["saturated-fat_100g"] ?? 0,
        fiber: n["fiber_100g"] ?? 0,
        salt: n["salt_100g"] ?? 0,
      },
    };
  }

  nullNutrition(barcode: string, fallbackName: string): ResolvedNutrition {
    return {
      barcode,
      productName: fallbackName,
      per100g: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      available: false,
      nutritionSource: "openfoodfacts",
      imageUrl: null,
    };
  }

  nullDetail(): ProductDetail {
    return {
      available: false,
      productName: "",
      brands: "",
      quantity: "",
      imageUrl: null,
      nutriscoreGrade: null,
      novaGroup: null,
      ingredientsText: null,
      allergens: "",
      sourceUrl: "",
      per100g: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, salt: 0 },
    };
  }
}

const adapter = new OFFAdapter();

const OFF_HEADERS = {
  "User-Agent": "MealPlanApp/1.0 (https://github.com/meal-plan-app)",
};

const NUTRITION_FIELDS = "code,product_name,image_front_url,image_url,nutriments";
const DETAIL_FIELDS = "product_name,brands,quantity,image_front_url,image_url,nutriscore_grade,nova_group,ingredients_text,allergens,nutriments";

function offUrl(barcode: string, fields: string) {
  return `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=${fields}`;
}

interface OFFSearchResponse {
  products?: (OFFProduct & { code?: string })[];
}

export class OpenFoodFactsSource implements NutritionSource {
  readonly label = "OpenFoodFacts";

  async fetchNutritionBatch(
    items: { barcode: string; fallbackName: string }[]
  ): Promise<Map<string, ResolvedNutrition>> {
    const result = new Map<string, ResolvedNutrition>();
    if (items.length === 0) return result;

    // Seed with nulls so every barcode has an entry even if the API misses it.
    for (const { barcode, fallbackName } of items) {
      result.set(barcode, adapter.nullNutrition(barcode, fallbackName));
    }

    try {
      const codes = items.map((i) => i.barcode).join(",");
      const url = `https://world.openfoodfacts.org/api/v2/search?code=${codes}&fields=${NUTRITION_FIELDS}&page_size=${items.length}`;

      let res = await fetch(url, {
        headers: OFF_HEADERS,
        signal: AbortSignal.timeout(12000),
        next: { revalidate: 86400 },
      });

      // Retry once after a short wait if rate-limited.
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        res = await fetch(url, {
          headers: OFF_HEADERS,
          signal: AbortSignal.timeout(12000),
          next: { revalidate: 86400 },
        });
      }

      if (!res.ok) return result;

      const data = (await res.json()) as OFFSearchResponse;
      const fallbackMap = new Map(items.map((i) => [i.barcode, i.fallbackName]));

      for (const product of data.products ?? []) {
        const barcode = product.code;
        if (!barcode) continue;
        const fallbackName = fallbackMap.get(barcode) ?? "";
        result.set(
          barcode,
          adapter.adaptNutrition(barcode, fallbackName, { status: 1, product })
        );
      }
    } catch {
      // already seeded with nulls above
    }

    return result;
  }

  async fetchNutrition(barcode: string, fallbackName: string): Promise<ResolvedNutrition> {
    try {
      const res = await fetch(
        offUrl(barcode, NUTRITION_FIELDS),
        { headers: OFF_HEADERS, signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } }
      );
      if (!res.ok) return adapter.nullNutrition(barcode, fallbackName);
      const data = (await res.json()) as OFFApiResponse;
      return adapter.adaptNutrition(barcode, fallbackName, data);
    } catch {
      return adapter.nullNutrition(barcode, fallbackName);
    }
  }

  async fetchDetail(barcode: string): Promise<ProductDetail> {
    try {
      const res = await fetch(
        offUrl(barcode, DETAIL_FIELDS),
        { headers: OFF_HEADERS, signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } }
      );
      if (!res.ok) return adapter.nullDetail();
      const data = (await res.json()) as OFFApiResponse;
      return adapter.adaptDetail(barcode, data);
    } catch {
      return adapter.nullDetail();
    }
  }
}
