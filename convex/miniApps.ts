import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { MINI_APP_DEFINITIONS, type MiniAppDefinition } from "../lib/mini-apps/registry";

const routeModeValidator = v.union(
  v.literal("none"),
  v.literal("namespaced"),
  v.literal("root")
);

const visibilityValidator = v.union(
  v.literal("private"),
  v.literal("public")
);

const miniAppDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("miniApps"),
  adminEnabled: v.boolean(),
  config: v.any(),
  createdAt: v.number(),
  description: v.string(),
  enabled: v.boolean(),
  icon: v.string(),
  key: v.string(),
  moduleKey: v.optional(v.string()),
  name: v.string(),
  noindex: v.boolean(),
  order: v.number(),
  routeMode: routeModeValidator,
  routeSlug: v.optional(v.string()),
  siteEnabled: v.boolean(),
  type: v.string(),
  updatedAt: v.number(),
  visibility: visibilityValidator,
});

const ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALWAYS_RESERVED_ROUTE_SLUGS = new Set([
  "admin",
  "api",
  "apps",
  "system",
]);

const ROOT_RESERVED_ROUTE_SLUGS = new Set([
  "about",
  "account",
  "book",
  "cart",
  "checkout",
  "compare",
  "contact",
  "courses",
  "errors",
  "faq",
  "features",
  "guides",
  "integrations",
  "khoa-hoc",
  "login",
  "logout",
  "payment",
  "posts",
  "privacy",
  "products",
  "projects",
  "promotions",
  "resources",
  "return-policy",
  "services",
  "shipping",
  "solutions",
  "stores",
  "templates",
  "terms",
  "use-cases",
  "wishlist",
]);

const CATEGORY_TABLES = [
  "postCategories",
  "productCategories",
  "serviceCategories",
  "courseCategories",
  "projectCategories",
  "resourceCategories",
] as const;

type MiniAppCtx = QueryCtx | MutationCtx;

async function isMiniAppsAdminEnabled(ctx: MiniAppCtx) {
  const moduleRecord = await ctx.db
    .query("adminModules")
    .withIndex("by_key", (q) => q.eq("key", "miniApps"))
    .unique();
  if (moduleRecord && !moduleRecord.enabled) {
    return false;
  }

  const feature = await ctx.db
    .query("moduleFeatures")
    .withIndex("by_module_feature", (q) => q.eq("moduleKey", "miniApps").eq("featureKey", "enableAdminWorkspace"))
    .unique();
  return feature?.enabled ?? true;
}

async function cleanupLegacyKanbanModule(ctx: MutationCtx) {
  const moduleRecord = await ctx.db
    .query("adminModules")
    .withIndex("by_key", (q) => q.eq("key", "kanban"))
    .unique();
  if (moduleRecord) {
    await ctx.db.delete(moduleRecord._id);
  }

  const [features, fields, settings, roles] = await Promise.all([
    ctx.db.query("moduleFeatures").withIndex("by_module", (q) => q.eq("moduleKey", "kanban")).collect(),
    ctx.db.query("moduleFields").withIndex("by_module", (q) => q.eq("moduleKey", "kanban")).collect(),
    ctx.db.query("moduleSettings").withIndex("by_module", (q) => q.eq("moduleKey", "kanban")).collect(),
    ctx.db.query("roles").take(100),
  ]);

  await Promise.all([
    ...features.map((item) => ctx.db.delete(item._id)),
    ...fields.map((item) => ctx.db.delete(item._id)),
    ...settings.map((item) => ctx.db.delete(item._id)),
    ...roles.map((role) => {
      if (!Object.prototype.hasOwnProperty.call(role.permissions, "kanban")) {
        return Promise.resolve();
      }
      const permissions = { ...role.permissions };
      delete permissions.kanban;
      return ctx.db.patch(role._id, { permissions });
    }),
  ]);
}

function normalizeRouteSlug(value: string | undefined) {
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return normalized || undefined;
}

