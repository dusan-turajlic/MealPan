import {
  MealPlanFile,
  PlanProfile,
  MealDefinition,
  MealOption,
  Ingredient,
  IngredientSource,
  ResolvedMealPlan,
  ResolvedProfile,
  ResolvedMeal,
  ResolvedMealOption,
  ResolvedIngredient,
  ResolvedNutrition,
  MacroValues,
} from "./types";
import { MeasurementFormatter } from "./formatters/MeasurementFormatter";
import { calculateServingMacros, sumMacros } from "./calculateMacros";

// PATTERN: Builder — isolates the multi-step process of building a ResolvedMealPlan
// from a raw MealPlanFile + nutrition map. Each private method handles one level
// of the hierarchy, keeping the logic readable and independently testable.
export class MealPlanResolver {
  constructor(
    private plan: MealPlanFile,
    private nutritionMap: Map<string, ResolvedNutrition>,
    private formatter: MeasurementFormatter
  ) {}

  resolve(): ResolvedMealPlan {
    return {
      description: this.plan.description,
      exact: this.plan.exact ?? false,
      info: this.plan.info ?? [],
      profiles: this.plan.profiles.map((p) => this.resolveProfile(p)),
    };
  }

  private resolveProfile(profile: PlanProfile): ResolvedProfile {
    const meals = profile.meals.map((m) => this.resolveMeal(m));

    // Default daily totals = sum of first option of every meal
    const defaultDailyTotals = sumMacros(
      meals.map((m) => m.options[0]?.totalMacros ?? zeroed())
    );

    return {
      id: profile.id,
      label: profile.label,
      days: profile.days,
      meals,
      defaultDailyTotals,
    };
  }

  private resolveMeal(meal: MealDefinition): ResolvedMeal {
    return {
      id: meal.id,
      label: meal.label,
      options: meal.options.map((o) => this.resolveOption(o)),
    };
  }

  private resolveOption(option: MealOption): ResolvedMealOption {
    const ingredients = option.ingredients.map((i) => this.resolveIngredient(i));
    const totalMacros = sumMacros(ingredients.map((i) => i.servingMacros));
    return { id: option.id, label: option.label, ingredients, totalMacros };
  }

  private resolveIngredient(ing: Ingredient): ResolvedIngredient {
    const nutrition =
      this.nutritionMap.get(ing.source.barcode) ?? nullNutrition(ing.source);

    const amountG = toGrams(ing.amount, ing.unit, ing.source);
    const servingMacros = calculateServingMacros(nutrition, amountG);

    const roughDisplay =
      !this.plan.exact
        ? this.formatter.format(ing.amount, ing.unit, ing.source)
        : undefined;

    return {
      source: ing.source,
      amount: ing.amount,
      unit: ing.unit,
      roughDisplay,
      nutrition,
      servingMacros,
    };
  }
}

function toGrams(amount: number, unit: string, source: IngredientSource): number {
  if (unit === "g") return amount;
  if (unit === "dl" && source.gPerDl) return amount * source.gPerDl;
  if (unit === "ml") return amount;
  if (unit === "kpl" && source.packageSizeG) return amount * source.packageSizeG;
  if (unit === "msk") return amount * 15; // 1 tablespoon ≈ 15 ml ≈ 15 g
  if (unit === "tsk") return amount * 5;  // 1 teaspoon ≈ 5 ml ≈ 5 g
  return amount;
}

function zeroed(): MacroValues {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
}

function nullNutrition(source: IngredientSource): ResolvedNutrition {
  return {
    barcode: source.barcode,
    productName: source.name,
    per100g: zeroed(),
    available: false,
    nutritionSource: source.nutritionSource ?? "openfoodfacts",
    imageUrl: null,
  };
}
