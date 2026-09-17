import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AppNotification } from '../types';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(list);
      setLoading(false);
    }, (err) => {
      console.warn('[NOTIFICATIONS ERROR]', err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (_) {}
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white">Notifications</h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
          You don't have any notifications right now.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                n.read ? 'bg-[#131c2e] border-slate-800 text-slate-300' : 'bg-indigo-950/20 border-indigo-500/40 text-white shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
                  {n.type === 'upvote' && <Heart className="w-4 h-4" />}
                  {n.type === 'comment' && <MessageCircle className="w-4 h-4" />}
                  {n.type === 'badge_granted' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {n.type === 'system' && <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs">{n.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