function buildDoc(definition: MiniAppDefinition, now: number) {
  return {
    adminEnabled: definition.adminEnabled,
    config: definition.config,
    createdAt: now,
    description: definition.description,
    enabled: true,
    icon: definition.icon,
    key: definition.key,
    moduleKey: definition.moduleKey,
    name: definition.name,
    noindex: definition.noindex,
    order: definition.order,
    routeMode: definition.routeMode,
    routeSlug: definition.routeSlug,
    siteEnabled: definition.siteEnabled,
    type: definition.type,
    updatedAt: now,
    visibility: definition.visibility,
  };
}

async function getRouteConflict(ctx: MiniAppCtx, routeSlug: string, excludeId?: Id<"miniApps">, checkRootConflicts = false) {
  const existingMiniApp = await ctx.db
    .query("miniApps")
    .withIndex("by_route_slug", (q: any) => q.eq("routeSlug", routeSlug))
    .unique();
  if (existingMiniApp && existingMiniApp._id !== excludeId) {
    return `Route /${routeSlug} đang được dùng bởi mini app ${existingMiniApp.name}.`;
  }

  if (!checkRootConflicts) {
    return null;
  }

  for (const table of CATEGORY_TABLES) {
    const existing = await ctx.db
      .query(table)
      .withIndex("by_slug", (q: any) => q.eq("slug", routeSlug))
      .unique();
    if (existing) {
      return `Route /${routeSlug} trùng slug danh mục hiện có.`;
    }
  }

  const productType = await ctx.db
    .query("productTypes")
    .withIndex("by_slug", (q: any) => q.eq("slug", routeSlug))
    .unique();
  if (productType) {
    return `Route /${routeSlug} trùng slug loại sản phẩm hiện có.`;
  }

  return null;
}

async function validateRouteSlug(ctx: MiniAppCtx, params: {
  excludeId?: Id<"miniApps">;
  routeMode: "none" | "namespaced" | "root";
  routeSlug?: string;
}) {
  if (params.routeMode === "none") {
    return undefined;
  }

  const normalized = normalizeRouteSlug(params.routeSlug);
  if (!normalized || !ROUTE_SLUG_PATTERN.test(normalized)) {
    throw new ConvexError({ code: "INVALID_ROUTE_SLUG", message: "Route slug không hợp lệ." });
  }

  if (ALWAYS_RESERVED_ROUTE_SLUGS.has(normalized) || (params.routeMode === "root" && ROOT_RESERVED_ROUTE_SLUGS.has(normalized))) {
    throw new ConvexError({ code: "RESERVED_ROUTE_SLUG", message: `Route /${normalized} là route hệ thống.` });
  }

  const conflict = await getRouteConflict(ctx, normalized, params.excludeId, params.routeMode === "root");
  if (conflict) {
    throw new ConvexError({ code: "ROUTE_CONFLICT", message: conflict });
  }

  return normalized;
}

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    await cleanupLegacyKanbanModule(ctx);

    const now = Date.now();
    let created = 0;
    let updated = 0;

    for (const definition of MINI_APP_DEFINITIONS) {
      const existing = await ctx.db
        .query("miniApps")
        .withIndex("by_key", (q) => q.eq("key", definition.key))
        .unique();

      if (!existing) {
        await ctx.db.insert("miniApps", buildDoc(definition, now));
        created += 1;
        continue;
      }

      const patch: Partial<ReturnType<typeof buildDoc>> = {};
      if (existing.type !== definition.type) {
        patch.type = definition.type;
      }
      if (existing.moduleKey !== definition.moduleKey) {
        patch.moduleKey = definition.moduleKey;
      }
      if (!existing.config || typeof existing.config !== "object") {
        patch.config = definition.config;
      }
      if (definition.key === "pokemon-champions" && existing.config && typeof existing.config === "object" && !Array.isArray(existing.config)) {
        const config = existing.config as Record<string, unknown>;
        if (config.routeSurface !== "standalone-route" && config.routeSurface !== "site-layout") {
          patch.config = {
            ...config,
            routeSurface: existing.routeMode === "namespaced" ? "standalone-route" : "site-layout",
          };
        }
      }
      if (definition.key === "pokemon-champions" && existing.description !== definition.description) {
        patch.description = definition.description;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existing._id, { ...patch, updatedAt: now });
        updated += 1;
      }
    }

    return { created, updated };
  },
  returns: v.object({ created: v.number(), updated: v.number() }),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("miniApps").take(100);
    return apps.sort((a, b) => a.order - b.order);
  },
  returns: v.array(miniAppDoc),
});

