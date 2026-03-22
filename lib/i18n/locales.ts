export const LOCALES = ['en', 'sv', 'hr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export function isValidLocale(v: unknown): v is Locale {
  return LOCALES.includes(v as Locale);
}
