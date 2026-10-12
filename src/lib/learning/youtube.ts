export function youtubeVideoId(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return;
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    const id =
      host === 'youtu.be' && parts.length === 1
        ? parts[0]
        : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)
          ? url.pathname === '/watch'
            ? url.searchParams.get('v')
            : ['embed', 'shorts', 'live'].includes(parts[0]) && parts.length === 2
              ? parts[1]
              : undefined
          : undefined;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : undefined;
  } catch {
    return;
  }
}
