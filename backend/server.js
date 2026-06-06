const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const { mockTracks } = require("./mockData");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3001/api/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// In-memory token caching for Client Credentials
let cachedClientToken = null;
let tokenExpiresAt = 0;

// Helper to fetch Spotify Client Credentials Token
async function getClientCredentialsToken() {
  const now = Date.now();
  if (cachedClientToken && now < tokenExpiresAt) {
    return cachedClientToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify Client ID or Client Secret not configured.");
  }

  const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  cachedClientToken = response.data.access_token;
  tokenExpiresAt = now + response.data.expires_in * 1000 - 60000; // Subtract 1 minute buffer
  return cachedClientToken;
}

// Map languages to Spotify seed genres and artists (to make recommendations hyper-relevant)
const genreSeedsMap = {
  silence: "ambient,classical,acoustic,piano",
  en: "pop,indie,rock,indie-pop",
  es: "latin,spanish,latin-pop,reggae",
  fr: "french,electropop,indie",
  ja: "j-pop,j-rock,lo-fi",
  ko: "k-pop,korean-indie",
  hi: "indian,pop-filmi",
  pt: "bossanova,brazil,mpb",
  sv: "swedish,synthpop,folk",
  ta: "tamil,indian",
  te: "telugu,indian",
  pa: "punjabi,indian",
  ml: "indian",
  kn: "indian"
};

// Map languages to popular atmospheric artist seeds to guarantee high-quality recommendations
const artistSeedsMap = {
  silence: ["540v7951RmCKEh0A5mZ07e", "3Uqu1mEdkUvOIU6nvnUZly"], // Ludovico Einaudi, Marconi Union
  en: ["4MXUO7v0VjML1szEU615v3", "6eUKthMZ415wTEm4krK4x4"], // Bon Iver, The xx
  es: ["4q3ewCOwBs7zqgChFCjZzV", "0793ZEyguV84If35x1FvOI"], // Bad Bunny, Rosalía
  fr: ["4tZwfgrHOc3mvq6l4Ce0Ju", "7n2wYuycrw39VWDx78mR7c"], // L'Impératrice, Videoclub
  ja: ["68D4j4u5fk0UvM6pHgXui9", "6AgM3G42qS3V0z2z8E2c9W"], // Mariya Takeuchi, Nujabes
  ko: ["3NPI73Jd2jU7wIb76fVnZ1", "0Y2vPk4gd6ev2H2WwDI760"], // BTS, IU
  hi: ["4YRxvE7qLIjUxONUC2NU4Z", "1wRPtKGflJr4rj2RzcxLAg"], // Arijit Singh, Prateek Kuhad
  pt: ["6qqNV070wspmg5cR7HI1Zg", "2S95n9n6j2n5n9n9n9n9n9"], // João Gilberto, Caetano Veloso
  sv: ["0j2e0Gz4q7gA3z4c1t2v3X", "62tN8mJqgVvEwV1zL9v9X9"], // ABBA, Robyn
  ta: ["4zCH9qm4R2DADamUHMCa6u", "1wRPtKGflJr4rj2RzcxLAg"], // Anirudh Ravichander, AR Rahman
  te: ["776U448S26z96u033P8FfS", "1wRPtKGflJr4rj2RzcxLAg"], // Sid Sriram, AR Rahman
  pa: ["2FKWBDPJZ2Lh1V4r8Q6v06", "4YRxvE7qLIjUxONUC2NU4Z"], // Diljit Dosanjh, Arijit Singh
  ml: ["4Q29F6423u65V6J8TqR58T", "1wRPtKGflJr4rj2RzcxLAg"], // Sushin Shyam, AR Rahman
  kn: ["1wRPtKGflJr4rj2RzcxLAg", "776U448S26z96u033P8FfS"] // AR Rahman, Sid Sriram
};

