export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_SNAPSHOT_ZIP_BYTES = 50 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const blockedHostnameSuffixes = ['.local', '.internal'];
const blockedHostnames = new Set(['localhost', '0.0.0.0', '::', '::1']);

const isPrivateIpv4 = (hostname: string) => {
  const parts = hostname.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [a, b] = parts;
  return (
    a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
  );
};

const isBlockedHostname = (hostname: string) => {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const isIpv6Literal = normalized.includes(':');
  return (
    blockedHostnames.has(normalized)
    || blockedHostnameSuffixes.some((suffix) => normalized.endsWith(suffix))
    || (isIpv6Literal && (normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80')))
    || isPrivateIpv4(normalized)
  );
};

const parseSnapshotUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Thiếu link snapshot');
  }
  const parsed = new URL(value.trim());
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Link snapshot phải dùng http hoặc https');
  }
  if (parsed.username || parsed.password || isBlockedHostname(parsed.hostname)) {
    throw new Error('Link snapshot không được phép');
  }
  return parsed;
};

const fetchWithSafeRedirects = async (initialUrl: URL) => {
  let currentUrl = initialUrl;
  for (let index = 0; index <= MAX_REDIRECTS; index += 1) {
    const response = await fetch(currentUrl, {
      headers: { Accept: 'application/zip,*/*;q=0.8' },
      redirect: 'manual',
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      if (!location) {
        throw new Error('Snapshot link redirect thiếu Location');
      }
      currentUrl = parseSnapshotUrl(new URL(location, currentUrl).toString());
      continue;
    }
    return response;
  }
  throw new Error('Snapshot link redirect quá nhiều lần');
};

const resolveFileName = (response: Response) => {
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  const rawName = decodeURIComponent(match?.[1]?.trim() || 'snapshot-import.zip');
  const safeName = rawName.replaceAll(/[\\/:*?"<>|]+/g, '-');
  return safeName.toLowerCase().endsWith('.zip') ? safeName : `${safeName}.zip`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { url?: unknown } | null;
    const snapshotUrl = parseSnapshotUrl(body?.url);
    const response = await fetchWithSafeRedirects(snapshotUrl);
    if (!response.ok) {
      return Response.json({ error: `Không tải được snapshot: HTTP ${response.status}` }, { status: 400 });
    }

    const contentLength = Number(response.headers.get('Content-Length') ?? 0);
    if (contentLength > MAX_SNAPSHOT_ZIP_BYTES) {
      return Response.json({ error: 'Snapshot ZIP vượt quá 50MB' }, { status: 413 });
    }

    const data = await response.arrayBuffer();
    if (data.byteLength > MAX_SNAPSHOT_ZIP_BYTES) {
      return Response.json({ error: 'Snapshot ZIP vượt quá 50MB' }, { status: 413 });
    }
    const signature = new Uint8Array(data.slice(0, 2));
    if (signature[0] !== 0x50 || signature[1] !== 0x4b) {
      return Response.json({ error: 'Link không trả về file ZIP hợp lệ' }, { status: 400 });
    }

    return new Response(data, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${resolveFileName(response)}"`,
        'Content-Type': 'application/zip',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Không tải được snapshot từ link',
    }, { status: 400 });
  }
}
