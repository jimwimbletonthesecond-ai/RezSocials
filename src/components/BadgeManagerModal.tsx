import React from 'react';
import { X } from 'lucide-react';
import { UserProfile } from '../types';
import { BadgePermissionsManager } from './BadgePermissionsManager';

interface BadgeManagerModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const BadgeManagerModal: React.FC<BadgeManagerModalProps> = ({ user, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#131c2e] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <BadgePermissionsManager targetUser={user} onUpdated={onUpdated} />
      </div>
    </div>
  );
};
