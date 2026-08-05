// Using REACT_APP_API_URL for production (Netlify), fallback to empty string for local dev with proxy
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

export default API_BASE_URL;
