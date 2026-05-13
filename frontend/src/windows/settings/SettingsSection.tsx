import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'border-t border-border/70 pt-8 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <header className="mb-5">
        <h2 className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground/90">{description}</p>
        ) : null}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
