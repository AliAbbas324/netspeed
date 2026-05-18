import { Activity, Palette, Pipette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroHeader } from './HeroHeader';
import { SpeedCards } from './SpeedCards';
import { DisplayOptions } from './DisplayOptions';
import { WidgetCustomization } from './WidgetCustomization';
import { StatusBanner } from './StatusBanner';

export function Settings() {
  return (
    <main className="app-ambient relative flex-1 overflow-y-auto overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-16 bottom-24 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 pb-12 sm:px-6">
        <HeroHeader />

        <section className="mt-8" aria-label="Live network speeds">
          <SpeedCards />
        </section>

        <Tabs defaultValue="monitoring" className="mt-10">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-3 p-1">
            <TabsTrigger value="monitoring" className="gap-2 py-2.5">
              <Activity className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Monitoring</span>
              <span className="sm:hidden">Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 py-2.5">
              <Palette className="h-4 w-4" aria-hidden />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="widget" className="gap-2 py-2.5">
              <Pipette className="h-4 w-4" aria-hidden />
              Widget
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="mt-0 space-y-6 focus-visible:outline-none">
            <DisplayOptions section="monitoring" />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0 space-y-6 focus-visible:outline-none">
            <DisplayOptions section="appearance" />
          </TabsContent>

          <TabsContent value="widget" className="mt-0 space-y-6 focus-visible:outline-none">
            <WidgetCustomization />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <StatusBanner />
        </div>
      </div>
    </main>
  );
}
