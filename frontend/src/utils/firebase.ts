import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { GalleryItem, UserProfile, PlayHistoryItem, Track, VibeState } from '../types';

// Web app's Firebase configuration
// These will be loaded from a .env file or default to a fallback.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vibeshift-f8efb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vibeshift-f8efb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vibeshift-f8efb.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if we have minimum requirements for firebase config
const isFirebaseConfigured = !!firebaseConfig.apiKey;

let db: any = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase, falling back to local storage:", error);
  }
} else {
  console.log("Firebase apiKey not provided. Operating in Local mode.");
}

// Local Storage Fallback Data Managers
const GALLERY_KEY = 'vibeshift_local_gallery';
const PROFILE_KEY = 'vibeshift_user_profile';
const HISTORY_KEY = 'vibeshift_play_history';

const getLocalGallery = (): GalleryItem[] => {
  const data = localStorage.getItem(GALLERY_KEY);
  if (!data) {
    // Seed some initial gallery items
    const seedItems: GalleryItem[] = [
      {
        id: "seed-1",
        name: "Neon Rain",
        energy: 0.35,
        valence: 0.28,
        weather: "rain",
        colorTemp: 0.15,
        language: "ja",
        tracks: [
          { id: "10", name: "Plastic Love", artists: [{ name: "Mariya Takeuchi" }], album: { name: "Variety", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e86c06df9a57fb6c84b12b5b" }] }, preview_url: null, uri: "spotify:track:10" },
          { id: "1", name: "Rosyln", artists: [{ name: "Bon Iver" }], album: { name: "New Moon", images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b4b84b8d7ef2049e6d87ef9c" }] }, preview_url: null, uri: "spotify:track:1" }
        ],
        userName: "VibeCreator",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
    localStorage.setItem(GALLERY_KEY, JSON.stringify(seedItems));
    return seedItems;
  }
  try { return JSON.parse(data); } catch { return []; }
};

const saveLocalGallery = (items: GalleryItem[]) => {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
};

// EXPORTED METHODS FOR GALLERY
export const publishVibe = async (vibeItem: Omit<GalleryItem, 'id' | 'createdAt'>): Promise<boolean> => {
  const newItem: GalleryItem = {
    ...vibeItem,
    id: `vibe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      await addDoc(collection(db, 'vibes'), newItem);
      return true;
    } catch (error) {
      console.error("Firestore publish error:", error);
    }
  }

  const currentList = getLocalGallery();
  currentList.unshift(newItem);
  saveLocalGallery(currentList.slice(0, 50));
  return true;
};

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  if (db) {
    try {
      const vibesRef = collection(db, 'vibes');
      const q = query(vibesRef, orderBy('createdAt', 'desc'), limit(12));
      const querySnapshot = await getDocs(q);
      const items: GalleryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as GalleryItem);
      });
      if (items.length > 0) return items;
    } catch (error) {
      console.error("Firestore read error:", error);
    }
  }
  return getLocalGallery();
};

// USER PROFILE MANAGEMENT
export const saveUserProfile = async (profile: UserProfile): Promise<boolean> => {
  if (db) {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error("Firestore profile save error:", error);
    }
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return true;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (db) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error("Firestore profile read error:", error);
    }
  }
  const localData = localStorage.getItem(PROFILE_KEY);
  return localData ? JSON.parse(localData) : null;
};

// PLAY HISTORY MANAGEMENT
export const addToHistory = async (uid: string, track: Track, vibe: VibeState): Promise<void> => {
  const historyItem: PlayHistoryItem = {
    track,
    playedAt: new Date().toISOString(),
    vibeSnapshot: {
      energy: vibe.energy,
      valence: vibe.valence,
      weather: vibe.weather
    }
  };

  if (db) {
    try {
      await addDoc(collection(db, 'users', uid, 'history'), historyItem);
    } catch (error) {
      console.error("Firestore history save error:", error);
    }
  }

  // Update local history
  const localHistoryRaw = localStorage.getItem(HISTORY_KEY);
  const localHistory: PlayHistoryItem[] = localHistoryRaw ? JSON.parse(localHistoryRaw) : [];
  localHistory.unshift(historyItem);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(localHistory.slice(0, 100)));
};

export const getPlayHistory = async (uid: string): Promise<PlayHistoryItem[]> => {
  if (db) {
    try {
      const historyRef = collection(db, 'users', uid, 'history');
      const q = query(historyRef, orderBy('playedAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const items: PlayHistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data() as PlayHistoryItem);
      });
      if (items.length > 0) return items;
    } catch (error) {
      console.error("Firestore history read error:", error);
    }
  }
  const localData = localStorage.getItem(HISTORY_KEY);
  return localData ? JSON.parse(localData) : [];
};
