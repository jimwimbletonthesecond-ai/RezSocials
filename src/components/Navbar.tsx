import React, { useState } from 'react';
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Shield,
  LifeBuoy,
  Settings,
  LogIn,
  LogOut,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';
import { RezSocialsLogo } from './RezSocialsLogo';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../lib/useAudio';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenAuth: () => void;
  onOpenSupportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenAuth,
  onOpenSupportModal,
}) => {
  const { user, userProfile, isFounder, isAdmin, isModerator, logout } = useAuth();
  const { isPlaying, toggleBgm, nextTrack, currentTrack, volume, setVolume } = useAudio();
  const [showAudioControls, setShowAudioControls] = useState(false);

  const isStaff = isFounder || isAdmin || isModerator;

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setCurrentView('feed')}
          className="cursor-pointer flex items-center"
        >
          <RezSocialsLogo size="md" />
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentView('feed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'feed'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setCurrentView('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentView === 'search'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          {user && (
            <>
              <button
                onClick={() => setCurrentView('notifications')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'notifications'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alerts</span>
              </button>

              <button
                onClick={() => setCurrentView('messages')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'messages'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Messages</span>
              </button>
            </>
          )}

          {isStaff && (
            <>
              <button
                onClick={() => setCurrentView('moderation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'moderation'
                    ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Mod Desk</span>
              </button>

              <button
                onClick={() => setCurrentView('support-db')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'support-db'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-indigo-300'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Support DB</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Section: Audio Player, Support, User */}
        <div className="flex items-center gap-2">
          {/* Audio Player Control */}
          <div className="relative">
            <button
              onClick={() => setShowAudioControls(!showAudioControls)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Ambient BGM Player"
            >
              {isPlaying ? <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {showAudioControls && (
              <div className="absolute right-0 mt-2 w-64 bg-[#131c2e] border border-slate-700/80 rounded-2xl p-3 shadow-xl z-50 text-xs">
                <div className="font-semibold text-slate-200 mb-1 truncate">{currentTrack.title}</div>
                <div className="text-[11px] text-slate-400 mb-3">{currentTrack.artist}</div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <button
                    onClick={toggleBgm}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-medium"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play Music'}</span>
                  </button>
                  <button
                    onClick={nextTrack}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title="Next Track"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                  <span>Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Support Ticket Quick Button */}
          <button
            onClick={onOpenSupportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-all"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
            <span>Support</span>
          </button>

          {/* User Auth Info */}
          {user && userProfile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('profile')}
                className="flex items-center gap-2 p-1 pl-2 pr-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full transition-all"
              >
                <UserAvatar username={userProfile.username} src={userProfile.avatarUrl} size="sm" />
                <span className="text-xs text-white font-medium max-w-[90px] truncate">
                  {userProfile.displayName}
                </span>
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-4 py-1.5 rounded-xl text-xs transition-all shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
