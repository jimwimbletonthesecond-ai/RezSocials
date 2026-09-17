import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Calendar, Shield, Edit3 } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { UserProfile, Post } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { BadgeDisplay } from '../components/Badges';
import { PostCard } from '../components/PostCard';
import { BadgeManagerModal } from '../components/BadgeManagerModal';

interface ProfileViewProps {
  selectedUserId?: string | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ selectedUserId }) => {
  const { user, userProfile, isFounder, isAdmin } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBadgeManager, setShowBadgeManager] = useState(false);

  const targetUid = selectedUserId || user?.uid;
  const isOwnProfile = user?.uid === targetUid;
  const canManageBadges = (isFounder || isAdmin) && !isOwnProfile;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'users', targetUid));
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else if (isOwnProfile && userProfile) {
          setProfile(userProfile);
        }

        const postsSnap = await getDocs(query(collection(db, 'posts'), where('authorId', '==', targetUid)));
        const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
        setUserPosts(posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUid, userProfile, isOwnProfile]);

  if (loading) {
    return <div className="text-center py-16 text-slate-500 text-xs">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-400">User profile not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Profile Header Card */}
      <div className="bg-[#131c2e] border border-slate-800 rounded-3xl p-6 mb-6 relative overflow-hidden shadow-xl">
        <div className="h-24 -mt-6 -mx-6 mb-4 bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900 border-b border-slate-800/80" />

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 mb-4">
          <UserAvatar
            username={profile.username}
            src={profile.avatarUrl}
            size="xl"
            className="ring-4 ring-[#131c2e]"
          />

          <div className="flex items-center gap-2">
            {canManageBadges && (
              <button
                onClick={() => setShowBadgeManager(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-900/60 text-indigo-300 rounded-xl text-xs font-medium transition-all"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Manage Badges & Role</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-white">{profile.displayName}</h2>
            <span className="text-slate-400 text-sm">@{profile.username}</span>
          </div>

          <p className="text-slate-300 text-xs mt-2 leading-relaxed max-w-lg">
            {profile.bio || 'Rezona community member.'}
          </p>

          {/* Badges section */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {profile.badges.map(b => (
                <BadgeDisplay key={b} badgeId={b} size="sm" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(profile.joinedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
            <div>
              <strong className="text-white">{userPosts.length}</strong> Posts
            </div>
          </div>
        </div>
      </div>

      {/* User Posts List */}
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Posts by {profile.displayName}
      </h3>

      {userPosts.length === 0 ? (
        <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
          No posts created yet.
        </div>
      ) : (
        <div className="space-y-4">
          {userPosts.map(p => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      <BadgeManagerModal
        user={profile}
        isOpen={showBadgeManager}
        onClose={() => setShowBadgeManager(false)}
        onUpdated={() => {
          // re-fetch
        }}
      />
    </div>
  );
};
