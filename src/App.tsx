import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { StartupLoadingScreen } from './components/StartupLoadingScreen';
import { AuthModal } from './components/AuthModal';
import { SupportTicketModal } from './components/SupportTicketModal';
import { FeedView } from './views/FeedView';
import { SearchView } from './views/SearchView';
import { NotificationsView } from './views/NotificationsView';
import { MessagesView } from './views/MessagesView';
import { ProfileView } from './views/ProfileView';
import { ModerationView } from './views/ModerationView';
import { SupportDatabaseView } from './views/SupportDatabaseView';
import { SettingsView } from './views/SettingsView';

export function App() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [currentView, setCurrentView] = useState('feed');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleSelectUser = (uid: string) => {
    setSelectedUserId(uid);
    setCurrentView('profile');
  };

  return (
    <AuthProvider>
      {loadingInitial && (
        <StartupLoadingScreen onComplete={() => setLoadingInitial(false)} />
      )}

      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
        <DisclaimerBanner />

        <Navbar
          currentView={currentView}
          setCurrentView={(v) => {
            if (v !== 'profile') setSelectedUserId(null);
            setCurrentView(v);
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenSupportModal={() => setShowSupportModal(true)}
        />

        <main className="flex-1 pb-16">
          {currentView === 'feed' && <FeedView onSelectUser={handleSelectUser} />}
          {currentView === 'search' && <SearchView onSelectUser={handleSelectUser} />}
          {currentView === 'notifications' && <NotificationsView />}
          {currentView === 'messages' && <MessagesView />}
          {currentView === 'profile' && <ProfileView selectedUserId={selectedUserId} />}
          {currentView === 'moderation' && <ModerationView />}
          {currentView === 'support-db' && <SupportDatabaseView />}
          {currentView === 'settings' && <SettingsView />}
        </main>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        <SupportTicketModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
