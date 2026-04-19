interface AdGatePromptProps {
  loading: boolean;
  onWatch: () => void;
}

export function AdGatePrompt({ loading, onWatch }: AdGatePromptProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.emoji}>🎬</div>
        <h2 style={styles.title}>광고를 시청하면 입장할 수 있어요</h2>
        <button
          style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
          onClick={onWatch}
          disabled={loading}
        >
          {loading ? '광고 준비 중...' : '시청하고 입장하기'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f7f8fa',
    padding: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '40px 28px',
    textAlign: 'center',
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#191f28',
    margin: '12px 0 24px',
  },
  button: {
    padding: '14px 32px',
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    background: '#3182f6',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    width: '100%',
  },
};
