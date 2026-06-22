import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export async function isProductCategoryHierarchyEnabled(ctx: QueryCtx | MutationCtx) {
  const feature = await ctx.db
    .query("moduleFeatures")
    .withIndex("by_module_feature", (q) =>
      q.eq("moduleKey", "products").eq("featureKey", "enableCategoryHierarchy")
    )
    .unique();

  return feature?.enabled === true;
}

export async function listProductCategoryScopeIds(
  ctx: QueryCtx | MutationCtx,
  categoryId: Id<"productCategories">,
  options?: { activeDescendantsOnly?: boolean },
) {
  const hierarchyEnabled = await isProductCategoryHierarchyEnabled(ctx);
  if (!hierarchyEnabled) {
    return [categoryId];
  }

  const scopeIds: Id<"productCategories">[] = [categoryId];
  const queue: Id<"productCategories">[] = [categoryId];
  const seen = new Set<string>([categoryId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;

    const children = await ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", currentId))
      .collect();

    children.forEach((child) => {
      if (seen.has(child._id)) return;
      seen.add(child._id);
      if (!options?.activeDescendantsOnly || child.active) {
        scopeIds.push(child._id);
      }
      queue.push(child._id);
    });
  }

  return scopeIds;
}

export function buildProductCategoryChildrenMap(categories: Doc<"productCategories">[]) {
  const map = new Map<Id<"productCategories">, Id<"productCategories">[]>();
  categories.forEach((category) => {
    if (!category.parentId) return;
    const children = map.get(category.parentId) ?? [];
    children.push(category._id);
    map.set(category.parentId, children);
  });
  return map;
}

export function collectDescendantIdsFromMap(
  categoryId: Id<"productCategories">,
  childrenMap: Map<Id<"productCategories">, Id<"productCategories">[]>,
) {
  const ids: Id<"productCategories">[] = [categoryId];
  const queue: Id<"productCategories">[] = [categoryId];
  const seen = new Set<string>([categoryId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;
    const children = childrenMap.get(currentId) ?? [];
    children.forEach((childId) => {
      if (seen.has(childId)) return;
      seen.add(childId);
      ids.push(childId);
      queue.push(childId);
    });
  }

  return ids;
}
