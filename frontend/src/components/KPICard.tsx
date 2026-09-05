import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'emerald' | 'amber' | 'rose' | 'cyan';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtext, icon: Icon, badge, badgeType = 'cyan' }) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'emerald': return 'badge-emerald';
      case 'amber': return 'badge-amber';
      case 'rose': return 'badge-rose';
      default: return 'badge-cyan';
    }
  };

  return (
    <div className="glass-panel p-4 glow-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-extrabold text-white tracking-tight font-mono">{value}</h3>
        {badge && <span className={getBadgeStyle()}>{badge}</span>}
      </div>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
};
