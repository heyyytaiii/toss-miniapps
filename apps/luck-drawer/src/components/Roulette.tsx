import React, { useCallback, useRef, useState } from 'react';
import AdButton from './AdButton';

const SEGMENT_COLORS = [
  '#6B4EE6', '#E94560', '#4ECB71', '#FFD93D',
  '#00D2FF', '#FF8C42', '#FF6B9D', '#8B74F0',
  '#2ECC71', '#E74C3C', '#F39C12', '#1ABC9C',
];

const DEFAULT_ITEMS = ['항목 1', '항목 2'];

export default function Roulette() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [inputValue, setInputValue] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [extraSpins, setExtraSpins] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addItem = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || items.length >= 12) return;
    setItems((prev) => [...prev, trimmed]);
    setInputValue('');
  }, [inputValue, items.length]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') addItem();
    },
    [addItem],
  );

  const spin = useCallback(() => {
    if (spinning || items.length < 2) return;

    setResult(null);
    setSpinning(true);

    const segAngle = 360 / items.length;
    const randomIndex = Math.floor(Math.random() * items.length);
    // We want the pointer (top center) to land on the chosen segment
    // Segment i is centered at i * segAngle degrees
    const targetAngle = 360 - randomIndex * segAngle - segAngle / 2;
    const totalRotation = rotation + 360 * 5 + targetAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(items[randomIndex]);
    }, 4100);
  }, [spinning, items, rotation]);

  const closeResult = useCallback(() => {
    setResult(null);
  }, []);

  const handleAdReward = useCallback(() => {
    setExtraSpins((p) => p + 3);
  }, []);

  const canSpin = items.length >= 2 && !spinning;
  const totalSpins = extraSpins; // track extra spins granted by ads

  // Build SVG segments
  const segAngle = items.length > 0 ? 360 / items.length : 360;
  const segments = items.map((item, i) => {
    const startAngle = i * segAngle;
    const endAngle = startAngle + segAngle;
    const startRad = (Math.PI / 180) * (startAngle - 90);
    const endRad = (Math.PI / 180) * (endAngle - 90);
    const x1 = 140 + 140 * Math.cos(startRad);
    const y1 = 140 + 140 * Math.sin(startRad);
    const x2 = 140 + 140 * Math.cos(endRad);
    const y2 = 140 + 140 * Math.sin(endRad);
    const largeArc = segAngle > 180 ? 1 : 0;

    const midRad = (Math.PI / 180) * ((startAngle + endAngle) / 2 - 90);
    const textX = 140 + 85 * Math.cos(midRad);
    const textY = 140 + 85 * Math.sin(midRad);
    const textRotation = (startAngle + endAngle) / 2;

    const path =
      items.length === 1
        ? `M140,0 A140,140 0 1,1 139.99,0 Z`
        : `M140,140 L${x1},${y1} A140,140 0 ${largeArc},1 ${x2},${y2} Z`;

    return (
      <g key={i}>
        <path d={path} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
        <text
          x={textX}
          y={textY}
          fill="white"
          fontSize={items.length > 8 ? 10 : 12}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${textRotation}, ${textX}, ${textY})`}
        >
          {item.length > 6 ? item.slice(0, 6) + '..' : item}
        </text>
      </g>
    );
  });

  return (
    <div>
      {/* Item input */}
      <div className="card">
        <div className="card-title">항목 추가 ({items.length}/12)</div>
        <div className="input-row">
          <input
            className="input-field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="항목을 입력하세요"
            maxLength={20}
            disabled={items.length >= 12}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={addItem}
            disabled={!inputValue.trim() || items.length >= 12}
          >
            추가
          </button>
        </div>
        <div className="chip-list">
          {items.map((item, i) => (
            <span className="chip" key={i} style={{ borderLeft: `3px solid ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}` }}>
              {item}
              <button className="chip-remove" onClick={() => removeItem(i)}>
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Wheel */}
      <div className="roulette-wrapper">
        <div className="roulette-stage">
          <div className="roulette-pointer">&#9660;</div>
          <div
            ref={wheelRef}
            className={`roulette-wheel ${spinning ? 'spinning' : ''}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 280 280" width="280" height="280">
              {segments}
            </svg>
          </div>
          <div className="roulette-center" />
        </div>

        <button className="btn btn-spin" onClick={spin} disabled={!canSpin}>
          {spinning ? '돌아가는 중...' : '돌려!'}
        </button>

        {totalSpins > 0 && (
          <p style={{ fontSize: 13, color: 'var(--accent-yellow)', textAlign: 'center' }}>
            추가 기회 {totalSpins}회 남음
          </p>
        )}

        <AdButton onReward={handleAdReward} label="광고 보고 추가 3회 받기" />
      </div>

      {/* Result overlay */}
      {result && (
        <div className="overlay" onClick={closeResult}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <div className="overlay-emoji">🎯</div>
            <div className="overlay-title">결과</div>
            <div className="overlay-subtitle">룰렛이 가리킨 항목은...</div>
            <div className="overlay-result">{result}</div>
            <button className="btn btn-primary btn-block" onClick={closeResult}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
