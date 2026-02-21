export interface Challenge {
  id: string;
  type: 'weekly' | 'monthly';
  budget: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'success' | 'failed';
}

export interface Expense {
  id: string;
  challengeId: string;
  amount: number;
  category: string;
  memo?: string;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
}

export type TabType = 'challenge' | 'record' | 'stats';

export const CATEGORIES = [
  { name: '식비', emoji: '🍚' },
  { name: '카페', emoji: '☕' },
  { name: '교통', emoji: '🚌' },
  { name: '쇼핑', emoji: '🛍️' },
  { name: '문화', emoji: '🎬' },
  { name: '기타', emoji: '📦' },
] as const;

export const ALL_BADGES: Badge[] = [
  { id: 'first-challenge', name: '첫 도전', emoji: '🌱', description: '첫 번째 도전을 완료했어요' },
  { id: 'streak-3', name: '3연속 성공', emoji: '🔥', description: '3번 연속 도전에 성공했어요' },
  { id: 'saved-100k', name: '10만원 절약', emoji: '💎', description: '총 10만원을 절약했어요' },
  { id: 'master', name: '절약왕', emoji: '👑', description: '5회 이상 도전에 성공했어요' },
];

export function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getEndDate(type: 'weekly' | 'monthly', startDate: string): string {
  const start = new Date(startDate);
  if (type === 'weekly') {
    start.setDate(start.getDate() + 6);
  } else {
    start.setMonth(start.getMonth() + 1);
    start.setDate(start.getDate() - 1);
  }
  return start.toISOString().split('T')[0];
}
