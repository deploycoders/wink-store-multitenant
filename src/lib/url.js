const normalizeBaseUrl = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed.replace(/\/$/, "")}`;
};

export const getClientOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const envBase =
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_VERCEL_URL);

  return envBase || "http://localhost:3000";
};

export const buildClientUrl = (path = "/") => {
  const origin = getClientOrigin();
  const safePath = String(path || "/");
  const normalizedPath = safePath.startsWith("/") ? safePath : `/${safePath}`;
  return `${origin}${normalizedPath}`;
};
