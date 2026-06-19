'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLink, LayoutGrid, Loader2, Plus, Shield, ShieldOff } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui';

export default function AdminMiniAppsPage() {
  const ensureDefaults = useMutation(api.miniApps.ensureDefaults);
  const apps = useQuery(api.miniApps.listEnabledForAdmin);
  const adminStatus = useQuery(api.miniApps.getAdminStatus);
  const didEnsureDefaults = useRef(false);

  useEffect(() => {
    if (apps !== undefined && !didEnsureDefaults.current) {
      didEnsureDefaults.current = true;
      void ensureDefaults();
    }
  }, [apps, ensureDefaults]);

  if (apps === undefined || adminStatus === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!adminStatus.adminEnabled) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <ShieldOff className="mb-3 h-8 w-8" />
        <h1 className="text-xl font-semibold">Admin Mini Apps đang tắt</h1>
        <p className="mt-2 text-sm">Bật lại tính năng này ở System → Modules → Mini Apps.</p>
        <Link href="/system/modules/miniApps" className="mt-4 text-sm font-medium underline">
          Mở cấu hình Mini Apps
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mini Apps</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Không gian chạy các app nhỏ tách khỏi module core.
          </p>
        </div>
        <Button variant="outline" onClick={() => void ensureDefaults()}>
          <Plus className="mr-2 h-4 w-4" />
          Đồng bộ app mặc định
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <Card key={app._id} className="overflow-hidden">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <p className="text-xs text-slate-500">{app.type}</p>
                  </div>
                </div>
                <Badge variant={app.visibility === 'public' ? 'success' : 'secondary'}>
                  {app.visibility === 'public' ? 'Public' : 'Private'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="min-h-10 text-sm text-slate-500 dark:text-slate-400">{app.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Site: {app.siteEnabled ? 'bật' : 'tắt'}
                </span>
                {app.routeSlug && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {app.routeMode === 'root' ? `/${app.routeSlug}` : `/apps/${app.routeSlug}`}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/mini-apps/${app.key}`}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Mở Admin
                </Link>
                {app.siteEnabled && app.routeSlug && (
                  <Link
                    href={app.routeMode === 'root' ? `/${app.routeSlug}` : `/apps/${app.routeSlug}`}
                    target="_blank"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Site
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
