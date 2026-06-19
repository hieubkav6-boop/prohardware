import { v } from 'convex/values';
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { internal } from './_generated/api';
import { slugify, getExtensionFromMime, getMimeFromExtension } from '../lib/image/uploadNaming';
import type { Doc, Id } from './_generated/dataModel';
import {
  HOMEPAGE_SNAPSHOT_VERSION,
  HOMEPAGE_SNAPSHOT_VERSION_V2,
  type SnapshotCustomThumbnail,
  type HomepageSnapshotImportReport,
  type HomepageSnapshotPayload,
  type SnapshotDependencyCapture,
  type SnapshotStaticCategory,
  type SnapshotStaticItem,
  type SnapshotSystemStylePayload,
} from '../lib/homepage-snapshot/types';
import type { ContactSettings, SEOSettings, SiteSettings, SocialSettings } from '../lib/get-settings';
import {
  removeOwnerFilesAndCleanup,
  resolveStorageIdsFromLegacyUrls,
  syncOwnerFilesAndCleanup,
} from './lib/fileService';

const REPLACE_ALL_MODE = 'replace_all';
const SNAPSHOT_ZIP_BUILDER_VERSION = 'homepage-snapshot-zip.2026-06-14.v4';
const SNAPSHOT_MEDIA_FETCH_CONCURRENCY = 6;
const SNAPSHOT_MEDIA_FETCH_TIMEOUT_MS = 60_000;
const DATA_MEDIA_URL_RE = /^data:(image|video)\/([a-z0-9.+-]+)[;,]/i;
const NEXT_IMAGE_PATH_RE = /(?:^https?:\/\/[^/]+)?\/_next\/image(?:\?|$)/i;

const snapshotThumbnailConfigValidator = v.object({
  backgroundColor: v.optional(v.string()),
  objectFit: v.optional(v.union(v.literal('cover'), v.literal('contain'))),
  positionX: v.optional(v.number()),
  positionY: v.optional(v.number()),
});

const snapshotCustomThumbnailValidator = v.object({
  alt: v.optional(v.string()),
  config: v.optional(snapshotThumbnailConfigValidator),
  storageId: v.optional(v.union(v.string(), v.null())),
  updatedAt: v.optional(v.number()),
  url: v.string(),
});

const loadSnapshotPayload = async (
  ctx: any,
  snapshotId: string,
): Promise<unknown> => {
  const payloadRow = await ctx.db
    .query('homeComponentSnapshotPayloads')
    .withIndex('by_snapshotId', (q: any) => q.eq('snapshotId', snapshotId))
    .unique();
  if (payloadRow) return payloadRow.payload;
  return null;
};

const SNAPSHOT_REQUIRED_SETTINGS_KEYS = {
  contact: [
    'contact_email',
    'contact_phone',
    'contact_address',
    'contact_zalo',
    'contact_map_provider',
    'contact_google_map_embed_iframe',
  ],
  site: [
    'site_name',
    'site_tagline',
    'site_url',
    'site_logo',
    'site_favicon',
    'site_brand_primary',
    'site_brand_secondary',
    'site_brand_mode',
    'site_timezone',
    'site_language',
    'site_dark_mode',
  ],
  social: [
    'social_facebook',
    'social_instagram',
    'social_youtube',
    'social_tiktok',
    'social_twitter',
    'social_linkedin',
    'social_pinterest',
  ],
  seo: [
    'seo_title',
    'seo_description',
    'seo_keywords',
    'seo_og_image',
    'seo_google_verification',
    'seo_bing_verification',
  ],
} as const;

const extractNextImageSource = (value?: string) => {
  if (!value || !NEXT_IMAGE_PATH_RE.test(value)) {return undefined;}
  try {
    const parsed = new URL(value, 'https://snapshot.local');
    if (parsed.pathname !== '/_next/image') {return undefined;}
    return parsed.searchParams.get('url')?.trim() || undefined;
  } catch {
    return undefined;
  }
};

const getExtensionFromUrl = (value?: string) => {
  if (!value) {return 'bin';}
  const dataExt = value.match(DATA_MEDIA_URL_RE)?.[2];
  if (dataExt) {return dataExt.toLowerCase().replace('jpeg', 'jpg').replace('svg+xml', 'svg');}
  const source = extractNextImageSource(value) ?? value;
  const clean = source.split('?')[0]?.split('#')[0] ?? source;
  const last = clean.split('/').pop() ?? '';
  const ext = last.includes('.') ? last.split('.').pop() : undefined;
  return ext?.toLowerCase() ?? 'bin';
};

type SnapshotMediaEntry = HomepageSnapshotPayload['index']['mediaIndex'][number];

const clampPercentage = (value: unknown, fallback: number) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {return fallback;}
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

const normalizeSnapshotCustomThumbnail = (value: unknown): SnapshotCustomThumbnail | undefined => {
  if (!value || typeof value !== 'object') {return undefined;}
  const raw = value as Record<string, unknown>;
  const url = typeof raw.url === 'string' ? raw.url.trim() : '';
  if (!url) {return undefined;}

  const rawConfig = (raw.config ?? {}) as Record<string, unknown>;
  const objectFit = rawConfig.objectFit === 'contain' ? 'contain' : 'cover';
  const backgroundColor = typeof rawConfig.backgroundColor === 'string' && rawConfig.backgroundColor.trim()
    ? rawConfig.backgroundColor.trim()
    : '#f8fafc';
  const thumbnail: SnapshotCustomThumbnail = {
    config: {
      backgroundColor,
      objectFit,
      positionX: clampPercentage(rawConfig.positionX, 50),
      positionY: clampPercentage(rawConfig.positionY, 50),
    },
    url,
  };

  if (typeof raw.alt === 'string' && raw.alt.trim()) {
    thumbnail.alt = raw.alt.trim();
  }
  if (typeof raw.storageId === 'string' && raw.storageId.trim()) {
    thumbnail.storageId = raw.storageId.trim();
  } else if (raw.storageId === null) {
    thumbnail.storageId = null;
  }
  if (typeof raw.updatedAt === 'number' && Number.isFinite(raw.updatedAt)) {
    thumbnail.updatedAt = raw.updatedAt;
  }
  return thumbnail;
};

const withSnapshotCustomThumbnail = (
  payload: HomepageSnapshotPayload,
  customThumbnail = normalizeSnapshotCustomThumbnail(payload.gallery?.customThumbnail),
): HomepageSnapshotPayload => {
  if (customThumbnail) {
    return {
      ...payload,
      gallery: { customThumbnail },
    };
  }
  const nextPayload = { ...payload };
  delete nextPayload.gallery;
  return nextPayload;
};

const buildEffectiveSnapshotThumbnails = (
  thumbnails: string[],
  customThumbnail?: SnapshotCustomThumbnail,
) => {
  if (!customThumbnail?.url) {return thumbnails.slice(0, 6);}
  return [
    customThumbnail.url,
    ...thumbnails.filter((thumbnail) => thumbnail !== customThumbnail.url),
  ].slice(0, 6);
};

const collectSnapshotThumbnailStorageIds = async (
  ctx: MutationCtx,
  customThumbnail?: SnapshotCustomThumbnail,
) => {
  if (!customThumbnail) {return [];}
  if (customThumbnail.storageId) {return [customThumbnail.storageId];}
  return resolveStorageIdsFromLegacyUrls(ctx, [customThumbnail.url], {
    folder: 'snapshot-thumbnails',
    limit: 200,
  });
};

const syncSnapshotCustomThumbnailFiles = async (
  ctx: MutationCtx,
  snapshotId: Id<'homeComponentSnapshots'>,
  previousThumbnail?: SnapshotCustomThumbnail,
  nextThumbnail?: SnapshotCustomThumbnail,
) => {
  const previousStorageIds = await collectSnapshotThumbnailStorageIds(ctx, previousThumbnail);
  const nextStorageIds = await collectSnapshotThumbnailStorageIds(ctx, nextThumbnail);
  await syncOwnerFilesAndCleanup(ctx, {
    ownerField: 'customThumbnail',
    ownerId: snapshotId,
    ownerTable: 'homeComponentSnapshots',
    purpose: 'snapshot-gallery-thumbnail',
  }, nextStorageIds, {
    previousStorageIds,
  });
};

const MEDIA_EXTENSION_RE = /\.(avif|bmp|gif|ico|jpe?g|m4v|mov|mp4|ogg|png|svg|webm|webp)([?#].*)?$/i;
const STORAGE_URL_RE = /\/api\/storage\/|\/storage\/|convex\.cloud\/api\/storage\//i;
const PUBLIC_MEDIA_PATH_RE = /^\/(?!\/)(?:api\/storage|storage|seed_mau|images|uploads|media|assets|_next\/image)(?:[/?#]|$)/i;
const MEDIA_FIELD_KEYS = new Set([
  'avatar',
  'avatarUrl',
  'avatar_url',
  'backgroundImage',
  'backgroundImageUrl',
  'background_image',
  'backgroundVideo',
  'backgroundVideoUrl',
  'background_video',
  'cover',
  'coverImage',
  'desktopImage',
  'favicon',
  'heroVideo',
  'heroVideoUrl',
  'hero_video',
  'iconUrl',
  'image',
  'imageUrl',
  'image_url',
  'images',
  'logo',
  'logoUrl',
  'logo_url',
  'mobileImage',
  'ogImage',
  'poster',
  'posterUrl',
  'poster_url',
  'seo_og_image',
  'site_favicon',
  'site_logo',
  'src',
  'srcVideo',
  'src_video',
  'thumbnail',
  'thumbnailUrl',
  'thumbnail_url',
  'video',
  'videoUrl',
  'videoSrc',
  'video_url',
  'video_src',
  'videoPath',
  'videoThumbnail',
  'videoThumbnailUrl',
]);

const isHttpUrl = (value: string) => /^https?:\/\//.test(value);
const isRelativeUrl = (value: string) => value.startsWith('/') && !value.startsWith('//');
const isDataMediaUrl = (value: string) => DATA_MEDIA_URL_RE.test(value);

const isLikelyMediaUrl = (value: string, keyPath: string[] = [], logicalPath?: string) => {
  const trimmed = value.trim();
  if (!trimmed) {return false;}
  const nextImageSource = extractNextImageSource(trimmed);
  const source = nextImageSource ?? trimmed;
  if (!isHttpUrl(source) && !isRelativeUrl(source) && !isDataMediaUrl(source)) {return false;}
  if (
    MEDIA_EXTENSION_RE.test(source)
    || STORAGE_URL_RE.test(source)
    || PUBLIC_MEDIA_PATH_RE.test(source)
    || NEXT_IMAGE_PATH_RE.test(trimmed)
    || isDataMediaUrl(source)
  ) {return true;}
  if (logicalPath && MEDIA_EXTENSION_RE.test(logicalPath)) {return true;}
  return keyPath.some((key) => MEDIA_FIELD_KEYS.has(key));
};

const collectMediaUrls = (value: unknown, acc: Set<string>, keyPath: string[] = []) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (isLikelyMediaUrl(trimmed, keyPath)) {
      acc.add(trimmed);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaUrls(item, acc, keyPath));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      collectMediaUrls(item, acc, [...keyPath, key]);
    });
  }
};

