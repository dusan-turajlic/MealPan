"use client";

import { ResolvedMealOption, ResolvedIngredient, type MacroValues, type IngredientSource } from "@/lib/types";
import { useSwap, SwappableCategory } from "@/lib/swap/context";
import { swapKey } from "@/lib/swap/storage";
import { sumMacros } from "@/lib/calculateMacros";
import { RoughFormatter } from "@/lib/formatters/MeasurementFormatter";
import { useLocale } from "@/lib/i18n/context";
import IngredientRow from "./IngredientRow";
import MacroBar from "./MacroBar";

interface Props {
  option: ResolvedMealOption;
  exact: boolean;
  profileId: string;
  mealId: string;
}

const CATEGORY_MACRO: Record<SwappableCategory, keyof MacroValues> = {
  protein: 'protein',
  carb: 'carbs',
  fat: 'fat',
};

// Fraction values mirroring RoughFormatter (labels not needed here)
const FRACTIONS = [1/8, 1/6, 1/5, 1/4, 1/3, 3/8, 1/2, 2/3, 3/4, 1];

function snapAmount(amount: number, unit: string, source: IngredientSource): number {
  if (unit === 'kpl' || unit === 'msk' || unit === 'tsk') {
    return Math.round(amount);
  }
  if (unit === 'dl') {
    return Math.round(amount * 2) / 2;
  }
  if (unit === 'ml') {
    return Math.round(amount / 50) * 50;
  }
  // grams — snap to nearest package fraction if known
  if (source.packageSizeG) {
    const frac = amount / source.packageSizeG;
    const best = FRACTIONS.reduce((a, b) => Math.abs(b - frac) < Math.abs(a - frac) ? b : a);
    return Math.round(best * source.packageSizeG);
  }
  // grams with density — round to 0.5 dl equivalent
  if (source.gPerDl) {
    const roundedDl = Math.round((amount / source.gPerDl) * 2) / 2;
    return Math.round(roundedDl * source.gPerDl);
  }
  // plain grams — nearest 5g
  return Math.round(amount / 5) * 5;
}

function scaleToMatchMacro(
  original: ResolvedIngredient,
  alt: ResolvedIngredient,
  cat: SwappableCategory,
  formatter: RoughFormatter | null
): ResolvedIngredient | null {
  const macroKey = CATEGORY_MACRO[cat];
  const targetValue = original.servingMacros[macroKey];
  const altValue = alt.servingMacros[macroKey];
  if (!alt.nutrition.available || altValue <= 0) return alt;
  const rawAmount = alt.amount * (targetValue / altValue);
  const snappedAmount = snapAmount(rawAmount, alt.unit, alt.source);
  if (snappedAmount <= 0) return null;
  const f = snappedAmount / alt.amount;
  const scale = (n: number) => Math.round(n * f * 10) / 10;
  return {
    ...alt,
    amount: snappedAmount,
    roughDisplay: formatter?.format(snappedAmount, alt.unit, alt.source),
    servingMacros: {
      kcal: scale(alt.servingMacros.kcal),
      protein: scale(alt.servingMacros.protein),
      carbs: scale(alt.servingMacros.carbs),
      fat: scale(alt.servingMacros.fat),
    },
  };
}

export default function OptionDetail({ option, exact, profileId, mealId }: Props) {
  const { swaps, categoryPool, onSwap, onReset } = useSwap();
  const locale = useLocale();
  const roughFormatter = exact ? null : new RoughFormatter(locale);

  const effectiveIngredients = option.ingredients.map((ing) => {
    const key = swapKey(profileId, mealId, option.id, ing.source.barcode);
    const replacementBarcode = swaps[key];
    let effective: ResolvedIngredient = ing;
    let isSwapped = false;
    if (replacementBarcode) {
      const cat = ing.source.category as SwappableCategory;
      const replacement = categoryPool.get(cat)?.find((r) => r.source.barcode === replacementBarcode);
      if (replacement) {
        effective = replacement;
        isSwapped = true;
      }
    }
    return { key, original: ing, effective, isSwapped };
  });

  const totalMacros = sumMacros(effectiveIngredients.map(({ effective }) => effective.servingMacros));

  return (
    <div className="space-y-1">
      <div className="divide-y divide-slate-800">
        {effectiveIngredients.map(({ key, original, effective, isSwapped }) => {
          const cat = original.source.category;
          const isSwappable = cat === 'protein' || cat === 'carb' || cat === 'fat';
          const alternatives = isSwappable
            ? (categoryPool.get(cat as SwappableCategory) ?? [])
                .filter((r) => r.source.barcode !== effective.source.barcode)
                .map((r) => scaleToMatchMacro(original, r, cat as SwappableCategory, roughFormatter))
                .filter((r): r is ResolvedIngredient => r !== null)
            : [];

          return (
            <IngredientRow
              key={original.source.barcode + original.amount}
              ingredient={effective}
              exact={exact}
              isSwapped={isSwapped}
              alternatives={alternatives}
              originalIngredient={original}
              onSwap={(barcode: string) => onSwap(key, barcode)}
              onReset={() => onReset(key)}
            />
          );
        })}
      </div>
      <div className="pt-2">
        <MacroBar macros={totalMacros} />
      </div>
    </div>
  );
}
