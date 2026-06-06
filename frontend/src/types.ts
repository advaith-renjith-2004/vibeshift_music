export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width?: number; height?: number }[];
  };
  preview_url: string | null;
  uri: string;
}

export type WeatherState = 'thunderstorm' | 'rain' | 'cloudy' | 'clear' | 'radiant';

export type LanguageCode = 'silence' | 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'hi' | 'pt' | 'sv' | 'ta' | 'te' | 'ml' | 'kn' | 'pa';

export interface VibeState {
  energy: number;      // 0.0 to 1.0 (chill to energy)
  valence: number;     // 0.0 to 1.0 (melancholy to euphoria)
  weather: WeatherState;
  colorTemp: number;   // 0.0 to 1.0 (cool/dark to warm/bright)
  language: LanguageCode;
}

export type ThemeType = 'rose' | 'cyan' | 'emerald' | 'purple' | 'parchment' | 'custom';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  theme?: ThemeType;
  customColor?: string;
}

export interface PlayHistoryItem {
  track: Track;
  playedAt: string;
  vibeSnapshot: {
    energy: number;
    valence: number;
    weather: WeatherState;
  };
}

export interface UserSpotifyInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  userName: string;
}

export interface GalleryItem {
  id: string;
  name: string;
  energy: number;
  valence: number;
  weather: WeatherState;
  colorTemp: number;
  language: LanguageCode;
  tracks: Track[];
  createdAt: string;
  userName: string;
}
