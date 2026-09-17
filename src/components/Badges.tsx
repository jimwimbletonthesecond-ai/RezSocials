import React from 'react';
import { Crown, ShieldAlert, ShieldCheck, CheckCircle2, Sparkles, HeartHandshake } from 'lucide-react';
import { SYSTEM_BADGES } from '../data/badges';

interface BadgeDisplayProps {
  badgeId: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badgeId, size = 'sm' }) => {
  const badge = SYSTEM_BADGES.find(b => b.id === badgeId);
  if (!badge) return null;

  const icons: Record<string, React.ReactNode> = {
    Crown: <Crown className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
    ShieldAlert: <ShieldAlert className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
    ShieldCheck: <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
    CheckCircle2: <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
    Sparkles: <Sparkles className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
    HeartHandshake: <HeartHandshake className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-xs border ${badge.bgColor} ${badge.color} ${badge.borderColor} ${badge.isSpecial ? 'shadow-sm' : ''}`}
      title={badge.description}
    >
      {icons[badge.icon]}
      <span>{badge.name}</span>
    </span>
  );
};
