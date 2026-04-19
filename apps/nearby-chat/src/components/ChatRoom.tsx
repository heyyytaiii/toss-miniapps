import { useEffect, useRef } from 'react';
import { useMessages } from '../hooks/useMessages';
import { getUserId, addBlockedUser } from '../lib/storage';
import { attachBanner, adsEnabled } from '../lib/ads';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

interface ChatRoomProps {
  roomId: string;
  nickname: string;
  userCount: number;
}

export function ChatRoom({ roomId, nickname, userCount }: ChatRoomProps) {
  const { messages, loading, sendMessage, reportMessage, blockUser } =
    useMessages(roomId);
  const userId = getUserId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: messages.length - messageCountRef.current === 1 ? 'smooth' : 'auto',
    });
    messageCountRef.current = messages.length;
  }, [messages.length]);

  // Attach banner ad
  useEffect(() => {
    if (!bannerRef.current) return;
    let destroy: (() => void) | null = null;

    attachBanner(bannerRef.current).then((d) => {
      destroy = d;
    });

    return () => {
      destroy?.();
    };
  }, [roomId]);

  const handleSend = (content: string) => {
    sendMessage(content, nickname);
  };

  const handleBlock = (targetUserId: string) => {
    addBlockedUser(targetUserId);
    blockUser(targetUserId);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📍 100m</h1>
          <span style={styles.userCount}>{userCount}명 참여 중</span>
        </div>
      </div>

      {/* Banner Ad */}
      {adsEnabled && <div ref={bannerRef} style={styles.banner} />}

      {/* Messages */}
      <div ref={scrollRef} style={styles.messages}>
        {loading ? (
          <div style={styles.loadingMsg}>메시지를 불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyMsg}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <p>아직 메시지가 없어요</p>
            <p style={{ fontSize: 13, color: '#adb5bd' }}>
              첫 번째 메시지를 보내보세요!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.user_id === userId}
              onReport={reportMessage}
              onBlock={handleBlock}
            />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
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
    margin: 0,
  },
  userCount: {
    fontSize: 12,
    color: '#3182f6',
    fontWeight: 500,
  },
  banner: {
    width: '100%',
    height: 96,
    flexShrink: 0,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: 12,
    paddingBottom: 8,
    background: '#fff',
  },
  loadingMsg: {
    textAlign: 'center',
    padding: 40,
    color: '#8b95a1',
    fontSize: 14,
  },
  emptyMsg: {
    textAlign: 'center',
    padding: 60,
    color: '#8b95a1',
    fontSize: 15,
  },
};
