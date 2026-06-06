import React from 'react';
import { VolumeX, Globe, Heart, HeartHandshake } from 'lucide-react';
import type { LanguageCode } from '../types';

interface TextureSelectorProps {
  selectedLanguage: LanguageCode;
  onChange: (language: LanguageCode) => void;
}

interface VocalTextureOption {
  id: 'silence' | 'familiar' | 'flowing' | 'wanderlust';
  title: string;
  desc: string;
  icon: React.ReactNode;
  defaultLang: LanguageCode;
}

const textureOptions: VocalTextureOption[] = [
  {
    id: 'silence',
    title: 'Silence',
    desc: 'Instrumental only',
    icon: <VolumeX size={18} />,
    defaultLang: 'silence'
  },
  {
    id: 'familiar',
    title: 'Familiar',
    desc: 'Local / Native (English)',
    icon: <HeartHandshake size={18} />,
    defaultLang: 'en'
  },
  {
    id: 'flowing',
    title: 'Flowing',
    desc: 'Romance languages',
    icon: <Heart size={18} />,
    defaultLang: 'es'
  },
  {
    id: 'wanderlust',
    title: 'Wanderlust',
    desc: 'Global / Rhythmic mix',
    icon: <Globe size={18} />,
    defaultLang: 'ja'
  }
];

// Sub-languages configuration
const subLanguages = {
  flowing: [
    { code: 'es' as LanguageCode, label: 'Spanish (Español)' },
    { code: 'fr' as LanguageCode, label: 'French (Français)' },
    { code: 'pt' as LanguageCode, label: 'Portuguese (Português)' }
  ],
  wanderlust: [
    { code: 'ja' as LanguageCode, label: 'Japanese (日本語)' },
    { code: 'ko' as LanguageCode, label: 'Korean (한국어)' },
    { code: 'hi' as LanguageCode, label: 'Hindi (हिन्दी)' },
    { code: 'sv' as LanguageCode, label: 'Swedish (Svenska)' }
  ]
};

export const TextureSelector: React.FC<TextureSelectorProps> = ({
  selectedLanguage,
  onChange
}) => {
  // Determine which primary texture is active based on the selectedLanguage
  const getActiveTextureId = (): 'silence' | 'familiar' | 'flowing' | 'wanderlust' => {
    if (selectedLanguage === 'silence') return 'silence';
    if (selectedLanguage === 'en') return 'familiar';
    if (['es', 'fr', 'pt'].includes(selectedLanguage)) return 'flowing';
    return 'wanderlust';
  };

  const activeTextureId = getActiveTextureId();

  const handleTextureClick = (opt: VocalTextureOption) => {
    onChange(opt.defaultLang);
  };

  return (
    <div className="vocal-selector-container">
      <div className="flex justify-between items-center">
        <h3 className="vibe-grid-title">
          <Globe size={18} className="text-purple-400" />
          Vocal & Linguistic Texture
        </h3>
      </div>

      <div className="vocal-grid">
        {textureOptions.map(opt => (
          <div
            key={opt.id}
            onClick={() => handleTextureClick(opt)}
            className={`vocal-card ${activeTextureId === opt.id ? 'active' : ''}`}
          >
            <span className={activeTextureId === opt.id ? 'text-indigo-400' : 'text-slate-400'}>
              {opt.icon}
            </span>
            <h4>{opt.title}</h4>
            <p>{opt.desc}</p>
          </div>
        ))}
      </div>

      {/* Render sub-languages for 'Flowing' (Romance) */}
      {activeTextureId === 'flowing' && (
        <div className="language-subselector">
          <span className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            Select Romance Dialect:
          </span>
          <div className="language-list">
            {subLanguages.flowing.map(lang => (
              <button
                key={lang.code}
                onClick={() => onChange(lang.code)}
                className={`language-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Render sub-languages for 'Wanderlust' (Global) */}
      {activeTextureId === 'wanderlust' && (
        <div className="language-subselector">
          <span className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            Select Global Aesthetic:
          </span>
          <div className="language-list">
            {subLanguages.wanderlust.map(lang => (
              <button
                key={lang.code}
                onClick={() => onChange(lang.code)}
                className={`language-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
