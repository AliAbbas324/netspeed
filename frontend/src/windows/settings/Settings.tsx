import { HeroHeader } from './HeroHeader';
import { SpeedCards } from './SpeedCards';
import { DisplayOptions } from './DisplayOptions';
import { WidgetCustomization } from './WidgetCustomization';
import { StatusBanner } from './StatusBanner';
import { SettingsSection } from './SettingsSection';

export function Settings() {
  return (
    <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-12 sm:px-6">
        <HeroHeader />

        <div className="mt-10 space-y-10">
          <SettingsSection
            title="Live traffic"
            description="Real-time rates for the interface or combined total you selected below."
          >
            <SpeedCards />
          </SettingsSection>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="p-6 sm:p-8">
              <DisplayOptions />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="p-6 sm:p-8">
              <WidgetCustomization />
            </div>
          </div>

          <StatusBanner />
        </div>
      </div>
    </main>
  );
}
