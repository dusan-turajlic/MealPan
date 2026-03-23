"use client";

import { forwardRef, useEffect } from "react";
import { ResolvedMeal } from "@/lib/types";
import { usePrefetchMealDetails } from "@/lib/productDetail/context";
import OptionTabBar from "./OptionTabBar";
import OptionDetail from "./OptionDetail";

interface Props {
  meal: ResolvedMeal;
  profileId: string;
  selectedIndex: number;
  onSelect: (mealId: string, optionIndex: number) => void;
  exact: boolean;
}

const MealSection = forwardRef<HTMLDivElement, Props>(function MealSection(
  { meal, profileId, selectedIndex, onSelect, exact },
  ref
) {
  const prefetch = usePrefetchMealDetails();

  useEffect(() => {
    // Prefetch details for every ingredient across all options in this meal.
    // The context deduplicates — already-fetched barcodes are skipped.
    const all = meal.options.flatMap((o) => o.ingredients);
    prefetch(all);
  }, [meal, prefetch]);

  const activeOption = meal.options[selectedIndex] ?? meal.options[0];

  return (
    <div ref={ref} className="bg-surface border border-rule rounded-2xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">{meal.label}</h3>
        {activeOption && (
          <span className="text-sm font-medium text-dim">{Math.round(activeOption.totalMacros.kcal)} kcal</span>
        )}
      </div>

      <OptionTabBar
        options={meal.options}
        selectedIndex={selectedIndex}
        onSelect={(i) => onSelect(meal.id, i)}
      />

      {activeOption && (
        <OptionDetail
          option={activeOption}
          exact={exact}
          profileId={profileId}
          mealId={meal.id}
        />
      )}
    </div>
  );
});

export default MealSection;
