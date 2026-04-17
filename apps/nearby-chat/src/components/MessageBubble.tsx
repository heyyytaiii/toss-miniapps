import { useState } from 'react';
import type { Message } from '../lib/types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  onReport: (messageId: string, userId: string, reason: string) => void;
  onBlock: (userId: string) => void;
}

export function MessageBubble({ message, isMine, onReport, onBlock }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (message.is_system) {
    return (
      <div style={styles.systemMsg}>
        <span>{message.content}</span>
      </div>
    );
  }

  const time = new Date(message.created_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{ ...styles.row, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
      <div
        style={{ maxWidth: '75%' }}
        onContextMenu={(e) => {
          if (!isMine) {
            e.preventDefault();
            setShowMenu(true);
          }
        }}
      >
        {!isMine && <div style={styles.nickname}>{message.nickname}</div>}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: isMine ? 'row-reverse' : 'row' }}>
          <div style={isMine ? styles.myBubble : styles.otherBubble}>
            {message.content}
          </div>
          <span style={styles.time}>{time}</span>
        </div>

        {showMenu && !isMine && (
          <div style={styles.menu}>
            <button
              style={styles.menuItem}
              onClick={() => {
                onReport(message.id, message.user_id, '부적절한 메시지');
                setShowMenu(false);
              }}
            >
              🚨 신고
            </button>
            <button
              style={styles.menuItemDanger}
              onClick={() => {
                onBlock(message.user_id);
                setShowMenu(false);
              }}
            >
              🚫 차단
            </button>
            <button
              style={styles.menuItem}
              onClick={() => setShowMenu(false)}
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    marginBottom: 8,
    padding: '0 16px',
  },
  nickname: {
    fontSize: 12,
    color: '#8b95a1',
    marginBottom: 4,
    fontWeight: 500,
  },
  myBubble: {
    background: '#3182f6',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '16px 16px 4px 16px',
    fontSize: 15,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  otherBubble: {
    background: '#f2f3f5',
    color: '#191f28',
    padding: '10px 14px',
    borderRadius: '16px 16px 16px 4px',
    fontSize: 15,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  time: {
    fontSize: 11,
    color: '#adb5bd',
    flexShrink: 0,
  },
  systemMsg: {
    textAlign: 'center',
    padding: '8px 16px',
    fontSize: 12,
    color: '#8b95a1',
  },
  menu: {
    marginTop: 6,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  menuItemDanger: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#f04452',
  },
};
