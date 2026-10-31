// Using REACT_APP_API_URL for production (e.g. Render/Netlify/Vercel).
// In local development, connects directly to backend on port 5000 (supports localhost and mobile LAN).
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? `http://${window.location.hostname || "localhost"}:5000`
    : "");

export default API_BASE_URL;
