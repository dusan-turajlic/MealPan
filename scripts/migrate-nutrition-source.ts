/**
 * One-time migration: adds "nutritionSource": "openfoodfacts" to every
 * IngredientSource in public/plans/ that doesn't already have it.
 *
 * Run with: npx ts-node scripts/migrate-nutrition-source.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plansDir = path.join(__dirname, "..", "public", "plans");

const files = fs.readdirSync(plansDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const filePath = path.join(plansDir, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const plan = JSON.parse(raw);

  let changed = false;

  for (const profile of plan.profiles ?? []) {
    for (const meal of profile.meals ?? []) {
      for (const option of meal.options ?? []) {
        for (const ing of option.ingredients ?? []) {
          if (ing.source && !ing.source.nutritionSource) {
            ing.source.nutritionSource = "openfoodfacts";
            changed = true;
          }
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(plan, null, 2) + "\n", "utf-8");
    console.log(`Updated: ${file}`);
  } else {
    console.log(`Skipped (already migrated): ${file}`);
  }
}

console.log("Done.");
