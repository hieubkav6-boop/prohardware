'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/app/admin/components/ui';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColors } from '@/components/site/hooks';
import { useSiteSettings } from '@/components/site/hooks';
import { useSnapshotDemoContext } from '@/components/modules/homepage/SnapshotDemoProvider';
import { resolveTypeOverrideColors, type ColorOverrideState } from '@/app/admin/home-components/_shared/lib/typeColorOverride';
import { resolveTypeOverrideFont, type FontOverrideState } from '@/app/admin/home-components/_shared/lib/typeFontOverride';
import { getSectionSpacingClassName, normalizeSectionSpacing } from '@/app/admin/home-components/_shared/types/sectionSpacing';
import { getHomepageCategoryHeroColors } from '@/app/admin/home-components/homepage-category-hero/_lib/colors';
import { homeComponentRegistry } from './registry';
import type { HomeComponentRecord } from './types';

const LegacyComponentRenderer = dynamic(
  () => import('@/components/site/ComponentRenderer').then((mod) => ({ default: mod.ComponentRenderer })),
  { ssr: false, loading: () => null }
);

/** Shared system data có thể được lift lên parent để tránh N×3 subscriptions */
export interface SharedSystemData {
  systemConfig: {
    typeColorOverrides: Record<string, ColorOverrideState & { systemEnabled?: boolean }> | null;
    typeFontOverrides: Record<string, FontOverrideState & { systemEnabled?: boolean }> | null;
    globalFontOverride: { enabled: boolean; fontKey: string } | null;
    homePageBackground?: unknown;
  } | null | undefined;
  systemColors: { primary: string; secondary: string; mode: 'single' | 'dual' };
  isDark: boolean;
}

interface HomeComponentRendererProps {
  component: HomeComponentRecord;
  snapshotComponentKey?: string;
  /** Nếu được truyền vào, sẽ skip useQuery trong renderer — giảm N×3 subscriptions */
  sharedData?: SharedSystemData;
}

export function HomeComponentRenderer({ component, snapshotComponentKey, sharedData }: HomeComponentRendererProps) {
  const snapshotCtx = useSnapshotDemoContext();
  const isSnapshotMode = Boolean(snapshotCtx);

  // Chỉ subscribe khi KHÔNG được cung cấp sharedData từ bên ngoài (và không ở snapshot mode)
  const shouldSkipQuery = sharedData !== undefined || isSnapshotMode;

  // useBrandColors và useSiteSettings chỉ gọi khi cần thiết
  const liveBrandColors = useBrandColors();
  const { isDark: liveDark } = useSiteSettings();

  // In snapshot mode, use systemStyle from snapshot bundle instead of querying DB
  const liveSystemConfig = useQuery(api.homeComponentSystemConfig.getConfig, shouldSkipQuery ? 'skip' : undefined);
  const snapshotSystemStyle = snapshotCtx?.getSystemStyle?.() ?? null;

  // Resolve systemConfig: priority → sharedData > snapshot > live query
  const systemConfig = isSnapshotMode
    ? (snapshotSystemStyle
      ? {
          typeColorOverrides: (snapshotSystemStyle.typeColorOverrides ?? null) as Record<string, ColorOverrideState & { systemEnabled?: boolean }> | null,
          typeFontOverrides: (snapshotSystemStyle.typeFontOverrides ?? null) as Record<string, FontOverrideState & { systemEnabled?: boolean }> | null,
          globalFontOverride: (snapshotSystemStyle.globalFontOverride ?? null) as { enabled: boolean; fontKey: string } | null,
        }
      : null)
    : (sharedData !== undefined ? sharedData.systemConfig : liveSystemConfig);

  // Resolve systemColors: priority → sharedData > snapshot fallback > live
  const systemColors = isSnapshotMode
    ? liveBrandColors
    : (sharedData !== undefined ? sharedData.systemColors : liveBrandColors);

  // Resolve isDark: priority → sharedData > live
  const isDark = isSnapshotMode
    ? liveDark
    : (sharedData !== undefined ? sharedData.isDark : liveDark);

  const sectionType = component.type;

  const resolvedColors = resolveTypeOverrideColors({
    type: sectionType,
    systemColors,
    overrides: systemConfig?.typeColorOverrides ?? null,
  });

  const resolvedFont = resolveTypeOverrideFont({
    type: sectionType,
    overrides: systemConfig?.typeFontOverrides ?? null,
    globalOverride: systemConfig?.globalFontOverride ?? null,
  });

  const SectionComponent = homeComponentRegistry[sectionType];

  if (!SectionComponent) {
    return (
      <LegacyComponentRenderer
        component={{
          _id: component._id,
          active: component.active,
          config: component.config,
          order: component.order,
          title: component.title,
          type: component.type,
        }}
      />
    );
  }

  const sectionNode = sectionType === 'HomepageCategoryHero'
    ? (
      <SectionComponent
        config={component.config}
        brandColor={resolvedColors.primary}
        secondary={resolvedColors.secondary}
        mode={resolvedColors.mode}
        title={component.title}
        snapshotComponentKey={snapshotComponentKey}
        isDark={isDark}
        tokens={getHomepageCategoryHeroColors(
          resolvedColors.primary,
          resolvedColors.secondary,
          resolvedColors.mode,
        )}
      />
    )
    : (
      <SectionComponent
        config={component.config}
        brandColor={resolvedColors.primary}
        secondary={resolvedColors.secondary}
        mode={resolvedColors.mode}
        title={component.title}
        snapshotComponentKey={snapshotComponentKey}
        isDark={isDark}
      />
    );

  // Floating components use position:fixed — CSS `contain: layout` would break them
  // by creating a new containing block, making fixed children relative to the wrapper instead of viewport.
  const useContainment = sectionType !== 'SpeedDial' && sectionType !== 'Popup';
  const hasInternalSpacing = sectionType === 'Hero'
    || sectionType === 'CaseStudy'
    || sectionType === 'CategoryProducts'
    || sectionType === 'Career'
    || sectionType === 'HomepageCategoryHero'
    || sectionType === 'Partners'
    || sectionType === 'PokemonChampions'
    || sectionType === 'Pricing'
    || sectionType === 'ProductCategories'
    || sectionType === 'ProductGrid'
    || sectionType === 'Stats'
    || sectionType === 'Team'
    || sectionType === 'Video'
    || sectionType === 'VoucherPromotions';
  const spacingClassName = useContainment && !hasInternalSpacing
    ? getSectionSpacingClassName(normalizeSectionSpacing(component.config.spacing))
    : '';

  return (
    <div className={cn("font-active", spacingClassName, isDark ? "dark" : "")} style={{ '--font-active': `var(${resolvedFont.fontVariable})`, ...(useContainment ? { contain: 'layout' } : {}) } as React.CSSProperties}>
      {sectionNode}
    </div>
  );
}
