import type { NutritionSource } from "./NutritionSource";
import type { ResolvedNutrition, ProductDetail, MacroValues } from "../types";

interface FineliFood {
  id: number;
  name: { fi: string; sv?: string; en?: string };
  energyKcal?: number;
  protein?: number;
  carbohydrate?: number;
  fat?: number;
  fiber?: number;
  salt?: number;
}

// PATTERN: Adapter — maps Fineli API shape to our internal types.
class FineliAdapter {
  adaptNutrition(id: string, fallbackName: string, raw: FineliFood | null): ResolvedNutrition {
    if (!raw) return this.nullNutrition(id, fallbackName);

    const per100g: MacroValues = {
      kcal: raw.energyKcal ?? 0,
      protein: raw.protein ?? 0,
      carbs: raw.carbohydrate ?? 0,
      fat: raw.fat ?? 0,
    };

    return {
      barcode: id,
      productName: raw.name?.fi ?? fallbackName,
      per100g,
      available: true,
      nutritionSource: "fineli",
    };
  }

  adaptDetail(id: string, raw: FineliFood | null): ProductDetail {
    if (!raw) return this.nullDetail();

    return {
      available: true,
      productName: raw.name?.fi ?? "",
      brands: "",
      quantity: "",
      imageUrl: null,
      nutriscoreGrade: null,
      novaGroup: null,
      ingredientsText: null,
      allergens: "",
      sourceUrl: `https://fineli.fi/fineli/en/foods/${id}`,
      per100g: {
        kcal: raw.energyKcal ?? 0,
        protein: raw.protein ?? 0,
        carbs: raw.carbohydrate ?? 0,
        fat: raw.fat ?? 0,
        fiber: raw.fiber ?? 0,
        salt: raw.salt ?? 0,
      },
    };
  }

  nullNutrition(id: string, fallbackName: string): ResolvedNutrition {
    return {
      barcode: id,
      productName: fallbackName,
      per100g: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      available: false,
      nutritionSource: "fineli",
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

const adapter = new FineliAdapter();

const FINELI_HEADERS = {
  "User-Agent": "MealPlanApp/1.0",
  "Accept": "application/json",
};

export class FineliSource implements NutritionSource {
  readonly label = "Fineli";

  async fetchNutrition(id: string, fallbackName: string): Promise<ResolvedNutrition> {
    try {
      const res = await fetch(
        `https://fineli.fi/fineli/api/v1/foods/${id}`,
        { headers: FINELI_HEADERS, signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } }
      );
      if (!res.ok) return adapter.nullNutrition(id, fallbackName);
      const data = (await res.json()) as FineliFood;
      return adapter.adaptNutrition(id, fallbackName, data);
    } catch {
      return adapter.nullNutrition(id, fallbackName);
    }
  }

  async fetchDetail(id: string): Promise<ProductDetail> {
    try {
      const res = await fetch(
        `https://fineli.fi/fineli/api/v1/foods/${id}`,
        { headers: FINELI_HEADERS, signal: AbortSignal.timeout(8000), next: { revalidate: 86400 } }
      );
      if (!res.ok) return adapter.nullDetail();
      const data = (await res.json()) as FineliFood;
      return adapter.adaptDetail(id, data);
    } catch {
      return adapter.nullDetail();
    }
  }
}
