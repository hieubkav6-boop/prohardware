'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Loader2, 
  RectangleVertical, 
  RectangleHorizontal,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/app/admin/components/ui';
import { useImagePreloader } from './useImagePreloader';
import { usePageFlipSound } from './usePageFlipSound';

interface CatalogFlipbookProps {
  images: string[];
  title: string;
}

// Page Sheet Component to render standard flip page wrapper
const PageSheet = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div 
      ref={ref} 
      className="bg-white overflow-hidden relative border-r border-slate-200"
      style={{ backgroundColor: 'white' }} 
    >
      {props.children}
      {/* Page Number */}
      <div className="absolute bottom-2 right-4 text-[10px] text-slate-400 font-medium select-none z-10">
        - {props.number} -
      </div>
      {/* Gradient spine effect */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100/50 to-transparent pointer-events-none" />
    </div>
  );
});
PageSheet.displayName = 'PageSheet';

// Skeleton Loading Page
const PageSkeleton: React.FC<{ pageNumber: number }> = ({ pageNumber }) => (
  <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-3 animate-pulse">
    <div className="w-3/4 space-y-3">
      <div className="h-3 bg-slate-200 rounded-full w-full"></div>
      <div className="h-3 bg-slate-200 rounded-full w-5/6"></div>
      <div className="h-3 bg-slate-200 rounded-full w-4/6"></div>
      <div className="h-3 bg-slate-100 rounded-full w-full mt-6"></div>
      <div className="h-3 bg-slate-100 rounded-full w-full"></div>
      <div className="h-3 bg-slate-100 rounded-full w-3/4"></div>
    </div>
    <div className="flex items-center gap-2 mt-4">
      <Loader2 className="h-4 w-4 animate-spin text-[#C21A1A]" />
      <span className="text-xs text-slate-400">Đang tải trang {pageNumber}...</span>
    </div>
  </div>
);

