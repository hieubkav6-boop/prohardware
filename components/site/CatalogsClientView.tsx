'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Download, ChevronRight, FolderOpen } from 'lucide-react';
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
}

export function CatalogsClientView({ initialCatalogs }: CatalogsClientViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const { preloadFirstPages, preload } = useImagePreloader();

  // Tier 1: Preload trang đầu của tất cả catalogs khi load trang
  useEffect(() => {
    if (initialCatalogs && initialCatalogs.length > 0) {
      preloadFirstPages(initialCatalogs);
    }
  }, [initialCatalogs, preloadFirstPages]);

  // Group catalogs by category
  const categories = useMemo(() => {
    const grouped: Record<string, CatalogItem[]> = {};
    initialCatalogs.forEach((catalog) => {
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
  }, [initialCatalogs]);

  // Auto expand first category
  useEffect(() => {
    if (categories.length > 0 && expandedCats.length === 0) {
      setExpandedCats([categories[0].id]);
    }
  }, [categories]);

  // Flat list order to map activeIndex correctly
  const flatCatalogs = useMemo(() => {
    const list: CatalogItem[] = [];
    categories.forEach(cat => {
      list.push(...cat.items);
    });
    return list;
  }, [categories]);

  const activeCatalog = flatCatalogs[activeIndex] || initialCatalogs[0];

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
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy catalog nào</h3>
      </div>
    );
  }

  const activeImages = (activeCatalog.pageImageUrls || []).filter(
    (url): url is string => url !== null
  );

  return (
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
