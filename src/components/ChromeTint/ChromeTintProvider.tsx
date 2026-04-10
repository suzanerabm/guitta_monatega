'use client';
import { createContext, useContext, useState, useCallback } from 'react';

interface ChromeTintContextValue {
  tintColor: string | null;
  setTintColor: (color: string | null) => void;
}

const ChromeTintContext = createContext<ChromeTintContextValue | null>(null);

export function useChromeTint() {
  const ctx = useContext(ChromeTintContext);
  if (!ctx) {
    // Return a no-op when no provider — keeps Header usable on pages
    // that don't have a FilterBar
    return { tintColor: null as string | null, setTintColor: () => {} };
  }
  return ctx;
}

/**
 * Provides a shared "chrome tint" color for the Header and FilterBar to
 * coordinate. When a colored filter is active, the FilterBar pushes its
 * bgColor here so the Header background can match.
 */
export function ChromeTintProvider({ children }: { children: React.ReactNode }) {
  const [tintColor, setTintState] = useState<string | null>(null);
  const setTintColor = useCallback((color: string | null) => {
    setTintState(color);
  }, []);

  return (
    <ChromeTintContext.Provider value={{ tintColor, setTintColor }}>
      {children}
    </ChromeTintContext.Provider>
  );
}
