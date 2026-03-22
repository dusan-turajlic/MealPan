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

export class OpenFoodFactsSource implements NutritionSource {
  readonly label = "OpenFoodFacts";

  async fetchNutrition(barcode: string, fallbackName: string): Promise<ResolvedNutrition> {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { next: { revalidate: 86400 } }
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
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return adapter.nullDetail();
      const data = (await res.json()) as OFFApiResponse;
      return adapter.adaptDetail(barcode, data);
    } catch {
      return adapter.nullDetail();
    }
  }
}
