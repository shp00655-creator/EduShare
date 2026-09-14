import axios from 'axios';

// Dynamically resolve base URL to support localhost, public tunnels (localtunnel, ngrok, cloudflare), mobile networks, and cloud deployments
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // If a cloud production URL (e.g. Render, Railway) is explicitly configured, use it
  if (envUrl && (envUrl.startsWith('https://') || !envUrl.match(/10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|localhost|127\.0\.0\.1/))) {
    return envUrl;
  }

  // In browser environments:
  // Using relative '/api' automatically routes through Vite dev server proxy (or production reverse proxy)
  // regardless of whether you access via localhost, a public tunnel (e.g. Localtunnel), or local Wi-Fi IP.
  if (typeof window !== 'undefined' && window.location) {
    return '/api';
  }

  // Fallback for native Capacitor builds or SSR
  return envUrl || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
