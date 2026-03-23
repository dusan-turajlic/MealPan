"use client";

import { useState } from "react";
import { ResolvedIngredient } from "@/lib/types";
import { useT } from "@/lib/i18n/context";
import ProductModal from "./ProductModal";
import SwapPicker from "./SwapPicker";

interface Props {
  ingredient: ResolvedIngredient;
  exact: boolean;
  isSwapped?: boolean;
  alternatives?: ResolvedIngredient[];
  originalIngredient?: ResolvedIngredient;
  onSwap?: (barcode: string) => void;
  onReset?: () => void;
}

export default function IngredientRow({
  ingredient,
  exact,
  isSwapped,
  alternatives,
  originalIngredient,
  onSwap,
  onReset,
}: Props) {
  const t = useT();
  const { source, amount, unit, roughDisplay, nutrition, servingMacros } = ingredient;
  const [modalOpen, setModalOpen] = useState(false);
  const [swapPickerOpen, setSwapPickerOpen] = useState(false);

  const displayAmount = exact ? `${amount} ${unit}` : (roughDisplay ?? `${amount} ${unit}`);

  const categoryLabel: Record<string, string> = {
    protein: t.categoryProtein,
    carb: t.categoryCarb,
    fat: t.categoryFat,
    mixed: t.categoryMixed,
  };

  const categoryClass: Record<string, string> = {
    protein: "bg-protein/10 text-protein",
    carb: "bg-carbs/10 text-carbs",
    fat: "bg-fat/10 text-fat",
    mixed: "bg-lift text-dim",
  };

  const badgeClass = categoryClass[source.category] ?? categoryClass.mixed;
  const badgeLabel = categoryLabel[source.category] ?? source.category;
  const canSwap = alternatives && alternatives.length > 0;

  return (
    <div className="flex items-start justify-between py-2 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink truncate">
            {source.name}
          </span>
          {nutrition.available && (
            <button
              onClick={() => setModalOpen(true)}
              className="ml-1 p-0.5 text-faint hover:text-dim transition-colors"
              aria-label="Product details"
            >
              ⓘ
            </button>
          )}
          {!nutrition.available && (
            <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-lift text-faint">
              {t.noNutritionalData}
            </span>
          )}
          <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${badgeClass}`}>
            {badgeLabel}
          </span>
          {canSwap && (
            <button
              onClick={() => setSwapPickerOpen(true)}
              className={`shrink-0 text-xs px-1.5 py-0.5 rounded transition-colors ${
                isSwapped
                  ? 'bg-accent/20 text-accent hover:bg-accent/30'
                  : 'bg-lift text-dim hover:text-ink'
              }`}
              aria-label={t.swapIngredient}
            >
              ⇄
            </button>
          )}
        </div>
        <div className="text-xs text-dim mt-0.5">{displayAmount}</div>
      </div>

      {nutrition.available && (
        <div className="text-right text-xs text-dim shrink-0">
          <div className="font-medium text-ink">{Math.round(servingMacros.kcal)} kcal</div>
          <div>
            {Math.round(servingMacros.protein)}{t.macroProtein} · {Math.round(servingMacros.carbs)}{t.macroCarbs} · {Math.round(servingMacros.fat)}{t.macroFat}
          </div>
        </div>
      )}

      {modalOpen && (
        <ProductModal
          productId={nutrition.barcode}
          nutritionSource={nutrition.nutritionSource}
          fallbackName={nutrition.productName}
          onClose={() => setModalOpen(false)}
        />
      )}

      {swapPickerOpen && canSwap && originalIngredient && (
        <SwapPicker
          current={ingredient}
          original={originalIngredient}
          alternatives={alternatives!}
          isSwapped={isSwapped ?? false}
          onSelect={(barcode) => {
            if (barcode === '') onReset?.();
            else onSwap?.(barcode);
          }}
          onClose={() => setSwapPickerOpen(false)}
        />
      )}
    </div>
  );
}
