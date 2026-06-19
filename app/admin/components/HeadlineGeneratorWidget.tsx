'use client';

import React, { useEffect, useState } from 'react';
import { Check, Copy, Lightbulb, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generateHeadlines } from '@/lib/constants/headlines';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  cn,
} from './ui';

type HeadlineGeneratorWidgetProps = {
  className?: string;
  currentTitle: string;
  onSelect: (headline: string) => void;
};

const HEADLINE_LIMIT = 8;

export function HeadlineGeneratorWidget({
  className,
  currentTitle,
  onSelect,
}: HeadlineGeneratorWidgetProps) {
  const [open, setOpen] = useState(false);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeyword, setSecondaryKeyword] = useState('');
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [copiedHeadline, setCopiedHeadline] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {return;}
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const openDialog = () => {
    setPrimaryKeyword(currentTitle.trim());
    setSecondaryKeyword('');
    setOpen(true);
  };

  const handleGenerate = () => {
    const nextPrimaryKeyword = primaryKeyword.trim() || currentTitle.trim();
    const nextSecondaryKeyword = secondaryKeyword.trim();
    if (!nextPrimaryKeyword) {
      toast.error('Vui lòng nhập từ khóa chính để tạo tiêu đề');
      return;
    }

    setPrimaryKeyword(nextPrimaryKeyword);
    setSecondaryKeyword(nextSecondaryKeyword);
    setHeadlines(generateHeadlines(
      nextSecondaryKeyword ? [nextPrimaryKeyword, nextSecondaryKeyword] : nextPrimaryKeyword,
      HEADLINE_LIMIT,
    ));
  };

  const applyHeadline = (headline: string) => {
    const nextHeadline = headline.trim();
    if (!nextHeadline) {return;}
    onSelect(nextHeadline);
    setOpen(false);
    toast.success('Đã áp dụng tiêu đề gợi ý');
  };

  const copyHeadline = async (headline: string) => {
    try {
      await navigator.clipboard.writeText(headline);
      setCopiedHeadline(headline);
      toast.success('Đã copy tiêu đề');
      window.setTimeout(() => setCopiedHeadline(null), 1500);
    } catch {
      toast.error('Không thể copy, vui lòng copy thủ công');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn('shrink-0', className)}
        onClick={openDialog}
        title="Gợi ý tiêu đề hay"
        aria-label="Gợi ý tiêu đề hay"
      >
        <Lightbulb size={16} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[94vw] max-w-3xl max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <DialogHeader>
            <DialogTitle>Bộ tạo tiêu đề thu hút</DialogTitle>
            <DialogDescription>
              Nhập tối đa 2 từ khóa để tạo nhanh các tiêu đề tiếng Việt có khả năng tăng CTR.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="headline-primary-keyword">Từ khóa / chủ đề chính</Label>
                  <Input
                    id="headline-primary-keyword"
                    value={primaryKeyword}
                    onChange={(event) => setPrimaryKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="VD: chăm sóc tóc, phụ kiện tủ bếp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline-secondary-keyword">Từ khóa phụ</Label>
                  <Input
                    id="headline-secondary-keyword"
                    value={secondaryKeyword}
                    onChange={(event) => setSecondaryKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="VD: dầu gội, tối ưu chi phí"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="accent" className="gap-2" onClick={handleGenerate}>
                  <Sparkles size={16} />
                  Tạo tiêu đề gợi ý
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tiêu đề chỉ được đưa vào form khi bạn bấm “Sử dụng”.
              </p>
            </div>

            {headlines.length > 0 ? (
              <div className="space-y-2">
                {headlines.map((headline) => (
                  <div
                    key={headline}
                    className="rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-900/70 dark:hover:bg-blue-950/20"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <p className="text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                        {headline}
                      </p>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button type="button" size="sm" variant="accent" onClick={() => applyHeadline(headline)}>
                          Sử dụng
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => void copyHeadline(headline)}>
                          {copiedHeadline === headline ? <Check size={14} /> : <Copy size={14} />}
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                Chưa có gợi ý. Nhập từ khóa rồi bấm “Tạo tiêu đề gợi ý”.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
