import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { generateMetadata as generateCatchAllMetadata } from '../../[...slugs]/page';

interface Props {
  params: Promise<{ categorySlug: string; recordSlug: string }>;
  children: ReactNode;
}

async function toCatchAllParams(params: Props['params']) {
  const { categorySlug, recordSlug } = await params;
  return { slugs: [categorySlug, recordSlug] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateCatchAllMetadata({
    params: Promise.resolve(await toCatchAllParams(params)),
  });
}

export default function UnifiedDetailLayout({ children }: Props) {
  return children;
}
