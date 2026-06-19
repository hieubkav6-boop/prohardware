'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Loader2, ShieldOff } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ModuleGuard } from '@/app/admin/components/ModuleGuard';
import { Button } from '@/app/admin/components/ui';
import { useAdminAuth } from '@/app/admin/auth/context';
import { MiniAppHost } from './MiniAppHost';

export function AdminMiniAppHost({ appKey }: { appKey: string }) {
  const { user } = useAdminAuth();
  const ensureDefaults = useMutation(api.miniApps.ensureDefaults);
  const app = useQuery(api.miniApps.getByKey, { key: appKey });
  const adminStatus = useQuery(api.miniApps.getAdminStatus);

  useEffect(() => {
    void ensureDefaults();
  }, [ensureDefaults]);

  if (app === undefined || adminStatus === undefined) {
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

  if (!app) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mini app không tồn tại</h1>
        <p className="mt-2 text-sm text-slate-500">Hãy đồng bộ Mini Apps ở System rồi thử lại.</p>
        <Button className="mt-4" onClick={() => window.location.assign('/admin/mini-apps')}>
          Quay lại Mini Apps
        </Button>
      </div>
    );
  }

  if (!app.enabled) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <h1 className="text-xl font-semibold">Mini app đang tắt</h1>
        <p className="mt-2 text-sm">Bật lại mini app này trong `/system/mini-apps` để sử dụng.</p>
        <Link href="/system/mini-apps" className="mt-4 text-sm font-medium underline">
          Mở System Mini Apps
        </Link>
      </div>
    );
  }

  return (
    <ModuleGuard moduleKey="miniApps">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/admin/mini-apps" className="mb-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
              <ArrowLeft className="h-4 w-4" />
              Mini Apps
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{app.name}</h1>
            {app.type !== 'pokemon-champions' && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{app.description}</p>
            )}
          </div>
          {app.siteEnabled && app.routeSlug && (
            <Link
              href={app.routeMode === 'root' ? `/${app.routeSlug}` : `/apps/${app.routeSlug}`}
              target="_blank"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Mở route site
            </Link>
          )}
        </div>
        <MiniAppHost
          appConfig={app.config as Record<string, unknown>}
          appId={app._id}
          appName={app.name}
          appType={app.type}
          editable
          userId={user?.id as Id<'users'> | undefined}
        />
      </div>
    </ModuleGuard>
  );
}
