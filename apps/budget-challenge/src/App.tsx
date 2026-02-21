import { useState, useCallback, useEffect } from 'react';
import type { Challenge as ChallengeType, Expense, Badge, TabType } from './types';
import { ALL_BADGES, getToday } from './types';
import { useStorage } from './hooks/useStorage';
import ChallengeTab from './components/Challenge';
import ExpenseRecord from './components/ExpenseRecord';
import Stats from './components/Stats';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('challenge');
  const [challenges, setChallenges] = useStorage<ChallengeType[]>('challenges', []);
  const [expenses, setExpenses] = useStorage<Expense[]>('expenses', []);
  const [badges, setBadges] = useStorage<Badge[]>('badges', []);

  const activeChallenge = challenges.find((c) => c.status === 'active') ?? null;

  // Badge evaluation
  const checkBadges = useCallback(
    (updatedChallenges: ChallengeType[], updatedExpenses: Expense[]) => {
      const newBadges = [...badges];
      const hasBadge = (id: string) => newBadges.some((b) => b.id === id);
      const completedChallenges = updatedChallenges.filter((c) => c.status === 'success');

      // First challenge completed
      if (!hasBadge('first-challenge') && completedChallenges.length >= 1) {
        const badge = ALL_BADGES.find((b) => b.id === 'first-challenge')!;
        newBadges.push({ ...badge, unlockedAt: getToday() });
      }

      // 3 consecutive successes
      if (!hasBadge('streak-3') && updatedChallenges.length >= 3) {
        const finished = updatedChallenges.filter((c) => c.status !== 'active');
        const last3 = finished.slice(-3);
        if (last3.length === 3 && last3.every((c) => c.status === 'success')) {
          const badge = ALL_BADGES.find((b) => b.id === 'streak-3')!;
          newBadges.push({ ...badge, unlockedAt: getToday() });
        }
      }

      // Saved 100k total
      if (!hasBadge('saved-100k')) {
        const totalSaved = completedChallenges.reduce((sum, c) => {
          const spent = updatedExpenses
            .filter((e) => e.challengeId === c.id)
            .reduce((s, e) => s + e.amount, 0);
          return sum + Math.max(0, c.budget - spent);
        }, 0);
        if (totalSaved >= 100000) {
          const badge = ALL_BADGES.find((b) => b.id === 'saved-100k')!;
          newBadges.push({ ...badge, unlockedAt: getToday() });
        }
      }

      // Master: 5+ successes
      if (!hasBadge('master') && completedChallenges.length >= 5) {
        const badge = ALL_BADGES.find((b) => b.id === 'master')!;
        newBadges.push({ ...badge, unlockedAt: getToday() });
      }

      if (newBadges.length !== badges.length) {
        setBadges(newBadges);
      }
    },
    [badges, setBadges],
  );

  // Auto-check expired challenges on mount
  useEffect(() => {
    const today = new Date(getToday());
    let changed = false;
    const updated = challenges.map((c) => {
      if (c.status === 'active') {
        const end = new Date(c.endDate);
        end.setHours(23, 59, 59);
        if (today > end) {
          const spent = expenses
            .filter((e) => e.challengeId === c.id)
            .reduce((s, e) => s + e.amount, 0);
          changed = true;
          return { ...c, status: (spent <= c.budget ? 'success' : 'failed') as ChallengeType['status'] };
        }
      }
      return c;
    });
    if (changed) {
      setChallenges(updated);
      checkBadges(updated, expenses);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartChallenge = useCallback(
    (challenge: ChallengeType) => {
      setChallenges((prev) => [...prev, challenge]);
    },
    [setChallenges],
  );

  const handleCompleteChallenge = useCallback(
    (status: 'success' | 'failed') => {
      setChallenges((prev) => {
        const updated = prev.map((c) =>
          c.status === 'active' ? { ...c, status } : c,
        );
        checkBadges(updated, expenses);
        return updated;
      });
    },
    [setChallenges, checkBadges, expenses],
  );

  const handleNewChallenge = useCallback(() => {
    // Just reset active tab to show setup form (active challenge already completed)
    setActiveTab('challenge');
  }, []);

  const handleAddExpense = useCallback(
    (expense: Expense) => {
      setExpenses((prev) => {
        const updated = [...prev, expense];
        return updated;
      });
    },
    [setExpenses],
  );

  const handleDeleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [setExpenses],
  );

  return (
    <div className="app-container">
      <div className="tab-content">
        {activeTab === 'challenge' && (
          <ChallengeTab
            challenge={activeChallenge}
            expenses={expenses}
            onStartChallenge={handleStartChallenge}
            onCompleteChallenge={handleCompleteChallenge}
            onNewChallenge={handleNewChallenge}
          />
        )}
        {activeTab === 'record' && (
          <ExpenseRecord
            challenge={activeChallenge}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
        {activeTab === 'stats' && (
          <Stats
            challenges={challenges}
            expenses={expenses}
            badges={badges}
          />
        )}
      </div>

      <nav className="bottom-tabs">
        <button
          className={`tab-button ${activeTab === 'challenge' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenge')}
          type="button"
        >
          <span className="tab-icon">🎯</span>
          도전
        </button>
        <button
          className={`tab-button ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => setActiveTab('record')}
          type="button"
        >
          <span className="tab-icon">📝</span>
          기록
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
          type="button"
        >
          <span className="tab-icon">📊</span>
          통계
        </button>
      </nav>
    </div>
  );
}

export default App;
