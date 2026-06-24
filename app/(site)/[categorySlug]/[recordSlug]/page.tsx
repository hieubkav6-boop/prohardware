import UnifiedCatchAllPage from '../../[...slugs]/page';

interface Props {
  params: Promise<{ categorySlug: string; recordSlug: string }>;
}

async function toCatchAllParams(params: Props['params']) {
  const { categorySlug, recordSlug } = await params;
  return { slugs: [categorySlug, recordSlug] };
}

export default async function UnifiedDetailPage({ params }: Props) {
  return UnifiedCatchAllPage({
    params: Promise.resolve(await toCatchAllParams(params)),
  });
}
