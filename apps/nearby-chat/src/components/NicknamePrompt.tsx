import { useState } from 'react';
import { containsProfanity } from '../lib/profanity';

interface NicknamePromptProps {
  onSubmit: (nickname: string) => void;
}

export function NicknamePrompt({ onSubmit }: NicknamePromptProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 10) {
      setError('2~10자로 입력해주세요');
      return;
    }
    if (containsProfanity(trimmed)) {
      setError('사용할 수 없는 닉네임이에요');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.emoji}>👋</div>
        <h1 style={styles.title}>반가워요!</h1>
        <p style={styles.desc}>채팅에서 사용할 닉네임을 정해주세요</p>
        <input
          style={styles.input}
          type="text"
          placeholder="닉네임 (2~10자)"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          maxLength={10}
          autoFocus
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleSubmit}>
          시작하기
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
    fontSize: 22,
    fontWeight: 700,
    color: '#191f28',
    margin: '0 0 8px',
  },
  desc: {
    fontSize: 14,
    color: '#8b95a1',
    margin: '0 0 24px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
    border: '1.5px solid #e5e8eb',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  error: {
    fontSize: 13,
    color: '#f04452',
    margin: '8px 0 0',
  },
  button: {
    width: '100%',
    padding: '14px 0',
    marginTop: 16,
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    background: '#3182f6',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
  },
};
