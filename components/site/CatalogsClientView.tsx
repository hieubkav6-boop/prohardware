'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CatalogFlipbook } from './CatalogFlipbook';
import { useImagePreloader } from './useImagePreloader';
import { useBrandColors } from './hooks';

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
  const { primary: brandPrimary } = useBrandColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [viewType, setViewType] = useState<'all' | 'single'>('all');
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

  // Xác định xem có tài liệu nào thực sự có gán danh mục hay không
  const hasCategories = useMemo(() => {
    return catalogs.some(c => c.category && c.category.trim() !== '');
  }, [catalogs]);

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
    if (!hasCategories) return catalogs;
    if (!selectedCategoryName) return catalogs;
    return catalogs.filter(c => (c.category?.trim() || 'Tài liệu chung') === selectedCategoryName);
  }, [catalogs, selectedCategoryName, hasCategories]);

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
      <div 
        className="max-w-8xl mx-auto px-4 py-8 space-y-8"
        style={{
          '--brand-color': brandPrimary,
          '--brand-color-hover': `color-mix(in srgb, ${brandPrimary} 40%, transparent)`,
          '--brand-color-bg': `color-mix(in srgb, ${brandPrimary} 5%, transparent)`,
        } as React.CSSProperties}
      >
        {/* Banner Tiêu đề & Giới thiệu Trang */}
        <div className="bg-slate-50/60 dark:bg-gray-900/60 backdrop-blur border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--brand-color)] tracking-tight">
            {pageTitle}
          </h1>
          <div 
            className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-5xl mt-3 font-normal prose prose-slate dark:prose-invert prose-p:my-1 prose-headings:my-2"
            dangerouslySetInnerHTML={{ __html: pageSubtitle }}
          />
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy catalog nào</h3>
        </div>
      </div>
    );
  }

  const activeImages = (activeCatalog.pageImageUrls || []).filter(
    (url): url is string => url !== null
  );

  return (
    <div 
      className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      style={{
        '--brand-color': brandPrimary,
        '--brand-color-hover': `color-mix(in srgb, ${brandPrimary} 40%, transparent)`,
        '--brand-color-bg': `color-mix(in srgb, ${brandPrimary} 5%, transparent)`,
      } as React.CSSProperties}
    >
      {/* Banner Tiêu đề & Giới thiệu Trang */}
      <div className="bg-slate-50/60 dark:bg-gray-900/60 backdrop-blur border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Họa tiết trang trí nền */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-color-bg)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--brand-color-bg)] rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--brand-color)] tracking-tight">
            {pageTitle}
          </h1>
          <div 
            className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-5xl mt-3 font-normal prose prose-slate dark:prose-invert prose-p:my-1 prose-headings:my-2"
            dangerouslySetInnerHTML={{ __html: pageSubtitle }}
          />
        </div>
      </div>

      {/* Dropdown Selectors tối giản */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-2 sm:p-3 shadow-sm flex flex-wrap items-center gap-3 text-xs animate-fade-in">
        {/* Danh mục Selector */}
        {hasCategories && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Danh mục:
            </span>
            <select
              id="category-select"
              value={selectedCategoryName}
              onChange={(e) => {
                setSelectedCategoryName(e.target.value);
                setActiveIndex(0);
              }}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--brand-color)] dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer transition-all hover:border-[var(--brand-color-hover)]"
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Chế độ xem Selector */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
            Chế độ xem:
          </span>
          <select
            id="view-type-select"
            value={viewType}
            onChange={(e) => setViewType(e.target.value as 'all' | 'single')}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--brand-color)] dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer transition-all hover:border-[var(--brand-color-hover)]"
          >
            <option value="all">Xem tất cả</option>
            <option value="single">Chọn tài liệu</option>
          </select>
        </div>

        {/* Tài liệu Selector (chỉ hiện khi viewType === 'single') */}
        {viewType === 'single' && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Tài liệu:
            </span>
            <select
              id="catalog-select"
              value={activeCatalog?._id}
              onChange={(e) => handleSelectCatalogById(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--brand-color)] dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer transition-all hover:border-[var(--brand-color-hover)]"
            >
              {filteredCatalogs.map(catalog => (
                <option key={catalog._id} value={catalog._id}>
                  {catalog.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sách Lật Full Width max-w-8xl */}
      {viewType === 'all' ? (
        <div className="space-y-12">
          {filteredCatalogs.map((catalog) => {
            const images = (catalog.pageImageUrls || []).filter(
              (url): url is string => url !== null
            );
            return (
              <div key={catalog._id} className="space-y-3">
                <div className="border-l-4 border-[var(--brand-color)] pl-3 py-0.5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {catalog.title}
                  </h2>
                  {catalog.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {catalog.description}
                    </p>
                  )}
                </div>
                <CatalogFlipbook images={images} title={catalog.title} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full">
          <CatalogFlipbook images={activeImages} title={activeCatalog.title} />
        </div>
      )}
    </div>
  );
}
