// ─── JSON file schema ─────────────────────────────────────────────────────────
export interface MealPlanFile {
  version: 1;
  description?: string;
  exact?: boolean; // true = exact mode (bodybuilder), false/absent = rough mode
  info?: InfoSection[]; // mindset / eating-out tips shown in collapsible section
  profiles: PlanProfile[]; // at least one (e.g. "weekdays", "weekends")
}

export interface InfoSection {
  title: string; // e.g. "Eating Out", "Vegetables First"
  body: string; // free-form markdown-ish text
}

export interface PlanProfile {
  id: string; // "weekdays", "weekends", "cutting", "bulking"
  label: string; // "Weekdays", "Weekends"
  meals: MealDefinition[];
}

export interface MealDefinition {
  id: string;
  label: string;
  options: MealOption[];
}

export interface MealOption {
  id: string;
  label: string;
  ingredients: Ingredient[];
}

export interface Ingredient {
  source: IngredientSource;
  amount: number; // in the specified unit
  unit: "g" | "dl" | "ml" | "kpl" | string;
}

export interface IngredientSource {
  barcode: string;
  name: string; // human-readable fallback
  category: "protein" | "carb" | "fat" | "mixed";
  nutritionSource?: "openfoodfacts" | "fineli";
  packageSizeG?: number; // total package weight in grams (for rough fraction display)
  gPerDl?: number; // density: grams per dl (for rough → dl fallback)
}

// ─── Resolved (after OFF fetch + macro calc) ─────────────────────────────────
export interface ResolvedNutrition {
  barcode: string;
  productName: string;
  per100g: MacroValues;
  available: boolean;
  nutritionSource: "openfoodfacts" | "fineli";
}

export interface ResolvedIngredient {
  source: IngredientSource;
  amount: number;
  unit: string;
  roughDisplay?: string; // e.g. "½ paketti", "1 dl" — only in rough mode
  nutrition: ResolvedNutrition;
  servingMacros: MacroValues;
}

export interface ResolvedMealOption {
  id: string;
  label: string;
  ingredients: ResolvedIngredient[];
  totalMacros: MacroValues;
}

export interface ResolvedMeal {
  id: string;
  label: string;
  options: ResolvedMealOption[];
}

export interface ResolvedProfile {
  id: string;
  label: string;
  meals: ResolvedMeal[];
  defaultDailyTotals: MacroValues;
}

export interface ResolvedMealPlan {
  description?: string;
  exact: boolean;
  info: InfoSection[]; // passed through as-is
  profiles: ResolvedProfile[]; // at least one
}

export interface MacroValues {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ProductDetail {
  available: boolean;
  productName: string;
  brands: string;
  quantity: string;
  imageUrl: string | null;
  nutriscoreGrade: 'a' | 'b' | 'c' | 'd' | 'e' | null;
  novaGroup: 1 | 2 | 3 | 4 | null;
  ingredientsText: string | null;
  allergens: string;
  sourceUrl: string;
  per100g: {
    kcal: number;
    protein: number;
    carbs: number;
    sugars?: number;
    fat: number;
    saturatedFat?: number;
    fiber: number;
    salt: number;
  };
}
