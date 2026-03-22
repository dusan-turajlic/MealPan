'use client';

import { createContext, useContext } from 'react';
import type { ResolvedIngredient } from '@/lib/types';

export type SwappableCategory = 'protein' | 'carb' | 'fat';
export type CategoryPool = Map<SwappableCategory, ResolvedIngredient[]>;

export interface SwapContextValue {
  swaps: Record<string, string>;
  categoryPool: CategoryPool;
  onSwap: (key: string, replacementBarcode: string) => void;
  onReset: (key: string) => void;
}

export const SwapContext = createContext<SwapContextValue | null>(null);

export function useSwap(): SwapContextValue {
  const ctx = useContext(SwapContext);
  if (!ctx) throw new Error('useSwap must be used within SwapContext.Provider');
  return ctx;
}
