import { HeroHeader } from './HeroHeader';
import { SpeedCards } from './SpeedCards';
import { DisplayOptions } from './DisplayOptions';
import { WidgetCustomization } from './WidgetCustomization';
import { StatusBanner } from './StatusBanner';

export function Settings() {
  return (
    <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-background p-5 md:p-7">
      {/* Deep Space / Mesh Gradient Overlay */}
      <div className="absolute top-0 left-0 w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 animate-pulse-glow" />
      <div className="relative z-10 mx-auto max-w-[1180px] space-y-6 pb-8">
        <HeroHeader />
        <SpeedCards />
        <DisplayOptions />
        <WidgetCustomization />
        <StatusBanner />
      </div>
    </main>
  );
}
