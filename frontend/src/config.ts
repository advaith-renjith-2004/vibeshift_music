// Central Configuration for VibeShift Frontend

// If the environment variable VITE_BACKEND_URL is provided, we use it.
// Otherwise, if we are running locally (localhost or 127.0.0.1), we default to the local Express backend on port 3001.
// In production, we fall back to a relative path, which works seamlessly if API requests are proxied/rewritten.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : ''
);
