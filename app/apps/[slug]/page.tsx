import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CustomToaster } from '@/components/shared/CustomToaster';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex';
import { MiniAppHost } from '@/features/mini-apps/MiniAppHost';

interface Props {
  params: Promise<{ slug: string }>;
}

const resolveNamespacedMiniApp = async (slug: string) => {
  const client = getConvexClient();
  const app = await client.query(api.miniApps.resolvePublicRoute, {
    routeMode: 'namespaced',
    slug,
  });
  if (app) {
    return app;
  }
  await client.mutation(api.miniApps.ensureDefaults, {});
  return client.query(api.miniApps.resolvePublicRoute, {
    routeMode: 'namespaced',
    slug,
  });
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await resolveNamespacedMiniApp(slug);

  if (!app) {
    return {
      robots: { follow: false, index: false },
      title: 'Mini app không tồn tại',
    };
  }

  const indexable = app.visibility === 'public' && !app.noindex;
  return {
    description: app.description,
    robots: { follow: indexable, index: indexable },
    title: app.name,
  };
}

export default async function StandaloneMiniAppPage({ params }: Props) {
  const { slug } = await params;
  const app = await resolveNamespacedMiniApp(slug);

  if (!app) {
    notFound();
  }

  if (app.visibility !== 'public') {
    return <PrivateMiniAppNotice name={app.name} />;
  }

  return (
    <>
      <MiniAppHost
        appConfig={app.config as Record<string, unknown>}
        appId={app._id}
        appName={app.name}
        appType={app.type}
        editable={app.type !== 'pokemon-champions'}
        standalone
      />
      <CustomToaster richColors />
    </>
  );
}

function PrivateMiniAppNotice({ name }: { name: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{name}</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Mini app này đang ở chế độ riêng tư. Vui lòng mở trong Admin hoặc đổi Visibility ở System Mini Apps.
        </p>
      </div>
    </main>
  );
}
