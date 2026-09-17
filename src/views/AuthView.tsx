import React, { useState } from 'react';
import { AuthModal } from '../components/AuthModal';

export const AuthView: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
