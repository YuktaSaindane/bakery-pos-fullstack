'use client';

import React from 'react';

interface ImageErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  alt?: string;
  width?: number;
  height?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ImageErrorBoundary extends React.Component<ImageErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ImageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.warn('Image Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default placeholder
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { alt = 'Product Image', width = 400, height = 300 } = this.props;
      
      // Default fallback placeholder
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
              Image error
            </text>
          </g>
        </svg>
      `)}`;

      return (
        <div className="relative">
          <img
            src={fallbackImage}
            alt={alt}
            width={width}
            height={height}
            className="object-cover rounded-lg"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper component for easier use
export default function ImageErrorBoundaryWrapper({ 
  children, 
  ...props 
}: ImageErrorBoundaryProps) {
  return (
    <ImageErrorBoundary {...props}>
      {children}
    </ImageErrorBoundary>
  );
} 