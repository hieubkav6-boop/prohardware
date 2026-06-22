import { api } from '@/convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import Link from 'next/link';
import { BookOpen, Download, ExternalLink, FileText } from 'lucide-react';
import { Metadata } from 'next';

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
        <Link href="/" className="mt-6 px-6 py-2 bg-[#C21A1A] hover:bg-[#A81616] text-white rounded-md transition shadow-sm font-medium">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] dark:bg-gray-950 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header trang */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-10 mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#C21A1A] mb-4 font-active">
            Catalog & Tài Liệu
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed mb-4">
            Chúng tôi Chuyên Phân Phối các dòng Thiết Bị Vệ Sinh uy tín như: van, vòi hồ, sen tắm, vòi sen, vòi lavabo... với thiết kế hiện đại, độ bền cao, đáp ứng mọi nhu cầu từ hộ gia đình đến công trình lớn.
          </p>
          <p className="text-base font-bold text-[#C21A1A]">
            Cam kết sản phẩm chính hãng, giá tốt, dịch vụ tận tâm.
          </p>
        </div>

        {/* Danh sách Catalog dọc */}
        <div className="space-y-10">
          {catalogs.map((catalog: any) => {
            // Lọc ra các URL hình ảnh hợp lệ nếu cần thiết
            const hasImages = catalog.pageImageUrls && catalog.pageImageUrls.some((url: string | null) => url !== null);
            
            return (
              <div 
                key={catalog._id} 
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 space-y-6 transition-all hover:shadow-md"
              >
                {/* Header của từng Catalog */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 font-active">
                      <BookOpen className="w-5 h-5 text-[#C21A1A] flex-shrink-0" />
                      {catalog.title}
                    </h2>
                    {catalog.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {catalog.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 self-stretch sm:self-auto justify-end">
                    {catalog.pdfUrl && (
                      <a 
                        href={catalog.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        Tải bản PDF
                      </a>
                    )}
                    {(!catalog.embedUrl && hasImages) && (
                      <Link 
                        href={`/catalogs/${catalog.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[#C21A1A] text-[#C21A1A] rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Xem dạng lật trang
                      </Link>
                    )}
                  </div>
                </div>

                {/* Phần nhúng Flipbook hoặc Fallback */}
                {catalog.embedUrl ? (
                  <div className="w-full h-[450px] sm:h-[550px] md:h-[650px] lg:h-[700px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner bg-[#f0f0f0]">
                    <iframe
                      src={catalog.embedUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : (
                  // Fallback khi không có link nhúng (cho các catalog cũ chỉ upload PDF/ảnh)
                  <div className="flex flex-col md:flex-row gap-6 items-center bg-gray-50 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="w-36 h-48 relative rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                      {catalog.thumbnail ? (
                        <img 
                          src={catalog.thumbnail} 
                          alt={catalog.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4 text-center md:text-left flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Catalog phiên bản cũ</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
                        Catalog này được xuất bản theo phương thức cũ. Bạn có thể xem trực tuyến bằng trình duyệt sách lật 3D hoặc tải về bản PDF gốc chất lượng cao.
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                        {hasImages && (
                          <Link 
                            href={`/catalogs/${catalog.slug}`}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-[#C21A1A] hover:bg-[#A81616] text-white rounded-lg text-sm font-medium transition shadow-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Xem sách lật 3D
                          </Link>
                        )}
                        {catalog.pdfUrl && (
                          <a 
                            href={catalog.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            download
                            className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                          >
                            <Download className="w-4 h-4" />
                            Tải PDF gốc
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
