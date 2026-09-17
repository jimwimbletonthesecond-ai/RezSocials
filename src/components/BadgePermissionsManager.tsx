import React, { useState } from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { SYSTEM_BADGES } from '../data/badges';
import { BadgeDisplay } from './Badges';

interface BadgePermissionsManagerProps {
  targetUser: UserProfile;
  onUpdated?: () => void;
}

export const BadgePermissionsManager: React.FC<BadgePermissionsManagerProps> = ({ targetUser, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  const toggleBadge = async (badgeId: string) => {
    if (badgeId === 'founder') {
      alert('The Founder badge is exclusively tied to the platform founder.');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', targetUser.uid);
      const hasBadge = targetUser.badges?.includes(badgeId);

      if (hasBadge) {
        await updateDoc(userRef, {
          badges: arrayRemove(badgeId),
        });
      } else {
        await updateDoc(userRef, {
          badges: arrayUnion(badgeId),
        });
      }
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (targetUser.role === 'founder' || newRole === 'founder') {
      alert('Founder role is permanently locked.');
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userRef, { role: newRole });
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
      <div className="flex items-center gap-2 text-indigo-400 font-semibold">
        <ShieldCheck className="w-4 h-4" />
        <span>Staff Management: @{targetUser.username}</span>
      </div>

      <div>
        <label className="block text-slate-400 mb-1.5 font-medium">User Role</label>
        <select
          value={targetUser.role}
          disabled={targetUser.role === 'founder' || loading}
          onChange={e => updateRole(e.target.value as UserRole)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
          {targetUser.role === 'founder' && <option value="founder">Founder</option>}
        </select>
      </div>

      <div>
        <label className="block text-slate-400 mb-1.5 font-medium">Assigned Badges</label>
        <div className="flex flex-wrap gap-2">
          {SYSTEM_BADGES.map(b => {
            const isAssigned = targetUser.badges?.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBadge(b.id)}
                disabled={loading || b.id === 'founder'}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                  isAssigned
                    ? 'border-indigo-500/50 bg-indigo-950/40 text-indigo-200'
                    : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'
                }`}
              >
                <BadgeDisplay badgeId={b.id} size="sm" />
                <span>{isAssigned ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
