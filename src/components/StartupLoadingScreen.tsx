import React, { useEffect, useState } from 'react';
import { RezSocialsLogo } from './RezSocialsLogo';

export const StartupLoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200);
          return 100;
        }
        return p + 25;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0b0f19] flex flex-col items-center justify-center z-50 p-4">
      <div className="flex flex-col items-center max-w-sm w-full text-center">
        <RezSocialsLogo size="xl" showText={false} className="animate-pulse mb-6" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent mb-2">
          RezSocials
        </h1>
        <p className="text-slate-400 text-sm mb-6">Connecting the Rezona Community</p>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
