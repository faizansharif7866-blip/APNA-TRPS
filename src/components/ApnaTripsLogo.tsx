import React from 'react';
import { AnimatedBus } from './AnimatedBus';

export interface ApnaTripsLogoProps {
  variant?: 'navbar' | 'header' | 'ticket' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ApnaTripsLogo: React.FC<ApnaTripsLogoProps> = ({
  variant = 'navbar',
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const busSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
    xl: 'hero' as const,
  };

  const busSize = busSizeMap[size] || 'md';

  if (variant === 'badge') {
    return (
      <div 
        onClick={onClick}
        className={`bg-slate-900/90 rounded-xl p-1.5 shadow-sm border border-amber-500/30 inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      >
        <AnimatedBus size={busSize} showRoad={false} />
      </div>
    );
  }

  if (variant === 'ticket') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-3 shrink-0 ${className}`}
      >
        <div className="bg-slate-900 rounded-xl p-1.5 shadow-sm border border-amber-500/40 flex items-center justify-center shrink-0">
          <AnimatedBus size="md" showRoad={false} />
        </div>
        {showSubtitle && (
          <div className="flex flex-col">
            <span className="text-xl font-bold font-display tracking-tight text-slate-900 leading-tight">
              Apna<span className="text-amber-500">Trips</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">
              BOOK • TRAVEL • EXPLORE
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center gap-3.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-400/40 shadow-xl shrink-0 ${className}`}
      >
        <AnimatedBus size="md" showRoad={true} />
        {showSubtitle && (
          <div className="flex flex-col border-l border-slate-700 pl-3">
            <span className="text-base sm:text-lg font-bold font-display tracking-tight text-white leading-none">
              Apna<span className="text-amber-400">Trips</span>
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-300 font-semibold mt-1">
              BOOK • TRAVEL • EXPLORE
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default 'navbar' variant
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 shrink-0 group cursor-pointer ${className}`}
    >
      <div className="bg-slate-950/80 rounded-xl p-1 shadow-sm border border-slate-800 group-hover:border-amber-400/80 flex items-center justify-center shrink-0 transition-colors">
        <AnimatedBus size={busSize} showRoad={false} />
      </div>
      {showSubtitle && (
        <div className="flex flex-col">
          <span className="text-xl font-bold font-display tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap leading-tight">
            Apna<span className="text-amber-400">Trips</span>
          </span>
          <span className="text-[8.5px] uppercase tracking-widest text-slate-400 font-semibold -mt-0.5 whitespace-nowrap">
            BOOK • TRAVEL • EXPLORE
          </span>
        </div>
      )}
    </div>
  );
};
