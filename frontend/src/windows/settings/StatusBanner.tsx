import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNetStore } from '../../stores/useNetStore';

export function StatusBanner() {
  const errorMessage = useNetStore((state) => state.errorMessage);

  if (errorMessage) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-destructive" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-destructive">
              Error
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/30 bg-card/60">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Status
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Settings load from the backend on startup. Every change is persisted
          automatically.
        </p>
      </CardContent>
    </Card>
  );
}
