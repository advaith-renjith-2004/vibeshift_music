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
    <div className="glass-panel h-full flex flex-col gap-4">
      {/* HEADER SECTION */}
      <div className="playlist-header">
        <h3 className="vibe-grid-title">
          <Music size={18} className="text-purple-400" />
          Synesthetic Playlist
        </h3>
        {!loading && tracks.length > 0 && (
          <span className={`playlist-source-tag ${source === 'spotify_api' ? 'source-spotify' : 'source-mock'}`}>
            <Disc size={12} className={source === 'spotify_api' ? 'animate-spin' : ''} />
            {source === 'spotify_api' ? 'Spotify API' : 'Simulated Vibe'}
          </span>
        )}
      </div>

      {/* TRACKS LIST */}
      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-mono animate-pulse">
            Tuning into the environment...
          </p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 gap-2 text-center">
          <Music size={36} className="text-slate-600 mb-2" />
          <p className="text-slate-300 font-medium">No tracks generated yet</p>
          <p className="text-slate-500 text-xs max-w-xs">
            Adjust the vibe grid or sliders to start discovering custom sounds.
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
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
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
                <div className="track-details">
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">
                    {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
                {track.preview_url && activeTrack?.id === track.id && isPlaying && (
                  <div className="flex gap-[3px] items-end h-3 pr-2">
                    <div className="w-[3px] bg-indigo-500 rounded-full animate-[pulse_0.8s_infinite_alternate]" style={{ height: '100%', animationDelay: '0.1s' }} />
                    <div className="w-[3px] bg-purple-500 rounded-full animate-[pulse_0.8s_infinite_alternate]" style={{ height: '70%', animationDelay: '0.3s' }} />
                    <div className="w-[3px] bg-pink-500 rounded-full animate-[pulse_0.8s_infinite_alternate]" style={{ height: '90%', animationDelay: '0.5s' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* INTEGRATED SPOTIFY EMBED IFRAME PLAYER */}
          {activeTrack && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                SPOTIFY PLAYER
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
                Save to Spotify
              </button>
            ) : (
              <button
                onClick={handleConnectSpotify}
                className="btn btn-secondary btn-spotify flex-grow"
              >
                <Save size={16} />
                Connect Spotify to Save
              </button>
            )}

            <button
              onClick={() => setShowPublishModal(true)}
              className="btn btn-secondary"
              title="Share Vibe with Community"
            >
              <Share2 size={16} />
              Publish Vibe
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
