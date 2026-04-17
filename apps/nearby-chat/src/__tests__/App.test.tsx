import { render, screen } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null }) }) }),
      upsert: () => ({}),
      update: () => ({ eq: () => ({}) }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  },
  isSupabaseConfigured: false,
}));

beforeEach(() => {
  localStorage.clear();
});

test('닉네임이 없으면 닉네임 입력 화면을 보여준다', () => {
  render(<App />);
  expect(screen.getByText('반가워요!')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('닉네임 (2~10자)')).toBeInTheDocument();
});
