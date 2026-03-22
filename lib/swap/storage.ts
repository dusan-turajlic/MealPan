export function swapKey(
  profileId: string,
  mealId: string,
  optionId: string,
  barcode: string
): string {
  return `${profileId}:${mealId}:${optionId}:${barcode}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function purgeStaleSwaps(): void {
  const today = todayISO();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && /^meal-plan-swaps-/.test(key)) {
      try {
        const stored = JSON.parse(localStorage.getItem(key) ?? '{}') as { date?: string };
        if (stored.date !== today) keysToRemove.push(key);
      } catch {
        keysToRemove.push(key);
      }
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function loadSwaps(planName: string): Record<string, string> {
  purgeStaleSwaps();
  try {
    const raw = localStorage.getItem(`meal-plan-swaps-${planName}`);
    if (!raw) return {};
    const stored = JSON.parse(raw) as { date: string; swaps: Record<string, string> };
    return stored.swaps ?? {};
  } catch {
    return {};
  }
}

export function saveSwaps(planName: string, swaps: Record<string, string>): void {
  localStorage.setItem(
    `meal-plan-swaps-${planName}`,
    JSON.stringify({ date: todayISO(), swaps })
  );
}
