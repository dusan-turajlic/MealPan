"use client";

import { createContext, useContext, useRef, useState, useCallback } from "react";
import type { ProductDetail, ResolvedIngredient } from "@/lib/types";

type DetailStore = Map<string, ProductDetail>;

interface ContextValue {
  store: DetailStore;
  prefetch: (ingredients: ResolvedIngredient[]) => void;
}

const ProductDetailContext = createContext<ContextValue>({
  store: new Map(),
  prefetch: () => {},
});

export function useProductDetail(barcode: string): ProductDetail | undefined {
  return useContext(ProductDetailContext).store.get(barcode);
}

export function usePrefetchMealDetails() {
  return useContext(ProductDetailContext).prefetch;
}

export function ProductDetailProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<DetailStore>(new Map());
  // Tracks both in-flight and completed barcodes so we never fetch twice.
  const fetched = useRef<Set<string>>(new Set());

  const prefetch = useCallback((ingredients: ResolvedIngredient[]) => {
    for (const ing of ingredients) {
      const { barcode } = ing.source;
      if (!ing.nutrition.available) continue;
      if (fetched.current.has(barcode)) continue;

      fetched.current.add(barcode);
      const source = ing.source.nutritionSource ?? "openfoodfacts";

      fetch(`/api/${source}/${barcode}`)
        .then((r) => r.json() as Promise<ProductDetail>)
        .then((detail) => {
          setStore((prev) => new Map(prev).set(barcode, detail));
        })
        .catch(() => {
          // Allow retry on next mount by removing from the tracker.
          fetched.current.delete(barcode);
        });
    }
  }, []);

  return (
    <ProductDetailContext.Provider value={{ store, prefetch }}>
      {children}
    </ProductDetailContext.Provider>
  );
}
