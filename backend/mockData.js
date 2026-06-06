const mockTracks = [
  // CHILL / MELANCHOLIC (Low Energy, Low Valence)
  {
    id: "4MXUO7v0VjML1szEU615v3",
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
    id: "527kCunrRSx6YBv7q7U45Q",
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
    id: "2usrT3w4650oytZ557t4ea",
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
    id: "5SclYw5rUqE75S1W84033C",
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
    id: "0v9WpeNjutD52CY1jJgQvO",
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
    id: "3r16b04sgol6uB9Vv0M6yE",
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
    id: "3Uqu1mEdkUvOIU6nvnUZly",
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
    id: "18ecf7db11545620b75cf798",
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
    id: "1wRPtKGflJr4rj2RzcxLAg",
    name: "cold/mess",
    artists: [{ name: "Prateek Kuhad" }],
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
    id: "71G1Vcxk2TClI6Vmq3505X",
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
    id: "7a5oOr1321Xv0eQvEovg7K",
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
    id: "0qcr4m16w1hbIG8gU6t42n",
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
    id: "5QDh1m4kr0VjMv1s07t4ea",
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
    id: "7ko9P3e2l3U9a4tNf3W46n",
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
    id: "4saklk62WsVlPzB2t2M6yE",
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
    id: "6xV2vG5p2Vw6e7t3b4Xu3u",
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
    id: "0Ok3tNf3W4650oytZ557t4",
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
    id: "3P3pa7lVnZ1wYwX557t4ea",
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
  }
];

module.exports = { mockTracks };
