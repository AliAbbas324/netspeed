import { Skeleton } from '@/components/ui/skeleton';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border/50 px-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="flex-1 overflow-hidden p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="flex gap-4 border-b border-border/60 pb-8">
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
