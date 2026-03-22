"use client";

import ErrorCard from "@/components/ErrorCard";
import { useT } from "@/lib/i18n/context";

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <ErrorCard
        title={t.planNotFoundTitle}
        message={t.planNotFoundMessage}
        backLabel={t.backToHome}
        backHref="/"
      />
    </div>
  );
}
