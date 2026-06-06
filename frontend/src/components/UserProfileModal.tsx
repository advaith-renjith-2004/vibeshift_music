import React, { useState, useEffect } from 'react';
import { User, History, ArrowLeft, Save, Edit2, Play, Music, Palette, Image as ImageIcon, Check, Activity, Shield, Hash } from 'lucide-react';
import type { UserProfile, PlayHistoryItem, ThemeType } from '../types';
import { getPlayHistory } from '../utils/firebase';

interface UserProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => Promise<boolean>;
}

const THEMES: { id: ThemeType; name: string; color: string }[] = [
  { id: 'rose', name: 'Rose', color: '#f43f5e' },
  { id: 'cyan', name: 'Cyan', color: '#22d3ee' },
  { id: 'emerald', name: 'Emerald', color: '#34d399' },
  { id: 'purple', name: 'Purple', color: '#a855f7' },
  { id: 'parchment', name: 'Parchment', color: '#fef3c7' },
  { id: 'custom', name: 'Custom', color: '#ffffff' }
];

const CARTOON_AVATARS = [
  { id: 'dj', path: '/avatars/dj.png', name: 'NEON DJ' },
  { id: 'cat', path: '/avatars/cat.png', name: 'CYBER CAT' },
  { id: 'robot', path: '/avatars/robot.png', name: 'RETRO BOT' },
  { id: 'explorer', path: '/avatars/explorer.png', name: 'EXPLORER' },
  { id: 'ghost', path: '/avatars/ghost.png', name: 'ARCADE GHOST' }
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedAvatar, setEditedAvatar] = useState(user.avatarUrl || '');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(user.theme || 'rose');
  const [customColor, setCustomColor] = useState(user.customColor || '#ff003c');
  const [history, setHistory] = useState<PlayHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Live Theme Preview Effect
  useEffect(() => {
    if (selectedTheme === 'custom') {
      document.documentElement.setAttribute('data-theme', 'custom');
      document.documentElement.style.setProperty('--accent-color', customColor);
      document.documentElement.style.setProperty('--accent-dim', `${customColor}26`);
      document.documentElement.style.setProperty('--accent-glow', `${customColor}66`);
    } else {
      document.documentElement.setAttribute('data-theme', selectedTheme);
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--accent-dim');
      document.documentElement.style.removeProperty('--accent-glow');
    }
    
    // Cleanup on unmount (restore user's original theme)
    return () => {
      if (!updating) {
        const originalTheme = user.theme || 'rose';
        if (originalTheme === 'custom' && user.customColor) {
          document.documentElement.setAttribute('data-theme', 'custom');
          document.documentElement.style.setProperty('--accent-color', user.customColor);
          document.documentElement.style.setProperty('--accent-dim', `${user.customColor}26`);
          document.documentElement.style.setProperty('--accent-glow', `${user.customColor}66`);
        } else {
          document.documentElement.setAttribute('data-theme', originalTheme);
          document.documentElement.style.removeProperty('--accent-color');
          document.documentElement.style.removeProperty('--accent-dim');
          document.documentElement.style.removeProperty('--accent-glow');
        }
      }
    };
  }, [selectedTheme, customColor, user.theme, user.customColor, updating]);

  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      const data = await getPlayHistory(user.uid);
      setHistory(data);
      setLoadingHistory(false);
    };
    loadHistory();
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const success = await onUpdate({
      ...user,
      name: editedName,
      email: editedEmail,
      avatarUrl: editedAvatar,
      theme: selectedTheme,
      customColor: selectedTheme === 'custom' ? customColor : undefined
    });
    if (success) {
      setIsEditing(false);
    }
    setUpdating(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="profile-page-overlay" onClick={onClose}>
      {/* Moving Film Grain Overlay */}
      <div className="grain-overlay" />

      <div className="profile-page-content" onClick={e => e.stopPropagation()}>
        {/* MODAL CONTROL HEADER */}
        <div className="flex justify-between items-center border-b border-panel-border pb-3">
          <button onClick={onClose} className="profile-back-btn">
            <ArrowLeft size={14} />
            BACK TO CONSOLE
          </button>
          <span className="text-[9px] text-accent-color font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--accent-color)' }}>
            ● SECURE MODULE CONNECTED
          </span>
        </div>
        {/* LARGE HEADER */}
        <div className="profile-header-large">
          <div className="profile-avatar-large">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={80} className="text-accent-color" style={{ color: 'var(--accent-color)' }} />
            )}
          </div>
          <div className="profile-info-large flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-white font-display font-black">{user.name}</h2>
                <p className="text-accent-color font-mono uppercase tracking-[0.3em]" style={{ color: 'var(--accent-color)' }}>
                  {user.email}
                </p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  <Edit2 size={16} />
                  EDIT PROFILE
                </button>
              )}
            </div>
            
            <div className="profile-stats-grid mt-8">
              <div className="border border-panel-border bg-black/40 p-3">
                <span className="text-[10px] text-slate-500 block uppercase mb-1 flex items-center gap-1">
                  <Hash size={10} /> Account UID
                </span>
                <span className="text-xs text-white font-mono truncate block">{user.uid}</span>
              </div>
              <div className="border border-panel-border bg-black/40 p-3">
                <span className="text-[10px] text-slate-500 block uppercase mb-1 flex items-center gap-1">
                  <Palette size={10} /> Active Theme
                </span>
                <span className="text-xs text-accent-color font-mono uppercase font-bold" style={{ color: 'var(--accent-color)' }}>
                  {user.theme || 'ROSE'}
                </span>
              </div>
              <div className="border border-panel-border bg-black/40 p-3">
                <span className="text-[10px] text-slate-500 block uppercase mb-1 flex items-center gap-1">
                  <Activity size={10} /> Tracks Played
                </span>
                <span className="text-xs text-white font-mono">{history.length}</span>
              </div>
              <div className="border border-panel-border bg-black/40 p-3">
                <span className="text-[10px] text-slate-500 block uppercase mb-1 flex items-center gap-1">
                  <Shield size={10} /> Status
                </span>
                <span className="text-xs text-green-500 font-mono">● ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT FORM - ONLY SHOWS WHEN EDITING */}
        {isEditing && (
          <div className="glass-panel p-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-display mb-6 border-b border-panel-border pb-2">MODERATION CONSOLE</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-xs text-accent-color font-mono uppercase" style={{ color: 'var(--accent-color)' }}>Identity Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    className="input-field py-4 text-lg"
                    required
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs text-accent-color font-mono uppercase" style={{ color: 'var(--accent-color)' }}>Com-Link Email</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={e => setEditedEmail(e.target.value)}
                    className="input-field py-4 text-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs text-accent-color font-mono uppercase flex items-center gap-1" style={{ color: 'var(--accent-color)' }}>
                  <ImageIcon size={12} />
                  Choose Cyberpunk Avatar
                </label>
                <div className="avatar-picker-grid">
                  {CARTOON_AVATARS.map(avatar => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setEditedAvatar(avatar.path)}
                      className={`avatar-picker-item ${editedAvatar === avatar.path ? 'active' : ''}`}
                      title={avatar.name}
                    >
                      <img src={avatar.path} alt={avatar.name} className="avatar-picker-img" />
                      {editedAvatar === avatar.path && (
                        <div className="avatar-picker-badge" style={{ backgroundColor: 'var(--accent-color)' }}>
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs text-accent-color font-mono uppercase flex items-center gap-1" style={{ color: 'var(--accent-color)' }}>
                  <ImageIcon size={12} />
                  Visual Avatar URL (Custom Web Link)
                </label>
                <input
                  type="text"
                  value={editedAvatar}
                  onChange={e => setEditedAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="input-field py-4"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs text-accent-color font-mono uppercase flex items-center gap-1" style={{ color: 'var(--accent-color)' }}>
                  <Palette size={12} />
                  Interface Spectrum
                </label>
                <div className="theme-spectrum-container">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`theme-circle-btn ${selectedTheme === theme.id ? 'active' : ''}`}
                      style={{ backgroundColor: theme.color }}
                      title={theme.name}
                    >
                      {selectedTheme === theme.id && <Check size={20} className={theme.id === 'parchment' ? 'text-black' : 'text-white'} />}
                    </button>
                  ))}
                </div>
                
                {selectedTheme === 'custom' && (
                  <div className="custom-color-picker-container">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">
                      Select Custom Accent Color:
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="color"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="custom-color-input"
                      />
                      <span className="text-xs text-white font-mono uppercase">{customColor}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary px-8"
                >
                  ABORT
                </button>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="btn btn-primary px-12"
                >
                  <Save size={18} />
                  {updating ? 'UPLOADING...' : 'COMMIT CHANGES'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HISTORY SECTION */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-8 border-l-4 border-accent-color pl-6" style={{ borderColor: 'var(--accent-color)' }}>
            <div>
              <h4 className="text-3xl font-display font-black uppercase tracking-tighter">NEURAL PLAYBACK LOGS</h4>
              <p className="text-slate-500 font-mono text-xs mt-1 uppercase">Persistent history of synesthetic explorations</p>
            </div>
            <div className="flex items-center gap-2 bg-accent-dim px-4 py-2 border border-accent-color/30" style={{ backgroundColor: 'var(--accent-dim)', borderColor: 'var(--accent-color)' }}>
              <History size={16} className="text-accent-color" style={{ color: 'var(--accent-color)' }} />
              <span className="text-white font-mono text-sm">{history.length} ITEMS</span>
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-panel-border border-t-accent-color animate-spin" style={{ borderTopColor: 'var(--accent-color)' }} />
              <p className="text-accent-color text-sm font-mono animate-pulse uppercase" style={{ color: 'var(--accent-color)' }}>Decrypted history data streams...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-panel-border bg-black/20">
              <Music size={48} className="text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Database is empty. No explorations logged.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item, idx) => (
                <div key={`${item.playedAt}-${idx}`} className="flex items-center justify-between p-4 border border-panel-border bg-panel-bg hover:border-accent-color transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-accent-color/10 text-[8px] text-accent-color font-mono" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent-color)' }}>
                    {formatDate(item.playedAt)}
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 flex-shrink-0 relative border border-panel-border">
                      <img 
                        src={item.track.album.images?.[0]?.url || 'https://via.placeholder.com/64'} 
                        alt={item.track.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-accent-color/40 transition-opacity" style={{ backgroundColor: 'var(--accent-dim)' }}>
                        <Play size={20} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-bold truncate uppercase tracking-tight">{item.track.name}</p>
                      <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5">{item.track.artists.map(a => a.name).join(', ')}</p>
                      
                      <div className="flex gap-2 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-600 uppercase">Energy</span>
                          <div className="w-12 h-1 bg-slate-900 mt-0.5">
                            <div className="h-full bg-accent-color" style={{ width: `${item.vibeSnapshot.energy * 100}%`, backgroundColor: 'var(--accent-color)' }} />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-600 uppercase">Valence</span>
                          <div className="w-12 h-1 bg-slate-900 mt-0.5">
                            <div className="h-full bg-accent-color" style={{ width: `${item.vibeSnapshot.valence * 100}%`, backgroundColor: 'var(--accent-color)' }} />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-600 uppercase">Weather</span>
                          <span className="text-[9px] text-white font-mono uppercase">{item.vibeSnapshot.weather}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* FOOTER - SYSTEM STATUS */}
        <div className="mt-8 pt-4 border-t border-panel-border flex justify-between items-center text-[8px] text-slate-600 font-mono uppercase tracking-[0.2em]">
          <span>UPLINK: ACTIVE // STORAGE: CLOUD_SYNCED</span>
          <span>USER: {user.uid}</span>
        </div>
      </div>
    </div>
  );
};
