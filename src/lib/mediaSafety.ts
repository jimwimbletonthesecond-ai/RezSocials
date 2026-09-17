// Media safety utilities
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.mp3', '.wav', '.ogg'];

export function isSafeMediaUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:image/') || url.startsWith('blob:') || url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const lower = parsed.pathname.toLowerCase();
    return ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext)) || url.includes('unsplash.com') || url.includes('imgur.com') || url.includes('cloudinary.com');
  } catch {
    return false;
  }
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
}
