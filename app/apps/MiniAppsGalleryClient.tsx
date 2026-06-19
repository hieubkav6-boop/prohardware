'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { ExternalLink, LayoutGrid, List, PanelsTopLeft, Search } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';

type PublicMiniApp = Doc<'miniApps'>;
type ViewMode = 'grid' | 'list';

const getRoutePath = (app: PublicMiniApp) => {
  const slug = app.routeSlug ?? app.key;
  return app.routeMode === 'root' ? `/${slug}` : `/apps/${slug}`;
};

function MiniAppPreview({ app }: { app: PublicMiniApp }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
        <PanelsTopLeft className="h-3.5 w-3.5" />
        {app.type}
      </div>
      <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-2xl backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-indigo-100">
          <LayoutGrid className="h-4 w-4" />
          Mini app
        </div>
        <div className="mt-2 text-xl font-bold">{app.name}</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-2 rounded-full bg-white/60" />
          <div className="h-2 rounded-full bg-white/30" />
          <div className="h-2 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function MiniAppCard({ app }: { app: PublicMiniApp }) {
  const href = getRoutePath(app);

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <MiniAppPreview app={app} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
          <Link
            href={href}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-xl transition-transform duration-300 group-hover:scale-100"
          >
            <ExternalLink className="h-4 w-4" />
            Mở mini app
          </Link>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">{app.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{app.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Public
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">{href}</span>
          <Link href={href} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
            Xem thử
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniAppListItem({ app }: { app: PublicMiniApp }) {
  const href = getRoutePath(app);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-md">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <MiniAppPreview app={app} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900">{app.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{app.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>{app.type}</span>
          <span>·</span>
          <span className="font-mono">{href}</span>
        </div>
      </div>
      <Link
        href={href}
        target="_blank"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <ExternalLink className="h-4 w-4" />
        Mở
      </Link>
    </div>
  );
}

export function MiniAppsGalleryClient({
  initialApps,
}: {
  initialApps: PublicMiniApp[];
}) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const liveApps = useQuery(api.miniApps.listPublicGallery) as PublicMiniApp[] | undefined;
  const apps = liveApps ?? initialApps;

  const filteredApps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return apps;
    }
    return apps.filter((app) =>
      app.name.toLowerCase().includes(query)
      || app.description.toLowerCase().includes(query)
      || app.type.toLowerCase().includes(query)
      || (app.routeSlug ?? '').toLowerCase().includes(query)
    );
  }, [apps, search]);

  return (
    <div className="min-h-screen bg-slate-50" style={{ colorScheme: 'light' }}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
              <PanelsTopLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight text-slate-900">Mini Apps</h2>
              <p className="text-[11px] text-slate-400">Công cụ nhỏ trong website</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">{apps.length} app public</span>
        </div>
      </header>

      <section className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Kho Mini Apps</h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-500">
            Duyệt và mở nhanh các mini app đang được quản trị viên bật public.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mini app..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-slate-500">{filteredApps.length} app</span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="py-20 text-center">
            <PanelsTopLeft className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm text-slate-500">
              {search ? 'Không tìm thấy mini app phù hợp' : 'Chưa có mini app public nào'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app) => (
              <MiniAppCard key={app._id} app={app} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app) => (
              <MiniAppListItem key={app._id} app={app} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
          Mini Apps · Được quản lý trong System
        </div>
      </footer>
    </div>
  );
}
