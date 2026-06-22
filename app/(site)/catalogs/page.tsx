import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Metadata } from 'next';
import { CatalogsClientView } from '@/components/site/CatalogsClientView';

export const metadata: Metadata = {
  title: 'Catalog - Tài liệu sản phẩm',
  description: 'Khám phá các catalog và tài liệu sản phẩm mới nhất.',
};

export default async function CatalogsPage() {
  const rawCatalogs = await fetchQuery(api.catalogs.listAdminWithOffset, {
    limit: 100,
    offset: 0,
    status: 'Published',
  });

  const catalogs = (
    await Promise.all(
      (rawCatalogs || []).map((raw: any) => fetchQuery(api.catalogs.get, { id: raw._id }))
    )
  ).filter((c): c is NonNullable<typeof c> => c !== null);

  if (catalogs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[50vh] flex flex-col items-center justify-center">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chưa có catalog nào</h1>
        <p className="text-gray-500 text-center max-w-md">Hiện tại chúng tôi chưa có tài liệu catalog nào. Vui lòng quay lại sau.</p>
        <Link href="/" className="mt-6 px-6 py-2 bg-[#C21A1A] hover:bg-[#A81616] text-white rounded-md transition shadow-sm font-medium">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header trang */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-10 mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#C21A1A] mb-4 font-active">
            Catalog & Tài Liệu
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-4xl leading-relaxed mb-4">
            Chúng tôi Chuyên Phân Phối các dòng Thiết Bị Vệ Sinh uy tín như: van, vòi hồ, sen tắm, vòi sen, vòi lavabo... với thiết kế hiện đại, độ bền cao, đáp ứng mọi nhu cầu từ hộ gia đình đến công trình lớn.
          </p>
          <p className="text-base font-bold text-[#C21A1A]">
            Cam kết sản phẩm chính hãng, giá tốt, dịch vụ tận tâm.
          </p>
        </div>

        {/* Giao diện SPA Sách lật bên phải, danh sách bên trái */}
        <CatalogsClientView initialCatalogs={catalogs} />
      </div>
    </div>
  );
}

