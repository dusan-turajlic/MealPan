import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadPlan } from "@/lib/loadPlan";
import { fetchNutritionMap } from "@/lib/fetchNutritionMap";
import { MealPlanResolver } from "@/lib/MealPlanResolver";
import { MeasurementFormatterFactory } from "@/lib/formatters/MeasurementFormatter";
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
  const nutritionMap = await fetchNutritionMap(plan);

  const exact = plan.exact ?? false;
  const formatter = MeasurementFormatterFactory.create(exact, lang);
  const resolver = new MealPlanResolver(plan, nutritionMap, formatter);
  const resolved = resolver.resolve();

  return <MealPlanClient plan={resolved} name={name} lang={lang} />;
}
