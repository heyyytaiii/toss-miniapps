import { useEffect, useRef } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useNearbyRoom } from '../hooks/useNearbyRoom';
import { loadFullscreen, showFullscreen } from '../lib/ads';
import { LocationPrompt } from './LocationPrompt';
import { ChatRoom } from './ChatRoom';

interface ChatScreenProps {
  nickname: string;
  onRoomChange: () => void;
}

export function ChatScreen({ nickname, onRoomChange }: ChatScreenProps) {
  const location = useLocation();
  const { room, loading: roomLoading, error: roomError, userCount, retry: retryRoom } =
    useNearbyRoom(location.latitude, location.longitude);

  // Detect room change → reset to nickname
  const prevRoomIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!room) return;
    if (prevRoomIdRef.current && prevRoomIdRef.current !== room.id) {
      onRoomChange();
    }
    prevRoomIdRef.current = room.id;
  }, [room, onRoomChange]);

  // Preload fullscreen ad + show on room entry
  const adShownRef = useRef(false);
  useEffect(() => {
    if (!room || adShownRef.current) return;
    adShownRef.current = true;

    loadFullscreen().then((loaded) => {
      if (loaded) showFullscreen();
    });
  }, [room]);

  // Location loading/error
  if (location.loading || location.error) {
    return (
      <LocationPrompt
        loading={location.loading}
        error={location.error}
        onRetry={location.retry}
      />
    );
  }

  // Room loading/error
  if (roomLoading || roomError || !room) {
    return (
      <LocationPrompt
        loading={roomLoading}
        error={roomError}
        onRetry={retryRoom}
      />
    );
  }

  return (
    <ChatRoom
      roomId={room.id}
      nickname={nickname}
      userCount={userCount}
    />
  );
}
