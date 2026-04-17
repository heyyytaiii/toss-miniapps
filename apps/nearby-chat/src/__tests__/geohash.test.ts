import { expect, test } from 'vitest';
import { encodeGeohash } from '../lib/geohash';

test('같은 좌표는 같은 geohash를 반환한다', () => {
  const hash1 = encodeGeohash(37.5665, 126.978);
  const hash2 = encodeGeohash(37.5665, 126.978);
  expect(hash1).toBe(hash2);
});

test('가까운 좌표는 같은 geohash prefix를 공유한다', () => {
  // ~50m 차이
  const hash1 = encodeGeohash(37.5665, 126.978);
  const hash2 = encodeGeohash(37.5666, 126.978);
  expect(hash1.substring(0, 5)).toBe(hash2.substring(0, 5));
});

test('geohash 길이는 precision에 따라 결정된다', () => {
  expect(encodeGeohash(37.5665, 126.978, 5)).toHaveLength(5);
  expect(encodeGeohash(37.5665, 126.978, 7)).toHaveLength(7);
});
