import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("catalogs")
      .withIndex("by_status_order", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const countAdmin = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Published"), v.literal("Draft"), v.literal("Archived"))),
  },
  handler: async (ctx, args) => {
    let q: any = ctx.db.query("catalogs");
    if (args.search) {
      q = ctx.db.query("catalogs").withSearchIndex("search_title", (q: any) => {
        let searchQ = q.search("title", args.search!);
        if (args.status) {
          searchQ = searchQ.eq("status", args.status);
        }
        return searchQ;
      });
      const results = await q.collect();
      return { count: results.length };
    }
    if (args.status) {
      q = q.withIndex("by_status_order", (q: any) => q.eq("status", args.status!));
    }
    const results = await q.collect();
    return { count: results.length };
  },
});

export const listAdminWithOffset = query({
  args: {
    limit: v.number(),
    offset: v.number(),
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Published"), v.literal("Draft"), v.literal("Archived"))),
  },
  handler: async (ctx, args) => {
    let results = [];
    if (args.search) {
      const q = ctx.db.query("catalogs").withSearchIndex("search_title", (q) => {
        let searchQ = q.search("title", args.search!);
        if (args.status) {
          searchQ = searchQ.eq("status", args.status);
        }
        return searchQ;
      });
      results = await q.collect();
      // Manual pagination for search
      return results.slice(args.offset, args.offset + args.limit);
    }
    
    
    let q: any = ctx.db.query("catalogs");
    if (args.status) {
      q = q.withIndex("by_status_order", (q: any) => q.eq("status", args.status!));
    } else {
      q = q.order("desc");
    }
    
    results = await q.collect();
    if (args.status) {
      results.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    }
    return results.slice(args.offset, args.offset + args.limit);
  },
});

export const listAdminIds = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Published"), v.literal("Draft"), v.literal("Archived"))),
  },
  handler: async (ctx, args) => {
    let q: any = ctx.db.query("catalogs");
    if (args.search) {
      q = ctx.db.query("catalogs").withSearchIndex("search_title", (q: any) => {
        let searchQ = q.search("title", args.search!);
        if (args.status) {
          searchQ = searchQ.eq("status", args.status);
        }
        return searchQ;
      });
    } else if (args.status) {
      q = q.withIndex("by_status_order", (q: any) => q.eq("status", args.status!));
    }
    const results = await q.collect();
    return { ids: results.map((r: any) => r._id) };
  },
});

export const reorder = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("catalogs"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const update of args.updates) {
      await ctx.db.patch(update.id, { order: update.order });
    }
  },
});

