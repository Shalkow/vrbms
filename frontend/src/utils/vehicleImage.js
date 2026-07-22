export function vehicleImageUrl(imageUrl, fallback) {
  if (!imageUrl) return fallback;

  try {
    const url = new URL(imageUrl);
    // Uploaded vehicle images are served by the backend. Keep only the path so
    // Vercel can proxy it to the correct API deployment in every environment.
    if (url.pathname.startsWith('/uploads/')) return url.pathname;
  } catch {
    // Relative paths are already safe to use.
  }

  return imageUrl;
}
