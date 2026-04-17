export interface ChatRoom {
  id: string;
  geohash: string;
  name: string;
  created_at: string;
  active_users: number;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  content: string;
  created_at: string;
  is_system?: boolean;
}

export interface UserProfile {
  id: string;
  nickname: string;
  latitude: number;
  longitude: number;
  geohash: string;
  last_active: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  room_id: string;
  message_id: string;
  reason: string;
  created_at: string;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export type AppScreen = 'nickname' | 'location' | 'chat';