const buildMediaLogicalPath = (sourceType: string, sourceKey: string, index: number, sourceUrl: string) => {
  const ext = getExtensionFromUrl(sourceUrl);
  return `snapshot-bundles/homepage/${slugify(sourceType)}-${slugify(sourceKey)}-${index + 1}.${ext}`;
};

const normalizeHomepageSnapshotPayload = (payload: HomepageSnapshotPayload): HomepageSnapshotPayload => {
  const mediaEntries: SnapshotMediaEntry[] = [];
  const byOriginalUrl = new Map<string, SnapshotMediaEntry>();
  const byLogicalPath = new Set<string>();
  const customThumbnail = normalizeSnapshotCustomThumbnail(payload.gallery?.customThumbnail);

  const pushEntry = (entry: SnapshotMediaEntry) => {
    const originalUrl = entry.originalUrl?.trim();
    if (!originalUrl || !entry.logicalPath || !isLikelyMediaUrl(originalUrl, [], entry.logicalPath)) {return;}

    const existing = byOriginalUrl.get(originalUrl);
    if (existing) {
      existing.usedBy = Array.from(new Set([...(existing.usedBy ?? []), ...(entry.usedBy ?? [])]));
      return;
    }

    let logicalPath = entry.logicalPath;
    if (byLogicalPath.has(logicalPath)) {
      const ext = getExtensionFromUrl(logicalPath);
      const base = logicalPath.replace(new RegExp(`\\.${ext}$`), '');
      let suffix = 2;
      while (byLogicalPath.has(`${base}-${suffix}.${ext}`)) {
        suffix += 1;
      }
      logicalPath = `${base}-${suffix}.${ext}`;
    }

    const next: SnapshotMediaEntry = {
      logicalPath,
      originalUrl,
      mimeType: entry.mimeType || getMimeFromExtension(getExtensionFromUrl(originalUrl)) || 'application/octet-stream',
      sourceType: entry.sourceType || 'homepage',
      usedBy: Array.from(new Set(entry.usedBy ?? [])),
    };
    mediaEntries.push(next);
    byOriginalUrl.set(next.originalUrl, next);
    byLogicalPath.add(next.logicalPath);
  };

  (payload.index?.mediaIndex ?? []).forEach(pushEntry);

  const addUrls = (value: unknown, sourceType: string, sourceKey: string, usedBy: string) => {
    const urls = new Set<string>();
    collectMediaUrls(value, urls);
    Array.from(urls).forEach((url, index) => {
      const existing = byOriginalUrl.get(url);
      if (existing) {
        existing.usedBy = Array.from(new Set([...existing.usedBy, usedBy]));
        return;
      }
      pushEntry({
        logicalPath: buildMediaLogicalPath(sourceType, sourceKey, index, url),
        originalUrl: url,
        mimeType: getMimeFromExtension(getExtensionFromUrl(url)) || 'application/octet-stream',
        sourceType,
        usedBy: [usedBy],
      });
    });
  };

  const components = payload.homepage.components.map((component) => {
    addUrls(component.config, component.type, `${component.title}-${component.order}`, component.componentKey);
    const mediaRefs = mediaEntries
      .filter((entry) => entry.usedBy.includes(component.componentKey))
      .map((entry) => entry.logicalPath);
    return {
      ...component,
      mediaRefs: Array.from(new Set([...(component.mediaRefs ?? []), ...mediaRefs])),
    };
  });

  addUrls(payload.homepage.dependencies, 'dependencies', 'homepage-dependencies', 'homepage:dependencies');
  addUrls(payload.homepage.demoBundle, 'demo-bundle', 'homepage-demo-bundle', 'homepage:demoBundle');
  addUrls(customThumbnail ? { thumbnail: customThumbnail.url } : undefined, 'snapshot-thumbnail', 'gallery-custom-thumbnail', 'homepage:customThumbnail');

  return withSnapshotCustomThumbnail({
    ...payload,
    homepage: {
      ...payload.homepage,
      components,
    },
    index: {
      mediaIndex: mediaEntries,
    },
  }, customThumbnail);
};

const toStaticPost = (post: Doc<'posts'>): SnapshotStaticItem => ({
  sourceId: post._id as string,
  sourceType: 'post',
  title: `${post.title} [tĩnh]`,
  image: post.thumbnail,
  slug: post.slug,
  subtitle: post.excerpt,
});

const toStaticProduct = (product: Doc<'products'>): SnapshotStaticItem => ({
  sourceId: product._id as string,
  sourceType: 'product',
  title: `${product.name} [tĩnh]`,
  image: product.image || product.images?.[0],
  slug: product.slug,
  subtitle: product.description,
  price: product.effectivePrice ?? product.price,
});

const toStaticService = (service: Doc<'services'>): SnapshotStaticItem => ({
  sourceId: service._id as string,
  sourceType: 'service',
  title: `${service.title} [tĩnh]`,
  image: service.thumbnail,
  slug: service.slug,
  subtitle: service.excerpt,
  price: service.price,
});

const toStaticCategory = (category: Doc<'productCategories'>): SnapshotStaticCategory => ({
  sourceId: category._id as string,
  title: `${category.name} [tĩnh]`,
  image: category.image,
  slug: category.slug,
  description: category.description,
});

const buildDependencyCapture = async (ctx: any, components: Array<Doc<'homeComponents'>>): Promise<SnapshotDependencyCapture> => {
  const postIds = new Set<string>();
  const productIds = new Set<string>();
  const serviceIds = new Set<string>();
  const productCategoryIds = new Set<string>();

  components.forEach((component) => {
    const config = (component.config ?? {}) as Record<string, unknown>;
    const type = component.type;

    if (type === 'Blog') {
      ((config.selectedPostIds as string[] | undefined) ?? []).forEach((id) => postIds.add(id));
    }
    if (type === 'ProductGrid') {
      ((config.selectedProductIds as string[] | undefined) ?? []).forEach((id) => productIds.add(id));
    }
    if (type === 'ProductList') {
      ((config.selectedProductIds as string[] | undefined) ?? []).forEach((id) => productIds.add(id));
      ((config.selectedServiceIds as string[] | undefined) ?? []).forEach((id) => serviceIds.add(id));
      ((config.selectedPostIds as string[] | undefined) ?? []).forEach((id) => postIds.add(id));
    }
    if (type === 'ServiceList') {
      ((config.selectedServiceIds as string[] | undefined) ?? []).forEach((id) => serviceIds.add(id));
    }
    if (type === 'ProductCategories') {
      ((config.categories as Array<{ categoryId?: string }> | undefined) ?? []).forEach((item) => {
        if (item.categoryId) {productCategoryIds.add(item.categoryId);}
      });
    }
    if (type === 'CategoryProducts') {
      ((config.sections as Array<{ categoryId?: string }> | undefined) ?? []).forEach((item) => {
        if (item.categoryId) {productCategoryIds.add(item.categoryId);}
      });
    }
    if (type === 'HomepageCategoryHero') {
      ((config.categories as Array<{ categoryId?: string; groups?: Array<{ items?: Array<{ categoryId?: string; productId?: string }> }> }> | undefined) ?? []).forEach((item) => {
        if (item.categoryId) {productCategoryIds.add(item.categoryId);}
        (item.groups ?? []).forEach((group) => (group.items ?? []).forEach((link) => {
          if (link.categoryId) {productCategoryIds.add(link.categoryId);}
          if (link.productId) {productIds.add(link.productId);}
        }));
      });
    }
  });

  // Safe wrapper: returns null for any invalid/non-existent ID instead of throwing
  const safeGet = async (table: string, id: string) => {
    try {
      return await ctx.db.get(id as any);
    } catch {
      return null;
    }
  };

  const [posts, products, services, productCategories] = await Promise.all([
    Promise.all(Array.from(postIds).map((id) => safeGet('posts', id))),
    Promise.all(Array.from(productIds).map((id) => safeGet('products', id))),
    Promise.all(Array.from(serviceIds).map((id) => safeGet('services', id))),
    Promise.all(Array.from(productCategoryIds).map((id) => safeGet('productCategories', id))),
  ]);

  return {
    posts: posts.filter(Boolean).map((item) => toStaticPost(item as Doc<'posts'>)),
    products: products.filter(Boolean).map((item) => toStaticProduct(item as Doc<'products'>)),
    services: services.filter(Boolean).map((item) => toStaticService(item as Doc<'services'>)),
    productCategories: productCategories.filter(Boolean).map((item) => toStaticCategory(item as Doc<'productCategories'>)),
  };
};

const rewriteConfigWithFallback = (
  type: string,
  config: Record<string, unknown>,
  dependencies: SnapshotDependencyCapture,
) => {
  const next = { ...config } as Record<string, unknown>;

  if (type === 'Blog') {
    next.fallbackPosts = dependencies.posts;
  }
  if (type === 'ProductGrid') {
    next.fallbackProducts = dependencies.products;
  }
  if (type === 'ProductList') {
    next.fallbackProducts = dependencies.products;
    next.fallbackServices = dependencies.services;
    next.fallbackPosts = dependencies.posts;
  }
  if (type === 'ServiceList') {
    next.fallbackServices = dependencies.services;
  }
  if (type === 'ProductCategories') {
    next.fallbackCategories = dependencies.productCategories;
  }
  if (type === 'CategoryProducts') {
    next.fallbackCategories = dependencies.productCategories;
    next.fallbackProducts = dependencies.products;
  }
  if (type === 'HomepageCategoryHero') {
    next.fallbackCategories = dependencies.productCategories;
    next.fallbackProducts = dependencies.products;
  }

  return next;
};

const buildSystemStyle = async (ctx: any): Promise<SnapshotSystemStylePayload> => {
  // Chỉ lấy đúng 4 keys cần thiết qua index, tránh take(1000) scan toàn bảng
  const styleKeys = [
    'create_hidden_types',
    'type_color_overrides',
    'type_font_overrides',
    'global_font_override',
  ] as const;
  const rows = await Promise.all(
    styleKeys.map((key) =>
      ctx.db.query('settings').withIndex('by_key', (q: any) => q.eq('key', key)).unique()
    )
  );
  const settingByKey = new Map<string, unknown>(
    rows.filter(Boolean).map((r: any) => [r.key, r.value])
  );
  const hiddenTypesValue = settingByKey.get('create_hidden_types');
  return {
    hiddenTypes: Array.isArray(hiddenTypesValue) ? hiddenTypesValue.filter((item): item is string => typeof item === 'string') : [],
    typeColorOverrides: (settingByKey.get('type_color_overrides') as Record<string, unknown>) ?? {},
    typeFontOverrides: (settingByKey.get('type_font_overrides') as Record<string, unknown>) ?? {},
    globalFontOverride: (settingByKey.get('global_font_override') as { enabled: boolean; fontKey: string }) ?? {
      enabled: false,
      fontKey: 'system-default',
    },
  };
};

const toSettingsMap = async (ctx: any, keys: readonly string[]) => {
  const rows = await Promise.all(keys.map((key) => ctx.db.query('settings').withIndex('by_key', (q: any) => q.eq('key', key)).unique()));
  return rows.reduce<Record<string, unknown>>((acc, row, index) => {
    acc[keys[index]!] = row?.value ?? '';
    return acc;
  }, {});
};

