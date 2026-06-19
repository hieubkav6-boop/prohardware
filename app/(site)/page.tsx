import HomePageClient from './_components/HomePageClient';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export default async function HomePage(): Promise<React.ReactElement> {
  const client = getConvexClient();
  const initialComponents = await client.query(api.homeComponents.listActive);

  return <HomePageClient initialComponents={initialComponents} />;
}

