"use client";

interface Option {
  id: string;
  label: string;
}

interface Props {
  options: Option[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function OptionTabBar({ options, selectedIndex, onSelect }: Props) {
  if (options.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {options.map((opt, i) => (
        <button
          key={opt.id}
          onClick={() => onSelect(i)}
          className={`shrink-0 px-3 py-2.5 rounded-full text-xs font-medium transition-colors ${
            i === selectedIndex
              ? "bg-accent text-on-accent"
              : "bg-lift text-dim hover:bg-rule hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
