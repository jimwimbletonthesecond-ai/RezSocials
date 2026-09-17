import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import { CreatePostBox } from '../components/CreatePostBox';
import { PostCard } from '../components/PostCard';
import { CommunityAnnouncementBanner } from '../components/CommunityAnnouncementBanner';
import { ReportModal } from '../components/ReportModal';

interface FeedViewProps {
  onSelectUser: (userId: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onSelectUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Post));
      setPosts(fetchedPosts);
      setLoading(false);
    }, (err) => {
      console.warn('[FEED ERROR]', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <CommunityAnnouncementBanner />
      <CreatePostBox />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#131c2e] border border-slate-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-slate-800 rounded" />
                  <div className="w-16 h-2 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-[#131c2e] border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-300 font-medium">No posts in the community yet.</p>
          <p className="text-slate-500 text-xs mt-1">Be the first to share an update or post with Rezona fans!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onOpenReport={setReportingPost}
              onSelectUser={onSelectUser}
            />
          ))}
        </div>
      )}

      <ReportModal
        post={reportingPost}
        isOpen={Boolean(reportingPost)}
        onClose={() => setReportingPost(null)}
      />
    </div>
  );
};
