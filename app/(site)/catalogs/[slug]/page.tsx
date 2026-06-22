import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import { CatalogFlipbook } from '@/components/site/CatalogFlipbook';
import Link from 'next/link';
import { ChevronLeft, Download } from 'lucide-react';
import { Button } from '@/app/admin/components/ui';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const catalog = await fetchQuery(api.catalogs.getBySlug, { slug: params.slug });

  if (!catalog) {
    return { title: 'Không tìm thấy catalog' };
  }

  const seoTitle = `${catalog.title} | Catalog`;
  const seoDescription = catalog.description || `Xem chi tiết catalog ${catalog.title} - Sách lật trực tuyến và bản PDF chất lượng cao tại AAA Pro Hardware.`;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: catalog.thumbnail ? [{ url: catalog.thumbnail }] : [],
    },
  };
}

export default async function CatalogDetailPage({ params }: Props) {
  const catalog = await fetchQuery(api.catalogs.getBySlug, { slug: params.slug });

  if (!catalog || catalog.status !== 'Published') {
    notFound();
  }

  // Lọc ra các URL hợp lệ
  const images = (catalog.pageImageUrls || []).filter(url => url !== null) as string[];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link 
            href="/catalogs" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trở lại danh sách
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex-1 min-w-[200px]">
            {catalog.title}
          </h1>

          {catalog.pdfUrl && (
            <a href={catalog.pdfUrl} target="_blank" rel="noopener noreferrer" download>
              <Button variant="outline" className="bg-white hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Tải bản PDF
              </Button>
            </a>
          )}
        </div>

        {catalog.description && (
          <div className="mb-8 max-w-3xl">
            <p className="text-gray-600 dark:text-gray-400">{catalog.description}</p>
          </div>
        )}

        <div className="w-full">
          <CatalogFlipbook images={images} title={catalog.title} />
        </div>
      </div>
    </div>
  );
}
