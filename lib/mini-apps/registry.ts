export type MiniAppRouteMode = 'none' | 'namespaced' | 'root';
export type MiniAppVisibility = 'private' | 'public';

export type MiniAppDefinition = {
  adminEnabled: boolean;
  config: Record<string, unknown>;
  description: string;
  icon: string;
  key: string;
  moduleKey?: string;
  name: string;
  noindex: boolean;
  order: number;
  routeMode: MiniAppRouteMode;
  routeSlug: string;
  siteEnabled: boolean;
  type: string;
  visibility: MiniAppVisibility;
};

export const MINI_APP_DEFINITIONS: MiniAppDefinition[] = [
  {
    adminEnabled: true,
    config: {
      accent: '#18181b',
      defaultColumns: ['Yêu cầu', 'Cần làm', 'Đang làm', 'Đã xong'],
      layout: 'compact',
    },
    description: 'Mini app Kanban độc lập để thử nghiệm và quản lý công việc nhỏ.',
    icon: 'LayoutGrid',
    key: 'kanban',
    moduleKey: 'miniApps',
    name: 'Kanban Mini App',
    noindex: true,
    order: 1,
    routeMode: 'root',
    routeSlug: 'kanban',
    siteEnabled: true,
    type: 'kanban',
    visibility: 'public',
  },
  {
    adminEnabled: true,
    config: {
      accent: '#2563eb',
      templates: ['modern', 'professional', 'creative', 'elegant', 'technical', 'bold', 'bordered', 'sidebar', 'retro', 'accent'],
    },
    description: 'Mini app thiết kế CV / sơ yếu lý lịch chuyên nghiệp.',
    icon: 'FileText',
    key: 'cv-builder',
    moduleKey: 'miniApps',
    name: 'CV Builder Mini App',
    noindex: true,
    order: 2,
    routeMode: 'root',
    routeSlug: 'cv-builder',
    siteEnabled: true,
    type: 'cv-builder',
    visibility: 'public',
  },
  {
    adminEnabled: true,
    config: {
      accent: '#ef4444',
      homeComponent: {
        enabled: false,
        maxItems: 8,
        style: 'spotlight',
      },
      routeSurface: 'site-layout',
    },
    description: 'Order items game Pokemon Champions.',
    icon: 'Gamepad2',
    key: 'pokemon-champions',
    moduleKey: 'miniApps',
    name: 'Pokemon Champions',
    noindex: true,
    order: 3,
    routeMode: 'root',
    routeSlug: 'pokemon-champions',
    siteEnabled: true,
    type: 'pokemon-champions',
    visibility: 'public',
  },
];

export const MINI_APP_TYPE_LABELS: Record<string, string> = {
  'cv-builder': 'CV Builder',
  kanban: 'Kanban',
  'pokemon-champions': 'Pokemon Champions',
};

export const MINI_APP_DEFAULT_ROUTE_SLUGS = MINI_APP_DEFINITIONS.map((app) => app.routeSlug);
