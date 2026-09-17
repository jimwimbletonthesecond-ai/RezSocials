import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Megaphone } from 'lucide-react';
import { db } from '../lib/firebase';
import { CommunityAnnouncement } from '../types';

export const CommunityAnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'communityAnnouncements'), where('active', '==', true));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityAnnouncement));
      setAnnouncements(docs);
    }, (err) => {
      console.warn('[ANNOUNCEMENTS ERROR]', err);
    });
    return () => unsub();
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {announcements.map((a) => (
        <div
          key={a.id}
          className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 rounded-xl p-3 flex items-start gap-3 text-sm text-purple-100 shadow-md"
        >
          <Megaphone className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-purple-200">{a.title}</h4>
            <p className="text-purple-300/90 text-xs mt-0.5">{a.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
