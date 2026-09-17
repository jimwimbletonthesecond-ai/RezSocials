import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User as UserIcon, FileText } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post, UserProfile } from '../types';
import { PostCard } from '../components/PostCard';
import { UserAvatar } from '../components/UserAvatar';
import { BadgeDisplay } from '../components/Badges';

export const SearchView: React.FC<{ onSelectUser: (userId: string) => void }> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'posts' | 'users'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postsSnap = await getDocs(query(collection(db, 'posts')));
        const pList = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setPosts(pList);

        const usersSnap = await getDocs(query(collection(db, 'users')));
        const uList = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setUsers(uList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = posts.filter(p =>
    p.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.authorUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.authorDisplayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="relative mb-6">
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search posts, discussions, or members..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-[#131c2e] border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTab('posts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            tab === 'posts'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Posts ({filteredPosts.length})</span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            tab === 'users'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Members ({filteredUsers.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Searching database...</div>
      ) : tab === 'posts' ? (
        filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No posts matched your search.</div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(p => (
              <PostCard key={p.id} post={p} onSelectUser={onSelectUser} />
            ))}
          </div>
        )
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">No community members matched your search.</div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(u => (
            <div
              key={u.uid}
              onClick={() => onSelectUser(u.uid)}
              className="bg-[#131c2e] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <UserAvatar username={u.username} src={u.avatarUrl} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{u.displayName}</span>
                    <span className="text-xs text-slate-400">@{u.username}</span>
                  </div>
                  {u.bio && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{u.bio}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {u.badges?.slice(0, 2).map(b => (
                  <BadgeDisplay key={b} badgeId={b} size="sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
