'use client';

import { useRef, useCallback } from 'react';

// Đường dẫn tĩnh trong thư mục public của Next.js
const PAGE_FLIP_SOUNDS = [
  '/sound/page-flip1-178322.mp3',
  '/sound/page-flip2-178323.mp3',
  '/sound/small-page-103398.mp3',
];

interface UsePageFlipSoundOptions {
  volume?: number; // 0-1
  enabled?: boolean;
}

export const usePageFlipSound = (options: UsePageFlipSoundOptions = {}) => {
  const { volume = 0.3, enabled = true } = options;
  
  const audioPoolRef = useRef<HTMLAudioElement[]>([]);
  const loadedRef = useRef(false);
  const lastSoundIndexRef = useRef(-1);
  
  // Khởi tạo danh sách các phần tử Audio để sẵn sàng phát
  const initAudioPool = useCallback(() => {
    if (loadedRef.current || typeof window === 'undefined') return;
    
    PAGE_FLIP_SOUNDS.forEach((src) => {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.playbackRate = 1.3; // Tăng tốc độ lật một chút cho mượt
      audio.preload = 'auto';
      audioPoolRef.current.push(audio);
    });
    
    loadedRef.current = true;
  }, [volume]);
  
  // Phát âm thanh lật ngẫu nhiên (tránh lặp lại 2 lần liên tiếp)
  const playFlipSound = useCallback(() => {
    if (!enabled) return;
    
    if (!loadedRef.current) {
      initAudioPool();
    }
    
    const pool = audioPoolRef.current;
    if (pool.length === 0) return;
    
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * pool.length);
    } while (randomIndex === lastSoundIndexRef.current && pool.length > 1);
    
    lastSoundIndexRef.current = randomIndex;
    
    const audio = pool[randomIndex];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch(() => {
        // Bỏ qua lỗi trình duyệt chặn tự động phát âm thanh (autoplay restriction)
      });
    }
  }, [enabled, volume, initAudioPool]);
  
  const setVolume = useCallback((newVolume: number) => {
    audioPoolRef.current.forEach(audio => {
      audio.volume = Math.max(0, Math.min(1, newVolume));
    });
  }, []);
  
  return {
    playFlipSound,
    setVolume,
  };
};
