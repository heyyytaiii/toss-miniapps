import { useState, useCallback } from 'react';
import { NicknamePrompt } from './components/NicknamePrompt';
import { ChatScreen } from './components/ChatScreen';

function App() {
  const [nickname, setNickname] = useState('');
  const [ready, setReady] = useState(false);

  const handleNicknameSubmit = useCallback((name: string) => {
    setNickname(name);
    setReady(true);
  }, []);

  const handleRoomChange = useCallback(() => {
    setReady(false);
    setNickname('');
  }, []);

  if (!ready) {
    return <NicknamePrompt onSubmit={handleNicknameSubmit} />;
  }

  return <ChatScreen nickname={nickname} onRoomChange={handleRoomChange} />;
}

export default App;