const buildSnapshotSettingsBundle = async (ctx: any) => {
  const [headerStyleRow, headerConfigRow] = await Promise.all([
    ctx.db.query('settings').withIndex('by_key', (q: any) => q.eq('key', 'header_style')).unique(),
    ctx.db.query('settings').withIndex('by_key', (q: any) => q.eq('key', 'header_config')).unique(),
  ]);
  return {
    contact: await toSettingsMap(ctx, SNAPSHOT_REQUIRED_SETTINGS_KEYS.contact) as unknown as ContactSettings,
    header: {
      header_style: (headerStyleRow?.value as string) ?? 'classic',
      header_config: (headerConfigRow?.value as Record<string, unknown>) ?? {},
    },
    routing: {
      ia_route_mode: (await ctx.db.query('settings').withIndex('by_key', (q: any) => q.eq('key', 'ia_route_mode')).unique())?.value ?? 'unified',
    },
    site: await toSettingsMap(ctx, SNAPSHOT_REQUIRED_SETTINGS_KEYS.site) as unknown as SiteSettings,
    social: await toSettingsMap(ctx, SNAPSHOT_REQUIRED_SETTINGS_KEYS.social) as unknown as SocialSettings,
    seo: await toSettingsMap(ctx, SNAPSHOT_REQUIRED_SETTINGS_KEYS.seo) as unknown as SEOSettings,
  };
};

const buildSnapshotModuleBundle = async (ctx: any) => {
  const moduleKeys = ['cart', 'wishlist', 'products', 'posts', 'services', 'customers', 'orders'] as const;
  const [moduleRows, customerLoginFeature] = await Promise.all([
    Promise.all(moduleKeys.map((key) => ctx.db.query('adminModules').withIndex('by_key', (q: any) => q.eq('key', key)).unique())),
    ctx.db.query('moduleFeatures').withIndex('by_module_feature', (q: any) => q.eq('moduleKey', 'customers').eq('featureKey', 'enableLogin')).unique(),
  ]);
  const enabledByKey = moduleKeys.reduce<Record<string, boolean>>((acc, key, index) => {
    acc[key] = Boolean(moduleRows[index]?.enabled);
    return acc;
  }, {});

  return {
    cart: enabledByKey.cart ?? false,
    wishlist: enabledByKey.wishlist ?? false,
    products: enabledByKey.products ?? false,
    posts: enabledByKey.posts ?? false,
    services: enabledByKey.services ?? false,
    customers: enabledByKey.customers ?? false,
    orders: enabledByKey.orders ?? false,
    customerLogin: Boolean(customerLoginFeature?.enabled),
  };
};

const serializeMenuPayload = async (ctx: any, location: 'header' | 'footer') => {
  const menu = await ctx.db.query('menus').withIndex('by_location', (q: any) => q.eq('location', location)).unique();
  if (!menu) {return null;}
  const items = await ctx.db.query('menuItems').withIndex('by_menu_active', (q: any) => q.eq('menuId', menu._id).eq('active', true)).collect();
  return {
    items: items.map((item: any) => ({
      _id: item._id as string,
      active: item.active,
      depth: item.depth,
      icon: item.icon,
      label: item.label,
      menuId: item.menuId as string,
      openInNewTab: item.openInNewTab,
      order: item.order,
      parentId: item.parentId as string | undefined,
      url: item.url,
    })),
    menu: {
      _id: menu._id as string,
      location: menu.location,
      name: menu.name,
    },
  };
};

/**
 * Lightweight demo bundle builder.
 * Instead of querying 200+ records per table, resolves only the N items
 * each component actually displays and embeds them as demo data in config.
 * Blog/ProductList/ServiceList with auto/manual → override to selectionMode='demo'.
 * Contact/Footer/Category types → embed settings/resolved data into config.
 */
const buildSnapshotDemoConfigs = async (
  ctx: any,
  components: Array<Doc<'homeComponents'>>,
): Promise<{
  configOverrides: Map<string, Record<string, unknown>>;
  settings: Awaited<ReturnType<typeof buildSnapshotSettingsBundle>>;
  modules: Awaited<ReturnType<typeof buildSnapshotModuleBundle>>;
  menus: { footer: any; header: any };
}> => {
  const [settingsBundle, moduleBundle] = await Promise.all([
    buildSnapshotSettingsBundle(ctx),
    buildSnapshotModuleBundle(ctx),
  ]);
  const [footerMenu, headerMenu] = await Promise.all([
    serializeMenuPayload(ctx, 'footer'),
    serializeMenuPayload(ctx, 'header'),
  ]);

  const configOverrides = new Map<string, Record<string, unknown>>();
  // Lazy-loaded data caches (only fetched if needed)
  let _activeProducts: any[] | null = null;
  let _publishedPosts: any[] | null = null;
  let _publishedServices: any[] | null = null;
  let _productCategories: any[] | null = null;
  let _serviceCategories: any[] | null = null;
  let _postCategories: any[] | null = null;

  const getActiveProducts = async () => {
    if (!_activeProducts) _activeProducts = await ctx.db.query('products').withIndex('by_status_order', (q: any) => q.eq('status', 'Active')).take(50);
    return _activeProducts!;
  };
  const getPublishedPosts = async () => {
    if (!_publishedPosts) _publishedPosts = await ctx.db.query('posts').withIndex('by_status_publishedAt', (q: any) => q.eq('status', 'Published')).order('desc').take(50);
    return _publishedPosts!;
  };
  const getPublishedServices = async () => {
    if (!_publishedServices) _publishedServices = await ctx.db.query('services').withIndex('by_status_publishedAt', (q: any) => q.eq('status', 'Published')).take(50);
    return _publishedServices!;
  };
  const _getProductCategories = async () => {
    if (!_productCategories) _productCategories = await ctx.db.query('productCategories').withIndex('by_active', (q: any) => q.eq('active', true)).take(200);
    return _productCategories!;
  };
  const _getServiceCategories = async () => {
    if (!_serviceCategories) _serviceCategories = await ctx.db.query('serviceCategories').withIndex('by_active', (q: any) => q.eq('active', true)).take(200);
    return _serviceCategories!;
  };
  const getPostCategories = async () => {
    if (!_postCategories) _postCategories = await ctx.db.query('postCategories').withIndex('by_active', (q: any) => q.eq('active', true)).take(200);
    return _postCategories!;
  };

  for (const component of components) {
    const key = component._id as string;
    const config = (component.config ?? {}) as Record<string, unknown>;
    const type = component.type;

    // ProductList / ProductGrid → embed demoProducts in config
    if (type === 'ProductList' || type === 'ProductGrid') {
      if (config.selectionMode === 'demo') continue; // already has demo data
      const itemCount = Math.min(Math.max(Number(config.itemCount) || 8, 1), 20);
      const selectedIds = Array.isArray(config.selectedProductIds) ? config.selectedProductIds as string[] : [];
      const allProducts = await getActiveProducts();
      const products = config.selectionMode === 'manual' && selectedIds.length > 0
        ? selectedIds.map((id) => allProducts.find((p: any) => p._id === id)).filter(Boolean)
        : allProducts.slice(0, itemCount);
      configOverrides.set(key, {
        ...config,
        selectionMode: 'demo',
        _originalSelectionMode: config.selectionMode ?? 'auto',
        demoProducts: products.slice(0, itemCount).map((p: any) => ({
          id: p._id, name: p.name, image: p.image || p.images?.[0],
          price: p.salePrice != null ? String(p.salePrice) : String(p.price ?? ''),
          originalPrice: p.salePrice != null ? String(p.price) : undefined,
          description: p.description, category: '',
        })),
      });
    }

    // Blog → embed demoPosts in config
    if (type === 'Blog') {
      if (config.selectionMode === 'demo') continue;
      const itemCount = Math.min(Math.max(Number(config.itemCount) || 6, 1), 10);
      const selectedIds = Array.isArray(config.selectedPostIds) ? config.selectedPostIds as string[] : [];
      const allPosts = await getPublishedPosts();
      const postCategories = await getPostCategories();
      const catMap = new Map(postCategories.map((c: any) => [c._id as string, c]));
      const posts = config.selectionMode === 'manual' && selectedIds.length > 0
        ? selectedIds.map((id) => allPosts.find((p: any) => p._id === id)).filter(Boolean)
        : allPosts.slice(0, itemCount);
      configOverrides.set(key, {
        ...config,
        selectionMode: 'demo',
        _originalSelectionMode: config.selectionMode ?? 'auto',
        demoPosts: posts.slice(0, itemCount).map((p: any) => ({
          id: p._id, title: p.title, image: p.thumbnail,
          excerpt: p.excerpt, slug: p.slug, publishedAt: p.publishedAt,
          categoryName: catMap.get(p.categoryId)?.name,
          categorySlug: catMap.get(p.categoryId)?.slug,
        })),
      });
    }

    // ServiceList → embed demoServices in config
    if (type === 'ServiceList') {
      if (config.selectionMode === 'demo') continue;
      const itemCount = Math.min(Math.max(Number(config.itemCount) || 8, 1), 20);
      const selectedIds = Array.isArray(config.selectedServiceIds) ? config.selectedServiceIds as string[] : [];
      const allServices = await getPublishedServices();
      const services = config.selectionMode === 'manual' && selectedIds.length > 0
        ? selectedIds.map((id) => allServices.find((s: any) => s._id === id)).filter(Boolean)
        : allServices.slice(0, itemCount);
      configOverrides.set(key, {
        ...config,
        selectionMode: 'demo',
        _originalSelectionMode: config.selectionMode ?? 'auto',
        demoServices: services.slice(0, itemCount).map((s: any) => ({
          id: s._id, name: s.title, image: s.thumbnail,
          price: s.price != null ? String(s.price) : '', description: s.excerpt,
        })),
      });
    }

    // Contact → embed settings into config
    if (type === 'Contact') {
      configOverrides.set(key, {
        ...config,
        _snapshotContact: settingsBundle.contact,
        _snapshotSocial: settingsBundle.social,
      });
    }

    // Footer → embed settings + menu into config
    if (type === 'Footer') {
      configOverrides.set(key, {
        ...config,
        _snapshotContact: settingsBundle.contact,
        _snapshotSite: settingsBundle.site,
        _snapshotSocial: settingsBundle.social,
        _snapshotFooterMenu: footerMenu,
      });
    }

    // ProductCategories / CategoryProducts / HomepageCategoryHero → keep buildDependencyCapture fallback
    // These types already have fallback logic via rewriteConfigWithFallback, no override needed
  }

  return { configOverrides, settings: settingsBundle, modules: moduleBundle, menus: { footer: footerMenu, header: headerMenu } };
};

