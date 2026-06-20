'use client';

import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Loader2, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/admin/components/ui';

interface CatalogFlipbookProps {
  images: string[];
  title: string;
}

export function CatalogFlipbook({ images, title }: CatalogFlipbookProps) {
  const [isReady, setIsReady] = useState(false);
  const [page, setPage] = useState(0);
  const [_totalPage, _setTotalPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    // Some small delay to ensure container size is measured correctly
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const onPage = (e: any) => {
    setPage(e.data);
  };

  const nextButtonClick = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const prevButtonClick = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
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

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <p className="text-gray-500">Catalog này chưa có trang nội dung.</p>
      </div>
    );
  }

  // NextJS React 18+ strict mode requires the component to be rendered as an Element if not standard
  // HTMLFlipBook is not typed perfectly for React 18
  const FlipBook = HTMLFlipBook as any;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-hidden ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[600px] md:h-[800px] rounded-xl'
      }`}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm shadow-sm text-gray-700 hover:bg-white"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
      </div>

      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
          <p className="text-sm font-medium text-gray-600">Đang tải Catalog...</p>
        </div>
      )}

      <div className={`w-full h-full flex items-center justify-center py-12 transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        <FlipBook
          width={500}
          height={707}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1533}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onPage}
          className="flip-book shadow-2xl"
          ref={flipBookRef}
          useMouseEvents={true}
        >
          {images.map((src, idx) => (
            <div key={idx} className="page bg-white shadow-inner flex items-center justify-center relative overflow-hidden">
              <div className="w-full h-full p-2 md:p-4">
                <img 
                  src={src} 
                  alt={`${title} - Trang ${idx + 1}`} 
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>
              <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400 font-medium z-10">
                - {idx + 1} -
              </div>
            </div>
          ))}
        </FlipBook>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={prevButtonClick}
          disabled={page === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
          {page + 1} / {images.length}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={nextButtonClick}
          disabled={page >= images.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
