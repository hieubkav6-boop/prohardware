'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLink, LayoutGrid, Loader2, RotateCcw, Save, Shield, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, cn } from '@/app/admin/components/ui';

type MiniAppDoc = Doc<'miniApps'>;
type PokemonRouteSurface = 'standalone-route' | 'site-layout';

const POKEMON_ROUTE_SLUG = 'pokemon-champions';

type Draft = {
  enabled: boolean;
  homeComponentEnabled: boolean;
  homeComponentMaxItems: number;
  homeComponentStyle: string;
  noindex: boolean;
  routeMode: MiniAppDoc['routeMode'];
  routeSlug: string;
  routeSurface: PokemonRouteSurface;
  siteEnabled: boolean;
  visibility: MiniAppDoc['visibility'];
};

const getRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
);

const routeModeFromPokemonSurface = (routeSurface: PokemonRouteSurface): MiniAppDoc['routeMode'] => (
  routeSurface === 'standalone-route' ? 'namespaced' : 'root'
);

const pokemonSurfaceFromApp = (app: MiniAppDoc): PokemonRouteSurface => {
  const config = getRecord(app.config);
  if (app.routeMode === 'namespaced') {
    return 'standalone-route';
  }
  if (app.routeMode === 'root') {
    return 'site-layout';
  }
  return config.routeSurface === 'standalone-route' ? 'standalone-route' : 'site-layout';
};

const createDraft = (app: MiniAppDoc): Draft => {
  const config = getRecord(app.config);
  const homeComponent = getRecord(config.homeComponent);
  return {
    enabled: app.enabled,
    homeComponentEnabled: Boolean(homeComponent.enabled),
    homeComponentMaxItems: Number(homeComponent.maxItems ?? 8),
    homeComponentStyle: typeof homeComponent.style === 'string' ? homeComponent.style : 'featured',
    noindex: app.noindex,
    routeMode: app.routeMode,
    routeSlug: app.type === 'pokemon-champions' ? POKEMON_ROUTE_SLUG : app.routeSlug ?? '',
    routeSurface: app.type === 'pokemon-champions' ? pokemonSurfaceFromApp(app) : 'site-layout',
    siteEnabled: app.siteEnabled,
    visibility: app.visibility,
  };
};

