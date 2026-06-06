import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { Disc, User } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import type { VibeState, Track, GalleryItem, UserProfile } from './types';
import { Visualizer } from './components/Visualizer';
import { VibeGrid } from './components/VibeGrid';
import { Sliders } from './components/Sliders';
import { TextureSelector } from './components/TextureSelector';
import { VibeProfile } from './components/VibeProfile';
import { PlaylistView } from './components/PlaylistView';
import { VibeGallery } from './components/VibeGallery';
import { GeometricVisualizer } from './components/GeometricVisualizer';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { UserProfileModal } from './components/UserProfileModal';

import { filterLocalMock } from './utils/localMock';
import { publishVibe, getGalleryItems, saveUserProfile, getUserProfile, addToHistory } from './utils/firebase';

import { BACKEND_URL } from './config';

export default function App() {
  // PWA: Service Worker update hook
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    if (needRefresh[0]) setShowUpdateBanner(true);
  }, [needRefresh]);

  // 1. Core State
  const [vibe, setVibe] = useState<VibeState>({
    energy: 0.5,
    valence: 0.5,
    weather: 'cloudy',
    colorTemp: 0.5,
    language: 'en'
  });

  const [tracks, setTracks] = useState<Track[]>([]);
  const [source, setSource] = useState<'spotify_api' | 'simulated_database'>('simulated_database');
  const [loading, setLoading] = useState(false);

  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // USER PROFILE STATE
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Apply Theme
  useEffect(() => {
    if (user?.theme === 'custom' && user.customColor) {
      document.documentElement.setAttribute('data-theme', 'custom');
      document.documentElement.style.setProperty('--accent-color', user.customColor);
      // Generate dim and glow versions for the custom color
      document.documentElement.style.setProperty('--accent-dim', `${user.customColor}26`); // ~15% opacity
      document.documentElement.style.setProperty('--accent-glow', `${user.customColor}66`); // ~40% opacity
    } else if (user?.theme) {
      document.documentElement.setAttribute('data-theme', user.theme);
      // Clear custom properties if not in custom mode
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--accent-dim');
      document.documentElement.style.removeProperty('--accent-glow');
    } else {
      document.documentElement.setAttribute('data-theme', 'rose');
    }
  }, [user?.theme, user?.customColor]);

  // Initialize/Load User Profile
  useEffect(() => {
    const initUser = async () => {
      // Check for existing UID in local storage
      let uid = localStorage.getItem('vibeshift_uid');
      if (!uid) {
        uid = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('vibeshift_uid', uid);
      }

      const profile = await getUserProfile(uid);
      if (profile) {
        setUser(profile);
      } else {
        // Create initial default profile
        const defaultProfile: UserProfile = {
          uid,
          name: 'Vibe Explorer',
          email: 'explorer@vibeshift.io',
          theme: 'rose'
        };
        setUser(defaultProfile);
        await saveUserProfile(defaultProfile);
      }
    };
    initUser();
  }, []);

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    // Optimistically update local state for instant theme feedback
    setUser(updatedProfile);
    const success = await saveUserProfile(updatedProfile);
    return success;
  };

  // Scroll reaction states for header glitching/floating
  const [headerText, setHeaderText] = useState('VIBESHIFT');
  const [taglineText, setTaglineText] = useState('SYNESTHETIC MUSIC DISCOVERY PLATFORM');
  const [scrollSkew, setScrollSkew] = useState(0);
  const [scrollSpacing, setScrollSpacing] = useState(0.1);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle');

  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<number | null>(null);
  const decodeHeaderIntervalRef = useRef<number | null>(null);
  const decodeTaglineIntervalRef = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // Helper for cascading cyber decode reveal
  const startDecode = (
    targetText: string,
    setTextFn: React.Dispatch<React.SetStateAction<string>>,
    pool: string,
    intervalRef: React.MutableRefObject<number | null>,
    speed = 30,
    charsPerStep = 1
  ) => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    
    let currentIteration = 0;
    const totalChars = targetText.length;
    
    intervalRef.current = window.setInterval(() => {
      setTextFn(() => {
        return targetText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < currentIteration) {
              return char;
            }
            if (Math.random() < 0.15) return ' ';
            return pool[Math.floor(Math.random() * pool.length)];
          })
          .join('');
      });
      
      currentIteration += charsPerStep;
      
      if (currentIteration >= totalChars + 2) {
        setTextFn(targetText);
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, speed);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Reset states at top of page
      if (currentScrollY < 10) {
        setScrollSkew(0);
        setScrollSpacing(0.1);
        setScrollDirection('idle');
        return;
      }

      // Calculate skew and spacing based on scroll velocity and position
      const targetSkew = Math.max(-12, Math.min(12, velocity * 0.22));
      setScrollSkew(targetSkew);
      
      const targetSpacing = 0.1 + Math.min(0.22, currentScrollY * 0.0004);
      setScrollSpacing(targetSpacing);

      // Determine scroll direction
      const direction = velocity > 0 ? 'down' : 'up';
      setScrollDirection(direction);

      // Clear any running decode animations during active scroll
      if (decodeHeaderIntervalRef.current) {
        window.clearInterval(decodeHeaderIntervalRef.current);
        decodeHeaderIntervalRef.current = null;
      }
      if (decodeTaglineIntervalRef.current) {
        window.clearInterval(decodeTaglineIntervalRef.current);
        decodeTaglineIntervalRef.current = null;
      }

      // Glitch the header text while scrolling!
      if (Math.abs(velocity) > 1.5) {
        const titleChars = 'VIBESHIFT';
        // Select glitch pool based on direction
        const glitchPool = direction === 'down' 
          ? '01#_[]{}<>/\\|◆▲▼■●★◇$@&%!' 
          : '♩♪♫♬♭♮♯°ø~≈±∽∞⌒‾_⁻₊=~';

        const glitchedTitle = titleChars.split('').map((char) => {
          if (char === ' ') return ' ';
          return Math.random() < 0.4 ? glitchPool[Math.floor(Math.random() * glitchPool.length)] : char;
        }).join('');
        
        setHeaderText(glitchedTitle);

        const tagline = direction === 'down' 
          ? '[SYS_DN: DOWNLINK_LOAD]' 
          : '[SYS_UP: UPLINK_SYNC]';
        
        const glitchedTagline = tagline.split('').map((char) => {
          if (char === ' ') return ' ';
          return Math.random() < 0.2 ? glitchPool[Math.floor(Math.random() * glitchPool.length)] : char;
        }).join('');
        setTaglineText(glitchedTagline);
      }

      // Reset text with a digital decode reveal when scrolling stops
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        setScrollDirection('idle');
        setScrollSkew(0);
        
        const glitchPool = direction === 'down' 
          ? '01#_[]{}<>/\\|◆▲▼■●★◇$@&%!' 
          : '♩♪♫♬♭♮♯°ø~≈±∽∞⌒‾_⁻₊=~';

        startDecode('VIBESHIFT', setHeaderText, glitchPool, decodeHeaderIntervalRef, 40, 1);
        startDecode('SYNESTHETIC MUSIC DISCOVERY PLATFORM', setTaglineText, glitchPool, decodeTaglineIntervalRef, 25, 2);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      if (decodeHeaderIntervalRef.current) window.clearInterval(decodeHeaderIntervalRef.current);
      if (decodeTaglineIntervalRef.current) window.clearInterval(decodeTaglineIntervalRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const header = headerRef.current;
    if (!header) return;
    const rect = header.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const relativeX = (x / rect.width) - 0.5;
    const relativeY = (y / rect.height) - 0.5;
    
    header.style.setProperty('--rx', `${relativeY * -12}deg`);
    header.style.setProperty('--ry', `${relativeX * 12}deg`);
    header.style.setProperty('--tx', `${relativeX * 15}px`);
    header.style.setProperty('--ty', `${relativeY * 8}px`);
    header.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
    header.style.setProperty('--my', `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    const header = headerRef.current;
    if (!header) return;
    header.style.setProperty('--rx', '0deg');
    header.style.setProperty('--ry', '0deg');
    header.style.setProperty('--tx', '0px');
    header.style.setProperty('--ty', '0px');
    header.style.setProperty('--mx', '50%');
    header.style.setProperty('--my', '50%');
  };

  const getDiscStyle = () => {
    if (scrollDirection === 'down') {
      return { animation: 'spin 0.8s linear infinite', color: 'var(--accent-color)' };
    }
    if (scrollDirection === 'up') {
      return { animation: 'spin-reverse 0.8s linear infinite', color: '#00f6ff' };
    }
    return { animation: 'spin 4s linear infinite', color: 'var(--accent-color)' };
  };

  const debounceTimeoutRef = useRef<number | null>(null);
  // Track recently played IDs (up to 20) — stored in a ref to avoid re-renders
  const recentPlayedIdsRef = useRef<string[]>([]);

  const handleTrackPlay = (trackId: string) => {
    const ids = recentPlayedIdsRef.current;
    // Remove if already present to avoid duplicates, then prepend
    const filtered = ids.filter(id => id !== trackId);
    recentPlayedIdsRef.current = [trackId, ...filtered].slice(0, 20);

    // PERSIST PLAY TO FIREBASE HISTORY
    if (user) {
      const playedTrack = tracks.find(t => t.id === trackId);
      if (playedTrack) {
        addToHistory(user.uid, playedTrack, vibe);
      }
    }
  };



  // 3. Fetch Recommendations (with Client Credentials or Local Fallback)
  const fetchRecommendations = useCallback(async (currentVibe: VibeState) => {
    setLoading(true);
    
    // Map vibe states to numbers matching the algorithm
    let acousticVal = 0.5;
    let instrumentalVal = 0.0;
    let danceVal = 0.5;
    let tempoMod = 0;

    switch (currentVibe.weather) {
      case 'thunderstorm':
        acousticVal = 0.9;
        instrumentalVal = 0.7;
        danceVal = 0.15;
        tempoMod = -15;
        break;
      case 'rain':
        acousticVal = 0.75;
        instrumentalVal = 0.4;
        danceVal = 0.35;
        tempoMod = -8;
        break;
      case 'cloudy':
        acousticVal = 0.45;
        instrumentalVal = 0.2;
        danceVal = 0.55;
        tempoMod = 0;
        break;
      case 'clear':
        acousticVal = 0.15;
        instrumentalVal = 0.05;
        danceVal = 0.75;
        tempoMod = 8;
        break;
      case 'radiant':
        acousticVal = 0.0;
        instrumentalVal = 0.0;
        danceVal = 0.95;
        tempoMod = 15;
        break;
    }

    if (currentVibe.language === 'silence') {
      instrumentalVal = Math.max(instrumentalVal, 0.92);
    }

    // Color Temp base BPM
    const baseBpm = 70 + currentVibe.colorTemp * 85;
    const finalBpm = baseBpm + tempoMod;

    // Adjust danceability with energy
    const finalDance = Math.min(1.0, danceVal * 0.4 + currentVibe.energy * 0.6);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/recommendations`, {
        params: {
          energy: currentVibe.energy,
          valence: currentVibe.valence,
          acousticness: acousticVal,
          instrumentalness: instrumentalVal,
          tempo: finalBpm,
          danceability: finalDance,
          language: currentVibe.language,
          weather: currentVibe.weather,
          played: recentPlayedIdsRef.current.join(',')
        }
      });

      setTracks(response.data.tracks);
      setSource(response.data.source as 'spotify_api' | 'simulated_database');
    } catch (error) {
      console.warn("Backend API request failed. Using local client fallback:", error);
      const clientMockTracks = filterLocalMock(currentVibe);
      setTracks(clientMockTracks);
      setSource('simulated_database');
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. Debounce Trigger on Vibe changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      fetchRecommendations(vibe);
    }, 1000); // 1-second debounce

    return () => {
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [vibe, fetchRecommendations]);

  // 5. Load Gallery Feed
  const refreshGallery = useCallback(async () => {
    const items = await getGalleryItems();
    setGallery(items);
  }, []);

  useEffect(() => {
    refreshGallery();
  }, [refreshGallery]);

  // 6. Load Vibe from Gallery Item
  const handleLoadVibe = (item: GalleryItem) => {
    setVibe({
      energy: item.energy,
      valence: item.valence,
      weather: item.weather,
      colorTemp: item.colorTemp,
      language: item.language
    });

    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  };

  // 8. Publish Vibe to Gallery (Firestore or LocalStorage)
  const handlePublishToGallery = async (userName: string, vibeTitle: string) => {
    const success = await publishVibe({
      name: vibeTitle,
      energy: vibe.energy,
      valence: vibe.valence,
      weather: vibe.weather,
      colorTemp: vibe.colorTemp,
      language: vibe.language,
      tracks: tracks.slice(0, 5), // Save top 5 track references for display
      userName: userName
    });

    if (success) {
      refreshGallery();
    }
    return success;
  };

  return (
    <>
      {/* Moving Film Grain Overlay */}
      <div className="grain-overlay" />

      {/* 3D WEBGL SHADER BACKGROUND */}
      <Visualizer vibe={vibe} />
      <div className="visualizer-overlay" />

      <div className="app-container">
        {/* HEADER */}
        <header 
          ref={headerRef}
          className={`sticky-header scroll-dir-${scrollDirection}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="brand">
            <h1 
              className="flex items-center gap-2"
              style={{ 
                transform: `skewX(${scrollSkew}deg)`, 
                letterSpacing: `${scrollSpacing}em`,
                transition: 'transform 0.08s ease-out, letter-spacing 0.08s ease-out'
              }}
            >
              <Disc size={32} style={getDiscStyle()} />
              {headerText}
            </h1>
            <p
              style={{
                letterSpacing: `${scrollSpacing * 2.2}em`,
                transition: 'letter-spacing 0.08s ease-out'
              }}
            >
              {taglineText}
            </p>
          </div>

          <div className="header-actions">
            {/* USER PROFILE BUTTON */}
            <button 
              onClick={() => setShowProfileModal(true)}
              className="header-profile-btn"
            >
              <User size={14} />
              <span className="profile-text">
                PROFILE
              </span>
            </button>

            <div className="header-youtube-status">
              <svg 
                viewBox="0 0 24 24" 
                width="14" 
                height="14" 
                fill="currentColor"
              >
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="youtube-text">
                YOUTUBE
              </span>
            </div>
          </div>
        </header>

        {/* MAIN INTERACTIVE WORKSPACE */}
        <div className="dashboard-grid">
          {/* LEFT COLUMN: CONTROLS */}
          <div className="controls-column">
            {/* VIBE GRID */}
            <div className="glass-panel" data-index="01 CONTROL">
              <VibeGrid
                energy={vibe.energy}
                valence={vibe.valence}
                onChange={(energy, valence) => setVibe(prev => ({ ...prev, energy, valence }))}
              />
            </div>

            {/* ATMOSPHERIC SLIDERS */}
            <div className="glass-panel" data-index="02 ATMOSPHERE">
              <Sliders
                weather={vibe.weather}
                colorTemp={vibe.colorTemp}
                onWeatherChange={w => setVibe(prev => ({ ...prev, weather: w }))}
                onColorTempChange={c => setVibe(prev => ({ ...prev, colorTemp: c }))}
              />
            </div>

            {/* VOCAL TEXTURE SELECTOR */}
            <div className="glass-panel" data-index="03 TEXTURE">
              <TextureSelector
                selectedLanguage={vibe.language}
                onChange={lang => setVibe(prev => ({ ...prev, language: lang }))}
              />
            </div>

            {/* VIBE PROFILE METERS */}
            <div className="glass-panel" data-index="04 METRICS">
              <VibeProfile vibe={vibe} />
            </div>
          </div>

          {/* RIGHT COLUMN: PLAYLIST DISPLAY */}
          <div className="playlist-column">
            <PlaylistView
              tracks={tracks}
              source={source}
              onPublishToGallery={handlePublishToGallery}
              loading={loading}
              onTrackPlay={handleTrackPlay}
            />

            {/* Spektrum Oscilloscope Visualizer module */}
            <div className="glass-panel" data-index="06 ANALYZER">
              <GeometricVisualizer vibe={vibe} />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: COMMUNITY FEED */}
        <div className="mt-8 glass-panel" data-index="07 REGISTRY">
          <VibeGallery
            items={gallery}
            onLoadVibe={handleLoadVibe}
            onRefresh={refreshGallery}
          />
        </div>

        {/* FOOTER */}
        <footer className="vibeshift-footer">
          <div className="footer-inner">
            <span className="footer-brand">VIBESHIFT</span>
            <span className="footer-divider">//</span>
            <span className="footer-copy">© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
            <span className="footer-divider">·</span>
            <span className="footer-credit">CRAFTED BY <strong className="footer-author">ADVAITH</strong></span>
          </div>
          <div className="footer-sub">SYNESTHETIC MUSIC DISCOVERY PLATFORM — POWERED BY YOUTUBE</div>
        </footer>
      </div>

      {/* MODALS */}
      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* PWA: Install prompt banner */}
      <PWAInstallPrompt />

      {/* PWA: Update available banner */}
      {showUpdateBanner && (
        <div className="pwa-update-banner">
          <span>⚡ UPDATE AVAILABLE</span>
          <button
            className="pwa-update-btn"
            onClick={() => { updateServiceWorker(true); setShowUpdateBanner(false); }}
          >
            RELOAD
          </button>
          <button className="pwa-dismiss-btn" onClick={() => setShowUpdateBanner(false)}>✕</button>
        </div>
      )}
    </>
  );
}