const buildHomepageSnapshotPayload = async (
  ctx: any,
  label?: string,
): Promise<HomepageSnapshotPayload> => {
  const components = [...await ctx.db.query('homeComponents').take(5000)].sort((a, b) => a.order - b.order || a._creationTime - b._creationTime);
  const dependencies = await buildDependencyCapture(ctx, components);
  const systemStyle = await buildSystemStyle(ctx);
  const demoResult = await buildSnapshotDemoConfigs(ctx, components);
  const mediaIndexMap = new Map<string, { logicalPath: string; originalUrl: string; mimeType: string; sourceType: string; usedBy: string[] }>();

  const componentPayloads = components.map((component) => {
    const componentKey = `homeComponent:${component.type}:${slugify(component.title)}:${component.order}`;
    const baseConfig = demoResult.configOverrides.get(component._id as string)
      ?? (component.config ?? {}) as Record<string, unknown>;
    const finalConfig = rewriteConfigWithFallback(component.type, baseConfig, dependencies);

    const urls = new Set<string>();
    collectMediaUrls(finalConfig, urls);
    const mediaRefs = Array.from(urls).map((url, index) => {
      const ext = getExtensionFromUrl(url);
      const logicalPath = `snapshot-bundles/homepage/${slugify(component.type)}-${slugify(component.title)}-${component.order}-${index + 1}.${ext}`;
      const existing = mediaIndexMap.get(logicalPath);
      if (existing) {
        existing.usedBy.push(componentKey);
      } else {
        mediaIndexMap.set(logicalPath, {
          logicalPath,
          originalUrl: url,
          mimeType: getMimeFromExtension(ext) ?? 'application/octet-stream',
          sourceType: component.type,
          usedBy: [componentKey],
        });
      }
      return logicalPath;
    });

    return {
      componentKey,
      type: component.type,
      title: component.title,
      order: component.order,
      active: component.active,
      config: finalConfig,
      mediaRefs,
      fallbackUsed: ['Blog', 'ProductList', 'ProductGrid', 'ServiceList', 'ProductCategories', 'CategoryProducts', 'HomepageCategoryHero'].includes(component.type),
    };
  });

  const payload: HomepageSnapshotPayload = {
    manifest: {
      snapshotVersion: HOMEPAGE_SNAPSHOT_VERSION,
      exportedAt: new Date().toISOString(),
      sourceCoreVersion: 'system-vietadmin-nextjs',
      snapshotLabel: label?.trim() || `Homepage Snapshot ${new Date().toISOString().slice(0, 10)}`,
      componentCount: componentPayloads.length,
      capabilities: {
        supportsZip: true,
        supportsStaticFallback: true,
        supportsAppendImport: true,
      },
    },
    homepage: {
      components: componentPayloads,
      componentOrder: componentPayloads.map((item) => item.componentKey),
      dependencies,
      demoBundle: {
        componentData: {},
        integrity: { level: 'config-embedded', requiredMissing: [], warnings: [] },
        menus: demoResult.menus,
        modules: demoResult.modules,
        settings: demoResult.settings,
      },
      systemStyle,
    },
    index: {
      mediaIndex: Array.from(mediaIndexMap.values()),
    },
  };
  return normalizeHomepageSnapshotPayload(payload);
};

export const captureHomepageSnapshot = query({
  args: {
    label: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<HomepageSnapshotPayload> => {
    return buildHomepageSnapshotPayload(ctx, args.label);
  },
  returns: v.any(),
});

export const saveHomepageSnapshot = mutation({
  args: {
    category: v.optional(v.string()),
    label: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const payload = normalizeHomepageSnapshotPayload(args.payload as HomepageSnapshotPayload);
    // Generate unique slug from label
    let baseSlug = slugify(args.label);
    if (!baseSlug) baseSlug = `snapshot-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await ctx.db.query('homeComponentSnapshots').withIndex('by_slug', (q) => q.eq('slug', slug)).unique()) {
      slug = `${baseSlug}-${suffix++}`;
    }
    // Insert metadata-only vào homeComponentSnapshots (không có payload)
    const snapshotId = await ctx.db.insert('homeComponentSnapshots', {
      category: args.category || 'other',
      createdAt: Date.now(),
      label: args.label,
      payloadUpdatedAt: Date.now(),
      publicEnabled: false,
      slug,
      ...buildSnapshotSummary(payload),
      version: HOMEPAGE_SNAPSHOT_VERSION,
    });
    // Lưu payload vào bảng riêng — tránh đọc toàn document khi list metadata
    await ctx.db.insert('homeComponentSnapshotPayloads', {
      snapshotId,
      payload,
    });
    const customThumbnail = normalizeSnapshotCustomThumbnail(payload.gallery?.customThumbnail);
    if (customThumbnail) {
      await syncSnapshotCustomThumbnailFiles(ctx, snapshotId, undefined, customThumbnail);
    }
    return snapshotId;
  },
  returns: v.id('homeComponentSnapshots'),
});

export const saveCurrentHomepageSnapshot = mutation({
  args: {
    category: v.optional(v.string()),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const payload = await buildHomepageSnapshotPayload(ctx, args.label);
    let baseSlug = slugify(args.label);
    if (!baseSlug) baseSlug = `snapshot-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await ctx.db.query('homeComponentSnapshots').withIndex('by_slug', (q) => q.eq('slug', slug)).unique()) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const now = Date.now();
    const snapshotId = await ctx.db.insert('homeComponentSnapshots', {
      category: args.category || 'other',
      createdAt: now,
      label: args.label,
      payloadUpdatedAt: now,
      publicEnabled: false,
      slug,
      ...buildSnapshotSummary(payload),
      version: HOMEPAGE_SNAPSHOT_VERSION,
    });
    await ctx.db.insert('homeComponentSnapshotPayloads', {
      snapshotId,
      payload,
    });
    return snapshotId;
  },
  returns: v.id('homeComponentSnapshots'),
});

export const listHomepageSnapshots = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('homeComponentSnapshots').withIndex('by_createdAt').order('desc').take(100);
    return rows.map((row) => ({
      _id: row._id,
      category: row.category || 'other',
      createdAt: row.createdAt,
      label: row.label,
      version: row.version,
      componentCount: row.componentCount ?? 0,
      slug: row.slug ?? '',
      publicEnabled: row.publicEnabled ?? false,
    }));
  },
  returns: v.array(v.object({
    _id: v.id('homeComponentSnapshots'),
    category: v.string(),
    createdAt: v.number(),
    label: v.string(),
    version: v.string(),
    componentCount: v.number(),
    slug: v.string(),
    publicEnabled: v.boolean(),
  })),
});

export const captureHomepageSnapshotForZip = internalQuery({
  args: {
    label: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<HomepageSnapshotPayload> => {
    return buildHomepageSnapshotPayload(ctx, args.label);
  },
  returns: v.any(),
});

export const getHomepageSnapshotZipCache = internalQuery({
  args: { snapshotId: v.id('homeComponentSnapshots') },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) {return null;}
    return {
      label: snapshot.label,
      payloadUpdatedAt: snapshot.payloadUpdatedAt ?? snapshot.createdAt,
      zipBuiltAt: snapshot.zipBuiltAt ?? 0,
      zipBuilderVersion: snapshot.zipBuilderVersion ?? '',
      zipFileName: snapshot.zipFileName ?? '',
      zipMediaCount: snapshot.zipMediaCount ?? 0,
      zipStorageId: snapshot.zipStorageId ?? null,
      zipWarningCount: snapshot.zipWarningCount ?? 0,
    };
  },
  returns: v.any(),
});

export const getHomepageSnapshotZipInput = internalQuery({
  args: { snapshotId: v.id('homeComponentSnapshots') },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) {return null;}
    const payload = await loadSnapshotPayload(ctx, args.snapshotId as string) as HomepageSnapshotPayload | null;
    const customThumbnail = normalizeSnapshotCustomThumbnail(snapshot.customThumbnail);
    return {
      label: snapshot.label,
      payload: payload ? normalizeHomepageSnapshotPayload(withSnapshotCustomThumbnail(payload, customThumbnail)) : null,
      payloadUpdatedAt: snapshot.payloadUpdatedAt ?? snapshot.createdAt,
    };
  },
  returns: v.any(),
});

const deleteSnapshotZipStorage = async (
  ctx: MutationCtx,
  snapshot: Pick<Doc<'homeComponentSnapshots'>, 'zipStorageId'> | null | undefined,
) => {
  if (!snapshot?.zipStorageId) {return;}
  try {
    await ctx.storage.delete(snapshot.zipStorageId);
  } catch {
    // Storage file may already be gone.
  }
};

const clearHomepageSnapshotZipCache = async (
  ctx: MutationCtx,
  snapshotId: Id<'homeComponentSnapshots'>,
  snapshot?: Doc<'homeComponentSnapshots'> | null,
) => {
  const currentSnapshot = snapshot ?? await ctx.db.get(snapshotId);
  if (!currentSnapshot) {return;}
  await deleteSnapshotZipStorage(ctx, currentSnapshot);
  await ctx.db.patch(snapshotId, {
    zipBuiltAt: undefined,
    zipBuilderVersion: undefined,
    zipByteSize: undefined,
    zipFileName: undefined,
    zipMediaCount: undefined,
    zipPayloadHash: undefined,
    zipStorageId: undefined,
    zipWarningCount: undefined,
  });
};

export const markHomepageSnapshotZipReady = internalMutation({
  args: {
    builderVersion: v.string(),
    byteSize: v.number(),
    builtAt: v.number(),
    fileName: v.string(),
    mediaCount: v.number(),
    payloadHash: v.string(),
    snapshotId: v.id('homeComponentSnapshots'),
    storageId: v.id('_storage'),
    warningCount: v.number(),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (snapshot?.zipStorageId && snapshot.zipStorageId !== args.storageId) {
      await deleteSnapshotZipStorage(ctx, snapshot);
    }
    await ctx.db.patch(args.snapshotId, {
      zipBuiltAt: args.builtAt,
      zipBuilderVersion: args.builderVersion,
      zipByteSize: args.byteSize,
      zipFileName: args.fileName,
      zipMediaCount: args.mediaCount,
      zipPayloadHash: args.payloadHash,
      zipStorageId: args.storageId,
      zipWarningCount: args.warningCount,
    });
    return null;
  },
  returns: v.null(),
});

export const listHomepageSnapshotsWithPayload = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('homeComponentSnapshots').withIndex('by_createdAt').order('desc').take(100);
    return await Promise.all(rows.map(async (row) => {
      const payload = await loadSnapshotPayload(ctx, row._id as string) as HomepageSnapshotPayload | null;
      return {
        _id: row._id,
        createdAt: row.createdAt,
        label: row.label,
        version: row.version,
        slug: row.slug ?? '',
        publicEnabled: row.publicEnabled ?? false,
        payload: payload ? normalizeHomepageSnapshotPayload(payload) : null,
      };
    }));
  },
  returns: v.array(v.object({
    _id: v.id('homeComponentSnapshots'),
    createdAt: v.number(),
    label: v.string(),
    version: v.string(),
    slug: v.string(),
    publicEnabled: v.boolean(),
    payload: v.any(),
  })),
});

/**
 * Extract the first usable image URL from snapshot components.
 * Priority: Hero background → Hero image → first product image → first post image → logo.
 */
