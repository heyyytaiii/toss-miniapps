interface LocationPromptProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LocationPrompt({ loading, error, onRetry }: LocationPromptProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {loading ? (
          <>
            <div style={styles.spinner} />
            <h2 style={styles.title}>위치를 찾고 있어요</h2>
            <p style={styles.desc}>근처 채팅방을 찾기 위해 위치 정보가 필요해요</p>
          </>
        ) : error ? (
          <>
            <div style={styles.emoji}>📍</div>
            <h2 style={styles.title}>위치를 가져올 수 없어요</h2>
            <p style={styles.desc}>{error}</p>
            <button style={styles.button} onClick={onRetry}>
              다시 시도
            </button>
          </>
        ) : null}
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
    margin: '12px 0 8px',
  },
  desc: {
    fontSize: 14,
    color: '#8b95a1',
    margin: '0 0 20px',
  },
  button: {
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    background: '#3182f6',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #e5e8eb',
    borderTopColor: '#3182f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
};
