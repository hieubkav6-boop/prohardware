'use client';

import React from 'react';
import Link from 'next/link';
import { PublicImage as Image } from '@/components/shared/PublicImage';

type StorefrontCardProps = {
  layout: 'grid' | 'list';
  href: string;
  image?: string;
  imageAlt?: string;
  fallbackIcon?: React.ReactNode;
  categoryName?: string;

  // Tiêu đề card
  title: string;

  // Mô tả ngắn
  description?: string;

  // Phần thông tin bổ sung ở cột trái (metadata dạng inline hoặc list)
  leftMetadata?: React.ReactNode;

  // Phần thông số phụ ở cột phải (giá tiền, dung lượng, thời lượng, v.v.)
  rightDetails?: React.ReactNode;

  // Nhãn nút kêu gọi hành động (CTA)
  ctaLabel?: string;

  // Cấu hình style
  brandColor?: string;
  radiusClass?: string;
  isDark?: boolean;
  imageAspectRatioClass?: string;
  darkModePremiumBorder?: boolean;
  showDetailButton?: boolean;
  detailButtonText?: string;
}

function getButtonStyles(brandColor: string, isDark: boolean) {
  let hex = brandColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  let r = 59, g = 130, b = 246; // default blue fallback
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Chuyển đổi sang HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }

  const hue = Math.round(h * 360);
  const sat = Math.round(s * 100);
  const light = Math.round(l * 100);

  // Tạo hiệu ứng Hue Shift sang trái (màu ấm hơn/giảm 15 độ) và sang phải (màu mát hơn/tăng 15 độ)
  const hLeft = (hue - 15 + 360) % 360;
  const hRight = (hue + 15) % 360;

  // Giữ độ bão hòa cao và rực rỡ để gradient nổi bật (75% - 95%)
  const targetSat = Math.max(75, Math.min(95, sat));

  // Tăng cường Lightness (Độ sáng) của gradient để luôn đạt độ tương phản hoàn hảo với chữ màu tối
  const lLeft = Math.max(48, Math.min(65, light - 3));
  const lRight = Math.max(58, Math.min(75, light + 7));

  const fromColor = `hsl(${hLeft}, ${targetSat}%, ${lLeft}%)`;
  const toColor = `hsl(${hRight}, ${targetSat}%, ${lRight}%)`;

  const shadowBlur = isDark ? 16 : 6;
  const shadowY = isDark ? 4 : 2;
  const glowOpacity = isDark ? 0.25 : 0.12;

  return {
    background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
    color: '#0f172a', // Chữ màu tối (slate-900) cực kỳ sạch sẽ và dễ đọc
    borderColor: 'transparent',
    fontWeight: '600',
    letterSpacing: '0.025em',
    boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(${r}, ${g}, ${b}, ${glowOpacity})`,
  };
}

export function StorefrontCard({
  layout,
  href,
  image,
  imageAlt,
  fallbackIcon,
  categoryName,
  title,
  description,
  leftMetadata,
  rightDetails,
  ctaLabel = 'Xem chi tiết',
  brandColor = '#3b82f6',
  radiusClass = 'rounded-xl',
  isDark = false,
  imageAspectRatioClass = 'aspect-video',
  darkModePremiumBorder = false,
  showDetailButton = false,
  detailButtonText
}: StorefrontCardProps) {

  const premiumStyle = isDark && darkModePremiumBorder;
  const buttonStyles = getButtonStyles(brandColor, isDark);
  const displayButtonText = detailButtonText || ctaLabel || 'Xem chi tiết';

  if (layout === 'grid') {
    return (
      <Link
        href={href}
        className={`group overflow-hidden border transition-all duration-300 flex flex-col h-full hover:border-[var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)] hover:-translate-y-1 ${radiusClass}`}
        style={{
          backgroundColor: isDark ? '#161617' : '#ffffff',
          borderColor: premiumStyle ? `${brandColor}3d` : (isDark ? '#27272a' : '#e2e8f0'),
          '--card-hover-border': brandColor,
          '--card-hover-shadow': premiumStyle 
            ? `0 0 30px 2px ${brandColor}50, 0 0 12px 0px ${brandColor}30` 
            : (isDark ? '0 12px 30px -8px rgba(0,0,0,0.5)' : '0 12px 30px -8px rgba(0,0,0,0.12)'),
          ...(premiumStyle ? {
            transitionDuration: '500ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
          } : {})
        } as React.CSSProperties}
      >
        {/* Hình ảnh */}
        <div className={`overflow-hidden relative ${imageAspectRatioClass} bg-slate-100 dark:bg-[#1c1c1e] shrink-0`}>
          {image ? (
            <Image
              mode="thumb"
              src={image}
              alt={imageAlt || title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {fallbackIcon || <div className="text-slate-400 dark:text-zinc-500">Hình ảnh</div>}
            </div>
          )}
        </div>

        {/* Nội dung chữ */}
        <div className="p-3 sm:p-4 flex flex-1 flex-col justify-between">
          <div className="space-y-2">
            {categoryName && (
              <div className="flex mb-1.5">
                <span
                  className="text-[9px] sm:text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border transition-all duration-300"
                  style={{
                    backgroundColor: `${brandColor}0d`,
                    color: brandColor,
                    borderColor: `${brandColor}25`
                  }}
                >
                  {categoryName}
                </span>
              </div>
            )}

            <h3
              className="text-xs sm:text-sm font-medium line-clamp-2 transition-colors mb-1 sm:mb-2 group-hover:text-[var(--title-hover-color)]"
              style={{
                color: isDark ? '#f5f5f7' : '#1d1d1f',
                '--title-hover-color': brandColor
              } as React.CSSProperties}
            >
              {title}
            </h3>

            {description && (
              <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-[#86868b]">
                {description}
              </p>
            )}

            {leftMetadata && <div className="pt-1">{leftMetadata}</div>}
          </div>

          <div className="mt-4 space-y-3">
            {rightDetails && (
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/40">
                {rightDetails}
              </div>
            )}

            {showDetailButton && (
              <div className="w-full">
                <span
                  className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm border whitespace-nowrap active:scale-[0.98] group-hover:brightness-105 group-hover:shadow-md"
                  style={buttonStyles}
                >
                  {displayButtonText}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // layout === 'list'
  return (
    <Link
      href={href}
      className={`group flex flex-col sm:flex-row gap-4 border transition-all duration-300 p-4 hover:border-[var(--card-hover-border)] hover:shadow-[var(--card-hover-shadow)] hover:-translate-y-0.5 ${radiusClass}`}
      style={{
        backgroundColor: isDark ? '#161617' : '#ffffff',
        borderColor: premiumStyle ? `${brandColor}3d` : (isDark ? '#27272a' : '#e2e8f0'),
        '--card-hover-border': brandColor,
        '--card-hover-shadow': premiumStyle 
          ? `0 0 30px 2px ${brandColor}50, 0 0 12px 0px ${brandColor}30` 
          : (isDark ? '0 12px 30px -8px rgba(0,0,0,0.5)' : '0 12px 30px -8px rgba(0,0,0,0.1)'),
        ...(premiumStyle ? {
          transitionDuration: '500ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
        } : {})
      } as React.CSSProperties}
    >
      {/* Thumbnail */}
      <div className={`w-full sm:w-32 md:w-40 shrink-0 overflow-hidden rounded-lg relative ${imageAspectRatioClass} bg-slate-100 dark:bg-[#1c1c1e]`}>
        {image ? (
          <Image
            mode="thumb"
            src={image}
            alt={imageAlt || title}
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {fallbackIcon || <div className="text-slate-400 dark:text-zinc-500">Hình ảnh</div>}
          </div>
        )}
      </div>

      {/* Content layout: 2 columns on Desktop */}
      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5">
          {categoryName && (
            <div className="flex">
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border transition-all duration-300"
                style={{
                  backgroundColor: `${brandColor}0d`,
                  color: brandColor,
                  borderColor: `${brandColor}25`
                }}
              >
                {categoryName}
              </span>
            </div>
          )}

          <h3
            className="font-semibold text-lg transition-colors mb-2 group-hover:text-[var(--title-hover-color)]"
            style={{
              color: isDark ? '#f5f5f7' : '#1d1d1f',
              '--title-hover-color': brandColor
            } as React.CSSProperties}
          >
            {title}
          </h3>

          {description && (
            <p className="text-sm line-clamp-2 mb-2 text-slate-500 dark:text-[#86868b] leading-relaxed">
              {description}
            </p>
          )}

          {leftMetadata && <div className="w-full pt-1">{leftMetadata}</div>}
        </div>

        {/* Right Column: Details & CTA */}
        <div className="flex flex-col items-start md:items-end justify-center shrink-0 min-w-[220px] md:text-right gap-2 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/40 pt-3 md:pt-0">
          {rightDetails && (
            <div className="w-full flex md:justify-end">
              {rightDetails}
            </div>
          )}

          {(ctaLabel || showDetailButton) && (
            <div className="w-full max-w-[220px] mt-2 md:mt-1 flex md:justify-end">
              <span
                className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm border whitespace-nowrap active:scale-[0.98] group-hover:brightness-105 group-hover:shadow-md"
                style={showDetailButton ? buttonStyles : {
                  backgroundColor: brandColor,
                  color: '#ffffff',
                }}
              >
                {displayButtonText} {showDetailButton ? '' : '→'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
