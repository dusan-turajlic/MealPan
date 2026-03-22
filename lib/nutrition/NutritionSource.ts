import type { ResolvedNutrition, ProductDetail } from "../types";

export interface NutritionSource {
  fetchNutrition(id: string, fallbackName: string): Promise<ResolvedNutrition>;
  fetchDetail(id: string): Promise<ProductDetail>;
  readonly label: string; // e.g. "OpenFoodFacts" | "Fineli" — used in modal footer
}
