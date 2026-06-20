import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Metadata } from 'next';
import { AdminImage as ImageClient } from '@/app/admin/components/AdminImage';

export const metadata: Metadata = {
  title: 'Catalog - Tài liệu sản phẩm',
  description: 'Khám phá các catalog và tài liệu sản phẩm mới nhất.',
};

export default async function CatalogsPage() {
  const catalogs = await fetchQuery(api.catalogs.listAdminWithOffset, {
    limit: 50,
    offset: 0,
    status: 'Published',
  });

  if (!catalogs || catalogs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[50vh] flex flex-col items-center justify-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chưa có catalog nào</h1>
        <p className="text-gray-500 text-center max-w-md">Hiện tại chúng tôi chưa có tài liệu catalog nào. Vui lòng quay lại sau.</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Catalog & Tài Liệu</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Khám phá bộ sưu tập các catalog, brochure và tài liệu sản phẩm chi tiết của chúng tôi dưới dạng sách lật trực tuyến tiện lợi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {catalogs.map((catalog: any) => (
          <Link href={`/catalogs/${catalog.slug}`} key={catalog._id} className="group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                {catalog.thumbnail ? (
                  <ImageClient 
                    src={catalog.thumbnail} 
                    alt={catalog.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <BookOpen className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {catalog.featured && (
                  <div className="absolute top-4 right-4 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Nổi bật
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                  {catalog.title}
                </h2>
                {catalog.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {catalog.description}
                  </p>
                )}
                <div className="mt-4 flex items-center text-sm font-medium text-brand-600">
                  <span className="group-hover:mr-2 transition-all">Xem chi tiết</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