export const duplicate = mutation({
  args: { id: v.id("catalogs") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Catalog with ID ${args.id} not found.`);
    }

    const { _id, _creationTime, ...data } = existing;
    
    const newId = await ctx.db.insert("catalogs", {
      ...data,
      title: `${data.title} (Copy)`,
      slug: `${data.slug}-copy-${Date.now()}`,
      status: "Draft",
      order: data.order + 1,
      publishedAt: undefined,
    });
    
    return newId;
  },
});


export const get = query({
  args: { id: v.id("catalogs") },
  handler: async (ctx, args) => {
    const catalog = await ctx.db.get(args.id);
    if (!catalog) return null;
    
    // Attach URLs for storage IDs
    let pdfUrl = null;
    if (catalog.pdfStorageId) {
      pdfUrl = await ctx.storage.getUrl(catalog.pdfStorageId);
    }
    
    let thumbnailUrl = catalog.thumbnail;
    if (catalog.thumbnailStorageId) {
      thumbnailUrl = await ctx.storage.getUrl(catalog.thumbnailStorageId) || catalog.thumbnail;
    }

    const pageImageUrls = [];
    if (catalog.pageImages && catalog.pageImages.length > 0) {
      for (const storageId of catalog.pageImages) {
        if (storageId) {
          const url = await ctx.storage.getUrl(storageId);
          pageImageUrls.push(url);
        } else {
          pageImageUrls.push(null);
        }
      }
    }

    return { ...catalog, pdfUrl, thumbnailUrl, pageImageUrls };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const catalog = await ctx.db
      .query("catalogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
      
    if (!catalog) return null;
    
    // Attach URLs for storage IDs
    let pdfUrl = null;
    if (catalog.pdfStorageId) {
      pdfUrl = await ctx.storage.getUrl(catalog.pdfStorageId);
    }
    
    let thumbnailUrl = catalog.thumbnail;
    if (catalog.thumbnailStorageId) {
      thumbnailUrl = await ctx.storage.getUrl(catalog.thumbnailStorageId) || catalog.thumbnail;
    }

    const pageImageUrls = [];
    if (catalog.pageImages && catalog.pageImages.length > 0) {
      for (const storageId of catalog.pageImages) {
        if (storageId) {
          const url = await ctx.storage.getUrl(storageId);
          pageImageUrls.push(url);
        } else {
          pageImageUrls.push(null);
        }
      }
    }

    return { ...catalog, pdfUrl, thumbnailUrl, pageImageUrls };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    pdfStorageId: v.id("_storage"),
    pageImages: v.optional(v.array(v.union(v.id("_storage"), v.null()))),
    totalPages: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    status: v.union(v.literal("Published"), v.literal("Draft"), v.literal("Archived")),
    order: v.number(),
    featured: v.optional(v.boolean()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("catalogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
      
    if (existing) {
      throw new Error(`Catalog with slug "${args.slug}" already exists.`);
    }

    const newId = await ctx.db.insert("catalogs", {
      ...args,
      views: 0,
      publishedAt: args.status === "Published" ? Date.now() : undefined,
    });
    
    return newId;
  },
});

export const update = mutation({
  args: {
    id: v.id("catalogs"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")),
    pageImages: v.optional(v.array(v.union(v.id("_storage"), v.null()))),
    totalPages: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    status: v.optional(v.union(v.literal("Published"), v.literal("Draft"), v.literal("Archived"))),
    order: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error(`Catalog with ID ${id} not found.`);
    }

    // Check slug collision
    if (updates.slug && updates.slug !== existing.slug) {
      const slugCollision = await ctx.db
        .query("catalogs")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();
      if (slugCollision) {
        throw new Error(`Catalog with slug "${updates.slug}" already exists.`);
      }
    }

    let publishedAt = existing.publishedAt;
    if (updates.status && updates.status !== existing.status) {
      if (updates.status === "Published" && !existing.publishedAt) {
        publishedAt = Date.now();
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      publishedAt,
    });
    
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("catalogs") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Catalog with ID ${args.id} not found.`);
    }
    
    // Optional: Delete related files from storage
    if (existing.pdfStorageId) {
      await ctx.storage.delete(existing.pdfStorageId);
    }
    if (existing.thumbnailStorageId) {
      await ctx.storage.delete(existing.thumbnailStorageId);
    }
    if (existing.pageImages) {
      for (const imgId of existing.pageImages) {
        if (imgId) {
          await ctx.storage.delete(imgId);
        }
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const incrementViews = mutation({
  args: { id: v.id("catalogs") },
  handler: async (ctx, args) => {
    const catalog = await ctx.db.get(args.id);
    if (!catalog) return;
    
    await ctx.db.patch(args.id, {
      views: catalog.views + 1,
    });
  },
});

export const listPublishedWithUrls = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db
      .query("catalogs")
      .withIndex("by_status_order", (q) => q.eq("status", "Published"))
      .collect();

    // Sắp xếp thứ tự tăng dần
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const results = [];
    for (const catalog of list) {
      let pdfUrl = null;
      if (catalog.pdfStorageId) {
        pdfUrl = await ctx.storage.getUrl(catalog.pdfStorageId);
      }
      
      let thumbnailUrl = catalog.thumbnail;
      if (catalog.thumbnailStorageId) {
        thumbnailUrl = await ctx.storage.getUrl(catalog.thumbnailStorageId) || catalog.thumbnail;
      }

      const pageImageUrls = [];
      if (catalog.pageImages && catalog.pageImages.length > 0) {
        for (const storageId of catalog.pageImages) {
          if (storageId) {
            const url = await ctx.storage.getUrl(storageId);
            pageImageUrls.push(url);
          } else {
            pageImageUrls.push(null);
          }
        }
      }
      results.push({
        ...catalog,
        pdfUrl,
        thumbnailUrl,
        pageImageUrls,
      });
    }
    return results;
  },
});
