import React, { useCallback, useMemo, useState } from 'react';
import AdButton from './AdButton';

interface LadderRung {
  fromCol: number;
  toCol: number;
  y: number;
}

const COLORS = ['#6B4EE6', '#E94560', '#4ECB71', '#FFD93D', '#00D2FF', '#FF8C42'];

function generateLadder(numCols: number): LadderRung[] {
  const rungs: LadderRung[] = [];
  const numRows = 8;
  const step = 1 / (numRows + 1);

  for (let row = 1; row <= numRows; row++) {
    const y = row * step;
    // For each pair of adjacent columns, randomly add a rung
    for (let col = 0; col < numCols - 1; col++) {
      if (Math.random() < 0.45) {
        rungs.push({ fromCol: col, toCol: col + 1, y });
      }
    }
  }

  // Make sure each column has at least one rung connection
  for (let col = 0; col < numCols - 1; col++) {
    const hasRung = rungs.some((r) => r.fromCol === col || r.toCol === col + 1);
    if (!hasRung) {
      const y = (Math.floor(Math.random() * numRows) + 1) * step;
      rungs.push({ fromCol: col, toCol: col + 1, y });
    }
  }

  return rungs.sort((a, b) => a.y - b.y);
}

function tracePath(startCol: number, rungs: LadderRung[], numCols: number): number[] {
  const path: number[] = [startCol];
  let currentCol = startCol;
  const sortedRungs = [...rungs].sort((a, b) => a.y - b.y);
  const visited = new Set<number>();

  for (let i = 0; i < sortedRungs.length; i++) {
    const rung = sortedRungs[i];
    if (visited.has(i)) continue;

    if (rung.fromCol === currentCol) {
      visited.add(i);
      currentCol = rung.toCol;
      path.push(currentCol);
    } else if (rung.toCol === currentCol) {
      visited.add(i);
      currentCol = rung.fromCol;
      path.push(currentCol);
    }
  }

  // Suppress unused parameter warning
  void numCols;

  return path;
}

