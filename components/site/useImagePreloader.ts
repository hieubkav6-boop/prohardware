'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PreloadOptions {
  priority?: 'critical' | 'high' | 'low' | 'idle';
}

interface PreloadTask {
  url: string;
  priority: 'critical' | 'high' | 'low' | 'idle';
  status: 'pending' | 'loading' | 'loaded' | 'error';
}

// Global cache to track preloaded image URLs
const loadedImages = new Set<string>();
const pendingTasks: PreloadTask[] = [];
let isIdleLoading = false;

// Preload a single image
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (loadedImages.has(url)) {
      resolve();
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      loadedImages.add(url);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Process idle tasks when browser is idle
const processIdleTasks = () => {
  if (isIdleLoading) return;
  isIdleLoading = true;

  const idleCallback = (deadline: IdleDeadline) => {
    while (deadline.timeRemaining() > 0 && pendingTasks.length > 0) {
      const task = pendingTasks.shift();
      if (task && task.status === 'pending') {
        task.status = 'loading';
        preloadImage(task.url)
          .then(() => { task.status = 'loaded'; })
          .catch(() => { task.status = 'error'; });
      }
    }

    if (pendingTasks.length > 0) {
      requestIdleCallback(idleCallback, { timeout: 2000 });
    } else {
      isIdleLoading = false;
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(idleCallback, { timeout: 2000 });
  } else {
    // Fallback using setTimeout
    const fallbackProcess = () => {
      const task = pendingTasks.shift();
      if (task && task.status === 'pending') {
        task.status = 'loading';
        preloadImage(task.url)
          .then(() => { task.status = 'loaded'; })
          .catch(() => { task.status = 'error'; });
      }
      if (pendingTasks.length > 0) {
        setTimeout(fallbackProcess, 50);
      } else {
        isIdleLoading = false;
      }
    };
    setTimeout(fallbackProcess, 50);
  }
};

export const useImagePreloader = () => {
  const abortRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const preload = useCallback(async (urls: string[], options: PreloadOptions = {}) => {
    const { priority = 'high' } = options;
    const validUrls = urls.filter(url => url && !loadedImages.has(url));

    if (validUrls.length === 0) return;

    switch (priority) {
      case 'critical':
        // Load immediately, parallel
        await Promise.all(validUrls.map(url => preloadImage(url).catch(() => {})));
        break;

      case 'high':
        // Load immediately, sequential to avoid thread blocking
        for (const url of validUrls) {
          if (abortRef.current) break;
          await preloadImage(url).catch(() => {});
        }
        break;

      case 'low':
        // Add to queue with a minor delay
        validUrls.forEach(url => {
          pendingTasks.push({ url, priority: 'low', status: 'pending' });
        });
        setTimeout(processIdleTasks, 100);
        break;

      case 'idle':
        // Add to queue, process when browser is free
        validUrls.forEach(url => {
          pendingTasks.push({ url, priority: 'idle', status: 'pending' });
        });
        processIdleTasks();
        break;
    }
  }, []);

  // Preload first page of all catalogs (Tier 1)
  const preloadFirstPages = useCallback((catalogs: { pageImageUrls?: (string | null)[] }[]) => {
    const firstPageUrls = catalogs
      .map(doc => doc.pageImageUrls?.[0])
      .filter((url): url is string => !!url);
    
    if (firstPageUrls.length > 0) {
      void preload(firstPageUrls, { priority: 'critical' });
    }
  }, [preload]);

  // Preload viewer pages (4-tier loading strategy)
  const preloadForViewer = useCallback((
    pageImageUrls: (string | null)[],
    currentPage: number,
    initialPages: number = 2
  ) => {
    const validUrls = pageImageUrls.filter((url): url is string => !!url);
    if (validUrls.length === 0) return;

    const currentIndex = currentPage - 1;

    // TIER 1: Critical - load current viewing pages (2 on desktop, 1 on mobile)
    const criticalStart = Math.max(0, currentIndex);
    const criticalEnd = Math.min(validUrls.length, criticalStart + initialPages);
    const criticalUrls = validUrls.slice(criticalStart, criticalEnd);
    void preload(criticalUrls, { priority: 'critical' });

    // TIER 2: High - next 2 pages
    const highStart = criticalEnd;
    const highEnd = Math.min(validUrls.length, highStart + 2);
    const highUrls = validUrls.slice(highStart, highEnd);
    if (highUrls.length > 0) {
      void preload(highUrls, { priority: 'high' });
    }

    // TIER 3: Low - next 4 pages
    const lowStart = highEnd;
    const lowEnd = Math.min(validUrls.length, lowStart + 4);
    const lowUrls = validUrls.slice(lowStart, lowEnd);
    if (lowUrls.length > 0) {
      void preload(lowUrls, { priority: 'low' });
    }

    // TIER 4: Idle - remaining pages
    const idleUrls = validUrls.slice(lowEnd);
    if (idleUrls.length > 0) {
      void preload(idleUrls, { priority: 'idle' });
    }
  }, [preload]);

  const isLoaded = useCallback((url: string) => loadedImages.has(url), []);

  return {
    preload,
    preloadFirstPages,
    preloadForViewer,
    isLoaded,
  };
};

export const ImagePreloader = {
  preloadImage,
  isLoaded: (url: string) => loadedImages.has(url),
  getCacheSize: () => loadedImages.size
};
