import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get full image URL from relative or absolute URL
 * @param {string} imageUrl - Image URL (can be relative like /uploads/image.jpg or absolute)
 * @returns {string} Full URL to the image
 */
export function getImageUrl(imageUrl) {
  if (!imageUrl) return '';
  
  // If already an absolute URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, prepend backend URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
  return `${backendUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}