export default function Ladder() {
  const [numParticipants, setNumParticipants] = useState(3);
  const [names, setNames] = useState<string[]>(['참가자1', '참가자2', '참가자3']);
  const [results, setResults] = useState<string[]>(['당첨', '꽝', '꽝']);
  const [rungs, setRungs] = useState<LadderRung[]>([]);
  const [started, setStarted] = useState(false);
  const [revealedPaths, setRevealedPaths] = useState<Map<number, number[]>>(new Map());
  const [finalResults, setFinalResults] = useState<Map<number, string>>(new Map());
  const [animatingCol, setAnimatingCol] = useState<number | null>(null);
  const [extraReveals, setExtraReveals] = useState(0);

  const updateCount = useCallback((delta: number) => {
    setNumParticipants((prev) => {
      const next = Math.min(6, Math.max(2, prev + delta));
      setNames((n) => {
        const arr = [...n];
        while (arr.length < next) arr.push(`참가자${arr.length + 1}`);
        return arr.slice(0, next);
      });
      setResults((r) => {
        const arr = [...r];
        while (arr.length < next) arr.push('꽝');
        return arr.slice(0, next);
      });
      return next;
    });
    setStarted(false);
    setRevealedPaths(new Map());
    setFinalResults(new Map());
  }, []);

  const setName = useCallback((i: number, val: string) => {
    setNames((prev) => {
      const arr = [...prev];
      arr[i] = val;
      return arr;
    });
  }, []);

  const setResultVal = useCallback((i: number, val: string) => {
    setResults((prev) => {
      const arr = [...prev];
      arr[i] = val;
      return arr;
    });
  }, []);

  const startGame = useCallback(() => {
    const newRungs = generateLadder(numParticipants);
    setRungs(newRungs);
    setStarted(true);
    setRevealedPaths(new Map());
    setFinalResults(new Map());
    setAnimatingCol(null);
  }, [numParticipants]);

  // Shuffle results for the bottom
  const shuffledResults = useMemo(() => {
    if (!started) return results;
    const arr = [...results];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, rungs]);

  const revealPath = useCallback(
    (col: number) => {
      if (animatingCol !== null || revealedPaths.has(col)) return;

      setAnimatingCol(col);
      const path = tracePath(col, rungs, numParticipants);
      const endCol = path[path.length - 1];

      // Animate path reveal step by step
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setRevealedPaths((prev) => {
          const next = new Map(prev);
          next.set(col, path.slice(0, step + 1));
          return next;
        });

        if (step >= path.length - 1) {
          clearInterval(interval);
          setFinalResults((prev) => {
            const next = new Map(prev);
            next.set(col, shuffledResults[endCol]);
            return next;
          });
          setAnimatingCol(null);
        }
      }, 300);
    },
    [animatingCol, revealedPaths, rungs, numParticipants, shuffledResults],
  );

  const handleAdReward = useCallback(() => {
    setExtraReveals((p) => p + 2);
  }, []);

  const reset = useCallback(() => {
    setStarted(false);
    setRevealedPaths(new Map());
    setFinalResults(new Map());
    setAnimatingCol(null);
  }, []);

  // SVG dimensions
  const svgW = 300;
  const svgH = 360;
  const padX = 40;
  const padY = 40;
  const drawW = svgW - padX * 2;
  const drawH = svgH - padY * 2;

  const colX = (col: number) => padX + (col / (numParticipants - 1)) * drawW;

  return (
    <div>
      {!started ? (
        <>
          {/* Setup */}
          <div className="card">
            <div className="card-title">참가자 수</div>
            <div className="draw-count-selector">
              <button className="draw-count-btn" onClick={() => updateCount(-1)}>-</button>
              <span className="draw-count-value">{numParticipants}</span>
              <button className="draw-count-btn" onClick={() => updateCount(1)}>+</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">참가자 이름</div>
            {names.slice(0, numParticipants).map((name, i) => (
              <div className="ladder-participant" key={i}>
                <span style={{ color: COLORS[i], fontWeight: 700, minWidth: 20 }}>{i + 1}</span>
                <input
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={`참가자 ${i + 1}`}
                  maxLength={10}
                />
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">결과 설정</div>
            {results.slice(0, numParticipants).map((r, i) => (
              <div className="ladder-participant" key={i}>
                <span style={{ color: 'var(--text-secondary)', minWidth: 20, fontSize: 13 }}>{i + 1}</span>
                <input
                  className="input-field"
                  value={r}
                  onChange={(e) => setResultVal(i, e.target.value)}
                  placeholder="결과"
                  maxLength={10}
                />
              </div>
            ))}
          </div>

          <button className="btn btn-spin" onClick={startGame}>
            사다리 만들기!
          </button>
        </>
      ) : (
        <>
          {/* Game board */}
          <div className="card" style={{ padding: 12 }}>
            <svg
              className="ladder-svg"
              viewBox={`0 0 ${svgW} ${svgH}`}
              width="100%"
            >
              {/* Vertical lines */}
              {Array.from({ length: numParticipants }).map((_, col) => (
                <line
                  key={`v${col}`}
                  x1={colX(col)}
                  y1={padY}
                  x2={colX(col)}
                  y2={padY + drawH}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={2}
                />
              ))}

              {/* Rungs */}
              {rungs.map((rung, i) => (
                <line
                  key={`r${i}`}
                  x1={colX(rung.fromCol)}
                  y1={padY + rung.y * drawH}
                  x2={colX(rung.toCol)}
                  y2={padY + rung.y * drawH}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={2}
                />
              ))}

              {/* Revealed paths */}
              {Array.from(revealedPaths.entries()).map(([startColIdx, path]) => {
                if (path.length < 2) return null;
                const points: string[] = [];
                let prevCol = path[0];
                points.push(`${colX(prevCol)},${padY}`);

                const rungsSorted = [...rungs].sort((a, b) => a.y - b.y);
                let rungIdx = 0;

                for (let p = 1; p < path.length; p++) {
                  const nextCol = path[p];
                  // Find the rung that caused this transition
                  while (rungIdx < rungsSorted.length) {
                    const rung = rungsSorted[rungIdx];
                    if (
                      (rung.fromCol === prevCol && rung.toCol === nextCol) ||
                      (rung.toCol === prevCol && rung.fromCol === nextCol)
                    ) {
                      const ry = padY + rung.y * drawH;
                      points.push(`${colX(prevCol)},${ry}`);
                      points.push(`${colX(nextCol)},${ry}`);
                      rungIdx++;
                      break;
                    }
                    rungIdx++;
                  }
                  prevCol = nextCol;
                }
                points.push(`${colX(prevCol)},${padY + drawH}`);

                return (
                  <polyline
                    key={`path-${startColIdx}`}
                    points={points.join(' ')}
                    fill="none"
                    stroke={COLORS[startColIdx % COLORS.length]}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

              {/* Top labels (names) */}
              {names.slice(0, numParticipants).map((name, i) => (
                <text
                  key={`n${i}`}
                  x={colX(i)}
                  y={padY - 12}
                  fill={COLORS[i]}
                  fontSize={11}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {name.length > 5 ? name.slice(0, 5) + '..' : name}
                </text>
              ))}

              {/* Bottom labels (results - hidden until revealed) */}
              {shuffledResults.slice(0, numParticipants).map((r, i) => {
                const isRevealed = Array.from(revealedPaths.values()).some(
                  (path) => path[path.length - 1] === i,
                );
                return (
                  <text
                    key={`r${i}`}
                    x={colX(i)}
                    y={padY + drawH + 20}
                    fill={isRevealed ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.3)'}
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isRevealed ? r : '?'}
                  </text>
                );
              })}

              {/* Clickable top circles */}
              {names.slice(0, numParticipants).map((_, i) => (
                <circle
                  key={`c${i}`}
                  cx={colX(i)}
                  cy={padY}
                  r={8}
                  fill={revealedPaths.has(i) ? COLORS[i] : 'var(--bg-card)'}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  style={{ cursor: revealedPaths.has(i) || animatingCol !== null ? 'default' : 'pointer' }}
                  onClick={() => revealPath(i)}
                />
              ))}
            </svg>
          </div>

          {/* Final results */}
          {finalResults.size > 0 && (
            <div className="card">
              <div className="card-title">결과</div>
              {Array.from(finalResults.entries()).map(([col, res]) => (
                <div className="ladder-result-item" key={col}>
                  <span className="name" style={{ color: COLORS[col % COLORS.length] }}>
                    {names[col]}
                  </span>
                  <span className="result">{res}</span>
                </div>
              ))}
            </div>
          )}

          {extraReveals > 0 && (
            <p style={{ fontSize: 13, color: 'var(--accent-yellow)', textAlign: 'center', marginBottom: 8 }}>
              추가 공개 {extraReveals}회 남음
            </p>
          )}

          <AdButton onReward={handleAdReward} label="광고 보고 추가 공개 2회" />

          <div className="mt-12">
            <button className="btn btn-outline btn-block" onClick={reset}>
              다시 하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
