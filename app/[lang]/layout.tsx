import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/locales";
import { translations } from "@/lib/i18n/translations";
import { I18nProvider } from "@/lib/i18n/context";
import UpdateBanner from "@/components/UpdateBanner";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "sv" }, { lang: "hr" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  return (
    <I18nProvider translations={translations[lang]} locale={lang}>
      {children}
      <UpdateBanner />
    </I18nProvider>
  );
}
