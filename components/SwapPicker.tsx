'use client';

import { ResolvedIngredient } from '@/lib/types';
import { useT } from '@/lib/i18n/context';

interface Props {
  current: ResolvedIngredient;
  original: ResolvedIngredient;
  alternatives: ResolvedIngredient[];
  isSwapped: boolean;
  onSelect: (barcode: string) => void;
  onClose: () => void;
}

export default function SwapPicker({
  current,
  original,
  alternatives,
  isSwapped,
  onSelect,
  onClose,
}: Props) {
  const t = useT();

  function handleSelect(barcode: string) {
    onSelect(barcode);
    onClose();
  }

  const rows: Array<{ ing: ResolvedIngredient; isOriginal: boolean }> = [];
  if (isSwapped) {
    rows.push({ ing: original, isOriginal: true });
  }
  for (const alt of alternatives) {
    rows.push({ ing: alt, isOriginal: false });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full bg-surface rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-rule flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-ink">{t.swapPickerTitle}</span>
          <button
            onClick={onClose}
            className="text-dim hover:text-ink transition-colors p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {rows.map(({ ing, isOriginal }) => {
            const isCurrent = ing.source.barcode === current.source.barcode;
            return (
              <button
                key={ing.source.barcode + (isOriginal ? '-original' : '')}
                onClick={() => handleSelect(isOriginal ? '' : ing.source.barcode)}
                className={`w-full px-4 py-3 flex items-center justify-between border-b border-rule last:border-0 text-left transition-colors ${
                  isCurrent ? 'bg-lift' : 'hover:bg-lift'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isOriginal && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-lift text-dim shrink-0">
                        {t.swapReset}
                      </span>
                    )}
                    <span className="text-sm font-medium text-ink truncate">
                      {ing.nutrition.available ? ing.nutrition.productName : ing.source.name}
                    </span>
                  </div>
                  <div className="text-xs text-dim mt-0.5">
                    {ing.amount} {ing.unit}
                  </div>
                </div>
                {ing.nutrition.available && (
                  <div className="text-right text-xs text-dim shrink-0 ml-3">
                    <div className="font-medium text-ink">{Math.round(ing.servingMacros.kcal)} kcal</div>
                    <div>
                      {Math.round(ing.servingMacros.protein)}{t.macroProtein} · {Math.round(ing.servingMacros.carbs)}{t.macroCarbs} · {Math.round(ing.servingMacros.fat)}{t.macroFat}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
