import { useState, useMemo } from 'react';
import type { Challenge, Expense } from '../types';
import { CATEGORIES, formatAmount, generateId, getToday } from '../types';

interface ExpenseRecordProps {
  challenge: Challenge | null;
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpenseRecord({
  challenge,
  expenses,
  onAddExpense,
  onDeleteExpense,
}: ExpenseRecordProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');

  const today = getToday();

  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today],
  );

  const challengeTotal = useMemo(() => {
    if (!challenge) return 0;
    return expenses
      .filter((e) => e.challengeId === challenge.id)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [challenge, expenses]);

  const todayTotal = useMemo(
    () => todayExpenses.reduce((sum, e) => sum + e.amount, 0),
    [todayExpenses],
  );

  const getCategoryEmoji = (name: string): string => {
    return CATEGORIES.find((c) => c.name === name)?.emoji ?? '📦';
  };

  const handleAdd = () => {
    const num = parseInt(amount, 10);
    if (!num || num <= 0 || !category) return;

    const expense: Expense = {
      id: generateId(),
      challengeId: challenge?.id ?? '',
      amount: num,
      category,
      memo: memo || undefined,
      date: today,
    };
    onAddExpense(expense);
    setAmount('');
    setMemo('');
  };

  if (!challenge || challenge.status !== 'active') {
    return (
      <div>
        <div className="no-challenge-banner">
          <p>진행 중인 도전이 없어요.<br />도전 탭에서 새 도전을 시작하세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Running total */}
      <div className="running-total">
        <div className="label">이번 도전 총 지출</div>
        <div className="amount">
          {formatAmount(challengeTotal)} / {formatAmount(challenge.budget)}
        </div>
      </div>

      {/* Input card */}
      <div className="card expense-input-card">
        <input
          className="amount-input-large"
          type="number"
          inputMode="numeric"
          placeholder="금액 입력 (원)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`category-chip ${category === cat.name ? 'selected' : ''}`}
              onClick={() => setCategory(cat.name)}
              type="button"
            >
              <span className="emoji">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <input
          className="memo-input"
          type="text"
          placeholder="메모 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <button
          className="add-expense-btn"
          onClick={handleAdd}
          disabled={!amount || parseInt(amount, 10) <= 0 || !category}
          type="button"
        >
          지출 기록하기
        </button>
      </div>

      {/* Today's expenses */}
      <div className="card">
        <div className="expense-list-header">
          <h3>오늘의 지출</h3>
          <span className="expense-list-total">{formatAmount(todayTotal)}</span>
        </div>

        {todayExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🎯</div>
            <p>오늘은 아직 지출이 없어요!<br />절약 중이시군요! 💚</p>
          </div>
        ) : (
          todayExpenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <span className="expense-category-icon">
                {getCategoryEmoji(expense.category)}
              </span>
              <div className="expense-info">
                <div className="name">{expense.category}</div>
                {expense.memo && <div className="memo">{expense.memo}</div>}
              </div>
              <span className="expense-amount">{formatAmount(expense.amount)}</span>
              <button
                className="delete-btn"
                onClick={() => onDeleteExpense(expense.id)}
                type="button"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
