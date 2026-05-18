import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SettingsPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SettingsPanel({
  title,
  description,
  children,
  className,
  contentClassName,
}: SettingsPanelProps) {
  return (
    <Card
      className={cn(
        'border-border/80 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
