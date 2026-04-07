const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function getCachedResponse(key: string): string | null {
  try {
    const cached = sessionStorage.getItem(`ai-cache:${key}`);
    if (!cached) return null;
    const { value, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(`ai-cache:${key}`);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function setCachedResponse(key: string, value: string): void {
  try {
    sessionStorage.setItem(
      `ai-cache:${key}`,
      JSON.stringify({ value, timestamp: Date.now() })
    );
  } catch {
    /* quota exceeded */
  }
}

export function makeCacheKey(...parts: string[]): string {
  return parts.filter(Boolean).sort().join(':');
}
