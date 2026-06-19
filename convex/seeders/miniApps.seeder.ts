import { BaseSeeder, type SeedConfig, type SeedResult } from './base';
import type { DataModel, Doc } from '../_generated/dataModel';
import type { GenericMutationCtx } from 'convex/server';
import { MINI_APP_DEFINITIONS } from '../../lib/mini-apps/registry';

type MiniAppData = Omit<Doc<'miniApps'>, '_creationTime' | '_id'>;

export class MiniAppsSeeder extends BaseSeeder<MiniAppData> {
  moduleName = 'miniApps';
  tableName = 'miniApps';
  dependencies = [];

  constructor(ctx: GenericMutationCtx<DataModel>) {
    super(ctx);
  }

  async seed(config: SeedConfig): Promise<SeedResult> {
    const startTime = Date.now();
    this.config = { batchSize: 50, dependencies: true, force: false, ...config };

    if (this.config.force) {
      await this.clear();
    }

    const now = Date.now();
    let created = 0;
    let skipped = 0;

    for (const definition of MINI_APP_DEFINITIONS) {
      const existing = await this.ctx.db
        .query('miniApps')
        .withIndex('by_key', (q) => q.eq('key', definition.key))
        .unique();

      if (existing) {
        skipped += 1;
        continue;
      }

      await this.ctx.db.insert('miniApps', {
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
      });
      created += 1;
    }

    return {
      created,
      dependencies: [],
      duration: Date.now() - startTime,
      module: this.moduleName,
      skipped,
    };
  }

  generateFake(): MiniAppData {
    const now = Date.now();
    return {
      adminEnabled: true,
      config: {},
      createdAt: now,
      description: 'Mini app',
      enabled: true,
      icon: 'LayoutGrid',
      key: 'custom',
      name: 'Custom Mini App',
      noindex: true,
      order: 99,
      routeMode: 'none',
      siteEnabled: false,
      type: 'custom',
      updatedAt: now,
      visibility: 'private',
    };
  }

  validateRecord(record: MiniAppData): boolean {
    return Boolean(record.key && record.name && record.type);
  }

  protected async clear(): Promise<void> {
    const apps = await this.ctx.db.query('miniApps').take(100);
    await Promise.all(apps.map((app) => this.ctx.db.delete(app._id)));
  }
}
