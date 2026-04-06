import { cn } from '@/lib/cn';

type Variant = 'default' | 'live' | 'finished' | 'scheduled' | 'value' | 'strong-value' | 'qualified' | 'eliminated' | 'amber' | 'blue' | 'purple' | 'cyan';

const variantStyles: Record<Variant, string> = {
  default:       'bg-white/5 text-slate-300 border border-white/10',
  live:          'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse',
  finished:      'bg-slate-800/80 text-slate-500 border border-slate-700/50',
  scheduled:     'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  value:         'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  'strong-value':'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
  qualified:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  eliminated:    'bg-red-500/10 text-red-500 border border-red-500/20',
  amber:         'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  blue:          'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  purple:        'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  cyan:          'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
};

interface BadgeProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide',
      variantStyles[variant],
      className,
    )}>
      {children}
    </span>
  );
}
