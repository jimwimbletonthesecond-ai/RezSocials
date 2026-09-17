import React from 'react';

interface SafeMediaDisplayProps {
  mediaUrls?: string[];
  mediaType?: 'image' | 'video' | 'audio' | 'none';
}

export const SafeMediaDisplay: React.FC<SafeMediaDisplayProps> = ({ mediaUrls, mediaType }) => {
  if (!mediaUrls || mediaUrls.length === 0 || mediaType === 'none') return null;

  return (
    <div className="mt-3 space-y-2">
      {mediaUrls.map((url, idx) => {
        if (mediaType === 'image') {
          return (
            <img
              key={idx}
              src={url}
              alt="Post attachment"
              className="max-h-96 w-full object-cover rounded-xl border border-slate-800"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          );
        }
        if (mediaType === 'video') {
          return (
            <video
              key={idx}
              src={url}
              controls
              className="max-h-96 w-full rounded-xl border border-slate-800"
            />
          );
        }
        if (mediaType === 'audio') {
          return (
            <audio
              key={idx}
              src={url}
              controls
              className="w-full mt-2"
            />
          );
        }
        return null;
      })}
    </div>
  );
};
