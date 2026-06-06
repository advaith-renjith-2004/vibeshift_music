import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Save, Share2, Disc, ArrowUpRight, SkipBack, SkipForward } from 'lucide-react';
import axios from 'axios';
import type { Track } from '../types';

interface PlaylistViewProps {
  tracks: Track[];
  source: 'spotify_api' | 'simulated_database' | string;
  onPublishToGallery: (userName: string, vibeName: string) => Promise<boolean>;
  loading: boolean;
  onTrackPlay?: (trackId: string) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  tracks,
  source,
  onPublishToGallery,
  loading,
  onTrackPlay
}) => {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // YouTube player states
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [youtubeThumbnails, setYoutubeThumbnails] = useState<Record<string, string>>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportName, setExportName] = useState('My Vibe Playlist');
  const [exportingPlaylist, setExportingPlaylist] = useState(false);
  const [exportedPlaylistUrl, setExportedPlaylistUrl] = useState<string | null>(null);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [vibeName, setVibeName] = useState('Midnight Glow');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Synchronize playing state with YouTube iframe via postMessage
  useEffect(() => {
    if (youtubeVideoId && iframeRef.current && iframeRef.current.contentWindow) {
      try {
        if (isPlaying) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
            '*'
          );
        } else {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
            '*'
          );
        }
      } catch (err) {
        console.warn("Failed to post message to YouTube iframe:", err);
      }
    }
  }, [isPlaying, youtubeVideoId]);

  // Auto-play/load first track and reset YouTube resolver
  useEffect(() => {
    if (tracks.length > 0) {
      setActiveTrack(tracks[0]);
    } else {
      setActiveTrack(null);
    }
    stopPreview();
    setYoutubeVideoId(null);
  }, [tracks]);

  // Query YouTube Video ID when activeTrack changes
  useEffect(() => {
    if (activeTrack) {
      // If track already has a youtube videoId embedded (from youtube_live source), use it directly
      if ((activeTrack as any).youtubeVideoId) {
        setYoutubeVideoId((activeTrack as any).youtubeVideoId);
        return;
      }
      setYoutubeVideoId(null);
      const query = `${activeTrack.artists.map(a => a.name).join(' ')} ${activeTrack.name} audio`;
      axios.get('http://localhost:3001/api/youtube/search', { params: { q: query } })
        .then(res => {
          if (res.data.videoId) {
            setYoutubeVideoId(res.data.videoId);
          }
        })
        .catch(err => {
          console.error("YouTube search fetch failed:", err);
        });
    }
  }, [activeTrack]);

  // Query YouTube Video IDs in bulk for all tracks in the playlist to use as artwork thumbnails
  useEffect(() => {
    if (tracks.length > 0) {
      const payload = tracks.map(t => ({
        name: t.name,
        artist: t.artists.map(a => a.name).join(' ')
      }));
      axios.post('http://localhost:3001/api/youtube/playlist', { tracks: payload })
        .then(res => {
          if (res.data.videoIds && Array.isArray(res.data.videoIds)) {
            const newMapping: Record<string, string> = {};
            tracks.forEach((track, index) => {
              const id = res.data.videoIds[index];
              if (id) {
                newMapping[track.id] = id;
              }
            });
            setYoutubeThumbnails(newMapping);
          }
        })
        .catch(err => {
          console.error("Failed to load bulk YouTube thumbnails:", err);
        });
    }
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
    // Notify parent of the played track for history tracking
    if (onTrackPlay) onTrackPlay(track.id);

    setIsPlaying(true);

    if (!track.preview_url) {
      // YouTube live track - playback handled by iframe autoplay / postMessage
      return;
    }

    const audio = new Audio(track.preview_url);
    audioRef.current = audio;
    
    audio.play().catch(err => {
      console.warn("Autoplay was blocked or audio failed:", err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const pausePreview = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopPreview = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const handleNextTrack = () => {
    if (!activeTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    setActiveTrack(nextTrack);
    playPreview(nextTrack);
  };

  const handlePrevTrack = () => {
    if (!activeTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIndex];
    setActiveTrack(prevTrack);
    playPreview(prevTrack);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  const handleExportPlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tracks.length === 0) return;

    setExportingPlaylist(true);
    setExportedPlaylistUrl(null);

    try {
      const trackPayload = tracks.map(t => ({
        name: t.name,
        artist: t.artists.map(a => a.name).join(' ')
      }));

      const response = await axios.post('http://localhost:3001/api/youtube/playlist', {
        tracks: trackPayload
      });

      if (response.data.videoIds && response.data.videoIds.length > 0) {
        const videoIds = response.data.videoIds;
        const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
        setExportedPlaylistUrl(playlistUrl);
      }
    } catch (err) {
      console.error("YouTube bulk search failed:", err);
    } finally {
      setExportingPlaylist(false);
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

  return (
    <div className="glass-panel h-full flex flex-col gap-4" data-index="05 DISPATCH">
      {/* HEADER SECTION */}
      <div className="playlist-header">
        <h3 className="vibe-grid-title">
          <Music size={18} className="text-red-500" />
          DISCOVERED SOUNDS
        </h3>
        {!loading && tracks.length > 0 && (
          <span className={`playlist-source-tag ${source === 'spotify_api' ? 'source-spotify' : source === 'youtube_live' ? 'source-yt-live' : 'source-mock'}`}>
            <Disc size={12} className={source === 'spotify_api' ? 'animate-spin' : ''} />
            {source === 'spotify_api' ? 'SPOTIFY API' : source === 'youtube_live' ? '▶ YOUTUBE LIVE' : 'SIMULATED VIBE'}
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
          <div className="carousel-container flex-grow">
            <div className="carousel-wrap">
              <div className="carousel-list marquee">
                {(tracks.length >= 4 ? [...tracks, ...tracks] : [...tracks, ...tracks, ...tracks, ...tracks]).map((track, idx) => {
                  const catalogCode = `TT-${String(44 - (idx % tracks.length)).padStart(2, '0')}`;
                  const isCurrentPlaying = activeTrack?.id === track.id && isPlaying;
                  const artworkUrl = track.album.images?.[0]?.url;
                  const hasValidSpotifyArt = artworkUrl && !artworkUrl.includes('placeholder') && !artworkUrl.includes('mock');
                  
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => handleTrackClick(track)}
                      className={`carousel-item ${activeTrack?.id === track.id ? 'active' : ''} ${isCurrentPlaying ? 'playing' : ''}`}
                    >
                      <div className="carousel-artwork-link">
                        {hasValidSpotifyArt ? (
                          <img src={artworkUrl} alt={track.name} className="carousel-img" />
                        ) : youtubeThumbnails[track.id] ? (
                          <img 
                            src={`https://img.youtube.com/vi/${youtubeThumbnails[track.id]}/hqdefault.jpg`} 
                            alt={track.name} 
                            className="carousel-img" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Music size={24} className="text-slate-700" />
                          </div>
                        )}
                        <div className="carousel-play-overlay">
                          {isCurrentPlaying ? (
                            <Pause size={24} className="text-white fill-white" />
                          ) : (
                            <Play size={24} className="text-white fill-white" />
                          )}
                        </div>
                        <div className="carousel-info-block">
                          {catalogCode}
                        </div>
                      </div>

                      {/* Sliding spinning vinyl disc behind album art */}
                      <div className="carousel-vinyl-wrapper">
                        <div className="carousel-vinyl-disc">
                          <div className="vinyl-center" />
                        </div>
                      </div>

                      <div className="carousel-item-text">
                        <div className="carousel-item-title truncate">{track.name}</div>
                        <div className="carousel-item-artist truncate">
                          {track.artists.map(a => a.name).join(', ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                
                <div className="tape-deck-controls">
                  <button 
                    onClick={handlePrevTrack} 
                    className="tape-deck-btn"
                    title="PREVIOUS TRACK"
                  >
                    <SkipBack size={15} className="fill-current" />
                  </button>
                  <button 
                    onClick={() => handleTrackClick(activeTrack)} 
                    className="tape-deck-btn play-btn"
                    title={isPlaying ? "PAUSE PREVIEW" : "PLAY PREVIEW"}
                  >
                    {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
                  </button>
                  <button 
                    onClick={handleNextTrack} 
                    className="tape-deck-btn"
                    title="NEXT TRACK"
                  >
                    <SkipForward size={15} className="fill-current" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATED YOUTUBE MUSIC PLAYER */}
          {activeTrack && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[9px] text-red-500 font-mono tracking-wider">
                YOUTUBE MUSIC PLAYER //
              </span>
              <div className="spotify-embed-container">
                {youtubeVideoId ? (
                  <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1${isPlaying ? '&autoplay=1' : ''}`}
                    className="spotify-embed-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-[80px] bg-black border border-red-950/40 flex items-center justify-center font-mono text-[10px] text-slate-500">
                    RESOLVING WAVE SIGNAL...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="player-actions">
            <button
              onClick={() => {
                setExportedPlaylistUrl(null);
                setShowExportModal(true);
              }}
              className="btn btn-primary flex-grow"
            >
              <Save size={16} />
              EXPORT TO YOUTUBE
            </button>

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

      {/* EXPORT PLAYLIST TO YOUTUBE MODAL */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title flex items-center gap-2">
              <Save className="text-red-500" />
              Export Playlist
            </h3>
            
            {exportedPlaylistUrl ? (
              <div className="flex flex-col gap-4 text-center py-4">
                <p className="text-red-400 font-medium text-xs">PLAYLIST QUEUE GENERATED!</p>
                <p className="text-slate-400 text-[10px] uppercase font-mono">
                  Open the queue on YouTube to stream full-length audio tracks for free and save to your Google account.
                </p>
                <a
                  href={exportedPlaylistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex justify-center"
                >
                  Open on YouTube
                  <ArrowUpRight size={16} />
                </a>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn btn-secondary mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleExportPlaylistSubmit} className="flex flex-col gap-4">
                <p className="text-slate-400 text-xs font-mono uppercase">
                  Translate <strong>{tracks.length}</strong> catalog items into YouTube video feeds.
                </p>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-300">Playlist Name</label>
                  <input
                    type="text"
                    value={exportName}
                    onChange={e => setExportName(e.target.value)}
                    placeholder="Enter playlist name..."
                    className="input-field"
                    required
                  />
                </div>
                <div className="modal-buttons mt-2">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={exportingPlaylist}
                    className="btn btn-primary"
                  >
                    {exportingPlaylist ? 'SEARCHING VIDEO IDS...' : 'EXPORT TO YOUTUBE'}
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
