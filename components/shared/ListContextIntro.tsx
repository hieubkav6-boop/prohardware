'use client';

import React from 'react';
import { useListContextIntro, type ListContextIntroItem } from '@/lib/experiences/useListContextIntro';

type ListContextIntroProps = {
  accentColor?: string;
  centered?: boolean;
  className?: string;
  enabled?: boolean;
  isDark?: boolean;
  items: ListContextIntroItem[];
  showCount?: boolean;
  totalCount?: number | null;
  unit?: string;
};

export function ListContextIntro({
  accentColor = '#3b82f6',
  centered = true,
  className = '',
  enabled = true,
  isDark = false,
  items,
  showCount = false,
  totalCount,
  unit,
}: ListContextIntroProps) {
  const contextIntro = useListContextIntro(items, { totalCount, unit });

  if (!enabled || !contextIntro.hasContext) {
    return null;
  }

  return (
    <div className={`-mt-4 mb-5 ${centered ? 'text-center' : 'text-left'} ${className}`}>
      <div
        role="note"
        aria-label="Ngữ cảnh danh sách"
        className={`inline-flex max-w-4xl flex-wrap gap-1.5 text-xs ${
          centered ? 'items-center justify-center' : 'items-start justify-start'
        }`}
      >
        {contextIntro.visibleItems.map((item) => (
          <span
            key={`${item.label}-${item.value}`}
            className="inline-flex max-w-[220px] items-center gap-1 rounded-full px-2 py-0.5 font-medium"
            style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          >
            <span className="shrink-0 opacity-65">{item.label}</span>
            <span className="truncate">{item.value}</span>
          </span>
        ))}
        {showCount && contextIntro.countText && (
          <span className={`px-1.5 py-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-450'}`}>
            {contextIntro.countText}
          </span>
        )}
      </div>
    </div>
  );
}
