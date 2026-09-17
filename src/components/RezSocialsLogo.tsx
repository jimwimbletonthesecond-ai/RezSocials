import React from 'react';

interface RezSocialsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const RezSocialsLogo: React.FC<RezSocialsLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/rezsocials_logo.png"
        alt="RezSocials Logo"
        className={`${sizeClasses[size]} object-contain rounded-lg shadow-md hover:scale-105 transition-transform duration-200`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logo.png';
        }}
      />
      {showText && (
        <span className={`font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent ${textSizes[size]}`}>
          RezSocials
        </span>
      )}
    </div>
  );
};
