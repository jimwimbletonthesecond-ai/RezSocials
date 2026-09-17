const BANNED_PATTERNS = [
  /child\s*abuse/i,
  /terrorist/i,
  /suicide\s*instruction/i,
];

export function checkContentSafety(text: string): { safe: boolean; reason?: string } {
  if (!text) return { safe: true };
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Content violates community safety guidelines.' };
    }
  }
  return { safe: true };
}
