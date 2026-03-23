"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/context";
import { ResolvedMealPlan, MacroValues, ResolvedIngredient } from "@/lib/types";
import { sumMacros } from "@/lib/calculateMacros";
import { loadSwaps, saveSwaps } from "@/lib/swap/storage";
import { SwapContext, CategoryPool, SwappableCategory } from "@/lib/swap/context";
import { ProductDetailProvider } from "@/lib/productDetail/context";
import ProfileTabBar from "./ProfileTabBar";
import InfoAccordion from "./InfoAccordion";
import DailyTotalsBar from "./DailyTotalsBar";
import MealSection from "./MealSection";
import ThemeToggle from "./ThemeToggle";

const DAY_START_MIN = 6 * 60;   // 06:00
const DAY_END_MIN   = 22 * 60;  // 22:00

function getInitialProfileIndex(profiles: ResolvedMealPlan["profiles"]): number {
  const today = new Date().getDay();
  const idx = profiles.findIndex(p => p.days?.includes(today));
  return idx >= 0 ? idx : 0;
}

function getCurrentMealIndex(mealCount: number): number {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin <= DAY_START_MIN) return 0;
  if (nowMin >= DAY_END_MIN)   return mealCount - 1;
  const slot = (nowMin - DAY_START_MIN) / (DAY_END_MIN - DAY_START_MIN);
  return Math.min(Math.floor(slot * mealCount), mealCount - 1);
}

interface Props {
  plan: ResolvedMealPlan;
  name: string;
  lang: string;
}

type SelectedOptions = Record<string, number>; // mealId → optionIndex

const SWAPPABLE: SwappableCategory[] = ['protein', 'carb', 'fat'];

export default function MealPlanClient({ plan, name, lang }: Props) {
  const t = useT();
  const [activeProfileIndex, setActiveProfileIndex] = useState(
    () => getInitialProfileIndex(plan.profiles)
  );
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const mealRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeProfile = plan.profiles[activeProfileIndex];

  useEffect(() => {
    setSwaps(loadSwaps(name));
  }, [name]);

  useEffect(() => {
    const meals = activeProfile.meals;
    if (meals.length === 0) return;
    const idx = getCurrentMealIndex(meals.length);
    const target = meals[idx];
    mealRefs.current[target.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryPool: CategoryPool = useMemo(() => {
    const pool = new Map<SwappableCategory, ResolvedIngredient[]>();
    const seen = new Map<SwappableCategory, Set<string>>();

    for (const meal of activeProfile.meals) {
      for (const option of meal.options) {
        for (const ing of option.ingredients) {
          const cat = ing.source.category as SwappableCategory;
          if (!SWAPPABLE.includes(cat)) continue;
          if (!pool.has(cat)) {
            pool.set(cat, []);
            seen.set(cat, new Set());
          }
          const catSeen = seen.get(cat)!;
          if (!catSeen.has(ing.source.barcode)) {
            catSeen.add(ing.source.barcode);
            pool.get(cat)!.push(ing);
          }
        }
      }
    }
    return pool;
  }, [activeProfile]);

  const handleProfileChange = useCallback(
    (index: number) => {
      setActiveProfileIndex(index);
      setSelectedOptions({});
      setSwaps({});
      saveSwaps(name, {});
    },
    [name]
  );

  const handleOptionSelect = useCallback((mealId: string, optionIndex: number) => {
    setSelectedOptions((prev) => ({ ...prev, [mealId]: optionIndex }));
  }, []);

  const handleSwap = useCallback(
    (key: string, replacementBarcode: string) => {
      setSwaps((prev) => {
        const next = { ...prev, [key]: replacementBarcode };
        saveSwaps(name, next);
        return next;
      });
    },
    [name]
  );

  const handleReset = useCallback(
    (key: string) => {
      setSwaps((prev) => {
        const next = { ...prev };
        delete next[key];
        saveSwaps(name, next);
        return next;
      });
    },
    [name]
  );

  const dailyTotals: MacroValues = useMemo(() => {
    return sumMacros(
      activeProfile.meals.map((meal) => {
        const optIndex = selectedOptions[meal.id] ?? 0;
        const option = meal.options[optIndex];
        if (!option) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        return sumMacros(
          option.ingredients.map((ing) => {
            const key = `${activeProfile.id}:${meal.id}:${option.id}:${ing.source.barcode}`;
            const replacementBarcode = swaps[key];
            if (replacementBarcode) {
              const cat = ing.source.category as SwappableCategory;
              const replacement = categoryPool
                .get(cat)
                ?.find((r) => r.source.barcode === replacementBarcode);
              if (replacement) return replacement.servingMacros;
            }
            return ing.servingMacros;
          })
        );
      })
    );
  }, [activeProfile, selectedOptions, swaps, categoryPool]);

  return (
    <ProductDetailProvider>
    <SwapContext.Provider
      value={{ swaps, categoryPool, onSwap: handleSwap, onReset: handleReset }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Sticky top section */}
        <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm pt-2 pb-1 space-y-2 border-b border-rule mb-4 px-4">
          {/* Plan header */}
          <div className="flex items-center justify-between gap-2">
            {plan.description && (
              <h1 className="text-lg font-bold text-ink truncate flex-1">{plan.description}</h1>
            )}
            <Link
              href={`/${lang}/meals/plans/${name}/shopping`}
              className="text-sm text-accent hover:underline shrink-0"
            >
              {t.shoppingListTitle}
            </Link>
            <ThemeToggle />
          </div>

          {/* Profile tabs */}
          {plan.profiles.length > 1 && (
            <ProfileTabBar
              profiles={plan.profiles}
              activeIndex={activeProfileIndex}
              onSelect={handleProfileChange}
            />
          )}

          {/* Daily totals */}
          <DailyTotalsBar macros={dailyTotals} targets={activeProfile.defaultDailyTotals} />
        </div>

        {/* Scrollable content */}
        <div className="px-4 pb-[50vh] space-y-4">
          {/* Info accordion */}
          {plan.info.length > 0 && <InfoAccordion sections={plan.info} />}

          {/* Meal sections */}
          {activeProfile.meals.map((meal) => (
            <MealSection
              ref={(el) => { mealRefs.current[meal.id] = el; }}
              key={meal.id}
              meal={meal}
              profileId={activeProfile.id}
              selectedIndex={selectedOptions[meal.id] ?? 0}
              onSelect={handleOptionSelect}
              exact={plan.exact}
            />
          ))}
        </div>
      </div>
    </SwapContext.Provider>
    </ProductDetailProvider>
  );
}
