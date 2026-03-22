import { MacroValues, ResolvedNutrition } from "./types";

export function calculateServingMacros(
  nutrition: ResolvedNutrition,
  amountG: number
): MacroValues {
  if (!nutrition.available || amountG <= 0) {
    return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  }
  const factor = amountG / 100;
  return {
    kcal: round(nutrition.per100g.kcal * factor),
    protein: round(nutrition.per100g.protein * factor),
    carbs: round(nutrition.per100g.carbs * factor),
    fat: round(nutrition.per100g.fat * factor),
  };
}

export function sumMacros(macros: MacroValues[]): MacroValues {
  return macros.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
