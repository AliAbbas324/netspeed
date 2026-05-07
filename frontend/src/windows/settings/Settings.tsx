import { useEffect } from 'react';
import { SetMainWindowFocus } from '../../../wailsjs/go/main/App';

import { HeroHeader } from './HeroHeader';
import { SpeedCards } from './SpeedCards';
import { DisplayOptions } from './DisplayOptions';
import { WidgetCustomization } from './WidgetCustomization';
import { StatusBanner } from './StatusBanner';

export function Settings() {
  useEffect(() => {
    const onFocus = () => void SetMainWindowFocus(true);
    const onBlur = () => void SetMainWindowFocus(false);

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background relative p-5 md:p-7 overflow-hidden">
      {/* Deep Space / Mesh Gradient Overlay */}
      <div className="absolute top-0 left-0 w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 animate-pulse-glow" />
      <div className="mx-auto max-w-[1180px] space-y-6 relative z-10">
        <HeroHeader />
        <SpeedCards />
        <DisplayOptions />
        <WidgetCustomization />
        <StatusBanner />
      </div>
    </main>
  );
}