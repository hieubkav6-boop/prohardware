import { useMemo } from 'react';

export type ListContextIntroItem = {
  label: string;
  value?: string | null;
};

type ListContextIntroOptions = {
  totalCount?: number | null;
  unit?: string;
};

export type ListContextIntroResult = {
  countText: string | null;
  hasContext: boolean;
  sentence: string;
  visibleItems: ListContextIntroItem[];
};

const normalizeText = (value?: string | null) => value?.trim().replace(/\s+/g, ' ') ?? '';

const lowerFirst = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toLocaleLowerCase('vi-VN') + value.slice(1);
};

const joinVietnamese = (segments: string[]) => {
  if (segments.length <= 1) return segments[0] ?? '';
  if (segments.length === 2) return `${segments[0]} và ${segments[1]}`;
  return `${segments.slice(0, -1).join(', ')} và ${segments[segments.length - 1]}`;
};

export function buildListContextIntro(
  items: ListContextIntroItem[],
  options: ListContextIntroOptions = {}
): ListContextIntroResult {
  const seen = new Set<string>();
  const visibleItems = items.reduce<ListContextIntroItem[]>((acc, item) => {
    const label = normalizeText(item.label);
    const value = normalizeText(item.value);
    if (!label || !value) return acc;

    const key = `${label.toLocaleLowerCase('vi-VN')}::${value.toLocaleLowerCase('vi-VN')}`;
    if (seen.has(key)) return acc;
    seen.add(key);
    acc.push({ label, value });
    return acc;
  }, []);

  const segments = visibleItems.map((item) => `${lowerFirst(item.label)} “${item.value}”`);
  const sentence = segments.length > 0 ? joinVietnamese(segments) : '';
  const countText = typeof options.totalCount === 'number'
    ? `${options.totalCount.toLocaleString('vi-VN')} ${options.unit ?? 'kết quả'}`
    : null;

  return {
    countText,
    hasContext: visibleItems.length > 0,
    sentence,
    visibleItems,
  };
}

export function useListContextIntro(
  items: ListContextIntroItem[],
  options: ListContextIntroOptions = {}
) {
  const { totalCount, unit } = options;

  return useMemo(
    () => buildListContextIntro(items, { totalCount, unit }),
    [items, totalCount, unit]
  );
}
