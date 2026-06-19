'use client';

import { useEffect, useRef, useState } from 'react';

export type SnapshotResolvedTheme = 'light' | 'dark';

type PreviousDocumentTheme = {
  colorScheme: string;
  dataTheme: string | null;
  hasDarkClass: boolean;
};

export const resolveSnapshotTheme = (mode: unknown): SnapshotResolvedTheme => {
  if (mode === 'dark') {return 'dark';}
  if (mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export function useSnapshotTheme(mode: unknown) {
  const [theme, setTheme] = useState<SnapshotResolvedTheme>(() => resolveSnapshotTheme(mode));

  useEffect(() => {
    setTheme(resolveSnapshotTheme(mode));
    if (mode !== 'system') {return;}
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(resolveSnapshotTheme(mode));
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  return [theme, setTheme] as const;
}

export function useSnapshotDocumentTheme(theme: SnapshotResolvedTheme, enabled = true) {
  const previousThemeRef = useRef<PreviousDocumentTheme | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {return;}
    const root = document.documentElement;
    previousThemeRef.current = {
      colorScheme: root.style.colorScheme,
      dataTheme: root.getAttribute('data-theme'),
      hasDarkClass: root.classList.contains('dark'),
    };

    return () => {
      const previous = previousThemeRef.current;
      if (!previous) {return;}
      if (previous.dataTheme) {
        root.setAttribute('data-theme', previous.dataTheme);
      } else {
        root.removeAttribute('data-theme');
      }
      root.style.colorScheme = previous.colorScheme;
      root.classList.toggle('dark', previous.hasDarkClass);
      window.dispatchEvent(new Event('site-theme-change'));
      previousThemeRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {return;}
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    root.classList.toggle('dark', theme === 'dark');
    window.dispatchEvent(new Event('site-theme-change'));
  }, [enabled, theme]);
}
