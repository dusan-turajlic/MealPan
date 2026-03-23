'use client';

import { createContext, useContext } from 'react';
import { Translations } from './translations';

interface I18nContextValue {
  translations: Translations;
  locale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  translations,
  locale,
  children,
}: {
  translations: Translations;
  locale: string;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ translations, locale }}>{children}</I18nContext.Provider>
  );
}

export function useT(): Translations {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx.translations;
}

export function useLocale(): string {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLocale must be used within I18nProvider');
  return ctx.locale;
}
