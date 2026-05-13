import { AppBrandingIcon } from '@/components/AppBrandingIcon';
import { useNetStore } from '@/stores/useNetStore';

export function HeroHeader() {
  const rounded = useNetStore((s) => s.config.titleBarLogoRoundedCorners);

  return (
    <header className="flex flex-col gap-6 border-b border-border/80 pb-8 sm:flex-row sm:items-start sm:gap-8">
      <AppBrandingIcon rounded={rounded} size={48} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">NetSpeed</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Monitoring, appearance, and widget styling are configured here. Changes apply as soon as you adjust them.
        </p>
      </div>
    </header>
  );
}
