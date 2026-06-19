import { AdminMiniAppHost } from '@/features/mini-apps/AdminMiniAppHost';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminMiniAppRoutePage({ params }: Props) {
  const { slug } = await params;
  return <AdminMiniAppHost appKey={slug} />;
}
