import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0035070434",
  databaseId: "ai-studio-rezsocials-91c6c39f-4120-4228-9bd6-637edeb8802e",
  apiKey: "AIzaSyBhXKL6Ezi4axeOh79RaU8kDMnNQAYKId0",
  authDomain: "gen-lang-client-0035070434.firebaseapp.com",
  storageBucket: "gen-lang-client-0035070434.appspot.com"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-rezsocials-91c6c39f-4120-4228-9bd6-637edeb8802e");
export default app;
