import React, { useState } from 'react';
import { Settings, User, Volume2, Palette, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../lib/useAudio';
import { THEMES, ThemeKey } from '../lib/theme';

export const SettingsView: React.FC = () => {
  const { userProfile, updateUserProfileData } = useAuth();
  const { volume, setVolume, isPlaying, toggleBgm } = useAudio();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfileData({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white">Platform Settings</h2>
      </div>

      {/* Profile Settings */}
      <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-4">
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
            Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Avatar Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Audio Settings */}
      <div className="bg-[#131c2e] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-4">
          <Volume2 className="w-4 h-4" />
          <span>Audio & Soundtracks</span>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Ambient Music</span>
            <button
              onClick={toggleBgm}
              className={`px-3 py-1.5 rounded-lg font-medium ${
                isPlaying ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isPlaying ? 'Enabled (Playing)' : 'Disabled'}
            </button>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Master Volume ({Math.round(volume * 100)}%)</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
