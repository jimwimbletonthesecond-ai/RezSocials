import React, { useState } from 'react';
import { Image, Send, Music } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { checkContentSafety } from '../lib/moderation';

export const CreatePostBox: React.FC<{ onPostCreated?: () => void }> = ({ onPostCreated }) => {
  const { user, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'none'>('none');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user || !userProfile) {
    return (
      <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-4 text-center text-slate-400 text-sm mb-6">
        <span>Sign in to share thoughts, artwork, or discuss with the Rezona community.</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) return;

    setError('');
    const safety = checkContentSafety(content);
    if (!safety.safe) {
      setError(safety.reason || 'Content flag');
      return;
    }

    setSubmitting(true);
    try {
      const newPost = {
        authorId: user.uid,
        authorUsername: userProfile.username,
        authorDisplayName: userProfile.displayName,
        authorAvatarUrl: userProfile.avatarUrl || '',
        authorRole: userProfile.role,
        authorBadges: userProfile.badges || [],
        content: content.trim(),
        mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : [],
        mediaType: mediaUrl.trim() ? mediaType : 'none',
        upvotes: [],
        downvotes: [],
        score: 0,
        commentsCount: 0,
        sharesCount: 0,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'posts'), newPost);
      setContent('');
      setMediaUrl('');
      setMediaType('none');
      setShowMediaInput(false);
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      setError(err?.message || 'Failed to post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <UserAvatar username={userProfile.username} src={userProfile.avatarUrl} size="md" />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's happening in Rezona?"
              rows={3}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />

            {showMediaInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="url"
                  placeholder="Paste direct Image, Video, or Audio URL..."
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={mediaType}
                  onChange={e => setMediaType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            )}

            {error && (
              <div className="mt-2 text-rose-400 text-xs">{error}</div>
            )}

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(!showMediaInput);
                    if (!showMediaInput) setMediaType('image');
                  }}
                  className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${showMediaInput ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                  <Image className="w-4 h-4" />
                  <span>Media</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || (!content.trim() && !mediaUrl.trim())}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition-all shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
