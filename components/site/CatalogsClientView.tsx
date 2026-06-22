'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, ChevronRight, FolderOpen } from 'lucide-react';
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
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
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

  // Tier 1: Preload trang đầu của tất cả catalogs khi load trang
  useEffect(() => {
    if (catalogs && catalogs.length > 0) {
      preloadFirstPages(catalogs);
    }
  }, [catalogs, preloadFirstPages]);

  // Group catalogs by category
  const categories = useMemo(() => {
    const grouped: Record<string, CatalogItem[]> = {};
    catalogs.forEach((catalog) => {
      const catName = catalog.category?.trim() || 'Tài liệu chung';
      if (!grouped[catName]) {
        grouped[catName] = [];
      }
      grouped[catName].push(catalog);
    });

    return Object.keys(grouped).map((name, index) => ({
      id: `cat-${index}`,
      name,
      items: grouped[name],
    }));
  }, [catalogs]);

  // Auto expand first category
  useEffect(() => {
    if (categories.length > 0 && expandedCats.length === 0) {
      setExpandedCats([categories[0].id]);
    }
  }, [categories, expandedCats.length]);

  // Flat list order to map activeIndex correctly
  const flatCatalogs = useMemo(() => {
    const list: CatalogItem[] = [];
    categories.forEach(cat => {
      list.push(...cat.items);
    });
    return list;
  }, [categories]);

  const activeCatalog = flatCatalogs[activeIndex] || catalogs[0];

  const toggleCat = (id: string) => {
    setExpandedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Tier 2: Prefetch pages 2-4 on hover
  const handleCatalogHover = (catalog: CatalogItem) => {
    if (catalog.pageImageUrls && catalog.pageImageUrls.length > 1) {
      const nextPages = catalog.pageImageUrls.slice(1, 4).filter((url): url is string => !!url);
      if (nextPages.length > 0) {
        void preload(nextPages, { priority: 'high' });
      }
    }
  };

  // Find index of catalog in flat list
  const handleSelectCatalog = (catalog: CatalogItem) => {
    const idx = flatCatalogs.findIndex(c => c._id === catalog._id);
    if (idx !== -1) {
      setActiveIndex(idx);
    }
  };

  if (!activeCatalog) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar bên trái: Danh mục Accordion */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <div className="mb-4 px-2">
              <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Thư Viện Tài Liệu
              </h2>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {categories.map((category) => {
                const isExpanded = expandedCats.includes(category.id);
                return (
                  <div 
                    key={category.id} 
                    className="rounded-xl border border-transparent bg-slate-50/50 dark:bg-gray-800/20 overflow-hidden transition-all hover:border-slate-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm"
                  >
                    <button
                      onClick={() => toggleCat(category.id)}
                      className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${isExpanded ? 'bg-red-50 dark:bg-red-950/20 text-[#C21A1A]' : 'bg-slate-200 dark:bg-gray-800 text-slate-500'}`}>
                          <FolderOpen className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[130px]">{category.name}</span>
                        <span className="text-xs font-normal text-slate-400">({category.items.length})</span>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                      />
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                        {category.items.map((catalog) => {
                          const isCurrentActive = catalog._id === activeCatalog._id;
                          return (
                            <button
                              key={catalog._id}
                              onClick={() => handleSelectCatalog(catalog)}
                              onMouseEnter={() => handleCatalogHover(catalog)}
                              onFocus={() => handleCatalogHover(catalog)}
                              className={`flex w-full items-start px-4 py-2.5 text-left text-sm transition-all border-l-2 ${
                                isCurrentActive
                                  ? 'bg-red-50/40 dark:bg-red-950/10 border-[#C21A1A] text-[#C21A1A] font-semibold'
                                  : 'border-transparent text-slate-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-[#C21A1A] dark:hover:text-white'
                              }`}
                            >
                              <span className="font-medium line-clamp-1 w-full">{catalog.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Flipbook Viewer bên phải */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="w-full">
            <CatalogFlipbook images={activeImages} title={activeCatalog.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
