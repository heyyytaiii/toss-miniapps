import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { encodeGeohash } from '../lib/geohash';
import { getUserId } from '../lib/storage';
import type { ChatRoom } from '../lib/types';

export function useNearbyRoom(latitude: number, longitude: number) {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);
  const currentGeohashRef = useRef<string>('');
  const currentRoomIdRef = useRef<string>('');

  const leaveRoom = useCallback(async (roomId: string) => {
    if (!roomId) return;
    const userId = getUserId();
    await supabase.from('presence').delete().eq('user_id', userId).eq('room_id', roomId);
  }, []);

  const joinRoom = useCallback(async () => {
    if (!latitude && !longitude) return;

    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase가 설정되지 않았어요. .env 파일을 확인해주세요.');
      return;
    }

    const geohash = encodeGeohash(latitude, longitude);

    // Same geohash area - no room change needed
    if (geohash === currentGeohashRef.current && room) {
      // Just update presence location
      const userId = getUserId();
      await supabase
        .from('presence')
        .update({ latitude, longitude, last_active: new Date().toISOString() })
        .eq('user_id', userId);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      // Leave previous room if exists
      if (currentRoomIdRef.current) {
        await leaveRoom(currentRoomIdRef.current);
      }

      // Find or create room for this geohash
      const { data: existingRoom } = await supabase
        .from('rooms')
        .select('*')
        .eq('geohash', geohash)
        .single();

      let currentRoom: ChatRoom;

      if (existingRoom) {
        currentRoom = existingRoom as ChatRoom;
      } else {
        const { data: newRoom, error: createError } = await supabase
          .from('rooms')
          .insert({
            geohash,
            name: '근처 채팅방',
            active_users: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        currentRoom = newRoom as ChatRoom;
      }

      // Upsert user presence in new room
      await supabase.from('presence').upsert(
        {
          user_id: userId,
          room_id: currentRoom.id,
          latitude,
          longitude,
          geohash,
          last_active: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      currentGeohashRef.current = geohash;
      currentRoomIdRef.current = currentRoom.id;
      setRoom(currentRoom);

      // Get active user count
      const { count } = await supabase
        .from('presence')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', currentRoom.id)
        .gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      setUserCount(count || 0);
    } catch (err) {
      setError('채팅방 연결에 실패했어요');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, room, leaveRoom]);

  useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  // Keep presence alive + refresh user count
  useEffect(() => {
    if (!room) return;

    const interval = setInterval(async () => {
      const userId = getUserId();
      await supabase
        .from('presence')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', userId);

      const { count } = await supabase
        .from('presence')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      setUserCount(count || 0);
    }, 30_000);

    return () => clearInterval(interval);
  }, [room]);

  // Cleanup on unmount - leave room
  useEffect(() => {
    return () => {
      if (currentRoomIdRef.current) {
        const userId = getUserId();
        supabase
          .from('presence')
          .delete()
          .eq('user_id', userId)
          .eq('room_id', currentRoomIdRef.current);
      }
    };
  }, []);

  return { room, loading, error, userCount, retry: joinRoom };
}
