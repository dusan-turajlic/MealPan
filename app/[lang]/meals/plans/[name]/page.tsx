import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadPlan } from "@/lib/loadPlan";
import { getNutritionSource } from "@/lib/nutrition/registry";
import type { OpenFoodFactsSource } from "@/lib/nutrition/OpenFoodFactsSource";
import { MealPlanResolver } from "@/lib/MealPlanResolver";
import { MeasurementFormatterFactory } from "@/lib/formatters/MeasurementFormatter";
import { ResolvedNutrition } from "@/lib/types";
import MealPlanClient from "@/components/MealPlanClient";
import { isValidLocale } from "@/lib/i18n/locales";

interface Props {
  params: Promise<{ lang: string; name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, name } = await params;
  const path = `/${lang}/meals/plans/${name}`;
  return {
    manifest: `/api/manifest?path=${encodeURIComponent(path)}`,
  };
}

export default async function MealPlanPage({ params }: Props) {
  const { lang, name } = await params;

  if (!isValidLocale(lang)) notFound();

  const plan = loadPlan(name);

  // Collect unique ingredients grouped by nutrition source
  const offItems: { barcode: string; fallbackName: string }[] = [];
  const otherItems: { barcode: string; fallbackName: string; source: string }[] = [];
  const seen = new Set<string>();

  for (const profile of plan.profiles) {
    for (const meal of profile.meals) {
      for (const option of meal.options) {
        for (const ing of option.ingredients) {
          if (seen.has(ing.source.barcode)) continue;
          seen.add(ing.source.barcode);
          const src = ing.source.nutritionSource ?? "openfoodfacts";
          if (src === "openfoodfacts") {
            offItems.push({ barcode: ing.source.barcode, fallbackName: ing.source.name });
          } else {
            otherItems.push({ barcode: ing.source.barcode, fallbackName: ing.source.name, source: src });
          }
        }
      }
    }
  }

  // Batch-fetch all OFF barcodes in one request; fetch other sources in parallel.
  const off = getNutritionSource("openfoodfacts") as OpenFoodFactsSource;
  const [offMap, otherResults] = await Promise.all([
    off.fetchNutritionBatch(offItems),
    Promise.all(
      otherItems.map(({ barcode, fallbackName, source }) =>
        getNutritionSource(source).fetchNutrition(barcode, fallbackName)
      )
    ),
  ]);

  const nutritionMap = new Map<string, ResolvedNutrition>(offMap);
  otherResults.forEach((r) => nutritionMap.set(r.barcode, r));

  const exact = plan.exact ?? false;
  const formatter = MeasurementFormatterFactory.create(exact, lang);
  const resolver = new MealPlanResolver(plan, nutritionMap, formatter);
  const resolved = resolver.resolve();

  return <MealPlanClient plan={resolved} name={name} />;
}