const extractSnapshotThumbnails = (components: Array<{ type: string; config: unknown; active: boolean }>, logo: string): string[] => {
  const images: string[] = [];
  const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|ogg)([?#]|$)/i;
  const IMAGE_FIELD_KEYS = new Set([
    'avatar',
    'avatarUrl',
    'backgroundImage',
    'cover',
    'coverImage',
    'image',
    'logo',
    'src',
    'thumbnail',
    'url',
  ]);
  const isImageUrl = (v: unknown): v is string => typeof v === 'string'
    && (/^https?:\/\//.test(v) || v.startsWith('/'))
    && !VIDEO_EXT.test(v);
  const addImage = (value: unknown) => {
    if (isImageUrl(value) && !images.includes(value)) {
      images.push(value);
    }
  };
  const collectKnownImages = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(collectKnownImages);
      return;
    }
    if (!value || typeof value !== 'object') {return;}

    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      if (IMAGE_FIELD_KEYS.has(key)) {
        addImage(child);
      }
      if (Array.isArray(child) || (child && typeof child === 'object')) {
        collectKnownImages(child);
      }
    });
  };

  for (const comp of components) {
    if (!comp.active) continue;
    const cfg = (comp.config ?? {}) as Record<string, unknown>;

    // Hero images
    if (comp.type === 'Hero') {
      addImage(cfg.backgroundImage);
      addImage(cfg.image);
      addImage(cfg.url);
      const slides = cfg.slides as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(slides)) {
        for (const slide of slides.slice(0, 6)) {
          addImage(slide.backgroundImage);
          addImage(slide.image);
          addImage(slide.url);
        }
      }
    }

    collectKnownImages(cfg);

    // Product images (from embedded demo data)
    if ((comp.type === 'ProductList' || comp.type === 'ProductGrid') && Array.isArray(cfg.demoProducts)) {
      for (const p of (cfg.demoProducts as Array<Record<string, unknown>>).slice(0, 4)) {
        addImage(p.image);
        addImage(p.url);
        addImage(p.thumbnail);
      }
    }

    // Blog images
    if (comp.type === 'Blog' && Array.isArray(cfg.demoPosts)) {
      for (const p of (cfg.demoPosts as Array<Record<string, unknown>>).slice(0, 3)) {
        addImage(p.image);
        addImage(p.url);
        addImage(p.thumbnail);
      }
    }

    // Service images
    if (comp.type === 'ServiceList' && Array.isArray(cfg.demoServices)) {
      for (const s of (cfg.demoServices as Array<Record<string, unknown>>).slice(0, 3)) {
        addImage(s.image);
        addImage(s.url);
        addImage(s.thumbnail);
      }
    }

    if (images.length >= 6) break; // enough for a rich thumbnail
  }

  if (images.length === 0) {addImage(logo);}
  return images.slice(0, 6);
};

function buildSnapshotSummary(payload: HomepageSnapshotPayload) {
  const demoBundle = payload.homepage.demoBundle as Record<string, unknown> | undefined;
  const settings = demoBundle?.settings as Record<string, unknown> | undefined;
  const site = (settings?.site ?? {}) as Record<string, string>;
  const contact = (settings?.contact ?? {}) as Record<string, string>;
  const components = payload.homepage.components ?? [];
  const logo = site.site_logo || '';
  const activeSections = components.filter((component) => component.active);
  const customThumbnail = normalizeSnapshotCustomThumbnail(payload.gallery?.customThumbnail);
  const autoThumbnails = extractSnapshotThumbnails(components, logo);
  return {
    address: contact.contact_address || '',
    brandMode: site.site_brand_mode || 'dual',
    brandName: site.site_name || '',
    brandPrimary: site.site_brand_primary || '#3b82f6',
    brandSecondary: site.site_brand_secondary || '',
    componentCount: activeSections.length,
    componentTypes: [...new Set(activeSections.map((component) => component.type))],
    logo,
    phone: contact.contact_phone || '',
    sectionTitles: activeSections.map((component) => component.title).filter(Boolean).slice(0, 6),
    tagline: site.site_tagline || '',
    ...(customThumbnail ? { customThumbnail } : {}),
    thumbnails: buildEffectiveSnapshotThumbnails(autoThumbnails, customThumbnail),
  };
}

export const listPublicSnapshots = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query('homeComponentSnapshots')
      .withIndex('by_publicEnabled_and_createdAt', (q) => q.eq('publicEnabled', true))
      .order('desc')
      .take(100);
    return rows.map((row) => {
      const customThumbnail = normalizeSnapshotCustomThumbnail(row.customThumbnail);
      return {
        _id: row._id,
        address: row.address ?? '',
        brandMode: row.brandMode ?? 'dual',
        brandName: row.brandName ?? '',
        brandPrimary: row.brandPrimary ?? '#3b82f6',
        brandSecondary: row.brandSecondary ?? '',
        category: row.category || 'other',
        componentCount: row.componentCount ?? 0,
        componentTypes: row.componentTypes ?? [],
        createdAt: row.createdAt,
        customThumbnail: customThumbnail ?? null,
        label: row.label,
        logo: row.logo ?? '',
        phone: row.phone ?? '',
        sectionTitles: row.sectionTitles ?? [],
        slug: row.slug ?? '',
        tagline: row.tagline ?? '',
        thumbnails: buildEffectiveSnapshotThumbnails(row.thumbnails ?? [], customThumbnail),
      };
    });
  },
  returns: v.array(v.object({
    _id: v.id('homeComponentSnapshots'),
    address: v.string(),
    brandMode: v.string(),
    brandName: v.string(),
    brandPrimary: v.string(),
    brandSecondary: v.string(),
    category: v.string(),
    componentCount: v.number(),
    componentTypes: v.array(v.string()),
    createdAt: v.number(),
    customThumbnail: v.union(snapshotCustomThumbnailValidator, v.null()),
    label: v.string(),
    slug: v.string(),
    tagline: v.string(),
    logo: v.string(),
    phone: v.string(),
    sectionTitles: v.array(v.string()),
    thumbnails: v.array(v.string()),
  })),
});

export const getHomepageSnapshotById = query({
  args: { snapshotId: v.id('homeComponentSnapshots') },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) return null;
    const payload = await loadSnapshotPayload(ctx, args.snapshotId as string) as HomepageSnapshotPayload | null;
    const customThumbnail = normalizeSnapshotCustomThumbnail(snapshot.customThumbnail);
    return {
      ...snapshot,
      ...(customThumbnail ? { customThumbnail } : {}),
      payload: payload ? normalizeHomepageSnapshotPayload(withSnapshotCustomThumbnail(payload, customThumbnail)) : null,
    };
  },
  returns: v.union(v.object({
    _id: v.id('homeComponentSnapshots'),
    _creationTime: v.number(),
    category: v.optional(v.string()),
    createdAt: v.number(),
    label: v.string(),
    address: v.optional(v.string()),
    brandMode: v.optional(v.string()),
    brandName: v.optional(v.string()),
    brandPrimary: v.optional(v.string()),
    brandSecondary: v.optional(v.string()),
    componentCount: v.optional(v.number()),
    componentTypes: v.optional(v.array(v.string())),
    customThumbnail: v.optional(snapshotCustomThumbnailValidator),
    logo: v.optional(v.string()),
    payload: v.any(),
    payloadUpdatedAt: v.optional(v.number()),
    phone: v.optional(v.string()),
    publicEnabled: v.optional(v.boolean()),
    sectionTitles: v.optional(v.array(v.string())),
    slug: v.optional(v.string()),
    tagline: v.optional(v.string()),
    thumbnails: v.optional(v.array(v.string())),
    version: v.string(),
    zipBuiltAt: v.optional(v.number()),
    zipBuilderVersion: v.optional(v.string()),
    zipByteSize: v.optional(v.number()),
    zipFileName: v.optional(v.string()),
    zipMediaCount: v.optional(v.number()),
    zipPayloadHash: v.optional(v.string()),
    zipStorageId: v.optional(v.id('_storage')),
    zipWarningCount: v.optional(v.number()),
  }), v.null()),
});

export const getHomepageSnapshotDemoById = query({
  args: { snapshotId: v.id('homeComponentSnapshots') },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) {return null;}
    const rawPayload = await loadSnapshotPayload(ctx, args.snapshotId as string) as HomepageSnapshotPayload | null;
    if (!rawPayload) {return null;}
    const payload = normalizeHomepageSnapshotPayload(rawPayload);
    const bundle = (payload.homepage.demoBundle ?? null) as Record<string, unknown> | null;
    return {
      bundle,
      components: payload.homepage.components.map((component, index) => ({
        _id: component.componentKey,
        active: component.active,
        config: component.config as Record<string, unknown>,
        order: index,
        title: component.title,
        type: component.type,
      })),
      label: snapshot.label,
      systemStyle: payload.homepage.systemStyle ?? null,
    };
  },
  returns: v.union(v.object({
    bundle: v.union(v.any(), v.null()),
    components: v.array(v.object({
      _id: v.string(),
      active: v.boolean(),
      config: v.any(),
      order: v.number(),
      title: v.string(),
      type: v.string(),
    })),
    label: v.string(),
    systemStyle: v.union(v.any(), v.null()),
  }), v.null()),
});

export const removeHomepageSnapshot = mutation({
  args: { snapshotId: v.id('homeComponentSnapshots') },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    const customThumbnail = normalizeSnapshotCustomThumbnail(snapshot?.customThumbnail);
    const previousStorageIds = await collectSnapshotThumbnailStorageIds(ctx, customThumbnail);
    await deleteSnapshotZipStorage(ctx, snapshot);
    // Xóa payload row trước để không còn orphan
    const payloadRow = await ctx.db
      .query('homeComponentSnapshotPayloads')
      .withIndex('by_snapshotId', (q) => q.eq('snapshotId', args.snapshotId))
      .unique();
    if (payloadRow) await ctx.db.delete(payloadRow._id);
    await removeOwnerFilesAndCleanup(ctx, {
      ownerId: args.snapshotId,
      ownerTable: 'homeComponentSnapshots',
    }, {
      previousStorageIds,
    });
    await ctx.db.delete(args.snapshotId);
    return null;
  },
  returns: v.null(),
});

export const toggleSnapshotPublic = mutation({
  args: {
    snapshotId: v.id('homeComponentSnapshots'),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.snapshotId, { publicEnabled: args.enabled });
    return { ok: true };
  },
  returns: v.object({ ok: v.boolean() }),
});

export const updateSnapshotCategory = mutation({
  args: {
    snapshotId: v.id('homeComponentSnapshots'),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.snapshotId, { category: args.category });
    return { ok: true };
  },
  returns: v.object({ ok: v.boolean() }),
});

