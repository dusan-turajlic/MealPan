"use client";

interface Profile {
  id: string;
  label: string;
}

interface Props {
  profiles: Profile[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function ProfileTabBar({ profiles, activeIndex, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none">
      {profiles.map((profile, i) => (
        <button
          key={profile.id}
          onClick={() => onSelect(i)}
          className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
            i === activeIndex
              ? "bg-[var(--color-pill-active-bg)] text-[var(--color-pill-active-text)]"
              : "bg-lift text-dim hover:bg-rule hover:text-ink"
          }`}
        >
          {profile.label}
        </button>
      ))}
    </div>
  );
}
