import { useState, useMemo } from 'react';
import type { Challenge as ChallengeType, Expense } from '../types';
import { formatAmount, generateId, getToday, getEndDate, getDaysRemaining } from '../types';

interface ChallengeProps {
  challenge: ChallengeType | null;
  expenses: Expense[];
  onStartChallenge: (challenge: ChallengeType) => void;
  onCompleteChallenge: (status: 'success' | 'failed') => void;
  onNewChallenge: () => void;
}

function getMotivation(percent: number, daysLeft: number): string {
  if (percent >= 100) return '예산을 초과했어요... 다음엔 꼭 성공해봐요!';
  if (percent >= 80) return '조금만 더 아껴보세요! 거의 다 썼어요 😰';
  if (percent >= 60) return '절반 넘었어요! 조금만 더 절약해봐요 💪';
  if (percent >= 40) return '잘 하고 있어요! 이 속도면 성공이에요 ✨';
  if (daysLeft <= 1) return '마지막 날이에요! 조금만 참아봐요 🎯';
  return '훌륭해요! 절약 습관이 잡히고 있어요 🌟';
}

export default function Challenge({
  challenge,
  expenses,
  onStartChallenge,
  onCompleteChallenge,
  onNewChallenge,
}: ChallengeProps) {
  const [challengeType, setChallengeType] = useState<'weekly' | 'monthly'>('weekly');
  const [budgetInput, setBudgetInput] = useState('');

  const totalSpent = useMemo(() => {
    if (!challenge) return 0;
    return expenses
      .filter((e) => e.challengeId === challenge.id)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [challenge, expenses]);

  const remaining = challenge ? challenge.budget - totalSpent : 0;
  const percent = challenge ? Math.min(100, (totalSpent / challenge.budget) * 100) : 0;
  const daysLeft = challenge ? getDaysRemaining(challenge.endDate) : 0;

  const progressClass = percent >= 90 ? 'danger' : percent >= 70 ? 'warning' : '';

  const handleStart = () => {
    const amount = parseInt(budgetInput, 10);
    if (!amount || amount <= 0) return;
    const today = getToday();
    const newChallenge: ChallengeType = {
      id: generateId(),
      type: challengeType,
      budget: amount * 10000,
      startDate: today,
      endDate: getEndDate(challengeType, today),
      status: 'active',
    };
    onStartChallenge(newChallenge);
    setBudgetInput('');
  };

  const handleShare = () => {
    const text = challenge
      ? `절약 도전 성공! ${formatAmount(challenge.budget)} 예산으로 ${formatAmount(totalSpent)}만 사용했어요! 🎉`
      : '';
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  // Check if challenge ended
  if (challenge?.status === 'active' && daysLeft === 0) {
    const isSuccess = totalSpent <= challenge.budget;
    onCompleteChallenge(isSuccess ? 'success' : 'failed');
  }

  // Success state
  if (challenge?.status === 'success') {
    return (
      <div>
        <div className="card celebration">
          <div className="celebration-emoji">🎉</div>
          <h2>도전 성공!</h2>
          <p>
            {formatAmount(challenge.budget)} 예산에서 {formatAmount(totalSpent)}만 사용했어요!
            <br />
            {formatAmount(remaining)} 절약에 성공했어요!
          </p>
          <button className="share-btn" onClick={handleShare} type="button">
            📤 결과 공유하기
          </button>
          <button className="new-challenge-btn" onClick={onNewChallenge} type="button">
            새로운 도전 시작하기
          </button>
        </div>
      </div>
    );
  }

  // Failed state
  if (challenge?.status === 'failed') {
    return (
      <div>
        <div className="card celebration">
          <div className="celebration-emoji">😢</div>
          <h2>아쉽지만 다음에!</h2>
          <p>
            {formatAmount(challenge.budget)} 예산에서 {formatAmount(totalSpent)}을 사용했어요.
            <br />
            다음엔 꼭 성공할 수 있을 거예요!
          </p>
          <button className="new-challenge-btn" onClick={onNewChallenge} type="button">
            다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  // Active challenge
  if (challenge?.status === 'active') {
    return (
      <div>
        <div className="challenge-header">
          <h1>
            {challenge.type === 'weekly' ? '주간' : '월간'} 절약 도전 중!
          </h1>
          <p>{formatAmount(challenge.budget)} 목표</p>
        </div>

        <div className="card progress-card">
          <div className="progress-label">남은 예산</div>
          <div className={`progress-amount ${progressClass}`}>
            {formatAmount(Math.max(0, remaining))}
          </div>
          <div className="progress-sub">
            {formatAmount(totalSpent)} 사용 / {formatAmount(challenge.budget)} 중
          </div>

          <div className="progress-bar-container">
            <div
              className={`progress-bar-fill ${progressClass}`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
          <div className="progress-info">
            <span>{Math.round(percent)}% 사용</span>
            <span>{Math.round(100 - percent)}% 남음</span>
          </div>

          <div className="days-remaining">
            <span className="number">{daysLeft}</span>
            <span className="label">일 남음</span>
          </div>

          <div className="motivation">{getMotivation(percent, daysLeft)}</div>
        </div>
      </div>
    );
  }

  // Setup new challenge
  return (
    <div>
      <div className="challenge-header">
        <h1>절약 도전 시작하기</h1>
        <p>목표 예산을 설정하고 도전을 시작하세요!</p>
      </div>

      <div className="card challenge-setup">
        <div className="type-selector">
          <button
            className={`type-btn ${challengeType === 'weekly' ? 'selected' : ''}`}
            onClick={() => setChallengeType('weekly')}
            type="button"
          >
            📅 주간 도전
          </button>
          <button
            className={`type-btn ${challengeType === 'monthly' ? 'selected' : ''}`}
            onClick={() => setChallengeType('monthly')}
            type="button"
          >
            🗓️ 월간 도전
          </button>
        </div>

        <div className="budget-input-group">
          <label htmlFor="budget-amount">
            {challengeType === 'weekly'
              ? '이번 주 얼마로 살아볼까요?'
              : '이번 달 얼마로 살아볼까요?'}
          </label>
          <div className="budget-input-row">
            <input
              id="budget-amount"
              className="budget-input"
              type="number"
              inputMode="numeric"
              placeholder="5"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            />
            <span className="budget-unit">만원</span>
          </div>
        </div>

        <button
          className="start-btn"
          onClick={handleStart}
          disabled={!budgetInput || parseInt(budgetInput, 10) <= 0}
          type="button"
        >
          {budgetInput
            ? `${formatAmount(parseInt(budgetInput, 10) * 10000)} 도전 시작!`
            : '금액을 입력하세요'}
        </button>
      </div>
    </div>
  );
}
