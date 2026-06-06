import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { LogOut, Disc } from 'lucide-react';

import type { VibeState, Track, UserSpotifyInfo, GalleryItem } from './types';
import { Visualizer } from './components/Visualizer';
import { VibeGrid } from './components/VibeGrid';
import { Sliders } from './components/Sliders';
import { TextureSelector } from './components/TextureSelector';
import { VibeProfile } from './components/VibeProfile';
import { PlaylistView } from './components/PlaylistView';
import { VibeGallery } from './components/VibeGallery';

import { filterLocalMock } from './utils/localMock';
import { publishVibe, getGalleryItems } from './utils/firebase';

const BACKEND_URL = 'http://localhost:3001';

export default function App() {
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
  const [spotifyInfo, setSpotifyInfo] = useState<UserSpotifyInfo | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const debounceTimeoutRef = useRef<number | null>(null);

  // 2. Spotify OAuth Handler
  useEffect(() => {
    // Parse URL Search Params
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    const userId = params.get('user_id');
    const userName = params.get('user_name');

    if (accessToken && refreshToken && userId) {
      const expiresAt = Date.now() + parseInt(expiresIn || '3600') * 1000;
      const info: UserSpotifyInfo = {
        accessToken,
        refreshToken,
        expiresAt,
        userId,
        userName: userName || userId
      };

      // Save to local storage and state
      localStorage.setItem('vibeshift_spotify_info', JSON.stringify(info));
      setSpotifyInfo(info);
      
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Trigger a success confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1db954', '#1ed760', '#ffffff']
      });
    } else {
      // Check local storage for existing session
      const stored = localStorage.getItem('vibeshift_spotify_info');
      if (stored) {
        try {
          const info = JSON.parse(stored) as UserSpotifyInfo;
          // Check expiration
          if (Date.now() < info.expiresAt) {
            setSpotifyInfo(info);
          } else {
            localStorage.removeItem('vibeshift_spotify_info');
          }
        } catch {
          localStorage.removeItem('vibeshift_spotify_info');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vibeshift_spotify_info');
    setSpotifyInfo(null);
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
          language: currentVibe.language
        }
      });

      setTracks(response.data.tracks);
      setSource(response.data.source);
    } catch (error) {
      console.warn("Backend API request failed. Using local client fallback filters:", error);
      // Backend is down, perform client-side filter
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

  // 7. Save Playlist to Spotify via User Access Token
  const handleSaveToSpotify = async (playlistName: string) => {
    if (!spotifyInfo) return null;

    try {
      const trackUris = tracks.map(t => t.uri);
      const response = await axios.post(`${BACKEND_URL}/api/playlist/create`, {
        accessToken: spotifyInfo.accessToken,
        userId: spotifyInfo.userId,
        name: playlistName,
        uris: trackUris
      });

      if (response.data.success) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#6366f1', '#a855f7', '#ec4899']
        });
        return {
          playlistId: response.data.playlistId,
          playlistUrl: response.data.playlistUrl
        };
      }
    } catch (error) {
      console.error("Save playlist failed:", error);
    }
    return null;
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
      {/* 3D WEBGL SHADER BACKGROUND */}
      <Visualizer vibe={vibe} />
      <div className="visualizer-overlay" />

      <div className="app-container">
        {/* HEADER */}
        <header>
          <div className="brand">
            <h1 className="flex items-center gap-2">
              <Disc className="animate-spin text-purple-400" size={32} style={{ animationDuration: '4s' }} />
              VibeShift
            </h1>
            <p>Synesthetic Music Discovery Platform</p>
          </div>

          {spotifyInfo ? (
            <div className="spotify-user-status glass-panel py-2.5 px-4 rounded-xl flex items-center gap-3">
              <span className="spotify-user-dot" />
              <span className="font-mono text-xs text-slate-300">
                Connected: <strong>{spotifyInfo.userName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                title="Disconnect Account"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = `${BACKEND_URL}/api/login`}
              className="btn btn-secondary btn-spotify text-xs py-2 px-4 rounded-xl font-bold"
            >
              Connect Spotify
            </button>
          )}
        </header>

        {/* MAIN INTERACTIVE WORKSPACE */}
        <div className="dashboard-grid">
          {/* LEFT COLUMN: CONTROLS */}
          <div className="controls-column">
            {/* VIBE GRID */}
            <div className="glass-panel">
              <VibeGrid
                energy={vibe.energy}
                valence={vibe.valence}
                onChange={(energy, valence) => setVibe(prev => ({ ...prev, energy, valence }))}
              />
            </div>

            {/* ATMOSPHERIC SLIDERS */}
            <div className="glass-panel">
              <Sliders
                weather={vibe.weather}
                colorTemp={vibe.colorTemp}
                onWeatherChange={w => setVibe(prev => ({ ...prev, weather: w }))}
                onColorTempChange={c => setVibe(prev => ({ ...prev, colorTemp: c }))}
              />
            </div>

            {/* VOCAL TEXTURE SELECTOR */}
            <div className="glass-panel">
              <TextureSelector
                selectedLanguage={vibe.language}
                onChange={lang => setVibe(prev => ({ ...prev, language: lang }))}
              />
            </div>

            {/* VIBE PROFILE METERS */}
            <div className="glass-panel">
              <VibeProfile vibe={vibe} />
            </div>
          </div>

          {/* RIGHT COLUMN: PLAYLIST DISPLAY */}
          <div className="playlist-column">
            <PlaylistView
              tracks={tracks}
              source={source}
              spotifyInfo={spotifyInfo}
              onSaveToSpotify={handleSaveToSpotify}
              onPublishToGallery={handlePublishToGallery}
              loading={loading}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: COMMUNITY FEED */}
        <div className="mt-8">
          <VibeGallery
            items={gallery}
            onLoadVibe={handleLoadVibe}
            onRefresh={refreshGallery}
          />
        </div>
      </div>
    </>
  );
}
