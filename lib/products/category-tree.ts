export type CategoryTreeItem = {
  _id: string;
  name: string;
  order?: number;
  parentId?: string;
  slug?: string;
};

export type CategoryDisplayItem<T extends CategoryTreeItem = CategoryTreeItem> = T & {
  depth: number;
  hasChildren: boolean;
  path: string;
  parentName?: string;
};

const collator = new Intl.Collator('vi');

function sortCategories<T extends CategoryTreeItem>(items: T[]) {
  return [...items].sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return collator.compare(a.name, b.name);
  });
}

export function buildCategoryDisplayItems<T extends CategoryTreeItem>(categories: T[]): CategoryDisplayItem<T>[] {
  const byId = new Map(categories.map((category) => [category._id, category]));
  const childrenMap = new Map<string, T[]>();
  const roots: T[] = [];

  categories.forEach((category) => {
    if (category.parentId && byId.has(category.parentId)) {
      const children = childrenMap.get(category.parentId) ?? [];
      children.push(category);
      childrenMap.set(category.parentId, children);
      return;
    }
    roots.push(category);
  });

  const result: CategoryDisplayItem<T>[] = [];
  const visit = (category: T, depth: number, ancestors: T[]) => {
    const children = sortCategories(childrenMap.get(category._id) ?? []);
    result.push({
      ...category,
      depth,
      hasChildren: children.length > 0,
      parentName: ancestors[ancestors.length - 1]?.name,
      path: [...ancestors, category].map((item) => item.name).join(' / '),
    });
    children.forEach((child) => visit(child, depth + 1, [...ancestors, category]));
  };

  sortCategories(roots).forEach((root) => visit(root, 0, []));
  return result;
}

export function getCategoryPathItems<T extends CategoryTreeItem>(categories: T[], categoryId?: string | null): T[] {
  if (!categoryId) return [];
  const byId = new Map(categories.map((category) => [category._id, category]));
  const path: T[] = [];
  const seen = new Set<string>();
  let current = byId.get(categoryId);

  while (current && !seen.has(current._id)) {
    seen.add(current._id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}

export function categoryMatchesQuery(category: CategoryDisplayItem, query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;
  return category.name.toLowerCase().includes(keyword) || category.path.toLowerCase().includes(keyword);
}
