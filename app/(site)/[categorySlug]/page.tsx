import type { Metadata } from 'next';
import UnifiedCatchAllPage, { generateMetadata as generateCatchAllMetadata } from '../[...slugs]/page';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

async function toCatchAllParams(params: Props['params']) {
  const { categorySlug } = await params;
  return { slugs: [categorySlug] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateCatchAllMetadata({
    params: Promise.resolve(await toCatchAllParams(params)),
  });
}

export default async function UnifiedCategoryPage({ params }: Props) {
  return UnifiedCatchAllPage({
    params: Promise.resolve(await toCatchAllParams(params)),
  });
}
