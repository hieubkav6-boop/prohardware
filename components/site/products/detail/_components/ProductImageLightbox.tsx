'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PublicImage as Image } from '@/components/shared/PublicImage';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProductImageWithOverlayAuto } from '@/components/shared/ProductImageWithOverlay';
import useEmblaCarousel from 'embla-carousel-react';

type ProductImageLightboxProps = {
  images: string[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (nextIndex: number) => void;
  useNativeImage?: boolean;
  overlayUrl?: string | null;
  fallbackSrc?: string | null;
};

type LightboxSlideProps = {
  src: string;
  fallbackSrc: string | null;
  useNativeImage: boolean;
  idx: number;
};

function LightboxSlide({ src, fallbackSrc, useNativeImage, idx }: LightboxSlideProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setImgSrc(null);
    }
  };

  return (
    <div className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-4">
      <ProductImageWithOverlayAuto className="aspect-square w-full max-w-[80vh] max-h-[80vh] flex items-center justify-center">
        {useNativeImage ? (
          imgSrc ? (
            <img
              src={imgSrc}
              alt={`Ảnh sản phẩm ${idx + 1}`}
              className="w-full h-full object-contain rounded-lg"
              onError={handleError}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/60">Không có ảnh sản phẩm</div>
          )
        ) : imgSrc ? (
          <Image
            src={imgSrc}
            alt={`Ảnh sản phẩm ${idx + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 80vh"
            className="object-contain rounded-lg"
            mode="primary"
            onError={handleError}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/60">Không có ảnh sản phẩm</div>
        )}
      </ProductImageWithOverlayAuto>
    </div>
  );
}

export function ProductImageLightbox({
  images,
  currentIndex,
  open,
  onClose,
  onIndexChange,
  useNativeImage = false,
  overlayUrl: _overlayUrl,
  fallbackSrc,
}: ProductImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const hasImages = images.length > 0;
  const safeIndex = Math.min(Math.max(currentIndex, 0), Math.max(images.length - 1, 0));
  const hasMultiple = images.length > 1;
  const normalizedFallback = typeof fallbackSrc === 'string' && fallbackSrc.trim() ? fallbackSrc.trim() : null;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: safeIndex,
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Đồng bộ từ bên ngoài (prop safeIndex) vào Embla Carousel khi lightbox được mở
  useEffect(() => {
    if (emblaApi && open) {
      const selectedIndex = emblaApi.selectedScrollSnap();
      if (selectedIndex !== safeIndex) {
        emblaApi.scrollTo(safeIndex, true);
      }
    }
  }, [emblaApi, safeIndex, open]);

  // Lắng nghe sự kiện select của Embla Carousel để đồng bộ ra bên ngoài
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const selectedIndex = emblaApi.selectedScrollSnap();
    if (selectedIndex !== safeIndex) {
      onIndexChange(selectedIndex);
    }
  }, [emblaApi, safeIndex, onIndexChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Re-init Embla khi mở hoặc thay đổi số lượng ảnh
  useEffect(() => {
    if (emblaApi && open) {
      emblaApi.reInit();
    }
  }, [emblaApi, open, images.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (!hasMultiple) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        emblaApi?.scrollPrev();
      }
      if (event.key === 'ArrowRight') {
        emblaApi?.scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMultiple, onClose, open, emblaApi]);

  if (!open || !hasImages || !mounted) {
    return null;
  }

  const handlePrev = (event: React.MouseEvent) => {
    event.stopPropagation();
    emblaApi?.scrollPrev();
  };

  const handleNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    emblaApi?.scrollNext();
  };

  const lightboxContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/95" />
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 p-2 rounded-full border border-white/20 text-white/90 transition-colors z-[10020]"
        aria-label="Đóng"
      >
        <X size={24} />
      </button>
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 text-white/90 flex items-center justify-center transition-colors z-[10020]"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 text-white/90 flex items-center justify-center transition-colors z-[10020]"
            aria-label="Ảnh sau"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm z-[10020] px-3 py-1 rounded-full border border-white/15 bg-white/10 text-white/90">
          {safeIndex + 1} / {images.length}
        </div>
      )}
      <div className="relative z-[10000] w-full max-w-5xl h-[80vh] flex items-center justify-center" onClick={event => event.stopPropagation()}>
        <div className="overflow-hidden w-full h-full flex items-center justify-center" ref={emblaRef}>
          <div className="flex h-full w-full items-center">
            {images.map((src, idx) => (
              <LightboxSlide
                key={idx}
                src={src}
                fallbackSrc={normalizedFallback}
                useNativeImage={useNativeImage}
                idx={idx}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
