# Meal Plan PWA

A Next.js progressive web app for personal meal plans. Plans are defined in JSON, macros are fetched from [OpenFoodFacts](https://world.openfoodfacts.org/), and the UI is interactive and mobile-first.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/meals/plans/8e3f1a7c-4b2d-4f9a-bc0e-5d6a2f8c1b3e](http://localhost:3000/meals/plans/8e3f1a7c-4b2d-4f9a-bc0e-5d6a2f8c1b3e) to view the demo plan.

---

## JSON Schema

Plans live in `/public/plans/<name>.json`. Use UUID filenames in production for obscurity.

```jsonc
{
  "version": 1,                         // Required. Always 1.
  "description": "My Meal Plan",        // Optional. Shown as the page title.
  "exact": true,                        // Optional. true = exact mode (bodybuilder/prep).
                                        // false/absent = rough mode (casual lifestyle).
  "info": [                             // Optional. Collapsible tips section.
    {
      "title": "Eating Out",
      "body": "Choose grilled meat or fish with salad. Avoid sauces."
    }
  ],
  "profiles": [                         // Required. At least one profile.
    {
      "id": "weekdays",                 // Unique identifier.
      "label": "Weekdays",             // Display label for the tab.
      "meals": [
        {
          "id": "breakfast",
          "label": "Breakfast",
          "options": [
            {
              "id": "oats",
              "label": "Oats",
              "ingredients": [
                {
                  "source": {
                    "barcode": "6415600540025",   // OpenFoodFacts barcode.
                    "name": "Oats",               // Fallback name if OFF lookup fails.
                    "category": "carb",           // "protein" | "carb" | "fat" | "mixed"
                    "packageSizeG": 500,          // Optional. Package weight in grams.
                    "gPerDl": 40                  // Optional. Density for dl conversion.
                  },
                  "amount": 80,                   // Quantity in the specified unit.
                  "unit": "g"                     // "g" | "dl" | "ml" | "kpl" | custom
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Profiles

Use profiles to separate different eating patterns:

| `id` | `label` | Use case |
|---|---|---|
| `weekdays` | Arkipäivät | Structured weekday eating |
| `weekends` | Viikonloput | More relaxed weekend eating |
| `cutting` | Dieetti | Caloric deficit phase |
| `bulking` | Massa | Caloric surplus phase |

If there is only one profile, the tab bar is hidden automatically.

---

## Info Sections

The `info` array populates a collapsible accordion (ⓘ button) at the top of the plan. Use it for mindset tips, eating-out guidance, or any client-facing notes.

```jsonc
"info": [
  {
    "title": "Vegetables First",
    "body": "Always start your meal with vegetables. This slows eating, increases satiety, and improves nutrient absorption."
  },
  {
    "title": "Protein at Every Meal",
    "body": "Aim for 30–40 g protein per meal to maximise muscle protein synthesis."
  }
]
```

---

## Exact vs. Rough Mode

| | `exact: true` | `exact: false` (default) |
|---|---|---|
| **Target audience** | Bodybuilders, prep clients with scales | Casual lifestyle clients |
| **Amount display** | `80 g`, `2 dl` | `½ pakettia`, `1.5 dl` |

### How rough mode works

**Package fractions** — if `packageSizeG` is set, the amount is expressed as the nearest common fraction of the package (within 7% tolerance):

```
amount = 250 g, packageSizeG = 500 g → 250/500 = 0.5 → "½ pakettia"
amount = 167 g, packageSizeG = 500 g → 0.334 → "⅓ pakettia"
```

**dl fallback** — if the fraction is too fine but `gPerDl` is set, the amount is shown in decilitres rounded to the nearest 0.5:

```
amount = 80 g, gPerDl = 40 → 2.0 dl → "2 dl"
amount = 70 g, gPerDl = 40 → 1.75 dl → "2 dl" (rounded to nearest 0.5)
```

**Last resort** — if neither `packageSizeG` nor `gPerDl` is set, grams are shown.

### `packageSizeG` and `gPerDl`

| Field | Description | Example |
|---|---|---|
| `packageSizeG` | Total package weight in grams | `500` for a 500 g bag of oats |
| `gPerDl` | Grams per decilitre (density) | `40` for rolled oats, `85` for dry rice |

---

## Finding Finnish Product Barcodes

1. Open [world.openfoodfacts.org](https://world.openfoodfacts.org)
2. Search for the product name
3. Open the product page — the barcode is in the URL: `/product/6415600540025/`
4. Or use the OFF mobile app to scan the physical product

---

## Accessing a Plan

```
/meals/plans/<name>
```

The `<name>` corresponds to the filename without `.json`. In production, use UUID filenames:

```
/meals/plans/550e8400-e29b-41d4-a716-446655440000
```

---

## Macro Calculation

Macros are fetched from OpenFoodFacts per 100 g and scaled to the serving amount:

```
serving_kcal    = per100g_kcal    × amount_g / 100
serving_protein = per100g_protein × amount_g / 100
serving_carbs   = per100g_carbs   × amount_g / 100
serving_fat     = per100g_fat     × amount_g / 100
```

Results are cached for 24 hours (`next: { revalidate: 86400 }`). If a barcode is not found, "Ei ravintoarvoja" is shown and macros are treated as 0.

---

## PWA Installation on iPhone

1. Open the plan URL in Safari
2. Tap the **Share** button (□↑)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

The app launches in standalone mode with `viewport-fit=cover` so it fills the entire screen including the notch and home-bar area.

---

## Design Patterns

| Pattern | Location | Purpose |
|---|---|---|
| **Strategy** | `lib/formatters/MeasurementFormatter.ts` | Swap exact/rough formatting without changing resolver or components |
| **Factory Method** | `lib/formatters/MeasurementFormatter.ts` | `MeasurementFormatterFactory.create(exact)` selects the right strategy |
| **Adapter** | `lib/openfoodfacts.ts` | Maps raw OFF API shape to internal `ResolvedNutrition` type |
| **Null Object** | `lib/openfoodfacts.ts` | Unavailable products return valid zero-macro objects instead of null |
| **Builder** | `lib/MealPlanResolver.ts` | Isolates the multi-step resolution of `MealPlanFile → ResolvedMealPlan` |
