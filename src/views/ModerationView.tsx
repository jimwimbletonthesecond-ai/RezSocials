import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Trash2, Megaphone } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ModerationReport, CommunityAnnouncement } from '../types';

export const ModerationView: React.FC = () => {
  const { isFounder, isAdmin, isModerator, userProfile } = useAuth();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [loading, setLoading] = useState(true);

  const canAccess = isFounder || isAdmin || isModerator;

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ModerationReport));
      setReports(list);
      setLoading(false);
    }, (err) => {
      console.warn(err);
      setLoading(false);
    });

    return () => unsub();
  }, [canAccess]);

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-rose-400">Access Restricted: Staff privileges required.</p>
      </div>
    );
  }

  const handleAction = async (reportId: string, status: 'actioned' | 'dismissed') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status,
        reviewedBy: userProfile?.username || 'Staff',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    try {
      await addDoc(collection(db, 'communityAnnouncements'), {
        title: announcementTitle.trim(),
        content: announcementContent.trim(),
        authorUsername: userProfile?.username || 'Staff',
        authorRole: userProfile?.role || 'moderator',
        priority: 'normal',
        active: true,
        createdAt: new Date().toISOString(),
      });
      setAnnouncementTitle('');
      setAnnouncementContent('');
      alert('Community announcement broadcasted!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-rose-400" />
        <h2 className="text-lg font-bold text-white">Staff Moderation Center</h2>
      </div>

      {/* Broadcast Announcement */}
      <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-3">
          <Megaphone className="w-4 h-4" />
          <span>Post Community Announcement</span>
        </div>
        <form onSubmit={handleCreateAnnouncement} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Announcement Title"
            value={announcementTitle}
            onChange={e => setAnnouncementTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <textarea
            required
            rows={2}
            placeholder="Announcement Message..."
            value={announcementContent}
            onChange={e => setAnnouncementContent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-colors"
          >
            Broadcast Announcement
          </button>
        </form>
      </div>

      {/* Reports Desk */}
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Pending Reports ({reports.filter(r => r.status === 'pending').length})
      </h3>

      {loading ? (
        <div className="text-center py-8 text-slate-500 text-xs">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
          No reports filed.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-[#131c2e] border border-slate-800 rounded-2xl p-4 text-xs">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-rose-300">Report #{r.id.slice(0, 6)}</span>
                  <span className="text-slate-400 ml-2">Filed by @{r.reporterUsername}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  r.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                  r.status === 'actioned' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-300'
                }`}>
                  {r.status.toUpperCase()}
                </span>
              </div>

              <p className="text-slate-200 mb-2"><strong>Reason:</strong> {r.reason}</p>
              {r.targetContent && (
                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-slate-400 mb-3 italic">
                  "{r.targetContent}"
                </div>
              )}

              {r.status === 'pending' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleAction(r.id, 'actioned')}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Action / Take Down</span>
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'dismissed')}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
