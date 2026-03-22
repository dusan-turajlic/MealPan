import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadPlan } from "@/lib/loadPlan";
import { getNutritionSource } from "@/lib/nutrition/registry";
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

  // Collect unique sources across all profiles, meals, options, ingredients
  const sourceMap = new Map<string, { name: string; nutritionSource: string }>(); // barcode → {name, source}
  for (const profile of plan.profiles) {
    for (const meal of profile.meals) {
      for (const option of meal.options) {
        for (const ing of option.ingredients) {
          if (!sourceMap.has(ing.source.barcode)) {
            sourceMap.set(ing.source.barcode, {
              name: ing.source.name,
              nutritionSource: ing.source.nutritionSource ?? "openfoodfacts",
            });
          }
        }
      }
    }
  }

  // Fetch nutrition for all unique barcodes in parallel
  const entries = [...sourceMap.entries()];
  const nutritionResults = await Promise.all(
    entries.map(([barcode, { name, nutritionSource }]) =>
      getNutritionSource(nutritionSource).fetchNutrition(barcode, name)
    )
  );

  const nutritionMap = new Map<string, ResolvedNutrition>();
  nutritionResults.forEach((r) => nutritionMap.set(r.barcode, r));

  const exact = plan.exact ?? false;
  const formatter = MeasurementFormatterFactory.create(exact, lang);
  const resolver = new MealPlanResolver(plan, nutritionMap, formatter);
  const resolved = resolver.resolve();

  return <MealPlanClient plan={resolved} name={name} />;
}