export default function SystemMiniAppsPage() {
  const apps = useQuery(api.miniApps.listAll);
  const ensureDefaults = useMutation(api.miniApps.ensureDefaults);
  const updateSettings = useMutation(api.miniApps.updateSettings);
  const syncPokemonHomeComponent = useMutation(api.pokemonChampions.syncHomeComponent);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const didEnsureDefaults = useRef(false);

  useEffect(() => {
    if (apps !== undefined && !didEnsureDefaults.current) {
      didEnsureDefaults.current = true;
      void ensureDefaults();
    }
  }, [apps, ensureDefaults]);

  useEffect(() => {
    if (!apps) {
      return;
    }
    setDrafts((prev) => {
      const next = { ...prev };
      apps.forEach((app) => {
        if (!next[app._id]) {
          next[app._id] = createDraft(app);
        }
      });
      return next;
    });
  }, [apps]);

  const appCount = apps?.length ?? 0;
  const publicCount = useMemo(() => apps?.filter((app) => app.siteEnabled && app.visibility === 'public').length ?? 0, [apps]);

  const setDraft = (appId: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        ...patch,
      } as Draft,
    }));
  };

  const handleSync = async () => {
    try {
      const result = await ensureDefaults();
      toast.success(`Đã đồng bộ Mini Apps: thêm ${result.created}, cập nhật ${result.updated}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đồng bộ Mini Apps.');
    }
  };

  const handleSave = async (app: MiniAppDoc) => {
    const draft = drafts[app._id] ?? createDraft(app);
    const isPokemonChampions = app.type === 'pokemon-champions';
    const nextRouteMode = isPokemonChampions ? routeModeFromPokemonSurface(draft.routeSurface) : draft.routeMode;
    const nextRouteSlug = isPokemonChampions ? POKEMON_ROUTE_SLUG : draft.routeSlug;
    setSavingId(app._id);
    try {
      const nextConfig = isPokemonChampions
        ? {
            ...getRecord(app.config),
            homeComponent: {
              enabled: draft.homeComponentEnabled,
              maxItems: draft.homeComponentMaxItems,
              style: draft.homeComponentStyle,
            },
            routeSurface: draft.routeSurface,
          }
        : undefined;
      await updateSettings({
        ...(nextConfig ? { config: nextConfig } : {}),
        enabled: draft.enabled,
        id: app._id,
        noindex: draft.noindex,
        routeMode: nextRouteMode,
        routeSlug: nextRouteSlug,
        siteEnabled: draft.siteEnabled,
        visibility: draft.visibility,
      });
      if (isPokemonChampions) {
        await syncPokemonHomeComponent({
          enabled: draft.homeComponentEnabled,
          config: {
            maxItems: draft.homeComponentMaxItems,
            routeUrl: draft.routeSurface === 'standalone-route' ? '/apps/pokemon-champions' : '/pokemon-champions',
            style: draft.homeComponentStyle,
          },
        });
      }
      toast.success('Đã lưu cấu hình mini app.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu cấu hình mini app.');
    } finally {
      setSavingId(null);
    }
  };

  if (apps === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Mini App Platform
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Mini Apps</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Khu vực phát triển app nhỏ độc lập, có route site riêng nhưng không làm loãng module core.
          </p>
        </div>
        <Button variant="outline" onClick={handleSync}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Đồng bộ mặc định
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Mini apps" value={appCount} />
        <MetricCard label="Public routes" value={publicCount} />
        <MetricCard label="Adapter đầu tiên" value="Kanban" />
      </div>

      <div className="grid gap-5">
        {apps.map((app) => {
          const draft = drafts[app._id] ?? createDraft(app);
          const isPokemonChampions = app.type === 'pokemon-champions';
          const effectiveRouteMode = isPokemonChampions ? routeModeFromPokemonSurface(draft.routeSurface) : draft.routeMode;
          const effectiveRouteSlug = isPokemonChampions ? POKEMON_ROUTE_SLUG : draft.routeSlug || app.routeSlug || app.key;
          const sitePath = effectiveRouteMode === 'root' ? `/${effectiveRouteSlug}` : `/apps/${effectiveRouteSlug}`;
          const isRouteExposed = draft.siteEnabled && effectiveRouteMode !== 'none';
          return (
            <Card key={app._id} className="overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{app.name}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{app.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={draft.enabled ? 'success' : 'secondary'}>
                      {draft.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant={draft.visibility === 'public' ? 'info' : 'secondary'}>
                      {draft.visibility === 'public' ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ToggleTile
                      active={draft.enabled}
                      label="Bật mini app"
                      onClick={() => setDraft(app._id, { enabled: !draft.enabled })}
                    />
                    <ToggleTile
                      active={draft.siteEnabled}
                      label="Site route"
                      onClick={() => setDraft(app._id, { siteEnabled: !draft.siteEnabled })}
                    />
                    <ToggleTile
                      active={!draft.noindex}
                      label="Cho SEO index"
                      onClick={() => setDraft(app._id, { noindex: !draft.noindex })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{isPokemonChampions ? 'Kiểu route' : 'Route mode'}</Label>
                      {isPokemonChampions ? (
                        <select
                          value={draft.routeSurface}
                          onChange={(event) => {
                            const routeSurface = event.target.value as PokemonRouteSurface;
                            setDraft(app._id, {
                              routeMode: routeModeFromPokemonSurface(routeSurface),
                              routeSlug: POKEMON_ROUTE_SLUG,
                              routeSurface,
                            });
                          }}
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                        >
                          <option value="site-layout">Dùng chung layout site</option>
                          <option value="standalone-route">Site route riêng</option>
                        </select>
                      ) : (
                        <select
                          value={draft.routeMode}
                          onChange={(event) => setDraft(app._id, { routeMode: event.target.value as MiniAppDoc['routeMode'] })}
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                        >
                          <option value="none">Không expose</option>
                          <option value="namespaced">/apps/[slug]</option>
                          <option value="root">/[slug]</option>
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Route slug</Label>
                      <Input
                        value={isPokemonChampions ? POKEMON_ROUTE_SLUG : draft.routeSlug}
                        onChange={(event) => setDraft(app._id, { routeSlug: event.target.value })}
                        placeholder="kanban"
                        disabled={isPokemonChampions || draft.routeMode === 'none'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <select
                        value={draft.visibility}
                        onChange={(event) => setDraft(app._id, { visibility: event.target.value as MiniAppDoc['visibility'] })}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    Route site hiện tại:{' '}
                    <span className="font-mono font-semibold">{isRouteExposed ? sitePath : 'Không expose'}</span>
                  </div>

                  {isPokemonChampions && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="grid gap-4 md:grid-cols-3">
                        <ToggleTile
                          active={draft.homeComponentEnabled}
                          label="Hiện ở Home Components"
                          onClick={() => setDraft(app._id, { homeComponentEnabled: !draft.homeComponentEnabled })}
                        />
                        <div className="space-y-2">
                          <Label>Home style</Label>
                          <select
                            value={draft.homeComponentStyle}
                            onChange={(event) => setDraft(app._id, { homeComponentStyle: event.target.value })}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                          >
                            <option value="featured">Featured Grid</option>
                            <option value="grid">Grid</option>
                            <option value="list">Horizontal Grid</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <Label>Số card home</Label>
                          <Input
                            type="number"
                            min={3}
                            max={12}
                            value={draft.homeComponentMaxItems}
                            onChange={(event) => setDraft(app._id, { homeComponentMaxItems: Number(event.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <Shield className="h-4 w-4" />
                      Isolation contract
                    </div>
                    <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                      <li>Code app nằm ở `features/mini-apps/{app.type}`.</li>
                      <li>System chỉ quản registry, route và visibility.</li>
                      <li>Kanban dùng data riêng, không trộn vào Home Components hay Experience.</li>
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleSave(app)} disabled={savingId === app._id}>
                      {savingId === app._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Lưu cấu hình
                    </Button>
                    <Link
                      href={`/admin/mini-apps/${app.key}`}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Mở Admin
                    </Link>
                    {isRouteExposed && (
                      <Link
                        href={sitePath}
                        target="_blank"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Site
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      </CardContent>
    </Card>
  );
}

function ToggleTile({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border p-3 text-left text-sm transition-colors',
        active
          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
      )}
    >
      <div className="font-medium">{label}</div>
      <div className="mt-1 text-xs opacity-70">{active ? 'Đang bật' : 'Đang tắt'}</div>
    </button>
  );
}
