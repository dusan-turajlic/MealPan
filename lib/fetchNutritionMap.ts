import { MealPlanFile, ResolvedNutrition } from "./types";
import { getNutritionSource } from "./nutrition/registry";
import type { OpenFoodFactsSource } from "./nutrition/OpenFoodFactsSource";

export async function fetchNutritionMap(
  plan: MealPlanFile
): Promise<Map<string, ResolvedNutrition>> {
  const offItems: { barcode: string; fallbackName: string }[] = [];
  const otherItems: { barcode: string; fallbackName: string; source: string }[] = [];
  const seen = new Set<string>();

  for (const profile of plan.profiles) {
    for (const meal of profile.meals) {
      for (const option of meal.options) {
        for (const ing of option.ingredients) {
          if (seen.has(ing.source.barcode)) continue;
          seen.add(ing.source.barcode);
          const src = ing.source.nutritionSource ?? "openfoodfacts";
          if (src === "openfoodfacts") {
            offItems.push({ barcode: ing.source.barcode, fallbackName: ing.source.name });
          } else {
            otherItems.push({ barcode: ing.source.barcode, fallbackName: ing.source.name, source: src });
          }
        }
      }
    }
  }

  const off = getNutritionSource("openfoodfacts") as OpenFoodFactsSource;
  const [offMap, otherResults] = await Promise.all([
    off.fetchNutritionBatch(offItems),
    Promise.all(
      otherItems.map(({ barcode, fallbackName, source }) =>
        getNutritionSource(source).fetchNutrition(barcode, fallbackName)
      )
    ),
  ]);

  const nutritionMap = new Map<string, ResolvedNutrition>(offMap);
  otherResults.forEach((r) => nutritionMap.set(r.barcode, r));
  return nutritionMap;
}
