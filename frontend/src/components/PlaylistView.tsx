import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Save, Share2, Disc, ArrowUpRight } from 'lucide-react';
import type { Track, UserSpotifyInfo } from '../types';

interface PlaylistViewProps {
  tracks: Track[];
  source: 'spotify_api' | 'simulated_database';
  spotifyInfo: UserSpotifyInfo | null;
  onSaveToSpotify: (playlistName: string) => Promise<{ playlistId: string; playlistUrl: string } | null>;
  onPublishToGallery: (userName: string, vibeName: string) => Promise<boolean>;
  loading: boolean;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  tracks,
  source,
  spotifyInfo,
  onSaveToSpotify,
  onPublishToGallery,
  loading
}) => {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Modals state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('My Vibe Playlist');
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const [savedPlaylistResult, setSavedPlaylistResult] = useState<{ id: string; url: string } | null>(null);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [vibeName, setVibeName] = useState('Midnight Glow');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play the first track when a new playlist is generated (optional, let's just reset player)
  useEffect(() => {
    if (tracks.length > 0) {
      setActiveTrack(tracks[0]);
    } else {
      setActiveTrack(null);
    }
    stopPreview();
  }, [tracks]);

  // Handle Play/Pause of preview audio
  const handleTrackClick = (track: Track) => {
    if (activeTrack?.id === track.id) {
      // Toggle play/pause if clicking the same track
      if (isPlaying) {
        pausePreview();
      } else {
        playPreview(track);
      }
    } else {
      // Play new track
      setActiveTrack(track);
      playPreview(track);
    }
  };

  const playPreview = (track: Track) => {
    stopPreview();

    if (!track.preview_url) {
      // No preview URL, but we still mark it active for the Iframe Embed
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(track.preview_url);
    audioRef.current = audio;
    setIsPlaying(true);
    
    audio.play().catch(err => {
      console.warn("Autoplay was blocked or audio failed:", err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const pausePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;

    setSavingPlaylist(true);
    const result = await onSaveToSpotify(playlistName);
    setSavingPlaylist(false);
    
    if (result) {
      setSavedPlaylistResult({ id: result.playlistId, url: result.playlistUrl });
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !vibeName.trim()) return;

    setPublishing(true);
    const success = await onPublishToGallery(userName, vibeName);
    setPublishing(false);
    
    if (success) {
      setPublished(true);
      setTimeout(() => {
        setShowPublishModal(false);
        setPublished(false);
      }, 1500);
    }
  };

  const handleConnectSpotify = () => {
    // Redirect to backend auth endpoint
    window.location.href = 'http://localhost:3001/api/login';
  };

  return (
    <div className="glass-panel h-full flex flex-col gap-4" data-index="05 DISPATCH">
      {/* HEADER SECTION */}
      <div className="playlist-header">
        <h3 className="vibe-grid-title">
          <Music size={18} className="text-red-500" />
          DISCOVERED SOUNDS
        </h3>
        {!loading && tracks.length > 0 && (
          <span className={`playlist-source-tag ${source === 'spotify_api' ? 'source-spotify' : 'source-mock'}`}>
            <Disc size={12} className={source === 'spotify_api' ? 'animate-spin' : ''} />
            {source === 'spotify_api' ? 'SPOTIFY API' : 'SIMULATED VIBE'}
          </span>
        )}
      </div>

      {/* TRACKS LIST */}
      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-red-950 border-t-red-600 rounded-none animate-spin" />
          <p className="text-red-500 text-sm font-mono animate-pulse">
            TRANSLATING VIBE TO WAVEFORMS...
          </p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 gap-2 text-center">
          <Music size={36} className="text-slate-700 mb-2" />
          <p className="text-slate-300 font-bold uppercase tracking-wider">No tracks generated</p>
          <p className="text-slate-500 text-xs max-w-xs uppercase font-mono">
            ADJUST THE INTERACTION RETICLE OR SPECTRUM SLIDERS TO DECODE SOUNDS.
          </p>
        </div>
      ) : (
        <>
          <div className="playlist-list flex-grow">
            {tracks.map(track => (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className={`track-card ${activeTrack?.id === track.id ? 'playing' : ''}`}
              >
                <div className="track-album-art">
                  {track.album.images?.[0] ? (
                    <img src={track.album.images[0].url} alt={track.name} />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <Music size={16} />
                    </div>
                  )}
                  <div className="play-overlay">
                    {activeTrack?.id === track.id && isPlaying ? (
                      <Pause size={16} className="text-white fill-white" />
                    ) : (
                      <Play size={16} className="text-white fill-white" />
                    )}
                  </div>
                </div>

                {/* Spinning Vinyl Disc next to active track */}
                {activeTrack?.id === track.id && (
                  <div className="vinyl-container">
                    <div className="vinyl-disc">
                      <div className="vinyl-center" />
                    </div>
                  </div>
                )}

                <div className="track-details">
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">
                    {track.artists.map(a => a.name).join(', ').toUpperCase()}
                  </div>
                </div>
                {track.preview_url && activeTrack?.id === track.id && isPlaying && (
                  <div className="flex gap-[3px] items-end h-3 pr-2">
                    <div className="w-[3px] bg-red-600 animate-[pulse_0.8s_infinite_alternate]" style={{ height: '100%', animationDelay: '0.1s' }} />
                    <div className="w-[3px] bg-red-700 animate-[pulse_0.8s_infinite_alternate]" style={{ height: '70%', animationDelay: '0.3s' }} />
                    <div className="w-[3px] bg-red-500 animate-[pulse_0.8s_infinite_alternate]" style={{ height: '90%', animationDelay: '0.5s' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PHYSICAL TAPE DECK CONTROLLER DISPLAY */}
          {activeTrack && (
            <div className="border border-red-950 bg-black p-3 font-mono text-xs flex flex-col gap-2 relative overflow-hidden">
              {/* Grid dot matrix background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#ff003c 1px, transparent 1px)',
                backgroundSize: '6px 6px'
              }} />
              
              <div className="flex justify-between items-center text-[9px] text-red-500 border-b border-red-950/60 pb-1 z-10">
                <span>CONSOLE MODULE // TAPE-909</span>
                <span className={isPlaying ? 'animate-pulse text-red-500' : 'text-slate-600'}>
                  {isPlaying ? '● SIGNAL ACTIVE' : '■ STANDBY'}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 flex-shrink-0 bg-red-950/40 border border-red-900/40 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
                    <Disc size={15} className="text-red-500" />
                  </div>
                  <div className="truncate">
                    <div className="text-[10px] text-white font-bold uppercase truncate">{activeTrack.name}</div>
                    <div className="text-[8px] text-slate-500 truncate">{activeTrack.artists.map(a => a.name).join(', ').toUpperCase()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleTrackClick(activeTrack)} 
                    className="w-7 h-7 border border-red-900 bg-black hover:bg-red-950/40 text-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title={isPlaying ? "PAUSE PREVIEW" : "PLAY PREVIEW"}
                  >
                    {isPlaying ? <Pause size={11} className="fill-current" /> : <Play size={11} className="fill-current" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATED SPOTIFY EMBED IFRAME PLAYER */}
          {activeTrack && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">
                SPOTIFY PLAYER EXTENSION //
              </span>
              <div className="spotify-embed-container">
                <iframe
                  src={`https://open.spotify.com/embed/track/${activeTrack.id}`}
                  className="spotify-embed-iframe"
                  allow="encrypted-media"
                />
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="player-actions">
            {spotifyInfo ? (
              <button
                onClick={() => {
                  setSavedPlaylistResult(null);
                  setShowSaveModal(true);
                }}
                className="btn btn-primary flex-grow"
              >
                <Save size={16} />
                SAVE TO SPOTIFY
              </button>
            ) : (
              <button
                onClick={handleConnectSpotify}
                className="btn btn-secondary btn-spotify flex-grow"
              >
                <Save size={16} />
                CONNECT SPOTIFY TO SAVE
              </button>
            )}

            <button
              onClick={() => setShowPublishModal(true)}
              className="btn btn-secondary"
              title="Share Vibe with Community"
            >
              <Share2 size={16} />
              PUBLISH VIBE
            </button>
          </div>
        </>
      )}

      {/* SAVE PLAYLIST TO SPOTIFY MODAL */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title flex items-center gap-2">
              <Save className="text-green-500" />
              Save Playlist
            </h3>
            
            {savedPlaylistResult ? (
              <div className="flex flex-col gap-4 text-center py-4">
                <p className="text-green-400 font-medium">Playlist Created Successfully!</p>
                <a
                  href={savedPlaylistResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex justify-center"
                >
                  Open in Spotify
                  <ArrowUpRight size={16} />
                </a>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="btn btn-secondary mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveSubmit} className="flex flex-col gap-4">
                <p className="text-slate-400 text-xs">
                  This will create a new public playlist on your Spotify account: <strong>{spotifyInfo?.userName}</strong>
                </p>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-300">Playlist Name</label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={e => setPlaylistName(e.target.value)}
                    placeholder="Enter playlist name..."
                    className="input-field"
                    required
                  />
                </div>
                <div className="modal-buttons mt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPlaylist}
                    className="btn btn-primary"
                  >
                    {savingPlaylist ? 'Saving...' : 'Create Playlist'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PUBLISH TO GALLERY MODAL */}
      {showPublishModal && (
        <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title flex items-center gap-2">
              <Share2 className="text-purple-400" />
              Publish to Vibe Gallery
            </h3>
            
            {published ? (
              <div className="text-center py-6">
                <p className="text-indigo-400 font-medium text-lg mb-2">Vibe Published!</p>
                <p className="text-slate-400 text-xs">Your vibe has been shared with the community gallery.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishSubmit} className="flex flex-col gap-4">
                <p className="text-slate-400 text-xs">
                  Publishing saves your current visual coordinates, sliders, and track titles to the public vibe gallery.
                </p>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-300">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="E.g., Cosmic Voyager"
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-300">Vibe Title</label>
                  <input
                    type="text"
                    value={vibeName}
                    onChange={e => setVibeName(e.target.value)}
                    placeholder="E.g., Golden Hour Melancholy"
                    className="input-field"
                    required
                  />
                </div>
                <div className="modal-buttons mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={publishing}
                    className="btn btn-primary bg-indigo-600 hover:bg-indigo-700"
                  >
                    {publishing ? 'Publishing...' : 'Publish to Gallery'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
