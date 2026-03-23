"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShoppingItem } from "@/lib/shopping";
import { useT } from "@/lib/i18n/context";

interface Props {
  items: ShoppingItem[];
  planName: string;
  description?: string;
  lang: string;
}

const STORAGE_KEY_PREFIX = "shopping-checked:";

export default function ShoppingListClient({ items, planName, description, lang }: Props) {
  const t = useT();
  const storageKey = `${STORAGE_KEY_PREFIX}${planName}`;
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setChecked(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, [storageKey]);

  const toggle = useCallback(
    (barcode: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(barcode)) next.delete(barcode);
        else next.add(barcode);
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {}
        return next;
      });
    },
    [storageKey]
  );

  const clearAll = useCallback(() => {
    setChecked(new Set());
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  const doneCount = checked.size;
  const totalCount = items.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm pt-2 pb-2 border-b border-rule mb-2 px-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${lang}/meals/plans/${planName}`}
            className="text-sm text-accent hover:underline shrink-0"
          >
            {t.shoppingListBack}
          </Link>
          <h1 className="text-lg font-bold text-ink truncate flex-1">
            {description ? `${description} – ${t.shoppingListTitle}` : t.shoppingListTitle}
          </h1>
          <span className="text-sm text-dim shrink-0">{doneCount}/{totalCount}</span>
          {doneCount > 0 && (
            <button onClick={clearAll} className="text-sm text-faint hover:text-dim shrink-0">
              {t.shoppingListReset}
            </button>
          )}
        </div>
        <div className="mt-2 h-1 rounded-full bg-rule overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* List */}
      <ul className="px-4 pb-8 space-y-1">
        {items.map((item) => {
          const isChecked = checked.has(item.barcode);
          return (
            <li key={item.barcode}>
              <button
                onClick={() => toggle(item.barcode)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface border border-rule active:scale-[0.99] transition-opacity"
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 shrink-0 rounded-lg bg-canvas flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={[
                        "w-full h-full object-contain p-0.5 transition-opacity",
                        isChecked ? "opacity-40" : "",
                      ].join(" ")}
                    />
                  ) : (
                    <span
                      className={["text-4xl select-none transition-opacity", isChecked ? "opacity-40" : ""].join(" ")}
                      role="img"
                      aria-label={item.name}
                    >
                      {item.fallbackEmoji ?? "🛒"}
                    </span>
                  )}
                </div>

                {/* Name + amount */}
                <div className="flex-1 min-w-0 text-left">
                  <p className={[
                    "text-sm font-semibold leading-tight truncate",
                    isChecked ? "line-through text-faint" : "text-ink",
                  ].join(" ")}>
                    {item.name}
                  </p>
                  <p className={["text-xs mt-0.5", isChecked ? "text-faint" : "text-dim"].join(" ")}>
                    {item.displayAmount}
                    {item.displaySubtitle && (
                      <span className="ml-1 text-faint">{item.displaySubtitle}</span>
                    )}
                  </p>
                </div>

                {/* Checkbox */}
                <div className={[
                  "w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                  isChecked
                    ? "bg-accent border-accent"
                    : "border-rule bg-canvas",
                ].join(" ")}>
                  {isChecked && (
                    <svg className="w-3 h-3 text-on-accent" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
