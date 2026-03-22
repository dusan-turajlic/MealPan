"use client";

import { ResolvedMealOption, ResolvedIngredient } from "@/lib/types";
import { useSwap, SwappableCategory } from "@/lib/swap/context";
import { swapKey } from "@/lib/swap/storage";
import { sumMacros } from "@/lib/calculateMacros";
import IngredientRow from "./IngredientRow";
import MacroBar from "./MacroBar";

interface Props {
  option: ResolvedMealOption;
  exact: boolean;
  profileId: string;
  mealId: string;
}

export default function OptionDetail({ option, exact, profileId, mealId }: Props) {
  const { swaps, categoryPool, onSwap, onReset } = useSwap();

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
            ? (categoryPool.get(cat as SwappableCategory) ?? []).filter(
                (r) => r.source.barcode !== effective.source.barcode
              )
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
