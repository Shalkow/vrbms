export function vehicleImageUrl(imageUrl, fallback) {
  if (!imageUrl) return fallback;

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const apiOrigin = new URL(apiBaseUrl).origin;

  try {
    const url = new URL(imageUrl);
    // Old records can contain localhost or a previous Railway domain. Serve
    // their upload path through the active API origin instead.
    if (url.pathname.startsWith('/uploads/')) return `${apiOrigin}${url.pathname}`;
  } catch {
    if (imageUrl.startsWith('/uploads/')) return `${apiOrigin}${imageUrl}`;
  }

  return imageUrl;
}
