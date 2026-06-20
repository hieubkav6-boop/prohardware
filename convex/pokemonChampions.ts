import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import {
  POKEMON_CHAMPIONS_DEFAULT_POKEMON,
  POKEMON_CHAMPIONS_DEFAULT_TOTAL,
} from "./lib/pokemonChampionsDefaults";
import { EMAIL_CONFIG_SETTING_KEYS, getEmailConfigurationStatus } from "../lib/email-config-status";
import { getPokemonChampionsOrderShopTemplate } from "./emailTemplates";

const contactTypeValidator = v.union(
  v.literal("discord"),
  v.literal("whatsapp"),
  v.literal("instagram"),
  v.literal("zalo"),
  v.literal("phone"),
  v.literal("other")
);

const gameItemRarityValidator = v.union(
  v.literal("common"),
  v.literal("rare"),
  v.literal("epic"),
  v.literal("legendary")
);

const orderStatusValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("confirmed"),
  v.literal("fulfilled"),
  v.literal("cancelled")
);

const shopStatusValidator = v.union(v.literal("open"), v.literal("paused"));

const gameItemDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("pokemonChampionsGameItems"),
  active: v.boolean(),
  createdAt: v.number(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  name: v.string(),
  order: v.number(),
  priceLabel: v.optional(v.string()),
  rarity: gameItemRarityValidator,
  slug: v.string(),
  tags: v.optional(v.array(v.string())),
  updatedAt: v.number(),
});

const pokemonDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("pokemonChampionsPokemon"),
  active: v.boolean(),
  bestItemId: v.optional(v.id("pokemonChampionsGameItems")),
  createdAt: v.number(),
  dexNumber: v.number(),
  formName: v.optional(v.string()),
  imageUrl: v.string(),
  name: v.string(),
  notes: v.optional(v.string()),
  order: v.number(),
  primaryType: v.string(),
  recommendedItemIds: v.optional(v.array(v.id("pokemonChampionsGameItems"))),
  secondaryType: v.optional(v.string()),
  traits: v.array(v.string()),
  updatedAt: v.number(),
});

const customerDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("pokemonChampionsCustomers"),
  contactHandle: v.string(),
  contactType: contactTypeValidator,
  createdAt: v.number(),
  email: v.optional(v.string()),
  name: v.string(),
  note: v.optional(v.string()),
  orderCount: v.number(),
  status: v.union(v.literal("active"), v.literal("blocked")),
  updatedAt: v.number(),
});

const orderDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("pokemonChampionsOrders"),
  contactHandle: v.string(),
  contactType: contactTypeValidator,
  createdAt: v.number(),
  customerId: v.id("pokemonChampionsCustomers"),
  customerName: v.string(),
  gameItemId: v.optional(v.id("pokemonChampionsGameItems")),
  note: v.optional(v.string()),
  orderNumber: v.string(),
  pokemonId: v.optional(v.id("pokemonChampionsPokemon")),
  quantity: v.number(),
  status: orderStatusValidator,
  updatedAt: v.number(),
});

const settingsDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("pokemonChampionsSettings"),
  announcement: v.optional(v.string()),
  createdAt: v.number(),
  discordUrl: v.optional(v.string()),
  heroSubtitle: v.string(),
  heroTitle: v.string(),
  instagramUrl: v.optional(v.string()),
  key: v.string(),
  orderInstructions: v.string(),
  shopStatus: shopStatusValidator,
  themeColor: v.string(),
  updatedAt: v.number(),
  whatsappUrl: v.optional(v.string()),
});

const teamDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("pokemonChampionsTeams"),
  active: v.boolean(),
  createdAt: v.number(),
  description: v.optional(v.string()),
  name: v.string(),
  slots: v.array(
    v.object({
      pokemonId: v.id("pokemonChampionsPokemon"),
      gameItemId: v.optional(v.id("pokemonChampionsGameItems")),
    })
  ),
  order: v.number(),
  updatedAt: v.number(),
});

const DEFAULT_KEY = "default";
const MAX_LIST_LIMIT = 500;

const DEFAULT_ITEMS = [
  { name: "Gold Bottle Cap", slug: "gold-bottle-cap", rarity: "legendary", priceLabel: "Contact", tags: ["IV", "competitive"], icon: "Crown", description: "Premium training item for competitive-ready Pokémon." },
  { name: "Ability Patch", slug: "ability-patch", rarity: "epic", priceLabel: "Contact", tags: ["ability"], icon: "Sparkles", description: "Switch to a hidden ability where supported." },
  { name: "Nature Mint", slug: "nature-mint", rarity: "rare", priceLabel: "Contact", tags: ["nature"], icon: "Leaf", description: "Tune a Pokémon nature for a battle plan." },
  { name: "Tera Shard Bundle", slug: "tera-shard-bundle", rarity: "rare", priceLabel: "Contact", tags: ["tera"], icon: "Gem", description: "Shard pack for preparing a focused Tera type." },
  { name: "EV Training Kit", slug: "ev-training-kit", rarity: "epic", priceLabel: "Contact", tags: ["EV", "build"], icon: "Dumbbell", description: "Speed up training for ranked battle spreads." },
  { name: "Battle Ready Pack", slug: "battle-ready-pack", rarity: "legendary", priceLabel: "Contact", tags: ["bundle"], icon: "Shield", description: "Recommended all-in-one prep pack for tournament teams." },
] as const;

