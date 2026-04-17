import { useState, useCallback } from 'react';
import { NicknamePrompt } from './components/NicknamePrompt';
import { ChatScreen } from './components/ChatScreen';
import { DemoMode } from './components/DemoMode';

function App() {
  const [nickname, setNickname] = useState('');
  const [ready, setReady] = useState(false);
  const [demo, setDemo] = useState(false);

  const handleNicknameSubmit = useCallback((name: string) => {
    setNickname(name);
    setReady(true);
  }, []);

  const handleRoomChange = useCallback(() => {
    // Room changed due to location - reset to nickname prompt
    setReady(false);
    setNickname('');
  }, []);

  if (demo) {
    return <DemoMode onExit={() => setDemo(false)} />;
  }

  if (!ready) {
    return <NicknamePrompt onSubmit={handleNicknameSubmit} onDemo={() => setDemo(true)} />;
  }

  return <ChatScreen nickname={nickname} onRoomChange={handleRoomChange} />;
}

export default App;
