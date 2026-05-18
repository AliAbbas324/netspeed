import { useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { LoadingScreen } from './components/LoadingScreen';
import { useNetStore } from './stores/useNetStore';
import { Settings } from './windows/settings/Settings';

function App() {
  const initialize = useNetStore((state) => state.initialize);
  const isLoading = useNetStore((state) => state.isLoading);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TitleBar />
      <Settings />
    </div>
  );
}

export default App;
