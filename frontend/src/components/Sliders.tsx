import React from 'react';
import { CloudRain, CloudLightning, Cloud, Sun, Compass } from 'lucide-react';
import type { WeatherState } from '../types';

interface SlidersProps {
  weather: WeatherState;
  colorTemp: number;
  onWeatherChange: (weather: WeatherState) => void;
  onColorTempChange: (temp: number) => void;
}

const weatherList: { state: WeatherState; label: string; icon: React.ReactNode }[] = [
  { state: 'thunderstorm', label: 'Thunderstorm', icon: <CloudLightning size={14} /> },
  { state: 'rain', label: 'Rainy', icon: <CloudRain size={14} /> },
  { state: 'cloudy', label: 'Cloudy', icon: <Cloud size={14} /> },
  { state: 'clear', label: 'Clear', icon: <Sun size={14} /> },
  { state: 'radiant', label: 'Radiant', icon: <Compass size={14} /> }
];

export const Sliders: React.FC<SlidersProps> = ({
  weather,
  colorTemp,
  onWeatherChange,
  onColorTempChange
}) => {
  const currentWeatherIndex = weatherList.findIndex(w => w.state === weather);

  const handleWeatherSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    if (index >= 0 && index < weatherList.length) {
      onWeatherChange(weatherList[index].state);
    }
  };

  return (
    <div className="slider-group">
      {/* 1. WEATHER SLIDER */}
      <div className="slider-container">
        <div className="slider-label">
          <span>
            {weatherList[currentWeatherIndex]?.icon}
            ATMOSPHERIC WEATHER
          </span>
          <span className="font-mono text-xs text-red-500 font-bold">
            {weather.toUpperCase()}
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="4"
          step="1"
          value={currentWeatherIndex}
          onChange={handleWeatherSliderChange}
          className="custom-range"
        />

        <div className="weather-states">
          {weatherList.map((w) => (
            <div
              key={w.state}
              onClick={() => onWeatherChange(w.state)}
              className={`weather-state-dot ${weather === w.state ? 'active' : ''}`}
            >
              <span>{w.icon}</span>
              <span className="text-[10px] hidden sm:inline">{w.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. COLOR TEMPERATURE SLIDER */}
      <div className="slider-container">
        <div className="slider-label">
          <span>
            <span
              className="w-3.5 h-3.5 inline-block"
              style={{
                background: `linear-gradient(to right, #050508, #ff003c)`,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 6px rgba(255, 0, 60, 0.3)'
              }}
            />
            &nbsp;COLOR SPECTRUM (GRID TEMP)
          </span>
          <span className="font-mono text-xs text-red-500 font-bold">
            {colorTemp < 0.3 ? 'COOL' : colorTemp > 0.7 ? 'WARM' : 'NEUTRAL'} ({(colorTemp * 100).toFixed(0)}%)
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={colorTemp}
          onChange={(e) => onColorTempChange(parseFloat(e.target.value))}
          className="custom-range color-range"
        />
        
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>COOL (DEEP SHADOWS)</span>
          <span>WARM (TOXIC GLOW)</span>
        </div>
      </div>
    </div>
  );
};