function limitOf(value?: number) {
  return Math.max(1, Math.min(value ?? 100, MAX_LIST_LIMIT));
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getPokemonSourceSlug(value?: string) {
  if (!value) return "";
  const match = /\/champions\/pokemon\/([^/"'?#\s]+)\/?/i.exec(value);
  return match ? normalizeSlug(match[1]) : "";
}

function getDexNumberFromImageUrl(value?: string) {
  if (!value) return 1;
  const match = /_(\d{4})_/.exec(value);
  return match ? Math.max(1, Number(match[1])) : 1;
}

function cleanList(value?: string[]) {
  return (value ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

function getDefaultFormName(name: string) {
  const bracketed = /\[([^\]]+)]/.exec(name);
  if (bracketed) {
    return bracketed[1];
  }
  return name.startsWith("Mega ") ? "Mega" : undefined;
}

function getDefaultTraits(pokemon: typeof POKEMON_CHAMPIONS_DEFAULT_POKEMON[number]) {
  return [
    "Champions legal",
    "Regulation M-B",
    ...(pokemon.usageCount ? [`${pokemon.usageCount} uses`] : []),
  ];
}

function getDefaultPokemonPayload(
  pokemon: typeof POKEMON_CHAMPIONS_DEFAULT_POKEMON[number],
  index: number,
  now: number
) {
  return {
    active: true,
    bestItemId: undefined,
    dexNumber: pokemon.dexNumber,
    formName: getDefaultFormName(pokemon.name),
    imageUrl: pokemon.imageUrl,
    name: pokemon.name,
    notes: `Seeded from Pokémon Zone All Champions-legal: ${pokemon.sourceUrl}`,
    order: index,
    primaryType: pokemon.primaryType,
    recommendedItemIds: [],
    secondaryType: pokemon.secondaryType ?? undefined,
    traits: getDefaultTraits(pokemon),
    updatedAt: now,
  };
}

async function getSettingsDoc(ctx: QueryCtx | MutationCtx) {
  return ctx.db
    .query("pokemonChampionsSettings")
    .withIndex("by_key", (q) => q.eq("key", DEFAULT_KEY))
    .unique();
}

async function getGlobalSettingsByKeys(ctx: MutationCtx, keys: string[]) {
  const uniqueKeys = [...new Set(keys)];
  const settings = await Promise.all(uniqueKeys.map((key) =>
    ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique()
  ));

  const result: Record<string, unknown> = {};
  for (const setting of settings) {
    if (setting) {
      result[setting.key] = setting.value;
    }
  }
  return result;
}

async function resolveOrderNotificationEmails(ctx: MutationCtx): Promise<string> {
  const settings = await getGlobalSettingsByKeys(ctx, ["order_notification_emails", "contact_email"]);
  const advancedEmails = typeof settings.order_notification_emails === "string" ? settings.order_notification_emails : "";
  if (advancedEmails.trim()) {
    return advancedEmails;
  }
  return typeof settings.contact_email === "string" ? settings.contact_email : "";
}

async function schedulePokemonChampionsOrderEmail(
  ctx: MutationCtx,
  order: Doc<"pokemonChampionsOrders">,
  customer: Doc<"pokemonChampionsCustomers">
) {
  const settings = await getGlobalSettingsByKeys(ctx, [
    "site_url",
    "site_name",
    ...EMAIL_CONFIG_SETTING_KEYS,
  ]);
  const emailStatus = getEmailConfigurationStatus(settings);
  if (!emailStatus.configured) {
    return;
  }

  const shopEmails = await resolveOrderNotificationEmails(ctx);
  if (!shopEmails.trim()) {
    return;
  }

  const [pokemon, gameItem] = await Promise.all([
    order.pokemonId ? ctx.db.get(order.pokemonId) : Promise.resolve(null),
    order.gameItemId ? ctx.db.get(order.gameItemId) : Promise.resolve(null),
  ]);
  const siteUrl = typeof settings.site_url === "string" && settings.site_url.trim()
    ? settings.site_url.trim()
    : "http://localhost:3000";
  const brandName = typeof settings.site_name === "string" && settings.site_name.trim()
    ? settings.site_name.trim()
    : "YourBrand";
  const html = getPokemonChampionsOrderShopTemplate(order, customer, pokemon, gameItem, siteUrl, brandName);

  await ctx.scheduler.runAfter(0, internal.email.sendTransactionalEmail, {
    to: shopEmails,
    subject: `[${brandName}] Pokémon Champions order mới #${order.orderNumber}`,
    html,
    eventType: "pokemon_champions_order_placed_shop",
  });
}

async function syncDefaultPokemon(ctx: MutationCtx, now: number, resetExtras: boolean) {
  const existingPokemon = await ctx.db.query("pokemonChampionsPokemon").withIndex("by_order").take(1000);
  const existingByName = new Map(existingPokemon.map((pokemon) => [normalizeSlug(pokemon.name), pokemon]));
  const touchedIds = new Set<Id<"pokemonChampionsPokemon">>();
  let createdPokemon = 0;
  let updatedPokemon = 0;
  let removedPokemon = 0;
  let archivedPokemon = 0;

  for (const [index, pokemon] of POKEMON_CHAMPIONS_DEFAULT_POKEMON.entries()) {
    const key = normalizeSlug(pokemon.name);
    const existing = existingByName.get(key);
    const payload = getDefaultPokemonPayload(pokemon, index, now);

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      touchedIds.add(existing._id);
      updatedPokemon += 1;
      continue;
    }

    const id = await ctx.db.insert("pokemonChampionsPokemon", {
      ...payload,
      createdAt: now,
    });
    touchedIds.add(id);
    createdPokemon += 1;
  }

  if (!resetExtras) {
    return {
      archivedPokemon,
      createdPokemon,
      removedPokemon,
      totalDefaults: POKEMON_CHAMPIONS_DEFAULT_TOTAL,
      updatedPokemon,
    };
  }

  for (const pokemon of existingPokemon) {
    if (touchedIds.has(pokemon._id)) {
      continue;
    }

    const linkedOrder = await ctx.db
      .query("pokemonChampionsOrders")
      .withIndex("by_pokemon", (q) => q.eq("pokemonId", pokemon._id))
      .first();
    if (linkedOrder) {
      await ctx.db.patch(pokemon._id, { active: false, order: POKEMON_CHAMPIONS_DEFAULT_TOTAL + archivedPokemon, updatedAt: now });
      archivedPokemon += 1;
      continue;
    }

    await ctx.db.delete(pokemon._id);
    removedPokemon += 1;
  }

  return {
    archivedPokemon,
    createdPokemon,
    removedPokemon,
    totalDefaults: POKEMON_CHAMPIONS_DEFAULT_TOTAL,
    updatedPokemon,
  };
}

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let createdItems = 0;
    let createdPokemon = 0;
    let settingsCreated = false;

    for (const [index, item] of DEFAULT_ITEMS.entries()) {
      const existing = await ctx.db
        .query("pokemonChampionsGameItems")
        .withIndex("by_slug", (q) => q.eq("slug", item.slug))
        .unique();
      if (existing) {
        continue;
      }

      await ctx.db.insert("pokemonChampionsGameItems", {
        active: true,
        createdAt: now,
        description: item.description,
        icon: item.icon,
        name: item.name,
        order: index,
        priceLabel: item.priceLabel,
        rarity: item.rarity,
        slug: item.slug,
        tags: [...item.tags],
        updatedAt: now,
      });
      createdItems += 1;
    }

    const pokemonResult = await syncDefaultPokemon(ctx, now, false);
    createdPokemon = pokemonResult.createdPokemon;

    const settings = await getSettingsDoc(ctx);
    if (!settings) {
      await ctx.db.insert("pokemonChampionsSettings", {
        announcement: "Build your battle-ready team for Pokémon Champions. Submit an order and we will contact you to confirm details.",
        createdAt: now,
        discordUrl: "",
        heroSubtitle: "Browse available Pokémon, match them with the best in-game items, and send an order request.",
        heroTitle: "Pokémon Champions order desk",
        instagramUrl: "",
        key: DEFAULT_KEY,
        orderInstructions: "After submitting, our admin will contact you through your preferred channel to confirm availability and delivery details.",
        shopStatus: "open",
        themeColor: "#ef4444",
        updatedAt: now,
        whatsappUrl: "",
      });
      settingsCreated = true;
    }

    return { createdItems, createdPokemon, settingsCreated };
  },
  returns: v.object({
    createdItems: v.number(),
    createdPokemon: v.number(),
    settingsCreated: v.boolean(),
  }),
});

