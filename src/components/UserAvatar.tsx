import React from 'react';

interface UserAvatarProps {
  src?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  username = 'U',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const initial = (username[0] || 'U').toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-700/60 shadow-sm ${className}`}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white shadow-inner border border-slate-700/60 ${className}`}
    >
      {initial}
    </div>
  );
};
