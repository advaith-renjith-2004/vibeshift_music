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
    case 'thunderstorm': return <CloudLightning size={12} className="text-red-500" />;
    case 'rain': return <CloudRain size={12} className="text-slate-500" />;
    case 'cloudy': return <Cloud size={12} className="text-slate-500" />;
    case 'clear': return <Sun size={12} className="text-slate-500" />;
    case 'radiant': return <Compass size={12} className="text-red-500" />;
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
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
    } catch {
      return dateString.toUpperCase();
    }
  };

  return (
    <div className="gallery-section">
      <div className="flex justify-between items-center mb-4">
        <h3 className="vibe-grid-title">
          <Share2 size={18} className="text-red-500" />
          COMMUNITY REGISTRY
        </h3>
        <button
          onClick={onRefresh}
          className="text-xs text-red-500 hover:text-white font-mono bg-red-950/20 border border-red-900/40 px-3 py-1.5 cursor-pointer transition-all uppercase"
        >
          REFRESH REGISTRY
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 font-mono text-slate-500 text-xs">
          NO SHARED VIBES DETECTED IN THE REGISTRY.
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map(item => {
            const cardColor = 'var(--accent-color)';

            return (
              <div
                key={item.id}
                onClick={() => onLoadVibe(item)}
                className="gallery-card"
                style={{ '--card-color': cardColor } as React.CSSProperties}
              >
                <div className="gallery-card-header">
                  <div className="flex flex-col min-w-0">
                    <span className="gallery-card-title">{item.name.toUpperCase()}</span>
                    <span className="gallery-card-user flex items-center gap-1 mt-1 uppercase">
                      <User size={10} className="text-slate-500" />
                      {item.userName}
                    </span>
                  </div>
                  <span className="gallery-card-vibe-pill flex items-center gap-1">
                    {getWeatherIcon(item.weather)}
                    {getLanguageLabel(item.language).toUpperCase()}
                  </span>
                </div>

                <div className="gallery-mini-metrics my-1 font-mono">
                  <div className="mini-metric">
                    <Flame size={12} className="text-red-500" />
                    <span className="text-[10px] text-slate-400">ENG: {(item.energy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mini-metric">
                    <Activity size={12} className="text-red-500" />
                    <span className="text-[10px] text-slate-400">VAL: {(item.valence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mini-metric">
                    <span className="text-[9px] text-red-500/70">
                      {Math.round(70 + item.colorTemp * 85)} BPM
                    </span>
                  </div>
                </div>

                <div className="gallery-card-footer font-mono">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Calendar size={10} className="text-slate-600" />
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-[10px] text-red-500">
                    {item.tracks?.length || 0} TRACKS
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
