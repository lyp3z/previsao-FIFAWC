import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number; // 0–100
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
  label?: string;
  showValue?: boolean;
  className?: string;
}

const colorMap = {
  emerald: 'bg-emerald-500',
  blue:    'bg-blue-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
  purple:  'bg-purple-500',
  cyan:    'bg-cyan-500',
};

export function ProgressBar({ value, color = 'emerald', size = 'md', label, showValue, className }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-slate-200">{clampedValue.toFixed(1)}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-white/5', size === 'sm' ? 'h-1' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorMap[color])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
