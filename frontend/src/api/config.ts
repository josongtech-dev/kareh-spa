const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    ? 'http://localhost/kareh-spa/php_backend/api'
    : 'https://karehspa.co.ke/php_backend/api');

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ||
  (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    ? 'http://localhost/kareh-spa/php_backend'
    : 'https://karehspa.co.ke/php_backend');

const normalizeBase = (value: string): string => value.replace(/\/+$/, '');

export const apiBaseUrl = normalizeBase(API_BASE_URL);
export const backendBaseUrl = normalizeBase(BACKEND_BASE_URL);

export const backendAssetUrl = (path?: string): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${backendBaseUrl}/${String(path).replace(/^\/+/, '')}`;
};
