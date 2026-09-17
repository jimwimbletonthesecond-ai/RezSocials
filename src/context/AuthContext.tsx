import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isFounder: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DESIGNATED_FOUNDER_UID = 'vpnedgte3ESqRQyp5RAGkBaqN3d2';
const DESIGNATED_FOUNDER_EMAIL = '1.1.1.theoneandonlyusername.1.1.1@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isFounder = Boolean(
    user?.uid === DESIGNATED_FOUNDER_UID ||
    user?.email?.toLowerCase() === DESIGNATED_FOUNDER_EMAIL ||
    userProfile?.role === 'founder'
  );

  const isAdmin = Boolean(isFounder || userProfile?.role === 'admin');
  const isModerator = Boolean(isAdmin || userProfile?.role === 'moderator');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or listen to user profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const unDoc = onSnapshot(userRef, async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            // Enforce founder role if designated account
            if (currentUser.uid === DESIGNATED_FOUNDER_UID || currentUser.email?.toLowerCase() === DESIGNATED_FOUNDER_EMAIL) {
              if (data.role !== 'founder' || !data.badges.includes('founder')) {
                data.role = 'founder';
                if (!data.badges.includes('founder')) data.badges.push('founder');
                await updateDoc(userRef, { role: 'founder', badges: data.badges }).catch(() => {});
              }
            }
            setUserProfile(data);
          } else {
            // Register order via server API
            let assignedRole: UserRole = 'user';
            let assignedBadges: string[] = [];

            try {
              const token = await currentUser.getIdToken();
              const regRes = await fetch('/api/auth/register-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  uid: currentUser.uid,
                  email: currentUser.email,
                  username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                }),
              });
              if (regRes.ok) {
                const regData = await regRes.json();
                assignedRole = regData.role || 'user';
                assignedBadges = regData.badges || [];
              }
            } catch (err) {
              console.warn('[REGISTRATION SYNC]', err);
            }

            if (currentUser.uid === DESIGNATED_FOUNDER_UID || currentUser.email?.toLowerCase() === DESIGNATED_FOUNDER_EMAIL) {
              assignedRole = 'founder';
              assignedBadges = ['founder'];
            }

            const newProfile: UserProfile = {
              uid: currentUser.uid,
              username: currentUser.displayName?.toLowerCase().replace(/\s+/g, '_') || `user_${currentUser.uid.slice(0, 5)}`,
              displayName: currentUser.displayName || 'Rezona Member',
              email: currentUser.email || '',
              bio: 'Hello! I am a member of the RezSocials community.',
              role: assignedRole,
              badges: assignedBadges,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isVerified: assignedRole === 'founder',
              joinedAt: new Date().toISOString(),
              themePreference: 'dark',
              audioPreferences: {
                masterVolume: 0.5,
                bgmEnabled: true,
                sfxEnabled: true,
              },
            };

            await setDoc(userRef, newProfile).catch(console.error);
            setUserProfile(newProfile);
          }
          setIsLoading(false);
        });

        return () => unDoc();
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const signup = async (email: string, pass: string, username: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await updateFirebaseProfile(cred.user, { displayName });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    setUserProfile(prev => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isFounder,
        isAdmin,
        isModerator,
        login,
        signup,
        logout,
        updateUserProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
