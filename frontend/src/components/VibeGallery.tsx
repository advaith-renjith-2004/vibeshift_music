import React from 'react';
import { Share2, User, Calendar, Activity, Flame, CloudLightning, CloudRain, Cloud, Sun, Compass } from 'lucide-react';
import type { GalleryItem, WeatherState } from '../types';

interface VibeGalleryProps {
  items: GalleryItem[];
  onLoadVibe: (item: GalleryItem) => void;
  onRefresh: () => void;
}

const getWeatherIcon = (w: WeatherState) => {
  switch (w) {
    case 'thunderstorm': return <CloudLightning size={12} className="text-slate-400" />;
    case 'rain': return <CloudRain size={12} className="text-blue-400" />;
    case 'cloudy': return <Cloud size={12} className="text-slate-400" />;
    case 'clear': return <Sun size={12} className="text-yellow-400" />;
    case 'radiant': return <Compass size={12} className="text-orange-400" />;
  }
};

const getLanguageLabel = (lang: string): string => {
  switch (lang) {
    case 'silence': return 'Silence';
    case 'en': return 'English';
    case 'es': return 'Spanish';
    case 'fr': return 'French';
    case 'pt': return 'Portuguese';
    case 'ja': return 'Japanese';
    case 'ko': return 'Korean';
    case 'hi': return 'Hindi';
    case 'sv': return 'Swedish';
    default: return 'Familiar';
  }
};

export const VibeGallery: React.FC<VibeGalleryProps> = ({ items, onLoadVibe, onRefresh }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="gallery-section">
      <div className="flex justify-between items-center">
        <h3 className="vibe-grid-title">
          <Share2 size={18} className="text-purple-400" />
          Community Vibe Gallery
        </h3>
        <button
          onClick={onRefresh}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
        >
          Refresh Gallery
        </button>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel text-center py-10">
          <p className="text-slate-400 text-sm">No shared vibes found. Be the first to publish one!</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map(item => {
            // Determine card highlight color based on color temperature slider
            const cardColor = item.colorTemp < 0.3 
              ? '#3b82f6' // Cool blue
              : item.colorTemp > 0.7 
                ? '#ef4444' // Warm red
                : '#8b5cf6'; // Neutral purple

            return (
              <div
                key={item.id}
                onClick={() => onLoadVibe(item)}
                className="gallery-card"
                style={{ '--card-color': cardColor } as React.CSSProperties}
              >
                <div className="gallery-card-header">
                  <div className="flex flex-col min-w-0">
                    <span className="gallery-card-title">{item.name}</span>
                    <span className="gallery-card-user flex items-center gap-1 mt-1">
                      <User size={10} />
                      {item.userName}
                    </span>
                  </div>
                  <span className="gallery-card-vibe-pill flex items-center gap-1">
                    {getWeatherIcon(item.weather)}
                    {getLanguageLabel(item.language)}
                  </span>
                </div>

                <div className="gallery-mini-metrics my-1">
                  <div className="mini-metric">
                    <Flame size={12} className="text-orange-400" />
                    <span className="text-[10px] text-slate-300">E: {(item.energy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mini-metric">
                    <Activity size={12} className="text-pink-400" />
                    <span className="text-[10px] text-slate-300">V: {(item.valence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mini-metric">
                    <span className="text-[9px] font-mono text-slate-400">
                      {Math.round(70 + item.colorTemp * 85)} BPM
                    </span>
                  </div>
                </div>

                <div className="gallery-card-footer">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Calendar size={10} />
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {item.tracks?.length || 0} tracks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
