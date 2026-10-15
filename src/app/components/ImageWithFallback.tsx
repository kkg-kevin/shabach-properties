import React, { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // Tried if `src` fails, e.g. the full photo when its thumbnail is missing
  fallbackSrc?: string
}

export function ImageWithFallback({ src, fallbackSrc, alt, className, style, ...rest }: ImageWithFallbackProps) {
  const [failures, setFailures] = useState(0)

  useEffect(() => setFailures(0), [src])

  const current = failures === 0 ? src : failures === 1 && fallbackSrc ? fallbackSrc : null

  if (!current) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (photo unavailable)` : 'Photo unavailable'}
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className ?? ''}`}
        style={style}
      >
        <ImageOff className="h-8 w-8" />
      </div>
    )
  }

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setFailures((count) => (fallbackSrc ? count + 1 : 2))}
    />
  )
}