export const resetPokemonDefaults = mutation({
  args: {},
  handler: async (ctx) => syncDefaultPokemon(ctx, Date.now(), true),
  returns: v.object({
    archivedPokemon: v.number(),
    createdPokemon: v.number(),
    removedPokemon: v.number(),
    totalDefaults: v.number(),
    updatedPokemon: v.number(),
  }),
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => getSettingsDoc(ctx),
  returns: v.union(settingsDoc, v.null()),
});

export const updateSettings = mutation({
  args: {
    announcement: v.optional(v.string()),
    discordUrl: v.optional(v.string()),
    heroSubtitle: v.optional(v.string()),
    heroTitle: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    orderInstructions: v.optional(v.string()),
    shopStatus: v.optional(shopStatusValidator),
    themeColor: v.optional(v.string()),
    whatsappUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await getSettingsDoc(ctx);
    if (!existing) {
      await ctx.db.insert("pokemonChampionsSettings", {
        announcement: args.announcement,
        createdAt: Date.now(),
        discordUrl: args.discordUrl,
        heroSubtitle: args.heroSubtitle ?? "Browse available Pokémon and order game items.",
        heroTitle: args.heroTitle ?? "Pokémon Champions order desk",
        instagramUrl: args.instagramUrl,
        key: DEFAULT_KEY,
        orderInstructions: args.orderInstructions ?? "Submit an order and we will contact you to confirm.",
        shopStatus: args.shopStatus ?? "open",
        themeColor: args.themeColor ?? "#ef4444",
        updatedAt: Date.now(),
        whatsappUrl: args.whatsappUrl,
      });
      return null;
    }

    await ctx.db.patch(existing._id, {
      ...args,
      updatedAt: Date.now(),
    });
    return null;
  },
  returns: v.null(),
});

export const listGameItems = query({
  args: {
    activeOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = limitOf(args.limit);
    if (args.activeOnly) {
      return ctx.db
        .query("pokemonChampionsGameItems")
        .withIndex("by_active_order", (q) => q.eq("active", true))
        .take(limit);
    }
    return ctx.db.query("pokemonChampionsGameItems").withIndex("by_order").take(limit);
  },
  returns: v.array(gameItemDoc),
});

