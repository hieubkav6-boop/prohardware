'use client';

import React, { useState } from 'react';
import { BookOpen, Download, ChevronRight } from 'lucide-react';
import { CatalogFlipbook } from './CatalogFlipbook';

interface CatalogItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  pdfUrl?: string | null;
  pageImageUrls?: (string | null)[];
  totalPages?: number;
  thumbnail?: string;
}

interface CatalogsClientViewProps {
  initialCatalogs: CatalogItem[];
}

export function CatalogsClientView({ initialCatalogs }: CatalogsClientViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCatalog = initialCatalogs[activeIndex];

  if (!activeCatalog) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy catalog nào</h3>
      </div>
    );
  }

  // Lọc các URL hình ảnh hợp lệ
  const activeImages = (activeCatalog.pageImageUrls || []).filter(
    (url): url is string => url !== null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar bên trái: Danh sách các Catalog */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">
            Danh Sách Catalog
          </h2>
          
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {initialCatalogs.map((catalog, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={catalog._id}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 border ${
                    isActive
                      ? 'bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/50 text-[#C21A1A] font-semibold shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-[#C21A1A]' : 'text-gray-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm line-clamp-2 leading-snug">
                      {catalog.title}
                    </div>
                    {catalog.totalPages && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                        {catalog.totalPages} trang
                      </span>
                    )}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 mt-1 flex-shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-[#C21A1A]' : 'text-gray-300'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Flipbook Viewer bên phải */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {activeCatalog.title}
            </h2>
            {activeCatalog.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed max-w-3xl">
                {activeCatalog.description}
              </p>
            )}
          </div>

          {activeCatalog.pdfUrl && (
            <a 
              href={activeCatalog.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              download
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C21A1A] hover:bg-[#A81616] text-white rounded-lg text-sm font-medium transition shadow-sm self-stretch md:self-auto"
            >
              <Download className="w-4 h-4" />
              Tải bản PDF gốc
            </a>
          )}
        </div>

        <div className="w-full">
          <CatalogFlipbook images={activeImages} title={activeCatalog.title} />
        </div>
      </div>
    </div>
  );
}