export const updateHomepageSnapshot = mutation({
  args: {
    snapshotId: v.id('homeComponentSnapshots'),
    label: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) {
      throw new Error('Không tìm thấy snapshot');
    }

    const nextPayload = normalizeHomepageSnapshotPayload(args.payload as HomepageSnapshotPayload);
    const report = buildReport(nextPayload);
    if (report.summary.blocking > 0) {
      throw new Error(report.errors[0]?.message ?? 'Snapshot không hợp lệ');
    }
    const previousThumbnail = normalizeSnapshotCustomThumbnail(snapshot.customThumbnail);
    const nextThumbnail = normalizeSnapshotCustomThumbnail(nextPayload.gallery?.customThumbnail);
    await clearHomepageSnapshotZipCache(ctx, args.snapshotId, snapshot);

    // Cập nhật metadata (không có payload)
    await ctx.db.patch(args.snapshotId, {
      label: args.label.trim() || snapshot.label,
      payloadUpdatedAt: Date.now(),
      customThumbnail: nextThumbnail ?? undefined,
      ...buildSnapshotSummary(nextPayload),
      zipBuiltAt: undefined,
      zipBuilderVersion: undefined,
      zipByteSize: undefined,
      zipFileName: undefined,
      zipMediaCount: undefined,
      zipPayloadHash: undefined,
      zipStorageId: undefined,
      zipWarningCount: undefined,
    });

    // Upsert payload trong bảng riêng
    const existingPayloadRow = await ctx.db
      .query('homeComponentSnapshotPayloads')
      .withIndex('by_snapshotId', (q) => q.eq('snapshotId', args.snapshotId))
      .unique();
    if (existingPayloadRow) {
      await ctx.db.patch(existingPayloadRow._id, { payload: nextPayload });
    } else {
      await ctx.db.insert('homeComponentSnapshotPayloads', { snapshotId: args.snapshotId, payload: nextPayload });
    }
    await syncSnapshotCustomThumbnailFiles(ctx, args.snapshotId, previousThumbnail, nextThumbnail);

    return { ok: true };
  },
  returns: v.object({ ok: v.boolean() }),
});

const QUICK_SYNC_NO_SPACING_TYPES = new Set(['Hero', 'HomepageCategoryHero']);

const isRecordObject = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const quickSyncSingleComponent = (component: any): any => {
  const config = isRecordObject(component.config) ? component.config : {};
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

  if (isRecordObject(config.content)) {
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

const getQuickSyncedReorderedComponentsArray = (components: any[]): any[] => {
  const synced = components.map(quickSyncSingleComponent);
  const others = synced.filter(c => c.type !== 'SpeedDial' && c.type !== 'Footer');
  const speedDials = synced.filter(c => c.type === 'SpeedDial');
  const footers = synced.filter(c => c.type === 'Footer');

  return [...others, ...speedDials, ...footers].map((c, index) => ({
    ...c,
    order: index,
  }));
};

export const quickSyncAllSnapshots = mutation({
  args: {},
  handler: async (ctx) => {
    const snapshots = await ctx.db.query('homeComponentSnapshots').collect();
    let count = 0;
    for (const snapshot of snapshots) {
      const payload = await loadSnapshotPayload(ctx, snapshot._id as string) as HomepageSnapshotPayload | null;
      if (!payload) continue;

      const normalized = normalizeHomepageSnapshotPayload(payload);
      const components = normalized.homepage?.components ?? [];
      const updatedComponents = getQuickSyncedReorderedComponentsArray(components);

      const nextPayload: HomepageSnapshotPayload = {
        ...normalized,
        manifest: {
          ...normalized.manifest,
          componentCount: updatedComponents.length,
        },
        homepage: {
          ...normalized.homepage,
          componentOrder: updatedComponents.map((c: any) => c.componentKey),
          components: updatedComponents,
        },
      };

      // Upsert payload trong bảng riêng
      const existingPayloadRow = await ctx.db
        .query('homeComponentSnapshotPayloads')
        .withIndex('by_snapshotId', (q) => q.eq('snapshotId', snapshot._id))
        .unique();
      if (existingPayloadRow) {
        await ctx.db.patch(existingPayloadRow._id, { payload: nextPayload });
      } else {
        await ctx.db.insert('homeComponentSnapshotPayloads', { snapshotId: snapshot._id, payload: nextPayload });
      }

      // Patch snapshot metadata
      await ctx.db.patch(snapshot._id, {
        payloadUpdatedAt: Date.now(),
        ...buildSnapshotSummary(nextPayload),
        zipBuiltAt: undefined, // Clear cache zip
        zipBuilderVersion: undefined,
        zipByteSize: undefined,
        zipFileName: undefined,
        zipMediaCount: undefined,
        zipPayloadHash: undefined,
        zipStorageId: undefined,
        zipWarningCount: undefined,
      });

      count++;
    }
    return { count };
  },
  returns: v.object({ count: v.number() }),
});

export const backfillHomepageSnapshotSummaries = mutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('homeComponentSnapshots')
      .withIndex('by_createdAt')
      .order('desc')
      .take(Math.min(args.batchSize ?? 50, 100));
    let updated = 0;
    for (const row of rows) {
      const payload = await loadSnapshotPayload(ctx, row._id as string) as HomepageSnapshotPayload | null;
      if (!payload) continue;
      await ctx.db.patch(row._id, buildSnapshotSummary(normalizeHomepageSnapshotPayload(payload)));
      updated += 1;
    }
    return { updated };
  },
  returns: v.object({ updated: v.number() }),
});

export const getHomepageSnapshotBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.query('homeComponentSnapshots').withIndex('by_slug', (q) => q.eq('slug', args.slug)).unique();
    if (!snapshot || !snapshot.publicEnabled) return null;
    const rawPayload = await loadSnapshotPayload(ctx, snapshot._id as string) as HomepageSnapshotPayload | null;
    if (!rawPayload) return null;
    const payload = normalizeHomepageSnapshotPayload(rawPayload);
    const bundle = (payload.homepage.demoBundle ?? null) as Record<string, unknown> | null;
    return {
      bundle,
      components: payload.homepage.components.map((component, index) => ({
        _id: component.componentKey,
        active: component.active,
        config: component.config as Record<string, unknown>,
        order: index,
        title: component.title,
        type: component.type,
      })),
      category: snapshot.category || 'other',
      label: snapshot.label,
      systemStyle: payload.homepage.systemStyle,
    };
  },
  returns: v.union(v.any(), v.null()),
});

const buildReport = (payload: HomepageSnapshotPayload): HomepageSnapshotImportReport => {
  const errors: HomepageSnapshotImportReport['errors'] = [];
  const warnings: HomepageSnapshotImportReport['warnings'] = [];

  if (!payload?.manifest || payload.manifest.snapshotVersion !== HOMEPAGE_SNAPSHOT_VERSION) {
    const supported = new Set([HOMEPAGE_SNAPSHOT_VERSION, HOMEPAGE_SNAPSHOT_VERSION_V2]);
    if (!payload?.manifest || !supported.has(payload.manifest.snapshotVersion)) {
      errors.push({ code: 'SNAPSHOT_VERSION_UNSUPPORTED', severity: 'blocking', message: 'Snapshot version không tương thích', file: 'manifest.json' });
    }
  }

  payload.homepage.components.forEach((component) => {
    if (!component.type || !component.title) {
      errors.push({
        code: 'SNAPSHOT_COMPONENT_INVALID',
        severity: 'blocking',
        message: 'Component thiếu type hoặc title',
        componentKey: component.componentKey,
        file: 'homepage/components.json',
      });
    }
    if (component.fallbackUsed) {
      const hasFallback =
        Boolean((component.config as any)?.fallbackPosts?.length) ||
        Boolean((component.config as any)?.fallbackProducts?.length) ||
        Boolean((component.config as any)?.fallbackServices?.length) ||
        Boolean((component.config as any)?.fallbackCategories?.length);
      if (!hasFallback) {
        warnings.push({
          code: 'SNAPSHOT_FALLBACK_EMPTY',
          severity: 'warning',
          message: 'Component có dependency động nhưng snapshot fallback rỗng',
          componentKey: component.componentKey,
          file: 'homepage/components.json',
        });
      }
    }
  });

  const integrity = payload.homepage.demoBundle && typeof payload.homepage.demoBundle === 'object'
    ? (payload.homepage.demoBundle as { integrity?: { requiredMissing?: string[] } }).integrity
    : null;
  if (integrity?.requiredMissing && integrity.requiredMissing.length > 0) {
    errors.push({
      code: 'SNAPSHOT_DEMO_BUNDLE_INCOMPLETE',
      severity: 'blocking',
      message: `Thiếu dữ liệu demo bắt buộc: ${integrity.requiredMissing.join(', ')}`,
      file: 'homepage/demo-bundle.json',
    });
  }

  return {
    summary: {
      blocking: errors.length,
      warnings: warnings.length,
    },
    errors,
    warnings,
  };
};

export const preflightHomepageSnapshot = mutation({
  args: {
    payload: v.any(),
  },
  handler: async (_ctx, args) => {
    return buildReport(normalizeHomepageSnapshotPayload(args.payload as HomepageSnapshotPayload));
  },
  returns: v.any(),
});

const uploadedMediaMapValidator = v.optional(v.record(v.string(), v.object({
  url: v.string(),
  storageId: v.optional(v.union(v.string(), v.null())),
})));

type UploadedMediaMap = Record<string, { url: string; storageId?: string | null }>;

const isStorageIdKey = (key: string) => key === 'storageId' || key.endsWith('StorageId');

const replaceMediaUrls = (value: unknown, uploadedMediaMap: UploadedMediaMap): unknown => {
  if (typeof value === 'string') {
    return uploadedMediaMap[value]?.url ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceMediaUrls(item, uploadedMediaMap));
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const siblingStorageId = Object.values(record)
      .map((item) => (typeof item === 'string' ? uploadedMediaMap[item]?.storageId : null))
      .find((storageId): storageId is string => typeof storageId === 'string' && storageId.length > 0);
    return Object.fromEntries(
      Object.entries(record).map(([key, item]) => {
        if (siblingStorageId && isStorageIdKey(key) && typeof item === 'string') {
          return [key, siblingStorageId];
        }
        return [key, replaceMediaUrls(item, uploadedMediaMap)];
      }),
    );
  }
  return value;
};

const rebuildHomeComponentStats = async (ctx: any) => {
  const [stats, components] = await Promise.all([
    ctx.db.query('homeComponentStats').take(500),
    ctx.db.query('homeComponents').take(500),
  ]);

  await Promise.all(stats.map((item: any) => ctx.db.delete(item._id)));

  const counts: Record<string, number> = {
    active: 0,
    inactive: 0,
    total: components.length,
  };

  for (const component of components) {
    counts[component.active ? 'active' : 'inactive'] += 1;
    counts[component.type] = (counts[component.type] ?? 0) + 1;
  }

  await Promise.all(
    Object.entries(counts).map(([key, count]) => ctx.db.insert('homeComponentStats', { count, key })),
  );
};

const buildMediaReplacementMap = (
  payload: HomepageSnapshotPayload,
  uploadedMediaMap: UploadedMediaMap,
): UploadedMediaMap => {
  const map: UploadedMediaMap = { ...uploadedMediaMap };
  for (const media of payload.index?.mediaIndex ?? []) {
    const replacement = map[media.logicalPath] ?? map[media.originalUrl];
    if (!replacement) {continue;}
    map[media.logicalPath] = replacement;
    map[media.originalUrl] = replacement;
  }
  return map;
};

