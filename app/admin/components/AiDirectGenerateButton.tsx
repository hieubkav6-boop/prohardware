'use client';

import React from 'react';
import { Loader2, WandSparkles } from 'lucide-react';
import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { readAiChatStream, streamChatjptFromBrowser } from '@/lib/ai-chat-client';
import { Button, Label, type ButtonProps, cn } from './ui';

const cleanAiJsonText = (raw: string) => {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
};

type AiDirectGenerateButtonProps = Omit<ButtonProps, 'onClick'> & {
  label?: string;
  prompt: string;
  sessionId?: string;
  sourcePath?: string;
  onGenerated: (text: string) => void;
};

export function AiDirectGenerateButton({
  className,
  disabled,
  label = 'Tạo bằng ChatJPT',
  onGenerated,
  prompt,
  sessionId,
  size = 'sm',
  sourcePath,
  type = 'button',
  variant = 'outline',
  ...props
}: AiDirectGenerateButtonProps) {
  const config = useQuery(api.systemIntegrations.getPublicAiConfig);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const canUseChatjpt = config?.enabled === true && config.provider === 'chatjpt';

  const disabledReason = config === undefined
    ? 'Đang tải cấu hình ChatJPT.'
    : !config.enabled
      ? 'Cần bật AI Chatbot trong System > Tích hợp trước.'
      : config.provider !== 'chatjpt'
        ? 'Nút này chỉ chạy khi provider đang là ChatJPT.'
        : '';

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error('Prompt AI đang trống.');
      return;
    }
    if (!canUseChatjpt) {
      toast.error(disabledReason || 'ChatJPT chưa sẵn sàng.');
      return;
    }

    setIsGenerating(true);
    onGenerated('');
    let output = '';
    let streamError = '';

    const appendOutput = (text: string) => {
      output += text;
    };

    try {
      const resolvedSourcePath = sourcePath
        ?? (typeof window === 'undefined' ? '/admin/ai-import' : window.location.pathname);
      const response = await fetch('/api/ai-chat', {
        body: JSON.stringify({
          message: prompt.trim(),
          mode: 'ai-import',
          sessionId: sessionId ?? `admin-ai-import:${resolvedSourcePath}`,
          sourcePath: resolvedSourcePath,
          stream: true,
        }),
        headers: {
          Accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(typeof data?.message === 'string' ? data.message : 'ChatJPT chưa thể tạo nội dung.');
      }

      if ((response.headers.get('content-type') || '').toLowerCase().includes('text/event-stream')) {
        const fallback = await readAiChatStream(response, {
          onDelta: appendOutput,
          onError: (message) => {
            streamError = message;
          },
          onMeta: () => undefined,
        });
        if (fallback) {
          await streamChatjptFromBrowser(fallback, appendOutput);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        output = String(data.message ?? '');
      }

      const cleaned = cleanAiJsonText(output);
      if (!cleaned.trim()) {
        throw new Error(streamError || 'ChatJPT đã phản hồi nhưng không có nội dung.');
      }
      onGenerated(cleaned);
      toast.success('ChatJPT đã tạo nội dung.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ChatJPT chưa thể tạo nội dung.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      {...props}
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || isGenerating || config === undefined || !canUseChatjpt}
      title={disabledReason || undefined}
      className={cn('gap-1 text-xs', className)}
      onClick={() => void generate()}
    >
      {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <WandSparkles size={12} />}
      {isGenerating ? 'Đang tạo...' : label}
    </Button>
  );
}

type AiDirectGeneratePanelProps = {
  buttonLabel?: string;
  className?: string;
  description?: string;
  label?: string;
  onGenerated: (text: string) => void;
  placeholder?: string;
  prompt: string;
  sessionId?: string;
  sourcePath?: string;
};

export function AiDirectGeneratePanel({
  buttonLabel = 'Tạo bằng ChatJPT',
  className,
  description = 'Ô này là dữ liệu đầu vào chính. ChatJPT phải bám trực tiếp nội dung này để tạo JSON ở ô bên dưới.',
  label = 'Yêu cầu bắt buộc cho ChatJPT',
  onGenerated,
  placeholder = 'Ví dụ: Viết bài “Cách chọn phụ kiện tủ bếp bền đẹp”, tập trung chất liệu, tải trọng, thói quen sử dụng và CTA tư vấn.',
  prompt,
  sessionId,
  sourcePath,
}: AiDirectGeneratePanelProps) {
  const [brief, setBrief] = React.useState('');
  const normalizedBrief = brief.trim();
  const finalPrompt = React.useMemo(() => [
    'Bạn đang tạo dữ liệu JSON cho tính năng Import AI trong admin VietAdmin.',
    '',
    'YÊU CẦU CỦA ADMIN, SOURCE OF TRUTH BẮT BUỘC:',
    `"""${normalizedBrief}"""`,
    '',
    'Quy tắc bắt buộc khi tạo nội dung:',
    '- Chủ đề, title, heading, nội dung chính và ví dụ phải trực tiếp bám vào yêu cầu admin ở trên.',
    '- Không được tự đổi sang chủ đề khác, không tạo nội dung chung chung nếu admin đã nhập chủ đề cụ thể.',
    '- Nếu admin nhập tên bài/sản phẩm/dịch vụ, JSON phải thể hiện đúng tên hoặc đúng ý đó.',
    '- Nếu admin yêu cầu dạng danh sách như "Top 10 ...", nội dung phải là danh sách tương ứng, không đổi thành bài khác.',
    '- Nếu thiếu chi tiết, chỉ suy luận an toàn trong phạm vi yêu cầu admin đưa.',
    '- Vẫn phải trả đúng JSON hợp lệ theo schema kỹ thuật bên dưới.',
    '',
    'PROMPT KỸ THUẬT VÀ SCHEMA:',
    prompt.trim(),
    '',
    'Trả về JSON hợp lệ ngay bây giờ.',
  ].join('\n'), [normalizedBrief, prompt]);

  return (
    <div className={cn('rounded-lg border border-cyan-100 bg-cyan-50/70 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Label className="flex items-center gap-1.5 text-xs font-bold text-cyan-900 dark:text-cyan-100">
          <WandSparkles size={14} />
          {label}
        </Label>
        <AiDirectGenerateButton
          prompt={finalPrompt}
          sessionId={sessionId}
          sourcePath={sourcePath}
          onGenerated={onGenerated}
          disabled={!normalizedBrief}
          label={buttonLabel}
          className="h-8 border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50 dark:border-cyan-900 dark:bg-slate-950 dark:text-cyan-200"
        />
      </div>
      <textarea
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        placeholder={placeholder}
        className="min-h-20 w-full rounded-md border border-cyan-100 bg-white px-3 py-2 text-xs leading-5 text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30 dark:border-cyan-900/60 dark:bg-slate-950 dark:text-slate-100"
      />
      <p className="mt-1.5 text-[11px] leading-4 text-cyan-800/75 dark:text-cyan-200/70">
        {description}
      </p>
    </div>
  );
}
