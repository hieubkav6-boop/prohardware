import type { Metadata } from 'next';
import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex';
import { MiniAppsGalleryClient } from './MiniAppsGalleryClient';

export const revalidate = 0;

export const metadata: Metadata = {
  description: 'Khám phá các mini app đang được bật public trong website.',
  robots: { follow: true, index: true },
  title: 'Mini Apps | Công cụ trong website',
};

export default async function MiniAppsGalleryPage() {
  const client = getConvexClient();
  let apps = await client.query(api.miniApps.listPublicGallery);

  if (apps.length === 0) {
    await client.mutation(api.miniApps.ensureDefaults, {});
    apps = await client.query(api.miniApps.listPublicGallery);
  }

  return <MiniAppsGalleryClient initialApps={apps} />;
}
