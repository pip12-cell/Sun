// Default curated fallback images for botanical skincare products
export const BOTANICAL_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', // serum bottle
  'https://images.unsplash.com/photo-1608248597359-0a6962327599?auto=format&fit=crop&w=800&q=80', // cream jar
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', // cleanser botanical
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', // face cream
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', // green cosmetics
];

/**
 * Sanitizes an image URL input, extracting src from <img> tags or raw URLs.
 * Returns a fallback placeholder if the URL is invalid.
 */
export function sanitizeImageUrl(url: string | undefined | null, fallbackIndex = 0): string {
  if (!url || typeof url !== 'string') {
    return BOTANICAL_PLACEHOLDERS[fallbackIndex % BOTANICAL_PLACEHOLDERS.length];
  }

  let cleaned = url.trim();

  // If input contains an <img> tag: <img src="https://...">
  const imgTagMatch = cleaned.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgTagMatch && imgTagMatch[1]) {
    cleaned = imgTagMatch[1].trim();
  }

  // Remove surrounding quotes if present
  cleaned = cleaned.replace(/^['"]+|['"]+$/g, '');

  // Check if valid URL or data URL
  if (cleaned.startsWith('data:image/') || cleaned.startsWith('blob:') || cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('/')) {
    return cleaned;
  }

  // Fallback to placeholder
  return BOTANICAL_PLACEHOLDERS[fallbackIndex % BOTANICAL_PLACEHOLDERS.length];
}
