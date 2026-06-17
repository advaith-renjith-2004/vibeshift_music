const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

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
  tokenExpiresAt = now + response.data.expires_in * 1000 - 60000;
  return cachedClientToken;
}

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE SEARCH SCRAPER — extracts all videoRenderers from ytInitialData
// ─────────────────────────────────────────────────────────────────────────────

function extractVideoRenderers(obj, results = []) {
  if (!obj || typeof obj !== "object") return results;
  if (obj.videoRenderer && obj.videoRenderer.videoId) {
    results.push(obj.videoRenderer);
  } else {
    for (const key of Object.keys(obj)) {
      extractVideoRenderers(obj[key], results);
    }
  }
  return results;
}

async function searchYouTubeVideos(query, maxResults = 20) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 8000
    });

    const html = response.data;
    const startIdx = html.indexOf("ytInitialData = ");
    if (startIdx === -1) return [];

    const dataStart = html.indexOf("{", startIdx);
    if (dataStart === -1) return [];

    // Extract the JSON object character-by-character (brace balance)
    let depth = 0;
    let jsonStr = "";
    for (let i = dataStart; i < Math.min(html.length, dataStart + 3_000_000); i++) {
      const c = html[i];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          jsonStr = html.substring(dataStart, i + 1);
          break;
        }
      }
    }

    if (!jsonStr) return [];
    const data = JSON.parse(jsonStr);
    const renderers = extractVideoRenderers(data);

    return renderers.slice(0, maxResults).map(r => {
      const videoId = r.videoId;
      const title = r.title?.runs?.[0]?.text || "Unknown Title";
      const artist = r.ownerText?.runs?.[0]?.text || "Unknown Artist";
      // Prefer hq720 thumbnail, fallback to first available
      const thumbs = r.thumbnail?.thumbnails || [];
      const thumbnail = thumbs[thumbs.length - 1]?.url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");
      // Duration in seconds (may be absent)
      const durationText = r.lengthText?.simpleText || "";

      return { videoId, title, artist, thumbnail, durationText };
    }).filter(t => t.videoId && t.title !== "Unknown Title");
  } catch (err) {
    console.error(`[YouTube Search Error] query="${query}":`, err.message);
    return [];
  }
}

// Shuffle array in place using Fisher-Yates
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────────────
// VIBE → YOUTUBE SEARCH QUERY BUILDER
// Maps vibe parameters to rich, natural-language YouTube search queries so
// that we get genuine songs, not playlists or compilations.
// Multiple query templates per language ensure variety across fetches.
// ─────────────────────────────────────────────────────────────────────────────

