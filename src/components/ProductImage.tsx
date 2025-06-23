'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ProductImage({ 
  src, 
  alt, 
  className = '', 
  width = 400, 
  height = 300 
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

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
  const shouldUseFallback = imageError || 
    !src || 
    src.includes('google.com/imgres?') || // Only block Google search results
    (src.includes('data:image/') && src.length > 2000); // Only block very long base64 data

  if (shouldUseFallback) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={fallbackImage}
          alt={alt}
          width={width}
          height={height}
          className="object-cover rounded-lg"
          priority={false}
        />
      </div>
    );
  }

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
        priority={false}
      />
    </div>
  );
} 