export const saveGameItem = mutation({
  args: {
    active: v.optional(v.boolean()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    id: v.optional(v.id("pokemonChampionsGameItems")),
    imageUrl: v.optional(v.string()),
    name: v.string(),
    order: v.optional(v.number()),
    priceLabel: v.optional(v.string()),
    rarity: gameItemRarityValidator,
    slug: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const name = args.name.trim();
    if (!name) {
      throw new ConvexError({ code: "INVALID_NAME", message: "Tên item không hợp lệ." });
    }
    const slug = normalizeSlug(args.slug || name);
    if (!slug) {
      throw new ConvexError({ code: "INVALID_SLUG", message: "Slug item không hợp lệ." });
    }

    const existingSlug = await ctx.db
      .query("pokemonChampionsGameItems")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existingSlug && existingSlug._id !== args.id) {
      throw new ConvexError({ code: "DUPLICATE_SLUG", message: "Slug item đã tồn tại." });
    }

    if (args.id) {
      await ctx.db.patch(args.id, {
        active: args.active ?? true,
        description: args.description,
        icon: args.icon,
        imageUrl: args.imageUrl,
        name,
        order: args.order ?? 0,
        priceLabel: args.priceLabel,
        rarity: args.rarity,
        slug,
        tags: cleanList(args.tags),
        updatedAt: now,
      });
      return args.id;
    }

    const last = await ctx.db.query("pokemonChampionsGameItems").withIndex("by_order").order("desc").first();
    return ctx.db.insert("pokemonChampionsGameItems", {
      active: args.active ?? true,
      createdAt: now,
      description: args.description,
      icon: args.icon,
      imageUrl: args.imageUrl,
      name,
      order: args.order ?? ((last?.order ?? -1) + 1),
      priceLabel: args.priceLabel,
      rarity: args.rarity,
      slug,
      tags: cleanList(args.tags),
      updatedAt: now,
    });
  },
  returns: v.id("pokemonChampionsGameItems"),
});

export const removeGameItem = mutation({
  args: { id: v.id("pokemonChampionsGameItems") },
  handler: async (ctx, args) => {
    const linkedOrder = await ctx.db
      .query("pokemonChampionsOrders")
      .withIndex("by_gameItem", (q) => q.eq("gameItemId", args.id))
      .first();
    if (linkedOrder) {
      await ctx.db.patch(args.id, { active: false, updatedAt: Date.now() });
      return { archived: true };
    }
    await ctx.db.delete(args.id);
    return { archived: false };
  },
  returns: v.object({ archived: v.boolean() }),
});

export const listPokemon = query({
  args: {
    activeOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    primaryType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = limitOf(args.limit);
    const type = args.primaryType?.trim();
    if (type && args.activeOnly) {
      return ctx.db
        .query("pokemonChampionsPokemon")
        .withIndex("by_primaryType_active_order", (q) => q.eq("primaryType", type).eq("active", true))
        .take(limit);
    }
    if (args.activeOnly) {
      return ctx.db
        .query("pokemonChampionsPokemon")
        .withIndex("by_active_order", (q) => q.eq("active", true))
        .take(limit);
    }
    return ctx.db.query("pokemonChampionsPokemon").withIndex("by_order").take(limit);
  },
  returns: v.array(pokemonDoc),
});

export const savePokemon = mutation({
  args: {
    active: v.optional(v.boolean()),
    bestItemId: v.optional(v.id("pokemonChampionsGameItems")),
    dexNumber: v.number(),
    formName: v.optional(v.string()),
    id: v.optional(v.id("pokemonChampionsPokemon")),
    imageUrl: v.string(),
    name: v.string(),
    notes: v.optional(v.string()),
    order: v.optional(v.number()),
    primaryType: v.string(),
    recommendedItemIds: v.optional(v.array(v.id("pokemonChampionsGameItems"))),
    secondaryType: v.optional(v.string()),
    traits: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const name = args.name.trim();
    const primaryType = args.primaryType.trim();
    if (!name || !primaryType || !args.imageUrl.trim()) {
      throw new ConvexError({ code: "INVALID_POKEMON", message: "Thiếu tên, hệ chính hoặc ảnh Pokémon." });
    }

    const payload = {
      active: args.active ?? true,
      bestItemId: args.bestItemId,
      dexNumber: args.dexNumber,
      formName: args.formName,
      imageUrl: args.imageUrl.trim(),
      name,
      notes: args.notes,
      order: args.order ?? 0,
      primaryType,
      recommendedItemIds: args.recommendedItemIds ?? (args.bestItemId ? [args.bestItemId] : []),
      secondaryType: args.secondaryType?.trim() || undefined,
      traits: cleanList(args.traits),
      updatedAt: now,
    };

    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return args.id;
    }

    const last = await ctx.db.query("pokemonChampionsPokemon").withIndex("by_order").order("desc").first();
    return ctx.db.insert("pokemonChampionsPokemon", {
      ...payload,
      createdAt: now,
      order: args.order ?? ((last?.order ?? -1) + 1),
    });
  },
  returns: v.id("pokemonChampionsPokemon"),
});

export const removePokemon = mutation({
  args: { id: v.id("pokemonChampionsPokemon") },
  handler: async (ctx, args) => {
    const linkedOrder = await ctx.db
      .query("pokemonChampionsOrders")
      .withIndex("by_pokemon", (q) => q.eq("pokemonId", args.id))
      .first();
    if (linkedOrder) {
      await ctx.db.patch(args.id, { active: false, updatedAt: Date.now() });
      return { archived: true };
    }
    await ctx.db.delete(args.id);
    return { archived: false };
  },
  returns: v.object({ archived: v.boolean() }),
});

