import React, { useState, useEffect } from 'react';
import { User, Mail, History, X, Save, Edit2, Play, Calendar, Music } from 'lucide-react';
import type { UserProfile, PlayHistoryItem } from '../types';
import { getPlayHistory } from '../utils/firebase';

interface UserProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => Promise<boolean>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [history, setHistory] = useState<PlayHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      const data = await getPlayHistory(user.uid);
      setHistory(data);
      setLoadingHistory(false);
    };
    loadHistory();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const success = await onUpdate({
      ...user,
      name: editedName,
      email: editedEmail
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-red-950 pb-4 mb-4">
          <h3 className="modal-title flex items-center gap-2">
            <User className="text-red-500" />
            USER PROFILE & HISTORY
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {/* PROFILE SECTION */}
          <div className="glass-panel p-4 mb-6 border-red-900/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-950/50 border border-red-500/30 flex items-center justify-center rounded-sm">
                  <User size={24} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-white font-mono font-bold uppercase">{user.name}</h4>
                  <p className="text-slate-400 text-xs font-mono uppercase">{user.email}</p>
                </div>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary text-[10px] py-1 px-3"
                >
                  <Edit2 size={12} />
                  EDIT PROFILE
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-red-500 font-mono uppercase">Full Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-red-500 font-mono uppercase">Email Address</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={e => setEditedEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="btn btn-primary"
                  >
                    <Save size={16} />
                    {updating ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="border border-red-950/40 bg-black/40 p-2">
                  <span className="text-[9px] text-slate-500 block uppercase mb-1">Account ID</span>
                  <span className="text-[10px] text-red-400 font-mono truncate block">{user.uid}</span>
                </div>
                <div className="border border-red-950/40 bg-black/40 p-2">
                  <span className="text-[9px] text-slate-500 block uppercase mb-1">Status</span>
                  <span className="text-[10px] text-green-400 font-mono block">● ENCRYPTED & ACTIVE</span>
                </div>
              </div>
            )}
          </div>

          {/* HISTORY SECTION */}
          <div className="flex items-center gap-2 mb-4 border-l-2 border-red-500 pl-3">
            <History size={18} className="text-red-500" />
            <h4 className="text-white font-mono font-bold uppercase tracking-wider">Play History</h4>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-2 border-red-950 border-t-red-600 animate-spin" />
              <p className="text-red-500 text-[10px] font-mono animate-pulse uppercase">Retrieving logs from database...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-red-950/50">
              <Music size={32} className="text-slate-800 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-mono uppercase">No playback data detected in history.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              {history.map((item, idx) => (
                <div key={`${item.playedAt}-${idx}`} className="flex items-center justify-between p-3 border border-red-950/30 bg-black/20 hover:bg-red-950/10 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 relative">
                      <img 
                        src={item.track.album.images?.[0]?.url || 'https://via.placeholder.com/40'} 
                        alt={item.track.name}
                        className="w-full h-full object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity">
                        <Play size={14} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-white font-bold truncate uppercase">{item.track.name}</p>
                      <p className="text-[9px] text-slate-500 truncate uppercase">{item.track.artists.map(a => a.name).join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end text-[8px] text-red-500/70 font-mono mb-1">
                      <Calendar size={8} />
                      {formatDate(item.playedAt)}
                    </div>
                    <div className="flex gap-1 justify-end">
                      <span className="text-[7px] px-1 border border-red-900 text-red-400 bg-red-950/20">E:{(item.vibeSnapshot.energy * 10).toFixed(0)}</span>
                      <span className="text-[7px] px-1 border border-red-900 text-red-400 bg-red-950/20">V:{(item.vibeSnapshot.valence * 10).toFixed(0)}</span>
                      <span className="text-[7px] px-1 border border-red-900 text-red-400 bg-red-950/20 uppercase">{item.vibeSnapshot.weather.substring(0, 3)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-red-950 flex justify-center">
          <p className="text-[8px] text-slate-600 font-mono uppercase tracking-[0.2em]">
            SYNESTHETIC DATA PERSISTENCE LAYER ACTIVE // ENCRYPTED VIA FIREBASE
          </p>
        </div>
      </div>
    </div>
  );
};
