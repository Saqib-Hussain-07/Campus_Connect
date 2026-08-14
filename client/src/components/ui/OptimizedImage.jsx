import React, { useState } from 'react';

/**
 * High-Performance Responsive Image Component
 * Supports native lazy loading, async decoding, dynamic srcset, and smooth fallback.
 */
export default function OptimizedImage({
  src,
  alt = '',
  width,
  height,
  className = '',
  style = {},
  fallbackSrc = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  sizes = '(max-width: 768px) 100vw, 50vw',
  loading = 'lazy',
  decoding = 'async',
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate responsive srcset for Unsplash CDN URLs
  const isUnsplash = typeof imgSrc === 'string' && imgSrc.includes('images.unsplash.com');
  const srcSet = isUnsplash
    ? `${imgSrc}&w=320 320w, ${imgSrc}&w=640 640w, ${imgSrc}&w=1024 1024w`
    : undefined;

  return (
    <img
      src={imgSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
      className={className}
      style={{
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.25s ease-in-out',
        ...style
      }}
      {...props}
    />
  );
}