function buildYouTubeQueries(language, energy, valence, instrumentalness, weather) {
  const isChill        = energy < 0.4;
  const isHigh         = energy >= 0.7;
  const isMid          = !isChill && !isHigh;
  const isMelancholy   = valence < 0.35;
  const isHappy        = valence >= 0.65;
  const isInstrumental = instrumentalness >= 0.5;
  const isRainy        = weather === "rain" || weather === "thunderstorm";

  // Per-language mood keyword sets — mood words must match the cultural context
  // Each language block returns an array of 8+ query strings.
  // RULE: the language name / industry term is ALWAYS the first major keyword.
  const queryMap = {
    // ── SILENCE / INSTRUMENTAL ─────────────────────────────────────────────
    silence: [
      isHigh ? "dramatic orchestral film score music" : "calm piano instrumental music",
      isRainy ? "rainy day piano ambient music" : "peaceful piano solo classical music",
      "lofi instrumental study music beats",
      "classical piano relaxing background music",
      "ambient instrumental meditation music",
      "cinematic orchestral emotional music",
      "solo piano nocturne classical",
      "deep focus instrumental music no lyrics"
    ],

    // ── MALAYALAM ──────────────────────────────────────────────────────────
    ml: [
      isMelancholy
        ? "malayalam sad songs official audio"
        : isHappy
          ? "malayalam love songs official audio"
          : "malayalam hits official audio",
      isHigh
        ? "malayalam dance songs official video"
        : "malayalam melody songs official audio",
      "mollywood superhit songs official",
      "new malayalam songs 2024 official",
      isRainy
        ? "malayalam rain songs official audio"
        : "malayalam evergreen songs official audio",
      "kerala film songs best hits",
      "malayalam album songs official",
      isMelancholy
        ? "malayalam emotional songs official video"
        : "malayalam peppy songs official video",
      "trending malayalam songs official"
    ],

    // ── KANNADA ────────────────────────────────────────────────────────────
    kn: [
      isMelancholy
        ? "kannada sad songs official audio"
        : isHappy
          ? "kannada love songs official audio"
          : "kannada hits official audio",
      isHigh
        ? "kannada dance songs official video"
        : "kannada melody songs official audio",
      "sandalwood superhit songs official",
      "new kannada songs 2024 official",
      isRainy
        ? "kannada rain songs official audio"
        : "kannada evergreen songs official audio",
      "kannada film songs best hits",
      "kannada album songs official audio",
      isMelancholy
        ? "kannada emotional songs official"
        : "kannada party songs official",
      "trending kannada songs official"
    ],

    // ── TAMIL ──────────────────────────────────────────────────────────────
    ta: [
      isMelancholy
        ? "tamil sad songs official audio"
        : isHappy
          ? "tamil love songs official audio"
          : "tamil hits official audio",
      isHigh
        ? "tamil kuthu songs official video"
        : "tamil melody songs official audio",
      "kollywood superhit songs official",
      "new tamil songs 2024 official",
      isRainy
        ? "tamil rain songs official audio"
        : "tamil evergreen songs official audio",
      "anirudh ravichander tamil songs official",
      "ar rahman tamil songs official",
      isMelancholy
        ? "tamil emotional songs official"
        : "tamil dance numbers official video",
      "trending tamil songs official"
    ],

    // ── TELUGU ─────────────────────────────────────────────────────────────
    te: [
      isMelancholy
        ? "telugu sad songs official audio"
        : isHappy
          ? "telugu love songs official audio"
          : "telugu hits official audio",
      isHigh
        ? "telugu mass songs official video"
        : "telugu melody songs official audio",
      "tollywood superhit songs official",
      "new telugu songs 2024 official",
      isRainy
        ? "telugu rain songs official audio"
        : "telugu evergreen songs official audio",
      "sid sriram telugu songs official audio",
      "devi sri prasad telugu songs official",
      isMelancholy
        ? "telugu emotional songs official"
        : "telugu dance songs official video",
      "trending telugu songs official"
    ],

    // ── HINDI ──────────────────────────────────────────────────────────────
    hi: [
      isMelancholy
        ? "hindi sad songs official audio"
        : isHappy
          ? "hindi love songs official audio"
          : "hindi hits official audio",
      isHigh
        ? "hindi dance songs official video"
        : "hindi romantic songs official audio",
      "bollywood superhit songs official",
      "new hindi songs 2024 official",
      isRainy
        ? "hindi monsoon songs official audio"
        : "hindi evergreen songs official audio",
      "arijit singh hindi songs official audio",
      isMelancholy
        ? "hindi emotional songs official"
        : "hindi party songs official video",
      "trending bollywood songs official",
      "hindi album songs official audio"
    ],

    // ── PUNJABI ────────────────────────────────────────────────────────────
    pa: [
      isMelancholy
        ? "punjabi sad songs official audio"
        : isHappy
          ? "punjabi love songs official audio"
          : "punjabi hits official audio",
      isHigh
        ? "punjabi dance songs official video"
        : "punjabi slow songs official audio",
      "punjabi superhit songs official",
      "new punjabi songs 2024 official",
      "ap dhillon official audio songs",
      "diljit dosanjh official songs",
      "sidhu moosewala official songs",
      isMelancholy
        ? "punjabi emotional songs official"
        : "punjabi party songs official video",
      "trending punjabi songs official"
    ],

    // ── ENGLISH ────────────────────────────────────────────────────────────
    en: [
      isMelancholy && isChill
        ? "english sad indie songs official audio"
        : isChill && isHappy
          ? "english chill acoustic songs official audio"
          : isHigh && isHappy
            ? "english pop dance songs official audio"
            : isHigh && isMelancholy
              ? "english powerful rock songs official audio"
              : "english pop songs official audio",
      isRainy ? "english rainy day songs official" : "english top hits official audio",
      "best english songs 2024 official",
      "english pop hits official video",
      "trending english music official audio",
      isHigh ? "english upbeat songs official" : "english acoustic songs official",
      isMelancholy ? "english emotional songs official" : "english feel good songs official",
      "english chart hits official audio",
      "english indie songs official audio"
    ],

    // ── SPANISH ────────────────────────────────────────────────────────────
    es: [
      isMelancholy
        ? "canciones en español tristes official audio"
        : isHappy
          ? "canciones en español romanticas official audio"
          : "canciones en español hits official audio",
      isHigh
        ? "reggaeton songs official video"
        : "balada española official audio",
      "musica en español exitos official",
      "new spanish songs 2024 official",
      "latin hits official audio",
      "bad bunny oficial musica",
      isMelancholy
        ? "latin sad songs official audio"
        : "latin party songs official video",
      "trending spanish songs official",
      "musica latina oficial 2024"
    ],

    // ── FRENCH ─────────────────────────────────────────────────────────────
    fr: [
      isMelancholy
        ? "chansons françaises tristes officiel audio"
        : isHappy
          ? "chansons françaises joyeuses officiel"
          : "chansons françaises hits officiel",
      isHigh
        ? "musique française danse officiel video"
        : "chanson française douce officiel audio",
      "musique française hits official audio",
      "new french songs 2024 official",
      "stromae officiel musique",
      "indila officiel chanson",
      isMelancholy
        ? "french emotional songs official audio"
        : "french pop songs official video",
      "trending french music official",
      "meilleures chansons françaises officiel"
    ],

    // ── PORTUGUESE ─────────────────────────────────────────────────────────
    pt: [
      isMelancholy
        ? "musica portuguesa triste official audio"
        : isHappy
          ? "musica brasileira alegre official audio"
          : "musica em portugues hits official",
      isHigh
        ? "samba pagode official audio"
        : "bossa nova classic songs official audio",
      "musica brasileira hits official",
      "new portuguese songs 2024 official",
      "bossa nova songs official audio",
      isMelancholy
        ? "portuguese sad songs official audio"
        : "samba official video songs",
      "MPB musica popular brasileira official",
      "trending portuguese songs official",
      "joao gilberto bossa nova official"
    ],

    // ── JAPANESE ───────────────────────────────────────────────────────────
    ja: [
      isMelancholy
        ? "j-pop sad songs official audio 日本語"
        : isHappy
          ? "j-pop love songs official audio"
          : "j-pop hits official audio",
      isHigh
        ? "j-rock energetic songs official video"
        : "japanese melody songs official audio",
      "jpop japanese songs official audio",
      "new japanese songs 2024 official",
      isRainy
        ? "japanese rain songs official audio"
        : "japanese anime songs official audio",
      "yoasobi official audio songs",
      isMelancholy
        ? "japanese emotional songs official"
        : "japanese upbeat songs official video",
      "trending japanese songs official",
      "j-pop official music video 2024"
    ],

    // ── KOREAN ─────────────────────────────────────────────────────────────
    ko: [
      isMelancholy
        ? "kpop sad songs official audio"
        : isHappy
          ? "kpop love songs official audio"
          : "kpop hits official audio",
      isHigh
        ? "kpop dance songs official video"
        : "korean ballad songs official audio",
      "k-pop korean songs official audio",
      "new korean songs 2024 official",
      isRainy
        ? "korean rain songs official audio"
        : "korean pop songs official audio",
      "bts official audio songs",
      "newjeans official songs kpop",
      isMelancholy
        ? "korean emotional songs official"
        : "kpop party songs official video",
      "trending korean music official"
    ],

    // ── SWEDISH ────────────────────────────────────────────────────────────
    sv: [
      isMelancholy
        ? "swedish sad songs official audio"
        : isHappy
          ? "swedish pop songs official audio"
          : "swedish music hits official",
      isHigh
        ? "swedish dance pop official video"
        : "swedish ballad songs official audio",
      "swedish pop hits official audio",
      "new swedish songs 2024 official",
      "abba official songs music",
      "swedish indie pop official audio",
      isMelancholy
        ? "scandinavian sad songs official"
        : "nordic pop songs official video",
      "trending swedish music official",
      "swedish music official 2024"
    ]
  };

  const templates = queryMap[language] || queryMap.en;
  // Shuffle so a different query is chosen each call → variety
  return shuffle([...templates]);
}


// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT: /api/recommendations
// Priority: Spotify API → Spotify Search → YouTube Live Scrape
// ─────────────────────────────────────────────────────────────────────────────

// Map languages to Spotify seed genres
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

const artistSeedsMap = {
  silence: ["540v7951RmCKEh0A5mZ07e", "3Uqu1mEdkUvOIU6nvnUZly"],
  en: ["4MXUO7v0VjML1szEU615v3", "6eUKthMZ415wTEm4krK4x4"],
  es: ["4q3ewCOwBs7zqgChFCjZzV", "0793ZEyguV84If35x1FvOI"],
  fr: ["4tZwfgrHOc3mvq6l4Ce0Ju", "7n2wYuycrw39VWDx78mR7c"],
  ja: ["68D4j4u5fk0UvM6pHgXui9", "6AgM3G42qS3V0z2z8E2c9W"],
  ko: ["3NPI73Jd2jU7wIb76fVnZ1", "0Y2vPk4gd6ev2H2WwDI760"],
  hi: ["4YRxvE7qLIjUxONUC2NU4Z", "1wRPtKGflJr4rj2RzcxLAg"],
  pt: ["6qqNV070wspmg5cR7HI1Zg", "2S95n9n6j2n5n9n9n9n9n9"],
  sv: ["0j2e0Gz4q7gA3z4c1t2v3X", "62tN8mJqgVvEwV1zL9v9X9"],
  ta: ["4zCH9qm4R2DADamUHMCa6u", "1wRPtKGflJr4rj2RzcxLAg"],
  te: ["776U448S26z96u033P8FfS", "1wRPtKGflJr4rj2RzcxLAg"],
  pa: ["2FKWBDPJZ2Lh1V4r8Q6v06", "4YRxvE7qLIjUxONUC2NU4Z"],
  ml: ["4Q29F6423u65V6J8TqR58T", "1wRPtKGflJr4rj2RzcxLAg"],
  kn: ["1wRPtKGflJr4rj2RzcxLAg", "776U448S26z96u033P8FfS"]
};

