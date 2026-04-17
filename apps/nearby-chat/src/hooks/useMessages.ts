import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { filterProfanity, containsProfanity } from '../lib/profanity';
import { getUserId, getBlockedUsers } from '../lib/storage';
import type { Message } from '../lib/types';

const PAGE_SIZE = 50;

export function useMessages(roomId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const blockedRef = useRef<string[]>(getBlockedUsers());
  const joinedAtRef = useRef<string>(new Date().toISOString());

  // Reset join time when room changes
  useEffect(() => {
    if (!roomId) return;
    joinedAtRef.current = new Date().toISOString();
    setMessages([]);
    setLoading(false);
  }, [roomId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (blockedRef.current.includes(newMsg.user_id)) return;
          // Avoid duplicates (own messages already added optimistically)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    async (content: string, nickname: string) => {
      if (!roomId || !content.trim()) return;

      const filtered = filterProfanity(content.trim());

      if (containsProfanity(content.trim()) && filtered.replace(/●/g, '').length === 0) {
        return;
      }

      const userId = getUserId();
      const tempId = crypto.randomUUID();
      const optimisticMsg: Message = {
        id: tempId,
        room_id: roomId,
        user_id: userId,
        nickname,
        content: filtered,
        created_at: new Date().toISOString(),
      };

      // Optimistic update - show immediately
      setMessages((prev) => [...prev, optimisticMsg]);

      const { data } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          nickname,
          content: filtered,
        })
        .select()
        .single();

      // Replace temp message with real one
      if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (data as Message) : m))
        );
      }
    },
    [roomId]
  );

  const reportMessage = useCallback(
    async (messageId: string, reportedUserId: string, reason: string) => {
      if (!roomId) return;
      const userId = getUserId();

      await supabase.from('reports').insert({
        reporter_id: userId,
        reported_user_id: reportedUserId,
        room_id: roomId,
        message_id: messageId,
        reason,
      });
    },
    [roomId]
  );

  const blockUser = useCallback((userId: string) => {
    blockedRef.current = [...blockedRef.current, userId];
    setMessages((prev) => prev.filter((m) => m.user_id !== userId));
  }, []);

  return { messages, loading, sendMessage, reportMessage, blockUser };
}
