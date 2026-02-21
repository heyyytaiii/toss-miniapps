import React, { useState } from 'react';
import Roulette from './components/Roulette';
import Ladder from './components/Ladder';
import RandomDraw from './components/RandomDraw';

type Tab = 'roulette' | 'ladder' | 'draw';

interface TabConfig {
  id: Tab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'roulette', label: '룰렛', icon: '🎡' },
  { id: 'ladder', label: '사다리', icon: '🪜' },
  { id: 'draw', label: '제비뽑기', icon: '🎲' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('roulette');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>랜덤 추첨기</h1>
        <p>공정한 추첨, 재미있게!</p>
      </header>

      <main className="app-content">
        {activeTab === 'roulette' && <Roulette />}
        {activeTab === 'ladder' && <Ladder />}
        {activeTab === 'draw' && <RandomDraw />}
      </main>

      <nav className="tab-bar" role="tablist" aria-label="메뉴">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-label={tab.label}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
