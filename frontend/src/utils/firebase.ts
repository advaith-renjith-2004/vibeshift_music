import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit } from 'firebase/firestore';
import type { GalleryItem } from '../types';

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
  console.log("Firebase apiKey not provided. Operating in Local Gallery mode (data stored in LocalStorage).");
}

// Local Storage Fallback Data Manager
const LOCAL_STORAGE_KEY = 'vibeshift_local_gallery';

const getLocalGallery = (): GalleryItem[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    // Seed some initial gallery items to make the gallery look full and active!
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
      },
      {
        id: "seed-2",
        name: "Morning Radiance",
        energy: 0.82,
        valence: 0.85,
        weather: "radiant",
        colorTemp: 0.88,
        language: "ko",
        tracks: [
          { id: "15", name: "Dynamite", artists: [{ name: "BTS" }], album: { name: "BE", images: [{ url: "https://i.scdn.co/image/ab67616d0000b27382d56de466a9a7a9a3b68078" }] }, preview_url: null, uri: "spotify:track:15" }
        ],
        userName: "SolarSurfer",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seedItems));
    return seedItems;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveLocalGallery = (items: GalleryItem[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
};

// EXPORTED METHODS
export const publishVibe = async (vibeItem: Omit<GalleryItem, 'id' | 'createdAt'>): Promise<boolean> => {
  const newItem: GalleryItem = {
    ...vibeItem,
    id: `vibe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      await addDoc(collection(db, 'vibes'), {
        name: newItem.name,
        energy: newItem.energy,
        valence: newItem.valence,
        weather: newItem.weather,
        colorTemp: newItem.colorTemp,
        language: newItem.language,
        tracks: newItem.tracks,
        userName: newItem.userName,
        createdAt: newItem.createdAt
      });
      return true;
    } catch (error) {
      console.error("Firestore publish error, falling back to local storage:", error);
      // Fallback to local storage if Firestore write fails
    }
  }

  // Local Storage Fallback
  const currentList = getLocalGallery();
  currentList.unshift(newItem); // Add to beginning
  saveLocalGallery(currentList.slice(0, 50)); // Cap at 50 local items
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
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          energy: data.energy,
          valence: data.valence,
          weather: data.weather,
          colorTemp: data.colorTemp,
          language: data.language,
          tracks: data.tracks || [],
          userName: data.userName,
          createdAt: data.createdAt
        });
      });

      if (items.length > 0) {
        return items;
      }
      // If Firestore is empty, fall back or return empty
    } catch (error) {
      console.error("Firestore read error, falling back to local storage:", error);
    }
  }

  // Fallback to local storage
  return getLocalGallery();
};