const rewriteSnapshotPayloadMedia = (
  payload: HomepageSnapshotPayload,
  mediaReplacementMap: UploadedMediaMap,
): HomepageSnapshotPayload => {
  const rewrite = (value: unknown) => replaceMediaUrls(value, mediaReplacementMap);
  const homepage: HomepageSnapshotPayload['homepage'] = {
    ...payload.homepage,
    components: payload.homepage.components.map((component) => ({
      ...component,
      config: rewrite(component.config),
      mediaRefs: [],
    })),
    dependencies: rewrite(payload.homepage.dependencies) as SnapshotDependencyCapture,
    systemStyle: rewrite(payload.homepage.systemStyle) as SnapshotSystemStylePayload,
  };
  if (payload.homepage.demoBundle !== undefined) {
    homepage.demoBundle = rewrite(payload.homepage.demoBundle) as Record<string, unknown>;
  }

  const nextPayload: HomepageSnapshotPayload = {
    ...payload,
    homepage,
    index: {
      mediaIndex: [],
    },
  };
  if (payload.gallery?.customThumbnail) {
    nextPayload.gallery = { customThumbnail: rewrite(payload.gallery.customThumbnail) as SnapshotCustomThumbnail };
  } else {
    delete nextPayload.gallery;
  }
  return normalizeHomepageSnapshotPayload(nextPayload);
};

const upsertSnapshotSetting = async (ctx: any, group: string, key: string, value: unknown) => {
  const existing = await ctx.db.query('settings').withIndex('by_key', (q: any) => q.eq('key', key)).unique();
  if (existing) {
    await ctx.db.patch(existing._id, { group, value });
    return;
  }
  await ctx.db.insert('settings', { group, key, value });
};

const IMAGE_SETTING_KEYS = new Set(['seo_og_image', 'site_favicon', 'site_logo']);
const SETTING_STORAGE_ID_SUFFIX = '__storageId';

const restoreSnapshotSettings = async (
  ctx: any,
  payload: HomepageSnapshotPayload,
  mediaReplacementMap: UploadedMediaMap,
) => {
  const rewrite = (value: unknown) => replaceMediaUrls(value, mediaReplacementMap);
  const style = payload.homepage.systemStyle;
  if (style) {
    await Promise.all([
      upsertSnapshotSetting(ctx, 'home_components', 'create_hidden_types', style.hiddenTypes),
      upsertSnapshotSetting(ctx, 'home_components', 'type_color_overrides', style.typeColorOverrides),
      upsertSnapshotSetting(ctx, 'home_components', 'type_font_overrides', style.typeFontOverrides),
      upsertSnapshotSetting(ctx, 'home_components', 'global_font_override', style.globalFontOverride),
    ]);
  }

  const demoBundle = payload.homepage.demoBundle as Record<string, unknown> | undefined;
  const demoBundleSettings = demoBundle?.settings as Record<string, unknown> | undefined;
  if (!demoBundleSettings) {return;}

  const restoreGroup = async (
    group: 'contact' | 'seo' | 'site' | 'social',
    value: unknown,
    keys: readonly string[],
  ) => {
    const source = value as Record<string, unknown> | undefined;
    if (!source) {return;}
    await Promise.all(keys.map(async (key) => {
      const rawValue = source[key] ?? '';
      await upsertSnapshotSetting(ctx, group, key, rewrite(rawValue));
      const storageId = typeof rawValue === 'string' ? mediaReplacementMap[rawValue]?.storageId : null;
      if (storageId && IMAGE_SETTING_KEYS.has(key)) {
        await upsertSnapshotSetting(ctx, group, `${key}${SETTING_STORAGE_ID_SUFFIX}`, storageId);
      }
    }));
  };

  await Promise.all([
    restoreGroup('contact', demoBundleSettings.contact, SNAPSHOT_REQUIRED_SETTINGS_KEYS.contact),
    restoreGroup('site', demoBundleSettings.site, SNAPSHOT_REQUIRED_SETTINGS_KEYS.site),
    restoreGroup('social', demoBundleSettings.social, SNAPSHOT_REQUIRED_SETTINGS_KEYS.social),
    restoreGroup('seo', demoBundleSettings.seo, SNAPSHOT_REQUIRED_SETTINGS_KEYS.seo),
  ]);

  const snapshotHeader = demoBundleSettings.header as { header_style?: string; header_config?: Record<string, unknown> } | undefined;
  if (snapshotHeader) {
    const headerOps: Promise<void>[] = [];
    if (snapshotHeader.header_style != null) {
      headerOps.push(upsertSnapshotSetting(ctx, 'site', 'header_style', snapshotHeader.header_style));
    }
    if (snapshotHeader.header_config != null) {
      headerOps.push(upsertSnapshotSetting(ctx, 'site', 'header_config', rewrite(snapshotHeader.header_config)));
    }
    if (headerOps.length > 0) {
      await Promise.all(headerOps);
    }
  }

  const snapshotRouting = demoBundleSettings.routing as { ia_route_mode?: string } | undefined;
  if (snapshotRouting?.ia_route_mode != null) {
    await upsertSnapshotSetting(ctx, 'ia', 'ia_route_mode', snapshotRouting.ia_route_mode);
  }
};

type SnapshotZipWarning = {
  logicalPath: string;
  message: string;
  sourceUrl: string;
};

type SnapshotZipBuildResult = {
  blob: Blob;
  mediaCount: number;
  warnings: SnapshotZipWarning[];
};

const toJsonFile = (value: unknown) => JSON.stringify(value, null, 2);

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
};

const sha256 = async (value: string) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const toFileNamePart = (value: string | undefined, fallback: string) => {
  const safeValue = (value ?? '')
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[đĐ]/g, 'd')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safeValue || fallback;
};

const formatSnapshotFileDate = (value?: string) => {
  const parsed = value ? new Date(value) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
};

const getSnapshotSiteName = (payload: HomepageSnapshotPayload) => {
  const demoBundle = payload.homepage.demoBundle as Record<string, unknown> | undefined;
  const settings = demoBundle?.settings as Record<string, unknown> | undefined;
  const site = settings?.site as Record<string, unknown> | undefined;
  const siteName = site?.site_name;
  return typeof siteName === 'string' && siteName.trim() ? siteName.trim() : undefined;
};

const toSnapshotFileName = (payload: HomepageSnapshotPayload, fallbackLabel?: string) => {
  const label = toFileNamePart(fallbackLabel ?? payload.manifest.snapshotLabel, 'snapshot');
  const date = formatSnapshotFileDate(payload.manifest.exportedAt);
  const siteName = toFileNamePart(getSnapshotSiteName(payload), 'website');
  return `${label}-${date}-${siteName}.zip`;
};

const safeZipPath = (path: string, fallback: string) => {
  const safe = path
    .replaceAll('\\', '/')
    .split('/')
    .filter((part) => part && part !== '..' && !part.includes(':'))
    .join('/');
  return safe || fallback;
};

const snapshotJsonFiles = (payload: HomepageSnapshotPayload) => ({
  'manifest.json': toJsonFile(payload.manifest),
  'homepage/components.json': toJsonFile(payload.homepage.components),
  'homepage/component-order.json': toJsonFile(payload.homepage.componentOrder),
  'homepage/dependencies.json': toJsonFile(payload.homepage.dependencies),
  'homepage/system-style.json': toJsonFile(payload.homepage.systemStyle),
  'homepage/demo-bundle.json': toJsonFile(payload.homepage.demoBundle ?? null),
  'gallery/thumbnail.json': toJsonFile(payload.gallery?.customThumbnail ?? null),
  'index/media.index.json': toJsonFile(payload.index.mediaIndex),
  'reports/import-preview.json': toJsonFile({
    summary: { blocking: 0, warnings: 0 },
    errors: [],
    warnings: [],
  } satisfies HomepageSnapshotImportReport),
});

const normalizeBaseUrl = (value: unknown) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {return undefined;}
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {return undefined;}
    return parsed.origin;
  } catch {
    return undefined;
  }
};

const getSnapshotMediaBaseUrl = (payload: HomepageSnapshotPayload) => {
  const demoBundle = payload.homepage.demoBundle as Record<string, unknown> | undefined;
  const settings = demoBundle?.settings as Record<string, unknown> | undefined;
  const site = settings?.site as Record<string, unknown> | undefined;
  const siteUrl = normalizeBaseUrl(site?.site_url);
  if (siteUrl) {return siteUrl;}

  const envSiteUrl = typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VERCEL_URL
    : undefined;
  const vercelUrl = typeof process !== 'undefined' ? process.env.VERCEL_URL : undefined;
  if (envSiteUrl === vercelUrl && envSiteUrl && !/^https?:\/\//i.test(envSiteUrl)) {
    return normalizeBaseUrl(`https://${envSiteUrl}`);
  }
  return normalizeBaseUrl(envSiteUrl);
};

const resolveMediaFetchUrl = (url: string, baseUrl?: string) => {
  const trimmed = url.trim();
  const source = extractNextImageSource(trimmed) ?? trimmed;
  if (isHttpUrl(source) || isDataMediaUrl(source)) {return source;}
  if (isRelativeUrl(source) && baseUrl) {
    return new URL(source, baseUrl).toString();
  }
  if (isRelativeUrl(source)) {
    throw new Error('Media dùng URL tương đối nhưng snapshot không có site_url để export ZIP');
  }
  return source;
};