export const listCustomers = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("blocked"))),
  },
  handler: async (ctx, args) => {
    const limit = limitOf(args.limit);
    if (args.status) {
      return ctx.db
        .query("pokemonChampionsCustomers")
        .withIndex("by_status_updatedAt", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }
    return ctx.db.query("pokemonChampionsCustomers").withIndex("by_updatedAt").order("desc").take(limit);
  },
  returns: v.array(customerDoc),
});

export const saveCustomer = mutation({
  args: {
    contactHandle: v.string(),
    contactType: contactTypeValidator,
    email: v.optional(v.string()),
    id: v.optional(v.id("pokemonChampionsCustomers")),
    name: v.string(),
    note: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("blocked"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const name = args.name.trim();
    const contactHandle = args.contactHandle.trim();
    if (!name || !contactHandle) {
      throw new ConvexError({ code: "INVALID_CUSTOMER", message: "Thiếu tên hoặc thông tin liên hệ." });
    }

    if (args.id) {
      await ctx.db.patch(args.id, {
        contactHandle,
        contactType: args.contactType,
        email: args.email,
        name,
        note: args.note,
        status: args.status ?? "active",
        updatedAt: now,
      });
      return args.id;
    }

    return ctx.db.insert("pokemonChampionsCustomers", {
      contactHandle,
      contactType: args.contactType,
      createdAt: now,
      email: args.email,
      name,
      note: args.note,
      orderCount: 0,
      status: args.status ?? "active",
      updatedAt: now,
    });
  },
  returns: v.id("pokemonChampionsCustomers"),
});

export const removeCustomer = mutation({
  args: { id: v.id("pokemonChampionsCustomers") },
  handler: async (ctx, args) => {
    const linkedOrder = await ctx.db
      .query("pokemonChampionsOrders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.id))
      .first();
    if (linkedOrder) {
      await ctx.db.patch(args.id, { status: "blocked", updatedAt: Date.now() });
      return { archived: true };
    }
    await ctx.db.delete(args.id);
    return { archived: false };
  },
  returns: v.object({ archived: v.boolean() }),
});

export const listOrders = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(orderStatusValidator),
  },
  handler: async (ctx, args) => {
    const limit = limitOf(args.limit);
    if (args.status) {
      return ctx.db
        .query("pokemonChampionsOrders")
        .withIndex("by_status_createdAt", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    }
    return ctx.db.query("pokemonChampionsOrders").withIndex("by_createdAt").order("desc").take(limit);
  },
  returns: v.array(orderDoc),
});

export const createOrder = mutation({
  args: {
    contactHandle: v.string(),
    contactType: contactTypeValidator,
    customerName: v.string(),
    gameItemId: v.optional(v.id("pokemonChampionsGameItems")),
    note: v.optional(v.string()),
    pokemonId: v.optional(v.id("pokemonChampionsPokemon")),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const settings = await getSettingsDoc(ctx);
    if (settings?.shopStatus === "paused") {
      throw new ConvexError({ code: "SHOP_PAUSED", message: "Shop is temporarily paused." });
    }

    const now = Date.now();
    const customerName = args.customerName.trim();
    const contactHandle = args.contactHandle.trim();
    if (!customerName || !contactHandle) {
      throw new ConvexError({ code: "INVALID_ORDER", message: "Please enter your name and contact." });
    }

    if (args.pokemonId) {
      const pokemon = await ctx.db.get(args.pokemonId);
      if (!pokemon || !pokemon.active) {
        throw new ConvexError({ code: "POKEMON_UNAVAILABLE", message: "Selected Pokémon is unavailable." });
      }
    }
    if (args.gameItemId) {
      const item = await ctx.db.get(args.gameItemId);
      if (!item || !item.active) {
        throw new ConvexError({ code: "ITEM_UNAVAILABLE", message: "Selected item is unavailable." });
      }
    }

    let customer = await ctx.db
      .query("pokemonChampionsCustomers")
      .withIndex("by_contactHandle", (q) => q.eq("contactHandle", contactHandle))
      .first();

    if (customer?.status === "blocked") {
      throw new ConvexError({ code: "CUSTOMER_BLOCKED", message: "This contact is blocked." });
    }

    if (!customer) {
      const customerId = await ctx.db.insert("pokemonChampionsCustomers", {
        contactHandle,
        contactType: args.contactType,
        createdAt: now,
        name: customerName,
        orderCount: 0,
        status: "active",
        updatedAt: now,
      });
      customer = await ctx.db.get(customerId);
    } else {
      await ctx.db.patch(customer._id, {
        contactType: args.contactType,
        name: customerName,
        updatedAt: now,
      });
    }

    if (!customer) {
      throw new Error("Không thể tạo khách hàng.");
    }

    const orderId = await ctx.db.insert("pokemonChampionsOrders", {
      contactHandle,
      contactType: args.contactType,
      createdAt: now,
      customerId: customer._id,
      customerName,
      gameItemId: args.gameItemId,
      note: args.note,
      orderNumber: `PC-${now.toString(36).toUpperCase()}`,
      pokemonId: args.pokemonId,
      quantity: Math.max(1, Math.min(args.quantity ?? 1, 99)),
      status: "new",
      updatedAt: now,
    });

    await ctx.db.patch(customer._id, {
      orderCount: customer.orderCount + 1,
      updatedAt: now,
    });

    const [orderDoc, customerDoc] = await Promise.all([
      ctx.db.get(orderId),
      ctx.db.get(customer._id),
    ]);
    if (orderDoc && customerDoc) {
      await schedulePokemonChampionsOrderEmail(ctx, orderDoc, customerDoc);
    }

    return orderId;
  },
  returns: v.id("pokemonChampionsOrders"),
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("pokemonChampionsOrders"),
    status: orderStatusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return null;
  },
  returns: v.null(),
});

