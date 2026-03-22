"use client";

import { ResolvedMeal } from "@/lib/types";
import OptionTabBar from "./OptionTabBar";
import OptionDetail from "./OptionDetail";

interface Props {
  meal: ResolvedMeal;
  profileId: string;
  selectedIndex: number;
  onSelect: (mealId: string, optionIndex: number) => void;
  exact: boolean;
}

export default function MealSection({ meal, profileId, selectedIndex, onSelect, exact }: Props) {
  const activeOption = meal.options[selectedIndex] ?? meal.options[0];

  return (
    <div className="bg-surface border border-rule rounded-2xl p-5 space-y-3 shadow-sm">
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
}
