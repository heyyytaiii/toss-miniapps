import { expect, test, beforeEach } from 'vitest';
import { getUserId, getNickname, setNickname, getBlockedUsers, addBlockedUser } from '../lib/storage';

beforeEach(() => {
  localStorage.clear();
});

test('getUserId는 고유 ID를 생성하고 유지한다', () => {
  const id1 = getUserId();
  const id2 = getUserId();
  expect(id1).toBe(id2);
  expect(id1).toBeTruthy();
});

test('닉네임을 저장하고 불러온다', () => {
  expect(getNickname()).toBeNull();
  setNickname('테스트유저');
  expect(getNickname()).toBe('테스트유저');
});

test('차단 유저를 추가하고 조회한다', () => {
  expect(getBlockedUsers()).toEqual([]);
  addBlockedUser('user-1');
  addBlockedUser('user-2');
  addBlockedUser('user-1'); // duplicate
  expect(getBlockedUsers()).toEqual(['user-1', 'user-2']);
});
