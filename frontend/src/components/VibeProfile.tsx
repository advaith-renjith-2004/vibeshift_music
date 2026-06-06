import React from 'react';
import { Sliders as SlidersIcon, Activity, Flame, Music, HelpCircle, Eye } from 'lucide-react';
import type { VibeState } from '../types';

interface VibeProfileProps {
  vibe: VibeState;
}

export const VibeProfile: React.FC<VibeProfileProps> = ({ vibe }) => {
  // Translate Vibe Inputs into exact parameters matching the algorithm

  // 1. Grid X -> Energy
  const energyVal = vibe.energy;

  // 2. Grid Y -> Valence
  const valenceVal = vibe.valence;

  // 3. Color Temp -> Base BPM
  const baseBpm = 70 + vibe.colorTemp * 85;

  // 4. Weather -> Acousticness, Danceability, Instrumentalness, Tempo Modifier
  let acousticVal = 0.5;
  let instrumentalVal = 0.0;
  let danceVal = 0.5;
  let tempoMod = 0;

  switch (vibe.weather) {
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

  // Vocal Overrides
  if (vibe.language === 'silence') {
    instrumentalVal = Math.max(instrumentalVal, 0.92);
  }

  // Adjust Danceability with Energy (blend them)
  const finalDanceability = Math.min(1.0, danceVal * 0.4 + energyVal * 0.6);

  // Final BPM
  const finalBpm = Math.round(baseBpm + tempoMod);

  const metrics = [
    {
      name: 'TARGET ENERGY',
      value: `${(energyVal * 100).toFixed(0)}%`,
      percentage: energyVal * 100,
      icon: <Flame size={14} className="text-red-500" />,
      color: 'var(--accent-red)'
    },
    {
      name: 'TARGET VALENCE',
      value: `${(valenceVal * 100).toFixed(0)}%`,
      percentage: valenceVal * 100,
      icon: <Activity size={14} className="text-red-500" />,
      color: 'var(--accent-red)'
    },
    {
      name: 'TEMPO (BPM)',
      value: `${finalBpm} BPM`,
      // Map BPM from 50 to 180 range to percentage
      percentage: Math.max(0, Math.min(100, ((finalBpm - 50) / 130) * 100)),
      icon: <SlidersIcon size={14} className="text-red-500" />,
      color: 'var(--accent-red)'
    },
    {
      name: 'ACOUSTICNESS',
      value: `${(acousticVal * 100).toFixed(0)}%`,
      percentage: acousticVal * 100,
      icon: <Music size={14} className="text-red-500" />,
      color: 'var(--accent-red)'
    },
    {
      name: 'DANCEABILITY',
      value: `${(finalDanceability * 100).toFixed(0)}%`,
      percentage: finalDanceability * 100,
      icon: <Flame size={14} className="text-red-500" />,
      color: 'var(--accent-red)'
    },
    {
      name: 'INSTRUMENTALNESS',
      value: `${(instrumentalVal * 100).toFixed(0)}%`,
      percentage: instrumentalVal * 100,
      icon: <HelpCircle size={14} className="text-red-500" />,
      color: 'var(--accent-red)'
    }
  ];

  return (
    <div className="vibe-profile-container">
      <div className="flex justify-between items-center">
        <h3 className="vibe-grid-title">
          <Eye size={18} className="text-red-500" />
          VIBE PROFILE
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          DECODED SOUND METRICS
        </span>
      </div>

      <div className="vibe-profile-metrics">
        {metrics.map(metric => (
          <div key={metric.name} className="metric-card">
            <div className="metric-name">
              {metric.icon}
              {metric.name}
            </div>
            <div className="metric-value-row">
              <span className="metric-value" style={{ color: metric.color }}>
                {metric.value}
              </span>
            </div>
            <div className="metric-bar-bg">
              <div
                className="metric-bar-fill"
                style={{
                  width: `${metric.percentage}%`,
                  background: `repeating-linear-gradient(90deg, ${metric.color}, ${metric.color} 3px, transparent 3px, transparent 5px)`,
                  boxShadow: `0 0 4px ${metric.color}`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
