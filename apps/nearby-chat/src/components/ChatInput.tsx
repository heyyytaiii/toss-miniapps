import { useState, useRef } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputWrap}>
        <input
          ref={inputRef}
          style={styles.input}
          type="text"
          placeholder="메시지를 입력하세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={disabled}
          maxLength={500}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: value.trim() ? 1 : 0.4,
          }}
          onClick={handleSend}
          disabled={!value.trim() || disabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#fff" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '8px 12px',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    background: '#fff',
    borderTop: '1px solid #f2f3f5',
  },
  inputWrap: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 15,
    border: '1.5px solid #e5e8eb',
    borderRadius: 24,
    outline: 'none',
    background: '#f7f8fa',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: '#3182f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
};