const fetchMediaData = async (url: string, baseUrl?: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SNAPSHOT_MEDIA_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(resolveMediaFetchUrl(url, baseUrl), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Fetch media thất bại: ${response.status}`);
    }
    const contentType = response.headers.get('Content-Type')?.split(';')[0]?.trim() || 'application/octet-stream';
    return {
      data: await response.arrayBuffer(),
      mimeType: contentType,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const buildHomepageSnapshotZipBlob = async (payload: HomepageSnapshotPayload): Promise<SnapshotZipBuildResult> => {
  const normalizedPayload = normalizeHomepageSnapshotPayload(payload);
  const JSZipModule = await import('jszip');
  const JSZip = JSZipModule.default;
  const zip = new JSZip();

  Object.entries(snapshotJsonFiles(normalizedPayload)).forEach(([path, content]) => zip.file(path, content));

  const exportWarnings: SnapshotZipWarning[] = [];
  const mediaEntries = normalizedPayload.index.mediaIndex;
  const mediaBaseUrl = getSnapshotMediaBaseUrl(normalizedPayload);
  for (let i = 0; i < mediaEntries.length; i += SNAPSHOT_MEDIA_FETCH_CONCURRENCY) {
    const batch = mediaEntries.slice(i, i + SNAPSHOT_MEDIA_FETCH_CONCURRENCY);
    await Promise.all(batch.map(async (media, batchIndex) => {
      const position = i + batchIndex;
      const logicalPath = safeZipPath(media.logicalPath, `snapshot-bundles/homepage/media-${position + 1}.bin`);
      try {
        const file = await fetchMediaData(media.originalUrl, mediaBaseUrl);
        const ext = getExtensionFromMime(file.mimeType);
        const zipPath = logicalPath.endsWith('.bin') && ext !== 'bin'
          ? logicalPath.replace(/\.bin$/i, `.${ext}`)
          : logicalPath;
        zip.file(zipPath, file.data, {
          binary: true,
          date: new Date(normalizedPayload.manifest.exportedAt),
        });
        media.mimeType = file.mimeType;
        media.logicalPath = zipPath;
      } catch (error) {
        exportWarnings.push({
          logicalPath,
          message: error instanceof Error ? error.message : 'Không tải được media',
          sourceUrl: media.originalUrl,
        });
      }
    }));
  }

  zip.file('index/media.index.json', toJsonFile(normalizedPayload.index.mediaIndex));
  zip.file('reports/export-warnings.json', toJsonFile(exportWarnings));
  const zipBuffer = await zip.generateAsync({
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    type: 'arraybuffer',
  });
  return {
    blob: new Blob([zipBuffer], { type: 'application/zip' }),
    mediaCount: mediaEntries.length,
    warnings: exportWarnings,
  };
};

const snapshotZipActionReturn = v.object({
  cached: v.boolean(),
  fileName: v.string(),
  mediaCount: v.number(),
  url: v.string(),
  warningCount: v.number(),
});

export const exportCurrentHomepageSnapshotZip = action({
  args: {
    label: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    cached: boolean;
    fileName: string;
    mediaCount: number;
    url: string;
    warningCount: number;
  }> => {
    const payload: HomepageSnapshotPayload = await ctx.runQuery(internal.homepageSnapshots.captureHomepageSnapshotForZip, {
      label: args.label,
    });
    const fileName = toSnapshotFileName(payload);
    const result = await buildHomepageSnapshotZipBlob(payload);
    const storageId = await ctx.storage.store(result.blob);
    const url = await ctx.storage.getUrl(storageId);
    if (!url) {
      throw new Error('Không tạo được URL tải snapshot ZIP');
    }
    return {
      cached: false,
      fileName,
      mediaCount: result.mediaCount,
      url,
      warningCount: result.warnings.length,
    };
  },
  returns: snapshotZipActionReturn,
});

export const exportSavedHomepageSnapshotZip = action({
  args: {
    snapshotId: v.id('homeComponentSnapshots'),
  },
  handler: async (ctx, args): Promise<{
    cached: boolean;
    fileName: string;
    mediaCount: number;
    url: string;
    warningCount: number;
  }> => {
    const cache = await ctx.runQuery(internal.homepageSnapshots.getHomepageSnapshotZipCache, {
      snapshotId: args.snapshotId,
    }) as {
      label: string;
      payloadUpdatedAt: number;
      zipBuiltAt: number;
      zipBuilderVersion: string;
      zipFileName: string;
      zipMediaCount: number;
      zipStorageId: Id<'_storage'> | null;
      zipWarningCount: number;
    } | null;
    if (!cache) {
      throw new Error('Snapshot không tồn tại');
    }

    if (
      cache.zipStorageId
      && cache.zipBuilderVersion === SNAPSHOT_ZIP_BUILDER_VERSION
      && cache.zipBuiltAt >= cache.payloadUpdatedAt
    ) {
      const cachedUrl = await ctx.storage.getUrl(cache.zipStorageId);
      if (cachedUrl) {
        return {
          cached: true,
          fileName: cache.zipFileName || `${toFileNamePart(cache.label, 'snapshot')}-${formatSnapshotFileDate()}-website.zip`,
          mediaCount: cache.zipMediaCount,
          url: cachedUrl,
          warningCount: cache.zipWarningCount,
        };
      }
    }

    const input = await ctx.runQuery(internal.homepageSnapshots.getHomepageSnapshotZipInput, {
      snapshotId: args.snapshotId,
    }) as { label: string; payload: HomepageSnapshotPayload | null } | null;
    if (!input?.payload) {
      throw new Error('Payload snapshot không tìm thấy');
    }

    const payload = normalizeHomepageSnapshotPayload(input.payload);
    const payloadHash = await sha256(stableStringify(payload));
    const fileName = toSnapshotFileName(payload, input.label);
    const result = await buildHomepageSnapshotZipBlob(payload);
    const storageId = await ctx.storage.store(result.blob);
    const url = await ctx.storage.getUrl(storageId);
    if (!url) {
      throw new Error('Không tạo được URL tải snapshot ZIP');
    }

    await ctx.runMutation(internal.homepageSnapshots.markHomepageSnapshotZipReady, {
      builderVersion: SNAPSHOT_ZIP_BUILDER_VERSION,
      builtAt: Date.now(),
      byteSize: result.blob.size,
      fileName,
      mediaCount: result.mediaCount,
      payloadHash,
      snapshotId: args.snapshotId,
      storageId,
      warningCount: result.warnings.length,
    });

    return {
      cached: false,
      fileName,
      mediaCount: result.mediaCount,
      url,
      warningCount: result.warnings.length,
    };
  },
  returns: snapshotZipActionReturn,
});

export const saveImportedHomepageSnapshot = mutation({
  args: {
    category: v.optional(v.string()),
    label: v.optional(v.string()),
    payload: v.any(),
    uploadedMediaMap: uploadedMediaMapValidator,
  },
  handler: async (ctx, args) => {
    const payload = normalizeHomepageSnapshotPayload(args.payload as HomepageSnapshotPayload);
    const report = buildReport(payload);
    if (report.summary.blocking > 0) {
      return { saved: false, snapshotId: null, report };
    }

    const mediaReplacementMap = buildMediaReplacementMap(payload, args.uploadedMediaMap ?? {});
    const nextPayload = rewriteSnapshotPayloadMedia(payload, mediaReplacementMap);
    const label = args.label?.trim()
      || nextPayload.manifest.snapshotLabel?.trim()
      || `Snapshot nhập ${new Date().toISOString().slice(0, 10)}`;

    let baseSlug = slugify(label);
    if (!baseSlug) baseSlug = `snapshot-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await ctx.db.query('homeComponentSnapshots').withIndex('by_slug', (q) => q.eq('slug', slug)).unique()) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const now = Date.now();
    const snapshotId = await ctx.db.insert('homeComponentSnapshots', {
      category: args.category || 'other',
      createdAt: now,
      label,
      payloadUpdatedAt: now,
      publicEnabled: false,
      slug,
      ...buildSnapshotSummary(nextPayload),
      version: HOMEPAGE_SNAPSHOT_VERSION,
    });
    await ctx.db.insert('homeComponentSnapshotPayloads', {
      snapshotId,
      payload: nextPayload,
    });

    const customThumbnail = normalizeSnapshotCustomThumbnail(nextPayload.gallery?.customThumbnail);
    if (customThumbnail) {
      await syncSnapshotCustomThumbnailFiles(ctx, snapshotId, undefined, customThumbnail);
    }

    return { saved: true, snapshotId, report };
  },
  returns: v.any(),
});

export const importHomepageSnapshot = mutation({
  args: {
    payload: v.any(),
    mode: v.optional(v.union(v.literal('append'), v.literal('replace_all'))),
    uploadedMediaMap: uploadedMediaMapValidator,
  },
  handler: async (ctx, args) => {
    const payload = normalizeHomepageSnapshotPayload(args.payload as HomepageSnapshotPayload);
    const report = buildReport(payload);
    if (report.summary.blocking > 0) {
      return { applied: false, created: 0, report };
    }

    const mediaReplacementMap = buildMediaReplacementMap(payload, args.uploadedMediaMap ?? {});
    const existing = await ctx.db.query('homeComponents').take(5000);
    if (args.mode === REPLACE_ALL_MODE) {
      for (const item of existing) {
        await ctx.db.delete(item._id);
      }
    }
    const maxOrder = existing.reduce((acc, item) => Math.max(acc, item.order), -1);
    const baseOrder = args.mode === REPLACE_ALL_MODE ? -1 : maxOrder;

    let created = 0;
    for (const [index, component] of payload.homepage.components.entries()) {
      await ctx.db.insert('homeComponents', {
        active: component.active,
        config: replaceMediaUrls(component.config, mediaReplacementMap),
        order: baseOrder + index + 1,
        title: component.title,
        type: component.type,
      });
      created += 1;
    }

    await rebuildHomeComponentStats(ctx);
    await restoreSnapshotSettings(ctx, payload, mediaReplacementMap);

    return {
      applied: true,
      created,
      report,
    };
  },
  returns: v.any(),
});

export const applyHomepageSnapshot = mutation({
  args: {
    snapshotId: v.id('homeComponentSnapshots'),
    mode: v.optional(v.union(v.literal('replace_all'))),
  },
  handler: async (ctx, args) => {
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot) {
      throw new Error('Snapshot không tồn tại');
    }
    const rawPayload = await loadSnapshotPayload(ctx, args.snapshotId as string) as HomepageSnapshotPayload | null;
    if (!rawPayload) {
      throw new Error('Payload snapshot không tìm thấy trong homeComponentSnapshotPayloads');
    }
    const payload = normalizeHomepageSnapshotPayload(rawPayload);
    const report = buildReport(payload);
    if (report.summary.blocking > 0) {
      return { applied: false, created: 0, report };
    }

    const existing = await ctx.db.query('homeComponents').take(5000);
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    let created = 0;
    for (const [index, component] of payload.homepage.components.entries()) {
      await ctx.db.insert('homeComponents', {
        active: component.active,
        config: component.config,
        order: index,
        title: component.title,
        type: component.type,
      });
      created += 1;
    }

    await rebuildHomeComponentStats(ctx);
    await restoreSnapshotSettings(ctx, payload, buildMediaReplacementMap(payload, {}));

    return { applied: true, created, report };
  },
  returns: v.any(),
});

/**
 * MIGRATION: Tách `payload` từ homeComponentSnapshots (legacy) sang homeComponentSnapshotPayloads.
 * Chỉ chạy 1 lần trong quá trình nâng core — sau đó xóa `payload` optional khỏi schema (Contract phase).
 * Quy trình: Expand → [Migrate này] → Contract (xóa payload optional trong schema.ts).
 */
export const migrateSnapshotPayloadsToSeparateTable = mutation({
  args: {},
  handler: async (ctx): Promise<{ migrated: number; skipped: number; errors: string[] }> => {
    const snapshots = await ctx.db
      .query('homeComponentSnapshots')
      .withIndex('by_createdAt')
      .collect();

    let migrated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const snapshot of snapshots) {
      // Kiểm tra nếu đã có payload row trong bảng riêng
      const existingPayloadRow = await ctx.db
        .query('homeComponentSnapshotPayloads')
        .withIndex('by_snapshotId', (q) => q.eq('snapshotId', snapshot._id))
        .unique();

      const legacyPayload = (snapshot as Record<string, unknown>).payload;

      if (!legacyPayload) {
        // Không có payload cũ → bỏ qua
        skipped++;
        continue;
      }

      if (existingPayloadRow) {
        // Đã migrate rồi → chỉ xóa payload cũ khỏi snapshot doc (as any vì field không còn trong schema)
        await ctx.db.patch(snapshot._id, { payload: undefined } as any);
        skipped++;
        continue;
      }

      try {
        // Insert payload vào bảng riêng
        await ctx.db.insert('homeComponentSnapshotPayloads', {
          snapshotId: snapshot._id,
          payload: legacyPayload,
        });
        // Xóa field payload khỏi snapshot doc (as any vì field không còn trong schema)
        await ctx.db.patch(snapshot._id, { payload: undefined } as any);
        migrated++;
      } catch (err) {
        errors.push(`snapshot ${snapshot._id as string}: ${String(err)}`);
      }
    }

    return { migrated, skipped, errors };
  },
  returns: v.object({
    migrated: v.number(),
    skipped: v.number(),
    errors: v.array(v.string()),
  }),
});