// Endpoint: Query recommendations
app.get("/api/recommendations", async (req, res) => {
  const {
    energy = 0.5,
    valence = 0.5,
    acousticness = 0.5,
    instrumentalness = 0.0,
    tempo = 100,
    danceability = 0.5,
    language = "en"
  } = req.query;

  const targetEnergy = parseFloat(energy);
  const targetValence = parseFloat(valence);
  const targetAcousticness = parseFloat(acousticness);
  const targetInstrumentalness = parseFloat(instrumentalness);
  const targetTempo = parseFloat(tempo);
  const targetDanceability = parseFloat(danceability);

  console.log(`[Recommendations Request] energy:${targetEnergy}, valence:${targetValence}, lang:${language}, tempo:${targetTempo}`);

  try {
    const token = await getClientCredentialsToken();

    // Set up seeds
    const seedGenres = genreSeedsMap[language] || "pop,indie";
    const artistSeeds = artistSeedsMap[language] || [];
    
    // Choose up to 2 genres and 2 artists for seed (maximum 5 seeds total in Spotify API)
    const seeds = {
      seed_genres: seedGenres.split(",").slice(0, 3).join(","),
      limit: 15
    };

    if (artistSeeds.length > 0) {
      seeds.seed_artists = artistSeeds.slice(0, 2).join(",");
    }

    // Build the query to Spotify
    const response = await axios.get("https://api.spotify.com/v1/recommendations", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        ...seeds,
        target_energy: targetEnergy.toFixed(2),
        target_valence: targetValence.toFixed(2),
        target_acousticness: targetAcousticness.toFixed(2),
        target_instrumentalness: targetInstrumentalness.toFixed(2),
        target_tempo: Math.round(targetTempo),
        target_danceability: targetDanceability.toFixed(2)
      }
    });

    res.json({
      source: "spotify_api",
      tracks: response.data.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => ({ name: a.name })),
        album: {
          name: track.album.name,
          images: track.album.images
        },
        preview_url: track.preview_url,
        uri: track.uri
      }))
    });
  } catch (error) {
    console.error("Spotify Recommendations endpoint restricted or failed. Attempting Search fallback...", error.message);
    
    try {
      const token = await getClientCredentialsToken();
      // Helper function to get search query based on vibe
      const getSearchQuery = (lang, e, v) => {
        let genre = "pop";
        if (lang === 'silence') return "genre:ambient OR genre:classical OR genre:piano";
        
        if (lang === 'ja') genre = "j-pop OR genre:j-rock";
        else if (lang === 'ko') genre = "k-pop OR genre:korean-indie";
        else if (lang === 'es') genre = "genre:latin OR genre:spanish";
        else if (lang === 'fr') genre = "genre:french OR genre:electropop";
        else if (lang === 'hi') genre = "genre:indian OR genre:hindi";
        else if (lang === 'pt') genre = "genre:bossanova OR genre:brazil";
        else if (lang === 'sv') genre = "genre:swedish OR genre:synthpop";
        else if (lang === 'ta') genre = "genre:tamil";
        else if (lang === 'te') genre = "genre:telugu";
        else if (lang === 'pa') genre = "genre:punjabi";
        else if (lang === 'ml') return "malayalam film OR malayalam pop OR sushin shyam";
        else if (lang === 'kn') return "kannada film OR kannada pop OR vijay prakash";
        else {
          if (e < 0.4 && v < 0.4) genre = "indie-folk OR genre:lo-fi";
          else if (e < 0.4 && v >= 0.4) genre = "indie-pop OR genre:acoustic";
          else if (e >= 0.4 && v < 0.4) genre = "rock OR genre:grunge";
          else genre = "pop OR genre:dance OR genre:edm";
        }
        return `genre:${genre}`;
      };

      const searchQuery = getSearchQuery(language, targetEnergy, targetValence);
      console.log(`[Spotify Search Fallback] Querying: "${searchQuery}"`);

      const searchResponse = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: searchQuery,
          type: "track",
          limit: 15
        }
      });

      const searchTracks = searchResponse.data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => ({ name: a.name })),
        album: {
          name: track.album.name,
          images: track.album.images
        },
        preview_url: track.preview_url,
        uri: track.uri
      }));

      if (searchTracks.length > 0) {
        return res.json({
          source: "spotify_api",
          tracks: searchTracks
        });
      }
    } catch (searchError) {
      console.error("Spotify Search fallback failed as well, using simulated database:", searchError.message);
    }
    
    // FALLBACK: Filter and sort mock tracks based on Euclidean distance
    const scoredTracks = mockTracks.map(track => {
      // Calculate a similarity score (lower is closer)
      let score = 0;
      
      // Match language if it is specific
      if (language !== "en" && track.language !== language) {
        score += 2.0;
      }
      if (language === "silence" && track.language !== "silence") {
        score += 5.0; // Heavy penalty for vocals when Silence is selected
      }

      // Feature distance (weights can be adjusted)
      score += Math.pow(track.energy - targetEnergy, 2) * 2.0;
      score += Math.pow(track.valence - targetValence, 2) * 2.0;
      score += Math.pow(track.acousticness - targetAcousticness, 2) * 1.5;
      score += Math.pow(track.instrumentalness - targetInstrumentalness, 2) * 1.5;
      
      // Normalize tempo differences
      const tempoDiff = Math.abs(track.tempo - targetTempo) / 100;
      score += Math.pow(tempoDiff, 2) * 1.0;

      return { ...track, score };
    });

    // Sort by score (ascending) and take top 12 tracks
    const sortedTracks = scoredTracks.sort((a, b) => a.score - b.score).slice(0, 12);

    res.json({
      source: "simulated_database",
      tracks: sortedTracks.map(t => ({
        id: t.id,
        name: t.name,
        artists: t.artists,
        album: t.album,
        preview_url: t.preview_url,
        uri: `spotify:track:${t.id}`
      }))
    });
  }
});

