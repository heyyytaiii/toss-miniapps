import React, { useCallback, useRef, useState } from 'react';
import AdButton from './AdButton';

const DEFAULT_ITEMS = ['항목 1', '항목 2', '항목 3'];

export default function RandomDraw() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [inputValue, setInputValue] = useState('');
  const [drawCount, setDrawCount] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [shuffleDisplay, setShuffleDisplay] = useState<string>('');
  const [results, setResults] = useState<string[]>([]);
  const [extraDraws, setExtraDraws] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addItem = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, trimmed]);
    setInputValue('');
  }, [inputValue]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') addItem();
    },
    [addItem],
  );

  const doDraw = useCallback(() => {
    if (drawing || items.length === 0) return;

    const count = Math.min(drawCount, items.length);
    setDrawing(true);
    setResults([]);

    // Shuffle animation
    let tick = 0;
    const totalTicks = 20;
    timerRef.current = setInterval(() => {
      tick++;
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setShuffleDisplay(randomItem);

      if (tick >= totalTicks) {
        if (timerRef.current) clearInterval(timerRef.current);

        // Pick unique random results
        const pool = [...items];
        const picked: string[] = [];
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * pool.length);
          picked.push(pool[idx]);
          pool.splice(idx, 1);
        }

        setResults(picked);
        setShuffleDisplay('');
        setDrawing(false);
      }
    }, 80);
  }, [drawing, items, drawCount]);

  const handleAdReward = useCallback(() => {
    setExtraDraws((p) => p + 3);
  }, []);

  const canDraw = items.length > 0 && !drawing;

  return (
    <div>
      {/* Item input */}
      <div className="card">
        <div className="card-title">항목 추가</div>
        <div className="input-row">
          <input
            className="input-field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="항목을 입력하세요"
            maxLength={30}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={addItem}
            disabled={!inputValue.trim()}
          >
            추가
          </button>
        </div>
        <div className="chip-list">
          {items.map((item, i) => (
            <span className="chip" key={i}>
              {item}
              <button className="chip-remove" onClick={() => removeItem(i)}>
                &times;
              </button>
            </span>
          ))}
        </div>
        {items.length === 0 && (
          <div className="empty-state">
            <div className="icon">📝</div>
            <div>항목을 추가해주세요</div>
          </div>
        )}
      </div>

      {/* Draw count selector */}
      {items.length > 1 && (
        <div className="card">
          <div className="card-title">뽑기 개수</div>
          <div className="draw-count-selector">
            <button
              className="draw-count-btn"
              onClick={() => setDrawCount((c) => Math.max(1, c - 1))}
            >
              -
            </button>
            <span className="draw-count-value">{drawCount}</span>
            <button
              className="draw-count-btn"
              onClick={() => setDrawCount((c) => Math.min(items.length, c + 1))}
            >
              +
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              / {items.length}개 중
            </span>
          </div>
        </div>
      )}

      {/* Display area */}
      <div className="draw-display">
        {drawing && shuffleDisplay && (
          <div className="draw-shuffling">{shuffleDisplay}</div>
        )}
        {!drawing && results.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            아래 버튼을 눌러 추첨하세요
          </div>
        )}
        {!drawing && results.length === 1 && (
          <div className="draw-result">{results[0]}</div>
        )}
        {!drawing && results.length > 1 && (
          <div className="draw-multi-results">
            {results.map((r, i) => (
              <span className="chip" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                {r}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Draw button */}
      <button className="btn btn-spin" onClick={doDraw} disabled={!canDraw}>
        {drawing ? '추첨 중...' : `뽑기!`}
      </button>

      {extraDraws > 0 && (
        <p style={{ fontSize: 13, color: 'var(--accent-yellow)', textAlign: 'center', marginTop: 8 }}>
          추가 기회 {extraDraws}회 남음
        </p>
      )}

      <AdButton onReward={handleAdReward} label="광고 보고 추가 3회 받기" />
    </div>
  );
}
