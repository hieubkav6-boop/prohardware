import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CustomToaster } from '@/components/shared/CustomToaster';
import { api } from '@/convex/_generated/api';
import { MiniAppHost } from '@/features/mini-apps/MiniAppHost';
import { getConvexClient } from '@/lib/convex';

const resolvePokemonChampionsMiniApp = async () => {
  const client = getConvexClient();
  const app = await client.query(api.miniApps.resolvePublicRoute, {
    routeMode: 'root',
    slug: 'pokemon-champions',
  });
  if (app) {
    return app;
  }
  await client.mutation(api.miniApps.ensureDefaults, {});
  return client.query(api.miniApps.resolvePublicRoute, {
    routeMode: 'root',
    slug: 'pokemon-champions',
  });
};

export async function generateMetadata(): Promise<Metadata> {
  const app = await resolvePokemonChampionsMiniApp();

  if (!app) {
    return {
      robots: { follow: false, index: false },
      title: 'Pokemon Champions',
    };
  }

  const indexable = app.visibility === 'public' && !app.noindex;
  return {
    description: app.description,
    robots: { follow: indexable, index: indexable },
    title: app.name,
  };
}

export default async function PokemonChampionsPage() {
  const app = await resolvePokemonChampionsMiniApp();

  if (!app) {
    notFound();
  }

  if (app.visibility !== 'public') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{app.name}</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            This mini app is private. Please open it in Admin or change visibility in System Mini Apps.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <MiniAppHost
        appConfig={app.config as Record<string, unknown>}
        appId={app._id}
        appName={app.name}
        appType={app.type}
        standalone={false}
      />
      <CustomToaster richColors />
    </>
  );
}
