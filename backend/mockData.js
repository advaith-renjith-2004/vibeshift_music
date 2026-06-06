const mockTracks = [
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
    language: "en",
    genre: "indie"
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
    language: "silence",
    genre: "classical"
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
    language: "silence",
    genre: "ambient"
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
    language: "en",
    genre: "indie"
  },
  {
    id: "5",
    name: "Amoeba",
    artists: [{ name: "Clairo" }],
    album: {
      name: "Sling",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273ab32c695bfdf47b8599446f7" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    energy: 0.45,
    valence: 0.65,
    acousticness: 0.6,
    instrumentalness: 0.05,
    tempo: 115,
    language: "en",
    genre: "indie-pop"
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
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    energy: 0.2,
    valence: 0.7,
    acousticness: 0.8,
    instrumentalness: 0.15,
    tempo: 95,
    language: "pt",
    genre: "bossanova"
  },
  {
    id: "7",
    name: "Weightless",
    artists: [{ name: "Marconi Union" }],
    album: {
      name: "Ambient Transmissions Volume 2",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273f5507ffdb3d89ef6cc823fa5" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    energy: 0.08,
    valence: 0.5,
    acousticness: 0.95,
    instrumentalness: 0.98,
    tempo: 60,
    language: "silence",
    genre: "ambient"
  },
  {
    id: "8",
    name: "La Vie En Rose",
    artists: [{ name: "Édith Piaf" }],
    album: {
      name: "The Voice of the Sparrow",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27318ecf7db11545620b75cf798" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    energy: 0.22,
    valence: 0.68,
    acousticness: 0.9,
    instrumentalness: 0.01,
    tempo: 80,
    language: "fr",
    genre: "french"
  },
  {
    id: "9",
    name: "Prateek Kuhad",
    artists: [{ name: "cold/mess" }],
    album: {
      name: "cold/mess EP",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27376cd7d2b6387063bd70d30c5" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    energy: 0.35,
    valence: 0.4,
    acousticness: 0.8,
    instrumentalness: 0.0,
    tempo: 92,
    language: "hi",
    genre: "indian"
  },
  {
    id: "10",
    name: "Plastic Love",
    artists: [{ name: "Mariya Takeuchi" }],
    album: {
      name: "Variety",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e86c06df9a57fb6c84b12b5b" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    energy: 0.65,
    valence: 0.85,
    acousticness: 0.18,
    instrumentalness: 0.02,
    tempo: 110,
    language: "ja",
    genre: "j-pop"
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
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    energy: 0.82,
    valence: 0.48,
    acousticness: 0.14,
    instrumentalness: 0.0,
    tempo: 186,
    language: "en",
    genre: "pop"
  },
  {
    id: "12",
    name: "Gurenge",
    artists: [{ name: "LiSA" }],
    album: {
      name: "LEO-NiNE",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27318357f12e87c0a905a5a6764" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    energy: 0.88,
    valence: 0.38,
    acousticness: 0.05,
    instrumentalness: 0.0,
    tempo: 135,
    language: "ja",
    genre: "j-rock"
  },
  {
    id: "13",
    name: "Tomboy",
    artists: [{ name: "HYUKOH" }],
    album: {
      name: "23",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2733d3c75f653457a41ec5e958f" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    energy: 0.68,
    valence: 0.29,
    acousticness: 0.25,
    instrumentalness: 0.05,
    tempo: 124,
    language: "ko",
    genre: "korean-indie"
  },
  {
    id: "14",
    name: "Hysteria",
    artists: [{ name: "Muse" }],
    album: {
      name: "Absolution",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273574c84de2a21e427fa7f7396" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    energy: 0.92,
    valence: 0.35,
    acousticness: 0.01,
    instrumentalness: 0.1,
    tempo: 93,
    language: "en",
    genre: "rock"
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
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    energy: 0.85,
    valence: 0.9,
    acousticness: 0.01,
    instrumentalness: 0.0,
    tempo: 114,
    language: "ko",
    genre: "k-pop"
  },
  {
    id: "16",
    name: "Mi Gente",
    artists: [{ name: "J Balvin & Willy William" }],
    album: {
      name: "Vibras",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2736183313ad52588147d341b5f" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    energy: 0.8,
    valence: 0.88,
    acousticness: 0.02,
    instrumentalness: 0.0,
    tempo: 105,
    language: "es",
    genre: "latin"
  },
  {
    id: "17",
    name: "One More Time",
    artists: [{ name: "Daft Punk" }],
    album: {
      name: "Discovery",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b3c3734685ff8a86c67ef9b2" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    energy: 0.9,
    valence: 0.85,
    acousticness: 0.02,
    instrumentalness: 0.7,
    tempo: 123,
    language: "silence",
    genre: "electropop"
  },
  {
    id: "18",
    name: "Gimme! Gimme! Gimme!",
    artists: [{ name: "ABBA" }],
    album: {
      name: "Voulez-Vous",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27376db1a7114d642398dbd64b1" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    energy: 0.75,
    valence: 0.82,
    acousticness: 0.05,
    instrumentalness: 0.01,
    tempo: 120,
    language: "sv",
    genre: "swedish"
  },

  // MIXED LANGUAGES & INSTRUMENTAL MIX
  {
    id: "19",
    name: "Mera Mann Kehna",
    artists: [{ name: "Falak Shabir" }],
    album: {
      name: "Nautanki Saala!",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2736e6ec16ca2114ef8f0b7bc46" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    energy: 0.52,
    valence: 0.6,
    acousticness: 0.4,
    instrumentalness: 0.0,
    tempo: 96,
    language: "hi",
    genre: "indian"
  },
  {
    id: "20",
    name: "Clair de Lune",
    artists: [{ name: "Claude Debussy" }],
    album: {
      name: "Debussy Piano Masterpieces",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273783a30c0daee11a64b4ec0f3" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    energy: 0.03,
    valence: 0.28,
    acousticness: 0.99,
    instrumentalness: 0.98,
    tempo: 65,
    language: "silence",
    genre: "classical"
  },
  {
    id: "21",
    name: "Girl from Ipanema",
    artists: [{ name: "Stan Getz & Astrud Gilberto" }],
    album: {
      name: "Getz/Gilberto",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273cd982da642598deef66b02a9" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    energy: 0.18,
    valence: 0.62,
    acousticness: 0.85,
    instrumentalness: 0.05,
    tempo: 90,
    language: "pt",
    genre: "bossanova"
  },
  {
    id: "22",
    name: "Je Te Laisse Reculer",
    artists: [{ name: "Videoclub" }],
    album: {
      name: "Euphories",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e970b1cb3b17726487e491c1" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    energy: 0.55,
    valence: 0.72,
    acousticness: 0.35,
    instrumentalness: 0.01,
    tempo: 112,
    language: "fr",
    genre: "french"
  },
  {
    id: "23",
    name: "Tu Jaane Na",
    artists: [{ name: "Atif Aslam" }],
    album: {
      name: "Ajab Prem Ki Ghazab Kahani",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27372d6a59275cb75c1285220b2" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    energy: 0.42,
    valence: 0.35,
    acousticness: 0.65,
    instrumentalness: 0.0,
    tempo: 82,
    language: "hi",
    genre: "indian"
  },
  {
    id: "24",
    name: "Lover",
    artists: [{ name: "Taylor Swift" }],
    album: {
      name: "Lover",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273e787c8276ca2c12abde2c1ab" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    energy: 0.54,
    valence: 0.45,
    acousticness: 0.49,
    instrumentalness: 0.0,
    tempo: 68,
    language: "en",
    genre: "pop"
  },
  {
    id: "25",
    name: "Despacito",
    artists: [{ name: "Luis Fonsi ft. Daddy Yankee" }],
    album: {
      name: "VIDA",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2734492e59df61783cfb162f4db" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    energy: 0.8,
    valence: 0.84,
    acousticness: 0.2,
    instrumentalness: 0.0,
    tempo: 89,
    language: "es",
    genre: "latin"
  },
  {
    id: "26",
    name: "Stay",
    artists: [{ name: "The Kid LAROI & Justin Bieber" }],
    album: {
      name: "F*CK LOVE 3: OVER YOU",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27341e301b5ae3cdab9ec6af422" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    energy: 0.76,
    valence: 0.65,
    acousticness: 0.04,
    instrumentalness: 0.0,
    tempo: 170,
    language: "en",
    genre: "pop"
  },
  {
    id: "27",
    name: "Rainforest Ambient",
    artists: [{ name: "Nature Sounds" }],
    album: {
      name: "Calm Rain",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273294ee5cfa488426f30e0600a" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    energy: 0.1,
    valence: 0.2,
    acousticness: 0.95,
    instrumentalness: 0.99,
    tempo: 78,
    language: "silence",
    genre: "ambient"
  },
  {
    id: "28",
    name: "Electric Feel",
    artists: [{ name: "MGMT" }],
    album: {
      name: "Oracular Spectacular",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273934f861e6878e1c668ec0a54" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    energy: 0.8,
    valence: 0.56,
    acousticness: 0.06,
    instrumentalness: 0.3,
    tempo: 103,
    language: "en",
    genre: "indie-pop"
  },
  {
    id: "29",
    name: "Bailando",
    artists: [{ name: "Enrique Iglesias" }],
    album: {
      name: "SEX AND LOVE",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b27318ec72cb3c180905a5a67923" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    energy: 0.78,
    valence: 0.78,
    acousticness: 0.08,
    instrumentalness: 0.0,
    tempo: 91,
    language: "es",
    genre: "latin"
  },
  {
    id: "30",
    name: "Midnight City",
    artists: [{ name: "M83" }],
    album: {
      name: "Hurry Up, We're Dreaming",
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b2730bf183664abdf47b8599443e" }]
    },
    preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    energy: 0.72,
    valence: 0.52,
    acousticness: 0.02,
    instrumentalness: 0.25,
    tempo: 105,
    language: "silence",
    genre: "electropop"
  }
];

module.exports = { mockTracks };
