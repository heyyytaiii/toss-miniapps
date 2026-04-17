// Basic profanity filter for Korean + English
// In production, use a more comprehensive list or server-side filtering

const BLOCKED_WORDS = [
  // Korean profanity (abbreviated for safety)
  '시발', '씨발', '개새끼', '병신', 'ㅅㅂ', 'ㅂㅅ', 'ㅆㅂ',
  '지랄', '꺼져', '닥쳐', '미친',
  // English profanity
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'bastard',
];

const BLOCKED_PATTERN_SRC = BLOCKED_WORDS
  .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

export function containsProfanity(text: string): boolean {
  return new RegExp(BLOCKED_PATTERN_SRC, 'gi').test(text);
}

export function filterProfanity(text: string): string {
  return text.replace(new RegExp(BLOCKED_PATTERN_SRC, 'gi'), (match) => '●'.repeat(match.length));
}
