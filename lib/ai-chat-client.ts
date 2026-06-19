export interface AiChatSuggestion {
  title: string;
  type: string;
  url: string;
}

export interface ChatjptClientFallback {
  body: {
    messages: Array<{ content: string; role: 'assistant' | 'system' | 'user' }>;
    model: string;
    stream?: boolean;
  };
  endpoint: string;
}

function parseSseBlock(block: string) {
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of block.replace(/\r/g, '').split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  const rawData = dataLines.join('\n').trim();
  if (!rawData || rawData === '[DONE]') {
    return { data: null, event };
  }

  try {
    return { data: JSON.parse(rawData) as unknown, event };
  } catch {
    return { data: rawData, event };
  }
}

function findFirstTextField(input: unknown): string {
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findFirstTextField(item);
      if (found.trim().length > 0) return found;
    }
    return '';
  }
  if (typeof input !== 'object' || input === null) return '';

  const record = input as Record<string, unknown>;
  const directKeys = ['content', 'text', 'output_text', 'answer', 'message', 'response'];
  for (const key of directKeys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }

  const priorityKeys = ['result', 'output', 'data', 'choices', 'messages', 'message', 'delta'];
  for (const key of priorityKeys) {
    if (!(key in record)) continue;
    const found = findFirstTextField(record[key]);
    if (found.trim().length > 0) return found;
  }

  for (const value of Object.values(record)) {
    const found = findFirstTextField(value);
    if (found.trim().length > 0) return found;
  }
  return '';
}

function extractResponseFromRawStream(raw: string): string {
  const normalized = raw.replace(/\r/g, '');
  const matches = [...normalized.matchAll(/"response"\s*:\s*"((?:\\.|[^"\\])*)"/g)];
  if (matches.length === 0) return '';

  let out = '';
  for (const match of matches) {
    const piece = match[1];
    if (!piece) continue;
    try {
      out += JSON.parse(`"${piece}"`) as string;
    } catch {
      out += piece;
    }
  }

  return out.trim();
}

function extractChatjptText(raw: string): string {
  const text = raw.trim();
  if (!text) return '';
  try {
    const parsed = JSON.parse(text);
    const found = findFirstTextField(parsed);
    return found.trim() || JSON.stringify(parsed);
  } catch {
    return extractResponseFromRawStream(text) || text;
  }
}

function buildChatjptHttpError(status: number, raw: string): string {
  const prefix = `ChatJPT API error: HTTP ${status}`;
  const trimmed = raw.trim();
  if (!trimmed) return prefix;

  try {
    const parsed = JSON.parse(trimmed);
    const apiError = findFirstTextField(parsed).trim();
    return apiError ? `${prefix}: ${apiError.slice(0, 180)}` : prefix;
  } catch {
    return `${prefix}: ${trimmed.slice(0, 180)}`;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function emitTextInChunks(text: string, onDelta: (text: string) => void) {
  const normalized = text.trim();
  if (!normalized) return;

  for (let index = 0; index < normalized.length; index += 18) {
    onDelta(normalized.slice(index, index + 18));
    await sleep(12);
  }
}

function toClientFallback(input: unknown): ChatjptClientFallback | null {
  if (typeof input !== 'object' || input === null) return null;
  const record = input as Record<string, unknown>;
  const endpoint = typeof record.endpoint === 'string' ? record.endpoint.trim() : '';
  const body = record.body;
  if (!endpoint || typeof body !== 'object' || body === null) return null;

  const payload = body as Record<string, unknown>;
  const model = typeof payload.model === 'string' ? payload.model : '';
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const normalizedMessages = messages
    .map((item) => {
      if (typeof item !== 'object' || item === null) return null;
      const message = item as Record<string, unknown>;
      const role = message.role;
      const content = message.content;
      if (
        (role !== 'assistant' && role !== 'system' && role !== 'user')
        || typeof content !== 'string'
      ) {
        return null;
      }
      return { content, role };
    })
    .filter((item): item is { content: string; role: 'assistant' | 'system' | 'user' } => item !== null);

  if (!model || normalizedMessages.length === 0) return null;

  return {
    body: {
      messages: normalizedMessages,
      model,
      stream: payload.stream === true,
    },
    endpoint,
  };
}

export async function streamChatjptFromBrowser(
  fallback: ChatjptClientFallback,
  onDelta: (text: string) => void,
) {
  const response = await fetch(fallback.endpoint, {
    body: JSON.stringify(fallback.body),
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (!response.ok) {
    throw new Error(buildChatjptHttpError(response.status, await response.text()));
  }

  if (!response.body || !contentType.includes('text/event-stream')) {
    const text = extractChatjptText(await response.text());
    if (!text.trim()) {
      throw new Error('ChatJPT không trả về nội dung.');
    }
    await emitTextInChunks(text, onDelta);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let emitted = '';

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split(/\n\n/);
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (parsed.data === null || parsed.event === 'done') {
        continue;
      }

      const text = findFirstTextField(parsed.data);
      if (!text.trim()) {
        continue;
      }

      const delta = text.startsWith(emitted) ? text.slice(emitted.length) : text;
      if (delta) {
        onDelta(delta);
      }
      emitted = text.startsWith(emitted) ? text : `${emitted}${delta}`;
    }

    if (done) {
      break;
    }
  }

  if (!emitted.trim()) {
    throw new Error('ChatJPT không trả về nội dung.');
  }
}

export async function readAiChatStream(
  response: Response,
  callbacks: {
    onDelta: (text: string) => void;
    onError: (message: string) => void;
    onMeta: (suggestions: AiChatSuggestion[]) => void;
  },
): Promise<ChatjptClientFallback | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Trình duyệt không hỗ trợ streaming.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fallback: ChatjptClientFallback | null = null;

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split(/\n\n/);
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (parsed.event === 'delta' && typeof parsed.data === 'object' && parsed.data !== null) {
        const text = (parsed.data as { text?: unknown }).text;
        if (typeof text === 'string' && text) {
          callbacks.onDelta(text);
        }
      } else if (parsed.event === 'meta' && typeof parsed.data === 'object' && parsed.data !== null) {
        const suggestions = (parsed.data as { suggestions?: unknown }).suggestions;
        callbacks.onMeta(Array.isArray(suggestions) ? suggestions as AiChatSuggestion[] : []);
      } else if (parsed.event === 'error' && typeof parsed.data === 'object' && parsed.data !== null) {
        const message = (parsed.data as { message?: unknown }).message;
        callbacks.onError(typeof message === 'string' ? message : 'Chatbot AI chưa thể phản hồi.');
      } else if (parsed.event === 'client-fallback') {
        fallback = toClientFallback(parsed.data);
      }
    }

    if (done) {
      break;
    }
  }

  return fallback;
}
