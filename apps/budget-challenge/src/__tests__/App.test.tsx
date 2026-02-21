import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import App from '../App';

// Mock @apps-in-toss/web-framework to prevent WebView errors
vi.mock('@apps-in-toss/web-framework', () => ({
  GoogleAdMob: {
    loadAppsInTossAdMob: vi.fn(),
    showAppsInTossAdMob: vi.fn(),
  },
}));

// Mock localStorage
const store: Record<string, string> = {};
beforeEach(() => {
  Object.keys(store).forEach((key) => delete store[key]);
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => store[key] ?? null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
    store[key] = value;
  });
});

describe('App', () => {
  test('앱이 탭 네비게이션과 함께 렌더링된다', () => {
    render(<App />);
    expect(screen.getByText('도전')).toBeInTheDocument();
    expect(screen.getByText('기록')).toBeInTheDocument();
    expect(screen.getByText('통계')).toBeInTheDocument();
  });

  test('도전 탭에 예산 설정 UI가 표시된다', () => {
    render(<App />);
    expect(screen.getByText('절약 도전 시작하기')).toBeInTheDocument();
    expect(screen.getByText(/주간 도전/)).toBeInTheDocument();
    expect(screen.getByText(/월간 도전/)).toBeInTheDocument();
  });

  test('탭 전환이 동작한다', () => {
    render(<App />);

    // Default: challenge tab
    expect(screen.getByText('절약 도전 시작하기')).toBeInTheDocument();

    // Switch to record tab
    fireEvent.click(screen.getByText('기록'));
    expect(screen.getByText(/진행 중인 도전이 없어요/)).toBeInTheDocument();

    // Switch to stats tab
    fireEvent.click(screen.getByText('통계'));
    expect(screen.getByText('카테고리별 지출')).toBeInTheDocument();
    expect(screen.getByText('배지 컬렉션')).toBeInTheDocument();

    // Switch back to challenge
    fireEvent.click(screen.getByText('도전'));
    expect(screen.getByText('절약 도전 시작하기')).toBeInTheDocument();
  });

  test('예산 금액 입력이 가능하다', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('5') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10' } });
    expect(input.value).toBe('10');
    expect(screen.getByText('100,000원 도전 시작!')).toBeInTheDocument();
  });
});
