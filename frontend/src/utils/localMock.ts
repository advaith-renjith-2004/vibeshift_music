import type { Track, VibeState } from '../types';

export const localMockTracks = [
  // CHILL / MELANCHOLIC (Low Energy, Low Valence)
  {
    id: "1",
    name: "Rosyln",
    artists: [{ name: "Bon Iver & St. Vincent" }],
    album: {
      name: "The Twilight Saga: New Moon",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b4b84b8d7ef2049e6d87ef9c" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    energy: 0.15,
    valence: 0.18,
    acousticness: 0.9,
    instrumentalness: 0.1,
    tempo: 85,
    language: "en"
  },
  {
    id: "2",
    name: "Gymnopédie No.1",
    artists: [{ name: "Erik Satie" }],
    album: {
      name: "Satie: Piano Works",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27376c70b80ecf3cf6551b9e67d" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    energy: 0.05,
    valence: 0.25,
    acousticness: 0.99,
    instrumentalness: 0.95,
    tempo: 72,
    language: "silence"
  },
  {
    id: "3",
    name: "Intro",
    artists: [{ name: "The xx" }],
    album: {
      name: "xx",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2730a2394c50c05eb7d16fb9737" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    energy: 0.25,
    valence: 0.35,
    acousticness: 0.7,
    instrumentalness: 0.85,
    tempo: 120,
    language: "silence"
  },
  {
    id: "4",
    name: "Youth",
    artists: [{ name: "Daughter" }],
    album: {
      name: "If You Leave",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2737c024ee5cfa488426f30e060" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    energy: 0.3,
    valence: 0.22,
    acousticness: 0.85,
    instrumentalness: 0.2,
    tempo: 75,
    language: "en"
  },

  // CHILL / EUPHORIC (Low Energy, High Valence)
  {
    id: "6",
    name: "Bossa No Décor",
    artists: [{ name: "João Gilberto" }],
    album: {
      name: "Getz/Gilberto",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273cd982da642598deef66b02a9" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    energy: 0.2,
    valence: 0.7,
    acousticness: 0.8,
    instrumentalness: 0.15,
    tempo: 95,
    language: "pt"
  },
  {
    id: "8",
    name: "La Vie En Rose",
    artists: [{ name: "Édith Piaf" }],
    album: {
      name: "The Voice of the Sparrow",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27318ecf7db11545620b75cf798" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    energy: 0.22,
    valence: 0.68,
    acousticness: 0.9,
    instrumentalness: 0.01,
    tempo: 80,
    language: "fr"
  },
  {
    id: "9",
    name: "cold/mess",
    artists: [{ name: "Prateek Kuhad" }],
    album: {
      name: "cold/mess EP",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27376cd7d2b6387063bd70d30c5" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    energy: 0.35,
    valence: 0.4,
    acousticness: 0.8,
    instrumentalness: 0.0,
    tempo: 92,
    language: "hi"
  },
  {
    id: "10",
    name: "Plastic Love",
    artists: [{ name: "Mariya Takeuchi" }],
    album: {
      name: "Variety",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e86c06df9a57fb6c84b12b5b" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    energy: 0.65,
    valence: 0.85,
    acousticness: 0.18,
    instrumentalness: 0.02,
    tempo: 110,
    language: "ja"
  },

  // HIGH ENERGY / MELANCHOLIC (High Energy, Low Valence)
  {
    id: "11",
    name: "Starboy",
    artists: [{ name: "The Weeknd ft. Daft Punk" }],
    album: {
      name: "Starboy",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2734718e2b1e863ae6506e4b476" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    energy: 0.82,
    valence: 0.48,
    acousticness: 0.14,
    instrumentalness: 0.0,
    tempo: 186,
    language: "en"
  },
  {
    id: "12",
    name: "Gurenge",
    artists: [{ name: "LiSA" }],
    album: {
      name: "LEO-NiNE",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27318357f12e87c0a905a5a6764" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    energy: 0.88,
    valence: 0.38,
    acousticness: 0.05,
    instrumentalness: 0.0,
    tempo: 135,
    language: "ja"
  },
  {
    id: "13",
    name: "Tomboy",
    artists: [{ name: "HYUKOH" }],
    album: {
      name: "23",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2733d3c75f653457a41ec5e958f" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    energy: 0.68,
    valence: 0.29,
    acousticness: 0.25,
    instrumentalness: 0.05,
    tempo: 124,
    language: "ko"
  },
  {
    id: "14",
    name: "Hysteria",
    artists: [{ name: "Muse" }],
    album: {
      name: "Absolution",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273574c84de2a21e427fa7f7396" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    energy: 0.92,
    valence: 0.35,
    acousticness: 0.01,
    instrumentalness: 0.1,
    tempo: 93,
    language: "en"
  },

  // HIGH ENERGY / EUPHORIC (High Energy, High Valence)
  {
    id: "15",
    name: "Dynamite",
    artists: [{ name: "BTS" }],
    album: {
      name: "BE",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27382d56de466a9a7a9a3b68078" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    energy: 0.85,
    valence: 0.9,
    acousticness: 0.01,
    instrumentalness: 0.0,
    tempo: 114,
    language: "ko"
  },
  {
    id: "16",
    name: "Mi Gente",
    artists: [{ name: "J Balvin & Willy William" }],
    album: {
      name: "Vibras",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2736183313ad52588147d341b5f" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    energy: 0.8,
    valence: 0.88,
    acousticness: 0.02,
    instrumentalness: 0.0,
    tempo: 105,
    language: "es"
  },
  {
    id: "17",
    name: "One More Time",
    artists: [{ name: "Daft Punk" }],
    album: {
      name: "Discovery",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b3c3734685ff8a86c67ef9b2" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    energy: 0.9,
    valence: 0.85,
    acousticness: 0.02,
    instrumentalness: 0.7,
    tempo: 123,
    language: "silence"
  },
  {
    id: "18",
    name: "Gimme! Gimme! Gimme!",
    artists: [{ name: "ABBA" }],
    album: {
      name: "Voulez-Vous",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27376db1a7114d642398dbd64b1" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    energy: 0.75,
    valence: 0.82,
    acousticness: 0.05,
    instrumentalness: 0.01,
    tempo: 120,
    language: "sv"
  }
];

export const filterLocalMock = (vibe: VibeState): Track[] => {
  const targetEnergy = vibe.energy;
  const targetValence = vibe.valence;
  const targetColorTemp = vibe.colorTemp;
  const targetLanguage = vibe.language;

  // Base BPM
  const baseBpm = 70 + targetColorTemp * 85;

  let acousticVal = 0.5;
  let instrumentalVal = 0.0;
  let tempoMod = 0;

  switch (vibe.weather) {
    case 'thunderstorm':
      acousticVal = 0.9;
      instrumentalVal = 0.7;
      tempoMod = -15;
      break;
    case 'rain':
      acousticVal = 0.75;
      instrumentalVal = 0.4;
      tempoMod = -8;
      break;
    case 'cloudy':
      acousticVal = 0.45;
      instrumentalVal = 0.2;
      tempoMod = 0;
      break;
    case 'clear':
      acousticVal = 0.15;
      instrumentalVal = 0.05;
      tempoMod = 8;
      break;
    case 'radiant':
      acousticVal = 0.0;
      instrumentalVal = 0.0;
      tempoMod = 15;
      break;
  }

  if (targetLanguage === 'silence') {
    instrumentalVal = Math.max(instrumentalVal, 0.92);
  }

  const finalBpm = baseBpm + tempoMod;

  const scored = localMockTracks.map(track => {
    let score = 0;
    
    if (targetLanguage !== 'en' && track.language !== targetLanguage) {
      score += 2.0;
    }
    if (targetLanguage === 'silence' && track.language !== 'silence') {
      score += 5.0;
    }

    score += Math.pow(track.energy - targetEnergy, 2) * 2.0;
    score += Math.pow(track.valence - targetValence, 2) * 2.0;
    score += Math.pow(track.acousticness - acousticVal, 2) * 1.5;
    score += Math.pow(track.instrumentalness - instrumentalVal, 2) * 1.5;
    
    const tempoDiff = Math.abs(track.tempo - finalBpm) / 100;
    score += Math.pow(tempoDiff, 2) * 1.0;

    return {
      ...track,
      score,
      uri: `spotify:track:${track.id}`
    };
  });

  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
    .map(t => ({
      id: t.id,
      name: t.name,
      artists: t.artists,
      album: t.album,
      preview_url: t.preview_url,
      uri: t.uri
    }));
};
