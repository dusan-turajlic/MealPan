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
        href={`/${lang}/meals/plans/1fa292c5-2aad-4fee-b82b-bdcc3e060aa2`}
        className="rounded-xl bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent/90 transition-colors"
      >
        {t.openDemoPlan}
      </Link>
    </main>
  );
}