export const listEnabledForAdmin = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db
      .query("miniApps")
      .withIndex("by_enabled_order", (q) => q.eq("enabled", true))
      .collect();
    return apps.sort((a, b) => a.order - b.order);
  },
  returns: v.array(miniAppDoc),
});

export const getAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const adminEnabled = await isMiniAppsAdminEnabled(ctx);
    return { adminEnabled };
  },
  returns: v.object({ adminEnabled: v.boolean() }),
});

export const listPublicGallery = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db
      .query("miniApps")
      .withIndex("by_site_enabled_order", (q) => q.eq("siteEnabled", true))
      .take(100);
    return apps
      .filter((app) => app.enabled && app.visibility === "public" && app.routeMode !== "none" && Boolean(app.routeSlug))
      .sort((a, b) => a.order - b.order);
  },
  returns: v.array(miniAppDoc),
});

export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => ctx.db
    .query("miniApps")
    .withIndex("by_key", (q) => q.eq("key", args.key))
    .unique(),
  returns: v.union(miniAppDoc, v.null()),
});

export const resolvePublicRoute = query({
  args: {
    routeMode: v.union(v.literal("namespaced"), v.literal("root")),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const slug = normalizeRouteSlug(args.slug);
    if (!slug) {
      return null;
    }
    const app = await ctx.db
      .query("miniApps")
      .withIndex("by_route_slug", (q) => q.eq("routeSlug", slug))
      .unique();
    if (!app || !app.enabled || !app.siteEnabled || app.routeMode !== args.routeMode) {
      return null;
    }
    return app;
  },
  returns: v.union(miniAppDoc, v.null()),
});

export const updateSettings = mutation({
  args: {
    adminEnabled: v.optional(v.boolean()),
    config: v.optional(v.any()),
    enabled: v.optional(v.boolean()),
    id: v.id("miniApps"),
    noindex: v.optional(v.boolean()),
    routeMode: v.optional(routeModeValidator),
    routeSlug: v.optional(v.string()),
    siteEnabled: v.optional(v.boolean()),
    visibility: v.optional(visibilityValidator),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.id);
    if (!app) {
      throw new ConvexError({ code: "MINI_APP_NOT_FOUND", message: "Mini app không tồn tại." });
    }

    const nextRouteMode = args.routeMode ?? app.routeMode;
    const routeSlug = await validateRouteSlug(ctx, {
      excludeId: app._id,
      routeMode: nextRouteMode,
      routeSlug: args.routeSlug ?? app.routeSlug,
    });

    const updates: {
      adminEnabled?: boolean;
      config?: unknown;
      enabled?: boolean;
      noindex?: boolean;
      routeMode?: "none" | "namespaced" | "root";
      routeSlug?: string;
      siteEnabled?: boolean;
      updatedAt: number;
      visibility?: "private" | "public";
    } = {
      updatedAt: Date.now(),
    };

    if (typeof args.adminEnabled === "boolean") {
      updates.adminEnabled = args.adminEnabled;
    }
    if (typeof args.enabled === "boolean") {
      updates.enabled = args.enabled;
    }
    if (typeof args.noindex === "boolean") {
      updates.noindex = args.noindex;
    }
    if (typeof args.siteEnabled === "boolean") {
      updates.siteEnabled = args.siteEnabled;
    }
    if (args.visibility) {
      updates.visibility = args.visibility;
    }
    if (args.routeMode) {
      updates.routeMode = args.routeMode;
      updates.routeSlug = routeSlug;
    }
    if (Object.prototype.hasOwnProperty.call(args, "routeSlug")) {
      updates.routeSlug = routeSlug;
    }
    if (Object.prototype.hasOwnProperty.call(args, "config")) {
      updates.config = args.config;
    }

    await ctx.db.patch(args.id, updates);
    return null;
  },
  returns: v.null(),
});
