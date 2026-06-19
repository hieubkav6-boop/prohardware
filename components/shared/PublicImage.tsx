'use client';

import NextImage from 'next/image';
import React from 'react';
import type { ImageProps } from 'next/image';

type PublicImageMode = 'hero' | 'primary' | 'thumb' | 'logo' | 'decorative';

type PublicImageProps = ImageProps & {
  alt?: string;
  mode?: PublicImageMode;
};

/**
 * Wrapper nhỏ quanh next/image để:
 * 1. Cho phép prop `mode` (semantic hint, không ảnh hưởng render)
 * 2. Normalize local /_next/image URLs về URL gốc (tránh double-optimize)
 * 3. Fallback graceful khi src rỗng
 *
 * Tất cả props của next/image (priority, loading, sizes, quality, fill, placeholder...) đều được
 * pass through đầy đủ — KHÔNG bị strip như phiên bản cũ dùng raw <img>.
 */
export function PublicImage({ alt = '', mode: _mode, ...props }: PublicImageProps) {
  const { src, ...rest } = props;

  if (!src) {
    return null;
  }

  // Normalize src: unwrap local /_next/image URL về original để tránh double-optimization
  let resolvedSrc: string | typeof src;
  if (typeof src === 'string') {
    resolvedSrc = normalizeLocalNextImageUrl(src.trim());
  } else {
    resolvedSrc = src;
  }

  if (!resolvedSrc) {
    return null;
  }

  return (
    <NextImage
      alt={alt}
      src={resolvedSrc}
      {...rest}
    />
  );
}

/**
 * Unwrap local /_next/image?url=... về URL gốc.
 * Chỉ unwrap khi hostname là localhost để không ảnh hưởng URL production.
 */
const normalizeLocalNextImageUrl = (value: string): string => {
  if (!value.includes('/_next/image?')) {
    return value;
  }

  try {
    const parsed = new URL(value, 'http://localhost');
    if (parsed.hostname !== 'localhost') {
      return value;
    }
    const original = parsed.searchParams.get('url');
    if (!original) {
      return value;
    }
    return decodeURIComponent(original);
  } catch {
    return value;
  }
};
