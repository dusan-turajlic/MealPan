'use client';

import { ResolvedMealOption } from '@/lib/types';
import { useT } from '@/lib/i18n/context';

interface Props {
  options: ResolvedMealOption[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  onClose: () => void;
}

export default function MealOptionPicker({ options, selectedIndex, onSelect, onClose }: Props) {
  const t = useT();

  function handleSelect(i: number) {
    onSelect(i);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full bg-surface rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-rule flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-ink">{t.mealOptionPickerTitle}</span>
          <button
            onClick={onClose}
            className="text-dim hover:text-ink transition-colors p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full px-4 py-3 flex items-center justify-between border-b border-rule last:border-0 text-left transition-colors ${
                i === selectedIndex ? 'bg-lift' : 'hover:bg-lift'
              }`}
            >
              <span className="text-sm font-medium text-ink">{option.label}</span>
              <span className="text-sm text-dim shrink-0 ml-3">{Math.round(option.totalMacros.kcal)} kcal</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
