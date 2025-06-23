'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeProductImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function SafeProductImage({ 
  src, 
  alt, 
  className = '', 
  width = 400, 
  height = 300 
}: SafeProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setHasError(false);
    setLoading(true);
  }, [src]);

  // Fallback placeholder image (food-themed SVG)
  const fallbackImage = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#F3F4F6"/>
      <g transform="translate(${width/2}, ${height/2})">
        <circle cx="0" cy="-20" r="15" fill="#9CA3AF" opacity="0.5"/>
        <rect x="-25" y="-5" width="50" height="30" rx="5" fill="#9CA3AF" opacity="0.5"/>
        <text x="0" y="50" text-anchor="middle" fill="#6B7280" font-family="Arial, sans-serif" font-size="14">
          ${alt}
        </text>
        <text x="0" y="70" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="12">
          Image not available
        </text>
      </g>
    </svg>
  `)}`;

  // Only block the most problematic URLs - trust everything else
  const isProblematicUrl = !src || 
    src.includes('google.com/imgres?') || // Only block Google search results, not all Google domains
    (src.includes('data:image/') && src.length > 2000); // Only block very long base64 data

  // If we have an error or problematic URL, show fallback
  if (imageError || hasError || isProblematicUrl) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={fallbackImage}
          alt={alt}
          width={width}
          height={height}
          className="object-cover rounded-lg"
          priority={false}
          unoptimized={true}
        />
      </div>
    );
  }

  // Try to render the actual image with error catching
  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover rounded-lg"
        onLoad={() => setLoading(false)}
        onError={() => {
          setImageError(true);
          setLoading(false);
        }}
        onLoadingComplete={() => setLoading(false)}
        priority={false}
        unoptimized={false}
        // Catch any Next.js configuration errors
        onLoadStart={() => {
          // If image fails to start loading due to config issues, we'll catch it in onError
        }}
      />
    </div>
  );
} 