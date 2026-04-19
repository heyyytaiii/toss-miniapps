import { useEffect, useRef, useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useNearbyRoom } from '../hooks/useNearbyRoom';
import { loadFullscreen, showFullscreen, adsEnabled } from '../lib/ads';
import { LocationPrompt } from './LocationPrompt';
import { AdGatePrompt } from './AdGatePrompt';
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

  // Ad gate: user must watch ad before entering room (skipped in dev)
  const [adGatePassed, setAdGatePassed] = useState(!adsEnabled);
  const [adLoading, setAdLoading] = useState(false);

  const handleWatchAd = async () => {
    setAdLoading(true);
    const loaded = await loadFullscreen();
    if (loaded) {
      await showFullscreen();
    }
    // Allow entry even if ad load/show fails (inventory may be empty)
    setAdGatePassed(true);
    setAdLoading(false);
  };

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

  // Ad gate: show ad prompt before chat room
  if (!adGatePassed) {
    return <AdGatePrompt loading={adLoading} onWatch={handleWatchAd} />;
  }

  return (
    <ChatRoom
      roomId={room.id}
      nickname={nickname}
      userCount={userCount}
    />
  );
}
