import type { Message } from './types';

const MOCK_NICKNAMES = [
  '동네산책러', '커피중독자', '야근전사', '퇴근했다', '점심뭐먹지',
  '산책중', '동네주민', '카페사장', '배달기사', '자전거탐',
  '운동가자', '퇴근했다', '강아지산책', '동네고양이', '편의점알바',
  '치킨매니아', '동네산책러', '야식의왕', '카공족', '동네형',
  '옆집사람', '2층주민', '헬스보이', '러닝맨', '동네빵집',
  '피자좋아', '택배왔다', '산책가자', '동네친구', '출근싫어',
];

const MOCK_CONTENTS = [
  '안녕하세요~',
  '여기 근처 맛집 추천해주실 분?',
  '오늘 날씨 좋네요',
  '이 앱 신기하다 ㅋㅋ',
  '진짜 100m 안에 있는 건가요?',
  '카페에서 보내는 중',
  '점심 뭐 먹을지 고민...',
  '이 동네 살기 좋아요?',
  '강아지 산책 중인데 누구 있나요',
  'ㅋㅋㅋㅋ 신기해',
  '여기 사람 많네',
  '퇴근하고 싶다...',
  '치킨 시킬 사람?',
  '오 근처에 사시는군요',
  '반갑습니다!',
  '이거 위치 정확한가요?',
  '옆 건물인가 ㅋㅋ',
  '동네 모임 해볼까요?',
  '오늘 미세먼지 심하네',
  '배달 같이 시킬 분?',
  '여기 와이파이 되나요',
  '택배 언제 오지...',
  '운동 같이 하실 분',
  'ㅎㅎ 재밌다',
  '이 카페 맛있어요',
  '비 올 것 같은데',
  '우산 가져오세요!',
  '동네 축구 하실 분?',
  '오늘 뭐하세요?',
  '심심해서 왔어요',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockMessages(
  roomId: string,
  count: number,
  myUserId: string
): Message[] {
  const messages: Message[] = [];
  const now = Date.now();
  const userIds = Array.from({ length: Math.min(count, 30) }, (_, i) => `mock-user-${i}`);

  for (let i = 0; i < count; i++) {
    const isMe = i % 7 === 0; // Every 7th message is mine
    const userId = isMe ? myUserId : randomItem(userIds);
    const nickname = isMe ? '나' : randomItem(MOCK_NICKNAMES);

    messages.push({
      id: `mock-${i}`,
      room_id: roomId,
      user_id: userId,
      nickname,
      content: randomItem(MOCK_CONTENTS),
      created_at: new Date(now - (count - i) * 15000).toISOString(), // 15초 간격
    });
  }

  return messages;
}

export const DEMO_SCENARIOS = {
  // 1. 소수 (2-3명)
  quiet: { userCount: 3, messageCount: 8, label: '한산한 채팅방 (3명)' },
  // 2. 보통 (10명)
  normal: { userCount: 10, messageCount: 25, label: '보통 채팅방 (10명)' },
  // 3. 붐비는 (30명)
  busy: { userCount: 30, messageCount: 50, label: '붐비는 채팅방 (30명)' },
  // 4. 닉네임 중복
  duplicateNames: { userCount: 15, messageCount: 20, label: '닉네임 중복 테스트' },
} as const;
