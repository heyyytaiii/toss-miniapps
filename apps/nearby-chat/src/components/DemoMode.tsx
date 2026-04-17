import { useState, useEffect, useRef } from 'react';
import { generateMockMessages, DEMO_SCENARIOS } from '../lib/mock-data';
import { getUserId } from '../lib/storage';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

type ScenarioKey = keyof typeof DEMO_SCENARIOS;

export function DemoMode({ onExit }: { onExit: () => void }) {
  const [scenario, setScenario] = useState<ScenarioKey | null>(null);

  if (!scenario) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🧪 데모 모드</h1>
          <button style={styles.exitBtn} onClick={onExit}>나가기</button>
        </div>
        <div style={styles.scenarios}>
          <p style={styles.desc}>테스트할 시나리오를 선택하세요</p>
          {(Object.entries(DEMO_SCENARIOS) as [ScenarioKey, typeof DEMO_SCENARIOS[ScenarioKey]][]).map(
            ([key, { label }]) => (
              <button
                key={key}
                style={styles.scenarioBtn}
                onClick={() => setScenario(key)}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  return <DemoChat scenario={scenario} onBack={() => setScenario(null)} />;
}

function DemoChat({ scenario, onBack }: { scenario: ScenarioKey; onBack: () => void }) {
  const config = DEMO_SCENARIOS[scenario];
  const userId = getUserId();
  const [messages, setMessages] = useState(() =>
    generateMockMessages('demo-room', config.messageCount, userId)
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const handleSend = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `demo-${Date.now()}`,
        room_id: 'demo-room',
        user_id: userId,
        nickname: '나',
        content,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={onBack}>←</button>
          <span style={styles.title}>📍 근처 채팅방</span>
          <span style={styles.badge}> DEMO</span>
        </div>
        <span style={styles.userCount}>{config.userCount}명 참여 중</span>
      </div>

      <div ref={scrollRef} style={styles.messages}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.user_id === userId}
            onReport={() => alert('데모 모드에서는 신고가 비활성화됩니다')}
            onBlock={() => alert('데모 모드에서는 차단이 비활성화됩니다')}
          />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f7f8fa',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#fff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    borderBottom: '1px solid #f2f3f5',
    background: '#fff',
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    color: '#191f28',
  },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    background: '#f04452',
    padding: '2px 6px',
    borderRadius: 4,
    marginLeft: 6,
    verticalAlign: 'middle',
  },
  userCount: {
    fontSize: 12,
    color: '#3182f6',
    fontWeight: 500,
  },
  exitBtn: {
    fontSize: 14,
    color: '#8b95a1',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  backBtn: {
    fontSize: 18,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: 8,
    padding: 0,
  },
  scenarios: {
    padding: 24,
  },
  desc: {
    fontSize: 14,
    color: '#8b95a1',
    marginBottom: 16,
  },
  scenarioBtn: {
    display: 'block',
    width: '100%',
    padding: '16px 20px',
    marginBottom: 12,
    fontSize: 15,
    fontWeight: 600,
    color: '#191f28',
    background: '#fff',
    border: '1.5px solid #e5e8eb',
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: 12,
    paddingBottom: 8,
  },
};