app.get("/api/recommendations", async (req, res) => {
  const {
    energy = 0.5,
    valence = 0.5,
    acousticness = 0.5,
    instrumentalness = 0.0,
    tempo = 100,
    danceability = 0.5,
    language = "en",
    weather = "cloudy",
    played = ""  // comma-separated recently played videoIds
  } = req.query;

  const targetEnergy = parseFloat(energy);
  const targetValence = parseFloat(valence);
  const targetAcousticness = parseFloat(acousticness);
  const targetInstrumentalness = parseFloat(instrumentalness);
  const targetTempo = parseFloat(tempo);
  const targetDanceability = parseFloat(danceability);
  const recentPlayedIds = played ? played.split(",").filter(Boolean) : [];

  console.log(`[Recommendations] energy:${targetEnergy}, valence:${targetValence}, lang:${language}, weather:${weather}`);

  // ── ATTEMPT 1: Spotify Recommendations API ───────────────────────────────
  try {
    const token = await getClientCredentialsToken();
    const seedGenres = genreSeedsMap[language] || "pop,indie";
    const artistSeeds = artistSeedsMap[language] || [];
    const seeds = {
      seed_genres: seedGenres.split(",").slice(0, 3).join(","),
      limit: 15
    };
    if (artistSeeds.length > 0) {
      seeds.seed_artists = artistSeeds.slice(0, 2).join(",");
    }
    const response = await axios.get("https://api.spotify.com/v1/recommendations", {
      headers: { Authorization: `Bearer ${token}` },
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

    return res.json({
      source: "spotify_api",
      tracks: response.data.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => ({ name: a.name })),
        album: { name: track.album.name, images: track.album.images },
        preview_url: track.preview_url,
        uri: track.uri
      }))
    });
  } catch (spotifyErr) {
    console.warn("[Spotify API] Failed:", spotifyErr.message);
  }

  // ── ATTEMPT 2: Spotify Search API ───────────────────────────────────────
  try {
    const token = await getClientCredentialsToken();
    const getSpotifySearchQuery = (lang, e, v) => {
      if (lang === "silence") return "genre:ambient OR genre:classical OR genre:piano";
      if (lang === "ja") return "j-pop OR j-rock";
      if (lang === "ko") return "k-pop OR korean-indie";
      if (lang === "es") return "latin OR spanish";
      if (lang === "fr") return "french chanson";
      if (lang === "hi") return "bollywood hindi";
      if (lang === "pt") return "bossanova brazil";
      if (lang === "sv") return "swedish pop";
      if (lang === "ta") return "tamil kollywood";
      if (lang === "te") return "telugu tollywood";
      if (lang === "pa") return "punjabi music";
      if (lang === "ml") return "malayalam film songs";
      if (lang === "kn") return "kannada sandalwood";
      if (e < 0.4 && v < 0.4) return "indie-folk lo-fi chill";
      if (e < 0.4 && v >= 0.4) return "indie-pop acoustic";
      if (e >= 0.4 && v < 0.4) return "rock alternative";
      return "pop dance edm";
    };
    const searchQuery = getSpotifySearchQuery(language, targetEnergy, targetValence);
    const searchResponse = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: searchQuery, type: "track", limit: 15 }
    });
    const searchTracks = searchResponse.data.tracks.items;
    if (searchTracks.length > 0) {
      return res.json({
        source: "spotify_api",
        tracks: searchTracks.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(a => ({ name: a.name })),
          album: { name: track.album.name, images: track.album.images },
          preview_url: track.preview_url,
          uri: track.uri
        }))
      });
    }
  } catch (spotifySearchErr) {
    console.warn("[Spotify Search] Failed:", spotifySearchErr.message);
  }

  // ── ATTEMPT 3: Live YouTube Search Scrape ────────────────────────────────
  console.log("[YouTube Live] Falling back to YouTube scraper...");
  try {
    // Build multiple query candidates and pick one randomly for variety
    const queries = buildYouTubeQueries(language, targetEnergy, targetValence, targetInstrumentalness, weather);
    
    // Pick 2 different queries and fetch both in parallel for more variety
    const query1 = queries[0];
    const query2 = queries[1] || queries[0];
    
    console.log(`[YouTube Live] Queries: "${query1}" | "${query2}"`);

    const [results1, results2] = await Promise.all([
      searchYouTubeVideos(query1, 20),
      searchYouTubeVideos(query2, 20)
    ]);

    // Merge, deduplicate by videoId
    const seen = new Set();
    const allResults = [...results1, ...results2].filter(r => {
      if (seen.has(r.videoId)) return false;
      seen.add(r.videoId);
      return true;
    });

    if (allResults.length === 0) {
      return res.status(503).json({ error: "Could not retrieve any music recommendations at this time." });
    }

    // Filter out recently played tracks
    const unplayedResults = allResults.filter(r => !recentPlayedIds.includes(r.videoId));
    const pool = unplayedResults.length >= 8 ? unplayedResults : allResults;

    // Shuffle and take up to 15 songs
    const selected = shuffle(pool).slice(0, 15);

    const tracks = selected.map(r => ({
      id: r.videoId,
      name: r.title,
      artists: [{ name: r.artist }],
      album: {
        name: "",
        images: r.thumbnail ? [{ url: r.thumbnail }] : []
      },
      preview_url: null,
      uri: `https://www.youtube.com/watch?v=${r.videoId}`,
      youtubeVideoId: r.videoId
    }));

    return res.json({ source: "youtube_live", tracks });
  } catch (ytErr) {
    console.error("[YouTube Live] Scraper failed:", ytErr.message);
    return res.status(503).json({ error: "All recommendation sources failed. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT: OAuth login redirect
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/login", (req, res) => {
  const scopes = "playlist-modify-public playlist-modify-private user-read-private";
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT: OAuth callback handler
// ─────────────────────────────────────────────────────────────────────────────
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
        code,
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
    const userProfile = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userId = userProfile.data.id;
    const userName = userProfile.data.display_name || userId;

    res.redirect(
      `${FRONTEND_URL}/?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}&user_id=${userId}&user_name=${encodeURIComponent(userName)}`
    );
  } catch (error) {
    console.error("OAuth callback error:", error.message);
    res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINT: Save/create playlist on Spotify
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/playlist/create", async (req, res) => {
  const { accessToken, userId, name, uris } = req.body;

  if (!accessToken || !userId || !uris || uris.length === 0) {
    return res.status(400).json({ error: "Missing required playlist data" });
  }

  try {
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

    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris },
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

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE SINGLE VIDEO SEARCH (for current playing track embed)
// ─────────────────────────────────────────────────────────────────────────────
async function searchYouTubeVideoId(query) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      },
      timeout: 6000
    });
    const html = response.data;
    const regex = /"videoRenderer":{"videoId":"([^"]+)"/;
    const match = html.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.error(`YouTube single search error for "${query}":`, error.message);
  }
  return null;
}

// Endpoint: Resolve query to YouTube videoId
app.get("/api/youtube/search", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Missing search query parameter 'q'" });
  }
  // If the track already has a videoId (from youtube_live source), return it directly
  if (req.query.videoId) {
    return res.json({ videoId: req.query.videoId });
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
    const searchPromises = tracks.slice(0, 15).map(async (track) => {
      // If a videoId is already embedded (youtube_live tracks), use it directly
      if (track.videoId) return track.videoId;
      const query = `${track.artist} ${track.name} audio`;
      return searchYouTubeVideoId(query);
    });

    const results = await Promise.all(searchPromises);
    const validVideoIds = results.filter(id => id !== null);

    res.json({ videoIds: validVideoIds });
  } catch (error) {
    console.error("Bulk YouTube search failed:", error.message);
    res.status(500).json({ error: "Failed to resolve video IDs for playlist" });
  }
});

if (process.env.FUNCTIONS_EMULATOR || process.env.FIREBASE_CONFIG) {
  const functions = require("firebase-functions");
  exports.api = functions.https.onRequest(app);
} else if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`VibeShift backend server listening on port ${PORT}`);
  });
}
