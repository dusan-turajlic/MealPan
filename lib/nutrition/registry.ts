import type { NutritionSource } from "./NutritionSource";
import { OpenFoodFactsSource } from "./OpenFoodFactsSource";
import { FineliSource } from "./FineliSource";

// PATTERN: Registry — maps source name strings to concrete Strategy instances.
// Adding a new source = create one file + register it here.
const sources: Record<string, NutritionSource> = {
  openfoodfacts: new OpenFoodFactsSource(),
  fineli: new FineliSource(),
};

export function getNutritionSource(name: string): NutritionSource {
  return sources[name] ?? sources["openfoodfacts"];
}
