import { IngredientSource } from "../types";

// PATTERN: Strategy — MeasurementFormatter interface allows swapping formatting
// logic at runtime without changing the resolver or components.
export interface MeasurementFormatter {
  format(amount: number, unit: string, source: IngredientSource): string;
}

export class ExactFormatter implements MeasurementFormatter {
  format(amount: number, unit: string): string {
    return `${amount} ${unit}`;
  }
}

// Common fractions to snap to
const FRACTIONS = [
  { value: 1 / 8, label: "⅛" },
  { value: 1 / 6, label: "⅙" },
  { value: 1 / 5, label: "⅕" },
  { value: 1 / 4, label: "¼" },
  { value: 1 / 3, label: "⅓" },
  { value: 3 / 8, label: "⅜" },
  { value: 1 / 2, label: "½" },
  { value: 2 / 3, label: "⅔" },
  { value: 3 / 4, label: "¾" },
  { value: 1, label: "1" },
];

const TOLERANCE = 0.07;

const PACK_WORDS: Record<string, { singular: string; plural: string; pcs: string }> = {
  en: { singular: 'pack', plural: 'of a pack', pcs: 'pcs' },
  sv: { singular: 'förpackning', plural: 'förpackning', pcs: 'st' },
  hr: { singular: 'pakiranje', plural: 'pakiranja', pcs: 'kom' },
};

export class RoughFormatter implements MeasurementFormatter {
  private words: { singular: string; plural: string; pcs: string };

  constructor(locale = 'en') {
    this.words = PACK_WORDS[locale] ?? PACK_WORDS.en;
  }

  format(amount: number, unit: string, source: IngredientSource): string {
    // If the unit is already dl/ml, just show it rounded
    if (unit === "dl") {
      return `${Math.round(amount * 2) / 2} dl`;
    }
    if (unit === "ml") {
      return `${Math.round(amount / 50) * 50} ml`;
    }
    if (unit === "kpl") {
      return `${Math.round(amount)} ${this.words.pcs}`;
    }
    if (unit === "msk" || unit === "tsk") {
      return `${Math.round(amount)} ${unit}`;
    }

    // unit === "g" — try package fraction first
    if (source.packageSizeG) {
      const frac = amount / source.packageSizeG;
      const match = FRACTIONS.find((f) => Math.abs(frac - f.value) <= TOLERANCE);
      if (match) {
        return match.value === 1
          ? `1 ${this.words.singular}`
          : `${match.label} ${this.words.plural}`;
      }
    }

    // Fallback: convert to dl if density known
    if (source.gPerDl) {
      const dl = amount / source.gPerDl;
      return `${Math.round(dl * 2) / 2} dl`;
    }

    // Last resort: show grams
    return `${amount} g`;
  }
}

// PATTERN: Factory Method — callers get the right formatter without knowing
// which concrete class to instantiate. Adding a "cups" mode only requires
// a new class and a branch here.
export class MeasurementFormatterFactory {
  static create(exact: boolean, locale = 'en'): MeasurementFormatter {
    return exact ? new ExactFormatter() : new RoughFormatter(locale);
  }
}
