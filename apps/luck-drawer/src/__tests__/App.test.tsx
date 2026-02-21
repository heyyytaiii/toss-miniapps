import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from '../App';

test('앱이 정상 렌더링된다', () => {
  render(<App />);
  expect(screen.getByText('랜덤 추첨기')).toBeInTheDocument();
});

test('탭 네비게이션이 렌더링된다', () => {
  render(<App />);
  expect(screen.getByRole('tab', { name: '룰렛' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: '사다리' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: '제비뽑기' })).toBeInTheDocument();
});

test('기본 탭은 룰렛이다', () => {
  render(<App />);
  const rouletteTab = screen.getByRole('tab', { name: '룰렛' });
  expect(rouletteTab).toHaveAttribute('aria-selected', 'true');
});

test('룰렛 탭에 항목 추가 UI가 표시된다', () => {
  render(<App />);
  expect(screen.getByPlaceholderText('항목을 입력하세요')).toBeInTheDocument();
  expect(screen.getByText('돌려!')).toBeInTheDocument();
});
