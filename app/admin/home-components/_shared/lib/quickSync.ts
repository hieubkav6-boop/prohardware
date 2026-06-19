export const QUICK_SYNC_NO_SPACING_TYPES = new Set(['Hero', 'HomepageCategoryHero']);

export const isRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

export const buildQuickSyncedComponent = <T extends { type: string; config?: unknown }>(component: T): T => {
  const config = isRecord(component.config) ? component.config : {};
  const spacing = QUICK_SYNC_NO_SPACING_TYPES.has(component.type) ? 'none' : 'compact';
  const nextConfig: Record<string, unknown> = {
    ...config,
    cornerRadius: 'sm',
    descriptionAlign: 'center',
    headerAlign: 'center',
    noBorderRadius: false,
    noVerticalMargin: spacing === 'none',
    spacing,
    subtitleAlign: 'center',
    titleAlign: 'center',
    titleColorPrimary: true,
  };

  if (isRecord(config.content)) {
    nextConfig.content = {
      ...config.content,
      textAlign: 'center',
    };
  }

  return {
    ...component,
    config: nextConfig,
  };
};

export const getQuickSyncedReorderedComponents = <T extends { type: string; order: number; config?: unknown }>(
  components: T[]
): T[] => {
  const synced = components.map(buildQuickSyncedComponent);
  const others = synced.filter(c => c.type !== 'SpeedDial' && c.type !== 'Footer');
  const speedDials = synced.filter(c => c.type === 'SpeedDial');
  const footers = synced.filter(c => c.type === 'Footer');

  return [...others, ...speedDials, ...footers].map((c, index) => ({
    ...c,
    order: index,
  }));
};
