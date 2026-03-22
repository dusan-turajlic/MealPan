"use client";

import { MacroValues } from "@/lib/types";
import MacroBar from "./MacroBar";
import { useT } from "@/lib/i18n/context";

interface Props {
  macros: MacroValues;
  targets?: MacroValues;
}

export default function DailyTotalsBar({ macros, targets }: Props) {
  const t = useT();

  if (targets) {
    const segments = [
      { key: "protein", actual: Math.round(macros.protein), target: Math.round(targets.protein), label: t.macroProtein, dot: "bg-protein" },
      { key: "carbs", actual: Math.round(macros.carbs), target: Math.round(targets.carbs), label: t.macroCarbs, dot: "bg-carbs" },
      { key: "fat", actual: Math.round(macros.fat), target: Math.round(targets.fat), label: t.macroFat, dot: "bg-fat" },
    ];

    return (
      <div className="py-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-medium text-faint uppercase tracking-wide shrink-0">
            {t.dailyTotal}
          </span>
          <div className="flex gap-3 text-xs">
            {segments.map((s) => (
              <span key={s.key} className="flex items-center gap-1">
                <span className={`rounded-full w-1.5 h-1.5 shrink-0 ${s.dot}`} />
                <span className="font-semibold text-ink">{s.actual}/{s.target}g</span>
                <span className="text-dim">{s.label}</span>
              </span>
            ))}
            <span className="flex items-center gap-1 ml-1">
              <span className="font-semibold text-ink">{Math.round(macros.kcal)}</span>
              <span className="text-dim">kcal</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-medium text-faint uppercase tracking-wide shrink-0">
          {t.dailyTotal}
        </span>
        <MacroBar macros={macros} compact />
      </div>
    </div>
  );
}