// Image Wrapper with fade-in and skeleton
const ImageWithSkeleton: React.FC<{
  src: string;
  alt: string;
  pageNumber: number;
  priority?: boolean;
}> = ({ src, alt, pageNumber, priority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="w-full h-full relative bg-white p-2 md:p-4">
      {!loaded && !error && (
        <div className="absolute inset-0 z-10">
          <PageSkeleton pageNumber={pageNumber} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain pointer-events-none select-none transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <div className="text-slate-400 text-sm">Không thể tải trang {pageNumber}</div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_RATIO = 1.414; // A4 Ratio

export function CatalogFlipbook({ images, title }: CatalogFlipbookProps) {
  const [isReady, setIsReady] = useState(false);
  const [page, setPage] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'double'>('double');
  const [pdfRatio, setPdfRatio] = useState<number>(DEFAULT_RATIO);
  const [baseDim, setBaseDim] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);
  const { preloadForViewer } = useImagePreloader();
  const { playFlipSound } = usePageFlipSound({ volume: 0.25, enabled: true });

  // Reset when images change
  useEffect(() => {
    setIsReady(false);
    setPage(0);
    setScale(1.0);
    setPdfRatio(DEFAULT_RATIO);
    setBaseDim({ width: 0, height: 0 });
    
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, [images]);

  // Load first image to calculate ratio
  useEffect(() => {
    if (images && images.length > 0) {
      const firstUrl = images[0];
      if (firstUrl) {
        const img = new Image();
        img.onload = () => {
          const ratio = img.height / img.width;
          setPdfRatio(ratio);
        };
        img.src = firstUrl;
      }
      // Preload critical images initially
      const initPages = window.innerWidth >= 1024 ? 2 : 1;
      preloadForViewer(images, 1, initPages);
    }
  }, [images, preloadForViewer]);

  // Preload next pages when current page changes
  useEffect(() => {
    if (images && images.length > 0 && page > 0) {
      const initPages = viewMode === 'double' ? 2 : 1;
      preloadForViewer(images, page + 1, initPages);
    }
  }, [page, viewMode, images, preloadForViewer]);

  // Calculate layout dimensions based on container and ratio
  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      
      const isMobile = windowW < 1024;
      
      // Ở lần load đầu tự động set theo mobile, các lần sau theo state
      if (isMobile && viewMode === 'double') {
        setViewMode('single');
      }

      const currentMode = viewMode;
      const availableWidth = currentMode === 'single' 
        ? containerW - 48 
        : (containerW - 96) / 2;

      // Chiều cao an toàn tránh cuộn trang quá nhiều
      const maxAllowedH = isFullscreen 
        ? windowH - 150 
        : Math.min(680, Math.floor(windowH * 0.72));

      let targetWidth = availableWidth;
      let targetHeight = targetWidth * pdfRatio;

      if (targetHeight > maxAllowedH) {
        targetHeight = maxAllowedH;
        targetWidth = targetHeight / pdfRatio;
      }

      setBaseDim({
        width: Math.max(200, Math.floor(targetWidth)),
        height: Math.max(280, Math.floor(targetHeight))
      });
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [pdfRatio, images, isReady, viewMode, isFullscreen]);

  const onFlip = (e: any) => {
    setPage(e.data);
    playFlipSound();
  };

  // Lắng nghe phím mũi tên bàn phím để lật trang
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        flipBookRef.current?.pageFlip()?.flipNext();
      } else if (e.key === 'ArrowLeft') {
        flipBookRef.current?.pageFlip()?.flipPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      void document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const shouldRenderPage = useCallback((index: number) => {
    const currentIndex = page;
    const initialPages = viewMode === 'double' ? 2 : 1;
    if (index < initialPages) return true;
    return index <= currentIndex + 2; // Preload 2 pages ahead
  }, [page, viewMode]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <p className="text-gray-500">Catalog này chưa có trang nội dung.</p>
      </div>
    );
  }

  const FlipBook = HTMLFlipBook as any;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex flex-col items-center bg-gray-50 dark:bg-gray-950 overflow-hidden ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm'
      }`}
      style={isFullscreen ? undefined : { minHeight: '350px' }}
    >
      {/* Premium Toolbar */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 h-14 select-none">
        {/* Navigation Info */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-gray-300 font-mono">
            Trang {page + 1} / {images.length}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-gray-800 p-0.5 rounded-lg border border-slate-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900" 
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs w-12 text-center font-medium text-slate-600 dark:text-gray-400 hidden sm:inline-block">
            {Math.round(scale * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900" 
            onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900" 
            onClick={() => setScale(1.0)} 
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* View mode & Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex bg-slate-50 dark:bg-gray-800 rounded-lg p-0.5 border border-slate-200 dark:border-gray-700 mr-2">
            <button 
              onClick={() => setViewMode('single')}
              className={`p-1.5 rounded transition-all ${viewMode === 'single' ? 'bg-white dark:bg-gray-900 shadow-sm text-[#C21A1A]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Xem 1 Trang"
            >
              <RectangleVertical className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('double')}
              className={`p-1.5 rounded transition-all ${viewMode === 'double' ? 'bg-white dark:bg-gray-900 shadow-sm text-[#C21A1A]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Xem 2 Trang"
            >
              <RectangleHorizontal className="h-4 w-4" />
            </button>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Flipbook Render Area */}
      <div 
        className="w-full relative flex items-center justify-center bg-slate-100/80 dark:bg-gray-950 overflow-hidden py-4 px-6"
        style={{
          height: isFullscreen ? 'calc(100vh - 56px)' : `${baseDim.height + 40}px`
        }}
      >
        {!isReady && baseDim.width > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#C21A1A] mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang tải tài liệu...</p>
          </div>
        )}

        {isReady && baseDim.width > 0 && (
          <div 
            className="flex justify-center items-center transition-transform duration-200 ease-out shadow-2xl rounded"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            }}
          >
            <FlipBook
              key={`${viewMode}-${baseDim.width}-${baseDim.height}`}
              width={baseDim.width}
              height={baseDim.height}
              size="fixed"
              minWidth={200}
              maxWidth={1000}
              minHeight={280}
              maxHeight={1500}
              maxShadowOpacity={0.4}
              showCover={false}
              mobileScrollSupport={true}
              onFlip={onFlip}
              className={`flip-book ${viewMode === 'double' ? 'mx-auto' : ''}`}
              ref={flipBookRef}
              useMouseEvents={true}
              usePortrait={viewMode === 'single'}
              drawShadow={true}
              flippingTime={600}
              disableFlipByClick={false}
              onInit={() => {
                if (page > 0 && flipBookRef.current) {
                  // Đưa người dùng trở về đúng trang hiện tại sau khi re-mount
                  setTimeout(() => {
                    flipBookRef.current?.pageFlip()?.turnToPage(page);
                  }, 50);
                }
              }}
            >
              {images.map((src, idx) => (
                <PageSheet key={idx} number={idx + 1}>
                  {shouldRenderPage(idx) ? (
                    <ImageWithSkeleton
                      src={src}
                      alt={`${title} - Trang ${idx + 1}`}
                      pageNumber={idx + 1}
                      priority={idx < (viewMode === 'double' ? 2 : 1)}
                    />
                  ) : (
                    <PageSkeleton pageNumber={idx + 1} />
                  )}
                </PageSheet>
              ))}
            </FlipBook>
          </div>
        )}
      </div>
    </div>
  );
}
