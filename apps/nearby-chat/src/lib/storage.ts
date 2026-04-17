// Simple localStorage wrapper for persisting user data

const KEYS = {
  USER_ID: 'nearby-chat:user-id',
  NICKNAME: 'nearby-chat:nickname',
  BLOCKED_USERS: 'nearby-chat:blocked-users',
} as const;

export function getUserId(): string {
  let id = localStorage.getItem(KEYS.USER_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.USER_ID, id);
  }
  return id;
}

export function getNickname(): string | null {
  return localStorage.getItem(KEYS.NICKNAME);
}

export function setNickname(name: string): void {
  localStorage.setItem(KEYS.NICKNAME, name);
}

export function getBlockedUsers(): string[] {
  const raw = localStorage.getItem(KEYS.BLOCKED_USERS);
  return raw ? JSON.parse(raw) : [];
}

export function addBlockedUser(userId: string): void {
  const blocked = getBlockedUsers();
  if (!blocked.includes(userId)) {
    blocked.push(userId);
    localStorage.setItem(KEYS.BLOCKED_USERS, JSON.stringify(blocked));
  }
}
