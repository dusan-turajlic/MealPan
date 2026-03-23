import { notFound } from "next/navigation";
import { loadPlan } from "@/lib/loadPlan";
import { fetchNutritionMap } from "@/lib/fetchNutritionMap";
import { buildShoppingList } from "@/lib/shopping";
import { isValidLocale } from "@/lib/i18n/locales";
import ShoppingListClient from "@/components/ShoppingList";

interface Props {
  params: Promise<{ lang: string; name: string }>;
}

export default async function ShoppingPage({ params }: Props) {
  const { lang, name } = await params;

  if (!isValidLocale(lang)) notFound();

  const plan = loadPlan(name);
  const nutritionMap = await fetchNutritionMap(plan);
  const items = buildShoppingList(plan, nutritionMap);

  return (
    <ShoppingListClient
      items={items}
      planName={name}
      description={plan.description}
      lang={lang}
    />
  );
}