// Endpoint: OAuth login redirect
app.get("/api/login", (req, res) => {
  const scopes = "playlist-modify-public playlist-modify-private user-read-private";
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// Endpoint: OAuth callback handler
app.get("/api/callback", async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/?error=state_mismatch`);
  }

  try {
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    
    // Fetch user profile to get User ID
    const userProfile = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userId = userProfile.data.id;
    const userName = userProfile.data.display_name || userId;

    // Redirect user back to frontend with the tokens and user details
    res.redirect(
      `${FRONTEND_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}&user_id=${userId}&user_name=${encodeURIComponent(userName)}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error.message);
    res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
  }
});

// Endpoint: Save/create playlist
app.post("/api/playlist/create", async (req, res) => {
  const { accessToken, userId, name, uris } = req.body;

  if (!accessToken || !userId || !uris || uris.length === 0) {
    return res.status(400).json({ error: "Missing required playlist data" });
  }

  try {
    // 1. Create Playlist
    const createPlaylistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: name || "Synesthetic Vibe Playlist",
        description: "Generated by VibeShift - Synesthetic Music Discovery Platform.",
        public: true
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const playlistId = createPlaylistResponse.data.id;
    const playlistUrl = createPlaylistResponse.data.external_urls.spotify;

    // 2. Add Tracks to Playlist
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris: uris },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true, playlistId, playlistUrl });
  } catch (error) {
    console.error("Error creating playlist:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create playlist on Spotify" });
  }
});

// Scraper-based keyless YouTube search to find matching videoId
async function searchYouTubeVideoId(query) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    const html = response.data;
    // Extract videoId from ytInitialData renderer JSON embedded in HTML page
    const regex = /"videoRenderer":{"videoId":"([^"]+)"/;
    const match = html.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.error(`YouTube search scraper error for query "${query}":`, error.message);
  }
  return null;
}

// Endpoint: Resolve query to YouTube videoId
app.get("/api/youtube/search", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Missing search query parameter 'q'" });
  }

  const videoId = await searchYouTubeVideoId(q);
  res.json({ videoId });
});

// Endpoint: Bulk resolve tracks to YouTube videoIds for playlist watch link
app.post("/api/youtube/playlist", async (req, res) => {
  const { tracks } = req.body;
  if (!tracks || !Array.isArray(tracks)) {
    return res.status(400).json({ error: "Missing or invalid 'tracks' array in body" });
  }

  try {
    // Search up to 15 tracks in parallel
    const searchPromises = tracks.slice(0, 15).map(async (track) => {
      const query = `${track.artist} ${track.name} audio`;
      const videoId = await searchYouTubeVideoId(query);
      return videoId;
    });

    const results = await Promise.all(searchPromises);
    const validVideoIds = results.filter(id => id !== null);

    res.json({ videoIds: validVideoIds });
  } catch (error) {
    console.error("Bulk YouTube search failed:", error.message);
    res.status(500).json({ error: "Failed to resolve video IDs for playlist" });
  }
});

app.listen(PORT, () => {
  console.log(`VibeShift backend server listening on port ${PORT}`);
});
