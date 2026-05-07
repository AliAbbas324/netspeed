import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function HeroHeader() {
  return (
    <div className="relative group animate-float">
      {/* Animated Glow Behind Card */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 to-blue-500/30 opacity-40 blur-xl transition-opacity duration-1000 group-hover:opacity-70 group-hover:duration-500 animate-pulse-glow" />
      
      <Card className="relative border-white/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Subtle top glare effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <CardHeader className="pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-primary">
            NetSpeed Settings
          </p>
          <CardTitle className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
            Live traffic &amp; preferences.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="max-w-prose text-sm leading-relaxed text-muted-foreground/80 dark:text-muted-foreground">
            Monitor your real-time network activity and configure how NetSpeed
            displays your speeds — in the widget, system tray, or both.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
