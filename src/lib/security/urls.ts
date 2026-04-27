const SAFE_WEB_PROTOCOLS = new Set(["http:", "https:"]);

export function safeWebUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    return SAFE_WEB_PROTOCOLS.has(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function isSafeWebUrl(rawUrl: string): boolean {
  return safeWebUrl(rawUrl) !== null;
}
