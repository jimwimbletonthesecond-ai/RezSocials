import React, { useState, useEffect } from 'react';
import { Mail, Send, User as UserIcon } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { DirectMessage, UserProfile } from '../types';
import { UserAvatar } from '../components/UserAvatar';

export const MessagesView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DirectMessage));
      setMessages(list);
      setLoading(false);
    }, (err) => {
      console.warn('[MESSAGES ERROR]', err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || !userProfile) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        recipientId: 'system_inbox',
        senderUsername: userProfile.username,
        senderDisplayName: userProfile.displayName,
        senderAvatarUrl: userProfile.avatarUrl || '',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        read: false,
      });
      setContent('');
      alert('Message sent successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white">Direct Messages</h2>
      </div>

      <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <form onSubmit={handleSend} className="space-y-3">
          <input
            type="text"
            placeholder="Recipient @username"
            value={recipientUsername}
            onChange={e => setRecipientUsername(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <textarea
            rows={3}
            placeholder="Write your private message..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct Message</span>
          </button>
        </form>
      </div>

      <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Inbox</h3>
      {loading ? (
        <div className="text-center py-8 text-slate-500 text-xs">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
          Your inbox is clean. No direct messages.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className="bg-[#131c2e] border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserAvatar username={m.senderUsername} src={m.senderAvatarUrl} size="sm" />
                <span className="font-semibold text-xs text-white">{m.senderDisplayName}</span>
                <span className="text-[11px] text-slate-500">@{m.senderUsername}</span>
              </div>
              <p className="text-xs text-slate-200">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
