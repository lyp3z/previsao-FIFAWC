import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Medal, Crown } from 'lucide-react';
import { cn } from '../lib/utils';

interface QualificationBadgeProps {
  status: 'qualified' | 'contention' | 'eliminated';
  rank: number;
}

export const QualificationBadge: React.FC<QualificationBadgeProps> = ({ status, rank }) => {
  if (status === 'qualified') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20">
        {rank === 1 ? <Crown size={12} /> : <Medal size={12} />}
        <span className="text-[10px] font-black uppercase tracking-wider">
          {rank}º Classificado
        </span>
        <CheckCircle2 size={12} />
      </div>
    );
  }

  if (status === 'eliminated') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-500 rounded-md border border-red-500/20">
        <span className="text-[10px] font-black uppercase tracking-wider">Eliminado</span>
        <XCircle size={12} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20">
      <span className="text-[10px] font-black uppercase tracking-wider">Em Disputa</span>
      <AlertCircle size={12} className="animate-pulse" />
    </div>
  );
};
