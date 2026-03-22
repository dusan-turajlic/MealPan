"use client";

import { MacroValues } from "@/lib/types";
import { useT } from "@/lib/i18n/context";

interface Props {
  macros: MacroValues;
  compact?: boolean;
}

export default function MacroBar({ macros, compact = false }: Props) {
  const t = useT();
  const total = macros.protein + macros.carbs + macros.fat;

  const segments = [
    { key: "protein", value: macros.protein, color: "bg-protein", label: t.macroProtein },
    { key: "carbs", value: macros.carbs, color: "bg-carbs", label: t.macroCarbs },
    { key: "fat", value: macros.fat, color: "bg-fat", label: t.macroFat },
  ];

  const dotColors = ["bg-protein", "bg-carbs", "bg-fat"];

  if (!compact) {
    return (
      <div className="space-y-2">
        {/* Segmented bar */}
        <div className="flex h-2 rounded-full overflow-hidden bg-lift gap-px">
          {total > 0 &&
            segments.map((s) => (
              <div
                key={s.key}
                className={`${s.color} transition-all duration-300`}
                style={{ width: `${(s.value / total) * 100}%` }}
              />
            ))}
        </div>
        {/* Labels */}
        <div className="flex gap-3 text-xs text-dim">
          {segments.map((s) => (
            <span key={s.key}>
              <span className="font-medium text-ink">{Math.round(s.value)}g</span> {s.label}
            </span>
          ))}
          <span className="ml-auto font-medium text-ink">{Math.round(macros.kcal)} kcal</span>
        </div>
      </div>
    );
  }

  // Compact mode for daily totals bar
  return (
    <div className="flex gap-3 text-xs">
      {segments.map((s, i) => (
        <span key={s.key} className="flex items-center gap-1">
          <span className={`rounded-full w-1.5 h-1.5 shrink-0 ${dotColors[i]}`} />
          <span className="font-semibold text-ink">{Math.round(s.value)}</span>
          <span className="text-dim">g {s.label}</span>
        </span>
      ))}
      <span className="flex items-center gap-1 ml-1">
        <span className="font-semibold text-ink">{Math.round(macros.kcal)}</span>
        <span className="text-dim">kcal</span>
      </span>
    </div>
  );
}
