import { MealPlanFile, ResolvedNutrition, IngredientSource } from "./types";

export interface ShoppingItem {
  barcode: string;
  name: string;
  imageUrl: string | null;
  fallbackEmoji?: string;
  nutritionSource: string;
  totalAmountG: number;
  packagesNeeded?: number;
  packageSizeG?: number;
  category: string;
  displayAmount: string;
  displaySubtitle?: string;
}

const CATEGORY_ORDER: Record<string, number> = {
  protein: 0,
  carb: 1,
  fat: 2,
  mixed: 3,
};

function toGrams(amount: number, unit: string, source: IngredientSource): number {
  if (unit === "g") return amount;
  if (unit === "dl" && source.gPerDl) return amount * source.gPerDl;
  if (unit === "ml") return amount;
  if (unit === "kpl" && source.packageSizeG) return amount * source.packageSizeG;
  if (unit === "msk") return amount * 15;
  if (unit === "tsk") return amount * 5;
  return amount;
}

function formatAmount(totalAmountG: number, packageSizeG?: number): { display: string; subtitle?: string } {
  if (packageSizeG) {
    const packs = Math.ceil(totalAmountG / packageSizeG);
    return {
      display: `${packs} pack${packs !== 1 ? "s" : ""}`,
      subtitle: `~${Math.round(totalAmountG)} g total`,
    };
  }
  if (totalAmountG >= 1000) {
    return { display: `${(totalAmountG / 1000).toFixed(1)} kg` };
  }
  return { display: `${Math.round(totalAmountG)} g` };
}

export function buildShoppingList(
  plan: MealPlanFile,
  nutritionMap: Map<string, ResolvedNutrition>
): ShoppingItem[] {
  const multiProfile = plan.profiles.length > 1;

  // barcode → { totalAmountG, source, nutrition }
  const totals = new Map<string, { totalAmountG: number; source: IngredientSource; nutrition: ResolvedNutrition | undefined }>();

  for (const profile of plan.profiles) {
    let daysPerWeek: number;
    if (profile.days && profile.days.length > 0) {
      daysPerWeek = profile.days.length;
    } else if (!multiProfile) {
      daysPerWeek = 7;
    } else {
      // Multi-profile plan where this profile has no days defined — skip
      continue;
    }

    for (const meal of profile.meals) {
      // Use first option (default)
      const option = meal.options[0];
      if (!option) continue;

      for (const ing of option.ingredients) {
        const amountGPerDay = toGrams(ing.amount, ing.unit, ing.source);
        const weeklyG = amountGPerDay * daysPerWeek;
        const barcode = ing.source.barcode;

        const existing = totals.get(barcode);
        if (existing) {
          existing.totalAmountG += weeklyG;
        } else {
          totals.set(barcode, {
            totalAmountG: weeklyG,
            source: ing.source,
            nutrition: nutritionMap.get(barcode),
          });
        }
      }
    }
  }

  const items: ShoppingItem[] = [];
  for (const [barcode, entry] of totals) {
    const { source, nutrition, totalAmountG } = entry;
    const name = nutrition?.productName || source.name;
    const imageUrl = nutrition?.imageUrl ?? null;
    const { display, subtitle } = formatAmount(totalAmountG, source.packageSizeG);

    items.push({
      barcode,
      name,
      imageUrl,
      fallbackEmoji: source.fallbackEmoji,
      nutritionSource: source.nutritionSource ?? "openfoodfacts",
      totalAmountG,
      packagesNeeded: source.packageSizeG ? Math.ceil(totalAmountG / source.packageSizeG) : undefined,
      packageSizeG: source.packageSizeG,
      category: source.category,
      displayAmount: display,
      displaySubtitle: subtitle,
    });
  }

  items.sort((a, b) => {
    const catDiff = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });

  return items;
}
