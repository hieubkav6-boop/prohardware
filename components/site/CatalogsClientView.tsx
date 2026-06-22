'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CatalogFlipbook } from './CatalogFlipbook';
import { useImagePreloader } from './useImagePreloader';

interface CatalogItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  pdfUrl?: string | null;
  pageImageUrls?: (string | null)[];
  totalPages?: number;
  thumbnail?: string;
}

interface CatalogsClientViewProps {
  initialCatalogs: CatalogItem[];
  initialTitle: string;
  initialSubtitle: string;
}

export function CatalogsClientView({ 
  initialCatalogs, 
  initialTitle, 
  initialSubtitle 
}: CatalogsClientViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const { preloadFirstPages, preload } = useImagePreloader();

  // Đăng ký WebSocket với Convex để đồng bộ realtime khi thay đổi dữ liệu/cấu hình
  const liveCatalogs = useQuery(api.catalogs.listPublishedWithUrls);
  const liveTitleSetting = useQuery(api.admin.modules.getModuleSetting, { 
    moduleKey: 'catalogs', 
    settingKey: 'catalogsTitle' 
  });
  const liveSubtitleSetting = useQuery(api.admin.modules.getModuleSetting, { 
    moduleKey: 'catalogs', 
    settingKey: 'catalogsSubtitle' 
  });

  // Sử dụng dữ liệu live nếu có, fallback về dữ liệu SSR (initial) đã render từ Server Component
  const rawCatalogs = liveCatalogs !== undefined ? liveCatalogs : initialCatalogs;
  const pageTitle = liveTitleSetting?.value !== undefined ? (liveTitleSetting.value as string) : initialTitle;
  const pageSubtitle = liveSubtitleSetting?.value !== undefined ? (liveSubtitleSetting.value as string) : initialSubtitle;

  // Lọc bỏ catalog "Catalog 2024" theo yêu cầu người dùng
  const catalogs = useMemo(() => {
    return (rawCatalogs || []).filter(c => c.title !== 'Catalog 2024');
  }, [rawCatalogs]);

  // Lấy danh sách các danh mục độc nhất
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    catalogs.forEach(c => {
      list.add(c.category?.trim() || 'Tài liệu chung');
    });
    return Array.from(list);
  }, [catalogs]);

  // Tự động chọn danh mục đầu tiên khi mới load
  useEffect(() => {
    if (categoriesList.length > 0 && !selectedCategoryName) {
      setSelectedCategoryName(categoriesList[0]);
    }
  }, [categoriesList, selectedCategoryName]);

  // Lọc catalogs theo danh mục đang chọn
  const filteredCatalogs = useMemo(() => {
    if (!selectedCategoryName) return catalogs;
    return catalogs.filter(c => (c.category?.trim() || 'Tài liệu chung') === selectedCategoryName);
  }, [catalogs, selectedCategoryName]);

  // Tier 1: Preload trang đầu của tất cả catalogs khi load trang
  useEffect(() => {
    if (catalogs && catalogs.length > 0) {
      preloadFirstPages(catalogs);
    }
  }, [catalogs, preloadFirstPages]);

  const activeCatalog = filteredCatalogs[activeIndex] || filteredCatalogs[0] || catalogs[0];

  // Đảm bảo activeIndex luôn hợp lệ khi filteredCatalogs thay đổi
  useEffect(() => {
    if (filteredCatalogs.length > 0) {
      const exists = filteredCatalogs.some((c, idx) => idx === activeIndex);
      if (!exists) {
        setActiveIndex(0);
      }
    }
  }, [filteredCatalogs, activeIndex]);

  // Tier 2: Prefetch pages 2-4 on hover/active
  const handleCatalogHover = (catalog: CatalogItem) => {
    if (catalog && catalog.pageImageUrls && catalog.pageImageUrls.length > 1) {
      const nextPages = catalog.pageImageUrls.slice(1, 4).filter((url): url is string => !!url);
      if (nextPages.length > 0) {
        void preload(nextPages, { priority: 'high' });
      }
    }
  };

  // Kích hoạt prefetch cho tài liệu đang active
  useEffect(() => {
    if (activeCatalog) {
      handleCatalogHover(activeCatalog);
    }
  }, [activeCatalog]);

  const handleSelectCatalogById = (id: string) => {
    const idx = filteredCatalogs.findIndex(c => c._id === id);
    if (idx !== -1) {
      setActiveIndex(idx);
    }
  };

  if (!activeCatalog) {
    return (
      <div className="max-w-8xl mx-auto px-4 py-8 space-y-8">
        {/* Banner Tiêu đề & Giới thiệu Trang */}
        <div className="bg-slate-50/60 dark:bg-gray-900/60 backdrop-blur border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#C21A1A] tracking-tight">
            {pageTitle}
          </h1>
          <div 
            className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-5xl mt-3 font-normal prose prose-slate dark:prose-invert prose-p:my-1 prose-headings:my-2"
            dangerouslySetInnerHTML={{ __html: pageSubtitle }}
          />
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy catalog nào</h3>
        </div>
      </div>
    );
  }

  const activeImages = (activeCatalog.pageImageUrls || []).filter(
    (url): url is string => url !== null
  );

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner Tiêu đề & Giới thiệu Trang */}
      <div className="bg-slate-50/60 dark:bg-gray-900/60 backdrop-blur border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Họa tiết trang trí nền */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C21A1A]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#C21A1A] tracking-tight">
            {pageTitle}
          </h1>
          <div 
            className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-5xl mt-3 font-normal prose prose-slate dark:prose-invert prose-p:my-1 prose-headings:my-2"
            dangerouslySetInnerHTML={{ __html: pageSubtitle }}
          />
        </div>
      </div>

      {/* Dropdown Selectors thay thế Sidebar Accordion */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
          {/* Danh mục Selector */}
          <div className="space-y-1.5 flex-1 max-w-sm">
            <label htmlFor="category-select" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Danh mục tài liệu
            </label>
            <div className="relative font-semibold text-slate-700">
              <select
                id="category-select"
                value={selectedCategoryName}
                onChange={(e) => {
                  setSelectedCategoryName(e.target.value);
                  setActiveIndex(0); // reset index về catalog đầu tiên của danh mục mới
                }}
                className="w-full flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C21A1A] dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer transition-all hover:border-[#C21A1A]/40"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>
                    📁  {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tài liệu Selector */}
          <div className="space-y-1.5 flex-1 max-w-sm">
            <label htmlFor="catalog-select" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
              Chọn tài liệu sách lật
            </label>
            <div className="relative font-semibold text-slate-700">
              <select
                id="catalog-select"
                value={activeCatalog?._id}
                onChange={(e) => handleSelectCatalogById(e.target.value)}
                className="w-full flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C21A1A] dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer transition-all hover:border-[#C21A1A]/40"
              >
                {filteredCatalogs.map(catalog => (
                  <option key={catalog._id} value={catalog._id}>
                    📖  {catalog.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Thông tin tài liệu đang đọc */}
        <div className="hidden lg:block text-right">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
            Đang hiển thị tài liệu
          </span>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 justify-end">
            <BookOpen className="w-4 h-4 text-[#C21A1A]" />
            {activeCatalog?.title}
          </h2>
        </div>
      </div>

      {/* Sách Lật Full Width max-w-8xl */}
      <div className="w-full">
        <CatalogFlipbook images={activeImages} title={activeCatalog.title} />
      </div>
    </div>
  );
}
