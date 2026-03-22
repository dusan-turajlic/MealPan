import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/locales";
import { translations } from "@/lib/i18n/translations";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const t = translations[lang];

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold text-ink">{t.homeHeading}</h1>
      <p className="text-dim text-center max-w-sm">{t.homeDescription}</p>
      <Link
        href={`/${lang}/meals/plans/8e3f1a7c-4b2d-4f9a-bc0e-5d6a2f8c1b3e`}
        className="rounded-xl bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent/90 transition-colors"
      >
        {t.openDemoPlan}
      </Link>
    </main>
  );
}
