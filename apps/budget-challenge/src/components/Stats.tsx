import { useMemo, useState } from 'react';
import type { Challenge, Expense, Badge } from '../types';
import { CATEGORIES, ALL_BADGES, formatAmount } from '../types';
import AdButton from './AdButton';

interface StatsProps {
  challenges: Challenge[];
  expenses: Expense[];
  badges: Badge[];
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[d.getDay()];
}

function getLast7Days(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export default function Stats({ challenges, expenses, badges }: StatsProps) {
  const [showDetailedTips, setShowDetailedTips] = useState(false);

  // Category breakdown
  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    const max = Math.max(1, ...totals.values());
    return CATEGORIES.map((cat) => ({
      name: cat.name,
      emoji: cat.emoji,
      amount: totals.get(cat.name) ?? 0,
      percent: ((totals.get(cat.name) ?? 0) / max) * 100,
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Daily spending for last 7 days
  const dailyData = useMemo(() => {
    const last7 = getLast7Days();
    const dailyTotals = new Map<string, number>();
    for (const e of expenses) {
      if (last7.includes(e.date)) {
        dailyTotals.set(e.date, (dailyTotals.get(e.date) ?? 0) + e.amount);
      }
    }
    const max = Math.max(1, ...Array.from(dailyTotals.values()));
    return last7.map((date) => ({
      date,
      label: getDayLabel(date),
      amount: dailyTotals.get(date) ?? 0,
      heightPercent: ((dailyTotals.get(date) ?? 0) / max) * 100,
    }));
  }, [expenses]);

  // Challenge history (completed only)
  const history = useMemo(
    () => challenges.filter((c) => c.status !== 'active').reverse(),
    [challenges],
  );

  // Badge check
  const isBadgeUnlocked = (badgeId: string): boolean =>
    badges.some((b) => b.id === badgeId);

  const totalSaved = useMemo(() => {
    return challenges
      .filter((c) => c.status === 'success')
      .reduce((sum, c) => {
        const spent = expenses
          .filter((e) => e.challengeId === c.id)
          .reduce((s, e) => s + e.amount, 0);
        return sum + (c.budget - spent);
      }, 0);
  }, [challenges, expenses]);

  // Detailed tips content
  const tips = useMemo(() => {
    if (categoryData.length === 0) return [];
    const top = categoryData[0];
    const result = [];
    if (top.amount > 0) {
      result.push(`가장 많이 쓰는 카테고리는 "${top.emoji} ${top.name}"이에요. 이 카테고리를 10%만 줄여도 ${formatAmount(Math.round(top.amount * 0.1))}을 절약할 수 있어요.`);
    }
    const avgDaily = dailyData.reduce((s, d) => s + d.amount, 0) / 7;
    if (avgDaily > 0) {
      result.push(`일평균 지출은 ${formatAmount(Math.round(avgDaily))}이에요.`);
    }
    const successRate = challenges.length > 0
      ? Math.round((challenges.filter((c) => c.status === 'success').length / challenges.filter((c) => c.status !== 'active').length) * 100) || 0
      : 0;
    result.push(`도전 성공률: ${successRate}%`);
    return result;
  }, [categoryData, dailyData, challenges]);

  return (
    <div>
      {/* Category breakdown */}
      <div className="card">
        <div className="card-title">카테고리별 지출</div>
        {categoryData.every((c) => c.amount === 0) ? (
          <div className="empty-state">
            <div className="emoji">📊</div>
            <p>아직 지출 기록이 없어요</p>
          </div>
        ) : (
          <div className="bar-chart">
            {categoryData
              .filter((c) => c.amount > 0)
              .map((cat) => (
                <div key={cat.name} className="bar-row">
                  <span className="bar-label">
                    {cat.emoji} {cat.name}
                  </span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${cat.percent}%` }} />
                  </div>
                  <span className="bar-value">{formatAmount(cat.amount)}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Daily trend */}
      <div className="card">
        <div className="card-title">최근 7일 지출</div>
        <div className="daily-chart">
          {dailyData.map((day) => (
            <div key={day.date} className="daily-bar-wrapper">
              <span className="daily-bar-amount">
                {day.amount > 0 ? `${Math.round(day.amount / 1000)}k` : ''}
              </span>
              <div
                className="daily-bar"
                style={{ height: `${Math.max(2, day.heightPercent)}%` }}
              />
              <span className="daily-bar-label">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge history */}
      <div className="card">
        <div className="card-title">도전 히스토리</div>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🏆</div>
            <p>완료된 도전이 없어요</p>
          </div>
        ) : (
          history.map((ch) => {
            const spent = expenses
              .filter((e) => e.challengeId === ch.id)
              .reduce((s, e) => s + e.amount, 0);
            return (
              <div key={ch.id} className="history-item">
                <span className="history-status">
                  {ch.status === 'success' ? '✅' : '❌'}
                </span>
                <div className="history-info">
                  <div className="title">
                    {ch.type === 'weekly' ? '주간' : '월간'} 도전 ({formatAmount(ch.budget)})
                  </div>
                  <div className="date">
                    {ch.startDate} ~ {ch.endDate}
                  </div>
                </div>
                <span className={`history-amount ${ch.status}`}>
                  {formatAmount(spent)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Badges */}
      <div className="card">
        <div className="card-title">배지 컬렉션</div>
        <div className="badges-grid">
          {ALL_BADGES.map((badge) => {
            const unlocked = isBadgeUnlocked(badge.id);
            return (
              <div
                key={badge.id}
                className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="badge-emoji">{badge.emoji}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-desc">{badge.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total saved */}
      {totalSaved > 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title">총 절약 금액</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
            {formatAmount(totalSaved)}
          </div>
        </div>
      )}

      {/* Ad for detailed tips */}
      <div className="card">
        <div className="card-title">상세 분석</div>
        {showDetailedTips ? (
          <div>
            {tips.map((tip, i) => (
              <p key={i} style={{ fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
                💡 {tip}
              </p>
            ))}
          </div>
        ) : (
          <AdButton
            label="광고 보고 상세 분석 보기"
            onReward={() => setShowDetailedTips(true)}
          />
        )}
      </div>
    </div>
  );
}