export const removeOrder = mutation({
  args: { id: v.id("pokemonChampionsOrders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeRouteSurface(value: unknown): "standalone-route" | "site-layout" {
  return value === "standalone-route" ? "standalone-route" : "site-layout";
}

export const syncHomeComponent = mutation({
  args: {
    config: v.optional(v.any()),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const miniApp = await ctx.db
      .query("miniApps")
      .withIndex("by_key", (q) => q.eq("key", "pokemon-champions"))
      .unique();
    const inputConfig = toRecord(args.config);
    const routeSurface = miniApp?.routeMode === "namespaced"
      ? "standalone-route"
      : miniApp?.routeMode === "root"
        ? "site-layout"
        : normalizeRouteSurface(toRecord(miniApp?.config).routeSurface);
    const routeUrl = routeSurface === "standalone-route" ? "/apps/pokemon-champions" : "/pokemon-champions";

    if (miniApp) {
      const currentConfig = toRecord(miniApp.config);
      const currentHomeComponent = toRecord(currentConfig.homeComponent);
      await ctx.db.patch(miniApp._id, {
        config: {
          ...currentConfig,
          homeComponent: {
            enabled: args.enabled,
            maxItems: typeof inputConfig.maxItems === "number"
              ? inputConfig.maxItems
              : typeof currentHomeComponent.maxItems === "number"
                ? currentHomeComponent.maxItems
                : 8,
            style: typeof inputConfig.style === "string"
              ? inputConfig.style
              : typeof currentHomeComponent.style === "string"
                ? currentHomeComponent.style
                : "spotlight",
          },
          routeSurface,
        },
        updatedAt: Date.now(),
      });
    }

    const existing = await ctx.db
      .query("homeComponents")
      .withIndex("by_type", (q) => q.eq("type", "PokemonChampions"))
      .first();

    if (!args.enabled) {
      if (existing?.active) {
        await ctx.runMutation(api.homeComponents.update, {
          active: false,
          id: existing._id,
        });
      }
      return { id: existing?._id ?? null };
    }

    const config = {
      ctaText: "Open order desk",
      maxItems: 8,
      style: "spotlight",
      subtitle: "Battle-ready Pokémon and game item order shortcuts.",
      ...inputConfig,
      routeUrl,
    };

    if (existing) {
      await ctx.runMutation(api.homeComponents.update, {
        active: true,
        config,
        id: existing._id,
        title: "Pokémon Champions",
      });
      return { id: existing._id };
    }

    const components = await ctx.db.query("homeComponents").take(100);
    const terminalOrder = components
      .filter((component) => component.type === "Footer" || component.type === "SpeedDial")
      .reduce((min, component) => Math.min(min, component.order), Number.POSITIVE_INFINITY);
    const lastOrder = components.reduce((max, component) => Math.max(max, component.order), -1);
    const order = Number.isFinite(terminalOrder) ? terminalOrder : lastOrder + 1;

    if (Number.isFinite(terminalOrder)) {
      await Promise.all(
        components
          .filter((component) => component.order >= order)
          .map((component) => ctx.db.patch(component._id, { order: component.order + 1 }))
      );
    }

    const id: Id<"homeComponents"> = await ctx.runMutation(api.homeComponents.create, {
      active: true,
      config,
      order,
      title: "Pokémon Champions",
      type: "PokemonChampions",
    });
    return { id };
  },
  returns: v.object({ id: v.union(v.id("homeComponents"), v.null()) }),
});

export const syncScrapedGameItems = mutation({
  args: {
    items: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        imageUrl: v.string(),
        rarity: gameItemRarityValidator,
        description: v.string(),
        priceLabel: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let created = 0;
    let updated = 0;

    const existingItems = await ctx.db.query("pokemonChampionsGameItems").take(1000);
    const itemsBySlug = new Map(existingItems.map((item) => [item.slug, item]));
    let maxOrder = existingItems.reduce((max, item) => Math.max(max, item.order), -1);

    for (const item of args.items) {
      const existing = itemsBySlug.get(item.slug);
      if (existing) {
        await ctx.db.patch(existing._id, {
          name: item.name,
          imageUrl: item.imageUrl || existing.imageUrl,
          rarity: item.rarity,
          description: item.description,
          updatedAt: now,
        });
        updated += 1;
      } else {
        maxOrder += 1;
        await ctx.db.insert("pokemonChampionsGameItems", {
          active: true,
          createdAt: now,
          description: item.description,
          imageUrl: item.imageUrl,
          name: item.name,
          order: maxOrder,
          priceLabel: item.priceLabel,
          rarity: item.rarity,
          slug: item.slug,
          tags: [],
          updatedAt: now,
        });
        created += 1;
      }
    }
    return { created, updated };
  },
  returns: v.object({ created: v.number(), updated: v.number() }),
});

export const syncScrapedPokemon = mutation({
  args: {
    pokemons: v.array(
      v.object({
        name: v.string(),
        dexNumber: v.number(),
        imageUrl: v.string(),
        primaryType: v.string(),
        secondaryType: v.optional(v.string()),
        notes: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let created = 0;
    let updated = 0;

    const existingPokemon = await ctx.db.query("pokemonChampionsPokemon").take(1000);
    const pokemonBySlug = new Map(existingPokemon.map((p) => [normalizeSlug(p.name), p]));
    let maxOrder = existingPokemon.reduce((max, p) => Math.max(max, p.order), -1);

    for (const poke of args.pokemons) {
      const slug = normalizeSlug(poke.name);
      const existing = pokemonBySlug.get(slug);

      const traits = existing ? existing.traits : ["Champions legal", "Regulation M-B"];

      const payload = {
        active: true,
        dexNumber: poke.dexNumber,
        imageUrl: poke.imageUrl || (existing ? existing.imageUrl : ""),
        name: poke.name,
        notes: poke.notes,
        primaryType: poke.primaryType,
        secondaryType: poke.secondaryType,
        traits,
        updatedAt: now,
      };

      if (existing) {
        await ctx.db.patch(existing._id, payload);
        updated += 1;
      } else {
        maxOrder += 1;
        await ctx.db.insert("pokemonChampionsPokemon", {
          ...payload,
          createdAt: now,
          order: maxOrder,
        });
        created += 1;
      }
    }
    return { created, updated };
  },
  returns: v.object({ created: v.number(), updated: v.number() }),
});

export const syncScrapedTiers = mutation({
  args: {
    tiers: v.array(
      v.object({
        imageUrl: v.optional(v.string()),
        name: v.optional(v.string()),
        pokemonSlug: v.string(),
        primaryType: v.optional(v.string()),
        secondaryType: v.optional(v.string()),
        tier: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let created = 0;
    let skipped = 0;
    let updated = 0;

    const existingPokemon = await ctx.db.query("pokemonChampionsPokemon").take(1000);
    const pokemonBySlug = new Map<string, typeof existingPokemon[number]>();
    let maxOrder = existingPokemon.reduce((max, p) => Math.max(max, p.order), -1);

    for (const pokemon of existingPokemon) {
      pokemonBySlug.set(normalizeSlug(pokemon.name), pokemon);
      const sourceSlug = getPokemonSourceSlug(pokemon.notes);
      if (sourceSlug) {
        pokemonBySlug.set(sourceSlug, pokemon);
      }
    }

    for (const entry of args.tiers) {
      const existing = pokemonBySlug.get(normalizeSlug(entry.pokemonSlug))
        ?? (entry.name ? pokemonBySlug.get(normalizeSlug(entry.name)) : undefined);

      const tierTrait = `Tier ${entry.tier}`;
      if (!existing) {
        const name = entry.name?.trim();
        if (!name) {
          skipped += 1;
          continue;
        }

        maxOrder += 1;
        const id = await ctx.db.insert("pokemonChampionsPokemon", {
          active: true,
          createdAt: now,
          dexNumber: getDexNumberFromImageUrl(entry.imageUrl),
          imageUrl: entry.imageUrl ?? "",
          name,
          notes: `Imported from Pokémon Zone tier list: https://www.pokemon-zone.com/champions/pokemon/${entry.pokemonSlug}/`,
          order: maxOrder,
          primaryType: entry.primaryType?.trim() || "Normal",
          recommendedItemIds: [],
          secondaryType: entry.secondaryType?.trim() || undefined,
          traits: ["Champions legal", "Regulation M-B", tierTrait],
          updatedAt: now,
        });
        const inserted = await ctx.db.get(id);
        if (inserted) {
          pokemonBySlug.set(normalizeSlug(inserted.name), inserted);
          pokemonBySlug.set(normalizeSlug(entry.pokemonSlug), inserted);
        }
        created += 1;
        continue;
      }

      const baseTraits = existing.traits.filter((t) => !t.startsWith("Tier "));
      if (!baseTraits.includes(tierTrait)) {
        baseTraits.push(tierTrait);
      }

      await ctx.db.patch(existing._id, {
        traits: baseTraits,
        updatedAt: now,
      });
      updated += 1;
    }
    return { created, skipped, updated };
  },
  returns: v.object({ created: v.number(), skipped: v.number(), updated: v.number() }),
});

export const syncScrapedTeams = mutation({
  args: {
    teams: v.array(
      v.object({
        name: v.string(),
        members: v.array(
          v.object({
            pokemonSlug: v.string(),
            itemSlug: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let createdTeams = 0;
    let skippedItems = 0;
    let skippedMembers = 0;
    let updatedTeams = 0;
    let updatedBestItems = 0;

    const existingPokemon = await ctx.db.query("pokemonChampionsPokemon").take(1000);
    const pokemonBySlug = new Map<string, typeof existingPokemon[number]>();
    for (const pokemon of existingPokemon) {
      pokemonBySlug.set(normalizeSlug(pokemon.name), pokemon);
      const sourceSlug = getPokemonSourceSlug(pokemon.notes);
      if (sourceSlug) {
        pokemonBySlug.set(sourceSlug, pokemon);
      }
    }

    const existingItems = await ctx.db.query("pokemonChampionsGameItems").take(1000);
    const itemsBySlug = new Map<string, typeof existingItems[number]>();
    for (const item of existingItems) {
      itemsBySlug.set(normalizeSlug(item.slug), item);
      itemsBySlug.set(normalizeSlug(item.name), item);
    }

    const existingTeams = await ctx.db.query("pokemonChampionsTeams").take(100);
    const teamsByName = new Map(existingTeams.map((t) => [t.name.trim().toLowerCase(), t]));
    let maxOrder = existingTeams.reduce((max, t) => Math.max(max, t.order), -1);
    const touchedBestItems = new Set<Id<"pokemonChampionsPokemon">>();

    for (const teamData of args.teams) {
      const slots: { pokemonId: Id<"pokemonChampionsPokemon">; gameItemId?: Id<"pokemonChampionsGameItems"> }[] = [];

      for (const member of teamData.members.slice(0, 6)) {
        const pokemon = pokemonBySlug.get(normalizeSlug(member.pokemonSlug));
        if (!pokemon) {
          skippedMembers += 1;
          continue;
        }

        let gameItemId: Id<"pokemonChampionsGameItems"> | undefined = undefined;
        if (member.itemSlug) {
          const item = itemsBySlug.get(normalizeSlug(member.itemSlug));
          if (item) {
            gameItemId = item._id;
            if (!touchedBestItems.has(pokemon._id) && pokemon.bestItemId !== item._id) {
              await ctx.db.patch(pokemon._id, {
                bestItemId: item._id,
                updatedAt: now,
              });
              updatedBestItems += 1;
            }
            touchedBestItems.add(pokemon._id);
          } else {
            skippedItems += 1;
          }
        }

        slots.push({ pokemonId: pokemon._id, gameItemId });
      }

      if (slots.length === 0) continue;

      const teamNameKey = teamData.name.trim().toLowerCase();
      const existingTeam = teamsByName.get(teamNameKey);

      if (existingTeam) {
        await ctx.db.patch(existingTeam._id, {
          slots,
          updatedAt: now,
        });
        updatedTeams += 1;
      } else {
        maxOrder += 1;
        const id = await ctx.db.insert("pokemonChampionsTeams", {
          active: true,
          createdAt: now,
          name: teamData.name.trim(),
          slots,
          order: maxOrder,
          updatedAt: now,
        });
        const inserted = await ctx.db.get(id);
        if (inserted) {
          teamsByName.set(teamNameKey, inserted);
        }
        createdTeams += 1;
      }
    }

    return { createdTeams, skippedItems, skippedMembers, updatedBestItems, updatedTeams };
  },
  returns: v.object({
    createdTeams: v.number(),
    skippedItems: v.number(),
    skippedMembers: v.number(),
    updatedBestItems: v.number(),
    updatedTeams: v.number(),
  }),
});

export const listTeams = query({
  args: {
    activeOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = limitOf(args.limit);
    if (args.activeOnly) {
      return ctx.db
        .query("pokemonChampionsTeams")
        .withIndex("by_active_order", (q) => q.eq("active", true))
        .take(limit);
    }
    return ctx.db.query("pokemonChampionsTeams").withIndex("by_order").take(limit);
  },
  returns: v.array(teamDoc),
});

export const saveTeam = mutation({
  args: {
    active: v.optional(v.boolean()),
    description: v.optional(v.string()),
    id: v.optional(v.id("pokemonChampionsTeams")),
    name: v.string(),
    slots: v.array(
      v.object({
        pokemonId: v.id("pokemonChampionsPokemon"),
        gameItemId: v.optional(v.id("pokemonChampionsGameItems")),
      })
    ),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const name = args.name.trim();
    if (!name) {
      throw new ConvexError({ code: "INVALID_NAME", message: "Tên team không hợp lệ." });
    }

    const payload = {
      active: args.active ?? true,
      description: args.description,
      name,
      slots: args.slots,
      updatedAt: now,
    };

    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return args.id;
    }

    const last = await ctx.db.query("pokemonChampionsTeams").withIndex("by_order").order("desc").first();
    return ctx.db.insert("pokemonChampionsTeams", {
      ...payload,
      createdAt: now,
      order: args.order ?? ((last?.order ?? -1) + 1),
    });
  },
  returns: v.id("pokemonChampionsTeams"),
});

export const removeTeam = mutation({
  args: { id: v.id("pokemonChampionsTeams") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

export const syncScrapedTypes = mutation({
  args: {
    types: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let created = 0;
    let updated = 0;

    for (const t of args.types) {
      const existing = await ctx.db
        .query("pokemonChampionsTypes")
        .withIndex("by_slug", (q) => q.eq("slug", t.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: t.name,
          imageUrl: t.imageUrl || existing.imageUrl,
          updatedAt: now,
        });
        updated++;
      } else {
        await ctx.db.insert("pokemonChampionsTypes", {
          name: t.name,
          slug: t.slug,
          imageUrl: t.imageUrl,
          createdAt: now,
          updatedAt: now,
        });
        created++;
      }
    }

    return { created, updated };
  },
  returns: v.object({ created: v.number(), updated: v.number() }),
});

export const listTypes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pokemonChampionsTypes").take(100);
  },
});

export const clearAllPokemonData = mutation({
  args: {},
  handler: async (ctx) => {
    const pokemons = await ctx.db.query("pokemonChampionsPokemon").take(1000);
    for (const p of pokemons) {
      await ctx.db.delete(p._id);
    }
    const items = await ctx.db.query("pokemonChampionsGameItems").take(1000);
    for (const i of items) {
      await ctx.db.delete(i._id);
    }
    const teams = await ctx.db.query("pokemonChampionsTeams").take(1000);
    for (const t of teams) {
      await ctx.db.delete(t._id);
    }
    const types = await ctx.db.query("pokemonChampionsTypes").take(1000);
    for (const ty of types) {
      await ctx.db.delete(ty._id);
    }
    return { success: true };
  },
  returns: v.object({ success: v.boolean() }),
});


