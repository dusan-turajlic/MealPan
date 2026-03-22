"use client";

import { useState } from "react";
import { InfoSection } from "@/lib/types";
import { useT } from "@/lib/i18n/context";

interface Props {
  sections: InfoSection[];
}

export default function InfoAccordion({ sections }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);

  if (sections.length === 0) return null;

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-ink hover:bg-accent/10 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="4.5" r="0.75" fill="currentColor" />
          </svg>
          {t.guidelinesTips}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 text-faint ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-rule border-t border-rule">
            {sections.map((section, i) => (
              <div key={i} className="px-4 py-3 space-y-1">
                <h4 className="text-sm font-semibold text-ink">{section.title}</h4>
                <p className="text-sm text-dim leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
