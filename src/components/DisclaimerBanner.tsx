import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-indigo-950/70 border-b border-indigo-800/50 px-4 py-2 text-xs text-indigo-200 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Community Notice:</strong> RezSocials is an unofficial fan and community platform created for the Rezona community. It is not affiliated with, maintained, or endorsed by official corporate entities.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-indigo-300 hover:text-white rounded hover:bg-indigo-900/50"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
