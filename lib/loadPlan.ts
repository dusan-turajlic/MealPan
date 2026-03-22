import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { MealPlanFile } from "./types";

const PLANS_DIR = path.join(process.cwd(), "public", "plans");

export function loadPlan(name: string): MealPlanFile {
  // Path traversal guard: only allow alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    notFound();
  }

  const filePath = path.join(PLANS_DIR, `${name}.json`);

  // Verify the resolved path is still within the plans directory
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(PLANS_DIR))) {
    notFound();
  }

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  let parsed: MealPlanFile;
  try {
    parsed = JSON.parse(raw) as MealPlanFile;
  } catch {
    notFound();
  }

  return parsed;
}
