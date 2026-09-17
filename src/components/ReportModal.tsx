import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';

interface ReportModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ post, isOpen, onClose }) => {
  const { user, userProfile } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !user || !userProfile) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        targetType: 'post',
        targetId: post.id,
        targetContent: post.content.slice(0, 200),
        targetAuthorUsername: post.authorUsername,
        reporterId: user.uid,
        reporterUsername: userProfile.username,
        reason: reason.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setReason('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#131c2e] border border-slate-700 rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-400 mb-4">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">Report Post</h3>
        </div>

        {submitted ? (
          <div className="text-center py-6 text-emerald-400 text-sm font-medium">
            Thank you. Your report has been submitted for staff review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-400">
              Please state why this post by @{post.authorUsername} violates RezSocials community rules:
            </p>

            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Harassment, spam, unsafe link..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
            />

            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
