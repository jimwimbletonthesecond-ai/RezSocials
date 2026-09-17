import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Flag, Trash2, Pin } from 'lucide-react';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { BadgeDisplay } from './Badges';
import { SafeMediaDisplay } from './SafeMediaDisplay';

interface PostCardProps {
  post: Post;
  onOpenReport?: (post: Post) => void;
  onSelectUser?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenReport, onSelectUser }) => {
  const { user, isFounder, isAdmin, isModerator } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const hasUpvoted = user ? post.upvotes?.includes(user.uid) : false;
  const hasDownvoted = user ? post.downvotes?.includes(user.uid) : false;
  const canDelete = user && (user.uid === post.authorId || isFounder || isAdmin || isModerator);

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);

    if (type === 'up') {
      if (hasUpvoted) {
        await updateDoc(postRef, {
          upvotes: arrayRemove(user.uid),
          score: (post.score || 0) - 1,
        });
      } else {
        await updateDoc(postRef, {
          upvotes: arrayUnion(user.uid),
          downvotes: arrayRemove(user.uid),
          score: (post.score || 0) + (hasDownvoted ? 2 : 1),
        });
      }
    } else {
      if (hasDownvoted) {
        await updateDoc(postRef, {
          downvotes: arrayRemove(user.uid),
          score: (post.score || 0) + 1,
        });
      } else {
        await updateDoc(postRef, {
          downvotes: arrayUnion(user.uid),
          upvotes: arrayRemove(user.uid),
          score: (post.score || 0) - (hasUpvoted ? 2 : 1),
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return;
    if (confirm('Delete this post?')) {
      setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'posts', post.id));
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`bg-[#131c2e] border ${post.isPinned ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'} rounded-2xl p-4 mb-4 shadow-sm hover:border-slate-700/80 transition-all`}>
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-2">
          <Pin className="w-3.5 h-3.5" />
          <span>Pinned by Staff</span>
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSelectUser && onSelectUser(post.authorId)}
        >
          <UserAvatar username={post.authorUsername} src={post.authorAvatarUrl} size="md" />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-white hover:underline">{post.authorDisplayName}</span>
              <span className="text-xs text-slate-400">@{post.authorUsername}</span>
              {post.authorBadges?.map(badgeId => (
                <BadgeDisplay key={badgeId} badgeId={badgeId} size="sm" />
              ))}
            </div>
            <span className="text-[11px] text-slate-500">{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenReport && (
            <button
              onClick={() => onOpenReport(post)}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg"
              title="Report content"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <p className="mt-3 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {/* Media Attachments */}
      <SafeMediaDisplay mediaUrls={post.mediaUrls} mediaType={post.mediaType} />

      {/* Footer Interactions */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => handleVote('up')}
            className={`p-1.5 rounded flex items-center gap-1 ${hasUpvoted ? 'text-indigo-400 font-bold' : 'hover:text-slate-200'}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{post.upvotes?.length || 0}</span>
          </button>
          <div className="w-[1px] h-3 bg-slate-800" />
          <button
            onClick={() => handleVote('down')}
            className={`p-1.5 rounded flex items-center gap-1 ${hasDownvoted ? 'text-rose-400 font-bold' : 'hover:text-slate-200'}`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{post.downvotes?.length || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <MessageSquare className="w-4 h-4" />
          <span>{post.commentsCount || 0} comments</span>
        </div>
      </div>
    </div>
  );
};
