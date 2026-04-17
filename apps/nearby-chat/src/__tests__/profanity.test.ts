import { expect, test } from 'vitest';
import { containsProfanity, filterProfanity } from '../lib/profanity';

test('욕설이 포함된 텍스트를 감지한다', () => {
  expect(containsProfanity('안녕하세요')).toBe(false);
  expect(containsProfanity('시발 뭐야')).toBe(true);
  expect(containsProfanity('fuck you')).toBe(true);
});

test('욕설을 마스킹 처리한다', () => {
  expect(filterProfanity('안녕하세요')).toBe('안녕하세요');
  expect(filterProfanity('시발 뭐야')).toBe('●● 뭐야');
});
