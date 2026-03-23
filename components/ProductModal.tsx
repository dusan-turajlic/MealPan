"use client";

import { useEffect, useState } from "react";
import { useProductDetail } from "@/lib/productDetail/context";

interface Props {
  productId: string;
  nutritionSource: "openfoodfacts" | "fineli";
  fallbackName: string;
  onClose: () => void;
}

const sourceLabels: Record<string, string> = {
  openfoodfacts: "OpenFoodFacts",
  fineli: "Fineli",
};

const nutriscoreColors: Record<string, string> = {
  a: "bg-green-500 text-white",
  b: "bg-lime-400 text-black",
  c: "bg-yellow-400 text-black",
  d: "bg-orange-400 text-black",
  e: "bg-red-500 text-white",
};

const novaColors: Record<number, string> = {
  1: "bg-green-500 text-white",
  2: "bg-lime-400 text-black",
  3: "bg-orange-400 text-black",
  4: "bg-red-500 text-white",
};

export default function ProductModal({ productId, nutritionSource, fallbackName, onClose }: Props) {
  const detail = useProductDetail(productId);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const sourceLabel = sourceLabels[nutritionSource] ?? nutritionSource;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md bg-surface rounded-2xl shadow-xl max-h-[85dvh] overflow-y-auto transition-transform duration-200 ${
          visible ? "translate-y-0" : "translate-y-4"
        }`}
      >
        {!detail ? (
          <div className="flex items-center justify-center p-10">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !detail.available ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-ink">{fallbackName}</span>
              <button
                onClick={onClose}
                className="ml-2 p-1 text-faint hover:text-dim transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-dim">Product details unavailable.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-ink leading-snug">
                {detail.productName || fallbackName}
              </span>
              <button
                onClick={onClose}
                className="shrink-0 p-1 text-faint hover:text-dim transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Image */}
            {detail.imageUrl && (
              <img
                src={detail.imageUrl}
                alt={detail.productName || fallbackName}
                className="h-32 w-full object-contain rounded-lg bg-lift"
              />
            )}

            {/* Badges + brand/quantity */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {detail.nutriscoreGrade && (
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase ${
                    nutriscoreColors[detail.nutriscoreGrade] ?? "bg-lift text-dim"
                  }`}
                >
                  Nutri-Score {detail.nutriscoreGrade.toUpperCase()}
                </span>
              )}
              {detail.novaGroup && (
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    novaColors[detail.novaGroup] ?? "bg-lift text-dim"
                  }`}
                >
                  NOVA {detail.novaGroup}
                </span>
              )}
              {detail.brands && (
                <span className="text-dim">{detail.brands}</span>
              )}
              {detail.quantity && (
                <span className="text-faint">{detail.quantity}</span>
              )}
            </div>

            {/* Nutrition table per 100g */}
            <div>
              <h3 className="text-xs font-semibold text-dim uppercase tracking-wide mb-1">
                Per 100 g
              </h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-rule">
                  <NutrRow label="Energy" value={`${Math.round(detail.per100g.kcal)} kcal`} />
                  <NutrRow label="Protein" value={`${detail.per100g.protein.toFixed(1)} g`} />
                  <NutrRow label="Carbohydrates" value={`${detail.per100g.carbs.toFixed(1)} g`} indent={false} />
                  {detail.per100g.sugars != null && (
                    <NutrRow label="of which sugars" value={`${detail.per100g.sugars.toFixed(1)} g`} indent />
                  )}
                  <NutrRow label="Fat" value={`${detail.per100g.fat.toFixed(1)} g`} indent={false} />
                  {detail.per100g.saturatedFat != null && (
                    <NutrRow label="of which saturated" value={`${detail.per100g.saturatedFat.toFixed(1)} g`} indent />
                  )}
                  <NutrRow label="Fiber" value={`${detail.per100g.fiber.toFixed(1)} g`} />
                  <NutrRow label="Salt" value={`${detail.per100g.salt.toFixed(2)} g`} />
                </tbody>
              </table>
            </div>

            {/* Ingredients */}
            {detail.ingredientsText && (
              <div>
                <h3 className="text-xs font-semibold text-dim uppercase tracking-wide mb-1">
                  Ingredients
                </h3>
                <p className="text-xs text-faint leading-relaxed">{detail.ingredientsText}</p>
              </div>
            )}

            {/* Allergens */}
            {detail.allergens && (
              <div>
                <h3 className="text-xs font-semibold text-dim uppercase tracking-wide mb-1">
                  Allergens
                </h3>
                <p className="text-xs text-faint">{detail.allergens}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-1 border-t border-rule">
              <a
                href={detail.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline"
              >
                View on {sourceLabel} ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NutrRow({
  label,
  value,
  indent = false,
}: {
  label: string;
  value: string;
  indent?: boolean;
}) {
  return (
    <tr>
      <td className={`py-1 text-dim ${indent ? "pl-4" : ""}`}>{label}</td>
      <td className="py-1 text-right text-ink font-medium">{value}</td>
    </tr>
  );
}
