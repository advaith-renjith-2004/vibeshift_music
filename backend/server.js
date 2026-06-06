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
  sv: "swedish,synthpop,folk"
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
  sv: ["0j2e0Gz4q7gA3z4c1t2v3X", "62tN8mJqgVvEwV1zL9v9X9"] // ABBA, Robyn
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
    console.error("Spotify API error, falling back to simulated database:", error.message);
    
    // FALLBACK: Filter and sort mock tracks based on Euclidean distance
    const scoredTracks = mockTracks.map(track => {
      // Calculate a similarity score (lower is closer)
      let score = 0;
      
      // Match language if it is specific
      if (language !== "en" && track.language !== language) {
        // Add a penalty if languages don't match, but allow mixed if we don't have enough tracks
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

app.listen(PORT, () => {
  console.log(`VibeShift backend server listening on port ${PORT}`);
});
