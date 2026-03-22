import { NextResponse } from "next/server";
import { getNutritionSource } from "@/lib/nutrition/registry";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  const detail = await getNutritionSource("openfoodfacts").fetchDetail(id);
  return NextResponse.json(detail);
}
